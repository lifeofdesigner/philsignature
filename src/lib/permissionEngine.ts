import type { Profile, UserRole } from '@/types/database';
import { hasPermission, isSuperAdmin as isSuperAdminRole } from '@/lib/permissions';

export interface UserContext {
  id?: string;
  role?: UserRole;
  isActive?: boolean;
}

/**
 * Thin wrapper around the dynamic RBAC matrix in `lib/permissions.ts`.
 * Delegates every check to `hasPermission()` so that a super admin's saved
 * role-permission matrix (synced from the DB in AuthProvider) is the single
 * source of truth — this used to hardcode its own role lists, which silently
 * ignored whatever the super admin configured in the Admin Users RBAC editor.
 */
export class PermissionEngine {
  private static extractRole(userOrRole?: UserContext | Profile | UserRole | null): UserRole | null {
    if (!userOrRole) return null;
    if (typeof userOrRole === 'string') return userOrRole as UserRole;
    return userOrRole.role || null;
  }

  static isSuperAdmin(user?: UserContext | Profile | UserRole | null): boolean {
    return isSuperAdminRole(this.extractRole(user));
  }

  static isStaff(user?: UserContext | Profile | UserRole | null): boolean {
    const role = this.extractRole(user);
    if (!role || role === 'customer') return false;
    return true; // Any non-customer role is part of the operational team
  }

  static isCustomer(user?: UserContext | Profile | UserRole | null): boolean {
    return this.extractRole(user) === 'customer';
  }

  // Capability checks
  static canAccessAdmin(user?: UserContext | Profile | UserRole | null): boolean {
    return this.isStaff(user);
  }

  static canAccessCustomer(user?: UserContext | Profile | UserRole | null): boolean {
    return Boolean(user);
  }

  static canManageProducts(user?: UserContext | Profile | UserRole | null): boolean {
    return hasPermission(this.extractRole(user), 'products:write');
  }

  static canDeleteProduct(user?: UserContext | Profile | UserRole | null): boolean {
    return hasPermission(this.extractRole(user), 'products:delete');
  }

  static canManageOrders(user?: UserContext | Profile | UserRole | null): boolean {
    return hasPermission(this.extractRole(user), 'orders:write');
  }

  static canDeleteOrder(user?: UserContext | Profile | UserRole | null): boolean {
    return hasPermission(this.extractRole(user), 'delete:anything');
  }

  static canManageCMS(user?: UserContext | Profile | UserRole | null): boolean {
    return hasPermission(this.extractRole(user), 'cms:write');
  }

  static canManageUsers(user?: UserContext | Profile | UserRole | null): boolean {
    return hasPermission(this.extractRole(user), 'users:manage');
  }

  static canEditSettings(user?: UserContext | Profile | UserRole | null): boolean {
    return hasPermission(this.extractRole(user), 'settings:manage');
  }

  static canDeleteMedia(user?: UserContext | Profile | UserRole | null): boolean {
    return hasPermission(this.extractRole(user), 'media:manage');
  }

  static canViewAnalytics(user?: UserContext | Profile | UserRole | null): boolean {
    return hasPermission(this.extractRole(user), 'analytics:view');
  }

  static canModerateReviews(user?: UserContext | Profile | UserRole | null): boolean {
    return hasPermission(this.extractRole(user), 'reviews:manage');
  }
}

export const permissionEngine = PermissionEngine;
