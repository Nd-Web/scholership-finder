/**
 * Tavily Search Service
 *
 * Handles web search for scholarship opportunities using Tavily API.
 * Tavily is optimized for AI agents and returns clean, structured content.
 */

import type { SearchResult } from '@/types/agent';

// Tavily API types
interface TavilySearchRequest {
  query: string;
  search_depth?: 'basic' | 'advanced';
  max_results?: number;
  include_domains?: string[];
  exclude_domains?: string[];
  include_answer?: boolean;
  include_raw_content?: boolean;
}

interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
  published_date?: string;
}

interface TavilyResponse {
  results: TavilySearchResult[];
  answer?: string;
}

// Rate limiting configuration
const TAVILY_RATE_LIMIT = {
  requestsPerMonth: 1000, // Free tier
  buffer: 50, // Safety buffer
};

/**
 * Search for scholarship opportunities using Tavily API
 */
export async function searchScholarships(
  query: string,
  options: {
    maxResults?: number;
    searchDepth?: 'basic' | 'advanced';
  } = {}
): Promise<SearchResult[]> {
  const { maxResults = 10, searchDepth = 'basic' } = options;

  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    throw new Error('TAVILY_API_KEY environment variable is not set');
  }

  const request: TavilySearchRequest = {
    query,
    search_depth: searchDepth,
    max_results: maxResults,
    include_answer: false,
    include_raw_content: false,
  };

  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Tavily API error: ${response.status} - ${error}`);
    }

    const data: TavilyResponse = await response.json();

    return data.results.map((result) => ({
      title: result.title,
      url: result.url,
      content: result.content,
      score: result.score,
      published_date: result.published_date,
    }));
  } catch (error) {
    console.error('Tavily search error:', error);
    throw error;
  }
}

/**
 * Batch search with multiple queries
 */
export async function batchSearchScholarships(
  queries: string[],
  options: {
    maxResultsPerQuery?: number;
    searchDepth?: 'basic' | 'advanced';
    concurrency?: number;
  } = {}
): Promise<Map<string, SearchResult[]>> {
  const { maxResultsPerQuery = 10, searchDepth = 'basic', concurrency = 3 } = options;

  const results = new Map<string, SearchResult[]>();

  // Process queries in batches to avoid rate limiting
  for (let i = 0; i < queries.length; i += concurrency) {
    const batch = queries.slice(i, i + concurrency);

    const batchResults = await Promise.all(
      batch.map(async (query) => {
        try {
          const searchResults = await searchScholarships(query, {
            maxResults: maxResultsPerQuery,
            searchDepth,
          });
          return { query, results: searchResults };
        } catch (error) {
          console.error(`Search failed for query "${query}":`, error);
          return { query, results: [] };
        }
      })
    );

    for (const { query, results: searchResults } of batchResults) {
      results.set(query, searchResults);
    }

    // Small delay between batches to respect rate limits
    if (i + concurrency < queries.length) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  return results;
}

/**
 * Check if Tavily API key is configured
 */
export function isTavilyConfigured(): boolean {
  return !!process.env.TAVILY_API_KEY;
}

/**
 * Get remaining API calls estimate (rough estimate based on usage)
 */
export function getRateLimitInfo(): {
  monthlyLimit: number;
  recommendedBuffer: number;
} {
  return {
    monthlyLimit: TAVILY_RATE_LIMIT.requestsPerMonth,
    recommendedBuffer: TAVILY_RATE_LIMIT.buffer,
  };
}