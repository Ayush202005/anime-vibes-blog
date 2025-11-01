-- Fix: Restrict posts SELECT access to authenticated users only
-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Anyone can view posts" ON public.posts;

-- Create new policy requiring authentication
CREATE POLICY "Authenticated users can view posts"
ON public.posts
FOR SELECT
TO authenticated
USING (true);

-- Also fix: Make user_id NOT NULL to prevent data integrity issues
ALTER TABLE public.posts 
ALTER COLUMN user_id SET NOT NULL;