import { AppError } from './AppError';

export class SupabaseError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'SUPABASE_QUERY_ERROR', 500, details);
    this.name = 'SupabaseError';
  }
}

