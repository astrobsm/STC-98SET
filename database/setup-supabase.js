/**
 * Setup Supabase database by running schema.sql statements individually
 * via direct Postgres connection through the Supabase pooler.
 * 
 * Usage: node database/setup-supabase.js
 */
const dotenvPath = require('path').join(__dirname, '..', 'backend', '.env');
try { require(require('path').join(__dirname, '..', 'backend', 'node_modules', 'dotenv')).config({ path: dotenvPath }); } catch(e) {}
const pg = require(require('path').join(__dirname, '..', 'backend', 'node_modules', 'pg'));
const Client = pg.Client;
const fs = require('fs');
const path = require('path');

const DB_PASSWORD = 'wiopskHwmTPWU69N';
const PROJECT_REF = 'utjtifzprezkfdntgqlf';

// Try multiple connection formats
const connectionConfigs = [
  {
    name: 'Direct connection (port 5432)',
    connectionString: `postgresql://postgres.${PROJECT_REF}:${DB_PASSWORD}@aws-0-us-east-1.pooler.supabase.com:5432/postgres`,
    ssl: { rejectUnauthorized: false }
  },
  {
    name: 'Transaction pooler (port 6543)',
    connectionString: `postgresql://postgres.${PROJECT_REF}:${DB_PASSWORD}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`,
    ssl: { rejectUnauthorized: false }
  },
  {
    name: 'Direct host (port 5432)',
    host: `db.${PROJECT_REF}.supabase.co`,
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: DB_PASSWORD,
    ssl: { rejectUnauthorized: false }
  },
  {
    name: 'AWS us-west pooler',
    connectionString: `postgresql://postgres.${PROJECT_REF}:${DB_PASSWORD}@aws-0-us-west-1.pooler.supabase.com:5432/postgres`,
    ssl: { rejectUnauthorized: false }
  },
  {
    name: 'AWS eu-west pooler',
    connectionString: `postgresql://postgres.${PROJECT_REF}:${DB_PASSWORD}@aws-0-eu-west-1.pooler.supabase.com:5432/postgres`,
    ssl: { rejectUnauthorized: false }
  },
  {
    name: 'AWS eu-central pooler',
    connectionString: `postgresql://postgres.${PROJECT_REF}:${DB_PASSWORD}@aws-0-eu-central-1.pooler.supabase.com:5432/postgres`,
    ssl: { rejectUnauthorized: false }
  },
];

async function tryConnect(config) {
  const { name, ...pgConfig } = config;
  const client = new Client(pgConfig);
  try {
    await client.connect();
    console.log(`Connected via: ${name}`);
    return client;
  } catch (err) {
    console.log(`  ${name}: ${err.message}`);
    return null;
  }
}

async function main() {
  console.log('Trying connection methods...\n');
  
  let client = null;
  for (const config of connectionConfigs) {
    client = await tryConnect(config);
    if (client) break;
  }

  if (!client) {
    console.log('\n====================================================');
    console.log('Could not connect directly to Postgres.');
    console.log('Please run the schema manually:');
    console.log('');
    console.log('1. Go to https://supabase.com/dashboard/project/' + PROJECT_REF + '/sql/new');
    console.log('2. Paste the contents of database/schema.sql');
    console.log('3. Click "Run"');
    console.log('====================================================');
    process.exit(1);
  }

  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  
  try {
    await client.query(sql);
    console.log('\nSchema executed successfully! All tables created.');
  } catch (err) {
    console.error('\nSchema execution error:', err.message);
    console.log('\nTrying statement-by-statement...');
    
    // Split and run statements one by one
    const statements = sql.split(';').filter(s => s.trim().length > 0);
    let success = 0, failed = 0;
    
    for (const stmt of statements) {
      try {
        await client.query(stmt + ';');
        success++;
      } catch (e) {
        failed++;
        console.error(`  FAILED: ${e.message.slice(0, 100)}`);
        console.error(`  Statement: ${stmt.trim().slice(0, 80)}...`);
      }
    }
    console.log(`\nResults: ${success} succeeded, ${failed} failed`);
  } finally {
    await client.end();
  }
}

main();
