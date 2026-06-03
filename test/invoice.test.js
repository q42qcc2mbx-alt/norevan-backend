import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateInvoicePdf } from '../services/invoiceService.js';

const baseOrder = {
  orderId: 'abcd1234ef567890',
  invoiceNumber: 'NOR-2026-01000',
  firstName: 'Max',
  lastName: 'Mustermann',
  address: 'Beispielweg 5',
  city: 'Berlin',
  zip: '10115',
  country: 'Deutschland',
  items: [
    { name: 'Air Max', size: '43', qty: 1, priceCents: 18900 },
    { name: 'Tee', qty: 2, priceCents: 4500 },
  ],
  subtotalCents: 24900,
  discountCents: 3000,
  createdAt: '2026-06-03T10:00:00.000Z',
};

test('generateInvoicePdf — returns a valid PDF buffer', async () => {
  const buf = await generateInvoicePdf(baseOrder);
  assert.ok(Buffer.isBuffer(buf));
  assert.equal(buf.subarray(0, 5).toString(), '%PDF-');
  assert.ok(buf.length > 1000, 'PDF should be non-trivial in size');
});

test('generateInvoicePdf — works without a discount', async () => {
  const buf = await generateInvoicePdf({ ...baseOrder, discountCents: 0 });
  assert.equal(buf.subarray(0, 5).toString(), '%PDF-');
});

test('generateInvoicePdf — tolerates missing optional fields', async () => {
  const buf = await generateInvoicePdf({
    orderId: 'deadbeefcafef00d',
    items: [{ name: 'Cap', qty: 1, priceCents: 2500 }],
    subtotalCents: 2500,
  });
  assert.equal(buf.subarray(0, 5).toString(), '%PDF-');
});
