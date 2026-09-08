const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const ws = require('ws');

const envContent = fs.readFileSync('.env', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.trim().split('=');
  const key = parts[0]?.trim();
  const val = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
  if (key && val) env[key] = val;
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_SERVICE_ROLE_KEY, {
  realtime: { transport: ws },
  auth: { persistSession: false, autoRefreshToken: false }
});

async function cleanup() {
  await supabase.from('coupons').delete().eq('code', 'BROWSER_QA_15');
  await supabase.from('coupons').delete().eq('code', 'BROWSER_QA_10');
  await supabase.from('shipping_methods').delete().eq('name', 'QA Priority Express');
  await supabase.from('shipping_methods').delete().eq('name', 'QA Priority Courier');
  console.log('Test QA artifacts cleaned up successfully.');
}

cleanup();

