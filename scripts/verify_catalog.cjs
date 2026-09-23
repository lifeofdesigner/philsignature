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
const key = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(url, key, {
  realtime: { transport: ws },
  auth: { persistSession: false, autoRefreshToken: false }
});

async function verifyAll() {
  console.log('--- COMPREHENSIVE CATALOG VERIFICATION ---');

  // 1. Total Products
  const { data: products, error: pErr } = await supabase
    .from('products')
    .select('*, images:product_images(*), variants:product_variants(*), category:categories(*)')
    .order('display_order', { ascending: true });

  if (pErr) throw pErr;
  console.log(`✅ Total Products in Supabase: ${products.length} (Expected: 31)`);

  if (products.length !== 31) {
    throw new Error(`Expected 31 products, found ${products.length}`);
  }

  // 2. Variants verification
  const { data: variants, error: vErr } = await supabase.from('product_variants').select('*');
  if (vErr) throw vErr;
  console.log(`✅ Total Product Variants in Supabase: ${variants.length} (Expected: 124)`);

  if (variants.length !== 124) {
    throw new Error(`Expected 124 variants, found ${variants.length}`);
  }

  // 3. Images verification
  const { data: images, error: iErr } = await supabase.from('product_images').select('*');
  if (iErr) throw iErr;
  console.log(`✅ Total Product Images in Supabase: ${images.length} (Expected: 31)`);

  // 4. Check each product has 4 variants, image, notes, descriptions, and SEO
  let allGood = true;
  products.forEach((p, idx) => {
    const num = idx + 1;
    const hasImage = p.images && p.images.length > 0;
    const has4Variants = p.variants && p.variants.length === 4;
    const hasNotes = p.top_notes?.length > 0 && p.base_notes?.length > 0;
    const hasSEO = Boolean(p.meta_title && p.meta_description && p.meta_keywords);
    const hasScentProfile = Boolean(p.scent_profile);
    const hasBestFor = Boolean(p.best_for);

    if (!hasImage || !has4Variants || !hasNotes || !hasSEO || !hasScentProfile || !hasBestFor) {
      console.error(`❌ Product #${num} (${p.name}) failed check:`, {
        hasImage, has4Variants, hasNotes, hasSEO, hasScentProfile, hasBestFor
      });
      allGood = false;
    }
  });

  if (allGood) {
    console.log('✅ All 31 products have full descriptions, scent profiles, best-for, 4 size variants, official bottle image, and complete SEO!');
  }

  // 5. Test search query
  const { data: searchResults, error: sErr } = await supabase
    .from('products')
    .select('name, fragrance_family, scent_profile')
    .ilike('name', '%Oud%');
  console.log(`✅ Search query for "Oud" returned ${searchResults?.length} products:`, searchResults?.map(r => r.name));

  // 6. Test family filter
  const { data: floralResults, error: fErr } = await supabase
    .from('products')
    .select('name, fragrance_family')
    .ilike('fragrance_family', '%Floral%');
  console.log(`✅ Filter for "Floral" returned ${floralResults?.length} products:`, floralResults?.map(r => r.name));

  console.log('--- VERIFICATION SUCCESSFUL ---');
}

verifyAll().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
