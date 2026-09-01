import type { Profile, UserRole } from '@/types/database';

export interface UserContext {
  id?: string;
  role?: UserRole;
  isActive?: boolean;
}

export class PermissionEngine {
  private static extractRole(userOrRole?: UserContext | Profile | UserRole | null): UserRole | null {
    if (!userOrRole) return null;
    if (typeof userOrRole === 'string') return userOrRole as UserRole;
    return userOrRole.role || null;
  }

  static isSuperAdmin(user?: UserContext | Profile | UserRole | null): boolean {
    return this.extractRole(user) === 'super_admin';
  }

  static isStaff(user?: UserContext | Profile | UserRole | null): boolean {
    const role = this.extractRole(user);
    return role === 'staff' || role === 'super_admin';
  }

  static isCustomer(user?: UserContext | Profile | UserRole | null): boolean {
    return this.extractRole(user) === 'customer';
  }

  // Capability checks (No role === 'admin' in UI)
  static canAccessAdmin(user?: UserContext | Profile | UserRole | null): boolean {
    return this.isStaff(user);
  }

  static canAccessCustomer(user?: UserContext | Profile | UserRole | null): boolean {
    return Boolean(user);
  }

  static canManageProducts(user?: UserContext | Profile | UserRole | null): boolean {
    return this.isStaff(user);
  }

  static canDeleteProduct(user?: UserContext | Profile | UserRole | null): boolean {
    return this.isSuperAdmin(user);
  }

  static canManageOrders(user?: UserContext | Profile | UserRole | null): boolean {
    return this.isStaff(user);
  }

  static canDeleteOrder(user?: UserContext | Profile | UserRole | null): boolean {
    return this.isSuperAdmin(user);
  }

  static canManageCMS(user?: UserContext | Profile | UserRole | null): boolean {
    return this.isStaff(user);
  }

  static canManageUsers(user?: UserContext | Profile | UserRole | null): boolean {
    return this.isSuperAdmin(user);
  }

  static canEditSettings(user?: UserContext | Profile | UserRole | null): boolean {
    return this.isSuperAdmin(user);
  }

  static canDeleteMedia(user?: UserContext | Profile | UserRole | null): boolean {
    return this.isSuperAdmin(user);
  }

  static canViewAnalytics(user?: UserContext | Profile | UserRole | null): boolean {
    return this.isStaff(user);
  }

  static canModerateReviews(user?: UserContext | Profile | UserRole | null): boolean {
    return this.isStaff(user);
  }
}

export const permissionEngine = PermissionEngine;
