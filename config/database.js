import pg from 'pg';
import { resolve4 } from 'dns/promises';

const { Pool } = pg;

// Render Frankfurt resolves Supabase hostnames to IPv6 which is unreachable.
// Explicitly query A records (IPv4 only) and rewrite the host before pool creation.
async function resolveIPv4(connStr) {
  try {
    const u = new URL(connStr);
    const [ip] = await resolve4(u.hostname);
    u.hostname = ip;
    return u.toString();
  } catch {
    return connStr;
  }
}

const connectionString = await resolveIPv4(process.env.DATABASE_URL ?? '');

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
