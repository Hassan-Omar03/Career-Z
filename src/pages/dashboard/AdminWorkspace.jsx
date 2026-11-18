// Admin workspace, moved out of Dashboard.jsx unchanged (master 17G.3: readable, maintainable code).
import { useEffect, useState } from 'react';
import { apiRequest } from '../../api/client';
import { FaArrowLeft, FaArrowRight, FaBookOpen, FaBriefcase, FaBuildingColumns, FaClipboardCheck, FaShieldHalved, FaUserShield, FaUsers } from 'react-icons/fa6';
import { FamilyAdminSummary } from '../../components/dashboard/FamilyPrivate';
import { AdminVisaPanel } from '../../components/visa/Visa';
import { AdminAdsPanel } from '../../components/ads/Ads';
import { AdminModerationPanel, AdminUsersPanel } from '../../components/admin/Moderation';
import { AdminPluginsPanel } from '../../components/admin/Plugins';
import { AdminCommentsRatingsPanel } from '../../components/admin/CommentsRatings';
import { AdminEscrowPanel, AdminListingReview } from '../../components/marketplace/Escrow';
import { AdminEmployersPanel } from '../../components/employer/EmployerMaster';
import { AdminAgentsPanel } from '../../components/agents/AgentMaster';
import { AdminDonorsPanel as DonorManagementPanel } from '../../components/donors/DonorMaster';
import FamilyChatPolicy from '../../components/dashboard/FamilyChatPolicy';
import FreelanceAdmin from '../../components/freelance/FreelanceAdmin';
import CommissionRules from '../../components/finance/CommissionRules';
import { AdminReceipts } from '../../components/finance/Receipts';
import AdminOperationsCenter from '../../components/admin/AdminOperationsCenter';
import AdminVerificationPanel from '../../components/admin/AdminVerificationPanel';
import AdminJobReviewPanel from '../../components/admin/AdminJobReviewPanel';
import AdminScholarshipReviewPanel from '../../components/admin/AdminScholarshipReviewPanel';
import { AdminFundingReview } from '../../components/donors/FundingRequests';
import AdminRecruitmentPanel from '../../components/admin/AdminRecruitmentPanel';
import useUrlTab from '../../hooks/useUrlTab';
import { AdminSitePagesPanel } from '../../components/admin/SitePages';
import BlogAdmin from '../../components/admin/BlogAdmin';
import SavedForm from '../../components/shared/SavedForm';
import { showConfirm, showPrompt } from '../../utils/appDialog';
import { AdminManualPayments, PlatformAccountForm } from '../../components/payments/ManualPay';
import SiteAssistantSettings from '../../components/admin/SiteAssistantSettings';
import { AI_PURPOSES, AiSettingsPanel, ComingSoon, CustomSelect, ProfilePanel, SummaryRow, Table, Tag } from '../Dashboard';

// Every commission rate CareerZ takes, per service, in one place. The Super Admin edits them; finance
// staff see them. Nothing is hardcoded: an unset rate is 0.
function ServiceCommissionRates({ onFlash, canEdit }) {
  const [services, setServices] = useState(null);
  const [rates, setRates] = useState({});
  function load() {
    apiRequest('/admin/commission-rates?detail=1').then((r) => { setServices(r.services); setRates(Object.fromEntries(r.services.map((s) => [s.id, String(s.rate)]))); }).catch(() => setServices([]));
  }
  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps
  if (!services?.length) return null;
  async function save(e) {
    e.preventDefault();
    try {
      await apiRequest('/admin/commission-rates', { method: 'PATCH', body: Object.fromEntries(Object.entries(rates).map(([k, v]) => [k, Number(v)])) });
      onFlash('Commission rates saved. They apply to payments from now on.', 'success');
      load();
    } catch (err) { onFlash(err.message); }
  }
  return (
    <form onSubmit={save} style={{ display: 'grid', gap: 8, width: '100%' }}>
      <strong className="text-sm">Commission per service</strong>
      {services.map((s) => (
        <label key={s.id} className="text-xs" style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <input className="form-input" type="number" min="0" max="100" step="0.5" disabled={!canEdit} value={rates[s.id] ?? '0'} onChange={(e) => setRates({ ...rates, [s.id]: e.target.value })} style={{ width: 90 }} aria-label={`${s.label} %`} />
          <span style={{ flex: 1, minWidth: 200 }}><strong>{s.label} %</strong><br /><span style={{ color: 'var(--ink-soft)' }}>{s.about}</span></span>
        </label>
      ))}
      {canEdit && <button type="submit" className="btn btn-primary" style={{ padding: '7px 14px', fontSize: '0.8rem', justifySelf: 'start' }}>Save commission rates</button>}
    </form>
  );
}

export function AdminWorkspace({ tab, user, roles, onFlash, onChanged }) {
  if (tab === 'profile') {
    return (
      <>
        <ProfilePanel user={user} onFlash={onFlash} onChanged={onChanged} />
        <div className="admin-section admin-account-card" style={{ marginTop: 20 }}>
          <div className="admin-section-heading"><div><h2>My Roles</h2><p>Roles currently assigned to your account.</p></div><FaUserShield aria-hidden="true" /></div>
          <ul className="admin-role-list">{roles.map((role) => <li key={role}><FaShieldHalved aria-hidden="true" /><span>{role.replaceAll('_', ' ')}</span><span className="admin-role-badge">Assigned</span></li>)}</ul>
        </div>
      </>
    );
  }
  if (tab === 'summary' || tab === 'institutions_mgmt') return <><AdminPanel onFlash={onFlash} />{tab==='summary'&&roles.some(r=>['admin','super_admin'].includes(r))&&<FamilyAdminSummary onFlash={onFlash} />}</>;
  if (tab === 'visa') return <div className="institution-ui"><AdminVisaPanel onFlash={onFlash} /></div>;
  if (tab === 'ads') return <div className="institution-ui"><AdminAdsPanel onFlash={onFlash} /></div>;
  if (tab === 'moderation') return <div className="institution-ui"><AdminModerationPanel onFlash={onFlash} /></div>;
  if (tab === 'allUsers') return <div className="institution-ui"><AdminUsersPanel onFlash={onFlash} /></div>;
  if (tab === 'plugins') return <div className="institution-ui"><AdminPluginsPanel onFlash={onFlash} /></div>;
  if (tab === 'commentsRatings') return <div className="institution-ui"><AdminCommentsRatingsPanel onFlash={onFlash} /></div>;
  if (tab === 'marketplaceReview') return <div className="institution-ui"><AdminListingReview onFlash={onFlash} /></div>;
  if (tab === 'marketplaceEscrow') return <div className="institution-ui"><AdminEscrowPanel onFlash={onFlash} isSuperAdmin={roles.includes('super_admin')} /></div>;
  if (tab === 'employers') return <div className="institution-ui employer-ui"><AdminEmployersPanel onFlash={onFlash} isSuperAdmin={roles.includes('super_admin')} /></div>;
  if (tab === 'agents') return <><AdminAgentsPanel onFlash={onFlash} isSuperAdmin={roles.includes('super_admin')} /><AdminRolePanel onFlash={onFlash} role="education_agent" title="Agent Management" /></>;
  if (tab === 'donors') return <><DonorManagementPanel onFlash={onFlash} isSuperAdmin={roles.includes('super_admin')} /><AdminDonorsPanel onFlash={onFlash} /></>;
  if (tab === 'complaints') return <><AdminComplaintsPanel onFlash={onFlash}/>{roles.some(r=>['admin','super_admin'].includes(r))&&<FamilyChatPolicy onFlash={onFlash}/>}</>;
  if (tab === 'security') return <AdminSecurityPanel onFlash={onFlash} />;
  if (tab === 'settings') return <AdminSettingsPanel onFlash={onFlash} isSuperAdmin={roles.includes('super_admin')} />;
  if (tab === 'finance') return <AdminFinancePanel onFlash={onFlash} isSuperAdmin={roles.includes('super_admin')} />;
  if (tab === 'freelanceAdmin') return <FreelanceAdmin onFlash={onFlash} />;
  if (tab === 'commissionRules') return <CommissionRules onFlash={onFlash} canEdit={roles.includes('super_admin')} />;
  if (tab === 'allReceipts') return <AdminReceipts onFlash={onFlash} canEdit={roles.includes('super_admin')} />;
  if (tab === 'analytics') return <AdminReportsPanel onFlash={onFlash} />;
  if (tab === 'worldmap') return <AdminWorldMapPanel onFlash={onFlash} />;
  if (tab === 'staff') return <AdminStaffPanel onFlash={onFlash} />;
  if (tab === 'cms') return <AdminCmsPanel onFlash={onFlash} />;
  if (tab === 'backups') return <AdminBackupsPanel onFlash={onFlash} />;
  if (tab === 'aiInsights') return <AdminAiInsightsPanel onFlash={onFlash} />;
  if (tab === 'operationsCenter') return <AdminOperationsCenter onFlash={onFlash} />;
  if (tab === 'verifications') return <AdminVerificationPanel onFlash={onFlash} currentUserId={user?._id} />;
  if (tab === 'jobReview') return <AdminJobReviewPanel onFlash={onFlash} />;
  if (tab === 'scholarshipReview') return <><AdminScholarshipReviewPanel onFlash={onFlash} /><AdminFundingReview onFlash={onFlash} /></>;
  if (tab === 'recruitmentPayments') return <AdminRecruitmentPanel onFlash={onFlash} isSuperAdmin={(roles || user?.roles || []).includes('super_admin')} />;
  return <ComingSoon label={tab} />;
}

// Real BYOK AI predictions over real platform-wide aggregates (spec: "AI Insights &
// Predictions") — same "connect your own key, summarize real numbers, never invent" pattern as
// every other AI assistant in the platform.
function AdminAiInsightsPanel({ onFlash }) {
  const [insights, setInsights] = useState(null);
  const [dataSummary, setDataSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    try {
      const res = await apiRequest('/admin/ai-insights', { method: 'POST' });
      setInsights(res.insights);
      setDataSummary(res.dataSummary);
    } catch (err) { onFlash(err.message); } finally { setLoading(false); }
  }

  return (
    <div>
      <AiSettingsPanel onFlash={onFlash} purposes={[AI_PURPOSES[0]]} />
      <div className="admin-section">
        <div className="admin-section-heading"><div><h2>AI Insights &amp; Predictions</h2><p>Uses your own connected AI provider to analyze real platform-wide growth, verification/support backlog and fee-collection data. All decisions remain yours — this only summarizes/predicts trends.</p></div></div>
        <button className="btn btn-primary" onClick={generate} disabled={loading}>{loading ? 'Analyzing...' : 'Generate Insights'}</button>
      </div>
      {insights && (
        <div className="admin-section" style={{ marginTop: 16 }}>
          <div className="admin-section-heading"><div><h2>Insights</h2></div></div>
          <p style={{ whiteSpace: 'pre-line', fontSize: 14, lineHeight: 1.6 }}>{insights}</p>
          <details style={{ marginTop: 12 }}>
            <summary style={{ fontSize: 12, color: 'var(--ink-soft)', cursor: 'pointer' }}>Raw data used</summary>
            <pre style={{ fontSize: 12, whiteSpace: 'pre-wrap' }}>{dataSummary}</pre>
          </details>
        </div>
      )}
      <p style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 12 }}>Requires an AI provider connected above (BYOK — your own API key, e.g. OpenAI/Claude/Gemini).</p>
    </div>
  );
}

// Super Admin — World Map (spec Part 16A.3). Real per-country user + institution counts on a real
// map of the world (public/geo/world-map.json, drawn in the same projection as the bubbles).
// Countries with activity are coloured, and each has a bubble sized by its total.
function AdminWorldMapPanel({ onFlash }) {
  const [data, setData] = useState(null);
  const [world, setWorld] = useState([]);
  useEffect(() => { apiRequest('/admin/world-map').then(setData).catch((err) => onFlash(err.message)); }, [onFlash]);
  useEffect(() => { fetch('/geo/world-map.json').then((r) => r.json()).then(setWorld).catch(() => setWorld([])); }, []);

  if (!data) return <p role="status" className="admin-notice">Loading...</p>;
  const activeCodes = new Map(data.points.map((p) => [p.code, p]));

  const maxCount = Math.max(...data.points.map((p) => p.userCount + p.institutionCount), 1);
  const project = (lat, lng) => ({ x: ((lng + 180) / 360) * 100, y: ((90 - lat) / 180) * 100 });

  return (
    <div>
      <h3 className="font-semibold mb-2">Global World Map</h3>
      <p className="text-xs" style={{ color: 'var(--ink-soft)', marginBottom: 16 }}>Countries with accounts are coloured. Bubble size = combined users + institutions in that country.</p>

      <div className="card" style={{ padding: 0, position: 'relative', aspectRatio: '2 / 1', overflow: 'hidden', background: 'var(--paper-raised)' }}>
        <svg viewBox="0 0 1000 500" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} role="img" aria-label="World map of CareerZ accounts">
          {world.map((country, i) => { const active = activeCodes.get(country.c); return <path key={`${country.c || country.n}-${i}`} d={country.d} fill={active ? 'var(--emerald)' : 'var(--sand)'} stroke="var(--sand-line)" strokeWidth="0.5"><title>{active ? `${active.name}: ${active.userCount} users, ${active.institutionCount} institutions` : country.n}</title></path>; })}
        </svg>
        {data.points.map((p) => {
          const { x, y } = project(p.lat, p.lng);
          const total = p.userCount + p.institutionCount;
          const size = 14 + (total / maxCount) * 46;
          return (
            <div key={p.code} title={`${p.name}: ${p.userCount} users, ${p.institutionCount} institutions`}
              style={{
                position: 'absolute', left: `${x}%`, top: `${y}%`, width: size, height: size,
                transform: 'translate(-50%, -50%)', borderRadius: '50%',
                background: 'var(--forest)', boxShadow: '0 0 0 4px color-mix(in srgb, var(--forest) 25%, transparent)',
                display: 'grid', placeItems: 'center', cursor: 'default'
              }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,.4)' }}>{p.code}</span>
            </div>
          );
        })}
      </div>

      {data.unplottedCodes.length > 0 && (
        <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 10 }}>Also active (no map position yet): {data.unplottedCodes.join(', ')}</p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3" style={{ marginTop: 20 }}>
        {data.points.map((p) => (
          <div key={p.code} className="card" style={{ padding: 14 }}>
            <strong className="text-sm">{p.name}</strong>
            <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 4 }}>{p.userCount} users · {p.institutionCount} institutions</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const STAFF_DEPARTMENTS = [
  { value: 'finance', label: 'Finance' },
  { value: 'support', label: 'Support' },
  { value: 'verification', label: 'Verification' },
  { value: 'security', label: 'Security' },
  { value: 'content', label: 'Content' },
  { value: 'moderation', label: 'Moderation' }
];

// Super Admin — Internal Staff Management (spec Part 16A.14 / 16G.10-11). Each platform_staff
// member only gets the departments Super Admin explicitly assigns — enforced server-side by
// requireDepartment on the real Finance/Security/Verification/Support routes, not just hidden in
// this UI. admin/super_admin always have full access regardless of this list.
function AdminStaffPanel({ onFlash }) {
  const [staff, setStaff] = useState(null);
  const [form, setForm] = useState({ email: '', title: '', departments: [] });
  const [adding, setAdding] = useState(false);

  function load() { apiRequest('/admin/staff').then(setStaff).catch((err) => onFlash(err.message)); }
  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  function toggleDept(dept, checked) {
    setForm((f) => ({ ...f, departments: checked ? [...f.departments, dept] : f.departments.filter((d) => d !== dept) }));
  }

  async function addStaff(e) {
    e.preventDefault();
    if (!form.email.trim() || form.departments.length === 0) { onFlash('Email and at least one department are required.'); return; }
    setAdding(true);
    try {
      await apiRequest('/admin/staff', { method: 'POST', body: form });
      onFlash('Staff member added.', 'success');
      setForm({ email: '', title: '', departments: [] });
      load();
    } catch (err) { onFlash(err.message); } finally { setAdding(false); }
  }

  async function toggleStaffDept(member, dept, checked) {
    const departments = checked ? [...member.departments, dept] : member.departments.filter((d) => d !== dept);
    try { await apiRequest(`/admin/staff/${member._id}`, { method: 'PATCH', body: { departments } }); load(); } catch (err) { onFlash(err.message); }
  }

  async function removeStaff(id) {
    try { await apiRequest(`/admin/staff/${id}`, { method: 'DELETE' }); onFlash('Staff member removed.', 'success'); load(); } catch (err) { onFlash(err.message); }
  }

  return (
    <div>
      <h3 className="font-semibold mb-2">Staff Management</h3>
      <p className="text-xs" style={{ color: 'var(--ink-soft)', marginBottom: 16 }}>Give your team department-wise access — Finance, Support, Verification, Security, Content, Moderation — instead of blanket admin rights.</p>

      <form onSubmit={addStaff} className="card" style={{ padding: 20, marginBottom: 24, display: 'grid', gap: 14 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--ink-soft)' }}>Add Staff Member</p>
        <div className="flex flex-wrap" style={{ gap: 12 }}>
          <input className="form-input" placeholder="User's email (must already have a CareerZ account)" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={{ flex: '2 1 260px', minWidth: 0 }} />
          <input className="form-input" placeholder="Title (e.g. Finance Manager)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={{ flex: '1 1 200px', minWidth: 0 }} />
        </div>
        <div className="flex flex-wrap" style={{ gap: 14 }}>
          {STAFF_DEPARTMENTS.map((d) => (
            <label key={d.value} className="flex items-center text-xs" style={{ gap: 6 }}>
              <input type="checkbox" checked={form.departments.includes(d.value)} onChange={(e) => toggleDept(d.value, e.target.checked)} /> {d.label}
            </label>
          ))}
        </div>
        <button type="submit" className="btn btn-primary" disabled={adding} style={{ padding: '8px 18px', fontSize: '0.8rem', justifySelf: 'start' }}>{adding ? 'Adding...' : 'Add to Staff'}</button>
      </form>

      {staff === null ? (
        <p role="status" className="admin-notice">Loading...</p>
      ) : staff.length === 0 ? (
        <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>No internal staff added yet.</p>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {staff.map((s) => (
            <div key={s._id} className="card" style={{ padding: 18 }}>
              <div className="flex items-center justify-between flex-wrap" style={{ gap: 10, marginBottom: 12 }}>
                <div>
                  <strong className="text-sm">{s.user?.fullName}</strong>
                  <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 2 }}>{s.user?.email} {s.title ? `· ${s.title}` : ''}</p>
                </div>
                <button type="button" className="btn" style={{ padding: '5px 12px', fontSize: '0.72rem' }} onClick={() => removeStaff(s._id)}>Remove from Staff</button>
              </div>
              <StaffDepartmentForm staff={s} onFlash={onFlash} onSaved={load}/>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Super Admin — CMS (spec Part 16F.8/16F.9 "Website Content Management System" + Blog).
function AdminCmsPanel({ onFlash }) {
  const [sub, setSub] = useUrlTab('adminCmsPanel', 'site');
  return (
    <div>
      <h3 className="font-semibold mb-2">Content Management</h3>
      <nav className="cz-tabbar" style={{ marginBottom: 20 }}>
        {[{ key: 'site', label: 'Website Pages' }, { key: 'pages', label: 'Extra Pages' }, { key: 'blog', label: 'Blog' }].map((t) => (
          <button key={t.key} type="button" aria-pressed={sub === t.key} className={`cz-tab${sub === t.key ? ' active' : ''}`} onClick={() => setSub(t.key)}>{t.label}</button>
        ))}
      </nav>
      {sub === 'site' && <AdminSitePagesPanel onFlash={onFlash} />}
      {sub === 'pages' && <AdminCmsCollection onFlash={onFlash} kind="pages" />}
      {sub === 'blog' && <BlogAdmin onFlash={onFlash} />}
    </div>
  );
}

function AdminCmsCollection({ onFlash, kind }) {
  const isBlog = kind === 'blog';
  const [items, setItems] = useState(null);
  const [form, setForm] = useState({ title: '', content: '', excerpt: '', category: '' });
  const [creating, setCreating] = useState(false);

  function load() { apiRequest(`/${kind}/admin/all`).then(setItems).catch((err) => onFlash(err.message)); }
  useEffect(load, [kind]); // eslint-disable-line react-hooks/exhaustive-deps

  async function create(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setCreating(true);
    try {
      const body = isBlog ? { title: form.title, content: form.content, excerpt: form.excerpt, category: form.category, status: 'draft' } : { title: form.title, content: form.content, status: 'draft' };
      await apiRequest(`/${kind}`, { method: 'POST', body });
      onFlash(`${isBlog ? 'Post' : 'Page'} created as draft.`, 'success');
      setForm({ title: '', content: '', excerpt: '', category: '' });
      load();
    } catch (err) { onFlash(err.message); } finally { setCreating(false); }
  }

  async function toggleStatus(item) {
    try {
      await apiRequest(`/${kind}/${item._id}`, { method: 'PATCH', body: { status: item.status === 'published' ? 'draft' : 'published' } });
      load();
    } catch (err) { onFlash(err.message); }
  }

  async function remove(id) {
    try { await apiRequest(`/${kind}/${id}`, { method: 'DELETE' }); onFlash('Deleted.', 'success'); load(); } catch (err) { onFlash(err.message); }
  }

  return (
    <div>
      <form onSubmit={create} className="card" style={{ padding: 20, marginBottom: 24, display: 'grid', gap: 12 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--ink-soft)' }}>New {isBlog ? 'Post' : 'Page'}</p>
        <input className="form-input" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        {isBlog && (
          <div className="flex flex-wrap" style={{ gap: 12 }}>
            <input className="form-input" placeholder="Excerpt (short summary)" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} style={{ flex: '1 1 260px', minWidth: 0 }} />
            <input className="form-input" placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={{ flex: '1 1 160px', minWidth: 0 }} />
          </div>
        )}
        <textarea className="form-input" placeholder="Content (HTML allowed)" rows={5} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
        <button type="submit" className="btn btn-primary" disabled={creating} style={{ padding: '8px 18px', fontSize: '0.8rem', justifySelf: 'start' }}>{creating ? 'Creating...' : 'Save as Draft'}</button>
      </form>

      {items === null ? (
        <p role="status" className="admin-notice">Loading...</p>
      ) : items.length === 0 ? (
        <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>Nothing here yet.</p>
      ) : (
        <Table
          headers={['Title', 'Slug', 'Status', 'Updated', 'Action']}
          rows={items.map((item) => [
            item.title, item.slug, <Tag status={item.status === 'published' ? 'approved' : 'pending'} label={item.status} />,
            new Date(item.updatedAt).toLocaleDateString(),
            <div className="flex gap-2">
              <button type="button" className="btn" style={{ padding: '5px 12px', fontSize: '0.72rem' }} onClick={() => toggleStatus(item)}>{item.status === 'published' ? 'Unpublish' : 'Publish'}</button>
              <button type="button" className="btn" style={{ padding: '5px 12px', fontSize: '0.72rem' }} onClick={() => remove(item._id)}>Delete</button>
            </div>
          ])}
          empty="Nothing here yet."
        />
      )}
    </div>
  );
}

// Super Admin — Backups (spec Part 4.32 / 16D.12) + Maintenance Mode (spec Part 16A.16 /
// 16F.13). Backup creation dumps every real collection to disk on the server — genuinely
// functional, not a stub. Restore is intentionally NOT a one-click button here: overwriting
// live production data is exactly the kind of destructive action that needs a human doing it
// deliberately on the server itself, not a button in this dashboard.
function AdminBackupsPanel({ onFlash }) {
  const [backups, setBackups] = useState(null);
  const [creating, setCreating] = useState(false);
  const [maintenance, setMaintenance] = useState(null);
  const [savingMaintenance, setSavingMaintenance] = useState(false);

  function load() {
    apiRequest('/admin/backups').then(setBackups).catch((err) => onFlash(err.message));
    apiRequest('/config/feature-flags').then((flags) => {
      const flag = flags.find((f) => f.key === 'maintenance_mode');
      setMaintenance(flag ? flag.enabled : false);
    }).catch(() => setMaintenance(false));
  }
  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function createBackup() {
    setCreating(true);
    try {
      const result = await apiRequest('/admin/backups', { method: 'POST' });
      onFlash(`Backup complete — ${result.collections.length} collections, ${(result.totalSizeBytes / 1024).toFixed(1)} KB.`, 'success');
      load();
    } catch (err) { onFlash(err.message); } finally { setCreating(false); }
  }

  async function toggleMaintenance(next) {
    setSavingMaintenance(true);
    try {
      await apiRequest('/config/feature-flags', { method: 'POST', body: { key: 'maintenance_mode', label: 'CareerZ is currently undergoing scheduled maintenance. Please check back shortly.', enabled: next, scope: 'global' } });
      setMaintenance(next);

      onFlash(next ? 'Maintenance mode ON — only Super Admin can use the platform now.' : 'Maintenance mode OFF — platform is live for everyone again.', 'success');
      return true;
    } catch (err) { onFlash(err.message); } finally { setSavingMaintenance(false); }
  }

  return (
    <div>
      <h3 className="font-semibold mb-2">Backups & Maintenance</h3>

      <SavedForm className="card" style={{ padding: 20, marginBottom: 24 }} value={maintenance} onRestore={setMaintenance} canEdit={maintenance !== null} onSubmit={() => toggleMaintenance(maintenance)}>
        <div className="flex items-center justify-between flex-wrap" style={{ gap: 14 }}>
          <div>
            <strong className="text-sm">{maintenance ? 'Maintenance Mode: ON' : 'Maintenance Mode: OFF'}</strong>
            <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 4, lineHeight: 1.6, maxWidth: 480 }}>
              {maintenance ? 'Every request except login and Super Admin access is blocked platform-wide (503).' : 'Turn this on to lock the platform to everyone except Super Admin — for emergencies or scheduled upgrades.'}
            </p>
          </div>
          <label className="flex items-center" style={{ gap: 10, flexShrink: 0, cursor: savingMaintenance ? 'wait' : 'pointer' }}>
            <input type="checkbox" checked={!!maintenance} disabled={maintenance === null || savingMaintenance} onChange={(e) => setMaintenance(e.target.checked)} />
          </label>
        </div>
        <button type="submit" className="btn btn-primary" disabled={savingMaintenance}>Save maintenance setting</button>
      </SavedForm>

      <div className="flex items-center justify-between flex-wrap" style={{ gap: 12, marginBottom: 16 }}>
        <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>Each backup exports every real collection in the database to JSON files on the server.</p>
        <button type="button" className="btn btn-primary" disabled={creating} style={{ padding: '8px 18px', fontSize: '0.8rem', flexShrink: 0 }} onClick={createBackup}>{creating ? 'Backing up...' : 'Create Backup Now'}</button>
      </div>

      {backups === null ? (
        <p role="status" className="admin-notice">Loading...</p>
      ) : backups.length === 0 ? (
        <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>No backups yet.</p>
      ) : (
        <Table
          headers={['Created', 'Collections', 'Size', 'Status', 'By']}
          rows={backups.map((b) => [
            new Date(b.createdAt).toLocaleString(), b.collections?.length ?? '—',
            b.totalSizeBytes ? `${(b.totalSizeBytes / 1024).toFixed(1)} KB` : '—',
            <Tag status={b.status === 'completed' ? 'approved' : 'rejected'} label={b.status} />,
            b.createdBy?.fullName || '—'
          ])}
          empty="No backups yet."
        />
      )}
    </div>
  );
}

function AdminFinancePanel({ onFlash, isSuperAdmin }) {
  const [data, setData] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [donorDeposits, setDonorDeposits] = useState(null);
  const [featuredFeeInput, setFeaturedFeeInput] = useState('');
  const [featuredFee, setFeaturedFee] = useState(null);
  const [withdrawals, setWithdrawals] = useState(null);
  const [feeQueue, setFeeQueue] = useState(null);
  const [agentPayouts, setAgentPayouts] = useState(null);
  const [sellerPayouts, setSellerPayouts] = useState(null);
  const [planConfig, setPlanConfig] = useState(null);
  const [planPriceInputs, setPlanPriceInputs] = useState({});

  function load() {
    setLoadError('');
    apiRequest('/admin/finance').then(setData).catch((err) => { setLoadError(err.message || 'Could not load finance data.'); onFlash(err.message); });
    apiRequest('/jobs/featured-fee').then((d) => { setFeaturedFee(d); setFeaturedFeeInput(String(d.fee)); }).catch(() => {});
    apiRequest('/wallet/withdrawals/pending').then(setWithdrawals).catch(() => setWithdrawals([]));
    apiRequest('/admin/fee-payments').then(setFeeQueue).catch(() => setFeeQueue({ pending: [], held: [] }));
    apiRequest('/commissions/withdrawals/open').then(setAgentPayouts).catch(() => setAgentPayouts([]));
    apiRequest('/marketplace/sellers/withdrawals/open').then(setSellerPayouts).catch(() => setSellerPayouts([]));
    apiRequest('/scholarships/admin/deposits').then(setDonorDeposits).catch(() => setDonorDeposits([]));
    apiRequest('/admin/subscription-plans').then((d) => {
      setPlanConfig(d);
      setPlanPriceInputs(Object.fromEntries(Object.entries(d.effective).map(([k, p]) => [k, String(p.monthlyPriceUSD)])));
    }).catch(() => {});
  }
  useEffect(load, [onFlash]);

  async function savePlanPrice(planKey) {
    const price = Number(planPriceInputs[planKey]);
    if (!Number.isFinite(price) || price < 0) return onFlash('Enter a valid price.');
    try {
      await apiRequest('/admin/subscription-plans', { method: 'PATCH', body: { overrides: { [planKey]: { monthlyPriceUSD: price } } } });
      onFlash('Subscription plan price updated.', 'success');
      load();
      return true;
    } catch (err) { onFlash(err.message); }
  }

  // Approve after sending the money from CareerZ's bank app to the account shown, with that
  // transfer's transaction ID; reject returns the money to the user's wallet.
  async function reviewWithdrawal(id, decision) {
    const body = { decision };
    if (decision === 'approved') {
      body.transferReference = await showPrompt('Send the money to the account shown from the CareerZ bank app, then enter that transfer\'s transaction ID.', { title: 'Money sent', required: true });
      if (!body.transferReference) return;
    } else {
      body.reason = await showPrompt('Why is this withdrawal rejected? The user is told.', { title: 'Reject withdrawal', required: true });
      if (!body.reason) return;
    }
    try {
      await apiRequest(`/wallet/withdrawals/${id}/review`, { method: 'PATCH', body });
      onFlash(`Withdrawal ${decision}.`, 'success');
      load();
    } catch (err) { onFlash(err.message); }
  }
  // Manual fee payments (bank/cash proof) count only after CareerZ checks the proof.
  async function decideFeePayment(feeId, decision) {
    let rejectionReason = '';
    if (decision === 'reject') {
      rejectionReason = await showPrompt('Why was this payment rejected?', { title: 'Reject payment', required: true });
      if (!rejectionReason) return;
    } else if (!(await showConfirm('Confirm only after checking the proof against the bank statement / receipt.', { confirmLabel: 'Verify received' }))) return;
    try { await apiRequest(`/institution-fees/fees/${feeId}/verify-payment`, { method: 'PATCH', body: { decision, rejectionReason } }); onFlash(`Payment ${decision === 'verify' ? 'verified' : 'rejected'}.`, 'success'); load(); } catch (err) { onFlash(err.message); }
  }
  async function releaseFee(feeId) {
    try { await apiRequest(`/institutions/fees/${feeId}/release`, { method: 'PATCH' }); onFlash('Released. If it was paid online, the institute\'s share is now in its wallet.', 'success'); load(); } catch (err) { onFlash(err.message); }
  }
  // Agent and seller payouts: requested -> processing -> paid | rejected (paid and rejected are final).
  async function setPayout(kind, id, status) {
    const path = kind === 'agent' ? `/commissions/withdrawals/${id}/status` : `/marketplace/sellers/withdrawals/${id}/status`;
    if (status === 'paid' && !(await showConfirm('Mark as paid only after you have sent the money to the account shown.', { confirmLabel: 'Money sent' }))) return;
    try { await apiRequest(path, { method: 'PATCH', body: { status } }); onFlash(`Payout ${status}.`, 'success'); load(); } catch (err) { onFlash(err.message); }
  }
  async function reviewDonorDeposit(id, status) {
    let rejectionReason = '';
    if (status === 'rejected') {
      rejectionReason = await showPrompt('Why was this deposit rejected?', { title: 'Reject deposit', required: true });
      if (!rejectionReason) return;
    } else {
      const confirmed = await showConfirm('Confirm only after the platform account/cash desk has actually received this money.', { confirmLabel: 'Money received' });
      if (!confirmed) return;
    }
    try { await apiRequest(`/scholarships/deposits/${id}/status`, { method: 'PATCH', body: { status, rejectionReason } }); onFlash(`Deposit ${status}.`, 'success'); load(); } catch (err) { onFlash(err.message); }
  }

  async function saveFeaturedFee(e) {
    e.preventDefault();
    try {
      await apiRequest('/jobs/featured-fee', { method: 'PATCH', body: { fee: Number(featuredFeeInput) } });
      onFlash('Featured job fee updated.', 'success');
      load();
      return true;
    } catch (err) { onFlash(err.message); }
  }
  async function toggleFeatured() {
    try {
      await apiRequest('/jobs/featured-enabled', { method: 'PATCH', body: { enabled: !featuredFee.enabled } });
      onFlash('Featured job availability updated.', 'success');
      load();
    } catch (error) { onFlash(error.message); }
  }

  if (!data && loadError) return <p role="alert" className="admin-notice">Finance data could not be loaded: {loadError} <button type="button" className="btn btn-sm" onClick={() => load()}>Try again</button></p>;
  if (!data) return <p role="status" className="admin-notice">Loading...</p>;

  const feeRow = (key, label) => <p className="text-sm">{label}: <strong>{data.fees[key]?.total || 0}</strong> ({data.fees[key]?.count || 0} records)</p>;
  const orderRow = (key, label) => <p className="text-sm">{label}: <strong>{data.marketplaceOrders[key]?.total || 0}</strong> ({data.marketplaceOrders[key]?.count || 0} orders)</p>;
  const payrollRow = (key, label) => <p className="text-sm">{label}: <strong>{data.payroll[key]?.total || 0}</strong> ({data.payroll[key]?.count || 0} payslips)</p>;
  const rev = data.platformRevenue;

  return (
    <div>
      <h3 className="font-semibold mb-2">Financial Management</h3>

      {isSuperAdmin && <PlatformAccountForm onFlash={onFlash} />}
      <AdminManualPayments onFlash={onFlash} isSuperAdmin={isSuperAdmin} />
      <div className="card" style={{ padding: 20, marginBottom: 16 }}>
        <h4 className="font-semibold mb-3">Pending Wallet Withdrawals {withdrawals && withdrawals.length > 0 ? `(${withdrawals.length})` : ''}</h4>
        <Table
          loading={withdrawals === null}
          headers={['User', 'Amount', 'Method', 'Details', 'Requested', 'Action']}
          rows={(withdrawals || []).map((w) => [
            `${w.user?.fullName} (${w.user?.email})`,
            `${w.currency} ${w.amount}`,
            w.payoutMethod.replace('_', ' '),
            w.payoutDetails,
            new Date(w.createdAt).toLocaleDateString(),
            <div className="flex gap-2">
              <button className="btn btn-primary" style={{ padding: '5px 12px', fontSize: '0.78rem' }} onClick={() => reviewWithdrawal(w._id, 'approved')}>Money sent</button>
              <button className="btn" style={{ padding: '5px 12px', fontSize: '0.78rem' }} onClick={() => reviewWithdrawal(w._id, 'rejected')}>Reject</button>
            </div>
          ])}
          empty="No pending withdrawal requests."
        />
        <p className="text-xs mt-2" style={{ color: 'var(--ink-soft)' }}>No payout API is connected yet: send the amount from the CareerZ bank app to the account shown, then press Money sent and enter the transaction ID. The user sees that ID. Rejecting returns the funds to their wallet.</p>
      </div>

      <div className="card" style={{ padding: 20, marginBottom: 16 }}>
        <h4 className="font-semibold mb-3">Fee Payments Awaiting Verification {feeQueue?.pending?.length ? `(${feeQueue.pending.length})` : ''}</h4>
        <Table
          loading={feeQueue === null}
          headers={['Institute', 'Student', 'Fee', 'Reported', 'Reference', 'Proof', 'Action']}
          rows={(feeQueue?.pending || []).map((f) => { const p = [...(f.paymentHistory || [])].reverse().find((h) => h.verificationStatus === 'pending'); return [
            f.institution?.name || '—', f.student?.fullName || '—', f.title,
            <span>{f.currency} {p?.amount} via {p?.method}{p?.paidByInfo ? <><br /><span className="text-xs">by {p.paidByInfo.name} ({p.paidByInfo.role})</span></> : null}</span>,
            <span>{p?.reference || '—'}{p?.bankName ? ` · ${p.bankName}` : ''}</span>,
            p?.proofUrl ? <a className="btn" style={{ padding: '4px 10px', fontSize: '0.72rem' }} href={p.proofUrl} target="_blank" rel="noreferrer">View proof</a> : '—',
            <div className="flex gap-2">
              <button className="btn btn-primary" style={{ padding: '5px 12px', fontSize: '0.78rem' }} onClick={() => decideFeePayment(f._id, 'verify')}>Verify</button>
              <button className="btn" style={{ padding: '5px 12px', fontSize: '0.78rem' }} onClick={() => decideFeePayment(f._id, 'reject')}>Reject</button>
            </div>
          ]; })}
          empty="No fee payments waiting for verification."
        />
      </div>

      <div className="card" style={{ padding: 20, marginBottom: 16 }}>
        <h4 className="font-semibold mb-3">Paid Fees Held for Release {feeQueue?.held?.length ? `(${feeQueue.held.length})` : ''}</h4>
        <Table
          loading={feeQueue === null}
          headers={['Institute', 'Student', 'Fee', 'Amount', 'Paid', 'Action']}
          rows={(feeQueue?.held || []).map((f) => [
            f.institution?.name || '—', f.student?.fullName || '—', f.title, `${f.currency} ${f.paidAmount ?? f.amount}`,
            f.paidAt ? new Date(f.paidAt).toLocaleDateString() : '—',
            <button className="btn btn-primary" style={{ padding: '5px 12px', fontSize: '0.78rem' }} onClick={() => releaseFee(f._id)}>Release</button>
          ])}
          empty="No paid fees are held."
        />
      </div>

      <div className="card" style={{ padding: 20, marginBottom: 16 }}>
        <h4 className="font-semibold mb-3">Payout Requests (Agents and Sellers)</h4>
        <Table
          loading={agentPayouts === null || sellerPayouts === null}
          headers={['Who', 'Amount', 'Method', 'Send to', 'Status', 'Action']}
          rows={[...(agentPayouts || []).map((w) => ({ ...w, kind: 'agent', person: w.agent })), ...(sellerPayouts || []).map((w) => ({ ...w, kind: 'seller', person: w.seller }))].map((w) => [
            `${w.person?.fullName || '—'} (${w.kind === 'agent' ? 'Agent' : 'Seller'})`, `${w.currency} ${w.amount}`, w.payoutMethod.replace('_', ' '), w.payoutDetails, w.status,
            <div className="flex gap-2">
              {w.status === 'requested' && <button className="btn" style={{ padding: '5px 12px', fontSize: '0.78rem' }} onClick={() => setPayout(w.kind, w._id, 'processing')}>Processing</button>}
              <button className="btn btn-primary" style={{ padding: '5px 12px', fontSize: '0.78rem' }} onClick={() => setPayout(w.kind, w._id, 'paid')}>Mark paid</button>
              <button className="btn" style={{ padding: '5px 12px', fontSize: '0.78rem' }} onClick={() => setPayout(w.kind, w._id, 'rejected')}>Reject</button>
            </div>
          ])}
          empty="No payout requests."
        />
        <p className="text-xs mt-2" style={{ color: 'var(--ink-soft)' }}>Send the money outside CareerZ to the account shown, then mark it paid. Paid and rejected are final; a rejected request frees the money so the person can request again.</p>
      </div>

      <div className="card" style={{ padding: 20, marginBottom: 16 }}>
        <h4 className="font-semibold mb-3">Donor Deposits Awaiting Verification</h4>
        <Table loading={donorDeposits === null} headers={['Donor', 'Amount', 'Method', 'Reference', 'Proof', 'Action']} rows={(donorDeposits || []).map((d) => [
          `${d.donor?.fullName || 'Donor'} (${d.donor?.email || '—'})`, `${d.currency} ${d.amount}`, d.paymentMethod, d.paymentReference,
          d.paymentProofUrl ? <a className="btn" href={d.paymentProofUrl} target="_blank" rel="noreferrer">View proof</a> : '—',
          <div className="flex gap-2"><button className="btn btn-primary" onClick={() => reviewDonorDeposit(d._id, 'confirmed')}>Confirm received</button><button className="btn" onClick={() => reviewDonorDeposit(d._id, 'rejected')}>Reject</button></div>
        ])} empty="No donor deposits awaiting verification." />
      </div>

      <div className="card" style={{ padding: 20, marginBottom: 16, border: '1px solid var(--gold)' }}>
        <h4 className="font-semibold mb-1">Platform Revenue (real, computed)</h4>
        <p className="text-xs" style={{ color: 'var(--ink-soft)', marginBottom: 12 }}>{rev.note}</p>
        <p className="text-2xl font-semibold" style={{ marginBottom: 10 }}>${rev.total}</p>
        <p className="text-sm">Institution fee commission: <strong>${rev.institutionFeeCommission.amount}</strong> ({rev.institutionFeeCommission.rate}% of ${rev.institutionFeeCommission.basedOn} collected)</p>
        <p className="text-sm">Marketplace commission: <strong>${rev.marketplaceCommission.amount}</strong> ({rev.marketplaceCommission.rate}% of ${rev.marketplaceCommission.basedOn} in delivered orders)</p>
        <p className="text-sm">Featured job listings: <strong>${rev.featuredJobRevenue.amount}</strong> ({rev.featuredJobRevenue.count} purchased)</p>

        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--sand-line)' }}>
          <ServiceCommissionRates onFlash={onFlash} canEdit={isSuperAdmin} />
        </div>
        <div className="flex gap-6 flex-wrap" style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--sand-line)' }}>
          <SavedForm value={featuredFeeInput} onRestore={setFeaturedFeeInput} onSubmit={saveFeaturedFee} className="flex items-end gap-2">
            <label className="text-xs" style={{ display: 'block' }}>Featured job fee (USD / {featuredFee?.days || 30} days)
              <input className="form-input" type="number" min="0.01" step="0.01" value={featuredFeeInput} onChange={(e) => setFeaturedFeeInput(e.target.value)} style={{ width: 90, marginTop: 4 }} />
            </label>
            <button type="submit" className="btn btn-primary" style={{ padding: '7px 14px', fontSize: '0.8rem' }}>Save</button>
          </SavedForm>
          {isSuperAdmin && featuredFee && <button type="button" className="btn" onClick={toggleFeatured}>
            {featuredFee.enabled ? 'Disable' : 'Enable'} Featured Jobs
          </button>}
        </div>
      </div>

      {planConfig && (
        <div className="card" style={{ padding: 20, marginBottom: 16 }}>
          <h4 className="font-semibold mb-1">Subscription Plan Pricing</h4>
          <p className="text-xs" style={{ color: 'var(--ink-soft)', marginBottom: 12 }}>30-day plan prices (USD). Institutions pay these via JazzCash (converted to PKR) to unlock higher student/staff limits and institution-level AI keys.</p>
          <div className="flex gap-6 flex-wrap">
            {Object.entries(planConfig.effective).filter(([k]) => k !== 'free').map(([planKey, plan]) => (
              <SavedForm key={planKey} value={planPriceInputs[planKey]} onRestore={value=>setPlanPriceInputs(prev=>({...prev,[planKey]:value}))} canEdit={isSuperAdmin} onSubmit={()=>savePlanPrice(planKey)} className="flex items-end gap-2">
                <label className="text-xs" style={{ display: 'block' }}>{plan.label}
                  <input
                    className="form-input" type="number" min="0" step="1"
                    value={planPriceInputs[planKey] ?? ''}
                    disabled={!isSuperAdmin}
                    onChange={(e) => setPlanPriceInputs((prev) => ({ ...prev, [planKey]: e.target.value }))}
                    style={{ width: 90, marginTop: 4 }}
                  />
                </label>
                {isSuperAdmin && <button type="submit" className="btn btn-primary" style={{ padding: '7px 14px', fontSize: '0.8rem' }}>Save</button>}
              </SavedForm>
            ))}
          </div>
        </div>
      )}

      <div className="grid g2" style={{ gap: 16 }}>
        <div className="card" style={{ padding: 20 }}>
          <h4 className="font-semibold mb-3">Institution Fees (platform-wide)</h4>
          {feeRow('paid', 'Collected')}
          {feeRow('pending', 'Pending')}
          {feeRow('overdue', 'Overdue')}
        </div>
        <div className="card" style={{ padding: 20 }}>
          <h4 className="font-semibold mb-3">Marketplace Orders</h4>
          {orderRow('delivered', 'Delivered')}
          {orderRow('pending', 'Pending')}
          {orderRow('cancelled', 'Cancelled')}
        </div>
        <div className="card" style={{ padding: 20 }}>
          <h4 className="font-semibold mb-3">Payroll</h4>
          {payrollRow('paid', 'Paid out')}
          {payrollRow('pending', 'Pending')}
        </div>
      </div>
    </div>
  );
}

function AdminReportsPanel({ onFlash }) {
  const [data, setData] = useState(null);
  const [loadError, setLoadError] = useState('');
  const load = () => { setLoadError(''); apiRequest('/admin/reports').then(setData).catch((err) => { setLoadError(err.message || 'Could not load reports.'); onFlash(err.message); }); };
  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!data && loadError) return <p role="alert" className="admin-notice">Reports could not be loaded: {loadError} <button type="button" className="btn btn-sm" onClick={load}>Try again</button></p>;
  if (!data) return <p role="status" className="admin-notice">Loading...</p>;

  return (
    <div>
      <h3 className="font-semibold mb-2">Platform Reports</h3>
      <SummaryRow items={[
        { label: 'Total Users', value: data.totalUsers, icon: FaUsers, detail: 'All roles' },
        { label: 'Institutions', value: data.totalInstitutions, icon: FaBuildingColumns, detail: 'Registered' },
        { label: 'Courses', value: data.totalCourses, icon: FaBookOpen, detail: 'Published & draft' },
        { label: 'Open Jobs', value: data.openJobs, icon: FaBriefcase, detail: `${data.totalJobs} total posted` }
      ]} />
      <div className="grid g2 mt-6" style={{ gap: 16 }}>
        <div className="card" style={{ padding: 20 }}>
          <h4 className="font-semibold mb-3">Users by Role</h4>
          <div style={{ display: 'grid', gap: 8 }}>
          {Object.entries(data.usersByRole).sort((a, b) => b[1] - a[1]).map(([role, count]) => (
            <div key={role} className="flex items-center justify-between text-sm"><span style={{ color: 'var(--ink-soft)', textTransform: 'capitalize' }}>{role.replace(/_/g, ' ')}</span><strong>{count}</strong></div>
          ))}
          </div>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <h4 className="font-semibold mb-3">Institutions by Verification Status</h4>
          <div style={{ display: 'grid', gap: 8 }}>
          {Object.entries(data.institutionsByStatus).map(([status, count]) => (
            <div key={status} className="flex items-center justify-between text-sm"><span style={{ color: 'var(--ink-soft)', textTransform: 'capitalize' }}>{status.replace(/_/g, ' ')}</span><strong>{count}</strong></div>
          ))}
            <div className="flex items-center justify-between text-sm"><span style={{ color: 'var(--ink-soft)' }}>Scholarships open</span><span><strong>{data.openScholarships}</strong> / {data.totalScholarships} total</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminRolePanel({ onFlash, role, title }) {
  const [users, setUsers] = useState(null);
  function load() { apiRequest(`/users?role=${role}&limit=100`).then((data) => setUsers(data.users)).catch((err) => onFlash(err.message)); }
  useEffect(load, []);

  async function setStatus(id, status) {
    try {
      await apiRequest(`/users/${id}/status`, { method: 'PATCH', body: { status } });
      onFlash(`User ${status}.`, 'success');
      load();
    } catch (err) { onFlash(err.message); }
  }

  return (
    <div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <Table
        loading={users === null}
        headers={['Name', 'Email', 'Status', 'Joined', 'Action']}
        rows={(users || []).map((u) => [
          u.fullName, u.email, <Tag status={u.status === 'active' ? 'approved' : 'rejected'} label={ADMIN_STATUS_LABEL[u.status] || u.status} />, new Date(u.createdAt).toLocaleDateString(),
          u.status === 'deleted' ? '—' : <button className="btn" style={{ padding: '4px 12px', fontSize: '0.78rem' }} onClick={() => setStatus(u._id, u.status === 'active' ? 'suspended' : 'active')}>{u.status === 'active' ? 'Suspend' : 'Activate'}</button>
        ])}
        empty={`No users hold the ${role.replace('_', ' ')} role yet.`}
      />
    </div>
  );
}

function AdminDonorsPanel({ onFlash }) {
  const [sub, setSub] = useUrlTab('adminDonorsPanel', 'donors');
  const [scholarships, setScholarships] = useState(null);
  const [donationsEnabled, setDonationsEnabled] = useState(null);
  useEffect(() => { apiRequest('/scholarships/admin/all').then(setScholarships).catch((err) => onFlash(err.message)); }, [onFlash]);
  useEffect(() => { apiRequest('/funding-requests/settings/donations-enabled').then((r) => setDonationsEnabled(r.enabled)).catch(() => {}); }, []);

  async function toggleDonations() {
    try {
      const res = await apiRequest('/funding-requests/settings/donations-enabled', { method: 'PATCH', body: { enabled: !donationsEnabled } });
      setDonationsEnabled(res.enabled);
      onFlash(`Donations feature ${res.enabled ? 'enabled' : 'disabled'} platform-wide.`, 'success');
    } catch (err) { onFlash(err.message); }
  }

  return (
    <div>
      <div className="card flex items-center justify-between flex-wrap gap-2" style={{ padding: 16, marginBottom: 16 }}>
        <div>
          <strong className="text-sm">Donations Feature (Platform-Wide)</strong>
          <p className="text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>{donationsEnabled === null ? 'Loading...' : donationsEnabled ? 'Enabled — donors can donate/sponsor.' : 'Disabled — all donations are blocked platform-wide.'}</p>
        </div>
        <button type="button" className={`btn${donationsEnabled ? '' : ' btn-primary'}`} disabled={donationsEnabled === null} onClick={toggleDonations}>{donationsEnabled ? 'Disable Donations' : 'Enable Donations'}</button>
      </div>
      <nav className="cz-tabbar" style={{ marginBottom: 20 }}>
        {[{ key: 'donors', label: 'Donors' }, { key: 'scholarships', label: 'All Scholarships' }].map((t) => (
          <button key={t.key} type="button" aria-pressed={sub === t.key} className={`cz-tab${sub === t.key ? ' active' : ''}`} onClick={() => setSub(t.key)}>{t.label}</button>
        ))}
      </nav>
      {sub === 'donors' && <AdminRolePanel onFlash={onFlash} role="donor" title="Donor Management" />}
      {sub === 'scholarships' && (
        <Table
          loading={scholarships === null}
          headers={['Title', 'Donor', 'Amount', 'Status', 'Posted']}
          rows={(scholarships || []).map((s) => [s.title, s.donor?.fullName, `${s.currency} ${s.amount}`, <Tag status={s.status === 'open' ? 'approved' : 'pending'} />, new Date(s.createdAt).toLocaleDateString()])}
          empty="No scholarships posted yet."
        />
      )}
    </div>
  );
}

function AdminComplaintsPanel({ onFlash }) {
  const [complaints, setComplaints] = useState(null);
  const [filter, setFilter] = useState('');

  function load() {
    apiRequest(`/complaints${filter ? `?status=${filter}` : ''}`).then(setComplaints).catch((err) => onFlash(err.message));
  }
  useEffect(load, [filter]);

  async function decide(id, status) {
    try {
      await apiRequest(`/complaints/${id}`, { method: 'PATCH', body: { status } });
      onFlash(`Complaint ${status}.`, 'success');
      load();
    } catch (err) { onFlash(err.message); }
  }

  return (
    <div>
      <h3 className="font-semibold mb-2">Complaint Management</h3>
      <select className="form-select mb-4" value={filter} onChange={(e) => setFilter(e.target.value)} style={{ maxWidth: 200 }}>
        <option value="">All statuses</option>
        {['open', 'in_review', 'resolved', 'dismissed'].map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      <Table
        loading={complaints === null}
        headers={['Subject', 'By', 'Against', 'Category', 'Status', 'Action']}
        rows={(complaints || []).map((c) => [
          <div>{c.subject}<p>{c.description}</p>{c.messageEvidence?.length>0&&<details><summary>Submitted message evidence ({c.messageEvidence.length})</summary>{c.messageEvidence.map((m,i)=><article key={i}><p>{new Date(m.sentAt).toLocaleString()} · {m.kind}</p><p style={{whiteSpace:'pre-wrap'}}>{m.text}</p>{m.attachments.map((f,j)=><a key={j} href={f.url} target="_blank" rel="noreferrer">{f.name}</a>)}</article>)}</details>}</div>, c.submittedBy?.fullName,
          c.target ? <span>{c.target.fullName}<br /><span style={{ fontSize: '0.75rem', color: 'var(--ink-soft)' }}>{c.target.email}{c.target.phone ? ` · ${c.target.phone}` : ''}</span></span> : '—',
          c.category, <Tag status={c.status === 'resolved' ? 'approved' : c.status === 'dismissed' ? 'rejected' : 'pending'} />,
          c.status === 'open' || c.status === 'in_review' ? (
            <div className="flex gap-1">
              <button className="btn" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => decide(c._id, 'in_review')}>Mark In Review</button>
              <button className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => decide(c._id, 'resolved')}>Resolve</button>
              <button className="btn" style={{ padding: '4px 10px', fontSize: '0.75rem', background: 'var(--sand-line)' }} onClick={() => decide(c._id, 'dismissed')}>Dismiss</button>
            </div>
          ) : '—'
        ])}
        empty="No complaints filed."
      />
    </div>
  );
}

function AdminSecurityPanel({ onFlash }) {
  const [attempts, setAttempts] = useState(null);
  const [blocked, setBlocked] = useState(null);
  const [ipForm, setIpForm] = useState({ ip: '', reason: '' });

  function load() {
    apiRequest('/security/login-attempts').then(setAttempts).catch((err) => onFlash(err.message));
    apiRequest('/security/blocked-ips').then(setBlocked).catch((err) => onFlash(err.message));
  }
  useEffect(load, []);

  async function blockIp(e) {
    e.preventDefault();
    try {
      await apiRequest('/security/blocked-ips', { method: 'POST', body: ipForm });
      onFlash('IP blocked.', 'success');
      setIpForm({ ip: '', reason: '' });
      load();
    } catch (err) { onFlash(err.message); }
  }

  async function unblockIp(id) {
    try {
      await apiRequest(`/security/blocked-ips/${id}`, { method: 'DELETE' });
      onFlash('IP unblocked.', 'success');
      load();
    } catch (err) { onFlash(err.message); }
  }

  return (
    <div>
      <h3 className="font-semibold mb-2">Security & Monitoring</h3>
      <h4 className="font-semibold mb-2 mt-4">Blocked IP Addresses</h4>
      <form onSubmit={blockIp} className="flex gap-2 items-end mb-3 flex-wrap">
        <input className="form-input" placeholder="IP address" required value={ipForm.ip} onChange={(e) => setIpForm({ ...ipForm, ip: e.target.value })} style={{ maxWidth: 200 }} />
        <input className="form-input" placeholder="Reason (optional)" value={ipForm.reason} onChange={(e) => setIpForm({ ...ipForm, reason: e.target.value })} style={{ maxWidth: 260 }} />
        <button type="submit" className="btn btn-primary">Block IP</button>
      </form>
      <Table
        loading={blocked === null}
        headers={['IP', 'Reason', 'Blocked By', 'Action']}
        rows={(blocked || []).map((b) => [b.ip, b.reason || '—', b.blockedBy?.fullName || '—', <button className="btn" style={{ padding: '4px 12px', fontSize: '0.78rem' }} onClick={() => unblockIp(b._id)}>Unblock</button>])}
        empty="No IP addresses blocked."
      />
      <h4 className="font-semibold mb-2 mt-6">Recent Login Attempts</h4>
      <Table
        loading={attempts === null}
        headers={['Email', 'IP', 'Result', 'When']}
        rows={(attempts || []).map((a) => [a.email, a.ip || '—', <Tag status={a.success ? 'approved' : 'rejected'} />, new Date(a.createdAt).toLocaleString()])}
        empty="No login attempts recorded yet."
      />
    </div>
  );
}

function AdminSettingsPanel({ onFlash, isSuperAdmin }) {
  const [sub, setSub] = useUrlTab('adminSettingsPanel', 'countries');
  return (
    <div>
      <h3 className="font-semibold mb-2">Global Settings</h3>
      <nav className="cz-tabbar" style={{ marginBottom: 20 }}>
        {[{ key: 'countries', label: 'Countries' }, { key: 'languages', label: 'Languages' }, { key: 'currencies', label: 'Currencies' }, { key: 'features', label: 'Feature Toggles' }, ...(isSuperAdmin ? [{ key: 'aiProviders', label: 'AI Providers' }] : [])].map((t) => (
          <button key={t.key} type="button" aria-pressed={sub === t.key} className={`cz-tab${sub === t.key ? ' active' : ''}`} onClick={() => setSub(t.key)}>{t.label}</button>
        ))}
      </nav>
      {sub === 'countries' && <SettingsCollectionPanel onFlash={onFlash} kind="countries" fields={['name', 'code']} />}
      {sub === 'languages' && <SettingsCollectionPanel onFlash={onFlash} kind="languages" fields={['name', 'code']} />}
      {sub === 'currencies' && <SettingsCollectionPanel onFlash={onFlash} kind="currencies" fields={['name', 'code', 'symbol']} />}
      {sub === 'features' && <FeatureFlagsPanel onFlash={onFlash} />}
      {sub === 'aiProviders' && isSuperAdmin && <><AdminAiProvidersPanel onFlash={onFlash} /><SiteAssistantSettings onFlash={onFlash} /></>}
    </div>
  );
}

function AdminAiProvidersPanel({ onFlash }) {
  const [config, setConfig] = useState(null);
  const [modelInputs, setModelInputs] = useState({});
  function load() {
    apiRequest('/admin/ai-providers').then((d) => {
      setConfig(d);
      const inputs = {};
      Object.entries(d.all).forEach(([purpose, providers]) => providers.forEach((provider) => {
        inputs[`${purpose}:${provider}`] = d.models?.[purpose]?.[provider] || '';
      }));
      setModelInputs(inputs);
    }).catch((error) => onFlash(error.message));
  }
  useEffect(load, []);
  async function toggle(purpose, provider) {
    try {
      const enabled = Object.fromEntries(Object.entries(config.all).map(([key]) => [key, [...(config.enabled[key] || [])]]));
      enabled[purpose] = enabled[purpose].includes(provider)
        ? enabled[purpose].filter((item) => item !== provider)
        : [...enabled[purpose], provider];
      await apiRequest('/admin/ai-providers', { method: 'PATCH', body: { enabled } });
      setConfig({ ...config, enabled });
      onFlash('AI provider availability saved.', 'success');
    } catch (error) { onFlash(error.message); }
  }
  function setProviderEnabled(purpose,provider,on) { setConfig(prev=>({...prev,enabled:{...prev.enabled,[purpose]:on?[...new Set([...(prev.enabled[purpose]||[]),provider])]:(prev.enabled[purpose]||[]).filter(item=>item!==provider)}})); }
  async function saveModel(purpose, provider) {
    try {
      const model = (modelInputs[`${purpose}:${provider}`] || '').trim();
      const models = { [purpose]: { [provider]: model } };
      await apiRequest('/admin/ai-providers', { method: 'PATCH', body: { models, enabled: config.enabled } });
      onFlash('Default model saved.', 'success');
      setConfig(prev=>({...prev,models:{...prev.models,[purpose]:{...prev.models?.[purpose],[provider]:model}}})); return true;
    } catch (error) { onFlash(error.message); }
  }
  if (!config) return <p role="status">Loading AI providers...</p>;
  return <div className="space-y-3">
    <p className="admin-notice">Choose which bring-your-own-key providers users and institutions may connect, and optionally set the default model used when a connection doesn't request a specific one.</p>
    {Object.entries(config.all).map(([purpose, providers]) => <div key={purpose} className="card" style={{ padding: 14 }}>
      <strong className="text-sm" style={{ textTransform: 'capitalize' }}>{purpose}</strong>
      <div className="space-y-2" style={{ marginTop: 10 }}>
        {providers.map((provider) => (
          <SavedForm key={provider} showValues={true} value={{model:modelInputs[`${purpose}:${provider}`]||'',enabled:(config.enabled[purpose]||[]).includes(provider)}} onRestore={v=>{setModelInputs(prev=>({...prev,[`${purpose}:${provider}`]:v.model}));setProviderEnabled(purpose,provider,v.enabled);}} onSubmit={()=>saveModel(purpose,provider)} className="flex items-center gap-3 flex-wrap">
            <label className="text-xs" style={{ minWidth: 90 }}>
              <input type="checkbox" checked={(config.enabled[purpose] || []).includes(provider)} onChange={e => setProviderEnabled(purpose, provider, e.target.checked)} /> {provider}
            </label>
            <input
              className="form-input" placeholder="Default model (optional)" style={{ maxWidth: 220, fontSize: '0.78rem' }}
              value={modelInputs[`${purpose}:${provider}`] || ''}
              onChange={(e) => setModelInputs((prev) => ({ ...prev, [`${purpose}:${provider}`]: e.target.value }))}
            />
            <button type="submit" className="btn" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>Save model</button>
          </SavedForm>
        ))}
      </div>
    </div>)}
  </div>;
}

function SettingsCollectionPanel({ onFlash, kind, fields }) {
  const [items, setItems] = useState(null);
  const [form, setForm] = useState(Object.fromEntries(fields.map((f) => [f, ''])));

  function load() { apiRequest(`/config/${kind}`).then(setItems).catch((err) => onFlash(err.message)); }
  useEffect(load, [kind]);

  async function create(e) {
    e.preventDefault();
    try {
      await apiRequest(`/config/${kind}`, { method: 'POST', body: form });
      onFlash('Added.', 'success');
      setForm(Object.fromEntries(fields.map((f) => [f, ''])));
      load();
    } catch (err) { onFlash(err.message); }
  }

  async function toggleActive(item) {
    try {
      await apiRequest(`/config/${kind}/${item._id}`, { method: 'PATCH', body: { active: !item.active } });
      load();
    } catch (err) { onFlash(err.message); }
  }

  return (
    <div>
      <form onSubmit={create} className="flex gap-2 items-end mb-4 flex-wrap">
        {fields.map((f) => (
          <input key={f} className="form-input" placeholder={f} required value={form[f]} onChange={(e) => setForm({ ...form, [f]: e.target.value })} style={{ maxWidth: 160 }} />
        ))}
        <button type="submit" className="btn btn-primary">Add</button>
      </form>
      <Table
        loading={items === null}
        headers={[...fields, 'Active', 'Action']}
        rows={(items || []).map((item) => [
          ...fields.map((f) => item[f]), <Tag status={item.active ? 'approved' : 'rejected'} />,
          <button className="btn" style={{ padding: '4px 12px', fontSize: '0.78rem' }} onClick={() => toggleActive(item)}>{item.active ? 'Deactivate' : 'Activate'}</button>
        ])}
        empty="Nothing added yet."
      />
    </div>
  );
}

function FeatureFlagsPanel({ onFlash }) {
  const [flags, setFlags] = useState(null);
  const [form, setForm] = useState({ key: '', label: '', enabled: true });

  function load() { apiRequest('/config/feature-flags').then(setFlags).catch((err) => onFlash(err.message)); }
  useEffect(load, []);

  async function create(e) {
    e.preventDefault();
    try {
      await apiRequest('/config/feature-flags', { method: 'POST', body: form });
      onFlash('Feature flag saved.', 'success');
      setForm({ key: '', label: '', enabled: true });
      load();
    } catch (err) { onFlash(err.message); }
  }

  async function toggle(flag) {
    try {
      await apiRequest('/config/feature-flags', { method: 'POST', body: { key: flag.key, label: flag.label, enabled: !flag.enabled, scope: flag.scope, scopeValue: flag.scopeValue } });
      load();
    } catch (err) { onFlash(err.message); }
  }

  return (
    <div>
      <form onSubmit={create} className="flex gap-2 items-end mb-4 flex-wrap">
        <input className="form-input" placeholder="Key (e.g. live_video_classes)" required value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value })} style={{ maxWidth: 220 }} />
        <input className="form-input" placeholder="Label" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} style={{ maxWidth: 220 }} />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.enabled} onChange={(e) => setForm({ ...form, enabled: e.target.checked })} /> Enabled</label>
        <button type="submit" className="btn btn-primary">Save Flag</button>
      </form>
      <Table
        loading={flags === null}
        headers={['Key', 'Label', 'Enabled', 'Action']}
        rows={(flags || []).map((f) => [f.key, f.label || '—', <Tag status={f.enabled ? 'approved' : 'rejected'} />, <button className="btn" style={{ padding: '4px 12px', fontSize: '0.78rem' }} onClick={() => toggle(f)}>{f.enabled ? 'Disable' : 'Enable'}</button>])}
        empty="No feature flags configured yet."
      />
    </div>
  );
}

const ADMIN_SUBTABS = [
  { key: 'requests', label: 'Pending Requests' },
  { key: 'users', label: 'All Users' },
  { key: 'institutions', label: 'Institutions' }
];

function AdminPanel({ onFlash }) {
  const [sub, setSub] = useUrlTab('adminPanel', 'requests');
  const [dash, setDash] = useState(null);
  const [revision, setRevision] = useState(0);
  const [statsError, setStatsError] = useState(false);

  useEffect(() => {
    let active = true;
    setStatsError(false);
    apiRequest('/admin/dashboard')
      .then((d) => { if (active) setDash(d); })
      .catch(() => { if (active) setStatsError(true); });
    return () => { active = false; };
  }, [revision]);

  const roleLabel = (key) => ADMIN_USER_ROLE_OPTIONS.find((o) => o.value === key)?.label || key.replace(/_/g, ' ');

  return (
    <div>
      {statsError && <p role="alert" className="admin-notice error">Overview could not be loaded. <button type="button" onClick={() => setRevision(value => value + 1)}>Retry</button></p>}

      <div className="admin-stats">
        {[
          { label: 'Total users', value: dash?.totalUsers, icon: FaUsers, detail: `${dash?.newUsersToday ?? 0} joined today` },
          { label: 'Pending role requests', value: dash?.pendingWork?.roleRequests, icon: FaClipboardCheck, detail: 'Awaiting your review' },
          { label: 'Institutions', value: dash?.totalInstitutions, icon: FaBuildingColumns, detail: `${dash?.pendingWork?.institutionVerifications ?? 0} pending verification` },
          { label: 'Open complaints', value: dash?.pendingWork?.openComplaints, icon: FaShieldHalved, detail: `${dash?.pendingWork?.blockedIps ?? 0} IPs blocked` }
        ].map(item => (
          <div className="admin-stat" key={item.label}><div className="admin-stat-top"><span>{item.label}</span><span className="admin-stat-icon"><item.icon aria-hidden="true" /></span></div><strong>{item.value ?? '—'}</strong><p>{item.detail}</p></div>
        ))}
      </div>

      {dash && (
        <div className="grid g2 mt-6" style={{ gap: 16 }}>
          <div className="card" style={{ padding: 20 }}>
            <h4 className="font-semibold mb-3">Accounts by Type</h4>
            <div style={{ display: 'grid', gap: 8 }}>
              {Object.entries(dash.usersByRole).filter(([, count]) => count > 0).sort((a, b) => b[1] - a[1]).map(([role, count]) => (
                <div key={role} className="flex items-center justify-between text-sm"><span style={{ color: 'var(--ink-soft)' }}>{roleLabel(role)}</span><strong>{count}</strong></div>
              ))}
            </div>
          </div>
          <div className="card" style={{ padding: 20 }}>
            <h4 className="font-semibold mb-3">Revenue Snapshot</h4>
            <p className="text-xs" style={{ color: 'var(--ink-soft)', marginBottom: 8 }}>Fees collected (institutions)</p>
            {dash.revenue.feesCollected.length === 0 && <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>None yet.</p>}
            {dash.revenue.feesCollected.map((r) => <p key={r._id} className="text-sm">{r._id}: <strong>{r.total.toLocaleString()}</strong></p>)}
            <p className="text-xs" style={{ color: 'var(--ink-soft)', margin: '14px 0 8px' }}>Marketplace delivered</p>
            {dash.revenue.marketplaceDelivered.length === 0 && <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>None yet.</p>}
            {dash.revenue.marketplaceDelivered.map((r) => <p key={r._id} className="text-sm">{r._id}: <strong>{r.total.toLocaleString()}</strong></p>)}
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--sand-line)' }}>
              <p className="text-sm">Courses: <strong>{dash.platform.totalCourses}</strong> · Active jobs: <strong>{dash.platform.activeJobs}</strong>/{dash.platform.totalJobs} · Open scholarships: <strong>{dash.platform.openScholarships}</strong>/{dash.platform.totalScholarships}</p>
            </div>
          </div>
        </div>
      )}

      <div className="admin-section-heading" style={{ marginTop: 28 }}><div><h3>Management center</h3><p>Review requests and manage platform records.</p></div></div>

      <nav className="cz-tabbar" style={{ marginBottom: 20 }}>
        {ADMIN_SUBTABS.map((t) => (
          <button key={t.key} type="button" aria-pressed={sub === t.key} className={`cz-tab${sub === t.key ? ' active' : ''}`} onClick={() => setSub(t.key)}>
            {t.label}
          </button>
        ))}
      </nav>

      {sub === 'requests' && <AdminRequests onFlash={onFlash} onChanged={() => setRevision(value => value + 1)} />}
      {sub === 'users' && <AdminUsers onFlash={onFlash} />}
      {sub === 'institutions' && <AdminInstitutions onFlash={onFlash} />}
    </div>
  );
}

function AdminRequests({ onFlash, onChanged }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  async function load() {
    setLoading(true); setLoadError('');
    try { const data = await apiRequest('/roles/pending'); setRequests(data); }
    catch (err) { setLoadError(err.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function review(id, decision) {
    try {
      await apiRequest(`/roles/${id}/review`, { method: 'PATCH', body: { decision } });
      onFlash(`Request ${decision}.`, 'success');
      onChanged?.();
      load();
    } catch (err) { onFlash(err.message); }
  }

  return (
    <Table
      loading={loading} error={loadError} onRetry={load}
      headers={['User', 'Role', 'Action']}
      rows={requests.map((r) => [
        `${r.user.fullName} (${r.user.email})`, r.requestedRole,
        <div className="flex gap-2">
          <button className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.8rem' }} onClick={() => review(r._id, 'approved')}>Approve</button>
          <button className="btn" style={{ padding: '6px 14px', fontSize: '0.8rem', background: 'var(--sand-line)', color: 'var(--ink)' }} onClick={() => review(r._id, 'rejected')}>Reject</button>
        </div>
      ])}
      empty="No pending requests."
    />
  );
}

// Every real account type the platform supports (mirrors backend config/rbac.js ROLES) — lets
// Super Admin actually manage each one, not just scroll through the first 50 mixed accounts.
const ADMIN_USER_ROLE_OPTIONS = [
  { value: '', label: 'All account types' },
  { value: 'student', label: 'Student' },
  { value: 'parent', label: 'Parent' },
  { value: 'teacher', label: 'Teacher' },
  { value: 'institution_owner', label: 'Institution Owner' },
  { value: 'institution_staff', label: 'Institution Staff' },
  { value: 'employer', label: 'Employer' },
  { value: 'education_agent', label: 'Education Agent' },
  { value: 'donor', label: 'Donor' },
  { value: 'academy_owner', label: 'Academy Owner' },
  { value: 'marketplace_seller', label: 'Marketplace Seller' },
  { value: 'platform_staff', label: 'Platform Staff' },
  { value: 'admin', label: 'Admin' },
  { value: 'super_admin', label: 'Super Admin' }
];

const ADMIN_USER_STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'disabled', label: 'Disabled' },
  { value: 'deleted', label: 'Deleted' }
];

// Readable names for account status and roles in the admin lists (audit N-25: "super_admin" and deleted accounts read wrongly).
const ADMIN_STATUS_LABEL = { active: 'Active', suspended: 'Suspended', disabled: 'Disabled', deleted: 'Deleted' };

const adminRoleLabel = (r) => ADMIN_USER_ROLE_OPTIONS.find((o) => o.value === r)?.label || String(r).replace(/_/g, ' ').replace(/w/g, (c) => c.toUpperCase());

function AdminUsers({ onFlash }) {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [qInput, setQInput] = useState('');
  const [page, setPage] = useState(1);
  const limit = 25;

  async function load() {
    setLoading(true); setLoadError('');
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (role) params.set('role', role);
      if (status) params.set('status', status);
      if (q) params.set('q', q);
      const data = await apiRequest(`/users?${params.toString()}`);
      setUsers(data.users);
      setTotal(data.total);
    } catch (err) { setLoadError(err.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, [role, status, q, page]); // eslint-disable-line react-hooks/exhaustive-deps

  // Any filter change resets to page 1 — otherwise an admin can land on an out-of-range page.
  useEffect(() => { setPage(1); }, [role, status, q]);

  function submitSearch(e) {
    e.preventDefault();
    setQ(qInput.trim());
  }

  async function setUserStatus(id, next) {
    try {
      await apiRequest(`/users/${id}/status`, { method: 'PATCH', body: { status: next } });
      onFlash(`User ${next}.`, 'success');
      load();
    } catch (err) { onFlash(err.message); }
  }

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div>
      <div className="flex flex-wrap items-end" style={{ gap: 12, marginBottom: 16 }}>
        <div style={{ flex: '1 1 200px', minWidth: 0 }}>
          <CustomSelect value={role} onChange={setRole} ariaLabel="Filter by account type" minWidth="100%" options={ADMIN_USER_ROLE_OPTIONS} />
        </div>
        <div style={{ flex: '1 1 160px', minWidth: 0 }}>
          <CustomSelect value={status} onChange={setStatus} ariaLabel="Filter by status" minWidth="100%" options={ADMIN_USER_STATUS_OPTIONS} />
        </div>
        <form onSubmit={submitSearch} className="flex" style={{ gap: 8, flex: '2 1 260px', minWidth: 0 }}>
          <input className="form-input" placeholder="Search by name or email" value={qInput} onChange={(e) => setQInput(e.target.value)} style={{ flex: '1 1 auto', minWidth: 0 }} />
          <button type="submit" className="btn" style={{ flexShrink: 0 }}>Search</button>
        </form>
      </div>

      <p className="text-xs" style={{ color: 'var(--ink-soft)', marginBottom: 10 }}>{total} account{total === 1 ? '' : 's'}{role ? ` · ${ADMIN_USER_ROLE_OPTIONS.find((o) => o.value === role)?.label}` : ''}{status ? ` · ${status}` : ''}{q ? ` · matching "${q}"` : ''}</p>

      <Table
        loading={loading} error={loadError} onRetry={load}
        headers={['Name', 'Email', 'Roles', 'Status', 'Action']}
        rows={users.map((u) => [
          u.fullName, u.email, u.roles.map(adminRoleLabel).join(', '), <Tag status={u.status === 'active' ? 'approved' : 'rejected'} label={ADMIN_STATUS_LABEL[u.status] || u.status} />,
          u.roles.includes('super_admin') || u.status === 'deleted' ? '—' : (
            <div className="flex gap-2">
              {u.status === 'active'
                ? <button className="btn" style={{ padding: '6px 14px', fontSize: '0.8rem', background: 'var(--sand-line)', color: 'var(--ink)' }} onClick={() => setUserStatus(u._id, 'suspended')}>Suspend</button>
                : <button className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.8rem' }} onClick={() => setUserStatus(u._id, 'active')}>Activate</button>}
            </div>
          )
        ])}
        empty="No users match these filters."
      />

      {total > limit && (
        <div className="flex items-center justify-between" style={{ marginTop: 14 }}>
          <button type="button" className="btn flex items-center" disabled={page <= 1} style={{ padding: '6px 14px', fontSize: '0.8rem', gap: 5 }} onClick={() => setPage((p) => Math.max(1, p - 1))}><FaArrowLeft aria-hidden="true" /> Prev</button>
          <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>Page {page} of {totalPages}</span>
          <button type="button" className="btn flex items-center" disabled={page >= totalPages} style={{ padding: '6px 14px', fontSize: '0.8rem', gap: 5 }} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next <FaArrowRight aria-hidden="true" /></button>
        </div>
      )}
    </div>
  );
}

function AdminInstitutions({ onFlash }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  async function load() {
    setLoading(true); setLoadError('');
    try { const data = await apiRequest('/institutions/admin/all'); setList(data); }
    catch (err) { setLoadError(err.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function verify(id, decision) {
    try {
      await apiRequest(`/institutions/${id}/verify`, { method: 'PATCH', body: { decision } });
      onFlash(`Institution ${decision}.`, 'success');
      load();
    } catch (err) { onFlash(err.message); }
  }

  return (
    <Table
      loading={loading} error={loadError} onRetry={load}
      headers={['Name', 'Type', 'Verification', 'Action']}
      rows={list.map((i) => [
        i.name, i.type, <Tag status={i.verificationStatus} />,
        i.verificationStatus === 'approved' ? '—' : (
          <div className="flex gap-2">
            <button className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.8rem' }} onClick={() => verify(i._id, 'approved')}>Approve</button>
            <button className="btn" style={{ padding: '6px 14px', fontSize: '0.8rem', background: 'var(--sand-line)', color: 'var(--ink)' }} onClick={() => verify(i._id, 'rejected')}>Reject</button>
          </div>
        )
      ])}
      empty="No institutions yet."
    />
  );
}

function StaffDepartmentForm({staff,onFlash,onSaved}) {
 const [departments,setDepartments]=useState(staff.departments||[]);
 return <SavedForm value={departments} onRestore={setDepartments} editLabel="Edit departments" onSubmit={async()=>{try{await apiRequest(`/admin/staff/${staff._id}`,{method:'PATCH',body:{departments}});onSaved();onFlash('Staff departments saved.','success');return true;}catch(e){onFlash(e.message);}}}>{STAFF_DEPARTMENTS.map(d=><label key={d.value} className="text-xs" style={{display:'block'}}><input type="checkbox" checked={departments.includes(d.value)} onChange={e=>setDepartments(prev=>e.target.checked?[...prev,d.value]:prev.filter(v=>v!==d.value))}/>{d.label}</label>)}<button type="submit" className="btn btn-primary">Save departments</button></SavedForm>;
}
