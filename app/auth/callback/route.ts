import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Auth Callback Route
 *
 * Handles OAuth callbacks and email magic link confirmations from Supabase.
 * This route is called by Supabase after authentication.
 */

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  // Handle auth errors
  if (error) {
    console.error('Auth callback error:', error, errorDescription);
    return NextResponse.redirect(
      new URL(`/auth/login?error=${encodeURIComponent(errorDescription || error)}`, requestUrl.origin)
    );
  }

  if (code) {
    const supabase = await createClient();

    // Exchange code for session
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error('Code exchange error:', exchangeError);
      return NextResponse.redirect(
        new URL(`/auth/login?error=${encodeURIComponent('Failed to complete authentication')}`, requestUrl.origin)
      );
    }

    // Get the redirect path if available
    const next = requestUrl.searchParams.get('next') || '/dashboard';
    return NextResponse.redirect(new URL(next, requestUrl.origin));
  }

  // No code and no error - redirect to login
  return NextResponse.redirect(new URL('/auth/login', requestUrl.origin));
}
