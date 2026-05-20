import db from '../config/database.js';

/**
 * Must run AFTER `protect`. Looks up the JWT-decoded user and ensures
 * is_admin = 1. Designed to be small & DB-only so the JWT itself can't be
 * forged into admin access.
 */
export const requireAdmin = (req, res, next) => {
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(401).json({ status: 'error', message: 'Not authenticated' });
  }
  const row = db.prepare('SELECT is_admin FROM users WHERE id = ?').get(userId);
  if (!row || row.is_admin !== 1) {
    return res.status(403).json({ status: 'error', message: 'Admin access required' });
  }
  next();
};
