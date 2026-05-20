import nodemailer from 'nodemailer';

let _transporter = null;

function getTransporter() {
  if (_transporter) return _transporter;
  _transporter = nodemailer.createTransport({
    host: 'smtp.mail.me.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
  return _transporter;
}

/**
 * @param {{ orderId, email, firstName, lastName, items, subtotalCents, createdAt }} order
 */
export async function sendOrderConfirmation(order) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn('[emailService] GMAIL_USER oder GMAIL_APP_PASSWORD fehlt — E-Mail wird nicht gesendet');
    return;
  }

  const subtotal = (order.subtotalCents / 100).toFixed(2);
  const itemLines = order.items
    .map((i) => `  • ${i.name}${i.size ? ` (Gr. ${i.size})` : ''} × ${i.qty}  —  €${(i.priceCents / 100).toFixed(2)}`)
    .join('\n');

  const text = `Hallo ${order.firstName},

vielen Dank für deine Bestellung! Hier ist deine Zusammenfassung:

Bestellnummer : ${order.orderId}
Datum         : ${new Date(order.createdAt ?? Date.now()).toLocaleDateString('de-DE')}

──────────────────────────────────────
${itemLines}
──────────────────────────────────────
Gesamt: €${subtotal}

Wir melden uns, sobald deine Bestellung versendet wurde.

Viele Grüße
Dein Shop-Team`;

  try {
    await getTransporter().sendMail({
      from: `"Shop-Team" <${process.env.GMAIL_USER}>`,
      to:      order.email,
      subject: `Bestellbestätigung #${order.orderId.slice(0, 8).toUpperCase()}`,
      text,
    });
    console.log(`[emailService] Bestätigung gesendet an ${order.email}`);
  } catch (err) {
    console.error('[emailService] E-Mail fehlgeschlagen:', err.message);
  }
}
