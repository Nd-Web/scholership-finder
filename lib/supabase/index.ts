/**
 * Supabase Module
 *
 * Central export for Supabase clients.
 */

export { createClient, getBrowserClient } from './client';
export { createClient as createServerClient, createAdminClient } from './server';

// Re-export types for convenience
export type {
  User as SupabaseUser,
  Session,
  AuthError,
} from '@supabase/supabase-js';
