import { addressRepository, type AddressRepository, type AddressInput } from '@/repositories/AddressRepository';
import { ValidationError } from '@/errors/ValidationError';
import type { CustomerAddress } from '@/types/database';

export class AddressService {
  constructor(private repo: AddressRepository = addressRepository) {}

  async getAddresses(customerId: string): Promise<CustomerAddress[]> {
    if (!customerId) throw new ValidationError('Customer ID required to retrieve addresses');
    return this.repo.findByCustomerId(customerId);
  }

  async saveAddress(input: AddressInput): Promise<CustomerAddress> {
    if (!input.customer_id) throw new ValidationError('Customer ID required');
    if (!input.first_name) throw new ValidationError('First name is required');
    if (!input.last_name) throw new ValidationError('Last name is required');
    if (!input.phone) throw new ValidationError('Phone number is required');
    if (!input.address_line1) throw new ValidationError('Street address is required');
    if (!input.city) throw new ValidationError('City is required');
    if (!input.state) throw new ValidationError('State is required');

    return this.repo.create(input);
  }

  async updateAddress(id: string, input: Partial<AddressInput>): Promise<CustomerAddress> {
    if (!id) throw new ValidationError('Address ID required for update');
    return this.repo.update(id, input);
  }

  async removeAddress(id: string, customerId: string): Promise<void> {
    if (!id || !customerId) throw new ValidationError('Address and Customer ID required for deletion');
    return this.repo.delete(id, customerId);
  }
}

export const addressService = new AddressService();

