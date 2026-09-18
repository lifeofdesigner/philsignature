-- ==============================================================================
-- PHILZ SIGNATURE — 013_seed_official_room_sprays.sql
-- Authentic Client Room Spray Collection Seeding (5 Room Sprays)
-- ==============================================================================

-- 1. Ensure "Philz Signature Room Sprays" Category Exists
INSERT INTO public.categories (id, name, slug, description, display_order, is_active)
VALUES (
    'c4444444-4444-4444-4444-444444444444',
    'Philz Signature Room Sprays',
    'room-sprays',
    'Artisanal 150ml fine-mist room sprays hand-poured in Lagos, offering instant olfactory ambiance transformations.',
    3,
    true
)
ON CONFLICT (id) DO UPDATE
SET name = 'Philz Signature Room Sprays',
    slug = 'room-sprays',
    description = 'Artisanal 150ml fine-mist room sprays hand-poured in Lagos, offering instant olfactory ambiance transformations.',
    display_order = 3,
    is_active = true;

-- 2. Ensure "Room Spray Collection" Exists in Collections
INSERT INTO public.collections (
    id, name, slug, tagline, description,
    image_url, banner_url, is_featured, display_order, is_active
)
VALUES (
    '8f22e0b6-9485-4c6d-988c-5031d59f5e31',
    'Room Spray Collection',
    'room-sprays',
    'Instant Atmospheric Mists Hand-Poured in Lagos',
    'Artisanal 150ml fine-mist room sprays formulated with premium fragrance essences and ergonomic trigger spray atomizers. Instant atmosphere transformations designed to elevate living spaces and fine fabrics.',
    'https://nntszytexvmolywvadyx.supabase.co/storage/v1/object/public/products/room-sprays/gourmand.jpg',
    'https://nntszytexvmolywvadyx.supabase.co/storage/v1/object/public/products/room-sprays/gourmand.jpg',
    true,
    7,
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

-- Clean up any old demo room spray
DELETE FROM public.products WHERE slug = 'atmospheric-room-spray';

-- 3. Seed 5 Official Room Sprays
INSERT INTO public.products (
    id, name, slug, sku, price, sale_price, stock_quantity,
    weight_grams, volume_ml, concentration, brand, category_id, collection_id,
    fragrance_family, scent_profile, best_for, tagline,
    short_description, description, details, ingredients, how_to_use,
    status, is_featured, is_bestseller, is_new_arrival, is_trending,
    display_order, meta_title, meta_description, rating, reviews_count
) VALUES
-- 1. Gourmand
(
    'e1000001-0001-4001-8001-000000000001',
    'Gourmand',
    'gourmand-room-spray',
    'PS-SPR-GM01',
    35000.00,
    NULL,
    50,
    220,
    150,
    'Room Spray',
    'PHILZ SIGNATURE',
    'c4444444-4444-4444-4444-444444444444',
    '8f22e0b6-9485-4c6d-988c-5031d59f5e31',
    'Gourmand • Warm Vanilla',
    'Madagascar Vanilla • Golden Caramel • Toasted Tonka',
    'Bedrooms, Living Lounges & Cozy Evening Ambiances',
    'Fine Fragrance Room Mist • Hand Poured in Lagos',
    'Hand-poured in Lagos. 150ml fine-mist trigger spray room mist formulated for immediate room refreshment and enduring warmth.',
    'Fine Fragrance Room Spray hand-poured in Lagos. Formulated with premium perfume oils and an ergonomic trigger spray mechanism for a continuous, ultra-fine atmospheric mist. Gourmand envelopes your space in rich vanilla, melted caramel, and soothing tonka bean warmth.',
    E'Volume: 150ml\nAtomizer: Ergonomic Trigger Spray with Lock\nBase: Premium Fine Fragrance Mist\nOrigin: Hand Poured in Lagos, Nigeria',
    'Alcohol Denat., Water (Aqua), Fragrance (Parfum), Dipropylene Glycol.',
    'Turn the nozzle switch to ON. Spray 2 to 3 pumps into the center of the room or above linens at a distance of 30cm. Switch nozzle back to OFF when not in use.',
    'published',
    true, true, true, true,
    201,
    'Gourmand Fine Fragrance Room Spray (150ml) | PHILZ SIGNATURE',
    'Discover Gourmand: Hand-poured 150ml luxury room spray mist crafted in Lagos. Warm vanilla, melted caramel, and decadent ambiance.',
    5, 0
),
-- 2. Citrus
(
    'e1000002-0002-4002-8002-000000000002',
    'Citrus',
    'citrus-room-spray',
    'PS-SPR-CT02',
    35000.00,
    NULL,
    50,
    220,
    150,
    'Room Spray',
    'PHILZ SIGNATURE',
    'c4444444-4444-4444-4444-444444444444',
    '8f22e0b6-9485-4c6d-988c-5031d59f5e31',
    'Citrus • Uplifting Fresh',
    'Italian Bergamot • Sunlit Mandarin • Crisp Verbena',
    'Kitchens, Morning Living Spaces & Energetic Workspaces',
    'Fine Fragrance Room Mist • Hand Poured in Lagos',
    'Hand-poured in Lagos. 150ml fine-mist trigger spray room mist formulated for immediate citrus vibrancy and crisp refreshment.',
    'Fine Fragrance Room Spray hand-poured in Lagos. Formulated with zesty botanical extracts and sun-drenched citrus essences to immediately revive and purify indoor atmospheres with radiant brightness.',
    E'Volume: 150ml\nAtomizer: Ergonomic Trigger Spray with Lock\nBase: Premium Fine Fragrance Mist\nOrigin: Hand Poured in Lagos, Nigeria',
    'Alcohol Denat., Water (Aqua), Fragrance (Parfum), Dipropylene Glycol.',
    'Turn the nozzle switch to ON. Spray 2 to 3 pumps into the center of the room. Switch nozzle to OFF when not in use.',
    'published',
    true, false, true, true,
    202,
    'Citrus Fine Fragrance Room Spray (150ml) | PHILZ SIGNATURE',
    'Discover Citrus: Hand-poured 150ml luxury room spray crafted in Lagos. Sparkling bergamot, golden mandarin, and bright botanical refreshment.',
    5, 0
),
-- 3. Fruity
(
    'e1000003-0003-4003-8003-000000000003',
    'Fruity',
    'fruity-room-spray',
    'PS-RS-FRUITY-150',
    35000.00,
    NULL,
    50,
    220,
    150,
    'Room Spray',
    'PHILZ SIGNATURE',
    'c4444444-4444-4444-4444-444444444444',
    '8f22e0b6-9485-4c6d-988c-5031d59f5e31',
    'Fruity • Sweet • Radiant',
    'Sun-Ripened Berries • Crisp Orchard Apple • Sheer Peach • Radiant Musk',
    'Living Rooms, Dining Suites, Kitchens & Vibrant Daytime Entertaining',
    'Fine Fragrance Room Mist • Hand Poured in Lagos',
    'Hand-poured in Lagos. 150ml fine-mist trigger spray room mist blending sun-ripened orchard berries, crisp apple, and golden peach.',
    'Fine Fragrance Room Spray hand-poured in Lagos. Philz Signature Fruity Room Spray (150ml) envelops living spaces in an intoxicating cascade of sun-ripened berries, crisp orchard fruits, and velvety summer peach. Poured in Lagos and fitted with a high-performance trigger atomizer, it delivers a fine, lingering mist that instantly refreshes ambient air and linens with refined sweetness.',
    E'Volume: 150ml\nAtomizer: Ergonomic Trigger Spray with Lock\nBase: Premium Fine Fragrance Mist\nOrigin: Hand Poured in Lagos, Nigeria',
    'Alcohol Denat., Water (Aqua), Fragrance (Parfum), Dipropylene Glycol.',
    'Turn the nozzle switch to ON. Spray 2 to 3 pumps into the center of the room. Switch nozzle to OFF when not in use.',
    'published',
    true, false, true, true,
    203,
    'Fruity Fine Fragrance Room Spray (150ml) | PHILZ SIGNATURE',
    'Discover Fruity: Hand-poured 150ml luxury room spray crafted in Lagos. Sun-ripened berries, crisp orchard apple, and sheer velvety peach.',
    5, 0
),
-- 4. Floral
(
    'e1000004-0004-4004-8004-000000000004',
    'Floral',
    'floral-room-spray',
    'PS-SPR-FL04',
    35000.00,
    NULL,
    50,
    220,
    150,
    'Room Spray',
    'PHILZ SIGNATURE',
    'c4444444-4444-4444-4444-444444444444',
    '8f22e0b6-9485-4c6d-988c-5031d59f5e31',
    'Floral • Romantic Rose',
    'Velvet Damask Rose • Jasmine Sambac • Soft Petals',
    'Bedrooms, Powder Rooms & Relaxing Sanctuaries',
    'Fine Fragrance Room Mist • Hand Poured in Lagos',
    'Hand-poured in Lagos. 150ml fine-mist trigger spray room mist infused with romantic rose petals and lush jasmine blossoms.',
    'Fine Fragrance Room Spray hand-poured in Lagos. Envelops interiors with the delicate luxury of freshly cut Damask roses and blooming jasmine, creating a serene and romantic environment.',
    E'Volume: 150ml\nAtomizer: Ergonomic Trigger Spray with Lock\nBase: Premium Fine Fragrance Mist\nOrigin: Hand Poured in Lagos, Nigeria',
    'Alcohol Denat., Water (Aqua), Fragrance (Parfum), Dipropylene Glycol.',
    'Turn the nozzle switch to ON. Spray 2 to 3 pumps into the center of the room or onto curtains from 30cm away.',
    'published',
    true, false, true, true,
    204,
    'Floral Fine Fragrance Room Spray (150ml) | PHILZ SIGNATURE',
    'Discover Floral: Hand-poured 150ml luxury room spray crafted in Lagos. Velvety damask rose, blooming jasmine, and elegant petal diffusion.',
    5, 0
),
-- 5. Woody
(
    'e1000005-0005-4005-8005-000000000005',
    'Woody',
    'woody-room-spray',
    'PS-SPR-WD05',
    35000.00,
    NULL,
    50,
    220,
    150,
    'Room Spray',
    'PHILZ SIGNATURE',
    'c4444444-4444-4444-4444-444444444444',
    '8f22e0b6-9485-4c6d-988c-5031d59f5e31',
    'Woody • Smoky Oud',
    'Aged Agarwood • Smoked Cedarwood • Warm Resins',
    'Executive Studies, Library Lounges & Evening Entertaining',
    'Fine Fragrance Room Mist • Hand Poured in Lagos',
    'Hand-poured in Lagos. 150ml fine-mist trigger spray room mist rich with deep oud, cedarwood, and smoky amber accords.',
    'Fine Fragrance Room Spray hand-poured in Lagos. A deeply sophisticated room mist infused with precious woods and warm oriental resins, designed for distinguished interiors and commanding presence.',
    E'Volume: 150ml\nAtomizer: Ergonomic Trigger Spray with Lock\nBase: Premium Fine Fragrance Mist\nOrigin: Hand Poured in Lagos, Nigeria',
    'Alcohol Denat., Water (Aqua), Fragrance (Parfum), Dipropylene Glycol.',
    'Turn the nozzle switch to ON. Spray 2 to 3 pumps into the room atmosphere. Switch nozzle to OFF when not in use.',
    'published',
    true, true, true, true,
    205,
    'Woody Fine Fragrance Room Spray (150ml) | PHILZ SIGNATURE',
    'Discover Woody: Hand-poured 150ml luxury room spray crafted in Lagos. Precious agarwood, smoked cedar, and warm resinous depth.',
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
    collection_id = EXCLUDED.collection_id,
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

-- 4. Seed Product Images
DELETE FROM public.product_images WHERE product_id IN (
    'e1000001-0001-4001-8001-000000000001',
    'e1000002-0002-4002-8002-000000000002',
    'e1000003-0003-4003-8003-000000000003',
    'e1000004-0004-4004-8004-000000000004',
    'e1000005-0005-4005-8005-000000000005'
);

INSERT INTO public.product_images (product_id, image_url, alt_text, display_order, is_primary)
VALUES
('e1000001-0001-4001-8001-000000000001', 'https://nntszytexvmolywvadyx.supabase.co/storage/v1/object/public/products/room-sprays/gourmand.jpg', 'Gourmand - Philz Signature Fine Fragrance Room Spray (150ml)', 0, true),
('e1000002-0002-4002-8002-000000000002', 'https://nntszytexvmolywvadyx.supabase.co/storage/v1/object/public/products/room-sprays/citrus.jpg', 'Citrus - Philz Signature Fine Fragrance Room Spray (150ml)', 0, true),
('e1000003-0003-4003-8003-000000000003', 'https://nntszytexvmolywvadyx.supabase.co/storage/v1/object/public/products/room-sprays/fruity.jpg', 'Fruity - Philz Signature Fine Fragrance Room Spray (150ml)', 0, true),
('e1000004-0004-4004-8004-000000000004', 'https://nntszytexvmolywvadyx.supabase.co/storage/v1/object/public/products/room-sprays/floral.jpg', 'Floral - Philz Signature Fine Fragrance Room Spray (150ml)', 0, true),
('e1000005-0005-4005-8005-000000000005', 'https://nntszytexvmolywvadyx.supabase.co/storage/v1/object/public/products/room-sprays/woody.jpg', 'Woody - Philz Signature Fine Fragrance Room Spray (150ml)', 0, true);

-- 5. Seed Product Variants (150ml Atomizer)
DELETE FROM public.product_variants WHERE product_id IN (
    'e1000001-0001-4001-8001-000000000001',
    'e1000002-0002-4002-8002-000000000002',
    'e1000003-0003-4003-8003-000000000003',
    'e1000004-0004-4004-8004-000000000004',
    'e1000005-0005-4005-8005-000000000005'
);

INSERT INTO public.product_variants (product_id, name, size_ml, price, sale_price, stock_quantity, sku, is_default, display_order)
VALUES
('e1000001-0001-4001-8001-000000000001', '150ml Atomizer', 150, 35000.00, NULL, 50, 'PS-SPR-GM01-150ML', true, 0),
('e1000002-0002-4002-8002-000000000002', '150ml Atomizer', 150, 35000.00, NULL, 50, 'PS-SPR-CT02-150ML', true, 0),
('e1000003-0003-4003-8003-000000000003', '150ml Atomizer', 150, 35000.00, NULL, 50, 'PS-SPR-FR03-150ML', true, 0),
('e1000004-0004-4004-8004-000000000004', '150ml Atomizer', 150, 35000.00, NULL, 50, 'PS-SPR-FL04-150ML', true, 0),
('e1000005-0005-4005-8005-000000000005', '150ml Atomizer', 150, 35000.00, NULL, 50, 'PS-SPR-WD05-150ML', true, 0);

NOTIFY pgrst, 'reload schema';

