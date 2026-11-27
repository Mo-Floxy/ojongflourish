import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { unauthorized } from './errors.js';

export const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

export function issueAccessToken(user) {
  return jwt.sign(
    { sub: String(user.id), type: 'access' },
    env.jwt.secret,
    { expiresIn: env.jwt.accessTtl, issuer: 'aethra' },
  );
}

export function generateRefreshToken() {
  return crypto.randomBytes(48).toString('hex');
}

export async function issueTokenPair(user, extra = {}) {
  const accessToken = issueAccessToken(user);
  const refreshToken = generateRefreshToken();
  return { accessToken, refreshToken, ...extra };
}

export function verifyAccessToken(token) {
  try {
    const payload = jwt.verify(token, env.jwt.secret, { issuer: 'aethra' });
    if (payload.type !== 'access' || !payload.sub) throw new Error('Invalid token type');
    return payload;
  } catch {
    throw unauthorized('Your session has expired. Please sign in again.', 'SESSION_EXPIRED');
  }
}

export function refreshExpiryDate() {
  const match = /^(\d+)([smhd])$/.exec(env.jwt.refreshTtl);
  const amount = Number.parseInt(match?.[1] ?? '7', 10);
  const unit = match?.[2] ?? 'd';
  const multipliers = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  return new Date(Date.now() + amount * (multipliers[unit] ?? multipliers.d));
}
