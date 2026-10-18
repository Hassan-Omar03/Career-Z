import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import AuthNavbar from '../components/AuthNavbar';
import SiteFooter from '../components/SiteFooter';
import { apiRequest } from '../api/client';
import '../styles/discover.css';

// A guest's application page, opened from the emailed link (the token is the only key).
// The first visit confirms the email and sends the application to the employer.
export default function ApplicationStatus() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [data, setData] = useState(null), [error, setError] = useState(''), [busy, setBusy] = useState(''), [msg, setMsg] = useState('');
  const load = () => apiRequest(`/jobs/guest/track?token=${encodeURIComponent(token)}`, { auth: false }).then(setData).catch((e) => setError(e.message));
  useEffect(() => { load(); }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  async function act(path, done) {
    if (path === 'withdraw' && !window.confirm('Withdraw this application? This cannot be undone.')) return;
    setBusy(path); setMsg('');
    try { setData(await apiRequest(`/jobs/guest/${path}`, { method: 'POST', auth: false, body: { token } })); setMsg(done); } catch (e) { setMsg(e.message); } finally { setBusy(''); }
  }

  return (
    <>
      <AuthNavbar />
      <main className="discover-page" style={{ minHeight: '60vh' }}>
        <article className="discover-detail" style={{ maxWidth: 720, margin: '0 auto' }}>
          {!data && !error && <p role="status">Loading…</p>}
          {error && <div className="discover-empty"><h1>Application not found</h1><p>{error}</p><Link className="btn btn-primary" to="/jobs">Browse jobs</Link></div>}
          {data && <>
            <header><h1>Your application</h1><p className="dc-sub">{data.job ? <Link to={`/jobs/${data.job._id}`}>{data.job.title}</Link> : 'Job removed'}{data.job?.company ? ` · ${data.job.company}` : ''}</p></header>
            <div className="dp-action ok" role="status"><strong>Status: {data.stage}</strong><p>Your email is confirmed and the employer can see your application. We email you whenever it changes.</p></div>
            <section><h2>History</h2>
              <ol className="dp-list">{data.history.map((h, i) => <li key={i}><strong>{h.stage}</strong> · {new Date(h.at).toLocaleString()}{h.note ? ` · ${h.note}` : ''}</li>)}</ol>
            </section>
            {msg && <p className="dp-note" role="alert">{msg}</p>}
            <div className="dc-actions">
              {data.canConfirmJoining && <button type="button" className="btn btn-primary" disabled={!!busy} onClick={() => act('confirm-joining', 'Thank you. Your joining is confirmed.')}>I have joined</button>}
              {data.canWithdraw && <button type="button" className="btn" disabled={!!busy} onClick={() => act('withdraw', 'Application withdrawn.')}>Withdraw application</button>}
            </div>
            <p className="dp-note">Want to apply faster next time? <Link to="/signup?type=student">Create a free account</Link> and keep your CV on CareerZ.</p>
          </>}
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
