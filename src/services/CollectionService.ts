import { collectionRepository, type CollectionRepository } from '@/repositories/CollectionRepository';
import { productRepository, type ProductRepository } from '@/repositories/ProductRepository';
import { ValidationError } from '@/errors/ValidationError';
import type { Collection, Product } from '@/types/database';

export class CollectionService {
  constructor(
    private collectionRepo: CollectionRepository = collectionRepository,
    private productRepo: ProductRepository = productRepository
  ) {}

  async getCollections(): Promise<Collection[]> {
    return this.collectionRepo.findAll();
  }

  async getFeaturedCollections(): Promise<Collection[]> {
    return this.collectionRepo.findFeatured();
  }

  async getCollectionBySlug(slug: string): Promise<{ collection: Collection; products: Product[] } | null> {
    if (!slug || slug.trim() === '') {
      throw new ValidationError('Collection slug is required');
    }

    const collection = await this.collectionRepo.findBySlug(slug);
    if (!collection) return null;

    const products = await this.productRepo.findAll({ collectionId: collection.id });
    return { collection, products };
  }
}

export const collectionService = new CollectionService();

