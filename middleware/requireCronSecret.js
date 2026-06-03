/**
 * Guards scheduled-task endpoints with a shared secret. The caller (a GitHub
 * Actions cron) must send `X-Cron-Secret: $CRON_SECRET`. If CRON_SECRET is not
 * configured the endpoint is disabled (fails closed) so it can never run
 * unauthenticated.
 */
import { timingSafeEqual } from 'node:crypto';

export function requireCronSecret(req, res, next) {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    return res.status(503).json({ status: 'error', message: 'Task endpoint disabled (no CRON_SECRET)' });
  }
  const given = req.get('x-cron-secret') ?? '';
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  // Length-guard before timingSafeEqual (it throws on length mismatch).
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return res.status(401).json({ status: 'error', message: 'Not authorized' });
  }
  next();
}
