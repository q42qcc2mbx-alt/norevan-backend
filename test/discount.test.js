import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeDiscountCents, discountError } from '../controllers/discountController.js';

test('computeDiscountCents — percent', () => {
  assert.equal(computeDiscountCents({ type: 'percent', value: 10 }, 10000), 1000);
  assert.equal(computeDiscountCents({ type: 'percent', value: 25 }, 4000), 1000);
});

test('computeDiscountCents — fixed', () => {
  assert.equal(computeDiscountCents({ type: 'fixed', value: 500 }, 10000), 500);
});

test('computeDiscountCents — never exceeds the order total', () => {
  assert.equal(computeDiscountCents({ type: 'fixed', value: 99999 }, 1000), 1000);
  assert.equal(computeDiscountCents({ type: 'percent', value: 100 }, 2500), 2500);
});

test('discountError — unusable cases', () => {
  assert.match(discountError(null, 5000), /ungültig/i);
  assert.match(discountError({ active: false, used_count: 0, min_subtotal_cents: 0 }, 5000), /aktiv/i);
  assert.match(
    discountError({ active: true, used_count: 0, min_subtotal_cents: 0, expires_at: '2000-01-01' }, 5000),
    /abgelaufen/i,
  );
  assert.match(
    discountError({ active: true, used_count: 5, max_uses: 5, min_subtotal_cents: 0 }, 5000),
    /aufgebraucht/i,
  );
  assert.match(
    discountError({ active: true, used_count: 0, min_subtotal_cents: 10000 }, 5000),
    /Mindestbestellwert/i,
  );
});

test('discountError — valid code returns null', () => {
  assert.equal(
    discountError({ active: true, used_count: 0, max_uses: null, min_subtotal_cents: 0, expires_at: null }, 5000),
    null,
  );
});
