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
