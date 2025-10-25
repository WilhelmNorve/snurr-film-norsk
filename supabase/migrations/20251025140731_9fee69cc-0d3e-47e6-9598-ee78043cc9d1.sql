-- Add is_active column to profiles table
ALTER TABLE public.profiles
ADD COLUMN is_active BOOLEAN DEFAULT true NOT NULL;

-- Create function to toggle user active status (admin only)
CREATE OR REPLACE FUNCTION public.toggle_user_status(_user_id uuid)
RETURNS TABLE(id uuid, is_active boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  UPDATE public.profiles p
  SET is_active = NOT p.is_active
  WHERE p.id = _user_id
  RETURNING p.id, p.is_active;
END;
$$;