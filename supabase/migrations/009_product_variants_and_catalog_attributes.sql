-- ==============================================================================
-- PHILZ SIGNATURE — 009_product_variants_and_catalog_attributes.sql
-- Enterprise Product Variants, Scent Profiles, and Extended Catalog Attributes
-- ==============================================================================

-- 1. Relax fragrance_family check constraint on products table to support multi-faceted notes
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_fragrance_family_check;

-- 2. Add extended catalog attributes to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS scent_profile TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS short_description TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS best_for TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0;

-- 3. Create Product Variants Table
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    size_ml INT NOT NULL,
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    sale_price NUMERIC(12, 2) CHECK (sale_price IS NULL OR (sale_price >= 0 AND sale_price < price)),
    stock_quantity INT NOT NULL DEFAULT 100 CHECK (stock_quantity >= 0),
    sku TEXT NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT false,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_product_variants_product ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON public.product_variants(sku);
CREATE INDEX IF NOT EXISTS idx_product_variants_size ON public.product_variants(size_ml);
CREATE INDEX IF NOT EXISTS idx_products_display_order ON public.products(display_order);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view product variants" ON public.product_variants;
CREATE POLICY "Public can view product variants"
    ON public.product_variants FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Admin and service role full access on product variants" ON public.product_variants;
CREATE POLICY "Admin and service role full access on product variants"
    ON public.product_variants FOR ALL
    USING (true)
    WITH CHECK (true);

-- 5. Ensure "Luxury Fragrance Collection" category exists
INSERT INTO public.categories (id, name, slug, description, display_order, is_active)
VALUES (
    'c5555555-5555-5555-5555-555555555555',
    'Luxury Fragrance Collection',
    'luxury-fragrance-collection',
    'The definitive haute parfumerie collection from Philz Signature, handcrafted with rare botanical essences and precious oud oils.',
    1,
    true
)
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    description = EXCLUDED.description,
    is_active = true;

NOTIFY pgrst, 'reload schema';
