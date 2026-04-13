/**
 * API Types
 *
 * Types for API request/response structures.
 * These ensure consistent API contracts across the application.
 */

import type {
  Profile,
  Scholarship,
  Application,
  ScholarshipMatch,
  ApplicationStatus
} from './database';

// ============================================
// API RESPONSE STRUCTURES
// ============================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================
// AUTH API
// ============================================

export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignUpRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
  };
  session: {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
  } | null;
}

// ============================================
// PROFILE API
// ============================================

export interface CreateProfileRequest {
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  nationality?: string;
  countryOfResidence?: string;
  fieldOfStudy?: string;
  currentEducationLevel?: string;
  targetEducationLevel?: string;
  gpa?: number | null;
  gpaScale?: number | null;
  bio?: string;
  skills?: string[];
  extracurriculars?: string[];
  preferredStudyCountries?: string[];
  preferredStudyFields?: string[];
  financialNeed?: string;
}

export interface UpdateProfileRequest extends Partial<CreateProfileRequest> {}

export type ProfileResponse = ApiResponse<Profile>;

// ============================================
// SCHOLARSHIP API
// ============================================

export interface ScholarshipFilters {
  search?: string;
  country?: string;
  fieldOfStudy?: string;
  fundingType?: string;
  minGpa?: number;
  degreeLevel?: string;
  onlyOpen?: boolean;
  deadlineFrom?: string;
  deadlineTo?: string;
  isActive?: boolean;
}

export interface ScholarshipQueryParams extends ScholarshipFilters {
  page?: number;
  limit?: number;
  sortBy?: 'deadline' | 'funding_amount' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}

export type ScholarshipsResponse = ApiResponse<PaginatedResponse<Scholarship>>;
export type ScholarshipResponse = ApiResponse<Scholarship>;

// ============================================
// RECOMMENDATIONS API
// ============================================

export interface RecommendationsRequest {
  userId: string;
  limit?: number;
  minScore?: number;
}

export interface RecommendationsResponse {
  success: boolean;
  data: {
    matches: ScholarshipMatch[];
    totalMatches: number;
    generatedAt: string;
  };
  error?: ApiError;
}

// ============================================
// APPLICATIONS API
// ============================================

export interface CreateApplicationRequest {
  scholarshipId: string;
  notes?: string;
  matchScore?: number;
  matchExplanation?: unknown;
}

export interface UpdateApplicationRequest {
  status?: ApplicationStatus;
  notes?: string;
  documentsSubmitted?: string[];
  submittedAt?: string;
}

export type ApplicationsResponse = ApiResponse<Application[]>;
export type ApplicationResponse = ApiResponse<Application>;

// ============================================
// MATCHING API
// ============================================

export interface MatchingCriteria {
  countryWeight: number;
  fieldOfStudyWeight: number;
  gpaWeight: number;
  fundingTypeWeight: number;
  deadlineWeight: number;
}

export interface MatchingConfig {
  defaultCriteria: MatchingCriteria;
  minScore: number;
  maxResults: number;
}
