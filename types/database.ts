/**
 * Database Types
 *
 * These types mirror the Supabase database schema.
 * Keep them in sync with your actual database migrations.
 */

// ============================================
// USER & PROFILE TYPES
// ============================================

export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

import type { MatchingConfig } from './api';

export interface Profile {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  date_of_birth: string | null;
  nationality: string | null;
  country_of_residence: string | null;
  field_of_study: string | null;
  current_education_level: EducationLevel | null;
  target_education_level: EducationLevel | null;
  gpa: number | null;
  gpa_scale: number | null;
  bio: string | null;
  skills: string[];
  extracurriculars: string[];
  preferred_study_countries: string[];
  preferred_study_fields: string[];
  financial_need: FinancialNeedLevel | null;
  notification_preferences: {
    email_deadline_reminders: boolean;
    email_updates: boolean;
    email_matches: boolean;
  } | null;
  matching_preferences: MatchingConfig | null;
  created_at: string;
  updated_at: string;
}

export type EducationLevel =
  | 'high_school'
  | 'bachelor'
  | 'master'
  | 'phd'
  | 'certificate'
  | 'diploma';

export type FinancialNeedLevel =
  | 'low'
  | 'medium'
  | 'high';

// ============================================
// SCHOLARSHIP TYPES
// ============================================

export interface Scholarship {
  id: string;
  title: string;
  provider_name: string;
  description: string | null;
  country: string[];
  field_of_study: string[];
  min_gpa: number | null;
  gpa_scale: number | null;
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
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type FundingType =
  | 'full'
  | 'partial'
  | 'merit_based'
  | 'need_based'
  | 'research_grant'
  | 'fellowship';

// ============================================
// APPLICATION TYPES
// ============================================

export interface Application {
  id: string;
  user_id: string;
  scholarship_id: string;
  status: ApplicationStatus;
  submitted_at: string | null;
  notes: string | null;
  documents_submitted: string[];
  created_at: string;
  updated_at: string;
}

export type ApplicationStatus =
  | 'saved'
  | 'in_progress'
  | 'submitted'
  | 'under_review'
  | 'interview_scheduled'
  | 'accepted'
  | 'rejected'
  | 'withdrawn';

// ============================================
// MATCHING & RECOMMENDATION TYPES
// ============================================

export interface ScholarshipMatch {
  scholarship: Scholarship;
  score: number;
  explanation: MatchExplanation;
}

export interface MatchExplanation {
  overall: string;
  factors: MatchFactor[];
}

export interface MatchFactor {
  criterion: string;
  weight: number;
  score: number;
  description: string;
  isPositive: boolean;
}

// ============================================
// AGENT TYPES
// ============================================

export type AgentRunStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type AgentTriggerType = 'manual' | 'scheduled';

export type AgentLogLevel = 'debug' | 'info' | 'warn' | 'error';

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

export interface AgentLog {
  id: string;
  run_id: string;
  level: AgentLogLevel;
  message: string;
  context: Record<string, unknown>;
  created_at: string;
}

// ============================================
// DATABASE RESPONSE TYPES
// ============================================

export interface DatabaseResponse<T> {
  data: T | null;
  error: Error | null;
}

export interface DatabaseListResponse<T> {
  data: T[];
  error: Error | null;
  count: number;
}
