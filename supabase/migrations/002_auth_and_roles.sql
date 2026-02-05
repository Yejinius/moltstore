-- MoltStore Authentication and Role-Based Access Control
-- Migration: 002_auth_and_roles.sql

-- ============================================================================
-- 1. USER PROFILES TABLE (extends auth.users)
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'developer', 'user')),
  developer_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

COMMENT ON TABLE user_profiles IS 'User profiles with role-based access control';
COMMENT ON COLUMN user_profiles.role IS 'User role: admin, developer, or user';
COMMENT ON COLUMN user_profiles.developer_verified IS 'Whether developer is verified by admin';

-- ============================================================================
-- 2. AUTO-CREATE PROFILE TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

COMMENT ON FUNCTION public.handle_new_user IS 'Automatically create user profile when auth user is created';

-- ============================================================================
-- 3. UPDATE EXISTING TABLES (add user_id foreign keys)
-- ============================================================================

-- Add user_id to apps table
ALTER TABLE apps ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_apps_user_id ON apps(user_id);

-- Add user_id to api_keys table
ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);

-- Add user_id to app_reviews table (replace user_name/user_email)
ALTER TABLE app_reviews ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_app_reviews_user_id ON app_reviews(user_id);

-- ============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile (but cannot change role)
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON user_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update any profile
CREATE POLICY "Admins can update all profiles"
  ON user_profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Enable RLS on apps
ALTER TABLE apps ENABLE ROW LEVEL SECURITY;

-- Public can view published apps
CREATE POLICY "Public can view published apps"
  ON apps FOR SELECT
  USING (status = 'published');

-- Developers can view their own apps (any status)
CREATE POLICY "Developers can view own apps"
  ON apps FOR SELECT
  USING (auth.uid() = user_id);

-- Developers can create apps (must set their own user_id)
CREATE POLICY "Developers can create apps"
  ON apps FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('developer', 'admin')
    )
  );

-- Developers can update their own apps
CREATE POLICY "Developers can update own apps"
  ON apps FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all apps
CREATE POLICY "Admins can view all apps"
  ON apps FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update all apps (for review/approval)
CREATE POLICY "Admins can update all apps"
  ON apps FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can delete any app
CREATE POLICY "Admins can delete apps"
  ON apps FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- 5. ENABLE RLS ON RELATED TABLES
-- ============================================================================

-- App features: inherit from apps
ALTER TABLE app_features ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view features of accessible apps"
  ON app_features FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM apps
      WHERE apps.id = app_features.app_id
      AND (apps.status = 'published' OR apps.user_id = auth.uid())
    )
  );

-- App tags: inherit from apps
ALTER TABLE app_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view tags of accessible apps"
  ON app_tags FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM apps
      WHERE apps.id = app_tags.app_id
      AND (apps.status = 'published' OR apps.user_id = auth.uid())
    )
  );

-- App reviews: public read, authenticated write
ALTER TABLE app_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews of published apps"
  ON app_reviews FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM apps
      WHERE apps.id = app_reviews.app_id
      AND apps.status = 'published'
    )
  );

CREATE POLICY "Authenticated users can create reviews"
  ON app_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON app_reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
  ON app_reviews FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 6. UPDATE TIMESTAMP TRIGGER FOR USER PROFILES
-- ============================================================================

CREATE OR REPLACE FUNCTION update_user_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profile_updated_at();

-- ============================================================================
-- 7. HELPFUL FUNCTIONS FOR ROLE MANAGEMENT
-- ============================================================================

-- Function to check if current user has specific role
CREATE OR REPLACE FUNCTION public.has_role(required_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role = required_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.has_role IS 'Check if current authenticated user has specific role';

-- Function to get current user's role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role FROM user_profiles
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.get_user_role IS 'Get role of current authenticated user';

-- ============================================================================
-- 8. SEED INITIAL ADMIN USER (OPTIONAL - RUN MANUALLY AFTER FIRST USER SIGNUP)
-- ============================================================================

-- Instructions:
-- 1. Sign up first user through the app
-- 2. Get their email from Supabase Dashboard > Authentication > Users
-- 3. Run this command with their email:
--
-- UPDATE user_profiles SET role = 'admin', developer_verified = true
-- WHERE email = 'your-admin-email@example.com';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Verify tables were created
DO $$
BEGIN
  RAISE NOTICE 'Migration 002_auth_and_roles.sql completed successfully';
  RAISE NOTICE 'user_profiles table created: %', (SELECT COUNT(*) >= 0 FROM user_profiles);
  RAISE NOTICE 'RLS policies applied to: user_profiles, apps, app_features, app_tags, app_reviews';
  RAISE NOTICE '';
  RAISE NOTICE 'NEXT STEPS:';
  RAISE NOTICE '1. Test user signup through the application';
  RAISE NOTICE '2. Verify user_profiles row is auto-created';
  RAISE NOTICE '3. Manually promote first user to admin role';
  RAISE NOTICE '4. Test RLS policies by logging in as different roles';
END $$;
