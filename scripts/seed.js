import 'dotenv/config';
import bcrypt from 'bcryptjs';
import pool from '../config/database.js';
import { seedProducts } from './seed-products.data.js';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME ?? 'admin';
const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    ?? 'admin@norevan.shop';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'NorevanAdmin1!';

// ─── Admin user ───────────────────────────────────────────────────────────
const { rows: existing } = await pool.query(
  'SELECT id, is_admin FROM users WHERE email = $1',
  [ADMIN_EMAIL],
);

if (existing.length > 0) {
  if (!existing[0].is_admin) {
    await pool.query('UPDATE users SET is_admin = 1 WHERE id = $1', [existing[0].id]);
    console.log(`[seed] promoted ${ADMIN_EMAIL} to admin`);
  } else {
    console.log(`[seed] admin ${ADMIN_EMAIL} already exists`);
  }
} else {
  const hash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  await pool.query(
    'INSERT INTO users (username, email, password_hash, is_admin) VALUES ($1,$2,$3,1)',
    [ADMIN_USERNAME, ADMIN_EMAIL, hash],
  );
  console.log(`[seed] created admin ${ADMIN_EMAIL}`);
}

// ─── Products ─────────────────────────────────────────────────────────────
const client = await pool.connect();
try {
  await client.query('BEGIN');
  for (const p of seedProducts) {
    await client.query(
      `INSERT INTO products (
        slug, name, brand, price_cents, categories_json, images_json, sizes_json,
        description_de, description_en, specs_json, highlight, hero, stock
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      ON CONFLICT (slug) DO UPDATE SET
        name=$2, brand=$3, price_cents=$4, categories_json=$5,
        images_json=$6, sizes_json=$7, description_de=$8, description_en=$9,
        specs_json=$10, highlight=$11, hero=$12, stock=$13, updated_at=NOW()`,
      [
        p.slug, p.name, p.brand, p.priceCents,
        JSON.stringify(p.categories),
        JSON.stringify(p.images),
        p.sizes ? JSON.stringify(p.sizes) : null,
        p.description.de, p.description.en,
        JSON.stringify(p.specs),
        p.highlight ? 1 : 0, p.hero ? 1 : 0, p.stock ?? 0,
      ],
    );
  }
  await client.query('COMMIT');
} catch (e) {
  await client.query('ROLLBACK');
  throw e;
} finally {
  client.release();
}

const { rows: countRows } = await pool.query('SELECT COUNT(*) AS c FROM products');
console.log(`[seed] products in DB: ${countRows[0].c}  (upserted ${seedProducts.length})`);

await pool.end();
