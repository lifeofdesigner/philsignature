import { supabase } from '@/lib/supabase';
import { SupabaseError } from '@/errors/SupabaseError';

export abstract class BaseRepository {
  protected get client() {
    return supabase;
  }

  protected handleError(error: unknown, fallbackMessage: string): never {
    if (error instanceof Error) {
      throw new SupabaseError(error.message, error);
    }
    // Supabase PostgrestError has a .message property but is not an instanceof Error
    if (error && typeof error === 'object' && 'message' in error) {
      throw new SupabaseError((error as { message: string }).message, error);
    }
    throw new SupabaseError(fallbackMessage, error);
  }
}

