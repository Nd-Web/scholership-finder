/**
 * Applications API Routes
 *
 * GET  /api/applications - Get user's applications
 * POST /api/applications - Create new application tracking entry
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { applicationService } from '@/services';
import type { ApiResponse, CreateApplicationRequest } from '@/types';

// ============================================
// GET /api/applications
// ============================================

export async function GET() {
  try {
    const supabase = await createClient();

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

    // Fetch user's applications
    const result = await applicationService.getUserApplications(user.id);

    if (!result.success) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: {
          code: 'FETCH_FAILED',
          message: result.error || 'Failed to fetch applications',
        },
      }, { status: 500 });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error('Applications GET error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch applications',
      },
    }, { status: 500 });
  }
}

// ============================================
// POST /api/applications
// ============================================

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to track applications',
        },
      }, { status: 401 });
    }

    // Parse request body
    const body: CreateApplicationRequest = await request.json();

    // Validate required fields
    if (!body.scholarshipId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Scholarship ID is required',
        },
      }, { status: 400 });
    }

    // Verify scholarship exists
    const { data: scholarship, error: scholarshipError } = await supabase
      .from('scholarships')
      .select('id, is_active')
      .eq('id', body.scholarshipId)
      .single();

    if (scholarshipError || !scholarship) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: {
          code: 'SCHOLARSHIP_NOT_FOUND',
          message: 'The specified scholarship does not exist',
        },
      }, { status: 404 });
    }

    if (!scholarship.is_active) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: {
          code: 'SCHOLARSHIP_INACTIVE',
          message: 'This scholarship is no longer accepting applications',
        },
      }, { status: 400 });
    }

    // Create application tracking entry
    const result = await applicationService.createApplication(user.id, body);

    if (!result.success) {
      const statusCode = result.error?.includes('already tracking') ? 409 : 400;
      return NextResponse.json<ApiResponse>({
        success: false,
        error: {
          code: 'CREATE_FAILED',
          message: result.error || 'Failed to create application',
        },
      }, { status: statusCode });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: result.data,
    }, { status: 201 });
  } catch (error) {
    console.error('Applications POST error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create application',
      },
    }, { status: 500 });
  }
}
