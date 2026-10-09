import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { session } from '../api/client';
import { getMe, login as loginApi, verifyLogin2FA as verifyLogin2FAApi, register as registerApi, logout as logoutApi } from '../api/auth';
import { getAccountStatus } from '../api/onboarding';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(session.getUser());
  const [loading, setLoading] = useState(true);
  // Server-side verification + profile-completion state (GET /onboarding/status). null = not loaded.
  const [accountStatus, setAccountStatus] = useState(null);

  const refreshAccountStatus = useCallback(async () => {
    if (!session.isLoggedIn()) { setAccountStatus(null); return null; }
    try {
      const status = await getAccountStatus();
      setAccountStatus(status);
      return status;
    } catch (error) {
      // Keep the last known state on a network blip; an auth failure clears it.
      if (error.status === 401) setAccountStatus(null);
      return null;
    }
  }, []);

  useEffect(() => {
    async function bootstrap() {
      if (session.isLoggedIn()) {
        try {
          const { user: freshUser } = await getMe();
          setUser(freshUser);
          session.set({ user: freshUser });
          await refreshAccountStatus();
        } catch (error) {
          if (error.status !== 0) { session.clear(); setUser(null); }
        }
      }
      setLoading(false);
    }
    bootstrap();
  }, [refreshAccountStatus]);

  // Any API call refused by the account gate means our cached state is stale.
  useEffect(() => {
    const onGate = () => { refreshAccountStatus(); };
    window.addEventListener('careerz:account-gate', onGate);
    return () => window.removeEventListener('careerz:account-gate', onGate);
  }, [refreshAccountStatus]);

  async function login(credentials) {
    const data = await loginApi(credentials);
    // 2FA challenge — no user session yet, caller must collect the code and call verifyLogin2FA.
    if (data.twoFactorRequired) return data;
    setUser(data.user);
    await refreshAccountStatus();
    return data;
  }

  async function verifyLogin2FA(payload) {
    const data = await verifyLogin2FAApi(payload);
    setUser(data.user);
    await refreshAccountStatus();
    return data;
  }

  async function register(details) {
    const data = await registerApi(details);
    setUser(data.user);
    await refreshAccountStatus();
    return data;
  }

  async function logout() {
    try { await logoutApi(); }
    finally { session.clear(); setUser(null); setAccountStatus(null); }
  }

  async function refreshProfile() {
    const { user: freshUser } = await getMe();
    setUser(freshUser);
    session.set({ user: freshUser });
    await refreshAccountStatus();
    return freshUser;
  }

  return (
    <AuthContext.Provider value={{ user, loading, accountStatus, refreshAccountStatus, login, verifyLogin2FA, register, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
