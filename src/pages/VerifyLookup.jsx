import { FaArrowLeft } from 'react-icons/fa6';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// The public page where anyone types a certificate, student ID or fee receipt number to check it.
// The result opens on the same page a QR code link opens.
export default function VerifyLookup({ title, label, placeholder, hint, path }) {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  function submit(e) {
    e.preventDefault();
    const value = code.trim();
    if (value) navigate(`${path}/${encodeURIComponent(value)}`);
  }
  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <h1 style={styles.brand}>CareerZ.pk</h1>
        <p style={styles.subtitle}>{title}</p>
        <form onSubmit={submit}>
          <label htmlFor="verify-code" style={styles.label}>{label}</label>
          <input id="verify-code" className="form-input" required maxLength={120} autoComplete="off" placeholder={placeholder} value={code} onChange={(e) => setCode(e.target.value)} />
          <p style={styles.hint}>{hint}</p>
          <button type="submit" className="btn btn-primary" style={styles.button} disabled={!code.trim()}>Verify</button>
        </form>
        <Link to="/" style={styles.link}><FaArrowLeft aria-hidden="true" /> Back to CareerZ</Link>
      </section>
    </main>
  );
}

const styles = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', padding: 24 },
  card: { width: '100%', maxWidth: 440, background: '#fff', color: '#0f172a', borderRadius: 16, padding: '32px 28px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', textAlign: 'center' },
  brand: { margin: 0, fontSize: 24, fontWeight: 800, color: '#0f172a' },
  subtitle: { margin: '4px 0 24px', color: '#64748b', fontSize: 14 },
  label: { display: 'block', textAlign: 'left', fontSize: 14, fontWeight: 600, marginBottom: 8 },
  hint: { textAlign: 'left', color: '#64748b', fontSize: 12, margin: '8px 0 18px' },
  button: { width: '100%', justifyContent: 'center' },
  link: { display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 20, fontSize: 14, fontWeight: 600 }
};
