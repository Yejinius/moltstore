-- MoltStore Database Schema for Supabase (PostgreSQL)

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
  status TEXT DEFAULT 'pending',
  file_hash TEXT,
  file_path TEXT,
  verified BOOLEAN DEFAULT FALSE,
  api_access BOOLEAN DEFAULT TRUE,
  downloads INTEGER DEFAULT 0,
  rating DECIMAL(3, 1) DEFAULT 0.0,
  developer_name TEXT NOT NULL,
  developer_verified BOOLEAN DEFAULT FALSE,
  uploaded_at TIMESTAMP DEFAULT NOW(),
  last_updated TIMESTAMP DEFAULT NOW(),
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

-- Reviews
CREATE TABLE IF NOT EXISTS app_reviews (
  id SERIAL PRIMARY KEY,
  app_id TEXT NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
  title TEXT NOT NULL,
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  helpful_count INTEGER DEFAULT 0
);

-- Version history
CREATE TABLE IF NOT EXISTS app_versions (
  id SERIAL PRIMARY KEY,
  app_id TEXT NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  version TEXT NOT NULL,
  release_notes TEXT,
  file_hash TEXT,
  file_path TEXT,
  released_at TIMESTAMP DEFAULT NOW()
);

-- Download history
CREATE TABLE IF NOT EXISTS app_downloads (
  id SERIAL PRIMARY KEY,
  app_id TEXT NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  user_email TEXT,
  api_key TEXT,
  downloaded_at TIMESTAMP DEFAULT NOW()
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
  scanned_at TIMESTAMP DEFAULT NOW()
);

-- API keys
CREATE TABLE IF NOT EXISTS api_keys (
  id SERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  developer_id TEXT NOT NULL,
  developer_name TEXT NOT NULL,
  developer_email TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  last_used_at TIMESTAMP,
  rate_limit_remaining INTEGER DEFAULT 100,
  rate_limit_reset_at TIMESTAMP
);

-- Rate limits
CREATE TABLE IF NOT EXISTS rate_limits (
  id SERIAL PRIMARY KEY,
  api_key TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  count INTEGER DEFAULT 0,
  reset_at TIMESTAMP NOT NULL,
  UNIQUE(api_key, endpoint)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_apps_status ON apps(status);
CREATE INDEX IF NOT EXISTS idx_apps_category ON apps(category);
CREATE INDEX IF NOT EXISTS idx_apps_developer ON apps(developer_name);
CREATE INDEX IF NOT EXISTS idx_app_features_app_id ON app_features(app_id);
CREATE INDEX IF NOT EXISTS idx_app_tags_app_id ON app_tags(app_id);
CREATE INDEX IF NOT EXISTS idx_app_reviews_app_id ON app_reviews(app_id);
CREATE INDEX IF NOT EXISTS idx_app_versions_app_id ON app_versions(app_id);
CREATE INDEX IF NOT EXISTS idx_app_downloads_app_id ON app_downloads(app_id);
CREATE INDEX IF NOT EXISTS idx_security_scans_app_id ON security_scans(app_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key ON api_keys(key);
CREATE INDEX IF NOT EXISTS idx_rate_limits_api_key ON rate_limits(api_key);

-- Enable Row Level Security (RLS)
ALTER TABLE apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Database functions
CREATE OR REPLACE FUNCTION increment_downloads(app_id TEXT)
RETURNS void AS $$
BEGIN
  UPDATE apps SET downloads = downloads + 1 WHERE id = app_id;
END;
$$ LANGUAGE plpgsql;

-- Public access policies (for now - adjust as needed)
CREATE POLICY "Public read access" ON apps FOR SELECT USING (status = 'published');
CREATE POLICY "Public read features" ON app_features FOR SELECT USING (true);
CREATE POLICY "Public read tags" ON app_tags FOR SELECT USING (true);
CREATE POLICY "Public read reviews" ON app_reviews FOR SELECT USING (true);
CREATE POLICY "Public read versions" ON app_versions FOR SELECT USING (true);

-- Admin write policies (authenticated users with service_role)
CREATE POLICY "Service role full access apps" ON apps FOR ALL USING (true);
CREATE POLICY "Service role full access features" ON app_features FOR ALL USING (true);
CREATE POLICY "Service role full access tags" ON app_tags FOR ALL USING (true);
CREATE POLICY "Service role full access reviews" ON app_reviews FOR ALL USING (true);
CREATE POLICY "Service role full access versions" ON app_versions FOR ALL USING (true);
CREATE POLICY "Service role full access downloads" ON app_downloads FOR ALL USING (true);
CREATE POLICY "Service role full access scans" ON security_scans FOR ALL USING (true);
CREATE POLICY "Service role full access api_keys" ON api_keys FOR ALL USING (true);
CREATE POLICY "Service role full access rate_limits" ON rate_limits FOR ALL USING (true);
