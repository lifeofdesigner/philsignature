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
console.log('Connecting to:', url);

const supabase = createClient(url, key, {
  realtime: {
    transport: ws,
  },
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});

async function inspect() {
  const { data: products, error: pErr, count: totalProducts } = await supabase
    .from('products')
    .select('*, images:product_images(*)', { count: 'exact' });
  console.log('Products count:', totalProducts, 'Error:', pErr?.message || 'none');
  if (products && products.length > 0) {
    console.log('Sample product keys:', Object.keys(products[0]));
    console.log('Sample product [0]:', {
      id: products[0].id,
      name: products[0].name,
      slug: products[0].slug,
      price: products[0].price,
      sale_price: products[0].sale_price,
      volume_ml: products[0].volume_ml,
      stock_quantity: products[0].stock_quantity,
      images: products[0].images
    });
  }

  const { data: cats, error: cErr } = await supabase.from('categories').select('*');
  console.log('Categories:', cats?.map(c => ({ id: c.id, name: c.name, slug: c.slug })));

  const { data: cols, error: colErr } = await supabase.from('collections').select('*');
  console.log('Collections:', cols?.map(c => ({ id: c.id, name: c.name, slug: c.slug })));

  const { data: variants, error: vErr } = await supabase.from('product_variants').select('*').limit(1);
  console.log('product_variants table check:', vErr ? vErr.message : 'EXISTS!');

  const { data: pImages, error: piErr } = await supabase.from('product_images').select('*');
  console.log('Product images count:', pImages?.length, 'Error:', piErr?.message || 'none');

  // Check storage buckets
  const { data: buckets, error: bErr } = await supabase.storage.listBuckets();
  console.log('Storage buckets:', buckets?.map(b => b.name), 'Error:', bErr?.message || 'none');
}

inspect().catch(console.error);
