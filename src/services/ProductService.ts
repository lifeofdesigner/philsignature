import { productRepository, type ProductRepository } from '@/repositories/ProductRepository';
import { productSchema } from '@/schemas/product.schema';
import { ValidationError } from '@/errors/ValidationError';
import type { Product, Review, FragranceFamily } from '@/types/database';

export interface CatalogFilterOptions {
  family?: FragranceFamily | string | 'all';
  categoryId?: string | 'all';
  collectionId?: string | 'all';
  gender?: string | 'all';
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
      result = result.filter((p) => p.fragrance_family && p.fragrance_family.toLowerCase().includes(options.family!.toLowerCase()));
    }

    // 2. Category Filter
    if (options.categoryId && options.categoryId !== 'all') {
      const c = options.categoryId.toLowerCase().trim();
      result = result.filter((p) => {
        if (p.category_id === options.categoryId) return true;
        if (p.category && (p.category.id === options.categoryId || p.category.slug?.toLowerCase() === c || p.category.name?.toLowerCase() === c)) return true;
        if (c === 'candles') {
          return p.category_id === 'c3333333-3333-3333-3333-333333333333' ||
                 p.category?.slug === 'candles' ||
                 Boolean(p.concentration?.toLowerCase().includes('candle'));
        }
        if (c === 'perfumes' || c === 'perfume-body-oils') {
          return p.category?.slug === 'perfumes' ||
                 p.category_id === 'c1111111-1111-1111-1111-111111111111' ||
                 (!p.concentration?.toLowerCase().includes('candle') && p.category?.slug !== 'candles');
        }
        return false;
      });
    }

    // 3. Collection Filter
    if (options.collectionId && options.collectionId !== 'all') {
      result = result.filter((p) => p.collection_id === options.collectionId);
    }

    // 4. Gender / Target Audience Filter
    if (options.gender && options.gender !== 'all') {
      const g = options.gender.toLowerCase().trim();
      result = result.filter((p) => {
        if (!p.best_for) return false;
        return p.best_for.toLowerCase().includes(g);
      });
    }

    // 5. Price Boundaries
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

    // 6. In-Stock Only
    if (options.inStockOnly) {
      result = result.filter((p) => p.stock_quantity > 0);
    }

    // 7. Search Query (Name, Family, Notes, Profile, Target, Descriptions)
    if (options.searchQuery && options.searchQuery.trim() !== '') {
      const q = options.searchQuery.toLowerCase().trim();
      result = result.filter((p) => {
        const nameMatch = p.name.toLowerCase().includes(q);
        const skuMatch = p.sku.toLowerCase().includes(q);
        const taglineMatch = p.tagline ? p.tagline.toLowerCase().includes(q) : false;
        const scentProfileMatch = p.scent_profile ? p.scent_profile.toLowerCase().includes(q) : false;
        const bestForMatch = p.best_for ? p.best_for.toLowerCase().includes(q) : false;
        const familyMatch = p.fragrance_family ? p.fragrance_family.toLowerCase().includes(q) : false;
        const descMatch = p.description ? p.description.toLowerCase().includes(q) : false;
        const shortDescMatch = p.short_description ? p.short_description.toLowerCase().includes(q) : false;
        const notesMatch = [
          ...(p.top_notes || []),
          ...(p.middle_notes || []),
          ...(p.base_notes || []),
        ].some((n) => n.toLowerCase().includes(q));
        return nameMatch || skuMatch || taglineMatch || scentProfileMatch || bestForMatch || familyMatch || descMatch || shortDescMatch || notesMatch;
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
        result.sort((a, b) => {
          if (a.is_featured !== b.is_featured) {
            return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
          }
          return (a.display_order || 999) - (b.display_order || 999);
        });
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
