import { BaseRepository } from './BaseRepository';
import type { Category } from '@/types/database';

export class CategoryRepository extends BaseRepository {
  async findAll(): Promise<Category[]> {
    try {
      const { data, error } = await this.client
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) this.handleError(error, 'Failed to fetch categories');
      return (data as Category[]) || [];
    } catch (err) {
      this.handleError(err, 'Failed to query categories');
    }
  }

  async findBySlug(slug: string): Promise<Category | null> {
    try {
      const { data, error } = await this.client
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        this.handleError(error, `Failed to fetch category ${slug}`);
      }
      return data as Category;
    } catch (err) {
      this.handleError(err, `Error fetching category ${slug}`);
    }
  }
}

export const categoryRepository = new CategoryRepository();

