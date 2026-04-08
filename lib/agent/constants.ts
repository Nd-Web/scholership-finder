/**
 * Agent Constants
 *
 * Configuration and constants for the scholarship agent.
 */

/**
 * Default search queries for discovering scholarships
 * These are used when no custom queries are provided
 */
export const DEFAULT_SEARCH_QUERIES = [
  'international scholarship opportunities 2026',
  'fully funded scholarships for international students 2026',
  'masters scholarship programs 2026',
  'PhD scholarship opportunities worldwide 2026',
  'undergraduate scholarships international students 2026',
  'merit based scholarships 2026',
  'need based financial aid international students',
  'STEM scholarships for international students',
  'scholarships for developing countries 2026',
  'research grants and fellowships 2026',
  'women in STEM scholarship programs',
  'engineering scholarship opportunities 2026',
  'business school scholarships international students',
  'medical school scholarships international students',
  'arts and humanities scholarships 2026',
] as const;

/**
 * Tavily API configuration
 */
export const TAVILY_CONFIG = {
  baseUrl: 'https://api.tavily.com',
  searchEndpoint: '/search',
  rateLimitPerMonth: 1000,
  requestTimeout: 30000,
} as const;

/**
 * Groq API configuration
 */
export const GROQ_CONFIG = {
  baseUrl: 'https://api.groq.com/openai/v1',
  model: 'llama-3.3-70b-versatile',
  maxTokens: 2048,
  temperature: 0.1,
  requestTimeout: 60000,
} as const;

/**
 * Agent pipeline configuration
 */
export const AGENT_CONFIG = {
  maxResultsPerQuery: 10,
  minConfidenceScore: 0.5,
  batchSearchConcurrency: 3,
  extractionBatchSize: 5,
  duplicateSimilarityThreshold: 0.85,
} as const;

/**
 * Cron schedule for automated runs (6 AM UTC daily)
 */
export const CRON_SCHEDULE = '0 6 * * *' as const;