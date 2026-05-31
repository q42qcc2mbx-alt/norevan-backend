import { constructWebhookEvent } from '../services/stripeService.js';
import { markOrderPaidAndNotify } from './orderController.js';

/**
 * Stripe webhook endpoint. Mounted with a raw body parser so the signature can
 * be verified. On `checkout.session.completed` it marks the order paid and
 * triggers the confirmation email.
 */
export const handleStripeWebhook = async (req, res) => {
  const signature = req.headers['stripe-signature'];
  let event;
  try {
    event = constructWebhookEvent(req.body, signature);
  } catch (err) {
    console.error('[stripe] webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const orderId = session.metadata?.orderId;
      if (orderId && session.payment_status === 'paid') {
        await markOrderPaidAndNotify(orderId);
      }
    }
  } catch (err) {
    console.error('[stripe] webhook handler error:', err.message);
    return res.status(500).json({ received: false });
  }

  // Acknowledge receipt so Stripe stops retrying.
  res.json({ received: true });
};
