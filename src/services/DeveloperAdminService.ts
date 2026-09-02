import { developerAdminRepository, type DeveloperAdminRepository } from '@/repositories/DeveloperAdminRepository';
import { AuthService } from './AuthService';
import { ValidationError } from '@/errors/ValidationError';
import type { Profile, UserRole } from '@/types/database';

export class DeveloperAdminService {
  constructor(private repo: DeveloperAdminRepository = developerAdminRepository) {}

  isAvailable(): boolean {
    return this.repo.isAvailable();
  }

  async createUser(params: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
  }): Promise<void> {
    if (!params.email.trim() || !params.firstName.trim() || !params.lastName.trim()) {
      throw new ValidationError('Email, first name, and last name are required');
    }
    const passwordCheck = AuthService.validatePassword(params.password);
    if (!passwordCheck.valid) {
      throw new ValidationError(passwordCheck.errors[0]);
    }
    return this.repo.createUser(params);
  }

  async deleteUser(userId: string): Promise<void> {
    if (!userId) throw new ValidationError('User ID is required');
    return this.repo.deleteUser(userId);
  }

  async setUserPassword(userId: string, newPassword: string): Promise<void> {
    const passwordCheck = AuthService.validatePassword(newPassword);
    if (!passwordCheck.valid) {
      throw new ValidationError(passwordCheck.errors[0]);
    }
    return this.repo.setUserPassword(userId, newPassword);
  }

  async listUsers(): Promise<Profile[]> {
    return this.repo.listUsers();
  }

  async setRole(userId: string, newRole: UserRole): Promise<void> {
    if (!userId) throw new ValidationError('User ID is required');
    return this.repo.setRole(userId, newRole);
  }
}

export const developerAdminService = new DeveloperAdminService();
