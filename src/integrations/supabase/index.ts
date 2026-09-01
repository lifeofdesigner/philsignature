import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface SupabaseHealthCheckResult {
  isConfigured: boolean;
  connected: boolean;
  latencyMs?: number;
  error?: string;
}

export const checkSupabaseConnection = async (): Promise<SupabaseHealthCheckResult> => {
  if (!isSupabaseConfigured()) {
    return { isConfigured: false, connected: false, error: 'Supabase credentials not configured' };
  }

  const start = performance.now();
  try {
    const { error } = await supabase.from('profiles').select('id', { count: 'exact', head: true });
    const latencyMs = Math.round(performance.now() - start);

    if (error && error.code !== 'PGRST116') {
      return { isConfigured: true, connected: false, latencyMs, error: error.message };
    }
    return { isConfigured: true, connected: true, latencyMs };
  } catch (err: unknown) {
    return {
      isConfigured: true,
      connected: false,
      error: err instanceof Error ? err.message : 'Unknown connection error',
    };
  }
};

export { supabase };
