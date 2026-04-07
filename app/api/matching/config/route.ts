import { NextRequest, NextResponse } from 'next/server';
import { matchingService } from '@/services';

/**
 * GET /api/matching/config
 * Get the current matching configuration for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    const result = await matchingService.getConfig(user.id);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { code: 'FETCH_FAILED', message: result.error } },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error('Matching config GET error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch matching config' } },
      { status: 500 }
    );
  }
}

/**
 * POST /api/matching/config
 * Update the matching configuration for the authenticated user
 */
export async function POST(request: NextRequest) {
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { config } = body;

    if (!config) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', message: 'Configuration is required' } },
        { status: 400 }
      );
    }

    const result = await matchingService.updateConfig(user.id, config);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { code: 'UPDATE_FAILED', message: result.error } },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error('Matching config POST error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update matching config' } },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/matching/config
 * Reset the matching configuration to defaults
 */
export async function DELETE(request: NextRequest) {
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    const result = await matchingService.resetConfig(user.id);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { code: 'RESET_FAILED', message: result.error } },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error('Matching config DELETE error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to reset matching config' } },
      { status: 500 }
    );
  }
}
