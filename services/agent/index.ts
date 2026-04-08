/**
 * Agent Services Index
 *
 * Central export point for AI agent services.
 */

// Search service
export {
  searchScholarships,
  batchSearchScholarships,
  isTavilyConfigured,
  getRateLimitInfo,
} from './search.service';

// Extraction service
export {
  extractScholarships,
  isGroqConfigured,
} from './extraction.service';

// Deduplication service
export {
  checkForDuplicate,
  checkBatchForDuplicates,
  filterDuplicates,
} from './deduplication.service';

// Main orchestrator
export {
  runScholarshipAgent,
  getAgentProgress,
  getAgentRunHistory,
  getAgentRunLogs,
} from './scholarship-agent.service';