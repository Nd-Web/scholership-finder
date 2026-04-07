/**
 * Matching Service
 *
 * Export the scholarship matching algorithm.
 */

export {
  calculateMatchScore,
  matchScholarships,
  DEFAULT_WEIGHTS,
  MIN_RECOMMENDATION_SCORE,
  MAX_RECOMMENDATIONS,
  type MatchingWeights,
} from './scoring.algorithm';
