const fs = require('fs');
const ws = require('ws');
const { createClient } = require('@supabase/supabase-js');

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
  realtime: {
    transport: ws,
  },
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});

async function check() {
  const { data, error } = await supabase.from('email_templates').select('*').limit(5);
  console.log('Result for email_templates:', { data, error });
}

check().catch(console.error);
