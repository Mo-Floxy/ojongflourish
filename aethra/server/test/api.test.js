import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import app from '../src/app.js';

let server;
let baseUrl;

before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', resolve);
  });
  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

test('unknown API routes return a structured 404', async () => {
  const response = await fetch(`${baseUrl}/api/does-not-exist`);
  const body = await response.json();

  assert.equal(response.status, 404);
  assert.equal(body.error.code, 'ROUTE_NOT_FOUND');
});

test('register validates input before touching the database', async () => {
  const response = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'bad', password: 'weak' }),
  });
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.error.code, 'VALIDATION_ERROR');
  assert.ok(body.error.details.some((detail) => detail.field === 'email'));
});

test('authentication is required for protected routes', async () => {
  const response = await fetch(`${baseUrl}/api/settings`);
  const body = await response.json();

  assert.equal(response.status, 401);
  assert.equal(body.error.code, 'UNAUTHORIZED');
});
