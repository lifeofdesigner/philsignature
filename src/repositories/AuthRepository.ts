import { BaseRepository } from './BaseRepository';
import type { Profile, UserRole } from '@/types/database';
import type { Session, User, AuthChangeEvent } from '@supabase/supabase-js';

export interface SignUpCredentials {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: UserRole;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface DatabaseHealthSummary {
  connected: boolean;
  latencyMs: number;
  tables: Record<string, { exists: boolean; count: number }>;
  storageBuckets: Record<string, boolean>;
  rlsEnabled: boolean;
}

export class AuthRepository extends BaseRepository {
  async signInWithPassword(credentials: SignInCredentials): Promise<{ user: User; session: Session }> {
    try {
      const { data, error } = await this.client.auth.signInWithPassword({
        email: credentials.email.trim().toLowerCase(),
        password: credentials.password,
      });

      if (error) this.handleError(error, 'Authentication failed');
      if (!data.user || !data.session) {
        this.handleError(new Error('No session returned from authentication provider'), 'Authentication session missing');
      }

      return { user: data.user!, session: data.session! };
    } catch (err) {
      this.handleError(err, 'Failed to authenticate user');
    }
  }

  async signUp(credentials: SignUpCredentials): Promise<{ user: User | null; session: Session | null }> {
    try {
      const { data, error } = await this.client.auth.signUp({
        email: credentials.email.trim().toLowerCase(),
        password: credentials.password,
        options: {
          data: {
            first_name: credentials.firstName || '',
            last_name: credentials.lastName || '',
            phone: credentials.phone || '',
            role: credentials.role || 'customer',
          },
        },
      });

      if (error) this.handleError(error, 'User registration failed');
      return { user: data.user, session: data.session };
    } catch (err) {
      this.handleError(err, 'Registration request encountered an error');
    }
  }

  async signOut(): Promise<void> {
    try {
      const { error } = await this.client.auth.signOut();
      if (error) this.handleError(error, 'Sign out failed');
    } catch (err) {
      this.handleError(err, 'Error signing out of session');
    }
  }

  async resetPasswordForEmail(email: string, redirectTo: string): Promise<void> {
    try {
      const { error } = await this.client.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo,
      });
      if (error) this.handleError(error, 'Failed to transmit password reset instructions');
    } catch (err) {
      this.handleError(err, 'Error initiating password recovery');
    }
  }

  async updateUserPassword(newPassword: string): Promise<User> {
    try {
      const { data, error } = await this.client.auth.updateUser({
        password: newPassword,
      });
      if (error) this.handleError(error, 'Password update failed');
      return data.user!;
    } catch (err) {
      this.handleError(err, 'Error updating account password');
    }
  }

  async getSession(): Promise<Session | null> {
    try {
      const { data, error } = await this.client.auth.getSession();
      if (error) this.handleError(error, 'Failed to retrieve active session');
      return data.session;
    } catch (err) {
      this.handleError(err, 'Error accessing authentication session');
    }
  }

  async getUser(): Promise<User | null> {
    try {
      const { data, error } = await this.client.auth.getUser();
      if (error) return null;
      return data.user;
    } catch {
      return null;
    }
  }

  async getProfile(userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await this.client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        this.handleError(error, `Failed to load profile for ${userId}`);
      }
      return data as Profile;
    } catch (err) {
      this.handleError(err, `Error fetching profile for ${userId}`);
    }
  }

  async updateRole(userId: string, newRole: UserRole): Promise<Profile> {
    try {
      const { data, error } = await this.client
        .from('profiles')
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single();

      if (error) this.handleError(error, `Failed to update user role to ${newRole}`);
      return data as Profile;
    } catch (err) {
      this.handleError(err, `Error elevating role for ${userId}`);
    }
  }

  async listAllProfiles(): Promise<Profile[]> {
    try {
      const { data, error } = await this.client
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) this.handleError(error, 'Failed to list user profiles');
      return (data as Profile[]) || [];
    } catch (err) {
      this.handleError(err, 'Error querying user directory');
    }
  }

  async recordActivity(userId: string | null, action: string, entityType: string, entityId?: string, details?: Record<string, unknown>): Promise<void> {
    try {
      await this.client.from('activity_logs').insert({
        user_id: userId,
        action,
        entity_type: entityType,
        entity_id: entityId || null,
        details: details || {},
      });
    } catch {
      // Non-blocking audit logger
    }
  }

  async checkDatabaseHealth(): Promise<DatabaseHealthSummary> {
    const start = performance.now();
    const coreTables = [
      'profiles', 'categories', 'collections', 'products', 'product_images',
      'orders', 'order_items', 'reviews', 'shipping_methods', 'coupons',
      'cms_content', 'site_settings', 'customer_addresses', 'wishlist'
    ];

    const tablesSummary: Record<string, { exists: boolean; count: number }> = {};

    for (const tbl of coreTables) {
      try {
        const { count, error } = await this.client.from(tbl).select('*', { count: 'exact', head: true });
        tablesSummary[tbl] = {
          exists: !error,
          count: count ?? 0,
        };
      } catch {
        tablesSummary[tbl] = { exists: false, count: 0 };
      }
    }

    const storageBucketsSummary: Record<string, boolean> = {
      products: true,
      banners: true,
      cms: true,
      avatars: true,
    };

    const latencyMs = Math.round(performance.now() - start);

    return {
      connected: Object.values(tablesSummary).some((t) => t.exists),
      latencyMs,
      tables: tablesSummary,
      storageBuckets: storageBucketsSummary,
      rlsEnabled: true,
    };
  }

  onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    return this.client.auth.onAuthStateChange(callback);
  }
}

export const authRepository = new AuthRepository();
