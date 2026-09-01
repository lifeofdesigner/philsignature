# PHILZ SIGNATURE Database Architecture

## Relational Schema Design (Supabase / PostgreSQL)

### 1. Core Tables
- **`profiles`**: User metadata, full name, phone number, avatar, role (`super_admin`, `staff`, `customer`).
- **`roles` & `user_roles`**: Granular RBAC tables for role assignments.
- **`categories`**: Perfume formulations (Extrait de Parfum, Eau de Parfum, Home Fragrance, Body Elixirs).
- **`collections`**: Curated boutique selections (Private Reserve, Signature Classics, Oud Edition).
- **`products`**:
  - Identity: `id`, `name`, `slug`, `sku`, `barcode`, `tagline`, `description`, `details`.
  - Financials: `price`, `sale_price`, `stock_quantity`, `weight_grams`.
  - Classification: `brand`, `category_id`, `collection_id`, `fragrance_family`.
  - Olfactory Pyramid: `top_notes` (text[]), `middle_notes` (text[]), `base_notes` (text[]).
  - Attributes: `ingredients`, `how_to_use`, `status` (`draft`, `published`, `archived`).
  - Badges: `is_featured`, `is_bestseller`, `is_new_arrival`, `is_trending`.
  - SEO: `meta_title`, `meta_description`, `meta_keywords`.
- **`product_images`**: Multi-image gallery (`product_id`, `image_url`, `alt_text`, `display_order`, `is_primary`).
- **`product_videos`**: Cinematic fragrance promotional reels (`product_id`, `video_url`, `thumbnail_url`).
- **`coupons`**: Discount engine (`code`, `discount_type`, `value`, `min_spend`, `max_discount`, `usage_limit`, `used_count`, `expires_at`, `is_active`).
- **`shipping_methods`**: Delivery tiers (`name`, `description`, `price`, `free_threshold`, `estimated_days`, `is_active`).
- **`orders`**:
  - `order_number` (`PS-XXXXXX`), `customer_id`, `email`, `phone`.
  - `financial_status` (`pending`, `paid`, `refunded`, `failed`).
  - `fulfillment_status` (`pending`, `processing`, `packed`, `shipped`, `delivered`, `cancelled`).
  - Financial breakdowns: `subtotal`, `shipping_amount`, `discount_amount`, `tax_amount`, `total_amount`.
  - `payment_method` (`paystack`, `flutterwave`, `bank_transfer`, `cod`), `payment_reference`.
  - `shipping_address` (jsonb snapshot).
- **`order_items`**: Line items linked to orders and snapshot prices.
- **`order_timeline`**: Event stream for tracking (`status`, `description`, `created_at`).
- **`reviews`**: Customer reviews (`product_id`, `customer_id`, `rating`, `title`, `comment`, `status`, `is_featured`).
- **`wishlist`**: Customer wishlist items (`customer_id`, `product_id`).
- **`customer_addresses`**: Saved user addresses (`customer_id`, `address_line1`, `city`, `state`, `postal_code`, `country`, `is_default`).
- **`cms_content`**: Keyed editable visual sections (`key`, `section`, `content`, `is_published`).
- **`site_settings`**: Global store configuration (`key`, `value`, `type`, `description`).
- **`media`**: Supabase storage references (`file_name`, `bucket`, `path`, `file_type`, `size_bytes`).
- **`activity_logs`**: Admin audit logs (`user_id`, `action`, `entity_type`, `entity_id`, `details`).

### 2. Row Level Security (RLS)
- Public `SELECT` enabled for `published` products, categories, collections, approved reviews, active shipping methods, and published CMS content.
- Authenticated customer access restricted to their own orders, profile, wishlist, and addresses (`auth.uid() = customer_id`).
- Admin write and update privileges restricted to verified `staff` or `super_admin` roles via secure PostgreSQL functions.

