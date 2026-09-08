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

async function testSql() {
  const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: 'SELECT table_name FROM information_schema.tables WHERE table_schema = \'public\';'
    })
  });
  const data = await res.json();
  console.log('Supabase API Status:', res.status);
  console.log('Public tables:', data);
}

testSql().catch(console.error);
