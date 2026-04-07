/**
 * Services Module
 *
 * Central export for all business logic services.
 * Import services from this file throughout the application.
 */

// Matching service (core algorithm)
export {
  calculateMatchScore,
  matchScholarships,
  DEFAULT_WEIGHTS,
  MIN_RECOMMENDATION_SCORE,
  MAX_RECOMMENDATIONS,
  type MatchingWeights,
} from './matching';

// Matching service class
export {
  MatchingService,
  matchingService,
  DEFAULT_MATCHING_CONFIG,
  type MatchingServiceResult,
  type MatchingConfigResult,
} from './matching/matching.service';

// Profile service
export {
  ProfileService,
  profileService,
  type ProfileServiceResult,
  type ProfileListResult,
} from './profile.service';

// Scholarship service
export {
  ScholarshipService,
  scholarshipService,
  type ScholarshipServiceResult,
  type ScholarshipListResult,
  type ScholarshipQueryOptions,
} from './scholarship.service';

// Application service
export {
  ApplicationService,
  applicationService,
  type ApplicationServiceResult,
  type ApplicationListResult,
} from './application.service';
