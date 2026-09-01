import { shippingRepository, type ShippingRepository } from '@/repositories/ShippingRepository';
import type { ShippingMethod } from '@/types/database';

export class ShippingService {
  constructor(private repo: ShippingRepository = shippingRepository) {}

  async getActiveMethods(): Promise<ShippingMethod[]> {
    return this.repo.findActive();
  }

  calculateShippingCost(method: ShippingMethod, subtotal: number): number {
    if (method.free_threshold && subtotal >= method.free_threshold) {
      return 0;
    }
    return method.price;
  }
}

export const shippingService = new ShippingService();

