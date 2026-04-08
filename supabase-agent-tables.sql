-- =====================================================
-- AI SCHOLARSHIP AGENT - DATABASE TABLES
-- =====================================================
-- Run this in your Supabase SQL Editor to create tables
-- for tracking AI agent runs and logs.
-- =====================================================

-- =====================================================
-- AGENT RUN STATUS ENUM
-- =====================================================

CREATE TYPE agent_run_status AS ENUM (
  'pending',
  'running',
  'completed',
  'failed',
  'cancelled'
);

-- =====================================================
-- AGENT RUNS TABLE
-- =====================================================

CREATE TABLE agent_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Run configuration
  trigger_type VARCHAR(20) NOT NULL DEFAULT 'manual', -- 'manual' or 'scheduled'
  search_queries TEXT[] NOT NULL DEFAULT '{}',

  -- Status
  status agent_run_status NOT NULL DEFAULT 'pending',

  -- Progress tracking
  total_found INTEGER DEFAULT 0,
  total_processed INTEGER DEFAULT 0,
  total_added INTEGER DEFAULT 0,
  total_skipped INTEGER DEFAULT 0,

  -- Timing
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,

  -- Error handling
  error_message TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Indexes for agent_runs
CREATE INDEX idx_agent_runs_status ON agent_runs(status);
CREATE INDEX idx_agent_runs_created_at ON agent_runs(created_at DESC);
CREATE INDEX idx_agent_runs_trigger_type ON agent_runs(trigger_type);

-- =====================================================
-- AGENT LOGS TABLE
-- =====================================================

CREATE TABLE agent_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  run_id UUID REFERENCES agent_runs(id) ON DELETE CASCADE NOT NULL,

  -- Log details
  level VARCHAR(10) NOT NULL DEFAULT 'info', -- 'debug', 'info', 'warn', 'error'
  message TEXT NOT NULL,

  -- Context
  context JSONB DEFAULT '{}', -- Additional structured data

  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Indexes for agent_logs
CREATE INDEX idx_agent_logs_run_id ON agent_logs(run_id);
CREATE INDEX idx_agent_logs_level ON agent_logs(level);
CREATE INDEX idx_agent_logs_created_at ON agent_logs(created_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE agent_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_logs ENABLE ROW LEVEL SECURITY;

-- Agent runs policies (admin only - service role has full access)
CREATE POLICY "Service role can manage agent runs"
  ON agent_runs
  FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

CREATE POLICY "Authenticated users can view agent runs"
  ON agent_runs
  FOR SELECT
  TO authenticated
  USING (TRUE);

-- Agent logs policies
CREATE POLICY "Service role can manage agent logs"
  ON agent_logs
  FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

CREATE POLICY "Authenticated users can view agent logs"
  ON agent_logs
  FOR SELECT
  TO authenticated
  USING (TRUE);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update timestamp trigger for agent_runs
CREATE TRIGGER update_agent_runs_updated_at
  BEFORE UPDATE ON agent_runs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SCHOLARSHIP SOURCE TRACKING
-- =====================================================

-- Add source tracking to scholarships table
ALTER TABLE scholarships ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'manual';
ALTER TABLE scholarships ADD COLUMN IF NOT EXISTS source_url VARCHAR(500);
ALTER TABLE scholarships ADD COLUMN IF NOT EXISTS agent_run_id UUID REFERENCES agent_runs(id) ON DELETE SET NULL;

-- Create index for source tracking
CREATE INDEX IF NOT EXISTS idx_scholarships_source ON scholarships(source);
CREATE INDEX IF NOT EXISTS idx_scholarships_agent_run_id ON scholarships(agent_run_id);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify tables exist
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'agent%';

-- Check agent_runs columns
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'agent_runs';

-- Check agent_logs columns
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'agent_logs';