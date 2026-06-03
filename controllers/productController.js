import pool from '../config/database.js';
import { sendBackInStock } from '../services/emailService.js';

// Notify (once) everyone waiting on a product that just came back in stock.
async function notifyBackInStock(product) {
  try {
    const { rows } = await pool.query(
      'SELECT email FROM stock_notifications WHERE product_slug = $1 AND notified = false',
      [product.slug],
    );
    if (rows.length === 0) return;
    const image = product.images?.[0]?.src ?? '';
    for (const r of rows) {
      await sendBackInStock(r.email, { slug: product.slug, name: product.name, image });
    }
    await pool.query(
      'UPDATE stock_notifications SET notified = true WHERE product_slug = $1 AND notified = false',
      [product.slug],
    );
  } catch (e) {
    console.error('[stock-notify] failed:', e.message);
  }
}

/** POST /api/v1/products/:slug/notify-me — subscribe to a back-in-stock alert. */
export const subscribeBackInStock = async (req, res, next) => {
  try {
    const slug = req.params.slug;
    const email = String(req.body?.email ?? '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ status: 'error', message: 'Gültige E-Mail erforderlich' });
    }
    const { rows } = await pool.query('SELECT 1 FROM products WHERE slug = $1', [slug]);
    if (rows.length === 0) return res.status(404).json({ status: 'error', message: 'Produkt nicht gefunden' });
    await pool.query(
      'INSERT INTO stock_notifications (product_slug, email) VALUES ($1, $2) ON CONFLICT (product_slug, email) DO NOTHING',
      [slug, email],
    );
    res.status(201).json({ status: 'success', message: 'Wir benachrichtigen dich.' });
  } catch (err) {
    next(err);
  }
};

function rowToProduct(row) {
  return {
    slug: row.slug,
    name: row.name,
    brand: row.brand,
    priceCents: row.price_cents,
    categories: JSON.parse(row.categories_json),
    images: JSON.parse(row.images_json),
    sizes: row.sizes_json ? JSON.parse(row.sizes_json) : undefined,
    description: { de: row.description_de, en: row.description_en },
    specs: JSON.parse(row.specs_json),
    highlight: !!row.highlight,
    hero: !!row.hero,
    stock: row.stock,
    // Per-size inventory (pg parses jsonb → object). undefined when not used.
    stockBySize: row.stock_by_size ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Normalise a {size: units} map: coerce to non-negative integers, drop junk.
// Returns null when there's nothing usable (→ product uses aggregate stock).
function normalizeStockBySize(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null;
  const out = {};
  for (const [k, v] of Object.entries(input)) {
    const n = Math.max(0, Math.floor(Number(v)));
    if (Number.isFinite(n)) out[String(k)] = n;
  }
  return Object.keys(out).length ? out : null;
}

const sumStock = (map) => Object.values(map).reduce((s, v) => s + Number(v || 0), 0);

function validateProduct(p) {
  const errors = [];
  if (!p || typeof p !== 'object') errors.push('product payload must be an object');
  if (!p?.slug || typeof p.slug !== 'string') errors.push('slug is required');
  if (!p?.name || typeof p.name !== 'string') errors.push('name is required');
  if (!p?.brand || typeof p.brand !== 'string') errors.push('brand is required');
  if (!Number.isFinite(p?.priceCents) || p.priceCents < 0) errors.push('priceCents must be a non-negative number');
  if (!Array.isArray(p?.categories) || p.categories.length === 0) errors.push('categories must be a non-empty array');
  if (!Array.isArray(p?.images) || p.images.length === 0) errors.push('images must be a non-empty array');
  if (!p?.description?.de || !p?.description?.en) errors.push('description.de and description.en are required');
  return errors;
}

// Catalogue reads are public and change rarely — let the browser/CDN cache them
// briefly and serve stale while revalidating. Admin edits show up within a minute.
const CATALOG_CACHE = 'public, max-age=60, stale-while-revalidate=300';

export const listProducts = async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
    res.set('Cache-Control', CATALOG_CACHE);
    res.json({ status: 'success', data: rows.map(rowToProduct) });
  } catch (err) {
    next(err);
  }
};

export const getProductBySlug = async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM products WHERE slug = $1', [req.params.slug]);
    if (rows.length === 0) return res.status(404).json({ status: 'error', message: 'Product not found' });
    res.set('Cache-Control', CATALOG_CACHE);
    res.json({ status: 'success', data: rowToProduct(rows[0]) });
  } catch (err) {
    next(err);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const errors = validateProduct(req.body);
    if (errors.length) return res.status(400).json({ status: 'error', message: 'Validation failed', errors });

    const { rows: existing } = await pool.query('SELECT slug FROM products WHERE slug = $1', [req.body.slug]);
    if (existing.length > 0) return res.status(409).json({ status: 'error', message: 'Slug already exists' });

    const p = req.body;
    const sbs = normalizeStockBySize(p.stockBySize);
    const stockVal = sbs ? sumStock(sbs) : (Number.isFinite(p.stock) ? p.stock : 0);
    await pool.query(
      `INSERT INTO products (
        slug, name, brand, price_cents, categories_json, images_json, sizes_json,
        description_de, description_en, specs_json, highlight, hero, stock, stock_by_size
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
      [
        p.slug, p.name, p.brand, p.priceCents,
        JSON.stringify(p.categories ?? []),
        JSON.stringify(p.images ?? []),
        p.sizes ? JSON.stringify(p.sizes) : null,
        p.description?.de ?? '', p.description?.en ?? '',
        JSON.stringify(p.specs ?? []),
        p.highlight ? 1 : 0, p.hero ? 1 : 0,
        stockVal,
        sbs ? JSON.stringify(sbs) : null,
      ],
    );

    const { rows } = await pool.query('SELECT * FROM products WHERE slug = $1', [p.slug]);
    res.status(201).json({ status: 'success', data: rowToProduct(rows[0]) });
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { rows: existing } = await pool.query('SELECT * FROM products WHERE slug = $1', [slug]);
    if (existing.length === 0) return res.status(404).json({ status: 'error', message: 'Product not found' });

    const current = rowToProduct(existing[0]);
    const merged = { ...current, ...req.body, slug: req.body.slug ?? slug };
    const errors = validateProduct(merged);
    if (errors.length) return res.status(400).json({ status: 'error', message: 'Validation failed', errors });

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      if (merged.slug !== slug) {
        const { rows: collision } = await client.query('SELECT slug FROM products WHERE slug = $1', [merged.slug]);
        if (collision.length > 0) {
          await client.query('ROLLBACK');
          return res.status(409).json({ status: 'error', message: 'New slug already exists' });
        }
        await client.query('DELETE FROM products WHERE slug = $1', [slug]);
      }

      const sbs = normalizeStockBySize(merged.stockBySize);
      const stockVal = sbs ? sumStock(sbs) : (Number.isFinite(merged.stock) ? merged.stock : 0);
      await client.query(
        `INSERT INTO products (
          slug, name, brand, price_cents, categories_json, images_json, sizes_json,
          description_de, description_en, specs_json, highlight, hero, stock, stock_by_size, updated_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,NOW())
        ON CONFLICT (slug) DO UPDATE SET
          name=$2, brand=$3, price_cents=$4, categories_json=$5,
          images_json=$6, sizes_json=$7, description_de=$8, description_en=$9,
          specs_json=$10, highlight=$11, hero=$12, stock=$13, stock_by_size=$14, updated_at=NOW()`,
        [
          merged.slug, merged.name, merged.brand, merged.priceCents,
          JSON.stringify(merged.categories ?? []),
          JSON.stringify(merged.images ?? []),
          merged.sizes ? JSON.stringify(merged.sizes) : null,
          merged.description?.de ?? '', merged.description?.en ?? '',
          JSON.stringify(merged.specs ?? []),
          merged.highlight ? 1 : 0, merged.hero ? 1 : 0,
          stockVal,
          sbs ? JSON.stringify(sbs) : null,
        ],
      );

      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }

    const { rows } = await pool.query('SELECT * FROM products WHERE slug = $1', [merged.slug]);
    res.json({ status: 'success', data: rowToProduct(rows[0]) });

    // Restocked from sold-out → fire back-in-stock alerts (best-effort).
    if ((current.stock ?? 0) <= 0 && (merged.stock ?? 0) > 0) {
      notifyBackInStock(merged).catch(() => {});
    }
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { rowCount } = await pool.query('DELETE FROM products WHERE slug = $1', [slug]);
    if (rowCount === 0) return res.status(404).json({ status: 'error', message: 'Product not found' });
    res.json({ status: 'success', message: 'Deleted', data: { slug } });
  } catch (err) {
    next(err);
  }
};
