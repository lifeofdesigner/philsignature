import { supabase } from '@/lib/supabase';
import type { ActivityLog } from '@/types/database';

export interface ExtendedActivityLog extends ActivityLog {
  user_email?: string;
  ip_address?: string;
  user_agent?: string;
  old_value?: Record<string, unknown>;
  new_value?: Record<string, unknown>;
}

export class AuditLogRepository {
  async getAll(limit = 100): Promise<ExtendedActivityLog[]> {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*, profiles(email)')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []).map((row: any) => ({
      ...row,
      user_email: row.profiles?.email || 'System/Guest',
    })) as ExtendedActivityLog[];
  }

  async log(
    action: string,
    entityType: string,
    entityId?: string,
    details?: Record<string, unknown>,
    userId?: string
  ): Promise<ActivityLog> {
    const { data, error } = await supabase
      .from('activity_logs')
      .insert({
        action,
        entity_type: entityType,
        entity_id: entityId || null,
        details: details || {},
        user_id: userId || null,
      })
      .select()
      .single();

    if (error) throw error;
    return data as ActivityLog;
  }
}

export const auditLogRepository = new AuditLogRepository();

