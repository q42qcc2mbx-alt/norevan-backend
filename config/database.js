import pg from 'pg';

const { Pool } = pg;

// The Supabase direct host (db.PROJECTREF.supabase.co) is IPv6-only and
// unreachable from Render Frankfurt. Rewrite to the Transaction pooler which
// has IPv4 addresses. The pooler URL format differs only in host, port, and
// the username gains a ".PROJECTREF" suffix.
function toPoolerUrl(connStr) {
  const u = new URL(connStr);
  const m = u.hostname.match(/^db\.([a-z0-9]+)\.supabase\.co$/);
  if (!m) return connStr; // already pooler or custom host — leave as-is
  const ref = m[1];
  u.hostname = 'aws-0-eu-west-1.pooler.supabase.com';
  u.port = '6543';
  if (!u.username.endsWith(`.${ref}`)) u.username = `${u.username}.${ref}`;
  return u.toString();
}

const connectionString = toPoolerUrl(process.env.DATABASE_URL ?? '');

const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('[db] unexpected pool error:', err.message);
});

export default pool;
