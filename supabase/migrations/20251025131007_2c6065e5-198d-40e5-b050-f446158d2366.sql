-- Drop existing restrictive UPDATE policies on videos table
DROP POLICY IF EXISTS "Admins can update any video" ON public.videos;
DROP POLICY IF EXISTS "Users can update their own videos" ON public.videos;

-- Create new PERMISSIVE policies (either condition can be true)
CREATE POLICY "Admins can update any video"
ON public.videos
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can update their own videos"
ON public.videos
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);