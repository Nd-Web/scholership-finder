/**
 * Profile Validator
 *
 * Zod schema for profile data validation.
 * Ensures data integrity before database operations.
 */

import { z } from 'zod';

// Education level enum validation
export const educationLevelSchema = z.enum([
  'high_school',
  'bachelor',
  'master',
  'phd',
  'certificate',
  'diploma',
]);

// Financial need level enum validation
export const financialNeedSchema = z.enum(['low', 'medium', 'high']);

// Main profile schema
export const profileSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'First name contains invalid characters'),

  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Last name contains invalid characters'),

  dateOfBirth: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\d{4}-\d{2}-\d{2}$/.test(val),
      'Date of birth must be in YYYY-MM-DD format'
    ),

  nationality: z
    .string()
    .max(100, 'Nationality must be less than 100 characters')
    .optional(),

  countryOfResidence: z
    .string()
    .max(100, 'Country of residence must be less than 100 characters')
    .optional(),

  fieldOfStudy: z
    .string()
    .max(200, 'Field of study must be less than 200 characters')
    .optional(),

  currentEducationLevel: educationLevelSchema.optional(),

  targetEducationLevel: educationLevelSchema.optional(),

  gpa: z
    .number()
    .min(0, 'GPA must be at least 0')
    .max(4.0, 'GPA cannot exceed 4.0 on a 4.0 scale')
    .optional()
    .nullable(),

  gpaScale: z
    .number()
    .min(1, 'GPA scale must be at least 1')
    .max(5, 'GPA scale cannot exceed 5')
    .default(4.0)
    .optional(),

  bio: z
    .string()
    .max(2000, 'Bio must be less than 2000 characters')
    .optional(),

  skills: z
    .array(z.string().max(100))
    .max(20, 'Cannot have more than 20 skills')
    .optional()
    .default([]),

  extracurriculars: z
    .array(z.string().max(200))
    .max(10, 'Cannot have more than 10 extracurriculars')
    .optional()
    .default([]),

  preferredStudyCountries: z
    .array(z.string().max(100))
    .max(10, 'Cannot have more than 10 preferred countries')
    .optional()
    .default([]),

  preferredStudyFields: z
    .array(z.string().max(100))
    .max(10, 'Cannot have more than 10 preferred fields')
    .optional()
    .default([]),

  financialNeed: financialNeedSchema.optional(),
});

// Type inference
export type ProfileInput = z.infer<typeof profileSchema>;

// Update schema (all fields optional)
export const profileUpdateSchema = profileSchema.partial();
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

// Validation helper
export function validateProfile(data: unknown): ProfileInput {
  return profileSchema.parse(data);
}

export function validateProfileUpdate(data: unknown): ProfileUpdateInput {
  return profileUpdateSchema.parse(data);
}
