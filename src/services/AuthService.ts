import { authRepository, type AuthRepository, type SignUpCredentials, type SignInCredentials, type DatabaseHealthSummary } from '@/repositories/AuthRepository';
import { ValidationError } from '@/errors/ValidationError';
import { Email } from '@/domain/customer/valueObjects/Email';
import type { Profile, UserRole } from '@/types/database';
import type { Session, User } from '@supabase/supabase-js';

export class AuthService {
  constructor(private repo: AuthRepository = authRepository) {}

  static validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!password || password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one numeral');
    }
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    return { valid: errors.length === 0, errors };
  }

  async login(credentials: SignInCredentials): Promise<{ user: User; session: Session; profile: Profile | null }> {
    if (!Email.isValid(credentials.email)) {
      throw new ValidationError('A valid email address is required');
    }
    if (!credentials.password) {
      throw new ValidationError('Password is required');
    }

    const { user, session } = await this.repo.signInWithPassword(credentials);
    const profile = await this.repo.getProfile(user.id);

    if (profile && !profile.is_active) {
      await this.repo.signOut();
      throw new ValidationError('This account has been deactivated. Please consult Concierge.');
    }

    await this.repo.recordActivity(user.id, 'AUTH_LOGIN', 'profiles', user.id, {
      email: credentials.email,
      timestamp: new Date().toISOString(),
    });

    return { user, session, profile };
  }

  async register(credentials: SignUpCredentials): Promise<{ user: User | null; session: Session | null }> {
    if (!Email.isValid(credentials.email)) {
      throw new ValidationError('A valid email address is required');
    }

    const passwordCheck = AuthService.validatePassword(credentials.password);
    if (!passwordCheck.valid) {
      throw new ValidationError(passwordCheck.errors[0], { password: passwordCheck.errors });
    }

    const result = await this.repo.signUp(credentials);

    if (result.user) {
      await this.repo.recordActivity(result.user.id, 'AUTH_REGISTER', 'profiles', result.user.id, {
        email: credentials.email,
        role: credentials.role || 'customer',
      });
    }

    return result;
  }

  async logout(userId?: string): Promise<void> {
    if (userId) {
      await this.repo.recordActivity(userId, 'AUTH_LOGOUT', 'profiles', userId);
    }
    await this.repo.signOut();
  }

  async requestPasswordReset(email: string, redirectTo?: string): Promise<void> {
    if (!Email.isValid(email)) {
      throw new ValidationError('A valid email address is required');
    }
    const redirect = redirectTo || `${window.location.origin}/reset-password`;
    await this.repo.resetPasswordForEmail(email, redirect);
  }

  async updatePassword(newPassword: string): Promise<User> {
    const passwordCheck = AuthService.validatePassword(newPassword);
    if (!passwordCheck.valid) {
      throw new ValidationError(passwordCheck.errors[0], { password: passwordCheck.errors });
    }
    const user = await this.repo.updateUserPassword(newPassword);
    await this.repo.recordActivity(user.id, 'PASSWORD_UPDATE', 'profiles', user.id);
    return user;
  }

  async getActiveSession(): Promise<{ session: Session | null; user: User | null; profile: Profile | null }> {
    const session = await this.repo.getSession();
    if (!session || !session.user) {
      return { session: null, user: null, profile: null };
    }
    const profile = await this.repo.getProfile(session.user.id);
    return { session, user: session.user, profile };
  }

  async elevateUserRole(targetUserId: string, newRole: UserRole, currentSuperAdminId: string): Promise<Profile> {
    // Protection: do not demote the last super_admin
    if (newRole !== 'super_admin') {
      const allProfiles = await this.repo.listAllProfiles();
      const superAdmins = allProfiles.filter((p) => p.role === 'super_admin' && p.is_active);
      if (superAdmins.length === 1 && superAdmins[0].id === targetUserId) {
        throw new ValidationError('Security guard: Cannot demote the sole surviving Super Admin');
      }
    }

    const updated = await this.repo.updateRole(targetUserId, newRole);

    await this.repo.recordActivity(currentSuperAdminId, 'ROLE_ELEVATION', 'profiles', targetUserId, {
      new_role: newRole,
      executed_by: currentSuperAdminId,
    });

    return updated;
  }

  async listUsers(): Promise<Profile[]> {
    return this.repo.listAllProfiles();
  }

  async getDiagnosticSummary(): Promise<DatabaseHealthSummary> {
    return this.repo.checkDatabaseHealth();
  }

  async provisionSuperAdmin(credentials: SignUpCredentials): Promise<User | null> {
    const result = await this.register({
      ...credentials,
      role: 'super_admin',
    });

    if (result.user) {
      await this.repo.updateRole(result.user.id, 'super_admin');
    }

    return result.user;
  }
}

export const authService = new AuthService();

