/**
 * Scholarship Service
 *
 * Business logic for scholarship operations.
 * Handles CRUD operations, filtering, and search.
 */

import type { Scholarship, ScholarshipFilters, PaginatedResponse } from '@/types';
import { validateScholarship, validateScholarshipFilters } from '@/lib/validators';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface ScholarshipServiceResult {
  success: boolean;
  data?: Scholarship;
  error?: string;
}

export interface ScholarshipListResult {
  success: boolean;
  data?: PaginatedResponse<Scholarship>;
  error?: string;
}

export interface ScholarshipQueryOptions {
  page?: number;
  limit?: number;
  sortBy?: 'deadline' | 'funding_amount' | 'created_at' | 'title';
  sortOrder?: 'asc' | 'desc';
}

// ============================================
// SERVICE CLASS
// ============================================

export class ScholarshipService {
  /**
   * Gets a paginated list of scholarships with optional filters.
   */
  async getScholarships(
    filters: ScholarshipFilters = {},
    options: ScholarshipQueryOptions = {}
  ): Promise<ScholarshipListResult> {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'deadline',
        sortOrder = 'asc',
      } = options;

      const { data: supabase } = await import('@/lib/supabase/server');
      const client = await supabase.createClient();

      // Build query
      let query = client
        .from('scholarships')
        .select('*', { count: 'exact' })
        .eq('is_active', filters.isActive ?? true);

      // Apply search filter (title and description)
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,provider_name.ilike.%${filters.search}%`);
      }

      // Apply filters
      if (filters.country) {
        query = query.contains('country', [filters.country]);
      }

      if (filters.fieldOfStudy) {
        query = query.contains('field_of_study', [filters.fieldOfStudy]);
      }

      if (filters.fundingType) {
        query = query.eq('funding_type', filters.fundingType);
      }

      if (filters.degreeLevel) {
        query = query.ilike('degree_level', `%${filters.degreeLevel}%`);
      }

      if (filters.minGpa !== undefined && filters.minGpa !== null) {
        query = query.lte('min_gpa', filters.minGpa);
      }

      if (filters.onlyOpen) {
        query = query.gte('deadline', new Date().toISOString());
      }

      if (filters.deadlineFrom) {
        query = query.gte('deadline', filters.deadlineFrom);
      }

      if (filters.deadlineTo) {
        query = query.lte('deadline', filters.deadlineTo);
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data: scholarships, error, count } = await query;

      if (error) {
        return {
          success: false,
          error: this.mapDatabaseError(error),
        };
      }

      const total = count || 0;

      return {
        success: true,
        data: {
          items: scholarships || [],
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch scholarships',
      };
    }
  }

  /**
   * Gets a single scholarship by ID.
   */
  async getScholarship(id: string): Promise<ScholarshipServiceResult> {
    try {
      const { data: supabase } = await import('@/lib/supabase/server');
      const client = await supabase.createClient();

      const { data: scholarship, error } = await client
        .from('scholarships')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return {
            success: false,
            error: 'Scholarship not found',
          };
        }
        return {
          success: false,
          error: this.mapDatabaseError(error),
        };
      }

      return {
        success: true,
        data: scholarship,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch scholarship',
      };
    }
  }

  /**
   * Creates a new scholarship (admin only).
   */
  async createScholarship(data: Partial<Scholarship>): Promise<ScholarshipServiceResult> {
    try {
      // Validate input
      const validatedData = validateScholarship(data);

      const { data: supabase } = await import('@/lib/supabase/server');
      const client = await supabase.createClient();

      const { data: createdScholarship, error } = await client
        .from('scholarships')
        .insert({
          ...validatedData,
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
        data: createdScholarship,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create scholarship',
      };
    }
  }

  /**
   * Updates a scholarship (admin only).
   */
  async updateScholarship(
    id: string,
    data: Partial<Scholarship>
  ): Promise<ScholarshipServiceResult> {
    try {
      const { data: supabase } = await import('@/lib/supabase/server');
      const client = await supabase.createClient();

      const { data: updatedScholarship, error } = await client
        .from('scholarships')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
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
        data: updatedScholarship,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update scholarship',
      };
    }
  }

  /**
   * Deletes a scholarship (admin only).
   */
  async deleteScholarship(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: supabase } = await import('@/lib/supabase/server');
      const client = await supabase.createClient();

      const { error } = await client
        .from('scholarships')
        .delete()
        .eq('id', id);

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
        error: error instanceof Error ? error.message : 'Failed to delete scholarship',
      };
    }
  }

  /**
   * Searches scholarships by keyword.
   */
  async searchScholarships(
    query: string,
    options: ScholarshipQueryOptions = {}
  ): Promise<ScholarshipListResult> {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'deadline',
        sortOrder = 'asc',
      } = options;

      const { data: supabase } = await import('@/lib/supabase/server');
      const client = await supabase.createClient();

      // Use full-text search on title and description
      let dbQuery = client
        .from('scholarships')
        .select('*', { count: 'exact' })
        .eq('is_active', true)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .order(sortBy, { ascending: sortOrder === 'asc' });

      const from = (page - 1) * limit;
      const to = from + limit - 1;
      dbQuery = dbQuery.range(from, to);

      const { data: scholarships, error, count } = await dbQuery;

      if (error) {
        return {
          success: false,
          error: this.mapDatabaseError(error),
        };
      }

      const total = count || 0;

      return {
        success: true,
        data: {
          items: scholarships || [],
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to search scholarships',
      };
    }
  }

  /**
   * Gets scholarships by IDs (useful for matching results).
   */
  async getScholarshipsByIds(ids: string[]): Promise<Scholarship[]> {
    try {
      const { data: supabase } = await import('@/lib/supabase/server');
      const client = await supabase.createClient();

      const { data: scholarships, error } = await client
        .from('scholarships')
        .select('*')
        .in('id', ids)
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching scholarships by IDs:', error);
        return [];
      }

      return scholarships || [];
    } catch (error) {
      console.error('Error fetching scholarships by IDs:', error);
      return [];
    }
  }

  /**
   * Maps Supabase errors to user-friendly messages.
   */
  private mapDatabaseError(error: Record<string, unknown>): string {
    const code = error.code as string;
    const message = error.message as string;

    const errorMap: Record<string, string> = {
      '23505': 'A scholarship with this title already exists',
      '23503': 'Invalid reference',
      '42P01': 'Database table not found',
      'PGRST116': 'Record not found',
    };

    return errorMap[code] || message || 'A database error occurred';
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

export const scholarshipService = new ScholarshipService();
