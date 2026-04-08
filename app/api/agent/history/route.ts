/**
 * Agent History API Endpoint
 *
 * GET: Get the history of agent runs
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { getAgentRunHistory, getAgentRunLogs } from '@/services/agent';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const client = await createClient();
    const { data } = await client.auth.getUser();
    const user = data?.user;

    if (!user) {
      return NextResponse.json(
        { error: { message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    // Create admin client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: { message: 'Database not configured' } },
        { status: 500 }
      );
    }

    const supabase = createSupabaseClient(supabaseUrl, supabaseKey);

    // Get query params
    const { searchParams } = request.nextUrl;
    const limit = parseInt(searchParams.get('limit') || '20');
    const runId = searchParams.get('run_id');

    // If run_id is provided, get logs for that specific run
    if (runId) {
      const logs = await getAgentRunLogs(runId, supabase);
      return NextResponse.json({
        success: true,
        data: { logs },
      });
    }

    // Otherwise, get run history
    const history = await getAgentRunHistory(limit, supabase);

    return NextResponse.json({
      success: true,
      data: { runs: history },
    });
  } catch (error) {
    console.error('Agent history error:', error);
    return NextResponse.json(
      {
        error: {
          message: error instanceof Error ? error.message : 'Failed to get history',
        },
      },
      { status: 500 }
    );
  }
}