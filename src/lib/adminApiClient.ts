import { supabase } from '@/lib/supabase';

/**
 * Calls a privileged /api/admin/* serverless endpoint, authenticated with the
 * current user's own Supabase session token (never a service-role key -
 * that key only ever lives server-side). The endpoint re-validates the
 * caller's role itself; this client never asserts privilege on its own behalf.
 */
export async function callAdminApi<T = unknown>(
  path: string,
  options: { method?: 'GET' | 'POST'; body?: unknown } = {}
): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) {
    throw new Error('You must be signed in to perform this action.');
  }

  const res = await fetch(path, {
    method: options.method || 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: options.method === 'GET' ? undefined : JSON.stringify(options.body || {}),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error || 'Request failed');
  }
  return json as T;
}
