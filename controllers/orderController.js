import crypto from 'node:crypto';
import pool from '../config/database.js';
import { sendOrderConfirmation, sendShippingNotification } from '../services/emailService.js';
import { isStripeEnabled, createCheckoutSession } from '../services/stripeService.js';

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
    status: row.status,
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
    const subtotalCents = req.body.items.reduce((s, it) => s + it.priceCents * it.qty, 0);
    const userId = req.user?.userId ?? null;
    const supabaseUserId = req.supabaseUser?.id ?? null;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      await client.query(
        `INSERT INTO orders (id, user_id, supabase_user_id, email, first_name, last_name, address, city, zip, country, subtotal_cents, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'pending')`,
        [orderId, userId, supabaseUserId, req.body.email, req.body.firstName, req.body.lastName,
         req.body.address, req.body.city, req.body.zip, req.body.country, subtotalCents],
      );

      for (const it of req.body.items) {
        await client.query(
          `INSERT INTO order_items (order_id, slug, name, size, qty, price_cents, image)
           VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [orderId, it.slug, it.name, it.size ?? null, it.qty, it.priceCents, it.image],
        );
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
    if (isStripeEnabled()) {
      const locale = req.headers['x-norevan-locale'] === 'en' ? 'en' : 'de';
      const session = await createCheckoutSession({
        orderId, email: req.body.email, items: req.body.items, locale,
      });
      return res.status(201).json({
        status: 'success',
        data: { orderId, subtotalCents, paymentStatus: 'pending', checkoutUrl: session.url },
      });
    }

    sendOrderConfirmation({
      orderId, email: req.body.email, firstName: req.body.firstName,
      lastName: req.body.lastName,
      address: req.body.address, city: req.body.city,
      zip: req.body.zip, country: req.body.country,
      subtotalCents, items: req.body.items,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({
      status: 'success',
      data: { orderId, subtotalCents, paymentStatus: 'pending' },
    });
  } catch (err) {
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

  await pool.query("UPDATE orders SET status = 'paid' WHERE id = $1", [orderId]);

  const { rows: items } = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [orderId]);
  await sendOrderConfirmation({
    orderId,
    email: order.email,
    firstName: order.first_name,
    lastName: order.last_name,
    address: order.address,
    city: order.city,
    zip: order.zip,
    country: order.country,
    subtotalCents: order.subtotal_cents,
    items: items.map((i) => ({ name: i.name, size: i.size, qty: i.qty, priceCents: i.price_cents, image: i.image })),
    createdAt: order.created_at,
  });
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

    await pool.query('UPDATE orders SET status = $1 WHERE id = $2', [status, req.params.id]);
    res.json({ status: 'success', data: { id: req.params.id, status } });

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
        items: items.map((i) => ({ name: i.name, size: i.size, qty: i.qty, priceCents: i.price_cents, image: i.image })),
        createdAt: order.created_at,
      }).catch((e) => console.error('[orders] shipping mail failed:', e.message));
    }
  } catch (err) {
    next(err);
  }
};
