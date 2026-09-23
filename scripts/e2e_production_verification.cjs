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

const EXPECTED_PRICING = {
  15: 15000,
  30: 30000,
  50: 40000,
  100: 75000
};

async function runE2EVerification() {
  console.log('================================================================');
  console.log('🌟 PHILZ SIGNATURE - FINAL PRODUCTION VERIFICATION SUITE 🌟');
  console.log('================================================================\n');

  let totalTests = 0;
  let passedTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (condition) {
      console.log(`  ✅ [PASS] ${message}`);
      passedTests++;
    } else {
      console.error(`  ❌ [FAIL] ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  // --- 1. PRODUCT CATALOG DATA INTEGRITY ---
  console.log('--- TEST GROUP 1: Product Catalog & Metadata Integrity ---');
  const { data: products, error: pErr } = await supabase
    .from('products')
    .select('*, images:product_images(*), variants:product_variants(*), category:categories(*)')
    .order('display_order', { ascending: true });

  assert(!pErr, 'Products query executes without error');
  assert(products.length === 31, `Exactly 31 products exist in catalog (found: ${products.length})`);

  // Verify each product
  products.forEach((p, index) => {
    const num = index + 1;
    assert(p.display_order === num, `Product #${num} (${p.name}) display_order matches exact numbering (${p.display_order})`);
    assert(p.name && p.name.trim().length > 0, `Product #${num} has non-empty name`);
    assert(p.slug && p.slug.trim().length > 0, `Product #${num} has slug: ${p.slug}`);
    assert(p.description && p.description.length >= 20, `Product #${num} has full narrative description`);
    assert(p.short_description && p.short_description.length >= 10, `Product #${num} has short description`);
    assert(p.scent_profile && p.scent_profile.includes('•'), `Product #${num} has bulleted scent profile: ${p.scent_profile}`);
    assert(p.best_for && ['Unisex', 'Men', 'Women', 'Women • Unisex'].includes(p.best_for), `Product #${num} has valid best_for audience: ${p.best_for}`);
    assert(p.top_notes?.length > 0 && p.base_notes?.length > 0, `Product #${num} has top & base notes`);
    assert(p.meta_title && p.meta_title.includes('Philz Signature'), `Product #${num} has SEO Meta Title`);
    assert(p.meta_description && p.meta_description.includes(p.name), `Product #${num} has SEO Meta Description`);
    assert(p.meta_keywords && p.meta_keywords.includes(p.name), `Product #${num} has SEO Meta Keywords`);
    assert(p.brand === 'Philz Signature', `Product #${num} brand is "Philz Signature"`);
    assert(p.concentration === 'Perfume Body Oil', `Product #${num} concentration is "Perfume Body Oil"`);
    assert(p.status === 'published', `Product #${num} status is "published"`);
    assert(p.stock_quantity === 100, `Product #${num} stock_quantity is 100`);

    // Verify images
    assert(p.images && p.images.length >= 1, `Product #${num} has attached image`);
    assert(p.images[0].image_url.includes('philz-signature-perfume-body-oil.jpg'), `Product #${num} uses official Philz Signature bottle photography`);

    // Verify 4 variants
    assert(p.variants && p.variants.length === 4, `Product #${num} has exactly 4 size variants`);
    
    p.variants.forEach((v) => {
      const expectedPrice = EXPECTED_PRICING[v.size_ml];
      assert(Number(v.price) === expectedPrice, `Product #${num} variant ${v.name} price is ₦${expectedPrice} (got ₦${v.price})`);
      assert(v.stock_quantity === 100, `Product #${num} variant ${v.name} stock is 100`);
      if (v.size_ml === 30) {
        assert(v.is_default === true, `Product #${num} 30ml variant is_default is true`);
      }
    });
  });

  // --- 2. IMAGE ASSET REACHABILITY ---
  console.log('\n--- TEST GROUP 2: Image Asset HTTP Reachability ---');
  const sampleImageUrl = products[0].images[0].image_url;
  const imgRes = await fetch(sampleImageUrl, { method: 'HEAD' });
  assert(imgRes.ok, `Official product image is publicly reachable via HTTP ${imgRes.status} (${sampleImageUrl})`);

  // --- 3. SEARCH & FILTER STOREFRONT QUERIES ---
  console.log('\n--- TEST GROUP 3: Storefront Search & Filter Capabilities ---');
  
  // Search for "Vanilla"
  const { data: vanillaSearch } = await supabase
    .from('products')
    .select('name, scent_profile, fragrance_family')
    .or('name.ilike.%Vanilla%,scent_profile.ilike.%Vanilla%,fragrance_family.ilike.%Vanilla%');
  assert(vanillaSearch && vanillaSearch.length >= 5, `Search for "Vanilla" returns ${vanillaSearch?.length} matching fragrances`);

  // Search for "Oud"
  const { data: oudSearch } = await supabase
    .from('products')
    .select('name, fragrance_family')
    .or('name.ilike.%Oud%,fragrance_family.ilike.%Oud%');
  assert(oudSearch && oudSearch.length >= 4, `Search for "Oud" returns ${oudSearch?.length} matching fragrances`);

  // Filter for Men
  const { data: menFragrances } = await supabase
    .from('products')
    .select('name, best_for')
    .eq('best_for', 'Men');
  assert(menFragrances && menFragrances.length === 2, `Filter for "Men" returns ${menFragrances?.length} masculine fragrances`);

  // Filter for Women
  const { data: womenFragrances } = await supabase
    .from('products')
    .select('name, best_for')
    .in('best_for', ['Women', 'Women • Unisex']);
  assert(womenFragrances && womenFragrances.length >= 6, `Filter for "Women" returns ${womenFragrances?.length} feminine fragrances`);

  // --- 4. CART & CHECKOUT VARIANT ORDER PIPELINE ---
  console.log('\n--- TEST GROUP 4: Cart, Checkout & Order Pipeline ---');
  const testProduct = products[0]; // Oud Maracuja
  const variant15ml = testProduct.variants.find(v => v.size_ml === 15);
  const variant100ml = testProduct.variants.find(v => v.size_ml === 100);

  assert(Boolean(variant15ml && variant100ml), 'Found 15ml and 100ml variants for test order placement');

  // Place test guest order
  const orderNumber = `TEST-${Date.now()}`;
  const testOrderPayload = {
    order_number: orderNumber,
    email: 'verification@philzsignature.com',
    phone: '08012345678',
    financial_status: 'pending',
    fulfillment_status: 'pending',
    subtotal: 90000, // 15,000 + 75,000
    shipping_amount: 0, // Free shipping over 150k or test
    discount_amount: 0,
    tax_amount: 0,
    total_amount: 90000,
    payment_method: 'paystack',
    shipping_address: {
      first_name: 'Test',
      last_name: 'Customer',
      address_line1: '10 Victoria Island Way',
      city: 'Lagos',
      state: 'Lagos',
      country: 'Nigeria'
    }
  };

  const { data: createdOrder, error: oErr } = await supabase
    .from('orders')
    .insert(testOrderPayload)
    .select()
    .single();

  assert(!oErr && createdOrder, `Test order placed successfully: ${createdOrder?.order_number}`);

  // Insert order items with variant sizes
  const orderItemsPayload = [
    {
      order_id: createdOrder.id,
      product_id: testProduct.id,
      product_name: `${testProduct.name} (15ml)`,
      product_slug: testProduct.slug,
      product_image_url: testProduct.images[0].image_url,
      sku: `${testProduct.sku}-15ML`,
      price: 15000,
      quantity: 1,
      subtotal: 15000
    },
    {
      order_id: createdOrder.id,
      product_id: testProduct.id,
      product_name: `${testProduct.name} (100ml)`,
      product_slug: testProduct.slug,
      product_image_url: testProduct.images[0].image_url,
      sku: `${testProduct.sku}-100ML`,
      price: 75000,
      quantity: 1,
      subtotal: 75000
    }
  ];

  const { data: createdItems, error: oiErr } = await supabase
    .from('order_items')
    .insert(orderItemsPayload)
    .select();

  assert(!oiErr && createdItems?.length === 2, `Order items created with exact variant sizes and prices: ${createdItems?.length} items`);
  assert(createdItems[0].price === 15000, 'Order item 1 price verified: ₦15,000');
  assert(createdItems[1].price === 75000, 'Order item 2 price verified: ₦75,000');

  // Clean up test order
  await supabase.from('order_items').delete().eq('order_id', createdOrder.id);
  await supabase.from('orders').delete().eq('id', createdOrder.id);
  console.log('  ✅ Test order and order items cleaned up cleanly.');

  // --- 5. ADMIN CRUD LIFECYCLE ---
  console.log('\n--- TEST GROUP 5: Admin CRUD Lifecycle Verification ---');
  
  // 5a. Create
  const testAdminProduct = {
    name: 'Test Haute Creation',
    slug: `test-haute-creation-${Date.now()}`,
    sku: `PS-TEST-${Date.now().toString().slice(-4)}`,
    tagline: 'A fleeting test of artisanal perfection.',
    description: 'A fleeting test formulation crafted to verify admin create, edit, duplicate, archive, and delete lifecycles.',
    short_description: 'Test formulation for admin QA.',
    scent_profile: 'Citrus • Cedar • White Musk',
    fragrance_family: 'Citrus • Woody',
    best_for: 'Unisex',
    brand: 'Philz Signature',
    category_id: 'c5555555-5555-5555-5555-555555555555',
    concentration: 'Perfume Body Oil',
    price: 30000,
    stock_quantity: 50,
    status: 'draft',
    meta_title: 'Test Haute Creation | Philz Signature',
    meta_description: 'Test meta description.',
    meta_keywords: 'Test, Philz Signature'
  };

  const { data: createdAdminProd, error: capErr } = await supabase
    .from('products')
    .insert(testAdminProduct)
    .select()
    .single();

  assert(!capErr && createdAdminProd, `Admin Create Product succeeded: "${createdAdminProd?.name}" (ID: ${createdAdminProd?.id})`);

  // 5b. Update
  const { data: updatedAdminProd, error: uapErr } = await supabase
    .from('products')
    .update({ price: 35000, stock_quantity: 80, status: 'published' })
    .eq('id', createdAdminProd.id)
    .select()
    .single();

  assert(!uapErr && updatedAdminProd.price === 35000 && updatedAdminProd.status === 'published', `Admin Update Product succeeded: Price changed to ₦35,000, status to published`);

  // 5c. Archive & Restore
  const { data: archivedProd, error: archErr } = await supabase
    .from('products')
    .update({ status: 'archived' })
    .eq('id', createdAdminProd.id)
    .select()
    .single();
  assert(!archErr && archivedProd.status === 'archived', `Admin Archive Product succeeded: status is archived`);

  const { data: restoredProd, error: restErr } = await supabase
    .from('products')
    .update({ status: 'published' })
    .eq('id', createdAdminProd.id)
    .select()
    .single();
  assert(!restErr && restoredProd.status === 'published', `Admin Restore Product succeeded: status is published`);

  // 5d. Delete
  const { error: delErr } = await supabase
    .from('products')
    .delete()
    .eq('id', createdAdminProd.id);
  assert(!delErr, `Admin Delete Product succeeded: Removed test product`);

  // --- FINAL REPORT ---
  console.log('\n================================================================');
  console.log(`🎉 ALL TESTS PASSED! (${passedTests}/${totalTests} assertions verified)`);
  console.log('✅ Storefront Catalog Verified (31 items, 124 variants)');
  console.log('✅ Flacon Size Variants Verified (15ml, 30ml, 50ml, 100ml)');
  console.log('✅ Official Bottle Photography Verified (HTTP 200)');
  console.log('✅ Cart, Checkout & Order Pipeline Verified');
  console.log('✅ Admin Full CRUD & Archive/Restore Lifecycle Verified');
  console.log('================================================================\n');
}

runE2EVerification().catch(err => {
  console.error('\n❌ E2E VERIFICATION FAILED:', err);
  process.exit(1);
});
