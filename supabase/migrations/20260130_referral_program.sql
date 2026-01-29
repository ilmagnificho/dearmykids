-- 1. Add Referral Columns to user_profiles
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS referral_code text UNIQUE DEFAULT substring(md5(random()::text) from 0 for 9), -- 8 chars likely collision safe enough for small scale
ADD COLUMN IF NOT EXISTS referred_by uuid REFERENCES public.user_profiles(user_id);

-- 2. Update the handle_new_user function to process referrals
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

  -- Create Profile (Assuming user_profiles is the table used by the app)
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
