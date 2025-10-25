-- Insert demo videos into the videos table with specific UUIDs
-- This allows bookmarking of demo videos to work properly

INSERT INTO public.videos (id, user_id, title, description, video_url, likes_count, comments_count, views_count, is_active)
VALUES 
  ('00000000-0000-0000-0000-000000000001', (SELECT id FROM profiles WHERE username = 'naturelsker' LIMIT 1), 'Vakker morgen i skog', 'Vakker morgen i norsk skog 🌲 #norge #natur', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 12500, 342, 0, true),
  ('00000000-0000-0000-0000-000000000002', (SELECT id FROM profiles WHERE username = 'nordlysguide' LIMIT 1), 'Nordlys over Tromsø', 'Nordlys over Tromsø i natt! Utrolig 😍 #nordlys #tromsø', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', 45200, 891, 0, true),
  ('00000000-0000-0000-0000-000000000003', (SELECT id FROM profiles WHERE username = 'oslovibes' LIMIT 1), 'Fredagskveld i Oslo', 'Fredagskveld i Oslo! 🎉 #oslo #byliv', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 8900, 234, 0, true),
  ('00000000-0000-0000-0000-000000000004', (SELECT id FROM profiles WHERE username = 'bergenskok' LIMIT 1), 'Bølgene ved vestlandet', 'Bølgene ved vestlandet 🌊 #hav #natur', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', 15600, 423, 0, true),
  ('00000000-0000-0000-0000-000000000005', (SELECT id FROM profiles WHERE username = 'fjellvandrer' LIMIT 1), 'Produktiv dag', 'Produktiv dag på kontoret 💻 #jobb #tech', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 7800, 156, 0, true)
ON CONFLICT (id) DO NOTHING;