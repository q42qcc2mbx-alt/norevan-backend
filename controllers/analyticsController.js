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
