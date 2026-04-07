/**
 * Recommendations API Route
 *
 * POST /api/recommendations - Get personalized scholarship recommendations
 *
 * This endpoint uses the matching algorithm to score and rank scholarships
 * based on the user's profile.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { matchScholarships, scholarshipService } from '@/services';
import type { ApiResponse, RecommendationsResponse, ScholarshipMatch } from '@/types';

// ============================================
// POST /api/recommendations
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
          message: 'You must be logged in to get recommendations',
        },
      }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const limit = body?.limit || 20;
    const minScore = body?.minScore || 40;

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: {
          code: 'PROFILE_NOT_FOUND',
          message: 'Please create your profile first to get personalized recommendations',
        },
      }, { status: 400 });
    }

    // Fetch all active scholarships (for now, we'll fetch all and filter)
    // In production, you might want to pre-filter by country or field of study
    const { data: scholarships, error: scholarshipsError } = await supabase
      .from('scholarships')
      .select('*')
      .eq('is_active', true);

    if (scholarshipsError) {
      throw new Error('Failed to fetch scholarships');
    }

    if (!scholarships || scholarships.length === 0) {
      return NextResponse.json<ApiResponse>({
        success: true,
        data: {
          matches: [],
          totalMatches: 0,
          generatedAt: new Date().toISOString(),
        },
      });
    }

    // Run matching algorithm
    const matches = matchScholarships(profile, scholarships, {
      limit,
      minScore,
    });

    // Format response
    const formattedMatches: ScholarshipMatch[] = matches.map((match) => ({
      scholarship: match.scholarship,
      score: match.score,
      explanation: match.explanation,
    }));

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        matches: formattedMatches,
        totalMatches: formattedMatches.length,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Recommendations POST error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to generate recommendations',
      },
    }, { status: 500 });
  }
}

// ============================================
// GET /api/recommendations
// ============================================

export async function GET(request: NextRequest) {
  // Redirect to POST with default parameters
  const searchParams = request.nextUrl.searchParams;
  const limit = searchParams.get('limit') || 20;
  const minScore = searchParams.get('minScore') || 40;

  // Create a mock request body for GET
  const mockRequest = {
    json: async () => ({ limit: parseInt(limit), minScore: parseInt(minScore) }),
  } as NextRequest;

  return POST(mockRequest);
}
