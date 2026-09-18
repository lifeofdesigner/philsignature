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

const ROOM_SPRAY_IMAGES = [
  {
    slug: 'gourmand',
    name: 'Gourmand',
    sourceFile: 'C:/Users/September Images/.gemini/antigravity/brain/f13bb896-0f6c-4062-8460-891717dbce8d/.user_uploaded/media_1789739338330.jpg',
  },
  {
    slug: 'citrus',
    name: 'Citrus',
    sourceFile: 'C:/Users/September Images/.gemini/antigravity/brain/f13bb896-0f6c-4062-8460-891717dbce8d/.user_uploaded/media_1789739338363.jpg',
  },
  {
    slug: 'fruity',
    name: 'Fruity',
    sourceFile: 'public/room-sprays/fruity.jpg',
  },
  {
    slug: 'floral',
    name: 'Floral',
    sourceFile: 'C:/Users/September Images/.gemini/antigravity/brain/f13bb896-0f6c-4062-8460-891717dbce8d/.user_uploaded/media_1789739338367.jpg',
  },
  {
    slug: 'woody',
    name: 'Woody',
    sourceFile: 'C:/Users/September Images/.gemini/antigravity/brain/f13bb896-0f6c-4062-8460-891717dbce8d/.user_uploaded/media_1789739338369.jpg',
  },
];

const ROOM_SPRAY_PRODUCTS = [
  {
    id: 'e1000001-0001-4001-8001-000000000001',
    name: 'Gourmand',
    slug: 'gourmand-room-spray',
    sku: 'PS-SPR-GM01',
    price: 35000,
    volume_ml: 150,
    weight_grams: 220,
    concentration: 'Room Spray',
    fragrance_family: 'Gourmand • Warm Vanilla',
    scent_profile: 'Madagascar Vanilla • Golden Caramel • Toasted Tonka',
    best_for: 'Bedrooms, Living Lounges & Cozy Evening Ambiances',
    tagline: 'Fine Fragrance Room Mist • Hand Poured in Lagos',
    short_description: 'Hand-poured in Lagos. 150ml fine-mist trigger spray room mist formulated for immediate room refreshment and enduring warmth.',
    description: 'Fine Fragrance Room Spray hand-poured in Lagos. Formulated with premium perfume oils and an ergonomic trigger spray mechanism for a continuous, ultra-fine atmospheric mist. Gourmand envelopes your space in rich vanilla, melted caramel, and soothing tonka bean warmth.',
    details: 'Volume: 150ml\nAtomizer: Ergonomic Trigger Spray with Lock\nBase: Premium Fine Fragrance Mist\nOrigin: Hand Poured in Lagos, Nigeria',
    ingredients: 'Alcohol Denat., Water (Aqua), Fragrance (Parfum), Dipropylene Glycol.',
    how_to_use: 'Turn the nozzle switch to ON. Spray 2 to 3 pumps into the center of the room or above linens at a distance of 30cm. Switch nozzle back to OFF when not in use.',
    meta_title: 'Gourmand Fine Fragrance Room Spray (150ml) | PHILZ SIGNATURE',
    meta_description: 'Discover Gourmand: Hand-poured 150ml luxury room spray mist crafted in Lagos. Warm vanilla, melted caramel, and decadent ambiance.',
    image_file: 'gourmand.jpg',
  },
  {
    id: 'e1000002-0002-4002-8002-000000000002',
    name: 'Citrus',
    slug: 'citrus-room-spray',
    sku: 'PS-SPR-CT02',
    price: 35000,
    volume_ml: 150,
    weight_grams: 220,
    concentration: 'Room Spray',
    fragrance_family: 'Citrus • Uplifting Fresh',
    scent_profile: 'Italian Bergamot • Sunlit Mandarin • Crisp Verbena',
    best_for: 'Kitchens, Morning Living Spaces & Energetic Workspaces',
    tagline: 'Fine Fragrance Room Mist • Hand Poured in Lagos',
    short_description: 'Hand-poured in Lagos. 150ml fine-mist trigger spray room mist formulated for immediate citrus vibrancy and crisp refreshment.',
    description: 'Fine Fragrance Room Spray hand-poured in Lagos. Formulated with zesty botanical extracts and sun-drenched citrus essences to immediately revive and purify indoor atmospheres with radiant brightness.',
    details: 'Volume: 150ml\nAtomizer: Ergonomic Trigger Spray with Lock\nBase: Premium Fine Fragrance Mist\nOrigin: Hand Poured in Lagos, Nigeria',
    ingredients: 'Alcohol Denat., Water (Aqua), Fragrance (Parfum), Dipropylene Glycol.',
    how_to_use: 'Turn the nozzle switch to ON. Spray 2 to 3 pumps into the center of the room. Switch nozzle to OFF when not in use.',
    meta_title: 'Citrus Fine Fragrance Room Spray (150ml) | PHILZ SIGNATURE',
    meta_description: 'Discover Citrus: Hand-poured 150ml luxury room spray crafted in Lagos. Sparkling bergamot, golden mandarin, and bright botanical refreshment.',
    image_file: 'citrus.jpg',
  },
  {
    id: 'e1000003-0003-4003-8003-000000000003',
    name: 'Fruity',
    slug: 'fruity-room-spray',
    sku: 'PS-RS-FRUITY-150',
    price: 35000,
    volume_ml: 150,
    weight_grams: 220,
    concentration: 'Room Spray',
    fragrance_family: 'Fruity • Sweet • Radiant',
    scent_profile: 'Sun-Ripened Berries • Crisp Orchard Apple • Sheer Peach • Radiant Musk',
    best_for: 'Living Rooms, Dining Suites, Kitchens & Vibrant Daytime Entertaining',
    tagline: 'Fine Fragrance Room Mist • Hand Poured in Lagos',
    short_description: 'Hand-poured in Lagos. 150ml fine-mist trigger spray room mist blending sun-ripened orchard berries, crisp apple, and golden peach.',
    description: 'Fine Fragrance Room Spray hand-poured in Lagos. Philz Signature Fruity Room Spray (150ml) envelops living spaces in an intoxicating cascade of sun-ripened berries, crisp orchard fruits, and velvety summer peach. Poured in Lagos and fitted with a high-performance trigger atomizer, it delivers a fine, lingering mist that instantly refreshes ambient air and linens with refined sweetness.',
    details: 'Volume: 150ml\nAtomizer: Ergonomic Trigger Spray with Lock\nBase: Premium Fine Fragrance Mist\nOrigin: Hand Poured in Lagos, Nigeria',
    ingredients: 'Alcohol Denat., Water (Aqua), Fragrance (Parfum), Dipropylene Glycol.',
    how_to_use: 'Turn the nozzle switch to ON. Spray 2 to 3 pumps into the center of the room. Switch nozzle to OFF when not in use.',
    meta_title: 'Fruity Fine Fragrance Room Spray (150ml) | PHILZ SIGNATURE',
    meta_description: 'Discover Fruity: Hand-poured 150ml luxury room spray crafted in Lagos. Sun-ripened berries, crisp orchard apple, and sheer velvety peach.',
    image_file: 'fruity.jpg',
  },
  {
    id: 'e1000004-0004-4004-8004-000000000004',
    name: 'Floral',
    slug: 'floral-room-spray',
    sku: 'PS-SPR-FL04',
    price: 35000,
    volume_ml: 150,
    weight_grams: 220,
    concentration: 'Room Spray',
    fragrance_family: 'Floral • Romantic Rose',
    scent_profile: 'Velvet Damask Rose • Jasmine Sambac • Soft Petals',
    best_for: 'Bedrooms, Powder Rooms & Relaxing Sanctuaries',
    tagline: 'Fine Fragrance Room Mist • Hand Poured in Lagos',
    short_description: 'Hand-poured in Lagos. 150ml fine-mist trigger spray room mist infused with romantic rose petals and lush jasmine blossoms.',
    description: 'Fine Fragrance Room Spray hand-poured in Lagos. Envelops interiors with the delicate luxury of freshly cut Damask roses and blooming jasmine, creating a serene and romantic environment.',
    details: 'Volume: 150ml\nAtomizer: Ergonomic Trigger Spray with Lock\nBase: Premium Fine Fragrance Mist\nOrigin: Hand Poured in Lagos, Nigeria',
    ingredients: 'Alcohol Denat., Water (Aqua), Fragrance (Parfum), Dipropylene Glycol.',
    how_to_use: 'Turn the nozzle switch to ON. Spray 2 to 3 pumps into the center of the room or onto curtains from 30cm away.',
    meta_title: 'Floral Fine Fragrance Room Spray (150ml) | PHILZ SIGNATURE',
    meta_description: 'Discover Floral: Hand-poured 150ml luxury room spray crafted in Lagos. Velvety damask rose, blooming jasmine, and elegant petal diffusion.',
    image_file: 'floral.jpg',
  },
  {
    id: 'e1000005-0005-4005-8005-000000000005',
    name: 'Woody',
    slug: 'woody-room-spray',
    sku: 'PS-SPR-WD05',
    price: 35000,
    volume_ml: 150,
    weight_grams: 220,
    concentration: 'Room Spray',
    fragrance_family: 'Woody • Smoky Oud',
    scent_profile: 'Aged Agarwood • Smoked Cedarwood • Warm Resins',
    best_for: 'Executive Studies, Library Lounges & Evening Entertaining',
    tagline: 'Fine Fragrance Room Mist • Hand Poured in Lagos',
    short_description: 'Hand-poured in Lagos. 150ml fine-mist trigger spray room mist rich with deep oud, cedarwood, and smoky amber accords.',
    description: 'Fine Fragrance Room Spray hand-poured in Lagos. A deeply sophisticated room mist infused with precious woods and warm oriental resins, designed for distinguished interiors and commanding presence.',
    details: 'Volume: 150ml\nAtomizer: Ergonomic Trigger Spray with Lock\nBase: Premium Fine Fragrance Mist\nOrigin: Hand Poured in Lagos, Nigeria',
    ingredients: 'Alcohol Denat., Water (Aqua), Fragrance (Parfum), Dipropylene Glycol.',
    how_to_use: 'Turn the nozzle switch to ON. Spray 2 to 3 pumps into the room atmosphere. Switch nozzle to OFF when not in use.',
    meta_title: 'Woody Fine Fragrance Room Spray (150ml) | PHILZ SIGNATURE',
    meta_description: 'Discover Woody: Hand-poured 150ml luxury room spray crafted in Lagos. Precious agarwood, smoked cedar, and warm resinous depth.',
    image_file: 'woody.jpg',
  },
];

async function run() {
  console.log('--- 1. Ensuring local copies in public/room-sprays ---');
  const publicDir = path.join(__dirname, '..', 'public', 'room-sprays');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  for (const item of ROOM_SPRAY_IMAGES) {
    const dest = path.join(publicDir, `${item.slug}.jpg`);
    if (fs.existsSync(item.sourceFile)) {
      fs.copyFileSync(item.sourceFile, dest);
      console.log(`✓ Copied ${item.name} image to ${dest}`);
    } else {
      console.error(`✗ Source file not found for ${item.name}: ${item.sourceFile}`);
    }
  }

  console.log('\n--- 2. Uploading images to Supabase Storage bucket: products ---');
  const uploadedUrls = {};
  for (const item of ROOM_SPRAY_IMAGES) {
    const localFile = path.join(publicDir, `${item.slug}.jpg`);
    const fileBuffer = fs.readFileSync(localFile);
    const storagePath = `room-sprays/${item.slug}.jpg`;

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

    if (uploadRes && (uploadRes.status === 200 || uploadRes.status === 201)) {
      console.log(`✓ Uploaded ${storagePath} to Supabase Storage`);
    } else {
      console.warn(`Storage upload note for ${storagePath}: status ${uploadRes?.status}`);
    }

    uploadedUrls[item.slug] = `${SUPABASE_URL}/storage/v1/object/public/products/${storagePath}`;
  }

  console.log('\n--- 3. Ensuring Category and Collection exist ---');
  const categoryPayload = {
    id: 'c4444444-4444-4444-4444-444444444444',
    name: 'Philz Signature Room Sprays',
    slug: 'room-sprays',
    description: 'Artisanal 150ml fine-mist room sprays hand-poured in Lagos, offering instant olfactory ambiance transformations.',
    display_order: 3,
    is_active: true,
  };

  const catRes = await fetchWithRetry(`${SUPABASE_URL}/rest/v1/categories`, {
    method: 'POST',
    headers: {
      ...headers,
      Prefer: 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify(categoryPayload),
  });
  console.log(`Category Upsert Status: ${catRes?.status}`);

  const collectionPayload = {
    id: '8f22e0b6-9485-4c6d-988c-5031d59f5e31',
    name: 'Room Spray Collection',
    slug: 'room-sprays',
    tagline: 'Instant Atmospheric Mists Hand-Poured in Lagos',
    description: 'Artisanal 150ml fine-mist room sprays formulated with premium fragrance essences and ergonomic trigger spray atomizers. Instant atmosphere transformations designed to elevate living spaces and fine fabrics.',
    image_url: uploadedUrls['gourmand'] || `${SUPABASE_URL}/storage/v1/object/public/products/room-sprays/gourmand.jpg`,
    banner_url: uploadedUrls['gourmand'] || `${SUPABASE_URL}/storage/v1/object/public/products/room-sprays/gourmand.jpg`,
    is_featured: true,
    display_order: 7,
    is_active: true,
  };

  const colRes = await fetchWithRetry(`${SUPABASE_URL}/rest/v1/collections`, {
    method: 'POST',
    headers: {
      ...headers,
      Prefer: 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify(collectionPayload),
  });
  console.log(`Collection Upsert Status: ${colRes?.status}`);

  console.log('\n--- 4. Seeding Products into Supabase ---');
  for (const p of ROOM_SPRAY_PRODUCTS) {
    const productPayload = {
      id: p.id,
      name: p.name,
      slug: p.slug,
      sku: p.sku,
      price: p.price,
      sale_price: null,
      stock_quantity: 50,
      weight_grams: p.weight_grams,
      volume_ml: p.volume_ml,
      concentration: p.concentration,
      brand: 'PHILZ SIGNATURE',
      category_id: 'c4444444-4444-4444-4444-444444444444',
      collection_id: '8f22e0b6-9485-4c6d-988c-5031d59f5e31',
      fragrance_family: p.fragrance_family,
      scent_profile: p.scent_profile,
      best_for: p.best_for,
      tagline: p.tagline,
      short_description: p.short_description,
      description: p.description,
      details: p.details,
      ingredients: p.ingredients,
      how_to_use: p.how_to_use,
      status: 'published',
      is_featured: true,
      is_bestseller: p.name === 'Gourmand' || p.name === 'Woody',
      is_new_arrival: true,
      is_trending: true,
      display_order: 200 + parseInt(p.sku.slice(-2)),
      meta_title: p.meta_title,
      meta_description: p.meta_description,
      rating: 5,
      reviews_count: 0,
    };

    const prodRes = await fetchWithRetry(`${SUPABASE_URL}/rest/v1/products`, {
      method: 'POST',
      headers: {
        ...headers,
        Prefer: 'resolution=merge-duplicates,return=representation',
      },
      body: JSON.stringify(productPayload),
    });
    console.log(`Product "${p.name}" (${p.slug}) Upsert Status: ${prodRes?.status}`);

    // Seed product_images
    await fetchWithRetry(`${SUPABASE_URL}/rest/v1/product_images?product_id=eq.${p.id}`, {
      method: 'DELETE',
      headers,
    });

    const imageUrl = uploadedUrls[p.slug.replace('-room-spray', '')];
    const imagePayload = {
      product_id: p.id,
      image_url: imageUrl,
      alt_text: `${p.name} - Philz Signature Fine Fragrance Room Spray (150ml)`,
      display_order: 0,
      is_primary: true,
    };

    const imgRes = await fetchWithRetry(`${SUPABASE_URL}/rest/v1/product_images`, {
      method: 'POST',
      headers,
      body: JSON.stringify(imagePayload),
    });
    console.log(`  ✓ Image record linked: ${imgRes?.status}`);

    // Seed product_variants
    await fetchWithRetry(`${SUPABASE_URL}/rest/v1/product_variants?product_id=eq.${p.id}`, {
      method: 'DELETE',
      headers,
    });

    const variantPayload = {
      product_id: p.id,
      name: '150ml Atomizer',
      size_ml: 150,
      price: p.price,
      sale_price: null,
      stock_quantity: 50,
      sku: `${p.sku}-150ML`,
      is_default: true,
      display_order: 0,
    };

    const varRes = await fetchWithRetry(`${SUPABASE_URL}/rest/v1/product_variants`, {
      method: 'POST',
      headers,
      body: JSON.stringify(variantPayload),
    });
    console.log(`  ✓ Variant record linked: ${varRes?.status}`);
  }

  console.log('\n🎉 Official Room Sprays seeded successfully!');
}

run().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});

