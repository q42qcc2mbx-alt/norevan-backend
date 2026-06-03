import Stripe from 'stripe';

let _stripe = null;

/**
 * Returns a lazily-initialised Stripe client, or null when no secret key is
 * configured. Keeping it lazy lets the app run in "no-payment" dev mode
 * (order is created as pending and confirmed immediately) without Stripe keys.
 */
export function getStripe() {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  _stripe = new Stripe(key);
  return _stripe;
}

export function isStripeEnabled() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

/**
 * Create a hosted Stripe Checkout Session for an order.
 *
 * @param {{ orderId, email, items, locale }} order
 * @returns {Promise<import('stripe').Stripe.Checkout.Session>}
 */
export async function createCheckoutSession({ orderId, email, items, locale = 'de', discountCents = 0, customer = null }) {
  const stripe = getStripe();
  if (!stripe) throw new Error('Stripe is not configured');

  const frontendUrl = (process.env.FRONTEND_URL ?? 'http://localhost:3000').replace(/\/$/, '');

  const lineItems = items.map((it) => {
    const image = typeof it.image === 'string' && /^https?:\/\//.test(it.image) ? [it.image] : undefined;
    return {
      quantity: it.qty,
      price_data: {
        currency: 'eur',
        unit_amount: it.priceCents,
        product_data: {
          name: it.size ? `${it.name} (Gr. ${it.size})` : it.name,
          ...(image ? { images: image } : {}),
          metadata: { slug: it.slug },
        },
      },
    };
  });

  // Apply a discount as a one-off amount_off coupon (in cents).
  let discounts;
  if (discountCents > 0) {
    const coupon = await stripe.coupons.create({
      amount_off: discountCents,
      currency: 'eur',
      duration: 'once',
      name: 'Rabatt',
    });
    discounts = [{ coupon: coupon.id }];
  }

  // With a known customer, attach the session to them and save the card for
  // next time (off_session) → returning buyers see their saved card on the
  // hosted page. Guests fall back to just pre-filling the email.
  const customerFields = customer
    ? { customer, payment_intent_data: { metadata: { orderId }, setup_future_usage: 'off_session' } }
    : { customer_email: email, payment_intent_data: { metadata: { orderId } } };

  return stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: lineItems,
    ...customerFields,
    ...(discounts ? { discounts } : {}),
    locale: locale === 'en' ? 'en' : 'de',
    metadata: { orderId },
    success_url: `${frontendUrl}/${locale}/checkout/success?orderId=${orderId}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${frontendUrl}/${locale}/checkout?canceled=1`,
  });
}

/**
 * Get-or-create the Stripe Customer for a logged-in shopper and persist its id
 * on their profile. Returns the customer id, or null if Stripe/userId missing.
 * @param {import('pg').Pool} pool
 */
export async function getOrCreateCustomer(pool, { userId, email }) {
  const stripe = getStripe();
  if (!stripe || !userId) return null;

  const { rows } = await pool.query(
    'SELECT stripe_customer_id FROM profiles WHERE id = $1',
    [userId],
  );
  const existing = rows[0]?.stripe_customer_id;
  if (existing) return existing;

  const created = await stripe.customers.create({
    ...(email ? { email } : {}),
    metadata: { supabaseUserId: userId },
  });
  await pool.query(
    'UPDATE profiles SET stripe_customer_id = $1 WHERE id = $2',
    [created.id, userId],
  );
  return created.id;
}

/**
 * Verify and parse a Stripe webhook event from the raw request body.
 * @param {Buffer} rawBody
 * @param {string} signature  value of the `stripe-signature` header
 */
export function constructWebhookEvent(rawBody, signature) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) throw new Error('Stripe webhook is not configured');
  return stripe.webhooks.constructEvent(rawBody, signature, secret);
}
