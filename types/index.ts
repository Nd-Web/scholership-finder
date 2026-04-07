/**
 * Types Index
 *
 * Central export point for all type definitions.
 * Import from this file to keep imports clean throughout the app.
 */

// Database types
export type {
  User,
  Profile,
  Scholarship,
  Application,
  ScholarshipMatch,
  MatchExplanation,
  MatchFactor,
  DatabaseResponse,
  DatabaseListResponse,
  EducationLevel,
  FinancialNeedLevel,
  FundingType,
  ApplicationStatus,
} from './database';

// API types
export type {
  ApiResponse,
  ApiError,
  PaginatedResponse,
  SignInRequest,
  SignUpRequest,
  AuthResponse,
  CreateProfileRequest,
  UpdateProfileRequest,
  ProfileResponse,
  ScholarshipFilters,
  ScholarshipQueryParams,
  ScholarshipsResponse,
  ScholarshipResponse,
  RecommendationsRequest,
  RecommendationsResponse,
  CreateApplicationRequest,
  UpdateApplicationRequest,
  ApplicationsResponse,
  ApplicationResponse,
  MatchingCriteria,
  MatchingConfig,
} from './api';
