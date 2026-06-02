import pool from '../config/database.js';

/**
 * Role-based access control. Must run AFTER `protect` (which sets req.user).
 *
 * Roles (see db/migrations/*), most → least power:
 *   owner    — full access incl. team/role management & settings
 *   admin    — orders, products, revenue & analytics
 *   staff    — orders & products (NO revenue/analytics, NO team management)
 *   viewer   — read-only back office
 *   customer — normal account, NO back-office access (default)
 *
 * Looks the role up in the DB (never trusts a role claim from the JWT) so a
 * forged token can't escalate. Postgres/pg — matches the rest of the app.
 *
 * Usage:  router.get('/admin/revenue', protect, requireRole('admin'), handler)
 *         router.patch('/admin/orders/:id', protect, requireRole('staff'), handler)
 *
 * Passing a single role means "this role OR anything more powerful".
 */
const RANK = { customer: 0, viewer: 1, staff: 2, admin: 3, owner: 4 };

export const requireRole =
  (minRole = 'staff') =>
  async (req, res, next) => {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ status: 'error', message: 'Not authenticated' });
    }

    try {
      const { rows } = await pool.query(
        'SELECT role, is_admin FROM users WHERE id = $1',
        [userId],
      );
      const user = rows[0];
      if (!user) {
        return res.status(401).json({ status: 'error', message: 'Not authenticated' });
      }

      // Fall back to is_admin for rows not yet migrated to a role.
      const role = user.role ?? (user.is_admin === 1 ? 'admin' : 'customer');
      const have = RANK[role] ?? 0;
      const need = RANK[minRole] ?? RANK.staff;

      if (have < need) {
        return res
          .status(403)
          .json({ status: 'error', message: 'Insufficient permissions' });
      }

      req.user.role = role;
      next();
    } catch (err) {
      next(err);
    }
  };
