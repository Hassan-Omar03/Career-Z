import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthNavbar from '../components/AuthNavbar';
import { forgotPassword } from '../api/auth';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!email.trim()) return setError('Email is required.');
    if (!EMAIL_RE.test(email)) return setError('Enter a valid email address.');

    setSubmitting(true);
    try {
      await forgotPassword(email);
      setSuccess(true);
      setTimeout(() => navigate(`/reset-password?email=${encodeURIComponent(email)}`), 1500);
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <AuthNavbar />
      <section className="auth-shell">
        <div className="auth-wrap">
          <Link to="/login" className="auth-back">← Back to sign in</Link>

          <div className="auth-card reveal in">
            <div className="auth-head">
              <div className="eyebrow">Account recovery</div>
              <h1>Forgot your password?</h1>
              <p>Enter the email linked to your account and we'll send you a reset code.</p>
            </div>

            {success && (
              <div className="auth-success show">
                <span className="dot"></span>
                <span>If an account exists for that email, a reset code is on its way. Taking you to the reset page…</span>
              </div>
            )}

            <form noValidate onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="forgot-email">Email address</label>
                <input
                  className="form-input" type="email" id="forgot-email" placeholder="you@example.com" autoComplete="email"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                />
                {error && <div className="form-error show">{error}</div>}
              </div>

              <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
                {submitting ? 'Sending…' : 'Send Reset Code'}
              </button>
            </form>

            <div className="auth-foot">
              Remembered your password? <Link to="/login">Sign In</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
