-- Helper functions for MoltStore

-- Increment downloads counter
CREATE OR REPLACE FUNCTION increment_downloads(app_id TEXT)
RETURNS void AS $$
BEGIN
  UPDATE apps SET downloads = downloads + 1 WHERE id = app_id;
END;
$$ LANGUAGE plpgsql;

-- Get app statistics
CREATE OR REPLACE FUNCTION get_app_stats()
RETURNS TABLE(
  total_apps BIGINT,
  published_apps BIGINT,
  pending_review BIGINT,
  total_downloads BIGINT,
  total_reviews BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) AS total_apps,
    COUNT(*) FILTER (WHERE status = 'published') AS published_apps,
    COUNT(*) FILTER (WHERE status IN ('pending', 'in_review')) AS pending_review,
    SUM(downloads) AS total_downloads,
    (SELECT COUNT(*) FROM app_reviews) AS total_reviews
  FROM apps;
END;
$$ LANGUAGE plpgsql;

-- Update app rating (called after review insert/update/delete)
CREATE OR REPLACE FUNCTION update_app_rating_trigger()
RETURNS TRIGGER AS $$
DECLARE
  avg_rating DECIMAL(3,1);
BEGIN
  SELECT ROUND(AVG(rating)::NUMERIC, 1)
  INTO avg_rating
  FROM app_reviews
  WHERE app_id = COALESCE(NEW.app_id, OLD.app_id);
  
  UPDATE apps
  SET rating = COALESCE(avg_rating, 0.0)
  WHERE id = COALESCE(NEW.app_id, OLD.app_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update rating when reviews change
DROP TRIGGER IF EXISTS app_reviews_rating_trigger ON app_reviews;
CREATE TRIGGER app_reviews_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON app_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_app_rating_trigger();

-- Trigger: Increment downloads
DROP TRIGGER IF EXISTS app_downloads_increment_trigger ON app_downloads;
CREATE TRIGGER app_downloads_increment_trigger
  AFTER INSERT ON app_downloads
  FOR EACH ROW
  EXECUTE FUNCTION increment_downloads(NEW.app_id);

COMMENT ON FUNCTION increment_downloads IS 'Increment download counter for an app';
COMMENT ON FUNCTION get_app_stats IS 'Get global app marketplace statistics';
COMMENT ON FUNCTION update_app_rating_trigger IS 'Auto-update app rating when reviews change';

-- Get current user's profile (bypasses RLS)
CREATE OR REPLACE FUNCTION get_my_profile()
RETURNS TABLE(
  id UUID,
  email TEXT,
  full_name TEXT,
  role TEXT,
  developer_verified BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.email,
    p.full_name,
    p.role,
    p.developer_verified
  FROM user_profiles p
  WHERE p.id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_my_profile IS 'Get current authenticated user profile (bypasses RLS)';
