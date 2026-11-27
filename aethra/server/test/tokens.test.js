import assert from 'node:assert/strict';
import test from 'node:test';
import {
  hashToken,
  issueAccessToken,
  refreshExpiryDate,
  verifyAccessToken,
} from '../src/utils/tokens.js';

test('hashToken is deterministic and does not return the raw token', () => {
  const token = 'aethra-test-token';
  const hash = hashToken(token);

  assert.equal(hash.length, 64);
  assert.equal(hash, hashToken(token));
  assert.notEqual(hash, token);
});

test('issued access tokens carry the expected claims and verify', () => {
  const token = issueAccessToken({ id: 42 });
  const payload = verifyAccessToken(token);

  assert.equal(payload.sub, '42');
  assert.equal(payload.type, 'access');
  assert.equal(payload.iss, 'aethra');
});

test('refreshExpiryDate returns a future date', () => {
  const expiry = refreshExpiryDate();
  assert.ok(expiry instanceof Date);
  assert.ok(expiry.getTime() > Date.now());
});
