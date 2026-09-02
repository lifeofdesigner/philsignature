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
    const role = this.extractRole(user);
    return role === 'super_admin' || role === 'administrator' || role === 'manager' || role === 'inventory_staff' || role === 'staff';
  }

  static canDeleteProduct(user?: UserContext | Profile | UserRole | null): boolean {
    const role = this.extractRole(user);
    return role === 'super_admin' || role === 'administrator';
  }

  static canManageOrders(user?: UserContext | Profile | UserRole | null): boolean {
    const role = this.extractRole(user);
    return role === 'super_admin' || role === 'administrator' || role === 'manager' || role === 'order_staff' || role === 'staff';
  }

  static canDeleteOrder(user?: UserContext | Profile | UserRole | null): boolean {
    return this.isSuperAdmin(user);
  }

  static canManageCMS(user?: UserContext | Profile | UserRole | null): boolean {
    const role = this.extractRole(user);
    return role === 'super_admin' || role === 'administrator' || role === 'manager' || role === 'content_editor' || role === 'staff';
  }

  static canManageUsers(user?: UserContext | Profile | UserRole | null): boolean {
    return this.isSuperAdmin(user);
  }

  static canEditSettings(user?: UserContext | Profile | UserRole | null): boolean {
    const role = this.extractRole(user);
    return role === 'super_admin' || role === 'administrator';
  }

  static canDeleteMedia(user?: UserContext | Profile | UserRole | null): boolean {
    const role = this.extractRole(user);
    return role === 'super_admin' || role === 'administrator';
  }

  static canViewAnalytics(user?: UserContext | Profile | UserRole | null): boolean {
    const role = this.extractRole(user);
    return role === 'super_admin' || role === 'administrator' || role === 'manager' || role === 'staff';
  }

  static canModerateReviews(user?: UserContext | Profile | UserRole | null): boolean {
    const role = this.extractRole(user);
    return role === 'super_admin' || role === 'administrator' || role === 'manager' || role === 'customer_support' || role === 'staff';
  }
}

export const permissionEngine = PermissionEngine;
