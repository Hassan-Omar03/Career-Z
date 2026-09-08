import { FaShieldHalved, FaUsers, FaBuildingColumns, FaClipboardCheck, FaUser, FaUserShield, FaArrowDown } from 'react-icons/fa6';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../api/client';
import { verifyEmail, resendVerification } from '../api/auth';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import {
  WelcomeBanner, OverviewStats, WalletCard, StatusGrid, QuickActions,
  ProfileCompletion, MiniCalendar, RecommendedGrid, RecentActivity
} from '../components/dashboard/DashboardWidgets';

const TABS = [
  { key: 'profile', label: 'Profile' },
  { key: 'roles', label: 'My Roles' },
  { key: 'student', label: 'Student', roles: ['student'] },
  { key: 'teacher', label: 'Teacher', roles: ['teacher'] },
  { key: 'parent', label: 'Parent', roles: ['parent'] },
  { key: 'institution', label: 'Institution', roles: ['institution_owner', 'academy_owner', 'institution_staff'] },
  { key: 'admin', label: 'Admin', roles: ['admin', 'super_admin'] }
];

function Tag({ status }) {
  const styles = {
    pending: 'bg-amber-100 text-amber-800',
    approved: 'bg-emerald-100 text-emerald-800',
    rejected: 'bg-rose-100 text-rose-800',
    under_review: 'bg-indigo-100 text-indigo-800'
  };
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100 text-gray-700'}`}>{status}</span>;
}

export default function Dashboard() {
  const { user, refreshProfile } = useAuth();
  const roles = user?.roles || [];
  const isAdmin = roles.includes('admin') || roles.includes('super_admin');
  const [msg, setMsg] = useState(null);

  const visibleTabs = TABS.filter((t) => !t.roles || t.roles.some((r) => roles.includes(r)));

  function flash(text, type = 'error') {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 4000);
  }

  if (isAdmin) {
    return (
      <DashboardLayout trail={['Administration']}>
        <div className="admin-intro">
          <div><div className="eyebrow">ADMIN WORKSPACE</div><h1>Platform overview</h1><p>Welcome back, {(user?.fullName || '').split(' ')[0]}. Manage your community and keep CareerZ moving.</p></div>
          <span className="admin-access"><FaShieldHalved aria-hidden="true" />{roles.includes('super_admin') ? 'Super administrator' : 'Administrator'}</span>
        </div>
        <nav className="admin-section-links" aria-label="Admin sections">
          <a href="#admin-management"><FaShieldHalved aria-hidden="true" /><span>Admin<small>Users, requests & institutions</small></span><FaArrowDown aria-hidden="true" /></a>
          <a href="#admin-profile"><FaUser aria-hidden="true" /><span>Profile<small>Your account details</small></span><FaArrowDown aria-hidden="true" /></a>
          <a href="#admin-roles"><FaUserShield aria-hidden="true" /><span>My Roles<small>Your assigned access</small></span><FaArrowDown aria-hidden="true" /></a>
        </nav>
        {msg && <div role="status" className={`admin-notice ${msg.type}`}>{msg.text}</div>}
        <section id="admin-management" className="admin-section" aria-labelledby="admin-title">
          <div className="admin-section-heading"><div><h2 id="admin-title">Admin</h2><p>Platform activity and pending reviews.</p></div><span className="admin-section-kicker">PLATFORM MANAGEMENT</span></div>
          <AdminPanel onFlash={flash} />
        </section>
        <div className="admin-account-grid">
          <section id="admin-profile" className="admin-section admin-account-card" aria-labelledby="admin-profile-title">
            <div className="admin-section-heading"><div><h2 id="admin-profile-title">Profile</h2><p>Your personal account information.</p></div><FaUser aria-hidden="true" /></div>
            <ProfilePanel user={user} onFlash={flash} onChanged={refreshProfile} />
          </section>
          <section id="admin-roles" className="admin-section admin-account-card" aria-labelledby="admin-roles-title">
            <div className="admin-section-heading"><div><h2 id="admin-roles-title">My Roles</h2><p>Roles currently assigned to your account.</p></div><FaUserShield aria-hidden="true" /></div>
            <ul className="admin-role-list">{roles.map(role => <li key={role}><FaShieldHalved aria-hidden="true" /><span>{role.replaceAll('_', ' ')}</span><span className="admin-role-badge">Assigned</span></li>)}</ul>
          </section>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <WelcomeBanner name={(user?.fullName || '').split(' ')[0] || 'there'} />


      <nav className="member-section-links" aria-label="Account sections">
        {visibleTabs.map(section => <a key={section.key} href={`#account-${section.key}`}><span className="member-section-icon">{section.key === 'profile' ? <FaUser aria-hidden="true" /> : <FaUserShield aria-hidden="true" />}</span><span>{section.label}<small>{section.key === 'profile' ? 'Your account details' : section.key === 'roles' ? 'Manage your access' : 'Your learning & work'}</small></span><FaArrowDown aria-hidden="true" /></a>)}
      </nav>
      {msg && <div role="status" className={`admin-notice ${msg.type}`}>{msg.text}</div>}
      <div className="member-account-grid">
        {visibleTabs.map(section => (
          <section key={section.key} id={`account-${section.key}`} className={`member-section member-section-${section.key}`} aria-labelledby={`title-${section.key}`}>
            <div className="member-section-heading"><div><span className="eyebrow">{section.key === 'profile' || section.key === 'roles' ? 'MY ACCOUNT' : 'MY WORKSPACE'}</span><h2 id={`title-${section.key}`}>{section.label}</h2></div><span className="member-section-icon">{section.key === 'profile' ? <FaUser aria-hidden="true" /> : <FaUserShield aria-hidden="true" />}</span></div>
            {section.key === 'profile' && <ProfilePanel user={user} onFlash={flash} onChanged={refreshProfile} />}
            {section.key === 'roles' && <RolesPanel onFlash={flash} onChanged={refreshProfile} />}
            {section.key === 'student' && <StudentPanel onFlash={flash} />}
            {section.key === 'teacher' && <TeacherPanel onFlash={flash} />}
            {section.key === 'parent' && <ParentPanel onFlash={flash} />}
            {section.key === 'institution' && <InstitutionPanel onFlash={flash} onChanged={refreshProfile} />}
          </section>
        ))}
      </div>

      {!isAdmin && (
        <>
          <OverviewStats />
          <WalletCard />
          <StatusGrid />
          <QuickActions />

          <div className="grid g2" style={{ marginTop: 32 }}>
            <ProfileCompletion percent={user?.emailVerified ? 70 : 40} />
            <MiniCalendar />
          </div>

          <RecommendedGrid />
          <RecentActivity />
        </>
      )}
    </DashboardLayout>
  );
}

function ProfilePanel({ user, onFlash, onChanged }) {
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);

  async function resend() {
    try { await resendVerification(); setSent(true); onFlash('Verification code sent. Check the backend console (SMTP is not configured yet).', 'success'); } catch (err) { onFlash(err.message); }
  }
  async function verify(e) {
    e.preventDefault();
    try { await verifyEmail(code); onFlash('Email verified!', 'success'); setCode(''); onChanged?.(); } catch (err) { onFlash(err.message); }
  }

  if (!user) return null;
  return (
    <div className="account-profile-details">
      <p><strong>Name:</strong> {user.fullName}</p>
      <p className="mt-1"><strong>Email:</strong> {user.email} {user.emailVerified ? <Tag status="approved" /> : <Tag status="pending" />}</p>
      <p className="mt-1"><strong>Roles:</strong> {user.roles.join(', ')}</p>
      <p className="mt-1"><strong>Status:</strong> {user.status}</p>

      {!user.emailVerified && (
        <div className="mt-4 p-4 rounded-xl" style={{ background: 'var(--sand)', border: '1px solid var(--sand-line)' }}>
          <p className="text-sm mb-3"><strong>Verify your email</strong> — the code is printed in the backend terminal (SMTP not configured yet, so it isn't emailed for real).</p>
          <button type="button" className="btn btn-primary" style={{ padding: '6px 16px', fontSize: '0.8rem' }} onClick={resend}>
            {sent ? 'Resend code' : 'Send verification code'}
          </button>
          <form onSubmit={verify} className="flex gap-3 items-end flex-wrap mt-3">
            <input className="form-input" placeholder="6-digit code" value={code} onChange={(e) => setCode(e.target.value)} style={{ maxWidth: 180 }} />
            <button type="submit" className="btn btn-primary" style={{ padding: '6px 16px', fontSize: '0.8rem' }}>Verify</button>
          </form>
        </div>
      )}
    </div>
  );
}

function RolesPanel({ onFlash, onChanged }) {
  const [requests, setRequests] = useState([]);
  const [role, setRole] = useState('teacher');
  const roleOptions = ['parent', 'teacher', 'institution_owner', 'institution_staff', 'employer', 'education_agent', 'donor', 'academy_owner', 'marketplace_seller'];

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  async function load() {
    setLoading(true); setLoadError('');
    try { setRequests(await apiRequest('/roles/my-requests')); } catch (err) { setLoadError(err.message); } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function submit(e) {
    e.preventDefault();
    try {
      await apiRequest('/roles/request', { method: 'POST', body: { requestedRole: role } });
      onFlash('Role request submitted.', 'success');
      load();
      onChanged?.();
    } catch (err) { onFlash(err.message); }
  }

  return (
    <div>
      {loading && <p role="status" className="admin-notice">Loading your records...</p>}
      {loadError && <div role="alert" className="admin-notice error">{loadError} <button type="button" onClick={load}>Retry</button></div>}
      <form onSubmit={submit} className="flex gap-3 items-end mb-6 flex-wrap">
        <select aria-label="Role to request" className="form-select" value={role} onChange={(e) => setRole(e.target.value)}>
          {roleOptions.map((r) => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
        </select>
        <button type="submit" className="btn btn-primary">Submit Request</button>
      </form>
      <h3 className="font-semibold mb-2">My Requests</h3>
      <Table loading={loading} error={loadError} onRetry={load} headers={['Role', 'Status', 'Requested']} rows={requests.map((r) => [r.requestedRole, <Tag status={r.status} />, new Date(r.createdAt).toLocaleDateString()])} empty="No requests yet." />
    </div>
  );
}

const ADMIN_SUBTABS = [
  { key: 'requests', label: 'Pending Requests' },
  { key: 'users', label: 'All Users' },
  { key: 'institutions', label: 'Institutions' }
];

function AdminPanel({ onFlash }) {
  const [sub, setSub] = useState('requests');
  const [userCount, setUserCount] = useState(null);
  const [pendingCount, setPendingCount] = useState(null);
  const [institutionCount, setInstitutionCount] = useState(null);
  const [revision, setRevision] = useState(0);
  const [statsError, setStatsError] = useState(false);

  useEffect(() => {
    let active = true;
    setStatsError(false);
    Promise.all([apiRequest('/users?limit=1'), apiRequest('/roles/pending'), apiRequest('/institutions/admin/all')])
      .then(([users, pending, institutions]) => {
        if (!active) return;
        setUserCount(users.total); setPendingCount(pending.length); setInstitutionCount(institutions.length);
      }).catch(() => { if (active) setStatsError(true); });
    return () => { active = false; };
  }, [revision]);

  return (
    <div>
      {statsError && <p role="alert" className="admin-notice error">Overview could not be loaded. <button type="button" onClick={() => setRevision(value => value + 1)}>Retry</button></p>}
      <div className="admin-stats">
        {[{ label: 'Total users', value: userCount, icon: FaUsers, detail: 'Registered across CareerZ' }, { label: 'Pending role requests', value: pendingCount, icon: FaClipboardCheck, detail: 'Awaiting your review' }, { label: 'Institutions', value: institutionCount, icon: FaBuildingColumns, detail: 'Platform institution directory' }].map(item => (
          <div className="admin-stat" key={item.label}><div className="admin-stat-top"><span>{item.label}</span><span className="admin-stat-icon"><item.icon aria-hidden="true" /></span></div><strong>{item.value ?? '\u2014'}</strong><p>{item.detail}</p></div>
        ))}
      </div>
      <div className="admin-data-card">
      <div className="admin-section-heading"><div><h3>Management center</h3><p>Review requests and manage platform records.</p></div></div>

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

function AdminUsers({ onFlash }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  async function load() {
    setLoading(true); setLoadError('');
    try { const data = await apiRequest('/users?limit=50'); setUsers(data.users); }
    catch (err) { setLoadError(err.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function setStatus(id, status) {
    try {
      await apiRequest(`/users/${id}/status`, { method: 'PATCH', body: { status } });
      onFlash(`User ${status}.`, 'success');
      load();
    } catch (err) { onFlash(err.message); }
  }

  return (
    <Table
      loading={loading} error={loadError} onRetry={load}
      headers={['Name', 'Email', 'Roles', 'Status', 'Action']}
      rows={users.map((u) => [
        u.fullName, u.email, u.roles.join(', '), <Tag status={u.status === 'active' ? 'approved' : 'rejected'} />,
        u.roles.includes('super_admin') ? '—' : (
          <div className="flex gap-2">
            {u.status === 'active'
              ? <button className="btn" style={{ padding: '6px 14px', fontSize: '0.8rem', background: 'var(--sand-line)', color: 'var(--ink)' }} onClick={() => setStatus(u._id, 'suspended')}>Suspend</button>
              : <button className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.8rem' }} onClick={() => setStatus(u._id, 'active')}>Activate</button>}
          </div>
        )
      ])}
      empty="No users found."
    />
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

function InstitutionPanel({ onFlash, onChanged }) {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ name: '', type: 'school', country: '' });
  async function load() { try { setList(await apiRequest('/institutions/mine/list')); } catch (err) { onFlash(err.message); } }
  useEffect(() => { load(); }, []);

  async function submit(e) {
    e.preventDefault();
    try {
      await apiRequest('/institutions', { method: 'POST', body: { ...form, country: form.country.toUpperCase() } });
      onFlash('Institution registered.', 'success');
      setForm({ name: '', type: 'school', country: '' });
      load(); onChanged?.();
    } catch (err) { onFlash(err.message); }
  }

  return (
    <div>
      <form onSubmit={submit} className="space-y-3 mb-6 max-w-md">
        <input className="form-input" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <select className="form-select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
          {['school', 'college', 'university', 'academy', 'madrasa', 'tuition_center'].map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <input className="form-input" placeholder="Country code (e.g. PK)" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
        <button type="submit" className="btn btn-primary">Register</button>
      </form>
      <Table headers={['Name', 'Type', 'Verification']} rows={list.map((i) => [i.name, i.type, <Tag status={i.verificationStatus} />])} empty="No institutions yet." />
    </div>
  );
}

function StudentPanel({ onFlash }) {
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  async function load() {
    setLoading(true); setLoadError('');
    try {
      setCourses(await apiRequest('/courses', { auth: false }));
      setEnrollments(await apiRequest('/students/me/enrollments'));
    } catch (err) { setLoadError(err.message); } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function enroll(id) {
    try { await apiRequest(`/courses/${id}/enroll`, { method: 'POST' }); onFlash('Enrolled!', 'success'); load(); } catch (err) { onFlash(err.message); }
  }

  return (
    <div>
      {loading && <p role="status" className="admin-notice">Loading your records...</p>}
      {loadError && <div role="alert" className="admin-notice error">{loadError} <button type="button" onClick={load}>Retry</button></div>}
      <h3 className="font-semibold mb-2">Available Courses</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        {!loading && !loadError && courses.length === 0 && <p className="text-sm text-[var(--ink-soft)] col-span-full">No published courses yet.</p>}
        {courses.map((c) => (
          <div key={c._id} className="border border-[var(--sand-line)] rounded-xl p-3">
            <strong>{c.title}</strong>
            <p className="text-xs text-[var(--ink-soft)]">{c.subject}</p>
            <button className="btn btn-primary mt-2" style={{ padding: '5px 12px', fontSize: '0.78rem' }} onClick={() => enroll(c._id)}>Enroll</button>
          </div>
        ))}
      </div>
      <h3 className="font-semibold mb-2">My Enrollments</h3>
      <Table loading={loading} error={loadError} onRetry={load} headers={['Course', 'Status', 'Progress']} rows={enrollments.map((e) => [e.course?.title, e.status, `${e.progressPercent}%`])} empty="No enrollments yet." />
    </div>
  );
}

function TeacherPanel({ onFlash }) {
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({ title: '', subject: '' });
  async function load() { try { setCourses(await apiRequest('/courses/mine/list')); } catch (err) { onFlash(err.message); } }
  useEffect(() => { load(); }, []);

  async function create(e) {
    e.preventDefault();
    try { await apiRequest('/courses', { method: 'POST', body: form }); onFlash('Course created (unpublished).', 'success'); setForm({ title: '', subject: '' }); load(); } catch (err) { onFlash(err.message); }
  }
  async function publish(id) {
    try { await apiRequest(`/courses/${id}`, { method: 'PATCH', body: { published: true } }); onFlash('Course published.', 'success'); load(); } catch (err) { onFlash(err.message); }
  }

  return (
    <div>
      <form onSubmit={create} className="flex gap-3 items-end mb-6 flex-wrap">
        <input className="form-input" placeholder="Course title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <input className="form-input" placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
        <button type="submit" className="btn btn-primary">Create Course</button>
      </form>
      <Table
        headers={['Title', 'Published', 'Action']}
        rows={courses.map((c) => [c.title, c.published ? <Tag status="approved" /> : <Tag status="pending" />, !c.published && <button className="btn btn-primary" style={{ padding: '5px 12px', fontSize: '0.78rem' }} onClick={() => publish(c._id)}>Publish</button>])}
        empty="No courses yet."
      />
    </div>
  );
}

function ParentPanel({ onFlash }) {
  const [children, setChildren] = useState([]);
  const [email, setEmail] = useState('');
  async function load() { try { setChildren(await apiRequest('/parents/children')); } catch (err) { onFlash(err.message); } }
  useEffect(() => { load(); }, []);

  async function link(e) {
    e.preventDefault();
    try { await apiRequest('/parents/link-requests', { method: 'POST', body: { studentEmail: email } }); onFlash('Link request sent. The student must approve it.', 'success'); setEmail(''); } catch (err) { onFlash(err.message); }
  }

  return (
    <div>
      <form onSubmit={link} className="flex gap-3 items-end mb-6 flex-wrap">
        <input className="form-input" type="email" placeholder="Student's email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <button type="submit" className="btn btn-primary">Send Link Request</button>
      </form>
      <Table headers={['Name', 'Email']} rows={children.map((c) => [c.student.fullName, c.student.email])} empty="No approved children yet." />
    </div>
  );
}

function Table({ headers, rows, empty, loading = false, error, onRetry }) {
  if (loading) return <p role="status" className="admin-notice">Loading records...</p>;
  if (error) return <div role="alert" className="admin-notice error">{error} <button type="button" onClick={onRetry}>Retry</button></div>;
  return (
    <div className="account-table-wrap overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[var(--ink-soft)] border-b border-[var(--sand-line)]">
            {headers.map((h) => <th key={h} className="py-2 pr-4 font-semibold uppercase text-xs tracking-wide">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && <tr><td colSpan={headers.length} className="py-3 text-[var(--ink-soft)] italic">{empty}</td></tr>}
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-[var(--sand-line)] last:border-0">
              {row.map((cell, j) => <td key={j} className="py-2.5 pr-4">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
