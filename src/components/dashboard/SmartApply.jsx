import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../../api/client';

// Smart Apply: open jobs ranked against your CV; tick several and send one cover letter to all
// of them. {job} and {company} in the letter are replaced for each job. Every application goes
// through the same checks as applying one by one, and the result shows what was sent.

const DEFAULT_LETTER = 'Dear Hiring Manager,\n\nI am applying for the {job} role at {company}. My CV is attached through CareerZ.\n\nThank you for your time.';
const scoreColor = (s) => (s >= 70 ? 'var(--emerald, #1b8a63)' : s >= 40 ? 'var(--gold, #e3a23c)' : 'var(--ink-soft)');

export default function SmartApply({ onFlash }) {
  const [data, setData] = useState(null), [error, setError] = useState('');
  const [picked, setPicked] = useState([]), [letter, setLetter] = useState(DEFAULT_LETTER);
  const [busy, setBusy] = useState(false), [result, setResult] = useState(null);
  const load = () => apiRequest('/jobs/smart-apply/matches').then((d) => { setData(d); setPicked([]); }).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const max = data ? Math.min(data.perRequest, data.remainingToday) : 0;
  const toggle = (id) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length >= max ? p : [...p, id]));
  async function send() {
    setBusy(true); setError('');
    try {
      const r = await apiRequest('/jobs/smart-apply', { method: 'POST', body: { jobIds: picked, coverLetter: letter } });
      setResult(r); onFlash?.(r.applied ? `Applied to ${r.applied} job${r.applied === 1 ? '' : 's'}.` : 'No applications were sent.', r.applied ? 'success' : undefined);
      load();
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }

  if (error && !data) return <p role="alert" className="discover-error">{error}</p>;
  if (!data) return <p role="status">Loading your matches…</p>;
  return (
    <section>
      <h3>Smart Apply</h3>
      <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>Jobs ranked by how well they match your CV. Tick up to {data.perRequest} and apply to all of them at once. You can send {data.remainingToday} more application{data.remainingToday === 1 ? '' : 's'} in the next 24 hours.</p>
      {!data.hasResume && <div className="u-alert warning mb-3"><span className="u-alert-ic">!</span><div className="u-alert-body"><strong>Build your CV first</strong><p>Matching uses the skills, experience and education in your CV. Open CV/Resume Builder and add them — without a CV, employers also see less about you.</p></div></div>}
      {result && <div className="dp-action ok" style={{ marginBottom: 12 }}>
        <p><strong>Applied to {result.applied} job{result.applied === 1 ? '' : 's'}{result.skipped ? `, ${result.skipped} skipped` : ''}.</strong></p>
        <ul className="dp-list">{result.results.map((r) => <li key={r.job}>{r.title || 'Job'}{r.company ? ` · ${r.company}` : ''} — {r.status === 'applied' ? 'sent' : r.reason}</li>)}</ul>
        <p className="dp-note">Track them in My Applications.</p>
      </div>}
      {data.jobs.length === 0 ? <p className="discover-empty-line">No open jobs you have not applied to yet. <Link to="/jobs">Browse all jobs</Link></p> : <>
        <div style={{ display: 'grid', gap: 10 }}>
          {data.jobs.map((j) => {
            const on = picked.includes(j._id);
            return <label key={j._id} className="card" style={{ padding: 14, display: 'flex', gap: 12, alignItems: 'flex-start', cursor: 'pointer', borderColor: on ? 'var(--emerald, #1b8a63)' : undefined }}>
              <input type="checkbox" checked={on} onChange={() => toggle(j._id)} disabled={!on && picked.length >= max} style={{ marginTop: 4 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}><strong>{j.title}</strong><span style={{ fontWeight: 700, color: scoreColor(j.match.score) }}>{j.match.score}% match</span></div>
                <div className="text-xs" style={{ color: 'var(--ink-soft)' }}>{j.company}{j.city ? ` · ${j.city}` : ''} · {String(j.type).replace('_', ' ')}{j.workMode ? ` · ${j.workMode}` : ''}{j.applicationDeadline ? ` · apply by ${new Date(j.applicationDeadline).toLocaleDateString()}` : ''}</div>
                {j.match.reasons.length > 0 && <div className="text-xs" style={{ marginTop: 4 }}>✓ {j.match.reasons.join(' · ')}</div>}
                {j.match.missingSkills.length > 0 && <div className="text-xs" style={{ color: 'var(--ink-soft)' }}>Skills you have not listed: {j.match.missingSkills.join(', ')}</div>}
              </div>
              <Link to={`/jobs/${j._id}`} className="btn" style={{ fontSize: 12, padding: '4px 10px' }} onClick={(e) => e.stopPropagation()}>Details</Link>
            </label>;
          })}
        </div>
        <label style={{ display: 'grid', gap: 4, marginTop: 14 }}><strong>Cover letter for all selected jobs</strong><span className="text-xs" style={{ color: 'var(--ink-soft)' }}>{'{job}'} and {'{company}'} are replaced with each job's title and company.</span>
          <textarea className="form-input" rows={6} maxLength={4000} value={letter} onChange={(e) => setLetter(e.target.value)} /></label>
        {error && <p role="alert" className="discover-error">{error}</p>}
        <button type="button" className="btn btn-primary" style={{ marginTop: 10 }} disabled={!picked.length || busy} onClick={send}>{busy ? 'Applying…' : `Apply to ${picked.length || ''} selected job${picked.length === 1 ? '' : 's'}`}</button>
      </>}
    </section>
  );
}
