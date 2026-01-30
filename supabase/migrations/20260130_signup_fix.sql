-- 20260130_signup_fix.sql
-- Fix "Database error saving new user" by ensuring schema consistency

-- 1. Ensure user_profiles has all required columns
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS full_name text;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS credits integer DEFAULT 0;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS referral_code text DEFAULT substring(md5(random()::text) from 0 for 9);
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS referred_by uuid REFERENCES public.user_profiles(user_id);

-- 2. Drop and Re-create the trigger function to ensure it matches the schema
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  referrer_id uuid;
  given_referral_code text;
BEGIN
  -- Extract referral code from metadata (safe access)
  BEGIN
    given_referral_code := new.raw_user_meta_data->>'referral_code';
  EXCEPTION WHEN OTHERS THEN
    given_referral_code := NULL;
  END;

  -- Find referrer if code exists
  IF given_referral_code IS NOT NULL THEN
    SELECT user_id INTO referrer_id FROM public.user_profiles WHERE referral_code = given_referral_code;
  END IF;

  -- Create Profile
  INSERT INTO public.user_profiles (
      user_id, 
      email, 
      full_name, 
      avatar_url, 
      referred_by, 
      credits, 
      is_admin
  )
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url', 
    referrer_id,
    CASE WHEN referrer_id IS NOT NULL THEN 1 ELSE 0 END, -- Bonus credit logic
    false -- Default is_admin to false
  );
  
  -- Reward Referrer if exists
  IF referrer_id IS NOT NULL THEN
    UPDATE public.user_profiles 
    SET credits = credits + 1 
    WHERE user_id = referrer_id;
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Ensure trigger is attached
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. Set Admin for specific user (Safe update)
UPDATE public.user_profiles 
SET is_admin = true 
WHERE email = 'onlyforaiprojects@gmail.com';
