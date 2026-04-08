/**
 * Agent Types
 *
 * Types for the AI scholarship agent system.
 */

// ============================================
// AGENT RUN TYPES
// ============================================

export type AgentRunStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type AgentTriggerType = 'manual' | 'scheduled';

export interface AgentRun {
  id: string;
  trigger_type: AgentTriggerType;
  search_queries: string[];
  status: AgentRunStatus;
  total_found: number;
  total_processed: number;
  total_added: number;
  total_skipped: number;
  started_at: string | null;
  completed_at: string | null;
  error_message: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface AgentRunCreate {
  trigger_type: AgentTriggerType;
  search_queries: string[];
}

// ============================================
// AGENT LOG TYPES
// ============================================

export type AgentLogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface AgentLog {
  id: string;
  run_id: string;
  level: AgentLogLevel;
  message: string;
  context: Record<string, unknown>;
  created_at: string;
}

export interface AgentLogCreate {
  run_id: string;
  level: AgentLogLevel;
  message: string;
  context?: Record<string, unknown>;
}

// ============================================
// SEARCH & EXTRACTION TYPES
// ============================================

export interface SearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
  published_date?: string;
}

export interface ExtractedScholarship {
  title: string;
  provider_name: string;
  description: string | null;
  country: string[];
  field_of_study: string[];
  min_gpa: number | null;
  gpa_scale: number;
  funding_type: FundingType;
  funding_amount: number | null;
  deadline: string | null;
  start_date: string | null;
  duration_months: number | null;
  eligibility_criteria: string[];
  required_documents: string[];
  application_url: string | null;
  website_url: string | null;
  contact_email: string | null;
  source_url: string;
  confidence_score: number; // 0-1, quality of extraction
}

export type FundingType =
  | 'full'
  | 'partial'
  | 'merit_based'
  | 'need_based'
  | 'research_grant'
  | 'fellowship';

// ============================================
// DEDUPLICATION TYPES
// ============================================

export interface DuplicateCheckResult {
  is_duplicate: boolean;
  existing_scholarship_id?: string;
  match_reason?: 'url' | 'title_provider' | 'application_url';
  similarity_score?: number;
}

// ============================================
// AGENT PIPELINE TYPES
// ============================================

export interface AgentConfig {
  search_queries?: string[];
  max_results_per_query?: number;
  min_confidence_score?: number;
  skip_duplicates?: boolean;
}

export interface AgentProgress {
  run_id: string;
  status: AgentRunStatus;
  current_step: string;
  total_found: number;
  total_processed: number;
  total_added: number;
  total_skipped: number;
  started_at: string | null;
  elapsed_seconds: number | null;
}

export interface AgentRunResult {
  success: boolean;
  run_id: string;
  total_found: number;
  total_processed: number;
  total_added: number;
  total_skipped: number;
  error_message?: string;
}

// ============================================
// DEFAULT SEARCH QUERIES
// ============================================

export const DEFAULT_SEARCH_QUERIES = [
  'international scholarship opportunities 2026',
  'fully funded scholarships for international students',
  'masters scholarship programs 2026',
  'PhD scholarship opportunities worldwide',
  'undergraduate scholarships international students',
  'merit based scholarships 2026',
  'need based financial aid international students',
  'STEM scholarships for international students',
  'scholarships for developing countries 2026',
  'research grants and fellowships 2026',
  'women in STEM scholarship programs',
  'engineering scholarship opportunities 2026',
  'business school scholarships international',
  'medical school scholarships international students',
  'arts and humanities scholarships 2026'
] as const;

export type DefaultSearchQuery = typeof DEFAULT_SEARCH_QUERIES[number];