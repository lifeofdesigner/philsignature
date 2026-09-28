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

  const text = await res.text();
  let json: Record<string, unknown> | null = null;
  try {
    json = text ? (JSON.parse(text) as Record<string, unknown>) : null;
  } catch {
    if (!res.ok) {
      throw new Error(
        res.status === 404
          ? 'Server API endpoint not found. Please contact a super administrator.'
          : `Server returned an error (${res.status}).`
      );
    }
    throw new Error('Invalid response from server.');
  }

  if (!res.ok) {
    const errorMsg = (typeof json?.error === 'string' && json.error) || `Request failed (${res.status})`;
    throw new Error(errorMsg);
  }
  return json as T;
}
