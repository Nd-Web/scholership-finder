/**
 * Groq Extraction Service
 *
 * Uses Groq LLM to extract structured scholarship data from web content.
 * Provides high-quality, validated extraction with confidence scores.
 */

import type { ExtractedScholarship, SearchResult } from '@/types/agent';
import type { FundingType } from '@/types/database';

// Extraction prompt for Groq
const EXTRACTION_PROMPT = `You are a scholarship data extraction expert. Extract scholarship information from the provided web content.

IMPORTANT RULES:
1. Only extract information that is explicitly stated in the content
2. If information is not found or unclear, use null
3. For arrays (country, field_of_study), extract all mentioned values
4. Dates should be in YYYY-MM-DD format when possible
5. For funding_amount, extract the numeric value (e.g., 50000, not "$50,000")
6. Be conservative - if unsure, set confidence_score lower
7. Extract opportunities from ALL education providers: universities, colleges, community colleges, polytechnics, coding/tech bootcamps, vocational/trade schools, online learning platforms (MOOCs), nonprofits, and training institutes.
8. Undergraduate-level opportunities are a priority. Do NOT skip scholarships that omit GPA — min_gpa should simply be null when unspecified.
9. In eligibility_criteria, record the target provider type (e.g., "bootcamp", "community college", "online program") and the education level ("undergraduate", "bachelor", "certificate", "diploma") when stated or strongly implied.

OUTPUT SCHEMA (JSON):
{
  "scholarships": [
    {
      "title": "string - scholarship name",
      "provider_name": "string - organization offering the scholarship",
      "description": "string or null - brief description (max 500 chars)",
      "country": ["string - countries where scholarship can be used"],
      "field_of_study": ["string - eligible fields of study"],
      "min_gpa": number or null,
      "gpa_scale": number (default 4.0),
      "funding_type": "full" | "partial" | "merit_based" | "need_based" | "research_grant" | "fellowship",
      "funding_amount": number or null - amount in USD,
      "deadline": "YYYY-MM-DD" or null,
      "start_date": "YYYY-MM-DD" or null,
      "duration_months": number or null,
      "eligibility_criteria": ["string - eligibility requirements"],
      "required_documents": ["string - documents needed to apply"],
      "application_url": "string or null - direct application link",
      "website_url": "string or null - main scholarship website",
      "contact_email": "string or null",
      "source_url": "string - the URL this came from",
      "confidence_score": number between 0 and 1 - quality of extraction
    }
  ]
}

WEB CONTENT:
Title: {{title}}
URL: {{url}}
Content: {{content}}

Extract all scholarships mentioned in this content. Return valid JSON only.`;

/**
 * Extract scholarship data from search results using Groq
 */
export async function extractScholarships(
  searchResults: SearchResult[]
): Promise<ExtractedScholarship[]> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY environment variable is not set');
  }

  const allScholarships: ExtractedScholarship[] = [];

  // Process search results in batches to avoid rate limits
  const batchSize = 5;
  for (let i = 0; i < searchResults.length; i += batchSize) {
    const batch = searchResults.slice(i, i + batchSize);

    const batchResults = await Promise.all(
      batch.map((result) => extractFromSingleResult(result, apiKey))
    );

    for (const scholarships of batchResults) {
      allScholarships.push(...scholarships);
    }

    // Small delay between batches
    if (i + batchSize < searchResults.length) {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }

  // Filter by confidence score
  return allScholarships.filter((s) => s.confidence_score >= 0.5);
}

/**
 * Extract scholarships from a single search result
 */
async function extractFromSingleResult(
  result: SearchResult,
  apiKey: string
): Promise<ExtractedScholarship[]> {
  try {
    const prompt = EXTRACTION_PROMPT
      .replace('{{title}}', result.title)
      .replace('{{url}}', result.url)
      .replace('{{content}}', result.content.slice(0, 8000)); // Limit content length

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 2048,
        messages: [
          { role: 'system', content: 'You are a scholarship data extraction assistant. Return only valid JSON.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.1, // Low temperature for consistent extraction
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`Groq extraction error for ${result.url}:`, error);
      return [];
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return [];
    }

    // Parse the JSON response
    const parsed = parseExtractionResponse(content, result.url);
    return parsed;
  } catch (error) {
    console.error(`Failed to extract from ${result.url}:`, error);
    return [];
  }
}

/**
 * Parse and validate extraction response
 */
function parseExtractionResponse(
  content: string,
  sourceUrl: string
): ExtractedScholarship[] {
  try {
    // Extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return [];
    }

    const parsed = JSON.parse(jsonMatch[0]);

    if (!parsed.scholarships || !Array.isArray(parsed.scholarships)) {
      return [];
    }

    return parsed.scholarships
      .filter((s: any) => s.title && s.provider_name) // Must have title and provider
      .map((s: any) => ({
        title: String(s.title).slice(0, 200),
        provider_name: String(s.provider_name).slice(0, 200),
        description: s.description ? String(s.description).slice(0, 500) : null,
        country: Array.isArray(s.country) ? s.country.map(String) : [],
        field_of_study: Array.isArray(s.field_of_study) ? s.field_of_study.map(String) : [],
        min_gpa: typeof s.min_gpa === 'number' ? s.min_gpa : null,
        gpa_scale: typeof s.gpa_scale === 'number' ? s.gpa_scale : 4.0,
        funding_type: validateFundingType(s.funding_type),
        funding_amount: typeof s.funding_amount === 'number' ? s.funding_amount : null,
        deadline: parseDate(s.deadline),
        start_date: parseDate(s.start_date),
        duration_months: typeof s.duration_months === 'number' ? s.duration_months : null,
        eligibility_criteria: Array.isArray(s.eligibility_criteria)
          ? s.eligibility_criteria.map(String)
          : [],
        required_documents: Array.isArray(s.required_documents)
          ? s.required_documents.map(String)
          : [],
        application_url: s.application_url ? String(s.application_url).slice(0, 500) : null,
        website_url: s.website_url ? String(s.website_url).slice(0, 500) : sourceUrl,
        contact_email: s.contact_email ? String(s.contact_email) : null,
        source_url: sourceUrl,
        confidence_score: typeof s.confidence_score === 'number'
          ? Math.max(0, Math.min(1, s.confidence_score))
          : 0.5,
      }));
  } catch (error) {
    console.error('Failed to parse extraction response:', error);
    return [];
  }
}

/**
 * Validate and normalize funding type
 */
function validateFundingType(type: string): FundingType {
  const validTypes: FundingType[] = [
    'full',
    'partial',
    'merit_based',
    'need_based',
    'research_grant',
    'fellowship',
  ];

  if (typeof type !== 'string') {
    return 'partial';
  }

  const normalized = type.toLowerCase().replace(/[-\s]/g, '_');
  return validTypes.includes(normalized as FundingType) ? (normalized as FundingType) : 'partial';
}

/**
 * Parse date string to ISO format
 */
function parseDate(dateStr: string | null): string | null {
  if (!dateStr || dateStr === 'null') {
    return null;
  }

  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return null;
    }
    return date.toISOString().split('T')[0];
  } catch {
    return null;
  }
}

/**
 * Check if Groq API key is configured
 */
export function isGroqConfigured(): boolean {
  return !!process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== '';
}