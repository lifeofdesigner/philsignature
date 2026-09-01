import { wishlistRepository, type WishlistRepository } from '@/repositories/WishlistRepository';
import { productRepository, type ProductRepository } from '@/repositories/ProductRepository';
import type { Product } from '@/types/database';

const GUEST_WISHLIST_KEY = 'philz_guest_wishlist';

export class WishlistService {
  constructor(
    private wishlistRepo: WishlistRepository = wishlistRepository,
    private productRepo: ProductRepository = productRepository
  ) {}

  private getGuestIds(): string[] {
    try {
      const stored = localStorage.getItem(GUEST_WISHLIST_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private setGuestIds(ids: string[]): void {
    try {
      localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(ids));
    } catch {
      // Local storage disabled or full
    }
  }

  async getWishlistIds(customerId?: string): Promise<string[]> {
    if (!customerId) {
      return this.getGuestIds();
    }
    return this.wishlistRepo.getWishlistProductIds(customerId);
  }

  async getWishlistProducts(customerId?: string): Promise<Product[]> {
    if (!customerId) {
      const ids = this.getGuestIds();
      if (ids.length === 0) return [];
      const all = await this.productRepo.findAll();
      return all.filter((p) => ids.includes(p.id));
    }
    return this.wishlistRepo.getWishlistProducts(customerId);
  }

  async toggleWishlist(productId: string, customerId?: string): Promise<{ inWishlist: boolean }> {
    if (!customerId) {
      const ids = this.getGuestIds();
      const exists = ids.includes(productId);
      const next = exists ? ids.filter((id) => id !== productId) : [...ids, productId];
      this.setGuestIds(next);
      return { inWishlist: !exists };
    }

    const currentIds = await this.wishlistRepo.getWishlistProductIds(customerId);
    const exists = currentIds.includes(productId);

    if (exists) {
      await this.wishlistRepo.removeFromWishlist(customerId, productId);
      return { inWishlist: false };
    } else {
      await this.wishlistRepo.addToWishlist(customerId, productId);
      return { inWishlist: true };
    }
  }

  async mergeGuestWishlist(customerId: string): Promise<void> {
    const guestIds = this.getGuestIds();
    if (guestIds.length === 0) return;

    for (const id of guestIds) {
      await this.wishlistRepo.addToWishlist(customerId, id);
    }
    localStorage.removeItem(GUEST_WISHLIST_KEY);
  }
}

export const wishlistService = new WishlistService();

