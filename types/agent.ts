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
  // Undergraduate - primary focus
  'undergraduate scholarships 2026 international students',
  'fully funded undergraduate scholarships worldwide 2026',
  'bachelor degree scholarships for international students 2026',
  'first year undergraduate scholarships no GPA required',
  'undergraduate scholarships for high school graduates 2026',
  'need based undergraduate scholarships international',
  'merit scholarships for undergraduate students 2026',
  'undergraduate STEM scholarships international students',
  'undergraduate business scholarships 2026',
  'undergraduate engineering scholarships worldwide',
  'undergraduate arts and humanities scholarships 2026',
  'undergraduate medical and nursing scholarships 2026',
  'undergraduate scholarships for African students 2026',
  'undergraduate scholarships for Asian students 2026',
  'undergraduate scholarships for Latin American students 2026',
  'undergraduate scholarships for European students 2026',
  'undergraduate scholarships for Middle East students 2026',
  'undergraduate scholarships for women 2026',
  'undergraduate scholarships for minorities 2026',
  'undergraduate scholarships for refugees 2026',
  'undergraduate scholarships for disabled students 2026',
  'undergraduate scholarships for low income families 2026',

  // Bootcamps, institutions, non-traditional
  'coding bootcamp scholarships 2026',
  'tech bootcamp scholarships for underrepresented groups 2026',
  'free coding bootcamps with scholarships 2026',
  'data science bootcamp scholarships 2026',
  'cybersecurity bootcamp scholarships 2026',
  'UX design bootcamp scholarships 2026',
  'online bootcamp scholarships and income share agreements',
  'vocational training scholarships 2026',
  'trade school scholarships international',
  'certificate program scholarships 2026',
  'diploma program scholarships international students',
  'online course scholarships Coursera edX Udacity 2026',
  'MOOC scholarships and financial aid 2026',
  'nonprofit institute scholarships for young professionals 2026',
  'community college scholarships international students',
  'polytechnic scholarships 2026',

  // Country and school coverage
  'USA university scholarships for international undergraduates 2026',
  'UK university undergraduate scholarships 2026',
  'Canada undergraduate scholarships international 2026',
  'Australia undergraduate scholarships international 2026',
  'Germany undergraduate scholarships DAAD 2026',
  'Netherlands undergraduate scholarships Holland 2026',
  'France undergraduate scholarships Eiffel 2026',
  'China undergraduate scholarships CSC 2026',
  'Japan undergraduate scholarships MEXT 2026',
  'South Korea undergraduate scholarships KGSP 2026',
  'Turkey undergraduate scholarships Turkiye Burslari 2026',
  'Ivy League undergraduate financial aid international students',
  'top universities undergraduate scholarships worldwide 2026',
  'all universities undergraduate scholarship list 2026',

  // Graduate (keep coverage)
  'masters scholarship programs 2026',
  'PhD scholarship opportunities worldwide 2026',
  'research grants and fellowships 2026',
  'fully funded scholarships for international students 2026',

  // Aggregators and directories
  'scholarship database undergraduate 2026',
  'scholarship aggregator site undergraduate bootcamp',
  'list of open scholarships 2026'
] as const;

export type DefaultSearchQuery = typeof DEFAULT_SEARCH_QUERIES[number];