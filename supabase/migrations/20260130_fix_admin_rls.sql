-- 20260130_fix_admin_rls.sql
-- Fix RLS recursion issue for admin check

-- 1. Ensure users can ALWAYS read their own profile (including is_admin column)
-- This breaks the "I need to know if I am admin to read if I am admin" loop.
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;

CREATE POLICY "Users can view own profile" 
ON public.user_profiles 
FOR SELECT 
USING (auth.uid() = user_id);
