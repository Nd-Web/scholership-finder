/**
 * Scholarship Validator
 *
 * Zod schema for scholarship data validation.
 */

import { z } from 'zod';

// Funding type enum
export const fundingTypeSchema = z.enum([
  'full',
  'partial',
  'merit_based',
  'need_based',
  'research_grant',
  'fellowship',
]);

// Scholarship schema
export const scholarshipSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must be less than 200 characters'),

  providerName: z
    .string()
    .min(2, 'Provider name is required')
    .max(200, 'Provider name must be less than 200 characters'),

  description: z
    .string()
    .max(5000, 'Description must be less than 5000 characters')
    .optional(),

  country: z
    .array(z.string().max(100))
    .min(1, 'At least one country must be specified')
    .default([]),

  fieldOfStudy: z
    .array(z.string().max(100))
    .min(1, 'At least one field of study must be specified')
    .default([]),

  minGpa: z
    .number()
    .min(0, 'Minimum GPA must be at least 0')
    .max(4.0, 'Minimum GPA cannot exceed 4.0')
    .optional()
    .nullable(),

  gpaScale: z
    .number()
    .min(1, 'GPA scale must be at least 1')
    .max(5, 'GPA scale cannot exceed 5')
    .default(4.0)
    .optional(),

  fundingType: fundingTypeSchema,

  fundingAmount: z
    .number()
    .min(0, 'Funding amount must be positive')
    .optional()
    .nullable(),

  deadline: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\d{4}-\d{2}-\d{2}$/.test(val),
      'Deadline must be in YYYY-MM-DD format'
    )
    .nullable(),

  startDate: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\d{4}-\d{2}-\d{2}$/.test(val),
      'Start date must be in YYYY-MM-DD format'
    )
    .nullable(),

  durationMonths: z
    .number()
    .min(1, 'Duration must be at least 1 month')
    .max(60, 'Duration cannot exceed 60 months')
    .optional()
    .nullable(),

  eligibilityCriteria: z
    .array(z.string().max(500))
    .max(20, 'Cannot have more than 20 eligibility criteria')
    .default([]),

  requiredDocuments: z
    .array(z.string().max(200))
    .max(15, 'Cannot have more than 15 required documents')
    .default([]),

  applicationUrl: z
    .string()
    .url('Must be a valid URL')
    .optional()
    .nullable(),

  websiteUrl: z
    .string()
    .url('Must be a valid URL')
    .optional()
    .nullable(),

  contactEmail: z
    .string()
    .email('Must be a valid email address')
    .optional()
    .nullable(),

  isActive: z.boolean().default(true),
});

// Type inference
export type ScholarshipInput = z.infer<typeof scholarshipSchema>;

// Update schema (all fields optional)
export const scholarshipUpdateSchema = scholarshipSchema.partial();
export type ScholarshipUpdateInput = z.infer<typeof scholarshipUpdateSchema>;

// Filters schema
export const scholarshipFiltersSchema = z.object({
  country: z.string().optional(),
  fieldOfStudy: z.string().optional(),
  fundingType: fundingTypeSchema.optional(),
  minGpa: z.number().min(0).max(4.0).optional(),
  deadlineFrom: z.string().optional(),
  deadlineTo: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type ScholarshipFilters = z.infer<typeof scholarshipFiltersSchema>;

// Validation helpers
export function validateScholarship(data: unknown): ScholarshipInput {
  return scholarshipSchema.parse(data);
}

export function validateScholarshipFilters(data: unknown): ScholarshipFilters {
  return scholarshipFiltersSchema.parse(data);
}
