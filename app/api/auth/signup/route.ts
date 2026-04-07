/**
 * Auth API Routes - Sign Up
 *
 * POST /api/auth/signup - Create new user account
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { ApiResponse, SignUpRequest } from '@/types';

// ============================================
// POST /api/auth/signup
// ============================================

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body: SignUpRequest = await request.json();

    // Validate required fields
    if (!body.email || !body.password) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email and password are required',
        },
      }, { status: 400 });
    }

    // Validate password strength
    if (body.password.length < 8) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: {
          code: 'WEAK_PASSWORD',
          message: 'Password must be at least 8 characters long',
        },
      }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: {
          code: 'INVALID_EMAIL',
          message: 'Please enter a valid email address',
        },
      }, { status: 400 });
    }

    // Sign up with Supabase
    const { data, error } = await supabase.auth.signUp({
      email: body.email,
      password: body.password,
      options: {
        data: {
          first_name: body.firstName,
          last_name: body.lastName,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    });

    if (error) {
      // Handle common Supabase auth errors
      if (error.message.includes('User already registered')) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: {
            code: 'USER_EXISTS',
            message: 'An account with this email already exists',
          },
        }, { status: 409 });
      }

      return NextResponse.json<ApiResponse>({
        success: false,
        error: {
          code: 'SIGNUP_FAILED',
          message: error.message,
        },
      }, { status: 400 });
    }

    // Determine response based on email confirmation requirement
    const requiresConfirmation = !data.session;

    if (requiresConfirmation) {
      return NextResponse.json<ApiResponse>({
        success: true,
        data: {
          message: 'Account created! Please check your email to confirm your account.',
          user: {
            id: data.user?.id || '',
            email: data.user?.email || '',
          },
        },
      }, { status: 201 });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        message: 'Account created successfully!',
        user: {
          id: data.user?.id || '',
          email: data.user?.email || '',
        },
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Signup POST error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create account',
      },
    }, { status: 500 });
  }
}
