const BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
const ACCESS_KEY = 'aethra.accessToken';
const REFRESH_KEY = 'aethra.refreshToken';

export function getAccessToken() {
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY);
}

export function setTokens(tokens = {}) {
  if (tokens.accessToken) localStorage.setItem(ACCESS_KEY, tokens.accessToken);
  if (tokens.refreshToken) localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export class ApiError extends Error {
  constructor(status, message, code, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

async function refreshSession() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;
  try {
    const response = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!response.ok) return false;
    const data = await response.json();
    setTokens(data.tokens);
    return true;
  } catch {
    return false;
  }
}

export async function api(path, options = {}) {
  const {
    method = 'GET',
    body,
    headers = {},
    signal,
    responseType = 'json',
    skipRefresh = false,
  } = options;

  const request = async () => {
    const token = getAccessToken();
    return fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  };

  let response = await request();

  if (response.status === 401 && !skipRefresh && !path.startsWith('/auth/')) {
    const refreshed = await refreshSession();
    if (refreshed) response = await request();
  }

  if (responseType === 'blob') {
    if (!response.ok) throw new ApiError(response.status, 'Could not download this file.', 'DOWNLOAD_FAILED');
    return response.blob();
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = data?.error || {};
    throw new ApiError(
      response.status,
      error.message || `Request failed (${response.status})`,
      error.code || 'REQUEST_FAILED',
      error.details,
    );
  }
  return data;
}

/**
 * Consume an SSE stream from the API. `onEvent(type, payload)` receives
 * named events such as start, token, done and error.
 */
export async function apiStream(path, { body, onEvent, signal } = {}) {
  const token = getAccessToken();
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body || {}),
    signal,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const error = data?.error || {};
    throw new ApiError(response.status, error.message || `Request failed (${response.status})`, error.code);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let currentEvent = 'message';

  const dispatch = (event, data) => {
    if (event === 'error') {
      throw new ApiError(500, data?.message || 'The response stream failed.', data?.code || 'STREAM_ERROR');
    }
    onEvent?.(event, data);
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) {
        currentEvent = 'message';
        continue;
      }
      if (trimmed.startsWith('event:')) {
        currentEvent = trimmed.slice(6).trim();
      } else if (trimmed.startsWith('data:')) {
        try {
          dispatch(currentEvent, JSON.parse(trimmed.slice(5).trim()));
        } catch (error) {
          if (error instanceof ApiError) throw error;
        }
      }
    }
  }
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
