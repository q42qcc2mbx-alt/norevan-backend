import pool from '../config/database.js';

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
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

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

export const listProducts = async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
    res.json({ status: 'success', data: rows.map(rowToProduct) });
  } catch (err) {
    next(err);
  }
};

export const getProductBySlug = async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM products WHERE slug = $1', [req.params.slug]);
    if (rows.length === 0) return res.status(404).json({ status: 'error', message: 'Product not found' });
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
    await pool.query(
      `INSERT INTO products (
        slug, name, brand, price_cents, categories_json, images_json, sizes_json,
        description_de, description_en, specs_json, highlight, hero, stock
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
      [
        p.slug, p.name, p.brand, p.priceCents,
        JSON.stringify(p.categories ?? []),
        JSON.stringify(p.images ?? []),
        p.sizes ? JSON.stringify(p.sizes) : null,
        p.description?.de ?? '', p.description?.en ?? '',
        JSON.stringify(p.specs ?? []),
        p.highlight ? 1 : 0, p.hero ? 1 : 0,
        Number.isFinite(p.stock) ? p.stock : 0,
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

      await client.query(
        `INSERT INTO products (
          slug, name, brand, price_cents, categories_json, images_json, sizes_json,
          description_de, description_en, specs_json, highlight, hero, stock, updated_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,NOW())
        ON CONFLICT (slug) DO UPDATE SET
          name=$2, brand=$3, price_cents=$4, categories_json=$5,
          images_json=$6, sizes_json=$7, description_de=$8, description_en=$9,
          specs_json=$10, highlight=$11, hero=$12, stock=$13, updated_at=NOW()`,
        [
          merged.slug, merged.name, merged.brand, merged.priceCents,
          JSON.stringify(merged.categories ?? []),
          JSON.stringify(merged.images ?? []),
          merged.sizes ? JSON.stringify(merged.sizes) : null,
          merged.description?.de ?? '', merged.description?.en ?? '',
          JSON.stringify(merged.specs ?? []),
          merged.highlight ? 1 : 0, merged.hero ? 1 : 0,
          Number.isFinite(merged.stock) ? merged.stock : 0,
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
