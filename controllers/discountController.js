import pool from '../config/database.js';

export function computeDiscountCents(row, grossCents) {
  const raw =
    row.type === 'percent'
      ? Math.round((grossCents * row.value) / 100)
      : row.value;
  return Math.max(0, Math.min(raw, grossCents)); // never exceed the order
}

// Returns an error message (string) if the code can't be used, else null.
export function discountError(row, grossCents) {
  if (!row) return 'Code ungültig';
  if (!row.active) return 'Code ist nicht aktiv';
  if (row.expires_at && new Date(row.expires_at) < new Date()) return 'Code ist abgelaufen';
  if (row.max_uses != null && row.used_count >= row.max_uses) return 'Code ist aufgebraucht';
  if (grossCents < row.min_subtotal_cents) {
    return `Mindestbestellwert ${(row.min_subtotal_cents / 100).toFixed(2)} €`;
  }
  return null;
}

/**
 * Validate + reserve a code inside a transaction (row locked). Increments
 * used_count. Throws an Error with code 'DISCOUNT_INVALID' if unusable.
 * @returns {{ discountCode: string, discountCents: number }}
 */
export async function applyDiscountInTx(client, rawCode, grossCents) {
  const code = String(rawCode).trim().toUpperCase();
  const { rows } = await client.query(
    'SELECT * FROM discount_codes WHERE code = $1 FOR UPDATE',
    [code],
  );
  const row = rows[0];
  const err = discountError(row, grossCents);
  if (err) {
    const e = new Error(err);
    e.code = 'DISCOUNT_INVALID';
    throw e;
  }
  const discountCents = computeDiscountCents(row, grossCents);
  await client.query(
    'UPDATE discount_codes SET used_count = used_count + 1 WHERE code = $1',
    [code],
  );
  return { discountCode: code, discountCents };
}

/** POST /api/v1/discount/validate — public preview (no reservation). */
export const validateDiscount = async (req, res, next) => {
  try {
    const code = String(req.body?.code ?? '').trim().toUpperCase();
    const gross = Math.max(0, parseInt(req.body?.subtotalCents, 10) || 0);
    if (!code) return res.json({ status: 'success', data: { valid: false, message: 'Kein Code' } });

    const { rows } = await pool.query('SELECT * FROM discount_codes WHERE code = $1', [code]);
    const row = rows[0];
    const err = discountError(row, gross);
    if (err) return res.json({ status: 'success', data: { valid: false, message: err } });

    res.json({
      status: 'success',
      data: { valid: true, code, type: row.type, value: row.value, discountCents: computeDiscountCents(row, gross) },
    });
  } catch (e) {
    next(e);
  }
};

/** GET /api/v1/admin/discounts — admin list. */
export const listDiscounts = async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM discount_codes ORDER BY created_at DESC');
    res.json({ status: 'success', data: rows });
  } catch (e) {
    next(e);
  }
};

/** POST /api/v1/admin/discounts — create/update a code. */
export const createDiscount = async (req, res, next) => {
  try {
    const code = String(req.body?.code ?? '').trim().toUpperCase();
    const type = String(req.body?.type ?? '');
    const value = parseInt(req.body?.value, 10);
    const minSubtotalCents = Math.max(0, parseInt(req.body?.minSubtotalCents, 10) || 0);
    const maxUses = req.body?.maxUses != null && req.body.maxUses !== '' ? parseInt(req.body.maxUses, 10) : null;
    const expiresAt = req.body?.expiresAt ? new Date(req.body.expiresAt) : null;

    if (!/^[A-Z0-9_-]{2,40}$/.test(code)) {
      return res.status(400).json({ status: 'error', message: 'Code: 2–40 Zeichen (A–Z, 0–9, _-)' });
    }
    if (!['percent', 'fixed'].includes(type) || !Number.isInteger(value) || value <= 0) {
      return res.status(400).json({ status: 'error', message: 'Typ/Wert ungültig' });
    }
    if (type === 'percent' && value > 100) {
      return res.status(400).json({ status: 'error', message: 'Prozentwert max. 100' });
    }

    const { rows } = await pool.query(
      `INSERT INTO discount_codes (code, type, value, min_subtotal_cents, max_uses, expires_at)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (code) DO UPDATE SET
         type=$2, value=$3, min_subtotal_cents=$4, max_uses=$5, expires_at=$6, active=true
       RETURNING *`,
      [code, type, value, minSubtotalCents, maxUses, expiresAt],
    );
    res.status(201).json({ status: 'success', data: rows[0] });
  } catch (e) {
    next(e);
  }
};

/** PATCH /api/v1/admin/discounts/:code — toggle active. */
export const toggleDiscount = async (req, res, next) => {
  try {
    const code = String(req.params.code).trim().toUpperCase();
    const active = Boolean(req.body?.active);
    const { rowCount } = await pool.query(
      'UPDATE discount_codes SET active = $1 WHERE code = $2',
      [active, code],
    );
    if (rowCount === 0) return res.status(404).json({ status: 'error', message: 'Code nicht gefunden' });
    res.json({ status: 'success', data: { code, active } });
  } catch (e) {
    next(e);
  }
};
