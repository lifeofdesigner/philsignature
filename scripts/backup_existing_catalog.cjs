const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');
const fs = require('fs');
const path = require('path');

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

async function backup() {
  console.log('Starting catalog backup...');

  const { data: products, error: pErr } = await supabase.from('products').select('*');
  if (pErr) throw new Error('Products backup error: ' + pErr.message);

  const { data: images, error: iErr } = await supabase.from('product_images').select('*');
  if (iErr) throw new Error('Images backup error: ' + iErr.message);

  const { data: videos, error: vErr } = await supabase.from('product_videos').select('*');
  if (vErr) throw new Error('Videos backup error: ' + vErr.message);

  const { data: categories, error: cErr } = await supabase.from('categories').select('*');
  if (cErr) throw new Error('Categories backup error: ' + cErr.message);

  const { data: collections, error: colErr } = await supabase.from('collections').select('*');
  if (colErr) throw new Error('Collections backup error: ' + colErr.message);

  const { data: reviews, error: rErr } = await supabase.from('reviews').select('*');
  if (rErr) throw new Error('Reviews backup error: ' + rErr.message);

  const { data: wishlist, error: wErr } = await supabase.from('wishlist').select('*');
  if (wErr) throw new Error('Wishlist backup error: ' + wErr.message);

  const { data: orderItems, error: oiErr } = await supabase.from('order_items').select('*');
  if (oiErr) throw new Error('Order items backup error: ' + oiErr.message);

  const backupData = {
    timestamp: new Date().toISOString(),
    total_products: products.length,
    total_images: images.length,
    total_categories: categories.length,
    total_collections: collections.length,
    total_reviews: reviews.length,
    total_wishlist: wishlist.length,
    total_order_items: orderItems ? orderItems.length : 0,
    products,
    product_images: images,
    product_videos: videos,
    categories,
    collections,
    reviews,
    wishlist,
    order_items: orderItems || []
  };

  const backupDir = path.join(__dirname, '..', 'supabase', 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const filename = `backup_catalog_${Date.now()}.json`;
  const filepath = path.join(backupDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(backupData, null, 2), 'utf8');

  console.log(`Backup completed successfully! Saved to: ${filepath}`);
  console.log(`Backed up ${products.length} products, ${images.length} images, ${categories.length} categories.`);
}

backup().catch(err => {
  console.error('Backup failed:', err);
  process.exit(1);
});
