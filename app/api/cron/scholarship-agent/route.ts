/**
 * Vercel Cron Job Endpoint
 *
 * Scheduled endpoint to run the scholarship agent automatically.
 * Protected by CRON_SECRET for security.
 */

import { NextRequest, NextResponse } from 'next/server';
import { runScholarshipAgent } from '@/services/agent';
import { DEFAULT_SEARCH_QUERIES } from '@/types/agent';

export async function GET(request: NextRequest) {
  // Verify cron secret for security
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error('CRON_SECRET environment variable not set');
    return NextResponse.json(
      { error: { message: 'Cron not configured' } },
      { status: 500 }
    );
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    console.warn('Unauthorized cron attempt');
    return NextResponse.json(
      { error: { message: 'Unauthorized' } },
      { status: 401 }
    );
  }

  try {
    console.log('[Cron] Starting scheduled scholarship agent run');

    // Run the agent with default queries
    const result = await runScholarshipAgent(
      {
        search_queries: [...DEFAULT_SEARCH_QUERIES],
        max_results_per_query: 10,
        min_confidence_score: 0.5,
        skip_duplicates: true,
      },
      'scheduled'
    );

    if (!result.success) {
      console.error('[Cron] Agent run failed:', result.error_message);
      return NextResponse.json(
        {
          success: false,
          error: result.error_message,
        },
        { status: 500 }
      );
    }

    console.log('[Cron] Agent run completed:', {
      run_id: result.run_id,
      total_found: result.total_found,
      total_added: result.total_added,
      total_skipped: result.total_skipped,
    });

    return NextResponse.json({
      success: true,
      data: {
        run_id: result.run_id,
        total_found: result.total_found,
        total_processed: result.total_processed,
        total_added: result.total_added,
        total_skipped: result.total_skipped,
      },
    });
  } catch (error) {
    console.error('[Cron] Unexpected error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Also support POST for manual testing
export async function POST(request: NextRequest) {
  return GET(request);
}