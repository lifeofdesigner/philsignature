import { userRepository, type UserRepository } from '@/repositories/UserRepository';
import type { Profile } from '@/types/database';

export class UserService {
  constructor(private repo: UserRepository = userRepository) {}

  async getUserProfile(userId: string): Promise<Profile | null> {
    return this.repo.getProfile(userId);
  }

  async updateProfile(userId: string, data: Partial<Profile>): Promise<Profile> {
    return this.repo.updateProfile(userId, data);
  }

  async getAllCustomers(): Promise<Profile[]> {
    return this.repo.findAllCustomers();
  }

  async setCustomerActiveStatus(userId: string, isActive: boolean): Promise<Profile> {
    return this.repo.setActiveStatus(userId, isActive);
  }
}

export const userService = new UserService();

