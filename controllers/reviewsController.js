import pool from '../config/database.js';

function reviewRowToJson(r) {
  return {
    id: r.id,
    authorName: r.author_name || 'Kunde',
    rating: r.rating,
    body: r.body || '',
    verified: r.verified,
    createdAt: r.created_at,
  };
}

/** GET /api/v1/products/:slug/reviews — public list + aggregate. */
export const listReviews = async (req, res, next) => {
  try {
    const slug = req.params.slug;
    const [list, agg] = await Promise.all([
      pool.query(
        'SELECT id, author_name, rating, body, verified, created_at FROM reviews WHERE product_slug = $1 ORDER BY created_at DESC LIMIT 100',
        [slug],
      ),
      pool.query(
        'SELECT COUNT(*)::int AS count, COALESCE(ROUND(AVG(rating)::numeric, 2), 0) AS average FROM reviews WHERE product_slug = $1',
        [slug],
      ),
    ]);
    res.json({
      status: 'success',
      data: {
        average: Number(agg.rows[0]?.average ?? 0),
        count: Number(agg.rows[0]?.count ?? 0),
        items: list.rows.map(reviewRowToJson),
      },
    });
  } catch (err) {
    next(err);
  }
};

/** POST /api/v1/reviews — create/update own review. requireRealUser. */
export const createReview = async (req, res, next) => {
  try {
    const authorId = req.supabaseUser?.id;
    const email = req.supabaseUser?.email ?? '';
    const slug = String(req.body?.slug ?? '').trim();
    const rating = Number(req.body?.rating);
    const body = String(req.body?.body ?? '').trim().slice(0, 2000);

    if (!slug || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ status: 'error', message: 'Gültiger Slug und Bewertung (1–5) erforderlich' });
    }

    const { rows: prod } = await pool.query('SELECT 1 FROM products WHERE slug = $1', [slug]);
    if (prod.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Produkt nicht gefunden' });
    }

    // Display name: profile name, else the local part of the email.
    const { rows: prof } = await pool.query(
      'SELECT display_name FROM profiles WHERE id = $1',
      [authorId],
    );
    const authorName =
      (prof[0]?.display_name && String(prof[0].display_name).trim()) ||
      (email ? email.split('@')[0] : 'Kunde');

    // Verified buyer: a paid/shipped/delivered order of this product.
    const { rows: bought } = await pool.query(
      `SELECT 1 FROM orders o JOIN order_items oi ON oi.order_id = o.id
       WHERE o.supabase_user_id = $1 AND oi.slug = $2
         AND o.status IN ('paid','shipped','delivered') LIMIT 1`,
      [authorId, slug],
    );
    const verified = bought.length > 0;

    const { rows } = await pool.query(
      `INSERT INTO reviews (product_slug, author_id, author_name, rating, body, verified)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (product_slug, author_id)
       DO UPDATE SET rating = $4, body = $5, verified = $6, author_name = $3, updated_at = NOW()
       RETURNING id, author_name, rating, body, verified, created_at`,
      [slug, authorId, authorName, rating, body, verified],
    );

    res.status(201).json({ status: 'success', data: reviewRowToJson(rows[0]) });
  } catch (err) {
    next(err);
  }
};
