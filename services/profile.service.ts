/**
 * Profile Service
 *
 * Business logic for user profile operations.
 * Handles CRUD operations and profile-related business rules.
 */

import type { Profile, CreateProfileRequest, UpdateProfileRequest } from '@/types';
import { validateProfile, validateProfileUpdate, type ProfileInput, type ProfileUpdateInput } from '@/lib/validators';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface ProfileServiceResult {
  success: boolean;
  data?: Profile;
  error?: string;
}

export interface ProfileListResult {
  success: boolean;
  data?: Profile[];
  error?: string;
}

// ============================================
// SERVICE CLASS
// ============================================

export class ProfileService {
  /**
   * Creates a new user profile.
   *
   * @param userId - The user's auth ID
   * @param data - Profile data
   * @returns Created profile or error
   */
  async createProfile(
    userId: string,
    data: CreateProfileRequest
  ): Promise<ProfileServiceResult> {
    try {
      // Validate input
      const validatedData = validateProfile(data);

      // Transform to database format
      const profileData = this.transformToDatabase(userId, validatedData);

      // Insert into database
      const { createClient } = await import('@/lib/supabase/server');
      const client = await createClient();

      const { data: createdProfile, error } = await client
        .from('profiles')
        .insert(profileData)
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
        data: createdProfile,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create profile',
      };
    }
  }

  /**
   * Gets a user's profile by ID.
   */
  async getProfile(userId: string): Promise<ProfileServiceResult> {
    try {
      const { createClient } = await import('@/lib/supabase/server');
      const client = await createClient();

      const { data: profile, error } = await client
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return {
            success: false,
            error: 'Profile not found',
          };
        }
        return {
          success: false,
          error: this.mapDatabaseError(error),
        };
      }

      return {
        success: true,
        data: profile,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch profile',
      };
    }
  }

  /**
   * Updates a user's profile.
   */
  async updateProfile(
    userId: string,
    data: UpdateProfileRequest
  ): Promise<ProfileServiceResult> {
    try {
      // Validate input (partial update)
      const validatedData = validateProfileUpdate(data);

      // Transform to database format
      const updateData = this.transformUpdateToDatabase(validatedData);

      const { createClient } = await import('@/lib/supabase/server');
      const client = await createClient();

      const { data: updatedProfile, error } = await client
        .from('profiles')
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
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
        data: updatedProfile,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update profile',
      };
    }
  }

  /**
   * Checks if a user has a profile.
   */
  async hasProfile(userId: string): Promise<boolean> {
    try {
      const { createClient } = await import('@/lib/supabase/server');
      const client = await createClient();

      const { count, error } = await client
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (error) {
        return false;
      }

      return (count || 0) > 0;
    } catch {
      return false;
    }
  }

  /**
   * Transforms API request to database format.
   */
  private transformToDatabase(userId: string, data: ProfileInput): Partial<Profile> {
    return {
      user_id: userId,
      first_name: data.firstName,
      last_name: data.lastName,
      date_of_birth: data.dateOfBirth,
      nationality: data.nationality,
      country_of_residence: data.countryOfResidence,
      field_of_study: data.fieldOfStudy,
      current_education_level: data.currentEducationLevel as Profile['current_education_level'],
      target_education_level: data.targetEducationLevel as Profile['target_education_level'],
      gpa: data.gpa ?? null,
      gpa_scale: data.gpaScale ?? null,
      bio: data.bio,
      skills: data.skills || [],
      extracurriculars: data.extracurriculars || [],
      preferred_study_countries: data.preferredStudyCountries || [],
      preferred_study_fields: data.preferredStudyFields || [],
      financial_need: data.financialNeed as Profile['financial_need'],
    };
  }

  /**
   * Transforms update request to database format.
   */
  private transformUpdateToDatabase(data: ProfileUpdateInput): Partial<Profile> {
    const updateData: Partial<Profile> = {};

    if (data.firstName !== undefined) updateData.first_name = data.firstName;
    if (data.lastName !== undefined) updateData.last_name = data.lastName;
    if (data.dateOfBirth !== undefined) updateData.date_of_birth = data.dateOfBirth;
    if (data.nationality !== undefined) updateData.nationality = data.nationality;
    if (data.countryOfResidence !== undefined) updateData.country_of_residence = data.countryOfResidence;
    if (data.fieldOfStudy !== undefined) updateData.field_of_study = data.fieldOfStudy;
    if (data.currentEducationLevel !== undefined) {
      updateData.current_education_level = data.currentEducationLevel as Profile['current_education_level'];
    }
    if (data.targetEducationLevel !== undefined) {
      updateData.target_education_level = data.targetEducationLevel as Profile['target_education_level'];
    }
    if (data.gpa !== undefined) updateData.gpa = data.gpa ?? null;
    if (data.gpaScale !== undefined) updateData.gpa_scale = data.gpaScale ?? null;
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.skills !== undefined) updateData.skills = data.skills;
    if (data.extracurriculars !== undefined) updateData.extracurriculars = data.extracurriculars;
    if (data.preferredStudyCountries !== undefined) {
      updateData.preferred_study_countries = data.preferredStudyCountries;
    }
    if (data.preferredStudyFields !== undefined) {
      updateData.preferred_study_fields = data.preferredStudyFields;
    }
    if (data.financialNeed !== undefined) {
      updateData.financial_need = data.financialNeed as Profile['financial_need'];
    }

    return updateData;
  }

  /**
   * Maps Supabase errors to user-friendly messages.
   */
  private mapDatabaseError(error: { code?: string; message?: string }): string {
    const code = error.code;
    const message = error.message;

    // Common Supabase error codes
    const errorMap: Record<string, string> = {
      '23505': 'A profile with this information already exists',
      '23503': 'Invalid user reference',
      '42P01': 'Database table not found',
      'PGRST116': 'Record not found',
    };

    return (code && errorMap[code]) || message || 'A database error occurred';
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

export const profileService = new ProfileService();
