import {
  FaShieldHalved, FaUsers, FaBuildingColumns, FaClipboardCheck, FaUser, FaUserShield,
  FaGauge, FaBuilding, FaChalkboardUser, FaBookOpen, FaClipboardList, FaAward, FaFileLines,
  FaGraduationCap, FaBriefcase, FaStore, FaWallet, FaSackDollar, FaSchool, FaChartLine,
  FaCalendarCheck, FaMoneyBillWave, FaHandshake, FaHourglassHalf, FaGear, FaBell
} from 'react-icons/fa6';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../api/client';
import { verifyEmail, resendVerification } from '../api/auth';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import {
  OverviewStats, WalletCard, QuickActions,
  ProfileCompletion, MiniCalendar, RecommendedGrid, RecentActivity
} from '../components/dashboard/DashboardWidgets';

// Every workspace is a fully separate dashboard: its own sidebar menu, its
// own landing view, its own panels. Switching role switches all of it.
const WORKSPACES = {
  student: {
    label: 'Student', roles: ['student'], color: 'var(--forest)',
    greeting: 'Ready to keep learning?',
    nav: [
      { key: 'summary', label: 'Dashboard', icon: FaGauge },
      { key: 'courses', label: 'My Courses', icon: FaBookOpen },
      { key: 'institutions', label: 'My Institutions', icon: FaBuilding },
      { key: 'classes', label: 'My Classes', icon: FaChalkboardUser },
      { key: 'assignments', label: 'Assignments & Tests', icon: FaClipboardList },
      { key: 'certificates', label: 'Certificates', icon: FaAward },
      { key: 'applications', label: 'Applications', icon: FaFileLines },
      { key: 'scholarships', label: 'Scholarships', icon: FaGraduationCap },
      { key: 'jobs', label: 'Jobs', icon: FaBriefcase },
      { key: 'marketplace', label: 'Marketplace', icon: FaStore },
      { key: 'wallet', label: 'Wallet', icon: FaWallet },
      { key: 'profile', label: 'My Profile', icon: FaUser }
    ]
  },
  teacher: {
    label: 'Teacher', roles: ['teacher'], color: 'var(--gold)',
    greeting: "Here's your teaching workspace.",
    nav: [
      { key: 'summary', label: 'Dashboard', icon: FaGauge },
      { key: 'courses', label: 'My Courses', icon: FaBookOpen },
      { key: 'timetable', label: 'Timetable', icon: FaCalendarCheck },
      { key: 'students', label: 'Student List', icon: FaUsers },
      { key: 'attendance', label: 'Attendance', icon: FaClipboardList },
      { key: 'homework', label: 'Homework & Assignments', icon: FaFileLines },
      { key: 'examination', label: 'Examination', icon: FaAward },
      { key: 'results', label: 'Results / Grades', icon: FaChartLine },
      { key: 'ptm', label: 'Parent-Teacher Meeting', icon: FaHandshake },
      { key: 'earnings', label: 'Salary & Earnings', icon: FaSackDollar },
      { key: 'profile', label: 'Profile', icon: FaUser }
    ]
  },
  parent: {
    label: 'Parent', roles: ['parent'], color: 'var(--emerald)',
    greeting: "Here's what's happening with your children.",
    nav: [
      { key: 'summary', label: 'Dashboard', icon: FaGauge },
      { key: 'children', label: 'My Children', icon: FaUsers },
      { key: 'attendance', label: 'Attendance', icon: FaCalendarCheck },
      { key: 'progress', label: 'Results / Grades', icon: FaChartLine },
      { key: 'homework', label: 'Homework', icon: FaFileLines },
      { key: 'timetable', label: "Child's Timetable", icon: FaClipboardList },
      { key: 'fees', label: 'Fee Management', icon: FaMoneyBillWave },
      { key: 'ptm', label: 'Parent-Teacher Meeting', icon: FaHandshake },
      { key: 'profile', label: 'Profile', icon: FaUser }
    ]
  },
  institution: {
    label: 'Institution', roles: ['institution_owner', 'academy_owner', 'institution_staff'], color: 'var(--forest-deep)',
    greeting: 'Manage your institution here.',
    nav: [
      { key: 'summary', label: 'Dashboard', icon: FaGauge },
      { key: 'institution', label: 'My Institution', icon: FaSchool },
      { key: 'staff', label: 'Staff Management', icon: FaUsers },
      { key: 'teachers', label: 'Teacher Management', icon: FaChalkboardUser },
      { key: 'students', label: 'Student Management', icon: FaUsers },
      { key: 'classes', label: 'Classes & Timetable', icon: FaClipboardList },
      { key: 'attendance', label: 'Attendance Management', icon: FaCalendarCheck },
      { key: 'fees', label: 'Fee Management', icon: FaSackDollar },
      { key: 'payroll', label: 'Payroll', icon: FaMoneyBillWave },
      { key: 'examination', label: 'Examination Management', icon: FaAward },
      { key: 'certificates', label: 'Certificates & Degrees', icon: FaGraduationCap },
      { key: 'reports', label: 'Reports', icon: FaChartLine },
      { key: 'communication', label: 'Communication Center', icon: FaBell },
      { key: 'profile', label: 'My Account', icon: FaUser }
    ]
  },
  employer: {
    label: 'Employer', roles: ['employer'], color: 'var(--gold)',
    greeting: 'Manage your job postings and applicants.',
    nav: [
      { key: 'summary', label: 'Dashboard', icon: FaGauge },
      { key: 'post', label: 'Post a Job', icon: FaFileLines },
      { key: 'jobs', label: 'My Jobs', icon: FaBriefcase },
      { key: 'profile', label: 'Profile', icon: FaUser }
    ]
  },
  admin: {
    label: 'Admin', roles: ['admin', 'super_admin'], color: 'var(--rose)',
    greeting: 'Platform overview and moderation.',
    nav: [
      { key: 'summary', label: 'Dashboard', icon: FaGauge },
      { key: 'institutions_mgmt', label: 'Institution Management', icon: FaBuildingColumns },
      { key: 'agents', label: 'Agent Management', icon: FaUsers },
      { key: 'donors', label: 'Donor Management', icon: FaHandshake },
      { key: 'finance', label: 'Financial Management', icon: FaSackDollar },
      { key: 'complaints', label: 'Complaint Management', icon: FaClipboardList },
      { key: 'security', label: 'Security & Monitoring', icon: FaShieldHalved },
      { key: 'settings', label: 'Global Settings', icon: FaGear },
      { key: 'analytics', label: 'Reports', icon: FaChartLine },
      { key: 'profile', label: 'Profile', icon: FaUser }
    ]
  }
};

const WORKSPACE_PRIORITY = ['admin', 'institution', 'employer', 'teacher', 'parent', 'student'];

function Tag({ status }) {
  const styles = {
    pending: 'bg-amber-100 text-amber-800',
    approved: 'bg-emerald-100 text-emerald-800',
    rejected: 'bg-rose-100 text-rose-800',
    under_review: 'bg-indigo-100 text-indigo-800'
  };
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100 text-gray-700'}`}>{status}</span>;
}

function ComingSoon({ label }) {
  return (
    <div className="admin-notice" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <FaHourglassHalf aria-hidden="true" />
      <span><strong>{label}</strong> is on the roadmap for this workspace and isn't wired up to real data yet.</span>
    </div>
  );
}

function SummaryRow({ items }) {
  return (
    <div className="admin-stats">
      {items.map((item) => (
        <div className="admin-stat" key={item.label}>
          <div className="admin-stat-top"><span>{item.label}</span><span className="admin-stat-icon"><item.icon aria-hidden="true" /></span></div>
          <strong>{item.value ?? '—'}</strong>
          <p>{item.detail}</p>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { user, refreshProfile } = useAuth();
  const roles = user?.roles || [];
  const [msg, setMsg] = useState(null);

  const available = WORKSPACE_PRIORITY.filter((key) => WORKSPACES[key].roles.some((r) => roles.includes(r)));
  const defaultWorkspace = available[0] || 'student';

  const [activeWorkspace, setActiveWorkspace] = useState(defaultWorkspace);
  const [activeTab, setActiveTab] = useState(WORKSPACES[defaultWorkspace].nav[0].key);

  useEffect(() => {
    if (!available.includes(activeWorkspace)) {
      setActiveWorkspace(defaultWorkspace);
      setActiveTab(WORKSPACES[defaultWorkspace].nav[0].key);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id, roles.join(',')]);

  function switchWorkspace(key) {
    setActiveWorkspace(key);
    setActiveTab(WORKSPACES[key].nav[0].key);
  }

  function flash(text, type = 'error') {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 4000);
  }

  const ws = WORKSPACES[activeWorkspace] || WORKSPACES.student;
  const firstName = (user?.fullName || '').split(' ')[0] || 'there';
  const SHARED_TAB_LABELS = { messages: 'Messages', notifications: 'Notifications' };
  const activeTabLabel = SHARED_TAB_LABELS[activeTab] || ws.nav.find((t) => t.key === activeTab)?.label || ws.label;

  return (
    <DashboardLayout
      trail={[ws.label, activeTabLabel]}
      activeRole={activeWorkspace}
      navItems={ws.nav}
      activeKey={activeTab}
      onSelect={setActiveTab}
    >
      <div className="admin-intro" style={{ borderInlineStart: `6px solid ${ws.color}`, paddingInlineStart: 20 }}>
        <div>
          <div className="eyebrow">{ws.label.toUpperCase()} WORKSPACE</div>
          <h1>Welcome back, {firstName}.</h1>
          <p>{ws.greeting}</p>
        </div>
        <span className="admin-access"><FaUserShield aria-hidden="true" />{ws.label}</span>
      </div>

      {available.length > 1 && (
        <nav className="cz-tabbar" aria-label="Switch workspace" style={{ marginBottom: 20 }}>
          {available.map((key) => (
            <button key={key} type="button" aria-pressed={activeWorkspace === key} className={`cz-tab${activeWorkspace === key ? ' active' : ''}`} onClick={() => switchWorkspace(key)}>
              {WORKSPACES[key].label}
            </button>
          ))}
        </nav>
      )}

      {msg && <div role="status" className={`admin-notice ${msg.type}`}>{msg.text}</div>}

      <div className="admin-data-card">
        {activeTab === 'messages' && <MessagesPanel onFlash={flash} />}
        {activeTab === 'notifications' && <NotificationsPanel onFlash={flash} />}
        {activeTab !== 'messages' && activeTab !== 'notifications' && (
          <>
            {activeWorkspace === 'student' && <StudentWorkspace tab={activeTab} user={user} onFlash={flash} onChanged={refreshProfile} />}
            {activeWorkspace === 'teacher' && <TeacherWorkspace tab={activeTab} user={user} onFlash={flash} onChanged={refreshProfile} />}
            {activeWorkspace === 'parent' && <ParentWorkspace tab={activeTab} user={user} onFlash={flash} onChanged={refreshProfile} />}
            {activeWorkspace === 'institution' && <InstitutionWorkspace tab={activeTab} user={user} onFlash={flash} onChanged={refreshProfile} />}
            {activeWorkspace === 'employer' && <EmployerWorkspace tab={activeTab} user={user} onFlash={flash} onChanged={refreshProfile} />}
            {activeWorkspace === 'admin' && <AdminWorkspace tab={activeTab} user={user} roles={roles} onFlash={flash} onChanged={refreshProfile} />}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

// ---------------------------------------------------------------- Student

function StudentWorkspace({ tab, user, onFlash, onChanged }) {
  if (tab === 'profile') return <><ProfilePanel user={user} onFlash={onFlash} onChanged={onChanged} /><RolesPanel onFlash={onFlash} onChanged={onChanged} /><SupportComplaintPanel onFlash={onFlash} /></>;
  if (tab === 'courses') return <StudentPanel onFlash={onFlash} />;
  if (tab === 'wallet') return <StudentFeesPanel onFlash={onFlash} />;
  if (tab === 'summary') return <StudentSummary />;
  if (tab === 'assignments') return <StudentAssignmentsPanel onFlash={onFlash} />;
  if (tab === 'classes') return <TimetableView onFlash={onFlash} url="/students/me/timetable" />;
  if (tab === 'jobs') return <StudentJobsPanel onFlash={onFlash} />;
  if (tab === 'certificates') return <StudentCertificatesPanel onFlash={onFlash} />;
  if (tab === 'scholarships') return <ScholarshipsPanel onFlash={onFlash} user={user} />;
  if (tab === 'marketplace') return <MarketplacePanel onFlash={onFlash} user={user} />;
  if (tab === 'institutions') return <StudentInstitutionsPanel onFlash={onFlash} />;
  if (tab === 'applications') return <StudentApplicationsPanel onFlash={onFlash} />;
  return <ComingSoon label={tab} />;
}

function StudentInstitutionsPanel({ onFlash }) {
  const [profile, setProfile] = useState(null);
  const [options, setOptions] = useState([]);
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState('');

  function load() { apiRequest('/students/me').then(setProfile).catch((err) => onFlash(err.message)); }
  useEffect(load, []);

  function search() {
    apiRequest(`/institutions${q ? `?q=${encodeURIComponent(q)}` : ''}`).then(setOptions).catch((err) => onFlash(err.message));
  }
  useEffect(search, []);

  async function connect() {
    if (!selected) return;
    try {
      await apiRequest('/students/me/connect-institution', { method: 'POST', body: { institutionId: selected } });
      onFlash('Connected to institution.', 'success');
      load();
    } catch (err) { onFlash(err.message); }
  }

  if (!profile) return <p role="status" className="admin-notice">Loading...</p>;

  return (
    <div>
      <h3 className="font-semibold mb-2">My Institution</h3>
      {profile.primaryInstitution ? (
        <div className="border border-[var(--sand-line)] rounded-xl p-4 mb-6" style={{ maxWidth: 420 }}>
          <strong>{profile.primaryInstitution.name}</strong>
          <p className="text-xs text-[var(--ink-soft)]">{profile.primaryInstitution.type} · {profile.primaryInstitution.country}</p>
          {profile.rollNumber && <p className="text-xs mt-1">Roll No: {profile.rollNumber}</p>}
        </div>
      ) : (
        <p className="text-sm mb-4" style={{ color: 'var(--ink-soft)' }}>You are not connected to an institution yet.</p>
      )}

      <h4 className="font-semibold mb-2">Connect to an Institution</h4>
      <form onSubmit={(e) => { e.preventDefault(); search(); }} className="flex gap-2 items-end mb-3 flex-wrap">
        <input className="form-input" placeholder="Search institutions" value={q} onChange={(e) => setQ(e.target.value)} />
        <button type="submit" className="btn">Search</button>
      </form>
      <div className="flex gap-2 items-end flex-wrap">
        <select className="form-select" value={selected} onChange={(e) => setSelected(e.target.value)} style={{ minWidth: 260 }}>
          <option value="">Select an institution</option>
          {options.map((i) => <option key={i._id} value={i._id}>{i.name} ({i.country})</option>)}
        </select>
        <button type="button" className="btn btn-primary" onClick={connect} disabled={!selected}>Connect</button>
      </div>
    </div>
  );
}

function StudentApplicationsPanel({ onFlash }) {
  const [jobApps, setJobApps] = useState(null);
  const [scholarshipApps, setScholarshipApps] = useState(null);

  useEffect(() => {
    apiRequest('/jobs/mine/applications').then(setJobApps).catch((err) => onFlash(err.message));
    apiRequest('/scholarships/mine/applications').then(setScholarshipApps).catch((err) => onFlash(err.message));
  }, [onFlash]);

  return (
    <div>
      <h3 className="font-semibold mb-2">Job Applications</h3>
      <Table
        loading={jobApps === null}
        headers={['Job', 'Company', 'Status', 'Applied']}
        rows={(jobApps || []).map((a) => [a.job?.title, a.job?.company, <Tag status={a.status === 'hired' ? 'approved' : a.status === 'rejected' ? 'rejected' : 'pending'} />, new Date(a.createdAt).toLocaleDateString()])}
        empty="No job applications yet."
      />
      <h3 className="font-semibold mb-2 mt-6">Scholarship Applications</h3>
      <Table
        loading={scholarshipApps === null}
        headers={['Scholarship', 'Amount', 'Status', 'Applied']}
        rows={(scholarshipApps || []).map((a) => [a.scholarship?.title, `${a.scholarship?.currency || ''} ${a.scholarship?.amount ?? ''}`, <Tag status={a.status === 'approved' ? 'approved' : a.status === 'rejected' ? 'rejected' : 'pending'} />, new Date(a.createdAt).toLocaleDateString()])}
        empty="No scholarship applications yet."
      />
    </div>
  );
}

function StudentCertificatesPanel({ onFlash }) {
  const [certificates, setCertificates] = useState(null);
  useEffect(() => { apiRequest('/students/me/certificates').then(setCertificates).catch((err) => onFlash(err.message)); }, [onFlash]);

  if (certificates === null) return <p role="status" className="admin-notice">Loading...</p>;
  if (certificates.length === 0) return <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>No certificates issued to you yet.</p>;

  return (
    <div className="grid grid-cols-1 gap-4">
      {certificates.map((c) => (
        <div key={c._id} className="border border-[var(--sand-line)] rounded-xl p-4 flex items-center gap-4">
          <img src={c.qrDataUrl} alt="Verification QR code" style={{ width: 96, height: 96 }} />
          <div style={{ flex: 1 }}>
            <strong>{c.title}</strong>
            <p className="text-xs text-[var(--ink-soft)]">{c.institution?.name} · Issued {new Date(c.issueDate).toLocaleDateString()}</p>
            <a href={c.verifyUrl} target="_blank" rel="noreferrer" className="text-xs" style={{ color: 'var(--emerald)' }}>Verification link ↗</a>
          </div>
        </div>
      ))}
    </div>
  );
}

function StudentJobsPanel({ onFlash }) {
  const [sub, setSub] = useState('search');
  return (
    <div>
      <nav className="cz-tabbar" style={{ marginBottom: 20 }}>
        {[{ key: 'search', label: 'Search Jobs' }, { key: 'applications', label: 'My Applications' }, { key: 'resume', label: 'My Resume' }].map((t) => (
          <button key={t.key} type="button" aria-pressed={sub === t.key} className={`cz-tab${sub === t.key ? ' active' : ''}`} onClick={() => setSub(t.key)}>{t.label}</button>
        ))}
      </nav>
      {sub === 'search' && <JobSearchPanel onFlash={onFlash} />}
      {sub === 'applications' && <MyApplicationsPanel onFlash={onFlash} />}
      {sub === 'resume' && <ResumeEditorPanel onFlash={onFlash} />}
    </div>
  );
}

function JobSearchPanel({ onFlash }) {
  const [jobs, setJobs] = useState(null);
  const [q, setQ] = useState('');
  const [coverLetters, setCoverLetters] = useState({});

  function load() {
    apiRequest(`/jobs${q ? `?q=${encodeURIComponent(q)}` : ''}`).then(setJobs).catch((err) => onFlash(err.message));
  }
  useEffect(load, []);

  async function apply(jobId) {
    try {
      await apiRequest(`/jobs/${jobId}/apply`, { method: 'POST', body: { coverLetter: coverLetters[jobId] || '' } });
      onFlash('Application submitted.', 'success');
    } catch (err) { onFlash(err.message); }
  }

  return (
    <div>
      <form onSubmit={(e) => { e.preventDefault(); load(); }} className="flex gap-3 items-end mb-4">
        <input className="form-input" placeholder="Search by title, company or skill" value={q} onChange={(e) => setQ(e.target.value)} />
        <button type="submit" className="btn btn-primary">Search</button>
      </form>
      {jobs === null && <p role="status" className="admin-notice">Loading...</p>}
      {jobs && jobs.length === 0 && <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>No open jobs found.</p>}
      <div className="grid grid-cols-1 gap-3">
        {(jobs || []).map((j) => (
          <div key={j._id} className="border border-[var(--sand-line)] rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div><strong>{j.title}</strong><p className="text-xs text-[var(--ink-soft)]">{j.company} · {j.city ? `${j.city}, ` : ''}{j.country} · {j.type.replace('_', ' ')}</p></div>
              {(j.salaryMin || j.salaryMax) && <span className="text-xs">{j.currency} {j.salaryMin ?? ''}{j.salaryMax ? `–${j.salaryMax}` : ''}</span>}
            </div>
            {j.description && <p className="text-sm mt-2">{j.description}</p>}
            <div className="flex gap-2 items-end mt-2 flex-wrap">
              <input className="form-input" placeholder="Cover letter (optional)" value={coverLetters[j._id] || ''} onChange={(e) => setCoverLetters({ ...coverLetters, [j._id]: e.target.value })} style={{ maxWidth: 260 }} />
              <button type="button" className="btn btn-primary" style={{ padding: '6px 16px', fontSize: '0.8rem' }} onClick={() => apply(j._id)}>Apply</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MyApplicationsPanel({ onFlash }) {
  const [applications, setApplications] = useState(null);
  useEffect(() => { apiRequest('/jobs/mine/applications').then(setApplications).catch((err) => onFlash(err.message)); }, [onFlash]);

  return (
    <Table
      loading={applications === null}
      headers={['Job', 'Company', 'Status', 'Applied']}
      rows={(applications || []).map((a) => [a.job?.title, a.job?.company, <Tag status={a.status === 'hired' ? 'approved' : a.status === 'rejected' ? 'rejected' : 'pending'} />, new Date(a.createdAt).toLocaleDateString()])}
      empty="No applications yet."
    />
  );
}

function ResumeEditorPanel({ onFlash }) {
  const [resume, setResume] = useState(null);

  function load() {
    apiRequest('/resumes/me').then(setResume).catch((err) => onFlash(err.message));
  }
  useEffect(load, []);

  async function save(e) {
    e.preventDefault();
    try {
      await apiRequest('/resumes/me', { method: 'PATCH', body: resume });
      onFlash('Resume saved.', 'success');
    } catch (err) { onFlash(err.message); }
  }

  if (!resume) return <p role="status" className="admin-notice">Loading...</p>;

  return (
    <form onSubmit={save} className="space-y-3 max-w-lg">
      <input className="form-input" placeholder="Headline (e.g. Frontend Developer)" value={resume.headline} onChange={(e) => setResume({ ...resume, headline: e.target.value })} />
      <textarea className="form-input" placeholder="Summary" rows={3} value={resume.summary} onChange={(e) => setResume({ ...resume, summary: e.target.value })} />
      <input
        className="form-input"
        placeholder="Skills (comma separated)"
        value={(resume.skills || []).join(', ')}
        onChange={(e) => setResume({ ...resume, skills: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
      />
      <input
        className="form-input"
        placeholder="Languages (comma separated)"
        value={(resume.languages || []).join(', ')}
        onChange={(e) => setResume({ ...resume, languages: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
      />
      <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>Education, experience and certificates can be added once you save this — a fuller editor is on the way.</p>
      <button type="submit" className="btn btn-primary">Save Resume</button>
    </form>
  );
}

function ScholarshipsPanel({ onFlash, user }) {
  const isDonor = (user?.roles || []).includes('donor');
  const [sub, setSub] = useState('browse');
  const tabs = [
    { key: 'browse', label: 'Browse Scholarships' },
    { key: 'applications', label: 'My Applications' },
    ...(isDonor ? [{ key: 'manage', label: 'My Scholarships' }, { key: 'post', label: 'Post a Scholarship' }] : [])
  ];
  return (
    <div>
      <nav className="cz-tabbar" style={{ marginBottom: 20 }}>
        {tabs.map((t) => (
          <button key={t.key} type="button" aria-pressed={sub === t.key} className={`cz-tab${sub === t.key ? ' active' : ''}`} onClick={() => setSub(t.key)}>{t.label}</button>
        ))}
      </nav>
      {sub === 'browse' && <ScholarshipBrowsePanel onFlash={onFlash} />}
      {sub === 'applications' && <MyScholarshipApplicationsPanel onFlash={onFlash} />}
      {sub === 'manage' && <MyScholarshipsPanel onFlash={onFlash} />}
      {sub === 'post' && <PostScholarshipPanel onFlash={onFlash} />}
    </div>
  );
}

function ScholarshipBrowsePanel({ onFlash }) {
  const [scholarships, setScholarships] = useState(null);
  const [statements, setStatements] = useState({});

  function load() { apiRequest('/scholarships').then(setScholarships).catch((err) => onFlash(err.message)); }
  useEffect(load, []);

  async function apply(id) {
    try {
      await apiRequest(`/scholarships/${id}/apply`, { method: 'POST', body: { statement: statements[id] || '' } });
      onFlash('Application submitted.', 'success');
    } catch (err) { onFlash(err.message); }
  }

  if (scholarships === null) return <p role="status" className="admin-notice">Loading...</p>;
  if (scholarships.length === 0) return <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>No open scholarships right now.</p>;

  return (
    <div className="grid grid-cols-1 gap-3">
      {scholarships.map((s) => (
        <div key={s._id} className="border border-[var(--sand-line)] rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div><strong>{s.title}</strong><p className="text-xs text-[var(--ink-soft)]">{s.currency} {s.amount} · {s.country || 'Any country'} · by {s.donor?.fullName}</p></div>
            {s.applicationDeadline && <span className="text-xs">Deadline: {new Date(s.applicationDeadline).toLocaleDateString()}</span>}
          </div>
          {s.description && <p className="text-sm mt-2">{s.description}</p>}
          {s.eligibilityCriteria && <p className="text-xs mt-1 text-[var(--ink-soft)]">Eligibility: {s.eligibilityCriteria}</p>}
          <div className="flex gap-2 items-end mt-2 flex-wrap">
            <input className="form-input" placeholder="Short statement (optional)" value={statements[s._id] || ''} onChange={(e) => setStatements({ ...statements, [s._id]: e.target.value })} style={{ maxWidth: 300 }} />
            <button type="button" className="btn btn-primary" style={{ padding: '6px 16px', fontSize: '0.8rem' }} onClick={() => apply(s._id)}>Apply</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function MyScholarshipApplicationsPanel({ onFlash }) {
  const [applications, setApplications] = useState(null);
  useEffect(() => { apiRequest('/scholarships/mine/applications').then(setApplications).catch((err) => onFlash(err.message)); }, [onFlash]);
  return (
    <Table
      loading={applications === null}
      headers={['Scholarship', 'Amount', 'Status', 'Applied']}
      rows={(applications || []).map((a) => [a.scholarship?.title, `${a.scholarship?.currency || ''} ${a.scholarship?.amount ?? ''}`, <Tag status={a.status === 'approved' ? 'approved' : a.status === 'rejected' ? 'rejected' : 'pending'} />, new Date(a.createdAt).toLocaleDateString()])}
      empty="No scholarship applications yet."
    />
  );
}

function PostScholarshipPanel({ onFlash }) {
  const [form, setForm] = useState({ title: '', description: '', amount: '', currency: 'USD', eligibilityCriteria: '', country: '', applicationDeadline: '', seatsAvailable: 1 });

  async function submit(e) {
    e.preventDefault();
    try {
      await apiRequest('/scholarships', { method: 'POST', body: { ...form, amount: Number(form.amount), seatsAvailable: Number(form.seatsAvailable) } });
      onFlash('Scholarship posted.', 'success');
      setForm({ title: '', description: '', amount: '', currency: 'USD', eligibilityCriteria: '', country: '', applicationDeadline: '', seatsAvailable: 1 });
    } catch (err) { onFlash(err.message); }
  }

  return (
    <form onSubmit={submit} className="space-y-3 max-w-lg">
      <input className="form-input" placeholder="Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      <textarea className="form-input" placeholder="Description" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      <div className="flex gap-2">
        <input className="form-input" type="number" placeholder="Amount" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
        <input className="form-input" placeholder="Currency" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} style={{ maxWidth: 100 }} />
        <input className="form-input" type="number" min="1" placeholder="Seats" value={form.seatsAvailable} onChange={(e) => setForm({ ...form, seatsAvailable: e.target.value })} style={{ maxWidth: 100 }} />
      </div>
      <input className="form-input" placeholder="Eligibility criteria" value={form.eligibilityCriteria} onChange={(e) => setForm({ ...form, eligibilityCriteria: e.target.value })} />
      <div className="flex gap-2">
        <input className="form-input" placeholder="Country (optional)" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
        <input className="form-input" type="date" value={form.applicationDeadline} onChange={(e) => setForm({ ...form, applicationDeadline: e.target.value })} />
      </div>
      <button type="submit" className="btn btn-primary">Post Scholarship</button>
    </form>
  );
}

function MyScholarshipsPanel({ onFlash }) {
  const [scholarships, setScholarships] = useState(null);
  const [applicants, setApplicants] = useState(null);
  const [openId, setOpenId] = useState(null);

  useEffect(() => { apiRequest('/scholarships/mine/list').then(setScholarships).catch((err) => onFlash(err.message)); }, [onFlash]);

  function viewApplicants(id) {
    setOpenId(id);
    apiRequest(`/scholarships/${id}/applicants`).then(setApplicants).catch((err) => onFlash(err.message));
  }

  async function decide(appId, status) {
    try {
      await apiRequest(`/scholarships/applications/${appId}/status`, { method: 'PATCH', body: { status } });
      viewApplicants(openId);
      onFlash(`Application ${status}.`, 'success');
    } catch (err) { onFlash(err.message); }
  }

  return (
    <div>
      <Table
        loading={scholarships === null}
        headers={['Title', 'Amount', 'Status', 'Action']}
        rows={(scholarships || []).map((s) => [s.title, `${s.currency} ${s.amount}`, <Tag status={s.status === 'open' ? 'approved' : 'pending'} />, <button className="btn" style={{ padding: '4px 12px', fontSize: '0.78rem' }} onClick={() => viewApplicants(s._id)}>View Applicants</button>])}
        empty="You haven't posted any scholarships yet."
      />
      {openId && (
        <div className="mt-4">
          <h4 className="font-semibold mb-2">Applicants</h4>
          <Table
            loading={applicants === null}
            headers={['Applicant', 'Statement', 'Status', 'Decision']}
            rows={(applicants || []).map((a) => [
              a.applicant?.fullName, a.statement || '—', <Tag status={a.status === 'approved' ? 'approved' : a.status === 'rejected' ? 'rejected' : 'pending'} />,
              a.status === 'pending' ? (
                <div className="flex gap-1">
                  <button className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => decide(a._id, 'approved')}>Approve</button>
                  <button className="btn" style={{ padding: '4px 10px', fontSize: '0.75rem', background: 'var(--sand-line)' }} onClick={() => decide(a._id, 'rejected')}>Reject</button>
                </div>
              ) : '—'
            ])}
            empty="No applicants yet."
          />
        </div>
      )}
    </div>
  );
}

function MarketplacePanel({ onFlash, user }) {
  const isSeller = (user?.roles || []).includes('marketplace_seller');
  const [sub, setSub] = useState('browse');
  const tabs = [
    { key: 'browse', label: 'Browse' },
    { key: 'orders', label: 'My Orders' },
    ...(isSeller ? [{ key: 'listings', label: 'My Listings' }, { key: 'selling', label: 'Orders Received' }] : [])
  ];
  return (
    <div>
      <nav className="cz-tabbar" style={{ marginBottom: 20 }}>
        {tabs.map((t) => (
          <button key={t.key} type="button" aria-pressed={sub === t.key} className={`cz-tab${sub === t.key ? ' active' : ''}`} onClick={() => setSub(t.key)}>{t.label}</button>
        ))}
      </nav>
      {sub === 'browse' && <MarketplaceBrowsePanel onFlash={onFlash} />}
      {sub === 'orders' && <MyOrdersPanel onFlash={onFlash} />}
      {sub === 'listings' && <MyListingsPanel onFlash={onFlash} />}
      {sub === 'selling' && <SellerOrdersPanel onFlash={onFlash} />}
    </div>
  );
}

function MarketplaceBrowsePanel({ onFlash }) {
  const [products, setProducts] = useState(null);
  const [q, setQ] = useState('');

  function load() { apiRequest(`/marketplace/products${q ? `?q=${encodeURIComponent(q)}` : ''}`).then(setProducts).catch((err) => onFlash(err.message)); }
  useEffect(load, []);

  async function order(id) {
    try {
      await apiRequest(`/marketplace/products/${id}/orders`, { method: 'POST', body: { quantity: 1 } });
      onFlash('Order placed.', 'success');
      load();
    } catch (err) { onFlash(err.message); }
  }

  return (
    <div>
      <form onSubmit={(e) => { e.preventDefault(); load(); }} className="flex gap-3 items-end mb-4">
        <input className="form-input" placeholder="Search products" value={q} onChange={(e) => setQ(e.target.value)} />
        <button type="submit" className="btn btn-primary">Search</button>
      </form>
      {products === null && <p role="status" className="admin-notice">Loading...</p>}
      {products && products.length === 0 && <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>No listings found.</p>}
      <div className="grid grid-cols-1 gap-3">
        {(products || []).map((p) => (
          <div key={p._id} className="border border-[var(--sand-line)] rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div><strong>{p.title}</strong><p className="text-xs text-[var(--ink-soft)]">{p.category} · by {p.seller?.fullName} · Stock: {p.stock}</p></div>
              <span className="text-xs">{p.currency} {p.price}</span>
            </div>
            {p.description && <p className="text-sm mt-2">{p.description}</p>}
            <button type="button" className="btn btn-primary mt-2" style={{ padding: '6px 16px', fontSize: '0.8rem' }} disabled={p.stock === 0} onClick={() => order(p._id)}>{p.stock === 0 ? 'Out of stock' : 'Order'}</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function MyOrdersPanel({ onFlash }) {
  const [orders, setOrders] = useState(null);
  useEffect(() => { apiRequest('/marketplace/orders/mine').then(setOrders).catch((err) => onFlash(err.message)); }, [onFlash]);
  return (
    <Table
      loading={orders === null}
      headers={['Product', 'Qty', 'Total', 'Status', 'Ordered']}
      rows={(orders || []).map((o) => [o.product?.title, o.quantity, `${o.currency} ${o.totalPrice}`, <Tag status={o.status === 'delivered' ? 'approved' : o.status === 'cancelled' ? 'rejected' : 'pending'} />, new Date(o.createdAt).toLocaleDateString()])}
      empty="No orders yet."
    />
  );
}

function MyListingsPanel({ onFlash }) {
  const [products, setProducts] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', category: 'other', price: '', currency: 'USD', stock: 0 });

  function load() { apiRequest('/marketplace/products/mine/list').then(setProducts).catch((err) => onFlash(err.message)); }
  useEffect(load, []);

  async function create(e) {
    e.preventDefault();
    try {
      await apiRequest('/marketplace/products', { method: 'POST', body: { ...form, price: Number(form.price), stock: Number(form.stock) } });
      onFlash('Listing created.', 'success');
      setForm({ title: '', description: '', category: 'other', price: '', currency: 'USD', stock: 0 });
      load();
    } catch (err) { onFlash(err.message); }
  }

  async function toggleStatus(p) {
    try {
      await apiRequest(`/marketplace/products/${p._id}`, { method: 'PATCH', body: { status: p.status === 'active' ? 'inactive' : 'active' } });
      load();
    } catch (err) { onFlash(err.message); }
  }

  return (
    <div>
      <form onSubmit={create} className="space-y-3 max-w-lg mb-6">
        <input className="form-input" placeholder="Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <textarea className="form-input" placeholder="Description" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <div className="flex gap-2">
          <select className="form-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {['books', 'stationery', 'uniform', 'electronics', 'courses', 'services', 'other'].map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input className="form-input" type="number" placeholder="Price" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          <input className="form-input" type="number" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
        </div>
        <button type="submit" className="btn btn-primary">Add Listing</button>
      </form>
      <Table
        loading={products === null}
        headers={['Title', 'Price', 'Stock', 'Status', 'Action']}
        rows={(products || []).map((p) => [p.title, `${p.currency} ${p.price}`, p.stock, <Tag status={p.status === 'active' ? 'approved' : 'pending'} />, <button className="btn" style={{ padding: '4px 12px', fontSize: '0.78rem' }} onClick={() => toggleStatus(p)}>{p.status === 'active' ? 'Deactivate' : 'Activate'}</button>])}
        empty="You haven't listed anything yet."
      />
    </div>
  );
}

function SellerOrdersPanel({ onFlash }) {
  const [orders, setOrders] = useState(null);
  function load() { apiRequest('/marketplace/orders/selling').then(setOrders).catch((err) => onFlash(err.message)); }
  useEffect(load, []);

  async function updateStatus(id, status) {
    try {
      await apiRequest(`/marketplace/orders/${id}/status`, { method: 'PATCH', body: { status } });
      load();
    } catch (err) { onFlash(err.message); }
  }

  return (
    <Table
      loading={orders === null}
      headers={['Product', 'Buyer', 'Qty', 'Total', 'Status', 'Action']}
      rows={(orders || []).map((o) => [
        o.product?.title, o.buyer?.fullName, o.quantity, `${o.currency} ${o.totalPrice}`, <Tag status={o.status === 'delivered' ? 'approved' : o.status === 'cancelled' ? 'rejected' : 'pending'} />,
        <select className="form-input" value={o.status} onChange={(e) => updateStatus(o._id, e.target.value)} style={{ padding: '4px 8px', fontSize: '0.78rem' }}>
          {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      ])}
      empty="No orders received yet."
    />
  );
}

function TimetableView({ onFlash, url }) {
  const [entries, setEntries] = useState(null);
  useEffect(() => { apiRequest(url).then(setEntries).catch((err) => onFlash(err.message)); }, [url, onFlash]);

  return (
    <div>
      <h3 className="font-semibold mb-2">My Classes — Timetable</h3>
      <Table
        loading={entries === null}
        headers={['Day', 'Time', 'Subject', 'Teacher', 'Room']}
        rows={(entries || []).map((t) => [DOW_LABEL[t.dayOfWeek], `${t.startTime}–${t.endTime}`, t.subject, t.teacher?.fullName || '—', t.room || '—'])}
        empty="No timetable set up yet."
      />
    </div>
  );
}

function StudentFeesPanel({ onFlash }) {
  const [fees, setFees] = useState(null);
  useEffect(() => { apiRequest('/students/me/fees').then(setFees).catch((err) => onFlash(err.message)); }, [onFlash]);

  return (
    <div>
      <h3 className="font-semibold mb-2">My Fees</h3>
      <Table
        loading={fees === null}
        headers={['Title', 'Amount', 'Due', 'Status']}
        rows={(fees || []).map((f) => [f.title, `${f.currency} ${f.amount}`, f.dueDate ? new Date(f.dueDate).toLocaleDateString() : '—', <Tag status={f.status === 'paid' ? 'approved' : f.status === 'overdue' ? 'rejected' : 'pending'} />])}
        empty="No fee records yet."
      />
      <WalletCard />
    </div>
  );
}

function StudentAssignmentsPanel({ onFlash }) {
  const [submissions, setSubmissions] = useState(null);
  const [results, setResults] = useState(null);
  const [attendance, setAttendance] = useState(null);

  useEffect(() => {
    apiRequest('/students/me/submissions').then(setSubmissions).catch((err) => onFlash(err.message));
    apiRequest('/students/me/results').then(setResults).catch((err) => onFlash(err.message));
    apiRequest('/students/me/attendance').then(setAttendance).catch((err) => onFlash(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <StudentExamsSection onFlash={onFlash} />
      <h3 className="font-semibold mb-2 mt-6">My Submissions</h3>
      <Table
        loading={submissions === null}
        headers={['Assignment', 'Due', 'Status', 'Marks']}
        rows={(submissions || []).map((s) => [s.assignment?.title, s.assignment?.dueDate ? new Date(s.assignment.dueDate).toLocaleDateString() : '—', <Tag status={s.status === 'graded' ? 'approved' : 'pending'} />, s.marksObtained ?? `/ ${s.assignment?.maxMarks ?? ''}`])}
        empty="No assignment submissions yet."
      />
      <h3 className="font-semibold mb-2 mt-6">My Results</h3>
      <Table
        loading={results === null}
        headers={['Term', 'Subject', 'Marks', 'Grade']}
        rows={(results || []).map((r) => [r.term || '—', r.subject || '—', `${r.marksObtained}/${r.totalMarks}`, r.grade || '—'])}
        empty="No results recorded yet."
      />
      <h3 className="font-semibold mb-2 mt-6">My Attendance</h3>
      <Table
        loading={attendance === null}
        headers={['Date', 'Status']}
        rows={(attendance || []).map((a) => [new Date(a.date).toLocaleDateString(), <Tag status={a.records?.[0]?.status === 'present' ? 'approved' : a.records?.[0]?.status === 'absent' ? 'rejected' : 'pending'} />])}
        empty="No attendance recorded yet."
      />
    </div>
  );
}

function StudentExamsSection({ onFlash }) {
  const [exams, setExams] = useState(null);
  const [openExam, setOpenExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState({});

  useEffect(() => {
    apiRequest('/students/me/enrollments').then(async (enrollments) => {
      const active = enrollments.filter((e) => e.course);
      const lists = await Promise.all(active.map((e) =>
        apiRequest(`/courses/${e.course._id}/exams`).then((list) => list.map((ex) => ({ ...ex, courseTitle: e.course.title }))).catch(() => [])
      ));
      setExams(lists.flat());
    }).catch((err) => onFlash(err.message));
  }, [onFlash]);

  function openExamForm(exam) {
    setOpenExam(exam);
    setAnswers({});
  }

  async function submitExam() {
    const payload = openExam.questions.map((q, i) => (
      q.type === 'mcq' ? { questionIndex: i, selectedOption: answers[i] ?? null } : { questionIndex: i, textAnswer: answers[i] || '' }
    ));
    try {
      await apiRequest(`/courses/exams/${openExam._id}/submit`, { method: 'POST', body: { answers: payload } });
      onFlash('Exam submitted.', 'success');
      setSubmitted({ ...submitted, [openExam._id]: true });
      setOpenExam(null);
    } catch (err) { onFlash(err.message); }
  }

  return (
    <div>
      <h3 className="font-semibold mb-2">My Exams</h3>
      <Table
        loading={exams === null}
        headers={['Exam', 'Course', 'Type', 'Questions', 'Action']}
        rows={(exams || []).map((ex) => [
          ex.title, ex.courseTitle, ex.type, ex.questions.length,
          submitted[ex._id]
            ? <Tag status="approved" />
            : <button className="btn btn-primary" style={{ padding: '5px 12px', fontSize: '0.78rem' }} onClick={() => openExamForm(ex)}>Take Exam</button>
        ])}
        empty="No exams available yet."
      />

      {openExam && (
        <div className="card reveal in mt-4" style={{ padding: 20 }}>
          <h4 className="font-semibold mb-3">{openExam.title}</h4>
          {openExam.questions.map((q, i) => (
            <div key={i} className="mb-4">
              <p className="text-sm font-medium mb-2">{i + 1}. {q.text} <span style={{ color: 'var(--ink-soft)', fontWeight: 400 }}>({q.marks} marks)</span></p>
              {q.type === 'mcq' ? (
                q.options.map((opt, oi) => (
                  <label key={oi} className="flex items-center gap-2 text-sm mb-1">
                    <input type="radio" name={`q-${i}`} checked={answers[i] === oi} onChange={() => setAnswers({ ...answers, [i]: oi })} />
                    {opt}
                  </label>
                ))
              ) : (
                <textarea className="form-input" rows={3} value={answers[i] || ''} onChange={(e) => setAnswers({ ...answers, [i]: e.target.value })} />
              )}
            </div>
          ))}
          <div className="flex gap-2">
            <button type="button" className="btn btn-primary" onClick={submitExam}>Submit Exam</button>
            <button type="button" className="btn" style={{ background: 'var(--sand-line)', color: 'var(--ink)' }} onClick={() => setOpenExam(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

function StudentSummary() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { apiRequest('/dashboard/summary').then(setData).catch((err) => setError(err.message)); }, []);

  if (error) return <div role="alert" className="admin-notice error">{error}</div>;
  if (!data) return <p role="status" className="admin-notice">Loading your dashboard...</p>;

  return (
    <>
      <OverviewStats stats={data.stats} />
      <QuickActions />
      <div className="grid g2" style={{ marginTop: 32 }}>
        <ProfileCompletion percent={data.profile.percent} checks={data.profile.checks} />
        <MiniCalendar />
      </div>
      <RecommendedGrid items={data.recommended} />
      <RecentActivity items={data.recentActivity} />
    </>
  );
}

// ---------------------------------------------------------------- Teacher

function TeacherWorkspace({ tab, user, onFlash, onChanged }) {
  if (tab === 'profile') return <><ProfilePanel user={user} onFlash={onFlash} onChanged={onChanged} /><RolesPanel onFlash={onFlash} onChanged={onChanged} /><SupportComplaintPanel onFlash={onFlash} /></>;
  if (tab === 'courses') return <TeacherPanel onFlash={onFlash} />;
  if (tab === 'summary') return <TeacherSummary />;
  if (tab === 'students') return <TeacherStudentsPanel onFlash={onFlash} />;
  if (tab === 'attendance') return <TeacherAttendancePanel onFlash={onFlash} />;
  if (tab === 'homework') return <TeacherHomeworkPanel onFlash={onFlash} />;
  if (tab === 'results') return <TeacherResultsPanel onFlash={onFlash} />;
  if (tab === 'timetable') return <TimetableView onFlash={onFlash} url="/teachers/me/timetable" />;
  if (tab === 'examination') return <TeacherExaminationPanel onFlash={onFlash} />;
  if (tab === 'earnings') return <TeacherEarningsPanel onFlash={onFlash} />;
  const labels = { ptm: 'Parent-Teacher Meeting' };
  return <ComingSoon label={labels[tab] || tab} />;
}

function TeacherEarningsPanel({ onFlash }) {
  const [payslips, setPayslips] = useState(null);
  useEffect(() => { apiRequest('/teachers/me/payslips').then(setPayslips).catch((err) => onFlash(err.message)); }, [onFlash]);

  return (
    <div>
      <h3 className="font-semibold mb-2">Salary & Earnings</h3>
      <Table
        loading={payslips === null}
        headers={['Institution', 'Period', 'Basic', 'Bonuses', 'Deductions', 'Net', 'Status']}
        rows={(payslips || []).map((p) => [
          p.institution?.name || '—', `${p.month}/${p.year}`, `${p.currency} ${p.basicSalary}`,
          `${p.currency} ${p.bonuses}`, `${p.currency} ${p.deductions}`, `${p.currency} ${p.netAmount}`,
          <Tag status={p.status === 'paid' ? 'approved' : 'pending'} />
        ])}
        empty="No payslips issued to you yet."
      />
    </div>
  );
}

function TeacherExaminationPanel({ onFlash }) {
  const { courses, courseId, setCourseId } = useTeacherCourses(onFlash);
  const [exams, setExams] = useState([]);
  const [form, setForm] = useState({ title: '', type: 'quiz', questions: [] });
  const [openExam, setOpenExam] = useState(null);
  const [submissions, setSubmissions] = useState([]);

  function loadExams() {
    if (!courseId) return;
    apiRequest(`/courses/${courseId}/exams`).then(setExams).catch((err) => onFlash(err.message));
  }
  useEffect(loadExams, [courseId]); // eslint-disable-line react-hooks/exhaustive-deps

  function addQuestion(type) {
    setForm((f) => ({ ...f, questions: [...f.questions, type === 'mcq' ? { text: '', type: 'mcq', options: ['', ''], correctOption: 0, marks: 1 } : { text: '', type: 'short', options: [], marks: 1 }] }));
  }
  function updateQuestion(i, patch) {
    setForm((f) => ({ ...f, questions: f.questions.map((q, idx) => (idx === i ? { ...q, ...patch } : q)) }));
  }
  function removeQuestion(i) {
    setForm((f) => ({ ...f, questions: f.questions.filter((_, idx) => idx !== i) }));
  }

  async function createExam(e) {
    e.preventDefault();
    if (form.questions.length === 0) return onFlash('Add at least one question.');
    try {
      await apiRequest(`/courses/${courseId}/exams`, { method: 'POST', body: form });
      onFlash('Exam created (unpublished).', 'success');
      setForm({ title: '', type: 'quiz', questions: [] });
      loadExams();
    } catch (err) { onFlash(err.message); }
  }

  async function publish(examId) {
    try { await apiRequest(`/courses/exams/${examId}/publish`, { method: 'PATCH' }); onFlash('Exam published.', 'success'); loadExams(); } catch (err) { onFlash(err.message); }
  }

  function openSubmissions(examId) {
    setOpenExam(examId);
    apiRequest(`/courses/exams/${examId}/submissions`).then(setSubmissions).catch((err) => onFlash(err.message));
  }

  async function gradeShortAnswers(submissionId, marksByIndex) {
    try {
      await apiRequest(`/courses/exam-submissions/${submissionId}/grade`, { method: 'PATCH', body: { manualMarks: Object.entries(marksByIndex).map(([questionIndex, marks]) => ({ questionIndex: Number(questionIndex), marks: Number(marks) })) } });
      onFlash('Exam graded.', 'success');
      openSubmissions(openExam);
    } catch (err) { onFlash(err.message); }
  }

  return (
    <div>
      <CourseSelect courses={courses} value={courseId} onChange={setCourseId} />
      {courseId && (
        <>
          <form onSubmit={createExam} className="space-y-3 mb-6 max-w-2xl">
            <div className="flex gap-3">
              <input className="form-input" placeholder="Exam title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              <select className="form-select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {['quiz', 'midterm', 'final', 'test'].map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            {form.questions.map((q, i) => (
              <div key={i} className="border border-[var(--sand-line)] rounded-xl p-3">
                <div className="flex gap-2 items-start">
                  <input className="form-input" placeholder={`Question ${i + 1} (${q.type})`} value={q.text} onChange={(e) => updateQuestion(i, { text: e.target.value })} required style={{ flex: 1 }} />
                  <input className="form-input" type="number" placeholder="Marks" value={q.marks} onChange={(e) => updateQuestion(i, { marks: Number(e.target.value) })} style={{ width: 80 }} />
                  <button type="button" className="btn" style={{ padding: '6px 10px', fontSize: '0.75rem', background: 'var(--sand-line)', color: 'var(--ink)' }} onClick={() => removeQuestion(i)}>Remove</button>
                </div>
                {q.type === 'mcq' && (
                  <div className="mt-2 space-y-1">
                    {q.options.map((opt, oi) => (
                      <div key={oi} className="flex gap-2 items-center">
                        <input type="radio" name={`correct-${i}`} checked={q.correctOption === oi} onChange={() => updateQuestion(i, { correctOption: oi })} />
                        <input className="form-input" placeholder={`Option ${oi + 1}`} value={opt} onChange={(e) => updateQuestion(i, { options: q.options.map((o, x) => (x === oi ? e.target.value : o)) })} />
                      </div>
                    ))}
                    <button type="button" className="btn" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={() => updateQuestion(i, { options: [...q.options, ''] })}>+ Option</button>
                  </div>
                )}
              </div>
            ))}
            <div className="flex gap-2">
              <button type="button" className="btn" style={{ background: 'var(--sand-line)', color: 'var(--ink)' }} onClick={() => addQuestion('mcq')}>+ MCQ Question</button>
              <button type="button" className="btn" style={{ background: 'var(--sand-line)', color: 'var(--ink)' }} onClick={() => addQuestion('short')}>+ Short Answer Question</button>
              <button type="submit" className="btn btn-primary">Create Exam</button>
            </div>
          </form>

          <Table
            headers={['Title', 'Type', 'Questions', 'Status', 'Action']}
            rows={exams.map((ex) => [
              ex.title, ex.type, ex.questions.length, ex.published ? <Tag status="approved" /> : <Tag status="pending" />,
              <div className="flex gap-2">
                {!ex.published && <button className="btn btn-primary" style={{ padding: '5px 12px', fontSize: '0.78rem' }} onClick={() => publish(ex._id)}>Publish</button>}
                <button className="btn" style={{ padding: '5px 12px', fontSize: '0.78rem', background: 'var(--sand-line)', color: 'var(--ink)' }} onClick={() => openSubmissions(ex._id)}>Submissions</button>
              </div>
            ])}
            empty="No exams created yet."
          />

          {openExam && <ExamSubmissionsView exam={exams.find((e) => e._id === openExam)} submissions={submissions} onGrade={gradeShortAnswers} />}
        </>
      )}
    </div>
  );
}

function ExamSubmissionsView({ exam, submissions, onGrade }) {
  const [drafts, setDrafts] = useState({});

  return (
    <div className="mt-6">
      <h3 className="font-semibold mb-2">Submissions{exam ? ` — ${exam.title}` : ''}</h3>
      {submissions.length === 0 && <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>No submissions yet.</p>}
      {submissions.map((s) => {
        const shortAnswers = s.answers.filter((a) => exam?.questions?.[a.questionIndex]?.type === 'short');
        return (
          <div key={s._id} className="border border-[var(--sand-line)] rounded-xl p-3 mb-3">
            <div className="flex items-center justify-between">
              <strong>{s.student?.fullName}</strong>
              <span className="text-sm">Score: {s.score} · <Tag status={s.status === 'graded' ? 'approved' : 'pending'} /></span>
            </div>
            {shortAnswers.map((a) => (
              <div key={a.questionIndex} className="mt-2 text-sm">
                <p><strong>Q{a.questionIndex + 1}:</strong> {exam.questions[a.questionIndex].text}</p>
                <p className="text-[var(--ink-soft)]">{a.textAnswer || '(no answer)'}</p>
                <input
                  className="form-input" type="number" placeholder={`Marks (max ${exam.questions[a.questionIndex].marks})`} style={{ maxWidth: 160 }}
                  value={drafts[`${s._id}-${a.questionIndex}`] ?? a.marksAwarded}
                  onChange={(e) => setDrafts({ ...drafts, [`${s._id}-${a.questionIndex}`]: e.target.value })}
                />
              </div>
            ))}
            {shortAnswers.length > 0 && s.status !== 'graded' && (
              <button
                type="button" className="btn btn-primary mt-2" style={{ padding: '5px 12px', fontSize: '0.78rem' }}
                onClick={() => onGrade(s._id, Object.fromEntries(shortAnswers.map((a) => [a.questionIndex, drafts[`${s._id}-${a.questionIndex}`] ?? a.marksAwarded])))}
              >
                Save Grades
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

function useTeacherCourses(onFlash) {
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState('');
  useEffect(() => {
    apiRequest('/courses/mine/list')
      .then((list) => { setCourses(list); if (list[0]) setCourseId(list[0]._id); })
      .catch((err) => onFlash(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return { courses, courseId, setCourseId };
}

function CourseSelect({ courses, value, onChange }) {
  if (courses.length === 0) return <p className="admin-notice">Create a course first (My Courses tab) — students, attendance, homework and results are all recorded against a course.</p>;
  return (
    <select className="form-select" value={value} onChange={(e) => onChange(e.target.value)} style={{ maxWidth: 320, marginBottom: 16 }} aria-label="Select course">
      {courses.map((c) => <option key={c._id} value={c._id}>{c.title}</option>)}
    </select>
  );
}

function TeacherStudentsPanel({ onFlash }) {
  const { courses, courseId, setCourseId } = useTeacherCourses(onFlash);
  const [enrollments, setEnrollments] = useState([]);
  useEffect(() => {
    if (!courseId) return;
    apiRequest(`/courses/${courseId}/students`).then(setEnrollments).catch((err) => onFlash(err.message));
  }, [courseId, onFlash]);

  return (
    <div>
      <CourseSelect courses={courses} value={courseId} onChange={setCourseId} />
      {courseId && <Table headers={['Name', 'Email', 'Progress', 'Status']} rows={enrollments.map((e) => [e.student?.fullName, e.student?.email, `${e.progressPercent}%`, <Tag status={e.status === 'active' ? 'approved' : e.status} />])} empty="No students enrolled in this course yet." />}
    </div>
  );
}

function TeacherAttendancePanel({ onFlash }) {
  const { courses, courseId, setCourseId } = useTeacherCourses(onFlash);
  const [enrollments, setEnrollments] = useState([]);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [statuses, setStatuses] = useState({});
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!courseId) return;
    apiRequest(`/courses/${courseId}/students`).then((list) => {
      setEnrollments(list);
      setStatuses(Object.fromEntries(list.map((e) => [e.student._id, 'present'])));
    }).catch((err) => onFlash(err.message));
  }, [courseId, onFlash]);

  function loadHistory() {
    apiRequest('/teachers/me/attendance').then(setHistory).catch((err) => onFlash(err.message));
  }
  useEffect(loadHistory, []);

  async function submit(e) {
    e.preventDefault();
    const records = enrollments.map((en) => ({ student: en.student._id, status: statuses[en.student._id] || 'present' }));
    try {
      await apiRequest('/teachers/me/attendance', { method: 'POST', body: { course: courseId, date, records } });
      onFlash('Attendance recorded.', 'success');
      loadHistory();
    } catch (err) { onFlash(err.message); }
  }

  return (
    <div>
      <CourseSelect courses={courses} value={courseId} onChange={setCourseId} />
      {courseId && enrollments.length > 0 && (
        <form onSubmit={submit} className="mb-6">
          <div className="flex gap-3 items-end mb-4 flex-wrap">
            <label>Date <input type="date" className="form-input" value={date} onChange={(e) => setDate(e.target.value)} /></label>
            <button type="submit" className="btn btn-primary">Save Attendance</button>
          </div>
          <div className="account-table-wrap overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left border-b border-[var(--sand-line)]"><th className="py-2 pr-4">Student</th><th className="py-2 pr-4">Status</th></tr></thead>
              <tbody>
                {enrollments.map((en) => (
                  <tr key={en.student._id} className="border-b border-[var(--sand-line)] last:border-0">
                    <td className="py-2 pr-4">{en.student.fullName}</td>
                    <td className="py-2 pr-4">
                      <select className="form-select" value={statuses[en.student._id] || 'present'} onChange={(e) => setStatuses({ ...statuses, [en.student._id]: e.target.value })}>
                        {['present', 'absent', 'late', 'excused'].map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </form>
      )}
      <h3 className="font-semibold mb-2">Attendance History</h3>
      <Table headers={['Date', 'Marked']} rows={history.map((h) => [new Date(h.date).toLocaleDateString(), `${h.records.length} students`])} empty="No attendance recorded yet." />
    </div>
  );
}

function TeacherHomeworkPanel({ onFlash }) {
  const { courses, courseId, setCourseId } = useTeacherCourses(onFlash);
  const [assignments, setAssignments] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', dueDate: '', maxMarks: 100 });
  const [openAssignment, setOpenAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);

  function loadAssignments() {
    if (!courseId) return;
    apiRequest(`/courses/${courseId}/assignments`).then(setAssignments).catch((err) => onFlash(err.message));
  }
  useEffect(loadAssignments, [courseId]);

  async function create(e) {
    e.preventDefault();
    try {
      await apiRequest(`/courses/${courseId}/assignments`, { method: 'POST', body: { ...form, maxMarks: Number(form.maxMarks) || 100 } });
      onFlash('Assignment created.', 'success');
      setForm({ title: '', description: '', dueDate: '', maxMarks: 100 });
      loadAssignments();
    } catch (err) { onFlash(err.message); }
  }

  function openSubmissions(assignmentId) {
    setOpenAssignment(assignmentId);
    apiRequest(`/courses/assignments/${assignmentId}/submissions`).then(setSubmissions).catch((err) => onFlash(err.message));
  }

  async function grade(submissionId, marksObtained, feedback) {
    try {
      await apiRequest(`/courses/submissions/${submissionId}/grade`, { method: 'PATCH', body: { marksObtained: Number(marksObtained), feedback } });
      onFlash('Submission graded.', 'success');
      openSubmissions(openAssignment);
    } catch (err) { onFlash(err.message); }
  }

  return (
    <div>
      <CourseSelect courses={courses} value={courseId} onChange={setCourseId} />
      {courseId && (
        <>
          <form onSubmit={create} className="space-y-3 mb-6 max-w-md">
            <input className="form-input" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <input className="form-input" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <div className="flex gap-3">
              <input className="form-input" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
              <input className="form-input" type="number" placeholder="Max marks" value={form.maxMarks} onChange={(e) => setForm({ ...form, maxMarks: e.target.value })} />
            </div>
            <button type="submit" className="btn btn-primary">Create Assignment</button>
          </form>
          <Table
            headers={['Title', 'Due', 'Max Marks', 'Action']}
            rows={assignments.map((a) => [a.title, a.dueDate ? new Date(a.dueDate).toLocaleDateString() : '—', a.maxMarks, <button className="btn btn-primary" style={{ padding: '5px 12px', fontSize: '0.78rem' }} onClick={() => openSubmissions(a._id)}>Submissions</button>])}
            empty="No assignments yet."
          />
          {openAssignment && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Submissions</h3>
              <Table
                headers={['Student', 'Status', 'Marks', 'Grade']}
                rows={submissions.map((s) => [
                  s.student?.fullName || s.student, <Tag status={s.status === 'graded' ? 'approved' : 'pending'} />, s.marksObtained ?? '—',
                  <GradeForm onSubmit={(marks, fb) => grade(s._id, marks, fb)} />
                ])}
                empty="No submissions yet."
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

function GradeForm({ onSubmit }) {
  const [marks, setMarks] = useState('');
  const [feedback, setFeedback] = useState('');
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(marks, feedback); }} className="flex gap-2 items-center">
      <input className="form-input" style={{ width: 70 }} type="number" placeholder="Marks" value={marks} onChange={(e) => setMarks(e.target.value)} />
      <input className="form-input" style={{ width: 120 }} placeholder="Feedback" value={feedback} onChange={(e) => setFeedback(e.target.value)} />
      <button type="submit" className="btn btn-primary" style={{ padding: '5px 12px', fontSize: '0.78rem' }}>Save</button>
    </form>
  );
}

function TeacherResultsPanel({ onFlash }) {
  const { courses, courseId, setCourseId } = useTeacherCourses(onFlash);
  const [enrollments, setEnrollments] = useState([]);
  const [form, setForm] = useState({ student: '', term: '', subject: '', marksObtained: '', totalMarks: 100, grade: '' });

  useEffect(() => {
    if (!courseId) return;
    apiRequest(`/courses/${courseId}/students`).then((list) => {
      setEnrollments(list);
      setForm((f) => ({ ...f, student: list[0]?.student?._id || '' }));
    }).catch((err) => onFlash(err.message));
  }, [courseId, onFlash]);

  async function submit(e) {
    e.preventDefault();
    try {
      await apiRequest(`/courses/${courseId}/results`, {
        method: 'POST',
        body: { ...form, marksObtained: Number(form.marksObtained), totalMarks: Number(form.totalMarks) || 100 }
      });
      onFlash('Result recorded.', 'success');
      setForm((f) => ({ ...f, term: '', subject: '', marksObtained: '', grade: '' }));
    } catch (err) { onFlash(err.message); }
  }

  return (
    <div>
      <CourseSelect courses={courses} value={courseId} onChange={setCourseId} />
      {courseId && enrollments.length > 0 && (
        <form onSubmit={submit} className="space-y-3 max-w-md">
          <select className="form-select" value={form.student} onChange={(e) => setForm({ ...form, student: e.target.value })}>
            {enrollments.map((en) => <option key={en.student._id} value={en.student._id}>{en.student.fullName}</option>)}
          </select>
          <input className="form-input" placeholder="Term (e.g. Mid Term)" value={form.term} onChange={(e) => setForm({ ...form, term: e.target.value })} />
          <input className="form-input" placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
          <div className="flex gap-3">
            <input className="form-input" type="number" placeholder="Marks obtained" value={form.marksObtained} onChange={(e) => setForm({ ...form, marksObtained: e.target.value })} required />
            <input className="form-input" type="number" placeholder="Total marks" value={form.totalMarks} onChange={(e) => setForm({ ...form, totalMarks: e.target.value })} />
            <input className="form-input" placeholder="Grade (e.g. A)" value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} />
          </div>
          <button type="submit" className="btn btn-primary">Record Result</button>
        </form>
      )}
    </div>
  );
}

function TeacherSummary() {
  const [courses, setCourses] = useState(null);
  useEffect(() => { apiRequest('/courses/mine/list').then(setCourses).catch(() => setCourses([])); }, []);
  const published = courses?.filter((c) => c.published).length;
  return (
    <SummaryRow items={[
      { label: 'My Courses', value: courses?.length, icon: FaBookOpen, detail: 'Created by you' },
      { label: 'Published Courses', value: published, icon: FaClipboardCheck, detail: 'Visible to students' },
      { label: 'Students', value: null, icon: FaUsers, detail: 'Coming soon' },
      { label: 'Earnings', value: null, icon: FaSackDollar, detail: 'Coming soon' }
    ]} />
  );
}

// ---------------------------------------------------------------- Parent

function ParentWorkspace({ tab, user, onFlash, onChanged }) {
  if (tab === 'profile') return <><ProfilePanel user={user} onFlash={onFlash} onChanged={onChanged} /><RolesPanel onFlash={onFlash} onChanged={onChanged} /><SupportComplaintPanel onFlash={onFlash} /></>;
  if (tab === 'children') return <ParentPanel onFlash={onFlash} />;
  if (tab === 'summary') return <ParentSummary />;
  if (tab === 'attendance') return <ParentChildDataPanel onFlash={onFlash} kind="attendance" />;
  if (tab === 'progress') return <ParentChildDataPanel onFlash={onFlash} kind="results" />;
  if (tab === 'fees') return <ParentChildDataPanel onFlash={onFlash} kind="fees" />;
  if (tab === 'timetable') return <ParentChildDataPanel onFlash={onFlash} kind="timetable" />;
  if (tab === 'homework') return <ParentChildDataPanel onFlash={onFlash} kind="homework" />;
  const labels = { ptm: 'Parent-Teacher Meeting' };
  return <ComingSoon label={labels[tab] || tab} />;
}

function ParentChildDataPanel({ onFlash, kind }) {
  const [children, setChildren] = useState([]);
  const [studentId, setStudentId] = useState('');
  const [rows, setRows] = useState(null);

  useEffect(() => {
    apiRequest('/parents/children').then((list) => {
      setChildren(list);
      if (list[0]) setStudentId(list[0].student._id);
    }).catch((err) => onFlash(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!studentId) return;
    setRows(null);
    apiRequest(`/parents/children/${studentId}/${kind}`).then(setRows).catch((err) => onFlash(err.message));
  }, [studentId, kind, onFlash]);

  if (children.length === 0) return <p className="admin-notice">No linked children yet — link one from the "My Children" tab first.</p>;

  return (
    <div>
      <select className="form-select" value={studentId} onChange={(e) => setStudentId(e.target.value)} style={{ maxWidth: 320, marginBottom: 16 }} aria-label="Select child">
        {children.map((c) => <option key={c.student._id} value={c.student._id}>{c.student.fullName}</option>)}
      </select>
      {rows === null && <p role="status" className="admin-notice">Loading...</p>}
      {rows && kind === 'attendance' && (
        <Table
          headers={['Date', 'Status']}
          rows={rows.map((r) => {
            const mine = r.records.find((rec) => rec.student === studentId || rec.student?._id === studentId || rec.student?.toString?.() === studentId);
            return [new Date(r.date).toLocaleDateString(), <Tag status={mine?.status === 'present' ? 'approved' : mine?.status === 'absent' ? 'rejected' : 'pending'} />];
          })}
          empty="No attendance recorded yet."
        />
      )}
      {rows && kind === 'results' && (
        <Table
          headers={['Term', 'Subject', 'Marks', 'Grade']}
          rows={rows.map((r) => [r.term || '—', r.subject || '—', `${r.marksObtained}/${r.totalMarks}`, r.grade || '—'])}
          empty="No results recorded yet."
        />
      )}
      {rows && kind === 'fees' && (
        <Table
          headers={['Title', 'Amount', 'Due', 'Status']}
          rows={rows.map((f) => [f.title, `${f.currency} ${f.amount}`, f.dueDate ? new Date(f.dueDate).toLocaleDateString() : '—', <Tag status={f.status === 'paid' ? 'approved' : f.status === 'overdue' ? 'rejected' : 'pending'} />])}
          empty="No fee records yet."
        />
      )}
      {rows && kind === 'timetable' && (
        <Table
          headers={['Day', 'Time', 'Subject', 'Teacher', 'Room']}
          rows={rows.map((t) => [DOW_LABEL[t.dayOfWeek], `${t.startTime}–${t.endTime}`, t.subject, t.teacher?.fullName || '—', t.room || '—'])}
          empty="No timetable set up yet."
        />
      )}
      {rows && kind === 'homework' && (
        <Table
          headers={['Assignment', 'Due', 'Status', 'Marks']}
          rows={rows.map((s) => [s.assignment?.title, s.assignment?.dueDate ? new Date(s.assignment.dueDate).toLocaleDateString() : '—', <Tag status={s.status === 'graded' ? 'approved' : 'pending'} />, s.marksObtained ?? `/ ${s.assignment?.maxMarks ?? ''}`])}
          empty="No homework submissions yet."
        />
      )}
    </div>
  );
}

function ParentSummary() {
  const [children, setChildren] = useState(null);
  const [attendanceRate, setAttendanceRate] = useState(null);
  const [pendingFees, setPendingFees] = useState(null);

  useEffect(() => {
    apiRequest('/parents/children').then((list) => {
      setChildren(list);
      const first = list[0]?.student?._id;
      if (!first) return;
      apiRequest(`/parents/children/${first}/attendance`).then((records) => {
        let present = 0, total = 0;
        records.forEach((r) => r.records.forEach((rec) => {
          const isMine = rec.student === first || rec.student?._id === first || rec.student?.toString?.() === first;
          if (isMine) { total += 1; if (rec.status === 'present') present += 1; }
        }));
        setAttendanceRate(total > 0 ? Math.round((present / total) * 100) : null);
      }).catch(() => setAttendanceRate(null));
      apiRequest(`/parents/children/${first}/fees`).then((fees) => {
        setPendingFees(fees.filter((f) => f.status !== 'paid').length);
      }).catch(() => setPendingFees(null));
    }).catch(() => setChildren([]));
  }, []);

  return (
    <SummaryRow items={[
      { label: 'My Children', value: children?.length, icon: FaUsers, detail: 'Linked & approved' },
      { label: 'Attendance', value: attendanceRate !== null ? `${attendanceRate}%` : null, icon: FaCalendarCheck, detail: attendanceRate !== null ? 'First child' : 'No data yet' },
      { label: 'Fees', value: pendingFees, icon: FaMoneyBillWave, detail: 'Pending records' },
      { label: 'Meetings', value: null, icon: FaHandshake, detail: 'Coming soon' }
    ]} />
  );
}

// ------------------------------------------------------------ Institution

function InstitutionWorkspace({ tab, user, onFlash, onChanged }) {
  if (tab === 'profile') return <><ProfilePanel user={user} onFlash={onFlash} onChanged={onChanged} /><RolesPanel onFlash={onFlash} onChanged={onChanged} /><SupportComplaintPanel onFlash={onFlash} /></>;
  if (tab === 'institution') return <InstitutionPanel onFlash={onFlash} onChanged={onChanged} />;
  if (tab === 'summary') return <InstitutionSummary />;
  if (tab === 'staff') return <InstitutionStaffPanel onFlash={onFlash} />;
  if (tab === 'classes') return <InstitutionClassesPanel onFlash={onFlash} />;
  if (tab === 'fees') return <InstitutionFeesPanel onFlash={onFlash} />;
  if (tab === 'communication') return <InstitutionBroadcastPanel onFlash={onFlash} />;
  if (tab === 'certificates') return <InstitutionCertificatesPanel onFlash={onFlash} />;
  if (tab === 'teachers') return <InstitutionTeachersPanel onFlash={onFlash} />;
  if (tab === 'students') return <InstitutionStudentsPanel onFlash={onFlash} />;
  if (tab === 'attendance') return <InstitutionAttendancePanel onFlash={onFlash} />;
  if (tab === 'payroll') return <InstitutionPayrollPanel onFlash={onFlash} />;
  if (tab === 'reports') return <InstitutionReportsPanel onFlash={onFlash} />;
  if (tab === 'examination') return <InstitutionExaminationPanel onFlash={onFlash} />;
  return <ComingSoon label={tab} />;
}

function InstitutionExaminationPanel({ onFlash }) {
  const institution = useMyInstitution(onFlash);
  const [exams, setExams] = useState(null);

  useEffect(() => {
    if (institution) apiRequest(`/institutions/${institution._id}/exams`).then(setExams).catch((err) => onFlash(err.message));
  }, [institution, onFlash]);

  if (institution === undefined || (institution && exams === null)) return <p role="status" className="admin-notice">Loading...</p>;
  if (!institution) return <p className="admin-notice">Register an institution first (My Institution tab).</p>;

  return (
    <div>
      <h3 className="font-semibold mb-2">Examination Management</h3>
      <Table
        headers={['Exam', 'Course', 'Teacher', 'Type', 'Scheduled', 'Published']}
        rows={(exams || []).map((e) => [e.title, e.courseTitle, e.teacher?.fullName || '—', e.type, e.scheduledDate ? new Date(e.scheduledDate).toLocaleDateString() : '—', <Tag status={e.published ? 'approved' : 'pending'} />])}
        empty="No exams created for this institution's courses yet."
      />
    </div>
  );
}

function InstitutionReportsPanel({ onFlash }) {
  const institution = useMyInstitution(onFlash);
  const [report, setReport] = useState(null);

  useEffect(() => {
    if (institution) apiRequest(`/institutions/${institution._id}/reports`).then(setReport).catch((err) => onFlash(err.message));
  }, [institution, onFlash]);

  if (institution === undefined || (institution && report === null)) return <p role="status" className="admin-notice">Loading...</p>;
  if (!institution) return <p className="admin-notice">Register an institution first (My Institution tab).</p>;

  return (
    <div>
      <h3 className="font-semibold mb-2">Institution Reports</h3>
      <SummaryRow items={[
        { label: 'Students', value: report.studentsCount, icon: FaUsers, detail: 'Enrolled' },
        { label: 'Teachers', value: report.teachersCount, icon: FaChalkboardUser, detail: 'Active' },
        { label: 'Staff', value: report.staffCount, icon: FaUserShield, detail: 'Managing this institution' },
        { label: 'Class Sections', value: report.classSectionsCount, icon: FaClipboardList, detail: `${report.campusesCount} campus(es)` }
      ]} />
      <div className="grid g2 mt-6" style={{ gap: 16 }}>
        <div className="card" style={{ padding: 20 }}>
          <h4 className="font-semibold mb-3">Fee Collection</h4>
          <p className="text-sm">Collected: <strong>{report.fees.collected}</strong> ({report.fees.collectedCount} payments)</p>
          <p className="text-sm">Pending: <strong>{report.fees.pending}</strong> ({report.fees.pendingCount} records)</p>
          <p className="text-sm">Overdue: <strong>{report.fees.overdue}</strong> ({report.fees.overdueCount} records)</p>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <h4 className="font-semibold mb-3">Operations</h4>
          <p className="text-sm">Attendance rate (last 100 records): <strong>{report.attendanceRate !== null ? `${report.attendanceRate}%` : 'No data yet'}</strong></p>
          <p className="text-sm">Pending payslips: <strong>{report.pendingPayroll}</strong></p>
        </div>
      </div>
    </div>
  );
}

function InstitutionPayrollPanel({ onFlash }) {
  const institution = useMyInstitution(onFlash);
  const [payslips, setPayslips] = useState(null);
  const now = new Date();
  const [form, setForm] = useState({ staffId: '', month: now.getMonth() + 1, year: now.getFullYear(), basicSalary: '', bonuses: 0, deductions: 0, currency: 'USD' });

  function load() {
    if (institution) apiRequest(`/institutions/${institution._id}/payroll`).then(setPayslips).catch((err) => onFlash(err.message));
  }
  useEffect(load, [institution]);

  async function generate(e) {
    e.preventDefault();
    try {
      await apiRequest(`/institutions/${institution._id}/payroll`, {
        method: 'POST',
        body: {
          staff: form.staffId.trim(), month: Number(form.month), year: Number(form.year),
          basicSalary: Number(form.basicSalary), bonuses: Number(form.bonuses), deductions: Number(form.deductions), currency: form.currency
        }
      });
      onFlash('Payslip generated.', 'success');
      setForm({ ...form, staffId: '', basicSalary: '', bonuses: 0, deductions: 0 });
      load();
    } catch (err) { onFlash(err.message); }
  }

  async function markPaid(id) {
    try {
      await apiRequest(`/institutions/payroll/${id}/pay`, { method: 'PATCH' });
      onFlash('Payslip marked as paid.', 'success');
      load();
    } catch (err) { onFlash(err.message); }
  }

  if (institution === undefined) return <p role="status" className="admin-notice">Loading...</p>;
  if (!institution) return <p className="admin-notice">Register an institution first (My Institution tab).</p>;

  return (
    <div>
      <h3 className="font-semibold mb-2">Payroll</h3>
      <form onSubmit={generate} className="flex gap-2 items-end mb-4 flex-wrap">
        <input className="form-input" placeholder="Staff User ID" required value={form.staffId} onChange={(e) => setForm({ ...form, staffId: e.target.value })} style={{ minWidth: 220 }} />
        <input className="form-input" type="number" min="1" max="12" placeholder="Month" value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })} style={{ maxWidth: 90 }} />
        <input className="form-input" type="number" placeholder="Year" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} style={{ maxWidth: 100 }} />
        <input className="form-input" type="number" placeholder="Basic Salary" required value={form.basicSalary} onChange={(e) => setForm({ ...form, basicSalary: e.target.value })} style={{ maxWidth: 140 }} />
        <input className="form-input" type="number" placeholder="Bonuses" value={form.bonuses} onChange={(e) => setForm({ ...form, bonuses: e.target.value })} style={{ maxWidth: 110 }} />
        <input className="form-input" type="number" placeholder="Deductions" value={form.deductions} onChange={(e) => setForm({ ...form, deductions: e.target.value })} style={{ maxWidth: 120 }} />
        <button type="submit" className="btn btn-primary">Generate Payslip</button>
      </form>
      <Table
        loading={payslips === null}
        headers={['Staff', 'Period', 'Net Amount', 'Status', 'Action']}
        rows={(payslips || []).map((p) => [
          p.staff?.fullName, `${p.month}/${p.year}`, `${p.currency} ${p.netAmount}`,
          <Tag status={p.status === 'paid' ? 'approved' : 'pending'} />,
          p.status === 'pending' ? <button className="btn" style={{ padding: '4px 12px', fontSize: '0.78rem' }} onClick={() => markPaid(p._id)}>Mark Paid</button> : '—'
        ])}
        empty="No payslips generated yet."
      />
    </div>
  );
}

function useMyInstitution(onFlash) {
  const [institution, setInstitution] = useState(undefined);
  useEffect(() => {
    apiRequest('/institutions/mine/list').then((list) => setInstitution(list[0] || null)).catch((err) => onFlash(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return institution;
}

function InstitutionTeachersPanel({ onFlash }) {
  const institution = useMyInstitution(onFlash);
  const [teachers, setTeachers] = useState(null);

  useEffect(() => {
    if (institution) apiRequest(`/institutions/${institution._id}/teachers`).then(setTeachers).catch((err) => onFlash(err.message));
  }, [institution, onFlash]);

  if (institution === undefined || (institution && teachers === null)) return <p role="status" className="admin-notice">Loading...</p>;
  if (!institution) return <p className="admin-notice">Register an institution first (My Institution tab).</p>;

  return (
    <div>
      <h3 className="font-semibold mb-2">Teacher Management</h3>
      <Table
        headers={['Name', 'Email', 'Subjects', 'Experience', 'Status']}
        rows={(teachers || []).map((t) => [t.user?.fullName, t.user?.email, (t.subjects || []).join(', ') || '—', `${t.experienceYears || 0} yrs`, <Tag status={t.status === 'active' ? 'approved' : 'rejected'} />])}
        empty="No teachers linked to this institution yet."
      />
    </div>
  );
}

function InstitutionStudentsPanel({ onFlash }) {
  const institution = useMyInstitution(onFlash);
  const [students, setStudents] = useState(null);

  function load() {
    if (institution) apiRequest(`/institutions/${institution._id}/students`).then(setStudents).catch((err) => onFlash(err.message));
  }
  useEffect(load, [institution]);

  async function changeStatus(profileId, status) {
    try {
      await apiRequest(`/institutions/students/${profileId}/status`, { method: 'PATCH', body: { status } });
      onFlash('Student status updated.', 'success');
      load();
    } catch (err) { onFlash(err.message); }
  }

  if (institution === undefined || (institution && students === null)) return <p role="status" className="admin-notice">Loading...</p>;
  if (!institution) return <p className="admin-notice">Register an institution first (My Institution tab).</p>;

  return (
    <div>
      <h3 className="font-semibold mb-2">Student Management</h3>
      <Table
        headers={['Name', 'Email', 'Roll No.', 'Class', 'Status', 'Action']}
        rows={(students || []).map((s) => [
          s.user?.fullName, s.user?.email, s.rollNumber || '—', s.classSection?.name || '—',
          <Tag status={s.status === 'active' ? 'approved' : s.status === 'suspended' ? 'rejected' : 'pending'} />,
          <select className="form-input" value={s.status} onChange={(e) => changeStatus(s._id, e.target.value)} style={{ padding: '4px 8px', fontSize: '0.78rem' }}>
            {['active', 'suspended', 'graduated', 'transferred'].map((st) => <option key={st} value={st}>{st}</option>)}
          </select>
        ])}
        empty="No students linked to this institution yet."
      />
    </div>
  );
}

function InstitutionAttendancePanel({ onFlash }) {
  const institution = useMyInstitution(onFlash);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (institution) apiRequest(`/institutions/${institution._id}/attendance`).then(setData).catch((err) => onFlash(err.message));
  }, [institution, onFlash]);

  if (institution === undefined || (institution && data === null)) return <p role="status" className="admin-notice">Loading...</p>;
  if (!institution) return <p className="admin-notice">Register an institution first (My Institution tab).</p>;

  const s = data.summary;
  return (
    <div>
      <h3 className="font-semibold mb-2">Attendance Management</h3>
      <div className="flex gap-4 mb-4 flex-wrap">
        <span className="text-sm">Present: <strong>{s.present}</strong></span>
        <span className="text-sm">Absent: <strong>{s.absent}</strong></span>
        <span className="text-sm">Late: <strong>{s.late}</strong></span>
        <span className="text-sm">Excused: <strong>{s.excused}</strong></span>
      </div>
      <Table
        headers={['Date', 'Class', 'Marked By', 'Students']}
        rows={data.records.map((r) => [new Date(r.date).toLocaleDateString(), r.classSection?.name || '—', r.markedBy?.fullName || '—', r.records.length])}
        empty="No attendance records yet."
      />
    </div>
  );
}

function InstitutionCertificatesPanel({ onFlash }) {
  const [institution, setInstitution] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [form, setForm] = useState({ studentId: '', title: '' });

  function load() {
    apiRequest('/institutions/mine/list').then((list) => {
      const inst = list[0] || null;
      setInstitution(inst);
      if (inst) apiRequest(`/institutions/${inst._id}/certificates`).then(setCertificates).catch((err) => onFlash(err.message));
    }).catch((err) => onFlash(err.message));
  }
  useEffect(load, []);

  async function issue(e) {
    e.preventDefault();
    try {
      await apiRequest(`/institutions/${institution._id}/certificates`, { method: 'POST', body: { student: form.studentId.trim(), title: form.title } });
      onFlash('Certificate issued.', 'success');
      setForm({ studentId: '', title: '' });
      load();
    } catch (err) { onFlash(err.message); }
  }

  if (!institution) return <p className="admin-notice">Register an institution first (My Institution tab).</p>;

  return (
    <div>
      <form onSubmit={issue} className="flex gap-3 items-end mb-3 flex-wrap">
        <input className="form-input" placeholder="Student's User ID" value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} required />
        <input className="form-input" placeholder="Certificate title (e.g. Certificate of Completion)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required style={{ minWidth: 260 }} />
        <button type="submit" className="btn btn-primary">Issue Certificate</button>
      </form>
      <Table
        headers={['Student', 'Title', 'Issued']}
        rows={certificates.map((c) => [c.student?.fullName, c.title, new Date(c.issueDate).toLocaleDateString()])}
        empty="No certificates issued yet."
      />
    </div>
  );
}

function InstitutionFeesPanel({ onFlash }) {
  const [institution, setInstitution] = useState(null);
  const [fees, setFees] = useState([]);
  const [form, setForm] = useState({ studentId: '', title: '', amount: '', dueDate: '' });

  function load() {
    apiRequest('/institutions/mine/list').then((list) => {
      const inst = list[0] || null;
      setInstitution(inst);
      if (inst) apiRequest(`/institutions/${inst._id}/fees`).then(setFees).catch((err) => onFlash(err.message));
    }).catch((err) => onFlash(err.message));
  }
  useEffect(load, []);

  async function createFee(e) {
    e.preventDefault();
    try {
      await apiRequest(`/institutions/${institution._id}/fees`, {
        method: 'POST',
        body: { student: form.studentId.trim(), title: form.title, amount: Number(form.amount), dueDate: form.dueDate || null }
      });
      onFlash('Fee recorded.', 'success');
      setForm({ studentId: '', title: '', amount: '', dueDate: '' });
      load();
    } catch (err) { onFlash(err.message); }
  }

  async function markPaid(feeId) {
    try {
      await apiRequest(`/institutions/fees/${feeId}/pay`, { method: 'PATCH', body: { paidVia: 'Manual' } });
      onFlash('Fee marked as paid.', 'success');
      load();
    } catch (err) { onFlash(err.message); }
  }

  if (!institution) return <p className="admin-notice">Register an institution first (My Institution tab).</p>;

  return (
    <div>
      <form onSubmit={createFee} className="flex gap-3 items-end mb-3 flex-wrap">
        <input className="form-input" placeholder="Student's User ID" value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} required />
        <input className="form-input" placeholder="Title (e.g. Tuition Fee - Term 1)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <input className="form-input" type="number" placeholder="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required style={{ maxWidth: 120 }} />
        <input className="form-input" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
        <button type="submit" className="btn btn-primary">Add Fee</button>
      </form>
      <p style={{ fontSize: 12, color: 'var(--ink-soft)', marginBottom: 16 }}>
        Ask the student for their account's User ID from their Profile tab. Online payment isn't wired up yet — mark a fee "Paid" once you've received payment through any other method (bank transfer, cash, external link).
      </p>
      <Table
        headers={['Student', 'Title', 'Amount', 'Due', 'Status', 'Action']}
        rows={fees.map((f) => [
          f.student?.fullName, f.title, `${f.currency} ${f.amount}`, f.dueDate ? new Date(f.dueDate).toLocaleDateString() : '—',
          <Tag status={f.status === 'paid' ? 'approved' : 'pending'} />,
          f.status !== 'paid' ? <button className="btn btn-primary" style={{ padding: '5px 12px', fontSize: '0.78rem' }} onClick={() => markPaid(f._id)}>Mark Paid</button> : '—'
        ])}
        empty="No fee records yet."
      />
    </div>
  );
}

function InstitutionBroadcastPanel({ onFlash }) {
  const [institution, setInstitution] = useState(null);
  const [form, setForm] = useState({ audience: 'all', title: '', body: '' });

  useEffect(() => {
    apiRequest('/institutions/mine/list').then((list) => setInstitution(list[0] || null)).catch((err) => onFlash(err.message));
  }, [onFlash]);

  async function send(e) {
    e.preventDefault();
    try {
      const res = await apiRequest(`/institutions/${institution._id}/notifications/broadcast`, { method: 'POST', body: form });
      onFlash(`Notification sent to ${res.sentTo} recipient(s).`, 'success');
      setForm({ audience: 'all', title: '', body: '' });
    } catch (err) { onFlash(err.message); }
  }

  if (!institution) return <p className="admin-notice">Register an institution first (My Institution tab).</p>;

  return (
    <div>
      <h3 className="font-semibold mb-2">Communication Center</h3>
      <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 16 }}>
        Sends an in-app notification (and email, where the recipient's account has one) to everyone in the group you pick — students, teachers, parents or staff linked to your institution. Use this for announcements or emergencies.
      </p>
      <form onSubmit={send} className="space-y-3 max-w-md">
        <select className="form-select" value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })}>
          <option value="all">Everyone</option>
          <option value="students">Students</option>
          <option value="teachers">Teachers</option>
          <option value="parents">Parents</option>
          <option value="staff">Staff</option>
        </select>
        <input className="form-input" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <textarea className="form-input" placeholder="Message" rows={4} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
        <button type="submit" className="btn btn-primary">Send Notification</button>
      </form>
    </div>
  );
}

function InstitutionStaffPanel({ onFlash }) {
  const [institution, setInstitution] = useState(null);
  const [form, setForm] = useState({ userId: '', role: 'teacher' });

  function load() {
    apiRequest('/institutions/mine/list').then((list) => setInstitution(list[0] || null)).catch((err) => onFlash(err.message));
  }
  useEffect(load, []);

  async function addStaffMember(e) {
    e.preventDefault();
    try {
      await apiRequest(`/institutions/${institution._id}/staff`, { method: 'POST', body: { userId: form.userId.trim(), role: form.role } });
      onFlash('Staff member added.', 'success');
      setForm({ userId: '', role: 'teacher' });
      load();
    } catch (err) { onFlash(err.message); }
  }
  async function removeStaffMember(userId) {
    try {
      await apiRequest(`/institutions/${institution._id}/staff/${userId}`, { method: 'DELETE' });
      onFlash('Staff member removed.', 'success');
      load();
    } catch (err) { onFlash(err.message); }
  }

  if (!institution) return <p className="admin-notice">Register an institution first (My Institution tab).</p>;

  return (
    <div>
      <form onSubmit={addStaffMember} className="flex gap-3 items-end mb-3 flex-wrap">
        <input className="form-input" placeholder="Staff member's User ID" value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })} required />
        <select className="form-select" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
          {['teacher', 'accountant', 'librarian', 'principal', 'coordinator', 'staff'].map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <button type="submit" className="btn btn-primary">Add Staff</button>
      </form>
      <p style={{ fontSize: 12, color: 'var(--ink-soft)', marginBottom: 16 }}>Ask the staff member for their account's User ID from their Profile tab — a search-by-email lookup isn't built yet.</p>
      <Table
        headers={['Role', 'Added', 'Action']}
        rows={(institution.staff || []).map((s) => [s.role, new Date(s.addedAt).toLocaleDateString(), <button className="btn" style={{ padding: '5px 12px', fontSize: '0.78rem', background: 'var(--sand-line)', color: 'var(--ink)' }} onClick={() => removeStaffMember(s.user)}>Remove</button>])}
        empty="No staff added yet."
      />
    </div>
  );
}

const DOW_LABEL = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' };

function InstitutionClassesPanel({ onFlash }) {
  const [institution, setInstitution] = useState(null);
  const [campuses, setCampuses] = useState([]);
  const [sections, setSections] = useState([]);
  const [campusForm, setCampusForm] = useState({ name: '', address: '' });
  const [sectionForm, setSectionForm] = useState({ name: '', academicYear: '' });
  const [timetableSection, setTimetableSection] = useState('');
  const [timetable, setTimetable] = useState([]);
  const [entryForm, setEntryForm] = useState({ teacher: '', subject: '', dayOfWeek: 'mon', startTime: '', endTime: '', room: '' });

  function load() {
    apiRequest('/institutions/mine/list').then((list) => {
      const inst = list[0] || null;
      setInstitution(inst);
      if (inst) {
        apiRequest(`/institutions/${inst._id}/campuses`).then(setCampuses).catch((err) => onFlash(err.message));
        apiRequest(`/institutions/${inst._id}/class-sections`).then((list2) => {
          setSections(list2);
          if (list2[0] && !timetableSection) setTimetableSection(list2[0]._id);
        }).catch((err) => onFlash(err.message));
      }
    }).catch((err) => onFlash(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }
  useEffect(load, []);

  function loadTimetable(sectionId) {
    if (!institution || !sectionId) return;
    apiRequest(`/institutions/${institution._id}/class-sections/${sectionId}/timetable`).then(setTimetable).catch((err) => onFlash(err.message));
  }
  useEffect(() => { loadTimetable(timetableSection); }, [timetableSection, institution]); // eslint-disable-line react-hooks/exhaustive-deps

  async function createCampus(e) {
    e.preventDefault();
    try {
      await apiRequest(`/institutions/${institution._id}/campuses`, { method: 'POST', body: campusForm });
      onFlash('Campus added.', 'success');
      setCampusForm({ name: '', address: '' });
      load();
    } catch (err) { onFlash(err.message); }
  }
  async function createSection(e) {
    e.preventDefault();
    try {
      await apiRequest(`/institutions/${institution._id}/class-sections`, { method: 'POST', body: sectionForm });
      onFlash('Class section added.', 'success');
      setSectionForm({ name: '', academicYear: '' });
      load();
    } catch (err) { onFlash(err.message); }
  }
  async function createEntry(e) {
    e.preventDefault();
    try {
      await apiRequest(`/institutions/${institution._id}/class-sections/${timetableSection}/timetable`, {
        method: 'POST',
        body: { ...entryForm, teacher: entryForm.teacher.trim() || undefined }
      });
      onFlash('Timetable entry added.', 'success');
      setEntryForm({ teacher: '', subject: '', dayOfWeek: 'mon', startTime: '', endTime: '', room: '' });
      loadTimetable(timetableSection);
    } catch (err) { onFlash(err.message); }
  }
  async function removeEntry(entryId) {
    try {
      await apiRequest(`/institutions/timetable/${entryId}`, { method: 'DELETE' });
      onFlash('Timetable entry removed.', 'success');
      loadTimetable(timetableSection);
    } catch (err) { onFlash(err.message); }
  }

  if (!institution) return <p className="admin-notice">Register an institution first (My Institution tab).</p>;

  return (
    <div>
      <h3 className="font-semibold mb-2">Campuses</h3>
      <form onSubmit={createCampus} className="flex gap-3 items-end mb-4 flex-wrap">
        <input className="form-input" placeholder="Campus name" value={campusForm.name} onChange={(e) => setCampusForm({ ...campusForm, name: e.target.value })} required />
        <input className="form-input" placeholder="Address" value={campusForm.address} onChange={(e) => setCampusForm({ ...campusForm, address: e.target.value })} />
        <button type="submit" className="btn btn-primary">Add Campus</button>
      </form>
      <Table headers={['Name', 'Address']} rows={campuses.map((c) => [c.name, c.address || '—'])} empty="No campuses yet." />

      <h3 className="font-semibold mb-2 mt-6">Class Sections</h3>
      <form onSubmit={createSection} className="flex gap-3 items-end mb-4 flex-wrap">
        <input className="form-input" placeholder="Name (e.g. Grade 10 - A)" value={sectionForm.name} onChange={(e) => setSectionForm({ ...sectionForm, name: e.target.value })} required />
        <input className="form-input" placeholder="Academic year" value={sectionForm.academicYear} onChange={(e) => setSectionForm({ ...sectionForm, academicYear: e.target.value })} />
        <button type="submit" className="btn btn-primary">Add Section</button>
      </form>
      <Table headers={['Name', 'Academic Year']} rows={sections.map((s) => [s.name, s.academicYear || '—'])} empty="No class sections yet." />

      {sections.length > 0 && (
        <>
          <h3 className="font-semibold mb-2 mt-6">Timetable</h3>
          <select className="form-select" value={timetableSection} onChange={(e) => setTimetableSection(e.target.value)} style={{ maxWidth: 260, marginBottom: 16 }} aria-label="Select class section">
            {sections.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
          <form onSubmit={createEntry} className="flex gap-3 items-end mb-4 flex-wrap">
            <input className="form-input" placeholder="Subject" value={entryForm.subject} onChange={(e) => setEntryForm({ ...entryForm, subject: e.target.value })} required style={{ maxWidth: 140 }} />
            <select className="form-select" value={entryForm.dayOfWeek} onChange={(e) => setEntryForm({ ...entryForm, dayOfWeek: e.target.value })}>
              {Object.entries(DOW_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <input className="form-input" type="time" value={entryForm.startTime} onChange={(e) => setEntryForm({ ...entryForm, startTime: e.target.value })} required />
            <input className="form-input" type="time" value={entryForm.endTime} onChange={(e) => setEntryForm({ ...entryForm, endTime: e.target.value })} required />
            <input className="form-input" placeholder="Room (optional)" value={entryForm.room} onChange={(e) => setEntryForm({ ...entryForm, room: e.target.value })} style={{ maxWidth: 110 }} />
            <input className="form-input" placeholder="Teacher's User ID (optional)" value={entryForm.teacher} onChange={(e) => setEntryForm({ ...entryForm, teacher: e.target.value })} style={{ maxWidth: 160 }} />
            <button type="submit" className="btn btn-primary">Add Slot</button>
          </form>
          <Table
            headers={['Day', 'Time', 'Subject', 'Teacher', 'Room', 'Action']}
            rows={timetable.map((t) => [
              DOW_LABEL[t.dayOfWeek], `${t.startTime}–${t.endTime}`, t.subject, t.teacher?.fullName || '—', t.room || '—',
              <button className="btn" style={{ padding: '5px 12px', fontSize: '0.78rem', background: 'var(--sand-line)', color: 'var(--ink)' }} onClick={() => removeEntry(t._id)}>Remove</button>
            ])}
            empty="No timetable entries for this section yet."
          />
        </>
      )}
    </div>
  );
}

function InstitutionSummary() {
  const [list, setList] = useState(null);
  const [report, setReport] = useState(null);
  useEffect(() => { apiRequest('/institutions/mine/list').then(setList).catch(() => setList([])); }, []);
  useEffect(() => {
    const primary = list?.[0];
    if (primary) apiRequest(`/institutions/${primary._id}/reports`).then(setReport).catch(() => setReport(null));
  }, [list]);
  const primary = list?.[0];
  return (
    <SummaryRow items={[
      { label: 'My Institutions', value: list?.length, icon: FaSchool, detail: 'Registered by you' },
      { label: 'Verification', value: primary ? primary.verificationStatus : '—', icon: FaClipboardCheck, detail: primary ? primary.name : 'Register an institution' },
      { label: 'Students', value: report?.studentsCount ?? null, icon: FaUsers, detail: report ? 'Enrolled' : 'Register an institution' },
      { label: 'Teachers', value: report?.teachersCount ?? null, icon: FaChalkboardUser, detail: report ? 'Active' : 'Register an institution' }
    ]} />
  );
}

// ---------------------------------------------------------------- Employer

function EmployerWorkspace({ tab, user, onFlash, onChanged }) {
  if (tab === 'profile') return <><ProfilePanel user={user} onFlash={onFlash} onChanged={onChanged} /><RolesPanel onFlash={onFlash} onChanged={onChanged} /><SupportComplaintPanel onFlash={onFlash} /></>;
  if (tab === 'summary') return <EmployerSummary />;
  if (tab === 'post') return <EmployerPostJobPanel onFlash={onFlash} />;
  if (tab === 'jobs') return <EmployerJobsPanel onFlash={onFlash} />;
  return <ComingSoon label={tab} />;
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

const JOB_TYPES = ['full_time', 'part_time', 'remote', 'hybrid', 'internship', 'freelance', 'government', 'ngo'];

function EmployerPostJobPanel({ onFlash }) {
  const [form, setForm] = useState({
    title: '', company: '', type: 'full_time', country: '', city: '',
    salaryMin: '', salaryMax: '', experienceYears: '', education: '', skills: '', description: ''
  });

  async function submit(e) {
    e.preventDefault();
    try {
      await apiRequest('/jobs', {
        method: 'POST',
        body: {
          ...form,
          country: form.country.toUpperCase(),
          salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined,
          salaryMax: form.salaryMax ? Number(form.salaryMax) : undefined,
          experienceYears: form.experienceYears ? Number(form.experienceYears) : 0,
          skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean)
        }
      });
      onFlash('Job posted.', 'success');
      setForm({ title: '', company: '', type: 'full_time', country: '', city: '', salaryMin: '', salaryMax: '', experienceYears: '', education: '', skills: '', description: '' });
    } catch (err) { onFlash(err.message); }
  }

  return (
    <form onSubmit={submit} className="space-y-3 max-w-lg">
      <input className="form-input" placeholder="Job title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
      <input className="form-input" placeholder="Company name" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} required />
      <select className="form-select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
        {JOB_TYPES.map((t) => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
      </select>
      <div className="flex gap-3">
        <input className="form-input" placeholder="Country code (e.g. PK)" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} required />
        <input className="form-input" placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
      </div>
      <div className="flex gap-3">
        <input className="form-input" type="number" placeholder="Salary min" value={form.salaryMin} onChange={(e) => setForm({ ...form, salaryMin: e.target.value })} />
        <input className="form-input" type="number" placeholder="Salary max" value={form.salaryMax} onChange={(e) => setForm({ ...form, salaryMax: e.target.value })} />
        <input className="form-input" type="number" placeholder="Years experience" value={form.experienceYears} onChange={(e) => setForm({ ...form, experienceYears: e.target.value })} />
      </div>
      <input className="form-input" placeholder="Education required" value={form.education} onChange={(e) => setForm({ ...form, education: e.target.value })} />
      <input className="form-input" placeholder="Skills (comma separated)" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} />
      <textarea className="form-input" placeholder="Job description" rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      <button type="submit" className="btn btn-primary">Post Job</button>
    </form>
  );
}

function EmployerJobsPanel({ onFlash }) {
  const [jobs, setJobs] = useState([]);
  const [openJob, setOpenJob] = useState(null);
  const [applicants, setApplicants] = useState([]);

  function load() {
    apiRequest('/jobs/mine/list').then(setJobs).catch((err) => onFlash(err.message));
  }
  useEffect(load, []);

  function viewApplicants(jobId) {
    setOpenJob(jobId);
    apiRequest(`/jobs/${jobId}/applicants`).then(setApplicants).catch((err) => onFlash(err.message));
  }

  async function toggleStatus(job) {
    try {
      await apiRequest(`/jobs/${job._id}`, { method: 'PATCH', body: { status: job.status === 'open' ? 'closed' : 'open' } });
      onFlash(`Job ${job.status === 'open' ? 'closed' : 'reopened'}.`, 'success');
      load();
    } catch (err) { onFlash(err.message); }
  }

  async function setAppStatus(appId, status) {
    try {
      await apiRequest(`/jobs/applications/${appId}/status`, { method: 'PATCH', body: { status } });
      onFlash(`Applicant ${status}.`, 'success');
      viewApplicants(openJob);
    } catch (err) { onFlash(err.message); }
  }

  return (
    <div>
      <Table
        headers={['Title', 'Company', 'Type', 'Status', 'Action']}
        rows={jobs.map((j) => [
          j.title, j.company, j.type.replace('_', ' '), <Tag status={j.status === 'open' ? 'approved' : 'rejected'} />,
          <div className="flex gap-2">
            <button className="btn btn-primary" style={{ padding: '5px 12px', fontSize: '0.78rem' }} onClick={() => viewApplicants(j._id)}>Applicants</button>
            <button className="btn" style={{ padding: '5px 12px', fontSize: '0.78rem', background: 'var(--sand-line)', color: 'var(--ink)' }} onClick={() => toggleStatus(j)}>{j.status === 'open' ? 'Close' : 'Reopen'}</button>
          </div>
        ])}
        empty="You haven't posted any jobs yet."
      />
      {openJob && (
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Applicants</h3>
          <Table
            headers={['Name', 'Email', 'Status', 'Action']}
            rows={applicants.map((a) => [
              a.applicant?.fullName, a.applicant?.email, <Tag status={a.status === 'hired' ? 'approved' : a.status === 'rejected' ? 'rejected' : 'pending'} />,
              <select className="form-select" value={a.status} onChange={(e) => setAppStatus(a._id, e.target.value)} style={{ fontSize: '0.78rem', padding: '4px 8px' }}>
                {['pending', 'shortlisted', 'interview', 'rejected', 'hired'].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            ])}
            empty="No applicants yet."
          />
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------- Admin

function AdminWorkspace({ tab, user, roles, onFlash, onChanged }) {
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
  if (tab === 'summary' || tab === 'institutions_mgmt') return <AdminPanel onFlash={onFlash} />;
  if (tab === 'agents') return <AdminRolePanel onFlash={onFlash} role="education_agent" title="Agent Management" />;
  if (tab === 'donors') return <AdminDonorsPanel onFlash={onFlash} />;
  if (tab === 'complaints') return <AdminComplaintsPanel onFlash={onFlash} />;
  if (tab === 'security') return <AdminSecurityPanel onFlash={onFlash} />;
  if (tab === 'settings') return <AdminSettingsPanel onFlash={onFlash} />;
  if (tab === 'finance') return <AdminFinancePanel onFlash={onFlash} />;
  if (tab === 'analytics') return <AdminReportsPanel onFlash={onFlash} />;
  return <ComingSoon label={tab} />;
}

function AdminFinancePanel({ onFlash }) {
  const [data, setData] = useState(null);
  useEffect(() => { apiRequest('/admin/finance').then(setData).catch((err) => onFlash(err.message)); }, [onFlash]);

  if (!data) return <p role="status" className="admin-notice">Loading...</p>;

  const feeRow = (key, label) => <p className="text-sm">{label}: <strong>{data.fees[key]?.total || 0}</strong> ({data.fees[key]?.count || 0} records)</p>;
  const orderRow = (key, label) => <p className="text-sm">{label}: <strong>{data.marketplaceOrders[key]?.total || 0}</strong> ({data.marketplaceOrders[key]?.count || 0} orders)</p>;
  const payrollRow = (key, label) => <p className="text-sm">{label}: <strong>{data.payroll[key]?.total || 0}</strong> ({data.payroll[key]?.count || 0} payslips)</p>;

  return (
    <div>
      <h3 className="font-semibold mb-2">Financial Management</h3>
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
  useEffect(() => { apiRequest('/admin/reports').then(setData).catch((err) => onFlash(err.message)); }, [onFlash]);

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
          {Object.entries(data.usersByRole).map(([role, count]) => (
            <p key={role} className="text-sm">{role.replace(/_/g, ' ')}: <strong>{count}</strong></p>
          ))}
        </div>
        <div className="card" style={{ padding: 20 }}>
          <h4 className="font-semibold mb-3">Institutions by Verification Status</h4>
          {Object.entries(data.institutionsByStatus).map(([status, count]) => (
            <p key={status} className="text-sm">{status.replace(/_/g, ' ')}: <strong>{count}</strong></p>
          ))}
          <p className="text-sm mt-2">Scholarships open: <strong>{data.openScholarships}</strong> / {data.totalScholarships} total</p>
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
          u.fullName, u.email, <Tag status={u.status === 'active' ? 'approved' : 'rejected'} />, new Date(u.createdAt).toLocaleDateString(),
          <button className="btn" style={{ padding: '4px 12px', fontSize: '0.78rem' }} onClick={() => setStatus(u._id, u.status === 'active' ? 'suspended' : 'active')}>{u.status === 'active' ? 'Suspend' : 'Activate'}</button>
        ])}
        empty={`No users hold the ${role.replace('_', ' ')} role yet.`}
      />
    </div>
  );
}

function AdminDonorsPanel({ onFlash }) {
  const [sub, setSub] = useState('donors');
  const [scholarships, setScholarships] = useState(null);
  useEffect(() => { apiRequest('/scholarships/admin/all').then(setScholarships).catch((err) => onFlash(err.message)); }, [onFlash]);

  return (
    <div>
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
        headers={['Subject', 'By', 'Category', 'Status', 'Action']}
        rows={(complaints || []).map((c) => [
          c.subject, c.submittedBy?.fullName, c.category, <Tag status={c.status === 'resolved' ? 'approved' : c.status === 'dismissed' ? 'rejected' : 'pending'} />,
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

function AdminSettingsPanel({ onFlash }) {
  const [sub, setSub] = useState('countries');
  return (
    <div>
      <h3 className="font-semibold mb-2">Global Settings</h3>
      <nav className="cz-tabbar" style={{ marginBottom: 20 }}>
        {[{ key: 'countries', label: 'Countries' }, { key: 'languages', label: 'Languages' }, { key: 'currencies', label: 'Currencies' }, { key: 'features', label: 'Feature Toggles' }].map((t) => (
          <button key={t.key} type="button" aria-pressed={sub === t.key} className={`cz-tab${sub === t.key ? ' active' : ''}`} onClick={() => setSub(t.key)}>{t.label}</button>
        ))}
      </nav>
      {sub === 'countries' && <SettingsCollectionPanel onFlash={onFlash} kind="countries" fields={['name', 'code']} />}
      {sub === 'languages' && <SettingsCollectionPanel onFlash={onFlash} kind="languages" fields={['name', 'code']} />}
      {sub === 'currencies' && <SettingsCollectionPanel onFlash={onFlash} kind="currencies" fields={['name', 'code', 'symbol']} />}
      {sub === 'features' && <FeatureFlagsPanel onFlash={onFlash} />}
    </div>
  );
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
    <div className="admin-section admin-account-card" style={{ marginTop: 20 }}>
      <div className="admin-section-heading"><div><h2>My Roles</h2><p>Request access to another workspace.</p></div><FaUserShield aria-hidden="true" /></div>
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

function SupportComplaintPanel({ onFlash }) {
  const [complaints, setComplaints] = useState(null);
  const [form, setForm] = useState({ subject: '', category: 'other', description: '' });

  function load() { apiRequest('/complaints/mine').then(setComplaints).catch((err) => onFlash(err.message)); }
  useEffect(load, []);

  async function submit(e) {
    e.preventDefault();
    try {
      await apiRequest('/complaints', { method: 'POST', body: form });
      onFlash('Complaint submitted. Our team will review it.', 'success');
      setForm({ subject: '', category: 'other', description: '' });
      load();
    } catch (err) { onFlash(err.message); }
  }

  return (
    <div className="admin-section admin-account-card" style={{ marginTop: 20 }}>
      <div className="admin-section-heading"><div><h2>Report a Problem</h2><p>File a complaint for the platform team to review.</p></div><FaShieldHalved aria-hidden="true" /></div>
      <form onSubmit={submit} className="space-y-3 max-w-lg mb-6">
        <input className="form-input" placeholder="Subject" required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
        <select className="form-select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
          {['harassment', 'fraud', 'technical', 'billing', 'content', 'other'].map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <textarea className="form-input" placeholder="Describe the issue" rows={3} required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <button type="submit" className="btn btn-primary">Submit Complaint</button>
      </form>
      <Table
        loading={complaints === null}
        headers={['Subject', 'Category', 'Status', 'Filed']}
        rows={(complaints || []).map((c) => [c.subject, c.category, <Tag status={c.status === 'resolved' ? 'approved' : c.status === 'dismissed' ? 'rejected' : 'pending'} />, new Date(c.createdAt).toLocaleDateString()])}
        empty="You haven't filed any complaints."
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
          <div className="admin-stat" key={item.label}><div className="admin-stat-top"><span>{item.label}</span><span className="admin-stat-icon"><item.icon aria-hidden="true" /></span></div><strong>{item.value ?? '—'}</strong><p>{item.detail}</p></div>
        ))}
      </div>
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

// ---------------------------------------------------------------- Shared: Messages & Notifications

function MessagesPanel({ onFlash }) {
  const [conversations, setConversations] = useState(null);
  const [activeUser, setActiveUser] = useState(null);
  const [thread, setThread] = useState(null);
  const [text, setText] = useState('');
  const [newRecipientId, setNewRecipientId] = useState('');

  function loadConversations() {
    apiRequest('/messages/conversations').then(setConversations).catch((err) => onFlash(err.message));
  }
  useEffect(loadConversations, []);

  function openThread(u) {
    setActiveUser(u);
    setThread(null);
    apiRequest(`/messages/with/${u._id}`).then(setThread).catch((err) => onFlash(err.message));
    apiRequest(`/messages/with/${u._id}/read`, { method: 'PATCH' }).then(loadConversations).catch(() => {});
  }

  async function send(e) {
    e.preventDefault();
    const toId = activeUser?._id || newRecipientId.trim();
    if (!toId || !text.trim()) return;
    try {
      await apiRequest('/messages', { method: 'POST', body: { to: toId, text: text.trim() } });
      setText('');
      if (activeUser) {
        apiRequest(`/messages/with/${activeUser._id}`).then(setThread);
      } else {
        setNewRecipientId('');
        onFlash('Message sent.', 'success');
      }
      loadConversations();
    } catch (err) { onFlash(err.message); }
  }

  return (
    <div className="grid g2" style={{ gap: 24 }}>
      <div>
        <h3 className="font-semibold mb-2">Conversations</h3>
        {conversations === null && <p role="status" className="admin-notice">Loading...</p>}
        {conversations && conversations.length === 0 && <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>No conversations yet. Start one on the right using a User ID.</p>}
        <div className="dash-list">
          {(conversations || []).map((c) => (
            <div key={c.user._id} className={`dash-list-item${activeUser?._id === c.user._id ? ' unread' : ''}`} style={{ cursor: 'pointer' }} onClick={() => openThread(c.user)}>
              <span className="dash-list-icon c-forest" aria-hidden><FaUser size={14} /></span>
              <div className="dash-list-body"><div className="title">{c.user.fullName}{c.unread > 0 ? ` (${c.unread})` : ''}</div><div className="desc">{c.lastMessage}</div></div>
              <span className="dash-list-time">{new Date(c.lastAt).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="font-semibold mb-2">{activeUser ? activeUser.fullName : 'New Message'}</h3>
        {!activeUser && (
          <input className="form-input mb-3" placeholder="Recipient's User ID" value={newRecipientId} onChange={(e) => setNewRecipientId(e.target.value)} />
        )}
        {activeUser && (
          <div className="card reveal in" style={{ padding: '8px 12px', marginBottom: 12, maxHeight: 320, overflowY: 'auto' }}>
            {thread === null && <p role="status" className="admin-notice">Loading...</p>}
            {thread && thread.length === 0 && <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>No messages yet — say hello.</p>}
            {(thread || []).map((m) => (
              <div key={m._id} style={{ padding: '8px 4px', borderBottom: '1px solid var(--sand-line)' }}>
                <div style={{ fontSize: 13 }}>{m.text}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-soft)' }}>{new Date(m.createdAt).toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}
        <form onSubmit={send} className="flex gap-3 items-end">
          <input className="form-input" placeholder="Type a message..." value={text} onChange={(e) => setText(e.target.value)} required />
          <button type="submit" className="btn btn-primary">Send</button>
        </form>
      </div>
    </div>
  );
}

function NotificationsPanel({ onFlash }) {
  const [notifications, setNotifications] = useState(null);

  function load() {
    apiRequest('/notifications/mine').then(setNotifications).catch((err) => onFlash(err.message));
  }
  useEffect(load, []);

  async function markRead(id) {
    try { await apiRequest(`/notifications/${id}/read`, { method: 'PATCH' }); load(); } catch (err) { onFlash(err.message); }
  }
  async function markAllRead() {
    try { await apiRequest('/notifications/mine/read-all', { method: 'PATCH' }); load(); } catch (err) { onFlash(err.message); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Notifications</h3>
        <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.8rem', background: 'var(--sand-line)', color: 'var(--ink)' }} onClick={markAllRead}>Mark all read</button>
      </div>
      {notifications === null && <p role="status" className="admin-notice">Loading...</p>}
      {notifications && notifications.length === 0 && <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>No notifications yet.</p>}
      <div className="dash-list">
        {(notifications || []).map((n) => (
          <div key={n._id} className={`dash-list-item${!n.read ? ' unread' : ''}`} style={{ cursor: n.read ? 'default' : 'pointer' }} onClick={() => !n.read && markRead(n._id)}>
            <span className="dash-list-icon c-forest" aria-hidden><FaBell size={14} /></span>
            <div className="dash-list-body"><div className="title">{n.title}</div><div className="desc">{n.body}</div></div>
            <span className="dash-list-time">{new Date(n.createdAt).toLocaleDateString()}</span>
          </div>
        ))}
      </div>
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
