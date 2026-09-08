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

async function testRpc() {
  // Test if exec_sql or similar exists
  const { data, error } = await supabase.rpc('exec_sql', { sql: 'SELECT 1;' });
  console.log('exec_sql result:', data, 'error:', error?.message);
}

testRpc();
