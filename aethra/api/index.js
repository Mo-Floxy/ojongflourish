import app from '../server/src/app.js';

/**
 * Vercel serverless entry point.
 * The Express app handles all /api/* routes; the SPA is served as static output.
 */
export default function handler(req, res) {
  // Preserve the original API path if the platform supplied it in a header.
  const original = req.headers['x-vercel-original-url'] || req.headers['x-vercel-original-path'];
  if (typeof original === 'string' && original.startsWith('/')) {
    try {
      const url = new URL(original, 'http://localhost');
      req.url = `${url.pathname}${url.search}`;
    } catch {
      // Keep the incoming URL if the header cannot be parsed.
    }
  }

  return app(req, res);
}
