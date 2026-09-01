import { productRepository, type ProductRepository } from '@/repositories/ProductRepository';
import { productSchema } from '@/schemas/product.schema';
import { ValidationError } from '@/errors/ValidationError';
import type { Product } from '@/types/database';

export class ProductService {
  constructor(private repo: ProductRepository = productRepository) {}

  async getCatalog(filter?: { categoryId?: string; collectionId?: string; family?: string; status?: string }): Promise<Product[]> {
    return this.repo.findAll(filter);
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    if (!slug || slug.trim() === '') {
      throw new ValidationError('Fragrance slug is required');
    }
    return this.repo.findBySlug(slug);
  }

  async createProduct(rawInput: unknown): Promise<Product> {
    const parseResult = productSchema.safeParse(rawInput);
    if (!parseResult.success) {
      throw new ValidationError('Invalid fragrance data', parseResult.error.format());
    }
    return this.repo.create(parseResult.data);
  }

  async updateProduct(id: string, rawInput: unknown): Promise<Product> {
    const parseResult = productSchema.partial().safeParse(rawInput);
    if (!parseResult.success) {
      throw new ValidationError('Invalid fragrance update data', parseResult.error.format());
    }
    return this.repo.update(id, parseResult.data);
  }

  async deleteProduct(id: string): Promise<void> {
    return this.repo.delete(id);
  }
}

export const productService = new ProductService();

