import { env } from '../config/env.js';
import { ApiError } from '../utils/errors.js';

export function notFoundHandler(req, _res, next) {
  next(new ApiError(404, `No API route matches ${req.method} ${req.path}`, 'ROUTE_NOT_FOUND'));
}

export function errorHandler(error, _req, res, _next) {
  let status = error.status || 500;
  let message = error.message || 'Something went wrong on our end.';
  let code = error.code || 'INTERNAL_ERROR';
  let details = error.details || null;

  if (error instanceof SyntaxError && 'body' in error) {
    status = 400;
    message = 'Request body is not valid JSON.';
    code = 'INVALID_JSON';
  }

  if (error.code === 'ER_DUP_ENTRY') {
    status = 409;
    message = 'A record with these details already exists.';
    code = 'DUPLICATE_ENTRY';
  }

  if (status >= 500 && env.nodeEnv === 'production') {
    message = 'Something went wrong on our end.';
  }

  if (res.headersSent) return;

  res.status(status).json({
    error: {
      message,
      code,
      ...(details ? { details } : {}),
      ...(env.nodeEnv === 'development' && status >= 500 ? { stack: error.stack } : {}),
    },
  });
}
