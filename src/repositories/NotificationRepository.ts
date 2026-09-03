import { supabase } from '@/lib/supabase';
import type { AdminNotification } from '@/types/database';

export class NotificationRepository {
  async getNotifications(userId?: string): Promise<AdminNotification[]> {
    let query = supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(50);
    if (userId) {
      query = query.or(`user_id.eq.${userId},user_id.is.null`);
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as AdminNotification[];
  }

  async markAsRead(id: string): Promise<void> {
    const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    if (error) throw error;
  }

  async markAllAsRead(): Promise<void> {
    const { error } = await supabase.from('notifications').update({ is_read: true }).eq('is_read', false);
    if (error) throw error;
  }

  async create(type: string, title: string, message: string, link?: string, userId?: string): Promise<AdminNotification> {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        type,
        title,
        message,
        link: link || null,
        user_id: userId || null,
        is_read: false,
      })
      .select()
      .single();

    if (error) throw error;
    return data as AdminNotification;
  }
}

export const notificationRepository = new NotificationRepository();

