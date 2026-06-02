import nodemailer from 'nodemailer';

let _transporter = null;

// SMTP transport. Defaults to Gmail (smtp.gmail.com); set SMTP_HOST to override
// (e.g. smtp.mail.me.com for iCloud). Uses GMAIL_USER / GMAIL_APP_PASSWORD.
function getTransporter() {
  if (_transporter) return _transporter;
  _transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
  return _transporter;
}

const BRAND = {
  name: 'Norevan',
  gold: '#c8a96a',
  ink: '#0c0a14',
  paper: '#f4f4f5',
  text: '#1a1a1a',
  muted: '#8a8a93',
  line: '#e8e8ec',
  site: (process.env.FRONTEND_URL || 'https://frontend-three-nu-92.vercel.app').replace(/\/$/, ''),
};

const eur = (cents) => `€${(cents / 100).toFixed(2).replace('.', ',')}`;

function wordmark(size = 22) {
  return `<span style="font-family:Georgia,'Times New Roman',serif;font-size:${size}px;letter-spacing:${Math.round(size * 0.18)}px;color:#ffffff;font-weight:400;">NOR<span style="color:${BRAND.gold};">E</span>VAN</span>`;
}

function absUrl(src) {
  if (!src) return '';
  return /^https?:\/\//i.test(src) ? src : `${BRAND.site}${src.startsWith('/') ? '' : '/'}${src}`;
}

function itemRowHtml(i) {
  const src = absUrl(i.image);
  const img = src
    ? `<img src="${src}" width="56" height="72" alt="" style="display:block;width:56px;height:72px;object-fit:cover;border-radius:6px;background:#f0f0f2;" />`
    : `<div style="width:56px;height:72px;border-radius:6px;background:#f0f0f2;"></div>`;
  const size = i.size ? `<span style="color:${BRAND.muted};font-size:12px;"> · Gr. ${i.size}</span>` : '';
  return `<tr>
    <td style="padding:14px 0;border-bottom:1px solid ${BRAND.line};vertical-align:top;width:56px;">${img}</td>
    <td style="padding:14px 12px;border-bottom:1px solid ${BRAND.line};vertical-align:top;">
      <div style="font-size:14px;font-weight:600;color:${BRAND.text};line-height:1.3;">${i.name}${size}</div>
      <div style="font-size:12px;color:${BRAND.muted};margin-top:3px;">Menge: ${i.qty}</div>
    </td>
    <td style="padding:14px 0;border-bottom:1px solid ${BRAND.line};vertical-align:top;text-align:right;white-space:nowrap;font-size:14px;font-weight:600;color:${BRAND.text};">${eur(i.priceCents * i.qty)}</td>
  </tr>`;
}

/**
 * @param {{ orderId, email, firstName, lastName, address, city, zip, country, items, subtotalCents, createdAt }} order
 */
export function renderOrderEmail(order) {
  const orderNo = order.orderId.slice(0, 8).toUpperCase();
  const dateStr = new Date(order.createdAt ?? Date.now()).toLocaleDateString('de-DE', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
  const subtotal = eur(order.subtotalCents);
  const logo = `${BRAND.site}/logo/norevan-shield.png`;

  const itemsHtml = order.items.map(itemRowHtml).join('');
  const itemsText = order.items
    .map((i) => `  • ${i.name}${i.size ? ` (Gr. ${i.size})` : ''} × ${i.qty}  —  ${eur(i.priceCents * i.qty)}`)
    .join('\n');

  const addrLines = [
    `${order.firstName ?? ''} ${order.lastName ?? ''}`.trim(),
    order.address,
    [order.zip, order.city].filter(Boolean).join(' '),
    order.country,
  ].filter(Boolean);
  const addrHtml = addrLines
    .map((l) => `<div style="font-size:13px;color:${BRAND.text};line-height:1.6;">${l}</div>`)
    .join('');

  const html = `<!doctype html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting"></head>
<body style="margin:0;padding:0;background:${BRAND.paper};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">Deine Bestellung ${orderNo} ist bestätigt — vielen Dank!</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.paper};padding:28px 12px;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.06);">

      <!-- Header -->
      <tr><td style="background:${BRAND.ink};padding:32px 32px 28px;text-align:center;">
        <img src="${logo}" width="52" height="52" alt="Norevan" style="display:inline-block;width:52px;height:52px;margin-bottom:12px;" />
        <div>${wordmark(22)}</div>
        <div style="height:2px;width:44px;background:${BRAND.gold};margin:16px auto 0;border-radius:2px;"></div>
      </td></tr>

      <!-- Greeting -->
      <tr><td style="padding:34px 32px 8px;">
        <h1 style="margin:0 0 10px;font-family:Georgia,serif;font-weight:400;font-size:24px;color:${BRAND.text};">Vielen Dank, ${order.firstName ?? ''}.</h1>
        <p style="margin:0;font-size:15px;line-height:1.6;color:${BRAND.muted};">Deine Bestellung ist bei uns eingegangen. Hier ist deine Rechnung — wir melden uns, sobald sie unterwegs ist.</p>
      </td></tr>

      <!-- Invoice meta -->
      <tr><td style="padding:24px 32px 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.paper};border-radius:12px;">
          <tr>
            <td style="padding:16px 18px;">
              <div style="font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:${BRAND.muted};">Rechnung</div>
              <div style="font-size:15px;font-weight:700;color:${BRAND.text};margin-top:3px;">#${orderNo}</div>
            </td>
            <td style="padding:16px 18px;text-align:right;">
              <div style="font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:${BRAND.muted};">Datum</div>
              <div style="font-size:14px;font-weight:600;color:${BRAND.text};margin-top:3px;">${dateStr}</div>
            </td>
          </tr>
        </table>
      </td></tr>

      <!-- Items -->
      <tr><td style="padding:8px 32px 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${itemsHtml}</table>
      </td></tr>

      <!-- Totals -->
      <tr><td style="padding:6px 32px 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
          <tr><td style="padding:8px 0;color:${BRAND.muted};">Zwischensumme</td><td style="padding:8px 0;text-align:right;color:${BRAND.text};">${subtotal}</td></tr>
          <tr><td style="padding:0 0 8px;color:${BRAND.muted};">Versand</td><td style="padding:0 0 8px;text-align:right;color:${BRAND.text};">Kostenlos</td></tr>
          <tr><td style="padding:14px 0 0;border-top:2px solid ${BRAND.ink};font-size:16px;font-weight:700;color:${BRAND.text};">Gesamt</td><td style="padding:14px 0 0;border-top:2px solid ${BRAND.ink};text-align:right;font-size:16px;font-weight:700;color:${BRAND.text};">${subtotal}</td></tr>
        </table>
        <div style="font-size:11px;color:${BRAND.muted};margin-top:8px;">Alle Preise inkl. gesetzl. MwSt. · Versand kostenlos</div>
      </td></tr>

      <!-- Address -->
      <tr><td style="padding:26px 32px 0;">
        <div style="font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:${BRAND.muted};margin-bottom:8px;">Lieferadresse</div>
        ${addrHtml}
      </td></tr>

      <!-- CTA -->
      <tr><td style="padding:28px 32px 4px;text-align:center;">
        <a href="${BRAND.site}/de/shop" style="display:inline-block;background:${BRAND.ink};color:#ffffff;text-decoration:none;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;padding:14px 30px;border-radius:999px;">Weiter shoppen</a>
      </td></tr>

      <!-- Footer -->
      <tr><td style="padding:30px 32px;text-align:center;">
        <div style="border-top:1px solid ${BRAND.line};padding-top:22px;">
          <div style="margin-bottom:8px;">${wordmark(16).replace(/#ffffff/g, BRAND.text)}</div>
          <div style="font-size:11px;color:${BRAND.muted};line-height:1.7;">
            Norevan UG · Berlin · seit 2026<br>
            <a href="mailto:hello@norevan.shop" style="color:${BRAND.muted};">hello@norevan.shop</a>
          </div>
        </div>
      </td></tr>

    </table>
  </td></tr>
</table>
</body></html>`;

  const text = `Vielen Dank, ${order.firstName ?? ''}.

Deine Bestellung ist eingegangen. Hier ist deine Rechnung:

Rechnung   : #${orderNo}
Datum      : ${dateStr}

──────────────────────────────────────
${itemsText}
──────────────────────────────────────
Zwischensumme : ${subtotal}
Versand       : Kostenlos
Gesamt        : ${subtotal}
(Alle Preise inkl. gesetzl. MwSt.)

Lieferadresse:
${addrLines.join('\n')}

Wir melden uns, sobald deine Bestellung unterwegs ist.

Norevan UG · Berlin · seit 2026 · hello@norevan.shop`;

  return { subject: `Deine Norevan-Bestellung #${orderNo}`, html, text };
}

/**
 * Shipping notification — sent when an order's status flips to "shipped".
 * @param {{ orderId, email, firstName, lastName, address, city, zip, country, items, createdAt }} order
 */
export function renderShippingEmail(order) {
  const orderNo = order.orderId.slice(0, 8).toUpperCase();
  const logo = `${BRAND.site}/logo/norevan-shield.png`;

  const itemsHtml = (order.items ?? []).map(itemRowHtml).join('');
  const itemsText = (order.items ?? [])
    .map((i) => `  • ${i.name}${i.size ? ` (Gr. ${i.size})` : ''} × ${i.qty}`)
    .join('\n');

  const addrLines = [
    `${order.firstName ?? ''} ${order.lastName ?? ''}`.trim(),
    order.address,
    [order.zip, order.city].filter(Boolean).join(' '),
    order.country,
  ].filter(Boolean);
  const addrHtml = addrLines
    .map((l) => `<div style="font-size:13px;color:${BRAND.text};line-height:1.6;">${l}</div>`)
    .join('');

  const html = `<!doctype html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting"></head>
<body style="margin:0;padding:0;background:${BRAND.paper};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">Deine Bestellung ${orderNo} ist unterwegs.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.paper};padding:28px 12px;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.06);">

      <!-- Header -->
      <tr><td style="background:${BRAND.ink};padding:32px 32px 28px;text-align:center;">
        <img src="${logo}" width="52" height="52" alt="Norevan" style="display:inline-block;width:52px;height:52px;margin-bottom:12px;" />
        <div>${wordmark(22)}</div>
        <div style="height:2px;width:44px;background:${BRAND.gold};margin:16px auto 0;border-radius:2px;"></div>
      </td></tr>

      <!-- Greeting -->
      <tr><td style="padding:34px 32px 8px;">
        <h1 style="margin:0 0 10px;font-family:Georgia,serif;font-weight:400;font-size:24px;color:${BRAND.text};">Unterwegs zu dir, ${order.firstName ?? ''}.</h1>
        <p style="margin:0;font-size:15px;line-height:1.6;color:${BRAND.muted};">Deine Bestellung <strong style="color:${BRAND.text};">#${orderNo}</strong> wurde verpackt und ist jetzt auf dem Weg. Bald hältst du sie in den Händen.</p>
      </td></tr>

      <!-- Items -->
      <tr><td style="padding:18px 32px 0;">
        <div style="font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:${BRAND.muted};margin-bottom:4px;">Im Paket</div>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${itemsHtml}</table>
      </td></tr>

      <!-- Address -->
      <tr><td style="padding:26px 32px 0;">
        <div style="font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:${BRAND.muted};margin-bottom:8px;">Lieferadresse</div>
        ${addrHtml}
      </td></tr>

      <!-- CTA -->
      <tr><td style="padding:28px 32px 4px;text-align:center;">
        <a href="${BRAND.site}/de/account" style="display:inline-block;background:${BRAND.ink};color:#ffffff;text-decoration:none;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;padding:14px 30px;border-radius:999px;">Bestellung ansehen</a>
      </td></tr>

      <!-- Footer -->
      <tr><td style="padding:30px 32px;text-align:center;">
        <div style="border-top:1px solid ${BRAND.line};padding-top:22px;">
          <div style="margin-bottom:8px;">${wordmark(16).replace(/#ffffff/g, BRAND.text)}</div>
          <div style="font-size:11px;color:${BRAND.muted};line-height:1.7;">
            Norevan UG · Berlin · seit 2026<br>
            <a href="mailto:hello@norevan.shop" style="color:${BRAND.muted};">hello@norevan.shop</a>
          </div>
        </div>
      </td></tr>

    </table>
  </td></tr>
</table>
</body></html>`;

  const text = `Unterwegs zu dir, ${order.firstName ?? ''}.

Deine Bestellung #${orderNo} wurde verpackt und ist jetzt auf dem Weg.

Im Paket:
${itemsText}

Lieferadresse:
${addrLines.join('\n')}

Norevan UG · Berlin · seit 2026 · hello@norevan.shop`;

  return { subject: `Deine Norevan-Bestellung #${orderNo} ist unterwegs`, html, text };
}

export async function sendShippingNotification(order) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn('[emailService] GMAIL_USER oder GMAIL_APP_PASSWORD fehlt — Versand-Mail wird nicht gesendet');
    return;
  }
  const { subject, html, text } = renderShippingEmail(order);
  try {
    await getTransporter().sendMail({
      from: `"Norevan" <${process.env.GMAIL_USER}>`,
      to: order.email,
      subject,
      text,
      html,
    });
    console.log(`[emailService] Versand-Mail gesendet an ${order.email}`);
  } catch (err) {
    console.error('[emailService] Versand-Mail fehlgeschlagen:', err.message);
  }
}

export async function sendOrderConfirmation(order) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn('[emailService] GMAIL_USER oder GMAIL_APP_PASSWORD fehlt — E-Mail wird nicht gesendet');
    return;
  }

  const { subject, html, text } = renderOrderEmail(order);

  try {
    const notify = process.env.ORDER_NOTIFY_EMAIL || process.env.GMAIL_USER;
    await getTransporter().sendMail({
      from: `"Norevan" <${process.env.GMAIL_USER}>`,
      to: order.email,
      ...(notify ? { bcc: notify } : {}),
      subject,
      text,
      html,
    });
    console.log(`[emailService] Bestätigung gesendet an ${order.email}`);
  } catch (err) {
    console.error('[emailService] E-Mail fehlgeschlagen:', err.message);
  }
}
