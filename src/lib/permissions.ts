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
  | 'cms:instagram'
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
  | 'payments:manage_gateways'
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
  admin: 'Administrator',
  administrator: 'Administrator',
  store_manager: 'Store Manager',
  manager: 'Store Manager',
  content_manager: 'Content Manager',
  content_editor: 'Content Editor',
  marketing: 'Marketing Manager',
  customer_support: 'Customer Concierge Support',
  finance: 'Finance & Payments Lead',
  inventory_staff: 'Inventory Specialist',
  sales_staff: 'Sales & POS Specialist',
  order_staff: 'Order Fulfillment Staff',
  staff: 'General Staff',
  customer: 'Customer',
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  super_admin: 'Full unrestricted system access. Manages roles, users, theme builder, security, settings, and audit logs.',
  admin: 'Manages products, orders, customers, media, pages, content, marketing, reports, staff accounts and role assignment. Cannot create Super Admins or access system settings.',
  administrator: 'Manages products, orders, customers, media, pages, content, marketing, reports, staff accounts and role assignment. Cannot create Super Admins or access system settings.',
  store_manager: 'Manages orders, inventory, customers, discounts, shipping, products. Cannot edit CMS, themes, or settings.',
  manager: 'Manages orders, inventory, customers, discounts, shipping, products. Cannot edit CMS, themes, or settings.',
  content_manager: 'Curates homepage, CMS, pages, blog, menus, hero, footer, instagram, media library, and SEO.',
  content_editor: 'Curates homepage, CMS, pages, blog, menus, hero, footer, instagram, media library, and SEO.',
  marketing: 'Manages coupons, discounts, email campaigns, SEO, analytics, homepage banners, and Instagram feed.',
  customer_support: 'Assists customers, manages orders, handles ticket messages, returns, and FAQs.',
  finance: 'Accesses payments, transactions, financial reports, sales analytics, and processes refunds.',
  inventory_staff: 'Manages inventory, stock levels, suppliers, purchase orders, and product catalog.',
  sales_staff: 'Manages orders, POS, customer checkouts, invoices, and payment tracking.',
  order_staff: 'Handles order fulfillment, parcel dispatch, courier tracking, and shipping logistics.',
  staff: 'General staff with order and product viewing access.',
  customer: 'Storefront client account.',
};

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: [
    'cms:read', 'cms:write', 'cms:publish', 'cms:hero', 'cms:menu', 'cms:homepage', 'cms:appearance', 'cms:instagram',
    'products:read', 'products:write', 'products:delete', 'inventory:manage', 'categories:manage', 'collections:manage', 'media:manage',
    'orders:read', 'orders:write', 'orders:shipping', 'shipping:manage', 'payments:view', 'analytics:view',
    'customers:read', 'customers:write', 'reviews:manage', 'coupons:manage',
    'users:read', 'users:manage', 'roles:manage', 'settings:manage', 'security:manage', 'delete:anything',
  ],

  admin: [
    'cms:read', 'cms:write', 'cms:publish', 'cms:hero', 'cms:menu', 'cms:homepage', 'cms:instagram',
    'products:read', 'products:write', 'products:delete', 'inventory:manage', 'categories:manage', 'collections:manage', 'media:manage',
    'orders:read', 'orders:write', 'orders:shipping', 'payments:view', 'payments:manage_gateways', 'analytics:view',
    'customers:read', 'customers:write', 'reviews:manage', 'coupons:manage',
    'users:read', 'users:manage', 'roles:manage',
  ],

  administrator: [
    'cms:read', 'cms:write', 'cms:publish', 'cms:hero', 'cms:menu', 'cms:homepage', 'cms:instagram',
    'products:read', 'products:write', 'products:delete', 'inventory:manage', 'categories:manage', 'collections:manage', 'media:manage',
    'orders:read', 'orders:write', 'orders:shipping', 'payments:view', 'payments:manage_gateways', 'analytics:view',
    'customers:read', 'customers:write', 'reviews:manage', 'coupons:manage',
    'users:read', 'users:manage', 'roles:manage',
  ],

  store_manager: [
    'products:read', 'products:write', 'inventory:manage', 'categories:manage', 'collections:manage',
    'orders:read', 'orders:write', 'orders:shipping', 'shipping:manage',
    'customers:read', 'customers:write', 'reviews:manage', 'coupons:manage',
  ],

  manager: [
    'products:read', 'products:write', 'inventory:manage', 'categories:manage', 'collections:manage',
    'orders:read', 'orders:write', 'orders:shipping', 'shipping:manage',
    'customers:read', 'customers:write', 'reviews:manage', 'coupons:manage',
  ],

  content_manager: [
    'cms:read', 'cms:write', 'cms:publish', 'cms:hero', 'cms:menu', 'cms:homepage', 'cms:appearance', 'cms:instagram',
    'collections:manage', 'media:manage', 'products:read',
  ],

  content_editor: [
    'cms:read', 'cms:write', 'cms:publish', 'cms:hero', 'cms:menu', 'cms:homepage', 'cms:appearance', 'cms:instagram',
    'collections:manage', 'media:manage', 'products:read',
  ],

  marketing: [
    'coupons:manage', 'analytics:view', 'cms:read', 'cms:hero', 'cms:homepage', 'cms:instagram', 'media:manage', 'products:read',
  ],

  customer_support: [
    'customers:read', 'customers:write', 'orders:read', 'orders:write', 'reviews:manage', 'products:read',
  ],

  finance: [
    'payments:view', 'analytics:view', 'orders:read', 'customers:read',
  ],

  inventory_staff: [
    'products:read', 'products:write', 'inventory:manage', 'categories:manage', 'collections:manage', 'media:manage',
  ],

  sales_staff: [
    'orders:read', 'orders:write', 'customers:read', 'customers:write', 'products:read',
  ],

  order_staff: [
    'orders:read', 'orders:write', 'orders:shipping', 'shipping:manage', 'products:read',
  ],

  staff: [
    'orders:read', 'products:read', 'customers:read', 'reviews:manage',
  ],

  customer: [],
};

// In-memory active matrix initialized from localStorage (if exists) or fallback default
const RBAC_STORAGE_KEY = 'philz_rbac_permissions';

// Maps old permission slugs (renamed or retired) to their current equivalent,
// so permission matrices cached in localStorage before a rename still work.
const PERMISSION_MIGRATIONS: Partial<Record<string, Permission>> = {
  'payments:manage_paystack': 'payments:manage_gateways',
};

function migratePermissionList(permissions: string[]): Permission[] {
  const migrated = permissions.map((p) => PERMISSION_MIGRATIONS[p] || (p as Permission));
  return Array.from(new Set(migrated));
}

function getStoredPermissions(): Record<UserRole, Permission[]> {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(RBAC_STORAGE_KEY) : null;
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, string[]>;
      const migrated = Object.fromEntries(
        Object.entries(parsed).map(([role, perms]) => [role, migratePermissionList(perms)])
      ) as Record<UserRole, Permission[]>;
      // Ensure super_admin retains all permissions
      return {
        ...ROLE_PERMISSIONS,
        ...migrated,
        super_admin: ROLE_PERMISSIONS.super_admin,
      };
    }
  } catch {
    // fallback
  }
  return { ...ROLE_PERMISSIONS };
}

let activeRolePermissions: Record<UserRole, Permission[]> = getStoredPermissions();

/**
 * Returns active permissions for a specific role.
 */
export function getRolePermissions(role: UserRole): Permission[] {
  if (role === 'super_admin') return ROLE_PERMISSIONS.super_admin;
  return activeRolePermissions[role] || ROLE_PERMISSIONS[role] || [];
}

/**
 * Returns the entire active role-permissions matrix.
 */
export function getAllRolePermissions(): Record<UserRole, Permission[]> {
  return {
    ...activeRolePermissions,
    super_admin: ROLE_PERMISSIONS.super_admin,
  };
}

/**
 * Updates the active dynamic permissions matrix across the application.
 */
export function setDynamicRolePermissions(matrix: Record<UserRole, Permission[]>): void {
  const migrated = Object.fromEntries(
    Object.entries(matrix).map(([role, perms]) => [role, migratePermissionList(perms)])
  ) as Record<UserRole, Permission[]>;
  activeRolePermissions = {
    ...ROLE_PERMISSIONS,
    ...migrated,
    super_admin: ROLE_PERMISSIONS.super_admin,
  };
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(RBAC_STORAGE_KEY, JSON.stringify(activeRolePermissions));
      window.dispatchEvent(new CustomEvent('philz_rbac_updated', { detail: activeRolePermissions }));
    }
  } catch (e) {
    console.debug('Failed to write RBAC permissions to localStorage:', e);
  }
}

/**
 * Resets dynamic permissions back to system defaults.
 */
export function resetRolePermissionsToDefault(): Record<UserRole, Permission[]> {
  activeRolePermissions = { ...ROLE_PERMISSIONS };
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(RBAC_STORAGE_KEY);
      window.dispatchEvent(new CustomEvent('philz_rbac_updated', { detail: activeRolePermissions }));
    }
  } catch (e) {
    console.debug('Failed to clear RBAC permissions from localStorage:', e);
  }
  return activeRolePermissions;
}

/**
 * Checks whether a user role is a super admin.
 */
export function isSuperAdmin(role: UserRole | undefined | null): boolean {
  return role === 'super_admin';
}

/**
 * Checks whether a user role possesses a specific permission.
 */
export function hasPermission(role: UserRole | undefined | null, permission: Permission): boolean {
  if (!role) return false;
  if (role === 'super_admin') return true;
  const permissions = getRolePermissions(role);
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
  if (cleanPath.startsWith('/admin/blog')) {
    return hasPermission(role, 'cms:read') || role === 'admin' || role === 'administrator';
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
    return hasPermission(role, 'settings:manage') || role === 'admin' || role === 'administrator';
  }
  if (cleanPath.startsWith('/admin/email-templates')) {
    return role === 'admin' || role === 'administrator';
  }
  if (cleanPath.startsWith('/admin/seo')) {
    return hasPermission(role, 'cms:read');
  }

  return false;
}
