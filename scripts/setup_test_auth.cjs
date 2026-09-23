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

const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  realtime: { transport: ws },
  auth: { persistSession: false, autoRefreshToken: false }
});

async function main() {
  // Ensure lifeofcuba@gmail.com has password Password123!
  const { data, error } = await supabase.auth.admin.updateUserById('2c18b3ef-61fe-4b61-9948-969aa7002776', {
    password: 'Password123!',
    email_confirm: true
  });
  console.log('Super Admin user setup result:', data?.user?.email, 'Error:', error);
}

main();

