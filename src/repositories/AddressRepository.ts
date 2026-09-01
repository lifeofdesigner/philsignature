import { BaseRepository } from './BaseRepository';
import type { CustomerAddress } from '@/types/database';

export interface AddressInput {
  customer_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code?: string;
  country?: string;
  is_default?: boolean;
}

export class AddressRepository extends BaseRepository {
  async findByCustomerId(customerId: string): Promise<CustomerAddress[]> {
    try {
      const { data, error } = await this.client
        .from('customer_addresses')
        .select('*')
        .eq('customer_id', customerId)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) this.handleError(error, 'Failed to fetch customer addresses');
      return (data as CustomerAddress[]) || [];
    } catch (err) {
      this.handleError(err, 'Error querying customer addresses');
    }
  }

  async create(input: AddressInput): Promise<CustomerAddress> {
    try {
      if (input.is_default) {
        // Demote previous default address
        await this.client
          .from('customer_addresses')
          .update({ is_default: false })
          .eq('customer_id', input.customer_id);
      }

      const { data, error } = await this.client
        .from('customer_addresses')
        .insert(input)
        .select()
        .single();

      if (error) this.handleError(error, 'Failed to save shipping address');
      return data as CustomerAddress;
    } catch (err) {
      this.handleError(err, 'Error creating customer address record');
    }
  }

  async update(id: string, input: Partial<AddressInput>): Promise<CustomerAddress> {
    try {
      if (input.is_default && input.customer_id) {
        await this.client
          .from('customer_addresses')
          .update({ is_default: false })
          .eq('customer_id', input.customer_id);
      }

      const { data, error } = await this.client
        .from('customer_addresses')
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (error) this.handleError(error, 'Failed to update customer address');
      return data as CustomerAddress;
    } catch (err) {
      this.handleError(err, `Error updating customer address ${id}`);
    }
  }

  async delete(id: string, customerId: string): Promise<void> {
    try {
      const { error } = await this.client
        .from('customer_addresses')
        .delete()
        .eq('id', id)
        .eq('customer_id', customerId);

      if (error) this.handleError(error, 'Failed to delete shipping address');
    } catch (err) {
      this.handleError(err, `Error deleting address ${id}`);
    }
  }
}

export const addressRepository = new AddressRepository();

