import { callAdminApi } from '@/lib/adminApiClient';
import { SupabaseError } from '@/errors/SupabaseError';
import type { Profile, UserRole } from '@/types/database';

/**
 * Client for the privileged user-management actions used by the Developer
 * Bootstrap console and the admin "New Staff / Admin Account" flow.
 * These all call server-side /api/admin/users/* endpoints, which validate
 * the caller's session and role, then use the service-role key internally
 * (server-only). No privileged key ever reaches the browser.
 */
export class DeveloperAdminRepository {
  isAvailable(): boolean {
    return true;
  }

  async createUser(params: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
  }): Promise<void> {
    try {
      await callAdminApi('/api/admin/users/create', { body: params });
    } catch (err) {
      throw new SupabaseError(err instanceof Error ? err.message : 'User creation failed');
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      await callAdminApi('/api/admin/users/delete', { body: { userId } });
    } catch (err) {
      throw new SupabaseError(err instanceof Error ? err.message : 'Delete user failed');
    }
  }

  async setUserPassword(userId: string, newPassword: string): Promise<void> {
    try {
      await callAdminApi('/api/admin/users/set-password', { body: { userId, password: newPassword } });
    } catch (err) {
      throw new SupabaseError(err instanceof Error ? err.message : 'Password reset failed');
    }
  }

  async listUsers(): Promise<Profile[]> {
    try {
      const result = await callAdminApi<{ users: Profile[] }>('/api/admin/users/list', { method: 'GET' });
      return result.users || [];
    } catch (err) {
      throw new SupabaseError(err instanceof Error ? err.message : 'Failed to list users');
    }
  }

  async setRole(userId: string, newRole: UserRole): Promise<void> {
    try {
      await callAdminApi('/api/admin/users/set-role', { body: { userId, role: newRole } });
    } catch (err) {
      throw new SupabaseError(err instanceof Error ? err.message : 'Role change failed');
    }
  }
}

export const developerAdminRepository = new DeveloperAdminRepository();
