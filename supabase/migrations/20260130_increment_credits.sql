-- Helper function to increment credits safely
create or replace function public.increment_credits(user_uuid uuid, amount int)
returns void as $$
begin
  update public.user_profiles
  set credits = credits + amount
  where user_id = user_uuid;
end;
$$ language plpgsql security definer;
