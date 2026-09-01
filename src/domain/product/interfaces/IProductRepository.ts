import type { Product } from '@/types/database';

export interface ProductCatalogFilter {
  categoryId?: string;
  collectionId?: string;
  family?: string;
  status?: string;
}

export interface IProductRepository {
  findAll(filter?: ProductCatalogFilter): Promise<Product[]>;
  findBySlug(slug: string): Promise<Product | null>;
  findById(id: string): Promise<Product | null>;
  create(input: unknown): Promise<Product>;
  update(id: string, input: unknown): Promise<Product>;
  delete(id: string): Promise<void>;
}
