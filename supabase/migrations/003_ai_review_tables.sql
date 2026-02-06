-- AI Code Review System - Database Tables
-- Migration: 003_ai_review_tables.sql

-- AI Review Results - stores Claude analysis results
CREATE TABLE IF NOT EXISTS ai_reviews (
  id SERIAL PRIMARY KEY,
  app_id TEXT NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  file_hash TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'skipped')),

  -- Scores (0-100)
  overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
  security_score INTEGER CHECK (security_score >= 0 AND security_score <= 100),
  code_quality_score INTEGER CHECK (code_quality_score >= 0 AND code_quality_score <= 100),
  agent_safety_score INTEGER CHECK (agent_safety_score >= 0 AND agent_safety_score <= 100),
  sandbox_score INTEGER CHECK (sandbox_score >= 0 AND sandbox_score <= 100),

  -- Analysis results (JSONB for flexibility)
  static_analysis JSONB,
  agent_safety_analysis JSONB,
  sandbox_analysis JSONB,

  -- Aggregated findings
  findings JSONB,

  -- Decision
  recommendation TEXT CHECK (recommendation IN ('approve', 'reject', 'manual_review')),
  summary TEXT,

  -- Metadata
  tokens_used INTEGER,
  cost_estimate DECIMAL(10, 6),
  processing_time_ms INTEGER,
  error_message TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  -- Prevent duplicate reviews for same file version
  UNIQUE(app_id, file_hash)
);

-- File analysis cache - stores per-file analysis to enable incremental review
CREATE TABLE IF NOT EXISTS file_analysis_cache (
  id SERIAL PRIMARY KEY,
  file_hash TEXT NOT NULL UNIQUE,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,

  -- Analysis results
  analysis JSONB NOT NULL,
  findings JSONB,

  -- Metadata
  tokens_used INTEGER,
  analyzed_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Review findings - detailed findings from AI analysis
CREATE TABLE IF NOT EXISTS ai_findings (
  id SERIAL PRIMARY KEY,
  ai_review_id INTEGER NOT NULL REFERENCES ai_reviews(id) ON DELETE CASCADE,

  -- Finding details
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low', 'info')),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,

  -- Location
  file_path TEXT,
  line_start INTEGER,
  line_end INTEGER,
  code_snippet TEXT,

  -- AI confidence (0.00 - 1.00)
  confidence DECIMAL(3, 2) CHECK (confidence >= 0 AND confidence <= 1),

  -- Suggested fix
  suggestion TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sandbox execution logs
CREATE TABLE IF NOT EXISTS sandbox_logs (
  id SERIAL PRIMARY KEY,
  ai_review_id INTEGER NOT NULL REFERENCES ai_reviews(id) ON DELETE CASCADE,

  -- Log type
  log_type TEXT NOT NULL CHECK (log_type IN ('network', 'filesystem', 'process', 'resource', 'error')),

  -- Log data
  data JSONB NOT NULL,

  -- Timestamps
  logged_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_reviews_app_id ON ai_reviews(app_id);
CREATE INDEX IF NOT EXISTS idx_ai_reviews_status ON ai_reviews(status);
CREATE INDEX IF NOT EXISTS idx_ai_reviews_file_hash ON ai_reviews(file_hash);
CREATE INDEX IF NOT EXISTS idx_ai_reviews_recommendation ON ai_reviews(recommendation);
CREATE INDEX IF NOT EXISTS idx_ai_reviews_created_at ON ai_reviews(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_file_analysis_cache_hash ON file_analysis_cache(file_hash);
CREATE INDEX IF NOT EXISTS idx_file_analysis_cache_analyzed_at ON file_analysis_cache(analyzed_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_findings_review_id ON ai_findings(ai_review_id);
CREATE INDEX IF NOT EXISTS idx_ai_findings_severity ON ai_findings(severity);
CREATE INDEX IF NOT EXISTS idx_ai_findings_category ON ai_findings(category);

CREATE INDEX IF NOT EXISTS idx_sandbox_logs_review_id ON sandbox_logs(ai_review_id);
CREATE INDEX IF NOT EXISTS idx_sandbox_logs_type ON sandbox_logs(log_type);

-- Enable Row Level Security
ALTER TABLE ai_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_analysis_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sandbox_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Service role has full access (for backend operations)
CREATE POLICY "Service role full access ai_reviews"
  ON ai_reviews FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access file_analysis_cache"
  ON file_analysis_cache FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access ai_findings"
  ON ai_findings FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access sandbox_logs"
  ON sandbox_logs FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Developers can view AI reviews for their own apps
CREATE POLICY "Developers can view own app ai_reviews"
  ON ai_reviews FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM apps
      WHERE apps.id = ai_reviews.app_id
      AND apps.user_id = auth.uid()
    )
  );

-- Admins can view all AI reviews
CREATE POLICY "Admins can view all ai_reviews"
  ON ai_reviews FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Admins can view all findings
CREATE POLICY "Admins can view all ai_findings"
  ON ai_findings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Function to get latest AI review for an app
CREATE OR REPLACE FUNCTION get_latest_ai_review(p_app_id TEXT)
RETURNS ai_reviews AS $$
  SELECT * FROM ai_reviews
  WHERE app_id = p_app_id
  ORDER BY created_at DESC
  LIMIT 1;
$$ LANGUAGE SQL STABLE;

-- Function to get finding counts by severity
CREATE OR REPLACE FUNCTION get_finding_counts(p_review_id INTEGER)
RETURNS TABLE(severity TEXT, count BIGINT) AS $$
  SELECT severity, COUNT(*)
  FROM ai_findings
  WHERE ai_review_id = p_review_id
  GROUP BY severity;
$$ LANGUAGE SQL STABLE;

-- Cleanup old cache entries (older than 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_cache()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM file_analysis_cache
  WHERE analyzed_at < NOW() - INTERVAL '30 days';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE ai_reviews IS 'Stores AI code review results for uploaded apps';
COMMENT ON TABLE file_analysis_cache IS 'Caches per-file analysis results for incremental reviews';
COMMENT ON TABLE ai_findings IS 'Individual security/quality findings from AI analysis';
COMMENT ON TABLE sandbox_logs IS 'Logs from sandbox execution for behavioral analysis';
