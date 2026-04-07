/**
 * Application Validator
 *
 * Zod schema for application data validation.
 */

import { z } from 'zod';

// Application status enum
export const applicationStatusSchema = z.enum([
  'saved',
  'in_progress',
  'submitted',
  'under_review',
  'interview_scheduled',
  'accepted',
  'rejected',
  'withdrawn',
]);

export type ApplicationStatus = z.infer<typeof applicationStatusSchema>;

// Application schema
export const applicationSchema = z.object({
  scholarshipId: z
    .string()
    .uuid('Invalid scholarship ID format'),

  notes: z
    .string()
    .max(2000, 'Notes must be less than 2000 characters')
    .optional(),

  documentsSubmitted: z
    .array(z.string().max(200))
    .max(15, 'Cannot have more than 15 documents')
    .optional()
    .default([]),

  status: applicationStatusSchema.default('saved'),

  submittedAt: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(val),
      'Submitted at must be a valid ISO date string'
    )
    .nullable()
    .optional(),
});

// Type inference
export type ApplicationInput = z.infer<typeof applicationSchema>;

// Update schema (all fields optional)
export const applicationUpdateSchema = applicationSchema.partial();
export type ApplicationUpdateInput = z.infer<typeof applicationUpdateSchema>;

// Validation helper
export function validateApplication(data: unknown): ApplicationInput {
  return applicationSchema.parse(data);
}

export function validateApplicationUpdate(data: unknown): ApplicationUpdateInput {
  return applicationUpdateSchema.parse(data);
}
