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
    email: 'partypeople@tikitok.no',
    password: 'Test123!',
    username: 'partypeople',
    display_name: 'Party People',
    bio: 'Feststemning alltid 🎊',
    followers_count: 23400,
    following_count: 567,
    likes_count: 198000,
    videos_count: 92,
  },
  {
    email: 'solnedgang@tikitok.no',
    password: 'Test123!',
    username: 'solnedgang',
    display_name: 'Sunset Hunter',
    bio: 'Jakter på solnedganger 🌅',
    followers_count: 34200,
    following_count: 789,
    likes_count: 312000,
    videos_count: 145,
  },
  {
    email: 'skaternorge@tikitok.no',
    password: 'Test123!',
    username: 'skaternorge',
    display_name: 'Skate Norge',
    bio: 'Skateboard tricks og tips 🛹',
    followers_count: 19800,
    following_count: 445,
    likes_count: 167000,
    videos_count: 103,
  },
  {
    email: 'kaffeguide@tikitok.no',
    password: 'Test123!',
    username: 'kaffeguide',
    display_name: 'Kaffe Guide',
    bio: 'Kaffekjenner ☕',
    followers_count: 11200,
    following_count: 234,
    likes_count: 89000,
    videos_count: 67,
  },
  {
    email: 'bokelsker@tikitok.no',
    password: 'Test123!',
    username: 'bokelsker',
    display_name: 'Bok Elsker',
    bio: 'Leser alt 📚',
    followers_count: 9600,
    following_count: 178,
    likes_count: 76000,
    videos_count: 54,
  },
  {
    email: 'byfotograf@tikitok.no',
    password: 'Test123!',
    username: 'byfotograf',
    display_name: 'By Fotograf',
    bio: 'Fotograferer byliv 🌃',
    followers_count: 27300,
    following_count: 612,
    likes_count: 234000,
    videos_count: 118,
  },
  {
    email: 'treningsglede@tikitok.no',
    password: 'Test123!',
    username: 'treningsglede',
    display_name: 'Trenings Glede',
    bio: 'Trening er livet 🏃‍♂️',
    followers_count: 16700,
    following_count: 389,
    likes_count: 143000,
    videos_count: 96,
  },
  {
    email: 'yogalivet@tikitok.no',
    password: 'Test123!',
    username: 'yogalivet',
    display_name: 'Yoga Livet',
    bio: 'Yoga og meditasjon 🧘‍♀️',
    followers_count: 21500,
    following_count: 456,
    likes_count: 187000,
    videos_count: 112,
  },
  {
    email: 'matglede@tikitok.no',
    password: 'Test123!',
    username: 'matglede',
    display_name: 'Mat Glede',
    bio: 'Mat er lidenskap 🍕',
    followers_count: 18900,
    following_count: 523,
    likes_count: 156000,
    videos_count: 89,
  },
  {
    email: 'kunstner_no@tikitok.no',
    password: 'Test123!',
    username: 'kunstner_no',
    display_name: 'Kunstner NO',
    bio: 'Norsk kunstner 🎨',
    followers_count: 13400,
    following_count: 267,
    likes_count: 98000,
    videos_count: 73,
  },
  {
    email: 'gitargutten@tikitok.no',
    password: 'Test123!',
    username: 'gitargutten',
    display_name: 'Gitar Gutten',
    bio: 'Musikk er alt 🎸',
    followers_count: 25600,
    following_count: 678,
    likes_count: 212000,
    videos_count: 134,
  },
  {
    email: 'regndager@tikitok.no',
    password: 'Test123!',
    username: 'regndager',
    display_name: 'Regn Dager',
    bio: 'Elsker regn ☔',
    followers_count: 8700,
    following_count: 145,
    likes_count: 67000,
    videos_count: 48,
  },
  {
    email: 'hundeliv@tikitok.no',
    password: 'Test123!',
    username: 'hundeliv',
    display_name: 'Hunde Liv',
    bio: 'Hund er best 🐕',
    followers_count: 31200,
    following_count: 812,
    likes_count: 278000,
    videos_count: 156,
  },
  {
    email: 'fyrverkeri@tikitok.no',
    password: 'Test123!',
    username: 'fyrverkeri',
    display_name: 'Fyrverkeri',
    bio: 'Feiring og fest 🎆',
    followers_count: 56700,
    following_count: 1245,
    likes_count: 498000,
    videos_count: 187,
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
