-- ==============================================================================
-- PHILZ SIGNATURE — 034_blog_system.sql
-- Public Blog System: Table, Indices, RLS, Views Increment RPC, and Seeds
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    excerpt TEXT,
    content TEXT NOT NULL,
    cover_image_url TEXT,
    author_name TEXT NOT NULL DEFAULT 'Philz Signature',
    category TEXT NOT NULL DEFAULT 'Fragrance Guide',
    tags TEXT[] NOT NULL DEFAULT '{}',
    published BOOLEAN NOT NULL DEFAULT false,
    featured BOOLEAN NOT NULL DEFAULT false,
    views INTEGER NOT NULL DEFAULT 0,
    seo_title TEXT,
    seo_description TEXT,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indices for rapid querying
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON public.blog_posts(published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_featured ON public.blog_posts(featured) WHERE published = true;
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON public.blog_posts(category) WHERE published = true;

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_blog_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_blog_posts_updated_at ON public.blog_posts;
CREATE TRIGGER trigger_update_blog_posts_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION update_blog_posts_updated_at();

-- Safe public view increment function
CREATE OR REPLACE FUNCTION public.increment_blog_views(post_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.blog_posts
    SET views = views + 1
    WHERE id = post_id AND published = true;
END;
$$;

-- Grant execution to public/anon
GRANT EXECUTE ON FUNCTION public.increment_blog_views(UUID) TO anon, authenticated, service_role;

-- Enable Row Level Security
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Drop previous policies if any exist
DROP POLICY IF EXISTS "Public can view published blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can manage all blog posts" ON public.blog_posts;

-- 1. Public can read published posts
CREATE POLICY "Public can view published blog posts"
ON public.blog_posts
FOR SELECT
TO public
USING (published = true);

-- 2. Authenticated admins and superadmins can perform all operations
CREATE POLICY "Admins can manage all blog posts"
ON public.blog_posts
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role IN ('super_admin', 'admin', 'administrator', 'content_manager', 'content_editor')
        AND is_active = true
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role IN ('super_admin', 'admin', 'administrator', 'content_manager', 'content_editor')
        AND is_active = true
    )
);

-- ==============================================================================
-- STEP 2: SEED 12 REAL, RICH BLOG POSTS
-- ==============================================================================

INSERT INTO public.blog_posts (
    title,
    slug,
    excerpt,
    content,
    cover_image_url,
    author_name,
    category,
    tags,
    published,
    featured,
    views,
    seo_title,
    seo_description,
    published_at
) VALUES
-- 1. The Art of the Signature Scent
(
    'The Art of the Signature Scent: Finding Your Fragrance Identity',
    'the-art-of-the-signature-scent-finding-your-fragrance-identity',
    'Discover how to cultivate an unforgettable fragrance identity. Learn the art of selecting notes that mirror your essence and elevate your presence effortlessly.',
    '<p>A signature scent is more than an invisible accessory; it is an intimate olfactory portrait that introduces you before you speak and lingers with quiet authority after you depart. In the realm of haute parfumerie, discovering that singular fragrance is an intentional pursuit of self-expression.</p>
<h2>1. Understanding Your Olfactory Chemistry</h2>
<p>Every person possesses a distinct skin chemistry influenced by natural lipid levels, diet, hydration, and body temperature. When an artisanal perfume oil or pure extrait touches your pulse points, it evolves dynamically. A fragrance that projects brisk citrus notes on testing paper may blossom into rich, honeyed warmth upon contact with your skin.</p>
<p>To truly understand how a fragrance behaves on your skin, never make a decision based merely on top notes during the first sixty seconds. Allow the perfume oil at least four hours to unveil its heart and settling base notes before discerning its true alignment with your aura.</p>
<h2>2. Decoding the Four Major Fragrance Families</h2>
<p>Your signature fragrance should effortlessly echo your lifestyle and interior temperament. Consider these archetypes:</p>
<ul>
  <li><strong>The Wood and Amber Connoisseur:</strong> Anchored in sacred Cambodian agarwood (oud), smoky guaiac, dry cedar, and radiant golden amber. Resonant with quiet confidence, strength, and timeless luxury.</li>
  <li><strong>The Floral and Romantic Persona:</strong> Enriched with Grasse jasmine, damask rose, and velvety tuberose. Elegantly commanding without overwhelming subtle nuances.</li>
  <li><strong>The Fresh and Crisp Aesthete:</strong> Built on sparkling bergamot, Sicilian lemon, crushed neroli, and aquatic breezes. Ideal for humid tropical climates and discerning executive boardrooms.</li>
  <li><strong>The Gourmand and Warm Enigma:</strong> Laced with bourbon vanilla, toasted tonka bean, roasted almond, and bitter cacao. Intimate, captivating, and deeply comforting.</li>
</ul>
<h2>3. The Mastery of Scent Layering</h2>
<p>True luxury connoisseurs rarely wear a single fragrance identically every day. The Philz Signature atelier encourages bespoke scent layering. Begin with a concentrated perfume body oil upon clean, moisturized skin. Allow the nourishing lipids to lock down the foundational base accords, then softly mist with a complementary extrait de parfum or artisanal room ambiance to create multidimensional longevity.</p>
<p>When chosen with discernment, your signature scent becomes your indelible legacy in the minds of those you encounter.</p>',
    'https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=800',
    'Philz Signature Atelier',
    'Fragrance Guide',
    ARRAY['Fragrance Identity', 'Perfume Guide', 'Scent Layering', 'Philz Signature'],
    true,
    false,
    1240,
    'The Art of the Signature Scent | Philz Signature Guide',
    'Discover how to find your personal signature fragrance identity. Expert tips on fragrance families, skin chemistry, and bespoke scent layering.',
    '2024-01-15 10:00:00+01'
),

-- 2. Why Nigerian Luxury Fragrances Are Taking the World by Storm
(
    'Why Nigerian Luxury Fragrances Are Taking the World by Storm',
    'why-nigerian-luxury-fragrances-are-taking-the-world-by-storm',
    'Nigeria is commanding the global luxury perfume renaissance. Discover how African craftsmanship and high-concentration oils are redefining haute parfumerie.',
    '<p>The global luxury landscape is witnessing a profound paradigm shift. Discerning fragrance collectors across London, Dubai, Paris, and New York are looking toward Lagos and Abuja not merely for creative inspiration, but for authentic leadership in high-concentration artisanal perfumery.</p>
<h2>The Heritage of African Olfactory Culture</h2>
<p>Centuries before mass-market European perfume conglomerates commoditized synthetic alcohol sprays, West African traditions revered rich botanical oils, fragrant resins, crushed gums, and frankincense. Scent was never an afterthought in our heritage; it was an indispensable marker of nobility, welcome, spiritual elevation, and communal prestige.</p>
<p>Today, contemporary luxury houses like Philz Signature are modernizing this venerable legacy. We marry time-honored artisanal extractions with uncompromising French formulation standards to forge a distinctive olfactory vocabulary.</p>
<h2>The Climate Imperative: Why Concentration Matters</h2>
<p>Most commercial Western perfumes are formulated for temperate European climates, typically containing only 10% to 15% aromatic oils suspended in volatile alcohol that evaporates rapidly in tropical heat. Nigerian fragrance patrons demanded better. In the heat and humidity of West Africa, only pure concentrated oils, rich extraits de parfum, and resinous bases achieve the commanding sillage and enduring longevity required of true luxury.</p>
<h2>Global Admiration for Artisanal Authenticity</h2>
<p>The contemporary luxury consumer has grown fatigued by ubiquitous department-store fragrances mass-produced by the million. They seek soul, rarity, handcrafted exclusivity, and genuine substance. Philz Signature embodies this standard—hand-poured flacons, ethically sourced ingredients, and olfactory profiles that refuse to whisper.</p>',
    'https://images.unsplash.com/photo-1541643600914-78b084683702?w=800',
    'Philz Signature Curators',
    'Luxury Living',
    ARRAY['African Luxury', 'Nigerian Perfumery', 'Haute Parfumerie', 'Lagos Luxury'],
    true,
    false,
    1820,
    'Why Nigerian Luxury Fragrances Dominate | Philz Signature',
    'Explore how Nigeria is redefining global luxury perfumery. Discover high-concentration artisanal extraits de parfum hand-poured in Lagos.',
    '2024-03-20 11:30:00+01'
),

-- 3. Behind the Scent: How 'Imagination' Was Born
(
    'Behind the Scent: How ''Imagination'' Was Born',
    'behind-the-scent-how-imagination-was-born',
    'The untold genesis of Philz Signature''s crowning olfactory masterpiece. From sun-drenched Italian bergamot to smoldering Nigerian amber crystals.',
    '<p>Every masterpiece begins with an obsession. For the nose behind Philz Signature, the genesis of <em>Imagination</em> was ignited by an audacious ambition: to capture the fleeting borderland between celestial brightness and profound earthly mystique in a single flacon.</p>
<h2>The Spark of Inspiration</h2>
<p>The creative journey began during an early morning stroll along the coastline of Lagos, where the cool maritime breeze collided with the warmth of awakening terra-cotta earth. We envisioned a fragrance that would open with crisp, crystalline vibrancy before descending into an opulent, nocturnal embrace.</p>
<h2>Curating the Rarest Botanicals</h2>
<p>It took eighteen months of rigorous formulation and thirty-seven developmental iterations to balance <em>Imagination</em>:</p>
<ul>
  <li><strong>The Opening Symphony:</strong> Cold-pressed Calabrian bergamot, zesty Sicilian mandarin, and sparkling neroli petals, yielding an exhilarating surge of morning light.</li>
  <li><strong>The Heart Accord:</strong> Precious Nigerian ginger root macerated alongside rare Chinese black tea and aromatic Tunisian orange blossom, infusing spicy sophistication.</li>
  <li><strong>The Grand Base:</strong> Royal ambergris crystals, velvety ambroxan, and aged smoky Haitian vetiver providing incredible twenty-four-hour staying power.</li>
</ul>
<h2>The Maceration and Bottling Atelier</h2>
<p>Unlike commercial perfumes rushed from lab bench to retail shelf in weeks, each consignment of <em>Imagination</em> undergoes forty-five days of deliberate maturation in our temperature-controlled Lagos atelier. This allows the high-grade essential essences to marry seamlessly, ensuring that each droplet reflects the uncompromising grandeur of haute parfumerie.</p>',
    'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800',
    'Philz Signature Atelier',
    'Behind the Scent',
    ARRAY['Imagination', 'Behind The Scent', 'Artisanal Perfume', 'Master Perfumer'],
    true,
    true,
    3450,
    'Behind the Scent: How Imagination Was Born | Philz Signature',
    'Step into the Philz Signature atelier to witness the genesis of our flagship fragrance Imagination. Rare botanicals, artisanal aging, and pure extrait excellence.',
    '2024-05-12 14:00:00+01'
),

-- 4. Eau de Parfum vs Eau de Toilette
(
    'Eau de Parfum vs Eau de Toilette: What You''re Really Paying For',
    'eau-de-parfum-vs-eau-de-toilette-what-youre-really-paying-for',
    'Demystifying perfume concentration grades. Understand the tangible difference between cologne, EDT, EDP, and pure Extrait de Parfum.',
    '<p>When shopping for luxury fragrances, price tags vary drastically. The critical distinction that governs longevity, sillage, and genuine olfactory value lies in fragrance concentration—the exact ratio of aromatic essence to alcohol base.</p>
<h2>The Hierarchy of Concentrations</h2>
<p>Understanding these industry tiers empowers you to make wise acquisitions:</p>
<ul>
  <li><strong>Eau de Cologne (EDC):</strong> Contains 2% to 4% fragrance oil. Typically lasts one to two hours; designed primarily as a post-grooming refresher.</li>
  <li><strong>Eau de Toilette (EDT):</strong> Contains 5% to 15% fragrance concentration. Lasts approximately three to five hours. While affordable, it necessitates frequent reapplication throughout the day.</li>
  <li><strong>Eau de Parfum (EDP):</strong> Contains 15% to 20% fragrance oils. Lasts six to eight hours with radiant projection.</li>
  <li><strong>Extrait de Parfum / Concentrated Oil:</strong> The pinnacle of luxury perfumery, containing 25% to 40% pure aromatics. A single application endures from dawn until midnight and frequently remains detectable on garments for days.</li>
</ul>
<h2>Why Philz Signature Specializes in High Concentrations</h2>
<p>At Philz Signature, we formulate exclusively in concentrated perfume oils and high-potency extraits. While dilute mass-market formulations evaporate in hours, our oils meld into the dermis, providing an intimate, magnetic trail that evolves as your body warms throughout the evening.</p>',
    'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=800',
    'Philz Signature Curators',
    'Fragrance Guide',
    ARRAY['Perfume Concentration', 'Extrait de Parfum', 'EDP vs EDT', 'Longevity'],
    true,
    false,
    1590,
    'EDP vs EDT: The Ultimate Concentration Guide | Philz Signature',
    'Understand the critical difference between Eau de Parfum, Eau de Toilette, and pure Extrait de Parfum. Learn why concentration determines perfume value.',
    '2024-07-18 09:15:00+01'
),

-- 5. The Perfect Fragrance for Every Occasion
(
    'The Perfect Fragrance for Every Occasion',
    'the-perfect-fragrance-for-every-occasion',
    'Elevate your daily presence with deliberate fragrance pairings. A curated guide to office elegance, romantic soirees, and formal galas.',
    '<p>Just as a tailored tuxedo is out of place at a coastal brunch, wearing an overwhelming heavy oud to a high-noon boardroom meeting can clash with your environment. Dressing in fragrance requires situational mastery.</p>
<h2>1. Executive Boardrooms & Daytime Professionalism</h2>
<p>In professional settings, your perfume should communicate competence, composure, and refinement without overwhelming your colleagues. Favor crisp, structured accords featuring bright citrus, fresh vetiver, powdery iris, and clean white cedarwood.</p>
<h2>2. Intimate Dinners & Romantic Soirees</h2>
<p>Evening rendezvous call for proximity fragrances—scents that invite closer conversation rather than commanding the entire room. Sensual amber, creamy Madagascar vanilla, warm saffron, and velvety damask rose evoke intrigue and unforgettable warmth.</p>
<h2>3. High-Society Galas & Grand Celebrations</h2>
<p>When attending festive weddings or formal galas, you possess full license to unleash opulent, regal formulations. Rich Cambodian agarwood, smoky leather, dark plum, and golden frankincense ensure your presence commands the ballroom effortlessly.</p>
<h2>4. Casual Weekends & Relaxation</h2>
<p>On leisurely weekends, opt for breezy aquatic, crisp herbaceous, or delicate floral blends that offer effortless freshness.</p>',
    'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=800',
    'Philz Signature Stylists',
    'Style & Scent',
    ARRAY['Fragrance Styling', 'Date Night Scent', 'Office Fragrance', 'Event Scents'],
    true,
    false,
    1430,
    'The Perfect Fragrance for Every Occasion | Philz Signature',
    'Master the art of situational fragrance styling. Expert recommendations for boardroom presence, romantic evenings, and regal weekend galas.',
    '2024-09-22 13:00:00+01'
),

-- 6. How to Make Your Fragrance Last All Day
(
    'How to Make Your Fragrance Last All Day',
    'how-to-make-your-fragrance-last-all-day',
    'Unlock eighteen-hour longevity with professional application techniques. Discover the science of pulse points, lipid moisture barriers, and scent storage.',
    '<p>There is little more frustrating than investing in an artisanal perfume only to feel its radiant aura fade by midday. Fortunately, longevity is fundamentally rooted in application physics and skin conditioning.</p>
<h2>Step 1: Hydrate Before You Apply</h2>
<p>Dry skin is the greatest enemy of perfume longevity; it greedily absorbs the volatile alcohol and carrier oils, neutralizing projection. Always apply your fragrance immediately following a shower when pores are receptive, ideally over thoroughly moisturized skin or an unscented body butter.</p>
<h2>Step 2: Target the Critical Pulse Points</h2>
<p>Pulse points are areas where blood vessels sit nearest the skin surface, radiating gentle warmth that naturally diffuses aromatics:</p>
<ul>
  <li>The inner wrists (gently pressed, never rubbed—rubbing crushes delicate top-note molecular structures)</li>
  <li>The hollow of the collarbone and sides of the carotid artery</li>
  <li>Behind the earlobes and the nape of the neck</li>
  <li>The warm creases of the inner elbows and behind the knees</li>
</ul>
<h2>Step 3: Preserve Your Fragrance Integrity</h2>
<p>Never store your flacons in damp, brightly lit bathrooms. Fluctuating humidity, heat, and ultraviolet rays degrade volatile aromatic compounds. Store your Philz Signature treasures in their original luxury presentation boxes in a cool, dark drawer.</p>',
    'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800',
    'Philz Signature Atelier',
    'Fragrance Guide',
    ARRAY['Pulse Points', 'Perfume Longevity', 'Application Tips', 'Scent Projection'],
    true,
    false,
    2100,
    'How to Make Your Fragrance Last All Day | Philz Signature',
    'Professional tips to guarantee your perfume endures all day. Master pulse point application, moisture layering, and proper flacon preservation.',
    '2024-11-10 10:45:00+01'
),

-- 7. The Language of Scent: Understanding Fragrance Notes
(
    'The Language of Scent: Understanding Fragrance Notes',
    'the-language-of-scent-understanding-fragrance-notes',
    'Unravel the fragrance pyramid. A comprehensive guide to understanding top, heart, and base notes with examples from the Philz Signature catalog.',
    '<p>When master perfumers compose a bespoke creation, they think like symphonic conductors. A harmonious perfume does not release all its beauty simultaneously; it unfolds across temporal movements known as the Olfactory Pyramid.</p>
<h2>The Top Notes (The Overture)</h2>
<p>These are the lightest, most volatile molecules that greet your senses upon initial application. Typically lasting fifteen to thirty minutes, top notes create the vital first impression. In the Philz Signature catalog, we feature cold-pressed bergamot, crisp green apple, effervescent pink peppercorn, and sun-drenched coastal neroli.</p>
<h2>The Heart Notes (The Core Identity)</h2>
<p>As the initial burst softens, the true personality of the perfume emerges. Heart notes endure for four to six hours. This is where rich florals like Grasse jasmine, Bulgarian rose, aromatic cinnamon bark, and smoked black tea reside, providing roundness and emotional depth.</p>
<h2>The Base Notes (The Eternal Foundation)</h2>
<p>The foundation of any great perfume consists of heavy, dense molecules that anchor the entire composition. Emerging after several hours, base notes can endure on skin for over twenty-four hours. Philz Signature is acclaimed for our rich bases: sacred agarwood (oud), raw ambergris, bourbon vanilla, Haitian vetiver, and creamy Mysore sandalwood.</p>
<p>Understanding this architecture ensures you appreciate the changing story your fragrance narrates throughout your day.</p>',
    'https://images.unsplash.com/photo-1611080541599-8c6dbde6ed28?w=800',
    'Philz Signature Curators',
    'Fragrance Guide',
    ARRAY['Fragrance Notes', 'Top Notes', 'Heart Notes', 'Base Notes', 'Oud & Amber'],
    true,
    true,
    3120,
    'Understanding Fragrance Notes & Pyramid | Philz Signature',
    'Explore the anatomy of a perfume pyramid. Learn how top, heart, and base notes harmonize to create timeless olfactory masterpieces.',
    '2025-01-18 12:00:00+01'
),

-- 8. Gifting Luxury: Why Fragrance is the Ultimate Personal Gift
(
    'Gifting Luxury: Why Fragrance is the Ultimate Personal Gift',
    'gifting-luxury-why-fragrance-is-the-ultimate-personal-gift',
    'Selecting a fragrance gift is an exquisite gesture of devotion. Explore our bespoke concierge guide to gifting luxury scents for life''s grandest milestones.',
    '<p>Few gifts rival the emotional resonance of a luxury fragrance. When you present someone with a bespoke perfume, you are declaring: <em>I know your temperament, I honor your presence, and I wish to adorn you with beauty</em>.</p>
<h2>The Intimate Psychology of Scent Gifting</h2>
<p>Unlike apparel or accessories that can feel impersonal, fragrance becomes one with the wearer''s daily rituals. Every time they apply the elixir, the memory of the giver is gently reawakened. It is an enduring emotional token.</p>
<h2>How to Select the Perfect Scent for Someone Else</h2>
<p>When selecting a fragrance without the recipient present, look for subtle stylistic cues:</p>
<ul>
  <li><strong>The Classical Sophisticate:</strong> Seeks balanced chypre structures, velvety iris, and refined sandalwood accords.</li>
  <li><strong>The Modern Visionary:</strong> Drawn to avant-garde juxtapositions—sharp spices paired with luminous amber and aquatic minerals.</li>
  <li><strong>The Bold Connoisseur:</strong> Revels in commanding, opulent profiles dominated by sacred oud, rich leather, and dark tobacco.</li>
</ul>
<p>At Philz Signature, our concierge gift sets arrive in hand-lacquered black boxes sealed with golden ribbons, accompanied by customized calligraphy messages for an unmatched presentation.</p>',
    'https://images.unsplash.com/photo-1549824479-ea1b3c32e7a0?w=800',
    'Philz Signature Concierge',
    'Luxury Living',
    ARRAY['Luxury Gifting', 'Valentine Gifts', 'Perfume Gift Set', 'Bespoke Gifts'],
    true,
    false,
    1670,
    'Luxury Fragrance Gifting Guide | Philz Signature',
    'Why artisanal perfume is the ultimate personal gift. Tips for selecting luxury fragrance sets for anniversaries, birthdays, and celebrations.',
    '2025-02-10 15:30:00+01'
),

-- 9. Artisanal vs Mass-Market Fragrances
(
    'Artisanal vs Mass-Market Fragrances: The Real Difference',
    'artisanal-vs-mass-market-fragrances-the-real-difference',
    'Why mass-market department store perfumes cannot compare to handcrafted niche formulations. Ingredients, small-batch aging, and pure art.',
    '<p>Walk into any mainstream shopping mall and you will be met with walls of celebrity-endorsed fragrances. While attractively packaged, the vast majority share a disappointing secret: they are mass-manufactured in industrial vats using identical cheap synthetic aromachemicals designed to maximize corporate profit margins.</p>
<h2>The Essence of Artisanal Creation</h2>
<p>By contrast, artisanal haute parfumerie operates like high jewelry or bespoke tailoring. Independent fragrance houses like Philz Signature prioritize raw material integrity over celebrity marketing campaigns.</p>
<h2>Three Pillars of the Artisanal Advantage</h2>
<ol>
  <li><strong>Purity of Raw Botanicals:</strong> Where mass brands use synthetic vanillin, we source whole cured bourbon vanilla pods. Where they use synthetic oud recreations, we procure authentic aged agarwood oil distilled with ancestral respect.</li>
  <li><strong>Small-Batch Maceration:</strong> Our batches are limited to small allocations aged in small casks, allowing every batch to achieve peak depth and complex richness.</li>
  <li><strong>Uncompromising Vision:</strong> We do not formulate to satisfy anonymous focus groups. We compose bold, evocative perfumes that provoke thought, inspire adoration, and celebrate individuality.</li>
</ol>',
    'https://images.unsplash.com/photo-1594913122591-e99a72c8c3d3?w=800',
    'Philz Signature Atelier',
    'Behind the Scent',
    ARRAY['Artisanal Fragrance', 'Niche Perfumery', 'Rare Botanicals', 'Handcrafted Luxury'],
    true,
    false,
    1890,
    'Artisanal vs Mass-Market Perfumes | Philz Signature',
    'Understand the profound difference between handcrafted artisanal parfums and mass-produced commercial fragrances. Quality, concentration, and craft.',
    '2025-04-14 11:00:00+01'
),

-- 10. Scent and Memory: The Emotional Power of Fragrance
(
    'Scent and Memory: The Emotional Power of Fragrance',
    'scent-and-memory-the-emotional-power-of-fragrance',
    'The neuroscience of the Proustian phenomenon. How olfactory stimuli unlock forgotten emotions and cement eternal milestones in memory.',
    '<p>Have you ever caught a fleeting trace of amber or jasmine on a crowded street and found yourself instantly transported twenty years into your past? This sudden, vivid time-travel is neither coincidence nor sentimentality—it is a marvel of human neuroscience known as the Proustian phenomenon.</p>
<h2>The Direct Bridge to the Limbic System</h2>
<p>Of our five classical senses, smell is uniquely wired directly into the brain''s limbic system—the primal seat of emotion and long-term memory. While sight, sound, and touch must first pass through the analytical thalamus for cognitive processing, olfactory receptors send signals straight to the amygdala and hippocampus.</p>
<p>As a result, an aroma evokes raw, unfiltered emotion long before your conscious mind can even formulate words to describe what you are smelling.</p>
<h2>Engineering Your Life Milestones</h2>
<p>Because fragrance forms indelible mental bonds, conscious individuals deliberately select specific perfumes for monumental life chapters—a landmark business launch, an overseas expedition, or their wedding day. Wearing a dedicated extrait de parfum during those days seals that milestone forever. Decades later, a single breath from that flacon revives the joy, pride, and serenity with crystalline clarity.</p>',
    'https://images.unsplash.com/photo-1563170352-6e21515e3054?w=800',
    'Philz Signature Curators',
    'Luxury Living',
    ARRAY['Scent & Memory', 'Olfactory Psychology', 'Nostalgia', 'Signature Impression'],
    true,
    true,
    2980,
    'The Emotional Power of Scent & Memory | Philz Signature',
    'Explore the profound neuroscience connecting fragrance with memory and emotion. Discover how to anchor life''s greatest milestones in scent.',
    '2025-06-25 16:20:00+01'
),

-- 11. Building a Fragrance Wardrobe
(
    'Building a Fragrance Wardrobe: Seasonal Scents for Every Mood',
    'building-a-fragrance-wardrobe-seasonal-scents-for-every-mood',
    'Why limiting yourself to a single perfume restricts your elegance. How to curate an intentional fragrance wardrobe across climate seasons and shifting moods.',
    '<p>While the concept of a signature scent carries undeniable romanticism, restricting oneself to a single bottle throughout the entire year is like wearing cashmere sweaters in the sweltering heat of August or linen shirts in the depths of Harmattan dust.</p>
<h2>The Philosophy of the Fragrance Wardrobe</h2>
<p>A sophisticated fragrance wardrobe consists of four to six versatile perfumes that speak to different seasons, moods, and social environments. Building one does not require overwhelming quantity, but intentional curation.</p>
<h2>Essential Pillars of Your Olfactory Collection</h2>
<ul>
  <li><strong>The Daily Clean Foundation:</strong> A reliable, high-tenacity citrus-floral or sheer woody scent that feels uplifting and polished for everyday affairs.</li>
  <li><strong>The Rainy Season Comfort:</strong> During West African monsoon rains, moist air beautifully carries lactonic vanilla, toasted spices, and rich cocoa notes that wrap around you like a silk cloak.</li>
  <li><strong>The Harmattan Shield:</strong> The dry, brisk Harmattan winds demand rich resins, smokey incense, and deep ambered ouds that will not be stripped by arid breezes.</li>
  <li><strong>The Grand Statement Piece:</strong> Your apex evening fragrance—extravagant, complex, and unforgettably radiant for gala dinners and celebrations.</li>
</ul>
<p>Curating your wardrobe transforms the simple act of choosing a morning fragrance into an inspiring ritual of daily intention.</p>',
    'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800',
    'Philz Signature Stylists',
    'Style & Scent',
    ARRAY['Fragrance Wardrobe', 'Seasonal Perfume', 'Harmattan Scents', 'Mood & Scent'],
    true,
    false,
    1760,
    'Building a Luxury Fragrance Wardrobe | Philz Signature',
    'Learn how to curate a multi-faceted fragrance wardrobe. Discover scent pairings for tropical heat, dry Harmattan, and elegant evening galas.',
    '2025-08-19 14:10:00+01'
),

-- 12. Philz Signature 2026: New Collections and What's Coming
(
    'Philz Signature 2026: New Collections and What''s Coming',
    'philz-signature-2026-new-collections-and-whats-coming',
    'A glimpse into the future of Philz Signature. Discover our 2026 creative roadmap, bespoke flacon designs, and limited-edition atelier releases.',
    '<p>As we step into 2026, Philz Signature stands at the precipice of an exhilarating new chapter in contemporary African haute parfumerie. What began as a dedicated atelier in Lagos has evolved into a nationally revered sanctuary for discerning scent connoisseurs.</p>
<h2>Expanding the Olfactory Horizons</h2>
<p>This year, our master perfumers have spent months working alongside ancestral ingredient harvesters to pioneer three groundbreaking additions to our core collection:</p>
<ul>
  <li><strong>The Private Reserve Oud Line:</strong> An ultra-exclusive trio of aged wild agarwood extraits, each hand-numbered and sealed with custom golden wax seals.</li>
  <li><strong>Bespoke Ambient Sanctuaries:</strong> Following the overwhelming success of our hand-poured luxury soy candles and artisanal room sprays, we are introducing sculptural crystal reed diffusers designed as centerpiece home décor.</li>
  <li><strong>The Nomadic Travel Flacon:</strong> Heavyweight brass atomizers designed to accompany global patrons securely through international skies.</li>
</ul>
<h2>Our Unbroken Promise of Excellence</h2>
<p>While our collections grow, our foundational creed remains unyielding: zero dilution, ethical botanical procurement, and uncompromising dedication to our valued patrons. Thank you for walking this fragrant journey alongside us.</p>',
    'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=800',
    'Philz Signature Atelier',
    'Behind the Scent',
    ARRAY['Philz 2026', 'New Releases', 'Atelier Vision', 'Limited Editions'],
    true,
    false,
    2240,
    'Philz Signature 2026: The Vision Ahead | Official Atelier News',
    'Discover the 2026 creative roadmap for Philz Signature. Private Reserve ouds, sculptural home fragrances, and our enduring commitment to artisanal luxury.',
    '2026-01-28 09:00:00+01'
)
ON CONFLICT (slug) DO NOTHING;
