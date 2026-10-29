import { useEffect, useState } from 'react';
import { FaWandMagicSparkles, FaStar, FaTrash, FaPlus, FaCircleCheck, FaRoute, FaAward } from 'react-icons/fa6';
import { apiRequest } from '../../api/client';

const card = { padding: 20, display: 'grid', gap: 12 };
const muted = { color: 'var(--ink-soft)', fontSize: 13 };
const toList = (v) => String(v || '').split(',').map((s) => s.trim()).filter(Boolean);
const fmt = (d) => (d ? new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '—');

// ------------------------------------------------------------------ CV versions + autofill
export function CvVersions({ onFlash }) {
  const [rows, setRows] = useState(null);
  const [form, setForm] = useState({ name: '', targetRole: '', from: 'main' });
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);
  const load = () => apiRequest('/resumes/variants').then(setRows).catch((e) => onFlash(e.message));
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  async function run(fn, done) { setBusy(true); try { const r = await fn(); if (done) onFlash(done, 'success'); await load(); return r; } catch (e) { onFlash(e.message); } finally { setBusy(false); } }

  if (!rows) return <p role="status" className="admin-notice">Loading…</p>;
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div className="card" style={card}>
        <h3 style={{ margin: 0 }}>CV versions</h3>
        <p style={muted}>Keep up to 5 named versions of your CV, e.g. one per kind of job. The default version is the one you send first.</p>
        <form className="flex flex-wrap items-end" style={{ gap: 10 }} onSubmit={(e) => { e.preventDefault(); run(() => apiRequest('/resumes/variants', { method: 'POST', body: form }), 'CV version created.').then(() => setForm({ name: '', targetRole: '', from: 'main' })); }}>
          <label className="text-xs" style={{ flex: '1 1 180px' }}>Version name<input className="form-input" required maxLength={80} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Data internships" /></label>
          <label className="text-xs" style={{ flex: '1 1 180px' }}>Target role (optional)<input className="form-input" maxLength={120} value={form.targetRole} onChange={(e) => setForm({ ...form, targetRole: e.target.value })} /></label>
          <label className="text-xs" style={{ flex: '1 1 180px' }}>Start from<select className="form-select" value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value })}>
            <option value="main">My main CV</option><option value="autofill">My CareerZ records</option><option value="blank">Blank</option>
            {rows.map((r) => <option key={r._id} value={r._id}>Copy of “{r.name}”</option>)}
          </select></label>
          <button className="btn btn-primary" disabled={busy || rows.length >= 5}><FaPlus aria-hidden="true" /> Create</button>
        </form>
        {rows.length >= 5 && <p style={muted}>You have 5 versions — delete one to create another.</p>}
      </div>
      {rows.length === 0 && <p style={muted}>No CV versions yet.</p>}
      {rows.map((r) => (
        <div key={r._id} className="card" style={card}>
          <div className="flex items-center justify-between flex-wrap" style={{ gap: 10 }}>
            <div><strong>{r.name}</strong>{r.isDefault && <span className="vf-badge vf-ok" style={{ marginLeft: 8 }}>Default</span>}<p style={muted}>{r.targetRole || 'No target role'} · updated {fmt(r.updatedAt)}</p></div>
            <div className="flex flex-wrap" style={{ gap: 8 }}>
              <button type="button" className="btn btn-ghost vf-small" disabled={busy} onClick={() => run(() => apiRequest(`/resumes/variants/${r._id}/autofill`, { method: 'POST' }), 'Filled from your records.')}><FaWandMagicSparkles aria-hidden="true" /> Fill from records</button>
              {!r.isDefault && <button type="button" className="btn btn-ghost vf-small" disabled={busy} onClick={() => run(() => apiRequest(`/resumes/variants/${r._id}/default`, { method: 'POST' }), 'Default CV updated.')}><FaStar aria-hidden="true" /> Make default</button>}
              <button type="button" className="btn btn-ghost vf-small" onClick={() => setEditing(editing?._id === r._id ? null : { ...r, skillsText: (r.skills || []).join(', '), languagesText: (r.languages || []).join(', ') })}>{editing?._id === r._id ? 'Close' : 'Edit'}</button>
              <button type="button" className="btn btn-ghost vf-small" disabled={busy} onClick={() => { if (window.confirm(`Delete “${r.name}”?`)) run(() => apiRequest(`/resumes/variants/${r._id}`, { method: 'DELETE' }), 'CV version deleted.'); }}><FaTrash aria-hidden="true" /> Delete</button>
            </div>
          </div>
          {editing?._id === r._id ? (
            <form style={{ display: 'grid', gap: 10 }} onSubmit={(e) => { e.preventDefault(); run(() => apiRequest(`/resumes/variants/${r._id}`, { method: 'PATCH', body: { name: editing.name, targetRole: editing.targetRole, headline: editing.headline, summary: editing.summary, skills: toList(editing.skillsText), languages: toList(editing.languagesText) } }), 'CV version saved.').then(() => setEditing(null)); }}>
              <label className="text-xs">Name<input className="form-input" required maxLength={80} value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></label>
              <label className="text-xs">Target role<input className="form-input" maxLength={120} value={editing.targetRole || ''} onChange={(e) => setEditing({ ...editing, targetRole: e.target.value })} /></label>
              <label className="text-xs">Headline<input className="form-input" maxLength={160} value={editing.headline || ''} onChange={(e) => setEditing({ ...editing, headline: e.target.value })} /></label>
              <label className="text-xs">Summary<textarea className="form-input" rows={4} maxLength={3000} value={editing.summary || ''} onChange={(e) => setEditing({ ...editing, summary: e.target.value })} /></label>
              <label className="text-xs">Skills (comma separated)<input className="form-input" value={editing.skillsText} onChange={(e) => setEditing({ ...editing, skillsText: e.target.value })} /></label>
              <label className="text-xs">Languages (comma separated)<input className="form-input" value={editing.languagesText} onChange={(e) => setEditing({ ...editing, languagesText: e.target.value })} /></label>
              <button className="btn btn-primary" disabled={busy}>Save version</button>
            </form>
          ) : (
            <div style={{ ...muted, display: 'grid', gap: 4 }}>
              {r.headline && <span><strong>{r.headline}</strong></span>}
              <span>Education: {(r.education || []).map((e) => `${e.degree ? `${e.degree}, ` : ''}${e.institution} (${e.year})`).join(' · ') || '—'}</span>
              <span>Experience: {(r.experience || []).map((e) => `${e.title} — ${e.company}`).join(' · ') || '—'}</span>
              <span>Certifications: {(r.certifications || []).join(' · ') || '—'}</span>
              <span>Skills: {(r.skills || []).join(', ') || '—'}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Button for the main CV editor: fills only empty parts from verified records.
export function CvAutofillButton({ onFilled, onFlash }) {
  const [busy, setBusy] = useState(false);
  return (
    <button type="button" className="btn btn-outline" disabled={busy} onClick={async () => {
      setBusy(true);
      try { const r = await apiRequest('/resumes/me/autofill', { method: 'POST' }); onFilled(r.resume); onFlash(Object.keys(r.added).length ? 'CV filled from your CareerZ records. Review before saving.' : 'Nothing new to add from your records.', 'success'); }
      catch (e) { onFlash(e.message); } finally { setBusy(false); }
    }}><FaWandMagicSparkles aria-hidden="true" /> Fill from my records</button>
  );
}

// ------------------------------------------------------------------ Career roadmap
// A standard career plan for building a roadmap without AI: the usual stages from skills to
// applying, spread over the plan length. A starting point only; every step can be edited,
// removed or added to.
export function starterSteps(career, months) {
  const m = Math.max(1, Math.min(60, Number(months) || 6));
  const at = (fraction) => { const d = new Date(); d.setDate(d.getDate() + Math.round(m * 30 * fraction)); return d.toISOString().slice(0, 10); };
  const c = String(career || 'your target career').trim();
  return [
    { title: `Research the role: what a ${c} does, required qualifications and typical salary`, category: 'other', detail: 'Read 5-10 job posts on CareerZ for this role and note the skills and degrees they ask for.', targetDate: at(0.05) },
    { title: 'List the key skills the role needs and mark your gaps', category: 'skill', detail: 'Compare the skills in those job posts with the skills on your CV.', targetDate: at(0.12) },
    { title: 'Learn your most important missing skill', category: 'course', detail: 'Take a course (online or at your institute) and practise it every week.', targetDate: at(0.35) },
    { title: `Build a project or sample work that shows you can work as a ${c}`, category: 'project', detail: 'Add it to your Portfolio tab so employers can see it.', targetDate: at(0.55) },
    { title: 'Earn a certificate or qualification that employers in this field ask for', category: 'certification', detail: '', targetDate: at(0.7) },
    { title: 'Get practical experience: internship, volunteering, part-time or assistant work', category: 'experience', detail: "Check the Internships tab and your institute's Placement Office.", targetDate: at(0.8) },
    { title: `Update your CV and write a cover letter for ${c} roles`, category: 'other', detail: 'Use CV/Resume Builder and Cover Letters.', targetDate: at(0.88) },
    { title: `Apply to ${c} jobs and prepare for interviews`, category: 'experience', detail: 'Set a Job Alert for this role so new jobs reach you.', targetDate: at(1) }
  ].map((s) => ({ ...s, title: s.title.slice(0, 160) }));
}

// `onConnectAi` opens Career Tools, where the person connects their own AI key.
export function CareerRoadmapPanel({ onFlash, onConnectAi }) {
  const [rows, setRows] = useState(null);
  const [aiReady, setAiReady] = useState(null);
  useEffect(() => { apiRequest('/ai/config').then((s) => setAiReady(Boolean(s?.text?.configured))).catch(() => setAiReady(false)); }, []);
  const [form, setForm] = useState({ targetCareer: '', horizonMonths: 6, consent: false });
  const [step, setStep] = useState({});
  const [busy, setBusy] = useState(false);
  const load = () => apiRequest('/career-tools/roadmaps').then(setRows).catch((e) => onFlash(e.message));
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  async function run(fn, done) { setBusy(true); try { await fn(); if (done) onFlash(done, 'success'); await load(); return true; } catch (e) { onFlash(e.message); return false; } finally { setBusy(false); } }
  const body = { targetCareer: form.targetCareer, horizonMonths: Number(form.horizonMonths) };

  if (!rows) return <p role="status" className="admin-notice">Loading…</p>;
  return (
    <div className="career-roadmap-workspace" style={{ display: 'grid', gap: 16 }}>
      <div className="card" style={card}>
        <h3 style={{ margin: 0 }}><FaRoute aria-hidden="true" /> Career roadmap</h3>
        <p style={muted}>Plan the steps to the career you want. "Build without AI" gives you a ready plan with dates that you can change; or let your connected AI provider draft one. You can edit every step.</p>
        <div className="career-roadmap-fields" style={{ gap: 10 }}>
          <label className="text-xs" style={{ flex: '2 1 220px' }}>Target career<input className="form-input" maxLength={120} value={form.targetCareer} onChange={(e) => setForm({ ...form, targetCareer: e.target.value })} placeholder="e.g. Data Analyst" /></label>
          <label className="text-xs" style={{ flex: '1 1 120px' }}>Plan length (months)<input className="form-input" type="number" min={1} max={60} value={form.horizonMonths} onChange={(e) => setForm({ ...form, horizonMonths: e.target.value })} /></label>
          <button type="button" className="btn btn-outline" disabled={busy || !form.targetCareer.trim()} onClick={() => run(() => apiRequest('/career-tools/roadmaps', { method: 'POST', body: { ...body, steps: starterSteps(form.targetCareer, form.horizonMonths) } }), 'Roadmap created with suggested steps. Edit, remove or add steps.')}><FaPlus aria-hidden="true" /> Build without AI</button>
        </div>
        <label className="text-xs flex items-center career-roadmap-consent" style={{ gap: 8 }}><input type="checkbox" checked={form.consent} onChange={(e) => setForm({ ...form, consent: e.target.checked })} /> I agree that my program, skills and goal are sent to my AI provider to draft this roadmap.</label>
        {aiReady === false && <p className="text-xs" style={{ margin: 0 }}>To draft with AI, first connect your own AI key (OpenAI, Gemini, Claude…) in <button type="button" className="btn" style={{ padding: '2px 10px', fontSize: '0.75rem' }} onClick={() => onConnectAi?.()}>Career Tools → AI provider</button>. Building manually needs no key.</p>}
        <div><button type="button" className="btn btn-primary" disabled={busy || !aiReady || !form.targetCareer.trim() || !form.consent} onClick={() => run(() => apiRequest('/career-tools/roadmaps/generate', { method: 'POST', body: { ...body, dataConsent: true } }), 'Roadmap drafted. Review the steps.')}><FaWandMagicSparkles aria-hidden="true" /> Draft with AI</button>{aiReady && (!form.targetCareer.trim() || !form.consent) && <small style={{ marginLeft: 10, color: 'var(--ink-soft)' }}>{!form.targetCareer.trim() ? 'Enter the target career first.' : 'Tick the box above to allow sending your details to your AI provider.'}</small>}</div>
      </div>
      {rows.length === 0 && <p className="career-roadmap-empty" style={muted}>No roadmaps yet. Choose a target career to create your first plan.</p>}
      {rows.map((r) => {
        const done = r.steps.filter((s) => s.status === 'done').length;
        const draft = step[r._id] || { title: '', category: 'skill', targetDate: '' };
        return (
          <div key={r._id} className="card" style={card}>
            <div className="flex items-center justify-between flex-wrap" style={{ gap: 10 }}>
              <div><strong>{r.targetCareer}</strong> <span className="vf-badge vf-neutral">{r.source === 'ai' ? 'AI draft' : 'Manual'}</span><p style={muted}>{done} of {r.steps.length} steps done · {r.horizonMonths}-month plan</p></div>
              <button type="button" className="btn btn-ghost vf-small" disabled={busy} onClick={() => { if (window.confirm('Delete this roadmap?')) run(() => apiRequest(`/career-tools/roadmaps/${r._id}`, { method: 'DELETE' }), 'Roadmap deleted.'); }}><FaTrash aria-hidden="true" /> Delete</button>
            </div>
            <div className="vf-progress"><span style={{ width: `${r.steps.length ? Math.round((done / r.steps.length) * 100) : 0}%` }} /></div>
            {r.steps.length === 0 && <button type="button" className="btn btn-outline vf-small" style={{ justifySelf: 'start' }} disabled={busy} onClick={() => run(() => apiRequest(`/career-tools/roadmaps/${r._id}`, { method: 'PATCH', body: { steps: starterSteps(r.targetCareer, r.horizonMonths) } }), 'Suggested steps added.')}><FaPlus aria-hidden="true" /> Add suggested steps</button>}
            <ol style={{ margin: 0, paddingLeft: 18, display: 'grid', gap: 8 }}>
              {r.steps.map((s) => (
                <li key={s._id}>
                  <div className="flex items-center justify-between flex-wrap" style={{ gap: 8 }}>
                    <span><strong style={{ textDecoration: s.status === 'done' ? 'line-through' : 'none' }}>{s.title}</strong> <span style={muted}>· {s.category}{s.targetDate ? ` · by ${fmt(s.targetDate)}` : ''}</span></span>
                    <select className="form-select" aria-label={`Status of ${s.title}`} style={{ width: 'auto' }} value={s.status} disabled={busy} onChange={(e) => run(() => apiRequest(`/career-tools/roadmaps/${r._id}/steps/${s._id}`, { method: 'PATCH', body: { status: e.target.value } }))}>
                      <option value="todo">To do</option><option value="in_progress">In progress</option><option value="done">Done</option>
                    </select>
                  </div>
                  {s.detail && <p style={muted}>{s.detail}</p>}
                  <button type="button" className="btn btn-ghost vf-small" disabled={busy} onClick={() => run(() => apiRequest(`/career-tools/roadmaps/${r._id}`, { method: 'PATCH', body: { steps: r.steps.filter((x) => x._id !== s._id) } }), 'Step removed.')}>Remove</button>
                </li>
              ))}
            </ol>
            <form className="flex flex-wrap items-end" style={{ gap: 8 }} onSubmit={(e) => { e.preventDefault(); run(() => apiRequest(`/career-tools/roadmaps/${r._id}`, { method: 'PATCH', body: { steps: [...r.steps, { ...draft, targetDate: draft.targetDate || null }] } }), 'Step added.').then((ok) => ok && setStep({ ...step, [r._id]: undefined })); }}>
              <label className="text-xs" style={{ flex: '2 1 200px' }}>New step<input className="form-input" required maxLength={160} value={draft.title} onChange={(e) => setStep({ ...step, [r._id]: { ...draft, title: e.target.value } })} /></label>
              <label className="text-xs" style={{ flex: '1 1 130px' }}>Type<select className="form-select" value={draft.category} onChange={(e) => setStep({ ...step, [r._id]: { ...draft, category: e.target.value } })}>{['skill', 'course', 'project', 'certification', 'experience', 'other'].map((c) => <option key={c} value={c}>{c}</option>)}</select></label>
              <label className="text-xs" style={{ flex: '1 1 140px' }}>Target date<input className="form-input" type="date" value={draft.targetDate} onChange={(e) => setStep({ ...step, [r._id]: { ...draft, targetDate: e.target.value } })} /></label>
              <button className="btn btn-outline vf-small" disabled={busy}><FaPlus aria-hidden="true" /> Add step</button>
            </form>
          </div>
        );
      })}
    </div>
  );
}

// ------------------------------------------------------------------ Internship certificates
export function MyInternshipCertificates({ onFlash }) {
  const [rows, setRows] = useState(null);
  useEffect(() => { apiRequest('/career-tools/internship-certificates/mine').then(setRows).catch((e) => onFlash(e.message)); }, [onFlash]);
  if (!rows || rows.length === 0) return null;
  return (
    <div className="card" style={{ ...card, marginTop: 20 }}>
      <h3 style={{ margin: 0 }}><FaAward aria-hidden="true" /> Internship certificates</h3>
      {rows.map((c) => (
        <div key={c._id} className="flex items-center flex-wrap" style={{ gap: 14, borderTop: '1px solid var(--sand-line)', paddingTop: 12 }}>
          <img src={c.qrDataUrl} alt={`Verification QR code for ${c.role} internship`} width={84} height={84} />
          <div style={{ flex: 1, minWidth: 200 }}>
            <strong>{c.role} — {c.organization}</strong> {c.status === 'revoked' && <span className="vf-badge vf-bad">Revoked</span>}
            <p style={muted}>{fmt(c.startDate)} – {fmt(c.endDate)}{c.hours ? ` · ${c.hours} hours` : ''} · issued by {c.issuerType === 'employer' ? 'the employer' : 'your institution'}</p>
            {c.remarks && <p style={muted}>{c.remarks}</p>}
            <a href={c.verifyUrl} target="_blank" rel="noreferrer" className="text-xs" style={{ color: 'var(--emerald)' }}>Public verification link</a>
          </div>
        </div>
      ))}
    </div>
  );
}

function CertificateFields({ form, setForm, withPlacement }) {
  const f = (k, label, props = {}) => <label className="text-xs" style={{ flex: '1 1 160px' }}>{label}<input className="form-input" value={form[k] || ''} onChange={(e) => setForm({ ...form, [k]: e.target.value })} {...props} /></label>;
  return (
    <div className="flex flex-wrap" style={{ gap: 10 }}>
      {withPlacement && f('organization', 'Host organization', { required: true, maxLength: 160 })}
      {withPlacement && f('role', 'Internship role', { required: true, maxLength: 160 })}
      {f('startDate', 'Start date', { type: 'date', required: true })}
      {f('endDate', 'End date', { type: 'date', required: true, max: new Date().toISOString().slice(0, 10) })}
      {f('hours', 'Hours (optional)', { type: 'number', min: 0, max: 5000 })}
      {f('skills', 'Skills shown (comma separated)')}
      <label className="text-xs" style={{ flex: '1 1 100%' }}>Remarks<textarea className="form-input" rows={2} maxLength={1000} value={form.remarks || ''} onChange={(e) => setForm({ ...form, remarks: e.target.value })} /></label>
    </div>
  );
}

// Employer: issue a completion certificate to a hired intern (inline on the applicant row).
export function IssueInternshipCertificate({ applicationId, onFlash }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({});
  const [issued, setIssued] = useState(null);
  if (issued) return <a className="btn btn-ghost vf-small" href={issued.verifyUrl} target="_blank" rel="noreferrer"><FaCircleCheck aria-hidden="true" /> Certificate issued</a>;
  if (!open) return <button type="button" className="btn btn-outline" style={{ padding: '8px 14px', fontSize: '0.75rem' }} onClick={() => setOpen(true)}><FaAward aria-hidden="true" /> Issue internship certificate</button>;
  return (
    <form style={{ display: 'grid', gap: 10, width: '100%' }} onSubmit={async (e) => {
      e.preventDefault();
      try { setIssued(await apiRequest('/career-tools/internship-certificates/employer', { method: 'POST', body: { ...form, applicationId } })); onFlash('Internship certificate issued.', 'success'); } catch (err) { onFlash(err.message); }
    }}>
      <CertificateFields form={form} setForm={setForm} />
      <div className="flex" style={{ gap: 8 }}><button className="btn btn-primary vf-small">Issue certificate</button><button type="button" className="btn btn-ghost vf-small" onClick={() => setOpen(false)}>Cancel</button></div>
    </form>
  );
}

// Institution placement office: issue for a current or former student.
export function InstitutionInternshipCertificate({ institutionId, StudentSelect, onFlash }) {
  const [form, setForm] = useState({ studentId: '' });
  const [rows, setRows] = useState([]);
  const load = () => apiRequest('/career-tools/internship-certificates/issued').then(setRows).catch(() => setRows([]));
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="card" style={{ ...card, marginTop: 20 }}>
      <h3 style={{ margin: 0 }}><FaAward aria-hidden="true" /> Internship completion certificates</h3>
      <form style={{ display: 'grid', gap: 10 }} onSubmit={async (e) => {
        e.preventDefault();
        try { await apiRequest('/career-tools/internship-certificates/institution', { method: 'POST', body: { ...form, institutionId } }); onFlash('Internship certificate issued.', 'success'); setForm({ studentId: '' }); load(); } catch (err) { onFlash(err.message); }
      }}>
        <div className="text-xs">Student<StudentSelect institutionId={institutionId} value={form.studentId} onChange={(v) => setForm({ ...form, studentId: v })} /></div>
        <CertificateFields form={form} setForm={setForm} withPlacement />
        <div><button className="btn btn-primary">Issue certificate</button></div>
      </form>
      {rows.filter((r) => r.issuerType === 'institution').map((r) => (
        <div key={r._id} className="flex items-center justify-between flex-wrap" style={{ gap: 8, borderTop: '1px solid var(--sand-line)', paddingTop: 10 }}>
          <span>{r.student?.fullName} — {r.role}, {r.organization} <span style={muted}>({fmt(r.endDate)})</span> {r.status === 'revoked' && <span className="vf-badge vf-bad">Revoked</span>}</span>
          {r.status === 'active' && <button type="button" className="btn btn-ghost vf-small" onClick={async () => { const reason = window.prompt('Reason for revoking this certificate?'); if (!reason) return; try { await apiRequest(`/career-tools/internship-certificates/${r._id}/revoke`, { method: 'PATCH', body: { reason } }); load(); } catch (err) { onFlash(err.message); } }}>Revoke</button>}
        </div>
      ))}
    </div>
  );
}

