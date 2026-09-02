import type { UserRole } from '@/types/database';

export type Permission =
  // CMS & Content
  | 'cms:read'
  | 'cms:write'
  | 'cms:publish'
  | 'cms:hero'
  | 'cms:menu'
  | 'cms:homepage'
  | 'cms:appearance'
  // Catalog & Inventory
  | 'products:read'
  | 'products:write'
  | 'products:delete'
  | 'inventory:manage'
  | 'categories:manage'
  | 'collections:manage'
  | 'media:manage'
  // Sales & Orders
  | 'orders:read'
  | 'orders:write'
  | 'orders:shipping'
  | 'shipping:manage'
  | 'payments:view'
  | 'analytics:view'
  // Customers & Community
  | 'customers:read'
  | 'customers:write'
  | 'reviews:manage'
  | 'coupons:manage'
  // Administration & Security
  | 'users:read'
  | 'users:manage'
  | 'roles:manage'
  | 'settings:manage'
  | 'security:manage'
  | 'delete:anything';

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Administrator',
  administrator: 'Administrator',
  manager: 'Store Manager',
  content_editor: 'Content Editor',
  inventory_staff: 'Inventory Specialist',
  order_staff: 'Fulfillment & Orders Staff',
  customer_support: 'Customer Concierge Support',
  staff: 'General Staff',
  customer: 'Customer',
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  super_admin: 'Full unrestricted system access. Manages roles, users, payments, security, and global settings.',
  administrator: 'Broad operational control. Manages catalog, orders, and CMS. Cannot delete Super Admins or alter core system security.',
  manager: 'Manages products, inventory, orders, customers, reviews, discounts, and CMS. Cannot manage users.',
  content_editor: 'Curates visual storytelling, hero slider, homepage sections, navigation menus, and media.',
  inventory_staff: 'Controls catalog products, batch stock levels, categories, and fragrance collections.',
  order_staff: 'Handles customer order fulfillment, parcel dispatch, courier tracking, and shipping rates.',
  customer_support: 'Assists customers, manages reviews, handles tickets, with read-only product access.',
  staff: 'General back-office staff with basic order and catalog viewing permissions.',
  customer: 'Standard client storefront account.',
};

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: [
    'cms:read', 'cms:write', 'cms:publish', 'cms:hero', 'cms:menu', 'cms:homepage', 'cms:appearance',
    'products:read', 'products:write', 'products:delete', 'inventory:manage', 'categories:manage', 'collections:manage', 'media:manage',
    'orders:read', 'orders:write', 'orders:shipping', 'shipping:manage', 'payments:view', 'analytics:view',
    'customers:read', 'customers:write', 'reviews:manage', 'coupons:manage',
    'users:read', 'users:manage', 'roles:manage', 'settings:manage', 'security:manage', 'delete:anything',
  ],

  administrator: [
    'cms:read', 'cms:write', 'cms:publish', 'cms:hero', 'cms:menu', 'cms:homepage', 'cms:appearance',
    'products:read', 'products:write', 'products:delete', 'inventory:manage', 'categories:manage', 'collections:manage', 'media:manage',
    'orders:read', 'orders:write', 'orders:shipping', 'shipping:manage', 'payments:view', 'analytics:view',
    'customers:read', 'customers:write', 'reviews:manage', 'coupons:manage',
    'users:read', 'settings:manage',
  ],

  manager: [
    'cms:read', 'cms:write', 'cms:publish', 'cms:hero', 'cms:menu', 'cms:homepage',
    'products:read', 'products:write', 'inventory:manage', 'categories:manage', 'collections:manage', 'media:manage',
    'orders:read', 'orders:write', 'orders:shipping', 'shipping:manage', 'analytics:view',
    'customers:read', 'customers:write', 'reviews:manage', 'coupons:manage',
  ],

  content_editor: [
    'cms:read', 'cms:write', 'cms:publish', 'cms:hero', 'cms:menu', 'cms:homepage', 'cms:appearance',
    'collections:manage', 'media:manage', 'products:read',
  ],

  inventory_staff: [
    'products:read', 'products:write', 'inventory:manage', 'categories:manage', 'collections:manage', 'media:manage',
  ],

  order_staff: [
    'orders:read', 'orders:write', 'orders:shipping', 'shipping:manage', 'products:read',
  ],

  customer_support: [
    'customers:read', 'customers:write', 'orders:read', 'reviews:manage', 'products:read',
  ],

  staff: [
    'orders:read', 'products:read', 'customers:read', 'reviews:manage',
  ],

  customer: [],
};

/**
 * Checks whether a user role possesses a specific permission.
 */
export function hasPermission(role: UserRole | undefined | null, permission: Permission): boolean {
  if (!role) return false;
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

/**
 * Checks whether a role can access a specific admin path.
 */
export function canAccessAdminPath(role: UserRole | undefined | null, path: string): boolean {
  if (!role || role === 'customer') return false;
  if (role === 'super_admin') return true;

  const cleanPath = path.split('?')[0];

  if (cleanPath === '/admin' || cleanPath === '/admin/') {
    return true; // Dashboard accessible to all staff roles
  }

  if (cleanPath.startsWith('/admin/products')) {
    return hasPermission(role, 'products:read');
  }
  if (cleanPath.startsWith('/admin/collections')) {
    return hasPermission(role, 'collections:manage');
  }
  if (cleanPath.startsWith('/admin/categories')) {
    return hasPermission(role, 'categories:manage');
  }
  if (cleanPath.startsWith('/admin/orders')) {
    return hasPermission(role, 'orders:read');
  }
  if (cleanPath.startsWith('/admin/shipping')) {
    return hasPermission(role, 'shipping:manage');
  }
  if (cleanPath.startsWith('/admin/customers')) {
    return hasPermission(role, 'customers:read');
  }
  if (cleanPath.startsWith('/admin/cms')) {
    return hasPermission(role, 'cms:read');
  }
  if (cleanPath.startsWith('/admin/media')) {
    return hasPermission(role, 'media:manage');
  }
  if (cleanPath.startsWith('/admin/coupons')) {
    return hasPermission(role, 'coupons:manage');
  }
  if (cleanPath.startsWith('/admin/reviews')) {
    return hasPermission(role, 'reviews:manage');
  }
  if (cleanPath.startsWith('/admin/payments')) {
    return hasPermission(role, 'payments:view');
  }
  if (cleanPath.startsWith('/admin/analytics')) {
    return hasPermission(role, 'analytics:view');
  }
  if (cleanPath.startsWith('/admin/users')) {
    return hasPermission(role, 'users:read');
  }
  if (cleanPath.startsWith('/admin/settings')) {
    return hasPermission(role, 'settings:manage');
  }
  if (cleanPath.startsWith('/admin/seo')) {
    return hasPermission(role, 'cms:read');
  }

  return false;
}
