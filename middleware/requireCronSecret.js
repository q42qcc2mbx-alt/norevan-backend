/**
 * Guards scheduled-task endpoints with a shared secret. The caller (a GitHub
 * Actions cron) must send `X-Cron-Secret: $CRON_SECRET`. If CRON_SECRET is not
 * configured the endpoint is disabled (fails closed) so it can never run
 * unauthenticated.
 */
export function requireCronSecret(req, res, next) {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    return res.status(503).json({ status: 'error', message: 'Task endpoint disabled (no CRON_SECRET)' });
  }
  const given = req.get('x-cron-secret');
  if (given !== expected) {
    return res.status(401).json({ status: 'error', message: 'Not authorized' });
  }
  next();
}
