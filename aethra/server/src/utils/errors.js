export class ApiError extends Error {
  constructor(status, message, code = 'ERROR', details = null) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const badRequest = (message, code = 'BAD_REQUEST', details = null) => new ApiError(400, message, code, details);
export const unauthorized = (message = 'Authentication required', code = 'UNAUTHORIZED') => new ApiError(401, message, code);
export const forbidden = (message = 'You do not have access to this resource', code = 'FORBIDDEN') => new ApiError(403, message, code);
export const notFound = (message = 'Resource not found', code = 'NOT_FOUND') => new ApiError(404, message, code);
export const conflict = (message, code = 'CONFLICT') => new ApiError(409, message, code);
export const setupRequired = (message, code = 'SETUP_REQUIRED') => new ApiError(503, message, code);

export const asyncHandler = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
