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
-- ==============================================================================
-- PHILZ SIGNATURE — 002_security_rls.sql
-- Enterprise Row Level Security (RLS) Policies
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- Helper Security Function: is_admin
-- Checks if executing user has staff or super_admin role without recursive RLS
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM profiles
        WHERE id = user_id
        AND role IN ('super_admin', 'staff')
        AND is_active = true
    );
$$;

-- ------------------------------------------------------------------------------
-- Helper Security Function: is_super_admin
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_super_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM profiles
        WHERE id = user_id
        AND role = 'super_admin'
        AND is_active = true
    );
$$;

-- Enable RLS on all 18 tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 1. PROFILES POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can read own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id OR is_admin());

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id OR is_admin())
    WITH CHECK (auth.uid() = id OR is_admin());

CREATE POLICY "Super Admins can insert/delete profiles"
    ON profiles FOR ALL
    USING (is_super_admin());

-- ------------------------------------------------------------------------------
-- 2. CATEGORIES & COLLECTIONS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Public can view active categories"
    ON categories FOR SELECT
    USING (is_active = true OR is_admin());

CREATE POLICY "Admins manage categories"
    ON categories FOR ALL
    USING (is_admin());

CREATE POLICY "Public can view active collections"
    ON collections FOR SELECT
    USING (is_active = true OR is_admin());

CREATE POLICY "Admins manage collections"
    ON collections FOR ALL
    USING (is_admin());

-- ------------------------------------------------------------------------------
-- 3. PRODUCTS & MEDIA POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Public can view published products"
    ON products FOR SELECT
    USING (status = 'published' OR is_admin());

CREATE POLICY "Admins manage products"
    ON products FOR ALL
    USING (is_admin());

CREATE POLICY "Public can view product images"
    ON product_images FOR SELECT
    USING (true);

CREATE POLICY "Admins manage product images"
    ON product_images FOR ALL
    USING (is_admin());

CREATE POLICY "Public can view product videos"
    ON product_videos FOR SELECT
    USING (true);

CREATE POLICY "Admins manage product videos"
    ON product_videos FOR ALL
    USING (is_admin());

-- ------------------------------------------------------------------------------
-- 4. COUPONS & SHIPPING METHODS
-- ------------------------------------------------------------------------------
CREATE POLICY "Public can view active coupons"
    ON coupons FOR SELECT
    USING (is_active = true OR is_admin());

CREATE POLICY "Admins manage coupons"
    ON coupons FOR ALL
    USING (is_admin());

CREATE POLICY "Public can view active shipping methods"
    ON shipping_methods FOR SELECT
    USING (is_active = true OR is_admin());

CREATE POLICY "Admins manage shipping methods"
    ON shipping_methods FOR ALL
    USING (is_admin());

-- ------------------------------------------------------------------------------
-- 5. ORDERS & ITEMS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Customers view own orders"
    ON orders FOR SELECT
    USING (customer_id = auth.uid() OR is_admin());

CREATE POLICY "Anyone can create orders"
    ON orders FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Admins manage orders"
    ON orders FOR UPDATE
    USING (is_admin());

CREATE POLICY "Customers view own order items"
    ON order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM orders
            WHERE orders.id = order_items.order_id
            AND (orders.customer_id = auth.uid() OR is_admin())
        )
    );

CREATE POLICY "Anyone can insert order items with order"
    ON order_items FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Customers view own order timeline"
    ON order_timeline FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM orders
            WHERE orders.id = order_timeline.order_id
            AND (orders.customer_id = auth.uid() OR is_admin())
        )
    );

CREATE POLICY "Admins manage order timeline"
    ON order_timeline FOR ALL
    USING (is_admin());

-- ------------------------------------------------------------------------------
-- 6. REVIEWS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Public view approved reviews"
    ON reviews FOR SELECT
    USING (status IN ('approved', 'featured') OR is_admin());

CREATE POLICY "Customers can create reviews"
    ON reviews FOR INSERT
    WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Admins manage reviews"
    ON reviews FOR ALL
    USING (is_admin());

-- ------------------------------------------------------------------------------
-- 7. WISHLIST & ADDRESSES POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Customers manage own wishlist"
    ON wishlist FOR ALL
    USING (auth.uid() = customer_id)
    WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Customers manage own addresses"
    ON customer_addresses FOR ALL
    USING (auth.uid() = customer_id)
    WITH CHECK (auth.uid() = customer_id);

-- ------------------------------------------------------------------------------
-- 8. CMS, SETTINGS, MEDIA & AUDIT
-- ------------------------------------------------------------------------------
CREATE POLICY "Public view published CMS content"
    ON cms_content FOR SELECT
    USING (is_published = true OR is_admin());

CREATE POLICY "Admins manage CMS content"
    ON cms_content FOR ALL
    USING (is_admin());

CREATE POLICY "Public view site settings"
    ON site_settings FOR SELECT
    USING (true);

CREATE POLICY "Admins manage site settings"
    ON site_settings FOR ALL
    USING (is_admin());

CREATE POLICY "Public view media registry"
    ON media FOR SELECT
    USING (true);

CREATE POLICY "Admins manage media registry"
    ON media FOR ALL
    USING (is_admin());

CREATE POLICY "Admins view activity logs"
    ON activity_logs FOR SELECT
    USING (is_admin());

CREATE POLICY "System/Admins insert activity logs"
    ON activity_logs FOR INSERT
    WITH CHECK (true);
-- ==============================================================================
-- PHILZ SIGNATURE — 003_functions_and_triggers.sql
-- Stored Procedures, Functions & Triggers
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. TRIGGER FUNCTION: update_updated_at_column
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Apply updated_at trigger to tables
CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_collections_updated_at
    BEFORE UPDATE ON collections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_coupons_updated_at
    BEFORE UPDATE ON coupons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_shipping_methods_updated_at
    BEFORE UPDATE ON shipping_methods
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_reviews_updated_at
    BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_customer_addresses_updated_at
    BEFORE UPDATE ON customer_addresses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_cms_content_updated_at
    BEFORE UPDATE ON cms_content
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_site_settings_updated_at
    BEFORE UPDATE ON site_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 2. TRIGGER FUNCTION: handle_new_user (Auth Sync)
-- Automatically provisions public.profiles row when auth.users is created
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    default_role TEXT := 'customer';
BEGIN
    -- Check if first registered user or matching bootstrap admin email
    IF (SELECT COUNT(*) FROM profiles) = 0 THEN
        default_role := 'super_admin';
    END IF;

    INSERT INTO public.profiles (
        id,
        email,
        first_name,
        last_name,
        avatar_url,
        role
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL),
        COALESCE(NEW.raw_user_meta_data->>'role', default_role)
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        first_name = COALESCE(EXCLUDED.first_name, profiles.first_name),
        last_name = COALESCE(EXCLUDED.last_name, profiles.last_name),
        updated_at = NOW();

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 3. TRIGGER FUNCTION: update_product_rating
-- Recomputes rating average and review count when reviews mutate
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_product_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    target_product_id UUID;
    v_avg NUMERIC(3, 2);
    v_count INT;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        target_product_id := OLD.product_id;
    ELSE
        target_product_id := NEW.product_id;
    END IF;

    SELECT
        COALESCE(ROUND(AVG(rating)::numeric, 2), 5.00),
        COUNT(*)
    INTO v_avg, v_count
    FROM reviews
    WHERE product_id = target_product_id
    AND status IN ('approved', 'featured');

    UPDATE products
    SET
        rating = v_avg,
        reviews_count = v_count,
        updated_at = NOW()
    WHERE id = target_product_id;

    RETURN NULL;
END;
$$;

CREATE TRIGGER trg_reviews_rating_calc
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW EXECUTE FUNCTION public.update_product_rating();

-- ------------------------------------------------------------------------------
-- 4. FUNCTION: decrement_product_stock
-- Atomic inventory deduction for checkouts
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.decrement_product_stock(
    p_product_id UUID,
    p_quantity INT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE products
    SET
        stock_quantity = stock_quantity - p_quantity,
        updated_at = NOW()
    WHERE id = p_product_id
    AND stock_quantity >= p_quantity;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Insufficient stock for product id %', p_product_id;
    END IF;
END;
$$;

-- ------------------------------------------------------------------------------
-- 5. FUNCTION: increment_product_stock
-- Restocking on cancellations or returns
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.increment_product_stock(
    p_product_id UUID,
    p_quantity INT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE products
    SET
        stock_quantity = stock_quantity + p_quantity,
        updated_at = NOW()
    WHERE id = p_product_id;
END;
$$;

-- ------------------------------------------------------------------------------
-- 6. FUNCTION: track_consignment
-- Public RPC to track an order securely without exposing other records
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.track_consignment(
    p_order_number TEXT,
    p_email TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_order RECORD;
    v_items JSONB;
    v_timeline JSONB;
BEGIN
    SELECT * INTO v_order
    FROM orders
    WHERE UPPER(order_number) = UPPER(p_order_number)
    AND LOWER(email) = LOWER(p_email);

    IF NOT FOUND THEN
        RETURN NULL;
    END IF;

    SELECT jsonb_agg(to_jsonb(i)) INTO v_items
    FROM order_items i
    WHERE i.order_id = v_order.id;

    SELECT jsonb_agg(to_jsonb(t) ORDER BY t.created_at ASC) INTO v_timeline
    FROM order_timeline t
    WHERE t.order_id = v_order.id;

    RETURN jsonb_build_object(
        'order_number', v_order.order_number,
        'financial_status', v_order.financial_status,
        'fulfillment_status', v_order.fulfillment_status,
        'created_at', v_order.created_at,
        'total_amount', v_order.total_amount,
        'items', COALESCE(v_items, '[]'::jsonb),
        'timeline', COALESCE(v_timeline, '[]'::jsonb)
    );
END;
$$;
-- ==============================================================================
-- PHILZ SIGNATURE — 004_storage_buckets.sql
-- Storage Buckets & Storage Security Policies
-- ==============================================================================

-- Create Storage Buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('products', 'products', true),
    ('banners', 'banners', true),
    ('cms', 'cms', true),
    ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- ------------------------------------------------------------------------------
-- STORAGE POLICIES: Public Read
-- ------------------------------------------------------------------------------
CREATE POLICY "Public can view product assets"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'products');

CREATE POLICY "Public can view banner assets"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'banners');

CREATE POLICY "Public can view CMS assets"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'cms');

CREATE POLICY "Public can view avatar assets"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');

-- ------------------------------------------------------------------------------
-- STORAGE POLICIES: Admin Uploads & Deletions
-- ------------------------------------------------------------------------------
CREATE POLICY "Admins manage product assets"
    ON storage.objects FOR ALL
    USING (
        bucket_id IN ('products', 'banners', 'cms')
        AND public.is_admin()
    );

CREATE POLICY "Users manage own avatars"
    ON storage.objects FOR ALL
    USING (
        bucket_id = 'avatars'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );
-- ==============================================================================
-- PHILZ SIGNATURE — 005_seed_data.sql
-- Authentic Luxury Seed Data: Catalog, Collections, CMS & Settings
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. CATEGORIES SEED
-- ------------------------------------------------------------------------------
INSERT INTO categories (id, name, slug, description, display_order, is_active)
VALUES
    ('c1111111-1111-1111-1111-111111111111', 'Extrait de Parfum', 'extrait-de-parfum', 'Ultra-concentrated pure perfume extraits (25%-35% perfume oil).', 1, true),
    ('c2222222-2222-2222-2222-222222222222', 'Eau de Parfum', 'eau-de-parfum', 'Refined daily olfactory compositions with sophisticated sillage.', 2, true),
    ('c3333333-3333-3333-3333-333333333333', 'Home Fragrance', 'home-fragrance', 'Artisanal reed diffusers, room sprays, and olfactory sanctuary stones.', 3, true),
    ('c4444444-4444-4444-4444-444444444444', 'Body Elixirs', 'body-elixir', 'Silken botanical dry body oils and hair mist infusions.', 4, true)
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 2. COLLECTIONS SEED
-- ------------------------------------------------------------------------------
INSERT INTO collections (id, name, slug, tagline, description, is_featured, display_order, is_active)
VALUES
    ('b1111111-1111-1111-1111-111111111111', 'The Private Reserve', 'private-reserve', 'Limited harvest extraits of extraordinary rarity and depth.', 'Master-distilled botanical essences aged in French oak barrels.', true, 1, true),
    ('b2222222-2222-2222-2222-222222222222', 'The Oud Edition', 'oud-edition', 'Sovereign extractions of wild agarwood and dark resins.', 'Sourced sustainably from deep forestry distillations in Cambodia and Assam.', true, 2, true),
    ('b3333333-3333-3333-3333-333333333333', 'Signature Classics', 'signature-classics', 'The foundational olfactory wardrobe of the House.', 'Iconic flacons embodying timeless luxury and individual presence.', true, 3, true),
    ('b4444444-4444-4444-4444-444444444444', 'Discovery Portfolios', 'discovery-sets', 'Curated miniature discovery flacons for the discerning collector.', 'Miniature coffrets allowing sensory exploration of the complete house.', false, 4, true)
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 3. SIGNATURE PRODUCTS SEED (7 Signature Extraits)
-- ------------------------------------------------------------------------------
INSERT INTO products (
    id, name, slug, tagline, description, details, sku, price, sale_price,
    stock_quantity, volume_ml, concentration, brand, category_id, collection_id,
    fragrance_family, top_notes, middle_notes, base_notes, status,
    is_featured, is_bestseller, is_new_arrival, is_trending,
    meta_title, meta_description
) VALUES
-- 1. Beyond You
(
    'p1111111-1111-1111-1111-111111111111',
    'Beyond You',
    'beyond-you',
    'An intoxicating testament to sovereign presence and quiet audacity.',
    'Beyond You is an avant-garde extrait de parfum engineered around wild Cambodian oud, aged leather, and Damascus rose. A radiant opening of sun-drenched bergamot and cracked pink peppercorn yields to an opulent balsamic heart before lingering on ancient ambergris and smoked resin.',
    'Pure Extrait de Parfum concentration (32%). Macerated for six months. Hand-poured in heavy faceted glass with a solid brass weighted cap.',
    'PS-EXT-BY01',
    185000.00,
    NULL,
    45,
    100,
    'Extrait de Parfum',
    'PHILZ SIGNATURE',
    'c1111111-1111-1111-1111-111111111111',
    'b1111111-1111-1111-1111-111111111111',
    'Oriental',
    ARRAY['Calabrian Bergamot', 'Pink Peppercorn', 'Elemi Resin'],
    ARRAY['Rose Damascena', 'Frankincense Carterii', 'Tuscan Leather'],
    ARRAY['Cambodian Agarwood', 'Grey Ambergris', 'Laotian Benzoin'],
    'published',
    true, true, false, true,
    'Beyond You Extrait de Parfum | PHILZ SIGNATURE',
    'Discover Beyond You: A sovereign extrait de parfum blending Cambodian oud, smoky frankincense, and dark rose.'
),

-- 2. Nomad
(
    'p2222222-2222-2222-2222-222222222222',
    'Nomad',
    'nomad',
    'The spirit of boundless journey distilled into smoldering warmth.',
    'Nomad evokes nocturnal desert winds passing over spice bazaars and ancient cedar groves. Radiant saffron and roasted nutmeg introduce a powdery Florentine iris heart, anchored by smoked dark tobacco leaf and Bourbon vanilla.',
    'Formulated at 30% concentration. Blended with sustainably sourced botanical absolutes. Features exceptional 14+ hour longevity.',
    'PS-EXT-NM02',
    175000.00,
    NULL,
    60,
    100,
    'Extrait de Parfum',
    'PHILZ SIGNATURE',
    'c1111111-1111-1111-1111-111111111111',
    'b3333333-3333-3333-3333-333333333333',
    'Woody',
    ARRAY['Wild Cardamom', 'Grated Nutmeg', 'Persian Saffron'],
    ARRAY['Atlas Cedarwood', 'Nagarmotha Cypriol', 'Florentine Iris'],
    ARRAY['Dark Tobacco Leaf', 'Patchouli Coeur', 'Bourbon Vanilla Bean'],
    'published',
    true, false, true, false,
    'Nomad Extrait de Parfum | PHILZ SIGNATURE',
    'Nomad Extrait de Parfum: A woody oriental masterpiece featuring saffron, Florentine iris, and rich tobacco.'
),

-- 3. Fierce Elixir
(
    'p3333333-3333-3333-3333-333333333333',
    'Fierce Elixir',
    'fierce-elixir',
    'Sensual intensity unleashed through spiced rum and dark woods.',
    'Fierce Elixir commands the room with bold animalic charisma and decadent gourmand warmth. Blood orange zest paired with Jamaican dark rum and crushed cinnamon unfolds into intoxicating midnight jasmine and smoked agarwood.',
    'Formulated at 35% concentration. High-projection evening extrait with unmatched warmth and sillage.',
    'PS-EXT-FE03',
    195000.00,
    NULL,
    30,
    100,
    'Extrait de Parfum',
    'PHILZ SIGNATURE',
    'c1111111-1111-1111-1111-111111111111',
    'b1111111-1111-1111-1111-111111111111',
    'Gourmand',
    ARRAY['Sicilian Blood Orange', 'Fresh Ginger Root', 'Dark Spiced Rum'],
    ARRAY['Jasmine Sambac', 'Ceylon Cinnamon', 'Black Orchid'],
    ARRAY['Smoked Agarwood', 'Cashmeran Wood', 'Roasted Tonka Bean'],
    'published',
    true, true, false, true,
    'Fierce Elixir Extrait de Parfum | PHILZ SIGNATURE',
    'Fierce Elixir by Philz Signature: A narcotic blend of spiced dark rum, black orchid, and smoked woods.'
),

-- 4. Hera
(
    'p4444444-4444-4444-4444-444444444444',
    'Hera',
    'hera',
    'Regal white florals draped in golden amber and silken sandalwood.',
    'Named after the sovereign queen of antiquity, Hera is an opulent, luminous floral elixir. Radiant Tunisian neroli and luscious white peach open into an intoxicating heart of Indian tuberose and ylang-ylang, floating upon a velvety cushion of Mysore sandalwood.',
    'Extrait de parfum at 28% concentration. Luminous, feminine, and stately.',
    'PS-EXT-HR04',
    165000.00,
    NULL,
    55,
    100,
    'Extrait de Parfum',
    'PHILZ SIGNATURE',
    'c1111111-1111-1111-1111-111111111111',
    'b3333333-3333-3333-3333-333333333333',
    'Floral',
    ARRAY['Tunisian Neroli', 'Mandarin Essence', 'White Peach'],
    ARRAY['Indian Tuberose', 'Ylang-Ylang Extra', 'Heliotrope'],
    ARRAY['Velvety White Musk', 'Mysore Sandalwood', 'Bourbon Vanilla Infusion'],
    'published',
    true, false, false, false,
    'Hera Extrait de Parfum | PHILZ SIGNATURE',
    'Hera Extrait de Parfum: Royal white florals, Indian tuberose, and velvety Mysore sandalwood.'
),

-- 5. Promise
(
    'p5555555-5555-5555-5555-555555555555',
    'Promise',
    'promise',
    'An unbreakable vow expressed in crisp green apple and Taif roses.',
    'Promise is an intimate, deeply emotional creation. A brisk accord of green apple and aromatic clove illuminates a dual heart of legendary Taif rose and Turkish rose absolute, grounded in ancient labdanum, castoreum, and oakmoss.',
    'Formulated at 30% concentration. A complex Chypre-Floral architecture with aristocratic presence.',
    'PS-EXT-PR05',
    190000.00,
    NULL,
    35,
    100,
    'Extrait de Parfum',
    'PHILZ SIGNATURE',
    'c1111111-1111-1111-1111-111111111111',
    'b1111111-1111-1111-1111-111111111111',
    'Chypre',
    ARRAY['Crisp Green Apple', 'Cardamom Pods', 'Madagascar Clove'],
    ARRAY['Taif Rose Essence', 'Turkish Rose Absolute', 'Cistus Labdanum'],
    ARRAY['Castoreum Accord', 'Mountain Oakmoss', 'Golden Ambergris'],
    'published',
    true, false, true, false,
    'Promise Extrait de Parfum | PHILZ SIGNATURE',
    'Promise Extrait: Green apple, legendary Taif rose, and precious amber resins.'
),

-- 6. Guidance
(
    'p6666666-6666-6666-6666-666666666666',
    'Guidance',
    'guidance',
    'An ethereal tower of ivory incense, toasted hazelnut, and sweet osmanthus.',
    'Guidance is a hypnotic and comforting sensory labyrinth. A poetic blend of juicy pear nectar, delicate frankincense haze, and warm roasted hazelnuts melds effortlessly with creamy osmanthus and spicy saffron.',
    'Formulated at 28% concentration. A modern masterpiece praised for its distinctive sensory signature.',
    'PS-EXT-GD06',
    180000.00,
    NULL,
    50,
    100,
    'Extrait de Parfum',
    'PHILZ SIGNATURE',
    'c1111111-1111-1111-1111-111111111111',
    'b3333333-3333-3333-3333-333333333333',
    'Floral',
    ARRAY['Crisp Pear Nectar', 'Silver Incense', 'Roasted Hazelnut'],
    ARRAY['Osmanthus Blossom', 'Bulgarian Rose', 'Golden Saffron'],
    ARRAY['Australian Sandalwood', 'Madagascar Vanilla', 'Akigalawood'],
    'published',
    true, true, false, true,
    'Guidance Extrait de Parfum | PHILZ SIGNATURE',
    'Guidance Extrait de Parfum: Crisp pear, silver incense, and creamy sandalwood.'
),

-- 7. Oud en Botella
(
    'p7777777-7777-7777-7777-777777777777',
    'Oud en Botella',
    'oud-en-botella',
    'The crowning jewel: 25-year-old wild Assam oud bottled in pure potency.',
    'Oud en Botella is the pinnacle of the Philz Signature atelier. Formulated using vintage Assam agarwood wild-harvested over two decades ago. Intense, woody, balsamic, and spiritual, with nuances of violet leaf, birch tar, and warm amber resin.',
    'Ultra-limited private allocation. Hand-numbered crystal flacon housed in a lacquered piano wood presentation box.',
    'PS-EXT-OB07',
    220000.00,
    NULL,
    20,
    100,
    'Extrait de Parfum',
    'PHILZ SIGNATURE',
    'c1111111-1111-1111-1111-111111111111',
    'b2222222-2222-2222-2222-222222222222',
    'Woody',
    ARRAY['French Cistus', 'Dewy Violet Leaf', 'Calabrian Bergamot'],
    ARRAY['25-Year Vintage Assam Oud', 'Birch Tar', 'Spanish Leather'],
    ARRAY['Civet Accord', 'Amber Resin', 'Roasted Java Vetiver'],
    'published',
    true, true, false, true,
    'Oud en Botella Extrait de Parfum | PHILZ SIGNATURE',
    'Oud en Botella: Vintage Assam oud, Spanish leather, and precious amber resin.'
)
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 4. PRODUCT IMAGES SEED
-- ------------------------------------------------------------------------------
INSERT INTO product_images (product_id, image_url, alt_text, display_order, is_primary)
VALUES
    ('p1111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1000&q=85', 'Beyond You Flacon Frontal View', 1, true),
    ('p2222222-2222-2222-2222-222222222222', 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1000&q=85', 'Nomad Luxury Extrait Flacon', 1, true),
    ('p3333333-3333-3333-3333-333333333333', 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1000&q=85', 'Fierce Elixir Velvet Presentation', 1, true),
    ('p4444444-4444-4444-4444-444444444444', 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1000&q=85', 'Hera Crystal Flacon Portrait', 1, true),
    ('p5555555-5555-5555-5555-555555555555', 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=1000&q=85', 'Promise Signature Bottle Angle', 1, true),
    ('p6666666-6666-6666-6666-666666666666', 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1000&q=85', 'Guidance Extrait Presentation', 1, true),
    ('p7777777-7777-7777-7777-777777777777', 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1000&q=85', 'Oud en Botella Pure Vintage Agarwood', 1, true)
ON CONFLICT DO NOTHING;

-- ------------------------------------------------------------------------------
-- 5. SHIPPING METHODS SEED
-- ------------------------------------------------------------------------------
INSERT INTO shipping_methods (name, description, price, free_threshold, estimated_days, is_active)
VALUES
    ('Nationwide Standard Express', 'Insured tracked express delivery to any Nigerian state.', 5000.00, 150000.00, '2-4 Business Days', true),
    ('Lagos VIP Same-Day Concierge', 'Dedicated white-glove messenger delivery within Lagos metropolis.', 8000.00, 200000.00, 'Same Day / 24 Hours', true),
    ('International DHL Express', 'Worldwide carbon-neutral luxury air courier shipping.', 25000.00, 350000.00, '4-7 Business Days', true)
ON CONFLICT DO NOTHING;

-- ------------------------------------------------------------------------------
-- 6. PRIVILEGE COUPONS SEED
-- ------------------------------------------------------------------------------
INSERT INTO coupons (code, discount_type, value, min_spend, max_discount, usage_limit, is_active)
VALUES
    ('SIGNATURE10', 'percentage', 10.00, 100000.00, 30000.00, 500, true),
    ('PRIVILEGE15', 'percentage', 15.00, 200000.00, 50000.00, 200, true),
    ('WELCOME20K', 'fixed', 20000.00, 150000.00, NULL, 100, true)
ON CONFLICT (code) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 7. CMS CONTENT SEED
-- ------------------------------------------------------------------------------
INSERT INTO cms_content (key, section, title, content, is_published)
VALUES
(
    'announcement_bar',
    'header',
    'Storefront Top Banner',
    jsonb_build_object(
        'enabled', true,
        'text', 'COMPLIMENTARY NATIONWIDE EXPRESS DELIVERY ON ALL ACQUISITIONS OVER ₦150,000',
        'link_text', 'EXPLORE CREATIONS',
        'link_url', '/shop'
    ),
    true
),
(
    'homepage_hero',
    'home',
    'Homepage Hero Billboard',
    jsonb_build_object(
        'badge', 'The Private Reserve Collection',
        'headline', 'Transcendence in Every Note',
        'subtitle', 'Handcrafted extraits de parfum, artisanal home scents, and rare oud elixirs born from the rarest botanical essences.',
        'primary_cta_text', 'Explore Creations',
        'primary_cta_url', '/shop',
        'secondary_cta_text', 'View Collections',
        'secondary_cta_url', '/collections',
        'background_image', 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=2000&q=90'
    ),
    true
),
(
    'brand_story',
    'about',
    'Our Heritage & Sourcing Ethos',
    jsonb_build_object(
        'title', 'The Art of Philz Signature',
        'quote', 'Perfume is not mere scent; it is an invisible crown of memory, presence, and individuality.',
        'philosophy', 'PHILZ SIGNATURE was conceived to redefine the olfactory landscape through artisanal integrity. Every flacon is formulated using pure extraits, ensuring longevity, complexity, and undeniable presence.',
        'sourcing', 'From the deep woods of Cambodia to the rose fields of Taif and Mediterranean bergamot groves, our distillations honor the natural spirit of each botanical harvest.'
    ),
    true
),
(
    'footer_config',
    'footer',
    'Global Boutique Footer',
    jsonb_build_object(
        'brand_description', 'Haute Parfumerie & Artisanal Olfactory Creations. Handcrafted in limited private allocations.',
        'instagram', 'https://instagram.com/philzsignature',
        'whatsapp', '+2348000000000',
        'concierge_email', 'concierge@philzsignature.com',
        'flagship_location', 'Victoria Island, Lagos, Nigeria'
    ),
    true
)
ON CONFLICT (key) DO UPDATE SET
    content = EXCLUDED.content,
    updated_at = NOW();

-- ------------------------------------------------------------------------------
-- 8. SITE SETTINGS SEED
-- ------------------------------------------------------------------------------
INSERT INTO site_settings (key, value, description)
VALUES
    ('store_name', '"PHILZ SIGNATURE"', 'Official brand and storefront business name'),
    ('store_slogan', '"Artisanal Parfums & Haute Fragrance"', 'Brand tagline'),
    ('currency_code', '"NGN"', 'Primary operational currency'),
    ('currency_symbol', '"₦"', 'Primary currency display glyph'),
    ('concierge_email', '"concierge@philzsignature.com"', 'Primary concierge customer service inbox'),
    ('concierge_phone', '"+234 (0) 800 PHILZ SIG"', 'Official concierge telephone line'),
    ('concierge_whatsapp', '"+2348000000000"', 'Direct private WhatsApp messenger hotline'),
    ('free_shipping_threshold', '150000', 'Subtotal threshold for complimentary delivery')
ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value,
    updated_at = NOW();
