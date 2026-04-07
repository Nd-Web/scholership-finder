/**
 * Profile API Routes
 *
 * GET  /api/profile - Get current user's profile
 * POST /api/profile - Create user's profile
 * PUT  /api/profile - Update user's profile
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { profileService } from '@/services';
import type { CreateProfileRequest, UpdateProfileRequest, ApiResponse } from '@/types';

// ============================================
// GET /api/profile
// ============================================

export async function GET(request: NextRequest) {
  try {
    console.log('[Profile API] Request cookies:', request.cookies.getAll().map(c => ({ name: c.name, value: c.value.substring(0, 30) + '...' })));

    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    console.log('[Profile API] Auth result:', { user: user?.id, error: authError?.message });

    if (authError || !user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      }, { status: 401 });
    }

    // Fetch profile
    const result = await profileService.getProfile(user.id);

    if (!result.success) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: {
          code: 'PROFILE_NOT_FOUND',
          message: result.error || 'Profile not found',
        },
      }, { status: 404 });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error('Profile GET error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch profile',
      },
    }, { status: 500 });
  }
}

// ============================================
// POST /api/profile
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
          message: 'You must be logged in to create a profile',
        },
      }, { status: 401 });
    }

    // Parse request body
    const body: CreateProfileRequest = await request.json();

    // Validate required fields
    if (!body.firstName || !body.lastName) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'First name and last name are required',
        },
      }, { status: 400 });
    }

    // Check if profile already exists
    const hasProfile = await profileService.hasProfile(user.id);

    if (hasProfile) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: {
          code: 'PROFILE_EXISTS',
          message: 'You already have a profile. Use PUT to update it.',
        },
      }, { status: 409 });
    }

    // Create profile
    const result = await profileService.createProfile(user.id, body);

    if (!result.success) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: {
          code: 'CREATE_FAILED',
          message: result.error || 'Failed to create profile',
        },
      }, { status: 400 });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: result.data,
    }, { status: 201 });
  } catch (error) {
    console.error('Profile POST error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create profile',
      },
    }, { status: 500 });
  }
}

// ============================================
// PUT /api/profile
// ============================================

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to update your profile',
        },
      }, { status: 401 });
    }

    // Parse request body
    const body: UpdateProfileRequest = await request.json();

    // Update profile
    const result = await profileService.updateProfile(user.id, body);

    if (!result.success) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: {
          code: 'UPDATE_FAILED',
          message: result.error || 'Failed to update profile',
        },
      }, { status: 400 });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error('Profile PUT error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update profile',
      },
    }, { status: 500 });
  }
}
