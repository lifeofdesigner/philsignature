-- Migration 014: Rename Fresh Room Spray to Fruity Room Spray
-- Source of Truth: Client official product name is "Fruity"

UPDATE public.products
SET name = 'Fruity',
    slug = 'fruity-room-spray',
    sku = 'PS-RS-FRUITY-150',
    fragrance_family = 'Fruity',
    scent_profile = 'Sun-Ripened Berries • Crisp Orchard Apple • Sheer Peach • Radiant Musk',
    best_for = 'Living Rooms, Dining Suites, Kitchens & Vibrant Daytime Entertaining',
    tagline = 'Fine Fragrance Room Mist • Hand Poured in Lagos',
    short_description = 'Hand-poured in Lagos. 150ml fine-mist trigger spray room mist blending sun-ripened orchard berries, crisp apple, and golden peach.',
    description = 'Fine Fragrance Room Spray hand-poured in Lagos. Philz Signature Fruity Room Spray (150ml) envelops living spaces in an intoxicating cascade of sun-ripened berries, crisp orchard fruits, and velvety summer peach. Poured in Lagos and fitted with a high-performance trigger atomizer, it delivers a fine, lingering mist that instantly refreshes ambient air and linens with refined sweetness.',
    top_notes = ARRAY['Pink Lady Apple', 'Wild Berries', 'Sunlit Mandarin'],
    middle_notes = ARRAY['Juicy Peach Nectar', 'Water Lily', 'Sheer Peony'],
    base_notes = ARRAY['Velvet Amber', 'Soft Cedar', 'Radiant Musk'],
    meta_title = 'Fruity Fine Fragrance Room Spray (150ml) | PHILZ SIGNATURE',
    meta_description = 'Discover Fruity: Hand-poured 150ml luxury room spray crafted in Lagos. Sun-ripened berries, crisp orchard apple, and sheer velvety peach.',
    updated_at = NOW()
WHERE id = 'e1000003-0003-4003-8003-000000000003'
   OR slug = 'fresh-room-spray';

UPDATE public.product_images
SET image_url = 'https://nntszytexvmolywvadyx.supabase.co/storage/v1/object/public/products/room-sprays/fruity.jpg',
    alt_text = 'Fruity - Philz Signature Fine Fragrance Room Spray (150ml)'
WHERE product_id = 'e1000003-0003-4003-8003-000000000003';

UPDATE public.product_variants
SET sku = 'PS-RS-FRUITY-150',
    name = '150ml Atomizer'
WHERE product_id = 'e1000003-0003-4003-8003-000000000003';

