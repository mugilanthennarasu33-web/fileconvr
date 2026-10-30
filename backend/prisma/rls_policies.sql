-- ==============================================================================
-- fileconvr: Supabase PostgreSQL Row Level Security (RLS) Policies
-- ==============================================================================
--
-- These policies protect user data when queried directly via the Supabase Data
-- API (PostgREST) using user JWT tokens.
--
-- Privileged server-side connections (such as Prisma connecting with the
-- postgres / service_role connection string) bypass RLS. Backend API routes
-- independently verify the Supabase JWT sub claim to guarantee end-to-end
-- defense-in-depth authorization.
--
-- To apply:
-- Run this script in the Supabase SQL Editor or as part of a database migration.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Enable RLS on all application tables
-- ------------------------------------------------------------------------------
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProcessingJob" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UsageRecord" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Subscription" ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 2. Drop any pre-existing policies for clean idempotent execution
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can read own profile" ON "User";
DROP POLICY IF EXISTS "Users can update own profile non-privileged fields" ON "User";
DROP POLICY IF EXISTS "Users can read own sessions" ON "Session";
DROP POLICY IF EXISTS "Users can read own jobs" ON "ProcessingJob";
DROP POLICY IF EXISTS "Users can insert own jobs" ON "ProcessingJob";
DROP POLICY IF EXISTS "Users can update own jobs" ON "ProcessingJob";
DROP POLICY IF EXISTS "Users can delete own jobs" ON "ProcessingJob";
DROP POLICY IF EXISTS "Users can read own usage records" ON "UsageRecord";
DROP POLICY IF EXISTS "Users can read own subscriptions" ON "Subscription";

-- ------------------------------------------------------------------------------
-- 3. "User" Table Policies
-- ------------------------------------------------------------------------------
-- Users can only read their own profile row matching their Supabase Auth UID.
CREATE POLICY "Users can read own profile"
  ON "User"
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id);

-- Users can update only their own profile row.
-- Note: A trigger below guarantees they cannot escalate their own tier or role.
CREATE POLICY "Users can update own profile non-privileged fields"
  ON "User"
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id)
  WITH CHECK (auth.uid()::text = id);

-- Privilege escalation prevention trigger:
-- Protects role and tier from being updated by the client-side authenticated role.
CREATE OR REPLACE FUNCTION public.prevent_privilege_escalation()
RETURNS TRIGGER AS $$
BEGIN
  -- If invoked via client-facing authenticated role, forbid changing role or tier
  IF auth.role() = 'authenticated' THEN
    IF NEW.role IS DISTINCT FROM OLD.role THEN
      RAISE EXCEPTION 'Modifying user role is not permitted from the client API.';
    END IF;
    IF NEW.tier IS DISTINCT FROM OLD.tier THEN
      RAISE EXCEPTION 'Modifying user subscription tier is not permitted from the client API.';
    END IF;
    IF NEW.id IS DISTINCT FROM OLD.id THEN
      RAISE EXCEPTION 'Modifying user ID is not permitted.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_prevent_privilege_escalation ON "User";
CREATE TRIGGER trg_prevent_privilege_escalation
  BEFORE UPDATE ON "User"
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_privilege_escalation();

-- ------------------------------------------------------------------------------
-- 4. "ProcessingJob" Table Policies
-- ------------------------------------------------------------------------------
-- Users can read only jobs associated with their verified Supabase user ID.
CREATE POLICY "Users can read own jobs"
  ON "ProcessingJob"
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = "userId");

-- Users can insert jobs where userId matches their own authenticated ID.
CREATE POLICY "Users can insert own jobs"
  ON "ProcessingJob"
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = "userId");

-- Users can update only their own jobs.
CREATE POLICY "Users can update own jobs"
  ON "ProcessingJob"
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = "userId")
  WITH CHECK (auth.uid()::text = "userId");

-- Users can delete only their own jobs from history.
CREATE POLICY "Users can delete own jobs"
  ON "ProcessingJob"
  FOR DELETE
  TO authenticated
  USING (auth.uid()::text = "userId");

-- ------------------------------------------------------------------------------
-- 5. "UsageRecord" Table Policies
-- ------------------------------------------------------------------------------
-- Users can only read their own daily usage and quota consumption.
CREATE POLICY "Users can read own usage records"
  ON "UsageRecord"
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = "userId");

-- ------------------------------------------------------------------------------
-- 6. "Subscription" Table Policies
-- ------------------------------------------------------------------------------
-- Users can read only their own active or past subscription status.
CREATE POLICY "Users can read own subscriptions"
  ON "Subscription"
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = "userId");

-- ------------------------------------------------------------------------------
-- 7. "Session" Table Policies
-- ------------------------------------------------------------------------------
-- Users can read only their own active session references.
CREATE POLICY "Users can read own sessions"
  ON "Session"
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = "userId");
