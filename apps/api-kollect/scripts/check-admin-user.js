const { Pool } = require('pg');
require('dotenv').config();

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error('Usage: node scripts/check-admin-user.js <email>');
    process.exit(1);
  }

  const connectionString =
    process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DIRECT_DATABASE_URL or DATABASE_URL is required');
  }

  const sslRequired =
    process.env.PGSSLMODE === 'require' ||
    /sslmode=require/i.test(connectionString) ||
    connectionString.includes('supabase.co');

  const cleanedConnectionString = sslRequired
    ? connectionString
        .replace(/([?&])sslmode=[^&]*/i, '$1')
        .replace(/[?&]$/, '')
    : connectionString;

  const pool = new Pool({
    connectionString: cleanedConnectionString,
    ...(sslRequired ? { ssl: { rejectUnauthorized: false } } : {}),
  });

  try {
    const result = await pool.query(
      'select id, email, "supabaseId", "isAdmin", "isCEO", "isClient", "has_seen_creator_prompt" from users where email = $1',
      [email],
    );

    console.log(JSON.stringify(result.rows, null, 2));
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
