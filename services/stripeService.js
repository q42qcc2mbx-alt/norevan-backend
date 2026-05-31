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
export async function createCheckoutSession({ orderId, email, items, locale = 'de' }) {
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

  return stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: email,
    line_items: lineItems,
    locale: locale === 'en' ? 'en' : 'de',
    metadata: { orderId },
    payment_intent_data: { metadata: { orderId } },
    success_url: `${frontendUrl}/${locale}/checkout/success?orderId=${orderId}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${frontendUrl}/${locale}/checkout?canceled=1`,
  });
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
