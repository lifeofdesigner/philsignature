export type UserRole =
  | 'super_admin'
  | 'admin'
  | 'administrator'
  | 'store_manager'
  | 'manager'
  | 'content_manager'
  | 'content_editor'
  | 'marketing'
  | 'customer_support'
  | 'finance'
  | 'inventory_staff'
  | 'sales_staff'
  | 'order_staff'
  | 'staff'
  | 'customer';

export type ProductStatus = 'draft' | 'published' | 'archived';
export type FragranceFamily = 'Woody' | 'Oriental' | 'Floral' | 'Fresh' | 'Gourmand' | 'Chypre' | 'Aromatic';

export interface Role {
  id: string;
  key: string;
  name: string;
  description: string | null;
  is_system: boolean;
  created_at: string;
  updated_at: string;
  permissions?: Permission[];
}

export interface Permission {
  id: string;
  key: string;
  name: string;
  group_name: string;
  description: string | null;
  created_at: string;
}

export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string | null;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface TrashItem {
  id: string;
  entity_type: string;
  entity_id: string;
  entity_name: string;
  payload: Record<string, unknown>;
  deleted_by: string | null;
  created_at: string;
}

export interface CmsVersion {
  id: string;
  entity_type: string;
  entity_id: string;
  version_number: number;
  title: string | null;
  content: Record<string, unknown>;
  created_by: string | null;
  created_at: string;
}

export interface AdminNotification {
  id: string;
  user_id: string | null;
  type: string;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export interface EntityLock {
  id: string;
  entity_type: string;
  entity_id: string;
  locked_by: string;
  locked_by_name: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  image_url: string | null;
  banner_url: string | null;
  is_featured: boolean;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text: string | null;
  display_order: number;
  is_primary: boolean;
  created_at: string;
}

export interface ProductVideo {
  id: string;
  product_id: string;
  video_url: string;
  thumbnail_url: string | null;
  title: string | null;
  created_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  size_ml: number;
  price: number;
  sale_price: number | null;
  stock_quantity: number;
  sku: string;
  is_default: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string;
  short_description?: string | null;
  details: string | null;
  scent_profile?: string | null;
  best_for?: string | null;
  display_order?: number;
  sku: string;
  barcode: string | null;
  price: number;
  sale_price: number | null;
  stock_quantity: number;
  weight_grams: number | null;
  volume_ml?: number;
  concentration?: string;
  brand: string;
  category_id: string | null;
  collection_id: string | null;
  fragrance_family: FragranceFamily | string | null;
  top_notes: string[];
  middle_notes: string[];
  base_notes: string[];
  ingredients: string | null;
  how_to_use: string | null;
  status: ProductStatus;
  is_featured: boolean;
  is_bestseller: boolean;
  is_new_arrival: boolean;
  is_trending: boolean;
  rating?: number;
  reviews_count?: number;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  created_at: string;
  updated_at: string;
  // Joins
  images?: ProductImage[];
  videos?: ProductVideo[];
  variants?: ProductVariant[];
  category?: Category;
  collection?: Collection;
}

export type OrderFinancialStatus = 'pending' | 'paid' | 'refunded' | 'failed';
export type OrderFulfillmentStatus = 'pending' | 'processing' | 'packed' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentGateway = 'paystack' | 'flutterwave' | 'bank_transfer' | 'cod';

export type OrderStatus = OrderFulfillmentStatus;
export type PaymentStatus = OrderFinancialStatus;
export type ShippingStatus = OrderFulfillmentStatus;

export interface CustomerAddress {
  id: string;
  customer_id: string;
  first_name: string;
  last_name: string;
  company?: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface ShippingMethod {
  id: string;
  name: string;
  description: string | null;
  price: number;
  free_threshold: number | null;
  estimated_days: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed';
  value: number;
  min_spend: number | null;
  max_discount: number | null;
  usage_limit: number | null;
  used_count: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_slug: string;
  product_image_url: string | null;
  sku: string | null;
  price: number;
  quantity: number;
  subtotal: number;
  created_at: string;
}

export interface OrderTimeline {
  id: string;
  order_id: string;
  status: string;
  title: string;
  description: string | null;
  created_by: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string | null;
  email: string;
  phone: string;
  financial_status: OrderFinancialStatus;
  fulfillment_status: OrderFulfillmentStatus;
  subtotal: number;
  shipping_amount: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  payment_method: PaymentGateway;
  payment_reference: string | null;
  tracking_number: string | null;
  carrier_name: string | null;
  notes: string | null;
  coupon_code?: string | null;
  shipping_address: Partial<CustomerAddress>;
  billing_address?: Partial<CustomerAddress>;
  items?: OrderItem[];
  timeline?: OrderTimeline[];
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  customer_id: string | null;
  rating: number; // 1-5
  title: string | null;
  comment: string;
  status: 'submitted' | 'approved' | 'rejected';
  is_verified_purchase: boolean;
  created_at: string;
  updated_at: string;
  // Joins
  customer?: Pick<Profile, 'first_name' | 'last_name' | 'email'>;
  product?: Pick<Product, 'name' | 'slug'>;
}

export interface WishlistItem {
  id: string;
  customer_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
}

export interface CmsContent {
  id: string;
  key: string;
  section: string;
  title: string;
  content: Record<string, unknown>;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export type MediaBucket = 'products' | 'banners' | 'cms' | 'avatars';

export interface SiteSetting {
  id: string;
  key: string;
  value: unknown;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface MediaItem {
  id: string;
  file_name: string;
  bucket: string;
  path: string;
  file_type: string;
  size_bytes: number;
  alt_text: string | null;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

