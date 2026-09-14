import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = 'https://nntszytexvmolywvadyx.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5udHN6eXRleHZtb2x5d3ZhZHl4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODI2NjYxNywiZXhwIjoyMTAzODQyNjE3fQ.9ac3pTJX6G5g2iDE-I-WcHTHuX3iUZcWB1WeImU5sUk';

const headers = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'return=representation',
};

async function fetchWithRetry(url, options = {}, maxRetries = 4, delay = 1000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url, options);
      return res;
    } catch (err) {
      if (attempt === maxRetries) throw err;
      console.warn(`[Network Retry ${attempt}/${maxRetries}] Retrying ${url}... (${err.message})`);
      await new Promise((resolve) => setTimeout(resolve, delay * attempt));
    }
  }
}

const CANDLE_IMAGES = [
  {
    slug: 'vanilla-treat',
    name: 'Vanilla Treat',
    sourceFile: 'C:/Users/September Images/.gemini/antigravity/brain/f13bb896-0f6c-4062-8460-891717dbce8d/.user_uploaded/media_1789376117164.jpg',
  },
  {
    slug: 'cool-breeze',
    name: 'Cool Breeze',
    sourceFile: 'C:/Users/September Images/.gemini/antigravity/brain/f13bb896-0f6c-4062-8460-891717dbce8d/.user_uploaded/media_1789293570355.jpg',
  },
  {
    slug: 'le-luxe',
    name: 'Le Luxe',
    sourceFile: 'C:/Users/September Images/.gemini/antigravity/brain/f13bb896-0f6c-4062-8460-891717dbce8d/.user_uploaded/media_1789293575628.jpg',
  },
  {
    slug: 'sandal-rose',
    name: 'Sandal Rose',
    sourceFile: 'C:/Users/September Images/.gemini/antigravity/brain/f13bb896-0f6c-4062-8460-891717dbce8d/.user_uploaded/media_1789293563535.jpg',
  },
  {
    slug: 'champagne',
    name: 'Champagne',
    sourceFile: 'C:/Users/September Images/.gemini/antigravity/brain/f13bb896-0f6c-4062-8460-891717dbce8d/.user_uploaded/media_1789293605294.jpg',
  },
  {
    slug: 'coconut-lime',
    name: 'Coconut Lime',
    sourceFile: 'C:/Users/September Images/.gemini/antigravity/brain/f13bb896-0f6c-4062-8460-891717dbce8d/.user_uploaded/media_1789293550877.jpg',
  },
  {
    slug: 'coco-vibes',
    name: 'Coco Vibes',
    sourceFile: 'C:/Users/September Images/.gemini/antigravity/brain/f13bb896-0f6c-4062-8460-891717dbce8d/.user_uploaded/media_1789293580985.jpg',
  },
];

const CANDLE_PRODUCTS = [
  {
    name: 'Vanilla Treat',
    slug: 'vanilla-treat',
    sku: 'PS-CND-VT01',
    price: 40000,
    fragrance_family: 'Gourmand • Warm Vanilla',
    scent_profile: 'Madagascar Vanilla • Creamy Tonka • Warm Amber',
    best_for: 'Living Rooms, Bedrooms & Intimate Evenings',
    tagline: 'Natural Soy Candle • Hand Poured in Lagos',
    short_description: 'Hand-poured in Lagos using natural soy wax. 300g net weight with up to 48 hours of clean, fragrant burn time.',
    description: 'Natural Soy Candle hand-poured in Lagos. Formulated with premium botanical essences and clean-burning lead-free cotton wicks. Vanilla Treat fills your space with an inviting, decadent warmth that lingers gracefully.',
    details: 'Size: 300g\nBurn Time: Up to 48 Hours\nWax: 100% Natural Soy Wax\nWick: Premium Lead-Free Cotton\nOrigin: Hand Poured in Lagos, Nigeria',
    ingredients: 'Natural Soy Wax, Fine Fragrance Oils, Cotton Wick.',
    how_to_use: 'Trim wick to 1/4 inch before each burn. Allow wax to melt to the edges of the jar on first burn (2–3 hours) to prevent tunneling. Never leave a burning candle unattended.',
    meta_title: 'Vanilla Treat Natural Soy Candle (300g) | PHILZ SIGNATURE',
    meta_description: 'Discover Vanilla Treat: Hand-poured 300g natural soy candle crafted in Lagos. Up to 48 hours burn time with warm vanilla and comforting sweetness.',
  },
  {
    name: 'Cool Breeze',
    slug: 'cool-breeze',
    sku: 'PS-CND-CB02',
    price: 40000,
    fragrance_family: 'Fresh • Aquatic • Aromatic',
    scent_profile: 'Crisp Marine Air • Coastal Botanicals • White Woods',
    best_for: 'Daytime Refreshment, Offices & Open Living Areas',
    tagline: 'Natural Soy Candle • Hand Poured in Lagos',
    short_description: 'Hand-poured in Lagos using natural soy wax. 300g net weight with up to 48 hours of clean, fragrant burn time.',
    description: 'Natural Soy Candle hand-poured in Lagos. Formulated with premium botanical essences and clean-burning lead-free cotton wicks. Cool Breeze delivers an invigorating, crisp olfactory experience reminiscent of fresh coastal air.',
    details: 'Size: 300g\nBurn Time: Up to 48 Hours\nWax: 100% Natural Soy Wax\nWick: Premium Lead-Free Cotton\nOrigin: Hand Poured in Lagos, Nigeria',
    ingredients: 'Natural Soy Wax, Fine Fragrance Oils, Cotton Wick.',
    how_to_use: 'Trim wick to 1/4 inch before each burn. Allow wax to melt to the edges of the jar on first burn (2–3 hours) to prevent tunneling. Never leave a burning candle unattended.',
    meta_title: 'Cool Breeze Natural Soy Candle (300g) | PHILZ SIGNATURE',
    meta_description: 'Discover Cool Breeze: Hand-poured 300g natural soy candle crafted in Lagos. Up to 48 hours burn time with revitalizing crisp fresh notes.',
  },
  {
    name: 'Le Luxe',
    slug: 'le-luxe',
    sku: 'PS-CND-LL03',
    price: 40000,
    fragrance_family: 'Oriental • Amber • Woody',
    scent_profile: 'Precious Woods • Rich Amber • Subtle Spice',
    best_for: 'Luxury Suites, Evening Hosting & Sophisticated Lounges',
    tagline: 'Natural Soy Candle • Hand Poured in Lagos',
    short_description: 'Hand-poured in Lagos using natural soy wax. 300g net weight with up to 48 hours of clean, fragrant burn time.',
    description: 'Natural Soy Candle hand-poured in Lagos. Formulated with premium botanical essences and clean-burning lead-free cotton wicks. Le Luxe is an opulent, atmospheric creation designed for discerning interiors and elevated evening ambiances.',
    details: 'Size: 300g\nBurn Time: Up to 48 Hours\nWax: 100% Natural Soy Wax\nWick: Premium Lead-Free Cotton\nOrigin: Hand Poured in Lagos, Nigeria',
    ingredients: 'Natural Soy Wax, Fine Fragrance Oils, Cotton Wick.',
    how_to_use: 'Trim wick to 1/4 inch before each burn. Allow wax to melt to the edges of the jar on first burn (2–3 hours) to prevent tunneling. Never leave a burning candle unattended.',
    meta_title: 'Le Luxe Natural Soy Candle (300g) | PHILZ SIGNATURE',
    meta_description: 'Discover Le Luxe: Hand-poured 300g natural soy candle crafted in Lagos. Up to 48 hours burn time with opulent amber and precious woods.',
  },
  {
    name: 'Sandal Rose',
    slug: 'sandal-rose',
    sku: 'PS-CND-SR04',
    price: 40000,
    fragrance_family: 'Floral • Woody',
    scent_profile: 'Velvet Damask Rose • Creamy Sandalwood • Soft Petals',
    best_for: 'Sanctuaries, Bath Rituals & Romantic Evenings',
    tagline: 'Natural Soy Candle • Hand Poured in Lagos',
    short_description: 'Hand-poured in Lagos using natural soy wax. 300g net weight with up to 48 hours of clean, fragrant burn time.',
    description: 'Natural Soy Candle hand-poured in Lagos. Formulated with premium botanical essences and clean-burning lead-free cotton wicks. Sandal Rose blends velvety rose blossoms with smooth, grounding sandalwood for serene harmony.',
    details: 'Size: 300g\nBurn Time: Up to 48 Hours\nWax: 100% Natural Soy Wax\nWick: Premium Lead-Free Cotton\nOrigin: Hand Poured in Lagos, Nigeria',
    ingredients: 'Natural Soy Wax, Fine Fragrance Oils, Cotton Wick.',
    how_to_use: 'Trim wick to 1/4 inch before each burn. Allow wax to melt to the edges of the jar on first burn (2–3 hours) to prevent tunneling. Never leave a burning candle unattended.',
    meta_title: 'Sandal Rose Natural Soy Candle (300g) | PHILZ SIGNATURE',
    meta_description: 'Discover Sandal Rose: Hand-poured 300g natural soy candle crafted in Lagos. Up to 48 hours burn time featuring Damask rose and Mysore sandalwood.',
  },
  {
    name: 'Champagne',
    slug: 'champagne',
    sku: 'PS-CND-CH05',
    price: 40000,
    fragrance_family: 'Fruity • Sparkling Floral',
    scent_profile: 'Effervescent Citrus • Wild Berries • Gilded Sugar',
    best_for: 'Festive Gatherings, Dinners & Joyous Celebrations',
    tagline: 'Natural Soy Candle • Hand Poured in Lagos',
    short_description: 'Hand-poured in Lagos using natural soy wax. 300g net weight with up to 48 hours of clean, fragrant burn time.',
    description: 'Natural Soy Candle hand-poured in Lagos. Formulated with premium botanical essences and clean-burning lead-free cotton wicks. Champagne brings an effervescent, celebratory glow with sparkling fruity brightness and refined sweetness.',
    details: 'Size: 300g\nBurn Time: Up to 48 Hours\nWax: 100% Natural Soy Wax\nWick: Premium Lead-Free Cotton\nOrigin: Hand Poured in Lagos, Nigeria',
    ingredients: 'Natural Soy Wax, Fine Fragrance Oils, Cotton Wick.',
    how_to_use: 'Trim wick to 1/4 inch before each burn. Allow wax to melt to the edges of the jar on first burn (2–3 hours) to prevent tunneling. Never leave a burning candle unattended.',
    meta_title: 'Champagne Natural Soy Candle (300g) | PHILZ SIGNATURE',
    meta_description: 'Discover Champagne: Hand-poured 300g natural soy candle crafted in Lagos. Up to 48 hours burn time with sparkling, celebratory effervescence.',
  },
  {
    name: 'Coconut Lime',
    slug: 'coconut-lime',
    sku: 'PS-CND-CL06',
    price: 40000,
    fragrance_family: 'Fresh • Citrus • Tropical',
    scent_profile: 'Zesty Kaffir Lime • Creamy Coconut Milk • Tropical Verbena',
    best_for: 'Kitchens, Bathrooms, Sunlit Morning Patios',
    tagline: 'Natural Soy Candle • Hand Poured in Lagos',
    short_description: 'Hand-poured in Lagos using natural soy wax. 300g net weight with up to 48 hours of clean, fragrant burn time.',
    description: 'Natural Soy Candle hand-poured in Lagos. Formulated with premium botanical essences and clean-burning lead-free cotton wicks. Coconut Lime delivers a bright, refreshing fusion of zesty tropical citrus and velvety coconut cream.',
    details: 'Size: 300g\nBurn Time: Up to 48 Hours\nWax: 100% Natural Soy Wax\nWick: Premium Lead-Free Cotton\nOrigin: Hand Poured in Lagos, Nigeria',
    ingredients: 'Natural Soy Wax, Fine Fragrance Oils, Cotton Wick.',
    how_to_use: 'Trim wick to 1/4 inch before each burn. Allow wax to melt to the edges of the jar on first burn (2–3 hours) to prevent tunneling. Never leave a burning candle unattended.',
    meta_title: 'Coconut Lime Natural Soy Candle (300g) | PHILZ SIGNATURE',
    meta_description: 'Discover Coconut Lime: Hand-poured 300g natural soy candle crafted in Lagos. Up to 48 hours burn time blending radiant citrus and luscious coconut.',
  },
  {
    name: 'Coco Vibes',
    slug: 'coco-vibes',
    sku: 'PS-CND-CV07',
    price: 40000,
    fragrance_family: 'Gourmand • Tropical',
    scent_profile: 'Roasted Coconut • Golden Caramel • Warm Island Woods',
    best_for: 'Relaxing Weekends, Lounges & Serene Personal Retreats',
    tagline: 'Natural Soy Candle • Hand Poured in Lagos',
    short_description: 'Hand-poured in Lagos using natural soy wax. 300g net weight with up to 48 hours of clean, fragrant burn time.',
    description: 'Natural Soy Candle hand-poured in Lagos. Formulated with premium botanical essences and clean-burning lead-free cotton wicks. Coco Vibes envelopes your space with warm toasted coconut, velvety cream, and relaxing island ambiance.',
    details: 'Size: 300g\nBurn Time: Up to 48 Hours\nWax: 100% Natural Soy Wax\nWick: Premium Lead-Free Cotton\nOrigin: Hand Poured in Lagos, Nigeria',
    ingredients: 'Natural Soy Wax, Fine Fragrance Oils, Cotton Wick.',
    how_to_use: 'Trim wick to 1/4 inch before each burn. Allow wax to melt to the edges of the jar on first burn (2–3 hours) to prevent tunneling. Never leave a burning candle unattended.',
    meta_title: 'Coco Vibes Natural Soy Candle (300g) | PHILZ SIGNATURE',
    meta_description: 'Discover Coco Vibes: Hand-poured 300g natural soy candle crafted in Lagos. Up to 48 hours burn time with decadent coconut and soothing warmth.',
  },
];

async function run() {
  console.log('--- 1. Ensuring local copies in public/candles ---');
  const publicCandlesDir = path.join(__dirname, '..', 'public', 'candles');
  if (!fs.existsSync(publicCandlesDir)) {
    fs.mkdirSync(publicCandlesDir, { recursive: true });
  }

  for (const item of CANDLE_IMAGES) {
    const dest = path.join(publicCandlesDir, `${item.slug}.jpg`);
    if (fs.existsSync(item.sourceFile)) {
      fs.copyFileSync(item.sourceFile, dest);
      console.log(`✓ Copied ${item.name} image to ${dest}`);
    } else {
      console.error(`✗ Source file not found for ${item.name}: ${item.sourceFile}`);
    }
  }

  console.log('\n--- 2. Uploading images to Supabase Storage bucket: products ---');
  const uploadedUrls = {};
  for (const item of CANDLE_IMAGES) {
    const localFile = path.join(publicCandlesDir, `${item.slug}.jpg`);
    const fileBuffer = fs.readFileSync(localFile);
    const storagePath = `candles/${item.slug}.jpg`;

    // Upload to Supabase Storage
    const uploadRes = await fetchWithRetry(`${SUPABASE_URL}/storage/v1/object/products/${storagePath}`, {
      method: 'POST',
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'image/jpeg',
        'x-upsert': 'true',
      },
      body: fileBuffer,
    });

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      console.error(`✗ Failed to upload ${storagePath}: ${uploadRes.status} ${errText}`);
    } else {
      console.log(`✓ Uploaded ${storagePath} to Supabase Storage`);
    }

    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/products/${storagePath}`;
    uploadedUrls[item.slug] = publicUrl;
  }

  console.log('\n--- 3. Ensuring Candles category exists in Supabase ---');
  // Check if Candles category exists (by slug 'candles' or 'scented-candles')
  const catRes = await fetchWithRetry(`${SUPABASE_URL}/rest/v1/categories?slug=eq.candles`, { headers });
  const existingCats = await catRes.json();

  let candleCategoryId;
  if (existingCats && existingCats.length > 0) {
    candleCategoryId = existingCats[0].id;
    console.log(`✓ Category 'Candles' already exists with ID: ${candleCategoryId}`);
    // Update it to make sure it is active and has correct name
    await fetchWithRetry(`${SUPABASE_URL}/rest/v1/categories?id=eq.${candleCategoryId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        name: 'Candles',
        slug: 'candles',
        description: 'Handcrafted natural soy scented candles hand-poured in Lagos, offering clean burns and lingering room diffusion.',
        display_order: 2,
        is_active: true,
      }),
    });
  } else {
    // Check if 'scented-candles' exists to rename/reuse or insert new
    const oldCatRes = await fetchWithRetry(`${SUPABASE_URL}/rest/v1/categories?slug=eq.scented-candles`, { headers });
    const oldCats = await oldCatRes.json();
    if (oldCats && oldCats.length > 0) {
      candleCategoryId = oldCats[0].id;
      console.log(`✓ Updating category 'scented-candles' to 'Candles' (slug: 'candles', ID: ${candleCategoryId})`);
      await fetchWithRetry(`${SUPABASE_URL}/rest/v1/categories?id=eq.${candleCategoryId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          name: 'Candles',
          slug: 'candles',
          description: 'Handcrafted natural soy scented candles hand-poured in Lagos, offering clean burns and lingering room diffusion.',
          display_order: 2,
          is_active: true,
        }),
      });
    } else {
      const insertCatRes = await fetchWithRetry(`${SUPABASE_URL}/rest/v1/categories`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: 'Candles',
          slug: 'candles',
          description: 'Handcrafted natural soy scented candles hand-poured in Lagos, offering clean burns and lingering room diffusion.',
          display_order: 2,
          is_active: true,
        }),
      });
      const createdCats = await insertCatRes.json();
      candleCategoryId = createdCats[0].id;
      console.log(`✓ Created category 'Candles' with ID: ${candleCategoryId}`);
    }
  }

  console.log('\n--- 4. Clean up any placeholder or demo candle products ---');
  // Check if demo 'luxury-scented-candle' exists and remove it
  const demoRes = await fetchWithRetry(`${SUPABASE_URL}/rest/v1/products?slug=eq.luxury-scented-candle`, { headers });
  const demoProducts = await demoRes.json();
  if (demoProducts && demoProducts.length > 0) {
    for (const d of demoProducts) {
      await fetchWithRetry(`${SUPABASE_URL}/rest/v1/products?id=eq.${d.id}`, {
        method: 'DELETE',
        headers,
      });
      console.log(`✓ Removed demo product: ${d.name} (${d.id})`);
    }
  }

  console.log('\n--- 5. Seeding all 7 candles into Supabase ---');
  let order = 100;
  for (const candle of CANDLE_PRODUCTS) {
    order += 1;
    // Check if candle product exists
    const prodRes = await fetchWithRetry(`${SUPABASE_URL}/rest/v1/products?slug=eq.${candle.slug}`, { headers });
    const existingProd = await prodRes.json();

    const productPayload = {
      name: candle.name,
      slug: candle.slug,
      sku: candle.sku,
      price: candle.price,
      sale_price: null,
      stock_quantity: 50,
      weight_grams: 300,
      volume_ml: 300,
      concentration: 'Scented Candle',
      brand: 'PHILZ SIGNATURE',
      category_id: candleCategoryId,
      fragrance_family: candle.fragrance_family,
      scent_profile: candle.scent_profile,
      best_for: candle.best_for,
      tagline: candle.tagline,
      short_description: candle.short_description,
      description: candle.description,
      details: candle.details,
      ingredients: candle.ingredients,
      how_to_use: candle.how_to_use,
      status: 'published',
      is_featured: true,
      is_bestseller: candle.slug === 'vanilla-treat' || candle.slug === 'le-luxe',
      is_new_arrival: true,
      is_trending: true,
      display_order: order,
      meta_title: candle.meta_title,
      meta_description: candle.meta_description,
      rating: 5,
      reviews_count: 0,
    };

    let productId;
    if (existingProd && existingProd.length > 0) {
      productId = existingProd[0].id;
      const updateRes = await fetchWithRetry(`${SUPABASE_URL}/rest/v1/products?id=eq.${productId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(productPayload),
      });
      console.log(`✓ Updated candle product: ${candle.name} (${productId})`);
    } else {
      const createRes = await fetchWithRetry(`${SUPABASE_URL}/rest/v1/products`, {
        method: 'POST',
        headers,
        body: JSON.stringify(productPayload),
      });
      const created = await createRes.json();
      if (createRes.ok && created.length > 0) {
        productId = created[0].id;
        console.log(`✓ Created candle product: ${candle.name} (${productId})`);
      } else {
        console.error(`✗ Error creating ${candle.name}:`, created);
        continue;
      }
    }

    // Upsert primary image in product_images
    const imageUrl = uploadedUrls[candle.slug] || `/candles/${candle.slug}.jpg`;
    // Remove existing images for this product to prevent duplicates
    await fetchWithRetry(`${SUPABASE_URL}/rest/v1/product_images?product_id=eq.${productId}`, {
      method: 'DELETE',
      headers,
    });

    const imgRes = await fetchWithRetry(`${SUPABASE_URL}/rest/v1/product_images`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        product_id: productId,
        image_url: imageUrl,
        alt_text: `${candle.name} - Philz Signature Natural Soy Candle (300g)`,
        display_order: 0,
        is_primary: true,
      }),
    });
    if (imgRes.ok) {
      console.log(`✓ Linked image for ${candle.name}: ${imageUrl}`);
    } else {
      console.error(`✗ Failed to insert image for ${candle.name}`);
    }

    // Upsert default variant (300g) in product_variants
    await fetchWithRetry(`${SUPABASE_URL}/rest/v1/product_variants?product_id=eq.${productId}`, {
      method: 'DELETE',
      headers,
    });

    const variantRes = await fetchWithRetry(`${SUPABASE_URL}/rest/v1/product_variants`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        product_id: productId,
        name: '300g Vessel',
        size_ml: 300,
        price: candle.price,
        sale_price: null,
        stock_quantity: 50,
        sku: `${candle.sku}-300G`,
        is_default: true,
        display_order: 0,
      }),
    });
    if (variantRes.ok) {
      console.log(`✓ Created 300g variant for ${candle.name}`);
    } else {
      console.error(`✗ Failed to create variant for ${candle.name}`);
    }
  }

  console.log('\n--- Seeding Completed Successfully! ---');
}

run().catch((err) => {
  console.error('Fatal seeding error:', err);
  process.exit(1);
});
