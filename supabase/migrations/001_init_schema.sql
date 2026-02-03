-- MoltStore Database Schema for Supabase PostgreSQL
-- Migration: 001_init_schema.sql

-- Apps table
CREATE TABLE IF NOT EXISTS apps (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  long_description TEXT NOT NULL,
  category TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  version TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'approved', 'published', 'rejected')),
  file_hash TEXT,
  file_path TEXT,
  verified BOOLEAN DEFAULT FALSE,
  api_access BOOLEAN DEFAULT TRUE,
  downloads INTEGER DEFAULT 0,
  rating DECIMAL(3, 1) DEFAULT 0.0,
  developer_name TEXT NOT NULL,
  developer_verified BOOLEAN DEFAULT FALSE,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  review_notes TEXT
);

-- App features
CREATE TABLE IF NOT EXISTS app_features (
  id SERIAL PRIMARY KEY,
  app_id TEXT NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  feature TEXT NOT NULL
);

-- App tags
CREATE TABLE IF NOT EXISTS app_tags (
  id SERIAL PRIMARY KEY,
  app_id TEXT NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  tag TEXT NOT NULL
);

-- App reviews
CREATE TABLE IF NOT EXISTS app_reviews (
  id SERIAL PRIMARY KEY,
  app_id TEXT NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  helpful_count INTEGER DEFAULT 0
);

-- App versions
CREATE TABLE IF NOT EXISTS app_versions (
  id SERIAL PRIMARY KEY,
  app_id TEXT NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  version TEXT NOT NULL,
  release_notes TEXT,
  file_hash TEXT,
  file_path TEXT,
  released_at TIMESTAMPTZ DEFAULT NOW()
);

-- Download history
CREATE TABLE IF NOT EXISTS app_downloads (
  id SERIAL PRIMARY KEY,
  app_id TEXT NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  user_email TEXT,
  api_key TEXT,
  downloaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Security scans
CREATE TABLE IF NOT EXISTS security_scans (
  id SERIAL PRIMARY KEY,
  app_id TEXT NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  scan_type TEXT NOT NULL,
  passed BOOLEAN NOT NULL,
  score INTEGER NOT NULL,
  checks JSONB NOT NULL,
  recommendation TEXT NOT NULL,
  scanned_at TIMESTAMPTZ DEFAULT NOW()
);

-- API keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id SERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used TIMESTAMPTZ,
  rate_limit_requests INTEGER DEFAULT 100,
  rate_limit_window INTEGER DEFAULT 60
);

-- Rate limiting table
CREATE TABLE IF NOT EXISTS rate_limits (
  id SERIAL PRIMARY KEY,
  api_key TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  count INTEGER DEFAULT 0,
  window_start TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(api_key, endpoint)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_apps_status ON apps(status);
CREATE INDEX IF NOT EXISTS idx_apps_category ON apps(category);
CREATE INDEX IF NOT EXISTS idx_apps_downloads ON apps(downloads DESC);
CREATE INDEX IF NOT EXISTS idx_apps_rating ON apps(rating DESC);
CREATE INDEX IF NOT EXISTS idx_app_features_app_id ON app_features(app_id);
CREATE INDEX IF NOT EXISTS idx_app_tags_app_id ON app_tags(app_id);
CREATE INDEX IF NOT EXISTS idx_app_reviews_app_id ON app_reviews(app_id);
CREATE INDEX IF NOT EXISTS idx_app_versions_app_id ON app_versions(app_id);
CREATE INDEX IF NOT EXISTS idx_app_downloads_app_id ON app_downloads(app_id);
CREATE INDEX IF NOT EXISTS idx_security_scans_app_id ON security_scans(app_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key ON api_keys(key);

-- Functions
-- Update last_updated timestamp automatically
CREATE OR REPLACE FUNCTION update_last_updated()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for apps.last_updated
CREATE TRIGGER apps_last_updated
  BEFORE UPDATE ON apps
  FOR EACH ROW
  EXECUTE FUNCTION update_last_updated();

-- Comments
COMMENT ON TABLE apps IS 'Main apps/agents catalog';
COMMENT ON TABLE app_features IS 'Key features of each app';
COMMENT ON TABLE app_tags IS 'Tags for search and categorization';
COMMENT ON TABLE app_reviews IS 'User reviews and ratings';
COMMENT ON TABLE app_versions IS 'Version history for each app';
COMMENT ON TABLE app_downloads IS 'Download tracking';
COMMENT ON TABLE security_scans IS 'Automated security scan results';
COMMENT ON TABLE api_keys IS 'API keys for agent access';
COMMENT ON TABLE rate_limits IS 'Rate limiting state';
