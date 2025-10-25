-- Create a SECURITY DEFINER function to toggle video status bypassing RLS
CREATE OR REPLACE FUNCTION public.toggle_video_status(_video_id uuid)
RETURNS TABLE(id uuid, is_active boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  UPDATE public.videos v
  SET is_active = NOT v.is_active
  WHERE v.id = _video_id
  RETURNING v.id, v.is_active;
END;
$$;