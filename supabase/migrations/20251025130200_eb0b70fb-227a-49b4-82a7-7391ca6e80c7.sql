-- Add new profile fields for comprehensive user information
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS date_of_birth date,
ADD COLUMN IF NOT EXISTS gender text,
ADD COLUMN IF NOT EXISTS nationality text,
ADD COLUMN IF NOT EXISTS phone_number text,
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS website text;

-- Add comment to explain gender field accepts modern gender identities
COMMENT ON COLUMN public.profiles.gender IS 'Gender identity: mann, kvinne, ikke-binær, annet, ønsker ikke å oppgi';