const fs = require('fs');

const envContent = fs.readFileSync('.env', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.trim().split('=');
  const key = parts[0]?.trim();
  const val = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
  if (key && val) env[key] = val;
});

const projectRef = 'nntszytexvmolywvadyx';
const token = env['Supabase ACCESS_TOKEN'] || env['ACCESS_TOKEN'] || 'sbp_fc74311ea23d7e4244e176068437f62336ef95e4';

async function applyMigration() {
  let sql = fs.readFileSync('supabase/migrations/009_product_variants_and_catalog_attributes.sql', 'utf8');
  // Strip BOM if present
  sql = sql.replace(/^\uFEFF/, '');
  console.log('Applying migration 009 (length: ' + sql.length + ' chars)...');

  const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query: sql })
  });

  const data = await res.json();
  console.log('Migration Status:', res.status, res.statusText);
  if (!res.ok) {
    console.error('Migration Error:', data);
    process.exit(1);
  }
  console.log('Migration 009 applied successfully! Result:', data);
}

applyMigration().catch(err => {
  console.error(err);
  process.exit(1);
});
