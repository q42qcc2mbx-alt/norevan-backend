import pool from '../config/database.js';

export const getDashboard = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, username, email, is_admin, role, created_at FROM users WHERE id = $1',
      [req.user.userId],
    );

    if (rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    res.json({ status: 'success', data: { user: rows[0] } });
  } catch (err) {
    next(err);
  }
};
