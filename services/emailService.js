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
  const eur = (cents) => `€${(cents / 100).toFixed(2)}`;
  const itemLines = order.items
    .map((i) => `  • ${i.name}${i.size ? ` (Gr. ${i.size})` : ''} × ${i.qty}  —  ${eur(i.priceCents * i.qty)}`)
    .join('\n');

  const itemRows = order.items
    .map(
      (i) => `<tr>
        <td style="padding:8px 0;border-bottom:1px solid #eee;">${i.name}${i.size ? ` <span style="color:#888;">(Gr. ${i.size})</span>` : ''} × ${i.qty}</td>
        <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;white-space:nowrap;">${eur(i.priceCents * i.qty)}</td>
      </tr>`,
    )
    .join('');

  const html = `<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;color:#1a1a1a;">
    <h2 style="font-weight:600;">Hallo ${order.firstName},</h2>
    <p>vielen Dank für deine Bestellung! Hier ist deine Zusammenfassung:</p>
    <p style="color:#666;font-size:13px;">
      Bestellnummer: <strong>${order.orderId.slice(0, 8).toUpperCase()}</strong><br>
      Datum: ${new Date(order.createdAt ?? Date.now()).toLocaleDateString('de-DE')}
    </p>
    <table style="width:100%;border-collapse:collapse;font-size:14px;margin:16px 0;">
      ${itemRows}
      <tr>
        <td style="padding:12px 0 0;font-weight:600;">Gesamt</td>
        <td style="padding:12px 0 0;text-align:right;font-weight:600;">€${subtotal}</td>
      </tr>
    </table>
    <p style="color:#666;">Wir melden uns, sobald deine Bestellung versendet wurde.</p>
    <p style="margin-top:24px;">Viele Grüße<br>Dein Shop-Team</p>
  </div>`;

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
    // The shop owner gets a copy of every order (set ORDER_NOTIFY_EMAIL to
    // override; otherwise it defaults to the sending account).
    const notify = process.env.ORDER_NOTIFY_EMAIL || process.env.GMAIL_USER;

    await getTransporter().sendMail({
      from: `"Shop-Team" <${process.env.GMAIL_USER}>`,
      to:      order.email,
      ...(notify ? { bcc: notify } : {}),
      subject: `Bestellbestätigung #${order.orderId.slice(0, 8).toUpperCase()}`,
      text,
      html,
    });
    console.log(`[emailService] Bestätigung gesendet an ${order.email}`);
  } catch (err) {
    console.error('[emailService] E-Mail fehlgeschlagen:', err.message);
  }
}
