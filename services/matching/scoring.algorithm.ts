/**
 * Scholarship Matching Algorithm
 *
 * Core scoring engine that calculates match scores between user profiles
 * and scholarships based on weighted criteria.
 *
 * SCORING SYSTEM:
 * - Each criterion has a weight (importance)
 * - Each criterion returns a score (0-100)
 * - Final score = sum of (weight * score) / sum of weights
 */

import type { Profile, Scholarship, ScholarshipMatch, MatchExplanation, MatchFactor } from '@/types';

// ============================================
// CONFIGURATION
// ============================================

/**
 * Default weights for each matching criterion.
 * Higher weight = more important in final score.
 * Total: 100 (for easy percentage calculation)
 */
export const DEFAULT_WEIGHTS = {
  country: 25,        // Eligibility by country
  fieldOfStudy: 25,   // Field of study match
  gpa: 20,            // GPA requirement
  fundingType: 15,    // Funding type preference
  deadline: 10,       // Deadline feasibility
  educationLevel: 5,  // Education level match
} as const;

export type MatchingWeights = typeof DEFAULT_WEIGHTS;

/**
 * Minimum score threshold for recommendations.
 * Scholarships below this score won't be recommended.
 */
export const MIN_RECOMMENDATION_SCORE = 40;

/**
 * Maximum number of recommendations to return.
 */
export const MAX_RECOMMENDATIONS = 20;

// ============================================
// SCORING FUNCTIONS
// ============================================

/**
 * Scores country eligibility (0-100).
 *
 * Logic:
 * - 100: User's country is explicitly listed OR scholarship is "Worldwide"
 * - 70: User's region is covered
 * - 0: Not eligible
 */
function scoreCountry(profile: Profile, scholarship: Scholarship): number {
  const userCountry = profile.country_of_residence || profile.nationality;

  if (!userCountry) {
    return 50; // Neutral if no country specified
  }

  // Check if scholarship countries include user's country
  const scholarshipCountries = scholarship.country || [];

  // Worldwide scholarships
  if (scholarshipCountries.some(c => c.toLowerCase() === 'worldwide' || c.toLowerCase() === 'all countries')) {
    return 100;
  }

  // Direct match
  if (scholarshipCountries.some(c => c.toLowerCase() === userCountry.toLowerCase())) {
    return 100;
  }

  // Regional match (e.g., "Europe" matches European countries)
  const regions = getCountryRegion(userCountry);
  for (const region of regions) {
    if (scholarshipCountries.some(c => c.toLowerCase() === region.toLowerCase())) {
      return 80;
    }
  }

  return 0;
}

/**
 * Scores field of study match (0-100).
 *
 * Logic:
 * - 100: Exact match in preferred fields
 * - 80: Related field match
 * - 50: General field category match
 * - 0: No match
 */
function scoreFieldOfStudy(profile: Profile, scholarship: Scholarship): number {
  const userField = profile.field_of_study?.toLowerCase();
  const preferredFields = (profile.preferred_study_fields || []).map(f => f.toLowerCase());
  const scholarshipFields = (scholarship.field_of_study || []).map(f => f.toLowerCase());

  if (!userField && preferredFields.length === 0) {
    return 50; // Neutral if no field specified
  }

  // Exact match in scholarship fields
  if (userField && scholarshipFields.includes(userField)) {
    return 100;
  }

  // Match in preferred fields
  if (preferredFields.some(field => scholarshipFields.includes(field))) {
    return 100;
  }

  // Related field match (using field mappings)
  if (userField) {
    const relatedFields = getRelatedFields(userField);
    if (scholarshipFields.some(f => relatedFields.includes(f))) {
      return 80;
    }
  }

  // Check preferred fields for related matches
  for (const prefField of preferredFields) {
    const relatedFields = getRelatedFields(prefField);
    if (scholarshipFields.some(f => relatedFields.includes(f))) {
      return 70;
    }
  }

  // Broad category match (e.g., "engineering" matches any engineering field)
  const broadCategories = getBroadCategories(userField || preferredFields[0]);
  if (scholarshipFields.some(f => broadCategories.some(cat => f.includes(cat) || cat.includes(f)))) {
    return 50;
  }

  return 20; // Minimal score for any application
}

/**
 * Scores GPA compatibility (0-100).
 *
 * Logic:
 * - 100: GPA significantly exceeds requirement
 * - 80: GPA meets requirement comfortably
 * - 60: GPA just meets requirement
 * - 0: GPA below requirement
 */
function scoreGpa(profile: Profile, scholarship: Scholarship): number {
  const userGpa = profile.gpa;
  const userGpaScale = profile.gpa_scale || 4.0;
  const minGpa = scholarship.min_gpa;
  const scholarshipGpaScale = scholarship.gpa_scale || 4.0;

  // Normalize GPA to 4.0 scale for comparison
  const normalizedUserGpa = userGpa ? (userGpa / userGpaScale) * 4.0 : null;

  if (!minGpa || !normalizedUserGpa) {
    return 70; // Neutral if no GPA requirement or user GPA not specified
  }

  const gpaDifference = normalizedUserGpa - minGpa;

  if (gpaDifference >= 0.5) {
    return 100; // Significantly exceeds
  }

  if (gpaDifference >= 0.2) {
    return 90; // Comfortably exceeds
  }

  if (gpaDifference >= 0) {
    return 75; // Just meets
  }

  if (gpaDifference >= -0.3) {
    return 40; // Slightly below but might still be considered
  }

  return 0; // Below requirement
}

/**
 * Scores funding type match (0-100).
 *
 * Logic:
 * - Based on user's financial need and preferences
 */
function scoreFundingType(profile: Profile, scholarship: Scholarship): number {
  const userNeed = profile.financial_need;
  const fundingType = scholarship.funding_type;

  // Full funding is always valuable
  if (fundingType === 'full') {
    if (userNeed === 'high') return 100;
    if (userNeed === 'medium') return 90;
    if (userNeed === 'low') return 70;
    return 85; // Default high score
  }

  // Need-based funding for users with financial need
  if (fundingType === 'need_based') {
    if (userNeed === 'high') return 95;
    if (userNeed === 'medium') return 85;
    if (userNeed === 'low') return 50;
    return 70;
  }

  // Merit-based for high achievers
  if (fundingType === 'merit_based') {
    const gpa = profile.gpa || 0;
    const gpaScale = profile.gpa_scale || 4.0;
    const normalizedGpa = gpa / gpaScale;

    if (normalizedGpa >= 0.9) return 95;
    if (normalizedGpa >= 0.8) return 85;
    if (normalizedGpa >= 0.7) return 70;
    return 50;
  }

  // Partial funding
  if (fundingType === 'partial') {
    if (userNeed === 'high') return 60;
    if (userNeed === 'medium') return 75;
    return 80;
  }

  // Research grants and fellowships (typically for grad students)
  if (fundingType === 'research_grant' || fundingType === 'fellowship') {
    const targetLevel = profile.target_education_level;
    if (targetLevel === 'master' || targetLevel === 'phd') {
      return 85;
    }
    return 40; // Less relevant for undergrads
  }

  return 50; // Default neutral score
}

/**
 * Scores deadline feasibility (0-100).
 *
 * Logic:
 * - 100: Deadline is 2-8 weeks away (ideal preparation time)
 * - 80: Deadline is 1-2 weeks or 2-3 months away
 * - 60: Deadline is very soon (< 1 week) or far (> 3 months)
 * - 0: Deadline has passed
 */
function scoreDeadline(profile: Profile, scholarship: Scholarship): number {
  const deadline = scholarship.deadline;

  if (!deadline) {
    return 60; // Neutral if no deadline (rolling admission)
  }

  const today = new Date();
  const deadlineDate = new Date(deadline);
  const daysUntilDeadline = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntilDeadline < 0) {
    return 0; // Deadline passed
  }

  if (daysUntilDeadline <= 7) {
    return 40; // Very soon - might not have enough time
  }

  if (daysUntilDeadline <= 14) {
    return 70; // Soon but manageable
  }

  if (daysUntilDeadline <= 60) {
    return 100; // Ideal preparation window
  }

  if (daysUntilDeadline <= 90) {
    return 80; // Good amount of time
  }

  return 60; // Far future - might change plans
}

/**
 * Scores education level match (0-100).
 */
function scoreEducationLevel(profile: Profile, scholarship: Scholarship): number {
  const targetLevel = profile.target_education_level;
  const currentLevel = profile.current_education_level;

  if (!targetLevel && !currentLevel) {
    return 50; // Neutral
  }

  // Check if scholarship description mentions education level
  const description = (scholarship.description || '').toLowerCase();
  const eligibilityCriteria = (scholarship.eligibility_criteria || []).join(' ').toLowerCase();
  const title = (scholarship.title || '').toLowerCase();

  const allText = `${description} ${eligibilityCriteria} ${title}`;

  // Check for level keywords
  const levelKeywords: Record<string, string[]> = {
    high_school: ['high school', 'highschool', 'secondary school', 'undergraduate'],
    bachelor: ['bachelor', 'undergraduate', 'bsc', 'ba', 'bachelor\'s'],
    master: ['master', 'masters', 'msc', 'ma', 'mba', 'graduate'],
    phd: ['phd', 'doctorate', 'doctoral', 'ph.d'],
    certificate: ['certificate', 'certification', 'diploma'],
    diploma: ['diploma', 'certificate'],
  };

  if (targetLevel && levelKeywords[targetLevel]) {
    const keywords = levelKeywords[targetLevel];
    if (keywords.some(keyword => allText.includes(keyword))) {
      return 100;
    }
  }

  // Default: assume some compatibility
  return 60;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Gets regions for a country (for regional matching).
 */
function getCountryRegion(country: string): string[] {
  const regions: Record<string, string[]> = {
    // Europe
    'germany': ['europe', 'eu', 'schengen'],
    'france': ['europe', 'eu', 'schengen'],
    'uk': ['europe', 'commonwealth'],
    'netherlands': ['europe', 'eu', 'schengen'],
    // North America
    'usa': ['north america', 'north america'],
    'canada': ['north america', 'commonwealth'],
    // Asia
    'china': ['asia', 'east asia'],
    'japan': ['asia', 'east asia'],
    'singapore': ['asia', 'southeast asia'],
    // Oceania
    'australia': ['oceania', 'commonwealth'],
    'new zealand': ['oceania', 'commonwealth'],
  };

  return regions[country.toLowerCase()] || [];
}

/**
 * Gets related fields for a given field of study.
 */
function getRelatedFields(field: string): string[] {
  const fieldMappings: Record<string, string[]> = {
    'computer science': ['software engineering', 'data science', 'artificial intelligence', 'cybersecurity', 'information technology'],
    'engineering': ['mechanical engineering', 'electrical engineering', 'civil engineering', 'chemical engineering'],
    'business': ['business administration', 'management', 'finance', 'accounting', 'marketing', 'economics'],
    'medicine': ['health sciences', 'nursing', 'public health', 'biomedical sciences', 'pharmacy'],
    'law': ['legal studies', 'international law', 'criminal justice', 'political science'],
    'education': ['teaching', 'educational leadership', 'curriculum development'],
    'arts': ['fine arts', 'design', 'graphic design', 'visual arts', 'creative arts'],
    'sciences': ['physics', 'chemistry', 'biology', 'mathematics', 'environmental science'],
  };

  // Find matching category
  for (const [category, related] of Object.entries(fieldMappings)) {
    if (field.includes(category) || related.includes(field)) {
      return [category, ...related];
    }
  }

  return [field];
}

/**
 * Gets broad categories for a field.
 */
function getBroadCategories(field: string): string[] {
  const categories: Record<string, string[]> = {
    'engineering': ['engineering', 'technology'],
    'science': ['science', 'research'],
    'business': ['business', 'commerce', 'management'],
    'arts': ['arts', 'humanities', 'creative'],
    'health': ['health', 'medical', 'clinical'],
  };

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(k => field.includes(k))) {
      return [category, ...keywords];
    }
  }

  return [field];
}

/**
 * Generates an explanation for a match score.
 */
function generateExplanation(
  profile: Profile,
  scholarship: Scholarship,
  factors: MatchFactor[]
): MatchExplanation {
  const positiveFactors = factors.filter(f => f.isPositive);
  const negativeFactors = factors.filter(f => !f.isPositive);

  // Generate overall summary
  let overall = '';

  if (positiveFactors.length >= 4) {
    overall = `Strong match! You meet most criteria for this ${scholarship.funding_type} scholarship.`;
  } else if (positiveFactors.length >= 2) {
    overall = `Good potential match. You meet several key criteria for this opportunity.`;
  } else {
    overall = `Limited match. Consider if this scholarship aligns with your profile.`;
  }

  // Add specific highlights
  const highlights: string[] = [];

  const countryFactor = factors.find(f => f.criterion === 'Country Eligibility');
  if (countryFactor && countryFactor.score >= 80) {
    highlights.push('You are eligible based on your location');
  }

  const fieldFactor = factors.find(f => f.criterion === 'Field of Study');
  if (fieldFactor && fieldFactor.score >= 80) {
    highlights.push('Your field of study matches well');
  }

  const gpaFactor = factors.find(f => f.criterion === 'GPA Requirement');
  if (gpaFactor && gpaFactor.score >= 75) {
    highlights.push('Your GPA meets the requirements');
  }

  if (highlights.length > 0) {
    overall += ` ${highlights.join('; ')}.`;
  }

  return {
    overall,
    factors,
  };
}

// ============================================
// MAIN SCORING FUNCTION
// ============================================

/**
 * Calculates the match score between a profile and scholarship.
 *
 * @param profile - User profile
 * @param scholarship - Scholarship to evaluate
 * @param weights - Optional custom weights (uses DEFAULT_WEIGHTS if not provided)
 * @returns Object with score (0-100) and detailed explanation
 */
export function calculateMatchScore(
  profile: Profile,
  scholarship: Scholarship,
  weights: Partial<MatchingWeights> = {}
): { score: number; explanation: MatchExplanation } {
  const finalWeights = { ...DEFAULT_WEIGHTS, ...weights };

  // Calculate individual scores
  const countryScore = scoreCountry(profile, scholarship);
  const fieldScore = scoreFieldOfStudy(profile, scholarship);
  const gpaScore = scoreGpa(profile, scholarship);
  const fundingScore = scoreFundingType(profile, scholarship);
  const deadlineScore = scoreDeadline(profile, scholarship);
  const educationLevelScore = scoreEducationLevel(profile, scholarship);

  // Build factors array
  const factors: MatchFactor[] = [
    {
      criterion: 'Country Eligibility',
      weight: finalWeights.country,
      score: countryScore,
      description: getScoreDescription(countryScore),
      isPositive: countryScore >= 70,
    },
    {
      criterion: 'Field of Study',
      weight: finalWeights.fieldOfStudy,
      score: fieldScore,
      description: getScoreDescription(fieldScore),
      isPositive: fieldScore >= 70,
    },
    {
      criterion: 'GPA Requirement',
      weight: finalWeights.gpa,
      score: gpaScore,
      description: getScoreDescription(gpaScore),
      isPositive: gpaScore >= 60,
    },
    {
      criterion: 'Funding Type',
      weight: finalWeights.fundingType,
      score: fundingScore,
      description: getScoreDescription(fundingScore),
      isPositive: fundingScore >= 60,
    },
    {
      criterion: 'Deadline',
      weight: finalWeights.deadline,
      score: deadlineScore,
      description: getScoreDescription(deadlineScore),
      isPositive: deadlineScore >= 60,
    },
    {
      criterion: 'Education Level',
      weight: finalWeights.educationLevel,
      score: educationLevelScore,
      description: getScoreDescription(educationLevelScore),
      isPositive: educationLevelScore >= 60,
    },
  ];

  // Calculate weighted average
  const totalWeight = Object.values(finalWeights).reduce((sum, w) => sum + w, 0);
  const weightedSum = factors.reduce((sum, factor) => sum + factor.score * factor.weight, 0);
  const finalScore = Math.round(weightedSum / totalWeight);

  // Generate explanation
  const explanation = generateExplanation(profile, scholarship, factors);

  return {
    score: finalScore,
    explanation,
  };
}

/**
 * Matches a profile against multiple scholarships.
 *
 * @param profile - User profile
 * @param scholarships - Array of scholarships to evaluate
 * @param options - Optional configuration (minScore, limit, weights)
 * @returns Array of ScholarshipMatch sorted by score (descending)
 */
export function matchScholarships(
  profile: Profile,
  scholarships: Scholarship[],
  options: {
    minScore?: number;
    limit?: number;
    weights?: Partial<MatchingWeights>;
  } = {}
): ScholarshipMatch[] {
  const {
    minScore = MIN_RECOMMENDATION_SCORE,
    limit = MAX_RECOMMENDATIONS,
    weights = {},
  } = options;

  const matches: ScholarshipMatch[] = [];

  for (const scholarship of scholarships) {
    // Skip inactive scholarships
    if (scholarship.is_active === false) {
      continue;
    }

    // Skip if deadline has passed
    if (scholarship.deadline && new Date(scholarship.deadline) < new Date()) {
      continue;
    }

    const { score, explanation } = calculateMatchScore(profile, scholarship, weights);

    if (score >= minScore) {
      matches.push({
        scholarship,
        score,
        explanation,
      });
    }
  }

  // Sort by score (descending) and limit results
  return matches
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Gets a human-readable description for a score.
 */
function getScoreDescription(score: number): string {
  if (score >= 90) return 'Excellent match';
  if (score >= 70) return 'Good match';
  if (score >= 50) return 'Moderate match';
  if (score >= 30) return 'Weak match';
  return 'Poor match';
}
