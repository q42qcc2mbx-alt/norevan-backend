import crypto from 'node:crypto';
import pool from '../config/database.js';
import { sendOrderConfirmation, sendShippingNotification, sendAbandonedCart, sendDailySummary } from '../services/emailService.js';
import { isStripeEnabled, createCheckoutSession, getOrCreateCustomer } from '../services/stripeService.js';
import { applyDiscountInTx } from './discountController.js';

function orderRowToJson(row) {
  return {
    id: row.id,
    userId: row.user_id ?? null,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    address: row.address,
    city: row.city,
    zip: row.zip,
    country: row.country,
    subtotalCents: row.subtotal_cents,
    discountCents: row.discount_cents ?? 0,
    discountCode: row.discount_code ?? null,
    status: row.status,
    trackingNumber: row.tracking_number ?? null,
    carrier: row.carrier ?? null,
    notes: row.notes ?? null,
    createdAt: row.created_at,
  };
}

function itemRowToJson(row) {
  return {
    id: row.id,
    orderId: row.order_id,
    slug: row.slug,
    name: row.name,
    size: row.size,
    qty: row.qty,
    priceCents: row.price_cents,
    image: row.image,
  };
}

// Adjust inventory for purchased items. `sign` is -1 to reduce stock (a sale)
// or +1 to return it (a cancellation). Locks the product row FOR UPDATE so
// concurrent orders can't oversell.
//
// Per-size products (stock_by_size present + item carries a known size) have
// that size adjusted and the aggregate `stock` recomputed as the sum of sizes.
// Otherwise the single `stock` field is adjusted (legacy behaviour). Stock is
// clamped at 0 — never negative.
async function adjustStock(client, items, sign) {
  for (const it of items) {
    const { rows } = await client.query(
      'SELECT stock, stock_by_size FROM products WHERE slug = $1 FOR UPDATE',
      [it.slug],
    );
    if (rows.length === 0) continue;
    const sbs = rows[0].stock_by_size; // pg parses jsonb → object | null

    if (sbs && it.size && Object.prototype.hasOwnProperty.call(sbs, it.size)) {
      const cur = Number(sbs[it.size] ?? 0);
      const next = sign < 0 ? Math.max(cur - it.qty, 0) : cur + it.qty;
      const map = { ...sbs, [it.size]: next };
      const total = Object.values(map).reduce((s, v) => s + Number(v || 0), 0);
      await client.query(
        'UPDATE products SET stock_by_size = $1::jsonb, stock = $2, updated_at = NOW() WHERE slug = $3',
        [JSON.stringify(map), total, it.slug],
      );
    } else if (sign < 0) {
      await client.query(
        'UPDATE products SET stock = GREATEST(stock - $1, 0), updated_at = NOW() WHERE slug = $2',
        [it.qty, it.slug],
      );
    } else {
      await client.query(
        'UPDATE products SET stock = stock + $1, updated_at = NOW() WHERE slug = $2',
        [it.qty, it.slug],
      );
    }
  }
}

const decrementStock = (client, items) => adjustStock(client, items, -1);
const incrementStock = (client, items) => adjustStock(client, items, +1);

// Statuses for which stock has already been deducted.
const STOCK_REDUCED = new Set(['paid', 'shipped', 'delivered']);

function validateCheckout(body) {
  const errors = [];
  const required = ['email', 'firstName', 'lastName', 'address', 'city', 'zip', 'country'];
  for (const f of required) {
    if (!body?.[f] || typeof body[f] !== 'string') errors.push(`${f} is required`);
  }
  if (!Array.isArray(body?.items) || body.items.length === 0) {
    errors.push('items must be a non-empty array');
  } else {
    body.items.forEach((it, i) => {
      if (!it.slug || typeof it.slug !== 'string') errors.push(`items[${i}].slug is required`);
      if (!it.name || typeof it.name !== 'string') errors.push(`items[${i}].name is required`);
      if (!Number.isFinite(it.qty) || it.qty < 1) errors.push(`items[${i}].qty must be ≥ 1`);
      if (!Number.isFinite(it.priceCents) || it.priceCents < 0) errors.push(`items[${i}].priceCents must be ≥ 0`);
      if (!it.image || typeof it.image !== 'string') errors.push(`items[${i}].image is required`);
    });
  }
  return errors;
}

const ALLOWED_STATUSES = new Set(['pending', 'paid', 'shipped', 'cancelled', 'demo']);

export const createOrder = async (req, res, next) => {
  try {
    const errors = validateCheckout(req.body);
    if (errors.length) return res.status(400).json({ status: 'error', message: 'Validation failed', errors });

    const orderId = crypto.randomUUID();
    const grossCents = req.body.items.reduce((s, it) => s + it.priceCents * it.qty, 0);
    const userId = req.user?.userId ?? null;
    const supabaseUserId = req.supabaseUser?.id ?? null;

    const stripe = isStripeEnabled();
    let discountCode = null;
    let discountCents = 0;
    let netCents = grossCents;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Lock product rows and verify availability before taking the order.
      // Per-size products check the requested size; others the aggregate stock.
      for (const it of req.body.items) {
        const { rows } = await client.query(
          'SELECT name, stock, stock_by_size FROM products WHERE slug = $1 FOR UPDATE',
          [it.slug],
        );
        const row = rows[0];
        const sbs = row?.stock_by_size;
        const avail =
          sbs && it.size && Object.prototype.hasOwnProperty.call(sbs, it.size)
            ? Number(sbs[it.size] ?? 0)
            : row?.stock;
        if (avail != null && avail < it.qty) {
          const err = new Error(`Insufficient stock for ${row?.name ?? it.slug}`);
          err.code = 'OUT_OF_STOCK';
          err.item = row?.name ?? it.name;
          throw err;
        }
      }

      // Optional discount code (opt-in — absent ⇒ unchanged behaviour).
      if (req.body.discountCode) {
        const applied = await applyDiscountInTx(client, req.body.discountCode, grossCents);
        discountCode = applied.discountCode;
        discountCents = applied.discountCents;
        netCents = grossCents - discountCents;
      }

      await client.query(
        `INSERT INTO orders (id, user_id, supabase_user_id, email, first_name, last_name, address, city, zip, country, subtotal_cents, status, discount_code, discount_cents)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'pending',$12,$13)`,
        [orderId, userId, supabaseUserId, req.body.email, req.body.firstName, req.body.lastName,
         req.body.address, req.body.city, req.body.zip, req.body.country, netCents, discountCode, discountCents],
      );

      for (const it of req.body.items) {
        await client.query(
          `INSERT INTO order_items (order_id, slug, name, size, qty, price_cents, image)
           VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [orderId, it.slug, it.name, it.size ?? null, it.qty, it.priceCents, it.image],
        );
      }

      // Without Stripe the order is confirmed immediately: mark it paid and
      // reserve stock now. With Stripe both happen once payment succeeds
      // (markOrderPaidAndNotify). Leaving dev orders 'pending' would wrongly
      // trigger abandoned-cart reminders and an invoice on an unpaid order.
      if (!stripe) {
        await client.query("UPDATE orders SET status = 'paid' WHERE id = $1", [orderId]);
        await decrementStock(client, req.body.items);
      }

      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }

    // With Stripe enabled, payment runs through a hosted Checkout Session and
    // the confirmation email is sent once the webhook reports payment success.
    // Without Stripe (dev / no-payment mode) we confirm the order immediately.
    if (stripe) {
      const locale = req.headers['x-norevan-locale'] === 'en' ? 'en' : 'de';
      // Reuse (or create) the shopper's Stripe customer so their card can be
      // saved and offered on the next purchase. Best-effort: a failure here
      // just means a guest-style session (still works, no saved card).
      let customer = null;
      try {
        customer = await getOrCreateCustomer(pool, { userId: supabaseUserId, email: req.body.email });
      } catch (e) {
        console.warn('[orders] stripe customer lookup failed:', e.message);
      }
      const session = await createCheckoutSession({
        orderId, email: req.body.email, items: req.body.items, locale, discountCents, customer,
      });
      return res.status(201).json({
        status: 'success',
        data: { orderId, subtotalCents: netCents, discountCents, paymentStatus: 'pending', checkoutUrl: session.url },
      });
    }

    const invoiceNumber = await assignInvoiceNumber(pool, orderId);
    sendOrderConfirmation({
      orderId, invoiceNumber, email: req.body.email, firstName: req.body.firstName,
      lastName: req.body.lastName,
      address: req.body.address, city: req.body.city,
      zip: req.body.zip, country: req.body.country,
      subtotalCents: netCents, discountCents, items: req.body.items,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({
      status: 'success',
      data: { orderId, subtotalCents: netCents, discountCents, paymentStatus: 'pending' },
    });
  } catch (err) {
    if (err?.code === 'DISCOUNT_INVALID') {
      return res.status(400).json({ status: 'error', message: err.message, errors: ['discount_invalid'] });
    }
    if (err?.code === 'OUT_OF_STOCK') {
      return res.status(409).json({
        status: 'error',
        message: `Leider ausverkauft: ${err.item}`,
        errors: ['out_of_stock'],
      });
    }
    next(err);
  }
};

/**
 * Mark an order as paid and send the confirmation email. Idempotent: if the
 * order is already paid (e.g. a duplicate webhook delivery) it does nothing.
 * Called by the Stripe webhook on `checkout.session.completed`.
 */
export async function markOrderPaidAndNotify(orderId) {
  const { rows } = await pool.query('SELECT * FROM orders WHERE id = $1', [orderId]);
  if (rows.length === 0) {
    console.warn(`[orders] webhook for unknown order ${orderId}`);
    return;
  }
  const order = rows[0];
  if (order.status === 'paid') return; // already processed

  // Mark paid, assign the invoice number and reserve stock atomically.
  const client = await pool.connect();
  let items;
  let invoiceNumber;
  try {
    await client.query('BEGIN');
    await client.query("UPDATE orders SET status = 'paid' WHERE id = $1", [orderId]);
    invoiceNumber = await assignInvoiceNumber(client, orderId);
    ({ rows: items } = await client.query('SELECT * FROM order_items WHERE order_id = $1', [orderId]));
    await decrementStock(client, items.map((i) => ({ slug: i.slug, qty: i.qty, size: i.size })));
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }

  await sendOrderConfirmation({
    orderId,
    invoiceNumber,
    email: order.email,
    firstName: order.first_name,
    lastName: order.last_name,
    address: order.address,
    city: order.city,
    zip: order.zip,
    country: order.country,
    subtotalCents: order.subtotal_cents,
    discountCents: order.discount_cents ?? 0,
    items: items.map((i) => ({ name: i.name, size: i.size, qty: i.qty, priceCents: i.price_cents, image: i.image })),
    createdAt: order.created_at,
  });
}

/**
 * Assigns a sequential invoice number to an order if it doesn't have one yet.
 * Returns the (existing or new) number. Must run inside a transaction.
 */
async function assignInvoiceNumber(client, orderId) {
  const { rows } = await client.query(
    `UPDATE orders
       SET invoice_number = 'NOR-' || to_char(now() AT TIME ZONE 'UTC', 'YYYY')
                            || '-' || lpad(nextval('invoice_seq')::text, 5, '0')
     WHERE id = $1 AND invoice_number IS NULL
     RETURNING invoice_number`,
    [orderId],
  );
  if (rows[0]?.invoice_number) return rows[0].invoice_number;
  // Already had one (idempotent re-run) — read it back.
  const { rows: existing } = await client.query(
    'SELECT invoice_number FROM orders WHERE id = $1',
    [orderId],
  );
  return existing[0]?.invoice_number ?? null;
}

export const getOrderById = async (req, res, next) => {
  try {
    const { rows: orderRows } = await pool.query('SELECT * FROM orders WHERE id = $1', [req.params.id]);
    if (orderRows.length === 0) return res.status(404).json({ status: 'error', message: 'Order not found' });
    const { rows: itemRows } = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [req.params.id]);
    res.json({
      status: 'success',
      data: { ...orderRowToJson(orderRows[0]), items: itemRows.map(itemRowToJson) },
    });
  } catch (err) {
    next(err);
  }
};

export const listMyOrders = async (req, res, next) => {
  try {
    const { rows: orders } = await pool.query(
      'SELECT * FROM orders WHERE supabase_user_id = $1 ORDER BY created_at DESC',
      [req.supabaseUser.id],
    );
    const enriched = await Promise.all(
      orders.map(async (o) => {
        const { rows: items } = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [o.id]);
        return { ...orderRowToJson(o), items: items.map(itemRowToJson) };
      }),
    );
    res.json({ status: 'success', data: enriched });
  } catch (err) {
    next(err);
  }
};

export const listAllOrders = async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit ?? 200), 1000);
    const { rows: orders } = await pool.query(
      'SELECT * FROM orders ORDER BY created_at DESC LIMIT $1',
      [limit],
    );
    const enriched = await Promise.all(
      orders.map(async (o) => {
        const { rows: items } = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [o.id]);
        return { ...orderRowToJson(o), items: items.map(itemRowToJson) };
      }),
    );
    res.json({ status: 'success', data: enriched });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/tasks/abandoned-cart — send a one-time reminder for checkouts
 * that were created but never paid. Triggered by a scheduled job (guarded by a
 * shared secret in the route). Reminds orders still 'pending' between minHours
 * and maxDays old that haven't been reminded yet.
 */
export const runAbandonedCartReminders = async (req, res, next) => {
  try {
    const minHours = Math.min(168, Math.max(1, parseInt(req.query.minHours, 10) || 4));
    const maxDays = Math.min(30, Math.max(1, parseInt(req.query.maxDays, 10) || 7));

    const { rows: orders } = await pool.query(
      `SELECT * FROM orders
       WHERE status = 'pending'
         AND reminder_sent_at IS NULL
         AND created_at <= now() - make_interval(hours => $1)
         AND created_at >= now() - make_interval(days  => $2)
       ORDER BY created_at
       LIMIT 100`,
      [minHours, maxDays],
    );

    let sent = 0;
    for (const o of orders) {
      const { rows: items } = await pool.query(
        'SELECT * FROM order_items WHERE order_id = $1',
        [o.id],
      );
      // Mark first so a mid-loop failure can't cause a re-send next run.
      await pool.query('UPDATE orders SET reminder_sent_at = now() WHERE id = $1', [o.id]);
      await sendAbandonedCart({
        orderId: o.id,
        email: o.email,
        firstName: o.first_name,
        subtotalCents: o.subtotal_cents,
        items: items.map((i) => ({ name: i.name, size: i.size, qty: i.qty, priceCents: i.price_cents, image: i.image })),
      });
      sent += 1;
    }

    res.json({ status: 'success', data: { candidates: orders.length, sent } });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/tasks/daily-summary — email the owner today's realized revenue,
 * order count, 7-day revenue and a low-stock list. Triggered by a scheduled job
 * (guarded by the shared cron secret in the route).
 */
export const runDailySummary = async (req, res, next) => {
  try {
    const { rows: today } = await pool.query(
      `SELECT COALESCE(SUM(subtotal_cents),0)::int AS cents, COUNT(*)::int AS n
       FROM orders WHERE status IN ('paid','shipped','delivered')
         AND created_at >= date_trunc('day', now())`,
    );
    const { rows: week } = await pool.query(
      `SELECT COALESCE(SUM(subtotal_cents),0)::int AS cents FROM orders
       WHERE status IN ('paid','shipped','delivered')
         AND created_at >= now() - interval '7 days'`,
    );
    const { rows: low } = await pool.query(
      `SELECT name, stock FROM products WHERE stock <= 5 ORDER BY stock ASC, name LIMIT 30`,
    );

    await sendDailySummary({
      revenueCents: today[0].cents,
      orderCount: today[0].n,
      weekRevenueCents: week[0].cents,
      lowStock: low.map((r) => ({ name: r.name, stock: r.stock })),
    });

    res.json({
      status: 'success',
      data: { revenueCents: today[0].cents, orders: today[0].n, lowStockItems: low.length },
    });
  } catch (err) {
    next(err);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const status = String(req.body?.status ?? '');
    if (!ALLOWED_STATUSES.has(status)) {
      return res.status(400).json({ status: 'error', message: 'Invalid status' });
    }

    // Read the current row so we can tell when status actually *changes* to
    // shipped (and avoid re-sending the email on repeat saves).
    const { rows } = await pool.query('SELECT * FROM orders WHERE id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ status: 'error', message: 'Order not found' });
    const order = rows[0];

    // Optional fulfilment fields. A field is only touched when the key is
    // present in the body (a string), so partial saves don't wipe data; an
    // empty string clears it.
    const trim = (v, n) => {
      const s = String(v).trim();
      return s ? s.slice(0, n) : null;
    };
    const trackingNumber = typeof req.body?.trackingNumber === 'string'
      ? trim(req.body.trackingNumber, 128) : (order.tracking_number ?? null);
    const carrier = typeof req.body?.carrier === 'string'
      ? trim(req.body.carrier, 64) : (order.carrier ?? null);
    const notes = typeof req.body?.notes === 'string'
      ? trim(req.body.notes, 2000) : (order.notes ?? null);

    await pool.query(
      'UPDATE orders SET status = $1, tracking_number = $2, carrier = $3, notes = $4 WHERE id = $5',
      [status, trackingNumber, carrier, notes, req.params.id],
    );

    // Cancelling an order whose stock was already deducted → return it.
    if (status === 'cancelled' && STOCK_REDUCED.has(order.status)) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const { rows: items } = await client.query(
          'SELECT slug, qty, size FROM order_items WHERE order_id = $1',
          [order.id],
        );
        await incrementStock(client, items);
        await client.query('COMMIT');
      } catch (e) {
        await client.query('ROLLBACK');
        console.error('[orders] restock on cancel failed:', e.message);
      } finally {
        client.release();
      }
    }

    res.json({ status: 'success', data: { id: req.params.id, status, trackingNumber, carrier, notes } });

    if (status === 'shipped' && order.status !== 'shipped') {
      const { rows: items } = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [order.id]);
      // Fire-and-forget — never block or fail the response on email issues.
      sendShippingNotification({
        orderId: order.id,
        email: order.email,
        firstName: order.first_name,
        lastName: order.last_name,
        address: order.address,
        city: order.city,
        zip: order.zip,
        country: order.country,
        trackingNumber,
        carrier,
        items: items.map((i) => ({ name: i.name, size: i.size, qty: i.qty, priceCents: i.price_cents, image: i.image })),
        createdAt: order.created_at,
      }).catch((e) => console.error('[orders] shipping mail failed:', e.message));
    }
  } catch (err) {
    next(err);
  }
};
