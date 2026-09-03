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
    'a1111111-1111-1111-1111-111111111111',
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
    'a2222222-2222-2222-2222-222222222222',
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
    'a3333333-3333-3333-3333-333333333333',
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
    'a4444444-4444-4444-4444-444444444444',
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
    'a5555555-5555-5555-5555-555555555555',
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
    'a6666666-6666-6666-6666-666666666666',
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
    'a7777777-7777-7777-7777-777777777777',
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
    ('a1111111-1111-1111-1111-111111111111', '/products/philz-oud-royal.jpg', 'Beyond You Flacon Frontal View', 1, true),
    ('a2222222-2222-2222-2222-222222222222', '/products/philz-body-oil.jpg', 'Nomad Luxury Extrait Flacon', 1, true),
    ('a3333333-3333-3333-3333-333333333333', '/products/philz-desert-rose.jpg', 'Fierce Elixir Velvet Presentation', 1, true),
    ('a4444444-4444-4444-4444-444444444444', '/products/philz-scented-candle.jpg', 'Hera Crystal Flacon Portrait', 1, true),
    ('a5555555-5555-5555-5555-555555555555', '/products/philz-body-oil.jpg', 'Promise Signature Bottle Angle', 1, true),
    ('a6666666-6666-6666-6666-666666666666', '/products/philz-desert-rose.jpg', 'Guidance Extrait Presentation', 1, true),
    ('a7777777-7777-7777-7777-777777777777', '/products/philz-oud-royal.jpg', 'Oud en Botella Pure Vintage Agarwood', 1, true)
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

