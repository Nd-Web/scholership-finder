import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/auth/session
 * Validate the current session and return user info
 */
export async function GET(request: NextRequest) {
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
          data: null
        },
        { status: 401 }
      );
    }

    // Get the session to check token expiration
    const { data: { session } } = await supabase.auth.getSession();

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          created_at: user.created_at,
          updated_at: user.updated_at,
          last_sign_in_at: user.last_sign_in_at,
        },
        session: session && session.expires_at ? {
          expiresAt: new Date(session.expires_at * 1000).toISOString(),
          expires_in: session.expires_in,
          token_type: session.token_type,
        } : null,
      },
    });
  } catch (error) {
    console.error('Session validation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to validate session' },
        data: null
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/auth/session/refresh
 * Refresh the current session token
 */
export async function POST(request: NextRequest) {
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    // Refresh the session
    const { data: { session }, error } = await supabase.auth.refreshSession();

    if (error || !session) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'REFRESH_FAILED', message: error?.message || 'Failed to refresh session' },
          data: null
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: session.user.id,
          email: session.user.email,
        },
        session: {
          accessToken: session.access_token,
          refreshToken: session.refresh_token,
          expiresAt: session.expires_at ? new Date(session.expires_at * 1000).toISOString() : undefined,
          expires_in: session.expires_in,
          token_type: session.token_type,
        },
      },
    });
  } catch (error) {
    console.error('Session refresh error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to refresh session' },
        data: null
      },
      { status: 500 }
    );
  }
}
