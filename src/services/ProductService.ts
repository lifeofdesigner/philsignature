import { productRepository, type ProductRepository } from '@/repositories/ProductRepository';
import { productSchema } from '@/schemas/product.schema';
import { ValidationError } from '@/errors/ValidationError';
import type { Product, Review, FragranceFamily } from '@/types/database';

export interface CatalogFilterOptions {
  family?: FragranceFamily | 'all';
  categoryId?: string | 'all';
  collectionId?: string | 'all';
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  searchQuery?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'bestseller' | 'rating' | 'featured';
}

export class ProductService {
  constructor(private repo: ProductRepository = productRepository) {}

  async getCatalog(filter?: { categoryId?: string; collectionId?: string; family?: string; status?: string }): Promise<Product[]> {
    return this.repo.findAll(filter);
  }

  async getAllProductsAdmin(): Promise<Product[]> {
    return this.repo.findAll();
  }

  async getFeaturedProducts(limit = 4): Promise<Product[]> {
    return this.repo.findFeatured(limit);
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    if (!slug || slug.trim() === '') {
      throw new ValidationError('Fragrance slug is required');
    }
    return this.repo.findBySlug(slug);
  }

  async getRelatedProducts(fragranceFamily: string, excludeId: string, limit = 4): Promise<Product[]> {
    if (!fragranceFamily) return [];
    return this.repo.findRelated(fragranceFamily, excludeId, limit);
  }

  async searchProducts(query: string, limit = 20): Promise<Product[]> {
    const trimmed = query.trim();
    if (!trimmed) return [];
    return this.repo.search(trimmed, limit);
  }

  async getProductReviews(productId: string): Promise<Review[]> {
    if (!productId) return [];
    return this.repo.findReviewsByProductId(productId);
  }

  filterAndSort(products: Product[], options: CatalogFilterOptions): Product[] {
    let result = [...products];

    // 1. Fragrance Family Filter
    if (options.family && options.family !== 'all') {
      result = result.filter((p) => p.fragrance_family === options.family);
    }

    // 2. Category Filter
    if (options.categoryId && options.categoryId !== 'all') {
      result = result.filter((p) => p.category_id === options.categoryId);
    }

    // 3. Collection Filter
    if (options.collectionId && options.collectionId !== 'all') {
      result = result.filter((p) => p.collection_id === options.collectionId);
    }

    // 4. Price Boundaries
    if (options.minPrice !== undefined && options.minPrice > 0) {
      result = result.filter((p) => {
        const effectivePrice = p.sale_price !== null && p.sale_price !== undefined ? p.sale_price : p.price;
        return effectivePrice >= options.minPrice!;
      });
    }
    if (options.maxPrice !== undefined && options.maxPrice > 0) {
      result = result.filter((p) => {
        const effectivePrice = p.sale_price !== null && p.sale_price !== undefined ? p.sale_price : p.price;
        return effectivePrice <= options.maxPrice!;
      });
    }

    // 5. In-Stock Only
    if (options.inStockOnly) {
      result = result.filter((p) => p.stock_quantity > 0);
    }

    // 6. Search Query
    if (options.searchQuery && options.searchQuery.trim() !== '') {
      const q = options.searchQuery.toLowerCase().trim();
      result = result.filter((p) => {
        const nameMatch = p.name.toLowerCase().includes(q);
        const skuMatch = p.sku.toLowerCase().includes(q);
        const taglineMatch = p.tagline ? p.tagline.toLowerCase().includes(q) : false;
        const notesMatch = [
          ...(p.top_notes || []),
          ...(p.middle_notes || []),
          ...(p.base_notes || []),
        ].some((n) => n.toLowerCase().includes(q));
        return nameMatch || skuMatch || taglineMatch || notesMatch;
      });
    }

    // 7. Sorting
    switch (options.sortBy) {
      case 'price_asc':
        result.sort((a, b) => {
          const priceA = a.sale_price !== null && a.sale_price !== undefined ? a.sale_price : a.price;
          const priceB = b.sale_price !== null && b.sale_price !== undefined ? b.sale_price : b.price;
          return priceA - priceB;
        });
        break;
      case 'price_desc':
        result.sort((a, b) => {
          const priceA = a.sale_price !== null && a.sale_price !== undefined ? a.sale_price : a.price;
          const priceB = b.sale_price !== null && b.sale_price !== undefined ? b.sale_price : b.price;
          return priceB - priceA;
        });
        break;
      case 'bestseller':
        result.sort((a, b) => (b.is_bestseller ? 1 : 0) - (a.is_bestseller ? 1 : 0));
        break;
      case 'rating':
        result.sort((a, b) => (b.rating || 5) - (a.rating || 5));
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'featured':
      default:
        result.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
        break;
    }

    return result;
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
