import { useEffect, useState } from 'react';
import { apiRequest } from '../../api/client';
import { showConfirm } from '../../utils/appDialog';
import '../../styles/invite.css';

// Institute: invite teachers, staff and students by email (one, or many pasted from Excel).
// Each person gets an email with a "Join" link; new people create their account in one step and
// land on their dashboard already connected; existing CareerZ users sign in and accept.
const KINDS = [['teacher', 'Teachers'], ['staff', 'Staff'], ['student', 'Students']];
const STATUS = { sent: ['pending', 'Waiting'], accepted: ['approved', 'Joined'], cancelled: ['', 'Cancelled'], expired: ['rejected', 'Expired'], declined: ['rejected', 'Declined'] };
const date = (d) => (d ? new Date(d).toLocaleDateString() : '');

// "Name, email" lines (or just emails), as pasted from Excel / Google Sheets.
function parseList(text) {
  return String(text || '').split(/\r?\n/).map((line) => line.split(/[,\t;]/).map((x) => x.trim()).filter(Boolean)).filter((p) => p.length).map((parts) => {
    const email = parts.find((p) => p.includes('@')) || '';
    const name = parts.find((p) => !p.includes('@')) || '';
    return { email, name };
  });
}

export default function InvitePeople({ institution, onFlash }) {
  const [kind, setKind] = useState('teacher'), [list, setList] = useState(null), [roles, setRoles] = useState([]), [sections, setSections] = useState([]);
  const [f, setF] = useState({ emails: '', role: 'accountant', designation: '', department: '', classSection: '', program: '', message: '' });
  const [busy, setBusy] = useState(false), [results, setResults] = useState(null);
  const load = () => apiRequest(`/institutions/${institution._id}/invites?kind=${kind}`).then(setList).catch((e) => { onFlash(e.message); setList([]); });
  useEffect(() => { load(); setResults(null); }, [kind]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    apiRequest('/institutions/staff-roles').then((r) => setRoles((r.roles || []).filter((x) => x.key !== 'teacher'))).catch(() => {});
    apiRequest(`/institutions/${institution._id}/class-sections`).then(setSections).catch(() => {});
  }, [institution._id]);

  async function send(e) {
    e.preventDefault();
    const people = parseList(f.emails);
    if (!people.length) return onFlash('Write at least one email.');
    setBusy(true);
    try {
      const invites = people.map((p) => ({ ...p, kind, ...(kind === 'staff' ? { role: f.role } : {}), ...(kind !== 'student' ? { designation: f.designation, department: f.department } : { classSection: f.classSection || undefined, program: f.program }) }));
      const r = await apiRequest(`/institutions/${institution._id}/invites`, { method: 'POST', body: { invites, message: f.message } });
      setResults(r.results); onFlash(`${r.sent} invitation${r.sent === 1 ? '' : 's'} sent${r.failed ? `, ${r.failed} not sent` : ''}.`, r.failed ? undefined : 'success');
      if (r.sent) setF((x) => ({ ...x, emails: '' }));
      load();
    } catch (err) { onFlash(err.message); } finally { setBusy(false); }
  }
  async function resend(inv) { try { await apiRequest(`/institutions/${institution._id}/invites/${inv._id}/resend`, { method: 'POST' }); onFlash('Invitation sent again.', 'success'); load(); } catch (e) { onFlash(e.message); } }
  async function cancel(inv) {
    if (!(await showConfirm(`Cancel the invitation to ${inv.email}?`))) return;
    try { await apiRequest(`/institutions/${institution._id}/invites/${inv._id}`, { method: 'DELETE' }); load(); } catch (e) { onFlash(e.message); }
  }

  return (
    <div className="inv-panel">
      <section className="card" style={{ padding: 18 }}>
        <h3 style={{ marginTop: 0 }}>Invite people to {institution.name}</h3>
        <p className="inv-hint">Each person gets an email with a <b>Join</b> button. New people only choose a password (or use Google) and their dashboard opens already connected to {institution.name}. People already on CareerZ sign in with that email and accept.</p>
        <div className="inv-tabs" style={{ margin: '12px 0' }}>{KINDS.map(([k, l]) => <button key={k} type="button" className={kind === k ? 'on' : ''} onClick={() => setKind(k)}>{l}</button>)}</div>
        <form className="inv-form" onSubmit={send}>
          <label>Email addresses
            <textarea className="form-input" rows={5} value={f.emails} onChange={(e) => setF({ ...f, emails: e.target.value })} placeholder={'ali.raza@gmail.com\nSana Khan, sana.khan@gmail.com\n(one per line; you can paste "Name, Email" rows from Excel)'} />
          </label>
          <div className="inv-row">
            {kind === 'staff' && <label>Role<select className="form-input" value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })}>{roles.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}</select></label>}
            {kind !== 'student' && <label>Designation (optional)<input className="form-input" value={f.designation} onChange={(e) => setF({ ...f, designation: e.target.value })} placeholder={kind === 'teacher' ? 'e.g. Lecturer, Senior Teacher' : 'e.g. Head of Accounts'} /></label>}
            {kind !== 'student' && <label>Department (optional)<input className="form-input" value={f.department} onChange={(e) => setF({ ...f, department: e.target.value })} placeholder="e.g. Computer Science" /></label>}
            {kind === 'student' && <label>Class (optional)<select className="form-input" value={f.classSection} onChange={(e) => setF({ ...f, classSection: e.target.value })}><option value="">Choose later</option>{sections.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}</select></label>}
            {kind === 'student' && <label>Program (optional)<input className="form-input" value={f.program} onChange={(e) => setF({ ...f, program: e.target.value })} placeholder="e.g. BS Computer Science" /></label>}
          </div>
          <label>Message in the email (optional)<input className="form-input" maxLength={500} value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} placeholder="e.g. Welcome to the CS faculty. Classes start on 1 November." /></label>
          <div><button className="btn btn-primary" disabled={busy}>{busy ? 'Sending…' : `Send invitation${parseList(f.emails).length > 1 ? 's' : ''}`}</button></div>
        </form>
        {results && results.some((r) => !r.ok) && <ul className="inv-results">{results.filter((r) => !r.ok).map((r) => <li key={r.email} className="bad">{r.email || '(empty)'}: {r.error}</li>)}</ul>}
      </section>

      <section className="card" style={{ padding: 18 }}>
        <h3 style={{ marginTop: 0 }}>Invitations sent ({list?.length ?? 0})</h3>
        {!list ? <p>Loading…</p> : !list.length ? <p className="inv-hint">No invitations yet.</p> : (
          <div className="inv-table-wrap"><table className="inv-table">
            <thead><tr><th>Email</th><th>Name</th><th>{kind === 'student' ? 'Class' : 'Role'}</th><th>Status</th><th>Sent</th><th /></tr></thead>
            <tbody>{list.map((inv) => {
              const [tone, label] = STATUS[inv.status] || ['', inv.status];
              return (
                <tr key={inv._id}>
                  <td>{inv.email}</td>
                  <td>{inv.user?.fullName || inv.name || '–'}</td>
                  <td className="text-xs">{kind === 'student' ? (inv.classSection?.name || inv.program || '–') : [inv.role === 'teacher' ? 'Teacher' : (roles.find((r) => r.key === inv.role)?.label || inv.role), inv.designation, inv.department].filter(Boolean).join(' · ')}</td>
                  <td><span className={`tag ${tone}`}>{label}</span>{inv.status === 'accepted' && <div className="text-xs">{date(inv.acceptedAt)}{inv.newAccount ? ' · new account' : ''}</div>}</td>
                  <td className="text-xs">{date(inv.lastSentAt)}{inv.sentCount > 1 ? ` (${inv.sentCount}×)` : ''}</td>
                  <td className="inv-actions">
                    {['sent', 'expired'].includes(inv.status) && <button type="button" className="btn btn-outline btn-sm" onClick={() => resend(inv)}>Send again</button>}
                    {inv.status === 'sent' && <button type="button" className="btn btn-outline btn-sm" onClick={() => cancel(inv)}>Cancel</button>}
                  </td>
                </tr>
              );
            })}</tbody>
          </table></div>
        )}
      </section>
    </div>
  );
}
