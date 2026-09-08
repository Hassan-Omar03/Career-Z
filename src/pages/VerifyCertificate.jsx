import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiRequest, ApiError } from '../api/client';

export default function VerifyCertificate() {
  const { code } = useParams();
  const [state, setState] = useState({ loading: true, cert: null, error: '' });

  useEffect(() => {
    let cancelled = false;
    apiRequest(`/certificates/verify/${code}`, { auth: false })
      .then((cert) => {
        if (!cancelled) setState({ loading: false, cert, error: '' });
      })
      .catch((err) => {
        if (cancelled) return;
        const message = err instanceof ApiError ? err.message : 'Could not verify this certificate.';
        setState({ loading: false, cert: null, error: message });
      });
    return () => {
      cancelled = true;
    };
  }, [code]);

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.brand}>CareerZ</h1>
        <p style={styles.subtitle}>Certificate Verification</p>

        {state.loading && <p style={styles.muted}>Verifying…</p>}

        {!state.loading && state.error && (
          <div style={styles.invalidBox}>
            <div style={styles.invalidIcon}>✕</div>
            <h2 style={styles.invalidTitle}>Not a valid certificate</h2>
            <p style={styles.muted}>{state.error}</p>
          </div>
        )}

        {!state.loading && state.cert && (
          <div style={styles.validBox}>
            <div style={styles.validIcon}>✓</div>
            <h2 style={styles.validTitle}>Certificate Verified</h2>
            <dl style={styles.detailList}>
              <dt style={styles.dt}>Title</dt>
              <dd style={styles.dd}>{state.cert.title}</dd>
              <dt style={styles.dt}>Issued to</dt>
              <dd style={styles.dd}>{state.cert.studentName}</dd>
              <dt style={styles.dt}>Issued by</dt>
              <dd style={styles.dd}>{state.cert.institutionName}</dd>
              <dt style={styles.dt}>Issue date</dt>
              <dd style={styles.dd}>
                {state.cert.issueDate ? new Date(state.cert.issueDate).toLocaleDateString() : '—'}
              </dd>
            </dl>
          </div>
        )}

        <Link to="/" style={styles.homeLink}>
          ← Back to CareerZ
        </Link>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0f172a',
    padding: 24
  },
  card: {
    width: '100%',
    maxWidth: 440,
    background: '#fff',
    borderRadius: 16,
    padding: '32px 28px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    textAlign: 'center'
  },
  brand: { margin: 0, fontSize: 24, fontWeight: 800, color: '#0f172a' },
  subtitle: { margin: '4px 0 24px', color: '#64748b', fontSize: 14 },
  muted: { color: '#64748b', fontSize: 14 },
  invalidBox: { padding: '12px 0' },
  invalidIcon: {
    width: 56,
    height: 56,
    borderRadius: '50%',
    background: '#fee2e2',
    color: '#dc2626',
    fontSize: 28,
    lineHeight: '56px',
    margin: '0 auto 12px'
  },
  invalidTitle: { margin: '0 0 8px', color: '#dc2626', fontSize: 18 },
  validBox: { padding: '12px 0' },
  validIcon: {
    width: 56,
    height: 56,
    borderRadius: '50%',
    background: '#dcfce7',
    color: '#16a34a',
    fontSize: 28,
    lineHeight: '56px',
    margin: '0 auto 12px'
  },
  validTitle: { margin: '0 0 16px', color: '#16a34a', fontSize: 18 },
  detailList: { textAlign: 'left', margin: 0 },
  dt: { fontSize: 12, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 10 },
  dd: { margin: '2px 0 0', fontSize: 15, color: '#0f172a', fontWeight: 600 },
  homeLink: {
    display: 'inline-block',
    marginTop: 28,
    color: '#6366f1',
    fontSize: 14,
    textDecoration: 'none'
  }
};
