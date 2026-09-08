import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthNavbar from '../components/AuthNavbar';
import PasswordField from '../components/PasswordField';
import { useAuth } from '../context/AuthContext';

const REMEMBER_KEY = 'careerz_remembered_email';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(REMEMBER_KEY);
    if (saved) {
      setEmail(saved);
      setRemember(true);
    }
  }, []);

  function validate() {
    const next = {};
    if (!email.trim()) next.email = 'Email is required.';
    else if (!EMAIL_RE.test(email)) next.email = 'Enter a valid email address.';
    if (!password) next.password = 'Password is required.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    if (remember) localStorage.setItem(REMEMBER_KEY, email.trim());
    else localStorage.removeItem(REMEMBER_KEY);

    setSubmitting(true);
    try {
      await login({ email, password });
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 900);
    } catch (err) {
      setServerError(err.message || 'Login failed.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <AuthNavbar />
      <section className="auth-shell">
        <div className="auth-wrap">
          <Link to="/" className="auth-back">← Back to home</Link>

          <div className="auth-card reveal in">
            <div className="auth-head">
              <div className="eyebrow">Welcome back</div>
              <h1>Sign in to CareerZ.pk</h1>
              <p>Access your dashboard, applications and AI guidance.</p>
            </div>

            {success && (
              <div className="auth-success show">
                <span className="dot"></span>
                <span>Signed in successfully. Redirecting you to your dashboard…</span>
              </div>
            )}
            {serverError && (
              <div className="auth-success show" style={{ background: 'var(--rose)', color: '#fff' }}>
                <span>{serverError}</span>
              </div>
            )}

            <form id="login-form" noValidate onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="login-email">Email address</label>
                <input
                  className="form-input"
                  type="email"
                  id="login-email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {errors.email && <div className="form-error show">{errors.email}</div>}
              </div>

              <PasswordField
                id="login-password"
                label="Password"
                placeholder="Enter your password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
              />

              <div className="auth-row-between">
                <label className="form-check" style={{ marginBottom: 0 }}>
                  <input type="checkbox" id="login-remember" name="remember" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                  <span>Remember me</span>
                </label>
                <Link to="/forgot-password" className="link-muted">Forgot password?</Link>
              </div>

              <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
                {submitting ? 'Signing in…' : 'Sign In'}
              </button>
            </form>

            <div className="auth-divider">or continue with</div>

            <div className="social-grid">
              <button type="button" className="btn-social" aria-label="Continue with Google" disabled>
                <svg viewBox="0 0 24 24"><path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.28-.97 2.36-2.06 3.09v2.57h3.33c1.95-1.8 3.07-4.44 3.07-7.58 0-.73-.07-1.43-.18-2.1H12z"/><path fill="#34A853" d="M12 21c2.79 0 5.13-.92 6.84-2.5l-3.33-2.57c-.92.62-2.1.99-3.51.99-2.7 0-4.99-1.82-5.81-4.27H2.75v2.66C4.45 18.62 7.96 21 12 21z"/><path fill="#4A90E2" d="M6.19 12.65c-.21-.62-.33-1.28-.33-1.97s.12-1.35.33-1.97V6.05H2.75A9.98 9.98 0 0 0 1.7 10.68c0 1.62.39 3.15 1.05 4.5l3.44-2.53z"/><path fill="#FBBC05" d="M12 5.14c1.52 0 2.88.52 3.95 1.55l2.96-2.96C17.13 1.98 14.79 1 12 1 7.96 1 4.45 3.38 2.75 6.79l3.44 2.53C7.01 6.87 9.3 5.14 12 5.14z"/></svg>
                <span>Google</span>
              </button>
              <button type="button" className="btn-social" aria-label="Continue with Facebook" disabled>
                <svg viewBox="0 0 24 24"><path fill="#1877F2" d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.39 23.09 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.89v2.25h3.32l-.53 3.49h-2.79V24C19.61 23.09 24 18.1 24 12.07z"/></svg>
                <span>Facebook</span>
              </button>
              <button type="button" className="btn-social" aria-label="Continue with Apple" disabled>
                <svg viewBox="0 0 24 24"><path fill="currentColor" d="M16.36 1.43c0 1.14-.42 2.2-1.14 3.02-.83.94-2.13 1.63-3.34 1.53-.14-1.14.44-2.32 1.15-3.06.83-.92 2.28-1.6 3.33-1.49zm3.05 16.87c-.36.85-.79 1.65-1.33 2.4-.75 1.05-1.63 2.34-2.86 2.35-1.08.02-1.36-.7-2.83-.7-1.48 0-1.8.68-2.83.72-1.19.04-2.1-1.14-2.85-2.19-1.53-2.14-2.71-6.06-1.13-8.72.78-1.31 2.18-2.15 3.7-2.17 1.14-.03 2.2.77 2.89.77.68 0 1.98-.95 3.33-.81.57.03 2.16.23 3.19 1.75-.08.05-1.9 1.11-1.88 3.32.03 2.65 2.32 3.54 2.36 3.55-.02.06-.36 1.25-1.21 2.47l.45.26z"/></svg>
                <span>Apple</span>
              </button>
              <button type="button" className="btn-social" aria-label="Continue with Microsoft" disabled>
                <svg viewBox="0 0 24 24"><rect x="1" y="1" width="10" height="10" fill="#F25022"/><rect x="13" y="1" width="10" height="10" fill="#7FBA00"/><rect x="1" y="13" width="10" height="10" fill="#00A4EF"/><rect x="13" y="13" width="10" height="10" fill="#FFB900"/></svg>
                <span>Microsoft</span>
              </button>
            </div>

            <div className="auth-foot">
              Don't have an account? <Link to="/signup">Create one</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
