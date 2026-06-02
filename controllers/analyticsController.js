import pool from '../config/database.js';

const ISO2 = /^[A-Za-z]{2}$/;
const DEVICES = new Set(['mobile', 'tablet', 'desktop']);

function parseDevice(ua = '') {
  const s = ua.toLowerCase();
  if (/tablet|ipad|playbook|silk/.test(s)) return 'tablet';
  if (/mobi|iphone|android.*mobile|phone|ipod/.test(s)) return 'mobile';
  return 'desktop';
}

const clip = (v, n) => (typeof v === 'string' && v.length ? v.slice(0, n) : null);

function pickCountry(body, headers) {
  const candidates = [
    body.country,
    headers['x-vercel-ip-country'],
    headers['cf-ipcountry'],
  ];
  for (const c of candidates) {
    if (typeof c === 'string' && ISO2.test(c)) return c.toUpperCase();
  }
  return null;
}

/**
 * POST /api/v1/track — records an anonymous page view. Public and best-effort:
 * it must never break navigation, so every failure resolves as 204. Writes
 * server-side via the pg pool (bypasses RLS); no IP or personal data stored.
 */
export const trackPageView = async (req, res) => {
  try {
    const b = req.body ?? {};
    const path = clip(b.path, 512);
    if (!path) return res.status(204).end();

    const country = pickCountry(b, req.headers);
    const device = DEVICES.has(b.device) ? b.device : parseDevice(req.headers['user-agent']);
    const referrer = clip(b.referrer, 256);
    const sessionId = clip(b.sessionId, 64);

    await pool.query(
      `INSERT INTO page_views (path, country, referrer, device, session_id)
       VALUES ($1, $2, $3, $4, $5)`,
      [path, country, referrer, device, sessionId],
    );
  } catch (err) {
    console.warn('[analytics] track failed:', err.message);
  }
  return res.status(204).end();
};

/**
 * GET /api/v1/admin/analytics?days=30 — aggregated, anonymous visitor metrics.
 * Admin/owner only (gated in the route). Returns totals, a daily series, and
 * top pages / countries / devices for the window.
 */
export const getAnalytics = async (req, res, next) => {
  try {
    const days = Math.min(365, Math.max(1, parseInt(req.query.days, 10) || 30));

    const [totals, series, pages, countries, devices] = await Promise.all([
      pool.query(
        `SELECT
           count(*) FILTER (WHERE created_at >= now() - make_interval(days => $1))            AS views,
           count(DISTINCT session_id) FILTER (WHERE created_at >= now() - make_interval(days => $1)) AS visitors,
           count(*) FILTER (WHERE created_at >= date_trunc('day', now()))                     AS today,
           count(DISTINCT session_id) FILTER (WHERE created_at > now() - interval '5 minutes') AS online
         FROM page_views`,
        [days],
      ),
      pool.query(
        `SELECT to_char(g.d, 'YYYY-MM-DD') AS day,
                COALESCE(v.views, 0)    AS views,
                COALESCE(v.visitors, 0) AS visitors
         FROM generate_series(
                (current_date - make_interval(days => $1 - 1))::date,
                current_date,
                interval '1 day'
              ) g(d)
         LEFT JOIN (
           SELECT created_at::date AS day,
                  count(*)                  AS views,
                  count(DISTINCT session_id) AS visitors
           FROM page_views
           WHERE created_at >= (current_date - make_interval(days => $1 - 1))
           GROUP BY 1
         ) v ON v.day = g.d::date
         ORDER BY g.d`,
        [days],
      ),
      pool.query(
        `SELECT path, count(*) AS views
         FROM page_views
         WHERE created_at >= now() - make_interval(days => $1)
         GROUP BY path ORDER BY views DESC LIMIT 8`,
        [days],
      ),
      pool.query(
        `SELECT country, count(*) AS views
         FROM page_views
         WHERE created_at >= now() - make_interval(days => $1) AND country IS NOT NULL
         GROUP BY country ORDER BY views DESC LIMIT 8`,
        [days],
      ),
      pool.query(
        `SELECT COALESCE(device, 'unknown') AS device, count(*) AS views
         FROM page_views
         WHERE created_at >= now() - make_interval(days => $1)
         GROUP BY device ORDER BY views DESC`,
        [days],
      ),
    ]);

    const t = totals.rows[0] ?? {};
    res.json({
      status: 'success',
      data: {
        days,
        totals: {
          views: Number(t.views ?? 0),
          visitors: Number(t.visitors ?? 0),
          today: Number(t.today ?? 0),
          online: Number(t.online ?? 0),
        },
        series: series.rows.map((r) => ({
          day: r.day,
          views: Number(r.views),
          visitors: Number(r.visitors),
        })),
        topPages: pages.rows.map((r) => ({ path: r.path, views: Number(r.views) })),
        topCountries: countries.rows.map((r) => ({ country: r.country, views: Number(r.views) })),
        devices: devices.rows.map((r) => ({ device: r.device, views: Number(r.views) })),
      },
    });
  } catch (err) {
    next(err);
  }
};
