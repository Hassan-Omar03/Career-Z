// Thin fetch() wrapper for the CareerZ backend API.
// On careerz.pk the API is served by the same address (careerz.pk/api), so everything stays on
// the CareerZ domain whatever address the build was made with.
const SAME_SITE_API = typeof window !== 'undefined' && /(^|\.)careerz\.pk$/i.test(window.location.hostname) ? `${window.location.origin}/api` : '';
export const API_BASE = SAME_SITE_API || import.meta.env?.VITE_API_BASE || 'http://localhost:5000/api';

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
    if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('careerz:logout', { detail: { userId: session.getUser()?._id } }));
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
  } catch {
    throw new ApiError('Cannot reach the CareerZ server. Is the backend running?', 0);
  }

  let payload;
  try {
    payload = await res.json();
  } catch {
    payload = { success: false, message: 'Invalid server response.' };
  }

  // Access token expired -> try refresh once, then retry the original request.
  if (res.status === 401 && auth && retry && session.getRefreshToken() && path !== '/auth/refresh') {
    const refreshed = await tryRefreshToken();
    if (refreshed) return apiRequest(path, { method, body, auth, retry: false });
  }

  // Signed out while the page still shows the account: end it properly so the person logs in again.
  if (res.status === 401 && auth && !session.getRefreshToken() && session.getUser()) session.clear();

  if (!res.ok) {
    // The server locks unverified/incomplete accounts; let the app route to the right page.
    if (res.status === 403 && payload.errors?.code === 'ACCOUNT_GATE' && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('careerz:account-gate', { detail: payload.errors }));
    }
    throw new ApiError(payload.message || 'Request failed.', res.status, payload.errors);
  }

  return payload.data;
}

let refreshInFlight = null;
// A refresh the server refused is not sent again. Without this every failing request on the page
// repeated it, and the requests used up the sign-in limit, so nobody on that network could log in.
let refreshPausedUntil = 0;
const RENEW_GRACE_MS = 800;

export function tryRefreshToken() {
  const refreshToken = session.getRefreshToken();
  if (!refreshToken || Date.now() < refreshPausedUntil) return Promise.resolve(false);
  if (refreshInFlight?.token === refreshToken) return refreshInFlight.promise;
  const pending = { token: refreshToken };
  pending.promise = refreshSession(refreshToken).finally(() => {
    if (refreshInFlight === pending) refreshInFlight = null;
  });
  refreshInFlight = pending;
  return pending.promise;
}

async function refreshSession(refreshToken) {
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });
    const payload = await res.json();
    // Do not restore a session after logout or overwrite a different account's login.
    if (session.getRefreshToken() !== refreshToken) return false;
    if (res.status === 429) { refreshPausedUntil = Date.now() + 60000; return false; }
    // The sign-in has ended for good, so end it here too and let the person log in again.
    if (res.status === 401) {
      // Another tab may have just renewed this same sign-in; give it a moment to save the new one.
      await new Promise((resolve) => { setTimeout(resolve, RENEW_GRACE_MS); });
      if (session.getRefreshToken() !== refreshToken) return Boolean(session.getRefreshToken());
      session.clear();
      return false;
    }
    if (!res.ok) return false;
    session.set(payload.data);
    return true;
  } catch {
    return false;
  }
}
