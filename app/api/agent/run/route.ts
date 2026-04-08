/**
 * Agent Run API Endpoint
 *
 * POST: Trigger a manual agent run
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { runScholarshipAgent } from '@/services/agent';
import type { AgentConfig } from '@/types/agent';

export async function POST(request: NextRequest) {
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

    // Parse optional config from request body
    let config: Partial<AgentConfig> = {};
    try {
      const body = await request.json();
      config = body.config || {};
    } catch {
      // Use default config if no body provided
    }

    // Start the agent run (async - returns immediately)
    const result = await runScholarshipAgent(config, 'manual');

    if (!result.success) {
      return NextResponse.json(
        { error: { message: result.error_message || 'Agent run failed' } },
        { status: 500 }
      );
    }

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
    console.error('Agent run error:', error);
    return NextResponse.json(
      {
        error: {
          message: error instanceof Error ? error.message : 'Failed to run agent',
        },
      },
      { status: 500 }
    );
  }
}