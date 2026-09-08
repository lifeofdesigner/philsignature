const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.trim().split('=');
  const key = parts[0]?.trim();
  const val = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
  if (key && val) env[key] = val;
});

const ws = require('ws');

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_SERVICE_ROLE_KEY, {
  realtime: { transport: ws },
  auth: { persistSession: false, autoRefreshToken: false }
});

async function main() {
  const { data: profiles, error } = await supabase.from('profiles').select('*');
  console.log('Profiles count:', profiles?.length, 'Error:', error);
  if (profiles) {
    profiles.forEach(p => console.log(`Profile: ${p.email} | Role: ${p.role} | Name: ${p.first_name} ${p.last_name}`));
  }
  const { data: authUsers } = await supabase.auth.admin.listUsers();
  console.log('Auth Users count:', authUsers?.users?.length);
  if (authUsers?.users) {
    authUsers.users.forEach(u => console.log(`AuthUser: ${u.id} | ${u.email}`));
  }
}

main();
