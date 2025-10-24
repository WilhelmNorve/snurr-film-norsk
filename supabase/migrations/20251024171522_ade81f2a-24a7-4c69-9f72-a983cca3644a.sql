-- Create function to insert test users
CREATE OR REPLACE FUNCTION create_test_users()
RETURNS TABLE (email text, username text, success boolean) AS $$
DECLARE
  user_id uuid;
BEGIN
  -- User 1
  user_id := gen_random_uuid();
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at, confirmation_token)
  VALUES (user_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'naturelsker@tikitok.no', crypt('Test123!', gen_salt('bf')), NOW(), '{"username": "naturelsker", "display_name": "Nature Lover"}'::jsonb, NOW(), NOW(), '');
  INSERT INTO public.profiles (id, username, display_name, bio, avatar_url, followers_count, following_count, likes_count, videos_count)
  VALUES (user_id, 'naturelsker', 'Nature Lover', 'Elsker norsk natur 🌲🏔️', 'https://api.dicebear.com/7.x/avataaars/svg?seed=nature', 15200, 432, 125000, 87);
  RETURN QUERY SELECT 'naturelsker@tikitok.no'::text, 'naturelsker'::text, true;

  -- User 2
  user_id := gen_random_uuid();
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at, confirmation_token)
  VALUES (user_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'nordlysguide@tikitok.no', crypt('Test123!', gen_salt('bf')), NOW(), '{"username": "nordlysguide", "display_name": "Nordlys Guide"}'::jsonb, NOW(), NOW(), '');
  INSERT INTO public.profiles (id, username, display_name, bio, avatar_url, followers_count, following_count, likes_count, videos_count)
  VALUES (user_id, 'nordlysguide', 'Nordlys Guide', 'Jeger på nordlys i nord ✨', 'https://api.dicebear.com/7.x/avataaars/svg?seed=aurora', 45200, 891, 520000, 156);
  RETURN QUERY SELECT 'nordlysguide@tikitok.no'::text, 'nordlysguide'::text, true;

  -- User 3
  user_id := gen_random_uuid();
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at, confirmation_token)
  VALUES (user_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'oslovibes@tikitok.no', crypt('Test123!', gen_salt('bf')), NOW(), '{"username": "oslovibes", "display_name": "Oslo Vibes"}'::jsonb, NOW(), NOW(), '');
  INSERT INTO public.profiles (id, username, display_name, bio, avatar_url, followers_count, following_count, likes_count, videos_count)
  VALUES (user_id, 'oslovibes', 'Oslo Vibes', 'Byliv og kultur 🎉', 'https://api.dicebear.com/7.x/avataaars/svg?seed=oslo', 8900, 234, 78000, 43);
  RETURN QUERY SELECT 'oslovibes@tikitok.no'::text, 'oslovibes'::text, true;

  -- User 4
  user_id := gen_random_uuid();
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at, confirmation_token)
  VALUES (user_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'bergenskok@tikitok.no', crypt('Test123!', gen_salt('bf')), NOW(), '{"username": "bergenskok", "display_name": "Bergens Kokk"}'::jsonb, NOW(), NOW(), '');
  INSERT INTO public.profiles (id, username, display_name, bio, avatar_url, followers_count, following_count, likes_count, videos_count)
  VALUES (user_id, 'bergenskok', 'Bergens Kokk', 'Matglede fra vestlandet 🍽️', 'https://api.dicebear.com/7.x/avataaars/svg?seed=chef', 23400, 567, 198000, 92);
  RETURN QUERY SELECT 'bergenskok@tikitok.no'::text, 'bergenskok'::text, true;

  -- User 5
  user_id := gen_random_uuid();
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at, confirmation_token)
  VALUES (user_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'fjellvandrer@tikitok.no', crypt('Test123!', gen_salt('bf')), NOW(), '{"username": "fjellvandrer", "display_name": "Fjellvandreren"}'::jsonb, NOW(), NOW(), '');
  INSERT INTO public.profiles (id, username, display_name, bio, avatar_url, followers_count, following_count, likes_count, videos_count)
  VALUES (user_id, 'fjellvandrer', 'Fjellvandreren', 'Topper og turer 🥾', 'https://api.dicebear.com/7.x/avataaars/svg?seed=hiker', 34500, 723, 312000, 128);
  RETURN QUERY SELECT 'fjellvandrer@tikitok.no'::text, 'fjellvandrer'::text, true;

  -- User 6
  user_id := gen_random_uuid();
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at, confirmation_token)
  VALUES (user_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'trondheimstudie@tikitok.no', crypt('Test123!', gen_salt('bf')), NOW(), '{"username": "trondheimstudie", "display_name": "Trondheim Student"}'::jsonb, NOW(), NOW(), '');
  INSERT INTO public.profiles (id, username, display_name, bio, avatar_url, followers_count, following_count, likes_count, videos_count)
  VALUES (user_id, 'trondheimstudie', 'Trondheim Student', 'Student life NTNU 📚', 'https://api.dicebear.com/7.x/avataaars/svg?seed=student', 12300, 456, 89000, 67);
  RETURN QUERY SELECT 'trondheimstudie@tikitok.no'::text, 'trondheimstudie'::text, true;

  -- User 7
  user_id := gen_random_uuid();
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at, confirmation_token)
  VALUES (user_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'skatepro@tikitok.no', crypt('Test123!', gen_salt('bf')), NOW(), '{"username": "skatepro", "display_name": "Skate Pro"}'::jsonb, NOW(), NOW(), '');
  INSERT INTO public.profiles (id, username, display_name, bio, avatar_url, followers_count, following_count, likes_count, videos_count)
  VALUES (user_id, 'skatepro', 'Skate Pro', 'Skate og tricks 🛹', 'https://api.dicebear.com/7.x/avataaars/svg?seed=skate', 67800, 1234, 890000, 234);
  RETURN QUERY SELECT 'skatepro@tikitok.no'::text, 'skatepro'::text, true;

  -- User 8
  user_id := gen_random_uuid();
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at, confirmation_token)
  VALUES (user_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'musikklaerer@tikitok.no', crypt('Test123!', gen_salt('bf')), NOW(), '{"username": "musikklaerer", "display_name": "Musikkpedagog"}'::jsonb, NOW(), NOW(), '');
  INSERT INTO public.profiles (id, username, display_name, bio, avatar_url, followers_count, following_count, likes_count, videos_count)
  VALUES (user_id, 'musikklaerer', 'Musikkpedagog', 'Deler musikktips 🎸', 'https://api.dicebear.com/7.x/avataaars/svg?seed=music', 19800, 678, 156000, 98);
  RETURN QUERY SELECT 'musikklaerer@tikitok.no'::text, 'musikklaerer'::text, true;

  -- User 9
  user_id := gen_random_uuid();
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at, confirmation_token)
  VALUES (user_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'fotballkjempe@tikitok.no', crypt('Test123!', gen_salt('bf')), NOW(), '{"username": "fotballkjempe", "display_name": "Fotball Fan"}'::jsonb, NOW(), NOW(), '');
  INSERT INTO public.profiles (id, username, display_name, bio, avatar_url, followers_count, following_count, likes_count, videos_count)
  VALUES (user_id, 'fotballkjempe', 'Fotball Fan', 'RBK til jeg dør ⚽', 'https://api.dicebear.com/7.x/avataaars/svg?seed=football', 28900, 890, 234000, 112);
  RETURN QUERY SELECT 'fotballkjempe@tikitok.no'::text, 'fotballkjempe'::text, true;

  -- User 10
  user_id := gen_random_uuid();
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at, confirmation_token)
  VALUES (user_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'kunstneren@tikitok.no', crypt('Test123!', gen_salt('bf')), NOW(), '{"username": "kunstneren", "display_name": "Digital Artist"}'::jsonb, NOW(), NOW(), '');
  INSERT INTO public.profiles (id, username, display_name, bio, avatar_url, followers_count, following_count, likes_count, videos_count)
  VALUES (user_id, 'kunstneren', 'Digital Artist', 'Norsk digital kunst 🎨', 'https://api.dicebear.com/7.x/avataaars/svg?seed=artist', 41200, 1123, 487000, 178);
  RETURN QUERY SELECT 'kunstneren@tikitok.no'::text, 'kunstneren'::text, true;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;