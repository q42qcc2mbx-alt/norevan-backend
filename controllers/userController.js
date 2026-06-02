import bcrypt from 'bcryptjs';
import pool from '../config/database.js';

/** POST /api/v1/account/change-password — back-office user changes own password. */
export const changePassword = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const currentPassword = String(req.body?.currentPassword ?? '');
    const newPassword = String(req.body?.newPassword ?? '');

    if (newPassword.length < 8) {
      return res.status(400).json({ status: 'error', message: 'Neues Passwort muss mindestens 8 Zeichen haben' });
    }

    const { rows } = await pool.query('SELECT password_hash FROM users WHERE id = $1', [userId]);
    if (rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    const ok = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!ok) {
      return res.status(401).json({ status: 'error', message: 'Aktuelles Passwort ist falsch' });
    }

    const hash = await bcrypt.hash(newPassword, 12);
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, userId]);
    res.json({ status: 'success', message: 'Passwort geändert' });
  } catch (err) {
    next(err);
  }
};

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
