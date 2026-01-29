-- 20260130_schema_fix.sql
-- CRITICAL FIX: Harmonize Schema to use 'user_profiles' as expected by Application Code

-- 1. Create user_profiles if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_profiles (
  user_id uuid REFERENCES auth.users NOT NULL PRIMARY KEY,
  email text,
  full_name text,
  avatar_url text,
  credits integer DEFAULT 0,
  free_credits integer DEFAULT 0,
  referral_code text UNIQUE DEFAULT substring(md5(random()::text) from 0 for 9),
  referred_by uuid REFERENCES public.user_profiles(user_id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 3. Policies (Drop existing to ensure idempotent)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON public.user_profiles;

CREATE POLICY "Public profiles are viewable by everyone." ON public.user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile." ON public.user_profiles FOR UPDATE USING (auth.uid() = user_id);

-- 4. Update Trigger Function to use user_profiles instead of users/credits
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  referrer_id uuid;
  given_referral_code text;
BEGIN
  -- Extract referral code from metadata
  given_referral_code := new.raw_user_meta_data->>'referral_code';

  -- Find referrer if code exists
  IF given_referral_code IS NOT NULL THEN
    SELECT user_id INTO referrer_id FROM public.user_profiles WHERE referral_code = given_referral_code;
  END IF;

  INSERT INTO public.user_profiles (user_id, email, full_name, avatar_url, referred_by, credits)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url', 
    referrer_id,
    CASE WHEN referrer_id IS NOT NULL THEN 1 ELSE 0 END -- Bonus credit for referee
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

-- 5. Ensure trigger is attached
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 6. (Optional) Migration: If 'users' table exists and has data, copy it to 'user_profiles'
-- Uncomment if you need to migrate existing data from the old structure
/*
INSERT INTO public.user_profiles (user_id, email, full_name, avatar_url, created_at)
SELECT id, email, full_name, avatar_url, created_at FROM public.users
ON CONFLICT (user_id) DO NOTHING;
*/
