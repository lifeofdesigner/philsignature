import { BaseRepository } from './BaseRepository';
import type { Category } from '@/types/database';
import type { CategoryInput } from '@/schemas/category.schema';

export class CategoryRepository extends BaseRepository {
  async findAllAdmin(): Promise<Category[]> {
    try {
      const { data, error } = await this.client
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) this.handleError(error, 'Failed to fetch categories');
      return (data as Category[]) || [];
    } catch (err) {
      this.handleError(err, 'Failed to query categories');
    }
  }

  async create(input: CategoryInput): Promise<Category> {
    try {
      const { data, error } = await this.client.from('categories').insert(input).select().single();
      if (error) this.handleError(error, 'Failed to create category');
      return data as Category;
    } catch (err) {
      this.handleError(err, 'Error creating category');
    }
  }

  async update(id: string, input: Partial<CategoryInput>): Promise<Category> {
    try {
      const { data, error } = await this.client
        .from('categories')
        .update({ ...input, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) this.handleError(error, 'Failed to update category');
      return data as Category;
    } catch (err) {
      this.handleError(err, 'Error updating category');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const { error } = await this.client.from('categories').delete().eq('id', id);
      if (error) this.handleError(error, 'Failed to delete category');
    } catch (err) {
      this.handleError(err, 'Error deleting category');
    }
  }

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

