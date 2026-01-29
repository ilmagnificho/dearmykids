-- 20260130_admin_creation_fix.sql
-- Fix for "column email does not exist" error

-- 1. Ensure the 'email' column exists in user_profiles
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS email text;

-- 2. Populate the email column from the secure auth.users table
-- (This ensures the WHERE email = ... clause will actually work)
UPDATE public.user_profiles
SET email = auth.users.email
FROM auth.users
WHERE public.user_profiles.user_id = auth.users.id;

-- 3. Now set the admin privileges
UPDATE public.user_profiles 
SET is_admin = true 
WHERE email = 'onlyforaprojects@gmail.com';

-- 4. Verify the result (Selects the user so you can see it worked)
SELECT user_id, email, is_admin 
FROM public.user_profiles 
WHERE email = 'onlyforaprojects@gmail.com';
