-- 20260130_admin_setup.sql
-- Add admin capabilities

-- 1. Add is_admin column
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- 2. Add RLS policy for admins to update ANY profile
-- (Normal users can only update their own)
CREATE POLICY "Admins can update all profiles." 
ON public.user_profiles 
FOR UPDATE 
USING (
  (SELECT is_admin FROM public.user_profiles WHERE user_id = auth.uid()) = true
);

CREATE POLICY "Admins can view all profiles." 
ON public.user_profiles 
FOR SELECT 
USING (
  (SELECT is_admin FROM public.user_profiles WHERE user_id = auth.uid()) = true
);

-- 3. Script to make a specific user admin (User needs to run this manually with their UUID)
-- UPDATE public.user_profiles SET is_admin = true WHERE user_id = 'YOUR_UUID_HERE';
