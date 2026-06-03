import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import pool from '../config/database.js';
import { sendTeamInvite } from '../services/emailService.js';

const BACKOFFICE_ROLES = ['viewer', 'staff', 'admin', 'owner'];
const isAdminRole = (role) => role === 'admin' || role === 'owner';

function genPassword() {
  return `Nrv-${crypto.randomBytes(6).toString('base64url')}${crypto.randomInt(10, 99)}!`;
}

// Best-effort audit log; never blocks the main operation.
async function audit(actorId, action, target, meta) {
  try {
    await pool.query(
      'INSERT INTO admin_audit (actor_id, action, target, meta) VALUES ($1, $2, $3, $4)',
      [actorId ?? null, action, target ?? null, meta ? JSON.stringify(meta) : null],
    );
  } catch (e) {
    console.warn('[audit] failed:', e.message);
  }
}

async function ownerCount() {
  const { rows } = await pool.query("SELECT count(*)::int AS c FROM users WHERE role = 'owner'");
  return rows[0]?.c ?? 0;
}

/** GET /api/v1/admin/audit — recent admin actions (owner only). */
export const listAudit = async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit ?? 100), 500);
    const { rows } = await pool.query(
      `SELECT a.id, a.action, a.target, a.meta, a.created_at,
              u.username AS actor_username, u.email AS actor_email
       FROM admin_audit a
       LEFT JOIN users u ON u.id = a.actor_id
       ORDER BY a.created_at DESC
       LIMIT $1`,
      [limit],
    );
    res.json({ status: 'success', data: rows });
  } catch (err) {
    next(err);
  }
};

/** GET /api/v1/admin/team — back-office members. */
export const listTeam = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, username, email, role, is_admin, created_at
       FROM users
       WHERE role = ANY($1)
       ORDER BY CASE role WHEN 'owner' THEN 0 WHEN 'admin' THEN 1 WHEN 'staff' THEN 2 ELSE 3 END, created_at`,
      [BACKOFFICE_ROLES],
    );
    res.json({ status: 'success', data: rows });
  } catch (err) {
    next(err);
  }
};

/** POST /api/v1/admin/team — create a member with a generated temp password. */
export const createMember = async (req, res, next) => {
  try {
    const username = String(req.body?.username ?? '').trim();
    const email = String(req.body?.email ?? '').trim().toLowerCase();
    const role = String(req.body?.role ?? '').trim();

    if (!username || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ status: 'error', message: 'Valid username and email required' });
    }
    if (!BACKOFFICE_ROLES.includes(role)) {
      return res.status(400).json({ status: 'error', message: 'Invalid role' });
    }

    const { rows: existing } = await pool.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email, username],
    );
    if (existing.length > 0) {
      return res.status(409).json({ status: 'error', message: 'Email or username already taken' });
    }

    const tempPassword = genPassword();
    const hash = await bcrypt.hash(tempPassword, 12);
    const { rows } = await pool.query(
      'INSERT INTO users (username, email, password_hash, is_admin, role) VALUES ($1,$2,$3,$4,$5) RETURNING id',
      [username, email, hash, isAdminRole(role) ? 1 : 0, role],
    );

    await audit(req.user?.userId, 'team.create', email, { role });
    res.status(201).json({ status: 'success', data: { id: rows[0].id, email, role, tempPassword } });

    // Email the invite (login URL + temp password). Fire-and-forget — the temp
    // password is also returned above, so member creation never fails on mail.
    sendTeamInvite({ email, username, role, tempPassword }).catch((e) =>
      console.error('[team] invite mail failed:', e.message),
    );
  } catch (err) {
    next(err);
  }
};

/** PATCH /api/v1/admin/team/:id — change a member's role. */
export const updateMemberRole = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const role = String(req.body?.role ?? '').trim();
    if (!Number.isInteger(id) || !BACKOFFICE_ROLES.includes(role)) {
      return res.status(400).json({ status: 'error', message: 'Invalid input' });
    }
    if (id === req.user?.userId) {
      return res.status(400).json({ status: 'error', message: 'You cannot change your own role' });
    }

    const { rows } = await pool.query('SELECT role FROM users WHERE id = $1', [id]);
    const current = rows[0];
    if (!current) return res.status(404).json({ status: 'error', message: 'Member not found' });

    if (current.role === 'owner' && role !== 'owner' && (await ownerCount()) <= 1) {
      return res.status(400).json({ status: 'error', message: 'Cannot demote the last owner' });
    }

    await pool.query('UPDATE users SET role = $1, is_admin = $2 WHERE id = $3', [
      role,
      isAdminRole(role) ? 1 : 0,
      id,
    ]);
    await audit(req.user?.userId, 'team.role', String(id), { from: current.role, to: role });
    res.json({ status: 'success', data: { id, role } });
  } catch (err) {
    next(err);
  }
};

/** DELETE /api/v1/admin/team/:id — revoke back-office access (role -> customer). */
export const revokeMember = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ status: 'error', message: 'Invalid id' });
    }
    if (id === req.user?.userId) {
      return res.status(400).json({ status: 'error', message: 'You cannot revoke your own access' });
    }

    const { rows } = await pool.query('SELECT role FROM users WHERE id = $1', [id]);
    const current = rows[0];
    if (!current) return res.status(404).json({ status: 'error', message: 'Member not found' });
    if (current.role === 'owner' && (await ownerCount()) <= 1) {
      return res.status(400).json({ status: 'error', message: 'Cannot revoke the last owner' });
    }

    await pool.query("UPDATE users SET role = 'customer', is_admin = 0 WHERE id = $1", [id]);
    await audit(req.user?.userId, 'team.revoke', String(id), { from: current.role });
    res.json({ status: 'success', data: { id } });
  } catch (err) {
    next(err);
  }
};
