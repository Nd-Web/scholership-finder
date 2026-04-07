/**
 * Application Service
 *
 * Business logic for scholarship application tracking.
 * Handles CRUD operations and status management.
 */

import type { Application, ApplicationStatus, CreateApplicationRequest, UpdateApplicationRequest } from '@/types';
import { validateApplication, validateApplicationUpdate } from '@/lib/validators';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface ApplicationServiceResult {
  success: boolean;
  data?: Application;
  error?: string;
}

export interface ApplicationListResult {
  success: boolean;
  data?: Application[];
  error?: string;
}

// ============================================
// SERVICE CLASS
// ============================================

export class ApplicationService {
  /**
   * Creates a new application tracking entry.
   */
  async createApplication(
    userId: string,
    data: CreateApplicationRequest
  ): Promise<ApplicationServiceResult> {
    try {
      // Validate input
      const validatedData = validateApplication({
        ...data,
        status: 'saved',
      });

      const { createClient } = await import('@/lib/supabase/server');
      const client = await createClient();

      // Check if application already exists
      const { data: existing } = await client
        .from('applications')
        .select('id')
        .eq('user_id', userId)
        .eq('scholarship_id', data.scholarshipId)
        .single();

      if (existing) {
        return {
          success: false,
          error: 'You are already tracking this scholarship',
        };
      }

      const { data: application, error } = await client
        .from('applications')
        .insert({
          user_id: userId,
          scholarship_id: data.scholarshipId,
          status: validatedData.status,
          notes: validatedData.notes,
          documents_submitted: validatedData.documentsSubmitted,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        return {
          success: false,
          error: this.mapDatabaseError(error),
        };
      }

      return {
        success: true,
        data: application,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create application',
      };
    }
  }

  /**
   * Gets all applications for a user.
   */
  async getUserApplications(userId: string): Promise<ApplicationListResult> {
    try {
      const { createClient } = await import('@/lib/supabase/server');
      const client = await createClient();

      const { data: applications, error } = await client
        .from('applications')
        .select(`
          *,
          scholarship:scholarships (
            id,
            title,
            provider_name,
            deadline,
            funding_type
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        return {
          success: false,
          error: this.mapDatabaseError(error),
        };
      }

      return {
        success: true,
        data: applications || [],
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch applications',
      };
    }
  }

  /**
   * Gets a single application by ID.
   */
  async getApplication(userId: string, applicationId: string): Promise<ApplicationServiceResult> {
    try {
      const { createClient } = await import('@/lib/supabase/server');
      const client = await createClient();

      const { data: application, error } = await client
        .from('applications')
        .select(`
          *,
          scholarship:scholarships (
            id,
            title,
            provider_name,
            deadline,
            funding_type,
            application_url
          )
        `)
        .eq('id', applicationId)
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return {
            success: false,
            error: 'Application not found',
          };
        }
        return {
          success: false,
          error: this.mapDatabaseError(error),
        };
      }

      return {
        success: true,
        data: application,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch application',
      };
    }
  }

  /**
   * Updates an application's status or details.
   */
  async updateApplication(
    userId: string,
    applicationId: string,
    data: UpdateApplicationRequest
  ): Promise<ApplicationServiceResult> {
    try {
      // Validate input
      const validatedData = validateApplicationUpdate(data);

      const { createClient } = await import('@/lib/supabase/server');
      const client = await createClient();

      // Verify ownership
      const { data: existing } = await client
        .from('applications')
        .select('id')
        .eq('id', applicationId)
        .eq('user_id', userId)
        .single();

      if (!existing) {
        return {
          success: false,
          error: 'Application not found or you do not have permission',
        };
      }

      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      if (validatedData.status !== undefined) {
        updateData.status = validatedData.status;
      }

      if (validatedData.notes !== undefined) {
        updateData.notes = validatedData.notes;
      }

      if (validatedData.documentsSubmitted !== undefined) {
        updateData.documents_submitted = validatedData.documentsSubmitted;
      }

      if (validatedData.submittedAt !== undefined) {
        updateData.submitted_at = validatedData.submittedAt;
      }

      const { data: updatedApplication, error } = await client
        .from('applications')
        .update(updateData)
        .eq('id', applicationId)
        .select()
        .single();

      if (error) {
        return {
          success: false,
          error: this.mapDatabaseError(error),
        };
      }

      return {
        success: true,
        data: updatedApplication,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update application',
      };
    }
  }

  /**
   * Updates application status (convenience method).
   */
  async updateStatus(
    userId: string,
    applicationId: string,
    status: ApplicationStatus
  ): Promise<ApplicationServiceResult> {
    return this.updateApplication(userId, applicationId, { status });
  }

  /**
   * Deletes an application tracking entry.
   */
  async deleteApplication(userId: string, applicationId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { createClient } = await import('@/lib/supabase/server');
      const client = await createClient();

      // Verify ownership
      const { data: existing } = await client
        .from('applications')
        .select('id')
        .eq('id', applicationId)
        .eq('user_id', userId)
        .single();

      if (!existing) {
        return {
          success: false,
          error: 'Application not found or you do not have permission',
        };
      }

      const { error } = await client
        .from('applications')
        .delete()
        .eq('id', applicationId);

      if (error) {
        return {
          success: false,
          error: this.mapDatabaseError(error),
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete application',
      };
    }
  }

  /**
   * Gets application statistics for a user.
   */
  async getApplicationStats(userId: string): Promise<{
    success: boolean;
    data?: {
      total: number;
      byStatus: Record<ApplicationStatus, number>;
      submitted: number;
      accepted: number;
      rejected: number;
    };
    error?: string;
  }> {
    try {
      const { createClient } = await import('@/lib/supabase/server');
      const client = await createClient();

      const { data: applications, error } = await client
        .from('applications')
        .select('status')
        .eq('user_id', userId);

      if (error) {
        return {
          success: false,
          error: this.mapDatabaseError(error),
        };
      }

      const stats = {
        total: applications?.length || 0,
        byStatus: {} as Record<ApplicationStatus, number>,
        submitted: 0,
        accepted: 0,
        rejected: 0,
      };

      // Initialize all statuses to 0
      const allStatuses: ApplicationStatus[] = [
        'saved',
        'in_progress',
        'submitted',
        'under_review',
        'interview_scheduled',
        'accepted',
        'rejected',
        'withdrawn',
      ];

      for (const status of allStatuses) {
        stats.byStatus[status] = 0;
      }

      // Count applications by status
      for (const app of applications || []) {
        const status = app.status as ApplicationStatus;
        stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;

        if (status === 'submitted' || status === 'under_review' || status === 'interview_scheduled') {
          stats.submitted++;
        }

        if (status === 'accepted') {
          stats.accepted++;
        }

        if (status === 'rejected') {
          stats.rejected++;
        }
      }

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch statistics',
      };
    }
  }

  /**
   * Maps Supabase errors to user-friendly messages.
   */
  private mapDatabaseError(error: Record<string, unknown>): string {
    const code = error.code as string;
    const message = error.message as string;

    const errorMap: Record<string, string> = {
      '23505': 'You are already tracking this scholarship',
      '23503': 'Invalid scholarship reference',
      '42P01': 'Database table not found',
      'PGRST116': 'Record not found',
    };

    return errorMap[code] || message || 'A database error occurred';
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

export const applicationService = new ApplicationService();
