import { useEffect, useState } from 'react';
import { apiRequest, API_BASE, session } from '../../api/client';
import { showConfirm, showPrompt } from '../../utils/appDialog';
import '../../styles/visa.css';

// Master 13.7 Visa & Recruitment Support Center on the screens: country rules, verified visa
// consultants, the AI visa assistant (information only), visa case tracking and the admin desk.

export const STAGE_LABEL = { documents_submitted: 'Documents submitted', employer_verified: 'Employer verified', agency_verified: 'Agency verified', interview_completed: 'Interview completed', offer_letter_received: 'Offer letter received', visa_processing: 'Visa processing', visa_approved: 'Visa approved', travel_completed: 'Travel completed' };
const STATUS = { active: ['warn', 'In progress'], approved: ['good', 'Visa approved'], refused: ['bad', 'Visa refused'], closed: ['', 'Closed'] };
const FIELDS = [['workPermit', 'Work permit'], ['visaRules', 'Visa rules'], ['immigrationRules', 'Immigration rules'], ['laborLaws', 'Labour laws'], ['salaryStandards', 'Salary standards'], ['contractRules', 'Contract rules'], ['workingHours', 'Working hours'], ['ageRequirements', 'Age requirements']];
const date = (d) => (d ? new Date(d).toLocaleDateString() : '');
const readFile = (file) => new Promise((resolve, reject) => { const r = new FileReader(); r.onload = () => resolve(r.result); r.onerror = reject; r.readAsDataURL(file); });
export const LEGAL = 'CareerZ is a technology platform only. It is never a visa agency. Visa and immigration approval, and every government decision, is made only by the government concerned. CareerZ never collects government visa fees: those are paid on the official government portal. CareerZ only charges its own platform, verification or premium service fees.';

// ---------------------------------------------------------------- public: Visa Center
export function VisaCenter({ onFlash = (m) => window.alert(m) }) {
  const [rules, setRules] = useState(null), [code, setCode] = useState(''), [consultants, setConsultants] = useState([]), [q, setQ] = useState(''), [answer, setAnswer] = useState(null), [busy, setBusy] = useState(false);
  useEffect(() => { apiRequest('/visa/countries', { auth: false }).then((r) => { setRules(r); setCode(r[0]?.country || ''); }).catch(() => setRules([])); }, []);
  useEffect(() => { apiRequest(`/visa/consultants${code ? `?country=${code}` : ''}`, { auth: false }).then(setConsultants).catch(() => setConsultants([])); }, [code]);
  const rule = (rules || []).find((r) => r.country === code);
  async function ask(e) {
    e.preventDefault();
    if (!session.getAccessToken()) return onFlash('Log in to ask the AI visa assistant (it uses your own AI key from AI Settings).');
    setBusy(true);
    try { setAnswer(await apiRequest('/visa/ask', { method: 'POST', body: { country: code, question: q } })); } catch (err) { onFlash(err.message); } finally { setBusy(false); }
  }
  return (
    <div className="vz-wrap">
      <p className="vz-legal">{LEGAL}</p>
      {rules === null ? <p>Loading…</p> : !rules.length ? <p className="vz-muted">No country rules are published yet.</p> : (
        <>
          <div className="vz-countries">{rules.map((r) => <button key={r.country} type="button" className={`vz-country${code === r.country ? ' on' : ''}`} onClick={() => { setCode(r.country); setAnswer(null); }}>{r.name}</button>)}</div>
          {rule && (
            <section className="card vz-rule">
              <h2>{rule.name}</h2>
              {rule.visaTypes?.length > 0 && <p><b>Visa types:</b> {rule.visaTypes.join(' · ')}</p>}
              {rule.requiredDocuments?.length > 0 && <div><b>Documents usually needed</b><ul>{rule.requiredDocuments.map((d) => <li key={d}>{d}</li>)}</ul></div>}
              <div className="vz-rule-grid">{FIELDS.filter(([k]) => rule[k]).map(([k, l]) => <div key={k}><b>{l}</b><p>{rule[k]}</p></div>)}</div>
              {rule.officialLinks?.length > 0 && <p className="vz-links"><b>Official government websites:</b> {rule.officialLinks.map((l) => <a key={l.url} href={l.url} target="_blank" rel="noreferrer">{l.label}</a>)}</p>}
              <small className="vz-muted">Last updated {date(rule.updatedAt)}. Always check the official website before you apply.</small>
            </section>
          )}
        </>
      )}
      <section className="card vz-ask">
        <h3>AI Visa Assistant</h3>
        <p className="vz-muted">Ask about documents, eligibility, visa types, government steps or work permits. The assistant only gives information; it never approves or promises a visa.</p>
        <form onSubmit={ask} className="vz-ask-form"><textarea className="form-input" rows={2} value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. What do I need for a nurse job in Dubai?" /><button type="submit" className="btn btn-primary" disabled={busy || q.trim().length < 5}>{busy ? 'Thinking…' : 'Ask'}</button></form>
        {answer && <div className="vz-answer"><p>{answer.answer}</p><small>{answer.disclaimer}</small></div>}
      </section>
      <section className="card vz-consultants">
        <h3>Verified visa consultants{rule ? ` for ${rule.name}` : ''}</h3>
        <p className="vz-muted">Only consultants whose government licence CareerZ checked are listed. Never pay anyone who promises a guaranteed visa.</p>
        {!consultants.length ? <p className="vz-muted">No verified consultant listed yet.</p> : <div className="vz-cards">{consultants.map((c) => <div key={c._id} className="vz-card"><strong>{c.fullName} ✓</strong><small>Licence {c.licenseNo} · {c.city || c.country}</small><small>Countries: {(c.countries || []).join(', ') || '—'}</small></div>)}</div>}
      </section>
    </div>
  );
}

// ---------------------------------------------------------------- visa cases (candidate, hiring side, consultant)
function VisaCaseCard({ c: initial, onFlash, onChanged }) {
  const [c, setC] = useState(initial), [open, setOpen] = useState(false), [consultants, setConsultants] = useState(null), [docName, setDocName] = useState(''), [busy, setBusy] = useState(false);
  async function reload() { try { setC(await apiRequest(`/visa/cases/${c._id}`)); onChanged?.(); } catch (e) { onFlash(e.message); } }
  useEffect(() => { if (open && !c.side) reload(); }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  const side = c.side;
  const canTick = ['hiring', 'consultant', 'admin'].includes(side) && ['active', 'approved'].includes(c.status);
  async function tick(key, done) {
    const note = done ? await showPrompt(`${STAGE_LABEL[key]}: add a note for the candidate (optional).`, { title: 'Update step', placeholder: 'Note', confirmLabel: 'Save' }) : '';
    if (note === null) return;
    try { setC(await apiRequest(`/visa/cases/${c._id}/stage`, { method: 'PATCH', body: { key, done, note } }).then(() => apiRequest(`/visa/cases/${c._id}`))); onFlash('Step updated. The candidate has been told.', 'success'); } catch (e) { onFlash(e.message); }
  }
  async function outcome(status) {
    if (!(await showConfirm(`Mark this visa case as ${status}?`, { title: 'Visa case', confirmLabel: 'Yes', danger: status === 'refused' }))) return;
    const note = await showPrompt('Note for the candidate (optional).', { title: 'Note', placeholder: 'Note' });
    if (note === null) return;
    try { await apiRequest(`/visa/cases/${c._id}/outcome`, { method: 'PATCH', body: { status, note } }); await reload(); onFlash('Saved.', 'success'); } catch (e) { onFlash(e.message); }
  }
  async function upload(e) {
    const f = e.target.files?.[0]; e.target.value = '';
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) return onFlash('Each document must be 5 MB or smaller.');
    if (docName.trim().length < 2) return onFlash('Write the document name first, e.g. Passport.');
    setBusy(true);
    try { await apiRequest(`/visa/cases/${c._id}/documents`, { method: 'POST', body: { name: docName, file: { name: f.name, data: await readFile(f) } } }); setDocName(''); await reload(); onFlash('Document added.', 'success'); } catch (err) { onFlash(err.message); } finally { setBusy(false); }
  }
  async function openDoc(i) {
    const win = window.open('', '_blank');
    try { const r = await fetch(`${API_BASE}/visa/cases/${c._id}/documents/${i}`, { headers: { Authorization: `Bearer ${session.getAccessToken()}` } }); if (!r.ok) throw new Error('Could not open the document.'); win.location.href = URL.createObjectURL(await r.blob()); } catch (e) { win?.close(); onFlash(e.message); }
  }
  async function pickConsultant(id) {
    try { await apiRequest(`/visa/cases/${c._id}/consultant`, { method: 'PATCH', body: { consultant: id || null } }); await reload(); onFlash('Consultant updated.', 'success'); } catch (e) { onFlash(e.message); }
  }
  const done = (c.stages || []).filter((s) => s.done).length;
  const s = STATUS[c.status] || ['', c.status];
  return (
    <article className="card vz-case">
      <div className="vz-case-top"><div><strong>{c.job?.title} · {c.job?.company}</strong><small>{c.candidate?.fullName} → {c.destination}{c.visaType ? ` · ${c.visaType}` : ''}{c.consultant?.fullName ? ` · consultant ${c.consultant.fullName}` : ''}</small></div><span className={`vz-chip ${s[0]}`}>{s[1]}</span></div>
      <div className="vz-progress"><span style={{ width: `${Math.round(100 * done / 8)}%` }} /></div>
      <small className="vz-muted">{done} of 8 steps done</small>
      {!open ? <div className="vz-actions"><button type="button" className="btn btn-primary" onClick={() => setOpen(true)}>Open case</button></div> : (
        <>
          <ol className="vz-steps">{(c.stages || []).map((st) => <li key={st.key} className={st.done ? 'done' : ''}><span>{st.done ? '✓' : '○'} {STAGE_LABEL[st.key]}</span><small>{st.done ? `${date(st.at)}${st.note ? ` · ${st.note}` : ''}` : ''}</small>{canTick && <button type="button" className="btn" onClick={() => tick(st.key, !st.done)}>{st.done ? 'Undo' : 'Mark done'}</button>}</li>)}</ol>
          <div className="vz-docs"><b>Documents</b>{!(c.documents || []).length && <small className="vz-muted">No documents yet.</small>}{(c.documents || []).map((d, i) => <div key={i} className="vz-doc"><span>{d.name}</span><small>{date(d.at)}</small><button type="button" className="btn" onClick={() => openDoc(i)}>Open</button></div>)}
            {['candidate', 'consultant', 'hiring'].includes(side) && <div className="vz-upload"><input className="form-input" value={docName} onChange={(e) => setDocName(e.target.value)} placeholder="Document name, e.g. Passport" /><label className="btn">{busy ? 'Uploading…' : 'Upload (PDF or photo)'}<input type="file" hidden accept="application/pdf,image/png,image/jpeg,image/webp" onChange={upload} /></label></div>}
          </div>
          {['hiring', 'admin', 'candidate'].includes(side) && (
            <div className="vz-consult"><b>Visa consultant</b>
              {consultants === null ? <button type="button" className="btn" onClick={() => apiRequest(`/visa/consultants?country=${c.destination}`, { auth: false }).then(setConsultants).catch(() => setConsultants([]))}>{c.consultant ? 'Change consultant' : 'Choose a verified consultant'}</button>
                : <select className="form-select" value={c.consultant?._id || ''} onChange={(e) => pickConsultant(e.target.value)}><option value="">No consultant</option>{consultants.map((x) => <option key={x._id} value={x._id}>{x.fullName} (licence {x.licenseNo})</option>)}</select>}
            </div>
          )}
          {['hiring', 'consultant', 'admin'].includes(side) && ['active', 'approved'].includes(c.status) && <div className="vz-actions"><button type="button" className="btn btn-primary" onClick={() => outcome('approved')}>Visa approved</button><button type="button" className="btn staff-remove" onClick={() => outcome('refused')}>Visa refused</button><button type="button" className="btn" onClick={() => outcome('closed')}>Close case</button></div>}
          {(c.history || []).length > 0 && <details className="vz-history"><summary>History</summary>{c.history.slice().reverse().map((h, i) => <small key={i}>{new Date(h.at).toLocaleString()} · {h.text}</small>)}</details>}
          <p className="vz-legal small">{LEGAL}</p>
          <div className="vz-actions"><button type="button" className="btn" onClick={() => setOpen(false)}>Close</button></div>
        </>
      )}
    </article>
  );
}

export function VisaCases({ onFlash }) {
  const [rows, setRows] = useState(null);
  function load() { apiRequest('/visa/cases/mine').then(setRows).catch((e) => { setRows([]); onFlash(e.message); }); }
  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="vz-wrap">
      <div><h3 style={{ margin: 0 }}>Visa cases</h3><p className="vz-muted">Every step of a visa for a job abroad: documents, employer and agency checks, interview, offer letter, processing, approval and travel. <a href="/visa">Visa Center: country rules and AI assistant</a></p></div>
      {rows === null ? <p>Loading…</p> : !rows.length ? <p className="vz-muted">No visa case yet. The employer or agent opens one when you are selected for a job abroad.</p> : rows.map((c) => <VisaCaseCard key={c._id} c={c} onFlash={onFlash} onChanged={load} />)}
    </div>
  );
}

// On an applicant card of a job abroad / with visa sponsorship.
export function StartVisaCase({ application, job, onFlash }) {
  const abroad = job?.visaSponsorship || (application?.applicant?.country && job?.country && String(application.applicant.country).toUpperCase() !== String(job.country).toUpperCase());
  if (!abroad || !['interview', 'final_interview', 'selected', 'accepted', 'hired'].includes(application?.status)) return null;
  async function start() {
    const visaType = await showPrompt('Which visa? (e.g. Employment visa). The candidate is told and can upload documents.', { title: 'Open visa case', placeholder: 'Visa type', confirmLabel: 'Open case' });
    if (visaType === null) return;
    try { await apiRequest(`/visa/applications/${application._id}/case`, { method: 'POST', body: { visaType } }); onFlash('Visa case opened. Follow it in Visa cases.', 'success'); } catch (e) { onFlash(e.message); }
  }
  return <button type="button" className="btn" onClick={start}>Open visa case</button>;
}

// ---------------------------------------------------------------- admin
const EMPTY_RULE = { country: '', name: '', visaTypes: '', requiredDocuments: '', officialLinks: '', ...Object.fromEntries(FIELDS.map(([k]) => [k, ''])) };
export function AdminVisaPanel({ onFlash }) {
  const [view, setView] = useState('countries'), [rules, setRules] = useState(null), [form, setForm] = useState(null), [agents, setAgents] = useState(null), [q, setQ] = useState(''), [cases, setCases] = useState(null);
  function load() { apiRequest('/visa/countries').then(setRules).catch(() => setRules([])); }
  useEffect(load, []);
  useEffect(() => { if (view === 'cases') apiRequest('/visa/admin/cases').then(setCases).catch(() => setCases([])); if (view === 'consultants') searchAgents(); }, [view]); // eslint-disable-line react-hooks/exhaustive-deps
  function searchAgents() { apiRequest(`/visa/admin/agents?q=${encodeURIComponent(q)}`).then(setAgents).catch((e) => onFlash(e.message)); }
  async function save(e) {
    e.preventDefault();
    const lines = (s) => String(s || '').split('\n').map((x) => x.trim()).filter(Boolean);
    const body = { ...form, visaTypes: lines(form.visaTypes), requiredDocuments: lines(form.requiredDocuments), officialLinks: lines(form.officialLinks).map((l) => { const [label, url] = l.includes('|') ? l.split('|').map((x) => x.trim()) : [l, l]; return { label, url }; }) };
    try { await apiRequest('/visa/admin/countries', { method: 'PUT', body }); onFlash('Country rules saved.', 'success'); setForm(null); load(); } catch (err) { onFlash(err.message); }
  }
  async function remove(r) {
    if (!(await showConfirm(`Remove the rules for ${r.name}?`, { title: 'Remove', confirmLabel: 'Remove', danger: true }))) return;
    try { await apiRequest(`/visa/admin/countries/${r.country}`, { method: 'DELETE' }); load(); } catch (err) { onFlash(err.message); }
  }
  async function verify(a, on) {
    const licenseNo = on ? await showPrompt('Enter the government recruitment / consultancy licence number you checked.', { title: 'Verify visa consultant', placeholder: 'Licence number', required: true }) : '';
    if (on && !licenseNo) return;
    const countries = on ? await showPrompt('Countries they handle (codes, comma separated, e.g. AE, SA, QA).', { title: 'Countries', placeholder: 'AE, SA' }) : '';
    if (countries === null) return;
    try { await apiRequest(`/visa/admin/consultants/${a._id}`, { method: 'PATCH', body: { verified: on, licenseNo, countries: String(countries || '').split(',').map((x) => x.trim()).filter(Boolean) } }); onFlash('Saved.', 'success'); searchAgents(); } catch (err) { onFlash(err.message); }
  }
  const toForm = (r) => ({ ...EMPTY_RULE, ...r, visaTypes: (r.visaTypes || []).join('\n'), requiredDocuments: (r.requiredDocuments || []).join('\n'), officialLinks: (r.officialLinks || []).map((l) => `${l.label} | ${l.url}`).join('\n') });
  return (
    <div className="vz-wrap">
      <nav className="cz-tabbar">{[['countries', 'Country rules'], ['consultants', 'Visa consultants'], ['cases', 'Visa cases']].map(([k, l]) => <button key={k} type="button" className={`cz-tab${view === k ? ' active' : ''}`} aria-pressed={view === k} onClick={() => setView(k)}>{l}</button>)}</nav>
      {view === 'countries' && !form && <>
        <div className="vz-actions"><button type="button" className="btn btn-primary" onClick={() => setForm({ ...EMPTY_RULE })}>Add a country</button></div>
        {rules === null ? <p>Loading…</p> : !rules.length ? <p className="vz-muted">No countries yet. Add the countries people go to for work (e.g. Saudi Arabia, UAE, Qatar, UK).</p> : <div className="vz-cards">{rules.map((r) => <div key={r.country} className="card vz-card"><strong>{r.name} ({r.country})</strong><small>{(r.visaTypes || []).length} visa types · {(r.requiredDocuments || []).length} documents · updated {date(r.updatedAt)}</small><div className="vz-actions"><button type="button" className="btn" onClick={() => setForm(toForm(r))}>Edit</button><button type="button" className="btn staff-remove" onClick={() => remove(r)}>Remove</button></div></div>)}</div>}
      </>}
      {view === 'countries' && form && (
        <form className="card vz-form" onSubmit={save}>
          <div className="vz-grid"><label>Country code<input className="form-input" required maxLength={2} value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value.toUpperCase() })} placeholder="AE" /></label><label>Country name<input className="form-input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label></div>
          <div className="vz-grid">{FIELDS.map(([k, l]) => <label key={k}>{l}<textarea className="form-input" rows={3} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} /></label>)}</div>
          <div className="vz-grid"><label>Visa types (one per line)<textarea className="form-input" rows={3} value={form.visaTypes} onChange={(e) => setForm({ ...form, visaTypes: e.target.value })} /></label><label>Documents usually needed (one per line)<textarea className="form-input" rows={3} value={form.requiredDocuments} onChange={(e) => setForm({ ...form, requiredDocuments: e.target.value })} /></label><label>Official websites (one per line: Name | https://…)<textarea className="form-input" rows={3} value={form.officialLinks} onChange={(e) => setForm({ ...form, officialLinks: e.target.value })} /></label></div>
          <div className="vz-actions"><button type="submit" className="btn btn-primary">Save</button><button type="button" className="btn" onClick={() => setForm(null)}>Cancel</button></div>
        </form>
      )}
      {view === 'consultants' && <>
        <form className="vz-search" onSubmit={(e) => { e.preventDefault(); searchAgents(); }}><input className="form-input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Agent name or email" /><button type="submit" className="btn">Search</button></form>
        {!agents ? <p>Loading…</p> : <div className="vz-cards">{agents.map((a) => <div key={a._id} className="card vz-card"><strong>{a.fullName}{a.visaConsultant?.verified ? ' ✓' : ''}</strong><small>{a.email}{a.visaConsultant?.licenseNo ? ` · licence ${a.visaConsultant.licenseNo}` : ''}</small>{a.visaConsultant?.verified && <small>Countries: {(a.visaConsultant.countries || []).join(', ') || '—'}</small>}<div className="vz-actions">{a.visaConsultant?.verified ? <button type="button" className="btn staff-remove" onClick={() => verify(a, false)}>Remove badge</button> : <button type="button" className="btn btn-primary" onClick={() => verify(a, true)}>Verify as visa consultant</button>}</div></div>)}</div>}
      </>}
      {view === 'cases' && (cases === null ? <p>Loading…</p> : !cases.length ? <p className="vz-muted">No visa cases yet.</p> : cases.map((c) => <VisaCaseCard key={c._id} c={c} onFlash={onFlash} />))}
    </div>
  );
}
