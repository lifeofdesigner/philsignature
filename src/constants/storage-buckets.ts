export const STORAGE_BUCKETS = {
  PRODUCTS: 'products',
  BANNERS: 'banners',
  BRANDING: 'branding',
  INVOICES: 'invoices',
} as const;

export type AppStorageBucket = (typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS];

