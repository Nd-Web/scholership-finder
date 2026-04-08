/**
 * Agent Status API Endpoint
 *
 * GET: Get the progress/status of a running agent
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAgentProgress } from '@/services/agent';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const runId = searchParams.get('run_id');

    if (!runId) {
      return NextResponse.json(
        { error: { message: 'run_id parameter is required' } },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: { message: 'Database not configured' } },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get progress
    const progress = await getAgentProgress(runId, supabase);

    if (!progress) {
      return NextResponse.json(
        { error: { message: 'Run not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: progress,
    });
  } catch (error) {
    console.error('Agent status error:', error);
    return NextResponse.json(
      {
        error: {
          message: error instanceof Error ? error.message : 'Failed to get status',
        },
      },
      { status: 500 }
    );
  }
}