-- Persist the match score + explanation on each application so users can see
-- *why* a scholarship was recommended, even weeks later when the scoring
-- weights or their profile have changed.
--
-- Run this in the Supabase SQL editor.

ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS match_score SMALLINT,
  ADD COLUMN IF NOT EXISTS match_explanation JSONB;

-- Optional: index for sorting a user's applications by best match
CREATE INDEX IF NOT EXISTS idx_applications_user_match_score
  ON applications(user_id, match_score DESC NULLS LAST);
