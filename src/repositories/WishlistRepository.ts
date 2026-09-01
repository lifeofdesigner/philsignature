import { BaseRepository } from './BaseRepository';
import type { Product } from '@/types/database';

export class WishlistRepository extends BaseRepository {
  async getWishlistProductIds(customerId: string): Promise<string[]> {
    try {
      const { data, error } = await this.client
        .from('wishlist')
        .select('product_id')
        .eq('customer_id', customerId);

      if (error) this.handleError(error, 'Failed to fetch wishlist IDs');
      return (data || []).map((row) => row.product_id);
    } catch (err) {
      this.handleError(err, 'Error querying wishlist identifiers');
    }
  }

  async getWishlistProducts(customerId: string): Promise<Product[]> {
    try {
      const { data, error } = await this.client
        .from('wishlist')
        .select('product:products(*, images:product_images(*), category:categories(*), collection:collections(*))')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (error) this.handleError(error, 'Failed to load wishlist items');
      // Supabase returns nested join as product property
      return (data || [])
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((row: any) => row.product)
        .filter(Boolean) as Product[];
    } catch (err) {
      this.handleError(err, 'Error loading full wishlist fragrances');
    }
  }

  async addToWishlist(customerId: string, productId: string): Promise<void> {
    try {
      const { error } = await this.client
        .from('wishlist')
        .upsert({ customer_id: customerId, product_id: productId }, { onConflict: 'customer_id,product_id' });

      if (error) this.handleError(error, 'Failed to add fragrance to wishlist');
    } catch (err) {
      this.handleError(err, 'Error inserting into wishlist table');
    }
  }

  async removeFromWishlist(customerId: string, productId: string): Promise<void> {
    try {
      const { error } = await this.client
        .from('wishlist')
        .delete()
        .eq('customer_id', customerId)
        .eq('product_id', productId);

      if (error) this.handleError(error, 'Failed to remove fragrance from wishlist');
    } catch (err) {
      this.handleError(err, 'Error removing from wishlist table');
    }
  }
}

export const wishlistRepository = new WishlistRepository();

