import { sendLoginNotification, sendWelcome } from '../services/emailService.js';
import pool from '../config/database.js';

// Guard against duplicate sends for the same login (e.g. the client and the
// OAuth callback both firing). In-memory is fine: at worst a restart allows one
// extra mail. Cooldown window per email.
const COOLDOWN_MS = 2 * 60 * 1000;
const lastSent = new Map();

/**
 * POST /api/v1/account/login-notify — sends a sign-in email to the currently
 * authenticated (real, non-anonymous) Supabase user. Gated by requireRealUser.
 * Fire-and-forget from the client; always resolves 204.
 */
export const notifyLogin = async (req, res) => {
  const email = req.supabaseUser?.email;
  try {
    if (email) {
      const now = Date.now();
      const prev = lastSent.get(email) ?? 0;
      if (now - prev > COOLDOWN_MS) {
        lastSent.set(email, now);
        // Opportunistic cleanup so the map can't grow unbounded.
        if (lastSent.size > 5000) {
          for (const [k, t] of lastSent) if (now - t > COOLDOWN_MS) lastSent.delete(k);
        }
        // Fire-and-forget: the long-running server finishes the send in the
        // background so the response (and any redirect) isn't blocked on SMTP.
        sendLoginNotification(email).catch((e) =>
          console.warn('[account] login mail failed:', e.message),
        );
      }
    }
  } catch (err) {
    console.warn('[account] login notify failed:', err.message);
  }
  return res.status(204).end();
};

/**
 * POST /api/v1/account/welcome — sends the welcome email exactly once per
 * customer. Idempotent: the profiles.welcomed_at marker is set atomically, so
 * concurrent or repeated calls send at most one mail. Always resolves 204.
 */
export const welcome = async (req, res) => {
  const user = req.supabaseUser;
  try {
    if (user?.id) {
      // Claim the "welcomed" slot atomically; only the call that flips
      // welcomed_at from NULL gets a row back and sends the mail.
      const { rows } = await pool.query(
        'UPDATE profiles SET welcomed_at = now() WHERE id = $1 AND welcomed_at IS NULL RETURNING first_name',
        [user.id],
      );
      if (rows.length > 0 && user.email) {
        sendWelcome({ email: user.email, firstName: rows[0].first_name }).catch((e) =>
          console.warn('[account] welcome mail failed:', e.message),
        );
      }
    }
  } catch (err) {
    console.warn('[account] welcome failed:', err.message);
  }
  return res.status(204).end();
};
