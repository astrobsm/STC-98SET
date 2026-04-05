-- Fix RLS infinite recursion on users table
-- The "Admins and exco can view all users" and "Admins can manage all users" policies
-- reference the users table from within a users policy, causing infinite recursion.
-- Fix: Use a security definer function to check role without triggering RLS.

-- Step 1: Create a helper function (security definer bypasses RLS)
CREATE OR REPLACE FUNCTION get_user_role(user_auth_id uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM users WHERE auth_id = user_auth_id LIMIT 1;
$$;

-- Step 2: Drop the problematic policies
DROP POLICY IF EXISTS "Admins and exco can view all users" ON users;
DROP POLICY IF EXISTS "Admins can manage all users" ON users;

-- Step 3: Recreate with the helper function (no self-referencing subquery)
CREATE POLICY "Admins and exco can view all users"
  ON users FOR SELECT
  USING (
    get_user_role(auth.uid()) IN ('admin', 'exco')
  );

CREATE POLICY "Admins can manage all users"
  ON users FOR ALL
  USING (
    get_user_role(auth.uid()) = 'admin'
  );
