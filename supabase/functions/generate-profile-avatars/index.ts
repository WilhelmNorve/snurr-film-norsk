import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get all profiles without avatar_url or with dicebear avatars
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username, display_name, bio')
      .or('avatar_url.is.null,avatar_url.like.%dicebear%')

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch profiles' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    console.log(`Found ${profiles?.length || 0} profiles to generate avatars for`)

    const results = []

    for (const profile of profiles || []) {
      try {
        // Create a descriptive prompt based on the user's profile
        const prompt = `Professional portrait photo of a person named ${profile.display_name || profile.username}. ${
          profile.bio ? `Description: ${profile.bio}.` : ''
        } High quality, well-lit, friendly expression, neutral background. Realistic style.`

        console.log(`Generating image for ${profile.username} with prompt: ${prompt}`)

        // Generate image using Lovable AI
        const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${lovableApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash-image-preview',
            messages: [
              {
                role: 'user',
                content: prompt
              }
            ],
            modalities: ['image', 'text']
          })
        })

        if (!aiResponse.ok) {
          const errorText = await aiResponse.text()
          console.error(`AI API error for ${profile.username}:`, aiResponse.status, errorText)
          results.push({
            username: profile.username,
            success: false,
            error: `AI API error: ${aiResponse.status}`
          })
          continue
        }

        const aiData = await aiResponse.json()
        const imageUrl = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url

        if (!imageUrl) {
          console.error(`No image URL returned for ${profile.username}`)
          results.push({
            username: profile.username,
            success: false,
            error: 'No image URL returned'
          })
          continue
        }

        // Convert base64 to blob
        const base64Data = imageUrl.split(',')[1]
        const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))
        
        // Upload to storage
        const fileName = `${profile.id}/avatar.png`
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, binaryData, {
            contentType: 'image/png',
            upsert: true
          })

        if (uploadError) {
          console.error(`Upload error for ${profile.username}:`, uploadError)
          results.push({
            username: profile.username,
            success: false,
            error: uploadError.message
          })
          continue
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName)

        // Update profile with new avatar URL
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ avatar_url: publicUrl })
          .eq('id', profile.id)

        if (updateError) {
          console.error(`Update error for ${profile.username}:`, updateError)
          results.push({
            username: profile.username,
            success: false,
            error: updateError.message
          })
          continue
        }

        console.log(`Successfully generated and uploaded avatar for ${profile.username}`)
        results.push({
          username: profile.username,
          success: true,
          avatarUrl: publicUrl
        })

      } catch (error) {
        console.error(`Error processing ${profile.username}:`, error)
        results.push({
          username: profile.username,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return new Response(
      JSON.stringify({ results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in generate-profile-avatars function:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
