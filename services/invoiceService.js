import PDFDocument from 'pdfkit';

// Seller details for the invoice (§14 UStG). Override via env where it differs.
const SELLER = {
  name: process.env.INVOICE_SELLER_NAME ?? 'Norevan UG (haftungsbeschränkt)',
  address: process.env.INVOICE_SELLER_ADDRESS ?? 'Musterstraße 1, 10115 Berlin',
  email: process.env.INVOICE_SELLER_EMAIL ?? 'hello@norevan.shop',
  vatId: process.env.INVOICE_SELLER_VAT_ID ?? 'DE000000000',
};

const VAT_RATE = 0.19; // 19 % German VAT, included in gross prices.
const INK = '#0c0a14';
const GOLD = '#c8a96a';
const MUTED = '#8a8a93';

const eur = (cents) => `${(cents / 100).toFixed(2).replace('.', ',')} €`;

/**
 * Render an A4 PDF invoice and resolve with a Buffer.
 * @param {{ orderId, invoiceNumber, firstName, lastName, address, city, zip,
 *   country, items, subtotalCents, discountCents, createdAt }} order
 * @returns {Promise<Buffer>}
 */
export function generateInvoicePdf(order) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const discountCents = order.discountCents ?? 0;
    const totalCents = order.subtotalCents; // gross, charged
    const grossBeforeDiscount = totalCents + discountCents;
    const vatCents = Math.round(totalCents - totalCents / (1 + VAT_RATE));
    const netCents = totalCents - vatCents;
    const date = new Date(order.createdAt ?? Date.now()).toLocaleDateString('de-DE', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });
    const left = doc.page.margins.left;
    const right = doc.page.width - doc.page.margins.right;

    // ── Header ────────────────────────────────────────────────────────────
    doc.font('Helvetica-Bold').fontSize(22).fillColor(INK).text('NOREVAN', left, 50);
    doc.font('Helvetica').fontSize(9).fillColor(MUTED)
      .text('Premium Streetwear · Berlin', left, 76);
    doc.font('Helvetica-Bold').fontSize(18).fillColor(INK)
      .text('RECHNUNG', 0, 52, { align: 'right' });
    doc.moveTo(left, 100).lineTo(right, 100).strokeColor(GOLD).lineWidth(2).stroke();

    // ── Seller / meta ─────────────────────────────────────────────────────
    doc.font('Helvetica').fontSize(9).fillColor(MUTED);
    doc.text(SELLER.name, left, 116);
    doc.text(SELLER.address);
    doc.text(SELLER.email);
    doc.text(`USt-IdNr.: ${SELLER.vatId}`);

    const metaX = 330;
    doc.fillColor(INK).font('Helvetica-Bold').text('Rechnungsnummer', metaX, 116, { continued: true })
      .font('Helvetica').fillColor(MUTED).text(`   ${order.invoiceNumber ?? '—'}`);
    doc.fillColor(INK).font('Helvetica-Bold').text('Rechnungsdatum', metaX, 132, { continued: true })
      .font('Helvetica').fillColor(MUTED).text(`   ${date}`);
    doc.fillColor(INK).font('Helvetica-Bold').text('Bestell-Nr.', metaX, 148, { continued: true })
      .font('Helvetica').fillColor(MUTED).text(`   ${order.orderId.slice(0, 8).toUpperCase()}`);

    // ── Bill to ───────────────────────────────────────────────────────────
    doc.font('Helvetica-Bold').fontSize(10).fillColor(INK).text('Rechnungsadresse', left, 196);
    doc.font('Helvetica').fontSize(10).fillColor(INK);
    doc.text(`${order.firstName ?? ''} ${order.lastName ?? ''}`.trim());
    if (order.address) doc.text(order.address);
    doc.text(`${order.zip ?? ''} ${order.city ?? ''}`.trim());
    if (order.country) doc.text(order.country);

    // ── Items table ───────────────────────────────────────────────────────
    let y = 270;
    const colQty = 320, colPrice = 380, colSum = 470;
    doc.font('Helvetica-Bold').fontSize(9).fillColor(MUTED);
    doc.text('ARTIKEL', left, y);
    doc.text('MENGE', colQty, y, { width: 50, align: 'right' });
    doc.text('EINZEL', colPrice, y, { width: 70, align: 'right' });
    doc.text('SUMME', colSum, y, { width: right - colSum, align: 'right' });
    y += 16;
    doc.moveTo(left, y).lineTo(right, y).strokeColor('#e8e8ec').lineWidth(1).stroke();
    y += 10;

    doc.font('Helvetica').fontSize(10).fillColor(INK);
    for (const it of order.items ?? []) {
      const name = it.size ? `${it.name} (Gr. ${it.size})` : it.name;
      doc.fillColor(INK).text(name, left, y, { width: colQty - left - 10 });
      doc.text(String(it.qty), colQty, y, { width: 50, align: 'right' });
      doc.text(eur(it.priceCents), colPrice, y, { width: 70, align: 'right' });
      doc.text(eur(it.priceCents * it.qty), colSum, y, { width: right - colSum, align: 'right' });
      y = doc.y + 8;
    }
    doc.moveTo(left, y).lineTo(right, y).strokeColor('#e8e8ec').lineWidth(1).stroke();
    y += 12;

    // ── Totals ────────────────────────────────────────────────────────────
    const labelX = 330, valX = colSum;
    const row = (label, value, bold = false) => {
      doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(10)
        .fillColor(bold ? INK : MUTED).text(label, labelX, y, { width: valX - labelX - 10, align: 'right' });
      doc.fillColor(INK).text(value, valX, y, { width: right - valX, align: 'right' });
      y = doc.y + 6;
    };
    if (discountCents > 0) {
      row('Zwischensumme', eur(grossBeforeDiscount));
      row('Rabatt', `−${eur(discountCents)}`);
    }
    row('Gesamtbetrag (brutto)', eur(totalCents), true);
    row(`enthaltene MwSt. (${Math.round(VAT_RATE * 100)} %)`, eur(vatCents));
    row('Nettobetrag', eur(netCents));

    // ── Footer ────────────────────────────────────────────────────────────
    doc.font('Helvetica').fontSize(9).fillColor(MUTED).text(
      'Vielen Dank für deinen Einkauf bei Norevan. Der Rechnungsbetrag wurde bereits beglichen. ' +
      'Bei Fragen erreichst du uns unter ' + SELLER.email + '.',
      left, 720, { width: right - left, align: 'center' },
    );

    doc.end();
  });
}
