/**
 * Validators Module
 *
 * Central export for all Zod validators.
 * Import validators from this file throughout the application.
 */

export {
  profileSchema,
  profileUpdateSchema,
  educationLevelSchema,
  financialNeedSchema,
  validateProfile,
  validateProfileUpdate,
  type ProfileInput,
  type ProfileUpdateInput,
} from './profile.validator';

export {
  scholarshipSchema,
  scholarshipUpdateSchema,
  scholarshipFiltersSchema,
  fundingTypeSchema,
  validateScholarship,
  validateScholarshipFilters,
  type ScholarshipInput,
  type ScholarshipUpdateInput,
  type ScholarshipFilters,
} from './scholarship.validator';

// Application validator
export {
  applicationSchema,
  applicationUpdateSchema,
  applicationStatusSchema,
  validateApplication,
  validateApplicationUpdate,
  type ApplicationInput,
  type ApplicationUpdateInput,
  type ApplicationStatus,
} from './application.validator';
