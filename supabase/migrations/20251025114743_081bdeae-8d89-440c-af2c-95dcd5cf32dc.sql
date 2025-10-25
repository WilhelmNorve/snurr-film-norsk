-- Create video_likes table
CREATE TABLE IF NOT EXISTS public.video_likes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id uuid NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(video_id, user_id)
);

-- Enable RLS
ALTER TABLE public.video_likes ENABLE ROW LEVEL SECURITY;

-- Users can view all likes
CREATE POLICY "Anyone can view video likes"
  ON public.video_likes
  FOR SELECT
  USING (true);

-- Users can like videos
CREATE POLICY "Users can like videos"
  ON public.video_likes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can unlike videos
CREATE POLICY "Users can unlike videos"
  ON public.video_likes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_video_likes_video_id ON public.video_likes(video_id);
CREATE INDEX IF NOT EXISTS idx_video_likes_user_id ON public.video_likes(user_id);

-- Function to update video likes count
CREATE OR REPLACE FUNCTION public.update_video_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.videos
    SET likes_count = likes_count + 1
    WHERE id = NEW.video_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.videos
    SET likes_count = GREATEST(0, likes_count - 1)
    WHERE id = OLD.video_id;
  END IF;
  RETURN NULL;
END;
$$;

-- Trigger to automatically update likes count
CREATE TRIGGER update_video_likes_count_trigger
AFTER INSERT OR DELETE ON public.video_likes
FOR EACH ROW
EXECUTE FUNCTION public.update_video_likes_count();