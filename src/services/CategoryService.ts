import { categoryRepository, type CategoryRepository } from '@/repositories/CategoryRepository';
import { categorySchema } from '@/schemas/category.schema';
import { ValidationError } from '@/errors/ValidationError';
import type { Category } from '@/types/database';

export class CategoryService {
  constructor(private repo: CategoryRepository = categoryRepository) {}

  async getAllCategories(): Promise<Category[]> {
    return this.repo.findAll();
  }

  async getAllCategoriesAdmin(): Promise<Category[]> {
    return this.repo.findAllAdmin();
  }

  async createCategory(rawInput: unknown): Promise<Category> {
    const parseResult = categorySchema.safeParse(rawInput);
    if (!parseResult.success) {
      throw new ValidationError('Invalid category data', parseResult.error.format());
    }
    return this.repo.create(parseResult.data);
  }

  async updateCategory(id: string, rawInput: unknown): Promise<Category> {
    const parseResult = categorySchema.partial().safeParse(rawInput);
    if (!parseResult.success) {
      throw new ValidationError('Invalid category update data', parseResult.error.format());
    }
    return this.repo.update(id, parseResult.data);
  }

  async deleteCategory(id: string): Promise<void> {
    return this.repo.delete(id);
  }
}

export const categoryService = new CategoryService();

