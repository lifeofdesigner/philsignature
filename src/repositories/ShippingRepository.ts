import { BaseRepository } from './BaseRepository';
import type { ShippingMethod } from '@/types/database';

export class ShippingRepository extends BaseRepository {
  async findActive(): Promise<ShippingMethod[]> {
    try {
      const { data, error } = await this.client
        .from('shipping_methods')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) this.handleError(error, 'Failed to fetch shipping methods');
      return (data as ShippingMethod[]) || [];
    } catch (err) {
      this.handleError(err, 'Error querying shipping options');
    }
  }

  async findById(id: string): Promise<ShippingMethod | null> {
    try {
      const { data, error } = await this.client
        .from('shipping_methods')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        this.handleError(error, `Failed to fetch shipping method ${id}`);
      }
      return data as ShippingMethod;
    } catch (err) {
      this.handleError(err, `Error fetching shipping method ${id}`);
    }
  }
}

export const shippingRepository = new ShippingRepository();

