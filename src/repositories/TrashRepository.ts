import { supabase } from '@/lib/supabase';
import type { TrashItem } from '@/types/database';

export class TrashRepository {
  async getAll(): Promise<TrashItem[]> {
    const { data, error } = await supabase
      .from('trash_bin')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as TrashItem[];
  }

  async moveToTrash(
    entityType: string,
    entityId: string,
    entityName: string,
    payload: Record<string, unknown>,
    userId?: string
  ): Promise<TrashItem> {
    const { data, error } = await supabase
      .from('trash_bin')
      .insert({
        entity_type: entityType,
        entity_id: entityId,
        entity_name: entityName,
        payload,
        deleted_by: userId || null,
      })
      .select()
      .single();

    if (error) throw error;
    return data as TrashItem;
  }

  async deletePermanent(id: string): Promise<void> {
    const { error } = await supabase.from('trash_bin').delete().eq('id', id);
    if (error) throw error;
  }

  async emptyTrash(): Promise<void> {
    const { error } = await supabase.from('trash_bin').delete().gte('created_at', '1970-01-01');
    if (error) throw error;
  }
}

export const trashRepository = new TrashRepository();
