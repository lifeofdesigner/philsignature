-- ==============================================================================
-- PHILZ SIGNATURE — 012_candle_collection.sql
-- Link Official Candles to Dedicated Scented Candle Collection
-- ==============================================================================

-- 1. Ensure "Scented Candle Collection" exists in collections
INSERT INTO public.collections (
    id, name, slug, tagline, description,
    image_url, banner_url, is_featured, display_order, is_active
)
VALUES (
    '7e11d0a5-8374-4b5c-897b-4020c48e4d20',
    'Scented Candle Collection',
    'scented-candles',
    'Hand-Poured Natural Soy Wax in Lagos',
    'Handcrafted 300g luxury soy candles infused with bespoke aromatic essences. Formulated with clean-burning cotton wicks and up to 48 hours of room-filling fragrance.',
    'https://nntszytexvmolywvadyx.supabase.co/storage/v1/object/public/products/candles/sandal-rose.jpg',
    'https://nntszytexvmolywvadyx.supabase.co/storage/v1/object/public/products/candles/sandal-rose.jpg',
    true,
    6,
    true
)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    tagline = EXCLUDED.tagline,
    description = EXCLUDED.description,
    image_url = EXCLUDED.image_url,
    banner_url = EXCLUDED.banner_url,
    is_featured = EXCLUDED.is_featured,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- 2. Associate all 7 candle products with the Scented Candle Collection
UPDATE public.products
SET collection_id = '7e11d0a5-8374-4b5c-897b-4020c48e4d20'
WHERE category_id = 'c3333333-3333-3333-3333-333333333333';

NOTIFY pgrst, 'reload schema';

