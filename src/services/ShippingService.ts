import { shippingRepository, type ShippingRepository } from '@/repositories/ShippingRepository';
import { shippingMethodSchema } from '@/schemas/shipping.schema';
import { ValidationError } from '@/errors/ValidationError';
import type { ShippingMethod } from '@/types/database';

export class ShippingService {
  constructor(private repo: ShippingRepository = shippingRepository) {}

  async getActiveMethods(): Promise<ShippingMethod[]> {
    return this.repo.findActive();
  }

  async getAllMethodsAdmin(): Promise<ShippingMethod[]> {
    return this.repo.findAllAdmin();
  }

  async createMethod(rawInput: unknown): Promise<ShippingMethod> {
    const parseResult = shippingMethodSchema.safeParse(rawInput);
    if (!parseResult.success) {
      throw new ValidationError('Invalid shipping method data', parseResult.error.format());
    }
    return this.repo.create(parseResult.data);
  }

  async updateMethod(id: string, rawInput: unknown): Promise<ShippingMethod> {
    const parseResult = shippingMethodSchema.partial().safeParse(rawInput);
    if (!parseResult.success) {
      throw new ValidationError('Invalid shipping method update data', parseResult.error.format());
    }
    return this.repo.update(id, parseResult.data);
  }

  async deleteMethod(id: string): Promise<void> {
    return this.repo.delete(id);
  }

  calculateShippingCost(method: ShippingMethod, subtotal: number): number {
    if (method.free_threshold && subtotal >= method.free_threshold) {
      return 0;
    }
    return method.price;
  }
}

export const shippingService = new ShippingService();

