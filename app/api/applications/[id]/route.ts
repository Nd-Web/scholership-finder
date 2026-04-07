/**
 * Application Detail API Routes
 *
 * GET    /api/applications/[id] - Get single application
 * PUT    /api/applications/[id] - Update application
 * DELETE /api/applications/[id] - Delete application
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { applicationService } from '@/services';
import type { ApiResponse, UpdateApplicationRequest } from '@/types';

// ============================================
// GET /api/applications/[id]
// ============================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to view applications',
        },
      }, { status: 401 });
    }

    // Fetch application
    const result = await applicationService.getApplication(user.id, id);

    if (!result.success) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: result.error || 'Application not found',
        },
      }, { status: 404 });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error('Application GET error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch application',
      },
    }, { status: 500 });
  }
}

// ============================================
// PUT /api/applications/[id]
// ============================================

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to update applications',
        },
      }, { status: 401 });
    }

    // Parse request body
    const body: UpdateApplicationRequest = await request.json();

    // Update application
    const result = await applicationService.updateApplication(user.id, id, body);

    if (!result.success) {
      const statusCode = result.error?.includes('not found') ? 404 : 400;
      return NextResponse.json<ApiResponse>({
        success: false,
        error: {
          code: 'UPDATE_FAILED',
          message: result.error || 'Failed to update application',
        },
      }, { status: statusCode });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error('Application PUT error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update application',
      },
    }, { status: 500 });
  }
}

// ============================================
// DELETE /api/applications/[id]
// ============================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'You must be logged in',
        },
      }, { status: 401 });
    }

    // Delete application
    const result = await applicationService.deleteApplication(user.id, id);

    if (!result.success) {
      const statusCode = result.error?.includes('not found') ? 404 : 400;
      return NextResponse.json<ApiResponse>({
        success: false,
        error: {
          code: 'DELETE_FAILED',
          message: result.error || 'Failed to delete application',
        },
      }, { status: statusCode });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
    });
  } catch (error) {
    console.error('Application DELETE error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to delete application',
      },
    }, { status: 500 });
  }
}
