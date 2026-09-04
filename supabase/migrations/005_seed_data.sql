-- ==============================================================================
-- PHILZ SIGNATURE — 005_seed_data.sql
-- Authentic Client Seed Data: Catalog, Collections, CMS & Settings
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. CATEGORIES SEED
-- ------------------------------------------------------------------------------
INSERT INTO categories (id, name, slug, description, display_order, is_active)
VALUES
    ('c1111111-1111-1111-1111-111111111111', 'Perfume Body Oils', 'perfume-body-oils', 'High-concentration botanical perfume body oils in Masculine, Feminine, and Unisex profiles.', 1, true),
    ('c2222222-2222-2222-2222-222222222222', 'Extrait de Parfum', 'extrait-de-parfum', 'Ultra-concentrated pure perfume extraits crafted for long-lasting sillage.', 2, true),
    ('c3333333-3333-3333-3333-333333333333', 'Reed Diffusers', 'reed-diffusers', 'Artisanal natural rattan reed diffusers for continuous ambient fragrance.', 3, true),
    ('c4444444-4444-4444-4444-444444444444', 'Scented Candles', 'scented-candles', 'Slow-burning luxury scented candles in premium vessels.', 4, true),
    ('c5555555-5555-5555-5555-555555555555', 'Room Spray', 'room-spray', 'Instant atmosphere transformations with fine fragrance room mist.', 5, true),
    ('c6666666-6666-6666-6666-666666666666', 'Home Fragrance', 'home-fragrance', 'Curated home fragrance living sets, diffusers, candles, and room sprays.', 6, true)
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 2. COLLECTIONS SEED
-- ------------------------------------------------------------------------------
INSERT INTO collections (id, name, slug, tagline, description, is_featured, display_order, is_active)
VALUES
    ('b1111111-1111-1111-1111-111111111111', 'Perfume Body Oils', 'perfume-body-oils', 'A signature is something that belongs to you.', 'High-concentration perfume body oils in Masculine, Feminine, and Unisex profiles.', true, 1, true),
    ('b2222222-2222-2222-2222-222222222222', 'Signature Collection', 'signature-collection', 'Behind every signature is a story.', 'Artisanal perfumes and extraits created to leave a lasting impression.', true, 2, true),
    ('b3333333-3333-3333-3333-333333333333', 'Home Fragrance & Living', 'home-fragrance', 'Transform your sanctuary with intentional scents.', 'Artisanal reed diffusers, scented candles, and room sprays for elegant interiors.', true, 3, true),
    ('b4444444-4444-4444-4444-444444444444', 'Private Label & Gifting', 'private-label-gifting', 'Customized fragrance solutions for brands and organizations.', 'Bespoke fragrance development, corporate hampers, and branded products.', false, 4, true)
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 3. SIGNATURE PRODUCTS SEED
-- ------------------------------------------------------------------------------
INSERT INTO products (
    id, name, slug, tagline, description, details, sku, price, sale_price,
    stock_quantity, volume_ml, concentration, brand, category_id, collection_id,
    fragrance_family, top_notes, middle_notes, base_notes, status,
    is_featured, is_bestseller, is_new_arrival, is_trending,
    meta_title, meta_description
) VALUES
-- 1. Perfume Body Oil (Masculine)
(
    'a1111111-1111-1111-1111-111111111111',
    'Perfume Body Oil (Masculine)',
    'perfume-body-oil-masculine',
    'Rich, distinguished woods and warm amber for a commanding presence.',
    'A high-concentration botanical perfume body oil crafted with the finest fragrance oils. Formulated for long-lasting sillage that evolves beautifully throughout the day.',
    'Pure Perfume Oil concentration. Handcrafted in Lagos, Nigeria. Nourishing botanical base designed for direct skin application.',
    'PS-OIL-MAS01',
    45000.00,
    NULL,
    50,
    30,
    'Perfume Oil',
    'PHILZ SIGNATURE',
    'c1111111-1111-1111-1111-111111111111',
    'b1111111-1111-1111-1111-111111111111',
    'Woody',
    ARRAY['Bergamot', 'Cardamom', 'Pink Pepper'],
    ARRAY['Cedarwood', 'Smoked Leather', 'Nutmeg'],
    ARRAY['Aged Oud', 'Amber', 'Warm Musk'],
    'published',
    true, true, false, true,
    'Perfume Body Oil (Masculine) | PHILZ SIGNATURE',
    'Discover our Masculine Perfume Body Oil: Handcrafted with premium fragrance oils for a lasting impression.'
),

-- 2. Perfume Body Oil (Feminine)
(
    'a2222222-2222-2222-2222-222222222222',
    'Perfume Body Oil (Feminine)',
    'perfume-body-oil-feminine',
    'Radiant floral amber and soft vanilla crafted with delicate grace.',
    'An exquisite feminine perfume body oil crafted for an intimate, lingering scent experience. Smooth, radiant, and undeniably memorable.',
    'Pure Perfume Oil concentration. Blended with skin-loving botanical carriers for exceptional longevity.',
    'PS-OIL-FEM02',
    45000.00,
    NULL,
    50,
    30,
    'Perfume Oil',
    'PHILZ SIGNATURE',
    'c1111111-1111-1111-1111-111111111111',
    'b1111111-1111-1111-1111-111111111111',
    'Floral',
    ARRAY['Sweet Pear', 'Mandarin Zest', 'Orange Blossom'],
    ARRAY['Jasmine Sambac', 'Rose Damascena', 'Creamy Iris'],
    ARRAY['Madagascar Vanilla', 'White Musk', 'Golden Amber'],
    'published',
    true, true, false, true,
    'Perfume Body Oil (Feminine) | PHILZ SIGNATURE',
    'Discover our Feminine Perfume Body Oil: Delicate florals, amber, and vanilla in pure oil concentration.'
),

-- 3. Perfume Body Oil (Unisex)
(
    'a3333333-3333-3333-3333-333333333333',
    'Perfume Body Oil (Unisex)',
    'perfume-body-oil-unisex',
    'A signature is something that belongs to you. Designed for everyone.',
    'A balanced unisex perfume body oil featuring harmonious spicy woods, crisp florals, and warm resinous amber. Designed to be enjoyed by any fragrance lover.',
    'Pure Perfume Oil concentration. Universal scent profile suitable for every occasion and mood.',
    'PS-OIL-UNI03',
    45000.00,
    NULL,
    60,
    30,
    'Perfume Oil',
    'PHILZ SIGNATURE',
    'c1111111-1111-1111-1111-111111111111',
    'b1111111-1111-1111-1111-111111111111',
    'Oriental',
    ARRAY['Saffron', 'Grapefruit', 'Coriander'],
    ARRAY['Black Rose', 'Frankincense', 'Smoked Woods'],
    ARRAY['Ambergris', 'Sandalwood', 'Clean Cedar'],
    'published',
    true, false, true, true,
    'Perfume Body Oil (Unisex) | PHILZ SIGNATURE',
    'Discover our Unisex Perfume Body Oil: A signature scent crafted for lovers of distinctive fragrance.'
),

-- 4. Philz Signature Extrait de Parfum
(
    'a4444444-4444-4444-4444-444444444444',
    'Philz Signature Extrait de Parfum',
    'philz-signature-extrait-de-parfum',
    'Our flagship creation: Concentrated luxury perfume that leaves a lasting impression.',
    'Created by Philz the Perfumer, this master extrait de parfum represents the pinnacle of our fragrance atelier. Exceptional concentration offering all-day persistence and rich sillage.',
    'Extrait de Parfum concentration (30%+). Presented in a luxury flacon with gold-embossed packaging.',
    'PS-EXT-SIG04',
    185000.00,
    NULL,
    30,
    100,
    'Extrait de Parfum',
    'PHILZ SIGNATURE',
    'c2222222-2222-2222-2222-222222222222',
    'b2222222-2222-2222-2222-222222222222',
    'Woody',
    ARRAY['Bergamot', 'Saffron', 'Elemi Resin'],
    ARRAY['Royal Taif Rose', 'Frankincense', 'Cedarwood'],
    ARRAY['Aged Cambodian Oud', 'Ambergris', 'Benzoin'],
    'published',
    true, true, false, true,
    'Philz Signature Extrait de Parfum | PHILZ SIGNATURE',
    'Flagship Extrait de Parfum: Handcrafted luxury perfume engineered for endurance and distinction.'
),

-- 5. Artisanal Reed Diffuser
(
    'a5555555-5555-5555-5555-555555555555',
    'Artisanal Reed Diffuser',
    'artisanal-reed-diffuser',
    'Continuous, subtle ambient diffusion for refined living spaces.',
    'Transform your sanctuary with our artisanal reed diffusers. Natural rattan reeds gently disperse fine fragrance oils throughout the room for months of continuous scent.',
    '200ml vessel with 8 high-absorption rattan reeds. Delivers up to 90 days of continuous room fragrance.',
    'PS-HOM-DIF05',
    55000.00,
    NULL,
    40,
    200,
    'Home Fragrance',
    'PHILZ SIGNATURE',
    'c3333333-3333-3333-3333-333333333333',
    'b3333333-3333-3333-3333-333333333333',
    'Floral',
    ARRAY['Citrus Blossom', 'White Tea', 'Crisp Pear'],
    ARRAY['Midnight Jasmine', 'Orchid', 'Soft Lily'],
    ARRAY['Blonde Woods', 'Clean Musk', 'Amber'],
    'published',
    true, false, true, false,
    'Artisanal Reed Diffuser | PHILZ SIGNATURE',
    'Artisanal Reed Diffuser: Elevate your interior ambiance with long-lasting home fragrance.'
),

-- 6. Luxury Scented Candle
(
    'a6666666-6666-6666-6666-666666666666',
    'Luxury Scented Candle',
    'luxury-scented-candle',
    'Slow-burning soy wax infused with rich botanical essences.',
    'Hand-poured using natural soy wax and lead-free cotton wicks. Releases an inviting aroma that creates a relaxing, memorable atmosphere in any room.',
    '300g net weight. Approximate burn time: 55-60 hours. Housed in a matte vessel with gold branding.',
    'PS-HOM-CND06',
    40000.00,
    NULL,
    45,
    300,
    'Home Fragrance',
    'PHILZ SIGNATURE',
    'c4444444-4444-4444-4444-444444444444',
    'b3333333-3333-3333-3333-333333333333',
    'Oriental',
    ARRAY['Spiced Cinnamon', 'Nutmeg', 'Sweet Orange'],
    ARRAY['Smoked Vanilla', 'Tonka Bean', 'Clove'],
    ARRAY['Sandalwood', 'Patchouli', 'Dark Amber'],
    'published',
    true, true, false, false,
    'Luxury Scented Candle | PHILZ SIGNATURE',
    'Luxury Scented Candle: Hand-poured soy candle infused with fine fragrance oils.'
),

-- 7. Atmospheric Room Spray
(
    'a7777777-7777-7777-7777-777777777777',
    'Atmospheric Room Spray',
    'atmospheric-room-spray',
    'Instant fragrance refreshment for living areas, fabrics, and linen.',
    'An ultra-fine mist room spray that immediately revives your environment with signature scent. Perfect for pre-hosting, bedrooms, and office spaces.',
    '150ml fine-mist atomizer bottle. Safe for room air and high-quality home linens.',
    'PS-HOM-SPR07',
    35000.00,
    NULL,
    50,
    150,
    'Room Spray',
    'PHILZ SIGNATURE',
    'c5555555-5555-5555-5555-555555555555',
    'b3333333-3333-3333-3333-333333333333',
    'Fresh',
    ARRAY['Calabrian Lemon', 'Crisp Eucalyptus', 'Mint Leaf'],
    ARRAY['Lavender Provence', 'Geranium', 'Rosemary'],
    ARRAY['White Cedar', 'Oakmoss', 'Sensual Musk'],
    'published',
    true, false, true, false,
    'Atmospheric Room Spray | PHILZ SIGNATURE',
    'Atmospheric Room Spray: Instant atmosphere transformation with fine fragrance room mist.'
)
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 4. PRODUCT IMAGES SEED
-- ------------------------------------------------------------------------------
INSERT INTO product_images (product_id, image_url, alt_text, display_order, is_primary)
VALUES
    ('a1111111-1111-1111-1111-111111111111', '/media/products/perfume-oils/perfume-oil-1.jpg', 'Perfume Body Oil Masculine Flacon', 1, true),
    ('a2222222-2222-2222-2222-222222222222', '/media/products/perfume-oils/perfume-oil-2.jpg', 'Perfume Body Oil Feminine Flacon', 1, true),
    ('a3333333-3333-3333-3333-333333333333', '/media/products/perfume-oils/perfume-oil-3.jpg', 'Perfume Body Oil Unisex Flacon', 1, true),
    ('a4444444-4444-4444-4444-444444444444', '/media/products/perfume-oils/perfume-oil-4.jpg', 'Philz Signature Extrait de Parfum Bottle', 1, true),
    ('a5555555-5555-5555-5555-555555555555', '/media/products/diffuser-candles/diffuser-candle-1.jpg', 'Artisanal Reed Diffuser Presentation', 1, true),
    ('a6666666-6666-6666-6666-666666666666', '/media/products/diffuser-candles/diffuser-candle-2.jpg', 'Luxury Scented Candle Amber Glow', 1, true),
    ('a7777777-7777-7777-7777-777777777777', '/media/products/perfume-oils/perfume-oil-5.jpg', 'Atmospheric Room Spray Fine Mist', 1, true)
ON CONFLICT DO NOTHING;

-- ------------------------------------------------------------------------------
-- 5. SHIPPING METHODS SEED
-- ------------------------------------------------------------------------------
INSERT INTO shipping_methods (name, description, price, free_threshold, estimated_days, is_active)
VALUES
    ('Nationwide Standard Express', 'Insured tracked express delivery to any Nigerian state.', 5000.00, 150000.00, '2-4 Business Days', true),
    ('Lagos VIP Same-Day Concierge', 'Dedicated white-glove messenger delivery within Lagos metropolis.', 8000.00, 200000.00, 'Same Day / 24 Hours', true),
    ('Storefront Collection / Pickup', 'Direct collection from our flagship concierge in Lagos.', 0.00, NULL, 'Ready in 2 Hours', true)
ON CONFLICT (name) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 6. CMS SECTIONS SEED
-- ------------------------------------------------------------------------------
INSERT INTO cms_content (key, section, title, content, is_published)
VALUES
(
    'announcement_bar',
    'header',
    'Announcement Bar',
    jsonb_build_object(
        'enabled', true,
        'text', 'PHILZ SIGNATURE — YOUR SCENT. YOUR SIGNATURE. • BASED IN LAGOS, NIGERIA',
        'link_text', 'EXPLORE SCENTS',
        'link_url', '/shop'
    ),
    true
),
(
    'homepage_hero',
    'home',
    'Homepage Hero Billboard',
    jsonb_build_object(
        'badge', 'SIGNATURE FRAGRANCES • MADE IN LAGOS',
        'headline', 'Your Scent. Your Signature.',
        'subtitle', 'Hand-blended, long-lasting perfume oils in Masculine, Feminine and Unisex profiles — crafted to make you unforgettable.',
        'primary_cta_text', 'Shop Perfume Oils',
        'primary_cta_url', '/shop?category=perfume-body-oils',
        'secondary_cta_text', 'Our Story',
        'secondary_cta_url', '/about',
        'background_image', '/brand/hero-oud-luxury.jpg',
        'settings', jsonb_build_object(
            'autoplay', true,
            'autoplay_interval_ms', 6500,
            'transition_duration_ms', 800
        ),
        'slides', jsonb_build_array(
            jsonb_build_object(
                'id', 'slide-1',
                'badge', 'SIGNATURE FRAGRANCES • MADE IN LAGOS',
                'headline', 'Your Scent. Your Signature.',
                'subtitle', 'Hand-blended, long-lasting perfume oils in Masculine, Feminine and Unisex profiles — crafted to make you unforgettable.',
                'primary_cta_text', 'Shop Perfume Oils',
                'primary_cta_url', '/shop?category=perfume-body-oils',
                'secondary_cta_text', 'Our Story',
                'secondary_cta_url', '/about',
                'desktop_image', '/brand/hero-oud-luxury.jpg',
                'mobile_image', '/brand/hero-oud-luxury.jpg',
                'featured_product_title', 'Perfume Body Oils',
                'featured_product_subtitle', 'Masculine • Feminine • Unisex',
                'featured_product_price', '₦45,000',
                'featured_product_image', '/media/products/perfume-oils/perfume-oil-1.jpg',
                'featured_product_url', '/shop?category=perfume-body-oils',
                'is_active', true,
                'order', 1
            ),
            jsonb_build_object(
                'id', 'slide-2',
                'badge', 'HOME & LIFESTYLE FRAGRANCE',
                'headline', 'Fill Every Room With Your Signature',
                'subtitle', 'Reed diffusers, scented candles and room sprays designed to bring the same luxury scent experience home — subtle, long-lasting, unmistakably yours.',
                'primary_cta_text', 'Shop Reed Diffusers',
                'primary_cta_url', '/shop?category=reed-diffusers',
                'secondary_cta_text', 'Shop Scented Candles',
                'secondary_cta_url', '/shop?category=scented-candles',
                'desktop_image', '/brand/hero-private-reserve.jpg',
                'mobile_image', '/brand/hero-private-reserve.jpg',
                'is_active', true,
                'order', 2
            ),
            jsonb_build_object(
                'id', 'slide-3',
                'badge', 'PRIVATE LABEL & CORPORATE GIFTING',
                'headline', 'Give Your Brand A Signature Scent',
                'subtitle', 'From bespoke perfume oils to branded corporate hampers, Philz the Perfumer helps businesses create a fragrance identity entirely their own.',
                'primary_cta_text', 'Start A Project',
                'primary_cta_url', '/contact',
                'secondary_cta_text', 'Request A Quote',
                'secondary_cta_url', '/contact',
                'desktop_image', '/brand/hero-extrait-collection.jpg',
                'mobile_image', '/brand/hero-extrait-collection.jpg',
                'is_active', true,
                'order', 3
            )
        )
    ),
    true
),
(
    'brand_story',
    'about',
    'About Philz Signature & Our Story',
    jsonb_build_object(
        'title', 'ABOUT PHILZ SIGNATURE',
        'subtitle', 'A SIGNATURE IS SOMETHING THAT BELONGS TO YOU.',
        'body_paragraphs', jsonb_build_array(
            'Founded in 2018, Philz Signature was created from a passion for fragrance and the belief that scent is one of the most powerful ways to express individuality.',
            'What began with a focus on personal fragrance has evolved into a broader scent lifestyle brand offering perfumes, perfume oils, home fragrances, gifting solutions and private-label services.'
        ),
        'philosophy_title', 'Our Philosophy',
        'philosophy_points', jsonb_build_array(
            'Fragrance should be personal.',
            'Quality should be intentional.',
            'Every experience should be memorable.'
        ),
        'story_title', 'OUR STORY',
        'story_body', jsonb_build_array(
            'At the heart of Philz Signature is Philz the Perfumer, whose passion for fragrance inspired the creation of a brand focused on helping people discover scents that feel personal and distinctive.',
            'Over the years, Philz Signature has continued to evolve—expanding from personal fragrance into home fragrance, corporate gifting and customized fragrance solutions for businesses.'
        ),
        'story_goal', 'To create fragrance experiences that leave a lasting impression.',
        'perfumer_title', 'MEET PHILZ THE PERFUMER',
        'perfumer_subtitle', 'BEHIND EVERY SIGNATURE IS A STORY.',
        'perfumer_body', jsonb_build_array(
            'Philz the Perfumer is the founder and creative force behind Philz Signature.',
            'Driven by a passion for fragrance and entrepreneurship, he has built Philz Signature around a simple belief: Everyone deserves to have a scent that feels like their own.',
            'From fragrance creation to brand development, the journey continues to be guided by curiosity, creativity and a commitment to creating memorable scent experiences.'
        ),
        'closing_brand', 'PHILZ SIGNATURE',
        'closing_statement', 'Your scent. Your signature.',
        'image1_url', '/media/banners/banner-4.jpg',
        'image2_url', '/media/lifestyle/lifestyle-1.jpg'
    ),
    true
),
(
    'contact_data',
    'contact',
    'Concierge & Bespoke Scent Services',
    jsonb_build_object(
        'title', 'LET''S CREATE YOUR SIGNATURE',
        'subtitle', 'Whether you''re looking for your next fragrance, planning a corporate gift project or interested in creating your own fragrance brand, we''d love to hear from you.',
        'email', 'Philzsignature1@gmail.com',
        'phone', '+2347038399764',
        'whatsapp', 'https://wa.me/message/OJXETPKJE7L4M1',
        'address', 'Lagos, Nigeria',
        'hours', 'Monday – Saturday: 9:00 AM – 7:00 PM WAT',
        'pillars', jsonb_build_array(
            jsonb_build_object(
                'title', 'Customer Enquiries',
                'description', 'Questions about our products, orders or fragrances?',
                'button_text', 'CONTACT US',
                'action_type', 'contact',
                'action_url', '#inquiry-form'
            ),
            jsonb_build_object(
                'title', 'Private Label',
                'description', 'Ready to create your own fragrance collection?',
                'button_text', 'START A PROJECT',
                'action_type', 'project',
                'action_url', 'https://wa.me/message/OJXETPKJE7L4M1'
            ),
            jsonb_build_object(
                'title', 'Corporate Gifting',
                'description', 'Planning gifts for your company, clients or team?',
                'button_text', 'REQUEST A QUOTE',
                'action_type', 'quote',
                'action_url', 'https://wa.me/message/OJXETPKJE7L4M1'
            )
        )
    ),
    true
),
(
    'faq_data',
    'faq',
    'Frequently Asked Questions',
    jsonb_build_object(
        'title', 'FREQUENTLY ASKED QUESTIONS',
        'subtitle', 'Everything you need to know about our fragrance collections, bespoke solutions, orders and delivery.',
        'items', jsonb_build_array(
            jsonb_build_object('question', 'What type of fragrances does Philz Signature offer?', 'answer', 'We offer perfume oils, Eau de Parfum and a variety of home and lifestyle fragrances, including scented candles, reed diffusers, room sprays and car fragrances.'),
            jsonb_build_object('question', 'Are Philz Signature fragrances for men or women?', 'answer', 'Our collections are designed for fragrance lovers of different preferences. Many of our fragrances can be enjoyed by anyone, regardless of gender.'),
            jsonb_build_object('question', 'How do I choose a fragrance?', 'answer', 'You can explore fragrances by collection, fragrance family, mood and occasion. If you''re still unsure, contact us and we''ll help you find a suitable option.'),
            jsonb_build_object('question', 'Do you offer private labeling?', 'answer', 'Yes. We offer private-label and white-label fragrance solutions for businesses and entrepreneurs.'),
            jsonb_build_object('question', 'What products can be private labeled?', 'answer', 'Depending on your requirements, we can provide perfumes, perfume oils, candles, reed diffusers, room sprays and other fragrance products.'),
            jsonb_build_object('question', 'Do you offer corporate gifting?', 'answer', 'Yes. We create customized corporate fragrance gifts, hampers and branded products for businesses and organizations.'),
            jsonb_build_object('question', 'Can products be customized with my company''s branding?', 'answer', 'Yes. Branding and packaging customization can be incorporated into qualifying corporate and private-label projects.'),
            jsonb_build_object('question', 'Where is Philz Signature located?', 'answer', 'Philz Signature is based in Lagos, Nigeria.'),
            jsonb_build_object('question', 'How can I place an order?', 'answer', 'Browse our online collection, select your preferred products and follow the checkout process. For bulk, corporate or private-label orders, contact our team directly.'),
            jsonb_build_object('question', 'Do you deliver?', 'answer', 'Yes. Delivery options are available for customers and business clients. Delivery timelines depend on the order and destination.')
        )
    ),
    true
),
(
    'instagram_feed',
    'marketing',
    'Instagram Social Sanctuary',
    jsonb_build_object(
        'enabled', true,
        'title', 'Follow Our Olfactory Journey',
        'subtitle', 'Behind the atelier with Philz the Perfumer, bespoke formulation, and olfactory art.',
        'handle', '@philztheperfumer',
        'profile_url', 'https://instagram.com/philztheperfumer',
        'layout', 'slider',
        'post_count', 6,
        'status', 'published',
        'posts', jsonb_build_array(
            jsonb_build_object('id', 'insta-1', 'image_url', '/media/products/perfume-oils/perfume-oil-1.jpg', 'caption', 'Pure botanical essence extracted in small batches. Our signature Perfume Body Oil on rough travertine. ✨ #PhilzSignature #PhilzThePerfumer', 'likes_count', 512, 'comments_count', 38, 'post_url', 'https://instagram.com/philztheperfumer'),
            jsonb_build_object('id', 'insta-2', 'image_url', '/media/products/diffuser-candles/diffuser-candle-1.jpg', 'caption', 'Elevate your sanctuary with our slow-burning scented candles and natural rattan reed diffusers. 🕯️ #HomeFragrance #PhilzSignature', 'likes_count', 684, 'comments_count', 49, 'post_url', 'https://instagram.com/philztheperfumer'),
            jsonb_build_object('id', 'insta-3', 'image_url', '/media/products/perfume-oils/perfume-oil-6.jpg', 'caption', 'Bespoke Private Label & Extrait formulations. Crafted to leave an indelible signature. 👑 #PhilzThePerfumer #LuxuryFragrance', 'likes_count', 920, 'comments_count', 73, 'post_url', 'https://instagram.com/philztheperfumer'),
            jsonb_build_object('id', 'insta-4', 'image_url', '/media/lifestyle/lifestyle-1.jpg', 'caption', 'Evening rituals: Warm vanilla, smoked amber, and quiet reflection. 🌙 #YourScentYourSignature #ScentLifestyle', 'likes_count', 410, 'comments_count', 27, 'post_url', 'https://instagram.com/philztheperfumer'),
            jsonb_build_object('id', 'insta-5', 'image_url', '/media/products/diffuser-candles/diffuser-candle-3.jpg', 'caption', 'Continuous diffusion of pure botanical oils. Effortless elegance for corporate & residential spaces. 🌿 #PhilzSignature', 'likes_count', 576, 'comments_count', 41, 'post_url', 'https://instagram.com/philztheperfumer'),
            jsonb_build_object('id', 'insta-6', 'image_url', '/media/banners/banner-4.jpg', 'caption', 'The Complete Wardrobe: Perfumes, perfume oils, reed diffusers, and luxury gifting hampers. #PhilzSignature #PhilzThePerfumer', 'likes_count', 1042, 'comments_count', 95, 'post_url', 'https://instagram.com/philztheperfumer')
        )
    ),
    true
),
(
    'footer_config',
    'footer',
    'Global Boutique Footer',
    jsonb_build_object(
        'brand_name', 'PHILZ SIGNATURE',
        'tagline', 'YOUR SCENT. YOUR SIGNATURE.',
        'brand_description', 'Luxury fragrances and scent experiences crafted for those who want to leave a lasting impression.',
        'closing_line', 'PHILZ SIGNATURE — Signature by nature, crafted for you.',
        'instagram', 'https://instagram.com/philztheperfumer',
        'instagram_handle', '@philztheperfumer',
        'whatsapp', 'https://wa.me/message/OJXETPKJE7L4M1',
        'concierge_email', 'Philzsignature1@gmail.com',
        'phone', '+2347038399764',
        'flagship_location', 'Lagos, Nigeria',
        'copyright_text', '© 2026 PHILZ SIGNATURE. ALL RIGHTS RESERVED.',
        'shop_links', jsonb_build_array(
            jsonb_build_object('label', 'Perfume Oils', 'url', '/shop?category=perfume-body-oils'),
            jsonb_build_object('label', 'Niche Collection', 'url', '/collections/niche-collection'),
            jsonb_build_object('label', 'Signature Collection', 'url', '/collections/signature-collection'),
            jsonb_build_object('label', 'Home Fragrance', 'url', '/shop?category=home-fragrance'),
            jsonb_build_object('label', 'Gifts', 'url', '/shop?category=gifts-and-hampers')
        ),
        'services_links', jsonb_build_array(
            jsonb_build_object('label', 'Private Label', 'url', '/contact?subject=Private Label Fragrance Project'),
            jsonb_build_object('label', 'Corporate Gifting', 'url', '/contact?subject=Corporate Fragrance Gifting'),
            jsonb_build_object('label', 'Bulk Orders', 'url', '/contact?subject=Bulk Fragrance Orders'),
            jsonb_build_object('label', 'Perfume Bar & Luxury Gifts', 'url', '/contact?subject=Perfume Bar & Luxury Gifts')
        ),
        'company_links', jsonb_build_array(
            jsonb_build_object('label', 'About Us', 'url', '/about'),
            jsonb_build_object('label', 'Our Story', 'url', '/about#our-story'),
            jsonb_build_object('label', 'Contact', 'url', '/contact'),
            jsonb_build_object('label', 'FAQs', 'url', '/faq')
        )
    ),
    true
)
ON CONFLICT (key) DO UPDATE SET
    content = EXCLUDED.content,
    updated_at = NOW();

-- ------------------------------------------------------------------------------
-- 7. SITE SETTINGS SEED
-- ------------------------------------------------------------------------------
INSERT INTO site_settings (key, value, description)
VALUES
    ('store_name', '"PHILZ SIGNATURE"', 'Official brand and storefront business name'),
    ('store_slogan', '"YOUR SCENT. YOUR SIGNATURE."', 'Brand tagline'),
    ('currency_code', '"NGN"', 'Primary operational currency'),
    ('currency_symbol', '"₦"', 'Primary currency display glyph'),
    ('concierge_email', '"Philzsignature1@gmail.com"', 'Primary concierge customer service inbox'),
    ('concierge_phone', '"+2347038399764"', 'Official concierge telephone line'),
    ('concierge_whatsapp', '"https://wa.me/message/OJXETPKJE7L4M1"', 'Direct private WhatsApp messenger hotline'),
    ('free_shipping_threshold', '150000', 'Subtotal threshold for complimentary delivery')
ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value,
    updated_at = NOW();
