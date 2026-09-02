import { BaseRepository } from './BaseRepository';
import type { ShippingMethod } from '@/types/database';
import type { ShippingMethodInput } from '@/schemas/shipping.schema';

export class ShippingRepository extends BaseRepository {
  async findAllAdmin(): Promise<ShippingMethod[]> {
    try {
      const { data, error } = await this.client
        .from('shipping_methods')
        .select('*')
        .order('price', { ascending: true });

      if (error) this.handleError(error, 'Failed to fetch shipping methods');
      return (data as ShippingMethod[]) || [];
    } catch (err) {
      this.handleError(err, 'Error fetching shipping methods');
    }
  }

  async create(input: ShippingMethodInput): Promise<ShippingMethod> {
    try {
      const { data, error } = await this.client.from('shipping_methods').insert(input).select().single();
      if (error) this.handleError(error, 'Failed to create shipping method');
      return data as ShippingMethod;
    } catch (err) {
      this.handleError(err, 'Error creating shipping method');
    }
  }

  async update(id: string, input: Partial<ShippingMethodInput>): Promise<ShippingMethod> {
    try {
      const { data, error } = await this.client
        .from('shipping_methods')
        .update({ ...input, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) this.handleError(error, 'Failed to update shipping method');
      return data as ShippingMethod;
    } catch (err) {
      this.handleError(err, 'Error updating shipping method');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const { error } = await this.client.from('shipping_methods').delete().eq('id', id);
      if (error) this.handleError(error, 'Failed to delete shipping method');
    } catch (err) {
      this.handleError(err, 'Error deleting shipping method');
    }
  }

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

