import { apiRequest, session } from './client';

export async function register({ fullName, email, phone, password }) {
  const data = await apiRequest('/auth/register', {
    method: 'POST',
    auth: false,
    body: { fullName, email, phone, password }
  });
  session.set(data);
  return data;
}

export async function login({ email, password }) {
  const data = await apiRequest('/auth/login', {
    method: 'POST',
    auth: false,
    body: { email, password }
  });
  session.set(data);
  return data;
}

export async function logout() {
  try {
    await apiRequest('/auth/logout', { method: 'POST', body: { refreshToken: session.getRefreshToken() } });
  } finally {
    session.clear();
  }
}

export function verifyEmail(code) {
  return apiRequest('/auth/verify-email', { method: 'POST', body: { code } });
}

export function resendVerification() {
  return apiRequest('/auth/resend-verification', { method: 'POST' });
}

export function forgotPassword(email) {
  return apiRequest('/auth/forgot-password', { method: 'POST', auth: false, body: { email } });
}

export function resetPassword({ email, code, newPassword }) {
  return apiRequest('/auth/reset-password', { method: 'POST', auth: false, body: { email, code, newPassword } });
}

export function getMe() {
  return apiRequest('/auth/me');
}
