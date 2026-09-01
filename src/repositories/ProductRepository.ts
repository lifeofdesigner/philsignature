import { BaseRepository } from './BaseRepository';
import type { Product, Review } from '@/types/database';
import type { ProductInput } from '@/schemas/product.schema';

export class ProductRepository extends BaseRepository {
  async findAll(filter?: { categoryId?: string; collectionId?: string; family?: string; status?: string }): Promise<Product[]> {
    try {
      let query = this.client
        .from('products')
        .select('*, images:product_images(*), category:categories(*), collection:collections(*)')
        .order('created_at', { ascending: false });

      if (filter?.status) {
        query = query.eq('status', filter.status);
      } else {
        query = query.eq('status', 'published');
      }

      if (filter?.categoryId) query = query.eq('category_id', filter.categoryId);
      if (filter?.collectionId) query = query.eq('collection_id', filter.collectionId);
      if (filter?.family) query = query.eq('fragrance_family', filter.family);

      const { data, error } = await query;
      if (error) this.handleError(error, 'Failed to fetch products');
      return (data as Product[]) || [];
    } catch (err) {
      this.handleError(err, 'Failed to fetch products from Supabase');
    }
  }

  async findFeatured(limit = 4): Promise<Product[]> {
    try {
      const { data, error } = await this.client
        .from('products')
        .select('*, images:product_images(*), category:categories(*), collection:collections(*)')
        .eq('status', 'published')
        .eq('is_featured', true)
        .order('display_order', { ascending: true, nullsFirst: false })
        .limit(limit);

      if (error) this.handleError(error, 'Failed to fetch featured fragrances');
      return (data as Product[]) || [];
    } catch (err) {
      this.handleError(err, 'Error querying featured products');
    }
  }

  async findRelated(fragranceFamily: string, excludeId: string, limit = 4): Promise<Product[]> {
    try {
      const { data, error } = await this.client
        .from('products')
        .select('*, images:product_images(*), category:categories(*), collection:collections(*)')
        .eq('status', 'published')
        .eq('fragrance_family', fragranceFamily)
        .neq('id', excludeId)
        .limit(limit);

      if (error) this.handleError(error, `Failed to fetch related fragrances for family ${fragranceFamily}`);
      return (data as Product[]) || [];
    } catch (err) {
      this.handleError(err, 'Error querying related products');
    }
  }

  async search(queryText: string, limit = 20): Promise<Product[]> {
    try {
      const cleaned = queryText.trim();
      const { data, error } = await this.client
        .from('products')
        .select('*, images:product_images(*), category:categories(*), collection:collections(*)')
        .eq('status', 'published')
        .or(`name.ilike.%${cleaned}%,sku.ilike.%${cleaned}%,tagline.ilike.%${cleaned}%`)
        .limit(limit);

      if (error) this.handleError(error, `Search failed for: ${queryText}`);
      return (data as Product[]) || [];
    } catch (err) {
      this.handleError(err, 'Error executing fragrance catalog search');
    }
  }

  async findBySlug(slug: string): Promise<Product | null> {
    try {
      const { data, error } = await this.client
        .from('products')
        .select('*, images:product_images(*), videos:product_videos(*), category:categories(*), collection:collections(*)')
        .eq('slug', slug)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        this.handleError(error, `Failed to fetch product with slug: ${slug}`);
      }
      return data as Product;
    } catch (err) {
      this.handleError(err, `Error fetching product: ${slug}`);
    }
  }

  async findById(id: string): Promise<Product | null> {
    try {
      const { data, error } = await this.client
        .from('products')
        .select('*, images:product_images(*), category:categories(*), collection:collections(*)')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        this.handleError(error, `Failed to fetch product with id: ${id}`);
      }
      return data as Product;
    } catch (err) {
      this.handleError(err, `Error fetching product by id: ${id}`);
    }
  }

  async findReviewsByProductId(productId: string): Promise<Review[]> {
    try {
      const { data, error } = await this.client
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .in('status', ['approved', 'featured'])
        .order('created_at', { ascending: false });

      if (error) this.handleError(error, `Failed to fetch reviews for product ${productId}`);
      return (data as Review[]) || [];
    } catch (err) {
      this.handleError(err, 'Error fetching fragrance reviews');
    }
  }

  async create(input: ProductInput): Promise<Product> {
    try {
      const { data, error } = await this.client
        .from('products')
        .insert(input)
        .select()
        .single();

      if (error) this.handleError(error, 'Failed to create fragrance formulation');
      return data as Product;
    } catch (err) {
      this.handleError(err, 'Failed to insert product record');
    }
  }

  async update(id: string, input: Partial<ProductInput>): Promise<Product> {
    try {
      const { data, error } = await this.client
        .from('products')
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (error) this.handleError(error, `Failed to update product ${id}`);
      return data as Product;
    } catch (err) {
      this.handleError(err, `Error updating product ${id}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const { error } = await this.client.from('products').delete().eq('id', id);
      if (error) this.handleError(error, `Failed to delete product ${id}`);
    } catch (err) {
      this.handleError(err, `Error deleting product ${id}`);
    }
  }
}

export const productRepository = new ProductRepository();
