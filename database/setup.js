/**
 * One-time script to set up the Supabase database schema.
 * Run: node database/setup.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', 'backend', '.env') });
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in backend/.env');
  process.exit(1);
}

async function runSchema() {
  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

  // Use Supabase Management API to run raw SQL
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`,
    },
    body: JSON.stringify({ query: sql }),
  });

  // If /rpc doesn't work, try the SQL endpoint directly
  if (!response.ok) {
    console.log('Trying direct SQL execution via pg endpoint...');
    
    // Use the Supabase SQL endpoint
    const sqlResponse = await fetch(`${supabaseUrl}/pg/sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({ query: sql }),
    });

    if (sqlResponse.ok) {
      const result = await sqlResponse.json();
      console.log('Schema executed successfully via pg/sql!');
      console.log(result);
    } else {
      const errText = await sqlResponse.text();
      console.error('pg/sql failed:', sqlResponse.status, errText);
      console.log('\n========================================');
      console.log('MANUAL SETUP REQUIRED:');
      console.log('1. Go to https://supabase.com/dashboard');
      console.log('2. Open your project: utjtifzprezkfdntgqlf');
      console.log('3. Go to SQL Editor');
      console.log('4. Paste the contents of database/schema.sql');
      console.log('5. Click "Run"');
      console.log('========================================\n');
    }
  } else {
    const result = await response.json();
    console.log('Schema executed successfully!');
    console.log(result);
  }
}

runSchema().catch(console.error);
