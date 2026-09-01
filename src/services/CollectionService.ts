import { collectionRepository, type CollectionRepository } from '@/repositories/CollectionRepository';
import { productRepository, type ProductRepository } from '@/repositories/ProductRepository';
import { collectionSchema } from '@/schemas/collection.schema';
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

  async getCollectionsAdmin(): Promise<Collection[]> {
    return this.collectionRepo.findAllAdmin();
  }

  async createCollection(rawInput: unknown): Promise<Collection> {
    const parseResult = collectionSchema.safeParse(rawInput);
    if (!parseResult.success) {
      throw new ValidationError('Invalid collection data', parseResult.error.format());
    }
    return this.collectionRepo.create(parseResult.data);
  }

  async updateCollection(id: string, rawInput: unknown): Promise<Collection> {
    const parseResult = collectionSchema.partial().safeParse(rawInput);
    if (!parseResult.success) {
      throw new ValidationError('Invalid collection update data', parseResult.error.format());
    }
    return this.collectionRepo.update(id, parseResult.data);
  }

  async deleteCollection(id: string): Promise<void> {
    return this.collectionRepo.delete(id);
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

