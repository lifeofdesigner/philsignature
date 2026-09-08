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

async function checkConstraints() {
  const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: `
        SELECT conname, pg_get_constraintdef(c.oid)
        FROM pg_constraint c
        JOIN pg_namespace n ON n.oid = c.connamespace
        WHERE conrelid = 'public.products'::regclass;
      `
    })
  });
  const data = await res.json();
  console.log('Product Constraints:', data);
}

checkConstraints().catch(console.error);
