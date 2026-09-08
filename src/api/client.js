// Thin fetch() wrapper for the CareerZ backend API.
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

const TOKEN_KEY = 'cz_access_token';
const REFRESH_KEY = 'cz_refresh_token';
const USER_KEY = 'cz_user';

export const session = {
  getAccessToken: () => localStorage.getItem(TOKEN_KEY),
  getRefreshToken: () => localStorage.getItem(REFRESH_KEY),
  getUser: () => {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
    } catch {
      return null;
    }
  },
  set({ user, accessToken, refreshToken }) {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    if (accessToken) localStorage.setItem(TOKEN_KEY, accessToken);
    if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
  },
  isLoggedIn() {
    return !!session.getAccessToken();
  }
};

export class ApiError extends Error {
  constructor(message, status, errors) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

export async function apiRequest(path, { method = 'GET', body, auth = true, retry = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth && session.getAccessToken()) {
    headers.Authorization = `Bearer ${session.getAccessToken()}`;
  }

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });
  } catch (networkErr) {
    throw new ApiError('Cannot reach the CareerZ server. Is the backend running?', 0);
  }

  let payload;
  try {
    payload = await res.json();
  } catch {
    payload = { success: false, message: 'Invalid server response.' };
  }

  // Access token expired -> try refresh once, then retry the original request.
  if (res.status === 401 && retry && session.getRefreshToken() && path !== '/auth/refresh') {
    const refreshed = await tryRefreshToken();
    if (refreshed) return apiRequest(path, { method, body, auth, retry: false });
  }

  if (!res.ok) {
    throw new ApiError(payload.message || 'Request failed.', res.status, payload.errors);
  }

  return payload.data;
}

async function tryRefreshToken() {
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: session.getRefreshToken() })
    });
    const payload = await res.json();
    if (!res.ok) return false;
    session.set(payload.data);
    return true;
  } catch {
    return false;
  }
}
