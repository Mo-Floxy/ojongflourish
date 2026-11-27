import validator from 'validator';
import { badRequest } from '../utils/errors.js';

export const required = (label) => (value) =>
  value == null || String(value).trim() === '' ? `${label} is required.` : null;

export const isEmail = (label = 'Email') => (value) =>
  typeof value === 'string' && validator.isEmail(value) ? null : `${label} must be a valid email address.`;

export const minLength = (label, min) => (value) =>
  typeof value === 'string' && value.length >= min ? null : `${label} must be at least ${min} characters.`;

export const maxLength = (label, max) => (value) =>
  value == null || (typeof value === 'string' && value.length <= max)
    ? null
    : `${label} must be ${max} characters or fewer.`;

export const strongPassword = (label = 'Password') => (value) => {
  if (typeof value !== 'string') return `${label} must be a string.`;
  if (value.length < 8) return `${label} must be at least 8 characters.`;
  if (!/[a-z]/.test(value)) return `${label} must include a lowercase letter.`;
  if (!/[A-Z]/.test(value)) return `${label} must include an uppercase letter.`;
  if (!/\d/.test(value)) return `${label} must include a number.`;
  return null;
};

export const isOneOf = (label, values) => (value) =>
  values.includes(value) ? null : `${label} must be one of: ${values.join(', ')}.`;

export const isBoolean = (label) => (value) =>
  value === undefined || typeof value === 'boolean' ? null : `${label} must be true or false.`;

export const isNumberInRange = (label, min, max) => (value) => {
  if (value === undefined) return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= min && number <= max
    ? null
    : `${label} must be between ${min} and ${max}.`;
};

export function validate(schema) {
  return (req, _res, next) => {
    const errors = [];
    for (const [field, rules] of Object.entries(schema)) {
      for (const rule of rules) {
        const message = rule(req.body?.[field], field, req.body);
        if (message) errors.push({ field, message });
      }
    }
    if (errors.length) {
      return next(badRequest('Please check the highlighted fields.', 'VALIDATION_ERROR', errors));
    }
    return next();
  };
}
