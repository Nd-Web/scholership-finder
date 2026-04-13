/**
 * Deduplication Service
 *
 * Checks for duplicate scholarships before inserting into the database.
 * Uses multiple matching strategies: URL, title+provider similarity, application URL.
 */

import type { ExtractedScholarship, DuplicateCheckResult } from '@/types/agent';
import type { SupabaseClient } from '@supabase/supabase-js';

// Similarity threshold for fuzzy matching (0-1)
const TITLE_SIMILARITY_THRESHOLD = 0.82;

/**
 * Check if a scholarship already exists in the database
 */
export async function checkForDuplicate(
  scholarship: ExtractedScholarship,
  supabase: SupabaseClient<any>
): Promise<DuplicateCheckResult> {
  // Check by source URL first (exact match)
  if (scholarship.source_url) {
    const { data: existingByUrl } = await supabase
      .from('scholarships')
      .select('id, title, source_url')
      .eq('source_url', scholarship.source_url)
      .maybeSingle();

    if (existingByUrl) {
      return {
        is_duplicate: true,
        existing_scholarship_id: existingByUrl.id,
        match_reason: 'url',
        similarity_score: 1.0,
      };
    }
  }

  // Check by application URL
  if (scholarship.application_url) {
    const { data: existingByAppUrl } = await supabase
      .from('scholarships')
      .select('id, title, application_url')
      .eq('application_url', scholarship.application_url)
      .maybeSingle();

    if (existingByAppUrl) {
      return {
        is_duplicate: true,
        existing_scholarship_id: existingByAppUrl.id,
        match_reason: 'application_url',
        similarity_score: 1.0,
      };
    }
  }

  // Check by title and provider similarity. Query by BOTH a title fragment and
  // the provider name so reordered titles ("2026 Chevening" vs "Chevening 2026")
  // still surface candidates.
  const normalizedTitle = normalizeString(scholarship.title);
  const titleTokens = normalizedTitle.split(' ').filter((t) => t.length > 3);
  const titleKey = titleTokens.slice(0, 3).join(' ') || scholarship.title.slice(0, 30);

  const { data: existingScholarships } = await supabase
    .from('scholarships')
    .select('id, title, provider_name')
    .or(
      `title.ilike.%${titleKey}%,provider_name.ilike.%${scholarship.provider_name.slice(0, 40)}%`
    );

  if (existingScholarships && existingScholarships.length > 0) {
    for (const existing of existingScholarships) {
      const similarity = calculateSimilarity(
        normalizeString(`${scholarship.title} ${scholarship.provider_name}`),
        normalizeString(`${existing.title} ${existing.provider_name}`)
      );

      if (similarity >= TITLE_SIMILARITY_THRESHOLD) {
        return {
          is_duplicate: true,
          existing_scholarship_id: existing.id,
          match_reason: 'title_provider',
          similarity_score: similarity,
        };
      }
    }
  }

  return {
    is_duplicate: false,
  };
}

/**
 * Check multiple scholarships for duplicates in batch
 */
export async function checkBatchForDuplicates(
  scholarships: ExtractedScholarship[],
  supabase: SupabaseClient<any>
): Promise<Map<string, DuplicateCheckResult>> {
  const results = new Map<string, DuplicateCheckResult>();

  // Process in parallel for efficiency
  await Promise.all(
    scholarships.map(async (scholarship) => {
      const result = await checkForDuplicate(scholarship, supabase);
      results.set(scholarship.source_url, result);
    })
  );

  return results;
}

/**
 * Calculate string similarity using Levenshtein distance
 */
function calculateSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 1.0;
  if (str1.length === 0 || str2.length === 0) return 0;

  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2[i - 1] === str1[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  const maxLen = Math.max(str1.length, str2.length);
  return 1 - matrix[str2.length][str1.length] / maxLen;
}

/**
 * Normalize string for comparison
 */
function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Filter out duplicates from a list of scholarships
 */
export async function filterDuplicates(
  scholarships: ExtractedScholarship[],
  supabase: SupabaseClient<any>
): Promise<{
  unique: ExtractedScholarship[];
  duplicates: Array<{ scholarship: ExtractedScholarship; reason: string }>;
}> {
  const unique: ExtractedScholarship[] = [];
  const duplicates: Array<{ scholarship: ExtractedScholarship; reason: string }> = [];

  // Intra-batch dedup: the same scholarship can appear under different source
  // URLs (blogs, aggregators). Collapse them before hitting the DB.
  const seenKeys: Array<{ key: string; scholarship: ExtractedScholarship }> = [];

  for (const scholarship of scholarships) {
    const key = normalizeString(`${scholarship.title} ${scholarship.provider_name}`);

    const intraBatchMatch = seenKeys.find(
      (s) => calculateSimilarity(s.key, key) >= TITLE_SIMILARITY_THRESHOLD
    );
    if (intraBatchMatch) {
      duplicates.push({
        scholarship,
        reason: 'Matched another scholarship in the same batch',
      });
      continue;
    }

    const result = await checkForDuplicate(scholarship, supabase);

    if (result.is_duplicate) {
      duplicates.push({
        scholarship,
        reason: `Matched by ${result.match_reason} (score: ${result.similarity_score?.toFixed(2)})`,
      });
    } else {
      seenKeys.push({ key, scholarship });
      unique.push(scholarship);
    }
  }

  return { unique, duplicates };
}