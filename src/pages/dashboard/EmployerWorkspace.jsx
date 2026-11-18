// Employer workspace, moved out of Dashboard.jsx unchanged (master 17G.3: readable, maintainable code).
import { EmployerAgentRequests } from '../../components/agents/AgentMaster';
import { EmployerAnalyticsPanel, EmployerDashboardFull, EmployerPayrollPanel, EmployerPromotionsPanel, EmployerReviewsPanel } from '../../components/employer/EmployerMaster';
import { VisaCases } from '../../components/visa/Visa';
import { useEffect, useState } from 'react';
import { apiRequest } from '../../api/client';
import { MouButton, PartnerStats, askMouSignature } from '../../components/recruitment/PartnershipMou';
import { showConfirm } from '../../utils/appDialog';
import { FaBriefcase, FaClipboardCheck } from 'react-icons/fa6';
import { ComingSoon, EmployerEmploymentsPanel, EmployerJobsPanel, EmployerPostJobPanel, ProfilePanel, RolesPanel, STAFF_PERMISSION_LABEL, STAFF_ROLE_LABEL, SummaryRow, SupportComplaintPanel, Tag } from '../Dashboard';

export function EmployerWorkspace({ tab, user, onFlash, onChanged }) {
  if (tab === 'jobs') return <><EmployerAgentRequests onFlash={onFlash} /><EmployerJobsPanel onFlash={onFlash} /></>;
  if (tab === 'profile') return <><ProfilePanel user={user} onFlash={onFlash} onChanged={onChanged} /><RolesPanel onFlash={onFlash} onChanged={onChanged} /><SupportComplaintPanel onFlash={onFlash} /></>;
  if (tab === 'summary') return <><EmployerSummary /><EmployerDashboardFull /></>;
  if (tab === 'analytics') return <EmployerAnalyticsPanel />;
  if (tab === 'reviews') return <EmployerReviewsPanel onFlash={onFlash} />;
  if (tab === 'promotions') return <EmployerPromotionsPanel onFlash={onFlash} />;
  if (tab === 'payroll') return <EmployerPayrollPanel onFlash={onFlash} />;
  if (tab === 'post') return <EmployerPostJobPanel onFlash={onFlash} />;
  if (tab === 'jobs') return <EmployerJobsPanel onFlash={onFlash} />;
  if (tab === 'employees') return <EmployerEmploymentsPanel onFlash={onFlash} />;
  if (tab === 'partnerships') return <EmployerPartnershipsPanel onFlash={onFlash} user={user} />;
  if (tab === 'staff') return <CompanyStaffPanel onFlash={onFlash} />;
  if (tab === 'visaCases') return <VisaCases onFlash={onFlash} />;
  return <ComingSoon label={tab} />;
}

// Institution<->Employer partnerships (spec: "employer partnerships, campus recruitment") —
// employer side: accept/decline a request, or request one with an institution directly.
// Find a verified institute by name or city (no IDs to copy).
function InstitutePicker({ value, onChange }) {
  const [q, setQ] = useState(''), [list, setList] = useState([]), [picked, setPicked] = useState(null), [none, setNone] = useState(false);
  // Cleared by the parent after the request is sent: empty the box too.
  useEffect(() => { if (!value) { setPicked(null); setQ(''); setList([]); } }, [value]);
  useEffect(() => {
    if (picked || q.trim().length < 2) { setList([]); setNone(false); return undefined; }
    const timer = setTimeout(() => apiRequest(`/public/institutes?q=${encodeURIComponent(q.trim())}&limit=8`, { auth: false }).then((d) => { setList(d.items || []); setNone(!(d.items || []).length); }).catch(() => setList([])), 250);
    return () => clearTimeout(timer);
  }, [q, picked]);
  if (picked) return <div className="institute-picked"><span><strong>{picked.name}</strong>{picked.city || picked.country ? ` · ${[picked.city, picked.country].filter(Boolean).join(', ')}` : ''}</span><button type="button" className="btn" onClick={() => { setPicked(null); setQ(''); onChange(''); }}>Change</button></div>;
  return (
    <div className="institute-picker" onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setTimeout(() => setList([]), 150); }}>
      <input className="form-input" aria-label="Search institute" placeholder="Type the institute name or city" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === 'Escape') setList([]); }} />
      {list.length > 0 && <ul className="institute-picker-list">{list.map((i) => <li key={i._id}><button type="button" onClick={() => { setPicked(i); setList([]); onChange(i._id); }}><strong>{i.name}</strong><small>{[i.type, i.city, i.country].filter(Boolean).join(' · ')}</small></button></li>)}</ul>}
      {none && <small className="institute-picker-none">No verified institute found with this name yet.</small>}
    </div>
  );
}

function EmployerPartnershipsPanel({ onFlash, user }) {
  const [partnerships, setPartnerships] = useState(null);
  const [instId, setInstId] = useState('');

  function load() { apiRequest('/institution-employer/partnerships/mine').then(setPartnerships).catch((err) => onFlash(err.message)); }
  useEffect(load, []);

  async function request(e) {
    e.preventDefault();
    if (!instId.trim()) return;
    try {
      // The backend requires employerEmail on every request — for the employer-initiated side
      // that's simply the employer's own account email (previously this was omitted entirely,
      // so every employer-initiated request failed with "employerEmail is required").
      const signedName = await askMouSignature('this institute');
      if (!signedName) return;
      await apiRequest('/institution-employer/partnerships', { method: 'POST', body: { institutionId: instId.trim(), employerEmail: user?.email, signedName } });
      onFlash('Partnership request sent.', 'success');
      setInstId('');
      load();
    } catch (err) { onFlash(err.message); }
  }
  async function respond(id, decision, name) {
    const signedName = decision === 'active' ? await askMouSignature(name || 'this institute') : '';
    if (decision === 'active' && !signedName) return;
    try { await apiRequest(`/institution-employer/partnerships/${id}/respond`, { method: 'PATCH', body: { decision, signedName } }); onFlash(decision === 'active' ? 'Partnership active. The institute can now see your open jobs and refer its students.' : 'Partnership declined.', 'success'); load(); } catch (err) { onFlash(err.message); }
  }
  async function end(id) {
    const confirmed = await showConfirm('End this active partnership? The institution will no longer be able to refer students to your jobs.', { confirmLabel: 'End partnership' });
    if (!confirmed) return;
    try { await apiRequest(`/institution-employer/partnerships/${id}/end`, { method: 'PATCH' }); onFlash('Partnership ended.', 'success'); load(); } catch (err) { onFlash(err.message); }
  }

  const STATUS_TAG = { requested: 'pending', active: 'approved', declined: 'rejected', ended: 'rejected' };

  return (
    <div>
      <h3 className="font-semibold mb-2">Institution Partnerships</h3>
      <div className="card mou-howto">
        <strong>How a partnership works</strong>
        <ol>
          <li><b>Request and sign:</b> find the institute, send the request and sign the MoU with your name.</li>
          <li><b>Institute accepts:</b> the institute signs the same MoU. The partnership becomes active.</li>
          <li><b>You give jobs:</b> all your open jobs appear in the institute's Placement Office and to its students. The institute is told whenever you post a new job.</li>
          <li><b>Institute gives students:</b> it refers suitable students; they apply themselves. You see a "Referred by" badge on their application.</li>
          <li><b>Track results:</b> both sides see students referred, applied and hired. Either side can end it any time.</li>
        </ol>
      </div>
      <form onSubmit={request} className="flex gap-2 items-end mb-4">
        <InstitutePicker value={instId} onChange={setInstId} />
        <button type="submit" className="btn btn-primary" disabled={!instId}>Request Partnership</button>
      </form>
      {partnerships === null ? <p className="text-sm">Loading…</p> : !partnerships.length ? <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>No partnerships yet.</p> : (
        <div className="mou-cards">
          {partnerships.map((p) => (
            <article key={p._id} className="card mou-card">
              <div className="mou-card-top"><strong>{p.institution?.name}</strong><Tag status={STATUS_TAG[p.status] || 'pending'} label={p.status === 'requested' ? (p.canRespond ? 'Waiting for you' : 'Waiting for the institute') : p.status} /></div>
              {p.message && <p className="mou-note">{p.message}</p>}
              <PartnerStats p={p} />
              <div className="mou-card-actions">
                {p.canRespond && <><button type="button" className="btn btn-primary" onClick={() => respond(p._id, 'active', p.institution?.name)}>Sign and accept</button><button type="button" className="btn" onClick={() => respond(p._id, 'declined')}>Decline</button></>}
                <MouButton p={p} />
                {p.status === 'active' && <button type="button" className="btn staff-remove" onClick={() => end(p._id)}>End partnership</button>}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

// Real employment records for every candidate who accepted an offer (spec: "employee onboarding/
// linking, salary/employment record") — created automatically once an application is "hired".
// Master 12.10: the employer adds HR, Finance, Manager, Recruiter and Supervisor staff by email,
// each with their own permissions; the person accepts on their own dashboard.
function CompanyStaffPanel({ onFlash }) {
  const [meta, setMeta] = useState(null), [staff, setStaff] = useState(null);
  const [form, setForm] = useState({ email: '', role: 'recruiter', permissions: [] });
  const [editing, setEditing] = useState(null), [busy, setBusy] = useState(false);
  function load() { apiRequest('/employer-staff').then(setStaff).catch((err) => { setStaff([]); onFlash(err.message); }); }
  useEffect(() => { apiRequest('/employer-staff/roles').then((m) => { setMeta(m); setForm((f) => ({ ...f, permissions: m.roles[f.role].permissions })); }).catch(() => {}); load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const permsFor = (role) => meta?.roles?.[role]?.permissions || [];
  const toggle = (list, x) => (list.includes(x) ? list.filter((y) => y !== x) : [...list, x]);
  async function invite(e) {
    e.preventDefault();
    setBusy(true);
    try { await apiRequest('/employer-staff', { method: 'POST', body: form }); onFlash('Invitation sent. It starts working when they accept.', 'success'); setForm({ email: '', role: form.role, permissions: permsFor(form.role) }); load(); }
    catch (err) { onFlash(err.message); } finally { setBusy(false); }
  }
  async function save() {
    try { await apiRequest(`/employer-staff/${editing._id}`, { method: 'PATCH', body: { role: editing.role, permissions: editing.permissions } }); onFlash('Staff member updated.', 'success'); setEditing(null); load(); } catch (err) { onFlash(err.message); }
  }
  async function remove(s) {
    if (!(await showConfirm(`Remove ${s.member?.fullName || 'this person'} from your company staff? They lose access at once.`, { title: 'Remove staff member', confirmLabel: 'Remove', danger: true }))) return;
    try { await apiRequest(`/employer-staff/${s._id}`, { method: 'DELETE' }); onFlash('Staff member removed.', 'success'); load(); } catch (err) { onFlash(err.message); }
  }
  const PermBoxes = ({ value, onChange }) => (
    <div className="company-perm-grid">
      {Object.entries(meta?.permissions || {}).map(([k, label]) => (
        <label key={k} className="company-perm-option"><input type="checkbox" checked={value.includes(k)} onChange={() => onChange(toggle(value, k))} /><span><strong>{STAFF_PERMISSION_LABEL[k] || k}</strong><small>{label}</small></span></label>
      ))}
    </div>
  );
  const STATUS = { invited: ['pending', 'Waiting to accept'], active: ['approved', 'Active'], declined: ['rejected', 'Declined'] };
  return (
    <div className="company-staff">
      <form className="card company-staff-form" onSubmit={invite}>
        <div><h3>Add company staff</h3><p>Add a person by the email of their CareerZ account. Any account type can be staff. They act in your company's name, only with the permissions you tick.</p></div>
        <div className="company-staff-row">
          <label className="hiring-field"><span>Email</span><input className="form-input" type="email" required placeholder="name@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
          <label className="hiring-field"><span>Role</span><select className="form-select" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value, permissions: permsFor(e.target.value) })}>{Object.entries(STAFF_ROLE_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label>
        </div>
        <PermBoxes value={form.permissions} onChange={(permissions) => setForm({ ...form, permissions })} />
        <div><button type="submit" className="btn btn-primary" disabled={busy || !form.permissions.length}>{busy ? 'Sending…' : 'Send invitation'}</button></div>
      </form>
      <div className="card company-staff-list">
        <h3>Your staff</h3>
        {staff === null ? <p className="text-sm">Loading…</p> : !staff.length ? <p className="text-sm" style={{ color: 'var(--ink-soft)', margin: 0 }}>People you add appear here with their role and permissions.</p> : (
          <div className="company-staff-cards">
            {staff.map((s) => (
              <div key={s._id} className="company-staff-card">
                <div className="company-staff-card-top">
                  <div><strong>{s.member?.fullName || 'CareerZ user'}</strong><small>{s.member?.email}</small></div>
                  <Tag status={STATUS[s.status]?.[0] || 'pending'} label={STATUS[s.status]?.[1] || s.status} />
                </div>
                {editing?._id === s._id ? (
                  <div className="company-staff-edit">
                    <label className="hiring-field"><span>Role</span><select className="form-select" value={editing.role} onChange={(e) => setEditing({ ...editing, role: e.target.value, permissions: permsFor(e.target.value) })}>{Object.entries(STAFF_ROLE_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label>
                    <PermBoxes value={editing.permissions} onChange={(permissions) => setEditing({ ...editing, permissions })} />
                    <div className="company-invite-actions"><button type="button" className="btn btn-primary" disabled={!editing.permissions.length} onClick={save}>Save</button><button type="button" className="btn" onClick={() => setEditing(null)}>Cancel</button></div>
                  </div>
                ) : (
                  <>
                    <p className="company-staff-role">{STAFF_ROLE_LABEL[s.role] || s.role}</p>
                    <div className="company-perm-chips">{(s.permissions || []).map((x) => <span key={x} className="company-perm-chip">{STAFF_PERMISSION_LABEL[x] || x}</span>)}</div>
                    <div className="company-invite-actions">
                      {s.status !== 'declined' && <button type="button" className="btn" onClick={() => setEditing({ _id: s._id, role: s.role, permissions: s.permissions || [] })}>Change permissions</button>}
                      <button type="button" className="btn staff-remove" onClick={() => remove(s)}>Remove</button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EmployerSummary() {
  const [jobs, setJobs] = useState(null);
  useEffect(() => { apiRequest('/jobs/mine/list').then(setJobs).catch(() => setJobs([])); }, []);
  const open = jobs?.filter((j) => j.status === 'open').length;
  return (
    <SummaryRow items={[
      { label: 'Jobs Posted', value: jobs?.length, icon: FaBriefcase, detail: 'Total postings' },
      { label: 'Open Jobs', value: open, icon: FaClipboardCheck, detail: 'Accepting applications' }
    ]} />
  );
}
