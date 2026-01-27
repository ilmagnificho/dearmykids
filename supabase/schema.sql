-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. USERS TABLE
-- This table mirrors the auth.users table for easier access to user profile data.
create table public.users (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz default now()
);

-- RLS for Users
alter table public.users enable row level security;
create policy "Public profiles are viewable by everyone." on public.users for select using (true);
create policy "Users can update own profile." on public.users for update using (auth.uid() = id);

-- 2. CREDITS TABLE
create table public.credits (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) not null unique, -- One credit record per user
  amount integer default 0,
  updated_at timestamptz default now()
);

-- RLS for Credits
alter table public.credits enable row level security;
create policy "Users can view own credits." on public.credits for select using (auth.uid() = user_id);
-- Only service role should update credits mostly, but strictly:
create policy "Users cannot update own credits directly." on public.credits for update using (false); 

-- 3. ORDERS TABLE
create table public.orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) not null,
  amount integer not null, -- Store in smallest currency unit (e.g., cents or won)
  credits_purchased integer not null,
  status text check (status in ('pending', 'paid', 'failed')) default 'pending',
  payment_provider text, -- e.g., 'stripe', 'toss'
  payment_id text,
  created_at timestamptz default now()
);

-- RLS for Orders
alter table public.orders enable row level security;
create policy "Users can view own orders." on public.orders for select using (auth.uid() = user_id);
create policy "Users can create orders." on public.orders for insert with check (auth.uid() = user_id);

-- 4. GENERATED IMAGES TABLE
create table public.generated_images (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) not null,
  image_url text not null,
  prompt text,
  theme text, -- e.g., 'Astronaut', 'Doctor'
  storage_path text, -- Path in Supabase Storage
  created_at timestamptz default now()
);

-- RLS for Generated Images
alter table public.generated_images enable row level security;
create policy "Users can view own images." on public.generated_images for select using (auth.uid() = user_id);
create policy "Users can insert generated images." on public.generated_images for insert with check (auth.uid() = user_id);

-- TRIGGERS & FUNCTIONS

-- Function to handle new user signup (automatically create public.users and credits)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  
  insert into public.credits (user_id, amount)
  values (new.id, 0); -- Start with 0 credits
  
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the function on auth.users insert
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- STORAGE BUCKETS (Script to run in SQL Editor)
-- insert into storage.buckets (id, name, public) values ('generated_images', 'generated_images', true);
-- insert into storage.buckets (id, name, public) values ('uploads', 'uploads', true);
