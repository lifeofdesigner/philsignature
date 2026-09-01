-- ==============================================================================
-- PHILZ SIGNATURE — 001_initial_schema.sql
-- Enterprise PostgreSQL Relational Database Schema
-- ==============================================================================

-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Clean existing schema if re-running
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS media CASCADE;
DROP TABLE IF EXISTS site_settings CASCADE;
DROP TABLE IF EXISTS cms_content CASCADE;
DROP TABLE IF EXISTS customer_addresses CASCADE;
DROP TABLE IF EXISTS wishlist CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS order_timeline CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS shipping_methods CASCADE;
DROP TABLE IF EXISTS coupons CASCADE;
DROP TABLE IF EXISTS product_videos CASCADE;
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS collections CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- ------------------------------------------------------------------------------
-- 1. PROFILES (Linked to auth.users)
-- ------------------------------------------------------------------------------
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('super_admin', 'staff', 'customer')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);

-- ------------------------------------------------------------------------------
-- 2. CATEGORIES (Fragrance Formulations)
-- ------------------------------------------------------------------------------
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_categories_slug ON categories(slug);

-- ------------------------------------------------------------------------------
-- 3. COLLECTIONS (Curated Lines: Private Reserve, Oud Edition, etc.)
-- ------------------------------------------------------------------------------
CREATE TABLE collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    tagline TEXT,
    description TEXT,
    image_url TEXT,
    banner_url TEXT,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_collections_slug ON collections(slug);

-- ------------------------------------------------------------------------------
-- 4. PRODUCTS (Haute Parfumerie Catalog)
-- ------------------------------------------------------------------------------
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    tagline TEXT,
    description TEXT NOT NULL,
    details TEXT,
    sku TEXT NOT NULL UNIQUE,
    barcode TEXT,
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    sale_price NUMERIC(12, 2) CHECK (sale_price IS NULL OR (sale_price >= 0 AND sale_price < price)),
    stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    weight_grams INT DEFAULT 500,
    volume_ml INT DEFAULT 100,
    concentration TEXT DEFAULT 'Extrait de Parfum',
    brand TEXT NOT NULL DEFAULT 'PHILZ SIGNATURE',
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    collection_id UUID REFERENCES collections(id) ON DELETE SET NULL,
    fragrance_family TEXT CHECK (fragrance_family IN ('Woody', 'Oriental', 'Floral', 'Fresh', 'Gourmand', 'Chypre', 'Aromatic')),
    top_notes TEXT[] DEFAULT '{}',
    middle_notes TEXT[] DEFAULT '{}',
    base_notes TEXT[] DEFAULT '{}',
    ingredients TEXT,
    how_to_use TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_bestseller BOOLEAN NOT NULL DEFAULT false,
    is_new_arrival BOOLEAN NOT NULL DEFAULT false,
    is_trending BOOLEAN NOT NULL DEFAULT false,
    rating NUMERIC(3, 2) DEFAULT 5.00,
    reviews_count INT DEFAULT 0,
    meta_title TEXT,
    meta_description TEXT,
    meta_keywords TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_collection ON products(collection_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_family ON products(fragrance_family);

-- ------------------------------------------------------------------------------
-- 5. PRODUCT IMAGES (Multi-Angle Photography Gallery)
-- ------------------------------------------------------------------------------
CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text TEXT,
    display_order INT NOT NULL DEFAULT 0,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_product_images_product ON product_images(product_id);

-- ------------------------------------------------------------------------------
-- 6. PRODUCT VIDEOS (Cinematic Promotional Reels)
-- ------------------------------------------------------------------------------
CREATE TABLE product_videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    title TEXT,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_product_videos_product ON product_videos(product_id);

-- ------------------------------------------------------------------------------
-- 7. COUPONS (Privilege Discount Engine)
-- ------------------------------------------------------------------------------
CREATE TABLE coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL UNIQUE,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    value NUMERIC(10, 2) NOT NULL CHECK (value > 0),
    min_spend NUMERIC(10, 2) DEFAULT 0,
    max_discount NUMERIC(10, 2),
    usage_limit INT,
    used_count INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    starts_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_coupons_code ON coupons(code);

-- ------------------------------------------------------------------------------
-- 8. SHIPPING METHODS (Logistics & Delivery Tiers)
-- ------------------------------------------------------------------------------
CREATE TABLE shipping_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (price >= 0),
    free_threshold NUMERIC(10, 2) DEFAULT 150000,
    estimated_days TEXT NOT NULL DEFAULT '2-4 Business Days',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 9. ORDERS (Client Transactions & Consignments)
-- ------------------------------------------------------------------------------
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT NOT NULL UNIQUE,
    customer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    financial_status TEXT NOT NULL DEFAULT 'pending' CHECK (financial_status IN ('pending', 'paid', 'refunded', 'failed')),
    fulfillment_status TEXT NOT NULL DEFAULT 'pending' CHECK (fulfillment_status IN ('pending', 'processing', 'packed', 'shipped', 'delivered', 'cancelled')),
    subtotal NUMERIC(12, 2) NOT NULL CHECK (subtotal >= 0),
    shipping_amount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (shipping_amount >= 0),
    discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
    tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (tax_amount >= 0),
    total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
    payment_method TEXT NOT NULL CHECK (payment_method IN ('paystack', 'flutterwave', 'bank_transfer', 'cod')),
    payment_reference TEXT,
    shipping_method_id UUID REFERENCES shipping_methods(id) ON DELETE SET NULL,
    shipping_address JSONB NOT NULL,
    billing_address JSONB,
    customer_notes TEXT,
    admin_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_email ON orders(email);
CREATE INDEX idx_orders_financial_status ON orders(financial_status);
CREATE INDEX idx_orders_fulfillment_status ON orders(fulfillment_status);

-- ------------------------------------------------------------------------------
-- 10. ORDER ITEMS (Purchased Fragrances Snapshot)
-- ------------------------------------------------------------------------------
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    sku TEXT NOT NULL,
    price NUMERIC(12, 2) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    total NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_order_items_order ON order_items(order_id);

-- ------------------------------------------------------------------------------
-- 11. ORDER TIMELINE (Consignment Milestone Stream)
-- ------------------------------------------------------------------------------
CREATE TABLE order_timeline (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_order_timeline_order ON order_timeline(order_id);

-- ------------------------------------------------------------------------------
-- 12. REVIEWS (Verified Client Olfactory Testimonials)
-- ------------------------------------------------------------------------------
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    comment TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'approved', 'rejected', 'featured')),
    is_verified_purchase BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_customer ON reviews(customer_id);
CREATE INDEX idx_reviews_status ON reviews(status);

-- ------------------------------------------------------------------------------
-- 13. WISHLIST (Saved Luxury Extraits)
-- ------------------------------------------------------------------------------
CREATE TABLE wishlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(customer_id, product_id)
);

CREATE INDEX idx_wishlist_customer ON wishlist(customer_id);

-- ------------------------------------------------------------------------------
-- 14. CUSTOMER ADDRESSES (Delivery Destinations)
-- ------------------------------------------------------------------------------
CREATE TABLE customer_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    postal_code TEXT,
    country TEXT NOT NULL DEFAULT 'Nigeria',
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_customer_addresses_customer ON customer_addresses(customer_id);

-- ------------------------------------------------------------------------------
-- 15. CMS CONTENT (Visual Narrative & Banners)
-- ------------------------------------------------------------------------------
CREATE TABLE cms_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT NOT NULL UNIQUE,
    section TEXT NOT NULL,
    title TEXT NOT NULL,
    content JSONB NOT NULL DEFAULT '{}',
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cms_content_key ON cms_content(key);
CREATE INDEX idx_cms_content_section ON cms_content(section);

-- ------------------------------------------------------------------------------
-- 16. SITE SETTINGS (Global Boutique Configuration)
-- ------------------------------------------------------------------------------
CREATE TABLE site_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT NOT NULL UNIQUE,
    value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_site_settings_key ON site_settings(key);

-- ------------------------------------------------------------------------------
-- 17. MEDIA (Storage Assets Registry)
-- ------------------------------------------------------------------------------
CREATE TABLE media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_name TEXT NOT NULL,
    bucket TEXT NOT NULL,
    path TEXT NOT NULL UNIQUE,
    file_type TEXT,
    size_bytes BIGINT,
    alt_text TEXT,
    uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_media_bucket ON media(bucket);

-- ------------------------------------------------------------------------------
-- 18. ACTIVITY LOGS (Admin Audit Trail)
-- ------------------------------------------------------------------------------
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);

