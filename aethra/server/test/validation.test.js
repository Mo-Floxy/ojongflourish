import assert from 'node:assert/strict';
import test from 'node:test';
import {
  isEmail,
  isOneOf,
  required,
  strongPassword,
  validate,
} from '../src/middleware/validate.js';

function run(schema, body) {
  let captured = null;
  const middleware = validate(schema);
  middleware({ body }, {}, (error) => { captured = error; });
  return captured;
}

test('required and email rules reject invalid input', () => {
  const error = run({ email: [required('Email'), isEmail()] }, { email: 'not-an-email' });
  assert.equal(error?.status, 400);
  assert.equal(error?.code, 'VALIDATION_ERROR');
  assert.equal(error?.details.length, 1);
  assert.equal(error.details[0].field, 'email');
});

test('strongPassword reports the first unmet requirement', () => {
  assert.match(strongPassword()('short'), /at least 8 characters/);
  assert.match(strongPassword()('alllowercase1'), /uppercase letter/);
  assert.equal(strongPassword()('AethraTest1!'), null);
});

test('valid payload passes validation', () => {
  const error = run(
    {
      email: [required('Email'), isEmail()],
      role: [isOneOf('Role', ['user', 'admin'])],
    },
    { email: 'hello@aethra.ai', role: 'user' },
  );
  assert.equal(error, undefined);
});
