-- ==============================================================================
-- PHILZ SIGNATURE — 011_seed_official_candles.sql
-- Authentic Client Scented Candle Collection Seeding (7 Candles)
-- ==============================================================================

-- 1. Ensure "Candles" Category Exists
INSERT INTO public.categories (id, name, slug, description, display_order, is_active)
VALUES (
    'c3333333-3333-3333-3333-333333333333',
    'Candles',
    'candles',
    'Handcrafted natural soy scented candles hand-poured in Lagos, offering clean burns and lingering room diffusion.',
    2,
    true
)
ON CONFLICT (id) DO UPDATE
SET name = 'Candles',
    slug = 'candles',
    description = 'Handcrafted natural soy scented candles hand-poured in Lagos, offering clean burns and lingering room diffusion.',
    display_order = 2,
    is_active = true;

-- Clean up any old demo product with slug luxury-scented-candle
DELETE FROM public.products WHERE slug = 'luxury-scented-candle';

-- 2. Seed 7 Official Candles
INSERT INTO public.products (
    id, name, slug, sku, price, sale_price, stock_quantity,
    weight_grams, volume_ml, concentration, brand, category_id,
    fragrance_family, scent_profile, best_for, tagline,
    short_description, description, details, ingredients, how_to_use,
    status, is_featured, is_bestseller, is_new_arrival, is_trending,
    display_order, meta_title, meta_description, rating, reviews_count
) VALUES
-- 1. Vanilla Treat
(
    '9e3a10c7-ed3b-4127-9faf-6d03370a0914',
    'Vanilla Treat',
    'vanilla-treat',
    'PS-CND-VT01',
    40000.00,
    NULL,
    50,
    300,
    300,
    'Scented Candle',
    'PHILZ SIGNATURE',
    'c3333333-3333-3333-3333-333333333333',
    'Gourmand • Warm Vanilla',
    'Madagascar Vanilla • Creamy Tonka • Warm Amber',
    'Living Rooms, Bedrooms & Intimate Evenings',
    'Natural Soy Candle • Hand Poured in Lagos',
    'Hand-poured in Lagos using natural soy wax. 300g net weight with up to 48 hours of clean, fragrant burn time.',
    'Natural Soy Candle hand-poured in Lagos. Formulated with premium botanical essences and clean-burning lead-free cotton wicks. Vanilla Treat fills your space with an inviting, decadent warmth that lingers gracefully.',
    E'Size: 300g\nBurn Time: Up to 48 Hours\nWax: 100% Natural Soy Wax\nWick: Premium Lead-Free Cotton\nOrigin: Hand Poured in Lagos, Nigeria',
    'Natural Soy Wax, Fine Fragrance Oils, Cotton Wick.',
    'Trim wick to 1/4 inch before each burn. Allow wax to melt to the edges of the jar on first burn (2–3 hours) to prevent tunneling. Never leave a burning candle unattended.',
    'published',
    true, true, true, true,
    101,
    'Vanilla Treat Natural Soy Candle (300g) | PHILZ SIGNATURE',
    'Discover Vanilla Treat: Hand-poured 300g natural soy candle crafted in Lagos. Up to 48 hours burn time with warm vanilla and comforting sweetness.',
    5, 0
),
-- 2. Cool Breeze
(
    'acb82739-1223-49a1-8088-b95b0b35be58',
    'Cool Breeze',
    'cool-breeze',
    'PS-CND-CB02',
    40000.00,
    NULL,
    50,
    300,
    300,
    'Scented Candle',
    'PHILZ SIGNATURE',
    'c3333333-3333-3333-3333-333333333333',
    'Fresh • Aquatic • Aromatic',
    'Crisp Marine Air • Coastal Botanicals • White Woods',
    'Daytime Refreshment, Offices & Open Living Areas',
    'Natural Soy Candle • Hand Poured in Lagos',
    'Hand-poured in Lagos using natural soy wax. 300g net weight with up to 48 hours of clean, fragrant burn time.',
    'Natural Soy Candle hand-poured in Lagos. Formulated with premium botanical essences and clean-burning lead-free cotton wicks. Cool Breeze delivers an invigorating, crisp olfactory experience reminiscent of fresh coastal air.',
    E'Size: 300g\nBurn Time: Up to 48 Hours\nWax: 100% Natural Soy Wax\nWick: Premium Lead-Free Cotton\nOrigin: Hand Poured in Lagos, Nigeria',
    'Natural Soy Wax, Fine Fragrance Oils, Cotton Wick.',
    'Trim wick to 1/4 inch before each burn. Allow wax to melt to the edges of the jar on first burn (2–3 hours) to prevent tunneling. Never leave a burning candle unattended.',
    'published',
    true, false, true, true,
    102,
    'Cool Breeze Natural Soy Candle (300g) | PHILZ SIGNATURE',
    'Discover Cool Breeze: Hand-poured 300g natural soy candle crafted in Lagos. Up to 48 hours burn time with revitalizing crisp fresh notes.',
    5, 0
),
-- 3. Le Luxe
(
    '9eda602f-64a3-4281-a79b-d09a4075db03',
    'Le Luxe',
    'le-luxe',
    'PS-CND-LL03',
    40000.00,
    NULL,
    50,
    300,
    300,
    'Scented Candle',
    'PHILZ SIGNATURE',
    'c3333333-3333-3333-3333-333333333333',
    'Oriental • Amber • Woody',
    'Precious Woods • Rich Amber • Subtle Spice',
    'Luxury Suites, Evening Hosting & Sophisticated Lounges',
    'Natural Soy Candle • Hand Poured in Lagos',
    'Hand-poured in Lagos using natural soy wax. 300g net weight with up to 48 hours of clean, fragrant burn time.',
    'Natural Soy Candle hand-poured in Lagos. Formulated with premium botanical essences and clean-burning lead-free cotton wicks. Le Luxe is an opulent, atmospheric creation designed for discerning interiors and elevated evening ambiances.',
    E'Size: 300g\nBurn Time: Up to 48 Hours\nWax: 100% Natural Soy Wax\nWick: Premium Lead-Free Cotton\nOrigin: Hand Poured in Lagos, Nigeria',
    'Natural Soy Wax, Fine Fragrance Oils, Cotton Wick.',
    'Trim wick to 1/4 inch before each burn. Allow wax to melt to the edges of the jar on first burn (2–3 hours) to prevent tunneling. Never leave a burning candle unattended.',
    'published',
    true, true, true, true,
    103,
    'Le Luxe Natural Soy Candle (300g) | PHILZ SIGNATURE',
    'Discover Le Luxe: Hand-poured 300g natural soy candle crafted in Lagos. Up to 48 hours burn time with opulent amber and precious woods.',
    5, 0
),
-- 4. Sandal Rose
(
    'f3b687c6-79ec-492a-9669-1b58a71f762e',
    'Sandal Rose',
    'sandal-rose',
    'PS-CND-SR04',
    40000.00,
    NULL,
    50,
    300,
    300,
    'Scented Candle',
    'PHILZ SIGNATURE',
    'c3333333-3333-3333-3333-333333333333',
    'Floral • Woody',
    'Velvet Damask Rose • Creamy Sandalwood • Soft Petals',
    'Sanctuaries, Bath Rituals & Romantic Evenings',
    'Natural Soy Candle • Hand Poured in Lagos',
    'Hand-poured in Lagos using natural soy wax. 300g net weight with up to 48 hours of clean, fragrant burn time.',
    'Natural Soy Candle hand-poured in Lagos. Formulated with premium botanical essences and clean-burning lead-free cotton wicks. Sandal Rose blends velvety rose blossoms with smooth, grounding sandalwood for serene harmony.',
    E'Size: 300g\nBurn Time: Up to 48 Hours\nWax: 100% Natural Soy Wax\nWick: Premium Lead-Free Cotton\nOrigin: Hand Poured in Lagos, Nigeria',
    'Natural Soy Wax, Fine Fragrance Oils, Cotton Wick.',
    'Trim wick to 1/4 inch before each burn. Allow wax to melt to the edges of the jar on first burn (2–3 hours) to prevent tunneling. Never leave a burning candle unattended.',
    'published',
    true, false, true, true,
    104,
    'Sandal Rose Natural Soy Candle (300g) | PHILZ SIGNATURE',
    'Discover Sandal Rose: Hand-poured 300g natural soy candle crafted in Lagos. Up to 48 hours burn time featuring Damask rose and Mysore sandalwood.',
    5, 0
),
-- 5. Champagne
(
    'a97eefff-26ef-4077-8abb-4df07992bcaa',
    'Champagne',
    'champagne',
    'PS-CND-CH05',
    40000.00,
    NULL,
    50,
    300,
    300,
    'Scented Candle',
    'PHILZ SIGNATURE',
    'c3333333-3333-3333-3333-333333333333',
    'Fruity • Sparkling Floral',
    'Effervescent Citrus • Wild Berries • Gilded Sugar',
    'Festive Gatherings, Dinners & Joyous Celebrations',
    'Natural Soy Candle • Hand Poured in Lagos',
    'Hand-poured in Lagos using natural soy wax. 300g net weight with up to 48 hours of clean, fragrant burn time.',
    'Natural Soy Candle hand-poured in Lagos. Formulated with premium botanical essences and clean-burning lead-free cotton wicks. Champagne brings an effervescent, celebratory glow with sparkling fruity brightness and refined sweetness.',
    E'Size: 300g\nBurn Time: Up to 48 Hours\nWax: 100% Natural Soy Wax\nWick: Premium Lead-Free Cotton\nOrigin: Hand Poured in Lagos, Nigeria',
    'Natural Soy Wax, Fine Fragrance Oils, Cotton Wick.',
    'Trim wick to 1/4 inch before each burn. Allow wax to melt to the edges of the jar on first burn (2–3 hours) to prevent tunneling. Never leave a burning candle unattended.',
    'published',
    true, false, true, true,
    105,
    'Champagne Natural Soy Candle (300g) | PHILZ SIGNATURE',
    'Discover Champagne: Hand-poured 300g natural soy candle crafted in Lagos. Up to 48 hours burn time with sparkling, celebratory effervescence.',
    5, 0
),
-- 6. Coconut Lime
(
    '04d0d817-9a45-4219-a160-1eebb182d310',
    'Coconut Lime',
    'coconut-lime',
    'PS-CND-CL06',
    40000.00,
    NULL,
    50,
    300,
    300,
    'Scented Candle',
    'PHILZ SIGNATURE',
    'c3333333-3333-3333-3333-333333333333',
    'Fresh • Citrus • Tropical',
    'Zesty Kaffir Lime • Creamy Coconut Milk • Tropical Verbena',
    'Kitchens, Bathrooms, Sunlit Morning Patios',
    'Natural Soy Candle • Hand Poured in Lagos',
    'Hand-poured in Lagos using natural soy wax. 300g net weight with up to 48 hours of clean, fragrant burn time.',
    'Natural Soy Candle hand-poured in Lagos. Formulated with premium botanical essences and clean-burning lead-free cotton wicks. Coconut Lime delivers a bright, refreshing fusion of zesty tropical citrus and velvety coconut cream.',
    E'Size: 300g\nBurn Time: Up to 48 Hours\nWax: 100% Natural Soy Wax\nWick: Premium Lead-Free Cotton\nOrigin: Hand Poured in Lagos, Nigeria',
    'Natural Soy Wax, Fine Fragrance Oils, Cotton Wick.',
    'Trim wick to 1/4 inch before each burn. Allow wax to melt to the edges of the jar on first burn (2–3 hours) to prevent tunneling. Never leave a burning candle unattended.',
    'published',
    true, false, true, true,
    106,
    'Coconut Lime Natural Soy Candle (300g) | PHILZ SIGNATURE',
    'Discover Coconut Lime: Hand-poured 300g natural soy candle crafted in Lagos. Up to 48 hours burn time blending radiant citrus and luscious coconut.',
    5, 0
),
-- 7. Coco Vibes
(
    'b9339a92-bf1a-4418-be6d-1df8330099cc',
    'Coco Vibes',
    'coco-vibes',
    'PS-CND-CV07',
    40000.00,
    NULL,
    50,
    300,
    300,
    'Scented Candle',
    'PHILZ SIGNATURE',
    'c3333333-3333-3333-3333-333333333333',
    'Gourmand • Tropical',
    'Roasted Coconut • Golden Caramel • Warm Island Woods',
    'Relaxing Weekends, Lounges & Serene Personal Retreats',
    'Natural Soy Candle • Hand Poured in Lagos',
    'Hand-poured in Lagos using natural soy wax. 300g net weight with up to 48 hours of clean, fragrant burn time.',
    'Natural Soy Candle hand-poured in Lagos. Formulated with premium botanical essences and clean-burning lead-free cotton wicks. Coco Vibes envelopes your space with warm toasted coconut, velvety cream, and relaxing island ambiance.',
    E'Size: 300g\nBurn Time: Up to 48 Hours\nWax: 100% Natural Soy Wax\nWick: Premium Lead-Free Cotton\nOrigin: Hand Poured in Lagos, Nigeria',
    'Natural Soy Wax, Fine Fragrance Oils, Cotton Wick.',
    'Trim wick to 1/4 inch before each burn. Allow wax to melt to the edges of the jar on first burn (2–3 hours) to prevent tunneling. Never leave a burning candle unattended.',
    'published',
    true, false, true, true,
    107,
    'Coco Vibes Natural Soy Candle (300g) | PHILZ SIGNATURE',
    'Discover Coco Vibes: Hand-poured 300g natural soy candle crafted in Lagos. Up to 48 hours burn time with decadent coconut and soothing warmth.',
    5, 0
)
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    sku = EXCLUDED.sku,
    price = EXCLUDED.price,
    weight_grams = EXCLUDED.weight_grams,
    volume_ml = EXCLUDED.volume_ml,
    concentration = EXCLUDED.concentration,
    category_id = EXCLUDED.category_id,
    fragrance_family = EXCLUDED.fragrance_family,
    scent_profile = EXCLUDED.scent_profile,
    best_for = EXCLUDED.best_for,
    tagline = EXCLUDED.tagline,
    short_description = EXCLUDED.short_description,
    description = EXCLUDED.description,
    details = EXCLUDED.details,
    ingredients = EXCLUDED.ingredients,
    how_to_use = EXCLUDED.how_to_use,
    meta_title = EXCLUDED.meta_title,
    meta_description = EXCLUDED.meta_description,
    updated_at = NOW();

-- 3. Seed Product Images
DELETE FROM public.product_images WHERE product_id IN (
    '9e3a10c7-ed3b-4127-9faf-6d03370a0914',
    'acb82739-1223-49a1-8088-b95b0b35be58',
    '9eda602f-64a3-4281-a79b-d09a4075db03',
    'f3b687c6-79ec-492a-9669-1b58a71f762e',
    'a97eefff-26ef-4077-8abb-4df07992bcaa',
    '04d0d817-9a45-4219-a160-1eebb182d310',
    'b9339a92-bf1a-4418-be6d-1df8330099cc'
);

INSERT INTO public.product_images (product_id, image_url, alt_text, display_order, is_primary)
VALUES
('9e3a10c7-ed3b-4127-9faf-6d03370a0914', 'https://nntszytexvmolywvadyx.supabase.co/storage/v1/object/public/products/candles/vanilla-treat.jpg', 'Vanilla Treat - Philz Signature Natural Soy Candle (300g)', 0, true),
('acb82739-1223-49a1-8088-b95b0b35be58', 'https://nntszytexvmolywvadyx.supabase.co/storage/v1/object/public/products/candles/cool-breeze.jpg', 'Cool Breeze - Philz Signature Natural Soy Candle (300g)', 0, true),
('9eda602f-64a3-4281-a79b-d09a4075db03', 'https://nntszytexvmolywvadyx.supabase.co/storage/v1/object/public/products/candles/le-luxe.jpg', 'Le Luxe - Philz Signature Natural Soy Candle (300g)', 0, true),
('f3b687c6-79ec-492a-9669-1b58a71f762e', 'https://nntszytexvmolywvadyx.supabase.co/storage/v1/object/public/products/candles/sandal-rose.jpg', 'Sandal Rose - Philz Signature Natural Soy Candle (300g)', 0, true),
('a97eefff-26ef-4077-8abb-4df07992bcaa', 'https://nntszytexvmolywvadyx.supabase.co/storage/v1/object/public/products/candles/champagne.jpg', 'Champagne - Philz Signature Natural Soy Candle (300g)', 0, true),
('04d0d817-9a45-4219-a160-1eebb182d310', 'https://nntszytexvmolywvadyx.supabase.co/storage/v1/object/public/products/candles/coconut-lime.jpg', 'Coconut Lime - Philz Signature Natural Soy Candle (300g)', 0, true),
('b9339a92-bf1a-4418-be6d-1df8330099cc', 'https://nntszytexvmolywvadyx.supabase.co/storage/v1/object/public/products/candles/coco-vibes.jpg', 'Coco Vibes - Philz Signature Natural Soy Candle (300g)', 0, true);

-- 4. Seed Product Variants (300g Vessel)
DELETE FROM public.product_variants WHERE product_id IN (
    '9e3a10c7-ed3b-4127-9faf-6d03370a0914',
    'acb82739-1223-49a1-8088-b95b0b35be58',
    '9eda602f-64a3-4281-a79b-d09a4075db03',
    'f3b687c6-79ec-492a-9669-1b58a71f762e',
    'a97eefff-26ef-4077-8abb-4df07992bcaa',
    '04d0d817-9a45-4219-a160-1eebb182d310',
    'b9339a92-bf1a-4418-be6d-1df8330099cc'
);

INSERT INTO public.product_variants (product_id, name, size_ml, price, sale_price, stock_quantity, sku, is_default, display_order)
VALUES
('9e3a10c7-ed3b-4127-9faf-6d03370a0914', '300g Vessel', 300, 40000.00, NULL, 50, 'PS-CND-VT01-300G', true, 0),
('acb82739-1223-49a1-8088-b95b0b35be58', '300g Vessel', 300, 40000.00, NULL, 50, 'PS-CND-CB02-300G', true, 0),
('9eda602f-64a3-4281-a79b-d09a4075db03', '300g Vessel', 300, 40000.00, NULL, 50, 'PS-CND-LL03-300G', true, 0),
('f3b687c6-79ec-492a-9669-1b58a71f762e', '300g Vessel', 300, 40000.00, NULL, 50, 'PS-CND-SR04-300G', true, 0),
('a97eefff-26ef-4077-8abb-4df07992bcaa', '300g Vessel', 300, 40000.00, NULL, 50, 'PS-CND-CH05-300G', true, 0),
('04d0d817-9a45-4219-a160-1eebb182d310', '300g Vessel', 300, 40000.00, NULL, 50, 'PS-CND-CL06-300G', true, 0),
('b9339a92-bf1a-4418-be6d-1df8330099cc', '300g Vessel', 300, 40000.00, NULL, 50, 'PS-CND-CV07-300G', true, 0);

NOTIFY pgrst, 'reload schema';
