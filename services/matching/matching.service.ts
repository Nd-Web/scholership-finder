/**
 * Matching Service
 *
 * Business logic for scholarship matching operations.
 * Handles user-specific matching configurations, batch operations,
 * and match persistence.
 */

import type { Profile, Scholarship, ScholarshipMatch, MatchingCriteria, MatchingConfig } from '@/types';
import {
  calculateMatchScore,
  matchScholarships,
  DEFAULT_WEIGHTS,
  MIN_RECOMMENDATION_SCORE,
  MAX_RECOMMENDATIONS,
  type MatchingWeights,
} from './scoring.algorithm';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface MatchingServiceResult {
  success: boolean;
  data?: {
    matches: ScholarshipMatch[];
    totalEvaluated: number;
    totalMatched: number;
    generatedAt: string;
  };
  config?: MatchingConfig;
  error?: string;
}

export interface MatchingConfigResult {
  success: boolean;
  data?: MatchingConfig;
  error?: string;
}

// ============================================
// DEFAULT CONFIGURATION
// ============================================

export const DEFAULT_MATCHING_CONFIG: MatchingConfig = {
  defaultCriteria: {
    countryWeight: DEFAULT_WEIGHTS.country,
    fieldOfStudyWeight: DEFAULT_WEIGHTS.fieldOfStudy,
    gpaWeight: DEFAULT_WEIGHTS.gpa,
    fundingTypeWeight: DEFAULT_WEIGHTS.fundingType,
    deadlineWeight: DEFAULT_WEIGHTS.deadline,
  },
  minScore: MIN_RECOMMENDATION_SCORE,
  maxResults: MAX_RECOMMENDATIONS,
};

// ============================================
// SERVICE CLASS
// ============================================

export class MatchingService {
  /**
   * Gets the matching configuration for a user.
   * For now, returns default config. In the future, this can
   * fetch user-specific preferences from the database.
   */
  async getConfig(userId: string): Promise<MatchingConfigResult> {
    try {
      const { createClient } = await import('@/lib/supabase/server');
      const client = await createClient();

      // Try to fetch user-specific config from profiles table
      const { data: profile, error } = await client
        .from('profiles')
        .select('matching_preferences')
        .eq('user_id', userId)
        .single();

      if (error || !profile?.matching_preferences) {
        // Return default config if no user config exists
        return {
          success: true,
          data: DEFAULT_MATCHING_CONFIG,
        };
      }

      // Merge with defaults to ensure all fields exist
      const userConfig = profile.matching_preferences as Partial<MatchingConfig>;
      const mergedConfig: MatchingConfig = {
        defaultCriteria: {
          ...DEFAULT_MATCHING_CONFIG.defaultCriteria,
          ...userConfig.defaultCriteria,
        },
        minScore: userConfig.minScore ?? DEFAULT_MATCHING_CONFIG.minScore,
        maxResults: userConfig.maxResults ?? DEFAULT_MATCHING_CONFIG.maxResults,
      };

      return {
        success: true,
        data: mergedConfig,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch matching config',
      };
    }
  }

  /**
   * Updates the matching configuration for a user.
   */
  async updateConfig(
    userId: string,
    config: Partial<MatchingConfig>
  ): Promise<MatchingConfigResult> {
    try {
      const { createClient } = await import('@/lib/supabase/server');
      const client = await createClient();

      // Validate weights sum to 100
      if (config.defaultCriteria) {
        const weights = Object.values(config.defaultCriteria);
        const total = weights.reduce((sum, w) => sum + w, 0);

        if (total !== 100 && total !== 0) {
          return {
            success: false,
            error: 'Criteria weights must sum to 100',
          };
        }
      }

      // Validate minScore is between 0 and 100
      if (config.minScore !== undefined && (config.minScore < 0 || config.minScore > 100)) {
        return {
          success: false,
          error: 'Minimum score must be between 0 and 100',
        };
      }

      // Validate maxResults is positive
      if (config.maxResults !== undefined && config.maxResults <= 0) {
        return {
          success: false,
          error: 'Maximum results must be a positive number',
        };
      }

      // Get current config to merge with updates
      const currentConfigResult = await this.getConfig(userId);
      const currentConfig = currentConfigResult.data || DEFAULT_MATCHING_CONFIG;

      // Merge updates with current config
      const mergedConfig: MatchingConfig = {
        defaultCriteria: {
          ...currentConfig.defaultCriteria,
          ...config.defaultCriteria,
        },
        minScore: config.minScore ?? currentConfig.minScore,
        maxResults: config.maxResults ?? currentConfig.maxResults,
      };

      // Update in database
      const { error } = await client
        .from('profiles')
        .update({ matching_preferences: mergedConfig })
        .eq('user_id', userId);

      if (error) {
        return {
          success: false,
          error: 'Failed to save matching preferences',
        };
      }

      return {
        success: true,
        data: mergedConfig,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update matching config',
      };
    }
  }

  /**
   * Matches a user profile against scholarships in the database.
   */
  async matchUserScholarships(
    userId: string,
    profile: Profile,
    options?: {
      limit?: number;
      minScore?: number;
      weights?: Partial<MatchingWeights>;
    }
  ): Promise<MatchingServiceResult> {
    try {
      const { createClient } = await import('@/lib/supabase/server');
      const client = await createClient();

      // Get user's matching config
      const configResult = await this.getConfig(userId);
      const config = configResult.data || DEFAULT_MATCHING_CONFIG;

      // Use provided options or fall back to config
      const minScore = options?.minScore ?? config.minScore;
      const limit = options?.limit ?? config.maxResults;
      const weights = options?.weights
        ? {
            country: options.weights.country ?? config.defaultCriteria.countryWeight,
            fieldOfStudy: options.weights.fieldOfStudy ?? config.defaultCriteria.fieldOfStudyWeight,
            gpa: options.weights.gpa ?? config.defaultCriteria.gpaWeight,
            fundingType: options.weights.fundingType ?? config.defaultCriteria.fundingTypeWeight,
            deadline: options.weights.deadline ?? config.defaultCriteria.deadlineWeight,
            educationLevel: DEFAULT_WEIGHTS.educationLevel,
          }
        : undefined;

      // Fetch all active scholarships
      const { data: scholarships, error } = await client
        .from('scholarships')
        .select('*')
        .eq('is_active', true);

      if (error) {
        return {
          success: false,
          error: 'Failed to fetch scholarships',
        };
      }

      const totalEvaluated = scholarships?.length || 0;

      // Run matching algorithm
      const matches = matchScholarships(profile, scholarships || [], {
        minScore,
        limit,
        weights,
      });

      return {
        success: true,
        data: {
          matches,
          totalEvaluated,
          totalMatched: matches.length,
          generatedAt: new Date().toISOString(),
        },
        config,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to match scholarships',
      };
    }
  }

  /**
   * Gets a single match score with detailed explanation.
   */
  async getMatchExplanation(
    profile: Profile,
    scholarshipId: string,
    weights?: Partial<MatchingWeights>
  ): Promise<{ success: boolean; data?: { score: number; explanation: any }; error?: string }> {
    try {
      const { createClient } = await import('@/lib/supabase/server');
      const client = await createClient();

      // Fetch the scholarship
      const { data: scholarship, error } = await client
        .from('scholarships')
        .select('*')
        .eq('id', scholarshipId)
        .single();

      if (error || !scholarship) {
        return {
          success: false,
          error: 'Scholarship not found',
        };
      }

      // Calculate match score
      const { score, explanation } = calculateMatchScore(profile, scholarship, weights);

      return {
        success: true,
        data: { score, explanation },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to calculate match',
      };
    }
  }

  /**
   * Resets a user's matching configuration to defaults.
   */
  async resetConfig(userId: string): Promise<MatchingConfigResult> {
    try {
      const { createClient } = await import('@/lib/supabase/server');
      const client = await createClient();

      // Clear the matching_preferences field
      const { error } = await client
        .from('profiles')
        .update({ matching_preferences: null })
        .eq('user_id', userId);

      if (error) {
        return {
          success: false,
          error: 'Failed to reset matching preferences',
        };
      }

      return {
        success: true,
        data: DEFAULT_MATCHING_CONFIG,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to reset matching config',
      };
    }
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

export const matchingService = new MatchingService();
