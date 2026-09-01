import { BaseRepository } from './BaseRepository';
import type { Collection } from '@/types/database';

export class CollectionRepository extends BaseRepository {
  async findAll(): Promise<Collection[]> {
    try {
      const { data, error } = await this.client
        .from('collections')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) this.handleError(error, 'Failed to fetch collections');
      return (data as Collection[]) || [];
    } catch (err) {
      this.handleError(err, 'Failed to query boutique collections');
    }
  }

  async findFeatured(): Promise<Collection[]> {
    try {
      const { data, error } = await this.client
        .from('collections')
        .select('*')
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('display_order', { ascending: true });

      if (error) this.handleError(error, 'Failed to fetch featured collections');
      return (data as Collection[]) || [];
    } catch (err) {
      this.handleError(err, 'Failed to query featured collections');
    }
  }

  async findBySlug(slug: string): Promise<Collection | null> {
    try {
      const { data, error } = await this.client
        .from('collections')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        this.handleError(error, `Failed to fetch collection: ${slug}`);
      }
      return data as Collection;
    } catch (err) {
      this.handleError(err, `Error fetching collection: ${slug}`);
    }
  }
}

export const collectionRepository = new CollectionRepository();

