import { test } from 'node:test';
import assert from 'node:assert/strict';
import { requireCronSecret } from '../middleware/requireCronSecret.js';

// Minimal Express req/res/next doubles.
function mock(headerValue) {
  const req = { get: (h) => (h === 'x-cron-secret' ? headerValue : undefined) };
  const res = {
    statusCode: 200,
    body: null,
    status(c) { this.statusCode = c; return this; },
    json(b) { this.body = b; return this; },
  };
  let nextCalled = false;
  const next = () => { nextCalled = true; };
  return { req, res, next, calledNext: () => nextCalled };
}

test('requireCronSecret — 503 when CRON_SECRET is not configured', () => {
  delete process.env.CRON_SECRET;
  const { req, res, next, calledNext } = mock('whatever');
  requireCronSecret(req, res, next);
  assert.equal(res.statusCode, 503);
  assert.equal(calledNext(), false);
});

test('requireCronSecret — 401 on a wrong secret', () => {
  process.env.CRON_SECRET = 'super-secret-value';
  const { req, res, next, calledNext } = mock('wrong-value-here');
  requireCronSecret(req, res, next);
  assert.equal(res.statusCode, 401);
  assert.equal(calledNext(), false);
});

test('requireCronSecret — 401 on a missing header', () => {
  process.env.CRON_SECRET = 'super-secret-value';
  const { req, res, next, calledNext } = mock(undefined);
  requireCronSecret(req, res, next);
  assert.equal(res.statusCode, 401);
  assert.equal(calledNext(), false);
});

test('requireCronSecret — calls next() on the correct secret', () => {
  process.env.CRON_SECRET = 'super-secret-value';
  const { req, res, next, calledNext } = mock('super-secret-value');
  requireCronSecret(req, res, next);
  assert.equal(calledNext(), true);
});

test.after(() => { delete process.env.CRON_SECRET; });
