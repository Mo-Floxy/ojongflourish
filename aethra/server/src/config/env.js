import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(here, '../../.env') });

const str = (key, fallback = '') => process.env[key] ?? fallback;
const num = (key, fallback) => Number.parseInt(process.env[key] ?? String(fallback), 10);
const bool = (key, fallback = false) => {
  const value = process.env[key];
  if (value == null || value === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
};

const dbHost = str('DB_HOST', '127.0.0.1');
const isRemoteDb = !['localhost', '127.0.0.1', '::1'].includes(dbHost);

export const env = {
  nodeEnv: str('NODE_ENV', 'development'),
  port: num('PORT', 4000),
  clientUrl: str('CLIENT_URL', 'http://localhost:5173'),
  db: {
    host: dbHost,
    port: num('DB_PORT', 3306),
    user: str('DB_USER', 'root'),
    password: str('DB_PASSWORD', ''),
    name: str('DB_NAME', 'aethra_db'),
    ssl: bool('DB_SSL', isRemoteDb),
    sslCa: str('DB_SSL_CA', ''),
  },
  jwt: {
    secret: str('JWT_SECRET', ''),
    accessTtl: str('JWT_ACCESS_TTL', '15m'),
    refreshTtl: str('JWT_REFRESH_TTL', '7d'),
  },
  mail: {
    mode: str('MAIL_MODE', 'dev'),
    host: str('SMTP_HOST'),
    port: num('SMTP_PORT', 587),
    user: str('SMTP_USER'),
    pass: str('SMTP_PASS'),
    from: str('MAIL_FROM', 'AETHRA <no-reply@aethra.local>'),
  },
  ai: {
    provider: str('AI_PROVIDER', 'openai'),
    apiKey: str('AI_API_KEY'),
    model: str('AI_MODEL', 'gpt-4o-mini'),
    baseUrl: str('AI_BASE_URL'),
    temperature: Number.parseFloat(str('AI_TEMPERATURE', '0.7')),
    maxTokens: num('AI_MAX_TOKENS', 1200),
  },
  image: {
    provider: str('IMAGE_PROVIDER', 'openai'),
    apiKey: str('IMAGE_API_KEY'),
    model: str('IMAGE_MODEL', 'gpt-image-1'),
    baseUrl: str('IMAGE_BASE_URL'),
  },
};

export function dbSslConfig() {
  if (!env.db.ssl) return undefined;
  if (env.db.sslCa && fs.existsSync(env.db.sslCa)) {
    return { ca: fs.readFileSync(env.db.sslCa), rejectUnauthorized: true };
  }
  // Remote MySQL-compatible providers (e.g. TiDB Cloud) negotiate TLS even
  // without a CA bundle. Production deployments should supply DB_SSL_CA.
  return { rejectUnauthorized: false };
}

export function assertProductionSecrets() {
  if (env.nodeEnv === 'production' && !env.jwt.secret) {
    throw new Error('JWT_SECRET must be set in production');
  }
}
