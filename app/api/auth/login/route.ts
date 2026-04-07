/**
 * Auth API Routes - Sign In
 *
 * POST /api/auth/login - User login
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import type { ApiResponse, SignInRequest } from '@/types';

// ============================================
// POST /api/auth/login
// ============================================

export async function POST(request: NextRequest) {
  try {
    const body: SignInRequest = await request.json();

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

    // Create Supabase client with cookie handling
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll().map(c => ({ name: c.name, value: c.value }));
          },
          setAll(cookiesToSet) {
            // Cookies will be set on the response below
          },
        },
      }
    );

    // Sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: body.email,
      password: body.password,
    });

    if (error) {
      // Handle common Supabase auth errors
      if (error.message.includes('Invalid login credentials')) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password',
          },
        }, { status: 401 });
      }

      if (error.message.includes('Email not confirmed')) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: {
            code: 'EMAIL_NOT_CONFIRMED',
            message: 'Please confirm your email address before logging in',
          },
        }, { status: 401 });
      }

      return NextResponse.json<ApiResponse>({
        success: false,
        error: {
          code: 'LOGIN_FAILED',
          message: error.message,
        },
      }, { status: 401 });
    }

    // Create response and set auth cookies
    const response = NextResponse.json<ApiResponse>({
      success: true,
      data: {
        user: {
          id: data.user.id,
          email: data.user.email || '',
        },
        session: data.session ? {
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          expiresAt: data.session.expires_at || 0,
        } : null,
      },
    });

    // Set Supabase auth cookies on the response
    const { session } = data;
    if (session) {
      response.cookies.set('sb-auth-token', session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: session.expires_at ? session.expires_at - Math.floor(Date.now() / 1000) : 3600,
        path: '/',
      });
    }

    return response;
  } catch (error) {
    console.error('Login POST error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to login',
      },
    }, { status: 500 });
  }
}
