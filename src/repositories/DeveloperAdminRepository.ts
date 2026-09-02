import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { SupabaseError } from '@/errors/SupabaseError';
import type { Profile, UserRole } from '@/types/database';

/**
 * Wraps Supabase Admin API calls (auth.admin.*) for the local-only
 * Developer Bootstrap console. Requires VITE_SUPABASE_SERVICE_ROLE_KEY.
 * Do not import this repository outside src/features/developer/bootstrap.
 */
export class DeveloperAdminRepository {
  private requireAdminClient() {
    const client = getSupabaseAdmin();
    if (!client) {
      throw new SupabaseError(
        'Service role key not configured. Set VITE_SUPABASE_SERVICE_ROLE_KEY to use this feature.'
      );
    }
    return client;
  }

  async createUser(params: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
  }): Promise<void> {
    const admin = this.requireAdminClient();

    const { data, error } = await admin.auth.admin.createUser({
      email: params.email.trim().toLowerCase(),
      password: params.password,
      email_confirm: true,
      user_metadata: { first_name: params.firstName, last_name: params.lastName },
    });

    if (error) throw new SupabaseError(error.message, error);
    if (!data.user) throw new SupabaseError('User creation returned no user record');

    // The handle_new_user trigger creates the profile row; wait briefly then set the role.
    // Uses the admin (service-role) client since this console has no authenticated
    // Supabase session of its own -- the passphrase gate is local-only and does not
    // sign in via supabase.auth, so the anon client would have no RLS-granted access.
    await new Promise((resolve) => setTimeout(resolve, 500));

    const { error: profileError } = await admin
      .from('profiles')
      .update({ first_name: params.firstName, last_name: params.lastName, role: params.role })
      .eq('id', data.user.id);

    if (profileError) throw new SupabaseError(profileError.message, profileError);
  }

  async deleteUser(userId: string): Promise<void> {
    const admin = this.requireAdminClient();
    const { error } = await admin.auth.admin.deleteUser(userId);
    if (error) throw new SupabaseError(error.message, error);
  }

  async setUserPassword(userId: string, newPassword: string): Promise<void> {
    const admin = this.requireAdminClient();
    const { error } = await admin.auth.admin.updateUserById(userId, { password: newPassword });
    if (error) throw new SupabaseError(error.message, error);
  }

  isAvailable(): boolean {
    return getSupabaseAdmin() !== null;
  }

  /**
   * Lists profiles via the admin client. Needed because this console has no
   * authenticated Supabase session -- the anon client can only see the caller's
   * own profile row under RLS, so authService.listUsers() (anon client) returns
   * nothing here even though it works correctly from an authenticated admin session.
   */
  async listUsers(): Promise<Profile[]> {
    const admin = this.requireAdminClient();
    const { data, error } = await admin.from('profiles').select('*').order('created_at', { ascending: false });
    if (error) throw new SupabaseError(error.message, error);
    return (data as Profile[]) || [];
  }

  async setRole(userId: string, newRole: UserRole): Promise<void> {
    const admin = this.requireAdminClient();
    const { error } = await admin
      .from('profiles')
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq('id', userId);
    if (error) throw new SupabaseError(error.message, error);
  }
}

export const developerAdminRepository = new DeveloperAdminRepository();
