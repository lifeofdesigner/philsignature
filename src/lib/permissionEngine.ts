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

  static canCreateProduct(user?: UserContext | Profile | UserRole | null): boolean {
    return this.isStaff(user);
  }

  static canEditProduct(user?: UserContext | Profile | UserRole | null): boolean {
    return this.isStaff(user);
  }

  static canDeleteProduct(user?: UserContext | Profile | UserRole | null): boolean {
    return this.isSuperAdmin(user);
  }

  static canViewOrders(user?: UserContext | Profile | UserRole | null): boolean {
    return this.isStaff(user);
  }

  static canUpdateOrderStatus(user?: UserContext | Profile | UserRole | null): boolean {
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

  static canViewAnalytics(user?: UserContext | Profile | UserRole | null): boolean {
    return this.isStaff(user);
  }

  static canManageSettings(user?: UserContext | Profile | UserRole | null): boolean {
    return this.isSuperAdmin(user);
  }

  static canModerateReviews(user?: UserContext | Profile | UserRole | null): boolean {
    return this.isStaff(user);
  }
}

export const permissionEngine = PermissionEngine;

