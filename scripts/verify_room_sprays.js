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
};

async function runVerification() {
  console.log('--- Starting Philz Signature Room Spray Verification ---');
  let failures = 0;

  // 1. Verify Category
  const catRes = await fetch(`${SUPABASE_URL}/rest/v1/categories?id=eq.c4444444-4444-4444-4444-444444444444`, { headers });
  const catData = await catRes.json();
  if (catData && catData.length > 0) {
    console.log('✅ Category verified:', catData[0].name, `(slug: ${catData[0].slug})`);
  } else {
    console.error('❌ Category missing!');
    failures++;
  }

  // 2. Verify Collection
  const colRes = await fetch(`${SUPABASE_URL}/rest/v1/collections?id=eq.8f22e0b6-9485-4c6d-988c-5031d59f5e31`, { headers });
  const colData = await colRes.json();
  if (colData && colData.length > 0) {
    console.log('✅ Collection verified:', colData[0].name, `(slug: ${colData[0].slug})`);
  } else {
    console.error('❌ Collection missing!');
    failures++;
  }

  // 3. Verify Products
  const prodRes = await fetch(
    `${SUPABASE_URL}/rest/v1/products?select=*,category:categories(name,slug),collection:collections(name,slug),images:product_images(*),variants:product_variants(*)&category_id=eq.c4444444-4444-4444-4444-444444444444`,
    { headers }
  );
  const products = await prodRes.json();
  console.log(`\nFound ${products.length} room spray products in database:`);
  
  const expectedNames = ['Gourmand', 'Citrus', 'Fresh', 'Floral', 'Woody'];
  for (const name of expectedNames) {
    const p = products.find(prod => prod.name.toLowerCase() === name.toLowerCase());
    if (p) {
      const hasImage = p.images && p.images.length > 0;
      const hasVariant = p.variants && p.variants.length > 0;
      console.log(`✅ Product '${p.name}': price=₦${p.price.toLocaleString()}, volume=${p.volume_ml}ml, conc='${p.concentration}', images=${p.images?.length || 0}, variants=${p.variants?.length || 0}`);
      
      if (!hasImage) {
        console.error(`❌ Product '${p.name}' missing image!`);
        failures++;
      }
      if (!hasVariant) {
        console.error(`❌ Product '${p.name}' missing variant!`);
        failures++;
      }
    } else {
      console.error(`❌ Expected product '${name}' NOT found in database!`);
      failures++;
    }
  }

  // 4. Verify Local Files
  console.log('\nVerifying local public image files:');
  const slugs = ['gourmand', 'citrus', 'fresh', 'floral', 'woody'];
  for (const slug of slugs) {
    const localPath = path.resolve(__dirname, `../public/room-sprays/${slug}.jpg`);
    if (fs.existsSync(localPath)) {
      const stats = fs.statSync(localPath);
      console.log(`✅ Local file exists: public/room-sprays/${slug}.jpg (${(stats.size / 1024).toFixed(1)} KB)`);
    } else {
      console.error(`❌ Local file missing: public/room-sprays/${slug}.jpg`);
      failures++;
    }
  }

  // 5. Verify Supabase Storage URLs
  console.log('\nVerifying public storage URLs:');
  for (const slug of slugs) {
    const storageUrl = `${SUPABASE_URL}/storage/v1/object/public/products/room-sprays/${slug}.jpg`;
    try {
      const res = await fetch(storageUrl, { method: 'HEAD' });
      if (res.ok) {
        console.log(`✅ Storage URL accessible (HTTP ${res.status}): ${slug}.jpg`);
      } else {
        console.error(`❌ Storage URL failed (HTTP ${res.status}): ${storageUrl}`);
        failures++;
      }
    } catch (err) {
      console.error(`❌ Error checking storage URL: ${err.message}`);
      failures++;
    }
  }

  // 6. Verify Candles & Perfumes Counts
  const candleRes = await fetch(`${SUPABASE_URL}/rest/v1/products?select=id,name&category_id=eq.c3333333-3333-3333-3333-333333333333`, { headers });
  const candles = await candleRes.json();
  console.log(`\nVerified ${candles.length} candles in database.`);
  if (candles.length < 7) {
    console.error(`❌ Expected at least 7 candles, found ${candles.length}!`);
    failures++;
  } else {
    console.log('✅ Candle collection intact.');
  }

  const allRes = await fetch(`${SUPABASE_URL}/rest/v1/products?select=id,name`, { headers });
  const allProds = await allRes.json();
  console.log(`Verified ${allProds.length} total products in database.`);

  console.log('\n------------------------------------------------');
  if (failures === 0) {
    console.log('🎉 ALL VERIFICATION CHECKS PASSED SUCCESSFULLY!');
  } else {
    console.error(`🚨 VERIFICATION FAILED WITH ${failures} ERRORS!`);
    process.exit(1);
  }
}

runVerification().catch(err => {
  console.error('Fatal error during verification:', err);
  process.exit(1);
});
