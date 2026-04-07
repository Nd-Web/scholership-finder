/**
 * Auth API Routes - Sign Out
 *
 * POST /api/auth/logout - User logout
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { ApiResponse } from '@/types';

// ============================================
// POST /api/auth/logout
// ============================================

export async function POST() {
  try {
    const supabase = await createClient();

    // Sign out (clears session)
    const { error } = await supabase.auth.signOut();

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: {
          code: 'LOGOUT_FAILED',
          message: error.message,
        },
      }, { status: 500 });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        message: 'Logged out successfully',
      },
    });
  } catch (error) {
    console.error('Logout POST error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to logout',
      },
    }, { status: 500 });
  }
}
