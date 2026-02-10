import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase admin client (service role)
 *
 * Uses server-only env vars:
 * - SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 *
 * For backwards compatibility, it also falls back to NEXT_PUBLIC_SUPABASE_URL
 * if SUPABASE_URL is not defined.
 */
function getSupabaseAdmin(): SupabaseClient {
  const supabaseUrl =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error(
      'Missing env var: SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL as fallback)',
    );
  }

  if (!supabaseServiceKey) {
    throw new Error('Missing env var: SUPABASE_SERVICE_ROLE_KEY');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Lazy initialization to avoid errors during build / edge cold starts
let supabaseAdminInstance: SupabaseClient | null = null;

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    if (!supabaseAdminInstance) {
      supabaseAdminInstance = getSupabaseAdmin();
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (supabaseAdminInstance as any)[prop];
  },
});

