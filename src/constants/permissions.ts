export const PERMISSIONS = {
  MANAGE_PRODUCTS: 'manage_products',
  MANAGE_ORDERS: 'manage_orders',
  MANAGE_CUSTOMERS: 'manage_customers',
  MANAGE_CMS: 'manage_cms',
  MANAGE_MEDIA: 'manage_media',
  MANAGE_SETTINGS: 'manage_settings',
  MANAGE_USERS: 'manage_users',
  VIEW_ANALYTICS: 'view_analytics',
} as const;

export type AppPermission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

