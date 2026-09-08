const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');
const fs = require('fs');

const envContent = fs.readFileSync('.env', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.trim().split('=');
  const key = parts[0]?.trim();
  const val = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
  if (key && val) env[key] = val;
});

const url = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(url, key, {
  realtime: { transport: ws },
  auth: { persistSession: false, autoRefreshToken: false }
});

const OFFICIAL_IMAGE_URL = 'https://nntszytexvmolywvadyx.supabase.co/storage/v1/object/public/products/philz-signature-perfume-body-oil.jpg';
const CATEGORY_ID = 'c5555555-5555-5555-5555-555555555555'; // Luxury Fragrance Collection

const CATALOG = [
  {
    order: 1,
    name: 'Oud Maracuja',
    slug: 'oud-maracuja',
    sku: 'PS-01-OUD-MARACUJA',
    scent_profile: 'Exotic Fruits • Oud • Spices • Florals • Amber',
    full_description: 'A bold and intoxicating expression of exotic fruit and precious oud. Oud Maracuja opens with vibrant fruity brightness before revealing a rich heart of spices and florals. Deep, sensual and unforgettable, it is crafted for those who appreciate powerful fragrances with exceptional character.',
    short_description: 'Exotic fruit, rich oud and warm spices. Bold, sensual and unforgettable.',
    fragrance_family: 'Fruity • Woody • Oud',
    best_for: 'Unisex',
    top_notes: ['Exotic Fruits', 'Passion Fruit'],
    middle_notes: ['Spices', 'Florals'],
    base_notes: ['Precious Oud', 'Amber', 'Sensual Woods']
  },
  {
    order: 2,
    name: 'Imagination',
    slug: 'imagination',
    sku: 'PS-02-IMAGINATION',
    scent_profile: 'Citrus • Aromatic Spices • Black Tea • Ambrox • Woods',
    full_description: 'Fresh, sophisticated and effortlessly elegant, Imagination combines sparkling citrus with aromatic spices and a smooth, refined base. Clean yet luxurious, it creates an aura of confidence, freshness and understated sophistication.',
    short_description: 'Sparkling citrus, aromatic spices and refined woods. Fresh, clean and sophisticated.',
    fragrance_family: 'Citrus • Aromatic • Woody',
    best_for: 'Unisex',
    top_notes: ['Sparkling Citrus', 'Calabrian Bergamot', 'Orange'],
    middle_notes: ['Nigerian Ginger', 'Ceylon Cinnamon', 'Black Tea'],
    base_notes: ['Ambrox', 'Refined Woods', 'Guaiac Wood']
  },
  {
    order: 3,
    name: 'Ombre Nomade',
    slug: 'ombre-nomade',
    sku: 'PS-03-OMBRE-NOMADE',
    scent_profile: 'Oud • Smoky Woods • Amber • Fruity Accents • Incense',
    full_description: 'An intense journey into smoky woods and luxurious oud. Ombre Nomade blends deep, resinous oud with warm amber and subtle fruity sweetness, creating a powerful fragrance with an unmistakably luxurious presence.',
    short_description: 'Smoky oud, warm amber and subtle fruity sweetness. Deep, powerful and luxurious.',
    fragrance_family: 'Woody • Oud • Amber',
    best_for: 'Unisex',
    top_notes: ['Raspberry', 'Fruity Accents'],
    middle_notes: ['Smoky Woods', 'Incense', 'Rose'],
    base_notes: ['Resinous Oud', 'Warm Amber', 'Benzoin']
  },
  {
    order: 4,
    name: 'Promise',
    slug: 'promise',
    sku: 'PS-04-PROMISE',
    scent_profile: 'Rose • Spices • Patchouli • Oud • Amber',
    full_description: 'Promise is a rich and mysterious composition built around luxurious rose, warm spices and deep woods. Its dark, earthy character is softened by amber and resinous warmth, creating a fragrance that feels sophisticated, commanding and deeply memorable.',
    short_description: 'Rose, spices, woods and amber. Dark, mysterious and sophisticated.',
    fragrance_family: 'Woody • Floral • Amber',
    best_for: 'Unisex',
    top_notes: ['Pink Pepper', 'Rosemary', 'Apple'],
    middle_notes: ['Bulgarian Rose', 'Turkish Rose', 'Clove'],
    base_notes: ['Patchouli', 'Cypriol', 'Oud', 'Resinous Amber']
  },
  {
    order: 5,
    name: 'Hibiscus Mahajad',
    slug: 'hibiscus-mahajad',
    sku: 'PS-05-HIBISCUS-MAHAJAD',
    scent_profile: 'Hibiscus • Rose • Lychee • Red Fruits • Leather • Vanilla',
    full_description: 'A flamboyant fusion of exotic florals, juicy fruits and sensual warmth. Hibiscus Mahajád combines radiant rose and hibiscus with fruity accents, vanilla and smooth leather. Vibrant yet sophisticated, it is a statement fragrance designed to make an impression.',
    short_description: 'Hibiscus, rose, exotic fruits, leather and vanilla. Flamboyant and unforgettable.',
    fragrance_family: 'Floral • Fruity • Leather',
    best_for: 'Unisex',
    top_notes: ['Hibiscus', 'Lychee', 'Red Fruits'],
    middle_notes: ['Damascena Rose', 'Cassis', 'Cinnamon'],
    base_notes: ['Sensual Leather', 'Bourbon Vanilla', 'Amber']
  },
  {
    order: 6,
    name: 'Red Tobacco',
    slug: 'red-tobacco',
    sku: 'PS-06-RED-TOBACCO',
    scent_profile: 'Tobacco • Cinnamon • Spices • Amber • Woods • Vanilla',
    full_description: 'Powerful, warm and unapologetically bold, Red Tobacco blends rich tobacco with spices, woods and enveloping sweetness. Its intense character makes it perfect for those who want a fragrance that announces their presence with confidence.',
    short_description: 'Rich tobacco, warm spices and deep woods. Bold, intense and commanding.',
    fragrance_family: 'Tobacco • Spicy • Woody',
    best_for: 'Unisex',
    top_notes: ['Cinnamon', 'Saffron', 'Incense', 'Nutmeg'],
    middle_notes: ['Rich Tobacco Leaves', 'Patchouli', 'Jasmine'],
    base_notes: ['Deep Woods', 'Amber', 'Madagascar Vanilla', 'White Musk']
  },
  {
    order: 7,
    name: 'Santal 33',
    slug: 'santal-33',
    sku: 'PS-07-SANTAL-33',
    scent_profile: 'Sandalwood • Cedar • Leather • Spices • Musk',
    full_description: 'An iconic woody composition with a distinctive modern character. Santal 33 brings together creamy sandalwood, dry woods, subtle spice and soft musky nuances. Smooth, sophisticated and effortlessly versatile, it carries an understated sense of luxury.',
    short_description: 'Creamy sandalwood, dry woods and subtle spice. Modern, refined and effortlessly unisex.',
    fragrance_family: 'Woody • Spicy • Leathery',
    best_for: 'Unisex',
    top_notes: ['Violet Accord', 'Cardamom', 'Iris'],
    middle_notes: ['Papyrus', 'Ambrox', 'Cedarwood'],
    base_notes: ['Australian Sandalwood', 'Leather Accord', 'Soft Musk']
  },
  {
    order: 8,
    name: 'Amouage Guidance',
    slug: 'amouage-guidance',
    sku: 'PS-08-AMOUAGE-GUIDANCE',
    scent_profile: 'Pear • Hazelnut • Saffron • Rose • Osmanthus • Vanilla • Sandalwood',
    full_description: 'Elegant, radiant and beautifully complex, Guidance creates an opulent blend of delicate florals, luminous fruits, creamy woods and warm sweetness. Its luxurious character develops beautifully on the skin, leaving an impression that feels refined, sensual and sophisticated.',
    short_description: 'Radiant florals, fruits, creamy woods and warm sweetness. Opulent and sophisticated.',
    fragrance_family: 'Floral • Fruity • Woody',
    best_for: 'Unisex',
    top_notes: ['Crisp Pear', 'Hazelnut', 'Frankincense'],
    middle_notes: ['Saffron', 'Rose', 'Osmanthus', 'Jasmine Sambac'],
    base_notes: ['Sandalwood', 'Bourbon Vanilla', 'Akigalawood', 'Ambergris']
  },
  {
    order: 9,
    name: 'Portrait of a Lady',
    slug: 'portrait-of-a-lady',
    sku: 'PS-09-PORTRAIT-OF-A-LADY',
    scent_profile: 'Turkish Rose • Patchouli • Incense • Spices • Amber • Woods',
    full_description: 'A dramatic interpretation of rose, Portrait of a Lady surrounds rich rose with patchouli, incense, warm spices, woods and amber. Deep, elegant and sophisticated, it is a fragrance with a commanding presence and timeless appeal.',
    short_description: 'Turkish rose, patchouli, incense and amber. Dramatic, elegant and timeless.',
    fragrance_family: 'Floral • Chypre • Woody',
    best_for: 'Unisex',
    top_notes: ['Turkish Rose', 'Clove', 'Raspberry', 'Blackcurrant'],
    middle_notes: ['Patchouli Heart', 'Frankincense', 'Cinnamon'],
    base_notes: ['Sandalwood', 'Amber', 'Musk', 'Benzoin']
  },
  {
    order: 10,
    name: 'More Than Words',
    slug: 'more-than-words',
    sku: 'PS-10-MORE-THAN-WORDS',
    scent_profile: 'Fruity Notes • Rose • Oud • Amber • Woods',
    full_description: 'More Than Words is a deep and expressive fragrance where rich fruits, rose, oud and warm amber come together beautifully. Dark, sensual and artistic, it creates an aura of sophistication for those who prefer fragrances with depth and personality.',
    short_description: 'Rich fruits, rose, oud and amber. Deep, artistic and sensual.',
    fragrance_family: 'Woody • Oud • Fruity',
    best_for: 'Unisex',
    top_notes: ['Rich Dried Fruits', 'Sweet Berry Accents'],
    middle_notes: ['Velvet Rose', 'Floral Bouquet', 'Aromatic Spices'],
    base_notes: ['Precious Oud', 'Warm Amber', 'Cedar', 'Labdanum']
  },
  {
    order: 11,
    name: 'Halfeti',
    slug: 'halfeti',
    sku: 'PS-11-HALFETI',
    scent_profile: 'Dark Rose • Saffron • Oud • Leather • Spices • Vanilla • Woods',
    full_description: 'A mysterious blend inspired by the rare dark roses of Halfeti. Halfeti combines citrus and aromatic spices with rose, saffron, oud, leather, cedar, sandalwood, amber and vanilla. Rich, warm and luxurious, it is an unforgettable fragrance with remarkable depth.',
    short_description: 'Dark rose, saffron, oud, leather and vanilla. Mysterious, warm and luxurious.',
    fragrance_family: 'Woody • Spicy • Floral',
    best_for: 'Unisex',
    top_notes: ['Bergamot', 'Grapefruit', 'Cardamom', 'Saffron', 'Armoise'],
    middle_notes: ['Black Rose', 'Nutmeg', 'Jasmine', 'Violet'],
    base_notes: ['Oud', 'Supple Leather', 'Cedarwood', 'Sandalwood', 'Vanilla', 'Amber']
  },
  {
    order: 12,
    name: 'Vanilla Powder',
    slug: 'vanilla-powder',
    sku: 'PS-12-VANILLA-POWDER',
    scent_profile: 'Vanilla • Powdery Notes • Musk • Soft Woods',
    full_description: 'Soft, creamy and comforting, Vanilla Powder places smooth vanilla at the heart of a beautifully refined composition. Its powdery sweetness creates an elegant, cozy aura that feels luxurious without becoming overwhelming.',
    short_description: 'Creamy vanilla with a soft powdery finish. Elegant, warm and comforting.',
    fragrance_family: 'Vanilla • Powdery • Musky',
    best_for: 'Unisex',
    top_notes: ['Heliotrope', 'Almond Blossom'],
    middle_notes: ['Madagascar Vanilla', 'Coconut Powder'],
    base_notes: ['White Musk', 'Palo Santo', 'Soft Sandalwood']
  },
  {
    order: 13,
    name: 'Oud Wood',
    slug: 'oud-wood',
    sku: 'PS-13-OUD-WOOD',
    scent_profile: 'Oud • Sandalwood • Rosewood • Cardamom • Amber',
    full_description: 'Sophisticated and effortlessly refined, Oud Wood pairs precious oud with smooth woods, subtle spice and a warm, polished character. Understated yet luxurious, it is a versatile expression of modern elegance.',
    short_description: 'Precious oud, smooth woods and subtle spice. Understated, polished and luxurious.',
    fragrance_family: 'Woody • Oud • Spicy',
    best_for: 'Unisex',
    top_notes: ['Rare Oud', 'Rosewood', 'Cardamom'],
    middle_notes: ['Sichuan Pepper', 'Sandalwood', 'Vetiver'],
    base_notes: ['Tonka Bean', 'Vanilla', 'Golden Amber']
  },
  {
    order: 14,
    name: 'Blue Talisman',
    slug: 'blue-talisman',
    sku: 'PS-14-BLUE-TALISMAN',
    scent_profile: 'Pear • Bergamot • Ginger • Vanilla • Ambrette • Woods',
    full_description: 'A luminous and contemporary fragrance combining sparkling freshness with creamy sweetness and elegant woods. Blue Talisman feels modern, clean and luxurious, creating a distinctive aura that is both inviting and sophisticated.',
    short_description: 'Luminous freshness, creamy sweetness and elegant woods. Modern and distinctive.',
    fragrance_family: 'Fruity • Woody • Musky',
    best_for: 'Unisex',
    top_notes: ['Sparkling Bergamot', 'Juicy Pear', 'Mandarin', 'Fresh Ginger'],
    middle_notes: ['Orange Blossom', 'Georgywood'],
    base_notes: ['Akigalawood', 'Ambrofix', 'Musk', 'Creamy Vanilla']
  },
  {
    order: 15,
    name: 'Oud for Greatness',
    slug: 'oud-for-greatness',
    sku: 'PS-15-OUD-FOR-GREATNESS',
    scent_profile: 'Oud • Saffron • Nutmeg • Lavender • Musk • Patchouli',
    full_description: 'Powerful, regal and commanding, Oud for Greatness is an ode to luxurious oud. Rich spices, saffron and deep woods create a bold composition with an unmistakably majestic character. A fragrance for those who want their presence to be remembered.',
    short_description: 'Oud, saffron, spices and woods. Regal, powerful and commanding.',
    fragrance_family: 'Woody • Oud • Spicy',
    best_for: 'Unisex',
    top_notes: ['Lavender', 'Saffron', 'Nutmeg'],
    middle_notes: ['Natural Oud Wood', 'Agarwood Essence'],
    base_notes: ['Patchouli', 'Musk', 'Noble Woods']
  },
  {
    order: 16,
    name: 'Grand Soir',
    slug: 'grand-soir',
    sku: 'PS-16-GRAND-SOIR',
    scent_profile: 'Amber • Labdanum • Benzoin • Tonka Bean • Vanilla',
    full_description: 'A rich, enveloping amber fragrance inspired by the warmth and elegance of an evening. Grand Soir combines smooth amber with labdanum, benzoin, tonka and vanilla to create a beautifully warm and luxurious composition.',
    short_description: 'Rich amber, benzoin, tonka and vanilla. Warm, enveloping and luxurious.',
    fragrance_family: 'Amber • Oriental • Vanilla',
    best_for: 'Unisex',
    top_notes: ['Spanish Labdanum', 'Cistus'],
    middle_notes: ['Siam Benzoin', 'Brazilian Tonka Bean'],
    base_notes: ['Deep Amber Accord', 'Vanilla', 'Warm Resins']
  },
  {
    order: 17,
    name: 'Layton',
    slug: 'layton',
    sku: 'PS-17-LAYTON',
    scent_profile: 'Apple • Bergamot • Lavender • Jasmine • Vanilla • Pepper • Woods',
    full_description: 'Fresh, fruity and irresistibly smooth, Layton opens with bright apple and citrus before developing into a warm blend of florals, vanilla, woods and spice. Sophisticated yet approachable, it is an exceptionally versatile fragrance with a luxurious finish.',
    short_description: 'Apple, lavender, vanilla and warm woods. Fresh, sweet and sophisticated.',
    fragrance_family: 'Fruity • Floral • Woody',
    best_for: 'Unisex',
    top_notes: ['Crisp Apple', 'Bergamot', 'Lavender', 'Mandarin'],
    middle_notes: ['Jasmine', 'Violet', 'Geranium'],
    base_notes: ['Vanilla', 'Pink Pepper', 'Guaiac Wood', 'Patchouli', 'Sandalwood']
  },
  {
    order: 18,
    name: 'Cheirosa 59',
    slug: 'cheirosa-59',
    sku: 'PS-18-CHEIROSA-59',
    scent_profile: 'Vanilla Orchid • Sugar • Violet • Sandalwood • Amber',
    full_description: 'Sweet, creamy and effortlessly inviting, Cheirosa 59 combines soft florals with warm vanilla, gentle sweetness and smooth woods. It creates a beautiful comforting aura that feels youthful, radiant and addictive.',
    short_description: 'Soft florals, vanilla and creamy sweetness. Playful, comforting and addictive.',
    fragrance_family: 'Floral • Gourmand • Woody',
    best_for: 'Unisex',
    top_notes: ['Velvet Plum', 'Sugared Violet'],
    middle_notes: ['Vanilla Orchid', 'Whipped Amber'],
    base_notes: ['Sheer Sandalwood', 'Fresh Vetiver']
  },
  {
    order: 19,
    name: 'Delina Exclusif',
    slug: 'delina-exclusif',
    sku: 'PS-19-DELINA-EXCLUSIF',
    scent_profile: 'Lychee • Pear • Rose • Incense • Vanilla • Amber • Musk',
    full_description: 'A luxurious interpretation of romantic elegance, Delina Exclusif opens with juicy fruit before revealing a sensual rose heart. Vanilla, incense, musk and warm amber create a rich and sophisticated finish that is both captivating and refined.',
    short_description: 'Lychee, pear, rose, vanilla and musk. Romantic, intense and refined.',
    fragrance_family: 'Floral • Fruity • Amber',
    best_for: 'Women • Unisex',
    top_notes: ['Lychee', 'Pear', 'Bergamot', 'Grapefruit'],
    middle_notes: ['Turkish Rose', 'Incense', 'Oud'],
    base_notes: ['Bourbon Vanilla', 'Amber', 'Evernyl', 'Musk']
  },
  {
    order: 20,
    name: 'Althaïr',
    slug: 'althair',
    sku: 'PS-20-ALTHAIR',
    scent_profile: 'Vanilla • Cinnamon • Orange Blossom • Cardamom • Amber • Woods',
    full_description: 'Warm, creamy and irresistibly smooth, Althaïr is an elegant interpretation of vanilla. Its rich sweetness is balanced by aromatic spices, florals and woody nuances, creating a refined fragrance that feels luxurious, inviting and sophisticated.',
    short_description: 'Creamy vanilla, aromatic warmth and smooth woods. Rich, inviting and sophisticated.',
    fragrance_family: 'Vanilla • Amber • Spicy',
    best_for: 'Unisex',
    top_notes: ['Orange Blossom', 'Bergamot', 'Cinnamon', 'Cardamom'],
    middle_notes: ['Bourbon Vanilla', 'Elemi'],
    base_notes: ['Ambrox', 'Guaiac Wood', 'Praline', 'Musk']
  },
  {
    order: 21,
    name: 'Instant Crush',
    slug: 'instant-crush',
    sku: 'PS-21-INSTANT-CRUSH',
    scent_profile: 'Saffron • Citrus • Rose • Jasmine • Amber • Musk • Woods',
    full_description: 'A radiant explosion of saffron, amber and sweet florals. Instant Crush combines warm spices with creamy sweetness and rich woods to create a bold, sensual fragrance with impressive presence. Designed to make an immediate impression.',
    short_description: 'Saffron, amber, florals and sweet woods. Radiant, sensual and unforgettable.',
    fragrance_family: 'Amber • Floral • Spicy',
    best_for: 'Unisex',
    top_notes: ['Saffron', 'Ginger', 'Sicilian Mandarin', 'Sicilian Bergamot'],
    middle_notes: ['Moroccan Rose', 'Egyptian Jasmine', 'Precious Amber'],
    base_notes: ['Sandalwood', 'Oakmoss', 'White Musk', 'Madagascar Vanilla']
  },
  {
    order: 22,
    name: 'Vanilla Antique',
    slug: 'vanilla-antique',
    sku: 'PS-22-VANILLA-ANTIQUE',
    scent_profile: 'Dark Vanilla • Woods • Plum • Spices • Resinous Notes',
    full_description: 'Dark, rich and sophisticated, Vanilla Antique explores vanilla from its deeper, more mysterious side. Warm woods and dark resinous nuances add depth to the creamy sweetness, creating a luxurious fragrance that feels elegant, mature and captivating.',
    short_description: 'Dark vanilla, warm woods and resinous depth. Rich, mysterious and elegant.',
    fragrance_family: 'Vanilla • Woody • Amber',
    best_for: 'Unisex',
    top_notes: ['Black Plum', 'Freesia', 'Cardamom'],
    middle_notes: ['Cashmere Wood', 'Labdanum', 'Incense'],
    base_notes: ['Madagascar Vanilla Bean', 'Golden Amber', 'Dark Woods']
  },
  {
    order: 23,
    name: 'Donna Born in Roma',
    slug: 'donna-born-in-roma',
    sku: 'PS-23-DONNA-BORN-IN-ROMA',
    scent_profile: 'Blackcurrant • Jasmine • Bourbon Vanilla • Cashmeran • Woods',
    full_description: 'A modern expression of femininity, Donna Born in Roma combines luminous florals with sweet vanilla and sophisticated woody nuances. Elegant yet contemporary, it creates a confident and glamorous aura with a distinctly modern character.',
    short_description: 'Luminous florals, vanilla and sophisticated woods. Modern, feminine and glamorous.',
    fragrance_family: 'Floral • Vanilla • Woody',
    best_for: 'Women',
    top_notes: ['Blackcurrant', 'Pink Pepper', 'Bergamot'],
    middle_notes: ['Jasmine Grandiflorum', 'Jasmine Sambac', 'Jasmine Tea'],
    base_notes: ['Bourbon Vanilla', 'Cashmeran', 'Guaiac Wood']
  },
  {
    order: 24,
    name: 'Oud Satin Mood',
    slug: 'oud-satin-mood',
    sku: 'PS-24-OUD-SATIN-MOOD',
    scent_profile: 'Rose • Violet • Oud • Vanilla • Amber • Benzoin',
    full_description: 'Luxurious, smooth and intensely elegant, Oud Satin Mood wraps rich oud in a beautiful veil of rose, violet and creamy vanilla. Soft yet powerful, it leaves a sumptuous trail that feels like luxurious fabric against the skin.',
    short_description: 'Rose, violet, oud and creamy vanilla. Smooth, sumptuous and intensely elegant.',
    fragrance_family: 'Floral • Oud • Amber',
    best_for: 'Unisex',
    top_notes: ['Violet Accord', 'Geranium'],
    middle_notes: ['Damascena Rose', 'Turkish Rose', 'Laotian Oud'],
    base_notes: ['Bourbon Vanilla', 'Amber Accord', 'Siam Benzoin']
  },
  {
    order: 25,
    name: 'Sauvage Elixir',
    slug: 'sauvage-elixir',
    sku: 'PS-25-SAUVAGE-ELIXIR',
    scent_profile: 'Lavender • Cinnamon • Nutmeg • Cardamom • Licorice • Amber • Woods',
    full_description: 'A powerful and sophisticated interpretation of modern masculinity. Sauvage Elixir combines aromatic lavender with rich spices, cinnamon, licorice and deep woods. Intense, refined and commanding, it leaves a memorable trail that speaks of confidence and presence.',
    short_description: 'Lavender, rich spices, cinnamon and deep woods. Powerful, refined and commanding.',
    fragrance_family: 'Woody • Spicy • Aromatic',
    best_for: 'Men',
    top_notes: ['Cinnamon', 'Nutmeg', 'Cardamom', 'Grapefruit'],
    middle_notes: ['Nyons Lavender Essence', 'Licorice'],
    base_notes: ['Haitian Vetiver', 'Patchouli', 'Amber', 'Rich Woods']
  },
  {
    order: 26,
    name: 'Decadence',
    slug: 'decadence',
    sku: 'PS-26-DECADENCE',
    scent_profile: 'Plum • Rose • Jasmine • Amber • Woods • Vanilla',
    full_description: 'Luxurious, sensual and irresistibly glamorous, Decadence blends juicy plum with rich florals and a warm woody base. Its deep sweetness and elegant character create an alluring fragrance that feels opulent, sophisticated and memorable.',
    short_description: 'Juicy plum, rich florals and warm woods. Sensual, glamorous and luxurious.',
    fragrance_family: 'Fruity • Floral • Amber',
    best_for: 'Women',
    top_notes: ['Italian Plum', 'Iris', 'Saffron'],
    middle_notes: ['Bulgarian Rose', 'Jasmine Sambac', 'Orris'],
    base_notes: ['Liquid Amber', 'Vetiver', 'Papyrus Woods', 'Vanilla']
  },
  {
    order: 27,
    name: 'Stronger With You',
    slug: 'stronger-with-you',
    sku: 'PS-27-STRONGER-WITH-YOU',
    scent_profile: 'Chestnut • Vanilla • Cardamom • Sage • Amber • Woods',
    full_description: 'Warm, sweet and effortlessly addictive, Stronger With You combines aromatic chestnut with vanilla, amber and smooth woods. Its comforting sweetness creates a confident and charismatic aura that feels modern, intimate and inviting.',
    short_description: 'Sweet chestnut, vanilla, amber and woods. Warm, addictive and charismatic.',
    fragrance_family: 'Amber • Gourmand • Woody',
    best_for: 'Men',
    top_notes: ['Cardamom', 'Pink Pepper', 'Violet Leaves', 'Mint'],
    middle_notes: ['Sage', 'Melon', 'Pineapple', 'Lavender'],
    base_notes: ['Glazed Chestnut', 'Cedarwood', 'Amberwood', 'Vanilla']
  },
  {
    order: 28,
    name: 'Burberry Goddess',
    slug: 'burberry-goddess',
    sku: 'PS-28-BURBERRY-GODDESS',
    scent_profile: 'Lavender • Vanilla • Cocoa • Vanilla Caviar • Woody Notes',
    full_description: 'Elegant, creamy and beautifully radiant, Burberry Goddess is an ode to vanilla. A sophisticated blend of aromatic lavender and rich vanilla creates a soft yet confident fragrance with a warm, enveloping character.',
    short_description: 'Lavender and rich vanilla. Creamy, radiant and effortlessly elegant.',
    fragrance_family: 'Vanilla • Aromatic • Amber',
    best_for: 'Women',
    top_notes: ['Vanilla Infusion', 'Lavender', 'Cocoa', 'Ginger'],
    middle_notes: ['Vanilla Caviar', 'Luminous Florals'],
    base_notes: ['Vanilla Absolute', 'Cedarwood', 'Sensual Musk']
  },
  {
    order: 29,
    name: 'Coco Mademoiselle',
    slug: 'coco-mademoiselle',
    sku: 'PS-29-COCO-MADEMOISELLE',
    scent_profile: 'Orange • Bergamot • Rose • Jasmine • Patchouli • Vetiver • Vanilla',
    full_description: 'Timelessly elegant with a modern edge, Coco Mademoiselle opens with sparkling citrus before revealing rose, jasmine and a sophisticated patchouli base. Refined, feminine and confident, it is a true expression of effortless elegance.',
    short_description: 'Sparkling citrus, rose, jasmine and patchouli. Elegant, confident and timeless.',
    fragrance_family: 'Citrus • Floral • Woody',
    best_for: 'Women',
    top_notes: ['Orange', 'Mandarin Orange', 'Bergamot', 'Orange Blossom'],
    middle_notes: ['Turkish Rose', 'Jasmine', 'Mimosa', 'Ylang-Ylang'],
    base_notes: ['Patchouli', 'White Musk', 'Vanilla', 'Vetiver', 'Tonka Bean']
  },
  {
    order: 30,
    name: 'La Vie Est Belle',
    slug: 'la-vie-est-belle',
    sku: 'PS-30-LA-VIE-EST-BELLE',
    scent_profile: 'Iris • Blackcurrant • Pear • Jasmine • Orange Blossom • Praline • Vanilla',
    full_description: 'A radiant celebration of femininity, La Vie Est Belle combines luminous iris with sweet praline, vanilla and warm fruity nuances. Rich, graceful and inviting, it creates a beautifully sweet trail with an unmistakably elegant character.',
    short_description: 'Iris, praline, vanilla and fruity sweetness. Radiant, graceful and irresistible.',
    fragrance_family: 'Floral • Fruity • Gourmand',
    best_for: 'Women',
    top_notes: ['Blackcurrant', 'Juicy Pear'],
    middle_notes: ['Iris Pallida', 'Jasmine', 'Orange Blossom'],
    base_notes: ['Praline', 'Vanilla', 'Patchouli', 'Tonka Bean']
  },
  {
    order: 31,
    name: 'Ombre Leather',
    slug: 'ombre-leather',
    sku: 'PS-31-OMBRE-LEATHER',
    scent_profile: 'Leather • Cardamom • Jasmine • Amber • Patchouli • Moss • Woods',
    full_description: 'Bold, smooth and unmistakably sophisticated, Ombre Leather combines rich leather with aromatic cardamom, jasmine, amber and warm woods. Dark yet refined, it creates a luxurious aura of confidence, character and effortless edge.',
    short_description: 'Rich leather, cardamom, jasmine, amber and woods. Dark, smooth and sophisticated.',
    fragrance_family: 'Leather • Woody • Spicy',
    best_for: 'Unisex',
    top_notes: ['Cardamom'],
    middle_notes: ['Leather Accord', 'Jasmine Sambac'],
    base_notes: ['Amber', 'Moss', 'Patchouli', 'Cedarwood']
  }
];

const SIZES = [
  { size_ml: 15, label: '15ml', price: 15000, is_default: false, order: 1 },
  { size_ml: 30, label: '30ml', price: 30000, is_default: true, order: 2 },
  { size_ml: 50, label: '50ml', price: 40000, is_default: false, order: 3 },
  { size_ml: 100, label: '100ml', price: 75000, is_default: false, order: 4 },
];

async function seed() {
  console.log(`Beginning official catalog import (${CATALOG.length} products)...`);

  // 1. Delete any old product images and product variants, then products
  console.log('Cleaning existing product rows...');
  await supabase.from('product_images').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('product_videos').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('product_variants').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  let insertedCount = 0;
  let variantCount = 0;
  let imageCount = 0;

  for (const item of CATALOG) {
    const metaTitle = `${item.name} | Philz Signature Luxury Perfume Oil`;
    const metaDescription = `Discover ${item.name} by Philz Signature. ${item.short_description}`;
    const cleanNotes = item.scent_profile.split('•').map(s => s.trim()).join(', ');
    const metaKeywords = `${item.name}, ${item.fragrance_family}, ${cleanNotes}, Philz Signature, Luxury perfume, Perfume oil, Designer fragrance, Niche fragrance, Perfume Body Oil`;

    const productPayload = {
      name: item.name,
      slug: item.slug,
      sku: item.sku,
      tagline: item.short_description,
      description: item.full_description,
      short_description: item.short_description,
      scent_profile: item.scent_profile,
      fragrance_family: item.fragrance_family,
      best_for: item.best_for,
      brand: 'Philz Signature',
      category_id: CATEGORY_ID,
      concentration: 'Perfume Body Oil',
      price: 30000, // default 30ml variant price
      sale_price: null,
      stock_quantity: 100,
      weight_grams: 500,
      volume_ml: 30,
      top_notes: item.top_notes,
      middle_notes: item.middle_notes,
      base_notes: item.base_notes,
      ingredients: 'Pure Perfume Oil, Dipropylene Glycol, Botanical Fragrance Essences, Isopropyl Myristate, Natural Terpenes.',
      how_to_use: 'Apply directly onto pulse points (wrists, neck, inner elbows, collarbones). Gently dab without rubbing to preserve the delicate olfactory composition.',
      details: `Category: Luxury Fragrance Collection\nProduct Type: Perfume Body Oil\nBrand: Philz Signature\nBest For: ${item.best_for}\nScent Profile: ${item.scent_profile}\nFragrance Family: ${item.fragrance_family}`,
      status: 'published',
      is_featured: item.order <= 4, // First 4 featured
      is_bestseller: [1, 2, 3, 6, 7, 8, 15, 25].includes(item.order),
      is_new_arrival: item.order > 20,
      is_trending: [1, 8, 14, 17, 24, 31].includes(item.order),
      rating: 5.0,
      reviews_count: 0,
      display_order: item.order,
      meta_title: metaTitle,
      meta_description: metaDescription,
      meta_keywords: metaKeywords,
    };

    const { data: product, error: pErr } = await supabase
      .from('products')
      .insert(productPayload)
      .select()
      .single();

    if (pErr) {
      console.error(`Error inserting product ${item.name}:`, pErr);
      throw pErr;
    }

    insertedCount++;

    // Insert Product Image
    const { error: iErr } = await supabase.from('product_images').insert({
      product_id: product.id,
      image_url: OFFICIAL_IMAGE_URL,
      alt_text: `${item.name} - Philz Signature Perfume Body Oil`,
      display_order: 0,
      is_primary: true
    });

    if (iErr) {
      console.error(`Error inserting image for ${item.name}:`, iErr);
      throw iErr;
    }
    imageCount++;

    // Insert 4 Variants
    for (const sz of SIZES) {
      const variantSku = `${item.sku}-${sz.label.toUpperCase()}`;
      const { error: vErr } = await supabase.from('product_variants').insert({
        product_id: product.id,
        name: sz.label,
        size_ml: sz.size_ml,
        price: sz.price,
        sale_price: null,
        stock_quantity: 100,
        sku: variantSku,
        is_default: sz.is_default,
        display_order: sz.order
      });

      if (vErr) {
        console.error(`Error inserting variant ${sz.label} for ${item.name}:`, vErr);
        throw vErr;
      }
      variantCount++;
    }

    console.log(`[${item.order}/31] ${item.name} inserted (4 variants, image attached)`);
  }

  console.log('\n========================================');
  console.log('CATALOG IMPORT SUMMARY:');
  console.log(`✅ Products Inserted: ${insertedCount}/31`);
  console.log(`✅ Product Images Created: ${imageCount}/31`);
  console.log(`✅ Variants Created: ${variantCount}/124`);
  console.log('========================================\n');
}

seed().catch(err => {
  console.error('Fatal seed error:', err);
  process.exit(1);
});
