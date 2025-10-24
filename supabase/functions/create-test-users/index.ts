import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TestUser {
  email: string;
  password: string;
  username: string;
  display_name: string;
  bio: string;
  followers_count: number;
  following_count: number;
  likes_count: number;
  videos_count: number;
}

const testUsers: TestUser[] = [
  {
    email: 'naturelsker@tikitok.no',
    password: 'Test123!',
    username: 'naturelsker',
    display_name: 'Nature Lover',
    bio: 'Elsker norsk natur 🌲🏔️',
    followers_count: 15200,
    following_count: 432,
    likes_count: 125000,
    videos_count: 87,
  },
  {
    email: 'nordlysguide@tikitok.no',
    password: 'Test123!',
    username: 'nordlysguide',
    display_name: 'Nordlys Guide',
    bio: 'Jeger på nordlys i nord ✨',
    followers_count: 45200,
    following_count: 891,
    likes_count: 520000,
    videos_count: 156,
  },
  {
    email: 'oslovibes@tikitok.no',
    password: 'Test123!',
    username: 'oslovibes',
    display_name: 'Oslo Vibes',
    bio: 'Byliv og kultur 🎉',
    followers_count: 8900,
    following_count: 234,
    likes_count: 78000,
    videos_count: 43,
  },
  {
    email: 'bergenskok@tikitok.no',
    password: 'Test123!',
    username: 'bergenskok',
    display_name: 'Bergens Kokk',
    bio: 'Matglede fra vestlandet 🍽️',
    followers_count: 23400,
    following_count: 567,
    likes_count: 198000,
    videos_count: 92,
  },
  {
    email: 'fjellvandrer@tikitok.no',
    password: 'Test123!',
    username: 'fjellvandrer',
    display_name: 'Fjellvandreren',
    bio: 'Topper og turer 🥾',
    followers_count: 34500,
    following_count: 723,
    likes_count: 312000,
    videos_count: 128,
  },
  {
    email: 'trondheimstudie@tikitok.no',
    password: 'Test123!',
    username: 'trondheimstudie',
    display_name: 'Trondheim Student',
    bio: 'Student life NTNU 📚',
    followers_count: 12300,
    following_count: 456,
    likes_count: 89000,
    videos_count: 67,
  },
  {
    email: 'skatepro@tikitok.no',
    password: 'Test123!',
    username: 'skatepro',
    display_name: 'Skate Pro',
    bio: 'Skate og tricks 🛹',
    followers_count: 67800,
    following_count: 1234,
    likes_count: 890000,
    videos_count: 234,
  },
  {
    email: 'musikklærer@tikitok.no',
    password: 'Test123!',
    username: 'musikklærer',
    display_name: 'Musikkpedagog',
    bio: 'Deler musikktips 🎸',
    followers_count: 19800,
    following_count: 678,
    likes_count: 156000,
    videos_count: 98,
  },
  {
    email: 'fotballkjempe@tikitok.no',
    password: 'Test123!',
    username: 'fotballkjempe',
    display_name: 'Fotball Fan',
    bio: 'RBK til jeg dør ⚽',
    followers_count: 28900,
    following_count: 890,
    likes_count: 234000,
    videos_count: 112,
  },
  {
    email: 'kunstneren@tikitok.no',
    password: 'Test123!',
    username: 'kunstneren',
    display_name: 'Digital Artist',
    bio: 'Norsk digital kunst 🎨',
    followers_count: 41200,
    following_count: 1123,
    likes_count: 487000,
    videos_count: 178,
  },
];

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Create admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('Starting to create test users...');
    
    const results = [];
    
    for (const user of testUsers) {
      try {
        // Create auth user
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true,
          user_metadata: {
            username: user.username,
            display_name: user.display_name,
          }
        });

        if (authError) {
          console.error(`Error creating user ${user.username}:`, authError);
          results.push({ username: user.username, success: false, error: authError.message });
          continue;
        }

        // Update profile with additional data
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .update({
            bio: user.bio,
            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`,
            followers_count: user.followers_count,
            following_count: user.following_count,
            likes_count: user.likes_count,
            videos_count: user.videos_count,
          })
          .eq('id', authData.user.id);

        if (profileError) {
          console.error(`Error updating profile for ${user.username}:`, profileError);
          results.push({ username: user.username, success: false, error: profileError.message });
        } else {
          console.log(`Successfully created user: ${user.username}`);
          results.push({ username: user.username, success: true, id: authData.user.id });
        }
      } catch (err) {
        console.error(`Exception creating user ${user.username}:`, err);
        results.push({ username: user.username, success: false, error: String(err) });
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'Test users creation completed',
        results 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in create-test-users function:', error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
