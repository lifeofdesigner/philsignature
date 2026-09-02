import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from '@/config/env';

/**
 * Service-role Supabase client. Bypasses RLS entirely via the Admin API
 * (auth.admin.*). Deliberately isolated from src/lib/supabase.ts and must
 * NEVER be imported outside the local-only Developer Bootstrap console
 * (src/features/developer/bootstrap). The service_role key ships in the
 * client bundle, so this page must never be deployed to a public host.
 */
let adminClient: SupabaseClient | null = null;

export const getSupabaseAdmin = (): SupabaseClient | null => {
  if (!env.VITE_SUPABASE_SERVICE_ROLE_KEY) return null;
  if (!adminClient) {
    adminClient = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return adminClient;
};
