// Tiny in-memory fixed-window rate limiter. No external dependency. Good enough
// for a single long-running instance (Render); resets on restart. Keyed by
// client IP + a per-route bucket name so different endpoints don't share counts.
const buckets = new Map();

// Periodic cleanup so the map can't grow unbounded.
const sweep = setInterval(() => {
  const now = Date.now();
  for (const [k, v] of buckets) if (now > v.reset) buckets.delete(k);
}, 5 * 60 * 1000);
sweep.unref?.();

export function rateLimit({ windowMs = 60_000, max = 60, key = 'default' } = {}) {
  return (req, res, next) => {
    const id = `${key}:${req.ip}`;
    const now = Date.now();
    let b = buckets.get(id);
    if (!b || now > b.reset) {
      b = { count: 0, reset: now + windowMs };
      buckets.set(id, b);
    }
    b.count += 1;
    if (b.count > max) {
      const retry = Math.max(1, Math.ceil((b.reset - now) / 1000));
      res.setHeader('Retry-After', String(retry));
      return res.status(429).json({
        status: 'error',
        message: 'Zu viele Anfragen — bitte kurz warten.',
      });
    }
    next();
  };
}
