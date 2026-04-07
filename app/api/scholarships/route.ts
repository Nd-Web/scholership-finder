/**
 * Scholarships API Routes
 *
 * GET /api/scholarships - Get paginated list of scholarships
 * GET /api/scholarships?id=xxx - Get single scholarship by ID
 */

import { NextRequest, NextResponse } from 'next/server';
import { scholarshipService } from '@/services';
import type { ApiResponse, ScholarshipFilters, ScholarshipQueryParams } from '@/types';

// ============================================
// GET /api/scholarships
// ============================================

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Check if requesting single scholarship
    const id = searchParams.get('id');

    if (id) {
      const result = await scholarshipService.getScholarship(id);

      if (!result.success) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: result.error || 'Scholarship not found',
          },
        }, { status: 404 });
      }

      return NextResponse.json<ApiResponse>({
        success: true,
        data: result.data,
      });
    }

    // Parse query parameters for list request
    const filters: ScholarshipFilters = {};
    const options: ScholarshipQueryParams = {};

    // Filters
    const search = searchParams.get('search');
    const country = searchParams.get('country');
    const fieldOfStudy = searchParams.get('fieldOfStudy');
    const fundingType = searchParams.get('fundingType');
    const minGpa = searchParams.get('minGpa');
    const degreeLevel = searchParams.get('degreeLevel');
    const onlyOpen = searchParams.get('onlyOpen');
    const deadlineFrom = searchParams.get('deadlineFrom');
    const deadlineTo = searchParams.get('deadlineTo');
    const isActive = searchParams.get('isActive');

    if (search) filters.search = search;
    if (country) filters.country = country;
    if (fieldOfStudy) filters.fieldOfStudy = fieldOfStudy;
    if (fundingType) filters.fundingType = fundingType;
    if (minGpa) filters.minGpa = parseFloat(minGpa);
    if (degreeLevel) filters.degreeLevel = degreeLevel;
    if (onlyOpen) filters.onlyOpen = onlyOpen === 'true';
    if (deadlineFrom) filters.deadlineFrom = deadlineFrom;
    if (deadlineTo) filters.deadlineTo = deadlineTo;
    if (isActive) filters.isActive = isActive === 'true';

    // Pagination and sorting
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');
    const sortBy = searchParams.get('sortBy') as ScholarshipQueryParams['sortBy'];
    const sortOrder = searchParams.get('sortOrder') as ScholarshipQueryParams['sortOrder'];

    if (page) options.page = parseInt(page, 10);
    if (limit) options.limit = parseInt(limit, 10);
    if (sortBy) options.sortBy = sortBy;
    if (sortOrder) options.sortOrder = sortOrder;

    // Fetch scholarships
    const result = await scholarshipService.getScholarships(filters, options);

    if (!result.success) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: {
          code: 'FETCH_FAILED',
          message: result.error || 'Failed to fetch scholarships',
        },
      }, { status: 500 });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error('Scholarships GET error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch scholarships',
      },
    }, { status: 500 });
  }
}
