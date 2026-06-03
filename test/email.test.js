import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  renderOrderEmail,
  renderWelcomeEmail,
  renderAbandonedCartEmail,
} from '../services/emailService.js';

test('renderOrderEmail — subject + body carry the order details', () => {
  const { subject, html, text } = renderOrderEmail({
    orderId: 'abcd1234ef',
    email: 'kunde@example.com',
    firstName: 'Lena',
    lastName: 'Klein',
    address: 'Allee 1',
    city: 'Berlin',
    zip: '10115',
    country: 'DE',
    items: [{ name: 'Hoodie', size: 'M', qty: 1, priceCents: 8900 }],
    subtotalCents: 8900,
    discountCents: 0,
    createdAt: '2026-06-03T10:00:00.000Z',
  });
  assert.match(subject, /ABCD1234/); // order number = first 8 of id, upper-cased
  assert.match(html, /Hoodie/);
  assert.match(html, /Lena/);
  assert.match(text, /Hoodie/);
});

test('renderOrderEmail — shows the discount line when present', () => {
  const { html } = renderOrderEmail({
    orderId: 'zzzz0000aa',
    email: 'x@y.z',
    firstName: 'A',
    items: [{ name: 'Jeans', qty: 1, priceCents: 12000 }],
    subtotalCents: 9000,
    discountCents: 3000,
    discountCode: 'WELCOME10',
    createdAt: '2026-06-03T10:00:00.000Z',
  });
  assert.match(html, /Rabatt/);
  assert.match(html, /WELCOME10/);
});

test('renderWelcomeEmail — greets by first name', () => {
  const { subject, html, text } = renderWelcomeEmail({ email: 'neu@example.com', firstName: 'Tom' });
  assert.match(subject, /Willkommen/i);
  assert.match(html, /Tom/);
  assert.match(text, /Tom/);
});

test('renderWelcomeEmail — works without a first name', () => {
  const { subject, html } = renderWelcomeEmail({ email: 'neu@example.com' });
  assert.match(subject, /Willkommen/i);
  assert.ok(html.length > 100);
});

test('renderAbandonedCartEmail — lists items and links back to the cart', () => {
  const { subject, html, text } = renderAbandonedCartEmail({
    orderId: 'cart9999bb',
    email: 'zoeg@example.com',
    firstName: 'Zoe',
    items: [{ name: 'Sneaker', size: '42', qty: 1, priceCents: 15900 }],
    subtotalCents: 15900,
  });
  assert.match(subject, /Norevan/);
  assert.match(html, /Sneaker/);
  assert.match(html, /\/de\/cart/);
  assert.match(text, /Sneaker/);
});
