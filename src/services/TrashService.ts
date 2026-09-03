import { trashRepository } from '@/repositories/TrashRepository';
import { supabase } from '@/lib/supabase';
import type { TrashItem } from '@/types/database';

export class TrashService {
  async getTrashItems(): Promise<TrashItem[]> {
    return trashRepository.getAll();
  }

  async softDelete(
    entityType: string,
    entityId: string,
    entityName: string,
    payload: Record<string, unknown>,
    userId?: string
  ): Promise<TrashItem> {
    return trashRepository.moveToTrash(entityType, entityId, entityName, payload, userId);
  }

  async restoreItem(item: TrashItem): Promise<void> {
    const tableMap: Record<string, string> = {
      product: 'products',
      collection: 'collections',
      category: 'categories',
      cms_content: 'cms_content',
      media: 'media',
      coupon: 'coupons',
    };

    const tableName = tableMap[item.entity_type];
    if (tableName && item.payload && Object.keys(item.payload).length > 0) {
      await supabase.from(tableName).upsert(item.payload);
    }

    await trashRepository.deletePermanent(item.id);
  }

  async purgeItem(id: string): Promise<void> {
    await trashRepository.deletePermanent(id);
  }

  async purgeAll(): Promise<void> {
    await trashRepository.emptyTrash();
  }
}

export const trashService = new TrashService();

