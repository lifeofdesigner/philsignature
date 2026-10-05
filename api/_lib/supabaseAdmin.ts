import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';

// In Node.js runtimes without native WebSocket (< v22), Supabase Realtime requires a WebSocket transport.
// Serverless functions never use Realtime subscriptions, so provide ws or a minimal noop fallback.
let transport: any = undefined;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  transport = require('ws');
} catch {
  // If ws not available in environment, use empty noop
  transport = class NoopWebSocket {};
}

/**
 * Service-role Supabase client for use in serverless functions only.
 * Bypasses RLS entirely - never import this into client-bundled (src/) code.
 */
export const supabaseAdmin = createClient(
  SUPABASE_URL || 'https://placeholder.supabase.co',
  SERVICE_ROLE_KEY || 'placeholder-key',
  {
    auth: { persistSession: false, autoRefreshToken: false },
    realtime: transport ? { transport } : undefined,
  }
);
