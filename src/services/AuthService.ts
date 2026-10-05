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

    const email = credentials.email.trim().toLowerCase();

    // 1. Check account lockout state before attempting authentication
    const lockout = await this.repo.checkAccountLockout(email);
    if (lockout.is_locked) {
      const mins = Math.max(1, Math.ceil(lockout.remaining_seconds / 60));
      throw new ValidationError(
        `Account is locked due to 5 consecutive failed login attempts. Please check your email for unlock instructions or wait ${mins} minute${mins === 1 ? '' : 's'}.`
      );
    }

    // 2. Attempt Authentication
    let authResult: { user: User; session: Session };
    try {
      authResult = await this.repo.signInWithPassword(credentials);
    } catch (err: unknown) {
      // Record failure and increment attempts
      const failure = await this.repo.recordFailedLogin(
        email,
        undefined,
        typeof navigator !== 'undefined' ? navigator.userAgent : undefined
      );

      if (failure.is_locked) {
        // Trigger account recovery email
        if (typeof window !== 'undefined') {
          fetch('/api/email/dispatch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'password_reset',
              payload: {
                email,
                resetUrl: `${window.location.origin}/reset-password?unlockToken=${failure.unlock_token || ''}&email=${encodeURIComponent(email)}`,
              },
            }),
          }).catch((err) => console.error('[Email dispatch failed]', err));
        }

        throw new ValidationError(
          'Security lockout: 5 consecutive failed login attempts. An unlock link has been dispatched to your email.'
        );
      }

      const remaining = Math.max(0, 5 - failure.failed_attempts);
      throw new ValidationError(
        `Invalid credentials. You have ${remaining} attempt${remaining === 1 ? '' : 's'} remaining before account lockout.`
      );
    }

    const { user, session } = authResult;

    // 3. Email Verification Enforcement (must be confirmed within 24 hours)
    // Skipped while the user is mid-checkout (sessionStorage 'post_auth_redirect' is set by
    // the checkout auth gate) so an unverified customer can still complete their purchase.
    const isEmailVerified = Boolean(
      user.email_confirmed_at || (user as { confirmed_at?: string }).confirmed_at
    );
    const isInCheckoutSession =
      typeof window !== 'undefined' && sessionStorage.getItem('post_auth_redirect') === '/checkout';
    if (!isEmailVerified && !isInCheckoutSession) {
      const createdAt = new Date(user.created_at).getTime();
      const ageHours = (Date.now() - createdAt) / (1000 * 60 * 60);
      await this.repo.signOut();

      if (ageHours > 24) {
        throw new ValidationError(
          'Registration expired: Your email address was not verified within 24 hours. Please register again.'
        );
      }

      throw new ValidationError(
        'Email verification required: Please verify your email before logging in. Check your inbox for the activation link.'
      );
    }

    const profile = await this.repo.getProfile(user.id);

    if (profile && !profile.is_active) {
      await this.repo.signOut();
      throw new ValidationError('This account has been deactivated. Please consult Concierge.');
    }

    // 4. Record successful login and detect suspicious login (new device/IP)
    const loginAudit = await this.repo.recordSuccessfulLogin(
      user.id,
      email,
      undefined,
      typeof navigator !== 'undefined' ? navigator.userAgent : undefined
    );

    if (loginAudit.is_suspicious && typeof window !== 'undefined') {
      fetch('/api/email/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'new_login_alert',
          payload: {
            email,
            details: {
              date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
              time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
              device: (typeof navigator !== 'undefined' ? navigator.userAgent : 'Web Browser').slice(0, 60),
              ip: 'Client Device',
              location: 'Nigeria',
            },
          },
        }),
      }).catch((err) => console.error('[Email dispatch failed]', err));
    }

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

      // Dispatch Welcome + Verification Email
      if (typeof window !== 'undefined') {
        fetch('/api/email/dispatch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'welcome_verification',
            payload: {
              email: credentials.email,
              name: `${credentials.firstName || ''} ${credentials.lastName || ''}`.trim() || 'Valued Patron',
              verificationUrl: `${window.location.origin}/verify-email?email=${encodeURIComponent(credentials.email)}`,
            },
          }),
        }).catch((err) => console.error('[Email dispatch failed]', err));

        fetch('/api/email/dispatch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'admin_new_customer',
            payload: {
              details: {
                email: credentials.email,
                name: `${credentials.firstName || ''} ${credentials.lastName || ''}`.trim(),
                registeredAt: new Date().toISOString(),
              },
            },
          }),
        }).catch((err) => console.error('[Email dispatch failed]', err));
      }
    }

    return result;
  }

  async logout(userId?: string): Promise<void> {
    if (userId) {
      await this.repo.recordActivity(userId, 'AUTH_LOGOUT', 'profiles', userId);
    }
    await this.repo.signOut();
  }

  async signOutAllDevices(userId?: string): Promise<void> {
    if (userId) {
      await this.repo.recordActivity(userId, 'AUTH_SIGNOUT_ALL_DEVICES', 'profiles', userId);
    }
    await this.repo.signOutGlobal();
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

    // Dispatch Password Changed Alert
    if (user.email && typeof window !== 'undefined') {
      fetch('/api/email/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'password_changed_alert',
          payload: {
            email: user.email,
            details: {
              date: new Date().toLocaleDateString('en-GB'),
              time: new Date().toLocaleTimeString('en-GB'),
              ip: 'Client Session',
            },
          },
        }),
      }).catch((err) => console.error('[Email dispatch failed]', err));
    }

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

