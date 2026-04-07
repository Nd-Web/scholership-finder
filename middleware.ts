/**
 * Auth Middleware
 *
 * Protects routes by checking for valid authentication.
 * Runs on every request to verify user sessions.
 */

import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// ============================================
// CONFIGURATION
// ============================================

/**
 * Routes that require authentication.
 * Users will be redirected to login if not authenticated.
 */
const PROTECTED_ROUTES = [
  '/dashboard',
  '/profile',
  '/scholarships',
  '/applications',
  '/recommendations',
];

/**
 * Routes that are only accessible when NOT authenticated.
 * Authenticated users will be redirected to dashboard.
 */
const AUTH_ROUTES = [
  '/login',
  '/signup',
];

/**
 * Public routes that don't require authentication.
 */
const PUBLIC_ROUTES = [
  '/',
  '/about',
  '/api/auth/login',
  '/api/auth/signup',
];

/**
 * API routes that require authentication.
 */
const PROTECTED_API_ROUTES = [
  '/api/profile',
  '/api/recommendations',
  '/api/applications',
];

// ============================================
// MIDDLEWARE
// ============================================

export async function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const pathname = nextUrl.pathname;

  // Create Supabase client for middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll().map(c => ({ name: c.name, value: c.value }));
        },
        setAll() {
          // Cookies are handled automatically in middleware
        },
      },
    }
  );

  // Get current session
  const { data: { session } } = await supabase.auth.getSession();
  const isAuthenticated = !!session;

  // ============================================
  // API ROUTE PROTECTION
  // ============================================

  if (pathname.startsWith('/api')) {
    // Check if API route requires authentication
    const isProtectedApi = PROTECTED_API_ROUTES.some(route =>
      pathname.startsWith(route)
    );

    if (isProtectedApi && !isAuthenticated) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        },
        { status: 401 }
      );
    }

    // Allow API requests to continue
    return NextResponse.next();
  }

  // ============================================
  // PAGE ROUTE PROTECTION
  // ============================================

  // Check if trying to access protected route without auth
  const isProtectedRoute = PROTECTED_ROUTES.some(route =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', nextUrl);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check if trying to access auth route while already authenticated
  const isAuthRoute = AUTH_ROUTES.some(route => pathname.startsWith(route));

  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl));
  }

  // Allow request to continue
  return NextResponse.next();
}

// ============================================
// ROUTER CONFIGURATION
// ============================================

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
