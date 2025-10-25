-- Activate all hidden videos
UPDATE public.videos
SET is_active = true
WHERE is_active = false;