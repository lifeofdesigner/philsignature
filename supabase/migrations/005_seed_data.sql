-- ==============================================================================
-- PHILZ SIGNATURE — 005_seed_data.sql
-- Authentic Luxury Seed Data: Catalog, Collections, CMS & Settings
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. CATEGORIES SEED
-- ------------------------------------------------------------------------------
INSERT INTO categories (id, name, slug, description, display_order, is_active)
VALUES
    ('c1111111-1111-1111-1111-111111111111', 'Perfume Body Oils', 'perfume-body-oils', 'High-concentration botanical perfume body oils in Masculine, Feminine, and Unisex profiles.', 1, true),
    ('c2222222-2222-2222-2222-222222222222', 'Extrait de Parfum', 'extrait-de-parfum', 'Ultra-concentrated pure perfume extraits (25%-35% perfume oil).', 2, true),
    ('c3333333-3333-3333-3333-333333333333', 'Reed Diffusers', 'reed-diffusers', 'Artisanal natural rattan reed diffusers with slow botanical diffusion.', 3, true),
    ('c4444444-4444-4444-4444-444444444444', 'Scented Candles', 'scented-candles', 'Slow-burning luxury scented candles in matte black vessels with gold lettering.', 4, true),
    ('c5555555-5555-5555-5555-555555555555', 'Room Spray', 'room-spray', 'Instant atmosphere transformations with fine fragrance room mist.', 5, true),
    ('c6666666-6666-6666-6666-666666666666', 'Home Fragrance', 'home-fragrance', 'Curated home fragrance sanctuary sets, diffusers, and luxury candles.', 6, true)
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
        'text', 'COMPLIMENTARY NATIONWIDE DELIVERY ON ALL ORDERS OVER ₦150,000',
        'link_text', 'SHOP NOW',
        'link_url', '/shop'
    ),
    true
),
(
    'homepage_hero',
    'home',
    'Homepage Hero Billboard',
    jsonb_build_object(
        'badge', 'Haute Parfumerie',
        'headline', 'Luxury Perfumes That Last',
        'subtitle', 'Handcrafted long-lasting perfumes made with the finest fragrance oils. Rich, elegant scents designed to make a statement.',
        'primary_cta_text', 'Shop Perfumes',
        'primary_cta_url', '/shop',
        'secondary_cta_text', 'View Collections',
        'secondary_cta_url', '/collections',
        'background_image', '/brand/hero-oud-luxury.jpg'
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
        'title', 'Frequently Asked Questions',
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
            jsonb_build_object('label', 'Signature Collection', 'url', '/collections/signature-classics'),
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
-- 8. SITE SETTINGS SEED
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

