import pool from '../config/database.js';

/**
 * Must run AFTER `protect`. Looks up the JWT-decoded user and ensures they are
 * an admin (is_admin = 1, or role 'admin'/'owner'). DB-only so a forged JWT
 * can't grant admin access.
 *
 * NOTE: previously used a SQLite (`db.prepare().get()`) API against what is now
 * a Postgres pool — that always threw. Rewritten to async `pool.query`.
 */
export const requireAdmin = async (req, res, next) => {
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(401).json({ status: 'error', message: 'Not authenticated' });
  }
  try {
    const { rows } = await pool.query(
      'SELECT is_admin, role FROM users WHERE id = $1',
      [userId],
    );
    const user = rows[0];
    const isAdmin = user && (user.is_admin === 1 || user.role === 'admin' || user.role === 'owner');
    if (!isAdmin) {
      return res.status(403).json({ status: 'error', message: 'Admin access required' });
    }
    next();
  } catch (err) {
    next(err);
  }
};
