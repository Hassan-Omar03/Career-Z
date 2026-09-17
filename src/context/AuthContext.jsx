import { createContext, useContext, useEffect, useState } from 'react';
import { session } from '../api/client';
import { getMe, login as loginApi, verifyLogin2FA as verifyLogin2FAApi, register as registerApi, logout as logoutApi } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(session.getUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function bootstrap() {
      if (session.isLoggedIn()) {
        try {
          const { user: freshUser } = await getMe();
          setUser(freshUser);
          session.set({ user: freshUser });
        } catch {
          session.clear();
          setUser(null);
        }
      }
      setLoading(false);
    }
    bootstrap();
  }, []);

  async function login(credentials) {
    const data = await loginApi(credentials);
    // 2FA challenge — no user session yet, caller must collect the code and call verifyLogin2FA.
    if (data.twoFactorRequired) return data;
    setUser(data.user);
    return data;
  }

  async function verifyLogin2FA(payload) {
    const data = await verifyLogin2FAApi(payload);
    setUser(data.user);
    return data;
  }

  async function register(details) {
    const data = await registerApi(details);
    setUser(data.user);
    return data;
  }

  async function logout() {
    await logoutApi();
    setUser(null);
  }

  async function refreshProfile() {
    const { user: freshUser } = await getMe();
    setUser(freshUser);
    session.set({ user: freshUser });
    return freshUser;
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, verifyLogin2FA, register, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
