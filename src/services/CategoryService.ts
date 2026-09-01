import { categoryRepository, type CategoryRepository } from '@/repositories/CategoryRepository';
import type { Category } from '@/types/database';

export class CategoryService {
  constructor(private repo: CategoryRepository = categoryRepository) {}

  async getAllCategories(): Promise<Category[]> {
    return this.repo.findAll();
  }
}

export const categoryService = new CategoryService();

