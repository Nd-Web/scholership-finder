/**
 * Scholarship Agent Service
 *
 * Main orchestrator for the AI scholarship agent pipeline.
 * Coordinates: search → extract → dedupe → store
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type {
  AgentConfig,
  AgentRun,
  AgentLog,
  AgentProgress,
  AgentRunResult,
  ExtractedScholarship,
  SearchResult,
} from '@/types/agent';
import { DEFAULT_SEARCH_QUERIES } from '@/types/agent';
import { batchSearchScholarships, isTavilyConfigured } from './search.service';
import { extractScholarships, isGroqConfigured } from './extraction.service';
import { filterDuplicates } from './deduplication.service';

// Type alias for Supabase client
type DbClient = SupabaseClient<any>;

// Configuration defaults
const DEFAULT_CONFIG: AgentConfig = {
  search_queries: [...DEFAULT_SEARCH_QUERIES],
  max_results_per_query: 10,
  min_confidence_score: 0.5,
  skip_duplicates: true,
};

/**
 * Create a new agent run record
 */
async function createAgentRun(
  config: AgentConfig,
  supabase: DbClient
): Promise<string> {
  const { data, error } = await supabase
    .from('agent_runs')
    .insert({
      trigger_type: 'manual',
      search_queries: config.search_queries || [],
      status: 'pending',
      total_found: 0,
      total_processed: 0,
      total_added: 0,
      total_skipped: 0,
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(`Failed to create agent run: ${error.message}`);
  }

  return data.id;
}

/**
 * Update agent run status
 */
async function updateAgentRun(
  runId: string,
  updates: Partial<AgentRun>,
  supabase: DbClient
): Promise<void> {
  const { error } = await supabase
    .from('agent_runs')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', runId);

  if (error) {
    console.error(`Failed to update agent run ${runId}:`, error);
  }
}

/**
 * Log an agent action
 */
async function logAgentAction(
  runId: string,
  level: 'debug' | 'info' | 'warn' | 'error',
  message: string,
  context: Record<string, unknown> = {},
  supabase: DbClient
): Promise<void> {
  const { error } = await supabase.from('agent_logs').insert({
    run_id: runId,
    level,
    message,
    context,
  });

  if (error) {
    console.error(`Failed to log agent action:`, error);
  }
}

/**
 * Store a scholarship in the database
 */
async function storeScholarship(
  scholarship: ExtractedScholarship,
  runId: string,
  supabase: DbClient
): Promise<{ success: boolean; id?: string; error?: string }> {
  const { data, error } = await supabase
    .from('scholarships')
    .insert({
      title: scholarship.title,
      provider_name: scholarship.provider_name,
      description: scholarship.description,
      country: scholarship.country,
      field_of_study: scholarship.field_of_study,
      min_gpa: scholarship.min_gpa,
      gpa_scale: scholarship.gpa_scale,
      funding_type: scholarship.funding_type,
      funding_amount: scholarship.funding_amount,
      deadline: scholarship.deadline,
      start_date: scholarship.start_date,
      duration_months: scholarship.duration_months,
      eligibility_criteria: scholarship.eligibility_criteria,
      required_documents: scholarship.required_documents,
      application_url: scholarship.application_url,
      website_url: scholarship.website_url,
      contact_email: scholarship.contact_email,
      source: 'agent',
      source_url: scholarship.source_url,
      agent_run_id: runId,
      is_active: true,
    })
    .select('id')
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, id: data.id };
}

/**
 * Get agent run progress
 */
export async function getAgentProgress(
  runId: string,
  supabase: DbClient
): Promise<AgentProgress | null> {
  const { data, error } = await supabase
    .from('agent_runs')
    .select('*')
    .eq('id', runId)
    .single();

  if (error || !data) {
    return null;
  }

  const elapsed = data.started_at
    ? Math.floor((new Date().getTime() - new Date(data.started_at).getTime()) / 1000)
    : null;

  return {
    run_id: data.id,
    status: data.status,
    current_step: data.metadata?.current_step || 'idle',
    total_found: data.total_found,
    total_processed: data.total_processed,
    total_added: data.total_added,
    total_skipped: data.total_skipped,
    started_at: data.started_at,
    elapsed_seconds: elapsed,
  };
}

/**
 * Run the scholarship agent
 */
export async function runScholarshipAgent(
  config: Partial<AgentConfig> = {},
  triggerType: 'manual' | 'scheduled' = 'manual'
): Promise<AgentRunResult> {
  // Merge with defaults
  const finalConfig: AgentConfig = { ...DEFAULT_CONFIG, ...config };

  // Validate configuration
  if (!isTavilyConfigured()) {
    throw new Error('TAVILY_API_KEY is not configured. Please set the environment variable.');
  }
  if (!isGroqConfigured()) {
    throw new Error('GROQ_API_KEY is not configured. Please set the environment variable.');
  }

  // Create Supabase admin client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase credentials not configured');
  }

  const supabase = createClient<any>(supabaseUrl, supabaseKey);

  // Create run record
  const runId = await createAgentRun(finalConfig, supabase);

  try {
    // Update status to running
    await updateAgentRun(runId, {
      status: 'running',
      started_at: new Date().toISOString(),
      metadata: { current_step: 'searching' },
    }, supabase);

    await logAgentAction(runId, 'info', 'Agent run started', {
      trigger_type: triggerType,
      queries_count: finalConfig.search_queries?.length || 0,
    }, supabase);

    // Step 1: Search for scholarships
    const searchQueries = finalConfig.search_queries || [...DEFAULT_SEARCH_QUERIES];
    await logAgentAction(runId, 'info', 'Starting web search', {
      queries: searchQueries.slice(0, 3),
      total_queries: searchQueries.length,
    }, supabase);

    const searchResults = await batchSearchScholarships(searchQueries, {
      maxResultsPerQuery: finalConfig.max_results_per_query,
      searchDepth: 'basic',
    });

    // Flatten results
    const allResults: SearchResult[] = [];
    for (const results of searchResults.values()) {
      allResults.push(...results);
    }

    await updateAgentRun(runId, {
      total_found: allResults.length,
      metadata: { current_step: 'extracting' },
    }, supabase);

    await logAgentAction(runId, 'info', 'Search complete', {
      total_results: allResults.length,
      unique_urls: new Set(allResults.map(r => r.url)).size,
    }, supabase);

    // Step 2: Extract scholarship data
    await logAgentAction(runId, 'info', 'Starting extraction', {
      results_to_process: allResults.length,
    }, supabase);

    const extractedScholarships = await extractScholarships(allResults);

    // Filter by confidence score
    const filteredScholarships = extractedScholarships.filter(
      (s) => s.confidence_score >= (finalConfig.min_confidence_score || 0.5)
    );

    await updateAgentRun(runId, {
      total_processed: filteredScholarships.length,
      metadata: { current_step: 'deduplicating' },
    }, supabase);

    await logAgentAction(runId, 'info', 'Extraction complete', {
      extracted: extractedScholarships.length,
      filtered: filteredScholarships.length,
    }, supabase);

    // Step 3: Deduplicate
    await logAgentAction(runId, 'info', 'Checking for duplicates', {
      scholarships_to_check: filteredScholarships.length,
    }, supabase);

    const { unique, duplicates } = finalConfig.skip_duplicates
      ? await filterDuplicates(filteredScholarships, supabase)
      : { unique: filteredScholarships, duplicates: [] };

    await updateAgentRun(runId, {
      total_skipped: duplicates.length,
      metadata: { current_step: 'storing' },
    }, supabase);

    await logAgentAction(runId, 'info', 'Deduplication complete', {
      unique: unique.length,
      duplicates: duplicates.length,
    }, supabase);

    // Step 4: Store new scholarships
    let addedCount = 0;
    const errors: string[] = [];

    for (const scholarship of unique) {
      const result = await storeScholarship(scholarship, runId, supabase);

      if (result.success) {
        addedCount++;
        await logAgentAction(runId, 'debug', 'Scholarship stored', {
          title: scholarship.title,
          id: result.id,
        }, supabase);
      } else {
        errors.push(`${scholarship.title}: ${result.error}`);
      }
    }

    // Update final status
    await updateAgentRun(runId, {
      status: 'completed',
      total_added: addedCount,
      completed_at: new Date().toISOString(),
      metadata: { current_step: 'completed' },
    }, supabase);

    await logAgentAction(runId, 'info', 'Agent run completed', {
      total_found: allResults.length,
      total_processed: filteredScholarships.length,
      total_added: addedCount,
      total_skipped: duplicates.length,
      errors: errors.length,
    }, supabase);

    return {
      success: true,
      run_id: runId,
      total_found: allResults.length,
      total_processed: filteredScholarships.length,
      total_added: addedCount,
      total_skipped: duplicates.length,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    await updateAgentRun(runId, {
      status: 'failed',
      error_message: errorMessage,
      completed_at: new Date().toISOString(),
    }, supabase);

    await logAgentAction(runId, 'error', 'Agent run failed', {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    }, supabase);

    return {
      success: false,
      run_id: runId,
      total_found: 0,
      total_processed: 0,
      total_added: 0,
      total_skipped: 0,
      error_message: errorMessage,
    };
  }
}

/**
 * Get agent run history
 */
export async function getAgentRunHistory(
  limit: number = 20,
  supabase: DbClient
): Promise<AgentRun[]> {
  const { data, error } = await supabase
    .from('agent_runs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to get agent run history: ${error.message}`);
  }

  return data || [];
}

/**
 * Get logs for a specific run
 */
export async function getAgentRunLogs(
  runId: string,
  supabase: DbClient
): Promise<AgentLog[]> {
  const { data, error } = await supabase
    .from('agent_logs')
    .select('*')
    .eq('run_id', runId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Failed to get agent logs: ${error.message}`);
  }

  return data || [];
}