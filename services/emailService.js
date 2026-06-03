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
  const discountCents = order.discountCents ?? 0;
  const grossCents = order.subtotalCents + discountCents;
  const subtotal = eur(grossCents); // pre-discount items total
  const total = eur(order.subtotalCents); // net charged
  const discountStr = discountCents > 0 ? `−${eur(discountCents)}` : null;
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
          ${discountStr ? `<tr><td style="padding:0 0 8px;color:${BRAND.muted};">Rabatt${order.discountCode ? ` (${order.discountCode})` : ''}</td><td style="padding:0 0 8px;text-align:right;color:${BRAND.gold};">${discountStr}</td></tr>` : ''}
          <tr><td style="padding:0 0 8px;color:${BRAND.muted};">Versand</td><td style="padding:0 0 8px;text-align:right;color:${BRAND.text};">Kostenlos</td></tr>
          <tr><td style="padding:14px 0 0;border-top:2px solid ${BRAND.ink};font-size:16px;font-weight:700;color:${BRAND.text};">Gesamt</td><td style="padding:14px 0 0;border-top:2px solid ${BRAND.ink};text-align:right;font-size:16px;font-weight:700;color:${BRAND.text};">${total}</td></tr>
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
${discountStr ? `Rabatt        : ${discountStr}\n` : ''}Versand       : Kostenlos
Gesamt        : ${total}
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

  // Optional tracking block — only rendered when a tracking number is present.
  const carrierName = order.carrier ? String(order.carrier) : '';
  const tracking = order.trackingNumber ? String(order.trackingNumber) : '';
  const trackHtml = tracking
    ? `<tr><td style="padding:26px 32px 0;">
        <div style="font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:${BRAND.muted};margin-bottom:8px;">Sendungsverfolgung</div>
        <div style="font-size:13px;color:${BRAND.text};line-height:1.7;">${carrierName ? `${carrierName} · ` : ''}<strong style="font-family:'Courier New',monospace;">${tracking}</strong></div>
      </td></tr>`
    : '';
  const trackText = tracking
    ? `\nSendungsverfolgung: ${carrierName ? `${carrierName} · ` : ''}${tracking}\n`
    : '';

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

      <!-- Tracking -->
      ${trackHtml}

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
${trackText}
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

export function renderBackInStockEmail(product) {
  const logo = `${BRAND.site}/logo/norevan-shield.png`;
  const url = `${BRAND.site}/de/shop/${product.slug}`;
  const img = absUrl(product.image);
  const html = `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${BRAND.paper};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.paper};padding:28px 12px;"><tr><td align="center">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.06);">
    <tr><td style="background:${BRAND.ink};padding:32px;text-align:center;">
      <img src="${logo}" width="52" height="52" alt="Norevan" style="display:inline-block;margin-bottom:12px;" />
      <div>${wordmark(22)}</div>
      <div style="height:2px;width:44px;background:${BRAND.gold};margin:16px auto 0;border-radius:2px;"></div>
    </td></tr>
    <tr><td style="padding:34px 32px 8px;">
      <h1 style="margin:0 0 10px;font-family:Georgia,serif;font-weight:400;font-size:24px;color:${BRAND.text};">Wieder da.</h1>
      <p style="margin:0;font-size:15px;line-height:1.6;color:${BRAND.muted};"><strong style="color:${BRAND.text};">${product.name}</strong> ist wieder verfügbar — sei schnell, bevor es erneut vergriffen ist.</p>
    </td></tr>
    ${img ? `<tr><td style="padding:18px 32px 0;text-align:center;"><img src="${img}" width="220" alt="${product.name}" style="display:inline-block;max-width:220px;border-radius:10px;" /></td></tr>` : ''}
    <tr><td style="padding:24px 32px 4px;text-align:center;">
      <a href="${url}" style="display:inline-block;background:${BRAND.ink};color:#fff;text-decoration:none;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;padding:14px 30px;border-radius:999px;">Jetzt ansehen</a>
    </td></tr>
    <tr><td style="padding:30px 32px;text-align:center;">
      <div style="border-top:1px solid ${BRAND.line};padding-top:22px;font-size:11px;color:${BRAND.muted};line-height:1.7;">Norevan UG · Berlin · seit 2026<br><a href="mailto:hello@norevan.shop" style="color:${BRAND.muted};">hello@norevan.shop</a></div>
    </td></tr>
  </table>
</td></tr></table></body></html>`;
  const text = `Wieder da.\n\n${product.name} ist wieder verfügbar:\n${url}\n\nNorevan UG · Berlin`;
  return { subject: `Wieder verfügbar: ${product.name}`, html, text };
}

export async function sendBackInStock(email, product) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD || !email) return;
  const { subject, html, text } = renderBackInStockEmail(product);
  try {
    await getTransporter().sendMail({ from: `"Norevan" <${process.env.GMAIL_USER}>`, to: email, subject, text, html });
    console.log(`[emailService] Back-in-stock an ${email}`);
  } catch (err) {
    console.error('[emailService] Back-in-stock fehlgeschlagen:', err.message);
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

/** Sign-in notification — sent on each login of a real account. */
export function renderLoginEmail(email, when = new Date()) {
  const logo = `${BRAND.site}/logo/norevan-shield.png`;
  const timeStr = new Date(when).toLocaleString('de-DE', {
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  const html = `<!doctype html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting"></head>
<body style="margin:0;padding:0;background:${BRAND.paper};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">Du hast dich bei Norevan angemeldet.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.paper};padding:28px 12px;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
      <tr><td style="background:${BRAND.ink};padding:32px 32px 28px;text-align:center;">
        <img src="${logo}" width="52" height="52" alt="Norevan" style="display:inline-block;width:52px;height:52px;margin-bottom:12px;" />
        <div>${wordmark(22)}</div>
        <div style="height:2px;width:44px;background:${BRAND.gold};margin:16px auto 0;border-radius:2px;"></div>
      </td></tr>
      <tr><td style="padding:34px 32px 8px;">
        <h1 style="margin:0 0 10px;font-family:Georgia,serif;font-weight:400;font-size:24px;color:${BRAND.text};">Schön, dich zu sehen.</h1>
        <p style="margin:0;font-size:15px;line-height:1.6;color:${BRAND.muted};">Du hast dich gerade bei Norevan angemeldet — am ${timeStr} Uhr. Schau dich um, deine Auswahl wartet.</p>
      </td></tr>
      <tr><td style="padding:24px 32px 4px;text-align:center;">
        <a href="${BRAND.site}/de/shop" style="display:inline-block;background:${BRAND.ink};color:#ffffff;text-decoration:none;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;padding:14px 30px;border-radius:999px;">Zum Shop</a>
      </td></tr>
      <tr><td style="padding:22px 32px 0;">
        <p style="margin:0;font-size:12px;line-height:1.6;color:${BRAND.muted};">Warst du das nicht? Dann ignoriere diese E-Mail oder melde dich bei <a href="mailto:hello@norevan.shop" style="color:${BRAND.muted};">hello@norevan.shop</a>.</p>
      </td></tr>
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

  const text = `Schön, dich zu sehen.

Du hast dich gerade bei Norevan angemeldet — am ${timeStr} Uhr.

Zum Shop: ${BRAND.site}/de/shop

Warst du das nicht? Melde dich bei hello@norevan.shop.

Norevan UG · Berlin · seit 2026`;

  return { subject: 'Schön, dich zu sehen — Anmeldung bei Norevan', html, text };
}

export async function sendLoginNotification(email) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn('[emailService] GMAIL_USER oder GMAIL_APP_PASSWORD fehlt — Login-Mail wird nicht gesendet');
    return;
  }
  if (!email) return;
  const { subject, html, text } = renderLoginEmail(email);
  try {
    await getTransporter().sendMail({
      from: `"Norevan" <${process.env.GMAIL_USER}>`,
      to: email,
      subject,
      text,
      html,
    });
    console.log(`[emailService] Login-Mail gesendet an ${email}`);
  } catch (err) {
    console.error('[emailService] Login-Mail fehlgeschlagen:', err.message);
  }
}

const ROLE_LABEL = {
  owner: 'Owner',
  admin: 'Admin',
  staff: 'Mitarbeiter',
  viewer: 'Betrachter (nur Lesen)',
};

/**
 * Team invitation — sent when a back-office member is created. Carries the
 * login URL, username, assigned role and a one-time temporary password the
 * member should change after first sign-in.
 * @param {{ email, username, role, tempPassword }} invite
 */
export function renderTeamInviteEmail(invite) {
  const logo = `${BRAND.site}/logo/norevan-shield.png`;
  const loginUrl = `${BRAND.site}/admin/login`;
  const roleLabel = ROLE_LABEL[invite.role] ?? invite.role;

  const credRow = (label, value, mono = false) =>
    `<tr>
      <td style="padding:10px 0;border-bottom:1px solid ${BRAND.line};font-size:12px;color:${BRAND.muted};text-transform:uppercase;letter-spacing:1px;white-space:nowrap;">${label}</td>
      <td style="padding:10px 0 10px 16px;border-bottom:1px solid ${BRAND.line};font-size:14px;color:${BRAND.text};text-align:right;${mono ? "font-family:'Courier New',monospace;font-weight:600;" : ''}">${value}</td>
    </tr>`;

  const html = `<!doctype html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting"></head>
<body style="margin:0;padding:0;background:${BRAND.paper};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">Dein Zugang zum Norevan Back-Office.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.paper};padding:28px 12px;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
      <tr><td style="background:${BRAND.ink};padding:32px 32px 28px;text-align:center;">
        <img src="${logo}" width="52" height="52" alt="Norevan" style="display:inline-block;width:52px;height:52px;margin-bottom:12px;" />
        <div>${wordmark(22)}</div>
        <div style="height:2px;width:44px;background:${BRAND.gold};margin:16px auto 0;border-radius:2px;"></div>
      </td></tr>
      <tr><td style="padding:34px 32px 8px;">
        <h1 style="margin:0 0 10px;font-family:Georgia,serif;font-weight:400;font-size:24px;color:${BRAND.text};">Willkommen im Team.</h1>
        <p style="margin:0;font-size:15px;line-height:1.6;color:${BRAND.muted};">Du wurdest zum Norevan Back-Office eingeladen — als <strong style="color:${BRAND.text};">${roleLabel}</strong>. Melde dich mit den folgenden Zugangsdaten an und ändere dein Passwort danach.</p>
      </td></tr>
      <tr><td style="padding:20px 32px 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${credRow('Benutzername', invite.username)}
          ${credRow('Temporäres Passwort', invite.tempPassword, true)}
          ${credRow('Rolle', roleLabel)}
        </table>
      </td></tr>
      <tr><td style="padding:26px 32px 4px;text-align:center;">
        <a href="${loginUrl}" style="display:inline-block;background:${BRAND.ink};color:#ffffff;text-decoration:none;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;padding:14px 30px;border-radius:999px;">Zum Login</a>
      </td></tr>
      <tr><td style="padding:22px 32px 0;">
        <p style="margin:0;font-size:12px;line-height:1.6;color:${BRAND.muted};">Du erwartest diese Einladung nicht? Dann ignoriere diese E-Mail oder melde dich bei <a href="mailto:hello@norevan.shop" style="color:${BRAND.muted};">hello@norevan.shop</a>.</p>
      </td></tr>
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

  const text = `Willkommen im Team.

Du wurdest zum Norevan Back-Office eingeladen — als ${roleLabel}.

Benutzername: ${invite.username}
Temporäres Passwort: ${invite.tempPassword}
Rolle: ${roleLabel}

Zum Login: ${loginUrl}
Bitte ändere dein Passwort nach der ersten Anmeldung.

Du erwartest diese Einladung nicht? Melde dich bei hello@norevan.shop.

Norevan UG · Berlin · seit 2026`;

  return { subject: 'Dein Zugang zum Norevan Back-Office', html, text };
}

export async function sendTeamInvite(invite) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn('[emailService] GMAIL_USER oder GMAIL_APP_PASSWORD fehlt — Einladungs-Mail wird nicht gesendet');
    return;
  }
  if (!invite?.email) return;
  const { subject, html, text } = renderTeamInviteEmail(invite);
  try {
    await getTransporter().sendMail({
      from: `"Norevan" <${process.env.GMAIL_USER}>`,
      to: invite.email,
      subject,
      text,
      html,
    });
    console.log(`[emailService] Einladungs-Mail gesendet an ${invite.email}`);
  } catch (err) {
    console.error('[emailService] Einladungs-Mail fehlgeschlagen:', err.message);
  }
}
