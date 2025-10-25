-- Allow admins to view all videos (including inactive ones)
CREATE POLICY "Admins can view all videos"
ON public.videos
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));