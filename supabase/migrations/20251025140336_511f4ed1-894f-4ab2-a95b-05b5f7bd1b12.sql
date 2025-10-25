-- Create function to increment video views
CREATE OR REPLACE FUNCTION public.increment_video_views(_video_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.videos
  SET views_count = views_count + 1
  WHERE id = _video_id;
END;
$$;