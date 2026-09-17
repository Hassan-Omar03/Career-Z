import {
  FaArrowUpRightFromSquare, FaBookmark, FaRegBookmark, FaCircle, FaXmark, FaShieldHalved, FaUsers, FaBuildingColumns, FaClipboardCheck, FaUser, FaUserShield,
  FaGauge, FaBuilding, FaChalkboardUser, FaBookOpen, FaClipboardList, FaAward, FaFileLines,
  FaGraduationCap, FaBriefcase, FaStore, FaWallet, FaSackDollar, FaSchool, FaChartLine,
  FaCalendarCheck, FaMoneyBillWave, FaHandshake, FaHourglassHalf, FaGear, FaBell, FaCommentDots, FaCircleQuestion, FaChevronDown,
  FaCartShopping, FaBoxOpen, FaBoxesStacked, FaTruck, FaStar, FaTriangleExclamation, FaQrcode, FaLock,
  FaEarthAmericas, FaDatabase, FaUserGear, FaNewspaper, FaWandMagicSparkles,
  FaUserGraduate, FaBed, FaKitMedical, FaCalendarDays, FaHeadset, FaRobot
} from 'react-icons/fa6';
import { Children, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../api/client';
import { verifyEmail, resendVerification } from '../api/auth';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import CampusTourViewer from '../components/CampusTourViewer';
import {
  OverviewStats, WalletCard, QuickActions,
  ProfileCompletion, MiniCalendar, RecommendedGrid, RecentActivity
} from '../components/dashboard/DashboardWidgets';

// Every workspace is a fully separate dashboard: its own sidebar menu, its
// own landing view, its own panels. Switching role switches all of it.
const STUDENT_PAGES = {
  courses: ['My Courses', 'Explore courses, continue learning and access your resources.', FaBookOpen],
  institutions: ['My Institutions', 'Connect with institutions and manage your academic journey.', FaBuilding],
  classes: ['My Classes', 'Your timetable, upcoming sessions and live classes in one place.', FaChalkboardUser],
  assignments: ['Assignments & Tests', 'Keep track of submissions, exams, attendance and results.', FaClipboardList],
  certificates: ['Certificates', 'Your achievements and verified learning credentials.', FaAward],
  applications: ['Applications', 'Follow your job, scholarship and admission applications.', FaFileLines],
  scholarships: ['Scholarships', 'Discover funding opportunities and track your applications.', FaGraduationCap],
  jobs: ['Jobs', 'Explore opportunities and take the next step in your career.', FaBriefcase],
  marketplace: ['Marketplace', 'Browse learning resources and manage your purchases.', FaStore],
  wallet: ['Wallet & Fees', 'Review your balance, transactions and academic fees.', FaWallet],
  profile: ['My Profile', 'Keep your personal details, academic profile and roles up to date.', FaUser],
  messages: ['Messages', 'Stay connected with your learning community.', FaCommentDots],
  notifications: ['Notifications', 'Updates and reminders that matter to you.', FaBell],
  calendar: ['Calendar', 'Plan your schedule around classes, deadlines and upcoming events.', FaCalendarCheck],
  settings: ['Account Settings', 'Manage your account preferences and security.', FaGear],
  help: ['Help Center', 'Find answers or get support with your account.', FaShieldHalved]
};

function StudentPageHeading({ page }) {
  const [title, description, Icon] = STUDENT_PAGES[page] || ['Student workspace', 'Your learning journey.', FaGraduationCap];
  return <header className="student-page-heading"><div><span className="eyebrow">STUDENT WORKSPACE</span><h1>{title}</h1><p>{description}</p></div><span className="student-page-symbol"><Icon aria-hidden="true" /></span></header>;
}

const WORKSPACES = {
  student: {
    label: 'Student', roles: ['student'], color: 'var(--forest)',
    greeting: 'Ready to keep learning?',
    nav: [
      { key: 'summary', label: 'Dashboard', icon: FaGauge },
      { key: 'profile', label: 'My Profile', icon: FaUser },
      { key: 'institutions', label: 'My Institutions', icon: FaBuilding },
      { key: 'classes', label: 'My Classes', icon: FaChalkboardUser },
      { key: 'courses', label: 'My Courses', icon: FaBookOpen },
      { key: 'assignments', label: 'Assignments & Tests', icon: FaClipboardList },
      { key: 'learningAnalytics', label: 'Learning Analytics', icon: FaChartLine },
      { key: 'certificates', label: 'Certificates', icon: FaAward },
      { key: 'digitalLocker', label: 'Digital Locker', icon: FaLock },
      { key: 'studentId', label: 'Digital Student ID', icon: FaQrcode },
      { key: 'applications', label: 'Applications', icon: FaFileLines },
      { key: 'scholarships', label: 'Scholarships', icon: FaGraduationCap },
      { key: 'jobs', label: 'Jobs', icon: FaBriefcase },
      { key: 'marketplace', label: 'Marketplace', icon: FaStore },
      { key: 'wallet', label: 'Wallet', icon: FaWallet },
      { key: 'goals', label: 'Goals & Achievements', icon: FaAward },
      { key: 'community', label: 'Study Groups', icon: FaUsers },
      { key: 'campusLife', label: 'Campus Life', icon: FaNewspaper }
    ]
  },
  teacher: {
    label: 'Teacher', roles: ['teacher'], color: 'var(--gold)',
    greeting: "Here's your teaching workspace.",
    nav: [
      { key: 'summary', label: 'Dashboard', icon: FaGauge },
      { key: 'teacherProfile', label: 'Teacher Profile', icon: FaChalkboardUser },
      { key: 'timetable', label: 'Timetable', icon: FaCalendarCheck },
      { key: 'courses', label: 'My Classes', icon: FaBookOpen },
      { key: 'students', label: 'Students List', icon: FaUsers },
      { key: 'attendance', label: 'Student Attendance', icon: FaClipboardList },
      { key: 'myAttendance', label: 'My Attendance', icon: FaClipboardCheck },
      { key: 'homework', label: 'Homework / Assignments', icon: FaFileLines },
      { key: 'examination', label: 'Examinations', icon: FaAward },
      { key: 'results', label: 'Results / Grades', icon: FaChartLine },
      { key: 'materialUpload', label: 'Learning Material Upload', icon: FaFileLines },
      { key: 'liveClasses', label: 'Live Classes', icon: FaChalkboardUser },
      { key: 'studentCommunication', label: 'Student Communication', icon: FaCommentDots },
      { key: 'ptm', label: 'Parent-Teacher Meeting', icon: FaHandshake },
      { key: 'engagement', label: 'Class Engagement', icon: FaCommentDots },
      { key: 'earnings', label: 'Salary & Finance', icon: FaSackDollar },
      { key: 'performance', label: 'Performance Overview', icon: FaChartLine },
      { key: 'resourceLibrary', label: 'Resource Library', icon: FaFileLines },
      { key: 'aiAssistant', label: 'AI Teacher Assistant', icon: FaGauge },
      { key: 'aiCreative', label: 'AI Creative Teacher', icon: FaGauge },
      { key: 'advancedControl', label: 'Advanced Class Control', icon: FaGauge },
      { key: 'profile', label: 'Personal Information', icon: FaUser }
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
      { key: 'homework', label: 'Homework / Assignments', icon: FaFileLines },
      { key: 'examSchedule', label: 'Exam Schedule', icon: FaAward },
      { key: 'fees', label: 'Fee Management', icon: FaMoneyBillWave },
      { key: 'teacherMessages', label: 'Teacher Communication', icon: FaChalkboardUser },
      { key: 'ptm', label: 'Parent-Teacher Meeting', icon: FaHandshake },
      { key: 'timetable', label: "Child's Timetable", icon: FaClipboardList },
      { key: 'performance', label: 'Performance Overview', icon: FaChartLine },
      { key: 'institutionInfo', label: 'School/Institution Info', icon: FaBuilding },
      { key: 'portfolio', label: 'Digital Portfolio', icon: FaFileLines },
      { key: 'health', label: 'Health Record', icon: FaClipboardCheck },
      { key: 'permissions', label: 'Permissions & Consent', icon: FaShieldHalved },
      { key: 'wallet', label: 'Wallet / Payment Records', icon: FaWallet },
      { key: 'profile', label: 'Personal Information', icon: FaUser }
    ]
  },
  institution: {
    label: 'Institution', roles: ['institution_owner', 'academy_owner', 'institution_staff'], color: 'var(--forest-deep)',
    greeting: 'Manage your institution here.',
    nav: [
      { key: 'summary', label: 'Dashboard', icon: FaGauge },
      { key: 'institution', label: 'My Institution', icon: FaSchool },
      { key: 'admissions', label: 'Admission Management', icon: FaUserGraduate },
      { key: 'staff', label: 'Staff Management', icon: FaUsers },
      { key: 'teachers', label: 'Teacher Management', icon: FaChalkboardUser },
      { key: 'students', label: 'Student Management', icon: FaUsers },
      { key: 'classes', label: 'Classes & Timetable', icon: FaClipboardList },
      { key: 'attendance', label: 'Attendance Management', icon: FaCalendarCheck },
      { key: 'fees', label: 'Fee Management', icon: FaSackDollar },
      { key: 'payroll', label: 'Payroll', icon: FaMoneyBillWave },
      { key: 'examination', label: 'Examination Management', icon: FaAward },
      { key: 'certificates', label: 'Certificates & Degrees', icon: FaGraduationCap },
      { key: 'library', label: 'Library Management', icon: FaBookOpen },
      { key: 'hostel', label: 'Hostel Management', icon: FaBed },
      { key: 'transport', label: 'Transport Management', icon: FaTruck },
      { key: 'inventory', label: 'Inventory Management', icon: FaBoxesStacked },
      { key: 'health', label: 'Medical & Health', icon: FaKitMedical },
      { key: 'events', label: 'Events & Activities', icon: FaCalendarDays },
      { key: 'helpdesk', label: 'Complaint & Help Desk', icon: FaHeadset },
      { key: 'aiAssistant', label: 'AI Operations Assistant', icon: FaRobot },
      { key: 'reports', label: 'Reports', icon: FaChartLine },
      { key: 'communication', label: 'Communication Center', icon: FaBell },
      { key: 'campusLife', label: 'Newsletter & Magazine', icon: FaNewspaper },
      { key: 'campusTour', label: 'Virtual Campus Tour', icon: FaSchool },
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
      { key: 'worldmap', label: 'World Map', icon: FaEarthAmericas },
      { key: 'institutions_mgmt', label: 'Institution Management', icon: FaBuildingColumns },
      { key: 'agents', label: 'Agent Management', icon: FaUsers },
      { key: 'donors', label: 'Donor Management', icon: FaHandshake },
      { key: 'staff', label: 'Staff Management', icon: FaUserGear },
      { key: 'finance', label: 'Financial Management', icon: FaSackDollar },
      { key: 'complaints', label: 'Complaint Management', icon: FaClipboardList },
      { key: 'security', label: 'Security & Monitoring', icon: FaShieldHalved },
      { key: 'cms', label: 'Content (Pages & Blog)', icon: FaNewspaper },
      { key: 'backups', label: 'Backups & Maintenance', icon: FaDatabase },
      { key: 'aiInsights', label: 'AI Insights', icon: FaWandMagicSparkles },
      { key: 'settings', label: 'Global Settings', icon: FaGear },
      { key: 'analytics', label: 'Reports', icon: FaChartLine },
      { key: 'profile', label: 'Profile', icon: FaUser }
    ]
  },
  donor: {
    label: 'Donor', roles: ['donor'], color: 'var(--emerald)',
    greeting: 'Manage the scholarships you fund.',
    nav: [
      { key: 'summary', label: 'Dashboard', icon: FaGauge },
      { key: 'profile', label: 'Donor Profile', icon: FaUser },
      { key: 'donorVerification', label: 'Verification/Documents', icon: FaClipboardCheck },
      { key: 'post', label: 'Post a Scholarship', icon: FaFileLines },
      { key: 'scholarships', label: 'My Scholarships', icon: FaGraduationCap },
      { key: 'opportunities', label: 'Explore Opportunities', icon: FaHandshake },
      { key: 'recommendedFunding', label: 'Recommended Requests', icon: FaClipboardCheck },
      { key: 'fundingApplications', label: 'Funding Applications', icon: FaFileLines },
      { key: 'donationHistory', label: 'My Donations', icon: FaWallet },
      { key: 'activeSponsorships', label: 'Active Sponsorships', icon: FaMoneyBillWave },
      { key: 'sponsoredStudents', label: 'Sponsored Students', icon: FaGraduationCap },
      { key: 'savedOpportunities', label: 'Saved Opportunities', icon: FaHourglassHalf },
      { key: 'impactReports', label: 'Impact Reports', icon: FaClipboardList },
      { key: 'wallet', label: 'Wallet & Payments', icon: FaWallet },
      { key: 'receipts', label: 'Receipts', icon: FaSackDollar },
      { key: 'donorMessages', label: 'Messages', icon: FaCommentDots },
      { key: 'donorNotifications', label: 'Notifications', icon: FaBell },
      { key: 'donorRecentActivity', label: 'Recent Activity', icon: FaCalendarCheck }
    ]
  },
  marketplace_seller: {
    label: 'Seller', roles: ['marketplace_seller'], color: 'var(--gold)',
    greeting: 'Manage your marketplace listings and orders.',
    nav: [
      { key: 'summary', label: 'Dashboard', icon: FaGauge },
      { key: 'profile', label: 'Seller/Store Profile', icon: FaUser },
      { key: 'sellerVerification', label: 'Verification/Documents', icon: FaClipboardCheck },
      { key: 'addListing', label: 'Add New Listing', icon: FaFileLines },
      { key: 'listings', label: 'Products/Listings', icon: FaStore },
      { key: 'services', label: 'Services', icon: FaBriefcase },
      { key: 'orders', label: 'Orders', icon: FaClipboardList },
      { key: 'inventory', label: 'Inventory', icon: FaSackDollar },
      { key: 'returnsRefunds', label: 'Returns & Refunds', icon: FaHourglassHalf },
      { key: 'salesAnalytics', label: 'Sales Analytics', icon: FaChartLine },
      { key: 'earningsCommission', label: 'Earnings & Commission', icon: FaMoneyBillWave },
      { key: 'sellerWallet', label: 'Wallet & Transactions', icon: FaWallet },
      { key: 'withdrawals', label: 'Withdrawals', icon: FaWallet },
      { key: 'sellerReviews', label: 'Reviews & Ratings', icon: FaAward },
      { key: 'sellerMessages', label: 'Messages', icon: FaCommentDots },
      { key: 'sellerNotifications', label: 'Notifications', icon: FaBell }
    ]
  },
  education_agent: {
    label: 'Agent', roles: ['education_agent'], color: 'var(--gold)',
    greeting: 'Manage the job placements you handle for your clients.',
    nav: [
      { key: 'summary', label: 'Dashboard', icon: FaGauge },
      { key: 'profile', label: 'Agent Profile', icon: FaUser },
      { key: 'post', label: 'Post a Job', icon: FaFileLines },
      { key: 'jobs', label: 'My Job Posts', icon: FaBriefcase },
      { key: 'candidates', label: 'Applications', icon: FaUsers },
      { key: 'recommended', label: 'Candidates', icon: FaClipboardCheck },
      { key: 'shortlisted', label: 'Shortlisted Candidates', icon: FaClipboardCheck },
      { key: 'interviews', label: 'Interviews', icon: FaCalendarCheck },
      { key: 'hires', label: 'Successful Hires', icon: FaHandshake },
      { key: 'commission', label: 'Commissions', icon: FaMoneyBillWave },
      { key: 'wallet', label: 'Wallet & Transactions', icon: FaMoneyBillWave },
      { key: 'agentMessages', label: 'Messages', icon: FaCommentDots },
      { key: 'agentNotifications', label: 'Notifications', icon: FaBell },
      { key: 'agentVerification', label: 'Verification/Documents', icon: FaClipboardCheck }
    ]
  }
};

const WORKSPACE_PRIORITY = ['admin', 'institution', 'employer', 'education_agent', 'donor', 'marketplace_seller', 'teacher', 'parent', 'student'];

// A limited view of the 'institution' workspace for staff whose Institution.staff.role is
// "representative" — no payroll/finance/full-staff-management, per the spec's explicit note
// that Representatives don't get Admin's full access.
const REPRESENTATIVE_WORKSPACE = {
  label: 'Representative', roles: ['institution_staff'], color: 'var(--forest-deep)',
  greeting: 'Guide prospective students through admissions.',
  nav: [
    { key: 'summary', label: 'Dashboard', icon: FaGauge },
    { key: 'profile', label: 'My Profile', icon: FaUser },
    { key: 'inquiries', label: 'Student Inquiries', icon: FaClipboardList },
    { key: 'applications', label: 'Applications', icon: FaFileLines },
    { key: 'assignedStudents', label: 'Assigned Students', icon: FaUsers },
    { key: 'meetings', label: 'Meetings / Consultations', icon: FaHandshake },
    { key: 'repMessages', label: 'Messages', icon: FaCommentDots },
    { key: 'followUps', label: 'Follow-ups', icon: FaClipboardCheck },
    { key: 'programs', label: 'Programs & Courses', icon: FaBookOpen },
    { key: 'admissionsInfo', label: 'Admissions Information', icon: FaGraduationCap },
    { key: 'repScholarships', label: 'Scholarships', icon: FaAward },
    { key: 'virtualFair', label: 'Virtual Fair', icon: FaChalkboardUser },
    { key: 'documents', label: 'Documents / Resources', icon: FaFileLines }
  ]
};

function Tag({ status, label }) {
  const styles = {
    pending: 'bg-amber-100 text-amber-800',
    approved: 'bg-emerald-100 text-emerald-800',
    rejected: 'bg-rose-100 text-rose-800',
    under_review: 'bg-indigo-100 text-indigo-800'
  };
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${styles[status] || 'bg-gray-100 text-gray-700'}`}>{label ?? status}</span>;
}

// The single source of truth for job-application status coloring + human label —
// used everywhere a JobApplication.status value is rendered, so all 7 real statuses
// (Applied/Application Viewed/Shortlisted/Interview Scheduled/Selected/Rejected/Hired) show correctly.
const JOB_APP_STATUS = {
  pending: { tag: 'pending', label: 'Applied' },
  viewed: { tag: 'pending', label: 'Application Viewed' },
  shortlisted: { tag: 'pending', label: 'Shortlisted' },
  interview: { tag: 'pending', label: 'Interview Scheduled' },
  selected: { tag: 'pending', label: 'Selected' },
  rejected: { tag: 'rejected', label: 'Rejected' },
  hired: { tag: 'approved', label: 'Hired' }
};

const INTERVIEW_STATUS = {
  scheduled: { tag: 'pending', label: 'Scheduled' },
  completed: { tag: 'approved', label: 'Completed' },
  cancelled: { tag: 'rejected', label: 'Cancelled' }
};

// Applications Overview mixes Job/Scholarship/Institution/Course rows under one status field —
// Job rows carry the real 7-state JobApplication.status, everything else a simple pending/approved/rejected.
function overviewStatusDisplay(a) {
  if (a.type === 'Job') return JOB_APP_STATUS[a.status] || { tag: 'pending', label: a.status };
  const tag = a.status === 'rejected' ? 'rejected' : a.status === 'pending' ? 'pending' : 'approved';
  const label = tag === 'rejected' ? 'Rejected' : tag === 'pending' ? 'Pending' : 'Approved';
  return { tag, label };
}

function ComingSoon({ label, note }) {
  return (
    <div className="admin-notice" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <FaHourglassHalf aria-hidden="true" />
      <span><strong>{label}</strong> {note || "is on the roadmap for this workspace and isn't wired up to real data yet."}</span>
    </div>
  );
}

function PendingRoleBanner() {
  const [pending, setPending] = useState([]);
  useEffect(() => {
    apiRequest('/roles/my-requests').then((list) => {
      setPending(list.filter((r) => r.status === 'pending' || r.status === 'under_review'));
    }).catch(() => setPending([]));
  }, []);

  if (pending.length === 0) return null;

  return (
    <div className="admin-notice" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
      <FaHourglassHalf aria-hidden="true" />
      <span>
        Your <strong>{pending.map((r) => r.requestedRole.replace(/_/g, ' ')).join(', ')}</strong> dashboard is unlocked, but posting (jobs, scholarships,
        listings, courses) is locked until Super Admin verifies your account — check the Profile tab for status.
      </span>
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

// An Institute Representative is institution staff with a deliberately limited dashboard —
// no payroll/finance/full-staff-management access. `undefined` = not checked yet, `null` =
// not a representative anywhere, object = the institution + role they represent.
function useRepresentativeInfo(roles) {
  const [repInfo, setRepInfo] = useState(undefined);
  useEffect(() => {
    if (!roles.includes('institution_staff')) { setRepInfo(null); return; }
    apiRequest('/institutions/mine/staff-roles').then((list) => {
      setRepInfo(list.find((r) => r.role === 'representative') || null);
    }).catch(() => setRepInfo(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roles.join(',')]);
  return repInfo;
}

export default function Dashboard() {
  const { user, refreshProfile } = useAuth();
  const location = useLocation();
  const roles = user?.roles || [];
  const [msg, setMsg] = useState(null);
  const repInfo = useRepresentativeInfo(roles);
  const isRepOnly = !!repInfo && !roles.includes('institution_owner') && !roles.includes('academy_owner');

  const available = WORKSPACE_PRIORITY.filter((key) => WORKSPACES[key].roles.some((r) => roles.includes(r)));
  // Login's "Log in as" picker can request a specific workspace to open on directly,
  // overriding the usual priority order (admin > institution > ... > student).
  const requestedWorkspace = location.state?.workspace;
  const defaultWorkspace = (requestedWorkspace && available.includes(requestedWorkspace)) ? requestedWorkspace : (available[0] || 'student');

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

  const ws = (isRepOnly && activeWorkspace === 'institution') ? REPRESENTATIVE_WORKSPACE : (WORKSPACES[activeWorkspace] || WORKSPACES.student);
  const NAME_TITLES = new Set(['mr', 'mr.', 'mrs', 'mrs.', 'ms', 'ms.', 'miss', 'dr', 'dr.', 'prof', 'prof.', 'sir', 'madam']);
  const nameWords = (user?.fullName || '').split(' ').filter(Boolean);
  const firstName = nameWords.find((w) => !NAME_TITLES.has(w.toLowerCase())) || nameWords[0] || 'there';
  const SHARED_TAB_LABELS = { messages: 'Messages', notifications: 'Notifications', calendar: 'Calendar', settings: 'Settings', help: 'Help Center' };
  const SHARED_TABS = Object.keys(SHARED_TAB_LABELS);
  const activeTabLabel = SHARED_TAB_LABELS[activeTab] || ws.nav.find((t) => t.key === activeTab)?.label || ws.label;

  return (
    <DashboardLayout
      trail={[ws.label, activeTabLabel]}
      activeRole={activeWorkspace}
      navItems={ws.nav}
      activeKey={activeTab}
      onSelect={setActiveTab}
    >
      {activeWorkspace === 'student' && activeTab !== 'summary' ? <StudentPageHeading page={activeTab} /> : <div className={`admin-intro${activeWorkspace === 'student' && activeTab === 'summary' ? ' student-intro' : ''}`} style={{ borderInlineStart: `6px solid ${ws.color}`, paddingInlineStart: 20 }}>
        <div>
          <div className="eyebrow">{ws.label.toUpperCase()} WORKSPACE</div>
          <h1>Welcome back, {firstName}.</h1>
          <p>{ws.greeting}</p>
        </div>
        <span className="admin-access"><FaUserShield aria-hidden="true" />{ws.label}</span>
      </div>}

      <PendingRoleBanner />

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

      <div className={`workspace-content${activeWorkspace === 'student' ? ' student-page-content' : ''}`} data-page={activeTab} key={`${activeWorkspace}-${activeTab}`}>
        {activeTab === 'messages' && <MessagesPanel onFlash={flash} />}
        {activeTab === 'notifications' && <NotificationsPanel onFlash={flash} />}
        {activeTab === 'calendar' && <CalendarPanel onFlash={flash} />}
        {activeTab === 'settings' && <SettingsPanel user={user} onFlash={flash} onChanged={refreshProfile} />}
        {activeTab === 'help' && <HelpCenterPanel onFlash={flash} />}
        {!SHARED_TABS.includes(activeTab) && (
          <>
            {activeWorkspace === 'student' && <StudentWorkspace tab={activeTab} user={user} onFlash={flash} onChanged={refreshProfile} onNavigate={setActiveTab} />}
            {activeWorkspace === 'teacher' && <TeacherWorkspace tab={activeTab} user={user} onFlash={flash} onChanged={refreshProfile} onNavigate={setActiveTab} />}
            {activeWorkspace === 'parent' && <ParentWorkspace tab={activeTab} user={user} onFlash={flash} onChanged={refreshProfile} onNavigate={setActiveTab} />}
            {activeWorkspace === 'institution' && (isRepOnly
              ? <RepresentativeWorkspace tab={activeTab} user={user} onFlash={flash} onChanged={refreshProfile} onNavigate={setActiveTab} repInfo={repInfo} />
              : <InstitutionWorkspace tab={activeTab} user={user} onFlash={flash} onChanged={refreshProfile} />)}
            {activeWorkspace === 'employer' && <EmployerWorkspace tab={activeTab} user={user} onFlash={flash} onChanged={refreshProfile} />}
            {activeWorkspace === 'admin' && <AdminWorkspace tab={activeTab} user={user} roles={roles} onFlash={flash} onChanged={refreshProfile} />}
            {activeWorkspace === 'donor' && <DonorWorkspace tab={activeTab} user={user} onFlash={flash} onChanged={refreshProfile} onNavigate={setActiveTab} />}
            {activeWorkspace === 'marketplace_seller' && <SellerWorkspace tab={activeTab} user={user} onFlash={flash} onChanged={refreshProfile} onNavigate={setActiveTab} />}
            {activeWorkspace === 'education_agent' && <AgentWorkspace tab={activeTab} user={user} onFlash={flash} onChanged={refreshProfile} onNavigate={setActiveTab} />}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

// ---------------------------------------------------------------- Student

function StudentWorkspace({ tab, user, onFlash, onChanged, onNavigate }) {
  if (tab === 'profile') return <><ProfilePanel user={user} onFlash={onFlash} onChanged={onChanged} /><StudentAcademicProfilePanel onFlash={onFlash} onChanged={onChanged} /><RolesPanel onFlash={onFlash} onChanged={onChanged} /><SupportComplaintPanel onFlash={onFlash} /></>;
  if (tab === 'courses') return <StudentPanel onFlash={onFlash} />;
  if (tab === 'wallet') return <StudentFeesPanel onFlash={onFlash} />;
  if (tab === 'summary') return <StudentSummary onNavigate={onNavigate} user={user} />;
  if (tab === 'assignments') return <StudentAssignmentsPanel onFlash={onFlash} />;
  if (tab === 'classes') return <TimetableView onFlash={onFlash} url="/students/me/timetable" />;
  if (tab === 'jobs') return <StudentJobsPanel onFlash={onFlash} user={user} />;
  if (tab === 'certificates') return <StudentCertificatesPanel onFlash={onFlash} />;
  if (tab === 'digitalLocker') return <StudentDigitalLockerPanel onFlash={onFlash} />;
  if (tab === 'studentId') return <StudentDigitalIdPanel onFlash={onFlash} />;
  if (tab === 'learningAnalytics') return <StudentLearningAnalyticsPanel onFlash={onFlash} />;
  if (tab === 'goals') return <StudentGoalsAchievementsPanel onFlash={onFlash} />;
  if (tab === 'community') return <StudentCommunityPanel onFlash={onFlash} user={user} />;
  if (tab === 'scholarships') return <ScholarshipsPanel onFlash={onFlash} user={user} />;
  if (tab === 'marketplace') return <MarketplacePanel onFlash={onFlash} user={user} />;
  if (tab === 'institutions') return <StudentInstitutionsPanel onFlash={onFlash} />;
  if (tab === 'applications') return <StudentApplicationsPanel onFlash={onFlash} />;
  if (tab === 'campusLife') return <StudentCampusLifePanel onFlash={onFlash} />;
  return <ComingSoon label={tab} />;
}

// Every field here (dateOfBirth, program, currentTerm, guardianContact, careerGoal, skills,
// languages) was already accepted by PATCH /students/me on the backend but had no form
// anywhere in the UI to actually set it — this is that form.
function StudentCampusLifePanel({ onFlash }) {
  const [section, setSection] = useState('ask');
  const [myQuestions, setMyQuestions] = useState(null);
  const [askForm, setAskForm] = useState({ subject: '', question: '' });
  const [polls, setPolls] = useState(null);
  const [newsletters, setNewsletters] = useState(null);
  const [magazine, setMagazine] = useState(null);
  const [mySubmissions, setMySubmissions] = useState(null);
  const [subForm, setSubForm] = useState({ title: '', type: 'article', content: '' });

  function loadQuestions() { apiRequest('/anonymous-questions/mine').then(setMyQuestions).catch((err) => onFlash(err.message)); }
  function loadPolls() { apiRequest('/polls/available').then(setPolls).catch((err) => onFlash(err.message)); }
  function loadNewsletters() { apiRequest('/newsletters/published').then(setNewsletters).catch((err) => onFlash(err.message)); }
  function loadMagazine() { apiRequest('/magazine/published').then(setMagazine).catch((err) => onFlash(err.message)); }
  function loadMySubmissions() { apiRequest('/magazine/mine').then(setMySubmissions).catch((err) => onFlash(err.message)); }

  useEffect(() => {
    if (section === 'ask') loadQuestions();
    if (section === 'polls') loadPolls();
    if (section === 'newsletter') loadNewsletters();
    if (section === 'magazine') { loadMagazine(); loadMySubmissions(); }
  }, [section]);

  async function askQuestion(e) {
    e.preventDefault();
    try {
      await apiRequest('/anonymous-questions', { method: 'POST', body: askForm });
      onFlash('Question sent anonymously.', 'success');
      setAskForm({ subject: '', question: '' });
      loadQuestions();
    } catch (err) { onFlash(err.message); }
  }
  async function castVote(pollId, optionIndex) {
    try {
      await apiRequest(`/polls/${pollId}/vote`, { method: 'POST', body: { optionIndex } });
      onFlash('Vote recorded.', 'success');
      loadPolls();
    } catch (err) { onFlash(err.message); }
  }
  async function submitToMagazine(e) {
    e.preventDefault();
    try {
      await apiRequest('/magazine', { method: 'POST', body: subForm });
      onFlash('Submitted for review.', 'success');
      setSubForm({ title: '', type: 'article', content: '' });
      loadMySubmissions();
    } catch (err) { onFlash(err.message); }
  }

  const TABS = [
    { key: 'ask', label: 'Ask Anonymously', icon: FaCommentDots },
    { key: 'polls', label: 'Quick Polls', icon: FaClipboardList },
    { key: 'newsletter', label: 'Newsletter', icon: FaNewspaper },
    { key: 'magazine', label: 'Magazine', icon: FaBookOpen }
  ];

  return (
    <div className="card" style={{ padding: 22 }}>
      <div className="flex items-center" style={{ gap: 12 }}>
        <span style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--forest)', color: '#fff', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
          <FaNewspaper aria-hidden="true" size={16} />
        </span>
        <div>
          <h3 className="font-semibold" style={{ margin: 0 }}>Campus Life</h3>
          <p className="text-xs" style={{ color: 'var(--ink-soft)', margin: '2px 0 0' }}>Ask questions, vote in polls and catch up on campus news.</p>
        </div>
      </div>

      <div className="flex gap-1 flex-wrap" style={{ margin: '18px 0 22px', padding: 5, background: 'var(--sand)', borderRadius: 14, width: 'fit-content' }}>
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setSection(key)}
            className="flex items-center"
            style={{
              gap: 8, padding: '9px 16px', fontSize: '0.8rem', fontWeight: 600, borderRadius: 10, border: 'none', cursor: 'pointer',
              background: section === key ? 'var(--forest)' : 'transparent',
              color: section === key ? '#fff' : 'var(--ink-soft)',
              transition: 'background .15s, color .15s'
            }}
          >
            <Icon aria-hidden="true" size={13} /> {label}
          </button>
        ))}
      </div>

      {section === 'ask' && (
        <div>
          <div className="flex items-start" style={{ gap: 10, marginBottom: 18, padding: 14, borderRadius: 12, background: 'var(--sand)' }}>
            <FaShieldHalved aria-hidden="true" size={15} style={{ color: 'var(--forest)', marginTop: 2, flexShrink: 0 }} />
            <p style={{ fontSize: 13, color: 'var(--ink-soft)', margin: 0 }}>Your name is never shown to teachers or your institution — only your question.</p>
          </div>
          <form onSubmit={askQuestion} style={{ display: 'grid', gap: 10, maxWidth: 460, marginBottom: 28, padding: 18, border: '1px solid var(--sand-line)', borderRadius: 14 }}>
            <input className="form-input" placeholder="Subject (optional)" value={askForm.subject} onChange={(e) => setAskForm({ ...askForm, subject: e.target.value })} />
            <textarea className="form-input" placeholder="Your question" rows={3} value={askForm.question} onChange={(e) => setAskForm({ ...askForm, question: e.target.value })} required />
            <button type="submit" className="btn btn-primary" style={{ justifySelf: 'start', padding: '9px 20px' }}>Ask Anonymously</button>
          </form>
          <h4 className="font-semibold mb-2" style={{ fontSize: '0.85rem' }}>My Questions</h4>
          <Table
            loading={myQuestions === null}
            headers={['Subject', 'Question', 'Status', 'Answer']}
            rows={(myQuestions || []).map((q) => [q.subject || '—', q.question, <Tag status={q.status === 'answered' ? 'approved' : 'pending'} />, q.answer || '—'])}
            empty="You haven't asked any questions yet."
          />
        </div>
      )}

      {section === 'polls' && (
        <div style={{ display: 'grid', gap: 12 }}>
          {polls === null && <p className="admin-notice">Loading...</p>}
          {polls?.length === 0 && <p className="admin-notice">No open polls right now.</p>}
          {(polls || []).map((p) => (
            <div key={p._id} style={{ padding: 18, border: '1px solid var(--sand-line)', borderRadius: 14 }}>
              <p className="font-medium" style={{ marginBottom: 12 }}>{p.question}</p>
              {p.myVote !== null ? (
                <p className="flex items-center text-sm" style={{ gap: 8, color: 'var(--forest)', fontWeight: 600, margin: 0 }}>
                  <FaClipboardCheck aria-hidden="true" size={13} /> You voted: {p.options[p.myVote]?.text}
                </p>
              ) : (
                <div className="flex gap-2 flex-wrap">
                  {p.options.map((o, i) => (
                    <button key={i} type="button" className="btn" style={{ padding: '7px 16px', fontSize: '0.8rem' }} onClick={() => castVote(p._id, i)}>{o.text}</button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {section === 'newsletter' && (
        <div style={{ display: 'grid', gap: 12 }}>
          {newsletters === null && <p className="admin-notice">Loading...</p>}
          {newsletters?.length === 0 && <p className="admin-notice">No newsletters published yet.</p>}
          {(newsletters || []).map((n) => (
            <div key={n._id} style={{ padding: 18, border: '1px solid var(--sand-line)', borderRadius: 14 }}>
              <p className="font-medium">{n.title}</p>
              <p className="text-xs" style={{ color: 'var(--ink-soft)', margin: '4px 0 8px' }}>{new Date(n.publishedAt).toLocaleDateString()}</p>
              <p className="text-sm" style={{ lineHeight: 1.6, margin: 0 }}>{n.content}</p>
            </div>
          ))}
        </div>
      )}

      {section === 'magazine' && (
        <div>
          <h4 className="font-semibold mb-2" style={{ fontSize: '0.85rem' }}>Submit Your Work</h4>
          <form onSubmit={submitToMagazine} style={{ display: 'grid', gap: 10, maxWidth: 460, marginBottom: 28, padding: 18, border: '1px solid var(--sand-line)', borderRadius: 14 }}>
            <input className="form-input" placeholder="Title" value={subForm.title} onChange={(e) => setSubForm({ ...subForm, title: e.target.value })} required />
            <CustomSelect
              value={subForm.type} onChange={(v) => setSubForm({ ...subForm, type: v })} ariaLabel="Submission type" minWidth="100%"
              options={['article', 'poetry', 'artwork', 'story', 'other'].map((t) => ({ value: t, label: t.charAt(0).toUpperCase() + t.slice(1) }))}
            />
            <textarea className="form-input" placeholder="Your work" rows={4} value={subForm.content} onChange={(e) => setSubForm({ ...subForm, content: e.target.value })} required />
            <button type="submit" className="btn btn-primary" style={{ justifySelf: 'start', padding: '9px 20px' }}>Submit</button>
          </form>
          <h4 className="font-semibold mb-2" style={{ fontSize: '0.85rem' }}>My Submissions</h4>
          <Table
            loading={mySubmissions === null}
            headers={['Title', 'Type', 'Status']}
            rows={(mySubmissions || []).map((s) => [s.title, s.type, <Tag status={s.status === 'published' ? 'approved' : s.status === 'rejected' ? 'rejected' : s.status === 'selected' ? 'approved' : 'pending'} label={s.status} />])}
            empty="You haven't submitted anything yet."
          />
          <h4 className="font-semibold mt-6 mb-2" style={{ fontSize: '0.85rem' }}>Latest Issue</h4>
          {magazine?.length === 0 && <p className="admin-notice">Nothing published yet.</p>}
          <div style={{ display: 'grid', gap: 12 }}>
            {(magazine || []).map((m) => (
              <div key={m._id} style={{ padding: 18, border: '1px solid var(--sand-line)', borderRadius: 14 }}>
                <p className="font-medium">{m.title}</p>
                <p className="text-xs" style={{ color: 'var(--ink-soft)', margin: '4px 0 8px' }}>By {m.student?.fullName || 'A student'} · {m.type}</p>
                <p className="text-sm" style={{ lineHeight: 1.6, margin: 0 }}>{m.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StudentAcademicProfilePanel({ onFlash, onChanged }) {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  function load() {
    apiRequest('/students/me').then((p) => {
      setProfile(p);
      setForm({
        dateOfBirth: p.dateOfBirth ? p.dateOfBirth.slice(0, 10) : '',
        program: p.program || '',
        currentTerm: p.currentTerm || '',
        guardianContact: p.guardianContact || '',
        careerGoal: p.careerGoal || '',
        skills: (p.skills || []).join(', '),
        languages: (p.languages || []).join(', ')
      });
    }).catch((err) => onFlash(err.message));
  }
  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await apiRequest('/students/me', {
        method: 'PATCH',
        body: {
          dateOfBirth: form.dateOfBirth || null,
          program: form.program,
          currentTerm: form.currentTerm,
          guardianContact: form.guardianContact,
          careerGoal: form.careerGoal,
          skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
          languages: form.languages.split(',').map((s) => s.trim()).filter(Boolean)
        }
      });
      onFlash('Academic profile updated.', 'success');
      onChanged?.();
      load();
    } catch (err) { onFlash(err.message); } finally { setSaving(false); }
  }

  if (!profile || !form) return <p role="status" className="admin-notice">Loading...</p>;

  return (
    <div className="admin-section admin-account-card" style={{ marginTop: 20 }}>
      <div className="admin-section-heading"><div><h2>Academic Profile</h2><p>Program, term, date of birth and other details shown across your dashboard.</p></div><FaUser aria-hidden="true" /></div>
      <form onSubmit={submit} className="space-y-3 max-w-lg">
        <label className="block text-xs" style={{ color: 'var(--ink-soft)' }}>Date of Birth
          <input type="date" className="form-input" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
        </label>
        <label className="block text-xs" style={{ color: 'var(--ink-soft)' }}>Program
          <input className="form-input" placeholder="e.g. BS Computer Science" value={form.program} onChange={(e) => setForm({ ...form, program: e.target.value })} />
        </label>
        <label className="block text-xs" style={{ color: 'var(--ink-soft)' }}>Current Semester/Term
          <input className="form-input" placeholder="e.g. Fall 2026" value={form.currentTerm} onChange={(e) => setForm({ ...form, currentTerm: e.target.value })} />
        </label>
        <label className="block text-xs" style={{ color: 'var(--ink-soft)' }}>Guardian Contact
          <input className="form-input" placeholder="Phone or email" value={form.guardianContact} onChange={(e) => setForm({ ...form, guardianContact: e.target.value })} />
        </label>
        <label className="block text-xs" style={{ color: 'var(--ink-soft)' }}>Career Goal
          <input className="form-input" placeholder="e.g. Software Engineer" value={form.careerGoal} onChange={(e) => setForm({ ...form, careerGoal: e.target.value })} />
        </label>
        <label className="block text-xs" style={{ color: 'var(--ink-soft)' }}>Skills (comma separated)
          <input className="form-input" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} />
        </label>
        <label className="block text-xs" style={{ color: 'var(--ink-soft)' }}>Languages (comma separated)
          <input className="form-input" value={form.languages} onChange={(e) => setForm({ ...form, languages: e.target.value })} />
        </label>
        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Academic Profile'}</button>
      </form>
    </div>
  );
}

function StudentInstitutionsPanel({ onFlash }) {
  const [profile, setProfile] = useState(null);
  const [options, setOptions] = useState([]);
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState('');
  const [inquiryForm, setInquiryForm] = useState({ interestedProgram: '', qualification: '', country: '', message: '' });
  const [appForm, setAppForm] = useState({ program: '' });
  const [fairs, setFairs] = useState([]);
  const [registeredFairIds, setRegisteredFairIds] = useState([]);

  function load() { apiRequest('/students/me').then(setProfile).catch((err) => onFlash(err.message)); }
  useEffect(load, []);

  function search() {
    apiRequest(`/institutions${q ? `?q=${encodeURIComponent(q)}` : ''}`).then(setOptions).catch((err) => onFlash(err.message));
  }
  useEffect(search, []);

  useEffect(() => {
    apiRequest('/virtual-fairs').then(setFairs).catch(() => {});
    apiRequest('/virtual-fairs/mine/registered').then((list) => setRegisteredFairIds(list.map((f) => f._id))).catch(() => {});
  }, []);

  async function connect() {
    if (!selected) return;
    try {
      await apiRequest('/students/me/connect-institution', { method: 'POST', body: { institutionId: selected } });
      onFlash('Connected to institution.', 'success');
      load();
    } catch (err) { onFlash(err.message); }
  }

  async function submitInquiry(e) {
    e.preventDefault();
    if (!selected) return onFlash('Select an institution first.');
    try {
      await apiRequest('/inquiries', { method: 'POST', body: { institution: selected, ...inquiryForm } });
      onFlash('Inquiry sent — a representative will respond soon.', 'success');
      setInquiryForm({ interestedProgram: '', qualification: '', country: '', message: '' });
    } catch (err) { onFlash(err.message); }
  }

  async function submitApplication(e) {
    e.preventDefault();
    if (!selected) return onFlash('Select an institution first.');
    try {
      await apiRequest('/institution-applications', { method: 'POST', body: { institution: selected, program: appForm.program, submit: true } });
      onFlash('Application submitted.', 'success');
      setAppForm({ program: '' });
    } catch (err) { onFlash(err.message); }
  }

  async function registerFair(id) {
    try { await apiRequest(`/virtual-fairs/${id}/register`, { method: 'POST' }); setRegisteredFairIds((p) => [...p, id]); onFlash('Registered for the fair.', 'success'); } catch (err) { onFlash(err.message); }
  }

  if (!profile) return <p role="status" className="admin-notice">Loading...</p>;

  return (
    <div>
      <h3 className="font-semibold mb-2">My Institution</h3>
      {profile.primaryInstitution ? (
        <div className="border border-[var(--sand-line)] rounded-xl p-4 mb-6" style={{ maxWidth: 420 }}>
          <strong>{profile.primaryInstitution.name}</strong>
          <p className="text-xs text-[var(--ink-soft)]">{profile.primaryInstitution.type} · {profile.primaryInstitution.country}</p>
          {profile.classSection?.name && <p className="text-xs mt-1">Class / Grade: {profile.classSection.name}{profile.classSection.academicYear ? ` (${profile.classSection.academicYear})` : ''}</p>}
          {profile.rollNumber && <p className="text-xs mt-1">Roll No: {profile.rollNumber}</p>}
        </div>
      ) : (
        <div className="border border-[var(--sand-line)] rounded-xl p-4 mb-6" style={{ maxWidth: 420 }}>
          <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>You are not connected to an institution yet.</p>
        </div>
      )}

      <h4 className="font-semibold mb-2">Connect to an Institution</h4>
      <div className="border border-[var(--sand-line)] rounded-xl p-3 mb-6">
        <form onSubmit={(e) => { e.preventDefault(); search(); }} className="flex gap-2 items-end flex-wrap" style={{ marginBottom: 12 }}>
          <input className="form-input" placeholder="Search institutions" value={q} onChange={(e) => setQ(e.target.value)} style={{ flex: '1 1 220px', minWidth: 0 }} />
          <button type="submit" className="btn" style={{ flexShrink: 0 }}>Search</button>
        </form>
        <div className="flex gap-2 items-end flex-wrap">
          <select className="form-select" value={selected} onChange={(e) => setSelected(e.target.value)} style={{ flex: '1 1 220px', minWidth: 0 }}>
            <option value="">Select an institution</option>
            {options.map((i) => <option key={i._id} value={i._id}>{i.name} ({i.country})</option>)}
          </select>
          <button type="button" className="btn btn-primary" onClick={connect} disabled={!selected} style={{ flexShrink: 0 }}>Connect</button>
        </div>
      </div>

      <h4 className="font-semibold mb-2">Ask a Representative (Inquiry)</h4>
      <form onSubmit={submitInquiry} className="mb-6 border border-[var(--sand-line)] rounded-xl p-3" style={{ display: 'grid', gap: 14 }}>
        <input className="form-input" placeholder="Interested program (required)" value={inquiryForm.interestedProgram} onChange={(e) => setInquiryForm({ ...inquiryForm, interestedProgram: e.target.value })} required />
        <div className="flex flex-wrap" style={{ gap: 14 }}>
          <input className="form-input" placeholder="Your qualification" value={inquiryForm.qualification} onChange={(e) => setInquiryForm({ ...inquiryForm, qualification: e.target.value })} style={{ flex: '1 1 220px', minWidth: 0 }} />
          <input className="form-input" placeholder="Your country" value={inquiryForm.country} onChange={(e) => setInquiryForm({ ...inquiryForm, country: e.target.value })} style={{ flex: '1 1 220px', minWidth: 0 }} />
        </div>
        <textarea className="form-input" placeholder="Message (optional)" rows={2} value={inquiryForm.message} onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })} />
        <button type="submit" className="btn btn-primary" disabled={!selected} style={{ justifySelf: 'start' }}>Send Inquiry</button>
      </form>

      <h4 className="font-semibold mb-2">Apply to a Program</h4>
      <form onSubmit={submitApplication} className="flex gap-2 items-end mb-6 flex-wrap border border-[var(--sand-line)] rounded-xl p-3">
        <input className="form-input" placeholder="Program name" value={appForm.program} onChange={(e) => setAppForm({ program: e.target.value })} required style={{ flex: '1 1 220px', minWidth: 0 }} />
        <button type="submit" className="btn btn-primary" disabled={!selected} style={{ flexShrink: 0 }}>Submit Application</button>
      </form>

      <h4 className="font-semibold mb-2">Upcoming Virtual Fairs</h4>
      {fairs.length === 0 && (
        <div className="border border-[var(--sand-line)] rounded-xl p-4">
          <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>No virtual fairs scheduled right now.</p>
        </div>
      )}
      <div style={{ display: 'grid', gap: 14 }}>
        {fairs.map((f) => {
          const isRegistered = registeredFairIds.includes(f._id);
          return (
            <div key={f._id} className="border border-[var(--sand-line)] rounded-xl p-4">
              <div className="flex items-center flex-wrap" style={{ gap: 8 }}>
                <strong className="text-sm">{f.title}</strong>
                <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>— {f.institution?.name}</span>
              </div>
              <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 8 }}>{new Date(f.scheduledDate).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</p>
              {f.description && <p className="text-xs" style={{ marginTop: 8 }}>{f.description}</p>}
              <div className="flex items-center flex-wrap" style={{ gap: 10, marginTop: 16 }}>
                {isRegistered ? <Tag status="approved" label="Registered" /> : <button type="button" className="btn" style={{ padding: '5px 14px', fontSize: '0.75rem' }} onClick={() => registerFair(f._id)}>Register</button>}
                {isRegistered && f.videoCallLink && <a className="btn btn-primary" style={{ padding: '5px 14px', fontSize: '0.75rem' }} href={f.videoCallLink} target="_blank" rel="noreferrer">Join Video Call</a>}
                {isRegistered && !f.videoCallLink && <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>Video call link not shared yet.</span>}
                {f.brochureUrl && <a className="btn" style={{ padding: '5px 14px', fontSize: '0.75rem' }} href={f.brochureUrl} target="_blank" rel="noreferrer">📄 Brochure</a>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StudentApplicationsPanel({ onFlash }) {
  const [jobApps, setJobApps] = useState(null);
  const [scholarshipApps, setScholarshipApps] = useState(null);
  const [profile, setProfile] = useState(null);
  const [enrollments, setEnrollments] = useState(null);
  const [programApps, setProgramApps] = useState(null);

  useEffect(() => {
    apiRequest('/jobs/mine/applications').then(setJobApps).catch((err) => onFlash(err.message));
    apiRequest('/scholarships/mine/applications').then(setScholarshipApps).catch((err) => onFlash(err.message));
    apiRequest('/students/me').then(setProfile).catch((err) => onFlash(err.message));
    apiRequest('/students/me/enrollments').then(setEnrollments).catch((err) => onFlash(err.message));
    apiRequest('/institution-applications/mine').then(setProgramApps).catch((err) => onFlash(err.message));
  }, [onFlash]);

  return (
    <div>
      <h3 className="font-semibold mb-2">Job Applications</h3>
      <Table
        loading={jobApps === null}
        headers={['Job', 'Company', 'Status', 'Applied']}
        rows={(jobApps || []).map((a) => [a.job?.title, a.job?.company, <Tag status={JOB_APP_STATUS[a.status]?.tag} label={JOB_APP_STATUS[a.status]?.label || a.status} />, new Date(a.createdAt).toLocaleDateString()])}
        empty="No job applications yet."
      />
      <h3 className="font-semibold mb-2 mt-6">Scholarship Applications</h3>
      <Table
        loading={scholarshipApps === null}
        headers={['Scholarship', 'Amount', 'Status', 'Applied']}
        rows={(scholarshipApps || []).map((a) => [a.scholarship?.title, `${a.scholarship?.currency || ''} ${a.scholarship?.amount ?? ''}`, <Tag status={a.status === 'approved' ? 'approved' : a.status === 'rejected' ? 'rejected' : 'pending'} />, new Date(a.createdAt).toLocaleDateString()])}
        empty="No scholarship applications yet."
      />

      <h3 className="font-semibold mb-2 mt-6">Program Applications</h3>
      <p className="text-xs mb-2" style={{ color: 'var(--ink-soft)' }}>Real admissions applications you submitted from My Institutions — reviewed by that institution's representatives.</p>
      <Table
        loading={programApps === null}
        headers={['Institution', 'Program', 'Status', 'Progress', 'Missing Documents']}
        rows={(programApps || []).map((a) => [a.institution?.name, a.program, <Tag status={a.status === 'accepted' ? 'approved' : a.status === 'rejected' ? 'rejected' : 'pending'} />, `${a.admissionProgress}%`, a.missingRequirements?.length ? a.missingRequirements.join(', ') : '—'])}
        empty="No program applications yet — go to My Institutions to apply."
      />

      <h3 className="font-semibold mb-2 mt-6">Institution Connection</h3>
      <p className="text-xs mb-2" style={{ color: 'var(--ink-soft)' }}>Connecting to an institution here is instant, so every connection shows as Accepted right away — there's no waiting period. This is separate from the formal Program Applications above.</p>
      <Table
        loading={profile === null}
        headers={['Institution', 'Status', 'Connected']}
        rows={profile?.primaryInstitution ? [[profile.primaryInstitution.name, <Tag status="approved" />, profile.admissionDate ? new Date(profile.admissionDate).toLocaleDateString() : '—']] : []}
        empty="Not connected to an institution yet — go to My Institutions to connect."
      />

      <h3 className="font-semibold mb-2 mt-6">Course Applications</h3>
      <p className="text-xs mb-2" style={{ color: 'var(--ink-soft)' }}>Enrolling in a free course here is instant — shown as Accepted, or Completed once you finish it.</p>
      <Table
        loading={enrollments === null}
        headers={['Course', 'Status', 'Enrolled']}
        rows={(enrollments || []).map((e) => [
          e.course?.title,
          <Tag status={e.status === 'completed' ? 'approved' : e.status === 'dropped' ? 'rejected' : 'approved'} />,
          e.enrolledAt ? new Date(e.enrolledAt).toLocaleDateString() : '—'
        ])}
        empty="No course enrollments yet — go to My Courses to enroll."
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

const DOCUMENT_CATEGORIES = [
  { value: 'degree', label: 'Degree' },
  { value: 'certificate', label: 'Certificate' },
  { value: 'national_id', label: 'National ID' },
  { value: 'passport', label: 'Passport' },
  { value: 'student_card', label: 'Student Card' },
  { value: 'experience_letter', label: 'Experience Letter' },
  { value: 'recommendation_letter', label: 'Recommendation Letter' },
  { value: 'award', label: 'Award' },
  { value: 'transcript', label: 'Transcript' },
  { value: 'research_paper', label: 'Research Paper' },
  { value: 'project', label: 'Project' },
  { value: 'other', label: 'Other' }
];
const DOCUMENT_CATEGORY_LABEL = Object.fromEntries(DOCUMENT_CATEGORIES.map((c) => [c.value, c.label]));

// Student sidebar — Digital Locker (spec Part 10.5): a lifetime document vault, separate from
// institution-issued Certificates. No file storage service is wired up — same paste-a-link
// pattern used everywhere else in the app (User.profilePhoto, Resume.cvFileUrl).
// No cloud storage (S3/Cloudinary) is connected anywhere in this app, so an uploaded file is
// stored as a base64 data URI on the document record itself (same as the profile-photo upload
// above). Images are resized/re-encoded to keep them small; other files (PDFs etc.) are read
// as-is but capped at 3MB raw so the base64-inflated body still fits the server's request-size
// limit — past that, the "paste a link" option (for a file already hosted somewhere) still works.
const LOCKER_MAX_FILE_BYTES = 3 * 1024 * 1024;
function readLockerFile(file) {
  if (file.type.startsWith('image/')) return resizeImageToDataUrl(file, 1200, 0.82);
  if (file.size > LOCKER_MAX_FILE_BYTES) {
    return Promise.reject(new Error(`That file is ${(file.size / (1024 * 1024)).toFixed(1)}MB — over the 3MB direct-upload limit. Host it somewhere and paste the link instead.`));
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read that file.'));
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

function StudentDigitalLockerPanel({ onFlash }) {
  const [documents, setDocuments] = useState(null);
  const [form, setForm] = useState({ title: '', category: 'other', fileUrl: '' });
  const [fileName, setFileName] = useState('');
  const [fileInputKey, setFileInputKey] = useState(0);
  const [notReady, setNotReady] = useState(false);
  const [pendingReason, setPendingReason] = useState('');
  const [adding, setAdding] = useState(false);
  const [uploadingFor, setUploadingFor] = useState(null);

  function load() { apiRequest('/students/me/documents').then(setDocuments).catch((err) => onFlash(err.message)); }
  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await readLockerFile(file);
      setForm((f) => ({ ...f, fileUrl: dataUrl }));
      setFileName(file.name);
    } catch (err) { onFlash(err.message); clearFile(); }
  }
  function clearFile() {
    setForm((f) => ({ ...f, fileUrl: '' }));
    setFileName('');
    setFileInputKey((k) => k + 1); // remounts the <input type="file"> so its value truly resets
  }

  async function addDocument(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    if (!notReady && !form.fileUrl.trim()) return onFlash('Choose a file, paste a link, or mark it as not-ready-yet.');
    setAdding(true);
    try {
      await apiRequest('/students/me/documents', {
        method: 'POST',
        body: notReady ? { title: form.title, category: form.category, status: 'pending', pendingReason } : form
      });
      onFlash(notReady ? 'Saved as pending — add it whenever you have it.' : 'Document added to your locker.', 'success');
      setForm({ title: '', category: 'other', fileUrl: '' });
      clearFile();
      setNotReady(false);
      setPendingReason('');
      load();
    } catch (err) { onFlash(err.message); } finally { setAdding(false); }
  }
  async function removeDocument(id) {
    try { await apiRequest(`/students/me/documents/${id}`, { method: 'DELETE' }); onFlash('Document removed.', 'success'); load(); } catch (err) { onFlash(err.message); }
  }
  async function uploadForPending(id, e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await readLockerFile(file);
      await apiRequest(`/students/me/documents/${id}`, { method: 'PATCH', body: { fileUrl: dataUrl } });
      onFlash('File attached.', 'success');
      setUploadingFor(null);
      load();
    } catch (err) { onFlash(err.message); }
  }

  return (
    <div>
      <div className="flex items-center" style={{ gap: 12, marginBottom: 6 }}>
        <span style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--sand)', color: 'var(--forest)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><FaLock aria-hidden="true" size={16} /></span>
        <h3 className="font-semibold" style={{ margin: 0 }}>Digital Locker</h3>
      </div>
      <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginLeft: 50, marginBottom: 24, lineHeight: 1.6 }}>Your lifetime document vault — degrees, IDs, transcripts, experience letters and more, kept safe across every institution you ever attend.</p>

      <form onSubmit={addDocument} className="card" style={{ padding: 20, marginBottom: 24, display: 'grid', gap: 14 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--ink-soft)' }}>Add a Document</p>
        <input className="form-input" placeholder="Document title (e.g. National ID Card)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <div style={{ flex: '1 1 200px', minWidth: 0, maxWidth: 260 }}>
          <CustomSelect value={form.category} onChange={(v) => setForm({ ...form, category: v })} ariaLabel="Document category" minWidth="100%" options={DOCUMENT_CATEGORIES} />
        </div>

        {!notReady && (
          <div className="flex flex-wrap items-center" style={{ gap: 14 }}>
            <label className="btn" style={{ padding: '8px 16px', fontSize: '0.8rem', cursor: 'pointer', flexShrink: 0 }}>
              Choose File
              <input key={fileInputKey} type="file" accept="image/*,.pdf,.doc,.docx" onChange={handleFile} style={{ display: 'none' }} />
            </label>
            {fileName && (
              <span className="flex items-center text-xs" style={{ gap: 6, color: 'var(--forest)' }}>
                ✓ {fileName}
                <button type="button" aria-label="Remove selected file" onClick={clearFile} style={{ border: 'none', background: 'var(--sand-line)', borderRadius: '50%', width: 18, height: 18, lineHeight: 1, cursor: 'pointer', color: 'var(--ink)' }}>✕</button>
              </span>
            )}
            <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>or</span>
            <input
              className="form-input" placeholder="Paste a direct file link (PDF/image URL)"
              value={fileName ? '' : form.fileUrl} disabled={!!fileName}
              onChange={(e) => setForm({ ...form, fileUrl: e.target.value })} style={{ flex: '1 1 240px', minWidth: 0 }}
            />
          </div>
        )}

        <label className="flex items-center text-xs" style={{ gap: 8, color: 'var(--ink-soft)' }}>
          <input type="checkbox" checked={notReady} onChange={(e) => { setNotReady(e.target.checked); if (e.target.checked) clearFile(); }} />
          I don't have this document right now — save it as pending, I'll add it later
        </label>
        {notReady && (
          <input className="form-input" placeholder="Reason (optional) — e.g. waiting for the institution to issue it" value={pendingReason} onChange={(e) => setPendingReason(e.target.value)} />
        )}

        <button type="submit" className="btn btn-primary" disabled={adding} style={{ padding: '8px 18px', fontSize: '0.8rem', justifySelf: 'start' }}>{adding ? 'Adding...' : notReady ? 'Save as Pending' : 'Add to Locker'}</button>
      </form>

      {documents === null ? (
        <p role="status" className="admin-notice">Loading...</p>
      ) : documents.length === 0 ? (
        <div className="student-empty-state" style={{ border: '1px solid var(--sand-line)', borderRadius: 18 }}>
          <FaLock aria-hidden="true" />
          <p>Your locker is empty</p>
          <span>Add your first document above.</span>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 10 }}>
          {documents.map((d) => (
            <div key={d._id} className="hover-card card flex items-center justify-between flex-wrap" style={{ padding: 14, gap: 12 }}>
              <div className="flex items-center" style={{ gap: 12, minWidth: 0 }}>
                <span style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--sand)', color: 'var(--forest)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><FaLock aria-hidden="true" size={13} /></span>
                <div style={{ minWidth: 0 }}>
                  <strong className="text-sm">{d.title}</strong>
                  <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 2 }}>
                    {DOCUMENT_CATEGORY_LABEL[d.category] || 'Other'} · Added {new Date(d.createdAt).toLocaleDateString()}
                    {d.status === 'pending' && <> · <Tag status="pending" label="Pending" /></>}
                  </p>
                  {d.status === 'pending' && d.pendingReason && <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 2, fontStyle: 'italic' }}>"{d.pendingReason}"</p>}
                </div>
              </div>
              <div className="flex items-center gap-2" style={{ flexShrink: 0 }}>
                {d.status === 'pending' ? (
                  uploadingFor === d._id ? (
                    <>
                      <label className="btn btn-primary" style={{ padding: '5px 12px', fontSize: '0.72rem', cursor: 'pointer' }}>
                        Choose File
                        <input type="file" accept="image/*,.pdf,.doc,.docx" onChange={(e) => uploadForPending(d._id, e)} style={{ display: 'none' }} />
                      </label>
                      <button type="button" className="btn" style={{ padding: '5px 12px', fontSize: '0.72rem' }} onClick={() => setUploadingFor(null)}>Cancel</button>
                    </>
                  ) : (
                    <button type="button" className="btn btn-primary" style={{ padding: '5px 12px', fontSize: '0.72rem' }} onClick={() => setUploadingFor(d._id)}>Upload Now</button>
                  )
                ) : (
                  <a href={d.fileUrl} target="_blank" rel="noreferrer" className="btn" style={{ padding: '5px 12px', fontSize: '0.72rem' }}>View</a>
                )}
                <button type="button" className="btn" style={{ padding: '5px 12px', fontSize: '0.72rem' }} onClick={() => removeDocument(d._id)}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Student sidebar — Digital Student ID (spec Part 10.18): a QR-verifiable ID card built from
// real StudentProfile/enrollment data — anyone can scan the QR and confirm this is a real
// enrolled student, without seeing anything private.
function StudentDigitalIdPanel({ onFlash }) {
  const [id, setId] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [faceEnrolled, setFaceEnrolled] = useState(false);
  useEffect(() => { apiRequest('/students/me/student-id').then(setId).catch((err) => onFlash(err.message)); }, [onFlash]);

  async function enrollFace() {
    if (!id?.profilePhoto) { onFlash('Add a profile photo first (Personal Information tab), then come back here.'); return; }
    setEnrolling(true);
    try {
      const { computeDescriptorFromImageUrl } = await import('../utils/faceApi');
      const descriptor = await computeDescriptorFromImageUrl(id.profilePhoto);
      await apiRequest('/students/me/face-descriptor', { method: 'PUT', body: { descriptor } });
      setFaceEnrolled(true);
      onFlash('Face enrolled — your teacher can now mark you present with Face Scan attendance.', 'success');
    } catch (err) { onFlash(err.message); } finally { setEnrolling(false); }
  }

  if (id === null) return <p role="status" className="admin-notice">Loading...</p>;

  return (
    <div>
      <div className="flex items-center" style={{ gap: 12, marginBottom: 24 }}>
        <span style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--sand)', color: 'var(--forest)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><FaQrcode aria-hidden="true" size={16} /></span>
        <h3 className="font-semibold" style={{ margin: 0 }}>Digital Student ID</h3>
      </div>

      <div className="card" style={{ padding: 0, maxWidth: 420, overflow: 'hidden' }}>
        <div style={{ background: 'linear-gradient(120deg, var(--forest-deep), var(--forest))', padding: '18px 22px', color: '#fff' }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', opacity: 0.85 }}>CareerZ Verified Student</span>
        </div>
        <div style={{ padding: 22, display: 'flex', gap: 16, alignItems: 'center' }}>
          {id.profilePhoto
            ? <img src={id.profilePhoto} alt="" style={{ width: 64, height: 64, borderRadius: 14, objectFit: 'cover', flexShrink: 0 }} />
            : <div style={{ width: 64, height: 64, borderRadius: 14, background: 'var(--sand)', color: 'var(--forest)', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 22, flexShrink: 0 }}>{(id.fullName || '?')[0]}</div>}
          <div style={{ minWidth: 0 }}>
            <strong style={{ fontSize: 17 }}>{id.fullName}</strong>
            <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 4 }}>Roll No: {id.rollNumber || '—'}</p>
            <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 2 }}>{id.institution?.name || 'No institution linked'}{id.classSection?.name ? ` · ${id.classSection.name}` : ''}</p>
            <div style={{ marginTop: 8 }}><Tag status={id.status === 'active' ? 'approved' : 'pending'} label={id.status === 'active' ? 'Active' : id.status} /></div>
          </div>
        </div>
        <div style={{ padding: '0 22px 22px', display: 'flex', alignItems: 'center', gap: 16, borderTop: '1px solid var(--sand-line)', paddingTop: 18 }}>
          <img src={id.qrDataUrl} alt="Student ID verification QR code" style={{ width: 84, height: 84, borderRadius: 10, border: '1px solid var(--sand-line)' }} />
          <div style={{ minWidth: 0 }}>
            <p className="text-xs" style={{ color: 'var(--ink-soft)', lineHeight: 1.6 }}>Anyone can scan this code to verify your enrollment status instantly — no login required.</p>
            <a href={id.verifyUrl} target="_blank" rel="noreferrer" className="text-xs" style={{ color: 'var(--emerald)', display: 'inline-block', marginTop: 6 }}>Open verification link ↗</a>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 20, maxWidth: 420, marginTop: 20 }}>
        <h4 className="font-semibold mb-2" style={{ fontSize: '0.9rem' }}>Face Scan Attendance</h4>
        <p className="text-xs mb-3" style={{ color: 'var(--ink-soft)' }}>
          Optional — enroll your face (computed from your profile photo, entirely in your browser) so your teacher can mark you present with a camera scan instead of a QR code. Only a set of numbers is stored, never the photo itself, and accuracy is moderate (a regular webcam, not dedicated biometric hardware).
        </p>
        <button type="button" className="btn btn-primary" onClick={enrollFace} disabled={enrolling}>
          {enrolling ? 'Enrolling...' : faceEnrolled ? '✓ Face Enrolled' : 'Enroll My Face'}
        </button>
      </div>
    </div>
  );
}

// Student sidebar — Learning Analytics (spec Part 10.12): per-subject averages computed from
// real Result documents, and a weekly attendance trend from real Attendance records.
function StudentLearningAnalyticsPanel({ onFlash }) {
  const [data, setData] = useState(null);
  useEffect(() => { apiRequest('/students/me/learning-analytics').then(setData).catch((err) => onFlash(err.message)); }, [onFlash]);

  if (data === null) return <p role="status" className="admin-notice">Loading...</p>;

  const readinessColor = { Strong: 'emerald', 'Needs Practice': 'gold', 'At Risk': 'rose, #e11d48' }[data.examReadiness] || 'ink-soft';
  const maxWeek = Math.max(...data.attendanceTrend.map((w) => w.ratePercent), 1);

  return (
    <div>
      <div className="flex items-center" style={{ gap: 12, marginBottom: 24 }}>
        <span style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--sand)', color: 'var(--forest)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><FaChartLine aria-hidden="true" size={16} /></span>
        <h3 className="font-semibold" style={{ margin: 0 }}>Learning Analytics</h3>
      </div>

      {data.subjectPerformance.length === 0 ? (
        <div className="student-empty-state" style={{ border: '1px solid var(--sand-line)', borderRadius: 18 }}>
          <FaChartLine aria-hidden="true" />
          <p>No results recorded yet</p>
          <span>Analytics will appear once your teachers record test results.</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3" style={{ marginBottom: 24 }}>
            <div className="card" style={{ padding: 18 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--ink-soft)' }}>Overall Average</span>
              <strong style={{ fontSize: 22, fontFamily: 'Fraunces, serif', display: 'block', marginTop: 6 }}>{data.overallAverage ?? '—'}%</strong>
            </div>
            <div className="card" style={{ padding: 18 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--ink-soft)' }}>Exam Readiness</span>
              <strong style={{ fontSize: 22, fontFamily: 'Fraunces, serif', display: 'block', marginTop: 6, color: `var(--${readinessColor})` }}>{data.examReadiness || '—'}</strong>
            </div>
          </div>

          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--ink-soft)', marginBottom: 12 }}>Subject Performance</p>
          <div className="card" style={{ padding: 20, marginBottom: 24, display: 'grid', gap: 14 }}>
            {data.subjectPerformance.map((s) => (
              <div key={s.subject}>
                <div className="student-progress-row">
                  <span className="text-xs">{s.subject}{s.subject === data.weakestSubjects[0]?.subject && <span style={{ color: 'var(--rose, #e11d48)' }}> (weakest)</span>}{s.subject === data.strongestSubjects[0]?.subject && s.subject !== data.weakestSubjects[0]?.subject && <span style={{ color: 'var(--emerald)' }}> (strongest)</span>}</span>
                  <strong className="text-xs">{s.averagePercent}% · {s.testsCount} test{s.testsCount === 1 ? '' : 's'}</strong>
                </div>
                <progress className="student-progress-bar" max="100" value={s.averagePercent} aria-label={`${s.subject} average`} />
              </div>
            ))}
          </div>

          {data.attendanceTrend.length > 0 && (
            <>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--ink-soft)', marginBottom: 12 }}>Weekly Attendance Trend</p>
              <div className="card" style={{ padding: 20 }}>
                <div className="flex items-end gap-2" style={{ height: 80 }}>
                  {data.attendanceTrend.map((w) => (
                    <div key={w.week} title={`${w.week}: ${w.ratePercent}%`} style={{ flex: 1, height: `${Math.max((w.ratePercent / maxWeek) * 100, 3)}%`, background: 'var(--emerald)', borderRadius: '3px 3px 0 0' }} />
                  ))}
                </div>
                <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 10 }}>{data.attendanceTrend.length} week{data.attendanceTrend.length === 1 ? '' : 's'} tracked</p>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

const GOAL_CATEGORIES = [
  { value: 'academic', label: 'Academic' },
  { value: 'scholarship', label: 'Scholarship' },
  { value: 'job', label: 'Job' },
  { value: 'skill', label: 'Skill' },
  { value: 'other', label: 'Other' }
];
const TIMELINE_ICON = {
  'Course Completed': { icon: FaBookOpen, color: 'forest' },
  'Certificate Earned': { icon: FaAward, color: 'gold' },
  'High Score': { icon: FaChartLine, color: 'emerald' },
  'Scholarship Won': { icon: FaGraduationCap, color: 'gold' },
  'Job Offer Accepted': { icon: FaBriefcase, color: 'forest' },
  'Goal Achieved': { icon: FaAward, color: 'emerald' }
};

// Student sidebar — Goal Tracking (Part 10.22), Achievement Timeline (Part 10.23) and
// Reputation/Badges (Part 10.19), as three sub-tabs of one panel.
function StudentGoalsAchievementsPanel({ onFlash }) {
  const [sub, setSub] = useState('goals');
  const tabs = [
    { key: 'goals', label: 'Goals' },
    { key: 'timeline', label: 'Achievement Timeline' },
    { key: 'badges', label: 'Badges' }
  ];
  return (
    <div>
      <nav className="cz-tabbar" style={{ marginBottom: 20 }}>
        {tabs.map((t) => (
          <button key={t.key} type="button" aria-pressed={sub === t.key} className={`cz-tab${sub === t.key ? ' active' : ''}`} onClick={() => setSub(t.key)}>{t.label}</button>
        ))}
      </nav>
      {sub === 'goals' && <StudentGoalsSubPanel onFlash={onFlash} />}
      {sub === 'timeline' && <StudentTimelineSubPanel onFlash={onFlash} />}
      {sub === 'badges' && <StudentBadgesSubPanel onFlash={onFlash} />}
    </div>
  );
}

function StudentGoalsSubPanel({ onFlash }) {
  const [goals, setGoals] = useState(null);
  const [form, setForm] = useState({ title: '', category: 'academic', targetDate: '' });
  const [adding, setAdding] = useState(false);

  function load() { apiRequest('/students/me/goals').then(setGoals).catch((err) => onFlash(err.message)); }
  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function addGoal(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setAdding(true);
    try {
      await apiRequest('/students/me/goals', { method: 'POST', body: { ...form, targetDate: form.targetDate || undefined } });
      onFlash('Goal added.', 'success');
      setForm({ title: '', category: 'academic', targetDate: '' });
      load();
    } catch (err) { onFlash(err.message); } finally { setAdding(false); }
  }
  async function setProgress(goal, progressPercent) {
    try {
      await apiRequest(`/students/me/goals/${goal._id}`, { method: 'PATCH', body: { progressPercent, status: progressPercent >= 100 ? 'completed' : 'active' } });
      load();
    } catch (err) { onFlash(err.message); }
  }
  async function abandonGoal(id) {
    try { await apiRequest(`/students/me/goals/${id}`, { method: 'PATCH', body: { status: 'abandoned' } }); load(); } catch (err) { onFlash(err.message); }
  }
  async function removeGoal(id) {
    try { await apiRequest(`/students/me/goals/${id}`, { method: 'DELETE' }); onFlash('Goal removed.', 'success'); load(); } catch (err) { onFlash(err.message); }
  }

  const active = (goals || []).filter((g) => g.status === 'active');
  const done = (goals || []).filter((g) => g.status !== 'active');

  return (
    <div>
      <form onSubmit={addGoal} className="card" style={{ padding: 20, marginBottom: 24, display: 'grid', gap: 14 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--ink-soft)' }}>Set a New Goal</p>
        <input className="form-input" placeholder="e.g. Score 90% in Algebra Final" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <div className="flex flex-wrap" style={{ gap: 14 }}>
          <div style={{ flex: '1 1 180px', minWidth: 0 }}>
            <CustomSelect value={form.category} onChange={(v) => setForm({ ...form, category: v })} ariaLabel="Goal category" minWidth="100%" options={GOAL_CATEGORIES} />
          </div>
          <input className="form-input" type="date" value={form.targetDate} onChange={(e) => setForm({ ...form, targetDate: e.target.value })} style={{ flex: '1 1 180px', minWidth: 0 }} />
        </div>
        <button type="submit" className="btn btn-primary" disabled={adding} style={{ padding: '8px 18px', fontSize: '0.8rem', justifySelf: 'start' }}>{adding ? 'Adding...' : 'Add Goal'}</button>
      </form>

      {goals === null ? (
        <p role="status" className="admin-notice">Loading...</p>
      ) : goals.length === 0 ? (
        <div className="student-empty-state" style={{ border: '1px solid var(--sand-line)', borderRadius: 18 }}>
          <FaAward aria-hidden="true" />
          <p>No goals set yet</p>
          <span>Set your first goal above.</span>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <div className="card" style={{ padding: 20, marginBottom: 20, display: 'grid', gap: 16 }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--ink-soft)' }}>Active Goals</p>
              {active.map((g) => (
                <div key={g._id}>
                  <div className="student-progress-row">
                    <span className="text-xs">{g.title} <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.03em', textTransform: 'uppercase', color: 'var(--ink-soft)', background: 'var(--sand)', padding: '2px 8px', borderRadius: 999, marginLeft: 4 }}>{GOAL_CATEGORIES.find((c) => c.value === g.category)?.label || 'Other'}</span></span>
                    <strong className="text-xs">{g.progressPercent}%{g.targetDate ? ` · Due ${new Date(g.targetDate).toLocaleDateString()}` : ''}</strong>
                  </div>
                  <progress className="student-progress-bar" max="100" value={g.progressPercent} aria-label={`${g.title} progress`} />
                  <div className="flex items-center flex-wrap" style={{ gap: 8, marginTop: 8 }}>
                    {[25, 50, 75, 100].map((p) => (
                      <button key={p} type="button" className="btn" style={{ padding: '3px 10px', fontSize: '0.7rem' }} onClick={() => setProgress(g, p)}>{p}%</button>
                    ))}
                    <button type="button" className="btn" style={{ padding: '3px 10px', fontSize: '0.7rem' }} onClick={() => abandonGoal(g._id)}>Abandon</button>
                    <button type="button" className="btn" style={{ padding: '3px 10px', fontSize: '0.7rem' }} onClick={() => removeGoal(g._id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {done.length > 0 && (
            <div className="card" style={{ padding: 20 }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--ink-soft)', marginBottom: 12 }}>Completed / Abandoned</p>
              <div style={{ display: 'grid', gap: 8 }}>
                {done.map((g) => (
                  <div key={g._id} className="flex items-center justify-between flex-wrap" style={{ gap: 8, padding: '8px 0', borderBottom: '1px solid var(--sand-line)' }}>
                    <span className="text-xs">{g.title}</span>
                    <div className="flex items-center gap-2">
                      <Tag status={g.status === 'completed' ? 'approved' : 'rejected'} label={g.status === 'completed' ? 'Completed' : 'Abandoned'} />
                      <button type="button" className="btn" style={{ padding: '3px 10px', fontSize: '0.7rem' }} onClick={() => removeGoal(g._id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StudentTimelineSubPanel({ onFlash }) {
  const [timeline, setTimeline] = useState(null);
  useEffect(() => { apiRequest('/students/me/achievement-timeline').then(setTimeline).catch((err) => onFlash(err.message)); }, [onFlash]);

  if (timeline === null) return <p role="status" className="admin-notice">Loading...</p>;
  if (timeline.length === 0) {
    return (
      <div className="student-empty-state" style={{ border: '1px solid var(--sand-line)', borderRadius: 18 }}>
        <FaAward aria-hidden="true" />
        <p>No achievements yet</p>
        <span>Complete courses, earn certificates, hit goals — they'll show up here.</span>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: 0 }}>
      <div className="dash-list" style={{ gap: 0 }}>
        {[...timeline].reverse().map((t, idx, arr) => {
          const meta = TIMELINE_ICON[t.type] || { icon: FaAward, color: 'forest' };
          const Icon = meta.icon;
          return (
            <div key={idx} className="dash-list-item" style={{ borderBottom: idx < arr.length - 1 ? '1px solid var(--sand-line)' : 'none' }}>
              <span className={`dash-list-icon c-${meta.color}`} aria-hidden><Icon size={14} /></span>
              <div className="dash-list-body"><div className="title">{t.type}</div><div className="desc">{t.title}{t.desc ? ` · ${t.desc}` : ''}</div></div>
              <span className="dash-list-time">{new Date(t.date).toLocaleDateString()}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StudentBadgesSubPanel({ onFlash }) {
  const [data, setData] = useState(null);
  useEffect(() => { apiRequest('/students/me/badges').then(setData).catch((err) => onFlash(err.message)); }, [onFlash]);

  if (data === null) return <p role="status" className="admin-notice">Loading...</p>;

  return (
    <div>
      <div className="card" style={{ padding: 18, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--sand)', color: 'var(--gold)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><FaAward aria-hidden="true" size={18} /></span>
        <div>
          <strong style={{ fontSize: 20, fontFamily: 'Fraunces, serif' }}>{data.earnedCount} / {data.totalCount}</strong>
          <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 2 }}>Badges earned so far</p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {data.badges.map((b) => (
          <div key={b.code} className="card" style={{ padding: 16, opacity: b.earned ? 1 : 0.5, textAlign: 'center' }}>
            <span style={{ width: 44, height: 44, borderRadius: '50%', background: b.earned ? 'var(--emerald)' : 'var(--sand)', color: b.earned ? '#fff' : 'var(--ink-soft)', display: 'grid', placeItems: 'center', margin: '0 auto 10px' }}>
              <FaAward aria-hidden="true" size={18} />
            </span>
            <strong className="text-sm" style={{ display: 'block' }}>{b.label}</strong>
            <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 4, lineHeight: 1.5 }}>{b.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Student sidebar — Student Community (Part 10.20): Study Groups + Discussion Rooms.
function StudentCommunityPanel({ onFlash, user }) {
  const [sub, setSub] = useState('browse');
  const [groups, setGroups] = useState(null);
  const [myGroups, setMyGroups] = useState(null);
  const [activeGroup, setActiveGroup] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', subject: '' });
  const [creating, setCreating] = useState(false);

  function load() {
    apiRequest('/study-groups').then(setGroups).catch((err) => onFlash(err.message));
    apiRequest('/study-groups/mine').then(setMyGroups).catch(() => setMyGroups([]));
  }
  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  const myGroupIds = new Set((myGroups || []).map((g) => g._id));

  async function createGroup(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setCreating(true);
    try {
      await apiRequest('/study-groups', { method: 'POST', body: form });
      onFlash('Study group created.', 'success');
      setForm({ name: '', description: '', subject: '' });
      load();
    } catch (err) { onFlash(err.message); } finally { setCreating(false); }
  }
  async function joinGroup(id) {
    try { await apiRequest(`/study-groups/${id}/join`, { method: 'POST' }); onFlash('Joined study group.', 'success'); load(); } catch (err) { onFlash(err.message); }
  }

  if (activeGroup) return <StudyGroupDetail group={activeGroup} user={user} onFlash={onFlash} onBack={() => { setActiveGroup(null); load(); }} />;

  const tabs = [{ key: 'browse', label: 'Browse Groups' }, { key: 'mine', label: 'My Groups' }, { key: 'create', label: 'Create Group' }];

  return (
    <div>
      <div className="flex items-center" style={{ gap: 12, marginBottom: 20 }}>
        <span style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--sand)', color: 'var(--forest)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><FaUsers aria-hidden="true" size={16} /></span>
        <h3 className="font-semibold" style={{ margin: 0 }}>Study Groups</h3>
      </div>

      <nav className="cz-tabbar" style={{ marginBottom: 20 }}>
        {tabs.map((t) => (
          <button key={t.key} type="button" aria-pressed={sub === t.key} className={`cz-tab${sub === t.key ? ' active' : ''}`} onClick={() => setSub(t.key)}>{t.label}</button>
        ))}
      </nav>

      {sub === 'create' && (
        <form onSubmit={createGroup} className="card" style={{ padding: 20, display: 'grid', gap: 14, maxWidth: 480 }}>
          <input className="form-input" placeholder="Group name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="form-input" placeholder="Subject (e.g. Math, Physics)" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
          <textarea className="form-input" placeholder="What's this group about?" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <button type="submit" className="btn btn-primary" disabled={creating} style={{ padding: '8px 18px', fontSize: '0.8rem', justifySelf: 'start' }}>{creating ? 'Creating...' : 'Create Group'}</button>
        </form>
      )}

      {(sub === 'browse' || sub === 'mine') && (() => {
        const list = sub === 'mine' ? myGroups : groups;
        if (list === null) return <p role="status" className="admin-notice">Loading...</p>;
        if (list.length === 0) {
          return (
            <div className="student-empty-state" style={{ border: '1px solid var(--sand-line)', borderRadius: 18 }}>
              <FaUsers aria-hidden="true" />
              <p>{sub === 'mine' ? "You haven't joined any groups yet" : 'No study groups yet'}</p>
              <span>{sub === 'mine' ? 'Browse groups or create your own.' : 'Be the first to create one!'}</span>
            </div>
          );
        }
        return (
          <div style={{ display: 'grid', gap: 10 }}>
            {list.map((g) => (
              <div key={g._id} className="hover-card card flex items-center justify-between flex-wrap" style={{ padding: 16, gap: 14 }}>
                <div className="flex items-center" style={{ gap: 14, minWidth: 0, cursor: 'pointer' }} onClick={() => setActiveGroup(g)}>
                  <span style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--sand)', color: 'var(--forest)', display: 'grid', placeItems: 'center', flexShrink: 0, fontWeight: 700 }}>{g.name[0]}</span>
                  <div style={{ minWidth: 0 }}>
                    <strong className="text-sm">{g.name}</strong>
                    <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 2 }}>{g.subject ? `${g.subject} · ` : ''}{g.memberCount} member{g.memberCount === 1 ? '' : 's'} · by {g.createdBy?.fullName || 'a student'}</p>
                  </div>
                </div>
                {myGroupIds.has(g._id)
                  ? <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.75rem', flexShrink: 0 }} onClick={() => setActiveGroup(g)}>Open</button>
                  : <button type="button" className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.75rem', flexShrink: 0 }} onClick={() => joinGroup(g._id)}>Join</button>}
              </div>
            ))}
          </div>
        );
      })()}
    </div>
  );
}

function StudyGroupDetail({ group, user, onFlash, onBack }) {
  const [posts, setPosts] = useState(null);
  const [text, setText] = useState('');
  const [members, setMembers] = useState(group.members || []);

  function load() {
    apiRequest(`/study-groups/${group._id}/posts`).then(setPosts).catch((err) => onFlash(err.message));
    apiRequest(`/study-groups/${group._id}`).then((g) => setMembers(g.members || [])).catch(() => {});
  }
  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function send(e) {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      await apiRequest(`/study-groups/${group._id}/posts`, { method: 'POST', body: { text: text.trim() } });
      setText('');
      load();
    } catch (err) { onFlash(err.message); }
  }
  async function leave() {
    try {
      await apiRequest(`/study-groups/${group._id}/leave`, { method: 'POST' });
      onFlash('Left the group.', 'success');
      onBack();
    } catch (err) { onFlash(err.message); }
  }

  return (
    <div>
      <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.75rem', marginBottom: 16 }} onClick={onBack}>← Back to Study Groups</button>

      <div className="card" style={{ padding: 20, marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div className="flex items-center" style={{ gap: 14, minWidth: 0 }}>
          <span style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--sand)', color: 'var(--forest)', display: 'grid', placeItems: 'center', flexShrink: 0, fontWeight: 700, fontSize: 18 }}>{group.name[0]}</span>
          <div style={{ minWidth: 0 }}>
            <strong className="text-sm">{group.name}</strong>
            <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 2 }}>{group.subject ? `${group.subject} · ` : ''}{members.length} member{members.length === 1 ? '' : 's'}</p>
            {group.description && <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 4 }}>{group.description}</p>}
          </div>
        </div>
        <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.75rem', flexShrink: 0 }} onClick={leave}>Leave Group</button>
      </div>

      <div className="card" style={{ padding: '10px 14px', marginBottom: 14, maxHeight: 380, overflowY: 'auto' }}>
        {posts === null && <p role="status" className="admin-notice">Loading...</p>}
        {posts && posts.length === 0 && (
          <div className="student-empty-state" style={{ minHeight: 100, padding: '16px 0' }}>
            <p>No messages yet</p>
            <span>Start the discussion below.</span>
          </div>
        )}
        {(posts || []).map((p, idx) => (
          <div key={p._id} style={{ padding: '10px 4px', borderBottom: idx < posts.length - 1 ? '1px solid var(--sand-line)' : 'none' }}>
            <div className="flex items-center" style={{ gap: 8 }}>
              <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--forest)', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{(p.author?.fullName || '?')[0]}</span>
              <strong className="text-xs">{p.author?.fullName}</strong>
              <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>{new Date(p.createdAt).toLocaleString()}</span>
            </div>
            <div style={{ fontSize: 13, marginTop: 4, marginLeft: 30 }}>{p.text}</div>
          </div>
        ))}
      </div>
      <form onSubmit={send} className="flex items-end" style={{ gap: 12 }}>
        <input className="form-input" placeholder="Message this group..." value={text} onChange={(e) => setText(e.target.value)} required style={{ flex: '1 1 auto', minWidth: 0 }} />
        <button type="submit" className="btn btn-primary" style={{ flexShrink: 0 }}>Send</button>
      </form>
    </div>
  );
}

function StudentJobsPanel({ onFlash, user }) {
  const [sub, setSub] = useState('dashboard');
  const TABS = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'profile', label: 'My Profile' },
    { key: 'search', label: 'Search Jobs' },
    { key: 'internships', label: 'Internships' },
    { key: 'recommended', label: 'Recommended Jobs' },
    { key: 'saved', label: 'Saved Jobs' },
    { key: 'applications', label: 'My Applications' },
    { key: 'interviews', label: 'Interviews' },
    { key: 'offers', label: 'Job Offers' },
    { key: 'resume', label: 'CV/Resume Builder' },
    { key: 'coverLetters', label: 'Cover Letters' },
    { key: 'portfolio', label: 'Portfolio' },
    { key: 'tools', label: 'Career Tools' },
    { key: 'alerts', label: 'Job Alerts' },
    { key: 'messages', label: 'Messages' },
    { key: 'notifications', label: 'Notifications' }
  ];
  // JobDashboardPanel's onNavigate resolves a sub-tab key locally (e.g. 'resume', 'search').
  function navigate(key) {
    setSub(key);
  }
  return (
    <div>
      <nav className="cz-tabbar" style={{ marginBottom: 20 }}>
        {TABS.map((t) => (
          <button key={t.key} type="button" aria-pressed={sub === t.key} className={`cz-tab${sub === t.key ? ' active' : ''}`} onClick={() => setSub(t.key)}>{t.label}</button>
        ))}
      </nav>
      {sub === 'dashboard' && <JobDashboardPanel onFlash={onFlash} onNavigate={navigate} user={user} />}
      {sub === 'profile' && <JobMyProfilePanel onFlash={onFlash} onNavigate={setSub} />}
      {sub === 'search' && <JobSearchPanel onFlash={onFlash} />}
      {sub === 'internships' && <InternshipsPanel onFlash={onFlash} />}
      {sub === 'recommended' && <RecommendedJobsPanel onFlash={onFlash} />}
      {sub === 'saved' && <SavedJobsPanel onFlash={onFlash} />}
      {sub === 'applications' && <MyApplicationsPanel onFlash={onFlash} />}
      {sub === 'interviews' && <InterviewsPanel onFlash={onFlash} />}
      {sub === 'offers' && <JobOffersPanel onFlash={onFlash} />}
      {sub === 'resume' && <ResumeEditorPanel onFlash={onFlash} />}
      {sub === 'coverLetters' && <CoverLettersPanel />}
      {sub === 'portfolio' && <PortfolioPanel onFlash={onFlash} onNavigate={setSub} />}
      {sub === 'alerts' && <JobAlertsPanel onFlash={onFlash} />}
      {sub === 'tools' && <CareerToolsPanel onFlash={onFlash} onNavigate={setSub} />}
      {sub === 'messages' && <JobMessagesPanel onFlash={onFlash} />}
      {sub === 'notifications' && <NotificationsPanel onFlash={onFlash} />}
    </div>
  );
}

// Employee/Job-Seeker home — Welcome/Profile → 6 Summary Cards → Recommended Jobs →
// Application Status → Upcoming Interviews → CV/Profile → Job Alerts preview → Quick Actions.
// No separate "Employee" role exists in this system (job seeking is a Student-workspace
// capability, same as scholarships/marketplace), so this lives inside the Jobs tab.
const WORK_MODE_LABEL = { onsite: 'Onsite', remote: 'Remote', hybrid: 'Hybrid' };

function formatSalary(j) {
  if (!j.salaryMin && !j.salaryMax) return 'Salary: Not disclosed';
  return `Salary: ${j.currency} ${j.salaryMin ?? ''}${j.salaryMax ? `–${j.salaryMax}` : ''}`;
}

// "View Job" fetches the job fresh (instead of reusing local list data) so the click itself
// records a real "recently viewed" event server-side — falls back to whatever was already on hand.
async function recordJobView(jobRefOrId, setViewingJob) {
  const id = jobRefOrId?._id || jobRefOrId;
  if (!id) return;
  try {
    setViewingJob(await apiRequest(`/jobs/${id}`));
  } catch {
    setViewingJob(typeof jobRefOrId === 'object' ? jobRefOrId : null);
  }
}

function JobLogo({ job, size = 36 }) {
  return job.companyLogo
    ? <img src={job.companyLogo} alt="" style={{ width: size, height: size, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
    : <div style={{ width: size, height: size, borderRadius: 8, background: 'var(--forest)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>{(job.company || '?')[0]}</div>;
}

function JobDetailModal({ job, onClose, isSaved, onToggleSave, onApply }) {
  if (!job) return null;
  return (
    <div className="u-modal-overlay open" onClick={onClose}>
      <div className="u-modal u-modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="u-modal-head">
          <div className="flex items-center gap-3">
            <JobLogo job={job} size={44} />
            <div>
              <h3>{job.title}{job.featured && new Date(job.featuredUntil) > new Date() && <span style={{ marginLeft: 8 }}><Tag status="approved" label="Featured" /></span>}</h3>
              <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>{job.company}</p>
            </div>
          </div>
          <button type="button" className="u-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="u-modal-body">
          <p className="text-xs" style={{ color: 'var(--ink-soft)', marginBottom: 8 }}>
            {job.city ? `${job.city}, ` : ''}{job.country} · {WORK_MODE_LABEL[job.workMode] || 'Onsite'} · {job.type?.replace('_', ' ')}
            {job.visaSponsorship ? ' · Visa sponsorship available' : ''}
          </p>
          <p className="text-xs" style={{ color: 'var(--ink-soft)', marginBottom: 8 }}>
            {formatSalary(job)} · {job.experienceYears || 0}+ yrs experience · Posted {new Date(job.createdAt).toLocaleDateString()}
            {job.applicationDeadline ? ` · Apply by ${new Date(job.applicationDeadline).toLocaleDateString()}` : ''}
          </p>
          {job.education && <p className="text-xs" style={{ marginBottom: 8 }}><strong>Education:</strong> {job.education}</p>}
          {job.skills?.length > 0 && <p className="text-xs" style={{ marginBottom: 8 }}><strong>Skills:</strong> {job.skills.join(', ')}</p>}
          {job.description && <p className="text-sm" style={{ marginBottom: 8, whiteSpace: 'pre-wrap' }}>{job.description}</p>}
          {(job.contactEmail || job.contactPhone) && (
            <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>
              {job.contactEmail ? `Contact: ${job.contactEmail}` : ''}{job.contactEmail && job.contactPhone ? ' · ' : ''}{job.contactPhone || ''}
            </p>
          )}
        </div>
        <div className="u-modal-foot">
          {onToggleSave && <button type="button" className="btn" onClick={() => onToggleSave(job._id, isSaved)}>{isSaved ? '★ Saved' : '☆ Save'}</button>}
          {onApply && <button type="button" className="btn btn-primary" onClick={() => onApply(job._id)}>Apply Now</button>}
        </div>
      </div>
    </div>
  );
}

function JobDashboardPanel({ onFlash, onNavigate, user }) {
  const [dash, setDash] = useState(null);
  const [savedIds, setSavedIds] = useState([]);
  const [viewingJob, setViewingJob] = useState(null);
  const [alerts, setAlerts] = useState(null);
  const [conversations, setConversations] = useState(null);

  function load() {
    apiRequest('/jobs/mine/dashboard').then(setDash).catch((err) => onFlash(err.message));
    apiRequest('/job-alerts/mine').then(setAlerts).catch(() => setAlerts([]));
    apiRequest('/messages/conversations').then(setConversations).catch(() => setConversations([]));
  }
  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function apply(jobId) {
    try { await apiRequest(`/jobs/${jobId}/apply`, { method: 'POST', body: {} }); onFlash('Application submitted.', 'success'); load(); } catch (err) { onFlash(err.message); }
  }
  async function toggleSave(jobId, isSaved) {
    try {
      await apiRequest(`/jobs/${jobId}/save`, { method: isSaved ? 'DELETE' : 'POST' });
      setSavedIds((prev) => (isSaved ? prev.filter((id) => id !== jobId) : [...prev, jobId]));
      load();
    } catch (err) { onFlash(err.message); }
  }

  if (!dash) return <p role="status" className="admin-notice">Loading your dashboard...</p>;

  const jobLabelStyle = { fontSize: 11, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--ink-soft)' };

  return (
    <>
      {/* 1. Profile Completion */}
      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            {user?.profilePhoto
              ? <img src={user.profilePhoto} alt="" style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }} />
              : <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--forest)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{(user?.fullName || '?')[0]}</div>}
            <div>
              <strong className="text-sm">{user?.fullName || 'Job Seeker'}</strong>
              <p className="text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>{dash.profile.title || 'Add your professional title'}</p>
              <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>{dash.profile.location || 'Location not set'} · {dash.profile.experienceLevel || 'Experience level not set'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>Profile {dash.profile.completeness}% complete</span>
            <button type="button" className="btn btn-primary" style={{ padding: '5px 14px', fontSize: '0.78rem' }} onClick={() => onNavigate?.('resume')}>Complete Profile</button>
          </div>
        </div>
      </div>

      {/* 2. Job Summary Cards */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3" style={{ marginBottom: 20 }}>
        <SummaryCard title="Recommended Jobs" count={dash.counts.recommended} onClick={() => onNavigate?.('search')} />
        <SummaryCard title="Saved Jobs" count={dash.counts.saved} onClick={() => onNavigate?.('saved')} />
        <SummaryCard title="Applied Jobs" count={dash.counts.applied} onClick={() => onNavigate?.('applications')} />
        <SummaryCard title="Interviews" count={dash.counts.interviews} onClick={() => onNavigate?.('interviews')} />
        <SummaryCard title="Job Offers" count={dash.counts.offers} onClick={() => onNavigate?.('applications')} />
        <SummaryCard title="Profile Views" count={dash.profile.profileViews} onClick={() => onNavigate?.('resume')} />
      </div>

      {/* 3. Recommended Jobs */}
      <div className="dash-section-title"><h2>Recommended Jobs</h2></div>
      <div className="grid grid-cols-1" style={{ marginBottom: 20, gap: 14 }}>
        {dash.recommendedJobs.length === 0 && (
          <div className="border border-[var(--sand-line)] rounded-xl p-4">
            <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>No recommendations yet — add skills to your CV to get matched jobs.</p>
          </div>
        )}
        {dash.recommendedJobs.slice(0, 4).map((j) => {
          const isSaved = savedIds.includes(j._id) || dash.savedJobs.some((s) => s._id === j._id);
          return (
            <div key={j._id} className="hover-card border border-[var(--sand-line)] rounded-xl p-4">
              <div className="flex items-center justify-between flex-wrap" style={{ gap: 14 }}>
                <div className="flex items-start" style={{ gap: 14 }}>
                  <JobLogo job={j} size={44} />
                  <div>
                    <strong className="text-sm">{j.title}{j.featured && new Date(j.featuredUntil) > new Date() && <span style={{ marginLeft: 6 }}><Tag status="approved" label="Featured" /></span>}</strong>
                    <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 4 }}>{j.company} · {j.city ? `${j.city}, ` : ''}{j.country} · {WORK_MODE_LABEL[j.workMode] || 'Onsite'} · {j.type?.replace('_', ' ')}{j.visaSponsorship ? ' · Visa sponsorship' : ''}</p>
                    <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 4 }}>{formatSalary(j)} · {j.experienceYears || 0}+ yrs exp · Posted {new Date(j.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex" style={{ gap: 8, flexShrink: 0 }}>
                  <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.75rem' }} onClick={() => recordJobView(j, setViewingJob)}>View Job</button>
                  <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.75rem' }} onClick={() => toggleSave(j._id, isSaved)}>{isSaved ? '★ Saved' : '☆ Save'}</button>
                  <button type="button" className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.75rem' }} onClick={() => apply(j._id)}>Apply Now</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <JobDetailModal
        job={viewingJob}
        onClose={() => setViewingJob(null)}
        isSaved={viewingJob ? (savedIds.includes(viewingJob._id) || dash.savedJobs.some((s) => s._id === viewingJob._id)) : false}
        onToggleSave={toggleSave}
        onApply={(id) => { apply(id); setViewingJob(null); }}
      />

      {/* 4. Application Status */}
      <div className="dash-section-title"><h2>Application Status</h2></div>
      <div className="card" style={{ padding: 12, marginBottom: 20 }}>
        <Table
          headers={['Job', 'Company', 'Status', 'Applied']}
          rows={dash.applications.slice(0, 5).map((a) => [a.job?.title, a.job?.company, <Tag status={JOB_APP_STATUS[a.status]?.tag} label={JOB_APP_STATUS[a.status]?.label || a.status} />, new Date(a.createdAt).toLocaleDateString()])}
          empty="No applications yet."
        />
        <button type="button" className="btn mt-2" style={{ padding: '5px 14px', fontSize: '0.78rem' }} onClick={() => onNavigate?.('applications')}>View All Applications</button>
      </div>

      {/* 5. Upcoming Interviews */}
      <div className="dash-section-title"><h2>Upcoming Interviews</h2></div>
      <div className="card" style={{ padding: dash.upcomingInterviews.length === 0 ? 0 : 16, marginBottom: 20 }}>
        {dash.upcomingInterviews.length === 0 && (
          <div className="student-empty-state">
            <FaCalendarCheck aria-hidden="true" />
            <p>No interviews scheduled</p>
            <span>Applications that move forward will show their interview slot here.</span>
          </div>
        )}
        {dash.upcomingInterviews.map((i, idx) => {
          const st = INTERVIEW_STATUS[i.status] || INTERVIEW_STATUS.scheduled;
          return (
            <div key={i._id} className="flex items-center justify-between flex-wrap" style={{ gap: 12, padding: '14px 4px', borderBottom: idx < dash.upcomingInterviews.length - 1 ? '1px solid var(--sand-line)' : 'none' }}>
              <div>
                <strong className="text-sm">{i.job?.title}</strong>
                <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 4 }}>{i.job?.company}</p>
                <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 4 }}>
                  {new Date(i.scheduledDate).toLocaleDateString()} · {new Date(i.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {i.mode === 'physical' ? 'Physical' : 'Online'}
                </p>
                <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 4 }}>
                  {i.mode === 'physical' ? (i.location || 'Location to be confirmed') : (i.meetingLink || 'Meeting link to be shared')}
                </p>
                <span style={{ display: 'inline-block', marginTop: 8 }}><Tag status={st.tag} label={st.label} /></span>
              </div>
              {i.mode === 'online' && i.meetingLink
                ? <a className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.75rem', flexShrink: 0 }} href={i.meetingLink} target="_blank" rel="noreferrer">Join Interview</a>
                : <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.75rem', flexShrink: 0 }} onClick={() => recordJobView(i.job, setViewingJob)}>View Details</button>}
            </div>
          );
        })}
      </div>

      {/* 6. CV/Resume + Skills */}
      <div className="dash-section-title"><h2>CV / Resume</h2></div>
      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <div className="student-progress-row">
          <span>CV completeness</span>
          <strong>{dash.cvCompleteness}%</strong>
        </div>
        <progress className="student-progress-bar" max="100" value={dash.cvCompleteness} aria-label="CV completeness" />
        <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 14 }}>
          Uploaded CV: {dash.cvFileUrl ? <a href={dash.cvFileUrl} target="_blank" rel="noreferrer">View file</a> : 'Not uploaded'} · Last updated {dash.cvLastUpdated ? new Date(dash.cvLastUpdated).toLocaleDateString() : 'never'}
        </p>
        <div className="flex flex-wrap" style={{ gap: 8, marginTop: 14 }}>
          <button type="button" className="btn" style={{ padding: '6px 16px', fontSize: '0.78rem' }} onClick={() => onNavigate?.('resume')}>Upload CV</button>
          <button type="button" className="btn btn-primary" style={{ padding: '6px 16px', fontSize: '0.78rem' }} onClick={() => onNavigate?.('resume')}>{dash.cvCompleteness > 0 ? 'Update CV' : 'Build CV'}</button>
          <button type="button" className="btn" style={{ padding: '6px 16px', fontSize: '0.78rem' }} onClick={() => onNavigate?.('tools')}>AI CV Builder</button>
        </div>
      </div>

      {/* 7. Skills & Profile */}
      <div className="dash-section-title"><h2>Skills & Profile</h2></div>
      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <p style={jobLabelStyle}>Current skills</p>
        <div className="flex flex-wrap" style={{ gap: 8, marginTop: 10 }}>
          {dash.profile.skills.length === 0 && <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>No skills added yet.</span>}
          {dash.profile.skills.map((s) => <span key={s} className="text-xs" style={{ padding: '4px 12px', borderRadius: 999, background: 'var(--sand)', border: '1px solid var(--sand-line)' }}>{s}</span>)}
        </div>

        <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--sand-line)' }}>
          <p style={jobLabelStyle}>Missing / recommended skills</p>
          <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 4 }}>Based on skills most requested in currently open job postings.</p>
          <div className="flex flex-wrap" style={{ gap: 8, marginTop: 10 }}>
            {dash.profile.missingSkills.length === 0 && <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>Nothing missing — your CV covers the market's top requested skills.</span>}
            {dash.profile.missingSkills.map((s) => <span key={s} className="text-xs" style={{ padding: '4px 12px', borderRadius: 999, background: '#fef3c7', border: '1px solid #fde68a' }}>{s}</span>)}
          </div>
        </div>

        <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--sand-line)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 18 }}>
          <div>
            <p style={jobLabelStyle}>Education</p>
            {dash.profile.education.length === 0 && <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 6 }}>Not added yet.</p>}
            {dash.profile.education.map((ed, i) => <p key={i} className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 6 }}>{ed.degree}{ed.degree && ed.institution ? ' — ' : ''}{ed.institution}{ed.year ? ` (${ed.year})` : ''}</p>)}
          </div>
          <div>
            <p style={jobLabelStyle}>Work experience</p>
            {dash.profile.experience.length === 0 && <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 6 }}>Not added yet.</p>}
            {dash.profile.experience.map((ex, i) => <p key={i} className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 6 }}>{ex.title}{ex.title && ex.company ? ' at ' : ''}{ex.company}{ex.duration ? ` (${ex.duration})` : ''}</p>)}
          </div>
          <div>
            <p style={jobLabelStyle}>Certifications</p>
            {dash.profile.certifications.length === 0 && <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 6 }}>Not added yet.</p>}
            {dash.profile.certifications.length > 0 && <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 6 }}>{dash.profile.certifications.join(', ')}</p>}
          </div>
          <div>
            <p style={jobLabelStyle}>Portfolio</p>
            {dash.profile.portfolio.length === 0 && <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 6 }}>Not added yet.</p>}
            {dash.profile.portfolio.map((p, i) => <p key={i} className="text-xs" style={{ marginTop: 6 }}><a href={p.url} target="_blank" rel="noreferrer">{p.title || p.url}</a></p>)}
          </div>
          <div>
            <p style={jobLabelStyle}>LinkedIn profile</p>
            <p className="text-xs" style={{ marginTop: 6 }}>{dash.profile.linkedinUrl ? <a href={dash.profile.linkedinUrl} target="_blank" rel="noreferrer">{dash.profile.linkedinUrl}</a> : <span style={{ color: 'var(--ink-soft)' }}>Not added yet.</span>}</p>
          </div>
        </div>

        <button type="button" className="btn btn-primary" style={{ padding: '6px 16px', fontSize: '0.78rem', marginTop: 20 }} onClick={() => onNavigate?.('resume')}>Update Skills / Profile</button>
      </div>

      {/* Job Alerts (preview) */}
      <div className="dash-section-title"><h2>Job Alerts</h2></div>
      <div className="card" style={{ padding: (alerts?.length ?? 1) === 0 ? 0 : 16, marginBottom: 20 }}>
        {alerts === null && <p className="text-xs" style={{ color: 'var(--ink-soft)', padding: 16 }}>Loading...</p>}
        {alerts?.length === 0 && (
          <div className="student-empty-state">
            <FaBell aria-hidden="true" />
            <p>No saved alerts yet</p>
            <span>Set an alert so new matching jobs reach you first.</span>
          </div>
        )}
        {alerts?.slice(0, 3).map((a, i) => (
          <p key={a._id} className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: i === 0 ? 0 : 8 }}>
            {a.keywords || 'Any keyword'} · {[a.city, a.country].filter(Boolean).join(', ') || 'Any location'} — {a.matchCount} matching jobs now
          </p>
        ))}
        {(alerts === null || (alerts && alerts.length > 0)) && (
          <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.75rem', marginTop: 12 }} onClick={() => onNavigate?.('alerts')}>{alerts?.length > 0 ? 'Manage Alerts' : 'Set Job Alert'}</button>
        )}
        {alerts?.length === 0 && (
          <div style={{ padding: '0 16px 16px' }}>
            <button type="button" className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.75rem', width: '100%' }} onClick={() => onNavigate?.('alerts')}>Set Job Alert</button>
          </div>
        )}
      </div>

      {/* Messages / Notifications */}
      <div className="dash-section-title"><h2>Messages / Notifications</h2></div>
      <div className="grid grid-cols-1 md:grid-cols-2" style={{ marginBottom: 20, gap: 14 }}>
      <div className="card" style={{ padding: 16 }}>
        <p style={jobLabelStyle}>Messages</p>
        {conversations === null && <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 10 }}>Loading...</p>}
        {conversations?.length === 0 && (
          <div className="student-empty-state" style={{ minHeight: 100, padding: '20px 0' }}>
            <FaCommentDots aria-hidden="true" />
            <p>No conversations yet</p>
          </div>
        )}
        {conversations?.slice(0, 3).map((c, i) => (
          <p key={c.user._id} className="text-xs" style={{ color: c.unread > 0 ? 'var(--ink)' : 'var(--ink-soft)', fontWeight: c.unread > 0 ? 600 : 400, marginTop: i === 0 ? 10 : 8 }}>{c.user.fullName}{c.unread > 0 ? ` (${c.unread})` : ''} — {c.lastMessage}</p>
        ))}
        <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.75rem', marginTop: 14 }} onClick={() => onNavigate?.('messages')}>View Messages</button>
      </div>
      <div className="card" style={{ padding: dash.notifications.length === 0 ? 0 : 16 }}>
        {dash.notifications.length === 0 && (
          <div className="student-empty-state">
            <FaBell aria-hidden="true" />
            <p>No notifications yet</p>
          </div>
        )}
        {dash.notifications.map((n, idx) => (
          <div key={n._id} style={{ padding: '10px 0', borderBottom: idx < dash.notifications.length - 1 ? '1px solid var(--sand-line)' : 'none' }}>
            <div className="flex items-center justify-between" style={{ gap: 8 }}>
              <p className="text-xs" style={{ color: n.read ? 'var(--ink-soft)' : 'var(--ink)', fontWeight: n.read ? 400 : 600 }}>{n.title}</p>
              <span className="text-xs" style={{ color: 'var(--ink-soft)', whiteSpace: 'nowrap' }}>{new Date(n.createdAt).toLocaleDateString()}</span>
            </div>
            {n.body && <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 4 }}>{n.body}</p>}
          </div>
        ))}
        {dash.notifications.length > 0
          ? <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.75rem', marginTop: 12 }} onClick={() => onNavigate?.('notifications')}>View All</button>
          : <div style={{ padding: '0 16px 16px' }}><button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.75rem', width: '100%' }} onClick={() => onNavigate?.('notifications')}>View All</button></div>}
      </div>
      </div>

      {/* 12. Recent Activity */}
      <div className="dash-section-title"><h2>Recent Activity</h2></div>
      <div className="grid grid-cols-1 md:grid-cols-2" style={{ marginBottom: 20, gap: 14 }}>
        <div className="card" style={{ padding: 16 }}>
          <p style={jobLabelStyle}>Recently viewed jobs</p>
          {dash.recentActivity.recentlyViewedJobs.length === 0 && <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 8 }}>None yet — open a job's "View Job" to see it here.</p>}
          {dash.recentActivity.recentlyViewedJobs.map((v, i) => (
            <p key={i} className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 8 }}>{v.job?.title} @ {v.job?.company} — {new Date(v.viewedAt).toLocaleDateString()}</p>
          ))}
        </div>
        <div className="card" style={{ padding: 16 }}>
          <p style={jobLabelStyle}>Saved jobs</p>
          {dash.recentActivity.savedJobs.length === 0 && <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 8 }}>None yet.</p>}
          {dash.recentActivity.savedJobs.map((j) => (
            <p key={j._id} className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 8 }}>{j.title} @ {j.company}</p>
          ))}
        </div>
        <div className="card" style={{ padding: 16 }}>
          <p style={jobLabelStyle}>Submitted applications</p>
          {dash.recentActivity.submittedApplications.length === 0 && <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 8 }}>None yet.</p>}
          {dash.recentActivity.submittedApplications.map((a) => (
            <p key={a._id} className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 8 }}>{a.job?.title} @ {a.job?.company} — {new Date(a.createdAt).toLocaleDateString()}</p>
          ))}
        </div>
        <div className="card" style={{ padding: 16 }}>
          <p style={jobLabelStyle}>Updated CV/profile</p>
          <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 8 }}>
            {dash.recentActivity.cvLastUpdated ? `Last updated ${new Date(dash.recentActivity.cvLastUpdated).toLocaleDateString()}` : 'Never updated yet.'}
          </p>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <p style={jobLabelStyle}>Recent interviews</p>
          {dash.recentActivity.recentInterviews.length === 0 && <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 8 }}>None yet.</p>}
          {dash.recentActivity.recentInterviews.map((i) => {
            const st = INTERVIEW_STATUS[i.status] || INTERVIEW_STATUS.scheduled;
            return <p key={i._id} className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 8 }}>{i.job?.title} @ {i.job?.company} — {new Date(i.scheduledDate).toLocaleDateString()} ({st.label})</p>;
          })}
        </div>
        <div className="card" style={{ padding: 16 }}>
          <p style={jobLabelStyle}>Received offers</p>
          {dash.recentActivity.receivedOffers.length === 0 && <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 8 }}>None yet.</p>}
          {dash.recentActivity.receivedOffers.map((a) => (
            <p key={a._id} className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 8 }}>{a.job?.title} @ {a.job?.company}</p>
          ))}
        </div>
      </div>

      {/* 13. Quick Actions */}
      <QuickActions
        actions={[
          { label: 'Search Jobs', key: 'search' },
          { label: 'Upload CV', key: 'resume' },
          { label: 'Build Resume', key: 'resume' },
          { label: 'View Applications', key: 'applications' },
          { label: 'Practice Interview', key: 'tools' },
          { label: 'Update Profile', key: 'resume' },
          { label: 'View Messages', key: 'messages' },
          { label: 'Set Job Alert', key: 'alerts' }
        ]}
        onNavigate={(key) => onNavigate?.(key)}
      />
    </>
  );
}

function JobSearchPanel({ onFlash }) {
  const [jobs, setJobs] = useState(null);
  const [savedIds, setSavedIds] = useState([]);
  const [q, setQ] = useState('');
  const [coverLetters, setCoverLetters] = useState({});
  const [viewingJob, setViewingJob] = useState(null);

  function load() {
    apiRequest(`/jobs${q ? `?q=${encodeURIComponent(q)}` : ''}`).then(setJobs).catch((err) => onFlash(err.message));
    apiRequest('/jobs/mine/saved').then((list) => setSavedIds(list.map((j) => j._id))).catch(() => {});
  }
  useEffect(load, []);

  async function apply(jobId) {
    try {
      await apiRequest(`/jobs/${jobId}/apply`, { method: 'POST', body: { coverLetter: coverLetters[jobId] || '' } });
      onFlash('Application submitted.', 'success');
    } catch (err) { onFlash(err.message); }
  }

  async function toggleSave(jobId, isSaved) {
    try {
      await apiRequest(`/jobs/${jobId}/save`, { method: isSaved ? 'DELETE' : 'POST' });
      setSavedIds((prev) => (isSaved ? prev.filter((id) => id !== jobId) : [...prev, jobId]));
    } catch (err) { onFlash(err.message); }
  }

  return (
    <div>
      <form onSubmit={(e) => { e.preventDefault(); load(); }} className="flex gap-3 items-end mb-4 border border-[var(--sand-line)] rounded-xl p-3">
        <input className="form-input" placeholder="Search by title, company or skill" value={q} onChange={(e) => setQ(e.target.value)} />
        <button type="submit" className="btn btn-primary">Search</button>
      </form>
      {jobs === null && <p role="status" className="admin-notice">Loading...</p>}
      {jobs && jobs.length === 0 && <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>No open jobs found.</p>}
      <div className="grid grid-cols-1 gap-3">
        {(jobs || []).map((j) => {
          const isSaved = savedIds.includes(j._id);
          return (
            <div key={j._id} className="border border-[var(--sand-line)] rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <JobLogo job={j} />
                  <div><strong>{j.title}</strong><p className="text-xs text-[var(--ink-soft)]">{j.company} · {j.city ? `${j.city}, ` : ''}{j.country} · {WORK_MODE_LABEL[j.workMode] || 'Onsite'} · {j.type.replace('_', ' ')}{j.visaSponsorship ? ' · Visa sponsorship' : ''}</p></div>
                </div>
                <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>{formatSalary(j)}</span>
              </div>
              <div className="flex gap-2 items-end mt-2 flex-wrap">
                <input className="form-input" placeholder="Cover letter (optional)" value={coverLetters[j._id] || ''} onChange={(e) => setCoverLetters({ ...coverLetters, [j._id]: e.target.value })} style={{ maxWidth: 260 }} />
                <button type="button" className="btn" style={{ padding: '6px 16px', fontSize: '0.8rem' }} onClick={() => recordJobView(j, setViewingJob)}>View Job</button>
                <button type="button" className="btn btn-primary" style={{ padding: '6px 16px', fontSize: '0.8rem' }} onClick={() => apply(j._id)}>Apply</button>
                <button type="button" className="btn" style={{ padding: '6px 16px', fontSize: '0.8rem' }} onClick={() => toggleSave(j._id, isSaved)}>{isSaved ? '★ Saved' : '☆ Save'}</button>
              </div>
            </div>
          );
        })}
      </div>
      <JobDetailModal
        job={viewingJob}
        onClose={() => setViewingJob(null)}
        isSaved={viewingJob ? savedIds.includes(viewingJob._id) : false}
        onToggleSave={toggleSave}
        onApply={(id) => { apply(id); setViewingJob(null); }}
      />
    </div>
  );
}

// Student sidebar — Internship Center (Part 10.9): browse + apply reuses the same Job
// infrastructure (Job.type = 'internship' already exists), with a dedicated "My Internships"
// application-status view so internships don't get lost inside the general Jobs search.
function InternshipsPanel({ onFlash }) {
  const [sub, setSub] = useState('browse');
  const [internships, setInternships] = useState(null);
  const [applications, setApplications] = useState(null);
  const [savedIds, setSavedIds] = useState([]);
  const [viewingJob, setViewingJob] = useState(null);

  function load() {
    apiRequest('/jobs?type=internship').then(setInternships).catch((err) => onFlash(err.message));
    apiRequest('/jobs/mine/saved').then((list) => setSavedIds(list.map((j) => j._id))).catch(() => {});
    apiRequest('/jobs/mine/applications').then((apps) => setApplications(apps.filter((a) => a.job?.type === 'internship'))).catch(() => setApplications([]));
  }
  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function apply(jobId) {
    try { await apiRequest(`/jobs/${jobId}/apply`, { method: 'POST', body: {} }); onFlash('Application submitted.', 'success'); load(); } catch (err) { onFlash(err.message); }
  }
  async function toggleSave(jobId, isSaved) {
    try {
      await apiRequest(`/jobs/${jobId}/save`, { method: isSaved ? 'DELETE' : 'POST' });
      setSavedIds((prev) => (isSaved ? prev.filter((id) => id !== jobId) : [...prev, jobId]));
    } catch (err) { onFlash(err.message); }
  }

  const appliedJobIds = new Set((applications || []).map((a) => a.job?._id));
  const completedCount = (applications || []).filter((a) => a.status === 'hired').length;

  return (
    <div>
      <div className="flex items-center" style={{ gap: 12, marginBottom: 20 }}>
        <span style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--sand)', color: 'var(--gold)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><FaGraduationCap aria-hidden="true" size={16} /></span>
        <div>
          <h3 className="font-semibold" style={{ margin: 0 }}>Internships</h3>
          <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 2 }}>{applications === null ? 'Loading...' : `${applications.length} applied · ${completedCount} completed`}</p>
        </div>
      </div>

      <nav className="cz-tabbar" style={{ marginBottom: 20 }}>
        {[{ key: 'browse', label: 'Browse Internships' }, { key: 'applications', label: 'My Applications' }].map((t) => (
          <button key={t.key} type="button" aria-pressed={sub === t.key} className={`cz-tab${sub === t.key ? ' active' : ''}`} onClick={() => setSub(t.key)}>{t.label}</button>
        ))}
      </nav>

      {sub === 'browse' && (
        internships === null ? <p role="status" className="admin-notice">Loading...</p>
        : internships.length === 0 ? (
          <div className="student-empty-state" style={{ border: '1px solid var(--sand-line)', borderRadius: 18 }}>
            <FaGraduationCap aria-hidden="true" />
            <p>No internships posted yet</p>
            <span>Check back soon, or set a Job Alert for "internship" to get notified.</span>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {internships.map((j) => {
              const isSaved = savedIds.includes(j._id);
              const applied = appliedJobIds.has(j._id);
              return (
                <div key={j._id} className="hover-card card" style={{ padding: 16 }}>
                  <div className="flex items-start justify-between flex-wrap" style={{ gap: 12 }}>
                    <div className="flex items-start" style={{ gap: 12, minWidth: 0 }}>
                      <JobLogo job={j} />
                      <div style={{ minWidth: 0 }}>
                        <strong className="text-sm">{j.title}</strong>
                        <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 2 }}>{j.company} · {j.city ? `${j.city}, ` : ''}{j.country} · {WORK_MODE_LABEL[j.workMode] || 'Onsite'}{j.visaSponsorship ? ' · Visa sponsorship' : ''}</p>
                      </div>
                    </div>
                    <span className="text-xs" style={{ color: 'var(--ink-soft)', flexShrink: 0 }}>{formatSalary(j)}</span>
                  </div>
                  <div className="flex gap-2 items-center flex-wrap" style={{ marginTop: 12 }}>
                    <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.75rem' }} onClick={() => recordJobView(j, setViewingJob)}>View Details</button>
                    {applied
                      ? <Tag status="pending" label="Applied" />
                      : <button type="button" className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.75rem' }} onClick={() => apply(j._id)}>Apply</button>}
                    <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.75rem' }} onClick={() => toggleSave(j._id, isSaved)}>{isSaved ? '★ Saved' : '☆ Save'}</button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {sub === 'applications' && (
        applications === null ? <p role="status" className="admin-notice">Loading...</p>
        : applications.length === 0 ? (
          <div className="student-empty-state" style={{ border: '1px solid var(--sand-line)', borderRadius: 18 }}>
            <FaGraduationCap aria-hidden="true" />
            <p>No internship applications yet</p>
            <span>Browse internships and apply to see them here.</span>
          </div>
        ) : (
          <Table
            headers={['Internship', 'Company', 'Status', 'Applied']}
            rows={applications.map((a) => [
              a.job?.title, a.job?.company,
              <Tag status={JOB_APP_STATUS[a.status]?.tag} label={a.status === 'hired' ? 'Completed / Hired' : (JOB_APP_STATUS[a.status]?.label || a.status)} />,
              new Date(a.createdAt).toLocaleDateString()
            ])}
            empty="No internship applications yet."
          />
        )
      )}

      <JobDetailModal
        job={viewingJob}
        onClose={() => setViewingJob(null)}
        isSaved={viewingJob ? savedIds.includes(viewingJob._id) : false}
        onToggleSave={toggleSave}
        onApply={(id) => { apply(id); setViewingJob(null); }}
      />
    </div>
  );
}

function JobMyProfilePanel({ onFlash, onNavigate }) {
  const [dash, setDash] = useState(null);
  useEffect(() => { apiRequest('/jobs/mine/dashboard').then(setDash).catch((err) => onFlash(err.message)); }, [onFlash]);
  if (!dash) return <p role="status" className="admin-notice">Loading...</p>;
  const p = dash.profile;
  const labelStyle = { fontSize: 11, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--ink-soft)' };
  const notSet = <span style={{ color: 'var(--ink-soft)' }}>Not set</span>;
  return (
    <div className="card" style={{ padding: 20 }}>
      <div className="student-progress-row">
        <span>Profile completeness</span>
        <strong>{p.completeness}%</strong>
      </div>
      <progress className="student-progress-bar" max="100" value={p.completeness} aria-label="Profile completeness" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 18, marginTop: 20 }}>
        <div><p style={labelStyle}>Title</p><p className="text-sm" style={{ marginTop: 4 }}>{p.title || notSet}</p></div>
        <div><p style={labelStyle}>Location</p><p className="text-sm" style={{ marginTop: 4 }}>{p.location || notSet}</p></div>
        <div><p style={labelStyle}>Experience level</p><p className="text-sm" style={{ marginTop: 4 }}>{p.experienceLevel || notSet}</p></div>
        <div><p style={labelStyle}>LinkedIn</p><p className="text-sm" style={{ marginTop: 4 }}>{p.linkedinUrl ? <a href={p.linkedinUrl} target="_blank" rel="noreferrer">{p.linkedinUrl}</a> : <span style={{ color: 'var(--ink-soft)' }}>Not added yet</span>}</p></div>
      </div>

      <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--sand-line)' }}>
        <p style={labelStyle}>Skills</p>
        <div className="flex flex-wrap" style={{ gap: 8, marginTop: 10 }}>
          {p.skills.length === 0 && <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>None added yet</span>}
          {p.skills.map((s) => <span key={s} className="text-xs" style={{ padding: '4px 12px', borderRadius: 999, background: 'var(--sand)', border: '1px solid var(--sand-line)' }}>{s}</span>)}
        </div>
      </div>

      <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--sand-line)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18 }}>
        <div>
          <p style={labelStyle}>Education</p>
          {p.education.length === 0 && <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 6 }}>Not added yet.</p>}
          {p.education.map((ed, i) => <p key={i} className="text-xs" style={{ marginTop: 6 }}>{ed.degree} — {ed.institution} ({ed.year})</p>)}
        </div>
        <div>
          <p style={labelStyle}>Experience</p>
          {p.experience.length === 0 && <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 6 }}>Not added yet.</p>}
          {p.experience.map((ex, i) => <p key={i} className="text-xs" style={{ marginTop: 6 }}>{ex.title} at {ex.company} ({ex.duration})</p>)}
        </div>
        <div>
          <p style={labelStyle}>Certifications</p>
          <p className="text-xs" style={{ marginTop: 6, color: p.certifications.length ? 'var(--ink)' : 'var(--ink-soft)' }}>{p.certifications.length > 0 ? p.certifications.join(', ') : 'None added yet'}</p>
        </div>
      </div>

      <button type="button" className="btn btn-primary" style={{ padding: '6px 16px', fontSize: '0.78rem', marginTop: 20 }} onClick={() => onNavigate?.('resume')}>Edit Profile</button>
    </div>
  );
}

function RecommendedJobsPanel({ onFlash }) {
  const [dash, setDash] = useState(null);
  const [savedIds, setSavedIds] = useState([]);
  const [viewingJob, setViewingJob] = useState(null);

  function load() { apiRequest('/jobs/mine/dashboard').then(setDash).catch((err) => onFlash(err.message)); }
  useEffect(load, []);

  async function apply(jobId) {
    try { await apiRequest(`/jobs/${jobId}/apply`, { method: 'POST', body: {} }); onFlash('Application submitted.', 'success'); load(); } catch (err) { onFlash(err.message); }
  }
  async function toggleSave(jobId, isSaved) {
    try {
      await apiRequest(`/jobs/${jobId}/save`, { method: isSaved ? 'DELETE' : 'POST' });
      setSavedIds((prev) => (isSaved ? prev.filter((id) => id !== jobId) : [...prev, jobId]));
      load();
    } catch (err) { onFlash(err.message); }
  }

  if (!dash) return <p role="status" className="admin-notice">Loading...</p>;

  return (
    <div className="grid grid-cols-1 gap-3">
      {dash.recommendedJobs.length === 0 && <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>No recommendations yet — add skills to your CV to get matched jobs.</p>}
      {dash.recommendedJobs.map((j) => {
        const isSaved = savedIds.includes(j._id) || dash.savedJobs.some((s) => s._id === j._id);
        return (
          <div key={j._id} className="border border-[var(--sand-line)] rounded-xl p-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-start gap-3">
                <JobLogo job={j} />
                <div>
                  <strong className="text-sm">{j.title}</strong>
                  <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>{j.company} · {j.city ? `${j.city}, ` : ''}{j.country} · {WORK_MODE_LABEL[j.workMode] || 'Onsite'} · {j.type?.replace('_', ' ')}{j.visaSponsorship ? ' · Visa sponsorship' : ''}</p>
                  <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>{formatSalary(j)} · {j.experienceYears || 0}+ yrs exp · Posted {new Date(j.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button type="button" className="btn" style={{ padding: '5px 12px', fontSize: '0.75rem' }} onClick={() => recordJobView(j, setViewingJob)}>View Job</button>
                <button type="button" className="btn" style={{ padding: '5px 12px', fontSize: '0.75rem' }} onClick={() => toggleSave(j._id, isSaved)}>{isSaved ? '★ Saved' : '☆ Save'}</button>
                <button type="button" className="btn btn-primary" style={{ padding: '5px 12px', fontSize: '0.75rem' }} onClick={() => apply(j._id)}>Apply Now</button>
              </div>
            </div>
          </div>
        );
      })}
      <JobDetailModal job={viewingJob} onClose={() => setViewingJob(null)} isSaved={viewingJob ? (savedIds.includes(viewingJob._id) || dash.savedJobs.some((s) => s._id === viewingJob._id)) : false} onToggleSave={toggleSave} onApply={(id) => { apply(id); setViewingJob(null); }} />
    </div>
  );
}

function JobOffersPanel({ onFlash }) {
  const [applications, setApplications] = useState(null);
  useEffect(() => { apiRequest('/jobs/mine/applications').then(setApplications).catch((err) => onFlash(err.message)); }, [onFlash]);
  if (applications === null) return <p role="status" className="admin-notice">Loading...</p>;
  const offers = applications.filter((a) => a.status === 'hired');
  return (
    <Table
      headers={['Job', 'Company', 'Offer Received']}
      rows={offers.map((a) => [a.job?.title, a.job?.company, new Date(a.updatedAt).toLocaleDateString()])}
      empty="No job offers yet."
    />
  );
}

function PortfolioPanel({ onFlash, onNavigate }) {
  const [dash, setDash] = useState(null);
  useEffect(() => { apiRequest('/jobs/mine/dashboard').then(setDash).catch((err) => onFlash(err.message)); }, [onFlash]);
  if (!dash) return <p role="status" className="admin-notice">Loading...</p>;
  return (
    <div>
      {dash.profile.portfolio.length === 0 && (
        <div className="student-empty-state" style={{ border: '1px solid var(--sand-line)', borderRadius: 18, marginBottom: 16 }}>
          <FaBriefcase aria-hidden="true" />
          <p>No portfolio projects added yet</p>
          <span>Add project links with a title and description — shown on your CV.</span>
        </div>
      )}
      <div style={{ display: 'grid', gap: 12, marginBottom: dash.profile.portfolio.length > 0 ? 16 : 0 }}>
        {dash.profile.portfolio.map((p, i) => (
          <div key={i} className="border border-[var(--sand-line)] rounded-xl p-4">
            <strong className="text-sm"><a href={p.url} target="_blank" rel="noreferrer">{p.title || p.url}</a></strong>
            {p.description && <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 6 }}>{p.description}</p>}
          </div>
        ))}
      </div>
      <button type="button" className="btn btn-primary" style={{ padding: '6px 16px', fontSize: '0.78rem' }} onClick={() => onNavigate?.('resume')}>Add Project</button>
    </div>
  );
}

function CoverLettersPanel() {
  return (
    <div className="card" style={{ padding: 20 }}>
      <strong className="text-sm">Cover Letter Generator</strong>
      <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 6 }}>Optional AI feature — not built yet (needs a paid AI API), and never required to use the platform.</p>
    </div>
  );
}

function SavedJobsPanel({ onFlash }) {
  const [jobs, setJobs] = useState(null);
  function load() { apiRequest('/jobs/mine/saved').then(setJobs).catch((err) => onFlash(err.message)); }
  useEffect(load, []);

  async function remove(id) {
    try { await apiRequest(`/jobs/${id}/save`, { method: 'DELETE' }); load(); } catch (err) { onFlash(err.message); }
  }
  async function apply(id) {
    try { await apiRequest(`/jobs/${id}/apply`, { method: 'POST', body: {} }); onFlash('Application submitted.', 'success'); } catch (err) { onFlash(err.message); }
  }

  return (
    <Table
      loading={jobs === null}
      headers={['Job', 'Company', 'Type', 'Action']}
      rows={(jobs || []).map((j) => [
        j.title, j.company, j.type?.replace('_', ' '),
        <div className="flex gap-2">
          <button className="btn btn-primary" style={{ padding: '4px 12px', fontSize: '0.78rem' }} onClick={() => apply(j._id)}>Apply</button>
          <button className="btn" style={{ padding: '4px 12px', fontSize: '0.78rem' }} onClick={() => remove(j._id)}>Remove</button>
        </div>
      ])}
      empty="No saved jobs yet."
    />
  );
}

function MyApplicationsPanel({ onFlash }) {
  const [applications, setApplications] = useState(null);
  useEffect(() => { apiRequest('/jobs/mine/applications').then(setApplications).catch((err) => onFlash(err.message)); }, [onFlash]);

  return (
    <Table
      loading={applications === null}
      headers={['Job', 'Company', 'Status', 'Applied']}
      rows={(applications || []).map((a) => [a.job?.title, a.job?.company, <Tag status={JOB_APP_STATUS[a.status]?.tag} label={JOB_APP_STATUS[a.status]?.label || a.status} />, new Date(a.createdAt).toLocaleDateString()])}
      empty="No applications yet."
    />
  );
}

// Categorizes the shared /messages/conversations feed by the other person's real role —
// there's no separate "recruiter" role in this system, so education_agent (who can also post
// jobs, per job.controller's isRoleVerified check) is the honest stand-in for it.
function JobMessagesPanel({ onFlash }) {
  const [conversations, setConversations] = useState(null);
  const [interviews, setInterviews] = useState(null);
  const [activeUser, setActiveUser] = useState(null);
  const [thread, setThread] = useState(null);
  const [text, setText] = useState('');

  function load() {
    apiRequest('/messages/conversations').then(setConversations).catch((err) => onFlash(err.message));
    apiRequest('/jobs/mine/interviews').then(setInterviews).catch(() => setInterviews([]));
  }
  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  function openThread(u) {
    setActiveUser(u);
    setThread(null);
    apiRequest(`/messages/with/${u._id}`).then(setThread).catch((err) => onFlash(err.message));
    apiRequest(`/messages/with/${u._id}/read`, { method: 'PATCH' }).then(load).catch(() => {});
  }

  async function send(e) {
    e.preventDefault();
    if (!activeUser || !text.trim()) return;
    try {
      await apiRequest('/messages', { method: 'POST', body: { to: activeUser._id, text: text.trim() } });
      setText('');
      apiRequest(`/messages/with/${activeUser._id}`).then(setThread);
      load();
    } catch (err) { onFlash(err.message); }
  }

  if (conversations === null || interviews === null) return <p role="status" className="admin-notice">Loading...</p>;

  const hasRole = (u, role) => (u.roles || []).includes(role);
  const employerMsgs = conversations.filter((c) => hasRole(c.user, 'employer'));
  const recruiterMsgs = conversations.filter((c) => hasRole(c.user, 'education_agent'));
  const supportMsgs = conversations.filter((c) => hasRole(c.user, 'admin') || hasRole(c.user, 'super_admin') || hasRole(c.user, 'platform_staff'));
  const categorizedIds = new Set([...employerMsgs, ...recruiterMsgs, ...supportMsgs].map((c) => c.user._id));
  const otherMsgs = conversations.filter((c) => !categorizedIds.has(c.user._id));
  const totalUnread = conversations.reduce((sum, c) => sum + c.unread, 0);

  const msgLabelStyle = { fontSize: 11, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--ink-soft)' };

  function ConversationGroup({ title, items }) {
    if (items.length === 0) return null;
    return (
      <div style={{ marginBottom: 16 }}>
        <p style={msgLabelStyle}>{title}</p>
        <div className="dash-list" style={{ marginTop: 10 }}>
          {items.map((c) => (
            <div key={c.user._id} className={`dash-list-item${activeUser?._id === c.user._id ? ' unread' : ''}`} style={{ cursor: 'pointer' }} onClick={() => openThread(c.user)}>
              <span className="dash-list-icon c-forest" aria-hidden><FaUser size={14} /></span>
              <div className="dash-list-body"><div className="title">{c.user.fullName}{c.unread > 0 ? ` (${c.unread})` : ''}</div><div className="desc">{c.lastMessage}</div></div>
              <span className="dash-list-time">{new Date(c.lastAt).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <div className="flex items-center justify-between">
          <strong className="text-sm">Unread messages</strong>
          <strong style={{ fontSize: 24, fontFamily: 'Fraunces, serif' }}>{totalUnread}</strong>
        </div>
      </div>
      <div className="grid g2" style={{ gap: 20, alignItems: 'start' }}>
        <div>
          <div className="border border-[var(--sand-line)] rounded-xl p-4" style={{ marginBottom: 16 }}>
            <p style={msgLabelStyle}>Interview invitations</p>
            {interviews.length === 0 && <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 8 }}>None yet.</p>}
            {interviews.slice(0, 5).map((i) => {
              const st = INTERVIEW_STATUS[i.status] || INTERVIEW_STATUS.scheduled;
              return <p key={i._id} className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 8 }}>{i.job?.title} @ {i.job?.company} — {new Date(i.scheduledDate).toLocaleDateString()} ({st.label})</p>;
            })}
          </div>
          <ConversationGroup title="Employer / company messages" items={employerMsgs} />
          <ConversationGroup title="Recruiter messages" items={recruiterMsgs} />
          <ConversationGroup title="Support messages" items={supportMsgs} />
          <ConversationGroup title="Other messages" items={otherMsgs} />
          {conversations.length === 0 && (
            <div className="student-empty-state" style={{ border: '1px solid var(--sand-line)', borderRadius: 18 }}>
              <FaCommentDots aria-hidden="true" />
              <p>No conversations yet</p>
              <span>Employers message you here once you apply.</span>
            </div>
          )}
        </div>
        <div className="border border-[var(--sand-line)] rounded-xl p-4">
          <h3 className="font-semibold mb-2">{activeUser ? activeUser.fullName : 'Select a conversation'}</h3>
          {!activeUser && <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>Pick a conversation on the left to view and reply to messages.</p>}
          {activeUser && (
            <>
              <div className="card reveal in" style={{ padding: '8px 12px', marginBottom: 12, maxHeight: 320, overflowY: 'auto' }}>
                {thread === null && <p role="status" className="admin-notice">Loading...</p>}
                {thread && thread.length === 0 && <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>No messages yet.</p>}
                {(thread || []).map((m) => (
                  <div key={m._id} style={{ padding: '8px 4px', borderBottom: '1px solid var(--sand-line)' }}>
                    <div style={{ fontSize: 13 }}>{m.text}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-soft)' }}>{new Date(m.createdAt).toLocaleString()}</div>
                  </div>
                ))}
              </div>
              <form onSubmit={send} className="flex items-end" style={{ gap: 12 }}>
                <input className="form-input" placeholder="Type a message..." value={text} onChange={(e) => setText(e.target.value)} required style={{ flex: '1 1 auto', minWidth: 0 }} />
                <button type="submit" className="btn btn-primary" style={{ flexShrink: 0 }}>Send</button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function InterviewsPanel({ onFlash }) {
  const [interviews, setInterviews] = useState(null);
  const [viewingJob, setViewingJob] = useState(null);
  useEffect(() => { apiRequest('/jobs/mine/interviews').then(setInterviews).catch((err) => onFlash(err.message)); }, [onFlash]);

  if (interviews === null) return <p role="status" className="admin-notice">Loading...</p>;

  return (
    <div>
      <h3 className="font-semibold mb-2">Upcoming Interviews</h3>
      {interviews.length === 0 && <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>No interviews scheduled. Employers schedule these once you're shortlisted.</p>}
      {interviews.map((i) => {
        const st = INTERVIEW_STATUS[i.status] || INTERVIEW_STATUS.scheduled;
        return (
          <div key={i._id} className="border border-[var(--sand-line)] rounded-xl p-4 mb-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <strong className="text-sm">{i.job?.title}</strong>
                <p className="text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>{i.job?.company}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>
                  {new Date(i.scheduledDate).toLocaleDateString()} · {new Date(i.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>{i.mode === 'physical' ? `Physical — ${i.location || 'location TBD'}` : `Online — ${i.meetingLink || 'link to be shared'}`}</p>
                <Tag status={st.tag} label={st.label} />
              </div>
              {i.mode === 'online' && i.meetingLink
                ? <a className="btn btn-primary" style={{ padding: '6px 16px', fontSize: '0.8rem' }} href={i.meetingLink} target="_blank" rel="noreferrer">Join Interview</a>
                : <button type="button" className="btn" style={{ padding: '6px 16px', fontSize: '0.8rem' }} onClick={() => recordJobView(i.job, setViewingJob)}>View Details</button>}
            </div>
          </div>
        );
      })}
      <JobDetailModal job={viewingJob} onClose={() => setViewingJob(null)} />
    </div>
  );
}

function JobAlertsPanel({ onFlash }) {
  const [alerts, setAlerts] = useState(null);
  const [form, setForm] = useState({ keywords: '', country: '', city: '', remoteOnly: false, governmentOnly: false, internationalOnly: false, salaryMin: '' });

  function load() { apiRequest('/job-alerts/mine').then(setAlerts).catch((err) => onFlash(err.message)); }
  useEffect(load, []);

  async function create(e) {
    e.preventDefault();
    try {
      await apiRequest('/job-alerts', { method: 'POST', body: { ...form, country: form.country.toUpperCase(), salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined } });
      onFlash('Job alert saved.', 'success');
      setForm({ keywords: '', country: '', city: '', remoteOnly: false, governmentOnly: false, internationalOnly: false, salaryMin: '' });
      load();
    } catch (err) { onFlash(err.message); }
  }
  async function remove(id) {
    try { await apiRequest(`/job-alerts/${id}`, { method: 'DELETE' }); load(); } catch (err) { onFlash(err.message); }
  }

  return (
    <div>
      <h3 className="font-semibold mb-2">Job Alerts</h3>
      <p className="text-xs" style={{ color: 'var(--ink-soft)', marginBottom: 16 }}>Save a search once — we'll show how many currently-open jobs match it every time you check.</p>
      <form onSubmit={create} className="border border-[var(--sand-line)] rounded-xl p-4" style={{ display: 'grid', gap: 14, marginBottom: 20 }}>
        <div className="flex flex-wrap" style={{ gap: 12 }}>
          <input className="form-input" placeholder="Keywords" value={form.keywords} onChange={(e) => setForm({ ...form, keywords: e.target.value })} style={{ flex: '2 1 220px', minWidth: 0 }} />
          <input className="form-input" placeholder="Country code" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} style={{ flex: '1 1 110px', minWidth: 0 }} />
          <input className="form-input" placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} style={{ flex: '1 1 140px', minWidth: 0 }} />
          <input className="form-input" type="number" placeholder="Min salary" value={form.salaryMin} onChange={(e) => setForm({ ...form, salaryMin: e.target.value })} style={{ flex: '1 1 120px', minWidth: 0 }} />
        </div>
        <div className="flex flex-wrap items-center" style={{ gap: 18 }}>
          <label className="flex items-center text-xs" style={{ gap: 6 }}><input type="checkbox" checked={form.remoteOnly} onChange={(e) => setForm({ ...form, remoteOnly: e.target.checked })} /> Remote only</label>
          <label className="flex items-center text-xs" style={{ gap: 6 }}><input type="checkbox" checked={form.governmentOnly} onChange={(e) => setForm({ ...form, governmentOnly: e.target.checked })} /> Government only</label>
          <label className="flex items-center text-xs" style={{ gap: 6 }}><input type="checkbox" checked={form.internationalOnly} onChange={(e) => setForm({ ...form, internationalOnly: e.target.checked })} /> International (visa sponsorship)</label>
        </div>
        <button type="submit" className="btn btn-primary" style={{ padding: '6px 16px', fontSize: '0.78rem', justifySelf: 'start' }}>Save Alert</button>
      </form>
      <Table
        loading={alerts === null}
        headers={['Keywords', 'Location', 'Filters', 'Matching Jobs Now', 'Action']}
        rows={(alerts || []).map((a) => [
          a.keywords || 'Any', [a.city, a.country].filter(Boolean).join(', ') || 'Any', [a.remoteOnly && 'Remote', a.governmentOnly && 'Government', a.internationalOnly && 'International', a.salaryMin && `Min ${a.salaryMin}`].filter(Boolean).join(', ') || '—',
          a.matchCount, <button type="button" className="btn" style={{ padding: '4px 12px', fontSize: '0.75rem' }} onClick={() => remove(a._id)}>Remove</button>
        ])}
        empty="No saved alerts yet."
      />
    </div>
  );
}

const AI_PROVIDERS = [
  { value: 'openai', label: 'OpenAI (ChatGPT)' },
  { value: 'claude', label: 'Anthropic (Claude)' },
  { value: 'gemini', label: 'Google (Gemini)' },
  { value: 'deepseek', label: 'DeepSeek' }
];

const AI_PURPOSES = [
  { key: 'text', label: 'Text (notes, quiz, career advice...)', providers: AI_PROVIDERS },
  { key: 'image', label: 'Images / Graphics', providers: [{ value: 'openai', label: 'OpenAI (DALL-E)' }, { value: 'stability', label: 'Stability AI' }] },
  { key: 'threed', label: '3D Models', providers: [{ value: 'meshy', label: 'Meshy AI' }] },
  { key: 'voice', label: 'Voice (narration)', providers: [{ value: 'elevenlabs', label: 'ElevenLabs' }] },
  { key: 'avatar', label: 'Avatar Video', providers: [{ value: 'heygen', label: 'HeyGen' }] },
  { key: 'animation', label: 'Animation', providers: [{ value: 'runway', label: 'Runway ML' }] }
];

// Real BYOK AI settings (spec Part 14/17E, "AI Creative Teacher" Part 15B.6-15B.7) — CareerZ
// never supplies or bills AI itself. Each row below is a different AI category (text, image, 3D,
// voice, avatar-video) — connect only the ones you actually want to use, independently.
function AiSettingsPanel({ onFlash, onChanged, purposes = AI_PURPOSES }) {
  const [status, setStatus] = useState(null);
  const [forms, setForms] = useState({});
  const [saving, setSaving] = useState(null);

  function load() { apiRequest('/ai/config').then(setStatus).catch((err) => onFlash(err.message)); }
  useEffect(load, []);

  function formFor(purposeKey) {
    return forms[purposeKey] || { provider: purposes.find((p) => p.key === purposeKey)?.providers[0]?.value, apiKey: '' };
  }

  async function save(purposeKey, e) {
    e.preventDefault();
    const f = formFor(purposeKey);
    setSaving(purposeKey);
    try {
      await apiRequest('/ai/config', { method: 'PUT', body: { purpose: purposeKey, provider: f.provider, apiKey: f.apiKey } });
      onFlash('AI provider connected.', 'success');
      setForms((prev) => ({ ...prev, [purposeKey]: { ...f, apiKey: '' } }));
      load();
      onChanged?.();
    } catch (err) { onFlash(err.message); } finally { setSaving(null); }
  }

  async function remove(purposeKey) {
    try {
      await apiRequest(`/ai/config/${purposeKey}`, { method: 'DELETE' });
      onFlash('AI provider disconnected.', 'success');
      load();
      onChanged?.();
    } catch (err) { onFlash(err.message); }
  }

  if (!status) return <p role="status" className="admin-notice">Loading...</p>;

  return (
    <div className="card" style={{ padding: 20, marginBottom: 24 }}>
      <h4 className="font-semibold mb-2" style={{ fontSize: '0.9rem' }}>AI Provider Settings</h4>
      <p className="text-xs mb-3" style={{ color: 'var(--ink-soft)' }}>
        Bring your own API key per category below — CareerZ only connects to it, it never pays for or supplies AI itself. You're billed directly by whichever provider you choose. Connect only what you'll actually use.
      </p>
      <div className="space-y-3">
        {purposes.map((p) => {
          const s = status[p.key] || { configured: false };
          const f = formFor(p.key);
          return (
            <div key={p.key} style={{ paddingBottom: 10, borderBottom: '1px solid var(--sand-line)' }}>
              <p className="text-xs font-semibold mb-2">{p.label}</p>
              {s.configured ? (
                <div className="flex items-center gap-3 flex-wrap">
                  <Tag status="approved" label={`Connected: ${p.providers.find((x) => x.value === s.provider)?.label || s.provider}`} />
                  <button type="button" className="btn" style={{ padding: '4px 12px', fontSize: '0.75rem' }} onClick={() => remove(p.key)}>Disconnect</button>
                </div>
              ) : (
                <form onSubmit={(e) => save(p.key, e)} className="flex gap-2 flex-wrap items-end">
                  <CustomSelect value={f.provider} onChange={(v) => setForms((prev) => ({ ...prev, [p.key]: { ...f, provider: v } }))} ariaLabel={`${p.label} provider`} minWidth={170} options={p.providers} />
                  <input type="password" className="form-input" placeholder="Your API key" value={f.apiKey} onChange={(e) => setForms((prev) => ({ ...prev, [p.key]: { ...f, apiKey: e.target.value } }))} required style={{ minWidth: 200, fontSize: '0.8rem' }} />
                  <button type="submit" className="btn btn-primary" style={{ padding: '5px 12px', fontSize: '0.75rem' }} disabled={saving === p.key}>{saving === p.key ? 'Saving...' : 'Connect'}</button>
                </form>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// One AI-powered tool, real end to end — calls the user's own connected provider via
// POST /ai/generate. Disabled until AiSettingsPanel reports a provider connected.
function AiFeatureCard({ feature, title, description, placeholder, aiEnabled }) {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function generate(e) {
    e.preventDefault();
    setLoading(true); setError(''); setResult('');
    try {
      const { result: text } = await apiRequest('/ai/generate', { method: 'POST', body: { feature, prompt } });
      setResult(text);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  }

  return (
    <div className="card" style={{ padding: 18 }}>
      <strong className="text-sm">{title}</strong>
      <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 6 }}>{description}</p>
      {!open ? (
        <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.78rem', marginTop: 12 }} onClick={() => setOpen(true)} disabled={!aiEnabled}>
          {aiEnabled ? 'Open' : 'Connect an AI provider above first'}
        </button>
      ) : (
        <form onSubmit={generate} style={{ marginTop: 12 }}>
          <textarea className="form-input" rows={3} placeholder={placeholder} value={prompt} onChange={(e) => setPrompt(e.target.value)} required />
          <div className="flex gap-2" style={{ marginTop: 8 }}>
            <button type="submit" className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.78rem' }} disabled={loading}>{loading ? 'Generating...' : 'Generate'}</button>
            <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.78rem' }} onClick={() => setOpen(false)}>Close</button>
          </div>
          {error && <p className="text-xs" style={{ color: 'var(--rose)', marginTop: 8 }}>{error}</p>}
          {result && <div className="text-sm" style={{ marginTop: 12, padding: 12, background: 'var(--sand)', borderRadius: 10, whiteSpace: 'pre-wrap' }}>{result}</div>}
        </form>
      )}
    </div>
  );
}

// Parses the AI's delimited slide format (see ai.controller.js's teacher_slides prompt) into
// real slide objects — deliberately not JSON, since that isn't uniformly reliable across all 4
// BYOK providers, while this plain-text delimiter format parses the same regardless of provider.
function parseSlides(raw) {
  return raw.split('---SLIDE---').map((part) => part.trim()).filter(Boolean).map((part) => {
    const lines = part.split('\n').map((l) => l.trim()).filter(Boolean);
    const titleLine = lines.find((l) => /^title:/i.test(l));
    const title = titleLine ? titleLine.replace(/^title:\s*/i, '') : 'Untitled Slide';
    const bullets = lines.filter((l) => l.startsWith('-')).map((l) => l.replace(/^-\s*/, ''));
    return { title, bullets };
  }).filter((s) => s.title !== 'Untitled Slide' || s.bullets.length > 0);
}

// Real AI Slides Generator (spec 15B.6 "خودکار پریزنٹیشن سلائیڈز") — the one sub-feature of "AI
// Creative Teacher" buildable with the existing text-AI system (no image/video/3D AI provider
// needed). Produces an actual presentable, fullscreen-able slide deck, not just a text blob.
function SlideDeckGenerator({ aiEnabled }) {
  const [topic, setTopic] = useState('');
  const [slides, setSlides] = useState(null);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const viewerRef = useRef(null);

  async function generate(e) {
    e.preventDefault();
    setLoading(true); setError(''); setSlides(null);
    try {
      const { result } = await apiRequest('/ai/generate', { method: 'POST', body: { feature: 'teacher_slides', prompt: topic } });
      const parsed = parseSlides(result);
      if (parsed.length === 0) throw new Error("Couldn't parse slides from the response — try again.");
      setSlides(parsed);
      setCurrent(0);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  }

  useEffect(() => {
    if (!slides) return;
    function onKey(e) {
      if (e.key === 'ArrowRight') setCurrent((c) => Math.min(slides.length - 1, c + 1));
      if (e.key === 'ArrowLeft') setCurrent((c) => Math.max(0, c - 1));
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [slides]);

  return (
    <div className="card" style={{ padding: 18 }}>
      <strong className="text-sm">AI Slides Generator</strong>
      <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 6 }}>Give a topic — get a real slide deck you can present fullscreen in class (use arrow keys to navigate).</p>
      {!aiEnabled ? (
        <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 12 }}>Connect an AI provider above first.</p>
      ) : (
        <form onSubmit={generate} style={{ marginTop: 12 }}>
          <input className="form-input" placeholder="e.g. The Water Cycle, Grade 5" value={topic} onChange={(e) => setTopic(e.target.value)} required />
          <button type="submit" className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.78rem', marginTop: 8 }} disabled={loading}>{loading ? 'Generating...' : 'Generate Slides'}</button>
          {error && <p className="text-xs" style={{ color: 'var(--rose)', marginTop: 8 }}>{error}</p>}
        </form>
      )}

      {slides && (
        <div style={{ marginTop: 16 }}>
          <div ref={viewerRef} style={{ position: 'relative', background: '#1a2332', color: '#fff', borderRadius: 14, padding: '48px 56px', minHeight: 260, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h2 style={{ fontSize: 28, marginBottom: 20, fontFamily: 'Fraunces, serif' }}>{slides[current].title}</h2>
            <ul style={{ fontSize: 18, lineHeight: 1.9, paddingLeft: 24 }}>
              {slides[current].bullets.map((b, i) => <li key={i}>{b}</li>)}
            </ul>
            <span style={{ position: 'absolute', bottom: 16, right: 24, fontSize: 12, opacity: 0.6 }}>{current + 1} / {slides.length}</span>
          </div>
          <div className="flex items-center gap-2" style={{ marginTop: 10 }}>
            <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.78rem' }} onClick={() => setCurrent((c) => Math.max(0, c - 1))} disabled={current === 0}>← Previous</button>
            <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.78rem' }} onClick={() => setCurrent((c) => Math.min(slides.length - 1, c + 1))} disabled={current === slides.length - 1}>Next →</button>
            <button type="button" className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.78rem' }} onClick={() => viewerRef.current?.requestFullscreen?.()}>⛶ Present Fullscreen</button>
          </div>
        </div>
      )}
    </div>
  );
}

// AI Creative Teacher — Graphics/Images (spec 15B.6). Real DALL-E/Stability call, shows the
// actual generated image (returned as a data URI, nothing faked or placeholder).
function ImageGenerator({ aiEnabled, onFlash }) {
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  async function generate(e) {
    e.preventDefault();
    setLoading(true); setImage(null);
    try {
      const { imageDataUrl } = await apiRequest('/ai/image', { method: 'POST', body: { prompt } });
      setImage(imageDataUrl);
    } catch (err) { onFlash(err.message); } finally { setLoading(false); }
  }

  return (
    <div className="card" style={{ padding: 18 }}>
      <strong className="text-sm">AI Graphics / Image Generator</strong>
      <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 6 }}>Describe a diagram, chart or illustration for class.</p>
      {!aiEnabled ? (
        <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 12 }}>Connect an Image AI provider above first.</p>
      ) : (
        <form onSubmit={generate} style={{ marginTop: 12 }}>
          <input className="form-input" placeholder="e.g. Diagram of the human heart with labeled chambers" value={prompt} onChange={(e) => setPrompt(e.target.value)} required />
          <button type="submit" className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.78rem', marginTop: 8 }} disabled={loading}>{loading ? 'Generating (can take ~20s)...' : 'Generate Image'}</button>
          {image && <img src={image} alt={prompt} style={{ marginTop: 12, borderRadius: 10, maxWidth: '100%' }} />}
        </form>
      )}
    </div>
  );
}

// AI Creative Teacher — 3D Models (spec 15B.6, Meshy AI). Async job: create then poll. Renders
// the real returned GLB model with Three.js — not just a download link.
function ThreeDModelGenerator({ aiEnabled, onFlash }) {
  const [prompt, setPrompt] = useState('');
  const [taskId, setTaskId] = useState(null);
  const [status, setStatus] = useState(null);
  const [modelUrl, setModelUrl] = useState(null);
  const viewerRef = useRef(null);

  async function start(e) {
    e.preventDefault();
    setStatus('PENDING'); setModelUrl(null);
    try {
      const { taskId: id } = await apiRequest('/ai/3d-model', { method: 'POST', body: { prompt } });
      setTaskId(id);
    } catch (err) { onFlash(err.message); setStatus(null); }
  }

  useEffect(() => {
    if (!taskId || !status || ['SUCCEEDED', 'FAILED'].includes(status)) return;
    const timer = setTimeout(async () => {
      try {
        const s = await apiRequest(`/ai/3d-model/${taskId}`);
        setStatus(s.status);
        if (s.status === 'SUCCEEDED') setModelUrl(s.modelUrl);
        if (s.status === 'FAILED') onFlash('3D model generation failed.');
      } catch (err) { onFlash(err.message); setStatus('FAILED'); }
    }, 4000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId, status]);

  useEffect(() => {
    if (!modelUrl || !viewerRef.current) return;
    let renderer, frameId;
    (async () => {
      const THREE = await import('three');
      const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
      const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');
      const mount = viewerRef.current;
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xf3f0ea);
      const camera = new THREE.PerspectiveCamera(45, mount.clientWidth / 320, 0.1, 1000);
      camera.position.set(2, 2, 2);
      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(mount.clientWidth, 320);
      mount.innerHTML = '';
      mount.appendChild(renderer.domElement);
      const controls = new OrbitControls(camera, renderer.domElement);
      scene.add(new THREE.AmbientLight(0xffffff, 0.8));
      const light = new THREE.DirectionalLight(0xffffff, 0.8); light.position.set(3, 5, 2); scene.add(light);
      new GLTFLoader().load(modelUrl, (gltf) => scene.add(gltf.scene));
      function animate() { frameId = requestAnimationFrame(animate); controls.update(); renderer.render(scene, camera); }
      animate();
    })();
    return () => { cancelAnimationFrame(frameId); renderer?.dispose(); };
  }, [modelUrl]);

  return (
    <div className="card" style={{ padding: 18 }}>
      <strong className="text-sm">AI 3D Model Generator</strong>
      <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 6 }}>Describe an object for a 3D science/geography lesson — takes 1-3 minutes.</p>
      {!aiEnabled ? (
        <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 12 }}>Connect a 3D AI provider above first.</p>
      ) : (
        <form onSubmit={start} style={{ marginTop: 12 }}>
          <input className="form-input" placeholder="e.g. A human heart, anatomically accurate" value={prompt} onChange={(e) => setPrompt(e.target.value)} required />
          <button type="submit" className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.78rem', marginTop: 8 }} disabled={status && !['SUCCEEDED', 'FAILED'].includes(status)}>
            {status && !['SUCCEEDED', 'FAILED'].includes(status) ? `Generating (${status})...` : 'Generate 3D Model'}
          </button>
          {modelUrl && <div ref={viewerRef} style={{ marginTop: 12, borderRadius: 10, overflow: 'hidden', border: '1px solid var(--sand-line)' }} />}
        </form>
      )}
    </div>
  );
}

// AI Creative Teacher — Voice narration (ElevenLabs) and Avatar Video (HeyGen). Two separate,
// self-contained pipelines — HeyGen synthesizes its own voice internally, it doesn't need a
// separate ElevenLabs call chained in.
// AI Creative Teacher — Animation (spec 15B.6, Runway ML). Async job: create then poll. Runway's
// output URLs expire in 24-48h, so the video is offered as a real download, not just a link.
function AnimationGenerator({ aiEnabled, onFlash }) {
  const [promptText, setPromptText] = useState('');
  const [promptImage, setPromptImage] = useState('');
  const [taskId, setTaskId] = useState(null);
  const [status, setStatus] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);

  async function start(e) {
    e.preventDefault();
    setStatus('PENDING'); setVideoUrl(null);
    try {
      const { taskId: id } = await apiRequest('/ai/animation', { method: 'POST', body: { promptText, promptImage: promptImage || undefined } });
      setTaskId(id);
    } catch (err) { onFlash(err.message); setStatus(null); }
  }

  useEffect(() => {
    if (!taskId || !status || ['SUCCEEDED', 'FAILED'].includes(status)) return;
    const timer = setTimeout(async () => {
      try {
        const s = await apiRequest(`/ai/animation/${taskId}`);
        setStatus(s.status);
        if (s.status === 'SUCCEEDED') setVideoUrl(s.videoUrl);
        if (s.status === 'FAILED') onFlash('Animation generation failed.');
      } catch (err) { onFlash(err.message); setStatus('FAILED'); }
    }, 5000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId, status]);

  return (
    <div className="card" style={{ padding: 18 }}>
      <strong className="text-sm">AI Animation Generator</strong>
      <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 6 }}>Describe a moving animation (e.g. a chemical reaction, a physics principle). Takes 1-2 minutes. Download the result — the link expires in 24-48h.</p>
      {!aiEnabled ? (
        <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 12 }}>Connect an Animation AI provider above first.</p>
      ) : (
        <form onSubmit={start} style={{ marginTop: 12 }}>
          <input className="form-input" placeholder="e.g. A water molecule forming from hydrogen and oxygen atoms" value={promptText} onChange={(e) => setPromptText(e.target.value)} required />
          <input className="form-input" placeholder="Optional: public image URL to animate from" value={promptImage} onChange={(e) => setPromptImage(e.target.value)} style={{ marginTop: 8 }} />
          <button type="submit" className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.78rem', marginTop: 8 }} disabled={status && !['SUCCEEDED', 'FAILED'].includes(status)}>
            {status && !['SUCCEEDED', 'FAILED'].includes(status) ? `Generating (${status})...` : 'Generate Animation'}
          </button>
          {videoUrl && (
            <div style={{ marginTop: 12 }}>
              <video controls src={videoUrl} style={{ width: '100%', borderRadius: 10 }} />
              <a href={videoUrl} download className="btn" style={{ padding: '5px 12px', fontSize: '0.75rem', marginTop: 8, display: 'inline-block' }}>Download before it expires</a>
            </div>
          )}
        </form>
      )}
    </div>
  );
}

function VoiceAndAvatarGenerator({ aiEnabled, onFlash }) {
  const [narrationText, setNarrationText] = useState('');
  const [audio, setAudio] = useState(null);
  const [narrating, setNarrating] = useState(false);

  const [script, setScript] = useState('');
  const [videoId, setVideoId] = useState(null);
  const [videoStatus, setVideoStatus] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);

  async function generateNarration(e) {
    e.preventDefault();
    setNarrating(true); setAudio(null);
    try {
      const { audioDataUrl } = await apiRequest('/ai/voice', { method: 'POST', body: { text: narrationText } });
      setAudio(audioDataUrl);
    } catch (err) { onFlash(err.message); } finally { setNarrating(false); }
  }

  async function startAvatarVideo(e) {
    e.preventDefault();
    setVideoStatus('processing'); setVideoUrl(null);
    try {
      const { videoId: id } = await apiRequest('/ai/avatar-video', { method: 'POST', body: { script } });
      setVideoId(id);
    } catch (err) { onFlash(err.message); setVideoStatus(null); }
  }

  useEffect(() => {
    if (!videoId || !videoStatus || ['completed', 'failed'].includes(videoStatus)) return;
    const timer = setTimeout(async () => {
      try {
        const s = await apiRequest(`/ai/avatar-video/${videoId}`);
        setVideoStatus(s.status);
        if (s.status === 'completed') setVideoUrl(s.videoUrl);
      } catch (err) { onFlash(err.message); setVideoStatus('failed'); }
    }, 5000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId, videoStatus]);

  return (
    <>
      <div className="card" style={{ padding: 18 }}>
        <strong className="text-sm">AI Voice Narration</strong>
        <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 6 }}>Type narration text — get real speech audio to play over slides.</p>
        {!aiEnabled?.voice ? (
          <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 12 }}>Connect a Voice AI provider above first.</p>
        ) : (
          <form onSubmit={generateNarration} style={{ marginTop: 12 }}>
            <textarea className="form-input" rows={2} placeholder="Text to narrate..." value={narrationText} onChange={(e) => setNarrationText(e.target.value)} required />
            <button type="submit" className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.78rem', marginTop: 8 }} disabled={narrating}>{narrating ? 'Generating...' : 'Generate Narration'}</button>
            {audio && <audio controls src={audio} style={{ display: 'block', marginTop: 12, width: '100%' }} />}
          </form>
        )}
      </div>

      <div className="card" style={{ padding: 18 }}>
        <strong className="text-sm">AI Avatar Video</strong>
        <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 6 }}>Type a script — get a full talking-avatar educational video (takes a few minutes).</p>
        {!aiEnabled?.avatar ? (
          <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 12 }}>Connect an Avatar Video AI provider above first.</p>
        ) : (
          <form onSubmit={startAvatarVideo} style={{ marginTop: 12 }}>
            <textarea className="form-input" rows={2} placeholder="What should the avatar say?" value={script} onChange={(e) => setScript(e.target.value)} required />
            <button type="submit" className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.78rem', marginTop: 8 }} disabled={videoStatus && !['completed', 'failed'].includes(videoStatus)}>
              {videoStatus && !['completed', 'failed'].includes(videoStatus) ? `Generating (${videoStatus})...` : 'Generate Avatar Video'}
            </button>
            {videoUrl && <video controls src={videoUrl} style={{ display: 'block', marginTop: 12, width: '100%', borderRadius: 10 }} />}
          </form>
        )}
      </div>
    </>
  );
}

function CareerToolsPanel({ onFlash, onNavigate }) {
  const [missingSkills, setMissingSkills] = useState(null);
  const [aiEnabled, setAiEnabled] = useState(false);
  useEffect(() => { apiRequest('/jobs/mine/dashboard').then((d) => setMissingSkills(d.profile.missingSkills || [])).catch(() => setMissingSkills([])); }, []);
  function refreshAi() { apiRequest('/ai/config').then((s) => setAiEnabled(s.text.configured)).catch(() => {}); }
  useEffect(refreshAi, []);

  return (
    <div>
      <h3 className="font-semibold mb-3">Career Tools</h3>
      <AiSettingsPanel onFlash={onFlash} onChanged={refreshAi} purposes={[AI_PURPOSES[0]]} />
      <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 14 }}>
        <div className="card" style={{ padding: 18 }}>
          <strong className="text-sm">Portfolio Builder</strong>
          <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 6 }}>Add project links with a title and description — shown on your CV.</p>
          <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.78rem', marginTop: 12 }} onClick={() => onNavigate?.('resume')}>Open in CV / Resume</button>
        </div>
        <div className="card" style={{ padding: 18 }}>
          <strong className="text-sm">Skill Recommendations</strong>
          <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 6 }}>Real signal from what's most requested in currently open job postings — not AI-generated.</p>
          {missingSkills === null && <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 10 }}>Loading...</p>}
          {missingSkills?.length === 0 && <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 10 }}>Nothing missing — your CV covers the market's top requested skills.</p>}
          {missingSkills?.length > 0 && (
            <div className="flex flex-wrap" style={{ gap: 8, marginTop: 10 }}>
              {missingSkills.map((s) => <span key={s} className="text-xs" style={{ padding: '4px 12px', borderRadius: 999, background: '#fef3c7', border: '1px solid #fde68a' }}>{s}</span>)}
            </div>
          )}
          <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.78rem', marginTop: 12 }} onClick={() => onNavigate?.('resume')}>Add Skills to CV</button>
        </div>
        <AiFeatureCard feature="cv_feedback" title="AI CV Feedback" description="Paste your CV text and get specific improvement feedback." placeholder="Paste your CV text here..." aiEnabled={aiEnabled} />
        <AiFeatureCard feature="cover_letter" title="Cover Letter Generator" description="Describe the job and your background — get a draft cover letter." placeholder="Job title, company, and a bit about your background..." aiEnabled={aiEnabled} />
        <AiFeatureCard feature="linkedin_optimize" title="LinkedIn Optimizer" description="Paste your current headline/summary — get a stronger rewrite." placeholder="Paste your LinkedIn headline or summary..." aiEnabled={aiEnabled} />
        <AiFeatureCard feature="interview_coach" title="AI Interview Coach" description="Get likely interview questions and tips for a specific role." placeholder="What role are you interviewing for?" aiEnabled={aiEnabled} />
        <AiFeatureCard feature="career_advice" title="Career Coach" description="Describe your interests/situation for practical career guidance." placeholder="Tell it about your interests, skills, and goals..." aiEnabled={aiEnabled} />
      </div>
    </div>
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

  function updateRow(field, index, key, value) {
    const rows = [...(resume[field] || [])];
    rows[index] = { ...rows[index], [key]: value };
    setResume({ ...resume, [field]: rows });
  }
  function addRow(field, blank) { setResume({ ...resume, [field]: [...(resume[field] || []), blank] }); }
  function removeRow(field, index) { setResume({ ...resume, [field]: resume[field].filter((_, i) => i !== index) }); }

  if (!resume) return <p role="status" className="admin-notice">Loading...</p>;

  const sectionLabel = { fontSize: 11, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--ink-soft)' };

  const publicUrl = `${window.location.origin}/portfolio/${resume.user}`;

  return (
    <form onSubmit={save} style={{ display: 'grid', gap: 18 }}>
      <div className="card" style={{ padding: 20 }}>
        <div className="flex items-center justify-between flex-wrap" style={{ gap: 14 }}>
          <div>
            <p style={sectionLabel}>Career Portfolio Visibility</p>
            <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 6, lineHeight: 1.6 }}>{resume.isPublic ? 'Anyone with the link can view your public portfolio.' : 'Your portfolio is private — only you can see it.'}</p>
            {resume.isPublic && <a href={publicUrl} target="_blank" rel="noreferrer" className="text-xs" style={{ color: 'var(--emerald)', display: 'inline-block', marginTop: 6, overflowWrap: 'anywhere' }}>{publicUrl} ↗</a>}
          </div>
          <label className="flex items-center" style={{ gap: 10, flexShrink: 0, cursor: 'pointer' }}>
            <span className="text-xs" style={{ fontWeight: 600 }}>{resume.isPublic ? 'Public' : 'Private'}</span>
            <input type="checkbox" checked={!!resume.isPublic} onChange={(e) => setResume({ ...resume, isPublic: e.target.checked })} />
          </label>
        </div>
      </div>

      <div className="card" style={{ padding: 20 }}>
        <p style={sectionLabel}>Uploaded CV file</p>
        <input className="form-input" placeholder="Paste a direct link to your CV file (PDF, Google Drive, etc.)" value={resume.cvFileUrl || ''} onChange={(e) => setResume({ ...resume, cvFileUrl: e.target.value })} style={{ marginTop: 10 }} />
        <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 8 }}>
          No file storage is wired up yet — upload your CV somewhere (Google Drive, Dropbox, etc.) and paste the direct link here.
          {resume.cvFileUrl && <> · <a href={resume.cvFileUrl} target="_blank" rel="noreferrer">View current file</a></>}
        </p>
      </div>

      <div className="card" style={{ padding: 20, display: 'grid', gap: 14 }}>
        <p style={sectionLabel}>Basic Info</p>
        <input className="form-input" placeholder="Headline / Professional title (e.g. Frontend Developer)" value={resume.headline} onChange={(e) => setResume({ ...resume, headline: e.target.value })} />
        <textarea className="form-input" placeholder="Summary" rows={3} value={resume.summary} onChange={(e) => setResume({ ...resume, summary: e.target.value })} />
        <div className="flex flex-wrap" style={{ gap: 12 }}>
          <input className="form-input" placeholder="Current location (city, country)" value={resume.location || ''} onChange={(e) => setResume({ ...resume, location: e.target.value })} style={{ flex: '1 1 220px', minWidth: 0 }} />
          <select className="form-select" value={resume.experienceLevel || ''} onChange={(e) => setResume({ ...resume, experienceLevel: e.target.value })} style={{ flex: '1 1 200px', minWidth: 0 }}>
            <option value="">Experience level</option>
            <option value="entry">Entry level</option>
            <option value="mid">Mid level</option>
            <option value="senior">Senior</option>
            <option value="lead">Lead / Manager</option>
          </select>
        </div>
        <input className="form-input" placeholder="LinkedIn profile URL" value={resume.linkedinUrl || ''} onChange={(e) => setResume({ ...resume, linkedinUrl: e.target.value })} />
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
      </div>

      <div className="card" style={{ padding: 20 }}>
        <p style={sectionLabel}>Education</p>
        <div style={{ display: 'grid', gap: 10, marginTop: 14 }}>
          {(resume.education || []).map((ed, i) => (
            <div key={i} className="border border-[var(--sand-line)] rounded-xl p-3 flex flex-wrap items-start" style={{ gap: 10 }}>
              <input className="form-input" placeholder="Institution" value={ed.institution || ''} onChange={(e) => updateRow('education', i, 'institution', e.target.value)} style={{ flex: '2 1 180px', minWidth: 0 }} />
              <input className="form-input" placeholder="Degree" value={ed.degree || ''} onChange={(e) => updateRow('education', i, 'degree', e.target.value)} style={{ flex: '2 1 160px', minWidth: 0 }} />
              <input className="form-input" placeholder="Year" value={ed.year || ''} onChange={(e) => updateRow('education', i, 'year', e.target.value)} style={{ flex: '1 1 90px', minWidth: 0 }} />
              <button type="button" className="btn" style={{ padding: '6px 10px', fontSize: '0.75rem', flexShrink: 0 }} onClick={() => removeRow('education', i)}>Remove</button>
            </div>
          ))}
        </div>
        <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.78rem', marginTop: 14 }} onClick={() => addRow('education', { institution: '', degree: '', year: '' })}>+ Add Education</button>
      </div>

      <div className="card" style={{ padding: 20 }}>
        <p style={sectionLabel}>Experience</p>
        <div style={{ display: 'grid', gap: 10, marginTop: 14 }}>
          {(resume.experience || []).map((ex, i) => (
            <div key={i} className="border border-[var(--sand-line)] rounded-xl p-3">
              <div className="flex flex-wrap" style={{ gap: 10, marginBottom: 10 }}>
                <input className="form-input" placeholder="Job title" value={ex.title || ''} onChange={(e) => updateRow('experience', i, 'title', e.target.value)} style={{ flex: '1 1 160px', minWidth: 0 }} />
                <input className="form-input" placeholder="Company" value={ex.company || ''} onChange={(e) => updateRow('experience', i, 'company', e.target.value)} style={{ flex: '1 1 160px', minWidth: 0 }} />
                <input className="form-input" placeholder="Duration (e.g. 2022–2024)" value={ex.duration || ''} onChange={(e) => updateRow('experience', i, 'duration', e.target.value)} style={{ flex: '1 1 140px', minWidth: 0 }} />
              </div>
              <textarea className="form-input" placeholder="Description" rows={2} value={ex.description || ''} onChange={(e) => updateRow('experience', i, 'description', e.target.value)} />
              <button type="button" className="btn" style={{ padding: '6px 10px', fontSize: '0.75rem', marginTop: 10 }} onClick={() => removeRow('experience', i)}>Remove</button>
            </div>
          ))}
        </div>
        <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.78rem', marginTop: 14 }} onClick={() => addRow('experience', { title: '', company: '', duration: '', description: '' })}>+ Add Experience</button>
      </div>

      <div className="card" style={{ padding: 20 }}>
        <p style={sectionLabel}>Certifications</p>
        <input
          className="form-input"
          placeholder="Certifications (comma separated)"
          value={(resume.certifications || []).join(', ')}
          onChange={(e) => setResume({ ...resume, certifications: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
          style={{ marginTop: 10 }}
        />
      </div>

      <div className="card" style={{ padding: 20 }}>
        <p style={sectionLabel}>Portfolio</p>
        <div style={{ display: 'grid', gap: 10, marginTop: 14 }}>
          {(resume.portfolio || []).map((p, i) => (
            <div key={i} className="border border-[var(--sand-line)] rounded-xl p-3 flex flex-wrap items-start" style={{ gap: 10 }}>
              <input className="form-input" placeholder="Project title" value={p.title || ''} onChange={(e) => updateRow('portfolio', i, 'title', e.target.value)} style={{ flex: '1 1 160px', minWidth: 0 }} />
              <input className="form-input" placeholder="Link" value={p.url || ''} onChange={(e) => updateRow('portfolio', i, 'url', e.target.value)} style={{ flex: '1 1 200px', minWidth: 0 }} />
              <input className="form-input" placeholder="Short description" value={p.description || ''} onChange={(e) => updateRow('portfolio', i, 'description', e.target.value)} style={{ flex: '2 1 220px', minWidth: 0 }} />
              <button type="button" className="btn" style={{ padding: '6px 10px', fontSize: '0.75rem', flexShrink: 0 }} onClick={() => removeRow('portfolio', i)}>Remove</button>
            </div>
          ))}
        </div>
        <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.78rem', marginTop: 14 }} onClick={() => addRow('portfolio', { title: '', url: '', description: '' })}>+ Add Project</button>
      </div>

      <button type="submit" className="btn btn-primary" style={{ padding: '8px 22px', fontSize: '0.85rem', justifySelf: 'start' }}>Save Resume</button>
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

  const fieldLabel = { fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--ink-soft)', display: 'block', marginBottom: 6 };

  return (
    <form onSubmit={submit} className="card" style={{ padding: 20, display: 'grid', gap: 16, maxWidth: 620 }}>
      <input className="form-input" placeholder="Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      <textarea className="form-input" placeholder="Description" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      <div className="flex flex-wrap" style={{ gap: 14 }}>
        <label style={{ flex: '2 1 140px', minWidth: 0 }}>
          <span style={fieldLabel}>Amount</span>
          <input className="form-input" type="number" placeholder="e.g. 1000" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
        </label>
        <label style={{ flex: '1 1 100px', minWidth: 0 }}>
          <span style={fieldLabel}>Currency</span>
          <input className="form-input" placeholder="USD" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
        </label>
        <label style={{ flex: '1 1 100px', minWidth: 0 }}>
          <span style={fieldLabel}>Seats</span>
          <input className="form-input" type="number" min="1" placeholder="1" value={form.seatsAvailable} onChange={(e) => setForm({ ...form, seatsAvailable: e.target.value })} />
        </label>
      </div>
      <input className="form-input" placeholder="Eligibility criteria" value={form.eligibilityCriteria} onChange={(e) => setForm({ ...form, eligibilityCriteria: e.target.value })} />
      <div className="flex flex-wrap" style={{ gap: 14 }}>
        <input className="form-input" placeholder="Country (optional)" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} style={{ flex: '1 1 200px', minWidth: 0 }} />
        <label style={{ flex: '1 1 200px', minWidth: 0 }}>
          <span style={fieldLabel}>Application Deadline</span>
          <input className="form-input" type="date" value={form.applicationDeadline} onChange={(e) => setForm({ ...form, applicationDeadline: e.target.value })} />
        </label>
      </div>
      <button type="submit" className="btn btn-primary" style={{ justifySelf: 'start', padding: '8px 20px' }}>Post Scholarship</button>
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
      <form onSubmit={(e) => { e.preventDefault(); load(); }} className="flex gap-3 items-end mb-4 border border-[var(--sand-line)] rounded-xl p-3">
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

// The real order-fulfillment lifecycle — New/Confirmed/Processing/Shipped/Delivered/Completed
// are all shown as "pending" (in-progress) tag color except the two terminal-success states;
// Cancelled/Refunded are the terminal-failure states. DB keeps 'pending' as the first enum value
// for backward compatibility — labeled "New" here, matching every other raw-enum/label split in this app.
const ORDER_STATUS = {
  pending: { tag: 'pending', label: 'New' },
  confirmed: { tag: 'pending', label: 'Confirmed' },
  processing: { tag: 'pending', label: 'Processing' },
  shipped: { tag: 'pending', label: 'Shipped' },
  delivered: { tag: 'approved', label: 'Delivered' },
  completed: { tag: 'approved', label: 'Completed' },
  cancelled: { tag: 'rejected', label: 'Cancelled' },
  refunded: { tag: 'rejected', label: 'Refunded' }
};
const PAYMENT_STATUS = {
  pending: { tag: 'pending', label: 'Pending' },
  paid: { tag: 'approved', label: 'Paid' },
  failed: { tag: 'rejected', label: 'Failed' },
  refunded: { tag: 'rejected', label: 'Refunded' }
};

function MyOrdersPanel({ onFlash }) {
  const [orders, setOrders] = useState(null);
  function load() { apiRequest('/marketplace/orders/mine').then(setOrders).catch((err) => onFlash(err.message)); }
  useEffect(load, [onFlash]); // eslint-disable-line react-hooks/exhaustive-deps

  async function requestCancellation(id) {
    try { await apiRequest(`/marketplace/orders/${id}/request-cancellation`, { method: 'POST' }); onFlash('Cancellation requested — waiting on the seller.', 'success'); load(); } catch (err) { onFlash(err.message); }
  }
  async function requestRefund(id) {
    try { await apiRequest(`/marketplace/orders/${id}/request-refund`, { method: 'POST' }); onFlash('Refund/return requested — waiting on the seller.', 'success'); load(); } catch (err) { onFlash(err.message); }
  }

  return (
    <Table
      loading={orders === null}
      headers={['Order ID', 'Product', 'Qty', 'Total', 'Payment', 'Status', 'Ordered', 'Actions']}
      rows={(orders || []).map((o) => [
        o._id.slice(-8).toUpperCase(),
        o.product?.title,
        o.quantity,
        `${o.currency} ${o.totalPrice}`,
        <Tag status={PAYMENT_STATUS[o.paymentStatus]?.tag} label={PAYMENT_STATUS[o.paymentStatus]?.label} />,
        <Tag status={ORDER_STATUS[o.status]?.tag} label={ORDER_STATUS[o.status]?.label} />,
        new Date(o.createdAt).toLocaleDateString(),
        <div className="flex gap-2 flex-wrap">
          {!['delivered', 'completed', 'cancelled', 'refunded'].includes(o.status) && !o.cancellationRequested && <button type="button" className="btn" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={() => requestCancellation(o._id)}>Request Cancellation</button>}
          {o.cancellationRequested && <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>Cancellation pending</span>}
          {['delivered', 'completed'].includes(o.status) && !o.refundRequested && <button type="button" className="btn" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={() => requestRefund(o._id)}>Request Refund</button>}
          {o.refundRequested && <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>Refund pending</span>}
        </div>
      ])}
      empty="No orders yet."
    />
  );
}

// The real listing lifecycle — draft (not submitted) / pending_approval (Super Admin review) /
// active (live) / rejected (admin declined) / out_of_stock (auto-set when stock hits 0) / paused
// (seller took it down themselves).
const PRODUCT_STATUS = {
  draft: { tag: 'under_review', label: 'Draft' },
  pending_approval: { tag: 'pending', label: 'Pending Approval' },
  active: { tag: 'approved', label: 'Active' },
  rejected: { tag: 'rejected', label: 'Rejected' },
  out_of_stock: { tag: 'pending', label: 'Out of Stock' },
  paused: { tag: 'under_review', label: 'Paused' }
};
const PRODUCT_CATEGORIES = ['books', 'stationery', 'uniform', 'electronics', 'courses', 'services', 'other'];
const EMPTY_PRODUCT_FORM = { title: '', description: '', category: 'other', price: '', currency: 'USD', stock: 0, images: '' };

function ProductDetailModal({ product, onClose }) {
  if (!product) return null;
  const st = PRODUCT_STATUS[product.status] || PRODUCT_STATUS.draft;
  return (
    <div className="u-modal-overlay open" onClick={onClose}>
      <div className="u-modal u-modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="u-modal-head">
          <div>
            <h3>{product.title}</h3>
            <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>{product.category}</p>
          </div>
          <button type="button" className="u-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="u-modal-body">
          {product.images?.[0] && <img src={product.images[0]} alt="" style={{ width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: 8, marginBottom: 12 }} />}
          <p className="text-xs" style={{ marginBottom: 8 }}><strong>Description:</strong> {product.description || 'Not provided'}</p>
          <p className="text-xs" style={{ marginBottom: 8 }}><strong>Price:</strong> {product.currency} {product.price}</p>
          <p className="text-xs" style={{ marginBottom: 8 }}><strong>Available quantity:</strong> {product.stock}</p>
          <p className="text-xs" style={{ marginBottom: 8 }}><strong>Total sales:</strong> {product.totalSales ?? 0} unit{product.totalSales === 1 ? '' : 's'}</p>
          <p className="text-xs" style={{ marginBottom: 8 }}><strong>Views:</strong> {product.views ?? 0}</p>
          {product.status === 'rejected' && product.reviewNotes && <p className="text-xs" style={{ marginBottom: 8, color: 'var(--ink-soft)' }}><strong>Rejection reason:</strong> {product.reviewNotes}</p>}
          <p className="text-xs"><strong>Status:</strong> <Tag status={st.tag} label={st.label} /></p>
        </div>
      </div>
    </div>
  );
}

function MyListingsPanel({ onFlash }) {
  const [products, setProducts] = useState(null);
  const [form, setForm] = useState(EMPTY_PRODUCT_FORM);
  const [viewing, setViewing] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_PRODUCT_FORM);

  function load() { apiRequest('/marketplace/products/mine/list').then(setProducts).catch((err) => onFlash(err.message)); }
  useEffect(load, []);

  async function create(e, status) {
    e.preventDefault();
    try {
      const body = { ...form, price: Number(form.price), stock: Number(form.stock), images: form.images ? [form.images] : [] };
      if (status === 'draft') body.status = 'draft';
      await apiRequest('/marketplace/products', { method: 'POST', body });
      onFlash(status === 'draft' ? 'Draft saved.' : 'Listing submitted for review.', 'success');
      setForm(EMPTY_PRODUCT_FORM);
      load();
    } catch (err) { onFlash(err.message); }
  }

  function startEdit(p) {
    setEditingId(p._id);
    setEditForm({ title: p.title, description: p.description || '', category: p.category, price: p.price, currency: p.currency, stock: p.stock, images: p.images?.[0] || '' });
  }
  async function saveEdit(id) {
    try {
      await apiRequest(`/marketplace/products/${id}`, { method: 'PATCH', body: { ...editForm, price: Number(editForm.price), stock: Number(editForm.stock), images: editForm.images ? [editForm.images] : [] } });
      onFlash('Listing updated.', 'success');
      setEditingId(null);
      load();
    } catch (err) { onFlash(err.message); }
  }

  async function togglePause(p) {
    try {
      await apiRequest(`/marketplace/products/${p._id}`, { method: 'PATCH', body: { status: p.status === 'active' ? 'paused' : 'active' } });
      onFlash(p.status === 'active' ? 'Listing paused.' : 'Listing reactivated.', 'success');
      load();
    } catch (err) { onFlash(err.message); }
  }
  async function submitForReview(p) {
    try {
      await apiRequest(`/marketplace/products/${p._id}`, { method: 'PATCH', body: { status: 'pending_approval' } });
      onFlash('Submitted for review.', 'success');
      load();
    } catch (err) { onFlash(err.message); }
  }
  async function remove(id) {
    try {
      await apiRequest(`/marketplace/products/${id}`, { method: 'DELETE' });
      onFlash('Listing removed.', 'success');
      load();
    } catch (err) { onFlash(err.message); }
  }

  const fieldLabel = { fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--ink-soft)', display: 'block', marginBottom: 6 };

  return (
    <div>
      <div className="flex items-center" style={{ gap: 12, marginBottom: 18 }}>
        <span style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--sand)', color: 'var(--gold)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><FaBoxOpen aria-hidden="true" size={16} /></span>
        <h3 className="font-semibold" style={{ margin: 0 }}>Add Listing</h3>
      </div>
      <form style={{ display: 'grid', gap: 20, maxWidth: 560, marginBottom: 28 }}>
        <div className="card" style={{ padding: 20, display: 'grid', gap: 14 }}>
          <p style={fieldLabel}>Listing Details</p>
          <input className="form-input" placeholder="Product/service name" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <textarea className="form-input" placeholder="Description" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <input className="form-input" placeholder="Image URL (paste a direct image link)" value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} />
        </div>

        <div className="card" style={{ padding: 20, display: 'grid', gap: 14 }}>
          <p style={fieldLabel}>Category & Pricing</p>
          <div className="flex flex-wrap" style={{ gap: 14 }}>
            <div style={{ flex: '1 1 180px', minWidth: 0 }}>
              <CustomSelect value={form.category} onChange={(v) => setForm({ ...form, category: v })} ariaLabel="Category" minWidth="100%" options={PRODUCT_CATEGORIES.map((c) => ({ value: c, label: c[0].toUpperCase() + c.slice(1) }))} />
            </div>
            <input className="form-input" type="number" placeholder="Price" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} style={{ flex: '1 1 140px', minWidth: 0 }} />
            <input className="form-input" type="number" placeholder="Available quantity" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} style={{ flex: '1 1 160px', minWidth: 0 }} />
          </div>
        </div>

        <div className="flex gap-2">
          <button type="button" className="btn" onClick={(e) => create(e, 'draft')}>Save as Draft</button>
          <button type="button" className="btn btn-primary" onClick={(e) => create(e, 'submit')}>Add Listing</button>
        </div>
      </form>

      <h3 className="font-semibold mb-2">Products/Listings Overview</h3>
      <Table
        loading={products === null}
        headers={['Image', 'Name', 'Category', 'Price', 'Available Qty', 'Status', 'Total Sales', 'Views', 'Actions']}
        rows={(products || []).map((p) => {
          const st = PRODUCT_STATUS[p.status] || PRODUCT_STATUS.draft;
          const isEditing = editingId === p._id;
          return [
            p.images?.[0] ? <img src={p.images[0]} alt="" style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover' }} /> : <div style={{ width: 36, height: 36, borderRadius: 6, background: 'var(--sand-line)' }} />,
            isEditing ? <input className="form-input" style={{ padding: '4px 6px', fontSize: '0.75rem' }} value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} /> : p.title,
            isEditing ? (
              <div style={{ minWidth: 130 }}>
                <CustomSelect value={editForm.category} onChange={(v) => setEditForm({ ...editForm, category: v })} ariaLabel="Category" minWidth="100%" options={PRODUCT_CATEGORIES.map((c) => ({ value: c, label: c[0].toUpperCase() + c.slice(1) }))} />
              </div>
            ) : p.category,
            isEditing ? <input className="form-input" type="number" style={{ padding: '4px 6px', fontSize: '0.75rem', width: 80 }} value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} /> : `${p.currency} ${p.price}`,
            isEditing ? <input className="form-input" type="number" style={{ padding: '4px 6px', fontSize: '0.75rem', width: 70 }} value={editForm.stock} onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })} /> : p.stock,
            <Tag status={st.tag} label={st.label} />,
            `${p.totalSales ?? 0} sold`,
            p.views ?? 0,
            <div className="flex gap-2 flex-wrap">
              {isEditing ? (
                <>
                  <button type="button" className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={() => saveEdit(p._id)}>Save</button>
                  <button type="button" className="btn" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={() => setEditingId(null)}>Cancel</button>
                </>
              ) : (
                <>
                  <button type="button" className="btn" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={() => setViewing(p)}>View</button>
                  <button type="button" className="btn" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={() => startEdit(p)}>Edit</button>
                  {p.status === 'draft' && <button type="button" className="btn" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={() => submitForReview(p)}>Submit for Review</button>}
                  {(p.status === 'active' || p.status === 'paused') && <button type="button" className="btn" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={() => togglePause(p)}>{p.status === 'active' ? 'Pause' : 'Reactivate'}</button>}
                  <button type="button" className="btn" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={() => remove(p._id)}>Delete</button>
                </>
              )}
            </div>
          ];
        })}
        empty="You haven't listed anything yet."
      />
      <ProductDetailModal product={viewing} onClose={() => setViewing(null)} />
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
  async function updatePayment(id, paymentStatus) {
    try {
      await apiRequest(`/marketplace/orders/${id}/payment-status`, { method: 'PATCH', body: { paymentStatus } });
      load();
    } catch (err) { onFlash(err.message); }
  }

  return (
    <Table
      loading={orders === null}
      headers={['Order ID', 'Buyer', 'Product', 'Ordered', 'Qty', 'Total', 'Payment', 'Status']}
      rows={(orders || []).map((o) => [
        o._id.slice(-8).toUpperCase(),
        o.buyer?.fullName,
        o.product?.title,
        new Date(o.createdAt).toLocaleDateString(),
        o.quantity,
        `${o.currency} ${o.totalPrice}`,
        <select className="form-select" value={o.paymentStatus} onChange={(e) => updatePayment(o._id, e.target.value)} style={{ padding: '4px 6px', fontSize: '0.72rem' }}>
          {Object.entries(PAYMENT_STATUS).map(([val, meta]) => <option key={val} value={val}>{meta.label}</option>)}
        </select>,
        <select className="form-select" value={o.status} onChange={(e) => updateStatus(o._id, e.target.value)} style={{ padding: '4px 6px', fontSize: '0.72rem' }}>
          {Object.entries(ORDER_STATUS).map(([val, meta]) => <option key={val} value={val}>{meta.label}</option>)}
        </select>
      ])}
      empty="No orders received yet."
    />
  );
}

const SELLER_WITHDRAWAL_STATUS = {
  requested: { tag: 'pending', label: 'Requested' },
  processing: { tag: 'pending', label: 'Processing' },
  paid: { tag: 'approved', label: 'Paid' },
  rejected: { tag: 'rejected', label: 'Rejected' }
};

// Seller item 10 — Wallet. Reuses the exact same computeEarnings numbers as item 9's Earnings &
// Commission (never a second, conflicting "available balance"). "Selected Currency" is a real UI
// control when the seller operates in more than one currency — most sellers only ever see one tab.
function SellerWalletPanel({ onFlash }) {
  const [wallet, setWallet] = useState(null);
  const [withdrawals, setWithdrawals] = useState(null);
  const [orders, setOrders] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState(null);

  function load() {
    apiRequest('/marketplace/sellers/mine/wallet').then((data) => {
      setWallet(data);
      setSelectedCurrency((prev) => prev && data[prev] ? prev : Object.keys(data)[0] || null);
    }).catch((err) => onFlash(err.message));
    apiRequest('/marketplace/sellers/mine/withdrawals').then(setWithdrawals).catch((err) => onFlash(err.message));
    apiRequest('/marketplace/orders/selling').then(setOrders).catch(() => setOrders([]));
  }
  useEffect(load, [onFlash]); // eslint-disable-line react-hooks/exhaustive-deps

  async function withdraw({ payoutMethod, payoutDetails }) {
    try {
      await apiRequest('/marketplace/sellers/mine/withdraw', { method: 'POST', body: { currency: selectedCurrency, payoutMethod, payoutDetails } });
      onFlash('Withdrawal requested.', 'success');
      load();
    } catch (err) { onFlash(err.message); }
  }

  if (wallet === null || withdrawals === null || orders === null) return <p role="status" className="admin-notice">Loading...</p>;

  const currencies = Object.keys(wallet);
  const w = selectedCurrency ? wallet[selectedCurrency] : null;

  // Transaction history — every realized sale + every withdrawal, for the selected currency.
  const transactions = [
    ...orders.filter((o) => o.currency === selectedCurrency && ['delivered', 'completed'].includes(o.status)).map((o) => ({ type: 'Sale', date: o.createdAt, amount: o.totalPrice, ref: o._id.slice(-8).toUpperCase() })),
    ...withdrawals.filter((wd) => wd.currency === selectedCurrency).map((wd) => ({ type: 'Withdrawal', date: wd.createdAt, amount: -wd.amount, ref: wd._id.slice(-8).toUpperCase(), status: wd.status }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  const fieldLabel = { fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--ink-soft)' };

  return (
    <div>
      <div className="flex items-center" style={{ gap: 12, marginBottom: 6 }}>
        <span style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--sand)', color: 'var(--forest)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><FaWallet aria-hidden="true" size={16} /></span>
        <h3 className="font-semibold" style={{ margin: 0 }}>Wallet</h3>
      </div>
      <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginLeft: 50, marginBottom: 24, lineHeight: 1.6 }}>No real payment processor is wired up — "Withdraw Funds" creates a real, trackable request; nothing here moves actual money.</p>

      {currencies.length === 0 ? (
        <div className="student-empty-state" style={{ border: '1px solid var(--sand-line)', borderRadius: 18, marginBottom: 24 }}>
          <FaWallet aria-hidden="true" />
          <p>No wallet activity yet</p>
        </div>
      ) : (
        <>
          {currencies.length > 1 && (
            <div style={{ maxWidth: 200, marginBottom: 16 }}>
              <CustomSelect value={selectedCurrency || ''} onChange={setSelectedCurrency} ariaLabel="Selected currency" minWidth="100%" options={currencies.map((c) => ({ value: c, label: c }))} />
            </div>
          )}
          {w && (
            <div className="card" style={{ padding: 20, marginBottom: 28 }}>
              <strong className="text-sm">{selectedCurrency} Wallet</strong>
              <div className="grid grid-cols-3 gap-3" style={{ marginTop: 14, marginBottom: 16 }}>
                <div style={{ padding: 12, borderRadius: 14, background: 'var(--sand)' }}>
                  <span style={fieldLabel}>Available Balance</span>
                  <strong style={{ fontSize: 20, fontFamily: 'Fraunces, serif', display: 'block', marginTop: 4, color: 'var(--emerald)' }}>{selectedCurrency} {w.availableBalance}</strong>
                </div>
                <div style={{ padding: 12, borderRadius: 14, background: 'var(--sand)' }}>
                  <span style={fieldLabel}>Pending Balance</span>
                  <strong style={{ fontSize: 20, fontFamily: 'Fraunces, serif', display: 'block', marginTop: 4, color: 'var(--gold)' }}>{selectedCurrency} {w.pendingBalance}</strong>
                </div>
                <div style={{ padding: 12, borderRadius: 14, background: 'var(--sand)' }}>
                  <span style={fieldLabel}>Total Earnings</span>
                  <strong style={{ fontSize: 20, fontFamily: 'Fraunces, serif', display: 'block', marginTop: 4 }}>{selectedCurrency} {w.totalEarnings}</strong>
                </div>
              </div>
              <PayoutRequestForm onSubmit={withdraw} disabled={w.availableBalance <= 0} label={`Withdraw Funds (${selectedCurrency} ${w.availableBalance})`} />
            </div>
          )}
        </>
      )}

      <p style={{ ...fieldLabel, marginBottom: 12 }}>Transaction History</p>
      <Table
        headers={['Type', 'Date', 'Amount', 'Reference']}
        rows={transactions.map((t) => [
          t.type,
          new Date(t.date).toLocaleDateString(),
          <strong style={{ color: t.amount >= 0 ? 'var(--emerald)' : 'var(--rose, #e11d48)' }}>{t.amount >= 0 ? '' : '-'}{selectedCurrency} {Math.abs(t.amount)}</strong>,
          t.ref
        ])}
        empty="No transactions yet."
      />

      <p style={{ ...fieldLabel, marginTop: 28, marginBottom: 12 }}>Withdrawal History</p>
      <Table
        headers={['Amount', 'Currency', 'Status', 'Requested', 'Processed']}
        rows={withdrawals.map((wd) => [
          wd.amount, wd.currency,
          <Tag status={SELLER_WITHDRAWAL_STATUS[wd.status]?.tag} label={SELLER_WITHDRAWAL_STATUS[wd.status]?.label} />,
          new Date(wd.createdAt).toLocaleDateString(),
          wd.processedAt ? new Date(wd.processedAt).toLocaleDateString() : '—'
        ])}
        empty="No withdrawals requested yet."
      />
    </div>
  );
}

// Seller item 11 — Reviews & Ratings. Every real review across every listing, with seller
// response and a report-inappropriate action.
function SellerReviewsPanel({ onFlash }) {
  const [reviews, setReviews] = useState(null);
  const [profile, setProfile] = useState(null);
  const [respondingId, setRespondingId] = useState(null);
  const [responseText, setResponseText] = useState('');

  function load() {
    apiRequest('/marketplace/sellers/mine/reviews').then(setReviews).catch((err) => onFlash(err.message));
    apiRequest('/marketplace/sellers/mine/profile').then(setProfile).catch(() => {});
  }
  useEffect(load, [onFlash]); // eslint-disable-line react-hooks/exhaustive-deps

  async function submitResponse(id) {
    if (!responseText.trim()) return;
    try {
      await apiRequest(`/marketplace/reviews/${id}/respond`, { method: 'PATCH', body: { response: responseText.trim() } });
      onFlash('Response posted.', 'success');
      setRespondingId(null); setResponseText('');
      load();
    } catch (err) { onFlash(err.message); }
  }
  async function report(id) {
    const reason = window.prompt('Why is this review inappropriate?');
    if (reason === null) return;
    try {
      await apiRequest(`/marketplace/reviews/${id}/report`, { method: 'POST', body: { reason } });
      onFlash('Review reported for Super Admin review.', 'success');
      load();
    } catch (err) { onFlash(err.message); }
  }

  if (reviews === null) return <p role="status" className="admin-notice">Loading...</p>;

  // Product ratings — computed client-side from the same review list, one row per product.
  const byProduct = {};
  reviews.forEach((r) => {
    const key = r.product?._id || 'unknown';
    if (!byProduct[key]) byProduct[key] = { title: r.product?.title || 'Deleted listing', ratings: [] };
    byProduct[key].ratings.push(r.rating);
  });
  const productRatings = Object.values(byProduct).map((p) => ({ title: p.title, avg: Math.round((p.ratings.reduce((s, r) => s + r, 0) / p.ratings.length) * 10) / 10, count: p.ratings.length }));

  const fieldLabel = { fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--ink-soft)' };

  return (
    <div>
      <div className="flex items-center" style={{ gap: 12, marginBottom: 24 }}>
        <span style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--sand)', color: 'var(--gold)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><FaStar aria-hidden="true" size={16} /></span>
        <h3 className="font-semibold" style={{ margin: 0 }}>Reviews & Ratings</h3>
      </div>

      <div className="card flex items-center" style={{ padding: 20, marginBottom: 24, gap: 16 }}>
        <span style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--sand)', color: 'var(--gold)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><FaStar aria-hidden="true" size={20} /></span>
        <div>
          <p style={fieldLabel}>Overall Seller Rating</p>
          <strong style={{ fontSize: 22, fontFamily: 'Fraunces, serif', display: 'block', marginTop: 4 }}>
            {profile?.sellerRating !== null && profile?.sellerRating !== undefined ? `★ ${profile.sellerRating}` : 'No reviews yet'}
          </strong>
          {profile?.sellerRating !== null && profile?.sellerRating !== undefined && <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>{profile.totalReviews} review{profile.totalReviews === 1 ? '' : 's'}</span>}
        </div>
      </div>

      <p style={{ ...fieldLabel, marginBottom: 12 }}>Product Ratings</p>
      <Table
        headers={['Product', 'Average Rating', 'Reviews']}
        rows={productRatings.map((p) => [p.title, `★ ${p.avg}`, p.count])}
        empty="No product ratings yet."
      />

      <p style={{ ...fieldLabel, marginTop: 28, marginBottom: 12 }}>Buyer Reviews / Recent Feedback</p>
      {reviews.length === 0 ? (
        <div className="student-empty-state" style={{ border: '1px solid var(--sand-line)', borderRadius: 18 }}>
          <FaStar aria-hidden="true" />
          <p>No reviews yet</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {reviews.map((r) => (
            <div key={r._id} className="card" style={{ padding: 16 }}>
              <div className="flex items-start justify-between flex-wrap" style={{ gap: 12 }}>
                <div className="flex items-start" style={{ gap: 12, minWidth: 0 }}>
                  <span style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--forest)', color: '#fff', display: 'grid', placeItems: 'center', flexShrink: 0, fontWeight: 700, fontSize: 13 }}>{(r.buyer?.fullName || '?')[0]}</span>
                  <div style={{ minWidth: 0 }}>
                    <strong className="text-sm">{r.buyer?.fullName}</strong>
                    <div className="flex items-center flex-wrap" style={{ gap: 6, marginTop: 2 }}>
                      <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>{r.product?.title} · ★ {r.rating} · {new Date(r.createdAt).toLocaleDateString()}</span>
                      {r.reported && <Tag status="rejected" label="Reported" />}
                    </div>
                    {r.comment && <p className="text-xs" style={{ marginTop: 8, color: 'var(--ink)' }}>{r.comment}</p>}
                    {r.sellerResponse && (
                      <div style={{ marginTop: 10, padding: 10, borderRadius: 12, background: 'var(--sand)' }}>
                        <p className="text-xs" style={{ color: 'var(--ink-soft)' }}><strong style={{ color: 'var(--ink)' }}>Your response:</strong> {r.sellerResponse}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap" style={{ flexShrink: 0 }}>
                  {!r.sellerResponse && <button type="button" className="btn" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={() => { setRespondingId(respondingId === r._id ? null : r._id); setResponseText(''); }}>Respond</button>}
                  {!r.reported && <button type="button" className="btn" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={() => report(r._id)}>Report</button>}
                </div>
              </div>
              {respondingId === r._id && (
                <div className="flex gap-2 items-end flex-wrap" style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--sand-line)' }}>
                  <textarea className="form-input" placeholder="Your public response..." rows={2} value={responseText} onChange={(e) => setResponseText(e.target.value)} style={{ flex: 1, minWidth: 0 }} />
                  <button type="button" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.78rem', flexShrink: 0 }} onClick={() => submitResponse(r._id)}>Post Response</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Seller item 12 — Messages, categorized: Buyers (people who've bought something from this
// seller), Marketplace Support, Super Admin. Same pattern as the Donor's categorized inbox.
function SellerMessagesPanel({ onFlash }) {
  const [conversations, setConversations] = useState(null);
  const [buyerIds, setBuyerIds] = useState(null);
  const [activeUser, setActiveUser] = useState(null);
  const [thread, setThread] = useState(null);
  const [text, setText] = useState('');

  function load() {
    apiRequest('/messages/conversations').then(setConversations).catch((err) => onFlash(err.message));
    apiRequest('/marketplace/orders/selling').then((orders) => setBuyerIds(new Set(orders.map((o) => o.buyer?._id).filter(Boolean)))).catch(() => setBuyerIds(new Set()));
  }
  useEffect(load, [onFlash]); // eslint-disable-line react-hooks/exhaustive-deps

  function openThread(u) {
    setActiveUser(u);
    setThread(null);
    apiRequest(`/messages/with/${u._id}`).then(setThread).catch((err) => onFlash(err.message));
    apiRequest(`/messages/with/${u._id}/read`, { method: 'PATCH' }).then(load).catch(() => {});
  }

  async function send(e) {
    e.preventDefault();
    if (!activeUser || !text.trim()) return;
    try {
      await apiRequest('/messages', { method: 'POST', body: { to: activeUser._id, text: text.trim() } });
      setText('');
      apiRequest(`/messages/with/${activeUser._id}`).then(setThread);
      load();
    } catch (err) { onFlash(err.message); }
  }

  if (conversations === null || buyerIds === null) return <p role="status" className="admin-notice">Loading...</p>;

  const hasRole = (u, role) => (u.roles || []).includes(role);
  const buyerMsgs = conversations.filter((c) => buyerIds.has(c.user._id));
  const supportMsgs = conversations.filter((c) => !buyerIds.has(c.user._id) && (hasRole(c.user, 'admin') || hasRole(c.user, 'platform_staff')));
  const superAdminMsgs = conversations.filter((c) => !buyerIds.has(c.user._id) && hasRole(c.user, 'super_admin'));
  const categorizedIds = new Set([...buyerMsgs, ...supportMsgs, ...superAdminMsgs].map((c) => c.user._id));
  const otherMsgs = conversations.filter((c) => !categorizedIds.has(c.user._id));

  const sellerMsgLabel = { fontSize: 11, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--ink-soft)' };

  function ConversationGroup({ title, items }) {
    if (items.length === 0) return null;
    return (
      <div style={{ marginBottom: 16 }}>
        <p style={sellerMsgLabel}>{title}</p>
        <div className="dash-list" style={{ marginTop: 10 }}>
          {items.map((c) => (
            <div key={c.user._id} className={`dash-list-item${activeUser?._id === c.user._id ? ' unread' : ''}`} style={{ cursor: 'pointer' }} onClick={() => openThread(c.user)}>
              <span className="dash-list-icon c-forest" aria-hidden><FaUser size={14} /></span>
              <div className="dash-list-body"><div className="title">{c.user.fullName}{c.unread > 0 ? ` (${c.unread})` : ''}</div><div className="desc">{c.lastMessage}</div></div>
              <span className="dash-list-time">{new Date(c.lastAt).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid g2" style={{ gap: 20, alignItems: 'start' }}>
      <div>
        <h3 className="font-semibold" style={{ marginBottom: 4 }}>Messages</h3>
        <p className="text-xs" style={{ color: 'var(--ink-soft)', marginBottom: 18 }}>To start a new conversation, ask for their User ID and use the "New Message" box on the right.</p>
        <ConversationGroup title="Buyers" items={buyerMsgs} />
        <ConversationGroup title="Marketplace Support" items={supportMsgs} />
        <ConversationGroup title="Super Admin" items={superAdminMsgs} />
        <ConversationGroup title="Other" items={otherMsgs} />
        {conversations.length === 0 && (
          <div className="student-empty-state" style={{ border: '1px solid var(--sand-line)', borderRadius: 18 }}>
            <FaCommentDots aria-hidden="true" />
            <p>No conversations yet</p>
          </div>
        )}
      </div>
      <div className="card" style={{ padding: 20 }}>
        <h3 className="font-semibold" style={{ marginBottom: 14 }}>{activeUser ? activeUser.fullName : 'New Message'}</h3>
        {!activeUser && (
          <label style={{ display: 'block' }}>
            <span className="text-xs" style={{ display: 'block', color: 'var(--ink-soft)', fontWeight: 600, marginBottom: 6 }}>Recipient's User ID</span>
            <input className="form-input" placeholder="Paste a User ID and press Enter" onKeyDown={(e) => {
              if (e.key === 'Enter' && e.target.value.trim()) { openThread({ _id: e.target.value.trim(), fullName: 'New recipient' }); }
            }} />
          </label>
        )}
        {activeUser && (
          <>
            <div className="card reveal in" style={{ padding: '10px 14px', marginBottom: 14, maxHeight: 320, overflowY: 'auto' }}>
              {thread === null && <p role="status" className="admin-notice">Loading...</p>}
              {thread && thread.length === 0 && (
                <div className="student-empty-state" style={{ minHeight: 100, padding: '16px 0' }}>
                  <p>No messages yet</p>
                </div>
              )}
              {(thread || []).map((m, idx) => (
                <div key={m._id} style={{ padding: '10px 4px', borderBottom: idx < thread.length - 1 ? '1px solid var(--sand-line)' : 'none' }}>
                  <div style={{ fontSize: 13 }}>{m.text}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 4 }}>{new Date(m.createdAt).toLocaleString()}</div>
                </div>
              ))}
            </div>
            <form onSubmit={send} className="flex items-end" style={{ gap: 12 }}>
              <input className="form-input" placeholder="Type a message..." value={text} onChange={(e) => setText(e.target.value)} required style={{ flex: '1 1 auto', minWidth: 0 }} />
              <button type="submit" className="btn btn-primary" style={{ flexShrink: 0 }}>Send</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

// Seller sidebar — Verification/Documents. Same generic /roles/mine/:role/documents endpoint
// used by Agent and Donor, just pointed at 'marketplace_seller'.
function SellerVerificationPanel({ onFlash }) {
  const [request, setRequest] = useState(undefined);
  const [docUrl, setDocUrl] = useState('');

  function load() {
    apiRequest('/roles/my-requests').then((list) => setRequest(list.find((r) => r.requestedRole === 'marketplace_seller') || null)).catch(() => setRequest(null));
  }
  useEffect(load, []);

  async function addDocument() {
    if (!docUrl.trim() || !request) return;
    try {
      await apiRequest(`/roles/mine/marketplace_seller/documents`, { method: 'POST', body: { documents: [...(request.documents || []), docUrl.trim()] } });
      onFlash('Document submitted.', 'success');
      setDocUrl('');
      load();
    } catch (err) { onFlash(err.message); }
  }
  async function removeDocument(url) {
    try {
      await apiRequest(`/roles/mine/marketplace_seller/documents`, { method: 'POST', body: { documents: (request.documents || []).filter((d) => d !== url) } });
      load();
    } catch (err) { onFlash(err.message); }
  }

  if (request === undefined) return <p role="status" className="admin-notice">Loading...</p>;

  const VERIFICATION_LABEL = { approved: 'Verified', pending: 'Pending Review', under_review: 'Under Review', rejected: 'Rejected' };
  const VERIFICATION_TAG = { approved: 'approved', pending: 'pending', under_review: 'pending', rejected: 'rejected' };
  const status = request?.status || 'pending';

  return (
    <div>
      <h3 className="font-semibold" style={{ marginBottom: 16 }}>Verification / Documents</h3>

      <div className="flex items-start" style={{ gap: 12, padding: 18, borderRadius: 16, background: 'var(--sand)', marginBottom: 20 }}>
        <span style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--paper-raised)', color: 'var(--forest)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
          <FaShieldHalved aria-hidden="true" size={15} />
        </span>
        <div>
          <div className="flex items-center" style={{ gap: 8 }}>
            <strong className="text-sm">Status:</strong>
            <Tag status={VERIFICATION_TAG[status]} label={VERIFICATION_LABEL[status]} />
          </div>
          {status === 'rejected' && request?.reviewNotes && <p className="text-xs" style={{ color: 'var(--rose)', marginTop: 6 }}>{request.reviewNotes}</p>}
          <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 6, lineHeight: 1.6 }}>Only a Super Admin-verified seller can list products or services. Submit documents (ID, business registration, etc.) for review.</p>
        </div>
      </div>

      <div className="card" style={{ padding: 20 }}>
        <p className="text-xs" style={{ fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--ink-soft)', marginBottom: 14 }}>Submitted Documents</p>
        <div className="flex items-end flex-wrap" style={{ gap: 12, marginBottom: 16 }}>
          <input className="form-input" placeholder="Paste a document link (PDF/image URL)" value={docUrl} onChange={(e) => setDocUrl(e.target.value)} style={{ flex: '1 1 auto', minWidth: 0 }} />
          <button type="button" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.78rem', flexShrink: 0 }} onClick={addDocument}>Add Document</button>
        </div>
        {(request?.documents || []).length === 0 ? (
          <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>No documents submitted yet.</p>
        ) : (
          <div style={{ display: 'grid', gap: 8 }}>
            {(request?.documents || []).map((d) => (
              <div key={d} className="flex items-center justify-between flex-wrap" style={{ gap: 10, padding: 12, borderRadius: 12, background: 'var(--sand)' }}>
                <a href={d} target="_blank" rel="noreferrer" className="text-xs" style={{ overflowWrap: 'anywhere' }}>📄 {d}</a>
                <button type="button" className="btn" style={{ padding: '5px 12px', fontSize: '0.72rem', background: 'var(--paper-raised)', flexShrink: 0 }} onClick={() => removeDocument(d)}>Remove</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Seller sidebar — Add New Listing, a focused standalone form (Products/Listings keeps its own
// copy of this form too, for convenience — both post to the same endpoint).
function AddListingPanel({ onFlash }) {
  const [form, setForm] = useState(EMPTY_PRODUCT_FORM);

  async function create(status) {
    try {
      const body = { ...form, price: Number(form.price), stock: Number(form.stock), images: form.images ? [form.images] : [] };
      if (status === 'draft') body.status = 'draft';
      await apiRequest('/marketplace/products', { method: 'POST', body });
      onFlash(status === 'draft' ? 'Draft saved — find it under Products/Listings.' : 'Listing submitted for review — find it under Products/Listings.', 'success');
      setForm(EMPTY_PRODUCT_FORM);
    } catch (err) { onFlash(err.message); }
  }

  const fieldLabel = { fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--ink-soft)', display: 'block', marginBottom: 6 };

  return (
    <div>
      <div className="flex items-center" style={{ gap: 12, marginBottom: 18 }}>
        <span style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--sand)', color: 'var(--gold)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><FaBoxOpen aria-hidden="true" size={16} /></span>
        <div>
          <h3 className="font-semibold" style={{ margin: 0 }}>Add New Listing</h3>
          <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 2 }}>Products and services are both listed the same way — pick a digital category (Courses/Services) to skip stock tracking.</p>
        </div>
      </div>
      <form style={{ display: 'grid', gap: 20, maxWidth: 560 }}>
        <div className="card" style={{ padding: 20, display: 'grid', gap: 14 }}>
          <p style={fieldLabel}>Listing Details</p>
          <input className="form-input" placeholder="Product/service name" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <textarea className="form-input" placeholder="Description" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <input className="form-input" placeholder="Image URL (paste a direct image link)" value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} />
        </div>

        <div className="card" style={{ padding: 20, display: 'grid', gap: 14 }}>
          <p style={fieldLabel}>Category & Pricing</p>
          <div className="flex flex-wrap" style={{ gap: 14 }}>
            <div style={{ flex: '1 1 180px', minWidth: 0 }}>
              <CustomSelect value={form.category} onChange={(v) => setForm({ ...form, category: v })} ariaLabel="Category" minWidth="100%" options={PRODUCT_CATEGORIES.map((c) => ({ value: c, label: c[0].toUpperCase() + c.slice(1) }))} />
            </div>
            <input className="form-input" type="number" placeholder="Price" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} style={{ flex: '1 1 140px', minWidth: 0 }} />
            {!['courses', 'services'].includes(form.category) && <input className="form-input" type="number" placeholder="Available quantity" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} style={{ flex: '1 1 160px', minWidth: 0 }} />}
          </div>
        </div>

        <div className="flex gap-2">
          <button type="button" className="btn" onClick={() => create('draft')}>Save as Draft</button>
          <button type="button" className="btn btn-primary" onClick={() => create('submit')}>Submit Listing</button>
        </div>
      </form>
    </div>
  );
}

// Seller sidebar — Services: the same Products/Listings data, filtered to the digital categories
// (courses/services) that don't track stock.
function ServicesPanel({ onFlash }) {
  const [products, setProducts] = useState(null);
  function load() { apiRequest('/marketplace/products/mine/list').then(setProducts).catch((err) => onFlash(err.message)); }
  useEffect(load, []);

  async function togglePause(p) {
    try {
      await apiRequest(`/marketplace/products/${p._id}`, { method: 'PATCH', body: { status: p.status === 'active' ? 'paused' : 'active' } });
      onFlash(p.status === 'active' ? 'Service paused.' : 'Service reactivated.', 'success');
      load();
    } catch (err) { onFlash(err.message); }
  }
  async function remove(id) {
    try { await apiRequest(`/marketplace/products/${id}`, { method: 'DELETE' }); onFlash('Service removed.', 'success'); load(); } catch (err) { onFlash(err.message); }
  }

  if (products === null) return <p role="status" className="admin-notice">Loading...</p>;
  const services = products.filter((p) => ['courses', 'services'].includes(p.category));

  return (
    <div>
      <h3 className="font-semibold mb-2">Services</h3>
      <p className="text-xs mb-3" style={{ color: 'var(--ink-soft)' }}>Digital listings only (Courses/Services) — no stock tracking applies to these.</p>
      <Table
        headers={['Name', 'Price', 'Status', 'Total Sales', 'Views', 'Actions']}
        rows={services.map((p) => {
          const st = PRODUCT_STATUS[p.status] || PRODUCT_STATUS.draft;
          return [
            p.title, `${p.currency} ${p.price}`, <Tag status={st.tag} label={st.label} />, `${p.totalSales ?? 0} sold`, p.views ?? 0,
            <div className="flex gap-2 flex-wrap">
              {(p.status === 'active' || p.status === 'paused') && <button type="button" className="btn" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={() => togglePause(p)}>{p.status === 'active' ? 'Pause' : 'Reactivate'}</button>}
              <button type="button" className="btn" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={() => remove(p._id)}>Delete</button>
            </div>
          ];
        })}
        empty="No services/courses listed yet."
      />
    </div>
  );
}

// Seller sidebar — Inventory, standalone (same data/action as the home page's embedded version).
function InventoryPanel({ onFlash }) {
  const [inventory, setInventory] = useState(null);
  const [stockEdits, setStockEdits] = useState({});

  function load() { apiRequest('/marketplace/sellers/mine/inventory').then(setInventory).catch((err) => onFlash(err.message)); }
  useEffect(load, [onFlash]); // eslint-disable-line react-hooks/exhaustive-deps

  async function updateStock(id) {
    const value = stockEdits[id];
    if (value === undefined || value === '') return;
    try {
      await apiRequest(`/marketplace/products/${id}`, { method: 'PATCH', body: { stock: Number(value) } });
      onFlash('Stock updated.', 'success');
      setStockEdits((prev) => { const next = { ...prev }; delete next[id]; return next; });
      load();
    } catch (err) { onFlash(err.message); }
  }

  if (inventory === null) return <p role="status" className="admin-notice">Loading...</p>;

  return (
    <div>
      <div className="flex items-center" style={{ gap: 12, marginBottom: 6 }}>
        <span style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--sand)', color: 'var(--forest)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><FaBoxesStacked aria-hidden="true" size={16} /></span>
        <h3 className="font-semibold" style={{ margin: 0 }}>Inventory</h3>
      </div>
      <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginLeft: 50, marginBottom: 28 }}>Physical listings only — digital products/services don't track stock.</p>
      {inventory.items.length === 0 ? (
        <div className="student-empty-state" style={{ border: '1px solid var(--sand-line)', borderRadius: 18 }}>
          <FaBoxOpen aria-hidden="true" />
          <p>No physical listings yet</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-2" style={{ gap: 16, marginBottom: 32 }}>
            <div className="card" style={{ padding: 20, alignSelf: 'start' }}>
              <div className="flex items-center" style={{ gap: 10, marginBottom: 14 }}>
                <span style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--sand)', color: 'var(--gold)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><FaTriangleExclamation aria-hidden="true" size={13} /></span>
                <strong className="text-sm">Low Stock ({inventory.lowStock.length})</strong>
              </div>
              {inventory.lowStock.length === 0 && <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>None.</p>}
              <div style={{ display: 'grid' }}>
                {inventory.lowStock.map((p, idx) => (
                  <p key={p._id} style={{ fontSize: 13.5, color: 'var(--ink)', padding: '11px 0', borderBottom: idx < inventory.lowStock.length - 1 ? '1px solid var(--sand-line)' : 'none', lineHeight: 1.6 }}>{p.title} — <span style={{ color: 'var(--ink-soft)' }}>{p.stock} left</span></p>
                ))}
              </div>
            </div>
            <div className="card" style={{ padding: 20, alignSelf: 'start' }}>
              <div className="flex items-center" style={{ gap: 10, marginBottom: 14 }}>
                <span style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--sand)', color: 'var(--rose, #e11d48)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><FaBoxOpen aria-hidden="true" size={13} /></span>
                <strong className="text-sm">Out of Stock ({inventory.outOfStock.length})</strong>
              </div>
              {inventory.outOfStock.length === 0 && <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>None.</p>}
              <div style={{ display: 'grid' }}>
                {inventory.outOfStock.map((p, idx) => (
                  <p key={p._id} style={{ fontSize: 13.5, color: 'var(--ink)', padding: '11px 0', borderBottom: idx < inventory.outOfStock.length - 1 ? '1px solid var(--sand-line)' : 'none', lineHeight: 1.6 }}>{p.title}</p>
                ))}
              </div>
            </div>
          </div>
          <div style={{ marginTop: 32 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--ink-soft)', marginBottom: 12 }}>Full Inventory</p>
            <Table
              headers={['Product', 'Category', 'Available Stock', 'Status', 'Inventory Update']}
              rows={inventory.items.map((p) => [
                p.title, p.category, p.stock,
                <Tag status={PRODUCT_STATUS[p.status]?.tag} label={PRODUCT_STATUS[p.status]?.label} />,
                <div className="flex gap-2">
                  <input className="form-input" type="number" min="0" style={{ padding: '4px 6px', fontSize: '0.72rem', width: 80 }} placeholder={String(p.stock)} value={stockEdits[p._id] ?? ''} onChange={(e) => setStockEdits({ ...stockEdits, [p._id]: e.target.value })} />
                  <button type="button" className="btn" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={() => updateStock(p._id)}>Update</button>
                </div>
              ])}
              empty="No physical listings yet."
            />
          </div>
        </>
      )}
    </div>
  );
}

// Seller sidebar — Returns & Refunds: full history (pending + resolved), unlike Pending Actions'
// subset which only shows what's still open.
function ReturnsRefundsPanel({ onFlash }) {
  const [orders, setOrders] = useState(null);
  function load() { apiRequest('/marketplace/sellers/mine/returns-refunds').then(setOrders).catch((err) => onFlash(err.message)); }
  useEffect(load, []);

  async function respondCancellation(id, approve) {
    try { await apiRequest(`/marketplace/orders/${id}/cancellation-response`, { method: 'PATCH', body: { approve } }); onFlash(`Cancellation ${approve ? 'approved' : 'denied'}.`, 'success'); load(); } catch (err) { onFlash(err.message); }
  }
  async function respondRefund(id, approve) {
    try { await apiRequest(`/marketplace/orders/${id}/refund-response`, { method: 'PATCH', body: { approve } }); onFlash(`Refund ${approve ? 'approved' : 'denied'}.`, 'success'); load(); } catch (err) { onFlash(err.message); }
  }

  if (orders === null) return <p role="status" className="admin-notice">Loading...</p>;

  return (
    <div>
      <h3 className="font-semibold mb-2">Returns & Refunds</h3>
      <Table
        headers={['Buyer', 'Product', 'Amount', 'Type', 'Reason', 'Status', 'Actions']}
        rows={orders.map((o) => {
          const isPendingCancellation = o.cancellationRequested;
          const isPendingRefund = o.refundRequested;
          const type = isPendingRefund || o.status === 'refunded' ? 'Refund/Return' : 'Cancellation';
          const reason = o.refundReason || o.cancellationReason || '—';
          return [
            o.buyer?.fullName, o.product?.title, `${o.currency} ${o.totalPrice}`, type, reason,
            <Tag status={ORDER_STATUS[o.status]?.tag} label={ORDER_STATUS[o.status]?.label} />,
            <div className="flex gap-2 flex-wrap">
              {isPendingCancellation && <>
                <button type="button" className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={() => respondCancellation(o._id, true)}>Approve</button>
                <button type="button" className="btn" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={() => respondCancellation(o._id, false)}>Deny</button>
              </>}
              {isPendingRefund && <>
                <button type="button" className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={() => respondRefund(o._id, true)}>Approve</button>
                <button type="button" className="btn" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={() => respondRefund(o._id, false)}>Deny</button>
              </>}
              {!isPendingCancellation && !isPendingRefund && '—'}
            </div>
          ];
        })}
        empty="No returns or refunds yet."
      />
    </div>
  );
}

// Seller sidebar — Sales Analytics (same data/graph as the home page's embedded Sales Overview).
function SalesAnalyticsPanel({ onFlash }) {
  const [salesOverview, setSalesOverview] = useState(null);
  useEffect(() => { apiRequest('/marketplace/sellers/mine/sales-overview').then(setSalesOverview).catch((err) => onFlash(err.message)); }, [onFlash]);

  return (
    <div>
      <h3 className="font-semibold mb-2">Sales Analytics</h3>
      {Object.keys(salesOverview?.totalsByCurrency || {}).length === 0 && (
        <p className="text-xs mb-4" style={{ color: 'var(--ink-soft)' }}>{salesOverview === null ? 'Loading...' : 'No sales yet.'}</p>
      )}
      {Object.entries(salesOverview?.totalsByCurrency || {}).map(([currency, s]) => {
        const maxDay = Math.max(...s.dailySales.map((d) => d.total), 1);
        return (
          <div key={currency} className="card" style={{ padding: 16, marginBottom: 20 }}>
            <strong className="text-sm">{currency}</strong>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2 mb-3">
              <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>Today: <strong>{currency} {s.today}</strong>{s.todayChangePct !== null && <span style={{ color: s.todayChangePct >= 0 ? 'var(--emerald)' : 'var(--rose, #e11d48)' }}> ({s.todayChangePct >= 0 ? '+' : ''}{s.todayChangePct}% vs yesterday)</span>}</p>
              <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>This Week: <strong>{currency} {s.thisWeek}</strong>{s.weekChangePct !== null && <span style={{ color: s.weekChangePct >= 0 ? 'var(--emerald)' : 'var(--rose, #e11d48)' }}> ({s.weekChangePct >= 0 ? '+' : ''}{s.weekChangePct}% vs last week)</span>}</p>
              <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>This Month: <strong>{currency} {s.thisMonth}</strong>{s.monthChangePct !== null && <span style={{ color: s.monthChangePct >= 0 ? 'var(--emerald)' : 'var(--rose, #e11d48)' }}> ({s.monthChangePct >= 0 ? '+' : ''}{s.monthChangePct}% vs last month)</span>}</p>
              <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>Total Revenue: <strong>{currency} {s.totalRevenue}</strong> · {s.orderCount} order{s.orderCount === 1 ? '' : 's'}</p>
            </div>
            <p className="text-xs mb-1" style={{ color: 'var(--ink-soft)' }}>Last 14 days (delivered/completed orders only):</p>
            <div className="flex items-end gap-1" style={{ height: 70 }}>
              {s.dailySales.map((d) => (
                <div key={d.date} title={`${d.date}: ${currency} ${d.total}`} style={{ flex: 1, height: `${Math.max((d.total / maxDay) * 100, 3)}%`, background: 'var(--gold)', borderRadius: '2px 2px 0 0' }} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Seller sidebar — Earnings & Commission (same data as the home page's embedded version).
function EarningsCommissionPanel({ onFlash }) {
  const [earnings, setEarnings] = useState(null);
  useEffect(() => { apiRequest('/marketplace/sellers/mine/earnings').then(setEarnings).catch((err) => onFlash(err.message)); }, [onFlash]);

  return (
    <div>
      <div className="flex items-center" style={{ gap: 12, marginBottom: 6 }}>
        <span style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--sand)', color: 'var(--gold)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><FaSackDollar aria-hidden="true" size={16} /></span>
        <h3 className="font-semibold" style={{ margin: 0 }}>Earnings & Commission</h3>
      </div>
      <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginLeft: 50, marginBottom: 28, lineHeight: 1.6 }}>CareerZ's commission ({earnings?.commissionRate ?? '—'}%, set by Super Admin — may vary by category) is deducted automatically from delivered/completed sales. No real payment processor is integrated yet, so Payment Charges are honestly 0.</p>
      {Object.keys(earnings?.totalsByCurrency || {}).length === 0 && <p className="text-xs mb-4" style={{ color: 'var(--ink-soft)' }}>{earnings === null ? 'Loading...' : 'No sales yet.'}</p>}
      {Object.entries(earnings?.totalsByCurrency || {}).map(([currency, e]) => {
        const rows = [
          { label: 'Gross Sales', value: e.grossSales, color: 'ink' },
          { label: 'Platform Commission', value: e.platformCommission, color: 'gold' },
          { label: 'Payment Charges', value: e.paymentCharges, color: 'ink' },
          { label: 'Refund Deductions', value: e.refundDeductions, color: 'rose, #e11d48' },
          { label: 'Net Earnings', value: e.netEarnings, color: 'emerald' },
          { label: 'Pending Earnings', value: e.pendingEarnings, color: 'gold' },
          { label: 'Available Earnings', value: e.availableEarnings, color: 'emerald' }
        ];
        return (
          <div key={currency} className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {rows.map((r) => (
              <div key={r.label} className="card" style={{ padding: 18 }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--ink-soft)' }}>{r.label}</span>
                <strong style={{ fontSize: 22, fontFamily: 'Fraunces, serif', display: 'block', marginTop: 6, color: `var(--${r.color})` }}>{currency} {r.value}</strong>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

// Seller sidebar — Withdrawals, focused (Withdraw action + history only — full balance cards and
// transaction history live under Wallet & Transactions).
function WithdrawalsPanel({ onFlash }) {
  const [wallet, setWallet] = useState(null);
  const [withdrawals, setWithdrawals] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState(null);

  function load() {
    apiRequest('/marketplace/sellers/mine/wallet').then((data) => {
      setWallet(data);
      setSelectedCurrency((prev) => prev && data[prev] ? prev : Object.keys(data)[0] || null);
    }).catch((err) => onFlash(err.message));
    apiRequest('/marketplace/sellers/mine/withdrawals').then(setWithdrawals).catch((err) => onFlash(err.message));
  }
  useEffect(load, [onFlash]); // eslint-disable-line react-hooks/exhaustive-deps

  async function withdraw({ payoutMethod, payoutDetails }) {
    try {
      await apiRequest('/marketplace/sellers/mine/withdraw', { method: 'POST', body: { currency: selectedCurrency, payoutMethod, payoutDetails } });
      onFlash('Withdrawal requested.', 'success');
      load();
    } catch (err) { onFlash(err.message); }
  }

  if (wallet === null || withdrawals === null) return <p role="status" className="admin-notice">Loading...</p>;
  const currencies = Object.keys(wallet);
  const available = selectedCurrency ? wallet[selectedCurrency]?.availableBalance ?? 0 : 0;

  const fieldLabel = { fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--ink-soft)' };

  return (
    <div>
      <div className="flex items-center" style={{ gap: 12, marginBottom: 24 }}>
        <span style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--sand)', color: 'var(--forest)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><FaMoneyBillWave aria-hidden="true" size={16} /></span>
        <h3 className="font-semibold" style={{ margin: 0 }}>Withdrawals</h3>
      </div>

      {currencies.length === 0 ? (
        <div className="student-empty-state" style={{ border: '1px solid var(--sand-line)', borderRadius: 18, marginBottom: 24 }}>
          <FaMoneyBillWave aria-hidden="true" />
          <p>No available balance yet</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 20, marginBottom: 28 }}>
          <p style={fieldLabel}>Withdraw Available Balance</p>
          <div className="flex flex-wrap items-end" style={{ gap: 14, marginTop: 12 }}>
            <div style={{ flex: '0 1 160px', minWidth: 120 }}>
              <CustomSelect value={selectedCurrency || ''} onChange={setSelectedCurrency} ariaLabel="Currency" minWidth="100%" options={currencies.map((c) => ({ value: c, label: c }))} />
            </div>
            <PayoutRequestForm onSubmit={withdraw} disabled={available <= 0} label={`Withdraw Funds (${selectedCurrency} ${available})`} />
          </div>
        </div>
      )}

      <p style={{ ...fieldLabel, marginBottom: 12 }}>Withdrawal History</p>
      <Table
        headers={['Amount', 'Currency', 'Status', 'Requested', 'Processed']}
        rows={withdrawals.map((wd) => [
          wd.amount, wd.currency,
          <Tag status={SELLER_WITHDRAWAL_STATUS[wd.status]?.tag} label={SELLER_WITHDRAWAL_STATUS[wd.status]?.label} />,
          new Date(wd.createdAt).toLocaleDateString(),
          wd.processedAt ? new Date(wd.processedAt).toLocaleDateString() : '—'
        ])}
        empty="No withdrawals requested yet."
      />
    </div>
  );
}

function classStatusNow(entry) {
  const now = new Date();
  const dow = DOW_INDEX[entry.dayOfWeek];
  if (dow === undefined) return 'upcoming';
  if (dow !== now.getDay()) return 'upcoming';
  const [sh, sm] = (entry.startTime || '0:0').split(':').map(Number);
  const [eh, em] = (entry.endTime || '0:0').split(':').map(Number);
  const nowMin = now.getHours() * 60 + now.getMinutes();
  if (nowMin >= sh * 60 + sm && nowMin <= eh * 60 + em) return 'live';
  return nowMin < sh * 60 + sm ? 'today' : 'past';
}

// classStatusNow returns 4 real states, but the table only ever showed "Live" vs a blanket
// "pending" — which read as "awaiting approval" when it actually just meant "not right now",
// even for a class that already finished hours ago. These give each state its own honest label.
const CLASS_STATUS_TAG = { live: 'approved', today: 'pending', upcoming: 'pending', past: 'completed' };
const CLASS_STATUS_LABEL = { live: 'Live Now', today: 'Upcoming', upcoming: 'Upcoming', past: 'Completed' };

// PDF Section 4 — "My Classes: Central Learning Entry": Current / Upcoming / In-Progress,
// with a clear Live indicator and a Join Class action (structure is real; the actual video
// classroom is a paid/third-party integration the client hasn't provided credentials for yet,
// so Join Class explains that instead of silently doing nothing).
function TimetableView({ onFlash, url }) {
  const [entries, setEntries] = useState(null);
  useEffect(() => { apiRequest(url).then(setEntries).catch((err) => onFlash(err.message)); }, [url, onFlash]);

  function joinClass(entry) {
    if (entry.meetingLink) { window.open(entry.meetingLink, '_blank', 'noreferrer'); return; }
    onFlash('No video provider is connected yet for live classes — once one is configured, Join Class will open it directly here.', 'error');
  }

  const sorted = (entries || [])
    .map((t) => ({ ...t, __status: classStatusNow(t), __nextDate: nextDateForDow(t.dayOfWeek, t.startTime) }))
    .sort((a, b) => (a.__status === 'live' ? -1 : 1) - (b.__status === 'live' ? -1 : 1) || (a.__nextDate || 0) - (b.__nextDate || 0));

  const live = sorted.filter((t) => t.__status === 'live');

  return (
    <div>
      <h3 className="font-semibold mb-2">My Classes</h3>

      {live.length > 0 && (
        <div className="mb-4">
          {live.map((t) => (
            <div key={t._id} className="border rounded-xl p-3 mb-2 flex items-center justify-between" style={{ borderColor: 'var(--rose)' }}>
              <div>
                <span style={{ color: 'var(--rose)', fontWeight: 700 }}>🔴 Class in Progress</span>
                <p className="text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>{t.subject} · {t.startTime}–{t.endTime} · {t.teacher?.fullName || ''}</p>
              </div>
              <button type="button" className="btn btn-primary" onClick={() => joinClass(t)}>Join Class</button>
            </div>
          ))}
        </div>
      )}

      <Table
        loading={entries === null}
        headers={['Next Date', 'Day', 'Time', 'Subject', 'Teacher', 'Room', 'Status', 'Action']}
        rows={sorted.map((t) => [
          t.__nextDate ? t.__nextDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '—',
          DOW_LABEL[t.dayOfWeek], `${t.startTime}–${t.endTime}`, t.subject, t.teacher?.fullName || '—', t.room || '—',
          <Tag status={CLASS_STATUS_TAG[t.__status] || 'pending'} label={CLASS_STATUS_LABEL[t.__status] || 'Upcoming'} />,
          t.__status === 'live' ? <button className="btn btn-primary" style={{ padding: '4px 12px', fontSize: '0.78rem' }} onClick={() => joinClass(t)}>Join</button> : '—'
        ])}
        empty="No timetable set up yet."
      />
    </div>
  );
}

const PAYMENT_METHODS = [
  { value: 'card', label: 'Card' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'mobile_wallet', label: 'Mobile Wallet' },
  { value: 'cash', label: 'Cash' },
  { value: 'other', label: 'Other' }
];

// Self-service "Pay Now" for a Fee record — no real payment gateway is connected yet, so the
// payer picks a method and self-confirms, same honesty pattern as FundingRequest's Donate flow.
// Works for both the student paying their own fee and a parent paying a linked child's fee.
// Real Stripe Checkout redirect (spec 4.6/3A.3) — separate from the self-report methods below.
// Renders nothing if Stripe isn't configured (GET /payments/stripe/config), so no dead button
// shows up before a real key is added.
let paddleLoadPromise = null;
// Only one Paddle.Checkout can be open at a time, so a single module-level slot for "what to do
// when it completes/closes" is enough — set right before opening, read by the one shared
// eventCallback registered at Initialize time.
let paddleActiveHandlers = null;

// Loads Paddle.js once (cached across every button on the page) and initializes it with the
// client-side token + sandbox/production environment the backend reports.
function loadPaddle(clientToken, environment) {
  if (window.Paddle) return Promise.resolve(window.Paddle);
  if (paddleLoadPromise) return paddleLoadPromise;
  paddleLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
    script.onload = () => {
      if (environment === 'sandbox') window.Paddle.Environment.set('sandbox');
      window.Paddle.Initialize({
        token: clientToken,
        eventCallback(data) {
          if (data.name === 'checkout.completed') paddleActiveHandlers?.onCompleted?.();
          if (data.name === 'checkout.closed') paddleActiveHandlers?.onClosed?.();
        }
      });
      resolve(window.Paddle);
    };
    script.onerror = () => reject(new Error('Failed to load Paddle.js'));
    document.head.appendChild(script);
  });
  return paddleLoadPromise;
}

function PaddleCheckoutButton({ feeId, onFlash, onPaid }) {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => { apiRequest('/payments/paddle/config').then(setConfig).catch(() => setConfig({ enabled: false })); }, []);

  // Best-effort local/dev fallback: production relies on the real Paddle webhook (real-time,
  // signature-verified); this GET just asks Paddle's API directly "is it done yet?" so testing
  // works even when the backend runs on localhost, which Paddle's webhook can never reach.
  async function sync() {
    try {
      const fee = await apiRequest(`/payments/paddle/fees/${feeId}/sync`);
      if (fee.status === 'paid') onFlash('Payment confirmed!', 'success');
      onPaid?.();
    } catch (err) { onPaid?.(); }
  }

  async function startCheckout() {
    setLoading(true);
    try {
      const { transactionId } = await apiRequest(`/payments/paddle/fees/${feeId}/checkout`, { method: 'POST' });
      const Paddle = await loadPaddle(config.clientToken, config.environment);
      paddleActiveHandlers = { onCompleted: sync, onClosed: sync };
      Paddle.Checkout.open({
        transactionId,
        settings: { displayMode: 'overlay' }
      });
    } catch (err) { onFlash(err.message); } finally { setLoading(false); }
  }

  if (!config?.enabled) return null;
  return (
    <button type="button" className="btn" style={{ padding: '5px 12px', fontSize: '0.75rem', borderColor: '#1e2f4f', color: '#1e2f4f' }} onClick={startCheckout} disabled={loading}>
      {loading ? 'Loading...' : '🌍 Pay Online (Card / Apple Pay / Google Pay)'}
    </button>
  );
}

function StripeCheckoutButton({ feeId, onFlash }) {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => { apiRequest('/payments/stripe/config').then(setConfig).catch(() => setConfig({ enabled: false })); }, []);

  async function startCheckout() {
    setLoading(true);
    try {
      const { url } = await apiRequest(`/payments/stripe/fees/${feeId}/checkout`, { method: 'POST' });
      window.location.href = url;
    } catch (err) { onFlash(err.message); setLoading(false); }
  }

  if (!config?.enabled) return null;
  return (
    <button type="button" className="btn" style={{ padding: '5px 12px', fontSize: '0.75rem', borderColor: '#635bff', color: '#635bff' }} onClick={startCheckout} disabled={loading}>
      {loading ? 'Redirecting...' : '💳 Pay Online (Stripe)'}
    </button>
  );
}

function PayFeeButton({ fee, payUrl, onFlash, onPaid }) {
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState('card');
  const [paying, setPaying] = useState(false);

  async function confirmPay(e) {
    e.preventDefault();
    setPaying(true);
    try {
      const updated = await apiRequest(payUrl, { method: 'PATCH', body: { paymentMethod: method } });
      onFlash(`Payment confirmed. Receipt ${updated.transactionId}`, 'success');
      setOpen(false);
      onPaid?.(updated);
    } catch (err) { onFlash(err.message); } finally { setPaying(false); }
  }

  if (fee.status === 'paid') {
    return fee.transactionId
      ? <span className="text-xs" style={{ color: 'var(--ink-soft)' }} title={fee.paidVia}>Receipt {fee.transactionId}</span>
      : <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>—</span>;
  }

  if (fee.status === 'processing') {
    return <span className="text-xs" style={{ color: 'var(--gold)' }}>Awaiting payment confirmation...</span>;
  }

  if (!open) {
    return (
      <div className="flex items-center flex-wrap" style={{ gap: 6 }}>
        <PaddleCheckoutButton feeId={fee._id} onFlash={onFlash} onPaid={onPaid} />
        <StripeCheckoutButton feeId={fee._id} onFlash={onFlash} />
        <button type="button" className="btn" style={{ padding: '5px 12px', fontSize: '0.75rem' }} onClick={() => setOpen(true)} title="Only use this if you already paid outside CareerZ (cash, bank transfer) and need to record it">
          I already paid another way
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={confirmPay} className="flex items-center flex-wrap" style={{ gap: 6 }}>
      <CustomSelect value={method} onChange={setMethod} ariaLabel="Payment method" minWidth={130} options={PAYMENT_METHODS} />
      <button type="submit" className="btn btn-primary" style={{ padding: '5px 12px', fontSize: '0.75rem' }} disabled={paying}>{paying ? '...' : 'Confirm'}</button>
      <button type="button" className="btn" style={{ padding: '5px 10px', fontSize: '0.75rem' }} onClick={() => setOpen(false)} disabled={paying}>Cancel</button>
    </form>
  );
}

const PAYOUT_METHODS = [
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'mobile_wallet', label: 'Mobile Wallet' },
  { value: 'other', label: 'Other' }
];

// Shared "Withdraw Funds" flow for anyone cashing out a balance (Education Agent commissions,
// Marketplace Seller earnings) — the payee picks how they want to receive it and provides an
// account reference, same honesty pattern as PayFeeButton (no real payment processor here).
function PayoutRequestForm({ onSubmit, disabled, label }) {
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState('bank_transfer');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!details.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit({ payoutMethod: method, payoutDetails: details.trim() });
      setOpen(false);
      setDetails('');
    } finally { setSubmitting(false); }
  }

  if (!open) {
    return <button type="button" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.8rem' }} disabled={disabled} onClick={() => setOpen(true)}>{label}</button>;
  }

  return (
    <form onSubmit={submit} style={{ display: 'grid', gap: 8, maxWidth: 320, marginTop: 10 }}>
      <CustomSelect value={method} onChange={setMethod} ariaLabel="Payout method" minWidth="100%" options={PAYOUT_METHODS} />
      <input className="form-input" placeholder="Account number / wallet ID / details" value={details} onChange={(e) => setDetails(e.target.value)} required />
      <div className="flex gap-2">
        <button type="submit" className="btn btn-primary" style={{ padding: '7px 14px', fontSize: '0.78rem' }} disabled={submitting}>{submitting ? 'Requesting...' : 'Confirm Request'}</button>
        <button type="button" className="btn" style={{ padding: '7px 14px', fontSize: '0.78rem' }} onClick={() => setOpen(false)} disabled={submitting}>Cancel</button>
      </div>
    </form>
  );
}

// Shared one-shot "pay for this now" trigger — Feature Job purchase, Payslip mark-paid, etc.
// Renders a plain button; expands into a payment-method picker on click.
function PayMethodModalButton({ onSubmit, disabled, label, methods = PAYMENT_METHODS, confirmLabel = 'Confirm' }) {
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState(methods[0]?.value || 'other');
  const [submitting, setSubmitting] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setSubmitting(true);
    try { await onSubmit(method); setOpen(false); } finally { setSubmitting(false); }
  }

  if (!open) {
    return <button type="button" className="btn btn-primary" style={{ padding: '7px 14px', fontSize: '0.78rem' }} disabled={disabled} onClick={() => setOpen(true)}>{label}</button>;
  }

  return (
    <form onSubmit={submit} className="flex items-center flex-wrap" style={{ gap: 6 }}>
      <CustomSelect value={method} onChange={setMethod} ariaLabel="Payment method" minWidth={130} options={methods} />
      <button type="submit" className="btn btn-primary" style={{ padding: '5px 12px', fontSize: '0.75rem' }} disabled={submitting}>{submitting ? '...' : confirmLabel}</button>
      <button type="button" className="btn" style={{ padding: '5px 10px', fontSize: '0.75rem' }} onClick={() => setOpen(false)} disabled={submitting}>Cancel</button>
    </form>
  );
}

function StudentFeesPanel({ onFlash }) {
  const [fees, setFees] = useState(null);
  function load() { apiRequest('/students/me/fees').then(setFees).catch((err) => onFlash(err.message)); }
  useEffect(load, [onFlash]);

  return (
    <div>
      <h3 className="font-semibold mb-2">My Fees</h3>
      <Table
        loading={fees === null}
        headers={['Title', 'Amount', 'Due', 'Status', 'Payment']}
        rows={(fees || []).map((f) => [
          f.title, `${f.currency} ${f.amount}`, f.dueDate ? new Date(f.dueDate).toLocaleDateString() : '—',
          <Tag status={f.status === 'paid' ? 'approved' : f.status === 'overdue' ? 'rejected' : 'pending'} />,
          <PayFeeButton fee={f} payUrl={`/students/me/fees/${f._id}/pay`} onFlash={onFlash} onPaid={load} />
        ])}
        empty="No fee records yet."
      />
      <WalletCard onFlash={onFlash} />
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

  const scheduledExams = (exams || []).filter((ex) => ex.scheduledDate);

  return (
    <div>
      {scheduledExams.length > 0 && (
        <>
          <h3 className="font-semibold mb-2">Admit Cards</h3>
          <div style={{ display: 'grid', gap: 10, marginBottom: 24 }}>
            {scheduledExams.map((ex) => (
              <div key={ex._id} className="card" style={{ padding: 18 }}>
                <div className="flex items-center justify-between flex-wrap" style={{ gap: 12 }}>
                  <div style={{ minWidth: 0 }}>
                    <strong className="text-sm">{ex.title}</strong>
                    <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 2 }}>{ex.courseTitle} · {ex.type[0].toUpperCase() + ex.type.slice(1)}{ex.durationMinutes ? ` · ${ex.durationMinutes} min` : ''}</p>
                  </div>
                  <strong style={{ fontSize: 15, fontFamily: 'Fraunces, serif', whiteSpace: 'nowrap' }}>{new Date(ex.scheduledDate).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</strong>
                </div>
                {(ex.venue || ex.instructions) && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--sand-line)', display: 'grid', gap: 6 }}>
                    {ex.venue && <p className="text-xs"><strong style={{ color: 'var(--ink-soft)' }}>Venue: </strong>{ex.venue}</p>}
                    {ex.instructions && <p className="text-xs" style={{ lineHeight: 1.6 }}><strong style={{ color: 'var(--ink-soft)' }}>Instructions: </strong>{ex.instructions}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

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

// A clickable summary tile: heading, optional count, real body content, and a click-through
// to the tab that owns the full module (matches the spec's "click a card to open its module").
function SummaryCard({ title, count, onClick, children, icon: Icon }) {
  if (Icon) return <button type="button" className="student-metric" onClick={onClick}><span className="student-metric-top"><span className="student-metric-icon"><Icon aria-hidden="true" /></span><FaArrowUpRightFromSquare className="action-arrow" aria-hidden="true" /></span><strong>{count}</strong><span className="student-metric-label">{title}</span></button>;
  return (
    <div className="card reveal in" style={{ padding: 20, cursor: onClick ? 'pointer' : 'default' }} onClick={onClick}>
      <h4 style={{ fontSize: 13, fontWeight: 650, color: 'var(--ink-soft)', lineHeight: 1.4, marginBottom: 10, overflowWrap: 'anywhere' }}>{title}</h4>
      {count !== undefined && <strong style={{ fontSize: 26, fontFamily: 'Fraunces, serif', display: 'block', lineHeight: 1.2, overflowWrap: 'anywhere' }}>{count}</strong>}
      {children}
    </div>
  );
}

function SectionHeading({ title }) {
  return <div className="dash-section-title" style={{ marginTop: 32 }}><h2>{title}</h2></div>;
}

const STUDENT_SECTION_ICONS = {
  'Upcoming / Current Class': FaChalkboardUser,
  'Academic Overview': FaGraduationCap,
  'Course Progress': FaBookOpen,
  'Assignments & Tests Overview': FaClipboardList,
  'Applications Overview': FaFileLines,
  'Wallet & Fee Overview': FaWallet,
  'Scholarship & Job Overview': FaAward,
  Calendar: FaCalendarCheck,
  'Recent Activity': FaChartLine,
  Notifications: FaBell
};

function StudentOverviewLayout({ children }) {
  const items = Children.toArray(children);
  const sections = [];
  for (let index = 0; index < items.length; index++) {
    const item = items[index];
    if (item.type === SectionHeading && items[index + 1]) {
      const title = item.props.title;
      const Icon = STUDENT_SECTION_ICONS[title] || FaGraduationCap;
      const wide = ['Course Progress', 'Applications Overview', 'Scholarship & Job Overview', 'Calendar', 'Wallet & Fee Overview'].includes(title);
      sections.push(<section key={item.key} className={`student-detail-section${wide ? ' student-section-wide' : ''}`}><div className="student-detail-heading"><span className="student-detail-icon"><Icon aria-hidden="true" /></span><h2>{title}</h2></div><div className="student-detail-body">{items[++index]}</div></section>);
    } else {
      sections.push(<div key={item.key} className="student-section-wide student-overview-block">{item}</div>);
    }
  }
  return <div className="student-overview student-section-layout">{sections}</div>;
}

function StudentSummary({ onNavigate, user }) {
  const [data, setData] = useState(null);
  const [dash, setDash] = useState(null);
  const [error, setError] = useState('');
  const [notifications, setNotifications] = useState(null);
  const [examDetails, setExamDetails] = useState({});
  const [recentJobs, setRecentJobs] = useState(null);
  const [attendanceEvents, setAttendanceEvents] = useState([]);
  const [resultEvents, setResultEvents] = useState([]);

  useEffect(() => {
    apiRequest('/dashboard/summary').then(setData).catch((err) => setError(err.message));
    apiRequest('/students/me/dashboard').then(setDash).catch((err) => setError(err.message));
    apiRequest('/notifications/mine').then(setNotifications).catch(() => {});
    // "Recent job updates" — the newest open postings on the platform (not saved/applied),
    // reusing the same public job search endpoint the Jobs tab already uses.
    apiRequest('/jobs').then((list) => setRecentJobs(list.slice(0, 3))).catch(() => setRecentJobs([]));
    // "Joined/completed class" for Recent Activity — real attendance-present records,
    // reusing the same endpoint the full Assignments & Tests page already calls.
    apiRequest('/students/me/attendance').then((records) => {
      setAttendanceEvents(records.filter((r) => r.records?.[0]?.status === 'present').slice(0, 5)
        .map((r) => ({ id: `att-${r._id}`, title: 'Attended a class', desc: '', time: r.date, status: 'approved' })));
    }).catch(() => {});
    // "Test/result update" for Recent Activity — the trimmed dash.latestGrades has no
    // timestamp, so this fetches full Result docs (same endpoint the full page uses) for a real date.
    apiRequest('/students/me/results').then((results) => {
      setResultEvents(results.slice(0, 5).map((r) => ({ id: `result-${r._id}`, title: `Result update: ${r.subject || 'Test'} — ${r.marksObtained}/${r.totalMarks}`, desc: r.grade || '', time: r.createdAt, status: 'approved' })));
    }).catch(() => {});
    // The dashboard summary's pendingExams only carries {id, title} — the same
    // enrollment -> per-course /exams fetch the full Exams page already uses gives us
    // the real type/scheduledDate/course, so quizzes and tests can actually be told apart.
    apiRequest('/students/me/enrollments').then(async (enrollments) => {
      const active = enrollments.filter((e) => e.course);
      const lists = await Promise.all(active.map((e) =>
        apiRequest(`/courses/${e.course._id}/exams`).then((list) => list.map((ex) => ({ ...ex, courseTitle: e.course.title }))).catch(() => [])
      ));
      setExamDetails(Object.fromEntries(lists.flat().map((ex) => [ex._id, ex])));
    }).catch(() => {});
  }, []);

  if (error) return <div role="alert" className="admin-notice error">{error}</div>;
  if (!data || !dash) return <p role="status" className="admin-notice">Loading your dashboard...</p>;

  const inst = dash.welcome.institution;
  const cls = dash.welcome.classSection;
  const unread = notifications ? notifications.filter((n) => !n.read).length : null;
  const roles = user?.roles || [];

  // Quick Actions — the spec's exact 9, but only the ones relevant right now (never all 9 at once).
  const quickActions = [
    (dash.currentClasses.length > 0 || dash.upcomingClasses.length > 0) && { label: 'Join Class', key: 'classes' },
    dash.enrollments.length > 0 && { label: 'Continue Course', key: 'courses' },
    dash.pendingAssignments.length > 0 && { label: 'Submit Assignment', key: 'assignments' },
    dash.pendingExams.length > 0 && { label: 'Take Test', key: 'assignments' },
    { label: 'Apply for Scholarship', key: 'scholarships' },
    { label: 'Apply for Job', key: 'jobs' },
    roles.includes('marketplace_seller') && { label: 'Add Marketplace Listing', key: 'marketplace' },
    { label: 'View Wallet', key: 'wallet' },
    { label: 'View Messages', key: 'messages' }
  ].filter(Boolean);

  return (
    <StudentOverviewLayout>
      {/* 2. Welcome / Profile Overview */}
      <div className="student-identity">
        {user?.profilePhoto
          ? <img src={user.profilePhoto} alt="" style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }} />
          : <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--forest)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{(user?.fullName || '?')[0]}</div>}
        <div>
          <strong className="text-sm">{user?.fullName || 'Student'}</strong>
          <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
            {inst?.name || 'Not connected to an institution'}{cls?.name ? ` · ${cls.name}` : ''}
          </p>
          <p style={{ fontSize: 12, color: 'var(--ink-soft)' }}>
            {dash.welcome.program ? `Program: ${dash.welcome.program}` : 'Program: —'} · {dash.welcome.currentTerm ? `Term: ${dash.welcome.currentTerm}` : 'Term: —'}
          </p>
        </div>
        <button type="button" className="student-profile-action" onClick={() => onNavigate?.('profile')}>Manage profile <FaArrowUpRightFromSquare className="action-arrow" aria-hidden="true" /></button>
      </div>

      {/* 3. Main Summary Cards — exactly the 8 the spec lists, every one clickable
          (OverviewStats has no click handler at all, so all 8 now use SummaryCard instead). */}
      <div className="dash-section-title"><h2>Overview</h2></div>
      <div className="student-metrics">
        <SummaryCard icon={FaClipboardList} title="Active Applications" count={dash.activeApplications} onClick={() => onNavigate?.('applications')} />
        <SummaryCard icon={FaBookOpen} title="Enrolled Courses" count={dash.enrollments.length} onClick={() => onNavigate?.('courses')} />
        <SummaryCard icon={FaCalendarCheck} title="Upcoming Classes" count={dash.upcomingClasses.length} onClick={() => onNavigate?.('classes')} />
        <SummaryCard icon={FaAward} title="Scholarships" count={dash.scholarships.recommended.length} onClick={() => onNavigate?.('scholarships')} />
        <SummaryCard icon={FaBriefcase} title="Saved Jobs" count={dash.savedJobs.length} onClick={() => onNavigate?.('jobs')} />
        <SummaryCard icon={FaWallet} title="Wallet Balance" count={`${user?.currency || 'USD'} ${Number(dash.wallet.availableBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} onClick={() => onNavigate?.('wallet')} />
        <SummaryCard icon={FaChartLine} title="Academic Progress" count={dash.academicProgress.attendanceRate !== null ? `${dash.academicProgress.attendanceRate}%` : '—'} onClick={() => onNavigate?.('assignments')} />
        <SummaryCard icon={FaBell} title="Recent Activity" count={dash.recentActivity.length} onClick={() => onNavigate?.('assignments')} />
      </div>

      {/* 4. Upcoming/Current Class Section — one overview block, full detail lives on My Classes */}
      <SectionHeading title="Upcoming / Current Class" />
      <div className="card student-block">
        {dash.currentClasses.length === 0 && dash.upcomingClasses.length === 0 && <p className="student-empty-state" style={{ color: 'var(--ink-soft)' }}>Nothing scheduled — check My Classes once your institution sets a timetable.</p>}
        {dash.currentClasses.map((c) => (
          <div key={c._id} className="flex items-center justify-between mb-2">
            <div>
              <span style={{ color: 'var(--rose)', fontWeight: 700, fontSize: 13 }}>🔴 Class in Progress</span>
              <p className="text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>Subject: {c.subject} · Teacher: {c.teacher?.fullName || '—'}{inst?.name ? ` · Institution: ${inst.name}` : ''}</p>
              <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>Date: {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} · Time: {c.startTime}–{c.endTime} · Status: Live</p>
            </div>
            <button type="button" className="btn btn-primary" style={{ padding: '5px 14px', fontSize: '0.78rem' }} onClick={() => onNavigate?.('classes')}>Join Class</button>
          </div>
        ))}
        {dash.currentClasses.length === 0 && dash.upcomingClasses.slice(0, 1).map((c) => {
          const nextDate = nextDateForDow(c.dayOfWeek, c.startTime);
          return (
            <div key={c._id} className="flex items-center justify-between">
              <div>
                <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>Next up</span>
                <p className="text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>Subject: {c.subject} · Teacher: {c.teacher?.fullName || '—'}{inst?.name ? ` · Institution: ${inst.name}` : ''}</p>
                <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>
                  Date: {nextDate ? nextDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) : DOW_LABEL[c.dayOfWeek]} · Time: {c.startTime}–{c.endTime} · Status: Upcoming
                </p>
              </div>
              <button type="button" className="btn" style={{ padding: '5px 14px', fontSize: '0.78rem' }} onClick={() => onNavigate?.('classes')}>View My Classes</button>
            </div>
          );
        })}
      </div>

      {/* 5. Academic Overview */}
      <SectionHeading title="Academic Overview" />
      <div className="student-academic">
        <dl className="student-academic-details">
          {[['Institution', inst?.name || 'Not connected'], ['Class / Grade', cls?.name || 'Not set'], ['Program', dash.welcome.program || 'Not set'], ['Term', dash.welcome.currentTerm || 'Not set']].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
        </dl>
        <div className="student-progress-row"><span>Course progress</span><strong>{dash.academicProgress.avgCourseProgress}%</strong></div>
        <progress className="student-progress-bar" aria-label="Average course progress" max="100" value={dash.academicProgress.avgCourseProgress} />
        <p className="student-detail-note">Attendance: {dash.academicProgress.attendanceRate !== null ? `${dash.academicProgress.attendanceRate}%` : 'No data yet'}</p>
        <p className="student-detail-note">Subjects: {dash.academicProgress.subjects.length ? dash.academicProgress.subjects.join(', ') : 'No subjects assigned'}</p>
      </div>

      {/* 6. Course Progress Overview */}
      <SectionHeading title="Course Progress" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {dash.courseProgressDetail.length === 0 && <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>No courses yet — browse and enroll.</p>}
        {dash.courseProgressDetail.slice(0, 4).map((c) => (
          <div key={c.id} className="card student-block-sub">
            <div className="flex items-center justify-between">
              <strong className="text-sm">{c.course?.title}</strong>
              <button type="button" className="btn" style={{ padding: '4px 12px', fontSize: '0.75rem' }} onClick={() => onNavigate?.('courses')}>Continue Course</button>
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>{c.currentLesson ? `Current lesson: ${c.currentLesson}` : 'No lessons yet'}</p>
            <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>{c.progressPercent}% complete · {c.completedLessons}/{c.totalLessons} lessons done · {c.remainingLessons} remaining</p>
          </div>
        ))}
      </div>

      {/* 7. Applications Overview */}
      {/* 8. Assignment / Test Overview — comes before Applications Overview here, matching
          the document's own "Short layout" line: "...Course Progress → Assignments →
          Applications → Wallet/Fees...". pendingExams are enriched client-side with real
          type/scheduledDate/course (fetched the same way the full Exams page does), so
          quizzes and tests are genuinely told apart instead of both saying "Test". */}
      <SectionHeading title="Assignments & Tests Overview" />
      <div className="card student-block">
        {(() => {
          const enrichedExams = dash.pendingExams.map((e) => ({ ...e, ...examDetails[e.id] }));
          const quizzes = enrichedExams.filter((e) => e.type === 'quiz');
          const tests = enrichedExams.filter((e) => e.type && e.type !== 'quiz');
          const untyped = enrichedExams.filter((e) => !e.type);

          if (dash.pendingAssignments.length === 0 && enrichedExams.length === 0) {
            return <p className="student-empty-state">You are all caught up. No pending assignments or tests.</p>;
          }
          return (
            <>
              {dash.pendingAssignments.length > 0 && <p className="text-xs font-semibold mb-1">Pending Assignments</p>}
              {dash.pendingAssignments.slice(0, 3).map((a) => (
                <div key={a.id} className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-xs">{a.title}</p>
                    <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>Due: {a.dueDate ? new Date(a.dueDate).toLocaleDateString() : '—'} · Submission status: Not Submitted</p>
                  </div>
                  <button type="button" className="btn" style={{ padding: '3px 10px', fontSize: '0.72rem' }} onClick={() => onNavigate?.('assignments')}>Submit Assignment</button>
                </div>
              ))}

              {quizzes.length > 0 && <p className="text-xs font-semibold mb-1 mt-2">Upcoming Quizzes</p>}
              {quizzes.slice(0, 3).map((e) => (
                <div key={e.id} className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-xs">{e.title}{e.courseTitle ? ` — ${e.courseTitle}` : ''}</p>
                    <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>Due: {e.scheduledDate ? new Date(e.scheduledDate).toLocaleString() : 'Not scheduled'} · Submission status: Not Attempted</p>
                  </div>
                  <button type="button" className="btn" style={{ padding: '3px 10px', fontSize: '0.72rem' }} onClick={() => onNavigate?.('assignments')}>Take Test</button>
                </div>
              ))}

              {tests.length > 0 && <p className="text-xs font-semibold mb-1 mt-2">Upcoming Tests</p>}
              {tests.slice(0, 3).map((e) => (
                <div key={e.id} className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-xs">{e.title}{e.courseTitle ? ` — ${e.courseTitle}` : ''} <span style={{ color: 'var(--ink-soft)' }}>({e.type})</span></p>
                    <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>Due: {e.scheduledDate ? new Date(e.scheduledDate).toLocaleString() : 'Not scheduled'} · Submission status: Not Attempted</p>
                  </div>
                  <button type="button" className="btn" style={{ padding: '3px 10px', fontSize: '0.72rem' }} onClick={() => onNavigate?.('assignments')}>Take Test</button>
                </div>
              ))}

              {untyped.length > 0 && untyped.slice(0, 3).map((e) => (
                <div key={e.id} className="flex items-center justify-between mb-2">
                  <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>{e.title} · Submission status: Not Attempted</p>
                  <button type="button" className="btn" style={{ padding: '3px 10px', fontSize: '0.72rem' }} onClick={() => onNavigate?.('assignments')}>Take Test</button>
                </div>
              ))}
            </>
          );
        })()}
        {dash.latestGrades.length > 0 && <p className="text-xs mt-2" style={{ color: 'var(--ink-soft)' }}>Latest result: {dash.latestGrades[0].subject} — {dash.latestGrades[0].marksObtained}/{dash.latestGrades[0].totalMarks}</p>}
        <button type="button" className="btn mt-2" style={{ padding: '5px 14px', fontSize: '0.78rem' }} onClick={() => onNavigate?.('assignments')}>View All Assignments & Tests</button>
      </div>

      {/* 7. Applications Overview */}
      <SectionHeading title="Applications Overview" />
      <div className="card student-block-sub">
        <Table
          headers={['Type', 'Title', 'Status', 'Date']}
          rows={dash.applicationsOverview.map((a) => { const s = overviewStatusDisplay(a); return [a.type, a.title || '—', <Tag status={s.tag} label={s.label} />, a.time ? new Date(a.time).toLocaleDateString() : '—']; })}
          empty="No applications yet."
        />
        <button type="button" className="btn mt-2" style={{ padding: '5px 14px', fontSize: '0.78rem' }} onClick={() => onNavigate?.('applications')}>View All Applications</button>
      </div>

      {/* 9. Wallet & Fee Overview */}
      <SectionHeading title="Wallet & Fee Overview" />
      <div className="card student-block">
        <div className="overview-balances">
          <div className="overview-balance-primary"><span>Available balance</span><strong><small>{user?.currency || 'USD'}</small> {Number(dash.wallet.availableBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong><span>Ready to use in your wallet</span></div>
          <div><span>Outstanding fees</span><strong><small>{user?.currency || 'USD'}</small> {Number(dash.wallet.pendingFeeTotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong><span>{dash.wallet.pendingFeeCount || 0} pending fee records</span></div>
        </div>
        <p className="text-xs font-semibold mt-3">Outstanding Fees / Challans</p>
        {dash.wallet.pendingFees.length === 0 && (
          <p className="text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>No outstanding fees — <Tag status="approved" /> Payment status: Up to date.</p>
        )}
        {dash.wallet.pendingFees.slice(0, 2).map((f) => (
          <p key={f._id} className="text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>{f.title} — {f.currency} {f.amount} · Due: {f.dueDate ? new Date(f.dueDate).toLocaleDateString() : '—'} · Payment status: <Tag status={f.status === 'overdue' ? 'rejected' : 'pending'} /></p>
        ))}

        <p className="text-xs font-semibold mt-3">Recent Transactions</p>
        {dash.wallet.recentTransactions.length === 0 && (
          <p className="text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>No transactions yet.</p>
        )}
        {dash.wallet.recentTransactions.slice(0, 2).map((t, i) => (
          <p key={i} className="text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>{t.label}: {t.currency} {t.amount} · {t.date ? new Date(t.date).toLocaleDateString() : ''}</p>
        ))}

        <button type="button" className="btn btn-primary mt-3" style={{ padding: '5px 14px', fontSize: '0.78rem' }} onClick={() => onNavigate?.('wallet')}>View Wallet</button>
      </div>

      {/* 10. Scholarship & Job Overview */}
      <SectionHeading title="Scholarship & Job Overview" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="card student-block-sub">
          <strong className="text-sm">Recommended Scholarships</strong>
          {dash.scholarships.recommended.length === 0 && <p className="text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>None open right now.</p>}
          {dash.scholarships.recommended.slice(0, 2).map((s) => (
            <p key={s._id} className="text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>{s.title} — {s.currency} {s.amount}</p>
          ))}
          <button type="button" className="btn mt-2" style={{ padding: '4px 12px', fontSize: '0.75rem' }} onClick={() => onNavigate?.('scholarships')}>Apply for Scholarship</button>
        </div>
        <div className="card student-block-sub">
          <strong className="text-sm">Saved Jobs</strong>
          {dash.savedJobs.length === 0 && <p className="text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>No jobs saved yet.</p>}
          {dash.savedJobs.slice(0, 2).map((j) => (
            <p key={j._id} className="text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>{j.title} · {j.company}</p>
          ))}
          <button type="button" className="btn mt-2" style={{ padding: '4px 12px', fontSize: '0.75rem' }} onClick={() => onNavigate?.('jobs')}>Apply for Job</button>
        </div>
        <div className="card student-block-sub">
          <strong className="text-sm">Recent Job Updates</strong>
          {(recentJobs === null) && <p className="text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>Loading...</p>}
          {recentJobs && recentJobs.length === 0 && <p className="text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>No jobs posted yet.</p>}
          {(recentJobs || []).map((j) => (
            <p key={j._id} className="text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>{j.title} · {j.company} — posted {new Date(j.createdAt).toLocaleDateString()}</p>
          ))}
          <button type="button" className="btn mt-2" style={{ padding: '4px 12px', fontSize: '0.75rem' }} onClick={() => onNavigate?.('jobs')}>Search Jobs</button>
        </div>
        <div className="card student-block-sub">
          <strong className="text-sm">Application Update</strong>
          {(() => {
            const jobScholarshipUpdates = dash.applicationsOverview.filter((a) => a.type === 'Job' || a.type === 'Scholarship');
            if (jobScholarshipUpdates.length === 0) return <p className="text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>No job or scholarship applications yet.</p>;
            return jobScholarshipUpdates.slice(0, 2).map((a, i) => { const s = overviewStatusDisplay(a); return (
              <p key={i} className="text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>{a.type}: {a.title || '—'} — <Tag status={s.tag} label={s.label} /></p>
            ); });
          })()}
          <button type="button" className="btn mt-2" style={{ padding: '4px 12px', fontSize: '0.75rem' }} onClick={() => onNavigate?.('applications')}>View Applications</button>
        </div>
      </div>

      {/* 12. Calendar/Upcoming Events — a summary; not claimed as more than it is (full tab has real data) */}
      <SectionHeading title="Calendar" />
      <div className="overview-calendar">
        <MiniCalendar />
        <div className="overview-agenda"><span className="eyebrow">YOUR SCHEDULE</span><h3>Make room for what matters</h3><p>Keep classes and deadlines together in your calendar.</p>
          <div className="overview-agenda-counts">{[[FaChalkboardUser, 'Classes', dash.upcomingClasses.length], [FaClipboardList, 'Assignments', dash.pendingAssignments.length], [FaAward, 'Exams', dash.pendingExams.length], [FaWallet, 'Fee deadlines', dash.wallet.pendingFeeCount]].map(([Icon, label, count]) => <div key={label}><Icon aria-hidden="true" /><span>{label}</span><strong>{count}</strong></div>)}</div>
          <button type="button" className="btn btn-primary" onClick={() => onNavigate?.('calendar')}>Open calendar <FaArrowUpRightFromSquare aria-hidden="true" /></button>
        </div>
      </div>

      <div className="student-profile-completion">
        <ProfileCompletion percent={data.profile.percent} checks={data.profile.checks} />
      </div>
      <RecommendedGrid items={data.recommended} />

      {/* Document's own recommended layout: "...Calendar → Recent Activity/Notifications →
          Quick Actions" — so these two go together here, right before Quick Actions at the
          very end, not split apart with Notifications up near Calendar like before. */}

      {/* 11. Recent Activity — full feed. RecentActivity renders its own "Recent Activity"
          heading, so no separate SectionHeading here (that was causing a duplicate title).
          The backend's recentActivity already covers course enrollment, application updates,
          payments, marketplace orders and certificates. "Joined/completed class" and
          "Test/result update" are added here client-side from data this page already has
          access to (attendance + real results), not fabricated. */}
      <SectionHeading title="Recent Activity" />
      <RecentActivity embedded items={[
        ...dash.recentActivity,
        ...attendanceEvents,
        ...resultEvents
      ].sort((a, b) => new Date(b.time) - new Date(a.time))} />

      {/* 13. Notifications/Announcements Preview */}
      <SectionHeading title="Notifications" />
      <div className="card student-block-sub">
        {notifications === null && <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>Loading...</p>}
        {notifications && notifications.length === 0 && <div className="overview-quiet-state"><FaBell aria-hidden="true" /><strong>You are all caught up</strong><p>Your updates and reminders will appear here.</p></div>}
        {(notifications || []).slice(0, 5).map((n) => (
          <div key={n._id} className="flex items-center justify-between" style={{ padding: '4px 0' }}>
            <p className="text-xs" style={{ color: n.read ? 'var(--ink-soft)' : 'var(--ink)', fontWeight: n.read ? 400 : 600 }}>{n.title}</p>
            <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>{new Date(n.createdAt).toLocaleDateString()}</span>
          </div>
        ))}
        <button type="button" className="btn mt-2" style={{ padding: '4px 12px', fontSize: '0.75rem' }} onClick={() => onNavigate?.('notifications')}>{unread !== null ? `View All (${unread} unread)` : 'View All'}</button>
      </div>

      {/* 14. Quick Actions — the exact 9 from the document, shown only when relevant
          (never all 9 at once). Moved to the very end, matching the document's own
          "...Calendar → Recent Activity/Notifications → Quick Actions" layout order.
          QuickActions renders its own "Quick Actions" heading, so no SectionHeading here. */}
      <QuickActions actions={quickActions} onNavigate={onNavigate} />
    </StudentOverviewLayout>
  );
}

// ---------------------------------------------------------------- Teacher

function TeacherWorkspace({ tab, user, onFlash, onChanged, onNavigate }) {
  if (tab === 'profile') return <><ProfilePanel user={user} onFlash={onFlash} onChanged={onChanged} /><RolesPanel onFlash={onFlash} onChanged={onChanged} /><SupportComplaintPanel onFlash={onFlash} /></>;
  if (tab === 'teacherProfile') return <TeacherProfileDetailsPanel onFlash={onFlash} onChanged={onChanged} />;
  if (tab === 'courses') return <TeacherPanel onFlash={onFlash} />;
  if (tab === 'summary') return <TeacherSummary onNavigate={onNavigate} user={user} />;
  if (tab === 'students') return <TeacherStudentsPanel onFlash={onFlash} />;
  if (tab === 'attendance') return <TeacherAttendancePanel onFlash={onFlash} />;
  if (tab === 'myAttendance') return <TeacherSelfAttendancePanel onFlash={onFlash} />;
  if (tab === 'homework') return <TeacherHomeworkPanel onFlash={onFlash} />;
  if (tab === 'results') return <TeacherResultsPanel onFlash={onFlash} />;
  if (tab === 'timetable') return <TimetableView onFlash={onFlash} url="/teachers/me/timetable" />;
  if (tab === 'materialUpload') return <TeacherMaterialUploadPanel onFlash={onFlash} />;
  if (tab === 'liveClasses') return <TeacherLiveClassesPanel onFlash={onFlash} />;
  if (tab === 'studentCommunication') return <TeacherStudentCommunicationPanel onFlash={onFlash} onNavigate={onNavigate} />;
  if (tab === 'examination') return <TeacherExaminationPanel onFlash={onFlash} />;
  if (tab === 'earnings') return <TeacherEarningsPanel onFlash={onFlash} />;
  if (tab === 'performance') return <TeacherPerformancePanel onFlash={onFlash} />;
  if (tab === 'resourceLibrary') return <TeacherResourceLibraryPanel onFlash={onFlash} />;
  if (tab === 'aiAssistant') return <TeacherAiAssistantPanel onFlash={onFlash} />;
  if (tab === 'aiCreative') return <ComingSoon label="AI Creative Teacher" note="Optional AI feature — not built yet, and never forced on you. Skipped for now (paid AI API dependency)." />;
  if (tab === 'advancedControl') return <ComingSoon label="Advanced Class Control" note="Optional voice/gesture/eye-tracking controls — not built yet, and never forced on you. Skipped for now (hardware dependency)." />;
  if (tab === 'engagement') return <TeacherEngagementPanel onFlash={onFlash} />;
  if (tab === 'ptm') return <TeacherPtmPanel onFlash={onFlash} />;
  const labels = {};
  return <ComingSoon label={labels[tab] || tab} />;
}

// Real BYOK AI Teacher Assistant (spec 14.7/15B.5-15B.6) — Notes, Quiz and Lesson Plan
// generation, routed through the teacher's own connected AI provider.
function TeacherAiAssistantPanel({ onFlash }) {
  const [status, setStatus] = useState(null);
  function refresh() { apiRequest('/ai/config').then(setStatus).catch(() => {}); }
  useEffect(refresh, []);

  const textEnabled = status?.text.configured || false;

  return (
    <div>
      <h3 className="font-semibold mb-3">AI Teacher Assistant</h3>
      <AiSettingsPanel onFlash={onFlash} onChanged={refresh} />
      <h4 className="font-semibold mb-2" style={{ fontSize: '0.9rem' }}>Text Tools</h4>
      <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 14, marginBottom: 14 }}>
        <AiFeatureCard feature="teacher_notes" title="AI Notes Generator" description="Give a topic — get clear, structured class notes." placeholder="e.g. Photosynthesis for Grade 8 Biology" aiEnabled={textEnabled} />
        <AiFeatureCard feature="teacher_quiz" title="AI Quiz Generator" description="Give a topic — get 5 multiple-choice questions with answers." placeholder="e.g. Newton's Laws of Motion" aiEnabled={textEnabled} />
        <AiFeatureCard feature="teacher_lesson_plan" title="AI Lesson Plan Builder" description="Give a topic and grade level — get a structured lesson plan." placeholder="e.g. Introduction to Fractions, Grade 4" aiEnabled={textEnabled} />
      </div>
      <SlideDeckGenerator aiEnabled={textEnabled} />

      <h4 className="font-semibold mb-2 mt-6" style={{ fontSize: '0.9rem' }}>AI Creative Teacher</h4>
      <p className="text-xs mb-3" style={{ color: 'var(--ink-soft)' }}>Graphics, 3D models, narration and avatar videos — each connects to a different specialized AI provider above.</p>
      <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 14 }}>
        <ImageGenerator aiEnabled={status?.image.configured} onFlash={onFlash} />
        <ThreeDModelGenerator aiEnabled={status?.threed.configured} onFlash={onFlash} />
        <AnimationGenerator aiEnabled={status?.animation.configured} onFlash={onFlash} />
        <VoiceAndAvatarGenerator aiEnabled={status} onFlash={onFlash} />
      </div>
    </div>
  );
}

// subjects, experienceYears, bio, qualifications were already accepted by PATCH /teachers/me
// and already rendered in the institution's Teacher Management table — but had no form
// anywhere to actually set them, so that table always showed "—" / "0 yrs".
function TeacherProfileDetailsPanel({ onFlash, onChanged }) {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  function load() {
    apiRequest('/teachers/me').then((p) => {
      setForm({
        subjects: (p.subjects || []).join(', '),
        experienceYears: p.experienceYears || 0,
        bio: p.bio || '',
        independent: !!p.independent,
        qualifications: p.qualifications && p.qualifications.length > 0 ? p.qualifications : [{ title: '', institutionName: '', year: '' }]
      });
    }).catch((err) => onFlash(err.message));
  }
  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  function updateQualification(i, patch) {
    setForm((f) => ({ ...f, qualifications: f.qualifications.map((q, idx) => (idx === i ? { ...q, ...patch } : q)) }));
  }
  function addQualification() {
    setForm((f) => ({ ...f, qualifications: [...f.qualifications, { title: '', institutionName: '', year: '' }] }));
  }
  function removeQualification(i) {
    setForm((f) => ({ ...f, qualifications: f.qualifications.filter((_, idx) => idx !== i) }));
  }

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await apiRequest('/teachers/me', {
        method: 'PATCH',
        body: {
          subjects: form.subjects.split(',').map((s) => s.trim()).filter(Boolean),
          experienceYears: Number(form.experienceYears) || 0,
          bio: form.bio,
          independent: form.independent,
          qualifications: form.qualifications.filter((q) => q.title.trim())
        }
      });
      onFlash('Teaching profile updated.', 'success');
      onChanged?.();
      load();
    } catch (err) { onFlash(err.message); } finally { setSaving(false); }
  }

  if (!form) return <p role="status" className="admin-notice">Loading...</p>;

  return (
    <div className="admin-section admin-account-card" style={{ marginTop: 20 }}>
      <div className="admin-section-heading"><div><h2>Teaching Profile</h2><p>Subjects, experience and qualifications shown to institutions considering you as a class teacher.</p></div><FaChalkboardUser aria-hidden="true" /></div>
      <form onSubmit={submit} style={{ display: 'grid', gap: 16 }}>
        <div className="flex flex-wrap" style={{ gap: 14 }}>
          <label className="text-xs" style={{ color: 'var(--ink-soft)', fontWeight: 600, flex: '2 1 260px', minWidth: 0 }}>Subjects (comma separated)
            <input className="form-input" placeholder="e.g. Math, Physics" value={form.subjects} onChange={(e) => setForm({ ...form, subjects: e.target.value })} style={{ marginTop: 6 }} />
          </label>
          <label className="text-xs" style={{ color: 'var(--ink-soft)', fontWeight: 600, flex: '1 1 140px', minWidth: 0 }}>Years of Experience
            <input type="number" min="0" className="form-input" value={form.experienceYears} onChange={(e) => setForm({ ...form, experienceYears: e.target.value })} style={{ marginTop: 6 }} />
          </label>
        </div>
        <label className="text-xs" style={{ display: 'block', color: 'var(--ink-soft)', fontWeight: 600 }}>Bio
          <textarea className="form-input" rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} style={{ marginTop: 6 }} />
        </label>
        <label className="flex items-center text-xs" style={{ color: 'var(--ink-soft)', gap: 8 }}>
          <input type="checkbox" checked={form.independent} onChange={(e) => setForm({ ...form, independent: e.target.checked })} /> I teach independently (without an institution)
        </label>

        <div style={{ paddingTop: 4, borderTop: '1px solid var(--sand-line)' }}>
          <h4 className="font-semibold text-sm" style={{ margin: '16px 0 12px' }}>Qualifications</h4>
          <div style={{ display: 'grid', gap: 10 }}>
            {form.qualifications.map((q, i) => (
              <div key={i} className="flex flex-wrap items-center" style={{ gap: 10, padding: 10, borderRadius: 14, background: 'var(--sand)' }}>
                <input className="form-input" placeholder="Title (e.g. M.Sc Mathematics)" value={q.title} onChange={(e) => updateQualification(i, { title: e.target.value })} style={{ flex: '2 1 200px', minWidth: 0, background: 'var(--paper-raised)' }} />
                <input className="form-input" placeholder="Institution" value={q.institutionName} onChange={(e) => updateQualification(i, { institutionName: e.target.value })} style={{ flex: '2 1 180px', minWidth: 0, background: 'var(--paper-raised)' }} />
                <input className="form-input" type="number" placeholder="Year" value={q.year} onChange={(e) => updateQualification(i, { year: e.target.value })} style={{ flex: '1 1 90px', minWidth: 0, background: 'var(--paper-raised)' }} />
                <button type="button" className="btn" style={{ padding: '6px 12px', fontSize: '0.72rem', flexShrink: 0, background: 'var(--paper-raised)' }} onClick={() => removeQualification(i)}>Remove</button>
              </div>
            ))}
          </div>
          <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.75rem', marginTop: 12 }} onClick={addQualification}>+ Add Qualification</button>
        </div>

        <button type="submit" className="btn btn-primary" style={{ padding: '8px 20px', justifySelf: 'start' }} disabled={saving}>{saving ? 'Saving...' : 'Save Teaching Profile'}</button>
      </form>
    </div>
  );
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

function TeacherEngagementPanel({ onFlash }) {
  const [institution, setInstitution] = useState(null);
  const [section, setSection] = useState('questions');
  const [questions, setQuestions] = useState(null);
  const [polls, setPolls] = useState(null);
  const [pollForm, setPollForm] = useState({ question: '', options: ['', ''] });
  const [submissions, setSubmissions] = useState(null);
  const [answerDrafts, setAnswerDrafts] = useState({});

  useEffect(() => {
    apiRequest('/teachers/me').then((p) => setInstitution(p.institutions?.[0] || null)).catch((err) => onFlash(err.message));
  }, [onFlash]);

  function loadQuestions(instId) {
    apiRequest(`/anonymous-questions/institution?institutionId=${instId}`).then(setQuestions).catch((err) => onFlash(err.message));
  }
  function loadPolls() {
    apiRequest('/polls/mine').then(setPolls).catch((err) => onFlash(err.message));
  }
  function loadSubmissions(instId) {
    apiRequest(`/magazine/institution?institutionId=${instId}`).then(setSubmissions).catch((err) => onFlash(err.message));
  }
  useEffect(() => {
    if (!institution) return;
    if (section === 'questions') loadQuestions(institution._id);
    if (section === 'polls') loadPolls();
    if (section === 'magazine') loadSubmissions(institution._id);
  }, [institution, section]);

  async function submitAnswer(id) {
    const answer = (answerDrafts[id] || '').trim();
    if (!answer) return onFlash('Write an answer first.');
    try {
      await apiRequest(`/anonymous-questions/${id}/answer`, { method: 'PATCH', body: { answer } });
      onFlash('Answer submitted.', 'success');
      setAnswerDrafts((d) => ({ ...d, [id]: '' }));
      loadQuestions(institution._id);
    } catch (err) { onFlash(err.message); }
  }

  function updateOption(i, value) {
    setPollForm((f) => ({ ...f, options: f.options.map((o, idx) => (idx === i ? value : o)) }));
  }
  async function createPoll(e) {
    e.preventDefault();
    const options = pollForm.options.map((o) => o.trim()).filter(Boolean);
    if (options.length < 2) return onFlash('Add at least 2 options.');
    try {
      await apiRequest('/polls', { method: 'POST', body: { institution: institution._id, question: pollForm.question, options } });
      onFlash('Poll created.', 'success');
      setPollForm({ question: '', options: ['', ''] });
      loadPolls();
    } catch (err) { onFlash(err.message); }
  }
  async function closePoll(id) {
    try {
      await apiRequest(`/polls/${id}/close`, { method: 'PATCH' });
      onFlash('Poll closed.', 'success');
      loadPolls();
    } catch (err) { onFlash(err.message); }
  }
  async function reviewSubmission(id, status) {
    try {
      await apiRequest(`/magazine/${id}/review`, { method: 'PATCH', body: { status } });
      onFlash(`Submission ${status}.`, 'success');
      loadSubmissions(institution._id);
    } catch (err) { onFlash(err.message); }
  }

  if (!institution) return <p className="admin-notice">You're not linked to an institution yet.</p>;

  return (
    <div>
      <h3 className="font-semibold mb-2">Class Engagement</h3>
      <div className="flex gap-2 mb-4 flex-wrap">
        <button type="button" className={`btn ${section === 'questions' ? 'btn-primary' : ''}`} onClick={() => setSection('questions')}>Anonymous Questions</button>
        <button type="button" className={`btn ${section === 'polls' ? 'btn-primary' : ''}`} onClick={() => setSection('polls')}>Quick Polls</button>
        <button type="button" className={`btn ${section === 'magazine' ? 'btn-primary' : ''}`} onClick={() => setSection('magazine')}>Magazine Submissions</button>
      </div>

      {section === 'questions' && (
        <div className="space-y-3">
          {questions === null && <p className="admin-notice">Loading...</p>}
          {questions?.length === 0 && <p className="admin-notice">No questions yet.</p>}
          {(questions || []).map((q) => (
            <div key={q._id} className="border border-[var(--sand-line)] rounded-xl p-3">
              <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>{q.subject || 'General'} · {new Date(q.createdAt).toLocaleDateString()}</p>
              <p className="font-medium" style={{ margin: '4px 0' }}>{q.question}</p>
              {q.status === 'answered' ? (
                <p className="text-sm" style={{ color: 'var(--forest)' }}>Your answer: {q.answer}</p>
              ) : (
                <div className="flex gap-2 mt-2">
                  <input className="form-input" placeholder="Write an answer..." value={answerDrafts[q._id] || ''} onChange={(e) => setAnswerDrafts((d) => ({ ...d, [q._id]: e.target.value }))} />
                  <button className="btn btn-primary" style={{ flexShrink: 0 }} onClick={() => submitAnswer(q._id)}>Answer</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {section === 'polls' && (
        <div>
          <form onSubmit={createPoll} className="space-y-2 max-w-md mb-6 border border-[var(--sand-line)] rounded-xl p-3">
            <input className="form-input" placeholder="Poll question" value={pollForm.question} onChange={(e) => setPollForm({ ...pollForm, question: e.target.value })} required />
            {pollForm.options.map((o, i) => (
              <input key={i} className="form-input" placeholder={`Option ${i + 1}`} value={o} onChange={(e) => updateOption(i, e.target.value)} />
            ))}
            <div className="flex gap-2">
              <button type="button" className="btn" style={{ fontSize: '0.75rem' }} onClick={() => setPollForm((f) => ({ ...f, options: [...f.options, ''] }))}>+ Add option</button>
              <button type="submit" className="btn btn-primary">Create Poll</button>
            </div>
          </form>
          <Table
            loading={polls === null}
            headers={['Question', 'Votes', 'Status', 'Action']}
            rows={(polls || []).map((p) => [
              p.question, p.options.map((o) => `${o.text}: ${o.votes}`).join(' · '), <Tag status={p.status === 'closed' ? 'rejected' : 'approved'} label={p.status} />,
              p.status === 'open' ? <button className="btn" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => closePoll(p._id)}>Close</button> : '—'
            ])}
            empty="You haven't created any polls yet."
          />
        </div>
      )}

      {section === 'magazine' && (
        <Table
          loading={submissions === null}
          headers={['Student', 'Title', 'Type', 'Status', 'Action']}
          rows={(submissions || []).map((s) => [
            s.student?.fullName || '—', s.title, s.type, <Tag status={s.status === 'published' ? 'approved' : s.status === 'rejected' ? 'rejected' : s.status === 'selected' ? 'approved' : 'pending'} label={s.status} />,
            s.status === 'submitted' ? (
              <div className="flex gap-1">
                <button className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => reviewSubmission(s._id, 'selected')}>Select</button>
                <button className="btn" style={{ padding: '4px 10px', fontSize: '0.75rem', background: 'var(--sand-line)' }} onClick={() => reviewSubmission(s._id, 'rejected')}>Reject</button>
              </div>
            ) : '—'
          ])}
          empty="No submissions yet."
        />
      )}
    </div>
  );
}

function TeacherExaminationPanel({ onFlash }) {
  const { courses, courseId, setCourseId } = useTeacherCourses(onFlash);
  const [exams, setExams] = useState([]);
  const [form, setForm] = useState({ title: '', type: 'quiz', scheduledDate: '', venue: '', instructions: '', questions: [] });
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
      await apiRequest(`/courses/${courseId}/exams`, { method: 'POST', body: { ...form, scheduledDate: form.scheduledDate || null } });
      onFlash('Exam created (unpublished).', 'success');
      setForm({ title: '', type: 'quiz', scheduledDate: '', venue: '', instructions: '', questions: [] });
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
          <h3 className="font-semibold" style={{ marginBottom: 14 }}>Create an Exam</h3>
          <form onSubmit={createExam} className="card" style={{ padding: 20, marginBottom: 28, display: 'grid', gap: 16 }}>
            <div className="flex flex-wrap" style={{ gap: 14 }}>
              <input className="form-input" placeholder="Exam title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required style={{ flex: '2 1 220px', minWidth: 0 }} />
              <select className="form-select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} style={{ flex: '1 1 140px', minWidth: 0, textTransform: 'capitalize' }}>
                {['quiz', 'midterm', 'final', 'test'].map((t) => <option key={t} value={t} style={{ textTransform: 'capitalize' }}>{t}</option>)}
              </select>
              <label className="text-xs" style={{ color: 'var(--ink-soft)', fontWeight: 600, flex: '1 1 220px', minWidth: 0 }}>Scheduled date/time
                <input type="datetime-local" className="form-input" value={form.scheduledDate} onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })} style={{ marginTop: 6 }} />
              </label>
            </div>
            <div className="flex flex-wrap" style={{ gap: 14 }}>
              <input className="form-input" placeholder="Venue (room number or online link)" style={{ flex: '1 1 220px', minWidth: 0 }} value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} />
              <input className="form-input" placeholder="Preparation instructions" style={{ flex: '1 1 220px', minWidth: 0 }} value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} />
            </div>

            {form.questions.length > 0 && (
              <div style={{ display: 'grid', gap: 10, paddingTop: 4, borderTop: '1px solid var(--sand-line)' }}>
                {form.questions.map((q, i) => (
                  <div key={i} style={{ padding: 14, borderRadius: 14, background: 'var(--sand)' }}>
                    <div className="flex items-start" style={{ gap: 10 }}>
                      <input className="form-input" placeholder={`Question ${i + 1} (${q.type})`} value={q.text} onChange={(e) => updateQuestion(i, { text: e.target.value })} required style={{ flex: '1 1 auto', minWidth: 0, background: 'var(--paper-raised)' }} />
                      <input className="form-input" type="number" placeholder="Marks" value={q.marks} onChange={(e) => updateQuestion(i, { marks: Number(e.target.value) })} style={{ width: 90, flexShrink: 0, background: 'var(--paper-raised)' }} />
                      <button type="button" className="btn" style={{ padding: '6px 12px', fontSize: '0.75rem', flexShrink: 0, background: 'var(--paper-raised)' }} onClick={() => removeQuestion(i)}>Remove</button>
                    </div>
                    {q.type === 'mcq' && (
                      <div style={{ display: 'grid', gap: 8, marginTop: 10 }}>
                        {q.options.map((opt, oi) => (
                          <div key={oi} className="flex items-center" style={{ gap: 10 }}>
                            <input type="radio" name={`correct-${i}`} checked={q.correctOption === oi} onChange={() => updateQuestion(i, { correctOption: oi })} />
                            <input className="form-input" placeholder={`Option ${oi + 1}`} value={opt} onChange={(e) => updateQuestion(i, { options: q.options.map((o, x) => (x === oi ? e.target.value : o)) })} style={{ background: 'var(--paper-raised)' }} />
                          </div>
                        ))}
                        <button type="button" className="btn" style={{ padding: '5px 12px', fontSize: '0.72rem', justifySelf: 'start', background: 'var(--paper-raised)' }} onClick={() => updateQuestion(i, { options: [...q.options, ''] })}>+ Option</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-center" style={{ gap: 10 }}>
              <button type="button" className="btn" onClick={() => addQuestion('mcq')}>+ MCQ Question</button>
              <button type="button" className="btn" onClick={() => addQuestion('short')}>+ Short Answer Question</button>
              <button type="submit" className="btn btn-primary" style={{ marginLeft: 'auto' }}>Create Exam</button>
            </div>
          </form>

          <h3 className="font-semibold" style={{ marginBottom: 14 }}>My Exams</h3>
          <Table
            headers={['Title', 'Type', 'Scheduled', 'Venue', 'Questions', 'Status', 'Action']}
            rows={exams.map((ex) => [
              ex.title, ex.type, ex.scheduledDate ? new Date(ex.scheduledDate).toLocaleString() : '—', ex.venue || '—', ex.questions.length, ex.published ? <Tag status="approved" /> : <Tag status="pending" />,
              <div className="flex" style={{ gap: 8 }}>
                {!ex.published && <button className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.78rem' }} onClick={() => publish(ex._id)}>Publish</button>}
                <button className="btn" style={{ padding: '6px 14px', fontSize: '0.78rem' }} onClick={() => openSubmissions(ex._id)}>Submissions</button>
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
    <div style={{ marginTop: 32 }}>
      <h3 className="font-semibold" style={{ marginBottom: 14 }}>Submissions{exam ? ` — ${exam.title}` : ''}</h3>
      {submissions.length === 0 && (
        <div className="student-empty-state" style={{ border: '1px solid var(--sand-line)', borderRadius: 18 }}>
          <FaFileLines aria-hidden="true" />
          <p>No submissions yet</p>
        </div>
      )}
      {submissions.map((s) => {
        const shortAnswers = s.answers.filter((a) => exam?.questions?.[a.questionIndex]?.type === 'short');
        return (
          <div key={s._id} className="card" style={{ padding: 18, marginBottom: 14 }}>
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

// A styled dropdown (button + floating listbox) so the open list follows the app's own
// colors — a native <select>'s popup is OS-rendered and can't be restyled with CSS.
function CustomSelect({ value, onChange, options, ariaLabel, minWidth = 260 }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onDoc(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    function onKey(e) { if (e.key === 'Escape') setOpen(false); }
    document.addEventListener('click', onDoc);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('click', onDoc); document.removeEventListener('keydown', onKey); };
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} style={{ position: 'relative', minWidth }}>
      <button
        type="button" className="form-select" aria-label={ariaLabel} aria-haspopup="listbox" aria-expanded={open}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', cursor: 'pointer', gap: 10 }}
        onClick={() => setOpen((o) => !o)}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selected ? selected.label : 'Select…'}</span>
        <FaChevronDown size={12} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s ease', flexShrink: 0, color: 'var(--ink-soft)' }} aria-hidden="true" />
      </button>
      {open && (
        <div role="listbox" style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 30, background: 'var(--paper-raised)', border: '1px solid var(--sand-line)', borderRadius: 14, boxShadow: 'var(--shadow-md)', overflow: 'hidden', maxHeight: 260, overflowY: 'auto', padding: 6 }}>
          {options.map((o) => (
            <div
              key={o.value} role="option" aria-selected={o.value === value} aria-disabled={o.disabled || undefined}
              onClick={() => { if (o.disabled) return; onChange(o.value); setOpen(false); }}
              className={o.disabled ? '' : 'dropdown-option'}
              style={{
                padding: '10px 12px', fontSize: 14, borderRadius: 10,
                cursor: o.disabled ? 'not-allowed' : 'pointer',
                background: o.value === value ? 'var(--sand)' : 'transparent',
                color: o.disabled ? 'var(--ink-soft)' : 'var(--ink)',
                fontWeight: o.value === value ? 600 : 400,
                opacity: o.disabled ? 0.6 : 1
              }}
            >
              {o.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CourseSelect({ courses, value, onChange }) {
  if (courses.length === 0) {
    return (
      <div className="student-empty-state" style={{ border: '1px solid var(--sand-line)', borderRadius: 18, minHeight: 160 }}>
        <FaBookOpen aria-hidden="true" />
        <p>Create a course first</p>
        <span>Go to My Courses — students, attendance, homework and results are all recorded against a course.</span>
      </div>
    );
  }
  return (
    <label style={{ display: 'inline-block', marginBottom: 18 }}>
      <span className="text-xs" style={{ display: 'block', color: 'var(--ink-soft)', fontWeight: 600, marginBottom: 6 }}>Course</span>
      <CustomSelect value={value} onChange={onChange} ariaLabel="Select course" options={courses.map((c) => ({ value: c._id, label: c.title }))} />
    </label>
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

// Real self-check-in (spec 9.9/15D.9) — one per calendar day, "late" computed against this
// teacher's own first scheduled class today. Not biometric/GPS (no device access from a web
// app) — an honest, DB-backed timestamp instead.
function TeacherSelfAttendancePanel({ onFlash }) {
  const [history, setHistory] = useState(null);
  const [checkingIn, setCheckingIn] = useState(false);

  function load() {
    apiRequest('/teachers/me/self-attendance').then(setHistory).catch((err) => onFlash(err.message));
  }
  useEffect(load, []);

  const todayKey = new Date().toISOString().slice(0, 10);
  const checkedInToday = (history || []).some((h) => new Date(h.date).toISOString().slice(0, 10) === todayKey);

  async function checkIn() {
    setCheckingIn(true);
    try {
      const record = await apiRequest('/teachers/me/self-attendance/check-in', { method: 'POST' });
      onFlash(record.status === 'late' ? 'Checked in — marked late.' : 'Checked in.', record.status === 'late' ? 'error' : 'success');
      load();
    } catch (err) { onFlash(err.message); } finally { setCheckingIn(false); }
  }

  if (history === null) return <p role="status" className="admin-notice">Loading...</p>;

  return (
    <div>
      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        {checkedInToday ? (
          <p className="text-sm" style={{ color: 'var(--emerald)' }}>✓ You've checked in today.</p>
        ) : (
          <button type="button" className="btn btn-primary" onClick={checkIn} disabled={checkingIn}>
            {checkingIn ? 'Checking in...' : 'Check In for Today'}
          </button>
        )}
      </div>
      <h3 className="font-semibold" style={{ marginBottom: 14 }}>My Attendance History</h3>
      <Table
        headers={['Date', 'Checked In At', 'Status']}
        rows={history.map((h) => [
          new Date(h.date).toLocaleDateString(),
          new Date(h.checkInAt).toLocaleTimeString(),
          <Tag status={h.status === 'present' ? 'approved' : 'pending'} label={h.status === 'present' ? 'Present' : 'Late'} />
        ])}
        empty="No check-ins yet."
      />
    </div>
  );
}

// Real camera-based QR attendance (spec 15B.9/9.9) — scans a student's existing Digital Student
// ID QR code (student.controller.js's idCardCode) and marks them present via a real backend call.
function TeacherQrAttendancePanel({ courseId, date, onFlash }) {
  const [scans, setScans] = useState([]);
  const [busy, setBusy] = useState(false);

  async function onScan(text) {
    if (busy) return;
    const match = text.match(/verify-student-id\/([a-f0-9]+)/i);
    const code = match ? match[1] : text.trim();
    setBusy(true);
    try {
      const result = await apiRequest('/teachers/me/attendance/qr-scan', { method: 'POST', body: { code, course: courseId, date } });
      setScans((prev) => [{ ...result, at: new Date() }, ...prev]);
      onFlash(result.alreadyMarked ? `${result.studentName} was already marked.` : `${result.studentName} marked present.`, result.alreadyMarked ? undefined : 'success');
    } catch (err) { onFlash(err.message); } finally { setBusy(false); }
  }

  return (
    <div className="card" style={{ padding: 20, marginBottom: 28 }}>
      <QrScanner onScan={onScan} />
      <h4 className="font-semibold mt-4 mb-2" style={{ fontSize: '0.85rem' }}>Scanned this session</h4>
      {scans.length === 0 ? (
        <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>No students scanned yet.</p>
      ) : (
        <ul className="text-sm space-y-1">
          {scans.map((s, i) => (
            <li key={i}>{s.alreadyMarked ? '↺' : '✓'} {s.studentName} — {s.at.toLocaleTimeString()}{s.alreadyMarked ? ' (already marked)' : ''}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Real client-side face-recognition attendance (spec 15B.9/9.9) — matches live camera frames
// against descriptors students enrolled themselves (StudentDigitalIdPanel). All matching runs in
// this browser tab; the server only ever receives the final "this studentId matched" result.
function TeacherFaceAttendancePanel({ courseId, date, onFlash }) {
  const videoRef = useRef(null);
  const [enrolled, setEnrolled] = useState(null);
  const [ready, setReady] = useState(false);
  const [scans, setScans] = useState([]);
  const cancelledRef = useRef(false);
  const rafRef = useRef(null);
  const lastMatchRef = useRef({});

  useEffect(() => {
    apiRequest(`/courses/${courseId}/face-descriptors`).then(setEnrolled).catch((err) => onFlash(err.message));
  }, [courseId, onFlash]);

  async function markPresent(studentId, fullName) {
    try {
      const result = await apiRequest('/teachers/me/attendance/face-scan', { method: 'POST', body: { studentId, course: courseId, date } });
      setScans((prev) => [{ ...result, at: new Date() }, ...prev]);
    } catch (err) { onFlash(err.message || `Could not mark ${fullName}.`); }
  }

  useEffect(() => {
    if (!enrolled || enrolled.length === 0) return;
    cancelledRef.current = false;
    let stream = null;

    async function start() {
      const { loadFaceModels, faceapi } = await import('../utils/faceApi');
      await loadFaceModels();
      if (cancelledRef.current) return;

      stream = await navigator.mediaDevices.getUserMedia({ video: {} });
      if (cancelledRef.current) { stream.getTracks().forEach((t) => t.stop()); return; }
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setReady(true);

      const byId = Object.fromEntries(enrolled.map((e) => [e.studentId, e.fullName]));
      const labeled = enrolled.map((e) => new faceapi.LabeledFaceDescriptors(e.studentId, [new Float32Array(e.descriptor)]));
      const matcher = new faceapi.FaceMatcher(labeled, 0.55);

      async function loop() {
        if (cancelledRef.current) return;
        try {
          const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors();
          detections.forEach((d) => {
            const match = matcher.findBestMatch(d.descriptor);
            if (match.label !== 'unknown') {
              const now = Date.now();
              if (now - (lastMatchRef.current[match.label] || 0) > 4000) {
                lastMatchRef.current[match.label] = now;
                markPresent(match.label, byId[match.label]);
              }
            }
          });
        } catch { /* transient detection hiccup — just try again next frame */ }
        if (!cancelledRef.current) rafRef.current = requestAnimationFrame(loop);
      }
      loop();
    }

    start().catch((err) => onFlash(err.message));
    return () => {
      cancelledRef.current = true;
      cancelAnimationFrame(rafRef.current);
      stream?.getTracks().forEach((t) => t.stop());
      setReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enrolled]);

  if (enrolled === null) return <p role="status" className="admin-notice">Loading...</p>;
  if (enrolled.length === 0) {
    return <p className="admin-notice">No students in this course have enrolled their face yet — they can do this from their Digital Student ID page.</p>;
  }

  return (
    <div className="card" style={{ padding: 20, marginBottom: 28 }}>
      <div style={{ position: 'relative', maxWidth: 420 }}>
        <video ref={videoRef} playsInline muted style={{ width: '100%', borderRadius: 14, background: '#000' }} />
        {!ready && <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 6 }}>Loading face models and starting camera...</p>}
      </div>
      <p className="text-xs" style={{ color: 'var(--ink-soft)', margin: '8px 0' }}>{enrolled.length} student{enrolled.length > 1 ? 's' : ''} enrolled for face attendance in this course.</p>
      <h4 className="font-semibold mt-2 mb-2" style={{ fontSize: '0.85rem' }}>Scanned this session</h4>
      {scans.length === 0 ? (
        <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>No students matched yet.</p>
      ) : (
        <ul className="text-sm space-y-1">
          {scans.map((s, i) => (
            <li key={i}>{s.alreadyMarked ? '↺' : '✓'} {s.studentName} — {s.at.toLocaleTimeString()}{s.alreadyMarked ? ' (already marked)' : ''}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function TeacherAttendancePanel({ onFlash }) {
  const { courses, courseId, setCourseId } = useTeacherCourses(onFlash);
  const [enrollments, setEnrollments] = useState([]);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [statuses, setStatuses] = useState({});
  const [reasons, setReasons] = useState({});
  const [history, setHistory] = useState([]);
  const [mode, setMode] = useState('manual');

  useEffect(() => {
    if (!courseId) return;
    apiRequest(`/courses/${courseId}/students`).then((list) => {
      setEnrollments(list);
      setStatuses(Object.fromEntries(list.map((e) => [e.student._id, 'present'])));
      setReasons({});
    }).catch((err) => onFlash(err.message));
  }, [courseId, onFlash]);

  function loadHistory() {
    apiRequest('/teachers/me/attendance').then(setHistory).catch((err) => onFlash(err.message));
  }
  useEffect(loadHistory, []);

  async function submit(e) {
    e.preventDefault();
    const records = enrollments.map((en) => ({
      student: en.student._id,
      status: statuses[en.student._id] || 'present',
      reason: reasons[en.student._id] || ''
    }));
    try {
      await apiRequest('/teachers/me/attendance', { method: 'POST', body: { course: courseId, date, records } });
      onFlash('Attendance recorded.', 'success');
      loadHistory();
    } catch (err) { onFlash(err.message); }
  }

  return (
    <div>
      <CourseSelect courses={courses} value={courseId} onChange={setCourseId} />
      {courseId && (
        <div className="flex gap-2 mb-4">
          <button type="button" className={mode === 'manual' ? 'btn btn-primary' : 'btn'} style={{ padding: '6px 16px', fontSize: '0.8rem' }} onClick={() => setMode('manual')}>Manual</button>
          <button type="button" className={mode === 'qr' ? 'btn btn-primary' : 'btn'} style={{ padding: '6px 16px', fontSize: '0.8rem' }} onClick={() => setMode('qr')}>📷 QR Scan</button>
          <button type="button" className={mode === 'face' ? 'btn btn-primary' : 'btn'} style={{ padding: '6px 16px', fontSize: '0.8rem' }} onClick={() => setMode('face')}>🙂 Face Scan</button>
        </div>
      )}
      {courseId && (mode === 'qr' || mode === 'face') && (
        <label className="text-xs" style={{ color: 'var(--ink-soft)', fontWeight: 600, display: 'block', marginBottom: 10 }}>Date
          <input type="date" className="form-input" value={date} onChange={(e) => setDate(e.target.value)} style={{ marginTop: 6, maxWidth: 200 }} />
        </label>
      )}
      {courseId && mode === 'qr' && <TeacherQrAttendancePanel courseId={courseId} date={date} onFlash={onFlash} />}
      {courseId && mode === 'face' && <TeacherFaceAttendancePanel courseId={courseId} date={date} onFlash={onFlash} />}
      {courseId && mode === 'manual' && enrollments.length > 0 && (
        <form onSubmit={submit} className="card" style={{ padding: 20, marginBottom: 28 }}>
          <div className="flex items-end flex-wrap" style={{ gap: 14, marginBottom: 18 }}>
            <label className="text-xs" style={{ color: 'var(--ink-soft)', fontWeight: 600 }}>Date
              <input type="date" className="form-input" value={date} onChange={(e) => setDate(e.target.value)} style={{ marginTop: 6 }} />
            </label>
            <button type="submit" className="btn btn-primary" style={{ padding: '11px 20px', height: 46 }}>Save Attendance</button>
          </div>
          <div className="account-table-wrap overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left border-b border-[var(--sand-line)]"><th className="py-2 pr-4">Student</th><th className="py-2 pr-4">Status</th><th className="py-2 pr-4">Reason (if absent/late)</th></tr></thead>
              <tbody>
                {enrollments.map((en) => {
                  const status = statuses[en.student._id] || 'present';
                  return (
                    <tr key={en.student._id} className="border-b border-[var(--sand-line)] last:border-0">
                      <td className="py-2 pr-4">{en.student.fullName}</td>
                      <td className="py-2 pr-4">
                        <select className="form-select" value={status} onChange={(e) => setStatuses({ ...statuses, [en.student._id]: e.target.value })}>
                          {['present', 'absent', 'late', 'excused'].map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="py-2 pr-4">
                        {status !== 'present' && (
                          <input className="form-input" placeholder="Reason (optional)" value={reasons[en.student._id] || ''} onChange={(e) => setReasons({ ...reasons, [en.student._id]: e.target.value })} />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </form>
      )}
      <h3 className="font-semibold" style={{ marginBottom: 14 }}>Attendance History</h3>
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
        <form onSubmit={submit} className="card" style={{ padding: 20, display: 'grid', gap: 16, maxWidth: 560 }}>
          <label className="text-xs" style={{ color: 'var(--ink-soft)', fontWeight: 600 }}>Student
            <div style={{ marginTop: 6 }}>
              <CustomSelect
                value={form.student} onChange={(v) => setForm({ ...form, student: v })} ariaLabel="Select student"
                options={enrollments.map((en) => ({ value: en.student._id, label: en.student.fullName }))}
                minWidth="100%"
              />
            </div>
          </label>
          <div className="flex flex-wrap" style={{ gap: 14 }}>
            <input className="form-input" placeholder="Term (e.g. Mid Term)" value={form.term} onChange={(e) => setForm({ ...form, term: e.target.value })} style={{ flex: '1 1 200px', minWidth: 0 }} />
            <input className="form-input" placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} style={{ flex: '1 1 200px', minWidth: 0 }} />
          </div>
          <div className="flex flex-wrap" style={{ gap: 14 }}>
            <input className="form-input" type="number" placeholder="Marks obtained" value={form.marksObtained} onChange={(e) => setForm({ ...form, marksObtained: e.target.value })} required style={{ flex: '1 1 140px', minWidth: 0 }} />
            <input className="form-input" type="number" placeholder="Total marks" value={form.totalMarks} onChange={(e) => setForm({ ...form, totalMarks: e.target.value })} style={{ flex: '1 1 140px', minWidth: 0 }} />
            <input className="form-input" placeholder="Grade (e.g. A)" value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} style={{ flex: '1 1 140px', minWidth: 0 }} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ justifySelf: 'start', padding: '8px 20px' }}>Record Result</button>
        </form>
      )}
    </div>
  );
}

// Teacher Dashboard Home — Welcome → Today's Classes → Today's Attendance → Pending
// Assignments → Upcoming Exams → Salary Summary (self only) → Notifications. Every number
// here comes from /teachers/me/dashboard, itself built entirely from data teachers/institutions
// enter through real forms (timetable, attendance, assignments, exams, payslips) — nothing seeded.
function TeacherSummary({ onNavigate, user }) {
  const [dash, setDash] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest('/teachers/me/dashboard').then(setDash).catch((err) => setError(err.message));
  }, []);

  if (error) return <div role="alert" className="admin-notice error">{error}</div>;
  if (!dash) return <p role="status" className="admin-notice">Loading your dashboard...</p>;

  return (
    <>
      {/* Welcome / Profile Overview */}
      <div className="flex items-center" style={{ gap: 14, marginTop: -12, marginBottom: 24 }}>
        {user?.profilePhoto
          ? <img src={user.profilePhoto} alt="" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
          : <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--gold)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, flexShrink: 0 }}>{(user?.fullName || '?')[0]}</div>}
        <strong className="text-sm">{user?.fullName}</strong>
      </div>

      {/* 1. Today's Classes */}
      <div className="dash-section-title"><h2>Today's Classes</h2></div>
      <div className="hover-card card" style={{ padding: 16, cursor: 'pointer' }} onClick={() => onNavigate?.('timetable')}>
        <Table
          headers={['Time', 'Subject', 'Class/Section']}
          rows={dash.todayClasses.map((c) => [`${c.startTime}–${c.endTime}`, c.subject, c.classSection || '—'])}
          empty="No classes scheduled for you today."
        />
      </div>

      {/* 2. Today's Student Attendance */}
      <div className="dash-section-title" style={{ marginTop: 28 }}><h2>Today's Student Attendance</h2></div>
      <div className="grid grid-cols-3" style={{ gap: 14, cursor: 'pointer' }} onClick={() => onNavigate?.('attendance')}>
        <SummaryCard title="Total Marked" count={dash.todayAttendance.total} />
        <SummaryCard title="Present" count={dash.todayAttendance.present} />
        <SummaryCard title="Absent" count={dash.todayAttendance.absent} />
      </div>

      {/* 3. Pending Assignments */}
      <div className="dash-section-title" style={{ marginTop: 28 }}><h2>Assignments</h2></div>
      <div className="grid grid-cols-2" style={{ gap: 14, cursor: 'pointer' }} onClick={() => onNavigate?.('homework')}>
        <SummaryCard title="Submissions Received" count={dash.assignmentsOverview.submitted} />
        <SummaryCard title="Still Pending" count={dash.assignmentsOverview.pending} />
      </div>

      {/* 4. Upcoming Exams — split into the document's exact 3 categories (quizzes / tests /
          major examinations), not one mixed table. "Major examinations" = midterm + final. */}
      <div className="dash-section-title" style={{ marginTop: 28 }}><h2>Upcoming Exams</h2></div>
      {(() => {
        const quizzes = dash.upcomingExams.filter((e) => e.type === 'quiz');
        const tests = dash.upcomingExams.filter((e) => e.type === 'test');
        const majors = dash.upcomingExams.filter((e) => e.type === 'midterm' || e.type === 'final');
        const rowsFor = (list) => list.map((e) => [e.title, e.courseTitle, e.scheduledDate ? new Date(e.scheduledDate).toLocaleString() : '—']);
        const groups = [
          { label: 'Upcoming Quizzes', icon: FaClipboardList, color: 'var(--gold)', list: quizzes, empty: 'No upcoming quizzes.' },
          { label: 'Tests', icon: FaFileLines, color: 'var(--emerald)', list: tests, empty: 'No upcoming tests.' },
          { label: 'Major Examinations', icon: FaAward, color: 'var(--rose)', list: majors, empty: 'No upcoming midterms or finals.' }
        ];
        return (
          <div style={{ display: 'grid', gap: 14 }}>
            {groups.map((g) => (
              <div key={g.label} className="card" style={{ padding: 18 }}>
                <div className="flex items-center" style={{ gap: 12, marginBottom: 14 }}>
                  <span style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--sand)', color: g.color, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    <g.icon aria-hidden="true" size={15} />
                  </span>
                  <strong className="text-sm">{g.label}</strong>
                  <span className="text-xs" style={{ color: 'var(--ink-soft)', marginLeft: 'auto' }}>{g.list.length} scheduled</span>
                </div>
                <Table headers={['Title', 'Course', 'Scheduled']} rows={rowsFor(g.list)} empty={g.empty} />
              </div>
            ))}
            <button type="button" className="btn" style={{ padding: '7px 18px', fontSize: '0.78rem', justifySelf: 'start' }} onClick={() => onNavigate?.('examination')}>View Examinations</button>
          </div>
        );
      })()}

      {/* 5. Salary Summary — self only */}
      <div className="dash-section-title" style={{ marginTop: 28 }}><h2>Salary Summary</h2></div>
      <div className="hover-card card" style={{ padding: 20, cursor: 'pointer' }} onClick={() => onNavigate?.('earnings')}>
        <div className="grid grid-cols-3" style={{ gap: 14 }}>
          <div>
            <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>This month</p>
            <strong style={{ fontSize: 22, fontFamily: 'Fraunces, serif', display: 'block', marginTop: 4 }}>{dash.salary.currency} {dash.salary.monthly}</strong>
          </div>
          <div>
            <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>Received</p>
            <strong style={{ fontSize: 22, fontFamily: 'Fraunces, serif', display: 'block', marginTop: 4, color: 'var(--emerald)' }}>{dash.salary.currency} {dash.salary.received}</strong>
          </div>
          <div>
            <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>Pending</p>
            <strong style={{ fontSize: 22, fontFamily: 'Fraunces, serif', display: 'block', marginTop: 4, color: dash.salary.pending > 0 ? 'var(--gold)' : undefined }}>{dash.salary.currency} {dash.salary.pending}</strong>
          </div>
        </div>
      </div>

      {/* 6. Notifications */}
      <div className="dash-section-title" style={{ marginTop: 28 }}><h2>Notifications</h2></div>
      {dash.notifications.length === 0 ? (
        <div className="student-empty-state" style={{ border: '1px solid var(--sand-line)', borderRadius: 18 }}>
          <FaBell aria-hidden="true" />
          <p>No notifications yet</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="dash-list" style={{ gap: 0 }}>
            {dash.notifications.map((n, idx) => (
              <div key={n._id} className={`dash-list-item${!n.read ? ' unread' : ''}`} style={{ borderBottom: idx < dash.notifications.length - 1 ? '1px solid var(--sand-line)' : 'none' }}>
                <span className="dash-list-icon c-gold" aria-hidden><FaBell size={14} /></span>
                <div className="dash-list-body"><div className="title" style={{ fontWeight: n.read ? 400 : 600 }}>{n.title}</div></div>
                <span className="dash-list-time">{new Date(n.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
          <div style={{ padding: 12 }}>
            <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.75rem' }} onClick={() => onNavigate?.('notifications')}>View All</button>
          </div>
        </div>
      )}
    </>
  );
}

function TeacherLiveClassesPanel({ onFlash }) {
  const [entries, setEntries] = useState(null);
  useEffect(() => { apiRequest('/teachers/me/timetable').then(setEntries).catch((err) => onFlash(err.message)); }, [onFlash]);

  function join(entry) {
    if (entry.meetingLink) window.open(entry.meetingLink, '_blank', 'noopener,noreferrer');
    else onFlash("No meeting link set for this class yet — your institution adds one from Classes → Timetable.", 'error');
  }

  if (entries === null) return <p role="status" className="admin-notice">Loading...</p>;
  const withLink = entries.filter((e) => e.meetingLink);

  return (
    <div>
      <h3 className="font-semibold mb-2">Live Classes</h3>
      <p className="text-xs mb-3" style={{ color: 'var(--ink-soft)' }}>Classes your institution has set an online meeting link for. CareerZ doesn't host video itself — Start Class opens whatever link was configured (Zoom/Meet/Teams).</p>
      <Table
        headers={['Day', 'Time', 'Subject', 'Class', 'Status', 'Action']}
        rows={withLink.map((e) => {
          const status = classStatusNow(e);
          return [
            DOW_LABEL[e.dayOfWeek], `${e.startTime}–${e.endTime}`, e.subject, e.classSection?.name || '—',
            status === 'live' ? <span style={{ color: 'var(--rose)', fontWeight: 700 }}>🔴 Live</span> : status,
            <button type="button" className={status === 'live' ? 'btn btn-primary' : 'btn'} style={{ padding: '4px 12px', fontSize: '0.75rem' }} onClick={() => join(e)}>Start Class</button>
          ];
        })}
        empty="No classes have an online meeting link set yet."
      />
    </div>
  );
}

function TeacherPerformancePanel({ onFlash }) {
  const [rows, setRows] = useState(null);

  useEffect(() => {
    apiRequest('/courses/mine/list').then(async (list) => {
      const withStats = await Promise.all(list.map(async (c) => {
        try {
          const enrollments = await apiRequest(`/courses/${c._id}/students`);
          const avg = enrollments.length > 0 ? Math.round(enrollments.reduce((s, e) => s + e.progressPercent, 0) / enrollments.length) : 0;
          const completed = enrollments.filter((e) => e.status === 'completed').length;
          return { id: c._id, title: c.title, students: enrollments.length, avgProgress: avg, completed };
        } catch { return { id: c._id, title: c.title, students: 0, avgProgress: 0, completed: 0 }; }
      }));
      setRows(withStats);
    }).catch((err) => onFlash(err.message));
  }, [onFlash]);

  if (rows === null) return <p role="status" className="admin-notice">Loading...</p>;

  const totalStudents = rows.reduce((s, r) => s + r.students, 0);
  const overallAvg = rows.length > 0 ? Math.round(rows.reduce((s, r) => s + r.avgProgress, 0) / rows.length) : 0;

  return (
    <div>
      <h3 className="font-semibold mb-2">Performance Overview</h3>
      <SummaryRow items={[
        { label: 'Courses', value: rows.length, icon: FaBookOpen, detail: 'Created by you' },
        { label: 'Total Students', value: totalStudents, icon: FaUsers, detail: 'Across all courses' },
        { label: 'Avg. Progress', value: `${overallAvg}%`, icon: FaChartLine, detail: 'Across all students' }
      ]} />
      <Table
        headers={['Course', 'Students', 'Avg Progress', 'Completed']}
        rows={rows.map((r) => [r.title, r.students, `${r.avgProgress}%`, r.completed])}
        empty="No courses yet."
      />
    </div>
  );
}

function TeacherResourceLibraryPanel({ onFlash }) {
  const [items, setItems] = useState(null);

  useEffect(() => {
    apiRequest('/courses/mine/list').then(async (list) => {
      const all = await Promise.all(list.map(async (c) => {
        try {
          const data = await apiRequest(`/courses/${c._id}`);
          return (data.lessons || []).map((l) => ({ course: c.title, lesson: l.title, videoUrl: l.videoUrl, resources: l.resources || [] }));
        } catch { return []; }
      }));
      setItems(all.flat());
    }).catch((err) => onFlash(err.message));
  }, [onFlash]);

  if (items === null) return <p role="status" className="admin-notice">Loading...</p>;

  return (
    <div>
      <h3 className="font-semibold" style={{ marginBottom: 4 }}>Resource Library</h3>
      <p className="text-xs" style={{ color: 'var(--ink-soft)', marginBottom: 18 }}>Every lesson video and downloadable resource across all your courses, in one place. Add or edit these from My Classes → Manage Lessons.</p>
      {items.length === 0 && (
        <div className="student-empty-state" style={{ border: '1px solid var(--sand-line)', borderRadius: 18 }}>
          <FaFileLines aria-hidden="true" />
          <p>No lessons added yet</p>
        </div>
      )}
      <div style={{ display: 'grid', gap: 12 }}>
        {items.map((it, i) => (
          <div key={i} className="hover-card card" style={{ padding: 18, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <span style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--sand)', color: 'var(--forest)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <FaFileLines aria-hidden="true" size={14} />
            </span>
            <div style={{ minWidth: 0, flex: 1 }}>
              <strong className="text-sm">{it.lesson}</strong>
              <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 2 }}>{it.course}</p>
              {(it.videoUrl || it.resources.length > 0) && (
                <div className="flex flex-wrap items-center" style={{ gap: 8, marginTop: 10 }}>
                  {it.videoUrl && <a href={it.videoUrl} target="_blank" rel="noreferrer" className="text-xs" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 999, background: 'var(--sand)', border: '1px solid var(--sand-line)', color: 'var(--forest)', fontWeight: 600 }}>▶ Video</a>}
                  {it.resources.map((r, ri) => (
                    <a key={ri} href={r.url} target="_blank" rel="noreferrer" className="text-xs" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 999, background: 'var(--sand)', border: '1px solid var(--sand-line)', color: 'var(--forest)', fontWeight: 600 }}>📄 {r.name || 'Download'}</a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Parent

function ParentWorkspace({ tab, user, onFlash, onChanged, onNavigate }) {
  if (tab === 'profile') return <><ProfilePanel user={user} onFlash={onFlash} onChanged={onChanged} /><RolesPanel onFlash={onFlash} onChanged={onChanged} /><SupportComplaintPanel onFlash={onFlash} /></>;
  if (tab === 'children') return <ParentPanel onFlash={onFlash} />;
  if (tab === 'summary') return <ParentSummary onNavigate={onNavigate} />;
  if (tab === 'attendance') return <ParentChildDataPanel onFlash={onFlash} kind="attendance" />;
  if (tab === 'progress') return <ParentChildDataPanel onFlash={onFlash} kind="results" />;
  if (tab === 'fees') return <ParentChildDataPanel onFlash={onFlash} kind="fees" />;
  if (tab === 'timetable') return <ParentChildDataPanel onFlash={onFlash} kind="timetable" />;
  if (tab === 'homework') return <ParentChildDataPanel onFlash={onFlash} kind="homework" />;
  if (tab === 'examSchedule') return <ParentChildDataPanel onFlash={onFlash} kind="exams" />;
  if (tab === 'portfolio') return <ParentChildDataPanel onFlash={onFlash} kind="certificates" />;
  if (tab === 'performance') return <ParentPerformancePanel onFlash={onFlash} />;
  if (tab === 'institutionInfo') return <ParentInstitutionInfoPanel onFlash={onFlash} />;
  if (tab === 'teacherMessages') return <ParentTeacherMessagesPanel onFlash={onFlash} onNavigate={onNavigate} />;
  if (tab === 'wallet') return <ParentPaymentRecordsPanel onFlash={onFlash} />;
  if (tab === 'health') return <ParentHealthPanel onFlash={onFlash} />;
  if (tab === 'permissions') return <ParentPermissionsPanel onFlash={onFlash} />;
  if (tab === 'ptm') return <ParentPtmPanel onFlash={onFlash} />;
  return <ComingSoon label={tab} />;
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

  function reload() {
    if (!studentId) return;
    apiRequest(`/parents/children/${studentId}/${kind}`).then(setRows).catch((err) => onFlash(err.message));
  }
  useEffect(() => { setRows(null); reload(); }, [studentId, kind]); // eslint-disable-line react-hooks/exhaustive-deps

  if (children.length === 0) {
    return (
      <div className="student-empty-state" style={{ border: '1px solid var(--sand-line)', borderRadius: 18, minHeight: 180 }}>
        <FaUsers aria-hidden="true" />
        <p>No linked children yet</p>
        <span>Link one from the "My Children" tab first.</span>
      </div>
    );
  }

  return (
    <div>
      {children.length > 1 ? (
        <label style={{ display: 'inline-block', marginBottom: 18 }}>
          <span className="text-xs" style={{ display: 'block', color: 'var(--ink-soft)', fontWeight: 600, marginBottom: 6 }}>Viewing child</span>
          <select className="form-select" value={studentId} onChange={(e) => setStudentId(e.target.value)} style={{ minWidth: 240 }} aria-label="Select child">
            {children.map((c) => <option key={c.student._id} value={c.student._id}>{c.student.fullName}</option>)}
          </select>
        </label>
      ) : (
        <div className="flex items-center" style={{ gap: 10, marginBottom: 18 }}>
          <span style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--emerald)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{children[0].student.fullName[0]}</span>
          <strong className="text-sm">{children[0].student.fullName}</strong>
        </div>
      )}
      {rows === null && <p role="status" className="admin-notice">Loading...</p>}
      {rows && kind === 'attendance' && (
        <Table
          headers={['Date', 'Status', 'Absence Reason']}
          rows={rows.map((r) => {
            const mine = r.records.find((rec) => rec.student === studentId || rec.student?._id === studentId || rec.student?.toString?.() === studentId);
            return [
              new Date(r.date).toLocaleDateString(),
              <span className="flex items-center gap-2"><Tag status={ATTENDANCE_TAG[mine?.status] || 'pending'} />{ATTENDANCE_STATUS_LABEL[mine?.status] || mine?.status || '—'}</span>,
              mine?.reason || '—'
            ];
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
          headers={['Title', 'Amount', 'Due', 'Status', 'Payment']}
          rows={rows.map((f) => [
            f.title, `${f.currency} ${f.amount}`, f.dueDate ? new Date(f.dueDate).toLocaleDateString() : '—',
            <Tag status={f.status === 'paid' ? 'approved' : f.status === 'overdue' ? 'rejected' : 'pending'} />,
            <PayFeeButton fee={f} payUrl={`/parents/children/${studentId}/fees/${f._id}/pay`} onFlash={onFlash} onPaid={reload} />
          ])}
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
      {rows && kind === 'exams' && (
        <Table
          headers={['Exam', 'Subject', 'Date', 'Venue / Link', 'Instructions']}
          rows={rows.map((e) => [e.title, e.course?.subject || '—', e.scheduledDate ? new Date(e.scheduledDate).toLocaleString() : '—', e.venue || '—', e.instructions || '—'])}
          empty="No exams scheduled yet."
        />
      )}
      {rows && kind === 'certificates' && (
        <Table
          headers={['Certificate', 'Institution', 'Issued']}
          rows={rows.map((c) => [c.title, c.institution?.name || '—', c.issueDate ? new Date(c.issueDate).toLocaleDateString() : '—'])}
          empty="No certificates issued yet."
        />
      )}
    </div>
  );
}

function ParentPerformancePanel({ onFlash }) {
  const [children, setChildren] = useState([]);
  const [studentId, setStudentId] = useState('');
  const [attendanceRate, setAttendanceRate] = useState(null);
  const [results, setResults] = useState(null);

  useEffect(() => {
    apiRequest('/parents/children').then((list) => {
      setChildren(list);
      if (list[0]) setStudentId(list[0].student._id);
    }).catch((err) => onFlash(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!studentId) return;
    setResults(null);
    apiRequest(`/parents/children/${studentId}/attendance`).then((records) => {
      let present = 0, total = 0;
      records.forEach((r) => r.records.forEach((rec) => {
        const isMine = rec.student === studentId || rec.student?._id === studentId || rec.student?.toString?.() === studentId;
        if (isMine) { total += 1; if (rec.status === 'present') present += 1; }
      }));
      setAttendanceRate(total > 0 ? Math.round((present / total) * 100) : null);
    }).catch(() => setAttendanceRate(null));
    apiRequest(`/parents/children/${studentId}/results`).then(setResults).catch(() => setResults([]));
  }, [studentId]);

  if (children.length === 0) return <p className="admin-notice">No linked children yet — link one from the "My Children" tab first.</p>;

  const avg = results && results.length > 0 ? Math.round(results.reduce((s, r) => s + (r.marksObtained / r.totalMarks) * 100, 0) / results.length) : null;

  return (
    <div>
      <select className="form-select" value={studentId} onChange={(e) => setStudentId(e.target.value)} style={{ maxWidth: 320, marginBottom: 16 }} aria-label="Select child">
        {children.map((c) => <option key={c.student._id} value={c.student._id}>{c.student.fullName}</option>)}
      </select>
      <SummaryRow items={[
        { label: 'Attendance', value: attendanceRate !== null ? `${attendanceRate}%` : null, icon: FaCalendarCheck, detail: 'This term' },
        { label: 'Average Score', value: avg !== null ? `${avg}%` : null, icon: FaChartLine, detail: 'Across all results' },
        { label: 'Results Recorded', value: results?.length, icon: FaAward, detail: 'Total' }
      ]} />
      <Table
        headers={['Term', 'Subject', 'Marks', 'Grade']}
        rows={(results || []).map((r) => [r.term || '—', r.subject || '—', `${r.marksObtained}/${r.totalMarks}`, r.grade || '—'])}
        empty="No results recorded yet."
      />
    </div>
  );
}

function ParentInstitutionInfoPanel({ onFlash }) {
  const [children, setChildren] = useState(null);
  const [institution, setInstitution] = useState(undefined);
  const [newsletters, setNewsletters] = useState(null);
  const [magazine, setMagazine] = useState(null);
  const [campusBuildings, setCampusBuildings] = useState(null);

  useEffect(() => {
    apiRequest('/parents/me/dashboard').then((d) => setChildren(d.children)).catch((err) => onFlash(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const instId = children?.[0]?.institutionId;
    if (!instId) { setInstitution(null); return; }
    apiRequest(`/institutions/${instId}`).then(setInstitution).catch(() => setInstitution(null));
  }, [children]);

  useEffect(() => {
    if (!institution?._id) return;
    apiRequest(`/newsletters/published?institution=${institution._id}`).then(setNewsletters).catch(() => {});
    apiRequest(`/magazine/published?institution=${institution._id}`).then(setMagazine).catch(() => {});
    apiRequest(`/institutions/${institution._id}/campus-buildings`).then(setCampusBuildings).catch(() => {});
  }, [institution]);

  if (children === null) return <p role="status" className="admin-notice">Loading...</p>;
  if (children.length === 0) return <p className="admin-notice">No linked children yet — link one from the "My Children" tab first.</p>;
  if (institution === undefined) return <p role="status" className="admin-notice">Loading...</p>;
  if (!institution) return <p className="admin-notice">Your linked child isn't connected to an institution yet.</p>;

  return (
    <div>
      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <h3 className="font-semibold mb-2">{institution.name}</h3>
        <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>{institution.type || '—'} · {institution.country || '—'}{institution.city ? `, ${institution.city}` : ''}</p>
        {institution.description && <p className="text-sm mt-2">{institution.description}</p>}
        {institution.website && <p className="text-sm mt-2"><a href={institution.website} target="_blank" rel="noreferrer">{institution.website}</a></p>}
      </div>

      {campusBuildings && campusBuildings.length > 0 && (
        <>
          <h4 className="font-semibold mb-2" style={{ fontSize: '0.9rem' }}>Virtual Campus Tour</h4>
          <div style={{ marginBottom: 20 }}>
            <CampusTourViewer buildings={campusBuildings} />
          </div>
        </>
      )}

      <h4 className="font-semibold mb-2" style={{ fontSize: '0.9rem' }}>Newsletter</h4>
      {newsletters?.length === 0 && <p className="admin-notice">No newsletters published yet.</p>}
      <div className="space-y-3" style={{ marginBottom: 20 }}>
        {(newsletters || []).map((n) => (
          <div key={n._id} className="border border-[var(--sand-line)] rounded-xl p-3">
            <p className="font-medium">{n.title}</p>
            <p className="text-xs" style={{ color: 'var(--ink-soft)', margin: '4px 0' }}>{new Date(n.publishedAt).toLocaleDateString()}</p>
            <p className="text-sm">{n.content}</p>
          </div>
        ))}
      </div>

      <h4 className="font-semibold mb-2" style={{ fontSize: '0.9rem' }}>Student Magazine</h4>
      {magazine?.length === 0 && <p className="admin-notice">Nothing published yet.</p>}
      <div className="space-y-3">
        {(magazine || []).map((m) => (
          <div key={m._id} className="border border-[var(--sand-line)] rounded-xl p-3">
            <p className="font-medium">{m.title}</p>
            <p className="text-xs" style={{ color: 'var(--ink-soft)', margin: '4px 0' }}>By {m.student?.fullName || 'A student'} · {m.type}</p>
            <p className="text-sm">{m.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ParentTeacherMessagesPanel({ onFlash, onNavigate }) {
  const [children, setChildren] = useState(null);

  useEffect(() => {
    apiRequest('/parents/me/dashboard').then((d) => setChildren(d.children)).catch((err) => onFlash(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (children === null) return <p role="status" className="admin-notice">Loading...</p>;
  if (children.length === 0) {
    return (
      <div className="student-empty-state" style={{ border: '1px solid var(--sand-line)', borderRadius: 18, minHeight: 180 }}>
        <FaUsers aria-hidden="true" />
        <p>No linked children yet</p>
        <span>Link one from the "My Children" tab first.</span>
      </div>
    );
  }

  return (
    <div>
      <h3 className="font-semibold" style={{ marginBottom: 16 }}>Teacher Communication</h3>
      <div style={{ display: 'grid', gap: 14 }}>
        {children.map((c) => (
          <div key={c.id} className="card" style={{ padding: 20 }}>
            <div className="flex items-center justify-between flex-wrap" style={{ gap: 12 }}>
              <div className="flex items-center" style={{ gap: 12 }}>
                <span style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--emerald)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>{c.name[0]}</span>
                <div>
                  <strong className="text-sm">{c.name}</strong>
                  <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 2 }}>Class teacher: {c.classTeacher || 'Not assigned yet'}</p>
                </div>
              </div>
              <button type="button" className="btn btn-primary" style={{ padding: '7px 16px', fontSize: '0.78rem', flexShrink: 0 }} onClick={() => onNavigate?.('messages')}>Message Teacher</button>
            </div>
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--sand-line)' }}>
              {c.teacherMessage ? (
                <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>Latest: "{c.teacherMessage.text}" — {new Date(c.teacherMessage.date).toLocaleString()}{c.teacherMessage.unread > 0 ? ` (${c.teacherMessage.unread} unread)` : ''}</p>
              ) : (
                <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>No messages with the class teacher yet.</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const PTM_STATUS_TAG = { pending: 'pending', confirmed: 'approved', declined: 'rejected', cancelled: 'rejected' };

function ParentPtmPanel({ onFlash }) {
  const [children, setChildren] = useState(null);
  const [childId, setChildId] = useState('');
  const [teachers, setTeachers] = useState(null);
  const [form, setForm] = useState({ teacherId: '', requestedDate: '', mode: 'video', notes: '' });
  const [meetings, setMeetings] = useState(null);

  useEffect(() => {
    apiRequest('/parents/me/dashboard').then((d) => {
      setChildren(d.children);
      if (d.children.length > 0) setChildId(d.children[0].id);
    }).catch((err) => onFlash(err.message));
  }, [onFlash]);

  useEffect(() => {
    if (!childId) return;
    apiRequest(`/parents/children/${childId}/teachers`).then(setTeachers).catch((err) => onFlash(err.message));
  }, [childId, onFlash]);

  function loadMeetings() { apiRequest('/ptm/mine').then(setMeetings).catch((err) => onFlash(err.message)); }
  useEffect(loadMeetings, []);

  async function submitRequest(e) {
    e.preventDefault();
    if (!form.teacherId || !form.requestedDate) return onFlash('Pick a teacher and a date/time.');
    try {
      await apiRequest('/ptm', { method: 'POST', body: { studentId: childId, ...form } });
      onFlash('Meeting request sent. Waiting for the teacher to confirm.', 'success');
      setForm({ teacherId: '', requestedDate: '', mode: 'video', notes: '' });
      loadMeetings();
    } catch (err) { onFlash(err.message); }
  }
  async function cancelMeeting(id) {
    try {
      await apiRequest(`/ptm/${id}/cancel`, { method: 'PATCH' });
      onFlash('Meeting cancelled.', 'success');
      loadMeetings();
    } catch (err) { onFlash(err.message); }
  }

  if (children === null) return <p role="status" className="admin-notice">Loading...</p>;
  if (children.length === 0) return <p className="admin-notice">No linked children yet — link one from the "My Children" tab first.</p>;

  return (
    <div>
      <h3 className="font-semibold mb-2">Parent-Teacher Meeting</h3>

      {children.length > 1 && (
        <label className="text-xs" style={{ display: 'block', marginBottom: 14, maxWidth: 260 }}>Child
          <select className="form-select" value={childId} onChange={(e) => setChildId(e.target.value)} style={{ marginTop: 6 }}>
            {children.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
      )}

      <form onSubmit={submitRequest} className="space-y-2 max-w-md mb-6 border border-[var(--sand-line)] rounded-xl p-3">
        <strong className="text-sm">Request a Meeting</strong>
        {teachers === null && <p className="admin-notice">Loading teachers...</p>}
        {teachers?.length === 0 && <p className="admin-notice">No teachers found yet — this child's class timetable isn't set up.</p>}
        {teachers?.length > 0 && (
          <CustomSelect
            value={form.teacherId} onChange={(v) => setForm({ ...form, teacherId: v })} ariaLabel="Teacher" minWidth="100%"
            options={teachers.map((t) => ({ value: t.teacher._id, label: `${t.teacher.fullName}${t.subjects.length > 0 ? ` — ${t.subjects.join(', ')}` : ''}` }))}
          />
        )}
        <input className="form-input" type="datetime-local" value={form.requestedDate} onChange={(e) => setForm({ ...form, requestedDate: e.target.value })} required />
        <CustomSelect
          value={form.mode} onChange={(v) => setForm({ ...form, mode: v })} ariaLabel="Meeting mode" minWidth="100%"
          options={[{ value: 'video', label: 'Video Call' }, { value: 'physical', label: 'In Person' }]}
        />
        <textarea className="form-input" placeholder="What would you like to discuss? (optional)" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        <button type="submit" className="btn btn-primary" disabled={teachers?.length === 0}>Send Request</button>
      </form>

      <Table
        loading={meetings === null}
        headers={['Child', 'Teacher', 'Subject', 'Date', 'Mode', 'Status', 'Details', 'Action']}
        rows={(meetings || []).map((m) => [
          m.student?.fullName || '—', m.teacher?.fullName || '—', m.subject || '—',
          new Date(m.confirmedDate || m.requestedDate).toLocaleString(),
          m.mode === 'video' ? 'Video' : 'In Person',
          <Tag status={PTM_STATUS_TAG[m.status] || 'pending'} label={m.status} />,
          m.status === 'confirmed' ? (m.mode === 'video' ? (m.meetingLink ? <a href={m.meetingLink} target="_blank" rel="noreferrer">Join Link</a> : 'Link pending') : (m.location || 'Location pending')) : '—',
          ['pending', 'confirmed'].includes(m.status) ? <button className="btn" style={{ padding: '4px 10px', fontSize: '0.75rem', background: 'var(--sand-line)' }} onClick={() => cancelMeeting(m._id)}>Cancel</button> : '—'
        ])}
        empty="No meeting requests yet."
      />
    </div>
  );
}

function TeacherPtmPanel({ onFlash }) {
  const [meetings, setMeetings] = useState(null);
  const [respondFormFor, setRespondFormFor] = useState(null);
  const [respondForm, setRespondForm] = useState({ confirmedDate: '', meetingLink: '', location: '' });

  function load() { apiRequest('/ptm/mine').then(setMeetings).catch((err) => onFlash(err.message)); }
  useEffect(load, []);

  function startRespond(m) {
    setRespondFormFor(m._id);
    setRespondForm({ confirmedDate: m.requestedDate ? m.requestedDate.slice(0, 16) : '', meetingLink: '', location: '' });
  }

  async function respond(m, decision) {
    try {
      await apiRequest(`/ptm/${m._id}/respond`, { method: 'PATCH', body: { decision, ...respondForm } });
      onFlash(`Meeting ${decision}.`, 'success');
      setRespondFormFor(null);
      load();
    } catch (err) { onFlash(err.message); }
  }
  async function cancelMeeting(id) {
    try {
      await apiRequest(`/ptm/${id}/cancel`, { method: 'PATCH' });
      onFlash('Meeting cancelled.', 'success');
      load();
    } catch (err) { onFlash(err.message); }
  }

  return (
    <div>
      <h3 className="font-semibold mb-2">Parent-Teacher Meeting Requests</h3>
      {meetings === null && <p role="status" className="admin-notice">Loading...</p>}
      {meetings?.length === 0 && <p className="admin-notice">No meeting requests yet.</p>}
      <div className="space-y-3">
        {(meetings || []).map((m) => (
          <div key={m._id} className="border border-[var(--sand-line)] rounded-xl p-3">
            <div className="flex items-center justify-between flex-wrap" style={{ gap: 10 }}>
              <div>
                <strong className="text-sm">{m.student?.fullName || '—'}'s parent ({m.parent?.fullName || '—'})</strong>
                <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 2 }}>
                  {m.subject || 'General'} · Requested for {new Date(m.requestedDate).toLocaleString()} · {m.mode === 'video' ? 'Video Call' : 'In Person'}
                </p>
                {m.notes && <p className="text-xs mt-1">"{m.notes}"</p>}
              </div>
              <Tag status={PTM_STATUS_TAG[m.status] || 'pending'} label={m.status} />
            </div>

            {m.status === 'pending' && respondFormFor !== m._id && (
              <button className="btn btn-primary" style={{ padding: '5px 14px', fontSize: '0.78rem', marginTop: 10 }} onClick={() => startRespond(m)}>Respond</button>
            )}
            {respondFormFor === m._id && (
              <div className="flex items-end flex-wrap" style={{ gap: 10, marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--sand-line)' }}>
                <label className="text-xs" style={{ color: 'var(--ink-soft)', fontWeight: 600 }}>Confirmed date/time
                  <input type="datetime-local" className="form-input" value={respondForm.confirmedDate} onChange={(e) => setRespondForm({ ...respondForm, confirmedDate: e.target.value })} style={{ marginTop: 6 }} />
                </label>
                {m.mode === 'video'
                  ? <input className="form-input" placeholder="Meeting link" value={respondForm.meetingLink} onChange={(e) => setRespondForm({ ...respondForm, meetingLink: e.target.value })} style={{ flex: '1 1 200px', minWidth: 0 }} />
                  : <input className="form-input" placeholder="Location" value={respondForm.location} onChange={(e) => setRespondForm({ ...respondForm, location: e.target.value })} style={{ flex: '1 1 200px', minWidth: 0 }} />}
                <button type="button" className="btn btn-primary" style={{ padding: '7px 14px', fontSize: '0.78rem' }} onClick={() => respond(m, 'confirmed')}>Confirm</button>
                <button type="button" className="btn" style={{ padding: '7px 14px', fontSize: '0.78rem', background: 'var(--sand-line)' }} onClick={() => respond(m, 'declined')}>Decline</button>
                <button type="button" className="btn" style={{ padding: '7px 14px', fontSize: '0.78rem' }} onClick={() => setRespondFormFor(null)}>Close</button>
              </div>
            )}
            {m.status === 'confirmed' && (
              <div className="flex items-center justify-between flex-wrap" style={{ marginTop: 10, gap: 10 }}>
                <p className="text-xs">{new Date(m.confirmedDate).toLocaleString()} · {m.mode === 'video' ? (m.meetingLink || 'No link set') : (m.location || 'No location set')}</p>
                <button className="btn" style={{ padding: '5px 12px', fontSize: '0.75rem', background: 'var(--sand-line)' }} onClick={() => cancelMeeting(m._id)}>Cancel</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ParentPaymentRecordsPanel({ onFlash }) {
  const [children, setChildren] = useState([]);
  const [studentId, setStudentId] = useState('');
  const [fees, setFees] = useState(null);

  useEffect(() => {
    apiRequest('/parents/children').then((list) => {
      setChildren(list);
      if (list[0]) setStudentId(list[0].student._id);
    }).catch((err) => onFlash(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!studentId) return;
    setFees(null);
    apiRequest(`/parents/children/${studentId}/fees`).then(setFees).catch(() => setFees([]));
  }, [studentId]);

  if (children.length === 0) {
    return (
      <div className="student-empty-state" style={{ border: '1px solid var(--sand-line)', borderRadius: 18, minHeight: 180 }}>
        <FaUsers aria-hidden="true" />
        <p>No linked children yet</p>
        <span>Link one from the "My Children" tab first.</span>
      </div>
    );
  }

  const paid = (fees || []).filter((f) => f.status === 'paid');
  const selectedChild = children.find((c) => c.student._id === studentId);

  return (
    <div>
      {children.length > 1 ? (
        <label style={{ display: 'inline-block', marginBottom: 18 }}>
          <span className="text-xs" style={{ display: 'block', color: 'var(--ink-soft)', fontWeight: 600, marginBottom: 6 }}>Viewing child</span>
          <select className="form-select" value={studentId} onChange={(e) => setStudentId(e.target.value)} style={{ minWidth: 240 }} aria-label="Select child">
            {children.map((c) => <option key={c.student._id} value={c.student._id}>{c.student.fullName}</option>)}
          </select>
        </label>
      ) : selectedChild && (
        <div className="flex items-center" style={{ gap: 10, marginBottom: 18 }}>
          <span style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--emerald)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{selectedChild.student.fullName[0]}</span>
          <strong className="text-sm">{selectedChild.student.fullName}</strong>
        </div>
      )}
      <h3 className="font-semibold mb-2">Payment Records</h3>
      <Table
        headers={['Title', 'Gross Amount', 'Platform Commission', 'Net Amount', 'Paid Via', 'Paid On', 'Escrow', 'Receipt']}
        rows={paid.map((f) => [
          f.title, `${f.currency} ${f.grossAmount ?? f.amount}`,
          `${f.currency} ${f.platformCommission ?? 0}`,
          `${f.currency} ${f.netAmount ?? f.amount}`,
          f.paidVia || '—', f.paidAt ? new Date(f.paidAt).toLocaleDateString() : '—',
          <Tag status={f.escrowStatus === 'released' ? 'approved' : 'pending'} label={f.escrowStatus === 'released' ? 'Released' : 'Held'} />,
          f.transactionId || '—'
        ])}
        empty="No completed payments yet — outstanding fees are on the Fee Management page."
      />
    </div>
  );
}

function ParentChildPicker({ children, studentId, setStudentId }) {
  if (children.length === 0) return null;
  const selected = children.find((c) => c.student._id === studentId);
  return children.length > 1 ? (
    <label style={{ display: 'inline-block', marginBottom: 18 }}>
      <span className="text-xs" style={{ display: 'block', color: 'var(--ink-soft)', fontWeight: 600, marginBottom: 6 }}>Viewing child</span>
      <select className="form-select" value={studentId} onChange={(e) => setStudentId(e.target.value)} style={{ minWidth: 240 }} aria-label="Select child">
        {children.map((c) => <option key={c.student._id} value={c.student._id}>{c.student.fullName}</option>)}
      </select>
    </label>
  ) : selected ? (
    <div className="flex items-center" style={{ gap: 10, marginBottom: 18 }}>
      <span style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--emerald)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{selected.student.fullName[0]}</span>
      <strong className="text-sm">{selected.student.fullName}</strong>
    </div>
  ) : null;
}

// Health Record (spec Part 11.13) — optional, parent-managed. Only the linked parent and
// authorized institution staff can see this; it's never public.
function ParentHealthPanel({ onFlash }) {
  const [children, setChildren] = useState([]);
  const [studentId, setStudentId] = useState('');
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiRequest('/parents/children').then((list) => {
      setChildren(list);
      if (list[0]) setStudentId(list[0].student._id);
    }).catch((err) => onFlash(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selected = children.find((c) => c.student._id === studentId);
  const isSponsor = selected?.relationship === 'sponsor';

  useEffect(() => {
    if (!studentId || isSponsor) return;
    setForm(null);
    apiRequest(`/parents/children/${studentId}/health`).then((h) => setForm({
      bloodGroup: h.bloodGroup || '',
      allergies: (h.allergies || []).join(', '),
      medicalNotes: h.medicalNotes || '',
      emergencyName: h.emergencyContact?.name || '',
      emergencyPhone: h.emergencyContact?.phone || '',
      emergencyRelation: h.emergencyContact?.relation || ''
    })).catch((err) => onFlash(err.message));
  }, [studentId, isSponsor, onFlash]);

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await apiRequest(`/parents/children/${studentId}/health`, {
        method: 'PATCH',
        body: {
          bloodGroup: form.bloodGroup,
          allergies: form.allergies.split(',').map((a) => a.trim()).filter(Boolean),
          medicalNotes: form.medicalNotes,
          emergencyContact: { name: form.emergencyName, phone: form.emergencyPhone, relation: form.emergencyRelation }
        }
      });
      onFlash('Health record updated.', 'success');
    } catch (err) { onFlash(err.message); } finally { setSaving(false); }
  }

  if (children.length === 0) {
    return (
      <div className="student-empty-state" style={{ border: '1px solid var(--sand-line)', borderRadius: 18, minHeight: 180 }}>
        <FaUsers aria-hidden="true" />
        <p>No linked children yet</p>
        <span>Link one from the "My Children" tab first.</span>
      </div>
    );
  }

  return (
    <div>
      <ParentChildPicker children={children} studentId={studentId} setStudentId={setStudentId} />
      {isSponsor ? (
        <div className="admin-notice">Sponsor links cannot view or edit health records — this is limited to a father, mother or guardian link.</div>
      ) : (
      <>
      <p className="text-xs" style={{ color: 'var(--ink-soft)', marginBottom: 16 }}>Only you and your child's authorized institution staff can see this — it is never shown publicly.</p>
      {!form ? <p role="status" className="admin-notice">Loading...</p> : (
        <form onSubmit={save} style={{ display: 'grid', gap: 12, maxWidth: 440, padding: 18, border: '1px solid var(--sand-line)', borderRadius: 14 }}>
          <label className="text-xs" style={{ color: 'var(--ink-soft)', fontWeight: 600 }}>Blood Group
            <input className="form-input" value={form.bloodGroup} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })} style={{ marginTop: 6 }} placeholder="e.g. O+" />
          </label>
          <label className="text-xs" style={{ color: 'var(--ink-soft)', fontWeight: 600 }}>Allergies (comma-separated)
            <input className="form-input" value={form.allergies} onChange={(e) => setForm({ ...form, allergies: e.target.value })} style={{ marginTop: 6 }} placeholder="e.g. Peanuts, Penicillin" />
          </label>
          <label className="text-xs" style={{ color: 'var(--ink-soft)', fontWeight: 600 }}>Medical Notes
            <textarea className="form-input" rows={3} value={form.medicalNotes} onChange={(e) => setForm({ ...form, medicalNotes: e.target.value })} style={{ marginTop: 6 }} />
          </label>
          <div className="flex gap-2 flex-wrap">
            <label className="text-xs" style={{ color: 'var(--ink-soft)', fontWeight: 600, flex: '1 1 140px' }}>Emergency Contact Name
              <input className="form-input" value={form.emergencyName} onChange={(e) => setForm({ ...form, emergencyName: e.target.value })} style={{ marginTop: 6 }} />
            </label>
            <label className="text-xs" style={{ color: 'var(--ink-soft)', fontWeight: 600, flex: '1 1 140px' }}>Phone
              <input className="form-input" value={form.emergencyPhone} onChange={(e) => setForm({ ...form, emergencyPhone: e.target.value })} style={{ marginTop: 6 }} />
            </label>
            <label className="text-xs" style={{ color: 'var(--ink-soft)', fontWeight: 600, flex: '1 1 140px' }}>Relation
              <input className="form-input" value={form.emergencyRelation} onChange={(e) => setForm({ ...form, emergencyRelation: e.target.value })} style={{ marginTop: 6 }} />
            </label>
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '9px 20px', justifySelf: 'start' }} disabled={saving}>{saving ? 'Saving...' : 'Save Health Record'}</button>
        </form>
      )}
      </>
      )}
    </div>
  );
}

const PERMISSION_TYPES = [
  { value: 'trip', label: 'School Trip' },
  { value: 'event', label: 'Event' },
  { value: 'competition', label: 'Competition' },
  { value: 'photo', label: 'Photo / Media Use' },
  { value: 'medical', label: 'Medical Treatment' },
  { value: 'other', label: 'Other' }
];

// Digital permission slip (spec Part 11.14) — replaces the paper permission-slip workflow with
// a typed e-signature (full name) + timestamp.
function ParentPermissionsPanel({ onFlash }) {
  const [children, setChildren] = useState([]);
  const [studentId, setStudentId] = useState('');
  const [list, setList] = useState(null);
  const [form, setForm] = useState({ type: 'trip', title: '', details: '', decision: 'granted', signedName: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    apiRequest('/parents/children').then((l) => {
      setChildren(l);
      if (l[0]) setStudentId(l[0].student._id);
    }).catch((err) => onFlash(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function reload() {
    if (!studentId) return;
    apiRequest(`/parents/children/${studentId}/permissions`).then(setList).catch((err) => onFlash(err.message));
  }
  useEffect(() => { setList(null); reload(); }, [studentId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function submit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.signedName.trim()) return onFlash('Title and your typed signature are required.');
    setSubmitting(true);
    try {
      await apiRequest(`/parents/children/${studentId}/permissions`, { method: 'POST', body: form });
      onFlash('Permission recorded.', 'success');
      setForm({ type: 'trip', title: '', details: '', decision: 'granted', signedName: '' });
      reload();
    } catch (err) { onFlash(err.message); } finally { setSubmitting(false); }
  }

  if (children.length === 0) {
    return (
      <div className="student-empty-state" style={{ border: '1px solid var(--sand-line)', borderRadius: 18, minHeight: 180 }}>
        <FaUsers aria-hidden="true" />
        <p>No linked children yet</p>
        <span>Link one from the "My Children" tab first.</span>
      </div>
    );
  }

  const selected = children.find((c) => c.student._id === studentId);
  const isSponsor = selected?.relationship === 'sponsor';

  return (
    <div>
      <ParentChildPicker children={children} studentId={studentId} setStudentId={setStudentId} />
      {isSponsor ? (
        <div className="admin-notice" style={{ marginBottom: 20 }}>Sponsor links cannot sign consent for trips, events or medical treatment — this is limited to a father, mother or guardian link. You can still view the permission history below.</div>
      ) : (
      <form onSubmit={submit} style={{ display: 'grid', gap: 10, maxWidth: 460, marginBottom: 28, padding: 18, border: '1px solid var(--sand-line)', borderRadius: 14 }}>
        <CustomSelect value={form.type} onChange={(v) => setForm({ ...form, type: v })} ariaLabel="Permission type" minWidth="100%" options={PERMISSION_TYPES} />
        <input className="form-input" placeholder="Title (e.g. Grade 8 Museum Trip — 20 Oct)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <textarea className="form-input" placeholder="Details (optional)" rows={2} value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} />
        <div className="flex gap-2">
          <button type="button" className={`btn ${form.decision === 'granted' ? 'btn-primary' : ''}`} onClick={() => setForm({ ...form, decision: 'granted' })}>Grant Permission</button>
          <button type="button" className={`btn ${form.decision === 'denied' ? 'btn-primary' : ''}`} onClick={() => setForm({ ...form, decision: 'denied' })}>Deny Permission</button>
        </div>
        <label className="text-xs" style={{ color: 'var(--ink-soft)', fontWeight: 600 }}>Type your full name to sign
          <input className="form-input" value={form.signedName} onChange={(e) => setForm({ ...form, signedName: e.target.value })} style={{ marginTop: 6 }} placeholder="Your full legal name" required />
        </label>
        <button type="submit" className="btn btn-primary" style={{ padding: '9px 20px', justifySelf: 'start' }} disabled={submitting}>{submitting ? 'Recording...' : 'Sign & Submit'}</button>
      </form>
      )}
      <h4 className="font-semibold mb-2" style={{ fontSize: '0.85rem' }}>Permission History</h4>
      <Table
        loading={list === null}
        headers={['Type', 'Title', 'Decision', 'Signed By', 'Date']}
        rows={(list || []).map((p) => [
          PERMISSION_TYPES.find((t) => t.value === p.type)?.label || p.type, p.title,
          <Tag status={p.decision === 'granted' ? 'approved' : 'rejected'} />,
          p.signedName, new Date(p.signedAt).toLocaleDateString()
        ])}
        empty="No permission slips recorded yet."
      />
    </div>
  );
}

const ATTENDANCE_TAG = { present: 'approved', late: 'pending', excused: 'pending', absent: 'rejected' };
const ATTENDANCE_STATUS_LABEL = { present: 'Present', absent: 'Absent', late: 'Late', excused: 'Leave' };

function ParentSummary({ onNavigate }) {
  const [dash, setDash] = useState(null);
  const [error, setError] = useState('');
  const [selectedChild, setSelectedChild] = useState(null);

  useEffect(() => {
    apiRequest('/parents/me/dashboard').then(setDash).catch((err) => setError(err.message));
  }, []);

  if (error) return <div role="alert" className="admin-notice error">{error}</div>;
  if (!dash) return <p role="status" className="admin-notice">Loading your dashboard...</p>;
  if (dash.children.length === 0) {
    return (
      <div className="student-empty-state" style={{ border: '1px solid var(--sand-line)', borderRadius: 18, minHeight: 200 }}>
        <FaUsers aria-hidden="true" />
        <p>No linked children yet</p>
        <span>Link one from the "My Children" tab first, then approve it from the student's own account.</span>
      </div>
    );
  }

  const child = dash.children.find((c) => c.id === selectedChild) || dash.children[0];
  const totalPendingFees = dash.children.reduce((sum, c) => sum + c.fees.reduce((s, f) => s + f.remaining, 0), 0);

  const quickActions = [
    { label: 'View Child Details', key: 'children' },
    { label: 'View Attendance', key: 'attendance' },
    { label: 'View Results', key: 'progress' },
    { label: 'View Assignments', key: 'homework' },
    { label: 'View Exam Schedule', key: 'examSchedule' },
    child.fees.some((f) => f.remaining > 0) && { label: 'Pay Fee', key: 'fees' },
    { label: 'Message Teacher', key: 'teacherMessages' },
    { label: 'Book PTM', key: 'ptm' },
    { label: 'View Timetable', key: 'timetable' },
    { label: 'View Notifications', key: 'notifications' }
  ].filter(Boolean);

  return (
    <>
      {/* 1. Children Overview */}
      <div className="dash-section-title" style={{ marginTop: -12 }}><h2>Children Overview</h2></div>
      <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 14 }}>
        {dash.children.map((c) => (
          <div key={c.id} className="hover-card card" style={{ padding: 18, cursor: 'pointer', border: c.id === child.id ? '2px solid var(--emerald)' : '1px solid var(--sand-line)' }} onClick={() => setSelectedChild(c.id)}>
            <div className="flex items-center" style={{ gap: 12 }}>
              {c.profilePhoto
                ? <img src={c.profilePhoto} alt="" style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                : <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--emerald)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>{c.name[0]}</div>}
              <div>
                <strong className="text-sm">{c.name}</strong>
                <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 2 }}>{c.age !== null ? `Age ${c.age} · ` : ''}{c.class || 'No class assigned'}</p>
              </div>
            </div>
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--sand-line)' }}>
              <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>{c.school || 'Not connected to an institution'} · Roll #{c.rollNumber || '—'}</p>
              <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 4 }}>Program: {c.program || '—'} · Term: {c.currentTerm || '—'}</p>
              <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 4 }}>Class teacher: {c.classTeacher || '—'}</p>
            </div>
          </div>
        ))}
      </div>
      {dash.children.length > 1 && <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 10 }}>Showing details below for <strong>{child.name}</strong> — click another child's card to switch.</p>}

      {/* 2. Today's Attendance */}
      <div className="dash-section-title" style={{ marginTop: 32 }}><h2>Today's Attendance — {child.name}</h2></div>
      <div className="card" style={{ padding: child.todayAttendance ? 20 : 0 }}>
        {child.todayAttendance ? (
          <>
            <div className="flex items-center" style={{ gap: 10 }}>
              <Tag status={ATTENDANCE_TAG[child.todayAttendance.status] || 'pending'} />
              <span className="text-sm">{ATTENDANCE_STATUS_LABEL[child.todayAttendance.status] || child.todayAttendance.status}</span>
            </div>
            {child.todayAttendance.reason && <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 8 }}>Absence reason: {child.todayAttendance.reason}</p>}
          </>
        ) : (
          <div className="student-empty-state">
            <FaClipboardCheck aria-hidden="true" />
            <p>Not marked yet today</p>
            <span>The teacher hasn't recorded attendance for today yet.</span>
          </div>
        )}
      </div>

      {/* 3. Upcoming Exams */}
      <div className="dash-section-title" style={{ marginTop: 32 }}><h2>Upcoming Exams — {child.name}</h2></div>
      <div className="card" style={{ padding: 16 }}>
        <Table
          headers={['Subject', 'Exam', 'Date', 'Venue / Link', 'Instructions']}
          rows={child.upcomingExams.map((e) => [e.subject || '—', e.title, e.scheduledDate ? new Date(e.scheduledDate).toLocaleString() : '—', e.venue || '—', e.instructions || '—'])}
          empty="No upcoming exams scheduled."
        />
        <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.78rem', marginTop: 12 }} onClick={() => onNavigate?.('examSchedule')}>View Full Exam Schedule</button>
      </div>

      {/* 4. Pending Fees */}
      <div className="dash-section-title" style={{ marginTop: 32 }}><h2>Pending Fees</h2></div>
      <div style={{ display: 'grid', gap: 14 }}>
        {dash.children.map((c) => c.fees.length > 0 && (
          <div key={c.id} className="card" style={{ padding: 18 }}>
            <strong className="text-sm">{c.name}</strong>
            <div style={{ marginTop: 10 }}>
              {c.fees.map((f, i) => (
                <div key={i} className="flex items-center justify-between flex-wrap" style={{ gap: 12, padding: '10px 0', borderTop: i > 0 ? '1px solid var(--sand-line)' : 'none' }}>
                  <div>
                    <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>{f.institution} — Total {f.currency} {f.total} · Paid {f.currency} {f.paid} · Remaining {f.currency} {f.remaining}</p>
                    <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 4 }}>Due: {f.dueDate ? new Date(f.dueDate).toLocaleDateString() : '—'} · <Tag status={f.status === 'paid' ? 'approved' : f.status === 'overdue' ? 'rejected' : 'pending'} /></p>
                  </div>
                  {f.remaining > 0 && <button type="button" className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.78rem', flexShrink: 0 }} onClick={() => onNavigate?.('fees')}>Pay Now</button>}
                </div>
              ))}
            </div>
          </div>
        ))}
        {totalPendingFees === 0 && (
          <div className="student-empty-state" style={{ border: '1px solid var(--sand-line)', borderRadius: 18 }}>
            <FaWallet aria-hidden="true" />
            <p>No outstanding fees right now</p>
          </div>
        )}
      </div>

      {/* 5. Teacher Messages */}
      <div className="dash-section-title" style={{ marginTop: 32 }}><h2>Teacher Messages</h2></div>
      <div style={{ display: 'grid', gap: 12 }}>
        {dash.children.map((c) => (
          <div key={c.id} className="card" style={{ padding: 18 }}>
            <div className="flex items-center justify-between flex-wrap" style={{ gap: 12 }}>
              <div>
                <strong className="text-sm">{c.classTeacher || 'No class teacher assigned'}</strong>
                <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 4 }}>Re: {c.name}</p>
                {c.teacherMessage ? (
                  <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 6 }}>"{c.teacherMessage.text}" — {new Date(c.teacherMessage.date).toLocaleString()}{c.teacherMessage.unread > 0 ? ` · ${c.teacherMessage.unread} unread` : ''}</p>
                ) : <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 6 }}>No messages yet.</p>}
              </div>
              <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.78rem', flexShrink: 0 }} onClick={() => onNavigate?.('messages')}>{c.teacherMessage ? 'View / Reply' : 'Message Teacher'}</button>
            </div>
          </div>
        ))}
      </div>

      {/* 6. Notifications */}
      <div className="dash-section-title" style={{ marginTop: 32 }}><h2>Notifications</h2></div>
      <div className="card" style={{ padding: dash.notifications.length === 0 ? 0 : 12 }}>
        {dash.notifications.length === 0 && (
          <div className="student-empty-state">
            <FaBell aria-hidden="true" />
            <p>No notifications yet</p>
          </div>
        )}
        {dash.notifications.map((n, idx) => (
          <div key={n._id} className="flex items-center justify-between" style={{ padding: '10px 4px', borderBottom: idx < dash.notifications.length - 1 ? '1px solid var(--sand-line)' : 'none' }}>
            <p className="text-xs" style={{ color: n.read ? 'var(--ink-soft)' : 'var(--ink)', fontWeight: n.read ? 400 : 600 }}>{n.title}</p>
            <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>{new Date(n.createdAt).toLocaleDateString()}</span>
          </div>
        ))}
        {dash.notifications.length > 0 && <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.75rem', marginTop: 8 }} onClick={() => onNavigate?.('notifications')}>View All</button>}
      </div>

      {/* Quick Actions */}
      <QuickActions actions={quickActions} onNavigate={onNavigate} />
    </>
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
  if (tab === 'campusLife') return <InstitutionCampusLifePanel onFlash={onFlash} />;
  if (tab === 'certificates') return <InstitutionCertificatesPanel onFlash={onFlash} />;
  if (tab === 'teachers') return <InstitutionTeachersPanel onFlash={onFlash} />;
  if (tab === 'students') return <InstitutionStudentsPanel onFlash={onFlash} />;
  if (tab === 'attendance') return <InstitutionAttendancePanel onFlash={onFlash} />;
  if (tab === 'payroll') return <InstitutionPayrollPanel onFlash={onFlash} />;
  if (tab === 'reports') return <InstitutionReportsPanel onFlash={onFlash} />;
  if (tab === 'examination') return <InstitutionExaminationPanel onFlash={onFlash} />;
  if (tab === 'campusTour') return <InstitutionCampusTourPanel onFlash={onFlash} />;
  if (tab === 'admissions') return <InstitutionAdmissionsPanel onFlash={onFlash} />;
  if (tab === 'library') return <InstitutionLibraryPanel onFlash={onFlash} />;
  if (tab === 'hostel') return <InstitutionHostelPanel onFlash={onFlash} />;
  if (tab === 'transport') return <InstitutionTransportPanel onFlash={onFlash} />;
  if (tab === 'inventory') return <InstitutionInventoryPanel onFlash={onFlash} />;
  if (tab === 'health') return <InstitutionHealthPanel onFlash={onFlash} />;
  if (tab === 'events') return <InstitutionEventsPanel onFlash={onFlash} />;
  if (tab === 'helpdesk') return <InstitutionHelpDeskPanel onFlash={onFlash} />;
  if (tab === 'aiAssistant') return <InstitutionAiAssistantPanel onFlash={onFlash} />;
  return <ComingSoon label={tab} />;
}

// ------------------------------------------------------------ Institute Representative
// A limited institution-staff dashboard — no payroll/finance/full-staff-management access.
// Everything reads/writes real Inquiry/InstitutionApplication/Meeting/VirtualFair data.

function RepresentativeWorkspace({ tab, user, onFlash, onChanged, onNavigate, repInfo }) {
  if (tab === 'profile') return <><ProfilePanel user={user} onFlash={onFlash} onChanged={onChanged} /><RepInstitutionProfileCard repInfo={repInfo} /><RolesPanel onFlash={onFlash} onChanged={onChanged} /><SupportComplaintPanel onFlash={onFlash} /></>;
  if (tab === 'summary') return <RepDashboardPanel onFlash={onFlash} onNavigate={onNavigate} repInfo={repInfo} user={user} />;
  if (tab === 'inquiries') return <RepInquiriesPanel onFlash={onFlash} repInfo={repInfo} user={user} />;
  if (tab === 'applications') return <RepApplicationsPanel onFlash={onFlash} repInfo={repInfo} user={user} />;
  if (tab === 'assignedStudents') return <RepAssignedStudentsPanel onFlash={onFlash} repInfo={repInfo} user={user} />;
  if (tab === 'meetings') return <RepMeetingsPanel onFlash={onFlash} repInfo={repInfo} />;
  if (tab === 'repMessages') return <RepMessagesPanel onFlash={onFlash} repInfo={repInfo} user={user} />;
  if (tab === 'followUps') return <RepFollowUpsPanel onFlash={onFlash} onNavigate={onNavigate} />;
  if (tab === 'programs') return <RepInstitutionInfoPanel onFlash={onFlash} repInfo={repInfo} section="programs" />;
  if (tab === 'admissionsInfo') return <RepInstitutionInfoPanel onFlash={onFlash} repInfo={repInfo} section="admissions" />;
  if (tab === 'repScholarships') return <RepInstitutionInfoPanel onFlash={onFlash} repInfo={repInfo} section="scholarships" />;
  if (tab === 'virtualFair') return <RepVirtualFairPanel onFlash={onFlash} repInfo={repInfo} />;
  if (tab === 'documents') return <RepDocumentsPanel onFlash={onFlash} repInfo={repInfo} />;
  return <ComingSoon label={tab} />;
}

function RepInstitutionProfileCard({ repInfo }) {
  if (!repInfo) return null;
  return (
    <div className="admin-section admin-account-card" style={{ marginTop: 20 }}>
      <div className="admin-section-heading"><div><h2>Representative Details</h2><p>Your role at {repInfo.institutionName}.</p></div><FaChalkboardUser aria-hidden="true" /></div>
      <div className="flex items-center gap-3 mb-2">
        {repInfo.institutionLogo && <img src={repInfo.institutionLogo} alt="" style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover' }} />}
        <strong className="text-sm">{repInfo.institutionName}</strong>
      </div>
      <p className="text-sm mt-1">Designation: <strong style={{ textTransform: 'capitalize' }}>{repInfo.role}</strong></p>
      <p className="text-sm mt-1">Department: <strong>{repInfo.department || 'Not set'}</strong></p>
      <p className="text-sm mt-1">Final-approval permission: {repInfo.permissions?.includes('application:approve') ? <Tag status="approved" /> : <Tag status="pending" />}</p>
    </div>
  );
}

const REP_INQUIRY_STATUS = ['new', 'contacted', 'follow_up', 'resolved', 'closed'];
const REP_INQUIRY_STATUS_LABEL = { new: 'New', contacted: 'Contacted', follow_up: 'Follow-up', resolved: 'Resolved', closed: 'Closed' };
const REP_INQUIRY_TAG = { new: 'pending', contacted: 'pending', follow_up: 'pending', resolved: 'approved', closed: 'approved' };
const REP_APP_STATUS = ['draft', 'submitted', 'under_review', 'documents_required', 'accepted', 'rejected'];
const REP_APP_STATUS_LABEL = { draft: 'Draft', submitted: 'Submitted', under_review: 'Under Review', documents_required: 'Documents Required', accepted: 'Accepted', rejected: 'Rejected' };
const REP_APP_TAG = { draft: 'pending', submitted: 'pending', under_review: 'pending', documents_required: 'pending', accepted: 'approved', rejected: 'rejected' };
const MEETING_MODE_LABEL = { video: 'Video', audio: 'Audio', physical: 'Physical' };
const MEETING_STATUS = {
  scheduled: { tag: 'pending', label: 'Scheduled' },
  completed: { tag: 'approved', label: 'Completed' },
  cancelled: { tag: 'rejected', label: 'Cancelled' }
};

// Institute Representative home — Welcome/Profile → 6 Summary Cards → Student Inquiries →
// Institution Applications → Upcoming Meetings → Follow-ups → Notifications → Quick Actions.
function RepDashboardPanel({ onFlash, onNavigate, repInfo, user }) {
  const [dash, setDash] = useState(null);

  useEffect(() => {
    apiRequest('/institutions/mine/rep-dashboard').then(setDash).catch((err) => onFlash(err.message));
  }, [onFlash]);

  if (!dash) return <p role="status" className="admin-notice">Loading your dashboard...</p>;

  return (
    <>
      {/* 1. Representative Profile */}
      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <div className="flex items-center gap-3 flex-wrap">
          {user?.profilePhoto
            ? <img src={user.profilePhoto} alt="" style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }} />
            : <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--forest-deep)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{(user?.fullName || '?')[0]}</div>}
          <div>
            <strong className="text-sm">{user?.fullName}</strong>
            <div className="flex items-center gap-2 mt-1">
              {dash.profile.institutionLogo && <img src={dash.profile.institutionLogo} alt="" style={{ width: 20, height: 20, borderRadius: 4, objectFit: 'cover' }} />}
              <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>{dash.profile.institutionName} · {dash.profile.designation}{dash.profile.department ? ` · ${dash.profile.department}` : ''}</p>
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>Verification: <Tag status={dash.profile.verificationStatus === 'approved' ? 'approved' : 'pending'} /> · {dash.profile.contactEmail || 'No contact email set'} {dash.profile.contactPhone ? `· ${dash.profile.contactPhone}` : ''}</p>
          </div>
        </div>
      </div>

      {/* 2. Summary Cards */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3" style={{ marginBottom: 20 }}>
        <SummaryCard title="New Student Inquiries" count={dash.counts.newInquiries} onClick={() => onNavigate?.('inquiries')} />
        <SummaryCard title="Assigned Applications" count={dash.counts.assignedApplications} onClick={() => onNavigate?.('applications')} />
        <SummaryCard title="Pending Applications" count={dash.counts.pendingApplications} onClick={() => onNavigate?.('applications')} />
        <SummaryCard title="Upcoming Meetings" count={dash.counts.upcomingMeetings} onClick={() => onNavigate?.('meetings')} />
        <SummaryCard title="Unread Messages" count={dash.counts.unreadMessages} onClick={() => onNavigate?.('repMessages')} />
        <SummaryCard title="Completed Consultations" count={dash.counts.completedConsultations} onClick={() => onNavigate?.('meetings')} />
      </div>

      {/* 3. Student Inquiries */}
      <div className="dash-section-title"><h2>Student Inquiries</h2></div>
      <div className="card" style={{ padding: 16, marginBottom: 20 }}>
        <Table
          headers={['Student', 'Program', 'Country', 'Status', 'Assigned Rep', 'Date']}
          rows={dash.inquiries.slice(0, 5).map((i) => [i.student?.fullName, i.interestedProgram, i.country || '—', <Tag status={REP_INQUIRY_TAG[i.status]} />, i.assignedRepresentative?.fullName || 'Unassigned', new Date(i.createdAt).toLocaleDateString()])}
          empty="No inquiries yet."
        />
        <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.78rem', marginTop: 12 }} onClick={() => onNavigate?.('inquiries')}>View / Respond</button>
      </div>

      {/* 4. Institution Applications */}
      <div className="dash-section-title"><h2>Institution Applications</h2></div>
      <div className="card" style={{ padding: 16, marginBottom: 20 }}>
        <Table
          headers={['Applicant', 'Program', 'Documents', 'Missing', 'Status', 'Progress', 'Applied']}
          rows={dash.applications.slice(0, 5).map((a) => [a.applicant?.fullName, a.program, a.documents?.length || 0, a.missingRequirements?.length ? a.missingRequirements.join(', ') : '—', <Tag status={REP_APP_TAG[a.status]} />, `${a.admissionProgress}%`, a.submittedAt ? new Date(a.submittedAt).toLocaleDateString() : 'Draft'])}
          empty="No applications yet."
        />
        <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.78rem', marginTop: 12 }} onClick={() => onNavigate?.('applications')}>Review Applications</button>
      </div>

      {/* 5. Upcoming Meetings/Consultations */}
      <div className="dash-section-title"><h2>Upcoming Meetings</h2></div>
      {dash.upcomingMeetings.length === 0 ? (
        <div className="student-empty-state" style={{ border: '1px solid var(--sand-line)', borderRadius: 18, marginBottom: 20 }}>
          <FaCalendarCheck aria-hidden="true" />
          <p>No meetings scheduled</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12, marginBottom: 20 }}>
          {dash.upcomingMeetings.map((m) => {
            const st = MEETING_STATUS[m.status] || MEETING_STATUS.scheduled;
            return (
              <div key={m._id} className="card" style={{ padding: 18 }}>
                <div className="flex items-center justify-between flex-wrap" style={{ gap: 12 }}>
                  <div>
                    <strong className="text-sm">{m.student?.fullName}</strong>
                    <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 4 }}>{m.program || 'General consultation'}</p>
                    <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 4 }}>{new Date(m.scheduledDate).toLocaleString()} · {MEETING_MODE_LABEL[m.mode] || m.mode}</p>
                    <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 4 }}>{m.mode === 'physical' ? (m.location || 'Location to be confirmed') : (m.meetingLink || 'Meeting link to be shared')}</p>
                    <span style={{ display: 'inline-block', marginTop: 8 }}><Tag status={st.tag} label={st.label} /></span>
                  </div>
                  {m.mode !== 'physical' && m.meetingLink ? <a className="btn btn-primary" style={{ padding: '7px 16px', fontSize: '0.75rem', flexShrink: 0 }} href={m.meetingLink} target="_blank" rel="noreferrer">Join Meeting</a> : <button type="button" className="btn" style={{ padding: '7px 16px', fontSize: '0.75rem', flexShrink: 0 }} onClick={() => onNavigate?.('meetings')}>View Details</button>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 7. Follow-ups */}
      <div className="dash-section-title"><h2>Follow-ups Needed</h2></div>
      <div className="card" style={{ padding: 18, marginBottom: 20 }}>
        <p className="text-xs" style={{ color: 'var(--ink-soft)', lineHeight: 1.7 }}>{dash.followUps.unansweredInquiries.length} unanswered inquiries · {dash.followUps.followUpInquiries.length} marked follow-up · {dash.followUps.documentsRequired.length} waiting on documents · {dash.followUps.pendingApplicationActions.length} applications need action · {dash.followUps.meetingReminders.length} meetings within 48h</p>
        {dash.followUps.admissionDeadline && <p className="text-xs" style={{ color: 'var(--rose)', fontWeight: 600, marginTop: 8 }}>Admission deadline: {new Date(dash.followUps.admissionDeadline).toLocaleDateString()}</p>}
        <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.78rem', marginTop: 12 }} onClick={() => onNavigate?.('followUps')}>View Follow-ups</button>
      </div>

      {/* 10. Notifications */}
      <div className="dash-section-title"><h2>Notifications</h2></div>
      {dash.notifications.length === 0 ? (
        <div className="student-empty-state" style={{ border: '1px solid var(--sand-line)', borderRadius: 18, marginBottom: 20 }}>
          <FaBell aria-hidden="true" />
          <p>No notifications yet</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, marginBottom: 20 }}>
          <div className="dash-list" style={{ gap: 0 }}>
            {dash.notifications.map((n, idx) => (
              <div key={n._id} className={`dash-list-item${!n.read ? ' unread' : ''}`} style={{ borderBottom: idx < dash.notifications.length - 1 ? '1px solid var(--sand-line)' : 'none' }}>
                <span className="dash-list-icon c-gold" aria-hidden><FaBell size={14} /></span>
                <div className="dash-list-body"><div className="title" style={{ fontWeight: n.read ? 400 : 600 }}>{n.title}</div></div>
                <span className="dash-list-time">{new Date(n.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
          <div style={{ padding: 12 }}>
            <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.75rem' }} onClick={() => onNavigate?.('notifications')}>View All</button>
          </div>
        </div>
      )}

      {/* 11. Recent Activity */}
      <RecentActivity items={dash.recentActivity.map((a) => ({ ...a, desc: '', status: 'approved' }))} />

      {/* 12. Quick Actions */}
      <QuickActions
        actions={[
          { label: 'View New Inquiries', key: 'inquiries' },
          { label: 'Review Applications', key: 'applications' },
          { label: 'Message Student', key: 'repMessages' },
          { label: 'Schedule Meeting', key: 'meetings' },
          { label: 'Join Meeting', key: 'meetings' },
          { label: 'Request Documents', key: 'applications' },
          { label: 'View Programs', key: 'programs' },
          { label: 'View Notifications', key: 'notifications' }
        ]}
        onNavigate={onNavigate}
      />
    </>
  );
}

function RepInquiriesPanel({ onFlash, repInfo, user }) {
  const [inquiries, setInquiries] = useState(null);
  const [replies, setReplies] = useState({});

  function load() {
    if (!repInfo) return;
    apiRequest(`/inquiries/institution/${repInfo.institutionId}`).then(setInquiries).catch((err) => onFlash(err.message));
  }
  useEffect(load, [repInfo]); // eslint-disable-line react-hooks/exhaustive-deps

  async function setStatus(id, status) {
    try { await apiRequest(`/inquiries/${id}`, { method: 'PATCH', body: { status } }); load(); } catch (err) { onFlash(err.message); }
  }
  async function assignToMe(id) {
    try { await apiRequest(`/inquiries/${id}`, { method: 'PATCH', body: { assignedRepresentative: user._id } }); onFlash('Assigned to you.', 'success'); load(); } catch (err) { onFlash(err.message); }
  }
  async function respond(id) {
    if (!replies[id]) return;
    try {
      await apiRequest(`/inquiries/${id}/respond`, { method: 'POST', body: { text: replies[id] } });
      onFlash('Response sent.', 'success');
      setReplies({ ...replies, [id]: '' });
      load();
    } catch (err) { onFlash(err.message); }
  }

  if (inquiries === null) return <p role="status" className="admin-notice">Loading...</p>;

  return (
    <div>
      <h3 className="font-semibold" style={{ marginBottom: 16 }}>Student Inquiries</h3>
      {inquiries.length === 0 && (
        <div className="student-empty-state" style={{ border: '1px solid var(--sand-line)', borderRadius: 18 }}>
          <FaClipboardList aria-hidden="true" />
          <p>No inquiries yet</p>
        </div>
      )}
      <div style={{ display: 'grid', gap: 14 }}>
        {inquiries.map((i) => (
          <div key={i._id} className="card" style={{ padding: 20 }}>
            <div className="flex items-start justify-between flex-wrap" style={{ gap: 14 }}>
              <div className="flex items-start" style={{ gap: 12 }}>
                <span style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--forest)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>{(i.student?.fullName || '?')[0]}</span>
                <div>
                  <strong className="text-sm">{i.student?.fullName}</strong>
                  <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 2 }}>{i.interestedProgram}</p>
                  <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 4 }}>
                    {i.qualification ? `${i.qualification} · ` : ''}{i.country || 'Country not set'} · {new Date(i.createdAt).toLocaleDateString()} · Assigned: {i.assignedRepresentative?.fullName || 'Unassigned'}
                  </p>
                  {i.message && <p className="text-sm" style={{ marginTop: 6 }}>"{i.message}"</p>}
                </div>
              </div>
              <div className="flex items-center" style={{ gap: 10, flexShrink: 0 }}>
                <div style={{ minWidth: 150 }}>
                  <CustomSelect
                    value={i.status} onChange={(v) => setStatus(i._id, v)} ariaLabel="Inquiry status" minWidth="100%"
                    options={REP_INQUIRY_STATUS.map((s) => ({ value: s, label: REP_INQUIRY_STATUS_LABEL[s] }))}
                  />
                </div>
                {!i.assignedRepresentative && <button type="button" className="btn" style={{ padding: '8px 14px', fontSize: '0.72rem' }} onClick={() => assignToMe(i._id)}>Assign to me</button>}
              </div>
            </div>
            {i.responses.length > 0 && (
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--sand-line)', display: 'grid', gap: 6 }}>
                {i.responses.map((r, ri) => <p key={ri} className="text-xs" style={{ color: 'var(--ink-soft)' }}>{new Date(r.createdAt).toLocaleString()}: {r.text}</p>)}
              </div>
            )}
            <div className="flex items-end" style={{ gap: 12, marginTop: 14 }}>
              <input className="form-input" placeholder="Reply to student..." value={replies[i._id] || ''} onChange={(e) => setReplies({ ...replies, [i._id]: e.target.value })} style={{ flex: '1 1 auto', minWidth: 0 }} />
              <button type="button" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.78rem', flexShrink: 0 }} onClick={() => respond(i._id)}>Respond</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RepApplicationsPanel({ onFlash, repInfo, user }) {
  const [applications, setApplications] = useState(null);
  const [missingDraft, setMissingDraft] = useState({});

  function load() {
    if (!repInfo) return;
    apiRequest(`/institution-applications/institution/${repInfo.institutionId}`).then(setApplications).catch((err) => onFlash(err.message));
  }
  useEffect(load, [repInfo]); // eslint-disable-line react-hooks/exhaustive-deps

  async function setStatus(id, status) {
    try { await apiRequest(`/institution-applications/${id}`, { method: 'PATCH', body: { status } }); onFlash(`Status: ${status}.`, 'success'); load(); } catch (err) { onFlash(err.message); }
  }
  async function assignToMe(id) {
    try { await apiRequest(`/institution-applications/${id}`, { method: 'PATCH', body: { assignedRepresentative: user._id } }); onFlash('Assigned to you.', 'success'); load(); } catch (err) { onFlash(err.message); }
  }
  async function saveMissing(id) {
    const list = (missingDraft[id] || '').split(',').map((s) => s.trim()).filter(Boolean);
    try { await apiRequest(`/institution-applications/${id}`, { method: 'PATCH', body: { missingRequirements: list, status: 'documents_required' } }); onFlash('Requested missing documents.', 'success'); load(); } catch (err) { onFlash(err.message); }
  }

  if (applications === null) return <p role="status" className="admin-notice">Loading...</p>;

  return (
    <div>
      <h3 className="font-semibold" style={{ marginBottom: 4 }}>Institution Applications</h3>
      <p className="text-xs" style={{ color: 'var(--ink-soft)', marginBottom: 18 }}>You can move applications through review — final Accept/Reject only works if your institution granted you that permission.</p>
      {applications.length === 0 && (
        <div className="student-empty-state" style={{ border: '1px solid var(--sand-line)', borderRadius: 18 }}>
          <FaFileLines aria-hidden="true" />
          <p>No applications yet</p>
        </div>
      )}
      <div style={{ display: 'grid', gap: 14 }}>
        {applications.map((a) => {
          const canApprove = repInfo?.permissions?.includes('application:approve');
          return (
            <div key={a._id} className="card" style={{ padding: 20 }}>
              <div className="flex items-start justify-between flex-wrap" style={{ gap: 14 }}>
                <div className="flex items-start" style={{ gap: 12 }}>
                  <span style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--forest)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>{(a.applicant?.fullName || '?')[0]}</span>
                  <div>
                    <strong className="text-sm">{a.applicant?.fullName}</strong>
                    <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 2 }}>{a.program}</p>
                    <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 4 }}>Applied: {a.submittedAt ? new Date(a.submittedAt).toLocaleDateString() : 'Draft'} · Assigned: {a.assignedRepresentative?.fullName || 'Unassigned'} · {a.documents.length} document(s) submitted</p>
                    <div className="student-progress-row" style={{ maxWidth: 220, marginTop: 8, marginBottom: 0 }}>
                      <span className="text-xs">Admission progress</span>
                      <strong className="text-xs">{a.admissionProgress}%</strong>
                    </div>
                    <progress className="student-progress-bar" max="100" value={a.admissionProgress} style={{ maxWidth: 220 }} aria-label="Admission progress" />
                    {a.missingRequirements.length > 0 && <p className="text-xs" style={{ color: 'var(--rose)', fontWeight: 600, marginTop: 8 }}>Missing: {a.missingRequirements.join(', ')}</p>}
                    {a.documents.length > 0 && <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 6 }}>{a.documents.map((d) => d.name).join(', ')}</p>}
                  </div>
                </div>
                <div className="flex items-center" style={{ gap: 10, flexShrink: 0 }}>
                  <div style={{ minWidth: 170 }}>
                    <CustomSelect
                      value={a.status} onChange={(v) => setStatus(a._id, v)} ariaLabel="Application status" minWidth="100%"
                      options={REP_APP_STATUS.map((s) => {
                        const locked = ['accepted', 'rejected'].includes(s) && !canApprove;
                        return { value: s, label: REP_APP_STATUS_LABEL[s] + (locked ? ' 🔒' : ''), disabled: locked };
                      })}
                    />
                  </div>
                  {!a.assignedRepresentative && <button type="button" className="btn" style={{ padding: '8px 14px', fontSize: '0.72rem' }} onClick={() => assignToMe(a._id)}>Assign to me</button>}
                </div>
              </div>
              <div className="flex items-end" style={{ gap: 12, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--sand-line)' }}>
                <input className="form-input" placeholder="Missing documents (comma separated)" value={missingDraft[a._id] || ''} onChange={(e) => setMissingDraft({ ...missingDraft, [a._id]: e.target.value })} style={{ flex: '1 1 auto', minWidth: 0 }} />
                <button type="button" className="btn" style={{ padding: '8px 16px', fontSize: '0.78rem', flexShrink: 0 }} onClick={() => saveMissing(a._id)}>Request Documents</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RepAssignedStudentsPanel({ onFlash, repInfo, user }) {
  const [rows, setRows] = useState(null);

  useEffect(() => {
    if (!repInfo) return;
    Promise.all([
      apiRequest(`/inquiries/institution/${repInfo.institutionId}`),
      apiRequest(`/institution-applications/institution/${repInfo.institutionId}`)
    ]).then(([inquiries, applications]) => {
      const mine = [
        ...inquiries.filter((i) => i.assignedRepresentative?._id === user._id).map((i) => ({ id: `inq-${i._id}`, name: i.student?.fullName, type: 'Inquiry', detail: i.interestedProgram, status: i.status })),
        ...applications.filter((a) => a.assignedRepresentative?._id === user._id).map((a) => ({ id: `app-${a._id}`, name: a.applicant?.fullName, type: 'Application', detail: a.program, status: a.status }))
      ];
      setRows(mine);
    }).catch((err) => onFlash(err.message));
  }, [repInfo, user._id, onFlash]);

  return (
    <div>
      <h3 className="font-semibold mb-2">Assigned Students</h3>
      <Table
        loading={rows === null}
        headers={['Student', 'Type', 'Program/Detail', 'Status']}
        rows={(rows || []).map((r) => [r.name, r.type, r.detail, <Tag status={REP_INQUIRY_TAG[r.status] || REP_APP_TAG[r.status] || 'pending'} />])}
        empty="No students assigned to you yet."
      />
    </div>
  );
}

function RepMeetingsPanel({ onFlash, repInfo }) {
  const [meetings, setMeetings] = useState(null);
  const [form, setForm] = useState({ studentId: '', program: '', scheduledDate: '', mode: 'video', location: '', meetingLink: '' });

  function load() { apiRequest('/meetings/mine').then(setMeetings).catch((err) => onFlash(err.message)); }
  useEffect(load, []);

  async function schedule(e) {
    e.preventDefault();
    if (!repInfo) return;
    try {
      await apiRequest('/meetings', { method: 'POST', body: { institution: repInfo.institutionId, student: form.studentId.trim(), program: form.program, scheduledDate: form.scheduledDate, mode: form.mode, location: form.location, meetingLink: form.meetingLink } });
      onFlash('Meeting scheduled.', 'success');
      setForm({ studentId: '', program: '', scheduledDate: '', mode: 'video', location: '', meetingLink: '' });
      load();
    } catch (err) { onFlash(err.message); }
  }
  async function setStatus(id, status) {
    try { await apiRequest(`/meetings/${id}/status`, { method: 'PATCH', body: { status } }); load(); } catch (err) { onFlash(err.message); }
  }

  return (
    <div>
      <h3 className="font-semibold" style={{ marginBottom: 14 }}>Meetings / Consultations</h3>
      <form onSubmit={schedule} className="card" style={{ padding: 20, display: 'grid', gap: 14, marginBottom: 28, maxWidth: 620 }}>
        <input className="form-input" placeholder="Student's User ID" value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} required />
        <input className="form-input" placeholder="Course / Program" value={form.program} onChange={(e) => setForm({ ...form, program: e.target.value })} />
        <div className="flex flex-wrap" style={{ gap: 14 }}>
          <input type="datetime-local" className="form-input" value={form.scheduledDate} onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })} required style={{ flex: '1 1 220px', minWidth: 0 }} />
          <div style={{ flex: '1 1 160px', minWidth: 0 }}>
            <CustomSelect
              value={form.mode} onChange={(v) => setForm({ ...form, mode: v })} ariaLabel="Meeting mode" minWidth="100%"
              options={[{ value: 'video', label: 'Video' }, { value: 'audio', label: 'Audio' }, { value: 'physical', label: 'Physical' }]}
            />
          </div>
        </div>
        {form.mode === 'physical'
          ? <input className="form-input" placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          : <input className="form-input" placeholder="Meeting link" value={form.meetingLink} onChange={(e) => setForm({ ...form, meetingLink: e.target.value })} />}
        <button type="submit" className="btn btn-primary" style={{ justifySelf: 'start', padding: '8px 20px' }}>Schedule Meeting</button>
      </form>
      <Table
        loading={meetings === null}
        headers={['Student', 'Program', 'Date', 'Mode', 'Link / Location', 'Status', 'Action']}
        rows={(meetings || []).map((m) => [
          m.student?.fullName, m.program || '—', new Date(m.scheduledDate).toLocaleString(), MEETING_MODE_LABEL[m.mode] || m.mode,
          m.mode === 'physical' ? (m.location || '—') : (m.meetingLink || '—'),
          <Tag status={(MEETING_STATUS[m.status] || MEETING_STATUS.scheduled).tag} label={(MEETING_STATUS[m.status] || MEETING_STATUS.scheduled).label} />,
          m.status === 'scheduled' ? (
            <div className="flex" style={{ gap: 8, flexWrap: 'wrap' }}>
              {m.mode !== 'physical' && m.meetingLink && <a className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.72rem' }} href={m.meetingLink} target="_blank" rel="noreferrer">Join</a>}
              <button className="btn" style={{ padding: '6px 12px', fontSize: '0.72rem' }} onClick={() => setStatus(m._id, 'completed')}>Mark Done</button>
              <button className="btn" style={{ padding: '6px 12px', fontSize: '0.72rem' }} onClick={() => setStatus(m._id, 'cancelled')}>Cancel</button>
            </div>
          ) : '—'
        ])}
        empty="No meetings scheduled yet."
      />
    </div>
  );
}

// Categorizes the shared /messages/conversations feed for a Representative: Students (inquired,
// not yet applied) / Applicants (have a real InstitutionApplication) / Parents-Guardians (role) /
// Institution Admin (the institution's real owner) / Other permitted staff (real staff.user entries).
function RepMessagesPanel({ onFlash, repInfo, user }) {
  const [conversations, setConversations] = useState(null);
  const [institution, setInstitution] = useState(null);
  const [inquiries, setInquiries] = useState(null);
  const [applications, setApplications] = useState(null);
  const [activeUser, setActiveUser] = useState(null);
  const [thread, setThread] = useState(null);
  const [text, setText] = useState('');

  function load() {
    apiRequest('/messages/conversations').then(setConversations).catch((err) => onFlash(err.message));
    if (repInfo) {
      apiRequest(`/institutions/${repInfo.institutionId}`).then(setInstitution).catch(() => {});
      apiRequest(`/inquiries/institution/${repInfo.institutionId}`).then(setInquiries).catch(() => setInquiries([]));
      apiRequest(`/institution-applications/institution/${repInfo.institutionId}`).then(setApplications).catch(() => setApplications([]));
    }
  }
  useEffect(load, [repInfo]); // eslint-disable-line react-hooks/exhaustive-deps

  function openThread(u) {
    setActiveUser(u);
    setThread(null);
    apiRequest(`/messages/with/${u._id}`).then(setThread).catch((err) => onFlash(err.message));
    apiRequest(`/messages/with/${u._id}/read`, { method: 'PATCH' }).then(load).catch(() => {});
  }

  async function send(e) {
    e.preventDefault();
    if (!activeUser || !text.trim()) return;
    try {
      await apiRequest('/messages', { method: 'POST', body: { to: activeUser._id, text: text.trim() } });
      setText('');
      apiRequest(`/messages/with/${activeUser._id}`).then(setThread);
      load();
    } catch (err) { onFlash(err.message); }
  }

  if (conversations === null || !institution || inquiries === null || applications === null) {
    return <p role="status" className="admin-notice">Loading...</p>;
  }

  const applicantIds = new Set(applications.map((a) => a.applicant?._id).filter(Boolean));
  const inquiryStudentIds = new Set(inquiries.map((i) => i.student?._id).filter(Boolean));
  const staffIds = new Set((institution.staff || []).map((s) => (s.user?._id || s.user || '').toString()).filter((id) => id && id !== user._id));
  const ownerId = institution.owner?._id;
  const hasRole = (u, role) => (u.roles || []).includes(role);

  const applicantMsgs = conversations.filter((c) => applicantIds.has(c.user._id));
  const studentMsgs = conversations.filter((c) => inquiryStudentIds.has(c.user._id) && !applicantIds.has(c.user._id));
  const parentMsgs = conversations.filter((c) => hasRole(c.user, 'parent'));
  const adminMsgs = conversations.filter((c) => c.user._id === ownerId);
  const staffMsgs = conversations.filter((c) => staffIds.has(c.user._id));
  const categorizedIds = new Set([...applicantMsgs, ...studentMsgs, ...parentMsgs, ...adminMsgs, ...staffMsgs].map((c) => c.user._id));
  const otherMsgs = conversations.filter((c) => !categorizedIds.has(c.user._id));

  const repMsgLabel = { fontSize: 11, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--ink-soft)' };

  function ConversationGroup({ title, items }) {
    if (items.length === 0) return null;
    return (
      <div style={{ marginBottom: 16 }}>
        <p style={repMsgLabel}>{title}</p>
        <div className="dash-list" style={{ marginTop: 10 }}>
          {items.map((c) => (
            <div key={c.user._id} className={`dash-list-item${activeUser?._id === c.user._id ? ' unread' : ''}`} style={{ cursor: 'pointer' }} onClick={() => openThread(c.user)}>
              <span className="dash-list-icon c-forest" aria-hidden><FaUser size={14} /></span>
              <div className="dash-list-body"><div className="title">{c.user.fullName}{c.unread > 0 ? ` (${c.unread})` : ''}</div><div className="desc">{c.lastMessage}</div></div>
              <span className="dash-list-time">{new Date(c.lastAt).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid g2" style={{ gap: 20, alignItems: 'start' }}>
      <div>
        <h3 className="font-semibold" style={{ marginBottom: 4 }}>Messages</h3>
        <p className="text-xs" style={{ color: 'var(--ink-soft)', marginBottom: 18 }}>To start a new conversation, ask for their User ID and use the "New Message" box on the right.</p>
        <ConversationGroup title="Applicants" items={applicantMsgs} />
        <ConversationGroup title="Students" items={studentMsgs} />
        <ConversationGroup title="Parents / Guardians" items={parentMsgs} />
        <ConversationGroup title="Institution Admin" items={adminMsgs} />
        <ConversationGroup title="Other Permitted Staff" items={staffMsgs} />
        <ConversationGroup title="Other" items={otherMsgs} />
        {conversations.length === 0 && (
          <div className="student-empty-state" style={{ border: '1px solid var(--sand-line)', borderRadius: 18 }}>
            <FaCommentDots aria-hidden="true" />
            <p>No conversations yet</p>
          </div>
        )}
      </div>
      <div className="card" style={{ padding: 20 }}>
        <h3 className="font-semibold" style={{ marginBottom: 14 }}>{activeUser ? activeUser.fullName : 'New Message'}</h3>
        {!activeUser && (
          <label style={{ display: 'block' }}>
            <span className="text-xs" style={{ display: 'block', color: 'var(--ink-soft)', fontWeight: 600, marginBottom: 6 }}>Recipient's User ID</span>
            <input className="form-input" placeholder="Paste a User ID and press Enter" onKeyDown={(e) => {
              if (e.key === 'Enter' && e.target.value.trim()) { openThread({ _id: e.target.value.trim(), fullName: 'New recipient' }); }
            }} />
          </label>
        )}
        {activeUser && (
          <>
            <div className="card reveal in" style={{ padding: '10px 14px', marginBottom: 14, maxHeight: 320, overflowY: 'auto' }}>
              {thread === null && <p role="status" className="admin-notice">Loading...</p>}
              {thread && thread.length === 0 && (
                <div className="student-empty-state" style={{ minHeight: 100, padding: '16px 0' }}>
                  <p>No messages yet</p>
                </div>
              )}
              {(thread || []).map((m, idx) => (
                <div key={m._id} style={{ padding: '10px 4px', borderBottom: idx < thread.length - 1 ? '1px solid var(--sand-line)' : 'none' }}>
                  <div style={{ fontSize: 13 }}>{m.text}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 4 }}>{new Date(m.createdAt).toLocaleString()}</div>
                </div>
              ))}
            </div>
            <form onSubmit={send} className="flex items-end" style={{ gap: 12 }}>
              <input className="form-input" placeholder="Type a message..." value={text} onChange={(e) => setText(e.target.value)} required style={{ flex: '1 1 auto', minWidth: 0 }} />
              <button type="submit" className="btn btn-primary" style={{ flexShrink: 0 }}>Send</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function RepFollowUpsPanel({ onFlash, onNavigate }) {
  const [dash, setDash] = useState(null);
  useEffect(() => { apiRequest('/institutions/mine/rep-dashboard').then(setDash).catch((err) => onFlash(err.message)); }, [onFlash]);

  if (!dash) return <p role="status" className="admin-notice">Loading...</p>;

  return (
    <div>
      <h3 className="font-semibold mb-3">Follow-ups</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="card" style={{ padding: 16, cursor: 'pointer' }} onClick={() => onNavigate?.('inquiries')}>
          <strong className="text-sm">Students Requiring Follow-up</strong>
          <p className="text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>{dash.followUps.followUpInquiries.length} inquiries flagged for follow-up</p>
          {dash.followUps.followUpInquiries.slice(0, 3).map((i) => <p key={i._id} className="text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>{i.student?.fullName} — {i.interestedProgram}</p>)}
        </div>
        <div className="card" style={{ padding: 16, cursor: 'pointer' }} onClick={() => onNavigate?.('applications')}>
          <strong className="text-sm">Missing Documents</strong>
          <p className="text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>{dash.followUps.documentsRequired.length} applications waiting on documents from applicants</p>
          {dash.followUps.documentsRequired.slice(0, 3).map((a) => <p key={a._id} className="text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>{a.applicant?.fullName} — {a.missingRequirements?.join(', ') || 'documents requested'}</p>)}
        </div>
        <div className="card" style={{ padding: 16, cursor: 'pointer' }} onClick={() => onNavigate?.('inquiries')}>
          <strong className="text-sm">Unanswered Inquiries</strong>
          <p className="text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>{dash.followUps.unansweredInquiries.length} students waiting on a first response</p>
          {dash.followUps.unansweredInquiries.slice(0, 3).map((i) => <p key={i._id} className="text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>{i.student?.fullName} — {i.interestedProgram}</p>)}
        </div>
        <div className="card" style={{ padding: 16, cursor: 'pointer' }} onClick={() => onNavigate?.('applications')}>
          <strong className="text-sm">Pending Application Actions</strong>
          <p className="text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>{dash.followUps.pendingApplicationActions.length} applications need your review</p>
          {dash.followUps.pendingApplicationActions.slice(0, 3).map((a) => <p key={a._id} className="text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>{a.applicant?.fullName} — {a.program}</p>)}
        </div>
        <div className="card" style={{ padding: 16, cursor: 'pointer' }} onClick={() => onNavigate?.('meetings')}>
          <strong className="text-sm">Meeting Reminders</strong>
          <p className="text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>{dash.followUps.meetingReminders.length} meetings within the next 48 hours</p>
          {dash.followUps.meetingReminders.slice(0, 3).map((m) => <p key={m._id} className="text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>{m.student?.fullName} — {new Date(m.scheduledDate).toLocaleString()}</p>)}
        </div>
        <div className="card" style={{ padding: 16 }}>
          <strong className="text-sm">Application Deadline</strong>
          <p className="text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>{dash.followUps.admissionDeadline ? new Date(dash.followUps.admissionDeadline).toLocaleDateString() : 'Not set by the institution yet.'}</p>
        </div>
      </div>
    </div>
  );
}

function RepInstitutionInfoPanel({ onFlash, repInfo, section }) {
  const [institution, setInstitution] = useState(undefined);
  const [courses, setCourses] = useState([]);
  const [fees, setFees] = useState([]);
  const [scholarships, setScholarships] = useState([]);
  const [campuses, setCampuses] = useState([]);

  useEffect(() => {
    if (!repInfo) return;
    apiRequest(`/institutions/${repInfo.institutionId}`).then(setInstitution).catch(() => setInstitution(null));
    if (section === 'programs') apiRequest(`/courses?institution=${repInfo.institutionId}`).then(setCourses).catch(() => {});
    if (section === 'admissions') {
      apiRequest(`/institutions/${repInfo.institutionId}/fees`).then(setFees).catch(() => {});
      apiRequest(`/institutions/${repInfo.institutionId}/campuses`).then(setCampuses).catch(() => {});
    }
    if (section === 'scholarships') apiRequest('/scholarships').then(setScholarships).catch(() => {});
  }, [repInfo, section]);

  if (institution === undefined) return <p role="status" className="admin-notice">Loading...</p>;
  if (!institution) return <p className="admin-notice">Institution not found.</p>;

  const infoLabel = { fontSize: 11, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--ink-soft)' };

  return (
    <div>
      <div className="flex items-start" style={{ gap: 12, padding: 16, borderRadius: 14, background: 'var(--sand)', marginBottom: 20 }}>
        <span style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--paper-raised)', color: 'var(--forest)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
          <FaShieldHalved aria-hidden="true" size={14} />
        </span>
        <p className="text-xs" style={{ color: 'var(--ink-soft)', lineHeight: 1.6 }}>Read-only — you're viewing your institution's approved information. Only the owner can change official details (fees, programs).</p>
      </div>

      {section === 'programs' && (
        <>
          <h3 className="font-semibold" style={{ marginBottom: 14 }}>Programs & Courses</h3>
          <Table headers={['Title', 'Subject', 'Teacher']} rows={courses.map((c) => [c.title, c.subject || '—', c.teacher?.fullName || '—'])} empty="No published programs yet." />
        </>
      )}
      {section === 'admissions' && (
        <>
          <h3 className="font-semibold" style={{ marginBottom: 14 }}>Admissions Information</h3>
          <div className="card" style={{ padding: 20, marginBottom: 16 }}>
            <p className="text-sm">{institution.description || 'No description set yet.'}</p>
            <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 10 }}>{institution.address || institution.city}, {institution.country}</p>
            <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 4 }}>{institution.contactEmail} {institution.contactPhone ? `· ${institution.contactPhone}` : ''}</p>
          </div>

          <div className="card" style={{ padding: 20, marginBottom: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18 }}>
            <div>
              <p style={infoLabel}>Admission Requirements</p>
              <p className="text-sm" style={{ color: 'var(--ink-soft)', marginTop: 8 }}>{institution.admissionRequirements || 'Not published yet.'}</p>
            </div>
            <div>
              <p style={infoLabel}>Admission Deadline</p>
              <p className="text-sm" style={{ color: 'var(--ink-soft)', marginTop: 8 }}>{institution.admissionDeadline ? new Date(institution.admissionDeadline).toLocaleDateString() : 'Not set.'}</p>
            </div>
          </div>

          <h4 className="font-semibold" style={{ marginBottom: 12 }}>Fee Structure</h4>
          <div style={{ marginBottom: 20 }}>
            <Table headers={['Title', 'Amount', 'Due']} rows={fees.map((f) => [f.title, `${f.currency} ${f.amount}`, f.dueDate ? new Date(f.dueDate).toLocaleDateString() : '—'])} empty="No fee records published yet." />
          </div>
          <h4 className="font-semibold" style={{ marginBottom: 12 }}>Campus Information</h4>
          <Table headers={['Campus', 'Address']} rows={campuses.map((c) => [c.name, c.address || '—'])} empty="No campuses published yet." />
        </>
      )}
      {section === 'scholarships' && (
        <>
          <h3 className="font-semibold" style={{ marginBottom: 4 }}>Scholarships</h3>
          <p className="text-xs" style={{ color: 'var(--ink-soft)', marginBottom: 14 }}>This platform's scholarships aren't tied to a specific institution — these are open, platform-wide scholarships you can point students to.</p>
          <Table headers={['Title', 'Amount', 'Deadline']} rows={scholarships.map((s) => [s.title, `${s.currency} ${s.amount}`, s.applicationDeadline ? new Date(s.applicationDeadline).toLocaleDateString() : '—'])} empty="No open scholarships right now." />
        </>
      )}
    </div>
  );
}

function RepVirtualFairPanel({ onFlash, repInfo }) {
  const [fairs, setFairs] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', scheduledDate: '', videoCallLink: '', brochureUrl: '' });
  const [meetingDraft, setMeetingDraft] = useState({}); // keyed by `${fairId}:${studentId}` -> datetime-local value

  function load() {
    if (!repInfo) return;
    apiRequest(`/virtual-fairs/institution/${repInfo.institutionId}`).then(setFairs).catch((err) => onFlash(err.message));
  }
  useEffect(load, [repInfo]); // eslint-disable-line react-hooks/exhaustive-deps

  async function create(e) {
    e.preventDefault();
    try {
      await apiRequest('/virtual-fairs', { method: 'POST', body: { ...form, institution: repInfo.institutionId } });
      onFlash('Virtual fair created.', 'success');
      setForm({ title: '', description: '', scheduledDate: '', videoCallLink: '', brochureUrl: '' });
      load();
    } catch (err) { onFlash(err.message); }
  }

  async function scheduleMeeting(fair, student) {
    const key = `${fair._id}:${student._id}`;
    const scheduledDate = meetingDraft[key];
    if (!scheduledDate) return onFlash('Pick a date/time first.');
    try {
      await apiRequest('/meetings', {
        method: 'POST',
        body: { institution: repInfo.institutionId, student: student._id, program: fair.title, scheduledDate, mode: 'video', meetingLink: fair.videoCallLink || '' }
      });
      onFlash(`Meeting scheduled with ${student.fullName}.`, 'success');
      setMeetingDraft({ ...meetingDraft, [key]: '' });
    } catch (err) { onFlash(err.message); }
  }

  return (
    <div>
      <h3 className="font-semibold" style={{ marginBottom: 14 }}>Virtual Career/Education Fair</h3>
      <form onSubmit={create} className="card" style={{ padding: 20, display: 'grid', gap: 14, marginBottom: 28, maxWidth: 640 }}>
        <input className="form-input" placeholder="Fair title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <textarea className="form-input" placeholder="Description" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <div className="flex flex-wrap" style={{ gap: 14 }}>
          <input type="datetime-local" className="form-input" value={form.scheduledDate} onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })} required style={{ flex: '1 1 220px', minWidth: 0 }} />
        </div>
        <input className="form-input" placeholder="Video call link (Zoom/Meet/Teams)" value={form.videoCallLink} onChange={(e) => setForm({ ...form, videoCallLink: e.target.value })} />
        <input className="form-input" placeholder="Brochure link (optional)" value={form.brochureUrl} onChange={(e) => setForm({ ...form, brochureUrl: e.target.value })} />
        <button type="submit" className="btn btn-primary" style={{ justifySelf: 'start', padding: '8px 20px' }}>Create Fair Booth</button>
      </form>

      {fairs && fairs.length === 0 && (
        <div className="student-empty-state" style={{ border: '1px solid var(--sand-line)', borderRadius: 18 }}>
          <FaCalendarCheck aria-hidden="true" />
          <p>No fairs created yet</p>
        </div>
      )}

      <div style={{ display: 'grid', gap: 14 }}>
        {(fairs || []).map((f) => (
          <div key={f._id} className="card" style={{ padding: 20 }}>
            <div className="flex items-start" style={{ gap: 14 }}>
              <span style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--sand)', color: 'var(--forest)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <FaCalendarCheck aria-hidden="true" size={16} />
              </span>
              <div style={{ minWidth: 0, flex: 1 }}>
                <strong className="text-sm">{f.title}</strong>
                <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 4 }}>{new Date(f.scheduledDate).toLocaleString()} · {f.registeredStudents.length} students registered</p>
                {f.description && <p className="text-sm" style={{ marginTop: 8 }}>{f.description}</p>}
                <div className="flex flex-wrap" style={{ gap: 10, marginTop: 12 }}>
                  {f.videoCallLink && <a className="btn btn-primary" style={{ padding: '7px 16px', fontSize: '0.78rem' }} href={f.videoCallLink} target="_blank" rel="noreferrer">Start Video Call</a>}
                  {f.brochureUrl && <a className="btn" style={{ padding: '7px 16px', fontSize: '0.78rem' }} href={f.brochureUrl} target="_blank" rel="noreferrer">📄 Brochure</a>}
                </div>
              </div>
            </div>
            {f.registeredStudents.length > 0 && (
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--sand-line)' }}>
                <p className="text-xs" style={{ fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--ink-soft)', marginBottom: 10 }}>Registered Students — Schedule a Meeting</p>
                <div style={{ display: 'grid', gap: 8 }}>
                  {f.registeredStudents.map((s) => {
                    const key = `${f._id}:${s._id}`;
                    return (
                      <div key={s._id} className="flex items-center flex-wrap" style={{ gap: 10, padding: 10, borderRadius: 14, background: 'var(--sand)' }}>
                        <span className="text-xs" style={{ minWidth: 140, fontWeight: 600 }}>{s.fullName}</span>
                        <input type="datetime-local" className="form-input" style={{ maxWidth: 200, background: 'var(--paper-raised)' }} value={meetingDraft[key] || ''} onChange={(e) => setMeetingDraft({ ...meetingDraft, [key]: e.target.value })} />
                        <button type="button" className="btn" style={{ padding: '6px 12px', fontSize: '0.72rem', background: 'var(--paper-raised)' }} onClick={() => scheduleMeeting(f, s)}>Schedule Meeting</button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function RepDocumentsPanel({ onFlash, repInfo }) {
  const [rows, setRows] = useState(null);

  useEffect(() => {
    if (!repInfo) return;
    apiRequest(`/institution-applications/institution/${repInfo.institutionId}`).then((apps) => {
      const docs = apps.flatMap((a) => (a.documents || []).map((d) => ({ student: a.applicant?.fullName, program: a.program, name: d.name, url: d.url, status: d.status })));
      setRows(docs);
    }).catch((err) => onFlash(err.message));
  }, [repInfo, onFlash]);

  return (
    <div>
      <h3 className="font-semibold mb-2">Documents / Resources</h3>
      <p className="text-xs mb-3" style={{ color: 'var(--ink-soft)' }}>Every document applicants have submitted with their applications.</p>
      <Table
        loading={rows === null}
        headers={['Student', 'Program', 'Document', 'Status']}
        rows={(rows || []).map((d) => [d.student, d.program, <a href={d.url} target="_blank" rel="noreferrer">{d.name}</a>, <Tag status={d.status === 'approved' ? 'approved' : d.status === 'rejected' ? 'rejected' : 'pending'} />])}
        empty="No documents submitted yet."
      />
    </div>
  );
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

  async function markPaid(id, paymentMethod) {
    try {
      await apiRequest(`/institutions/payroll/${id}/pay`, { method: 'PATCH', body: { paymentMethod } });
      onFlash('Payslip marked as paid.', 'success');
      load();
    } catch (err) { onFlash(err.message); }
  }
  const PAYSLIP_METHODS = [
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'mobile_wallet', label: 'Mobile Wallet' },
    { value: 'cash', label: 'Cash' },
    { value: 'other', label: 'Other' }
  ];

  if (institution === undefined) return <p role="status" className="admin-notice">Loading...</p>;
  if (!institution) return <p className="admin-notice">Register an institution first (My Institution tab).</p>;

  return (
    <div>
      <h3 className="font-semibold mb-2">Payroll</h3>
      <form onSubmit={generate} className="flex gap-2 items-end mb-4 flex-wrap">
        <input className="form-input" placeholder="Staff User ID" required value={form.staffId} onChange={(e) => setForm({ ...form, staffId: e.target.value })} style={{ minWidth: 0 }} />
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
          p.status === 'pending'
            ? <PayMethodModalButton onSubmit={(method) => markPaid(p._id, method)} label="Mark Paid" methods={PAYSLIP_METHODS} confirmLabel="Confirm" />
            : (p.transactionId ? <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>Receipt {p.transactionId}</span> : '—')
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
  const [sections, setSections] = useState([]);
  const [edits, setEdits] = useState({});

  function load() {
    if (institution) {
      apiRequest(`/institutions/${institution._id}/students`).then(setStudents).catch((err) => onFlash(err.message));
      apiRequest(`/institutions/${institution._id}/class-sections`).then(setSections).catch(() => {});
    }
  }
  useEffect(load, [institution]);

  async function changeStatus(profileId, status) {
    try {
      await apiRequest(`/institutions/students/${profileId}/status`, { method: 'PATCH', body: { status } });
      onFlash('Student status updated.', 'success');
      load();
    } catch (err) { onFlash(err.message); }
  }

  async function assignClass(profileId) {
    const e = edits[profileId] || {};
    try {
      await apiRequest(`/institutions/students/${profileId}/status`, { method: 'PATCH', body: { classSection: e.classSection ?? undefined, rollNumber: e.rollNumber ?? undefined } });
      onFlash('Class / roll number updated.', 'success');
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
        rows={(students || []).map((s) => {
          const edit = edits[s._id] || { classSection: s.classSection?._id || '', rollNumber: s.rollNumber || '' };
          return [
            s.user?.fullName, s.user?.email, s.rollNumber || '—', s.classSection?.name || '—',
            <Tag status={s.status === 'active' ? 'approved' : s.status === 'suspended' ? 'rejected' : 'pending'} />,
            <div className="flex gap-2 items-center flex-wrap">
              <select className="form-input" value={s.status} onChange={(e) => changeStatus(s._id, e.target.value)} style={{ padding: '4px 8px', fontSize: '0.78rem' }}>
                {['active', 'suspended', 'graduated', 'transferred'].map((st) => <option key={st} value={st}>{st}</option>)}
              </select>
              <select className="form-input" value={edit.classSection} onChange={(e) => setEdits({ ...edits, [s._id]: { ...edit, classSection: e.target.value } })} style={{ padding: '4px 8px', fontSize: '0.78rem' }}>
                <option value="">No class</option>
                {sections.map((sec) => <option key={sec._id} value={sec._id}>{sec.name}</option>)}
              </select>
              <input className="form-input" placeholder="Roll No." value={edit.rollNumber} onChange={(e) => setEdits({ ...edits, [s._id]: { ...edit, rollNumber: e.target.value } })} style={{ padding: '4px 8px', fontSize: '0.78rem', width: 90 }} />
              <button type="button" className="btn" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={() => assignClass(s._id)}>Save</button>
            </div>
          ];
        })}
        empty="No students linked to this institution yet."
      />
    </div>
  );
}

function InstitutionAttendancePanel({ onFlash }) {
  const institution = useMyInstitution(onFlash);
  const [data, setData] = useState(null);
  const [staffAttendance, setStaffAttendance] = useState(null);

  useEffect(() => {
    if (!institution) return;
    apiRequest(`/institutions/${institution._id}/attendance`).then(setData).catch((err) => onFlash(err.message));
    apiRequest(`/institutions/${institution._id}/staff-attendance`).then(setStaffAttendance).catch((err) => onFlash(err.message));
  }, [institution, onFlash]);

  if (institution === undefined || (institution && data === null)) return <p role="status" className="admin-notice">Loading...</p>;
  if (!institution) return <p className="admin-notice">Register an institution first (My Institution tab).</p>;

  const s = data.summary;
  return (
    <div>
      <h3 className="font-semibold mb-2">Student Attendance</h3>
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

      <h3 className="font-semibold mb-2" style={{ marginTop: 32 }}>Staff Attendance</h3>
      <p className="text-xs mb-3" style={{ color: 'var(--ink-soft)' }}>Real self-check-ins from teachers/staff (each checks in themselves, once per day) — not biometric/GPS, which this app has no device access to.</p>
      <Table
        headers={['Staff', 'Date', 'Checked In At', 'Status']}
        rows={(staffAttendance || []).map((r) => [
          r.staff?.fullName || '—',
          new Date(r.date).toLocaleDateString(),
          new Date(r.checkInAt).toLocaleTimeString(),
          <Tag status={r.status === 'present' ? 'approved' : 'pending'} label={r.status === 'present' ? 'Present' : 'Late'} />
        ])}
        empty="No staff check-ins yet."
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
        <input className="form-input" placeholder="Certificate title (e.g. Certificate of Completion)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required style={{ minWidth: 0 }} />
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

const FEE_TYPES = ['tuition', 'admission', 'exam', 'hostel', 'transport', 'library', 'activity', 'other'];

function InstitutionFeesPanel({ onFlash }) {
  const [institution, setInstitution] = useState(null);
  const [fees, setFees] = useState([]);
  const [form, setForm] = useState({ studentId: '', title: '', feeType: 'tuition', amount: '', dueDate: '', installments: 1 });

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
        body: { student: form.studentId.trim(), title: form.title, feeType: form.feeType, amount: Number(form.amount), dueDate: form.dueDate || null, installments: Number(form.installments) || 1 }
      });
      onFlash('Fee recorded.', 'success');
      setForm({ studentId: '', title: '', feeType: 'tuition', amount: '', dueDate: '', installments: 1 });
      load();
    } catch (err) { onFlash(err.message); }
  }

  const [payVia, setPayVia] = useState({});

  async function markPaid(feeId) {
    try {
      await apiRequest(`/institutions/fees/${feeId}/pay`, { method: 'PATCH', body: { paidVia: payVia[feeId] || 'Cash' } });
      onFlash('Fee marked as paid.', 'success');
      load();
    } catch (err) { onFlash(err.message); }
  }

  async function releaseEscrow(feeId) {
    try {
      await apiRequest(`/institutions/fees/${feeId}/release`, { method: 'PATCH' });
      onFlash('Escrow released.', 'success');
      load();
    } catch (err) { onFlash(err.message); }
  }

  async function remind(feeId) {
    try {
      await apiRequest(`/institutions/fees/${feeId}/remind`, { method: 'POST' });
      onFlash('Reminder sent.', 'success');
      load();
    } catch (err) { onFlash(err.message); }
  }

  async function decideRefund(feeId, decision) {
    try {
      await apiRequest(`/institutions/fees/${feeId}/refund/decide`, { method: 'PATCH', body: { decision } });
      onFlash(`Refund ${decision}.`, 'success');
      load();
    } catch (err) { onFlash(err.message); }
  }

  if (!institution) return <p className="admin-notice">Register an institution first (My Institution tab).</p>;

  return (
    <div>
      <form onSubmit={createFee} className="flex gap-3 items-end mb-3 flex-wrap">
        <input className="form-input" placeholder="Student's User ID" value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} required />
        <input className="form-input" placeholder="Title (e.g. Tuition Fee - Term 1)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <select className="form-select" value={form.feeType} onChange={(e) => setForm({ ...form, feeType: e.target.value })}>
          {FEE_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
        </select>
        <input className="form-input" type="number" placeholder="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required style={{ maxWidth: 120 }} />
        <input className="form-input" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
        <input className="form-input" type="number" min="1" max="12" placeholder="Instalments" value={form.installments} onChange={(e) => setForm({ ...form, installments: e.target.value })} style={{ maxWidth: 100 }} title="Split into N monthly instalments" />
        <button type="submit" className="btn btn-primary">Add Fee</button>
      </form>
      <p style={{ fontSize: 12, color: 'var(--ink-soft)', marginBottom: 16 }}>
        Ask the student for their account's User ID from their Profile tab. Online payment isn't wired up yet — mark a fee "Paid" once you've received payment through any other method (bank transfer, cash, external link). Leave Instalments at 1 for a single payment.
      </p>
      <Table
        headers={['Student', 'Title', 'Amount', 'Receipt', 'Due', 'Status', 'Escrow', 'Refund', 'Action']}
        rows={fees.map((f) => [
          f.student?.fullName, f.installment?.totalInstallments ? `${f.title} (${f.installment.number}/${f.installment.totalInstallments})` : f.title, `${f.currency} ${f.amount}`,
          f.receiptNumber || '—',
          f.dueDate ? new Date(f.dueDate).toLocaleDateString() : '—',
          <Tag status={f.status === 'paid' ? 'approved' : f.status === 'refunded' ? 'rejected' : 'pending'} label={f.status} />,
          f.status === 'paid' ? <Tag status={f.escrowStatus === 'released' ? 'approved' : 'pending'} label={f.escrowStatus === 'released' ? 'Released' : 'Held'} /> : '—',
          f.refund?.status && f.refund.status !== 'none' ? (
            f.refund.status === 'requested' ? (
              <div className="flex gap-1">
                <button className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '0.72rem' }} onClick={() => decideRefund(f._id, 'approved')}>Approve</button>
                <button className="btn" style={{ padding: '4px 8px', fontSize: '0.72rem' }} onClick={() => decideRefund(f._id, 'rejected')}>Reject</button>
              </div>
            ) : f.refund.status === 'approved' ? (
              <button className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '0.72rem' }} onClick={() => decideRefund(f._id, 'refunded')}>Mark Refunded</button>
            ) : <Tag status={f.refund.status === 'refunded' ? 'approved' : 'rejected'} label={f.refund.status} />
          ) : '—',
          f.status !== 'paid' ? (
            <div className="flex gap-2 items-center">
              <select className="form-select" style={{ padding: '4px 8px', fontSize: '0.75rem' }} value={payVia[f._id] || 'Cash'} onChange={(e) => setPayVia({ ...payVia, [f._id]: e.target.value })}>
                {['Cash', 'Bank Transfer', 'External Link'].map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
              <button className="btn btn-primary" style={{ padding: '5px 12px', fontSize: '0.78rem' }} onClick={() => markPaid(f._id)}>Mark Paid</button>
              <button className="btn" style={{ padding: '5px 12px', fontSize: '0.78rem' }} onClick={() => remind(f._id)}>Remind</button>
            </div>
          ) : f.escrowStatus === 'held' ? (
            <button className="btn btn-primary" style={{ padding: '5px 12px', fontSize: '0.78rem' }} onClick={() => releaseEscrow(f._id)}>Release Funds</button>
          ) : (f.paidVia || '—')
        ])}
        empty="No fee records yet."
      />
    </div>
  );
}

function InstitutionBroadcastPanel({ onFlash }) {
  const [institution, setInstitution] = useState(null);
  const [form, setForm] = useState({ audience: 'all', title: '', body: '', channels: [] });
  const [commsStatus, setCommsStatus] = useState(null);
  const [twilioForm, setTwilioForm] = useState({ accountSid: '', authToken: '', smsFromNumber: '', whatsappFromNumber: '' });

  function load() {
    apiRequest('/institutions/mine/list').then((list) => {
      const inst = list[0] || null;
      setInstitution(inst);
      if (inst) apiRequest(`/institutions/${inst._id}/comms-credential`).then(setCommsStatus).catch(() => {});
    }).catch((err) => onFlash(err.message));
  }
  useEffect(load, []);

  async function send(e) {
    e.preventDefault();
    try {
      const res = await apiRequest(`/institutions/${institution._id}/notifications/broadcast`, { method: 'POST', body: form });
      onFlash(`Notification sent to ${res.sentTo} recipient(s).`, 'success');
      setForm({ audience: 'all', title: '', body: '', channels: [] });
    } catch (err) { onFlash(err.message); }
  }

  function toggleChannel(ch) {
    setForm((f) => ({ ...f, channels: f.channels.includes(ch) ? f.channels.filter((c) => c !== ch) : [...f.channels, ch] }));
  }

  async function connectTwilio(e) {
    e.preventDefault();
    try {
      await apiRequest(`/institutions/${institution._id}/comms-credential`, { method: 'POST', body: twilioForm });
      onFlash('Twilio connected — SMS/WhatsApp are now live.', 'success');
      setTwilioForm({ accountSid: '', authToken: '', smsFromNumber: '', whatsappFromNumber: '' });
      load();
    } catch (err) { onFlash(err.message); }
  }

  async function disconnectTwilio() {
    try {
      await apiRequest(`/institutions/${institution._id}/comms-credential`, { method: 'DELETE' });
      onFlash('Twilio disconnected.', 'success');
      load();
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
        <div className="flex gap-4 items-center" style={{ fontSize: 13 }}>
          <label className="flex items-center gap-1"><input type="checkbox" checked={form.channels.includes('sms')} onChange={() => toggleChannel('sms')} disabled={!commsStatus?.configured || !commsStatus?.smsFromNumber} /> SMS</label>
          <label className="flex items-center gap-1"><input type="checkbox" checked={form.channels.includes('whatsapp')} onChange={() => toggleChannel('whatsapp')} disabled={!commsStatus?.configured || !commsStatus?.whatsappFromNumber} /> WhatsApp</label>
          {!commsStatus?.configured && <span style={{ color: 'var(--ink-soft)' }}>Connect Twilio below to enable SMS/WhatsApp.</span>}
        </div>
        <button type="submit" className="btn btn-primary">Send Notification</button>
      </form>

      <div className="admin-section" style={{ marginTop: 24 }}>
        <div className="admin-section-heading"><div><h2>SMS / WhatsApp (Twilio)</h2><p>Bring your own Twilio account — CareerZ never resells messaging.</p></div></div>
        {commsStatus?.configured ? (
          <div>
            <p className="text-sm">Connected. SMS from: <strong>{commsStatus.smsFromNumber || '—'}</strong> · WhatsApp from: <strong>{commsStatus.whatsappFromNumber || '—'}</strong></p>
            <button className="btn" style={{ marginTop: 8 }} onClick={disconnectTwilio}>Disconnect</button>
          </div>
        ) : (
          <form onSubmit={connectTwilio} className="space-y-3 max-w-md">
            <input className="form-input" placeholder="Twilio Account SID" value={twilioForm.accountSid} onChange={(e) => setTwilioForm({ ...twilioForm, accountSid: e.target.value })} required />
            <input className="form-input" type="password" placeholder="Twilio Auth Token" value={twilioForm.authToken} onChange={(e) => setTwilioForm({ ...twilioForm, authToken: e.target.value })} required />
            <input className="form-input" placeholder="SMS From Number (e.g. +15551234567)" value={twilioForm.smsFromNumber} onChange={(e) => setTwilioForm({ ...twilioForm, smsFromNumber: e.target.value })} />
            <input className="form-input" placeholder="WhatsApp From Number (e.g. whatsapp:+14155238886)" value={twilioForm.whatsappFromNumber} onChange={(e) => setTwilioForm({ ...twilioForm, whatsappFromNumber: e.target.value })} />
            <button type="submit" className="btn btn-primary">Connect Twilio</button>
          </form>
        )}
      </div>
    </div>
  );
}

const BUILDING_TYPES = ['academic', 'library', 'lab', 'hostel', 'sports', 'admin', 'cafeteria', 'auditorium', 'other'];
const EMPTY_BUILDING_FORM = { name: '', type: 'academic', color: '#4b7bec', positionX: 0, positionZ: 0, width: 4, depth: 4, floors: 1, description: '', photo: null };

function InstitutionCampusTourPanel({ onFlash }) {
  const institution = useMyInstitution(onFlash);
  const [buildings, setBuildings] = useState(null);
  const [form, setForm] = useState(EMPTY_BUILDING_FORM);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  function load(instId) {
    apiRequest(`/institutions/${instId}/campus-buildings`).then(setBuildings).catch((err) => onFlash(err.message));
  }
  useEffect(() => { if (institution) load(institution._id); }, [institution]);

  async function onPhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await resizeImageToDataUrl(file, 800, 0.78);
      setForm((f) => ({ ...f, photo: dataUrl }));
    } catch (err) { onFlash(err.message); }
  }

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await apiRequest(`/institutions/${institution._id}/campus-buildings/${editingId}`, { method: 'PATCH', body: form });
        onFlash('Building updated.', 'success');
      } else {
        await apiRequest(`/institutions/${institution._id}/campus-buildings`, { method: 'POST', body: form });
        onFlash('Building added.', 'success');
      }
      setForm(EMPTY_BUILDING_FORM);
      setEditingId(null);
      load(institution._id);
    } catch (err) { onFlash(err.message); } finally { setSaving(false); }
  }

  function editBuilding(b) {
    setEditingId(b._id);
    setForm({ name: b.name, type: b.type, color: b.color, positionX: b.positionX, positionZ: b.positionZ, width: b.width, depth: b.depth, floors: b.floors, description: b.description, photo: b.photo });
  }

  async function removeBuilding(id) {
    try {
      await apiRequest(`/institutions/${institution._id}/campus-buildings/${id}`, { method: 'DELETE' });
      onFlash('Building removed.', 'success');
      load(institution._id);
    } catch (err) { onFlash(err.message); }
  }

  if (institution === undefined) return <p role="status" className="admin-notice">Loading...</p>;
  if (!institution) return <p className="admin-notice">Register an institution first (My Institution tab).</p>;

  return (
    <div>
      <h3 className="font-semibold mb-2">Virtual Campus Tour</h3>
      <p className="text-xs mb-4" style={{ color: 'var(--ink-soft)' }}>
        A real, interactive 3D map built from your own buildings — no photography or 3D modeling skill needed.
        Place each building on the grid below; students and parents can then rotate, zoom and click through it from home.
      </p>

      {buildings && buildings.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <CampusTourViewer buildings={buildings} />
        </div>
      )}

      <form onSubmit={submit} className="card" style={{ padding: 20, marginBottom: 24 }}>
        <h4 className="font-semibold mb-3" style={{ fontSize: '0.9rem' }}>{editingId ? 'Edit Building' : 'Add a Building'}</h4>
        <div className="flex gap-3 flex-wrap mb-3">
          <input className="form-input" placeholder="Building name (e.g. Main Library)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required style={{ minWidth: 220 }} />
          <CustomSelect value={form.type} onChange={(v) => setForm({ ...form, type: v })} ariaLabel="Building type" minWidth={150} options={BUILDING_TYPES.map((t) => ({ value: t, label: t[0].toUpperCase() + t.slice(1) }))} />
          <label className="text-xs" style={{ color: 'var(--ink-soft)', display: 'flex', alignItems: 'center', gap: 6 }}>
            Color <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} style={{ width: 40, height: 34, border: 'none', background: 'none' }} />
          </label>
        </div>
        <div className="flex gap-3 flex-wrap mb-3">
          <label className="text-xs" style={{ color: 'var(--ink-soft)' }}>Position X
            <input type="number" className="form-input" value={form.positionX} onChange={(e) => setForm({ ...form, positionX: Number(e.target.value) })} style={{ marginTop: 4, width: 90 }} />
          </label>
          <label className="text-xs" style={{ color: 'var(--ink-soft)' }}>Position Z
            <input type="number" className="form-input" value={form.positionZ} onChange={(e) => setForm({ ...form, positionZ: Number(e.target.value) })} style={{ marginTop: 4, width: 90 }} />
          </label>
          <label className="text-xs" style={{ color: 'var(--ink-soft)' }}>Width
            <input type="number" min="1" className="form-input" value={form.width} onChange={(e) => setForm({ ...form, width: Number(e.target.value) })} style={{ marginTop: 4, width: 80 }} />
          </label>
          <label className="text-xs" style={{ color: 'var(--ink-soft)' }}>Depth
            <input type="number" min="1" className="form-input" value={form.depth} onChange={(e) => setForm({ ...form, depth: Number(e.target.value) })} style={{ marginTop: 4, width: 80 }} />
          </label>
          <label className="text-xs" style={{ color: 'var(--ink-soft)' }}>Floors
            <input type="number" min="1" className="form-input" value={form.floors} onChange={(e) => setForm({ ...form, floors: Number(e.target.value) })} style={{ marginTop: 4, width: 80 }} />
          </label>
        </div>
        <textarea className="form-input" placeholder="Description (what's inside this building)" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ marginBottom: 12 }} />
        <div className="flex items-center gap-3 flex-wrap mb-3">
          <input type="file" accept="image/*" onChange={onPhoto} />
          {form.photo && <img src={form.photo} alt="" style={{ height: 44, borderRadius: 6 }} />}
        </div>
        <div className="flex gap-3">
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add Building'}</button>
          {editingId && <button type="button" className="btn" onClick={() => { setEditingId(null); setForm(EMPTY_BUILDING_FORM); }}>Cancel</button>}
        </div>
      </form>

      <h4 className="font-semibold mb-2" style={{ fontSize: '0.9rem' }}>Buildings ({buildings?.length || 0})</h4>
      <Table
        headers={['Name', 'Type', 'Floors', 'Position', 'Action']}
        rows={(buildings || []).map((b) => [
          b.name, b.type, b.floors, `${b.positionX}, ${b.positionZ}`,
          <div className="flex gap-2">
            <button type="button" className="btn" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => editBuilding(b)}>Edit</button>
            <button type="button" className="btn" style={{ padding: '4px 10px', fontSize: '0.75rem', color: 'var(--rose)' }} onClick={() => removeBuilding(b._id)}>Remove</button>
          </div>
        ])}
        empty="No buildings added yet — add your first one above."
      />
    </div>
  );
}

// ==================== Admission Management (spec 15D.3) ====================

function InstitutionAdmissionsPanel({ onFlash }) {
  const institution = useMyInstitution(onFlash);
  const [apps, setApps] = useState(null);
  const [form, setForm] = useState({ applicantName: '', applicantEmail: '', program: '' });

  function load(instId) {
    apiRequest(`/institution-applications/institution/${instId}`).then(setApps).catch((err) => onFlash(err.message));
  }
  useEffect(() => { if (institution) load(institution._id); }, [institution]);

  async function addOffline(e) {
    e.preventDefault();
    try {
      await apiRequest('/institution-applications/offline', { method: 'POST', body: { institution: institution._id, ...form } });
      onFlash('Offline admission entry added.', 'success');
      setForm({ applicantName: '', applicantEmail: '', program: '' });
      load(institution._id);
    } catch (err) { onFlash(err.message); }
  }

  async function setStatus(id, status) {
    try {
      await apiRequest(`/institution-applications/${id}`, { method: 'PATCH', body: { status } });
      onFlash(`Application marked ${status.replace('_', ' ')}.`, 'success');
      load(institution._id);
    } catch (err) { onFlash(err.message); }
  }

  async function accept(id) {
    try {
      await apiRequest(`/institution-applications/${id}/accept`, { method: 'POST' });
      onFlash('Applicant accepted — admission letter and Student ID generated.', 'success');
      load(institution._id);
    } catch (err) { onFlash(err.message); }
  }

  async function scheduleTest(id, scheduledAt, subject) {
    try {
      await apiRequest(`/institution-applications/${id}/test`, { method: 'PATCH', body: { scheduledAt, subject } });
      onFlash('Admission test scheduled.', 'success');
      load(institution._id);
    } catch (err) { onFlash(err.message); }
  }

  async function scheduleInterview(id, scheduledAt, mode) {
    try {
      await apiRequest(`/institution-applications/${id}/interview`, { method: 'PATCH', body: { scheduledAt, mode } });
      onFlash('Interview scheduled.', 'success');
      load(institution._id);
    } catch (err) { onFlash(err.message); }
  }

  if (institution === undefined) return <p role="status" className="admin-notice">Loading...</p>;
  if (!institution) return <p className="admin-notice">Register an institution first (My Institution tab).</p>;

  return (
    <div>
      <div className="admin-section">
        <div className="admin-section-heading"><div><h2>Offline Admission Entry</h2><p>Register a walk-in applicant who doesn't have an account yet.</p></div></div>
        <form onSubmit={addOffline} className="flex gap-3 items-end mb-3 flex-wrap">
          <input className="form-input" placeholder="Applicant name" value={form.applicantName} onChange={(e) => setForm({ ...form, applicantName: e.target.value })} required />
          <input className="form-input" type="email" placeholder="Applicant email" value={form.applicantEmail} onChange={(e) => setForm({ ...form, applicantEmail: e.target.value })} required />
          <input className="form-input" placeholder="Program / Grade applying for" value={form.program} onChange={(e) => setForm({ ...form, program: e.target.value })} required />
          <button type="submit" className="btn btn-primary">Add Entry</button>
        </form>
      </div>

      <Table
        headers={['Applicant', 'Program', 'Source', 'Test', 'Interview', 'Status', 'Actions']}
        rows={(apps || []).map((a) => [
          a.applicant?.fullName, a.program, a.source === 'front_desk' ? 'Offline' : 'Online',
          a.admissionTest?.scheduledAt ? new Date(a.admissionTest.scheduledAt).toLocaleDateString() + (a.admissionTest.score != null ? ` (${a.admissionTest.score}/${a.admissionTest.maxScore})` : '') : (
            <button className="btn" style={{ padding: '4px 8px', fontSize: '0.72rem' }} onClick={() => { const d = prompt('Test date/time (YYYY-MM-DD HH:MM)'); if (d) scheduleTest(a._id, new Date(d).toISOString(), prompt('Subject') || ''); }}>Schedule Test</button>
          ),
          a.interview?.scheduledAt ? new Date(a.interview.scheduledAt).toLocaleDateString() : (
            <button className="btn" style={{ padding: '4px 8px', fontSize: '0.72rem' }} onClick={() => { const d = prompt('Interview date/time (YYYY-MM-DD HH:MM)'); if (d) scheduleInterview(a._id, new Date(d).toISOString(), 'video'); }}>Schedule Interview</button>
          ),
          <Tag status={a.status === 'accepted' ? 'approved' : a.status === 'rejected' ? 'rejected' : 'pending'} label={a.status.replace('_', ' ')} />,
          ['accepted', 'rejected'].includes(a.status) ? '—' : (
            <div className="flex gap-1 flex-wrap">
              <button className="btn" style={{ padding: '4px 8px', fontSize: '0.72rem' }} onClick={() => setStatus(a._id, 'under_review')}>Review</button>
              <button className="btn" style={{ padding: '4px 8px', fontSize: '0.72rem' }} onClick={() => setStatus(a._id, 'waitlisted')}>Waitlist</button>
              <button className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '0.72rem' }} onClick={() => accept(a._id)}>Accept</button>
              <button className="btn" style={{ padding: '4px 8px', fontSize: '0.72rem', color: 'var(--rose)' }} onClick={() => setStatus(a._id, 'rejected')}>Reject</button>
            </div>
          )
        ])}
        empty="No admission applications yet."
      />
    </div>
  );
}

// ==================== Library Management (spec 15D.10) ====================

function InstitutionLibraryPanel({ onFlash }) {
  const institution = useMyInstitution(onFlash);
  const [books, setBooks] = useState(null);
  const [loans, setLoans] = useState(null);
  const [tab, setTab] = useState('books');
  const [form, setForm] = useState({ title: '', author: '', category: 'book', copies: 1 });
  const [borrowForm, setBorrowForm] = useState({});

  function load(instId) {
    apiRequest(`/institution-ops/${instId}/books`).then(setBooks).catch((err) => onFlash(err.message));
    apiRequest(`/institution-ops/${instId}/loans`).then(setLoans).catch((err) => onFlash(err.message));
  }
  useEffect(() => { if (institution) load(institution._id); }, [institution]);

  async function addBook(e) {
    e.preventDefault();
    try {
      await apiRequest(`/institution-ops/${institution._id}/books`, { method: 'POST', body: { ...form, copies: Number(form.copies) } });
      onFlash('Book added.', 'success');
      setForm({ title: '', author: '', category: 'book', copies: 1 });
      load(institution._id);
    } catch (err) { onFlash(err.message); }
  }

  async function removeBook(id) {
    try { await apiRequest(`/institution-ops/books/${id}`, { method: 'DELETE' }); onFlash('Book removed.', 'success'); load(institution._id); } catch (err) { onFlash(err.message); }
  }

  async function borrow(bookId) {
    const f = borrowForm[bookId] || {};
    if (!f.borrower || !f.dueDate) return onFlash('Enter borrower User ID and due date first.');
    try {
      await apiRequest(`/institution-ops/books/${bookId}/borrow`, { method: 'POST', body: { borrower: f.borrower, dueDate: f.dueDate } });
      onFlash('Book issued.', 'success');
      load(institution._id);
    } catch (err) { onFlash(err.message); }
  }

  async function returnLoan(loanId) {
    try { await apiRequest(`/institution-ops/loans/${loanId}/return`, { method: 'PATCH' }); onFlash('Book returned.', 'success'); load(institution._id); } catch (err) { onFlash(err.message); }
  }

  if (institution === undefined) return <p role="status" className="admin-notice">Loading...</p>;
  if (!institution) return <p className="admin-notice">Register an institution first (My Institution tab).</p>;

  return (
    <div>
      <div className="flex gap-2 mb-3">
        <button className={`btn ${tab === 'books' ? 'btn-primary' : ''}`} onClick={() => setTab('books')}>Books</button>
        <button className={`btn ${tab === 'loans' ? 'btn-primary' : ''}`} onClick={() => setTab('loans')}>Borrowed / Loans</button>
      </div>
      {tab === 'books' ? (
        <>
          <form onSubmit={addBook} className="flex gap-3 items-end mb-3 flex-wrap">
            <input className="form-input" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <input className="form-input" placeholder="Author" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
            <select className="form-select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {['book', 'ebook', 'journal', 'research_paper'].map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <input className="form-input" type="number" min="0" placeholder="Copies" value={form.copies} onChange={(e) => setForm({ ...form, copies: e.target.value })} style={{ maxWidth: 100 }} />
            <button type="submit" className="btn btn-primary">Add Book</button>
          </form>
          <Table
            headers={['Title', 'Author', 'Category', 'Available', 'QR Code', 'Borrow', 'Action']}
            rows={(books || []).map((b) => [
              b.title, b.author || '—', b.category, `${b.availableCopies}/${b.copies}`, b.qrCode,
              <div className="flex gap-1 items-center">
                <input className="form-input" placeholder="Borrower User ID" style={{ width: 110, padding: '4px 6px', fontSize: '0.72rem' }} onChange={(e) => setBorrowForm({ ...borrowForm, [b._id]: { ...borrowForm[b._id], borrower: e.target.value } })} />
                <input className="form-input" type="date" style={{ width: 120, padding: '4px 6px', fontSize: '0.72rem' }} onChange={(e) => setBorrowForm({ ...borrowForm, [b._id]: { ...borrowForm[b._id], dueDate: e.target.value } })} />
                <button className="btn" style={{ padding: '4px 8px', fontSize: '0.72rem' }} onClick={() => borrow(b._id)}>Issue</button>
              </div>,
              <button className="btn" style={{ padding: '4px 8px', fontSize: '0.72rem', color: 'var(--rose)' }} onClick={() => removeBook(b._id)}>Remove</button>
            ])}
            empty="No books added yet."
          />
        </>
      ) : (
        <Table
          headers={['Book', 'Borrower', 'Borrowed', 'Due', 'Status', 'Fine', 'Action']}
          rows={(loans || []).map((l) => [
            l.book?.title, l.borrower?.fullName, new Date(l.borrowedAt).toLocaleDateString(), new Date(l.dueDate).toLocaleDateString(),
            <Tag status={l.status === 'returned' ? 'approved' : 'pending'} label={l.status} />,
            l.fineAmount > 0 ? `${l.fineAmount}` : '—',
            l.status !== 'returned' ? <button className="btn" style={{ padding: '4px 8px', fontSize: '0.72rem' }} onClick={() => returnLoan(l._id)}>Mark Returned</button> : '—'
          ])}
          empty="No loans yet."
        />
      )}
    </div>
  );
}

// ==================== Hostel Management (spec 15D.11) ====================

function InstitutionHostelPanel({ onFlash }) {
  const institution = useMyInstitution(onFlash);
  const [rooms, setRooms] = useState(null);
  const [requests, setRequests] = useState(null);
  const [tab, setTab] = useState('rooms');
  const [form, setForm] = useState({ building: '', roomNumber: '', floor: '', capacity: 2, monthlyFee: '' });
  const [allocForm, setAllocForm] = useState({});

  function load(instId) {
    apiRequest(`/institution-ops/${instId}/hostel-rooms`).then(setRooms).catch((err) => onFlash(err.message));
    apiRequest(`/institution-ops/${instId}/hostel-requests`).then(setRequests).catch((err) => onFlash(err.message));
  }
  useEffect(() => { if (institution) load(institution._id); }, [institution]);

  async function addRoom(e) {
    e.preventDefault();
    try {
      await apiRequest(`/institution-ops/${institution._id}/hostel-rooms`, { method: 'POST', body: { ...form, capacity: Number(form.capacity), monthlyFee: Number(form.monthlyFee) || 0 } });
      onFlash('Room added.', 'success');
      setForm({ building: '', roomNumber: '', floor: '', capacity: 2, monthlyFee: '' });
      load(institution._id);
    } catch (err) { onFlash(err.message); }
  }

  async function allocate(roomId) {
    const student = allocForm[roomId];
    if (!student) return onFlash('Enter student User ID first.');
    try {
      await apiRequest(`/institution-ops/hostel-rooms/${roomId}/allocate`, { method: 'POST', body: { student } });
      onFlash('Student allocated.', 'success');
      load(institution._id);
    } catch (err) { onFlash(err.message); }
  }

  async function decide(id, decision) {
    try { await apiRequest(`/institution-ops/hostel-requests/${id}`, { method: 'PATCH', body: { decision } }); onFlash(`Request ${decision}.`, 'success'); load(institution._id); } catch (err) { onFlash(err.message); }
  }

  if (institution === undefined) return <p role="status" className="admin-notice">Loading...</p>;
  if (!institution) return <p className="admin-notice">Register an institution first (My Institution tab).</p>;

  return (
    <div>
      <div className="flex gap-2 mb-3">
        <button className={`btn ${tab === 'rooms' ? 'btn-primary' : ''}`} onClick={() => setTab('rooms')}>Rooms</button>
        <button className={`btn ${tab === 'requests' ? 'btn-primary' : ''}`} onClick={() => setTab('requests')}>Visitor / Leave Requests</button>
      </div>
      {tab === 'rooms' ? (
        <>
          <form onSubmit={addRoom} className="flex gap-3 items-end mb-3 flex-wrap">
            <input className="form-input" placeholder="Building" value={form.building} onChange={(e) => setForm({ ...form, building: e.target.value })} />
            <input className="form-input" placeholder="Room number" value={form.roomNumber} onChange={(e) => setForm({ ...form, roomNumber: e.target.value })} required />
            <input className="form-input" placeholder="Floor" value={form.floor} onChange={(e) => setForm({ ...form, floor: e.target.value })} />
            <input className="form-input" type="number" min="1" placeholder="Capacity" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} style={{ maxWidth: 100 }} required />
            <input className="form-input" type="number" placeholder="Monthly fee" value={form.monthlyFee} onChange={(e) => setForm({ ...form, monthlyFee: e.target.value })} style={{ maxWidth: 120 }} />
            <button type="submit" className="btn btn-primary">Add Room</button>
          </form>
          <Table
            headers={['Room', 'Building', 'Capacity', 'Occupants', 'Status', 'Allocate']}
            rows={(rooms || []).map((r) => [
              r.roomNumber, r.building || '—', r.capacity, (r.occupants || []).map((o) => o.fullName).join(', ') || '—',
              <Tag status={r.status === 'full' ? 'pending' : 'approved'} label={r.status} />,
              r.status !== 'full' ? (
                <div className="flex gap-1">
                  <input className="form-input" placeholder="Student User ID" style={{ width: 120, padding: '4px 6px', fontSize: '0.72rem' }} onChange={(e) => setAllocForm({ ...allocForm, [r._id]: e.target.value })} />
                  <button className="btn" style={{ padding: '4px 8px', fontSize: '0.72rem' }} onClick={() => allocate(r._id)}>Allocate</button>
                </div>
              ) : '—'
            ])}
            empty="No hostel rooms added yet."
          />
        </>
      ) : (
        <Table
          headers={['Student', 'Room', 'Type', 'Details', 'Status', 'Action']}
          rows={(requests || []).map((r) => [
            r.student?.fullName, r.room?.roomNumber, r.type,
            r.type === 'visitor' ? `${r.visitorName} (${r.visitorRelation})` : `${new Date(r.fromDate).toLocaleDateString()} – ${new Date(r.toDate).toLocaleDateString()}: ${r.reason}`,
            <Tag status={r.status === 'approved' ? 'approved' : r.status === 'rejected' ? 'rejected' : 'pending'} label={r.status} />,
            r.status === 'pending' ? (
              <div className="flex gap-1">
                <button className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '0.72rem' }} onClick={() => decide(r._id, 'approved')}>Approve</button>
                <button className="btn" style={{ padding: '4px 8px', fontSize: '0.72rem' }} onClick={() => decide(r._id, 'rejected')}>Reject</button>
              </div>
            ) : '—'
          ])}
          empty="No visitor/leave requests yet."
        />
      )}
    </div>
  );
}

// ==================== Transport Management (spec 15D.12) ====================

function InstitutionTransportPanel({ onFlash }) {
  const institution = useMyInstitution(onFlash);
  const [vehicles, setVehicles] = useState(null);
  const [form, setForm] = useState({ vehicleNumber: '', type: 'bus', capacity: '', driverName: '', driverPhone: '', routeName: '', monthlyFee: '' });
  const [assignForm, setAssignForm] = useState({});

  function load(instId) {
    apiRequest(`/institution-ops/${instId}/vehicles`).then(setVehicles).catch((err) => onFlash(err.message));
  }
  useEffect(() => { if (institution) load(institution._id); }, [institution]);

  async function addVehicle(e) {
    e.preventDefault();
    try {
      await apiRequest(`/institution-ops/${institution._id}/vehicles`, { method: 'POST', body: { ...form, capacity: Number(form.capacity) || 0, monthlyFee: Number(form.monthlyFee) || 0 } });
      onFlash('Vehicle added.', 'success');
      setForm({ vehicleNumber: '', type: 'bus', capacity: '', driverName: '', driverPhone: '', routeName: '', monthlyFee: '' });
      load(institution._id);
    } catch (err) { onFlash(err.message); }
  }

  async function removeVehicle(id) {
    try { await apiRequest(`/institution-ops/vehicles/${id}`, { method: 'DELETE' }); onFlash('Vehicle removed.', 'success'); load(institution._id); } catch (err) { onFlash(err.message); }
  }

  async function assign(vehicleId) {
    const student = assignForm[vehicleId];
    if (!student) return onFlash('Enter student User ID first.');
    try {
      await apiRequest(`/institution-ops/vehicles/${vehicleId}/assign`, { method: 'POST', body: { student } });
      onFlash('Student assigned.', 'success');
      load(institution._id);
    } catch (err) { onFlash(err.message); }
  }

  if (institution === undefined) return <p role="status" className="admin-notice">Loading...</p>;
  if (!institution) return <p className="admin-notice">Register an institution first (My Institution tab).</p>;

  return (
    <div>
      <form onSubmit={addVehicle} className="flex gap-3 items-end mb-3 flex-wrap">
        <input className="form-input" placeholder="Vehicle number" value={form.vehicleNumber} onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value })} required />
        <select className="form-select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
          {['bus', 'van', 'car'].map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <input className="form-input" type="number" placeholder="Capacity" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} style={{ maxWidth: 100 }} />
        <input className="form-input" placeholder="Driver name" value={form.driverName} onChange={(e) => setForm({ ...form, driverName: e.target.value })} />
        <input className="form-input" placeholder="Driver phone" value={form.driverPhone} onChange={(e) => setForm({ ...form, driverPhone: e.target.value })} />
        <input className="form-input" placeholder="Route name" value={form.routeName} onChange={(e) => setForm({ ...form, routeName: e.target.value })} />
        <input className="form-input" type="number" placeholder="Monthly fee" value={form.monthlyFee} onChange={(e) => setForm({ ...form, monthlyFee: e.target.value })} style={{ maxWidth: 120 }} />
        <button type="submit" className="btn btn-primary">Add Vehicle</button>
      </form>
      <Table
        headers={['Vehicle', 'Type', 'Route', 'Driver', 'Students', 'Assign', 'Action']}
        rows={(vehicles || []).map((v) => [
          v.vehicleNumber, v.type, v.routeName || '—', v.driverName ? `${v.driverName} (${v.driverPhone})` : '—',
          (v.assignedStudents || []).map((s) => s.fullName).join(', ') || '—',
          <div className="flex gap-1">
            <input className="form-input" placeholder="Student User ID" style={{ width: 120, padding: '4px 6px', fontSize: '0.72rem' }} onChange={(e) => setAssignForm({ ...assignForm, [v._id]: e.target.value })} />
            <button className="btn" style={{ padding: '4px 8px', fontSize: '0.72rem' }} onClick={() => assign(v._id)}>Assign</button>
          </div>,
          <button className="btn" style={{ padding: '4px 8px', fontSize: '0.72rem', color: 'var(--rose)' }} onClick={() => removeVehicle(v._id)}>Remove</button>
        ])}
        empty="No vehicles added yet."
      />
      <p style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 12 }}>Live GPS tracking needs a physical GPS unit per vehicle (spec: optional) — not included here.</p>
    </div>
  );
}

// ==================== Inventory Management (spec 15D.13) ====================

function InstitutionInventoryPanel({ onFlash }) {
  const institution = useMyInstitution(onFlash);
  const [items, setItems] = useState(null);
  const [form, setForm] = useState({ name: '', category: 'other', quantity: 1, location: '', condition: 'good' });

  function load(instId) {
    apiRequest(`/institution-ops/${instId}/inventory`).then(setItems).catch((err) => onFlash(err.message));
  }
  useEffect(() => { if (institution) load(institution._id); }, [institution]);

  async function addItem(e) {
    e.preventDefault();
    try {
      await apiRequest(`/institution-ops/${institution._id}/inventory`, { method: 'POST', body: { ...form, quantity: Number(form.quantity) } });
      onFlash('Item added.', 'success');
      setForm({ name: '', category: 'other', quantity: 1, location: '', condition: 'good' });
      load(institution._id);
    } catch (err) { onFlash(err.message); }
  }

  async function removeItem(id) {
    try { await apiRequest(`/institution-ops/inventory/${id}`, { method: 'DELETE' }); onFlash('Item removed.', 'success'); load(institution._id); } catch (err) { onFlash(err.message); }
  }

  if (institution === undefined) return <p role="status" className="admin-notice">Loading...</p>;
  if (!institution) return <p className="admin-notice">Register an institution first (My Institution tab).</p>;

  return (
    <div>
      <form onSubmit={addItem} className="flex gap-3 items-end mb-3 flex-wrap">
        <input className="form-input" placeholder="Item name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <select className="form-select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
          {['computer', 'projector', 'furniture', 'lab_equipment', 'sports_equipment', 'other'].map((c) => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
        </select>
        <input className="form-input" type="number" min="0" placeholder="Quantity" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} style={{ maxWidth: 100 }} />
        <input className="form-input" placeholder="Location (e.g. Lab 2)" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        <select className="form-select" value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })}>
          {['new', 'good', 'needs_repair', 'damaged'].map((c) => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
        </select>
        <button type="submit" className="btn btn-primary">Add Item</button>
      </form>
      <Table
        headers={['Name', 'Category', 'Qty', 'Location', 'Condition', 'Action']}
        rows={(items || []).map((i) => [
          i.name, i.category.replace('_', ' '), i.quantity, i.location || '—',
          <Tag status={i.condition === 'damaged' ? 'rejected' : i.condition === 'needs_repair' ? 'pending' : 'approved'} label={i.condition.replace('_', ' ')} />,
          <button className="btn" style={{ padding: '4px 8px', fontSize: '0.72rem', color: 'var(--rose)' }} onClick={() => removeItem(i._id)}>Remove</button>
        ])}
        empty="No inventory items added yet."
      />
    </div>
  );
}

// ==================== Medical & Health (spec 15D.14) ====================

function InstitutionHealthPanel({ onFlash }) {
  const institution = useMyInstitution(onFlash);
  const [incidents, setIncidents] = useState(null);
  const [form, setForm] = useState({ student: '', description: '', actionTaken: '', severity: 'minor' });

  function load(instId) {
    apiRequest(`/institution-ops/${instId}/health-incidents`).then(setIncidents).catch((err) => onFlash(err.message));
  }
  useEffect(() => { if (institution) load(institution._id); }, [institution]);

  async function addIncident(e) {
    e.preventDefault();
    try {
      await apiRequest(`/institution-ops/${institution._id}/health-incidents`, { method: 'POST', body: form });
      onFlash('Health incident recorded — parent notified.', 'success');
      setForm({ student: '', description: '', actionTaken: '', severity: 'minor' });
      load(institution._id);
    } catch (err) { onFlash(err.message); }
  }

  if (institution === undefined) return <p role="status" className="admin-notice">Loading...</p>;
  if (!institution) return <p className="admin-notice">Register an institution first (My Institution tab).</p>;

  return (
    <div>
      <div className="admin-section">
        <div className="admin-section-heading"><div><h2>Report a Health Incident</h2><p>Parent is automatically notified when you record an incident.</p></div></div>
        <form onSubmit={addIncident} className="flex gap-3 items-end mb-3 flex-wrap">
          <input className="form-input" placeholder="Student's User ID" value={form.student} onChange={(e) => setForm({ ...form, student: e.target.value })} required />
          <select className="form-select" value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}>
            {['minor', 'moderate', 'severe'].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <input className="form-input" placeholder="What happened" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required style={{ minWidth: 220 }} />
          <input className="form-input" placeholder="Action taken" value={form.actionTaken} onChange={(e) => setForm({ ...form, actionTaken: e.target.value })} />
          <button type="submit" className="btn btn-primary">Record Incident</button>
        </form>
      </div>
      <Table
        headers={['Student', 'Date', 'Severity', 'Description', 'Action Taken', 'Parent Notified']}
        rows={(incidents || []).map((i) => [
          i.student?.fullName, new Date(i.occurredAt).toLocaleDateString(),
          <Tag status={i.severity === 'severe' ? 'rejected' : i.severity === 'moderate' ? 'pending' : 'approved'} label={i.severity} />,
          i.description, i.actionTaken || '—', i.parentNotified ? 'Yes' : 'No'
        ])}
        empty="No health incidents recorded."
      />
      <p style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 12 }}>Blood group, allergies and vaccination records are managed per-student in Student Management → Health Record.</p>
    </div>
  );
}

// ==================== Events & Activities (spec 15D.17) ====================

const EVENT_TYPES = ['sports_day', 'annual_function', 'seminar', 'workshop', 'competition', 'parent_meeting', 'convocation', 'other'];

function InstitutionEventsPanel({ onFlash }) {
  const institution = useMyInstitution(onFlash);
  const [events, setEvents] = useState(null);
  const [form, setForm] = useState({ title: '', type: 'other', startDate: '', venue: '', description: '' });

  function load(instId) {
    apiRequest(`/institution-ops/${instId}/events`).then(setEvents).catch((err) => onFlash(err.message));
  }
  useEffect(() => { if (institution) load(institution._id); }, [institution]);

  async function addEvent(e) {
    e.preventDefault();
    try {
      await apiRequest(`/institution-ops/${institution._id}/events`, { method: 'POST', body: { ...form, startDate: new Date(form.startDate).toISOString() } });
      onFlash('Event created.', 'success');
      setForm({ title: '', type: 'other', startDate: '', venue: '', description: '' });
      load(institution._id);
    } catch (err) { onFlash(err.message); }
  }

  async function cancelEvent(id) {
    try { await apiRequest(`/institution-ops/events/${id}`, { method: 'PATCH', body: { status: 'cancelled' } }); onFlash('Event cancelled.', 'success'); load(institution._id); } catch (err) { onFlash(err.message); }
  }

  if (institution === undefined) return <p role="status" className="admin-notice">Loading...</p>;
  if (!institution) return <p className="admin-notice">Register an institution first (My Institution tab).</p>;

  return (
    <div>
      <form onSubmit={addEvent} className="flex gap-3 items-end mb-3 flex-wrap">
        <input className="form-input" placeholder="Event title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <select className="form-select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
          {EVENT_TYPES.map((t) => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
        </select>
        <input className="form-input" type="datetime-local" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
        <input className="form-input" placeholder="Venue" value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} />
        <button type="submit" className="btn btn-primary">Create Event</button>
      </form>
      <Table
        headers={['Title', 'Type', 'Date', 'Venue', 'RSVPs', 'Status', 'Action']}
        rows={(events || []).map((ev) => [
          ev.title, ev.type.replace('_', ' '), new Date(ev.startDate).toLocaleString(), ev.venue || '—', (ev.rsvps || []).length,
          <Tag status={ev.status === 'cancelled' ? 'rejected' : 'approved'} label={ev.status} />,
          ev.status !== 'cancelled' ? <button className="btn" style={{ padding: '4px 8px', fontSize: '0.72rem', color: 'var(--rose)' }} onClick={() => cancelEvent(ev._id)}>Cancel</button> : '—'
        ])}
        empty="No events created yet."
      />
    </div>
  );
}

// ==================== Complaint & Help Desk (spec 15D.16) ====================

const HELPDESK_CATEGORIES = ['academic', 'fee', 'teacher', 'student', 'staff', 'technical', 'harassment', 'discipline'];

function InstitutionHelpDeskPanel({ onFlash }) {
  const institution = useMyInstitution(onFlash);
  const [tickets, setTickets] = useState(null);

  function load(instId) {
    apiRequest(`/institution-ops/${instId}/tickets`).then(setTickets).catch((err) => onFlash(err.message));
  }
  useEffect(() => { if (institution) load(institution._id); }, [institution]);

  async function update(id, status) {
    try { await apiRequest(`/institution-ops/tickets/${id}`, { method: 'PATCH', body: { status } }); onFlash(`Ticket marked ${status.replace('_', ' ')}.`, 'success'); load(institution._id); } catch (err) { onFlash(err.message); }
  }

  if (institution === undefined) return <p role="status" className="admin-notice">Loading...</p>;
  if (!institution) return <p className="admin-notice">Register an institution first (My Institution tab).</p>;

  return (
    <div>
      <Table
        headers={['Ticket #', 'Raised By', 'Category', 'Subject', 'Priority', 'Status', 'Action']}
        rows={(tickets || []).map((t) => [
          t.ticketNumber, t.raisedBy?.fullName, t.category, t.subject,
          <Tag status={t.priority === 'urgent' ? 'rejected' : t.priority === 'high' ? 'pending' : 'approved'} label={t.priority} />,
          <Tag status={t.status === 'resolved' || t.status === 'closed' ? 'approved' : 'pending'} label={t.status.replace('_', ' ')} />,
          !['resolved', 'closed'].includes(t.status) ? (
            <div className="flex gap-1">
              <button className="btn" style={{ padding: '4px 8px', fontSize: '0.72rem' }} onClick={() => update(t._id, 'in_progress')}>In Progress</button>
              <button className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '0.72rem' }} onClick={() => update(t._id, 'resolved')}>Resolve</button>
            </div>
          ) : '—'
        ])}
        empty="No help desk tickets yet."
      />
    </div>
  );
}

// ==================== AI Operations Assistant (spec 15D.19) ====================

function InstitutionAiAssistantPanel({ onFlash }) {
  const institution = useMyInstitution(onFlash);
  const [insights, setInsights] = useState(null);
  const [dataSummary, setDataSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    try {
      const res = await apiRequest(`/institutions/${institution._id}/ai-insights`, { method: 'POST' });
      setInsights(res.insights);
      setDataSummary(res.dataSummary);
    } catch (err) { onFlash(err.message); } finally { setLoading(false); }
  }

  if (institution === undefined) return <p role="status" className="admin-notice">Loading...</p>;
  if (!institution) return <p className="admin-notice">Register an institution first (My Institution tab).</p>;

  return (
    <div>
      <div className="admin-section">
        <div className="admin-section-heading"><div><h2>AI Operations Assistant</h2><p>Uses your own connected AI provider (Profile → AI Settings) to analyze your institution's real fee, payroll and support data. All decisions remain yours — this only summarizes.</p></div></div>
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
      <p style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 12 }}>Requires an AI provider connected under Profile → AI Settings (BYOK — your own API key, e.g. OpenAI/Claude/Gemini).</p>
    </div>
  );
}

function InstitutionCampusLifePanel({ onFlash }) {
  const [institution, setInstitution] = useState(null);
  const [section, setSection] = useState('newsletter');
  const [newsletters, setNewsletters] = useState(null);
  const [nlForm, setNlForm] = useState({ title: '', content: '' });
  const [submissions, setSubmissions] = useState(null);

  useEffect(() => {
    apiRequest('/institutions/mine/list').then((list) => setInstitution(list[0] || null)).catch((err) => onFlash(err.message));
  }, [onFlash]);

  function loadNewsletters(instId) {
    apiRequest(`/newsletters/mine?institution=${instId}`).then(setNewsletters).catch((err) => onFlash(err.message));
  }
  function loadSubmissions(instId) {
    apiRequest(`/magazine/institution?institutionId=${instId}`).then(setSubmissions).catch((err) => onFlash(err.message));
  }
  useEffect(() => {
    if (!institution) return;
    if (section === 'newsletter') loadNewsletters(institution._id);
    if (section === 'magazine') loadSubmissions(institution._id);
  }, [institution, section]);

  async function createNewsletter(e) {
    e.preventDefault();
    try {
      await apiRequest('/newsletters', { method: 'POST', body: { institution: institution._id, ...nlForm } });
      onFlash('Newsletter saved as draft.', 'success');
      setNlForm({ title: '', content: '' });
      loadNewsletters(institution._id);
    } catch (err) { onFlash(err.message); }
  }
  async function publishNewsletter(id) {
    try {
      await apiRequest(`/newsletters/${id}/publish`, { method: 'PATCH' });
      onFlash('Newsletter published.', 'success');
      loadNewsletters(institution._id);
    } catch (err) { onFlash(err.message); }
  }
  async function reviewSubmission(id, status) {
    try {
      await apiRequest(`/magazine/${id}/review`, { method: 'PATCH', body: { status } });
      onFlash(`Submission ${status}.`, 'success');
      loadSubmissions(institution._id);
    } catch (err) { onFlash(err.message); }
  }
  async function publishSubmission(id) {
    try {
      await apiRequest(`/magazine/${id}/publish`, { method: 'PATCH' });
      onFlash('Published to the magazine.', 'success');
      loadSubmissions(institution._id);
    } catch (err) { onFlash(err.message); }
  }

  if (!institution) return <p className="admin-notice">Register an institution first (My Institution tab).</p>;

  return (
    <div>
      <h3 className="font-semibold mb-2">Newsletter & Magazine</h3>
      <div className="flex gap-2 mb-4">
        <button type="button" className={`btn ${section === 'newsletter' ? 'btn-primary' : ''}`} onClick={() => setSection('newsletter')}>Newsletter</button>
        <button type="button" className={`btn ${section === 'magazine' ? 'btn-primary' : ''}`} onClick={() => setSection('magazine')}>Student Magazine</button>
      </div>

      {section === 'newsletter' && (
        <div>
          <form onSubmit={createNewsletter} className="space-y-3 max-w-md mb-6">
            <input className="form-input" placeholder="Title" value={nlForm.title} onChange={(e) => setNlForm({ ...nlForm, title: e.target.value })} required />
            <textarea className="form-input" placeholder="Content" rows={5} value={nlForm.content} onChange={(e) => setNlForm({ ...nlForm, content: e.target.value })} required />
            <button type="submit" className="btn btn-primary">Save Draft</button>
          </form>
          <Table
            loading={newsletters === null}
            headers={['Title', 'Status', 'Filed', 'Action']}
            rows={(newsletters || []).map((n) => [
              n.title, <Tag status={n.status === 'published' ? 'approved' : 'pending'} />, new Date(n.createdAt).toLocaleDateString(),
              n.status === 'draft' ? <button className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => publishNewsletter(n._id)}>Publish</button> : '—'
            ])}
            empty="No newsletters yet."
          />
        </div>
      )}

      {section === 'magazine' && (
        <Table
          loading={submissions === null}
          headers={['Student', 'Title', 'Type', 'Status', 'Action']}
          rows={(submissions || []).map((s) => [
            s.student?.fullName || '—', s.title, s.type, <Tag status={s.status === 'published' ? 'approved' : s.status === 'rejected' ? 'rejected' : s.status === 'selected' ? 'approved' : 'pending'} label={s.status} />,
            <div className="flex gap-1">
              {s.status === 'submitted' && (
                <>
                  <button className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => reviewSubmission(s._id, 'selected')}>Select</button>
                  <button className="btn" style={{ padding: '4px 10px', fontSize: '0.75rem', background: 'var(--sand-line)' }} onClick={() => reviewSubmission(s._id, 'rejected')}>Reject</button>
                </>
              )}
              {s.status === 'selected' && <button className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => publishSubmission(s._id)}>Publish</button>}
              {(s.status === 'published' || s.status === 'rejected') && '—'}
            </div>
          ])}
          empty="No submissions yet."
        />
      )}
    </div>
  );
}

function InstitutionStaffPanel({ onFlash }) {
  const [institution, setInstitution] = useState(null);
  const [form, setForm] = useState({ userId: '', role: 'teacher', department: '', designation: '', canApprove: false });

  function load() {
    apiRequest('/institutions/mine/list').then((list) => setInstitution(list[0] || null)).catch((err) => onFlash(err.message));
  }
  useEffect(load, []);

  async function addStaffMember(e) {
    e.preventDefault();
    try {
      await apiRequest(`/institutions/${institution._id}/staff`, { method: 'POST', body: { userId: form.userId.trim(), role: form.role, department: form.department, designation: form.designation, permissions: form.canApprove ? ['application:approve'] : [] } });
      onFlash('Staff member added.', 'success');
      setForm({ userId: '', role: 'teacher', department: '', designation: '', canApprove: false });
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
          {['teacher', 'accountant', 'librarian', 'principal', 'coordinator', 'representative', 'staff'].map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <input className="form-input" placeholder="Designation (e.g. Senior Admissions Officer)" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} style={{ maxWidth: 220 }} />
        <input className="form-input" placeholder="Department (optional)" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} style={{ maxWidth: 160 }} />
        {form.role === 'representative' && (
          <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={form.canApprove} onChange={(e) => setForm({ ...form, canApprove: e.target.checked })} /> Can finalize (accept/reject) applications</label>
        )}
        <button type="submit" className="btn btn-primary">Add Staff</button>
      </form>
      <p style={{ fontSize: 12, color: 'var(--ink-soft)', marginBottom: 16 }}>Ask the staff member for their account's User ID from their Profile tab — a search-by-email lookup isn't built yet. Representatives can review inquiries/applications, but can only accept/reject applications if you grant that permission here.</p>
      <Table
        headers={['Role', 'Designation', 'Department', 'Added', 'Action']}
        rows={(institution.staff || []).map((s) => [s.role, s.designation || '—', s.department || '—', new Date(s.addedAt).toLocaleDateString(), <button className="btn" style={{ padding: '5px 12px', fontSize: '0.78rem', background: 'var(--sand-line)', color: 'var(--ink)' }} onClick={() => removeStaffMember(s.user)}>Remove</button>])}
        empty="No staff added yet."
      />
    </div>
  );
}

const DOW_LABEL = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' };
const DOW_INDEX = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };

// The timetable is a recurring weekly template (no per-session date), so we derive the actual
// next calendar date a given weekday+time next occurs — a real date, not just a day name.
function nextDateForDow(dow, startTime) {
  const now = new Date();
  const [h, m] = (startTime || '0:0').split(':').map(Number);
  const target = DOW_INDEX[dow];
  if (target === undefined) return null;
  const date = new Date(now);
  let daysAhead = (target - now.getDay() + 7) % 7;
  date.setDate(now.getDate() + daysAhead);
  date.setHours(h || 0, m || 0, 0, 0);
  if (daysAhead === 0 && date < now) date.setDate(date.getDate() + 7);
  return date;
}

function InstitutionClassesPanel({ onFlash }) {
  const [institution, setInstitution] = useState(null);
  const [campuses, setCampuses] = useState([]);
  const [sections, setSections] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [campusForm, setCampusForm] = useState({ name: '', address: '' });
  const [sectionForm, setSectionForm] = useState({ name: '', academicYear: '', classTeacher: '' });
  const [sectionTeacherEdits, setSectionTeacherEdits] = useState({});
  const [timetableSection, setTimetableSection] = useState('');
  const [timetable, setTimetable] = useState([]);
  const [entryForm, setEntryForm] = useState({ teacher: '', subject: '', dayOfWeek: 'mon', startTime: '', endTime: '', room: '', meetingLink: '' });
  const [editingEntryId, setEditingEntryId] = useState(null);

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
        apiRequest(`/institutions/${inst._id}/teachers`).then(setTeachers).catch((err) => onFlash(err.message));
      }
    }).catch((err) => onFlash(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }
  useEffect(load, []);

  async function assignClassTeacher(sectionId) {
    const teacherId = sectionTeacherEdits[sectionId];
    try {
      await apiRequest(`/institutions/${institution._id}/class-sections/${sectionId}`, { method: 'PATCH', body: { classTeacher: teacherId || null } });
      onFlash('Class teacher updated.', 'success');
      load();
    } catch (err) { onFlash(err.message); }
  }

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
      await apiRequest(`/institutions/${institution._id}/class-sections`, { method: 'POST', body: { ...sectionForm, classTeacher: sectionForm.classTeacher || undefined } });
      onFlash('Class section added.', 'success');
      setSectionForm({ name: '', academicYear: '', classTeacher: '' });
      load();
    } catch (err) { onFlash(err.message); }
  }
  async function createEntry(e) {
    e.preventDefault();
    try {
      if (editingEntryId) {
        // The real "Class change" event — edits an existing slot instead of delete+recreate,
        // and the backend notifies the assigned teacher about it.
        await apiRequest(`/institutions/timetable/${editingEntryId}`, {
          method: 'PATCH',
          body: { ...entryForm, teacher: entryForm.teacher.trim() || null }
        });
        onFlash('Class changed — teacher notified.', 'success');
        setEditingEntryId(null);
      } else {
        await apiRequest(`/institutions/${institution._id}/class-sections/${timetableSection}/timetable`, {
          method: 'POST',
          body: { ...entryForm, teacher: entryForm.teacher.trim() || undefined }
        });
        onFlash('Timetable entry added.', 'success');
      }
      setEntryForm({ teacher: '', subject: '', dayOfWeek: 'mon', startTime: '', endTime: '', room: '', meetingLink: '' });
      loadTimetable(timetableSection);
    } catch (err) { onFlash(err.message); }
  }
  function startEditEntry(t) {
    setEditingEntryId(t._id);
    setEntryForm({ teacher: t.teacher?._id || '', subject: t.subject, dayOfWeek: t.dayOfWeek, startTime: t.startTime, endTime: t.endTime, room: t.room || '', meetingLink: t.meetingLink || '' });
  }
  function cancelEditEntry() {
    setEditingEntryId(null);
    setEntryForm({ teacher: '', subject: '', dayOfWeek: 'mon', startTime: '', endTime: '', room: '', meetingLink: '' });
  }
  async function removeEntry(entryId) {
    try {
      await apiRequest(`/institutions/timetable/${entryId}`, { method: 'DELETE' });
      onFlash('Timetable entry removed — teacher notified.', 'success');
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
        <select className="form-select" value={sectionForm.classTeacher} onChange={(e) => setSectionForm({ ...sectionForm, classTeacher: e.target.value })} aria-label="Class teacher">
          <option value="">Class teacher (optional)</option>
          {teachers.map((t) => <option key={t.user._id} value={t.user._id}>{t.user.fullName}</option>)}
        </select>
        <button type="submit" className="btn btn-primary">Add Section</button>
      </form>
      {teachers.length === 0 && <p className="text-xs mb-3" style={{ color: 'var(--ink-soft)' }}>No teachers linked yet — add one as staff (Staff & HR tab, role "teacher") before you can pick a class teacher.</p>}
      <Table
        headers={['Name', 'Academic Year', 'Class Teacher', 'Action']}
        rows={sections.map((s) => [
          s.name, s.academicYear || '—', s.classTeacher?.fullName || 'Not assigned',
          <div className="flex gap-2 items-center">
            <select className="form-select" style={{ padding: '4px 8px', fontSize: '0.78rem' }} value={sectionTeacherEdits[s._id] ?? (s.classTeacher?._id || '')} onChange={(e) => setSectionTeacherEdits({ ...sectionTeacherEdits, [s._id]: e.target.value })}>
              <option value="">— none —</option>
              {teachers.map((t) => <option key={t.user._id} value={t.user._id}>{t.user.fullName}</option>)}
            </select>
            <button type="button" className="btn" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={() => assignClassTeacher(s._id)}>Save</button>
          </div>
        ])}
        empty="No class sections yet."
      />

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
            <input className="form-input" placeholder="Room (optional, for physical classes)" value={entryForm.room} onChange={(e) => setEntryForm({ ...entryForm, room: e.target.value })} style={{ maxWidth: 180 }} />
            <input className="form-input" placeholder="Teacher's User ID (optional)" value={entryForm.teacher} onChange={(e) => setEntryForm({ ...entryForm, teacher: e.target.value })} style={{ maxWidth: 160 }} />
            <input className="form-input" placeholder="Meeting link (optional, for online classes)" value={entryForm.meetingLink} onChange={(e) => setEntryForm({ ...entryForm, meetingLink: e.target.value })} style={{ maxWidth: 240 }} />
            <button type="submit" className="btn btn-primary">{editingEntryId ? 'Save Changes' : 'Add Slot'}</button>
            {editingEntryId && <button type="button" className="btn" onClick={cancelEditEntry}>Cancel</button>}
          </form>
          <p className="text-xs mb-3" style={{ color: 'var(--ink-soft)' }}>Paste your own Zoom/Google Meet/Teams link for online classes — CareerZ doesn't host video calls itself, but "Join Class" will open whatever link you set here.</p>
          <Table
            headers={['Day', 'Time', 'Subject', 'Teacher', 'Room', 'Online', 'Action']}
            rows={timetable.map((t) => [
              DOW_LABEL[t.dayOfWeek], `${t.startTime}–${t.endTime}`, t.subject, t.teacher?.fullName || '—', t.room || '—',
              t.meetingLink ? <Tag status="approved" /> : '—',
              <div className="flex gap-2">
                <button className="btn" style={{ padding: '5px 12px', fontSize: '0.78rem' }} onClick={() => startEditEntry(t)}>Edit</button>
                <button className="btn" style={{ padding: '5px 12px', fontSize: '0.78rem', background: 'var(--sand-line)', color: 'var(--ink)' }} onClick={() => removeEntry(t._id)}>Remove</button>
              </div>
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
      { label: 'Teachers', value: report?.teachersCount ?? null, icon: FaChalkboardUser, detail: report ? 'Active' : 'Register an institution' },
      { label: 'Staff', value: report?.staffCount ?? null, icon: FaUserGear, detail: 'Total staff' },
      { label: "Today's Attendance", value: report?.todayAttendanceRate != null ? `${report.todayAttendanceRate}%` : '—', icon: FaCalendarCheck, detail: 'Present today' },
      { label: 'Active Classes', value: report?.classSectionsCount ?? null, icon: FaClipboardList, detail: 'Class sections' },
      { label: 'Fees Collected', value: report ? `${report.fees.collected}` : null, icon: FaSackDollar, detail: 'Total collected' },
      { label: 'Pending Fees', value: report ? `${report.fees.pending}` : null, icon: FaMoneyBillWave, detail: 'Awaiting payment' },
      { label: 'Salary Status', value: report?.pendingPayroll ?? null, icon: FaWallet, detail: 'Unpaid payslips' },
      { label: 'New Admissions', value: report?.newAdmissions ?? null, icon: FaUserGraduate, detail: 'Last 30 days' },
      { label: 'Complaints', value: report?.openComplaints ?? null, icon: FaHeadset, detail: 'Open tickets' },
      { label: 'Events', value: report?.upcomingEvents ?? null, icon: FaCalendarDays, detail: 'Upcoming' }
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

const JOB_TYPES = ['full_time', 'part_time', 'internship', 'freelance', 'government', 'ngo'];
const WORK_MODES = ['onsite', 'remote', 'hybrid'];

const EMPTY_JOB_FORM = {
  title: '', company: '', type: 'full_time', workMode: 'onsite', country: '', city: '',
  salaryMin: '', salaryMax: '', experienceYears: '', education: '', skills: '', description: '',
  companyLogo: '', visaSponsorship: false, applicationDeadline: '', status: 'active'
};

function EmployerPostJobPanel({ onFlash }) {
  const [form, setForm] = useState(EMPTY_JOB_FORM);

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
          skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
          applicationDeadline: form.applicationDeadline || undefined
        }
      });
      onFlash(form.status === 'draft' ? 'Job saved as draft.' : 'Job posted.', 'success');
      setForm(EMPTY_JOB_FORM);
    } catch (err) { onFlash(err.message); }
  }

  const fieldLabel = { fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--ink-soft)', display: 'block', marginBottom: 6 };

  return (
    <form onSubmit={submit} style={{ display: 'grid', gap: 20, maxWidth: 720 }}>
      <div className="card" style={{ padding: 20, display: 'grid', gap: 14 }}>
        <p style={fieldLabel}>Basic Information</p>
        <input className="form-input" placeholder="Job title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <div className="flex flex-wrap" style={{ gap: 14 }}>
          <input className="form-input" placeholder="Company name" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} required style={{ flex: '1 1 220px', minWidth: 0 }} />
          <input className="form-input" placeholder="Company logo URL (optional)" value={form.companyLogo} onChange={(e) => setForm({ ...form, companyLogo: e.target.value })} style={{ flex: '1 1 220px', minWidth: 0 }} />
        </div>
        <div className="flex flex-wrap" style={{ gap: 14 }}>
          <div style={{ flex: '1 1 200px', minWidth: 0 }}>
            <CustomSelect value={form.type} onChange={(v) => setForm({ ...form, type: v })} ariaLabel="Job type" minWidth="100%" options={JOB_TYPES.map((t) => ({ value: t, label: t.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase()) }))} />
          </div>
          <div style={{ flex: '1 1 200px', minWidth: 0 }}>
            <CustomSelect value={form.workMode} onChange={(v) => setForm({ ...form, workMode: v })} ariaLabel="Work mode" minWidth="100%" options={WORK_MODES.map((m) => ({ value: m, label: m[0].toUpperCase() + m.slice(1) }))} />
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 20, display: 'grid', gap: 14 }}>
        <p style={fieldLabel}>Location & Compensation</p>
        <div className="flex flex-wrap" style={{ gap: 14 }}>
          <input className="form-input" placeholder="Country code (e.g. PK)" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} required style={{ flex: '1 1 160px', minWidth: 0 }} />
          <input className="form-input" placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} style={{ flex: '1 1 160px', minWidth: 0 }} />
        </div>
        <div className="flex flex-wrap" style={{ gap: 14 }}>
          <input className="form-input" type="number" placeholder="Salary min" value={form.salaryMin} onChange={(e) => setForm({ ...form, salaryMin: e.target.value })} style={{ flex: '1 1 150px', minWidth: 0 }} />
          <input className="form-input" type="number" placeholder="Salary max" value={form.salaryMax} onChange={(e) => setForm({ ...form, salaryMax: e.target.value })} style={{ flex: '1 1 150px', minWidth: 0 }} />
          <input className="form-input" type="number" placeholder="Years experience" value={form.experienceYears} onChange={(e) => setForm({ ...form, experienceYears: e.target.value })} style={{ flex: '1 1 150px', minWidth: 0 }} />
        </div>
      </div>

      <div className="card" style={{ padding: 20, display: 'grid', gap: 14 }}>
        <p style={fieldLabel}>Requirements & Description</p>
        <input className="form-input" placeholder="Education required" value={form.education} onChange={(e) => setForm({ ...form, education: e.target.value })} />
        <input className="form-input" placeholder="Skills (comma separated)" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} />
        <textarea className="form-input" placeholder="Job description" rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </div>

      <div className="card" style={{ padding: 20, display: 'grid', gap: 14 }}>
        <p style={fieldLabel}>Deadline & Visibility</p>
        <label className="text-xs" style={{ color: 'var(--ink-soft)', fontWeight: 600 }}>Application deadline (optional)
          <input className="form-input" type="date" value={form.applicationDeadline} onChange={(e) => setForm({ ...form, applicationDeadline: e.target.value })} style={{ marginTop: 6, maxWidth: 220 }} />
        </label>
        <label className="flex items-center text-sm" style={{ gap: 8 }}><input type="checkbox" checked={form.visaSponsorship} onChange={(e) => setForm({ ...form, visaSponsorship: e.target.checked })} /> Visa sponsorship available</label>
        <div className="flex flex-wrap items-end" style={{ gap: 14 }}>
          <div style={{ flex: '1 1 220px', minWidth: 0 }}>
            <CustomSelect
              value={form.status} onChange={(v) => setForm({ ...form, status: v })} ariaLabel="Job visibility" minWidth="100%"
              options={[{ value: 'active', label: 'Post now (Active)' }, { value: 'draft', label: 'Save as Draft' }]}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ flexShrink: 0, padding: '11px 22px', height: 46 }}>{form.status === 'draft' ? 'Save Draft' : 'Post Job'}</button>
        </div>
      </div>
    </form>
  );
}

const JOB_STATUS = {
  draft: { tag: 'pending', label: 'Draft' },
  active: { tag: 'approved', label: 'Active' },
  paused: { tag: 'pending', label: 'Paused' },
  closed: { tag: 'rejected', label: 'Closed' },
  filled: { tag: 'approved', label: 'Filled' }
};

// Recruiter-facing status wording (Employer/Agent's own candidate-management views) — kept
// separate from JOB_APP_STATUS, which is the job-seeker-facing wording for the same
// underlying JobApplication.status values.
const CANDIDATE_STATUS = {
  pending: { tag: 'pending', label: 'New' },
  viewed: { tag: 'pending', label: 'Reviewed' },
  shortlisted: { tag: 'pending', label: 'Shortlisted' },
  interview: { tag: 'pending', label: 'Interview' },
  selected: { tag: 'pending', label: 'Selected' },
  rejected: { tag: 'rejected', label: 'Rejected' },
  hired: { tag: 'approved', label: 'Hired' }
};

function EmployerJobsPanel({ onFlash }) {
  const [jobs, setJobs] = useState([]);
  const [openJob, setOpenJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [interviewFormFor, setInterviewFormFor] = useState(null);
  const [interviewForm, setInterviewForm] = useState({ scheduledDate: '', mode: 'online', location: '', meetingLink: '' });
  const [viewingJob, setViewingJob] = useState(null);
  const [editingJobId, setEditingJobId] = useState(null);
  const [editForm, setEditForm] = useState(null);

  function load() {
    apiRequest('/jobs/mine/list').then(setJobs).catch((err) => onFlash(err.message));
  }
  useEffect(load, []);

  function viewApplicants(jobId) {
    setOpenJob(jobId);
    apiRequest(`/jobs/${jobId}/applicants`).then(setApplicants).catch((err) => onFlash(err.message));
  }

  async function setJobStatus(job, status) {
    try {
      await apiRequest(`/jobs/${job._id}`, { method: 'PATCH', body: { status } });
      onFlash(`Job set to ${JOB_STATUS[status].label}.`, 'success');
      load();
    } catch (err) { onFlash(err.message); }
  }

  function startEdit(job) {
    setEditingJobId(job._id);
    setEditForm({
      title: job.title, company: job.company, city: job.city || '', country: job.country,
      type: job.type, workMode: job.workMode || 'onsite', salaryMin: job.salaryMin ?? '', salaryMax: job.salaryMax ?? '',
      applicationDeadline: job.applicationDeadline ? job.applicationDeadline.slice(0, 10) : '', description: job.description || ''
    });
  }

  async function saveEdit(jobId) {
    try {
      await apiRequest(`/jobs/${jobId}`, { method: 'PATCH', body: { ...editForm, applicationDeadline: editForm.applicationDeadline || null } });
      onFlash('Job updated.', 'success');
      setEditingJobId(null);
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

  async function submitInterview(appId) {
    if (!interviewForm.scheduledDate) return onFlash('Pick a date/time first.');
    try {
      await apiRequest(`/jobs/applications/${appId}/schedule-interview`, { method: 'POST', body: interviewForm });
      onFlash('Interview scheduled.', 'success');
      setInterviewFormFor(null);
      setInterviewForm({ scheduledDate: '', mode: 'online', location: '', meetingLink: '' });
      viewApplicants(openJob);
    } catch (err) { onFlash(err.message); }
  }

  const [featuredFee, setFeaturedFee] = useState(null);
  useEffect(() => { apiRequest('/jobs/featured-fee').then(setFeaturedFee).catch(() => {}); }, []);
  async function feature(jobId, paymentMethod) {
    try {
      const res = await apiRequest(`/jobs/${jobId}/feature`, { method: 'POST', body: { paymentMethod } });
      onFlash(`Job featured until ${new Date(res.featuredUntil).toLocaleDateString()}.`, 'success');
      load();
    } catch (err) { onFlash(err.message); }
  }

  return (
    <div>
      <h3 className="font-semibold" style={{ marginBottom: 14 }}>My Jobs</h3>
      <Table
        headers={['Title', 'Company', 'Location', 'Type', 'Posted', 'Deadline', 'Applicants', 'Status', 'Action']}
        rows={jobs.map((j) => [
          <span>{j.title}{j.featured && new Date(j.featuredUntil) > new Date() && <span style={{ marginLeft: 6 }}><Tag status="approved" label="Featured" /></span>}</span>,
          j.company, [j.city, j.country].filter(Boolean).join(', '), j.type.replace('_', ' '),
          new Date(j.createdAt).toLocaleDateString(),
          j.applicationDeadline ? new Date(j.applicationDeadline).toLocaleDateString() : '—',
          j.applicantCount ?? 0,
          <Tag status={JOB_STATUS[j.status]?.tag || 'pending'} label={JOB_STATUS[j.status]?.label || j.status} />,
          <div className="flex" style={{ gap: 8, flexWrap: 'wrap' }}>
            <button className="btn" style={{ padding: '6px 12px', fontSize: '0.78rem' }} onClick={() => setViewingJob(j)}>View</button>
            <button className="btn" style={{ padding: '6px 12px', fontSize: '0.78rem' }} onClick={() => startEdit(j)}>Edit</button>
            {!(j.featured && new Date(j.featuredUntil) > new Date()) && (
              <PayMethodModalButton
                onSubmit={(method) => feature(j._id, method)}
                label={`Feature${featuredFee ? ` ($${featuredFee.fee}/${featuredFee.days}d)` : ''}`}
              />
            )}
            {(j.status === 'active' || j.status === 'paused') && (
              <button className="btn" style={{ padding: '6px 12px', fontSize: '0.78rem' }} onClick={() => setJobStatus(j, j.status === 'active' ? 'paused' : 'active')}>{j.status === 'active' ? 'Pause' : 'Resume'}</button>
            )}
            <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.78rem' }} onClick={() => viewApplicants(j._id)}>Manage Candidates</button>
          </div>
        ])}
        empty="You haven't posted any jobs yet."
      />
      <JobDetailModal job={viewingJob} onClose={() => setViewingJob(null)} />
      {editingJobId && editForm && (
        <div className="card" style={{ padding: 20, marginTop: 20, maxWidth: 560 }}>
          <strong className="text-sm">Edit Job</strong>
          <div style={{ display: 'grid', gap: 12, marginTop: 14 }}>
            <input className="form-input" placeholder="Job title" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
            <input className="form-input" placeholder="Company" value={editForm.company} onChange={(e) => setEditForm({ ...editForm, company: e.target.value })} />
            <div className="flex flex-wrap" style={{ gap: 12 }}>
              <input className="form-input" placeholder="City" value={editForm.city} onChange={(e) => setEditForm({ ...editForm, city: e.target.value })} style={{ flex: '1 1 150px', minWidth: 0 }} />
              <input className="form-input" placeholder="Country code" value={editForm.country} onChange={(e) => setEditForm({ ...editForm, country: e.target.value })} style={{ flex: '1 1 150px', minWidth: 0 }} />
            </div>
            <div className="flex flex-wrap" style={{ gap: 12 }}>
              <input className="form-input" type="number" placeholder="Salary min" value={editForm.salaryMin} onChange={(e) => setEditForm({ ...editForm, salaryMin: e.target.value ? Number(e.target.value) : '' })} style={{ flex: '1 1 150px', minWidth: 0 }} />
              <input className="form-input" type="number" placeholder="Salary max" value={editForm.salaryMax} onChange={(e) => setEditForm({ ...editForm, salaryMax: e.target.value ? Number(e.target.value) : '' })} style={{ flex: '1 1 150px', minWidth: 0 }} />
            </div>
            <label className="text-xs" style={{ color: 'var(--ink-soft)', fontWeight: 600 }}>Application deadline
              <input className="form-input" type="date" value={editForm.applicationDeadline} onChange={(e) => setEditForm({ ...editForm, applicationDeadline: e.target.value })} style={{ marginTop: 6, maxWidth: 220 }} />
            </label>
            <textarea className="form-input" placeholder="Description" rows={3} value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
            <div className="flex" style={{ gap: 10 }}>
              <button type="button" className="btn btn-primary" style={{ padding: '7px 16px', fontSize: '0.78rem' }} onClick={() => saveEdit(editingJobId)}>Save Changes</button>
              <button type="button" className="btn" style={{ padding: '7px 16px', fontSize: '0.78rem' }} onClick={() => setEditingJobId(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {openJob && (
        <div style={{ marginTop: 32 }}>
          <h3 className="font-semibold" style={{ marginBottom: 14 }}>Manage Candidates</h3>
          {applicants.length === 0 && (
            <div className="student-empty-state" style={{ border: '1px solid var(--sand-line)', borderRadius: 18 }}>
              <FaUsers aria-hidden="true" />
              <p>No applicants yet</p>
            </div>
          )}
          <div style={{ display: 'grid', gap: 12 }}>
            {applicants.map((a) => (
              <div key={a._id} className="card" style={{ padding: 18 }}>
                <div className="flex items-center justify-between flex-wrap" style={{ gap: 12 }}>
                  <div className="flex items-start" style={{ gap: 12 }}>
                    {a.applicant?.profilePhoto
                      ? <img src={a.applicant.profilePhoto} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                      : <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--forest)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>{(a.applicant?.fullName || '?')[0]}</div>}
                    <div>
                      <strong className="text-sm">{a.applicant?.fullName}</strong>
                      <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 2 }}>{a.applicant?.email}</p>
                      <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 4 }}>{a.resumeSnapshot?.skills?.length > 0 ? a.resumeSnapshot.skills.join(', ') : 'No skills listed'} · {a.resumeSnapshot?.experienceLevel || 'Experience not set'} · {a.resumeSnapshot?.location || 'Location not set'}</p>
                      <p className="text-xs" style={{ marginTop: 4 }}>{a.resumeSnapshot?.cvFileUrl ? <a href={a.resumeSnapshot.cvFileUrl} target="_blank" rel="noreferrer">View CV/Resume</a> : <span style={{ color: 'var(--ink-soft)' }}>No CV uploaded</span>} · Applied {new Date(a.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center" style={{ gap: 10, flexShrink: 0 }}>
                    <div style={{ minWidth: 160 }}>
                      <CustomSelect
                        value={a.status} onChange={(v) => setAppStatus(a._id, v)} ariaLabel="Candidate status" minWidth="100%"
                        options={['pending', 'viewed', 'shortlisted', 'interview', 'selected', 'rejected', 'hired'].map((s) => ({ value: s, label: CANDIDATE_STATUS[s].label }))}
                      />
                    </div>
                    <button type="button" className="btn" style={{ padding: '8px 14px', fontSize: '0.75rem' }} onClick={() => setInterviewFormFor(interviewFormFor === a._id ? null : a._id)}>Schedule Interview</button>
                  </div>
                </div>
                {interviewFormFor === a._id && (
                  <div className="flex items-end flex-wrap" style={{ gap: 12, borderTop: '1px solid var(--sand-line)', paddingTop: 14, marginTop: 14 }}>
                    <label className="text-xs" style={{ color: 'var(--ink-soft)', fontWeight: 600 }}>Date/Time
                      <input type="datetime-local" className="form-input" value={interviewForm.scheduledDate} onChange={(e) => setInterviewForm({ ...interviewForm, scheduledDate: e.target.value })} style={{ marginTop: 6 }} />
                    </label>
                    <div style={{ minWidth: 140 }}>
                      <CustomSelect
                        value={interviewForm.mode} onChange={(v) => setInterviewForm({ ...interviewForm, mode: v })} ariaLabel="Interview mode" minWidth="100%"
                        options={[{ value: 'online', label: 'Online' }, { value: 'physical', label: 'Physical' }]}
                      />
                    </div>
                    {interviewForm.mode === 'online'
                      ? <input className="form-input" placeholder="Meeting link" value={interviewForm.meetingLink} onChange={(e) => setInterviewForm({ ...interviewForm, meetingLink: e.target.value })} style={{ flex: '1 1 200px', minWidth: 0 }} />
                      : <input className="form-input" placeholder="Location / address" value={interviewForm.location} onChange={(e) => setInterviewForm({ ...interviewForm, location: e.target.value })} style={{ flex: '1 1 200px', minWidth: 0 }} />}
                    <button type="button" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.78rem', flexShrink: 0 }} onClick={() => submitInterview(a._id)}>Confirm</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------ Donor

function DonorWorkspace({ tab, user, onFlash, onChanged, onNavigate }) {
  if (tab === 'profile') return <><ProfilePanel user={user} onFlash={onFlash} onChanged={onChanged} /><RolesPanel onFlash={onFlash} onChanged={onChanged} /><SupportComplaintPanel onFlash={onFlash} /></>;
  if (tab === 'summary') return <DonorDashboardPanel user={user} onFlash={onFlash} onNavigate={onNavigate} />;
  if (tab === 'post') return <PostScholarshipPanel onFlash={onFlash} />;
  if (tab === 'scholarships') return <MyScholarshipsPanel onFlash={onFlash} />;
  if (tab === 'recommendedFunding') return <RecommendedFundingRequestsPanel onFlash={onFlash} />;
  if (tab === 'opportunities') return <DonationOpportunitiesPanel onFlash={onFlash} />;
  if (tab === 'activeSponsorships') return <ActiveSponsorshipsPanel onFlash={onFlash} />;
  if (tab === 'donationHistory') return <DonationHistoryPanel onFlash={onFlash} />;
  if (tab === 'impactOverview') return <ImpactOverviewPanel onFlash={onFlash} />;
  if (tab === 'impactReports') return <ImpactReportsPanel onFlash={onFlash} onNavigate={onNavigate} />;
  if (tab === 'fundingApplications') return <FundingRequestApplicationsPanel onFlash={onFlash} />;
  if (tab === 'wallet') return <DonorWalletPanel onFlash={onFlash} />;
  if (tab === 'receipts') return <DonorReceiptsPanel onFlash={onFlash} />;
  if (tab === 'savedOpportunities') return <SavedOpportunitiesPanel onFlash={onFlash} />;
  if (tab === 'sponsoredStudents') return <SponsoredStudentsPanel onFlash={onFlash} />;
  if (tab === 'donorVerification') return <DonorVerificationPanel onFlash={onFlash} />;
  if (tab === 'donorMessages') return <DonorMessagesPanel onFlash={onFlash} />;
  if (tab === 'donorNotifications') return <NotificationsPanel onFlash={onFlash} />;
  if (tab === 'donorRecentActivity') return <DonorRecentActivityPanel onFlash={onFlash} />;
  return <ComingSoon label={tab} />;
}

function FundingRequestDetailModal({ request, onClose, onDonate, onSponsor, onSave, isSaved }) {
  if (!request) return null;
  const VERIFICATION_TAG = { verified: 'approved', pending: 'pending', rejected: 'rejected' };
  const VERIFICATION_LABEL = { verified: 'Verified', pending: 'Pending Review', rejected: 'Rejected' };
  return (
    <div className="u-modal-overlay open" onClick={onClose}>
      <div className="u-modal u-modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="u-modal-head">
          <div>
            <h3>{request.title}</h3>
            <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>{request.requestedBy?.fullName}{request.institution?.name ? ` · ${request.institution.name}` : ''}</p>
          </div>
          <button type="button" className="u-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="u-modal-body">
          <p className="text-xs" style={{ marginBottom: 8 }}><strong>Request type:</strong> {request.requestType}</p>
          <p className="text-xs" style={{ marginBottom: 8 }}><strong>Country:</strong> {request.country || 'Not set'}</p>
          <p className="text-xs" style={{ marginBottom: 8 }}><strong>Purpose:</strong> {request.purpose || 'Not provided'}</p>
          <p className="text-xs" style={{ marginBottom: 8 }}><strong>Required:</strong> {request.currency} {request.requiredAmount} · <strong>Collected:</strong> {request.currency} {request.collectedAmount} · <strong>Remaining:</strong> {request.currency} {Math.max(request.requiredAmount - request.collectedAmount, 0)}</p>
          <p className="text-xs" style={{ marginBottom: 8 }}><strong>Deadline:</strong> {request.applicationDeadline ? new Date(request.applicationDeadline).toLocaleDateString() : 'Not set'}</p>
          <p className="text-xs" style={{ marginBottom: 8 }}>
            <strong>Documents:</strong>{' '}
            {request.documents?.length > 0
              ? request.documents.map((d, i) => <a key={i} href={d.url} target="_blank" rel="noreferrer" style={{ marginRight: 8 }}>{d.name || `Document ${i + 1}`}</a>)
              : 'None attached'}
          </p>
          <p className="text-xs"><strong>Verification:</strong> <Tag status={VERIFICATION_TAG[request.verificationStatus]} label={VERIFICATION_LABEL[request.verificationStatus]} /></p>
        </div>
        <div className="u-modal-foot">
          {onSave && <button type="button" className="btn" onClick={() => onSave(request._id)}>{isSaved ? '★ Saved' : '☆ Save Request'}</button>}
          {onSponsor && request.requestType === 'student' && <button type="button" className="btn" disabled={request.verificationStatus !== 'verified'} title={request.verificationStatus !== 'verified' ? 'Only Super Admin-verified requests can receive donations.' : undefined} onClick={() => onSponsor(request)}>Sponsor Student</button>}
          {onDonate && <button type="button" className="btn btn-primary" disabled={request.verificationStatus !== 'verified'} title={request.verificationStatus !== 'verified' ? 'Only Super Admin-verified requests can receive donations.' : undefined} onClick={() => onDonate(request)}>Donate Now</button>}
        </div>
      </div>
    </div>
  );
}

function RecommendedFundingRequestsPanel({ onFlash }) {
  const [requests, setRequests] = useState(null);
  const [savedIds, setSavedIds] = useState([]);
  const [viewing, setViewing] = useState(null);
  const [donateFor, setDonateFor] = useState(null);
  const [donateAmount, setDonateAmount] = useState('');
  const [donatePaymentMethod, setDonatePaymentMethod] = useState('bank_transfer');

  function load() {
    apiRequest('/funding-requests/recommended').then(setRequests).catch((err) => onFlash(err.message));
    apiRequest('/funding-requests/mine/saved').then((list) => setSavedIds(list.map((r) => r._id))).catch(() => {});
  }
  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function toggleSave(id) {
    const isSaved = savedIds.includes(id);
    try {
      await apiRequest(`/funding-requests/${id}/save`, { method: isSaved ? 'DELETE' : 'POST' });
      setSavedIds((prev) => (isSaved ? prev.filter((i) => i !== id) : [...prev, id]));
    } catch (err) { onFlash(err.message); }
  }

  function startDonate(request, type) {
    setViewing(null);
    setDonateFor({ request, type });
    setDonateAmount('');
  }

  async function confirmDonate() {
    if (!donateAmount || Number(donateAmount) <= 0) return onFlash('Enter a valid amount.');
    try {
      await apiRequest(`/funding-requests/${donateFor.request._id}/donate`, { method: 'POST', body: { amount: Number(donateAmount), type: donateFor.type, paymentMethod: donatePaymentMethod } });
      onFlash(donateFor.type === 'sponsorship' ? 'Sponsorship recorded.' : 'Donation recorded.', 'success');
      setDonateFor(null);
      load();
    } catch (err) { onFlash(err.message); }
  }

  if (requests === null) return <p role="status" className="admin-notice">Loading...</p>;

  const VERIFICATION_TAG = { verified: 'approved', pending: 'pending', rejected: 'rejected' };
  const VERIFICATION_LABEL = { verified: 'Verified', pending: 'Pending Review', rejected: 'Rejected' };

  return (
    <div>
      <h3 className="font-semibold" style={{ marginBottom: 4 }}>Recommended Funding Requests</h3>
      <p className="text-xs" style={{ color: 'var(--ink-soft)', marginBottom: 16 }}>Computed ranking — verified requests, lowest-funded first, closest deadlines first. Not AI-generated.</p>
      <Table
        headers={['Student/Institution', 'Type', 'Required', 'Collected', 'Remaining', 'Purpose', 'Country', 'Verification', 'Deadline', 'Actions']}
        rows={requests.map((r) => [
          r.requestedBy?.fullName || r.institution?.name,
          r.requestType,
          `${r.currency} ${r.requiredAmount}`,
          `${r.currency} ${r.collectedAmount}`,
          `${r.currency} ${r.remainingAmount}`,
          r.purpose || '—',
          r.country || '—',
          <Tag status={VERIFICATION_TAG[r.verificationStatus]} label={VERIFICATION_LABEL[r.verificationStatus]} />,
          r.applicationDeadline ? new Date(r.applicationDeadline).toLocaleDateString() : '—',
          <div className="flex flex-wrap" style={{ gap: 8 }}>
            <button type="button" className="btn" style={{ padding: '6px 12px', fontSize: '0.72rem' }} onClick={() => setViewing(r)}>View Request</button>
            <button type="button" className="btn" style={{ padding: '6px 12px', fontSize: '0.72rem' }} onClick={() => toggleSave(r._id)}>{savedIds.includes(r._id) ? '★ Saved' : '☆ Save'}</button>
            {r.requestType === 'student' && <button type="button" className="btn" style={{ padding: '6px 12px', fontSize: '0.72rem' }} disabled={r.verificationStatus !== 'verified'} title={r.verificationStatus !== 'verified' ? 'Only Super Admin-verified requests can receive donations.' : undefined} onClick={() => startDonate(r, 'sponsorship')}>Sponsor Student</button>}
            <button type="button" className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.72rem' }} disabled={r.verificationStatus !== 'verified'} title={r.verificationStatus !== 'verified' ? 'Only Super Admin-verified requests can receive donations.' : undefined} onClick={() => startDonate(r, 'donation')}>Donate Now</button>
          </div>
        ])}
        empty="No funding requests to recommend yet."
      />
      <FundingRequestDetailModal
        request={viewing}
        onClose={() => setViewing(null)}
        isSaved={viewing ? savedIds.includes(viewing._id) : false}
        onSave={toggleSave}
        onDonate={(r) => startDonate(r, 'donation')}
        onSponsor={(r) => startDonate(r, 'sponsorship')}
      />
      {donateFor && (
        <div className="u-modal-overlay open" onClick={() => setDonateFor(null)}>
          <div className="u-modal u-modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="u-modal-head">
              <h3>{donateFor.type === 'sponsorship' ? 'Sponsor Student' : 'Donate Now'}</h3>
              <button type="button" className="u-modal-close" onClick={() => setDonateFor(null)}>✕</button>
            </div>
            <div className="u-modal-body">
              <p className="text-xs mb-2" style={{ color: 'var(--ink-soft)' }}>{donateFor.request.title} — {donateFor.request.currency} {Math.max(donateFor.request.requiredAmount - donateFor.request.collectedAmount, 0)} remaining</p>
              <input className="form-input" type="number" placeholder={`Amount (${donateFor.request.currency})`} value={donateAmount} onChange={(e) => setDonateAmount(e.target.value)} />
              <select className="form-select mt-2" value={donatePaymentMethod} onChange={(e) => setDonatePaymentMethod(e.target.value)}>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="card">Card</option>
                <option value="mobile_wallet">Mobile Wallet</option>
                <option value="cash">Cash</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="u-modal-foot">
              <button type="button" className="btn btn-primary" onClick={confirmDonate}>Confirm {donateFor.type === 'sponsorship' ? 'Sponsorship' : 'Donation'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const FUNDING_CATEGORIES = [
  { value: 'scholarship', label: 'Student Scholarships' },
  { value: 'course_fee', label: 'Course Fee Support' },
  { value: 'institution_support', label: 'Institution Support' },
  { value: 'education_project', label: 'Education Projects' },
  { value: 'learning_resources', label: 'Learning Resources' },
  { value: 'emergency_assistance', label: 'Emergency Education Assistance' }
];
const EDUCATION_LEVELS = ['primary', 'secondary', 'undergraduate', 'graduate', 'vocational'];

// Full browse — every open request across the platform, not just the top-30 recommended ones —
// with the complete filter set (Country / Institution / Education level / Category / Amount / Verified).
function DonationOpportunitiesPanel({ onFlash }) {
  const [requests, setRequests] = useState(null);
  const [institutions, setInstitutions] = useState([]);
  const [savedIds, setSavedIds] = useState([]);
  const [viewing, setViewing] = useState(null);
  const [donateFor, setDonateFor] = useState(null);
  const [donateAmount, setDonateAmount] = useState('');
  const [donatePaymentMethod, setDonatePaymentMethod] = useState('bank_transfer');
  const [filters, setFilters] = useState({ country: '', institution: '', educationLevel: '', category: '', minAmount: '', maxAmount: '', verifiedOnly: false });

  useEffect(() => { apiRequest('/institutions').then(setInstitutions).catch(() => {}); }, []);

  function load() {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    apiRequest(`/funding-requests${params.toString() ? `?${params.toString()}` : ''}`).then(setRequests).catch((err) => onFlash(err.message));
    apiRequest('/funding-requests/mine/saved').then((list) => setSavedIds(list.map((r) => r._id))).catch(() => {});
  }
  useEffect(load, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  async function toggleSave(id) {
    const isSaved = savedIds.includes(id);
    try {
      await apiRequest(`/funding-requests/${id}/save`, { method: isSaved ? 'DELETE' : 'POST' });
      setSavedIds((prev) => (isSaved ? prev.filter((i) => i !== id) : [...prev, id]));
    } catch (err) { onFlash(err.message); }
  }

  function startDonate(request, type) {
    setViewing(null);
    setDonateFor({ request, type });
    setDonateAmount('');
  }

  async function confirmDonate() {
    if (!donateAmount || Number(donateAmount) <= 0) return onFlash('Enter a valid amount.');
    try {
      await apiRequest(`/funding-requests/${donateFor.request._id}/donate`, { method: 'POST', body: { amount: Number(donateAmount), type: donateFor.type, paymentMethod: donatePaymentMethod } });
      onFlash(donateFor.type === 'sponsorship' ? 'Sponsorship recorded.' : 'Donation recorded.', 'success');
      setDonateFor(null);
      load();
    } catch (err) { onFlash(err.message); }
  }

  const VERIFICATION_TAG = { verified: 'approved', pending: 'pending', rejected: 'rejected' };
  const VERIFICATION_LABEL = { verified: 'Verified', pending: 'Pending Review', rejected: 'Rejected' };
  const CATEGORY_LABEL = Object.fromEntries(FUNDING_CATEGORIES.map((c) => [c.value, c.label]));

  return (
    <div>
      <h3 className="font-semibold" style={{ marginBottom: 4 }}>Donation Opportunities</h3>
      <p className="text-xs" style={{ color: 'var(--ink-soft)', marginBottom: 16 }}>Browse every open funding request across all categories.</p>

      <div className="flex flex-wrap" style={{ gap: 8, marginBottom: 16 }}>
        <button type="button" className={`btn${filters.category === '' ? ' btn-primary' : ''}`} style={{ padding: '6px 14px', fontSize: '0.75rem' }} onClick={() => setFilters({ ...filters, category: '' })}>All</button>
        {FUNDING_CATEGORIES.map((c) => (
          <button key={c.value} type="button" className={`btn${filters.category === c.value ? ' btn-primary' : ''}`} style={{ padding: '6px 14px', fontSize: '0.75rem' }} onClick={() => setFilters({ ...filters, category: c.value })}>{c.label}</button>
        ))}
      </div>

      <div className="card grid grid-cols-2 md:grid-cols-6" style={{ padding: 16, gap: 12, marginBottom: 20, alignItems: 'end' }}>
        <input className="form-input" placeholder="Country code" value={filters.country} onChange={(e) => setFilters({ ...filters, country: e.target.value.toUpperCase() })} />
        <CustomSelect
          value={filters.institution} onChange={(v) => setFilters({ ...filters, institution: v })} ariaLabel="Filter by institution" minWidth="100%"
          options={[{ value: '', label: 'Any institution' }, ...institutions.map((i) => ({ value: i._id, label: i.name }))]}
        />
        <CustomSelect
          value={filters.educationLevel} onChange={(v) => setFilters({ ...filters, educationLevel: v })} ariaLabel="Filter by education level" minWidth="100%"
          options={[{ value: '', label: 'Any education level' }, ...EDUCATION_LEVELS.map((l) => ({ value: l, label: l[0].toUpperCase() + l.slice(1) }))]}
        />
        <input className="form-input" type="number" placeholder="Min amount" value={filters.minAmount} onChange={(e) => setFilters({ ...filters, minAmount: e.target.value })} />
        <input className="form-input" type="number" placeholder="Max amount" value={filters.maxAmount} onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value })} />
        <label className="flex items-center text-xs" style={{ gap: 8, minHeight: 46 }}><input type="checkbox" checked={filters.verifiedOnly} onChange={(e) => setFilters({ ...filters, verifiedOnly: e.target.checked })} /> Verified only</label>
      </div>

      <Table
        headers={['Student/Institution', 'Category', 'Required', 'Collected', 'Remaining', 'Purpose', 'Country', 'Verification', 'Deadline', 'Actions']}
        rows={(requests || []).map((r) => [
          r.requestedBy?.fullName || r.institution?.name,
          CATEGORY_LABEL[r.category] || r.category,
          `${r.currency} ${r.requiredAmount}`,
          `${r.currency} ${r.collectedAmount}`,
          `${r.currency} ${Math.max(r.requiredAmount - r.collectedAmount, 0)}`,
          r.purpose || '—',
          r.country || '—',
          <Tag status={VERIFICATION_TAG[r.verificationStatus]} label={VERIFICATION_LABEL[r.verificationStatus]} />,
          r.applicationDeadline ? new Date(r.applicationDeadline).toLocaleDateString() : '—',
          <div className="flex gap-2 flex-wrap">
            <button type="button" className="btn" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={() => setViewing(r)}>View Request</button>
            <button type="button" className="btn" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={() => toggleSave(r._id)}>{savedIds.includes(r._id) ? '★ Saved' : '☆ Save'}</button>
            {r.requestType === 'student' && <button type="button" className="btn" style={{ padding: '4px 10px', fontSize: '0.72rem' }} disabled={r.verificationStatus !== 'verified'} title={r.verificationStatus !== 'verified' ? 'Only Super Admin-verified requests can receive donations.' : undefined} onClick={() => startDonate(r, 'sponsorship')}>Sponsor Student</button>}
            <button type="button" className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '0.72rem' }} disabled={r.verificationStatus !== 'verified'} title={r.verificationStatus !== 'verified' ? 'Only Super Admin-verified requests can receive donations.' : undefined} onClick={() => startDonate(r, 'donation')}>Donate Now</button>
          </div>
        ])}
        empty="No funding requests match these filters."
      />
      <FundingRequestDetailModal
        request={viewing}
        onClose={() => setViewing(null)}
        isSaved={viewing ? savedIds.includes(viewing._id) : false}
        onSave={toggleSave}
        onDonate={(r) => startDonate(r, 'donation')}
        onSponsor={(r) => startDonate(r, 'sponsorship')}
      />
      {donateFor && (
        <div className="u-modal-overlay open" onClick={() => setDonateFor(null)}>
          <div className="u-modal u-modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="u-modal-head">
              <h3>{donateFor.type === 'sponsorship' ? 'Sponsor Student' : 'Donate Now'}</h3>
              <button type="button" className="u-modal-close" onClick={() => setDonateFor(null)}>✕</button>
            </div>
            <div className="u-modal-body">
              <p className="text-xs mb-2" style={{ color: 'var(--ink-soft)' }}>{donateFor.request.title} — {donateFor.request.currency} {Math.max(donateFor.request.requiredAmount - donateFor.request.collectedAmount, 0)} remaining</p>
              <input className="form-input" type="number" placeholder={`Amount (${donateFor.request.currency})`} value={donateAmount} onChange={(e) => setDonateAmount(e.target.value)} />
              <select className="form-select mt-2" value={donatePaymentMethod} onChange={(e) => setDonatePaymentMethod(e.target.value)}>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="card">Card</option>
                <option value="mobile_wallet">Mobile Wallet</option>
                <option value="cash">Cash</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="u-modal-foot">
              <button type="button" className="btn btn-primary" onClick={confirmDonate}>Confirm {donateFor.type === 'sponsorship' ? 'Sponsorship' : 'Donation'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Donor item 5 — the donor's real sponsorship ledger: sponsored student, institution (from
// the student's StudentProfile), committed/paid/remaining amounts, next payment date, status.
const SPONSORSHIP_STATUS = {
  pending: { tag: 'pending', label: 'Pending' },
  active: { tag: 'approved', label: 'Active' },
  paused: { tag: 'pending', label: 'Paused' },
  completed: { tag: 'approved', label: 'Completed' },
  cancelled: { tag: 'rejected', label: 'Cancelled' }
};

function ActiveSponsorshipsPanel({ onFlash }) {
  const [sponsorships, setSponsorships] = useState(null);
  const [paymentFor, setPaymentFor] = useState(null);
  const [paidAmount, setPaidAmount] = useState('');
  const [nextPaymentDate, setNextPaymentDate] = useState('');

  function load() {
    apiRequest('/scholarships/mine/sponsorships').then(setSponsorships).catch((err) => onFlash(err.message));
  }
  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function changeStatus(id, status) {
    try {
      await apiRequest(`/scholarships/sponsorships/${id}/status`, { method: 'PATCH', body: { status } });
      onFlash('Sponsorship status updated.', 'success');
      load();
    } catch (err) { onFlash(err.message); }
  }

  function startPayment(s) {
    setPaymentFor(s._id);
    setPaidAmount(String(s.paidAmount ?? 0));
    setNextPaymentDate(s.nextPaymentDate ? s.nextPaymentDate.slice(0, 10) : '');
  }

  async function submitPayment(s) {
    const amt = Number(paidAmount);
    if (Number.isNaN(amt) || amt < 0) return onFlash('Enter a valid paid amount.');
    try {
      await apiRequest(`/scholarships/sponsorships/${s._id}/payment`, {
        method: 'PATCH',
        body: { paidAmount: amt, nextPaymentDate: nextPaymentDate || null }
      });
      onFlash('Payment recorded.', 'success');
      setPaymentFor(null);
      load();
    } catch (err) { onFlash(err.message); }
  }

  if (sponsorships === null) return <p role="status" className="admin-notice">Loading...</p>;

  return (
    <div>
      <h3 className="font-semibold" style={{ marginBottom: 4 }}>Active Sponsorships</h3>
      <p className="text-xs" style={{ color: 'var(--ink-soft)', marginBottom: 16 }}>Your real sponsorship commitments, created automatically when you approve a scholarship application.</p>
      {sponsorships.length === 0 && (
        <div className="student-empty-state" style={{ border: '1px solid var(--sand-line)', borderRadius: 18 }}>
          <FaGraduationCap aria-hidden="true" />
          <p>No sponsorships yet</p>
          <span>Approve a scholarship application to create one.</span>
        </div>
      )}
      <div style={{ display: 'grid', gap: 14 }}>
      {sponsorships.map((s) => {
        const st = SPONSORSHIP_STATUS[s.status] || SPONSORSHIP_STATUS.pending;
        const pct = s.amount > 0 ? Math.min(100, Math.round((s.paidAmount / s.amount) * 100)) : 0;
        return (
          <div key={s._id} className="card" style={{ padding: 20 }}>
            <div className="flex items-start justify-between flex-wrap" style={{ gap: 14 }}>
              <div className="flex items-start" style={{ gap: 12 }}>
                <span style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--emerald)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>{(s.student?.fullName || '?')[0]}</span>
                <div style={{ minWidth: 220 }}>
                  <strong className="text-sm">{s.student?.fullName || 'Sponsored student'}</strong>
                  <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 2 }}>{s.scholarship?.title}{s.institution?.name ? ` · ${s.institution.name}` : ' · Institution not set on student profile'}</p>
                  <div className="student-progress-row" style={{ maxWidth: 240, marginTop: 10, marginBottom: 4 }}>
                    <span className="text-xs">{s.currency} {s.paidAmount} of {s.currency} {s.amount}</span>
                    <strong className="text-xs">{pct}%</strong>
                  </div>
                  <progress className="student-progress-bar" max="100" value={pct} style={{ maxWidth: 240 }} aria-label="Sponsorship paid progress" />
                  <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 8 }}>
                    Remaining: {s.currency} {s.remainingAmount} · Next payment: {s.nextPaymentDate ? new Date(s.nextPaymentDate).toLocaleDateString() : 'Not scheduled'}
                  </p>
                  <span style={{ display: 'inline-block', marginTop: 8 }}><Tag status={st.tag} label={st.label} /></span>
                </div>
              </div>
              <div className="flex items-center flex-wrap" style={{ gap: 10, flexShrink: 0 }}>
                <div style={{ minWidth: 150 }}>
                  <CustomSelect
                    value={s.status} onChange={(v) => changeStatus(s._id, v)} ariaLabel="Sponsorship status" minWidth="100%"
                    options={Object.entries(SPONSORSHIP_STATUS).map(([val, meta]) => ({ value: val, label: meta.label }))}
                  />
                </div>
                <button type="button" className="btn" style={{ padding: '8px 14px', fontSize: '0.75rem' }} onClick={() => (paymentFor === s._id ? setPaymentFor(null) : startPayment(s))}>Record Payment</button>
              </div>
            </div>
            {paymentFor === s._id && (
              <div className="flex items-end flex-wrap" style={{ gap: 14, borderTop: '1px solid var(--sand-line)', paddingTop: 16, marginTop: 16 }}>
                <label className="text-xs" style={{ color: 'var(--ink-soft)', fontWeight: 600 }}>Paid amount so far ({s.currency})
                  <input type="number" min="0" className="form-input" value={paidAmount} onChange={(e) => setPaidAmount(e.target.value)} style={{ marginTop: 6 }} />
                </label>
                <label className="text-xs" style={{ color: 'var(--ink-soft)', fontWeight: 600 }}>Next payment date
                  <input type="date" className="form-input" value={nextPaymentDate} onChange={(e) => setNextPaymentDate(e.target.value)} style={{ marginTop: 6 }} />
                </label>
                <button type="button" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.78rem' }} onClick={() => submitPayment(s)}>Save</button>
              </div>
            )}
          </div>
        );
      })}
      </div>
    </div>
  );
}

// Donor item 6 — every real Donation record the donor has made (both "Donate Now" and
// "Sponsor Student"), with payment method, internal transaction id, status and a real receipt.
const PAYMENT_METHOD_LABEL = { bank_transfer: 'Bank Transfer', card: 'Card', mobile_wallet: 'Mobile Wallet', cash: 'Cash', other: 'Other' };
const DONATION_STATUS = {
  pending: { tag: 'pending', label: 'Pending' },
  successful: { tag: 'approved', label: 'Successful' },
  failed: { tag: 'rejected', label: 'Failed' },
  refunded: { tag: 'rejected', label: 'Refunded' }
};

function DonationReceiptModal({ donation, onClose }) {
  if (!donation) return null;
  const recipient = donation.fundingRequest?.requestedBy?.fullName || donation.fundingRequest?.institution?.name || 'Recipient';
  return (
    <div className="u-modal-overlay open" onClick={onClose}>
      <div className="u-modal u-modal-sm" onClick={(e) => e.stopPropagation()}>
        <div className="u-modal-head">
          <h3>Donation Receipt</h3>
          <button type="button" className="u-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="u-modal-body">
          <p className="text-xs" style={{ marginBottom: 8 }}><strong>Date:</strong> {new Date(donation.createdAt).toLocaleString()}</p>
          <p className="text-xs" style={{ marginBottom: 8 }}><strong>Recipient:</strong> {recipient}</p>
          <p className="text-xs" style={{ marginBottom: 8 }}><strong>Purpose:</strong> {donation.fundingRequest?.title}{donation.fundingRequest?.purpose ? ` — ${donation.fundingRequest.purpose}` : ''}</p>
          <p className="text-xs" style={{ marginBottom: 8 }}><strong>Amount:</strong> {donation.currency} {donation.amount}</p>
          <p className="text-xs" style={{ marginBottom: 8 }}><strong>Payment method:</strong> {PAYMENT_METHOD_LABEL[donation.paymentMethod] || donation.paymentMethod}</p>
          <p className="text-xs" style={{ marginBottom: 8 }}><strong>Transaction ID:</strong> {donation.transactionId}</p>
          <p className="text-xs"><strong>Status:</strong> <Tag status={DONATION_STATUS[donation.status]?.tag} label={DONATION_STATUS[donation.status]?.label} /></p>
        </div>
      </div>
    </div>
  );
}

function DonationHistoryPanel({ onFlash }) {
  const [donations, setDonations] = useState(null);
  const [receiptFor, setReceiptFor] = useState(null);

  function load() {
    apiRequest('/funding-requests/mine/donations').then(setDonations).catch((err) => onFlash(err.message));
  }
  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function changeStatus(id, status) {
    try {
      await apiRequest(`/funding-requests/donations/${id}/status`, { method: 'PATCH', body: { status } });
      onFlash('Donation status updated.', 'success');
      load();
    } catch (err) { onFlash(err.message); }
  }

  if (donations === null) return <p role="status" className="admin-notice">Loading...</p>;

  return (
    <div>
      <h3 className="font-semibold" style={{ marginBottom: 4 }}>Donation History</h3>
      <p className="text-xs" style={{ color: 'var(--ink-soft)', marginBottom: 16 }}>Your real donation and sponsorship contributions. No live payment gateway — status reflects what you confirm actually happened.</p>
      <Table
        headers={['Date', 'Recipient', 'Purpose', 'Amount', 'Payment Method', 'Transaction ID', 'Status', 'Actions']}
        rows={donations.map((d) => [
          new Date(d.createdAt).toLocaleDateString(),
          d.fundingRequest?.requestedBy?.fullName || d.fundingRequest?.institution?.name || '—',
          d.fundingRequest?.title || '—',
          `${d.currency} ${d.amount}`,
          PAYMENT_METHOD_LABEL[d.paymentMethod] || d.paymentMethod,
          d.transactionId,
          <div style={{ minWidth: 140 }}>
            <CustomSelect
              value={d.status} onChange={(v) => changeStatus(d._id, v)} ariaLabel="Donation status" minWidth="100%"
              options={Object.entries(DONATION_STATUS).map(([val, meta]) => ({ value: val, label: meta.label }))}
            />
          </div>,
          <button type="button" className="btn" style={{ padding: '6px 12px', fontSize: '0.72rem' }} onClick={() => setReceiptFor(d)}>View Receipt</button>
        ])}
        empty="No donations recorded yet."
      />
      <DonationReceiptModal donation={receiptFor} onClose={() => setReceiptFor(null)} />
    </div>
  );
}

// Donor item 7 — Impact Overview. Pure client-side aggregation over the donor's own already-loaded
// sponsorships (/scholarships/mine/sponsorships) and donations (/funding-requests/mine/donations) —
// no new backend endpoint, every number traced back to a real record already on screen elsewhere.
function ImpactOverviewPanel({ onFlash }) {
  const [sponsorships, setSponsorships] = useState(null);
  const [donations, setDonations] = useState(null);

  useEffect(() => {
    apiRequest('/scholarships/mine/sponsorships').then(setSponsorships).catch((err) => onFlash(err.message));
    apiRequest('/funding-requests/mine/donations').then(setDonations).catch((err) => onFlash(err.message));
  }, [onFlash]);

  if (sponsorships === null || donations === null) return <p role="status" className="admin-notice">Loading...</p>;

  const liveSponsorships = sponsorships.filter((s) => s.status !== 'cancelled');
  const successfulDonations = donations.filter((d) => d.status === 'successful' && d.fundingRequest);

  // 1. Total students supported — sponsored students + individually-donated-to students.
  const studentIds = new Set();
  liveSponsorships.forEach((s) => s.student?._id && studentIds.add(s.student._id));
  successfulDonations.forEach((d) => { if (d.fundingRequest.requestType === 'student') studentIds.add(d.fundingRequest.requestedBy?._id); });

  // 2. Scholarships funded — distinct scholarships that produced a real (non-cancelled) sponsorship.
  const scholarshipIds = new Set(liveSponsorships.map((s) => s.scholarship?._id).filter(Boolean));

  // 3. Courses sponsored — distinct funding requests in the "course_fee" category donated to.
  const courseRequestIds = new Set(successfulDonations.filter((d) => d.fundingRequest.category === 'course_fee').map((d) => d.fundingRequest._id));

  // 4. Institutions/projects supported — institutions behind sponsorships + institution/project funding requests donated to.
  const institutionProjectIds = new Set();
  liveSponsorships.forEach((s) => s.institution?._id && institutionProjectIds.add(`inst:${s.institution._id}`));
  successfulDonations.forEach((d) => {
    if (d.fundingRequest.requestType === 'institution') institutionProjectIds.add(`inst:${d.fundingRequest.institution?._id || d.fundingRequest._id}`);
    if (d.fundingRequest.requestType === 'project') institutionProjectIds.add(`proj:${d.fundingRequest._id}`);
  });

  // 5. Completed education goals — sponsorships the donor has marked completed.
  const completedGoals = sponsorships.filter((s) => s.status === 'completed').length;

  // 6. Donation utilization summary — per currency: one-time donations (already delivered) + sponsorship
  // paid-so-far vs total committed, so the donor sees how much of what they pledged has actually moved.
  const utilByCurrency = {};
  function bucket(currency) {
    if (!utilByCurrency[currency]) utilByCurrency[currency] = { donated: 0, sponsorshipPaid: 0, sponsorshipCommitted: 0 };
    return utilByCurrency[currency];
  }
  successfulDonations.forEach((d) => { bucket(d.currency).donated += d.amount; });
  liveSponsorships.forEach((s) => { const b = bucket(s.currency); b.sponsorshipPaid += s.paidAmount || 0; b.sponsorshipCommitted += s.amount || 0; });

  return (
    <div>
      <div className="dash-section-title"><h2>Impact Overview</h2></div>
      <p className="text-xs" style={{ color: 'var(--ink-soft)', marginBottom: 16 }}>Computed from your own real sponsorships and donations — nothing fabricated or estimated.</p>
      <div className="grid grid-cols-2 md:grid-cols-3" style={{ gap: 14, marginBottom: 20 }}>
        <SummaryCard title="Total Students Supported" count={studentIds.size} />
        <SummaryCard title="Scholarships Funded" count={scholarshipIds.size} />
        <SummaryCard title="Courses Sponsored" count={courseRequestIds.size} />
        <SummaryCard title="Institutions/Projects Supported" count={institutionProjectIds.size} />
        <SummaryCard title="Completed Education Goals" count={completedGoals} />
      </div>

      <h4 className="font-semibold" style={{ fontSize: 15, marginBottom: 12 }}>Donation Utilization Summary</h4>
      {Object.keys(utilByCurrency).length === 0 && (
        <div className="student-empty-state" style={{ border: '1px solid var(--sand-line)', borderRadius: 18 }}>
          <FaChartLine aria-hidden="true" />
          <p>No donations or sponsorships yet</p>
        </div>
      )}
      {Object.keys(utilByCurrency).length > 0 && (
        <Table
          headers={['Currency', 'One-Time Donations', 'Sponsorship Paid', 'Sponsorship Committed', 'Utilization']}
          rows={Object.entries(utilByCurrency).map(([currency, b]) => {
            const totalCommitted = b.donated + b.sponsorshipCommitted;
            const totalMoved = b.donated + b.sponsorshipPaid;
            const pct = totalCommitted > 0 ? Math.round((totalMoved / totalCommitted) * 100) : 0;
            return [currency, `${currency} ${b.donated}`, `${currency} ${b.sponsorshipPaid}`, `${currency} ${b.sponsorshipCommitted}`, <strong>{pct}%</strong>];
          })}
          empty="No donations or sponsorships yet."
        />
      )}
    </div>
  );
}

// Donor item 8 — Impact Reports: a per-recipient report built entirely from real fields already
// on the sponsorship record (no AI wired into this app — the donor confirmed a computed report
// over a fabricated "AI-generated" one). Milestones use only timestamps that really exist
// (application submitted / reviewed, sponsorship record's own createdAt/updatedAt).
function buildReportText(s, lastMessage) {
  const pct = s.amount > 0 ? Math.round((s.paidAmount / s.amount) * 100) : 0;
  const lines = [
    'CAREERZ — DONOR IMPACT REPORT',
    '(Computed from real records — not AI-generated.)',
    '',
    `Recipient: ${s.student?.fullName || 'Unknown'} (${s.student?.email || ''})`,
    `Scholarship: ${s.scholarship?.title || '—'}`,
    `Institution: ${s.institution?.name || 'Not set on student profile'}`,
    `Program / Term: ${s.program || 'Not set'} ${s.currentTerm ? `/ ${s.currentTerm}` : ''}`,
    '',
    `Sponsorship status: ${SPONSORSHIP_STATUS[s.status]?.label || s.status}`,
    `Funding utilization: ${s.currency} ${s.paidAmount} paid of ${s.currency} ${s.amount} committed (${pct}%)`,
    `Remaining amount: ${s.currency} ${s.remainingAmount}`,
    `Next payment date: ${s.nextPaymentDate ? new Date(s.nextPaymentDate).toLocaleDateString() : 'Not scheduled'}`,
    '',
    'Completed milestones:',
    ...buildMilestones(s).map((m) => `  - ${m.label}: ${m.date}`),
    '',
    `Institution/student update: ${lastMessage ? `"${lastMessage.lastMessage}" (${new Date(lastMessage.lastAt).toLocaleDateString()})` : 'No messages exchanged yet.'}`,
    '',
    `Report generated: ${new Date().toLocaleString()}`
  ];
  return lines.join('\n');
}

function buildMilestones(s) {
  const milestones = [];
  if (s.application?.createdAt) milestones.push({ label: 'Application submitted', date: new Date(s.application.createdAt).toLocaleDateString() });
  if (s.application?.reviewedAt) milestones.push({ label: 'Application approved / sponsorship started', date: new Date(s.application.reviewedAt).toLocaleDateString() });
  else if (s.createdAt) milestones.push({ label: 'Sponsorship started', date: new Date(s.createdAt).toLocaleDateString() });
  if (s.status === 'completed') milestones.push({ label: 'Sponsorship completed', date: new Date(s.updatedAt).toLocaleDateString() });
  if (s.status === 'cancelled') milestones.push({ label: 'Sponsorship cancelled', date: new Date(s.updatedAt).toLocaleDateString() });
  return milestones;
}

function downloadTextFile(filename, text) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Real local activity log for actions that have no server record (a file download is a client
// action, not a database row) — Recent Activity items "Downloaded receipts" / "Generated impact
// report". Scoped to this browser only, which the panel states honestly rather than overclaiming
// cross-device history.
function logDonorActivity(type, label) {
  try {
    const key = 'careerz_donor_activity_log';
    const log = JSON.parse(localStorage.getItem(key) || '[]');
    log.unshift({ type, label, date: new Date().toISOString() });
    localStorage.setItem(key, JSON.stringify(log.slice(0, 50)));
  } catch { /* localStorage unavailable — skip logging, download still works */ }
}
function readDonorActivityLog() {
  try { return JSON.parse(localStorage.getItem('careerz_donor_activity_log') || '[]'); } catch { return []; }
}

function ImpactReportsPanel({ onFlash, onNavigate }) {
  const [sponsorships, setSponsorships] = useState(null);
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    apiRequest('/scholarships/mine/sponsorships').then(setSponsorships).catch((err) => onFlash(err.message));
    apiRequest('/messages/conversations').then(setConversations).catch(() => {});
  }, [onFlash]);

  if (sponsorships === null) return <p role="status" className="admin-notice">Loading...</p>;

  const live = sponsorships.filter((s) => s.status !== 'cancelled');
  const lastMessageByStudent = {};
  conversations.forEach((c) => { lastMessageByStudent[c.user._id] = c; });

  function download(s) {
    const lastMessage = lastMessageByStudent[s.student?._id];
    downloadTextFile(`impact-report-${(s.student?.fullName || 'recipient').replace(/\s+/g, '-')}.txt`, buildReportText(s, lastMessage));
    logDonorActivity('impact_report', `Generated impact report — ${s.student?.fullName || 'recipient'}`);
  }

  function downloadAll() {
    const text = live.map((s) => buildReportText(s, lastMessageByStudent[s.student?._id])).join('\n\n' + '='.repeat(50) + '\n\n');
    downloadTextFile('impact-report-full.txt', text);
    logDonorActivity('impact_report', 'Generated full impact report');
  }

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap" style={{ gap: 12, marginBottom: 4 }}>
        <h3 className="font-semibold">Impact Reports</h3>
        {live.length > 0 && <button type="button" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.8rem' }} onClick={downloadAll}>Download Full Report</button>}
      </div>
      <p className="text-xs" style={{ color: 'var(--ink-soft)', marginBottom: 18 }}>Computed from your real sponsorship and message data — not AI-generated (no AI is wired into this app).</p>
      {live.length === 0 && (
        <div className="student-empty-state" style={{ border: '1px solid var(--sand-line)', borderRadius: 18 }}>
          <FaChartLine aria-hidden="true" />
          <p>No active sponsorships to report on yet</p>
        </div>
      )}
      <div style={{ display: 'grid', gap: 14 }}>
      {live.map((s) => {
        const pct = s.amount > 0 ? Math.round((s.paidAmount / s.amount) * 100) : 0;
        const lastMessage = lastMessageByStudent[s.student?._id];
        const milestones = buildMilestones(s);
        const st = SPONSORSHIP_STATUS[s.status] || SPONSORSHIP_STATUS.pending;
        const rowLabel = { fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--ink-soft)' };
        return (
          <div key={s._id} className="card" style={{ padding: 20 }}>
            <div className="flex items-center justify-between flex-wrap" style={{ gap: 12, marginBottom: 16 }}>
              <div className="flex items-center" style={{ gap: 12 }}>
                <span style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--emerald)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>{(s.student?.fullName || '?')[0]}</span>
                <div>
                  <strong className="text-sm">{s.student?.fullName}</strong>
                  <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 2 }}>{s.scholarship?.title}</p>
                </div>
              </div>
              <Tag status={st.tag} label={st.label} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, paddingBottom: 16, borderBottom: '1px solid var(--sand-line)' }}>
              <div>
                <p style={rowLabel}>Recipient Progress</p>
                <p className="text-xs" style={{ marginTop: 6 }}>{pct}% funded ({s.currency} {s.paidAmount} of {s.currency} {s.amount})</p>
              </div>
              <div>
                <p style={rowLabel}>Academic Progress</p>
                <p className="text-xs" style={{ marginTop: 6 }}>{s.institution?.name || 'Institution not set'}{s.program ? ` · ${s.program}` : ''}{s.currentTerm ? ` · ${s.currentTerm}` : ''}{!s.institution && !s.program ? ' — not set on student profile yet' : ''}</p>
              </div>
              <div>
                <p style={rowLabel}>Funding Utilization</p>
                <p className="text-xs" style={{ marginTop: 6 }}>{s.currency} {s.remainingAmount} remaining of {s.currency} {s.amount}</p>
              </div>
              <div>
                <p style={rowLabel}>Institution/Student Update</p>
                <p className="text-xs" style={{ marginTop: 6 }}>{lastMessage ? `"${lastMessage.lastMessage}" — ${new Date(lastMessage.lastAt).toLocaleDateString()}` : 'No messages exchanged yet.'}</p>
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <p style={rowLabel}>Completed Milestones</p>
              <p className="text-xs" style={{ marginTop: 6, color: 'var(--ink-soft)' }}>{milestones.length === 0 ? 'None yet' : milestones.map((m) => `${m.label} (${m.date})`).join(' · ')}</p>
            </div>

            <div className="flex flex-wrap" style={{ gap: 10, marginTop: 16 }}>
              <button type="button" className="btn" style={{ padding: '7px 16px', fontSize: '0.75rem' }} onClick={() => onNavigate && onNavigate('messages')}>Message Student</button>
              <button type="button" className="btn btn-primary" style={{ padding: '7px 16px', fontSize: '0.75rem' }} onClick={() => download(s)}>Download Report</button>
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
}

// Donor item 9 — every Funding Request across every status, framed as a review queue: applicant,
// category, requested amount, documents, institution, verification status, and the donor-facing
// application-status workflow (separate from admin's verificationStatus and the system's
// open/closed/fulfilled status).
const FUNDING_APP_STATUS = {
  new: { tag: 'pending', label: 'New' },
  under_review: { tag: 'pending', label: 'Under Review' },
  approved: { tag: 'approved', label: 'Approved' },
  partially_funded: { tag: 'approved', label: 'Partially Funded' },
  funded: { tag: 'approved', label: 'Funded' },
  rejected: { tag: 'rejected', label: 'Rejected' }
};

function FundingRequestApplicationsPanel({ onFlash }) {
  const [applications, setApplications] = useState(null);
  const [viewing, setViewing] = useState(null);
  const CATEGORY_LABEL = Object.fromEntries(FUNDING_CATEGORIES.map((c) => [c.value, c.label]));
  const VERIFICATION_TAG = { verified: 'approved', pending: 'pending', rejected: 'rejected' };
  const VERIFICATION_LABEL = { verified: 'Verified', pending: 'Pending Review', rejected: 'Rejected' };

  function load() {
    apiRequest('/funding-requests/applications').then(setApplications).catch((err) => onFlash(err.message));
  }
  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function changeStatus(id, applicationStatus) {
    try {
      await apiRequest(`/funding-requests/${id}/application-status`, { method: 'PATCH', body: { applicationStatus } });
      onFlash('Application status updated.', 'success');
      load();
    } catch (err) { onFlash(err.message); }
  }

  if (applications === null) return <p role="status" className="admin-notice">Loading...</p>;

  return (
    <div>
      <h3 className="font-semibold" style={{ marginBottom: 4 }}>Funding Request Applications</h3>
      <p className="text-xs" style={{ color: 'var(--ink-soft)', marginBottom: 16 }}>Every funding request submitted on the platform, across every status.</p>
      <Table
        headers={['Applicant', 'Category', 'Requested Amount', 'Documents', 'Institution', 'Verification', 'Application Status', 'Actions']}
        rows={applications.map((r) => [
          r.requestedBy?.fullName || '—',
          CATEGORY_LABEL[r.category] || r.category,
          `${r.currency} ${r.requiredAmount}`,
          r.documents?.length > 0 ? `${r.documents.length} attached` : 'None',
          r.institution?.name || '—',
          <Tag status={VERIFICATION_TAG[r.verificationStatus]} label={VERIFICATION_LABEL[r.verificationStatus]} />,
          <div style={{ minWidth: 150 }}>
            <CustomSelect
              value={r.applicationStatus} onChange={(v) => changeStatus(r._id, v)} ariaLabel="Application status" minWidth="100%"
              options={Object.entries(FUNDING_APP_STATUS).map(([val, meta]) => ({ value: val, label: meta.label }))}
            />
          </div>,
          <button type="button" className="btn" style={{ padding: '6px 12px', fontSize: '0.72rem' }} onClick={() => setViewing(r)}>View Request</button>
        ])}
        empty="No funding request applications yet."
      />
      <FundingRequestDetailModal request={viewing} onClose={() => setViewing(null)} />
    </div>
  );
}

// Donor item 10 — Wallet & Payments. Pure client-side aggregation over three already-existing
// endpoints (deposits, donations, sponsorships) — no new backend. "Add Funds" reuses the deposit
// endpoint already built for item 2's wallet balance; nothing here moves real money.
const DEPOSIT_STATUS = {
  requested: { tag: 'pending', label: 'Requested' },
  confirmed: { tag: 'approved', label: 'Confirmed' },
  rejected: { tag: 'rejected', label: 'Rejected' }
};

function generateTransactionReceipt(tx) {
  return [
    'CAREERZ — TRANSACTION RECEIPT',
    '',
    `Type: ${tx.type}`,
    `Date: ${new Date(tx.date).toLocaleString()}`,
    `Amount: ${tx.currency} ${tx.amount}`,
    `Status: ${tx.statusLabel}`,
    `Reference: ${tx.ref}`,
    '',
    `Receipt generated: ${new Date().toLocaleString()}`
  ].join('\n');
}

function DonorWalletPanel({ onFlash }) {
  const [deposits, setDeposits] = useState(null);
  const [donations, setDonations] = useState(null);
  const [sponsorships, setSponsorships] = useState(null);
  const [addFundsFor, setAddFundsFor] = useState(null);
  const [addFundsAmount, setAddFundsAmount] = useState('');
  const [addFundsMethod, setAddFundsMethod] = useState('bank_transfer');
  const [newCurrency, setNewCurrency] = useState('USD');

  function load() {
    apiRequest('/scholarships/mine/deposits').then(setDeposits).catch((err) => onFlash(err.message));
    apiRequest('/funding-requests/mine/donations').then(setDonations).catch((err) => onFlash(err.message));
    apiRequest('/scholarships/mine/sponsorships').then(setSponsorships).catch((err) => onFlash(err.message));
  }
  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (deposits === null || donations === null || sponsorships === null) return <p role="status" className="admin-notice">Loading...</p>;

  const liveSponsorships = sponsorships.filter((s) => s.status !== 'cancelled');
  const byCurrency = {};
  function bucket(currency) {
    if (!byCurrency[currency]) byCurrency[currency] = { totalDeposited: 0, totalDonated: 0, pendingPayments: 0, refundsCredits: 0 };
    return byCurrency[currency];
  }
  deposits.forEach((d) => { if (d.status === 'confirmed') bucket(d.currency).totalDeposited += d.amount; });
  donations.forEach((d) => {
    if (d.status === 'successful') bucket(d.currency).totalDonated += d.amount;
    if (d.status === 'pending') bucket(d.currency).pendingPayments += d.amount;
    if (d.status === 'refunded') bucket(d.currency).refundsCredits += d.amount;
  });
  liveSponsorships.forEach((s) => {
    const b = bucket(s.currency);
    b.totalDonated += s.paidAmount || 0;
    b.pendingPayments += s.remainingAmount || 0;
  });
  const currencies = Object.keys(byCurrency);

  async function submitAddFunds() {
    const amt = Number(addFundsAmount);
    if (!amt || amt <= 0) return onFlash('Enter a valid amount.');
    try {
      await apiRequest('/scholarships/donor/deposit', { method: 'POST', body: { amount: amt, currency: addFundsFor || newCurrency, paymentMethod: addFundsMethod } });
      onFlash('Deposit requested — pending admin confirmation.', 'success');
      setAddFundsFor(null); setAddFundsAmount('');
      load();
    } catch (err) { onFlash(err.message); }
  }

  const transactions = [
    ...deposits.map((d) => ({ type: 'Deposit', date: d.createdAt, amount: d.amount, currency: d.currency, statusLabel: DEPOSIT_STATUS[d.status]?.label, tag: DEPOSIT_STATUS[d.status]?.tag, ref: d._id })),
    ...donations.map((d) => ({ type: d.type === 'sponsorship' ? 'Sponsorship Donation' : 'Donation', date: d.createdAt, amount: d.amount, currency: d.currency, statusLabel: DONATION_STATUS[d.status]?.label, tag: DONATION_STATUS[d.status]?.tag, ref: d.transactionId })),
    ...liveSponsorships.filter((s) => s.paidAmount > 0).map((s) => ({ type: 'Sponsorship Payment', date: s.updatedAt, amount: s.paidAmount, currency: s.currency, statusLabel: SPONSORSHIP_STATUS[s.status]?.label, tag: SPONSORSHIP_STATUS[s.status]?.tag, ref: s._id }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div>
      <h3 className="font-semibold mb-2">Wallet & Payments</h3>
      <p className="text-xs mb-3" style={{ color: 'var(--ink-soft)' }}>No real payment processor is wired up — "Add Funds" creates a real, trackable deposit request; nothing here moves actual money automatically.</p>
      {currencies.length === 0 && <p className="text-sm mb-3" style={{ color: 'var(--ink-soft)' }}>No wallet activity yet.</p>}
      {currencies.map((currency) => {
        const b = byCurrency[currency];
        const available = b.totalDeposited + b.refundsCredits - b.totalDonated;
        return (
          <div key={currency} className="card" style={{ padding: 16, marginBottom: 16 }}>
            <strong className="text-sm">{currency} Wallet</strong>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-2">
              <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>Available Balance: <strong>{currency} {available}</strong></p>
              <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>Total Deposited: <strong>{currency} {b.totalDeposited}</strong></p>
              <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>Total Donated: <strong>{currency} {b.totalDonated}</strong></p>
              <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>Pending Payments: <strong>{currency} {b.pendingPayments}</strong></p>
              <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>Refunds/Credits: <strong>{currency} {b.refundsCredits}</strong></p>
            </div>
            <button type="button" className="btn btn-primary mt-3" style={{ padding: '5px 14px', fontSize: '0.78rem' }} onClick={() => { setAddFundsFor(currency); setAddFundsAmount(''); }}>Add Funds ({currency})</button>
          </div>
        );
      })}

      <button type="button" className="btn mb-3" onClick={() => { setAddFundsFor(''); setNewCurrency('USD'); setAddFundsAmount(''); }}>+ Add Funds in a new currency</button>

      <h4 className="font-semibold mb-2 mt-2">Transaction History</h4>
      <Table
        headers={['Type', 'Date', 'Amount', 'Status', 'Reference', 'Actions']}
        rows={transactions.map((tx) => [
          tx.type,
          new Date(tx.date).toLocaleDateString(),
          `${tx.currency} ${tx.amount}`,
          <Tag status={tx.tag} label={tx.statusLabel} />,
          tx.ref,
          <button type="button" className="btn" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={() => { downloadTextFile(`receipt-${tx.ref}.txt`, generateTransactionReceipt(tx)); logDonorActivity('receipt', `Downloaded receipt — ${tx.type} (${tx.currency} ${tx.amount})`); }}>Download Receipt</button>
        ])}
        empty="No transactions yet."
      />

      {addFundsFor !== null && (
        <div className="u-modal-overlay open" onClick={() => setAddFundsFor(null)}>
          <div className="u-modal u-modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="u-modal-head">
              <h3>Add Funds</h3>
              <button type="button" className="u-modal-close" onClick={() => setAddFundsFor(null)}>✕</button>
            </div>
            <div className="u-modal-body">
              {addFundsFor === '' && (
                <input className="form-input mb-2" placeholder="Currency (e.g. USD, EUR, PKR)" value={newCurrency} onChange={(e) => setNewCurrency(e.target.value.toUpperCase())} />
              )}
              <input className="form-input mb-2" type="number" min="0" placeholder={`Amount (${addFundsFor || newCurrency})`} value={addFundsAmount} onChange={(e) => setAddFundsAmount(e.target.value)} />
              <CustomSelect value={addFundsMethod} onChange={setAddFundsMethod} ariaLabel="Payment method" minWidth="100%" options={PAYMENT_METHODS} />
            </div>
            <div className="u-modal-foot">
              <button type="button" className="btn btn-primary" onClick={submitAddFunds}>Request Deposit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Donor item 11 — Saved Opportunities. Pure client-side grouping of the already-existing
// /funding-requests/mine/saved list (populated by the Save/★ actions on items 3 & 4).
function SavedOpportunitiesPanel({ onFlash }) {
  const [saved, setSaved] = useState(null);

  function load() {
    apiRequest('/funding-requests/mine/saved').then(setSaved).catch((err) => onFlash(err.message));
  }
  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function unsave(id) {
    try {
      await apiRequest(`/funding-requests/${id}/save`, { method: 'DELETE' });
      onFlash('Removed from saved.', 'success');
      load();
    } catch (err) { onFlash(err.message); }
  }

  if (saved === null) return <p role="status" className="admin-notice">Loading...</p>;

  const savedStudents = saved.filter((r) => r.requestType === 'student');
  const savedScholarshipRequests = saved.filter((r) => r.category === 'scholarship');
  const savedInstitutions = saved.filter((r) => r.requestType === 'institution');
  const savedProjects = saved.filter((r) => r.requestType === 'project');

  function group(title, list) {
    return (
      <div className="mb-4">
        <h4 className="font-semibold mb-2" style={{ fontSize: 15 }}>{title} ({list.length})</h4>
        <Table
          headers={['Title', 'Requested By', 'Category', 'Amount', 'Donation Deadline', 'Actions']}
          rows={list.map((r) => [
            r.title,
            r.requestedBy?.fullName || r.institution?.name || '—',
            r.category,
            `${r.currency} ${r.requiredAmount}`,
            r.applicationDeadline ? new Date(r.applicationDeadline).toLocaleDateString() : 'Not set',
            <button type="button" className="btn" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={() => unsave(r._id)}>Remove</button>
          ])}
          empty={`No saved ${title.toLowerCase()}.`}
        />
      </div>
    );
  }

  return (
    <div>
      <h3 className="font-semibold mb-2">Saved Opportunities</h3>
      <p className="text-xs mb-3" style={{ color: 'var(--ink-soft)' }}>Everything you've saved (★) from Recommended Funding Requests and Donation Opportunities.</p>
      {group('Saved Students', savedStudents)}
      {group('Saved Scholarship Requests', savedScholarshipRequests)}
      {group('Saved Institutions', savedInstitutions)}
      {group('Saved Education Projects', savedProjects)}
    </div>
  );
}

// Donor item 12 — Messages, categorized the same way as the Agent inbox: Approved Recipients
// (students the donor is actually sponsoring or has donated to — not just anyone), Institutions,
// Platform Support, Super Admin. Reuses the shared /messages endpoints — contact permissions and
// platform rules are already enforced there for every role, nothing role-specific to add.
function DonorMessagesPanel({ onFlash }) {
  const [conversations, setConversations] = useState(null);
  const [recipientIds, setRecipientIds] = useState(null);
  const [activeUser, setActiveUser] = useState(null);
  const [thread, setThread] = useState(null);
  const [text, setText] = useState('');

  function load() {
    apiRequest('/messages/conversations').then(setConversations).catch((err) => onFlash(err.message));
    Promise.all([
      apiRequest('/scholarships/mine/sponsorships').catch(() => []),
      apiRequest('/funding-requests/mine/donations').catch(() => [])
    ]).then(([sponsorships, donations]) => {
      const ids = new Set();
      (sponsorships || []).filter((s) => s.status !== 'cancelled').forEach((s) => s.student?._id && ids.add(s.student._id));
      (donations || []).filter((d) => d.status === 'successful' && d.fundingRequest?.requestType === 'student').forEach((d) => { if (d.fundingRequest.requestedBy?._id) ids.add(d.fundingRequest.requestedBy._id); });
      setRecipientIds(ids);
    });
  }
  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  function openThread(u) {
    setActiveUser(u);
    setThread(null);
    apiRequest(`/messages/with/${u._id}`).then(setThread).catch((err) => onFlash(err.message));
    apiRequest(`/messages/with/${u._id}/read`, { method: 'PATCH' }).then(load).catch(() => {});
  }

  async function send(e) {
    e.preventDefault();
    if (!activeUser || !text.trim()) return;
    try {
      await apiRequest('/messages', { method: 'POST', body: { to: activeUser._id, text: text.trim() } });
      setText('');
      apiRequest(`/messages/with/${activeUser._id}`).then(setThread);
      load();
    } catch (err) { onFlash(err.message); }
  }

  if (conversations === null || recipientIds === null) return <p role="status" className="admin-notice">Loading...</p>;

  const hasRole = (u, role) => (u.roles || []).includes(role);
  const recipientMsgs = conversations.filter((c) => recipientIds.has(c.user._id));
  const institutionMsgs = conversations.filter((c) => !recipientIds.has(c.user._id) && (hasRole(c.user, 'institution_owner') || hasRole(c.user, 'academy_owner')));
  const supportMsgs = conversations.filter((c) => !recipientIds.has(c.user._id) && (hasRole(c.user, 'admin') || hasRole(c.user, 'platform_staff')));
  const superAdminMsgs = conversations.filter((c) => !recipientIds.has(c.user._id) && hasRole(c.user, 'super_admin'));
  const categorizedIds = new Set([...recipientMsgs, ...institutionMsgs, ...supportMsgs, ...superAdminMsgs].map((c) => c.user._id));
  const otherMsgs = conversations.filter((c) => !categorizedIds.has(c.user._id));

  function ConversationGroup({ title, items }) {
    if (items.length === 0) return null;
    return (
      <div className="mb-4">
        <strong className="text-xs">{title}</strong>
        <div className="dash-list mt-1">
          {items.map((c) => (
            <div key={c.user._id} className={`dash-list-item${activeUser?._id === c.user._id ? ' unread' : ''}`} style={{ cursor: 'pointer' }} onClick={() => openThread(c.user)}>
              <span className="dash-list-icon c-forest" aria-hidden><FaUser size={14} /></span>
              <div className="dash-list-body"><div className="title">{c.user.fullName}{c.unread > 0 ? ` (${c.unread})` : ''}</div><div className="desc">{c.lastMessage}</div></div>
              <span className="dash-list-time">{new Date(c.lastAt).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid g2" style={{ gap: 24, alignItems: 'start' }}>
      <div>
        <h3 className="font-semibold mb-2">Messages</h3>
        <p className="text-xs mb-3" style={{ color: 'var(--ink-soft)' }}>To start a new conversation, ask for their User ID and use the "New Message" box on the right.</p>
        <ConversationGroup title="Approved Recipients" items={recipientMsgs} />
        <ConversationGroup title="Institutions" items={institutionMsgs} />
        <ConversationGroup title="Platform Support" items={supportMsgs} />
        <ConversationGroup title="Super Admin" items={superAdminMsgs} />
        <ConversationGroup title="Other" items={otherMsgs} />
        {conversations.length === 0 && <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>No conversations yet.</p>}
      </div>
      <div>
        <h3 className="font-semibold mb-2">{activeUser ? activeUser.fullName : 'New Message'}</h3>
        {!activeUser && (
          <input className="form-input mb-3" placeholder="Recipient's User ID" onKeyDown={(e) => {
            if (e.key === 'Enter' && e.target.value.trim()) { openThread({ _id: e.target.value.trim(), fullName: 'New recipient' }); }
          }} />
        )}
        {activeUser && (
          <>
            <div className="card reveal in" style={{ padding: '8px 12px', marginBottom: 12, maxHeight: 320, overflowY: 'auto' }}>
              {thread === null && <p role="status" className="admin-notice">Loading...</p>}
              {thread && thread.length === 0 && <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>No messages yet.</p>}
              {(thread || []).map((m) => (
                <div key={m._id} style={{ padding: '8px 4px', borderBottom: '1px solid var(--sand-line)' }}>
                  <div style={{ fontSize: 13 }}>{m.text}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-soft)' }}>{new Date(m.createdAt).toLocaleString()}</div>
                </div>
              ))}
            </div>
            <form onSubmit={send} className="flex gap-3 items-end">
              <input className="form-input" placeholder="Type a message..." value={text} onChange={(e) => setText(e.target.value)} required />
              <button type="submit" className="btn btn-primary">Send</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

// Donor item 14 — Recent Activity, six real feeds. First four come from already-existing server
// endpoints; the last two ("Downloaded receipts" / "Generated impact report") are genuine client
// actions with no server record, so they're read from this browser's own activity log (item 10's
// and item 8's download buttons write to it) — labeled honestly as browser-local, not cross-device.
function DonorRecentActivityPanel({ onFlash }) {
  const [donations, setDonations] = useState(null);
  const [sponsorships, setSponsorships] = useState(null);
  const [applications, setApplications] = useState(null);
  const [savedIds, setSavedIds] = useState([]);
  const [deposits, setDeposits] = useState([]);
  const [localLog] = useState(readDonorActivityLog());

  useEffect(() => {
    apiRequest('/funding-requests/mine/donations').then(setDonations).catch((err) => onFlash(err.message));
    apiRequest('/scholarships/mine/sponsorships').then(setSponsorships).catch((err) => onFlash(err.message));
    apiRequest('/funding-requests/applications').then(setApplications).catch((err) => onFlash(err.message));
    apiRequest('/funding-requests/mine/saved').then((list) => setSavedIds(list.map((r) => r._id))).catch(() => {});
    apiRequest('/scholarships/mine/deposits').then(setDeposits).catch(() => {});
  }, [onFlash]);

  if (donations === null || sponsorships === null || applications === null) return <p role="status" className="admin-notice">Loading...</p>;

  const involvedRequestIds = new Set([...donations.map((d) => d.fundingRequest?._id).filter(Boolean), ...savedIds]);
  const approvedRequests = applications
    .filter((a) => a.applicationStatus === 'approved' && involvedRequestIds.has(a._id))
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  const walletTransactions = [
    ...deposits.map((d) => ({ date: d.createdAt, label: `Deposit: ${d.currency} ${d.amount} (${DEPOSIT_STATUS[d.status]?.label})` })),
    ...donations.map((d) => ({ date: d.createdAt, label: `${d.type === 'sponsorship' ? 'Sponsorship donation' : 'Donation'}: ${d.currency} ${d.amount} (${DONATION_STATUS[d.status]?.label})` })),
    ...sponsorships.filter((s) => s.paidAmount > 0).map((s) => ({ date: s.updatedAt, label: `Sponsorship payment: ${s.currency} ${s.paidAmount}` }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8);

  function Feed({ title, items, empty }) {
    return (
      <div style={{ marginBottom: 20 }}>
        <h4 className="font-semibold" style={{ fontSize: 15, marginBottom: 10 }}>{title}</h4>
        {items.length === 0 ? (
          <div className="student-empty-state" style={{ border: '1px solid var(--sand-line)', borderRadius: 18, minHeight: 110 }}>
            <FaCalendarCheck aria-hidden="true" />
            <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>{empty}</span>
          </div>
        ) : (
          <div className="card" style={{ padding: 0 }}>
            <div className="dash-list" style={{ gap: 0 }}>
              {items.map((it, i) => (
                <div key={i} className="dash-list-item" style={{ borderBottom: i < items.length - 1 ? '1px solid var(--sand-line)' : 'none' }}>
                  <span className="dash-list-icon c-forest" aria-hidden><FaCalendarCheck size={14} /></span>
                  <div className="dash-list-body"><div className="title">{it.label}</div></div>
                  <span className="dash-list-time">{new Date(it.date).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <h3 className="font-semibold" style={{ marginBottom: 4 }}>Recent Activity</h3>
      <p className="text-xs" style={{ color: 'var(--ink-soft)', marginBottom: 18 }}>"Downloaded receipts" and "Generated impact report" are logged in this browser only (no server record exists for a file download).</p>

      <Feed
        title="Recent Donations"
        items={donations.slice(0, 8).map((d) => ({ date: d.createdAt, label: `${d.currency} ${d.amount} to ${d.fundingRequest?.title || 'a funding request'}` }))}
        empty="No donations yet."
      />
      <Feed
        title="Approved Requests"
        items={approvedRequests.slice(0, 8).map((r) => ({ date: r.updatedAt, label: `Approved: ${r.title}` }))}
        empty="No requests you've approved yet."
      />
      <Feed
        title="Sponsored Student Updates"
        items={[...sponsorships].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 8).map((s) => ({ date: s.updatedAt, label: `${s.student?.fullName || 'Student'}: sponsorship is now ${SPONSORSHIP_STATUS[s.status]?.label || s.status}` }))}
        empty="No sponsorships yet."
      />
      <Feed title="Wallet Transactions" items={walletTransactions} empty="No wallet activity yet." />
      <Feed
        title="Downloaded Receipts"
        items={localLog.filter((l) => l.type === 'receipt').slice(0, 8).map((l) => ({ date: l.date, label: l.label }))}
        empty="No receipts downloaded in this browser yet."
      />
      <Feed
        title="Generated Impact Report"
        items={localLog.filter((l) => l.type === 'impact_report').slice(0, 8).map((l) => ({ date: l.date, label: l.label }))}
        empty="No impact reports generated in this browser yet."
      />
    </div>
  );
}

// Donor sidebar — Verification/Documents, same submitMyDocuments endpoint used by Agent (it's
// generic per-role, `/roles/mine/:role/documents`), just pointed at 'donor' instead.
function DonorVerificationPanel({ onFlash }) {
  const [request, setRequest] = useState(undefined);
  const [docUrl, setDocUrl] = useState('');

  function load() {
    apiRequest('/roles/my-requests').then((list) => setRequest(list.find((r) => r.requestedRole === 'donor') || null)).catch(() => setRequest(null));
  }
  useEffect(load, []);

  async function addDocument() {
    if (!docUrl.trim() || !request) return;
    try {
      await apiRequest(`/roles/mine/donor/documents`, { method: 'POST', body: { documents: [...(request.documents || []), docUrl.trim()] } });
      onFlash('Document submitted.', 'success');
      setDocUrl('');
      load();
    } catch (err) { onFlash(err.message); }
  }
  async function removeDocument(url) {
    try {
      await apiRequest(`/roles/mine/donor/documents`, { method: 'POST', body: { documents: (request.documents || []).filter((d) => d !== url) } });
      load();
    } catch (err) { onFlash(err.message); }
  }

  if (request === undefined) return <p role="status" className="admin-notice">Loading...</p>;

  const VERIFICATION_LABEL = { approved: 'Verified', pending: 'Pending Review', under_review: 'Under Review', rejected: 'Rejected' };
  const VERIFICATION_TAG = { approved: 'approved', pending: 'pending', under_review: 'pending', rejected: 'rejected' };
  const status = request?.status || 'pending';

  return (
    <div>
      <h3 className="font-semibold" style={{ marginBottom: 16 }}>Verification / Documents</h3>

      <div className="flex items-start" style={{ gap: 12, padding: 18, borderRadius: 16, background: 'var(--sand)', marginBottom: 20 }}>
        <span style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--paper-raised)', color: 'var(--forest)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
          <FaShieldHalved aria-hidden="true" size={15} />
        </span>
        <div>
          <div className="flex items-center" style={{ gap: 8 }}>
            <strong className="text-sm">Status:</strong>
            <Tag status={VERIFICATION_TAG[status]} label={VERIFICATION_LABEL[status]} />
          </div>
          {status === 'rejected' && request?.reviewNotes && <p className="text-xs" style={{ color: 'var(--rose)', marginTop: 6 }}>{request.reviewNotes}</p>}
          <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 6, lineHeight: 1.6 }}>Only a Super Admin-verified donor can post scholarships or donate. Submit documents (ID, proof of funds, organization registration, etc.) for review.</p>
        </div>
      </div>

      <div className="card" style={{ padding: 20 }}>
        <p className="text-xs" style={{ fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--ink-soft)', marginBottom: 14 }}>Submitted Documents</p>
        <div className="flex items-end flex-wrap" style={{ gap: 12, marginBottom: 16 }}>
          <input className="form-input" placeholder="Paste a document link (PDF/image URL)" value={docUrl} onChange={(e) => setDocUrl(e.target.value)} style={{ flex: '1 1 auto', minWidth: 0 }} />
          <button type="button" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.78rem', flexShrink: 0 }} onClick={addDocument}>Add Document</button>
        </div>
        {(request?.documents || []).length === 0 ? (
          <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>No documents submitted yet.</p>
        ) : (
          <div style={{ display: 'grid', gap: 8 }}>
            {(request?.documents || []).map((d) => (
              <div key={d} className="flex items-center justify-between flex-wrap" style={{ gap: 10, padding: 12, borderRadius: 12, background: 'var(--sand)' }}>
                <a href={d} target="_blank" rel="noreferrer" className="text-xs" style={{ overflowWrap: 'anywhere' }}>📄 {d}</a>
                <button type="button" className="btn" style={{ padding: '5px 12px', fontSize: '0.72rem', background: 'var(--paper-raised)', flexShrink: 0 }} onClick={() => removeDocument(d)}>Remove</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Donor sidebar — Sponsored Students: a roster/people view over the same mySponsorships data as
// Active Sponsorships (item 5), but framed around the student rather than the payment ledger.
function SponsoredStudentsPanel({ onFlash }) {
  const [sponsorships, setSponsorships] = useState(null);
  useEffect(() => { apiRequest('/scholarships/mine/sponsorships').then(setSponsorships).catch((err) => onFlash(err.message)); }, [onFlash]);

  if (sponsorships === null) return <p role="status" className="admin-notice">Loading...</p>;
  const live = sponsorships.filter((s) => s.status !== 'cancelled');

  return (
    <div>
      <h3 className="font-semibold mb-2">Sponsored Students</h3>
      <p className="text-xs mb-3" style={{ color: 'var(--ink-soft)' }}>Every student you sponsor or have sponsored, past and present.</p>
      <Table
        headers={['Student', 'Institution', 'Program', 'Term', 'Scholarship', 'Status']}
        rows={live.map((s) => [
          s.student?.fullName || '—',
          s.institution?.name || 'Not set',
          s.program || 'Not set',
          s.currentTerm || 'Not set',
          s.scholarship?.title || '—',
          <Tag status={SPONSORSHIP_STATUS[s.status]?.tag} label={SPONSORSHIP_STATUS[s.status]?.label} />
        ])}
        empty="No sponsored students yet."
      />
    </div>
  );
}

// Donor sidebar — Receipts: a focused view of just the downloadable receipts (the same merged
// transaction data as Wallet & Payments, minus the balance cards / Add Funds workflow).
function DonorReceiptsPanel({ onFlash }) {
  const [deposits, setDeposits] = useState(null);
  const [donations, setDonations] = useState(null);
  const [sponsorships, setSponsorships] = useState(null);

  useEffect(() => {
    apiRequest('/scholarships/mine/deposits').then(setDeposits).catch((err) => onFlash(err.message));
    apiRequest('/funding-requests/mine/donations').then(setDonations).catch((err) => onFlash(err.message));
    apiRequest('/scholarships/mine/sponsorships').then(setSponsorships).catch((err) => onFlash(err.message));
  }, [onFlash]);

  if (deposits === null || donations === null || sponsorships === null) return <p role="status" className="admin-notice">Loading...</p>;

  const liveSponsorships = sponsorships.filter((s) => s.status !== 'cancelled');
  const transactions = [
    ...deposits.map((d) => ({ type: 'Deposit', date: d.createdAt, amount: d.amount, currency: d.currency, statusLabel: DEPOSIT_STATUS[d.status]?.label, tag: DEPOSIT_STATUS[d.status]?.tag, ref: d._id })),
    ...donations.map((d) => ({ type: d.type === 'sponsorship' ? 'Sponsorship Donation' : 'Donation', date: d.createdAt, amount: d.amount, currency: d.currency, statusLabel: DONATION_STATUS[d.status]?.label, tag: DONATION_STATUS[d.status]?.tag, ref: d.transactionId })),
    ...liveSponsorships.filter((s) => s.paidAmount > 0).map((s) => ({ type: 'Sponsorship Payment', date: s.updatedAt, amount: s.paidAmount, currency: s.currency, statusLabel: SPONSORSHIP_STATUS[s.status]?.label, tag: SPONSORSHIP_STATUS[s.status]?.tag, ref: s._id }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div>
      <h3 className="font-semibold mb-2">Receipts</h3>
      <p className="text-xs mb-3" style={{ color: 'var(--ink-soft)' }}>Every real transaction receipt, downloadable as a text file.</p>
      <Table
        headers={['Type', 'Date', 'Amount', 'Status', 'Reference', 'Actions']}
        rows={transactions.map((tx) => [
          tx.type,
          new Date(tx.date).toLocaleDateString(),
          `${tx.currency} ${tx.amount}`,
          <Tag status={tx.tag} label={tx.statusLabel} />,
          tx.ref,
          <button type="button" className="btn" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={() => { downloadTextFile(`receipt-${tx.ref}.txt`, generateTransactionReceipt(tx)); logDonorActivity('receipt', `Downloaded receipt — ${tx.type} (${tx.currency} ${tx.amount})`); }}>Download Receipt</button>
        ])}
        empty="No receipts yet."
      />
    </div>
  );
}

// Donor Dashboard Home — item 1 (Donor Profile), same real-data pattern as Agent's: RoleRequest
// for verification, User.status for account status, computed profile completeness.
function DonorDashboardPanel({ user, onFlash, onNavigate }) {
  const [verification, setVerification] = useState(null);
  const [scholarships, setScholarships] = useState(null);
  const [summary, setSummary] = useState(null);
  const [recommended, setRecommended] = useState(null);
  const [sponsorships, setSponsorships] = useState(null);
  const [donations, setDonations] = useState(null);
  const [applications, setApplications] = useState(null);
  const [savedIds, setSavedIds] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [notifications, setNotifications] = useState(null);

  useEffect(() => {
    apiRequest('/roles/my-requests').then((list) => setVerification(list.find((r) => r.requestedRole === 'donor') || null)).catch(() => setVerification(null));
    apiRequest('/scholarships/mine/list').then(setScholarships).catch(() => setScholarships([]));
    apiRequest('/scholarships/mine/summary').then(setSummary).catch((err) => onFlash(err.message));
    apiRequest('/funding-requests/recommended').then(setRecommended).catch(() => setRecommended([]));
    apiRequest('/scholarships/mine/sponsorships').then(setSponsorships).catch(() => setSponsorships([]));
    apiRequest('/funding-requests/mine/donations').then(setDonations).catch(() => setDonations([]));
    apiRequest('/funding-requests/applications').then(setApplications).catch(() => setApplications([]));
    apiRequest('/funding-requests/mine/saved').then((list) => setSavedIds(list.map((r) => r._id))).catch(() => {});
    apiRequest('/scholarships/mine/deposits').then(setWallet).catch(() => setWallet([]));
    apiRequest('/notifications/mine').then((list) => setNotifications(list.slice(0, 5))).catch(() => setNotifications([]));
  }, [onFlash]);

  const VERIFICATION_LABEL = { approved: 'Verified', pending: 'Pending Review', under_review: 'Under Review', rejected: 'Rejected' };
  const VERIFICATION_TAG = { approved: 'approved', pending: 'pending', under_review: 'pending', rejected: 'rejected' };
  const verStatus = verification?.status || 'pending';

  const ACCOUNT_STATUS_LABEL = { active: 'Active', suspended: 'Suspended', disabled: 'Inactive' };
  const ACCOUNT_STATUS_TAG = { active: 'approved', suspended: 'rejected', disabled: 'pending' };

  const isOrg = user?.donorType === 'organization';
  const profileFields = isOrg
    ? [user?.profilePhoto, user?.donorType, user?.companyName, user?.country]
    : [user?.profilePhoto, user?.donorType, user?.country, user?.phone];
  const completeness = Math.round((profileFields.filter(Boolean).length / profileFields.length) * 100);

  // Donation/sponsorship totals span whatever currencies the donor's scholarships actually
  // use — shown per-currency rather than a single misleading sum across different currencies.
  const currencyEntries = summary ? Object.entries(summary.totalsByCurrency) : [];
  const fmtMoney = (field) => currencyEntries.length === 0 ? '0' : currencyEntries.map(([cur, t]) => `${cur} ${t[field]}`).join(', ');

  return (
    <>
      {/* 1. Donor Profile */}
      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <div className="flex items-center justify-between flex-wrap" style={{ gap: 14 }}>
          <div className="flex items-center" style={{ gap: 14 }}>
            {user?.profilePhoto
              ? <img src={user.profilePhoto} alt="" style={{ width: 48, height: 48, borderRadius: isOrg ? 10 : '50%', objectFit: 'cover', flexShrink: 0 }} />
              : <div style={{ width: 48, height: 48, borderRadius: isOrg ? 10 : '50%', background: 'var(--emerald)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, flexShrink: 0 }}>{(user?.fullName || '?')[0]}</div>}
            <div>
              <strong className="text-sm">{user?.fullName}</strong>
              <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 2 }}>
                {user?.donorType ? (user.donorType === 'organization' ? 'Organization' : 'Individual') : 'Donor type not set'}
                {isOrg && ` · ${user?.companyName || 'Organization name not set'}`}
                {' · '}{user?.country || 'Country not set'}
              </p>
              <div className="flex items-center" style={{ gap: 8, marginTop: 6 }}>
                <Tag status={VERIFICATION_TAG[verStatus]} label={VERIFICATION_LABEL[verStatus]} />
                <Tag status={ACCOUNT_STATUS_TAG[user?.status] || 'pending'} label={ACCOUNT_STATUS_LABEL[user?.status] || user?.status} />
              </div>
            </div>
          </div>
          <div style={{ minWidth: 160 }}>
            <div className="student-progress-row" style={{ marginBottom: 6 }}>
              <span className="text-xs">Profile</span>
              <strong className="text-xs">{completeness}%</strong>
            </div>
            <progress className="student-progress-bar" max="100" value={completeness} aria-label="Profile completeness" />
          </div>
        </div>
      </div>

      {/* 2. Main Summary Cards */}
      <div className="grid grid-cols-3 md:grid-cols-4" style={{ gap: 14, marginBottom: 20 }}>
        <SummaryCard title="Total Donations" count={fmtMoney('totalDonations')} onClick={() => onNavigate?.('donationHistory')} />
        <SummaryCard title="Active Sponsorships" count={summary?.activeSponsorships ?? '—'} onClick={() => onNavigate?.('activeSponsorships')} />
        <SummaryCard title="Sponsored Students" count={summary?.sponsoredStudents ?? '—'} onClick={() => onNavigate?.('sponsoredStudents')} />
        <SummaryCard title="Pending Requests" count={summary?.pendingRequests ?? '—'} onClick={() => onNavigate?.('fundingApplications')} />
        <SummaryCard title="Total Impact" count={summary ? `${summary.totalImpact} students` : '—'} onClick={() => onNavigate?.('impactOverview')} />
        <SummaryCard title="Available Wallet Balance" count={fmtMoney('walletBalance')} onClick={() => onNavigate?.('wallet')} />
        <SummaryCard title="Upcoming Commitments" count={summary?.upcomingCommitments ?? '—'} onClick={() => onNavigate?.('activeSponsorships')} />
        <SummaryCard title="Completed Donations" count={summary?.completedDonations ?? '—'} onClick={() => onNavigate?.('donationHistory')} />
      </div>

      {/* 3. Recommended Requests */}
      <div className="dash-section-title"><h2>Recommended Requests</h2></div>
      {(recommended?.length ?? 0) === 0 ? (
        <div className="student-empty-state" style={{ border: '1px solid var(--sand-line)', borderRadius: 18, marginBottom: 20 }}>
          <FaHandshake aria-hidden="true" />
          <p>{recommended === null ? 'Loading...' : 'No recommended requests right now'}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 10, marginBottom: 20 }}>
          {recommended?.slice(0, 5).map((r) => (
            <div key={r._id} className="hover-card card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--sand)', color: 'var(--emerald)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><FaHandshake aria-hidden="true" size={14} /></span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <strong className="text-sm">{r.title}</strong>
                <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 2 }}>{r.requestedBy?.fullName || r.institution?.name} · {r.currency} {r.remainingAmount} remaining</p>
              </div>
            </div>
          ))}
          <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.75rem', justifySelf: 'start' }} onClick={() => onNavigate?.('recommendedFunding')}>View All</button>
        </div>
      )}

      {/* 4. Active Sponsorships */}
      <div className="dash-section-title"><h2>Active Sponsorships</h2></div>
      {(sponsorships?.filter((s) => s.status !== 'cancelled').length ?? 0) === 0 ? (
        <div className="student-empty-state" style={{ border: '1px solid var(--sand-line)', borderRadius: 18, marginBottom: 20 }}>
          <FaGraduationCap aria-hidden="true" />
          <p>{sponsorships === null ? 'Loading...' : 'No active sponsorships yet'}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 10, marginBottom: 20 }}>
          {sponsorships?.filter((s) => s.status !== 'cancelled').slice(0, 5).map((s) => (
            <div key={s._id} className="card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--emerald)', color: '#fff', display: 'grid', placeItems: 'center', flexShrink: 0, fontWeight: 700, fontSize: 13 }}>{(s.student?.fullName || '?')[0]}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <strong className="text-sm">{s.student?.fullName}</strong>
                <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 2 }}>{s.currency} {s.paidAmount} of {s.currency} {s.amount} paid</p>
              </div>
              <Tag status={SPONSORSHIP_STATUS[s.status]?.tag} label={SPONSORSHIP_STATUS[s.status]?.label} />
            </div>
          ))}
          <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.75rem', justifySelf: 'start' }} onClick={() => onNavigate?.('activeSponsorships')}>View All</button>
        </div>
      )}

      {/* 5. Donation History */}
      <div className="dash-section-title"><h2>Donation History</h2></div>
      {(donations?.length ?? 0) === 0 ? (
        <div className="student-empty-state" style={{ border: '1px solid var(--sand-line)', borderRadius: 18, marginBottom: 20 }}>
          <FaWallet aria-hidden="true" />
          <p>{donations === null ? 'Loading...' : 'No donations yet'}</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, marginBottom: 20 }}>
          <div className="dash-list" style={{ gap: 0 }}>
            {donations?.slice(0, 5).map((d, idx, arr) => (
              <div key={d._id} className="dash-list-item" style={{ borderBottom: idx < Math.min(arr.length, 5) - 1 ? '1px solid var(--sand-line)' : 'none' }}>
                <span className="dash-list-icon c-emerald" aria-hidden><FaWallet size={14} /></span>
                <div className="dash-list-body"><div className="title">{d.currency} {d.amount}</div><div className="desc">{d.fundingRequest?.title || 'Funding request'} · {new Date(d.createdAt).toLocaleDateString()}</div></div>
                <Tag status={DONATION_STATUS[d.status]?.tag} label={DONATION_STATUS[d.status]?.label} />
              </div>
            ))}
          </div>
          <div style={{ padding: 12 }}>
            <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.75rem' }} onClick={() => onNavigate?.('donationHistory')}>View All</button>
          </div>
        </div>
      )}

      {/* 6. Impact Overview — the panel renders its own "Impact Overview" heading already,
          so no separate SectionHeading here (that was causing a duplicate title). */}
      <ImpactOverviewPanel onFlash={onFlash} />

      {/* 7. Applications */}
      <div className="dash-section-title"><h2>Funding Request Applications</h2></div>
      {(applications?.length ?? 0) === 0 ? (
        <div className="student-empty-state" style={{ border: '1px solid var(--sand-line)', borderRadius: 18, marginBottom: 20 }}>
          <FaFileLines aria-hidden="true" />
          <p>{applications === null ? 'Loading...' : 'No applications yet'}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 10, marginBottom: 20 }}>
          {applications?.slice(0, 5).map((r) => (
            <div key={r._id} className="card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <strong className="text-sm">{r.title}</strong>
                <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 2 }}>{r.requestedBy?.fullName || '—'} · {r.currency} {r.requiredAmount}</p>
              </div>
              <Tag status={FUNDING_APP_STATUS[r.applicationStatus]?.tag} label={FUNDING_APP_STATUS[r.applicationStatus]?.label} />
            </div>
          ))}
          <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.75rem', justifySelf: 'start' }} onClick={() => onNavigate?.('fundingApplications')}>View All</button>
        </div>
      )}

      {/* 8. Wallet */}
      <div className="dash-section-title"><h2>Wallet</h2></div>
      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <div className="flex items-center" style={{ gap: 10, marginBottom: 10 }}>
          <span style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--sand)', color: 'var(--emerald)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><FaWallet aria-hidden="true" size={14} /></span>
          <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>Total Deposited</p>
        </div>
        <strong style={{ fontSize: 24, fontFamily: 'Fraunces, serif', display: 'block' }}>{wallet === null ? 'Loading...' : (wallet.filter((d) => d.status === 'confirmed').length === 0 ? '0' : Object.entries(wallet.filter((d) => d.status === 'confirmed').reduce((acc, d) => { acc[d.currency] = (acc[d.currency] || 0) + d.amount; return acc; }, {})).map(([c, v]) => `${c} ${v}`).join(', '))}</strong>
        <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.75rem', marginTop: 14 }} onClick={() => onNavigate?.('wallet')}>Open Wallet</button>
      </div>

      {/* 9. Notifications / Recent Activity */}
      <div className="dash-section-title"><h2>Notifications</h2></div>
      {(notifications?.length ?? 0) === 0 ? (
        <div className="student-empty-state" style={{ border: '1px solid var(--sand-line)', borderRadius: 18, marginBottom: 20 }}>
          <FaBell aria-hidden="true" />
          <p>{notifications === null ? 'Loading...' : 'No notifications yet'}</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, marginBottom: 20 }}>
          <div className="dash-list" style={{ gap: 0 }}>
            {notifications?.map((n, idx) => (
              <div key={n._id} className={`dash-list-item${!n.read ? ' unread' : ''}`} style={{ borderBottom: idx < notifications.length - 1 ? '1px solid var(--sand-line)' : 'none' }}>
                <span className="dash-list-icon c-gold" aria-hidden><FaBell size={14} /></span>
                <div className="dash-list-body"><div className="title" style={{ fontWeight: n.read ? 400 : 600 }}>{n.title}</div></div>
                <span className="dash-list-time">{new Date(n.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
          <div style={{ padding: 12 }}>
            <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.75rem' }} onClick={() => onNavigate?.('donorNotifications')}>View All</button>
          </div>
        </div>
      )}
      <div className="dash-section-title"><h2>Recent Activity</h2></div>
      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>Donations, sponsorships, wallet transactions, receipts and impact reports — all in one feed.</p>
        <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.75rem', marginTop: 14 }} onClick={() => onNavigate?.('donorRecentActivity')}>View Recent Activity</button>
      </div>

      {/* 10. Quick Actions */}
      <QuickActions
        actions={[
          { label: 'Explore Requests', key: 'opportunities' },
          { label: 'Donate Now', key: 'recommendedFunding' },
          { label: 'Sponsor a Student', key: 'opportunities' },
          { label: 'Review Applications', key: 'fundingApplications' },
          { label: 'View Sponsorships', key: 'activeSponsorships' },
          { label: 'Add Funds', key: 'wallet' },
          { label: 'View Impact Report', key: 'impactReports' },
          { label: 'Download Receipts', key: 'receipts' }
        ]}
        onNavigate={onNavigate}
      />
    </>
  );
}

// ----------------------------------------------------------- Marketplace Seller

function SellerWorkspace({ tab, user, onFlash, onChanged, onNavigate }) {
  if (tab === 'profile') return <><ProfilePanel user={user} onFlash={onFlash} onChanged={onChanged} /><RolesPanel onFlash={onFlash} onChanged={onChanged} /><SupportComplaintPanel onFlash={onFlash} /></>;
  if (tab === 'summary') return <SellerDashboardPanel user={user} onFlash={onFlash} onChanged={onChanged} onNavigate={onNavigate} />;
  if (tab === 'listings') return <MyListingsPanel onFlash={onFlash} />;
  if (tab === 'orders') return <SellerOrdersPanel onFlash={onFlash} />;
  if (tab === 'sellerWallet') return <SellerWalletPanel onFlash={onFlash} />;
  if (tab === 'sellerReviews') return <SellerReviewsPanel onFlash={onFlash} />;
  if (tab === 'sellerMessages') return <SellerMessagesPanel onFlash={onFlash} />;
  if (tab === 'sellerVerification') return <SellerVerificationPanel onFlash={onFlash} />;
  if (tab === 'addListing') return <AddListingPanel onFlash={onFlash} />;
  if (tab === 'services') return <ServicesPanel onFlash={onFlash} />;
  if (tab === 'inventory') return <InventoryPanel onFlash={onFlash} />;
  if (tab === 'returnsRefunds') return <ReturnsRefundsPanel onFlash={onFlash} />;
  if (tab === 'salesAnalytics') return <SalesAnalyticsPanel onFlash={onFlash} />;
  if (tab === 'earningsCommission') return <EarningsCommissionPanel onFlash={onFlash} />;
  if (tab === 'withdrawals') return <WithdrawalsPanel onFlash={onFlash} />;
  if (tab === 'sellerNotifications') return <NotificationsPanel onFlash={onFlash} />;
  return <ComingSoon label={tab} />;
}

// Seller Dashboard Home — item 1 (Seller Profile): store name/logo (User fields, same reuse
// pattern as Employer/Agent/Donor), verification (RoleRequest), rating/review count computed
// live from real Review documents (never fabricated — shows "No reviews yet" honestly), and a
// donor-style profile-completion percentage.
function SellerDashboardPanel({ user, onFlash, onChanged, onNavigate }) {
  const [profile, setProfile] = useState(null);
  const [summary, setSummary] = useState(null);
  const [salesOverview, setSalesOverview] = useState(null);
  const [recentOrders, setRecentOrders] = useState(null);
  const [pendingActions, setPendingActions] = useState(null);
  const [bestSelling, setBestSelling] = useState(null);
  const [inventory, setInventory] = useState(null);
  const [earnings, setEarnings] = useState(null);
  const [stockEdits, setStockEdits] = useState({});
  const [conversations, setConversations] = useState(null);
  const [reviews, setReviews] = useState(null);
  const [notifications, setNotifications] = useState(null);
  const [products, setProducts] = useState(null);
  const [withdrawals, setWithdrawals] = useState(null);

  function load() {
    apiRequest('/marketplace/sellers/mine/profile').then(setProfile).catch((err) => onFlash(err.message));
    apiRequest('/marketplace/sellers/mine/summary').then(setSummary).catch((err) => onFlash(err.message));
    apiRequest('/marketplace/sellers/mine/sales-overview').then(setSalesOverview).catch((err) => onFlash(err.message));
    apiRequest('/marketplace/orders/selling').then(setRecentOrders).catch(() => setRecentOrders([]));
    apiRequest('/marketplace/sellers/mine/pending-actions').then(setPendingActions).catch((err) => onFlash(err.message));
    apiRequest('/marketplace/sellers/mine/best-selling').then(setBestSelling).catch((err) => onFlash(err.message));
    apiRequest('/messages/conversations').then(setConversations).catch(() => setConversations([]));
    apiRequest('/marketplace/sellers/mine/inventory').then(setInventory).catch((err) => onFlash(err.message));
    apiRequest('/marketplace/sellers/mine/earnings').then(setEarnings).catch((err) => onFlash(err.message));
    apiRequest('/marketplace/sellers/mine/reviews').then(setReviews).catch(() => setReviews([]));
    apiRequest('/notifications/mine').then((list) => setNotifications(list.slice(0, 5))).catch(() => setNotifications([]));
    apiRequest('/marketplace/products/mine/list').then(setProducts).catch(() => setProducts([]));
    apiRequest('/marketplace/sellers/mine/withdrawals').then(setWithdrawals).catch(() => setWithdrawals([]));
  }
  useEffect(load, [onFlash]); // eslint-disable-line react-hooks/exhaustive-deps

  async function updateStock(id) {
    const value = stockEdits[id];
    if (value === undefined || value === '') return;
    try {
      await apiRequest(`/marketplace/products/${id}`, { method: 'PATCH', body: { stock: Number(value) } });
      onFlash('Stock updated.', 'success');
      setStockEdits((prev) => { const next = { ...prev }; delete next[id]; return next; });
      load();
    } catch (err) { onFlash(err.message); }
  }

  async function confirmOrder(id) {
    try { await apiRequest(`/marketplace/orders/${id}/status`, { method: 'PATCH', body: { status: 'confirmed' } }); onFlash('Order confirmed.', 'success'); load(); } catch (err) { onFlash(err.message); }
  }
  async function markShipped(id) {
    try { await apiRequest(`/marketplace/orders/${id}/status`, { method: 'PATCH', body: { status: 'shipped' } }); onFlash('Order marked shipped.', 'success'); load(); } catch (err) { onFlash(err.message); }
  }
  async function respondCancellation(id, approve) {
    try { await apiRequest(`/marketplace/orders/${id}/cancellation-response`, { method: 'PATCH', body: { approve } }); onFlash(`Cancellation ${approve ? 'approved' : 'denied'}.`, 'success'); load(); } catch (err) { onFlash(err.message); }
  }
  async function respondRefund(id, approve) {
    try { await apiRequest(`/marketplace/orders/${id}/refund-response`, { method: 'PATCH', body: { approve } }); onFlash(`Refund ${approve ? 'approved' : 'denied'}.`, 'success'); load(); } catch (err) { onFlash(err.message); }
  }

  // Sales/earnings/balances span whatever currencies the seller's orders actually use — shown
  // per-currency rather than a single misleading sum across different currencies.
  const currencyEntries = summary ? Object.entries(summary.totalsByCurrency) : [];
  const fmtMoney = (field) => currencyEntries.length === 0 ? '0' : currencyEntries.map(([cur, t]) => `${cur} ${t[field]}`).join(', ');

  const VERIFICATION_LABEL = { approved: 'Verified', pending: 'Pending Review', under_review: 'Under Review', rejected: 'Rejected' };
  const VERIFICATION_TAG = { approved: 'approved', pending: 'pending', under_review: 'pending', rejected: 'rejected' };
  const verStatus = profile?.verificationStatus || 'pending';

  const profileFields = [user?.profilePhoto, user?.companyName, user?.country, user?.phone];
  const completeness = Math.round((profileFields.filter(Boolean).length / profileFields.length) * 100);

  async function toggleStoreStatus() {
    const next = profile.storeStatus === 'open' ? 'closed' : 'open';
    try {
      await apiRequest('/users/me', { method: 'PATCH', body: { storeStatus: next } });
      onFlash(`Store marked ${next}.`, 'success');
      onChanged?.();
      load();
    } catch (err) { onFlash(err.message); }
  }

  return (
    <>
      {/* 1. Seller Profile */}
      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <div className="flex items-center justify-between flex-wrap" style={{ gap: 14 }}>
          <div className="flex items-center" style={{ gap: 14 }}>
            {user?.profilePhoto
              ? <img src={user.profilePhoto} alt="" style={{ width: 48, height: 48, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
              : <div style={{ width: 48, height: 48, borderRadius: 10, background: 'var(--gold)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, flexShrink: 0 }}>{(user?.companyName || user?.fullName || '?')[0]}</div>}
            <div>
              <strong className="text-sm">{user?.companyName || 'Store name not set'}</strong>
              <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 2 }}>
                {profile?.sellerRating !== null && profile?.sellerRating !== undefined ? <><FaStar size={11} style={{ color: 'var(--gold)', verticalAlign: -1 }} /> {profile.sellerRating} ({profile.totalReviews} review{profile.totalReviews === 1 ? '' : 's'})</> : 'No reviews yet'}
              </p>
              <div className="flex items-center" style={{ gap: 8, marginTop: 6 }}>
                <Tag status={VERIFICATION_TAG[verStatus]} label={VERIFICATION_LABEL[verStatus]} />
                <Tag status={profile?.storeStatus === 'open' ? 'approved' : 'rejected'} label={profile?.storeStatus === 'open' ? 'Store Open' : 'Store Closed'} />
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end" style={{ gap: 10 }}>
            <div style={{ minWidth: 160 }}>
              <div className="student-progress-row" style={{ marginBottom: 6 }}>
                <span className="text-xs">Profile</span>
                <strong className="text-xs">{completeness}%</strong>
              </div>
              <progress className="student-progress-bar" max="100" value={completeness} aria-label="Profile completeness" />
            </div>
            {profile && <button type="button" className="btn" style={{ padding: '5px 14px', fontSize: '0.75rem' }} onClick={toggleStoreStatus}>{profile.storeStatus === 'open' ? 'Close Store' : 'Reopen Store'}</button>}
          </div>
        </div>
      </div>

      {/* 2. Main Summary Cards */}
      <div className="grid grid-cols-3 md:grid-cols-4 gap-3" style={{ marginBottom: 20 }}>
        <SummaryCard title="Total Products/Listings" count={summary?.totalListings ?? '—'} onClick={() => onNavigate?.('listings')} />
        <SummaryCard title="Active Listings" count={summary?.activeListings ?? '—'} onClick={() => onNavigate?.('listings')} />
        <SummaryCard title="Pending Orders" count={summary?.pendingOrders ?? '—'} onClick={() => onNavigate?.('orders')} />
        <SummaryCard title="Completed Orders" count={summary?.completedOrders ?? '—'} onClick={() => onNavigate?.('orders')} />
        <SummaryCard title="Total Sales" count={fmtMoney('totalSales')} onClick={() => onNavigate?.('salesAnalytics')} />
        <SummaryCard title="Total Earnings" count={fmtMoney('totalEarnings')} onClick={() => onNavigate?.('earningsCommission')} />
        <SummaryCard title="Available Balance" count={fmtMoney('availableBalance')} onClick={() => onNavigate?.('sellerWallet')} />
        <SummaryCard title="Pending Balance" count={fmtMoney('pendingBalance')} onClick={() => onNavigate?.('sellerWallet')} />
      </div>

      {/* 3. Sales Overview */}
      <div className="dash-section-title"><h2>Sales Overview</h2></div>
      {Object.keys(salesOverview?.totalsByCurrency || {}).length === 0 && (
        <p className="text-xs mb-4" style={{ color: 'var(--ink-soft)' }}>{salesOverview === null ? 'Loading...' : 'No sales yet.'}</p>
      )}
      {Object.entries(salesOverview?.totalsByCurrency || {}).map(([currency, s]) => {
        const maxDay = Math.max(...s.dailySales.map((d) => d.total), 1);
        return (
          <div key={currency} className="card" style={{ padding: 18, marginBottom: 20 }}>
            <div className="flex items-center" style={{ gap: 10, marginBottom: 14 }}>
              <span style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--sand)', color: 'var(--forest)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><FaChartLine aria-hidden="true" size={14} /></span>
              <strong className="text-sm">Sales Overview — {currency}</strong>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {[
                { label: 'Today', value: s.today, pct: s.todayChangePct, note: 'vs yesterday' },
                { label: 'This Week', value: s.thisWeek, pct: s.weekChangePct, note: 'vs last week' },
                { label: 'This Month', value: s.thisMonth, pct: s.monthChangePct, note: 'vs last month' },
                { label: 'Total Revenue', value: s.totalRevenue, pct: null, note: `${s.orderCount} order${s.orderCount === 1 ? '' : 's'}` }
              ].map((row) => (
                <div key={row.label} style={{ padding: 12, borderRadius: 14, background: 'var(--sand)' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--ink-soft)' }}>{row.label}</span>
                  <strong style={{ fontSize: 20, fontFamily: 'Fraunces, serif', display: 'block', marginTop: 4 }}>{currency} {row.value}</strong>
                  <span className="text-xs" style={{ color: row.pct !== null ? (row.pct >= 0 ? 'var(--emerald)' : 'var(--rose, #e11d48)') : 'var(--ink-soft)' }}>
                    {row.pct !== null ? `${row.pct >= 0 ? '+' : ''}${row.pct}% ${row.note}` : row.note}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs mb-1" style={{ color: 'var(--ink-soft)' }}>Last 14 days (delivered/completed orders only):</p>
            <div className="flex items-end gap-1" style={{ height: 70 }}>
              {s.dailySales.map((d) => (
                <div key={d.date} title={`${d.date}: ${currency} ${d.total}`} style={{ flex: 1, height: `${Math.max((d.total / maxDay) * 100, 3)}%`, background: 'var(--gold)', borderRadius: '2px 2px 0 0' }} />
              ))}
            </div>
          </div>
        );
      })}

      {/* 4. Recent Orders */}
      <div className="dash-section-title"><h2>Recent Orders</h2></div>
      {(recentOrders?.length ?? 0) === 0 ? (
        <div className="student-empty-state" style={{ border: '1px solid var(--sand-line)', borderRadius: 18, marginBottom: 20 }}>
          <FaCartShopping aria-hidden="true" />
          <p>{recentOrders === null ? 'Loading...' : 'No orders received yet'}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 10, marginBottom: 20 }}>
          {recentOrders?.slice(0, 5).map((o) => (
            <div key={o._id} className="hover-card card flex items-center justify-between flex-wrap" style={{ padding: 14, gap: 12 }}>
              <div className="flex items-center" style={{ gap: 12, minWidth: 0 }}>
                <span style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--sand)', color: 'var(--forest)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><FaCartShopping aria-hidden="true" size={13} /></span>
                <div style={{ minWidth: 0 }}>
                  <strong className="text-sm">{o.product?.title}</strong>
                  <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 2 }}>{o.buyer?.fullName} · Qty {o.quantity} · {o.currency} {o.totalPrice} · {new Date(o.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2" style={{ flexShrink: 0 }}>
                <Tag status={PAYMENT_STATUS[o.paymentStatus]?.tag} label={PAYMENT_STATUS[o.paymentStatus]?.label} />
                <Tag status={ORDER_STATUS[o.status]?.tag} label={ORDER_STATUS[o.status]?.label} />
              </div>
            </div>
          ))}
          <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.75rem', justifySelf: 'start' }} onClick={() => onNavigate?.('orders')}>View All</button>
        </div>
      )}

      {/* Listings — per the parent layout order, a quick preview before Pending Actions */}
      <div className="dash-section-title"><h2>Listings</h2></div>
      {(products?.length ?? 0) === 0 ? (
        <div className="student-empty-state" style={{ border: '1px solid var(--sand-line)', borderRadius: 18, marginBottom: 20 }}>
          <FaBoxOpen aria-hidden="true" />
          <p>{products === null ? 'Loading...' : 'No listings yet'}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 10, marginBottom: 20 }}>
          {products?.slice(0, 5).map((p) => {
            const st = PRODUCT_STATUS[p.status] || PRODUCT_STATUS.draft;
            return (
              <div key={p._id} className="hover-card card flex items-center justify-between flex-wrap" style={{ padding: 14, gap: 12 }}>
                <div className="flex items-center" style={{ gap: 12, minWidth: 0 }}>
                  <span style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--sand)', color: 'var(--gold)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><FaBoxOpen aria-hidden="true" size={13} /></span>
                  <div style={{ minWidth: 0 }}>
                    <strong className="text-sm">{p.title}</strong>
                    <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 2 }}>{p.category} · {p.currency} {p.price}</p>
                  </div>
                </div>
                <Tag status={st.tag} label={st.label} />
              </div>
            );
          })}
          <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.75rem', justifySelf: 'start' }} onClick={() => onNavigate?.('listings')}>View All</button>
        </div>
      )}

      {/* 6. Pending Actions */}
      <div className="dash-section-title"><h2>Pending Actions</h2></div>
      {pendingActions === null && <p className="text-xs mb-4" style={{ color: 'var(--ink-soft)' }}>Loading...</p>}
      {pendingActions && (() => {
        const Header = ({ icon: Icon, color, title, count }) => (
          <div className="flex items-center" style={{ gap: 10, marginBottom: 10 }}>
            <span style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--sand)', color: `var(--${color})`, display: 'grid', placeItems: 'center', flexShrink: 0 }}><Icon aria-hidden="true" size={13} /></span>
            <strong className="text-sm">{title} ({count})</strong>
          </div>
        );
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3" style={{ marginBottom: 20 }}>
            <div className="card" style={{ padding: 16 }}>
              <Header icon={FaCartShopping} color="forest" title="New Orders Requiring Confirmation" count={pendingActions.newOrders.length} />
              {pendingActions.newOrders.length === 0 && <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>None.</p>}
              {pendingActions.newOrders.slice(0, 5).map((o) => (
                <div key={o._id} className="flex items-center justify-between gap-2 mt-2">
                  <span className="text-xs">{o.buyer?.fullName} — {o.product?.title}</span>
                  <button type="button" className="btn" style={{ padding: '3px 10px', fontSize: '0.7rem' }} onClick={() => confirmOrder(o._id)}>Confirm</button>
                </div>
              ))}
            </div>

            <div className="card" style={{ padding: 16 }}>
              <Header icon={FaClipboardList} color="gold" title="Products Pending Approval" count={pendingActions.pendingApprovalProducts.length} />
              {pendingActions.pendingApprovalProducts.length === 0 && <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>None.</p>}
              {pendingActions.pendingApprovalProducts.slice(0, 5).map((p) => <p key={p._id} className="text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>{p.title}</p>)}
              {pendingActions.pendingApprovalProducts.length > 0 && <p className="text-xs mt-2" style={{ color: 'var(--ink-soft)' }}>Awaiting Super Admin review.</p>}
            </div>

            <div className="card" style={{ padding: 16 }}>
              <Header icon={FaTriangleExclamation} color="gold" title="Low-Stock Products" count={pendingActions.lowStockProducts.length} />
              {pendingActions.lowStockProducts.length === 0 && <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>None.</p>}
              {pendingActions.lowStockProducts.slice(0, 5).map((p) => <p key={p._id} className="text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>{p.title} — {p.stock} left</p>)}
            </div>

            <div className="card" style={{ padding: 16 }}>
              <Header icon={FaTruck} color="forest" title="Orders Requiring Shipment" count={pendingActions.ordersRequiringShipment.length} />
              {pendingActions.ordersRequiringShipment.length === 0 && <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>None.</p>}
              {pendingActions.ordersRequiringShipment.slice(0, 5).map((o) => (
                <div key={o._id} className="flex items-center justify-between gap-2 mt-2">
                  <span className="text-xs">{o.buyer?.fullName} — {o.product?.title}</span>
                  <button type="button" className="btn" style={{ padding: '3px 10px', fontSize: '0.7rem' }} onClick={() => markShipped(o._id)}>Mark Shipped</button>
                </div>
              ))}
            </div>

            <div className="card" style={{ padding: 16 }}>
              <Header icon={FaXmark} color="rose" title="Buyer Cancellation Requests" count={pendingActions.cancellationRequests.length} />
              {pendingActions.cancellationRequests.length === 0 && <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>None.</p>}
              {pendingActions.cancellationRequests.slice(0, 5).map((o) => (
                <div key={o._id} className="mt-2">
                  <p className="text-xs">{o.buyer?.fullName} — {o.product?.title}{o.cancellationReason ? `: "${o.cancellationReason}"` : ''}</p>
                  <div className="flex gap-2 mt-1">
                    <button type="button" className="btn btn-primary" style={{ padding: '3px 10px', fontSize: '0.7rem' }} onClick={() => respondCancellation(o._id, true)}>Approve</button>
                    <button type="button" className="btn" style={{ padding: '3px 10px', fontSize: '0.7rem' }} onClick={() => respondCancellation(o._id, false)}>Deny</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="card" style={{ padding: 16 }}>
              <Header icon={FaSackDollar} color="rose" title="Refund/Return Requests" count={pendingActions.refundRequests.length} />
              {pendingActions.refundRequests.length === 0 && <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>None.</p>}
              {pendingActions.refundRequests.slice(0, 5).map((o) => (
                <div key={o._id} className="mt-2">
                  <p className="text-xs">{o.buyer?.fullName} — {o.product?.title}{o.refundReason ? `: "${o.refundReason}"` : ''}</p>
                  <div className="flex gap-2 mt-1">
                    <button type="button" className="btn btn-primary" style={{ padding: '3px 10px', fontSize: '0.7rem' }} onClick={() => respondRefund(o._id, true)}>Approve</button>
                    <button type="button" className="btn" style={{ padding: '3px 10px', fontSize: '0.7rem' }} onClick={() => respondRefund(o._id, false)}>Deny</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="card" style={{ padding: 16 }}>
              <Header icon={FaCommentDots} color="forest" title="Unanswered Buyer Messages" count={pendingActions.unansweredMessages.length} />
              {pendingActions.unansweredMessages.length === 0 && <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>None.</p>}
              {pendingActions.unansweredMessages.slice(0, 5).map((m) => <p key={m.buyer._id} className="text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>{m.buyer.fullName}: "{m.lastMessage}"</p>)}
              {pendingActions.unansweredMessages.length > 0 && <button type="button" className="btn mt-2" style={{ padding: '4px 12px', fontSize: '0.75rem' }} onClick={() => onNavigate?.('sellerMessages')}>Reply</button>}
            </div>
          </div>
        );
      })()}

      {/* 7. Best-Selling Products */}
      <div className="dash-section-title"><h2>Best-Selling Products</h2></div>
      <Table
        headers={['Product Name', 'Units Sold', 'Total Revenue', 'Current Stock', 'Rating']}
        rows={(bestSelling || []).map((p) => [
          p.productName,
          p.unitsSold,
          `${p.currency} ${p.totalRevenue}`,
          p.currentStock ?? '—',
          p.rating !== null ? `★ ${p.rating}` : 'No reviews yet'
        ])}
        loading={bestSelling === null}
        empty="No sales yet."
      />

      {/* 8. Inventory Overview */}
      <div className="dash-section-title"><h2>Inventory Overview</h2></div>
      <p className="text-xs mb-2" style={{ color: 'var(--ink-soft)' }}>Physical listings only — digital products/services don't track stock.</p>
      {inventory && inventory.items.length === 0 && <p className="text-xs mb-4" style={{ color: 'var(--ink-soft)' }}>No physical listings yet.</p>}
      {inventory && inventory.items.length > 0 && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-2 gap-3 mb-3">
            <div className="card" style={{ padding: 16 }}>
              <div className="flex items-center" style={{ gap: 10, marginBottom: 10 }}>
                <span style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--sand)', color: 'var(--gold)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><FaTriangleExclamation aria-hidden="true" size={13} /></span>
                <strong className="text-sm">Low Stock ({inventory.lowStock.length})</strong>
              </div>
              {inventory.lowStock.length === 0 && <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>None.</p>}
              {inventory.lowStock.map((p) => <p key={p._id} className="text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>{p.title} — {p.stock} left</p>)}
            </div>
            <div className="card" style={{ padding: 16 }}>
              <div className="flex items-center" style={{ gap: 10, marginBottom: 10 }}>
                <span style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--sand)', color: 'var(--rose, #e11d48)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><FaBoxOpen aria-hidden="true" size={13} /></span>
                <strong className="text-sm">Out of Stock ({inventory.outOfStock.length})</strong>
              </div>
              {inventory.outOfStock.length === 0 && <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>None.</p>}
              {inventory.outOfStock.map((p) => <p key={p._id} className="text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>{p.title}</p>)}
            </div>
          </div>
          <Table
            headers={['Product', 'Category', 'Available Stock', 'Status', 'Inventory Update']}
            rows={inventory.items.map((p) => [
              p.title,
              p.category,
              p.stock,
              <Tag status={PRODUCT_STATUS[p.status]?.tag} label={PRODUCT_STATUS[p.status]?.label} />,
              <div className="flex gap-2">
                <input className="form-input" type="number" min="0" style={{ padding: '4px 6px', fontSize: '0.72rem', width: 80 }} placeholder={String(p.stock)} value={stockEdits[p._id] ?? ''} onChange={(e) => setStockEdits({ ...stockEdits, [p._id]: e.target.value })} />
                <button type="button" className="btn" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={() => updateStock(p._id)}>Update</button>
              </div>
            ])}
            empty="No physical listings yet."
          />
        </>
      )}

      {/* 9. Earnings & Commission */}
      <div className="dash-section-title"><h2>Earnings & Commission</h2></div>
      <p className="text-xs mb-2" style={{ color: 'var(--ink-soft)' }}>CareerZ's commission ({earnings?.commissionRate ?? '—'}%, set by Super Admin) is deducted automatically from delivered/completed sales. No real payment processor is integrated yet, so Payment Charges are honestly 0.</p>
      {Object.keys(earnings?.totalsByCurrency || {}).length === 0 && <p className="text-xs mb-4" style={{ color: 'var(--ink-soft)' }}>{earnings === null ? 'Loading...' : 'No sales yet.'}</p>}
      {Object.entries(earnings?.totalsByCurrency || {}).map(([currency, e]) => {
        const rows = [
          { label: 'Gross Sales', value: e.grossSales, color: 'ink' },
          { label: 'Platform Commission', value: e.platformCommission, color: 'gold' },
          { label: 'Payment Charges', value: e.paymentCharges, color: 'ink' },
          { label: 'Refund Deductions', value: e.refundDeductions, color: 'rose, #e11d48' },
          { label: 'Net Earnings', value: e.netEarnings, color: 'emerald' },
          { label: 'Pending Earnings', value: e.pendingEarnings, color: 'gold' },
          { label: 'Available Earnings', value: e.availableEarnings, color: 'emerald' }
        ];
        return (
          <div key={currency} className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {rows.map((r) => (
              <div key={r.label} className="card" style={{ padding: 16 }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--ink-soft)' }}>{r.label}</span>
                <strong style={{ fontSize: 22, fontFamily: 'Fraunces, serif', display: 'block', marginTop: 4, color: `var(--${r.color})` }}>{currency} {r.value}</strong>
              </div>
            ))}
          </div>
        );
      })}

      {/* Reviews — per the parent layout order, before Messages/Notifications */}
      <div className="dash-section-title"><h2>Reviews</h2></div>
      {(reviews?.length ?? 0) === 0 ? (
        <div className="student-empty-state" style={{ border: '1px solid var(--sand-line)', borderRadius: 18, marginBottom: 20 }}>
          <FaStar aria-hidden="true" />
          <p>{reviews === null ? 'Loading...' : 'No reviews yet'}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 10, marginBottom: 20 }}>
          {reviews?.slice(0, 3).map((r) => (
            <div key={r._id} className="card flex items-center" style={{ padding: 14, gap: 12 }}>
              <span style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--gold)', color: '#fff', display: 'grid', placeItems: 'center', flexShrink: 0, fontWeight: 700, fontSize: 13 }}>{(r.buyer?.fullName || '?')[0]}</span>
              <div style={{ minWidth: 0 }}>
                <strong className="text-sm">{r.buyer?.fullName}</strong>
                <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 2 }}>{r.product?.title} · ★ {r.rating}{r.comment ? ` · "${r.comment}"` : ''}</p>
              </div>
            </div>
          ))}
          <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.75rem', justifySelf: 'start' }} onClick={() => onNavigate?.('sellerReviews')}>View All</button>
        </div>
      )}

      {/* Messages / Notifications preview — item 12's "Dashboard par recent messages aur unread
          count show hoga", plus item 13's Notifications feed */}
      <div className="dash-section-title"><h2>Messages / Notifications</h2></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3" style={{ marginBottom: 20 }}>
        <div className="card" style={{ padding: 0 }}>
          <div className="flex items-center" style={{ gap: 10, padding: '14px 16px', borderBottom: '1px solid var(--sand-line)' }}>
            <span style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--sand)', color: 'var(--forest)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><FaCommentDots aria-hidden="true" size={13} /></span>
            <strong className="text-sm">Messages — Unread: {conversations?.reduce((sum, c) => sum + c.unread, 0) ?? 0}</strong>
          </div>
          <div style={{ padding: '6px 16px' }}>
            {(conversations?.length ?? 0) === 0 && <p className="text-xs" style={{ color: 'var(--ink-soft)', padding: '8px 0' }}>{conversations === null ? 'Loading...' : 'No conversations yet.'}</p>}
            {conversations?.slice(0, 3).map((c) => (
              <p key={c.user._id} className="text-xs" style={{ color: c.unread > 0 ? 'var(--ink)' : 'var(--ink-soft)', fontWeight: c.unread > 0 ? 600 : 400, padding: '6px 0' }}>{c.user.fullName}{c.unread > 0 ? ` (${c.unread})` : ''} — {c.lastMessage}</p>
            ))}
          </div>
          <div style={{ padding: 12 }}>
            <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.75rem' }} onClick={() => onNavigate?.('sellerMessages')}>View Messages</button>
          </div>
        </div>
        <div className="card" style={{ padding: 0 }}>
          <div className="flex items-center" style={{ gap: 10, padding: '14px 16px', borderBottom: '1px solid var(--sand-line)' }}>
            <span style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--sand)', color: 'var(--gold)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><FaBell aria-hidden="true" size={13} /></span>
            <strong className="text-sm">Notifications</strong>
          </div>
          <div style={{ padding: '6px 16px' }}>
            {(notifications?.length ?? 0) === 0 && <p className="text-xs" style={{ color: 'var(--ink-soft)', padding: '8px 0' }}>{notifications === null ? 'Loading...' : 'No notifications yet.'}</p>}
            {notifications?.map((n) => (
              <div key={n._id} className="flex items-center justify-between gap-2" style={{ padding: '6px 0' }}>
                <p className="text-xs" style={{ color: n.read ? 'var(--ink-soft)' : 'var(--ink)', fontWeight: n.read ? 400 : 600 }}>{n.title}</p>
                <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>{new Date(n.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
          <div style={{ padding: 12 }}>
            <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.75rem' }} onClick={() => onNavigate?.('sellerNotifications')}>View All</button>
          </div>
        </div>
      </div>

      {/* 14. Recent Activity — every feed sourced from data already fetched above, no fabrication */}
      <div className="dash-section-title"><h2>Recent Activity</h2></div>
      {(() => {
        const feeds = [
          { title: 'New Listing Created', icon: FaBoxOpen, items: [...(products || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5).map((p) => ({ date: p.createdAt, label: p.title })) },
          { title: 'Product Updated', icon: FaBoxesStacked, items: [...(products || [])].filter((p) => p.updatedAt !== p.createdAt).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 5).map((p) => ({ date: p.updatedAt, label: p.title })) },
          { title: 'Order Received', icon: FaCartShopping, items: [...(recentOrders || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5).map((o) => ({ date: o.createdAt, label: `${o.buyer?.fullName} — ${o.product?.title} (${o.currency} ${o.totalPrice})` })) },
          { title: 'Order Shipped/Delivered', icon: FaTruck, items: [...(recentOrders || [])].filter((o) => ['shipped', 'delivered', 'completed'].includes(o.status)).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 5).map((o) => ({ date: o.updatedAt, label: `${o.product?.title} — ${ORDER_STATUS[o.status]?.label}` })) },
          { title: 'Payment Received', icon: FaMoneyBillWave, items: [...(recentOrders || [])].filter((o) => o.paymentStatus === 'paid').sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 5).map((o) => ({ date: o.updatedAt, label: `${o.currency} ${o.totalPrice} — ${o.product?.title}` })) },
          { title: 'Refund Completed', icon: FaSackDollar, items: [...(recentOrders || [])].filter((o) => o.status === 'refunded').sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 5).map((o) => ({ date: o.updatedAt, label: `${o.currency} ${o.totalPrice} — ${o.product?.title}` })) },
          { title: 'Withdrawal Requested', icon: FaWallet, items: [...(withdrawals || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5).map((w) => ({ date: w.createdAt, label: `${w.currency} ${w.amount} (${SELLER_WITHDRAWAL_STATUS[w.status]?.label})` })) }
        ];
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3" style={{ marginBottom: 20 }}>
            {feeds.map((f) => (
              <div key={f.title} className="card" style={{ padding: 16 }}>
                <div className="flex items-center" style={{ gap: 10, marginBottom: 10 }}>
                  <span style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--sand)', color: 'var(--forest)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><f.icon aria-hidden="true" size={13} /></span>
                  <strong className="text-sm">{f.title}</strong>
                </div>
                {f.items.length === 0 && <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>None yet.</p>}
                {f.items.map((it, i) => (
                  <div key={i} className="flex items-center justify-between gap-2 mt-1">
                    <span className="text-xs">{it.label}</span>
                    <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>{new Date(it.date).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        );
      })()}

      {/* 15. Quick Actions */}
      <QuickActions
        actions={[
          { label: 'Add New Product', key: 'addListing' },
          { label: 'Add New Service', key: 'addListing' },
          { label: 'Manage Listings', key: 'listings' },
          { label: 'View Orders', key: 'orders' },
          { label: 'Update Inventory', key: 'inventory' },
          { label: 'View Earnings', key: 'earningsCommission' },
          { label: 'Withdraw Funds', key: 'withdrawals' },
          { label: 'View Messages', key: 'sellerMessages' }
        ]}
        onNavigate={onNavigate}
      />
    </>
  );
}

// ------------------------------------------------------------------ Agent

function AgentWorkspace({ tab, user, onFlash, onChanged, onNavigate }) {
  if (tab === 'profile') return <><ProfilePanel user={user} onFlash={onFlash} onChanged={onChanged} /><RolesPanel onFlash={onFlash} onChanged={onChanged} /><SupportComplaintPanel onFlash={onFlash} /></>;
  if (tab === 'summary') return <AgentDashboardPanel user={user} onFlash={onFlash} onNavigate={onNavigate} />;
  if (tab === 'post') return <EmployerPostJobPanel onFlash={onFlash} />;
  if (tab === 'jobs') return <EmployerJobsPanel onFlash={onFlash} />;
  if (tab === 'candidates') return <AgentCandidatesPanel onFlash={onFlash} />;
  if (tab === 'recommended') return <RecommendedCandidatesPanel onFlash={onFlash} />;
  if (tab === 'shortlisted') return <ShortlistedCandidatesPanel onFlash={onFlash} />;
  if (tab === 'interviews') return <AgentInterviewsPanel onFlash={onFlash} />;
  if (tab === 'hires') return <SuccessfulHiresPanel onFlash={onFlash} />;
  if (tab === 'agentMessages') return <AgentMessagesPanel onFlash={onFlash} />;
  if (tab === 'agentNotifications') return <NotificationsPanel onFlash={onFlash} />;
  if (tab === 'commission') return <AgentCommissionPanel onFlash={onFlash} />;
  if (tab === 'wallet') return <AgentWalletPanel onFlash={onFlash} />;
  if (tab === 'agentVerification') return <AgentVerificationPanel user={user} onFlash={onFlash} />;
  return <ComingSoon label={tab} />;
}

// Aggregates candidates across every job the agent has posted — the "Candidates" +
// "Hiring process" spec items merge naturally into one pipeline view, same status field
// (JobApplication.status) already used by Employer, just rolled up across all placements.
function AgentCandidatesPanel({ onFlash }) {
  const [jobs, setJobs] = useState(null);
  const [candidates, setCandidates] = useState(null);
  const [jobFilter, setJobFilter] = useState('');
  const [suitableOnly, setSuitableOnly] = useState(false);

  function load() {
    apiRequest('/jobs/mine/list').then(async (jobList) => {
      setJobs(jobList);
      const perJob = await Promise.all(jobList.map((j) =>
        apiRequest(`/jobs/${j._id}/applicants`).then((apps) => apps.map((a) => ({ ...a, job: j })))
      ));
      setCandidates(perJob.flat());
    }).catch((err) => onFlash(err.message));
  }
  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function setStatus(appId, status) {
    try { await apiRequest(`/jobs/applications/${appId}/status`, { method: 'PATCH', body: { status } }); onFlash(`Candidate ${status}.`, 'success'); load(); } catch (err) { onFlash(err.message); }
  }

  if (jobs === null || candidates === null) return <p role="status" className="admin-notice">Loading...</p>;

  const filtered = candidates.filter((c) => {
    if (jobFilter && c.job._id !== jobFilter) return false;
    if (suitableOnly) {
      const candidateSkills = (c.resumeSnapshot?.skills || []).map((s) => s.toLowerCase());
      const jobSkills = (c.job.skills || []).map((s) => s.toLowerCase());
      const overlap = jobSkills.filter((s) => candidateSkills.includes(s));
      if (jobSkills.length === 0 || overlap.length === 0) return false;
    }
    return true;
  }).map((c) => {
    const candidateSkills = (c.resumeSnapshot?.skills || []).map((s) => s.toLowerCase());
    const jobSkills = (c.job.skills || []).map((s) => s.toLowerCase());
    const matchCount = jobSkills.filter((s) => candidateSkills.includes(s)).length;
    return { ...c, matchCount, jobSkillCount: jobSkills.length };
  }).sort((a, b) => b.matchCount - a.matchCount);

  return (
    <div>
      <h3 className="font-semibold" style={{ marginBottom: 4 }}>Candidates</h3>
      <p className="text-xs" style={{ color: 'var(--ink-soft)', marginBottom: 16 }}>Every applicant across all your placements — manage their hiring status here.</p>
      <div className="card flex items-center flex-wrap" style={{ padding: 16, gap: 16, marginBottom: 20 }}>
        <div style={{ minWidth: 220 }}>
          <CustomSelect
            value={jobFilter} onChange={setJobFilter} ariaLabel="Filter by placement" minWidth="100%"
            options={[{ value: '', label: 'All placements' }, ...jobs.map((j) => ({ value: j._id, label: j.title }))]}
          />
        </div>
        <label className="flex items-center text-xs" style={{ gap: 8 }}><input type="checkbox" checked={suitableOnly} onChange={(e) => setSuitableOnly(e.target.checked)} /> Suitable candidates only (skills match the job)</label>
      </div>
      <Table
        headers={['Candidate', 'Applied Job', 'Skills', 'Experience', 'Location', 'CV/Resume', 'Applied', 'Status']}
        rows={filtered.map((c) => [
          <div className="flex items-center" style={{ gap: 10 }}>
            {c.applicant?.profilePhoto
              ? <img src={c.applicant.profilePhoto} alt="" style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
              : <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--forest)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.7rem', flexShrink: 0 }}>{(c.applicant?.fullName || '?')[0]}</div>}
            <span>{c.applicant?.fullName}</span>
          </div>,
          c.job.title,
          c.resumeSnapshot?.skills?.length > 0 ? `${c.resumeSnapshot.skills.join(', ')}${c.jobSkillCount > 0 ? ` (${c.matchCount}/${c.jobSkillCount} match)` : ''}` : 'None listed',
          c.resumeSnapshot?.experienceLevel || '—',
          c.resumeSnapshot?.location || '—',
          c.resumeSnapshot?.cvFileUrl ? <a href={c.resumeSnapshot.cvFileUrl} target="_blank" rel="noreferrer">View CV</a> : 'Not uploaded',
          new Date(c.createdAt).toLocaleDateString(),
          <div style={{ minWidth: 140 }}>
            <CustomSelect
              value={c.status} onChange={(v) => setStatus(c._id, v)} ariaLabel="Candidate status" minWidth="100%"
              options={['pending', 'viewed', 'shortlisted', 'interview', 'selected', 'rejected', 'hired'].map((s) => ({ value: s, label: CANDIDATE_STATUS[s].label }))}
            />
          </div>
        ])}
        empty="No candidates yet — once someone applies to your placements, they'll show up here."
      />
    </div>
  );
}

// Same aggregate-across-jobs data as Applications, filtered to one status — a dedicated,
// real view rather than making the agent re-filter the full Applications table every time.
function AgentCandidatesByStatusPanel({ onFlash, title, status, emptyText }) {
  const [candidates, setCandidates] = useState(null);

  function load() {
    apiRequest('/jobs/mine/list').then(async (jobList) => {
      const perJob = await Promise.all(jobList.map((j) =>
        apiRequest(`/jobs/${j._id}/applicants`).then((apps) => apps.map((a) => ({ ...a, job: j })))
      ));
      setCandidates(perJob.flat().filter((c) => c.status === status));
    }).catch((err) => onFlash(err.message));
  }
  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (candidates === null) return <p role="status" className="admin-notice">Loading...</p>;

  return (
    <div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <Table
        headers={['Candidate', 'Applied Job', 'Skills', 'Experience', 'Location', 'CV/Resume', 'Date']}
        rows={candidates.map((c) => [
          <div className="flex items-center gap-2">
            {c.applicant?.profilePhoto
              ? <img src={c.applicant.profilePhoto} alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
              : <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--forest)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.7rem' }}>{(c.applicant?.fullName || '?')[0]}</div>}
            <span>{c.applicant?.fullName}</span>
          </div>,
          c.job.title,
          c.resumeSnapshot?.skills?.length > 0 ? c.resumeSnapshot.skills.join(', ') : 'None listed',
          c.resumeSnapshot?.experienceLevel || '—',
          c.resumeSnapshot?.location || '—',
          c.resumeSnapshot?.cvFileUrl ? <a href={c.resumeSnapshot.cvFileUrl} target="_blank" rel="noreferrer">View CV</a> : 'Not uploaded',
          new Date(c.createdAt).toLocaleDateString()
        ])}
        empty={emptyText}
      />
    </div>
  );
}

function ShortlistedCandidatesPanel({ onFlash }) {
  return <AgentCandidatesByStatusPanel onFlash={onFlash} title="Shortlisted Candidates" status="shortlisted" emptyText="No shortlisted candidates yet." />;
}

function SuccessfulHiresPanel({ onFlash }) {
  return <AgentCandidatesByStatusPanel onFlash={onFlash} title="Successful Hires" status="hired" emptyText="No hires yet." />;
}

function AgentVerificationPanel({ user, onFlash }) {
  const [request, setRequest] = useState(undefined);
  const [docUrl, setDocUrl] = useState('');

  function load() {
    apiRequest('/roles/my-requests').then((list) => setRequest(list.find((r) => r.requestedRole === 'education_agent') || null)).catch(() => setRequest(null));
  }
  useEffect(load, []);

  async function addDocument() {
    if (!docUrl.trim() || !request) return;
    try {
      await apiRequest(`/roles/mine/education_agent/documents`, { method: 'POST', body: { documents: [...(request.documents || []), docUrl.trim()] } });
      onFlash('Document submitted.', 'success');
      setDocUrl('');
      load();
    } catch (err) { onFlash(err.message); }
  }
  async function removeDocument(url) {
    try {
      await apiRequest(`/roles/mine/education_agent/documents`, { method: 'POST', body: { documents: (request.documents || []).filter((d) => d !== url) } });
      load();
    } catch (err) { onFlash(err.message); }
  }

  if (request === undefined) return <p role="status" className="admin-notice">Loading...</p>;

  const VERIFICATION_LABEL = { approved: 'Verified', pending: 'Pending Review', under_review: 'Under Review', rejected: 'Rejected' };
  const VERIFICATION_TAG = { approved: 'approved', pending: 'pending', under_review: 'pending', rejected: 'rejected' };
  const status = request?.status || 'pending';

  return (
    <div>
      <h3 className="font-semibold" style={{ marginBottom: 16 }}>Verification / Documents</h3>

      <div className="flex items-start" style={{ gap: 12, padding: 18, borderRadius: 16, background: 'var(--sand)', marginBottom: 20 }}>
        <span style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--paper-raised)', color: 'var(--forest)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
          <FaShieldHalved aria-hidden="true" size={15} />
        </span>
        <div>
          <div className="flex items-center" style={{ gap: 8 }}>
            <strong className="text-sm">Status:</strong>
            <Tag status={VERIFICATION_TAG[status]} label={VERIFICATION_LABEL[status]} />
          </div>
          {status === 'rejected' && request?.reviewNotes && <p className="text-xs" style={{ color: 'var(--rose)', marginTop: 6 }}>{request.reviewNotes}</p>}
          <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 6, lineHeight: 1.6 }}>Only a verified agent can post jobs. Submit documents (business license, ID, etc.) for Super Admin review.</p>
        </div>
      </div>

      <div className="card" style={{ padding: 20 }}>
        <p className="text-xs" style={{ fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--ink-soft)', marginBottom: 14 }}>Submitted Documents</p>
        <div className="flex items-end flex-wrap" style={{ gap: 12, marginBottom: 16 }}>
          <input className="form-input" placeholder="Paste a document link (PDF/image URL)" value={docUrl} onChange={(e) => setDocUrl(e.target.value)} style={{ flex: '1 1 auto', minWidth: 0 }} />
          <button type="button" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.78rem', flexShrink: 0 }} onClick={addDocument}>Add Document</button>
        </div>
        {(request?.documents || []).length === 0 ? (
          <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>No documents submitted yet.</p>
        ) : (
          <div style={{ display: 'grid', gap: 8 }}>
            {(request?.documents || []).map((d) => (
              <div key={d} className="flex items-center justify-between flex-wrap" style={{ gap: 10, padding: 12, borderRadius: 12, background: 'var(--sand)' }}>
                <a href={d} target="_blank" rel="noreferrer" className="text-xs" style={{ overflowWrap: 'anywhere' }}>📄 {d}</a>
                <button type="button" className="btn" style={{ padding: '5px 12px', fontSize: '0.72rem', background: 'var(--paper-raised)', flexShrink: 0 }} onClick={() => removeDocument(d)}>Remove</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CandidateProfileModal({ candidate, onClose }) {
  if (!candidate) return null;
  return (
    <div className="u-modal-overlay open" onClick={onClose}>
      <div className="u-modal u-modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="u-modal-head">
          <div className="flex items-center gap-3">
            {candidate.candidate.profilePhoto
              ? <img src={candidate.candidate.profilePhoto} alt="" style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }} />
              : <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--forest)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{(candidate.candidate.fullName || '?')[0]}</div>}
            <div>
              <h3>{candidate.candidate.fullName}</h3>
              <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>{candidate.headline || 'No headline set'}</p>
            </div>
          </div>
          <button type="button" className="u-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="u-modal-body">
          <p className="text-xs" style={{ marginBottom: 8 }}><strong>Skills:</strong> {candidate.skills?.length > 0 ? candidate.skills.join(', ') : 'None listed'}</p>
          <p className="text-xs" style={{ marginBottom: 8 }}><strong>Experience level:</strong> {candidate.experienceLevel || 'Not set'}</p>
          <p className="text-xs" style={{ marginBottom: 8 }}><strong>Location:</strong> {candidate.location || 'Not set'}</p>
          <p className="text-xs" style={{ marginBottom: 8 }}><strong>Education:</strong> {candidate.education?.length > 0 ? candidate.education.map((ed) => `${ed.degree} — ${ed.institution}`).join('; ') : 'Not listed'}</p>
          <p className="text-xs"><strong>CV/Resume:</strong> {candidate.cvFileUrl ? <a href={candidate.cvFileUrl} target="_blank" rel="noreferrer">View file</a> : 'Not uploaded'}</p>
        </div>
      </div>
    </div>
  );
}

// "Recommended Candidates" — a real computed matching algorithm (skills/experience/location/
// qualification, all explainable from the two documents), not an actual AI call. Searches the
// whole candidate pool (anyone with a Resume), not just people who already applied.
function RecommendedCandidatesPanel({ onFlash }) {
  const [jobs, setJobs] = useState(null);
  const [jobId, setJobId] = useState('');
  const [candidates, setCandidates] = useState(null);
  const [viewingCandidate, setViewingCandidate] = useState(null);

  useEffect(() => { apiRequest('/jobs/mine/list').then((list) => { setJobs(list); if (list.length > 0) setJobId(list[0]._id); }).catch((err) => onFlash(err.message)); }, [onFlash]);

  function load(id) {
    if (!id) return;
    setCandidates(null);
    apiRequest(`/jobs/${id}/recommended-candidates`).then(setCandidates).catch((err) => onFlash(err.message));
  }
  useEffect(() => { load(jobId); }, [jobId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function shortlist(candidateId) {
    try {
      await apiRequest(`/jobs/${jobId}/shortlist`, { method: 'POST', body: { candidateId } });
      onFlash('Candidate shortlisted.', 'success');
      load(jobId);
    } catch (err) { onFlash(err.message); }
  }

  if (jobs === null) return <p role="status" className="admin-notice">Loading...</p>;

  return (
    <div>
      <h3 className="font-semibold" style={{ marginBottom: 4 }}>Recommended Candidates</h3>
      <p className="text-xs" style={{ color: 'var(--ink-soft)', marginBottom: 16 }}>Computed match against your placement's requirements — skills, experience, location and qualification. Not AI-generated; every score is explainable from the candidate's CV and the job's requirements.</p>
      {jobs.length > 0 && (
        <div className="card" style={{ padding: 16, marginBottom: 20, maxWidth: 360 }}>
          <label>
            <span className="text-xs" style={{ display: 'block', color: 'var(--ink-soft)', fontWeight: 600, marginBottom: 6 }}>Placement</span>
            <CustomSelect value={jobId} onChange={setJobId} ariaLabel="Select placement" minWidth="100%" options={jobs.map((j) => ({ value: j._id, label: j.title }))} />
          </label>
        </div>
      )}
      {jobs.length === 0 && (
        <div className="student-empty-state" style={{ border: '1px solid var(--sand-line)', borderRadius: 18 }}>
          <FaBriefcase aria-hidden="true" />
          <p>Post a placement first</p>
          <span>You'll see recommended candidates for it here.</span>
        </div>
      )}
      {candidates === null && jobs.length > 0 && <p role="status" className="admin-notice">Loading...</p>}
      <Table
        headers={['Candidate', 'Skills', 'Experience', 'Location', 'Qualification', 'Recommendation', 'Actions']}
        rows={(candidates || []).map((c) => [
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            {c.candidate.profilePhoto
              ? <img src={c.candidate.profilePhoto} alt="" style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
              : <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--forest)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.7rem', flexShrink: 0 }}>{(c.candidate.fullName || '?')[0]}</div>}
            <span style={{ whiteSpace: 'nowrap' }}>{c.candidate.fullName}</span>
          </div>,
          <strong>{c.skillsMatchPercent}%</strong>,
          c.experienceMatch ? <Tag status="approved" label="Match" /> : <Tag status="rejected" label="No Match" />,
          c.locationMatch ? <Tag status="approved" label="Match" /> : <Tag status="rejected" label="No Match" />,
          c.qualificationMatch ? <Tag status="approved" label="Match" /> : <Tag status="rejected" label="No Match" />,
          c.recommended ? <Tag status="approved" label="Recommended" /> : <Tag status="pending" label="Not Recommended" />,
          <div className="flex" style={{ gap: 8, flexWrap: 'wrap' }}>
            <button type="button" className="btn" style={{ padding: '6px 12px', fontSize: '0.72rem' }} onClick={() => setViewingCandidate(c)}>View Profile</button>
            <button type="button" className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.72rem' }} disabled={c.alreadyApplied} onClick={() => shortlist(c.candidate._id)}>{c.alreadyApplied ? 'Already in pipeline' : 'Shortlist Candidate'}</button>
          </div>
        ])}
        empty="No candidates in the pool match this placement yet."
      />
      <CandidateProfileModal candidate={viewingCandidate} onClose={() => setViewingCandidate(null)} />
    </div>
  );
}

function AgentInterviewsPanel({ onFlash }) {
  const [interviews, setInterviews] = useState(null);
  const [rescheduleFor, setRescheduleFor] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [feedbackFor, setFeedbackFor] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');

  function load() {
    apiRequest('/jobs/mine/scheduled-interviews').then(setInterviews).catch((err) => onFlash(err.message));
  }
  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function cancel(id) {
    try { await apiRequest(`/jobs/interviews/${id}`, { method: 'PATCH', body: { status: 'cancelled' } }); onFlash('Interview cancelled.', 'success'); load(); } catch (err) { onFlash(err.message); }
  }
  async function submitReschedule(id) {
    if (!rescheduleDate) return onFlash('Pick a new date/time first.');
    try {
      await apiRequest(`/jobs/interviews/${id}`, { method: 'PATCH', body: { scheduledDate: rescheduleDate } });
      onFlash('Interview rescheduled.', 'success');
      setRescheduleFor(null); setRescheduleDate('');
      load();
    } catch (err) { onFlash(err.message); }
  }
  async function submitFeedback(id) {
    if (!feedbackText.trim()) return onFlash('Write some feedback first.');
    try {
      await apiRequest(`/jobs/interviews/${id}`, { method: 'PATCH', body: { feedback: feedbackText.trim() } });
      onFlash('Feedback saved — interview marked completed.', 'success');
      setFeedbackFor(null); setFeedbackText('');
      load();
    } catch (err) { onFlash(err.message); }
  }

  if (interviews === null) return <p role="status" className="admin-notice">Loading...</p>;

  return (
    <div>
      <h3 className="font-semibold" style={{ marginBottom: 16 }}>Upcoming Interviews</h3>
      {interviews.length === 0 && (
        <div className="student-empty-state" style={{ border: '1px solid var(--sand-line)', borderRadius: 18 }}>
          <FaCalendarCheck aria-hidden="true" />
          <p>No interviews scheduled yet</p>
        </div>
      )}
      <div style={{ display: 'grid', gap: 14 }}>
      {interviews.map((i) => {
        const st = INTERVIEW_STATUS[i.status] || INTERVIEW_STATUS.scheduled;
        return (
          <div key={i._id} className="card" style={{ padding: 20 }}>
            <div className="flex items-start justify-between flex-wrap" style={{ gap: 14 }}>
              <div className="flex items-start" style={{ gap: 12 }}>
                <span style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--forest)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>{(i.candidate?.fullName || '?')[0]}</span>
                <div>
                  <strong className="text-sm">{i.candidate?.fullName}</strong>
                  <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 2 }}>{i.job?.title} · {i.job?.company}</p>
                  <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 4 }}>{new Date(i.scheduledDate).toLocaleString()} · {i.mode === 'physical' ? 'Physical' : 'Online'} · {i.mode === 'physical' ? (i.location || 'Location TBD') : (i.meetingLink || 'Link TBD')}</p>
                  {i.feedback && <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 6 }}><strong>Feedback:</strong> {i.feedback}</p>}
                  <span style={{ display: 'inline-block', marginTop: 8 }}><Tag status={st.tag} label={st.label} /></span>
                </div>
              </div>
              {i.status === 'scheduled' && (
                <div className="flex flex-wrap" style={{ gap: 8, flexShrink: 0 }}>
                  {i.mode === 'online' && i.meetingLink && <a className="btn btn-primary" style={{ padding: '7px 14px', fontSize: '0.75rem' }} href={i.meetingLink} target="_blank" rel="noreferrer">Join Interview</a>}
                  <button type="button" className="btn" style={{ padding: '7px 14px', fontSize: '0.75rem' }} onClick={() => { setRescheduleFor(rescheduleFor === i._id ? null : i._id); setFeedbackFor(null); }}>Reschedule</button>
                  <button type="button" className="btn" style={{ padding: '7px 14px', fontSize: '0.75rem' }} onClick={() => cancel(i._id)}>Cancel</button>
                  <button type="button" className="btn" style={{ padding: '7px 14px', fontSize: '0.75rem' }} onClick={() => { setFeedbackFor(feedbackFor === i._id ? null : i._id); setRescheduleFor(null); }}>Add Feedback</button>
                </div>
              )}
            </div>
            {rescheduleFor === i._id && (
              <div className="flex items-end flex-wrap" style={{ gap: 12, borderTop: '1px solid var(--sand-line)', paddingTop: 14, marginTop: 14 }}>
                <label className="text-xs" style={{ color: 'var(--ink-soft)', fontWeight: 600 }}>New date/time
                  <input type="datetime-local" className="form-input" value={rescheduleDate} onChange={(e) => setRescheduleDate(e.target.value)} style={{ marginTop: 6 }} />
                </label>
                <button type="button" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.78rem' }} onClick={() => submitReschedule(i._id)}>Confirm</button>
              </div>
            )}
            {feedbackFor === i._id && (
              <div className="flex items-end flex-wrap" style={{ gap: 12, borderTop: '1px solid var(--sand-line)', paddingTop: 14, marginTop: 14 }}>
                <textarea className="form-input" placeholder="Interview feedback..." rows={2} value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} style={{ flex: '1 1 auto', minWidth: 0 }} />
                <button type="button" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.78rem', flexShrink: 0 }} onClick={() => submitFeedback(i._id)}>Save Feedback</button>
              </div>
            )}
          </div>
        );
      })}
      </div>
    </div>
  );
}

// Categorizes the shared /messages/conversations feed for an Employer/Agent: Candidates (real
// applicants to their own placements), Employers/Companies (role), Platform Support / Super
// Admin (role) — same real-data pattern used for the job-seeker and representative inboxes.
function AgentMessagesPanel({ onFlash }) {
  const [conversations, setConversations] = useState(null);
  const [candidateIds, setCandidateIds] = useState(null);
  const [activeUser, setActiveUser] = useState(null);
  const [thread, setThread] = useState(null);
  const [text, setText] = useState('');

  function load() {
    apiRequest('/messages/conversations').then(setConversations).catch((err) => onFlash(err.message));
    apiRequest('/jobs/mine/list').then(async (jobs) => {
      const perJob = await Promise.all(jobs.map((j) => apiRequest(`/jobs/${j._id}/applicants`).then((apps) => apps.map((a) => a.applicant._id))));
      setCandidateIds(new Set(perJob.flat()));
    }).catch(() => setCandidateIds(new Set()));
  }
  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  function openThread(u) {
    setActiveUser(u);
    setThread(null);
    apiRequest(`/messages/with/${u._id}`).then(setThread).catch((err) => onFlash(err.message));
    apiRequest(`/messages/with/${u._id}/read`, { method: 'PATCH' }).then(load).catch(() => {});
  }

  async function send(e) {
    e.preventDefault();
    if (!activeUser || !text.trim()) return;
    try {
      await apiRequest('/messages', { method: 'POST', body: { to: activeUser._id, text: text.trim() } });
      setText('');
      apiRequest(`/messages/with/${activeUser._id}`).then(setThread);
      load();
    } catch (err) { onFlash(err.message); }
  }

  if (conversations === null || candidateIds === null) return <p role="status" className="admin-notice">Loading...</p>;

  const hasRole = (u, role) => (u.roles || []).includes(role);
  const candidateMsgs = conversations.filter((c) => candidateIds.has(c.user._id));
  const employerMsgs = conversations.filter((c) => !candidateIds.has(c.user._id) && hasRole(c.user, 'employer'));
  const supportMsgs = conversations.filter((c) => !candidateIds.has(c.user._id) && (hasRole(c.user, 'admin') || hasRole(c.user, 'platform_staff')));
  const superAdminMsgs = conversations.filter((c) => !candidateIds.has(c.user._id) && hasRole(c.user, 'super_admin'));
  const categorizedIds = new Set([...candidateMsgs, ...employerMsgs, ...supportMsgs, ...superAdminMsgs].map((c) => c.user._id));
  const otherMsgs = conversations.filter((c) => !categorizedIds.has(c.user._id));

  function ConversationGroup({ title, items }) {
    if (items.length === 0) return null;
    return (
      <div className="mb-4">
        <strong className="text-xs">{title}</strong>
        <div className="dash-list mt-1">
          {items.map((c) => (
            <div key={c.user._id} className={`dash-list-item${activeUser?._id === c.user._id ? ' unread' : ''}`} style={{ cursor: 'pointer' }} onClick={() => openThread(c.user)}>
              <span className="dash-list-icon c-forest" aria-hidden><FaUser size={14} /></span>
              <div className="dash-list-body"><div className="title">{c.user.fullName}{c.unread > 0 ? ` (${c.unread})` : ''}</div><div className="desc">{c.lastMessage}</div></div>
              <span className="dash-list-time">{new Date(c.lastAt).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid g2" style={{ gap: 24, alignItems: 'start' }}>
      <div>
        <h3 className="font-semibold mb-2">Messages</h3>
        <p className="text-xs mb-3" style={{ color: 'var(--ink-soft)' }}>To start a new conversation, ask for their User ID and use the "New Message" box on the right.</p>
        <ConversationGroup title="Candidates" items={candidateMsgs} />
        <ConversationGroup title="Employers / Companies" items={employerMsgs} />
        <ConversationGroup title="Platform Support" items={supportMsgs} />
        <ConversationGroup title="Super Admin" items={superAdminMsgs} />
        <ConversationGroup title="Other" items={otherMsgs} />
        {conversations.length === 0 && <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>No conversations yet.</p>}
      </div>
      <div>
        <h3 className="font-semibold mb-2">{activeUser ? activeUser.fullName : 'New Message'}</h3>
        {!activeUser && (
          <input className="form-input mb-3" placeholder="Recipient's User ID" onKeyDown={(e) => {
            if (e.key === 'Enter' && e.target.value.trim()) { openThread({ _id: e.target.value.trim(), fullName: 'New recipient' }); }
          }} />
        )}
        {activeUser && (
          <>
            <div className="card reveal in" style={{ padding: '8px 12px', marginBottom: 12, maxHeight: 320, overflowY: 'auto' }}>
              {thread === null && <p role="status" className="admin-notice">Loading...</p>}
              {thread && thread.length === 0 && <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>No messages yet.</p>}
              {(thread || []).map((m) => (
                <div key={m._id} style={{ padding: '8px 4px', borderBottom: '1px solid var(--sand-line)' }}>
                  <div style={{ fontSize: 13 }}>{m.text}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-soft)' }}>{new Date(m.createdAt).toLocaleString()}</div>
                </div>
              ))}
            </div>
            <form onSubmit={send} className="flex gap-3 items-end">
              <input className="form-input" placeholder="Type a message..." value={text} onChange={(e) => setText(e.target.value)} required />
              <button type="submit" className="btn btn-primary">Send</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

const COMMISSION_STATUS = {
  pending: { tag: 'pending', label: 'Pending' },
  approved: { tag: 'pending', label: 'Approved' },
  available: { tag: 'approved', label: 'Available' },
  paid: { tag: 'approved', label: 'Paid' },
  cancelled: { tag: 'rejected', label: 'Cancelled' }
};

function AgentCommissionPanel({ onFlash }) {
  const [data, setData] = useState(null);
  useEffect(() => { apiRequest('/commissions/mine').then(setData).catch((err) => onFlash(err.message)); }, [onFlash]);

  if (!data) return <p role="status" className="admin-notice">Loading...</p>;

  const currencies = Object.keys(data.totalsByCurrency);

  return (
    <div>
      <h3 className="font-semibold mb-2">Commission Overview</h3>
      <p className="text-xs mb-3" style={{ color: 'var(--ink-soft)' }}>Earned automatically ({data.commissions[0]?.rate ?? 10}% of the placement's minimum salary) when a candidate you placed is marked "hired". An admin reviews Pending → Approved → Available before it can be withdrawn.</p>
      {currencies.length === 0 && <div className="card" style={{ padding: 16, marginBottom: 16 }}><strong className="text-sm">No commission earned yet</strong></div>}
      {currencies.map((currency) => {
        const t = data.totalsByCurrency[currency];
        return (
          <div key={currency} className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
            <div className="card" style={{ padding: 16 }}><strong className="text-sm">Total Earned</strong><p className="text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>{currency} {t.earned}</p></div>
            <div className="card" style={{ padding: 16 }}><strong className="text-sm">Pending</strong><p className="text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>{currency} {t.pending}</p></div>
            <div className="card" style={{ padding: 16 }}><strong className="text-sm">Available</strong><p className="text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>{currency} {t.available}</p></div>
            <div className="card" style={{ padding: 16 }}><strong className="text-sm">Withdrawn</strong><p className="text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>{currency} {t.paid}</p></div>
            <div className="card" style={{ padding: 16 }}><strong className="text-sm">Avg / Hire</strong><p className="text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>{currency} {data.avgPerHireByCurrency[currency]}</p></div>
          </div>
        );
      })}
      <h4 className="font-semibold mb-2">Recent Commission Transactions</h4>
      <Table
        headers={['Hired Candidate', 'Job/Position', 'Company', 'Hiring Date', 'Rate', 'Commission Amount', 'Commission Status']}
        rows={data.commissions.map((c) => [
          c.candidate?.fullName, c.job?.title, c.job?.company,
          new Date(c.createdAt).toLocaleDateString(),
          `${c.rate}%`, `${c.currency} ${c.amount}`,
          <Tag status={COMMISSION_STATUS[c.status].tag} label={COMMISSION_STATUS[c.status].label} />
        ])}
        empty="No commission records yet."
      />
    </div>
  );
}

function AgentWalletPanel({ onFlash }) {
  const [data, setData] = useState(null);
  const [withdrawals, setWithdrawals] = useState(null);

  function load() {
    apiRequest('/commissions/mine').then(setData).catch((err) => onFlash(err.message));
    apiRequest('/commissions/mine/withdrawals').then(setWithdrawals).catch((err) => onFlash(err.message));
  }
  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function withdraw(currency, { payoutMethod, payoutDetails }) {
    try {
      await apiRequest('/commissions/withdraw', { method: 'POST', body: { currency, payoutMethod, payoutDetails } });
      onFlash('Withdrawal requested.', 'success');
      load();
    } catch (err) { onFlash(err.message); }
  }

  if (!data || withdrawals === null) return <p role="status" className="admin-notice">Loading...</p>;

  const WITHDRAWAL_STATUS = {
    requested: { tag: 'pending', label: 'Requested' },
    processing: { tag: 'pending', label: 'Processing' },
    paid: { tag: 'approved', label: 'Paid' },
    rejected: { tag: 'rejected', label: 'Rejected' }
  };
  const currencies = Object.keys(data.totalsByCurrency);

  return (
    <div>
      <h3 className="font-semibold" style={{ marginBottom: 4 }}>Wallet</h3>
      <p className="text-xs" style={{ color: 'var(--ink-soft)', marginBottom: 18 }}>No real payment processor is wired up yet — "Withdraw Funds" creates a real, trackable request; nothing here moves actual money.</p>
      {currencies.length === 0 && (
        <div className="student-empty-state" style={{ border: '1px solid var(--sand-line)', borderRadius: 18, marginBottom: 20 }}>
          <FaWallet aria-hidden="true" />
          <p>No commission earned yet</p>
          <span>Your wallet is empty.</span>
        </div>
      )}
      <div style={{ display: 'grid', gap: 14, marginBottom: 24 }}>
        {currencies.map((currency) => {
          const t = data.totalsByCurrency[currency];
          return (
            <div key={currency} className="card" style={{ padding: 20 }}>
              <div className="flex items-center" style={{ gap: 10, marginBottom: 16 }}>
                <span style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--sand)', color: 'var(--forest)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><FaWallet aria-hidden="true" size={14} /></span>
                <strong className="text-sm">{currency} Wallet</strong>
              </div>
              <div className="grid grid-cols-3" style={{ gap: 14 }}>
                <div>
                  <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>Available Balance</p>
                  <strong style={{ fontSize: 22, fontFamily: 'Fraunces, serif', display: 'block', marginTop: 4, color: 'var(--emerald)' }}>{currency} {t.available}</strong>
                </div>
                <div>
                  <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>Pending Balance</p>
                  <strong style={{ fontSize: 22, fontFamily: 'Fraunces, serif', display: 'block', marginTop: 4, color: t.pending > 0 ? 'var(--gold)' : undefined }}>{currency} {t.pending}</strong>
                </div>
                <div>
                  <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>Total Earnings</p>
                  <strong style={{ fontSize: 22, fontFamily: 'Fraunces, serif', display: 'block', marginTop: 4 }}>{currency} {t.earned}</strong>
                </div>
              </div>
              <PayoutRequestForm onSubmit={(payload) => withdraw(currency, payload)} disabled={t.available <= 0} label={`Withdraw Funds (${currency} ${t.available})`} />
            </div>
          );
        })}
      </div>

      <h4 className="font-semibold" style={{ marginBottom: 12 }}>Transaction History</h4>
      <div style={{ marginBottom: 24 }}>
        <Table
          headers={['Candidate', 'Job', 'Amount', 'Status', 'Date']}
          rows={data.commissions.map((c) => [c.candidate?.fullName, c.job?.title, `${c.currency} ${c.amount}`, <Tag status={COMMISSION_STATUS[c.status].tag} label={COMMISSION_STATUS[c.status].label} />, new Date(c.createdAt).toLocaleDateString()])}
          empty="No transactions yet."
        />
      </div>

      <h4 className="font-semibold" style={{ marginBottom: 12 }}>Withdrawal History</h4>
      <Table
        headers={['Amount', 'Currency', 'Status', 'Requested', 'Processed']}
        rows={withdrawals.map((w) => [
          w.amount, w.currency,
          <Tag status={WITHDRAWAL_STATUS[w.status].tag} label={WITHDRAWAL_STATUS[w.status].label} />,
          new Date(w.createdAt).toLocaleDateString(),
          w.processedAt ? new Date(w.processedAt).toLocaleDateString() : '—'
        ])}
        empty="No withdrawals requested yet."
      />
    </div>
  );
}

// Agent Dashboard Home — item 1 (Agent Profile) + item 2 (8 Summary Cards), all real data:
// RoleRequest for verification, User.status for account status, /jobs/mine/summary for the
// job-application aggregates, /commissions/mine for commission + wallet (= paid-out total).
function AgentDashboardPanel({ user, onFlash, onNavigate }) {
  const [verification, setVerification] = useState(null);
  const [summary, setSummary] = useState(null);
  const [commissions, setCommissions] = useState(null);
  const [conversations, setConversations] = useState(null);
  const [recentActivity, setRecentActivity] = useState(null);
  const [jobs, setJobs] = useState(null);
  const [interviews, setInterviews] = useState(null);
  const [newCandidates, setNewCandidates] = useState(null);
  const [notifications, setNotifications] = useState(null);

  useEffect(() => {
    apiRequest('/roles/my-requests').then((list) => setVerification(list.find((r) => r.requestedRole === 'education_agent') || null)).catch(() => setVerification(null));
    apiRequest('/jobs/mine/summary').then(setSummary).catch((err) => onFlash(err.message));
    apiRequest('/commissions/mine').then(setCommissions).catch((err) => onFlash(err.message));
    apiRequest('/messages/conversations').then(setConversations).catch(() => setConversations([]));
    apiRequest('/jobs/mine/recent-activity').then(setRecentActivity).catch((err) => onFlash(err.message));
    apiRequest('/jobs/mine/scheduled-interviews').then(setInterviews).catch(() => setInterviews([]));
    apiRequest('/notifications/mine').then((list) => setNotifications(list.slice(0, 5))).catch(() => setNotifications([]));
    apiRequest('/jobs/mine/list').then((jobList) => {
      setJobs(jobList);
      Promise.all(jobList.map((j) => apiRequest(`/jobs/${j._id}/applicants`).then((apps) => apps.map((a) => ({ ...a, job: j })))))
        .then((perJob) => setNewCandidates(perJob.flat().filter((c) => c.status === 'pending').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))))
        .catch(() => setNewCandidates([]));
    }).catch((err) => onFlash(err.message));
  }, [onFlash]);

  const VERIFICATION_LABEL = { approved: 'Verified', pending: 'Pending Review', under_review: 'Under Review', rejected: 'Rejected' };
  const VERIFICATION_TAG = { approved: 'approved', pending: 'pending', under_review: 'pending', rejected: 'rejected' };
  const verStatus = verification?.status || 'pending';

  const ACCOUNT_STATUS_LABEL = { active: 'Active', suspended: 'Suspended', disabled: 'Inactive' };
  const ACCOUNT_STATUS_TAG = { active: 'approved', suspended: 'rejected', disabled: 'pending' };

  const profileFields = [user?.profilePhoto, user?.companyName, user?.country, user?.phone];
  const completeness = Math.round((profileFields.filter(Boolean).length / profileFields.length) * 100);

  // Commission/wallet totals span whatever currencies the agent's placements actually use —
  // shown per-currency rather than a single misleading sum across different currencies.
  const currencyEntries = commissions ? Object.entries(commissions.totalsByCurrency) : [];
  const fmtMoney = (field) => currencyEntries.length === 0 ? '0' : currencyEntries.map(([cur, t]) => `${cur} ${t[field]}`).join(', ');

  return (
    <>
      {/* 1. Agent Profile */}
      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <div className="flex items-center justify-between flex-wrap" style={{ gap: 14 }}>
          <div className="flex items-center" style={{ gap: 14 }}>
            {user?.profilePhoto
              ? <img src={user.profilePhoto} alt="" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
              : <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--gold)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, flexShrink: 0 }}>{(user?.fullName || '?')[0]}</div>}
            <div>
              <strong className="text-sm">{user?.fullName}</strong>
              <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 2 }}>{user?.companyName || 'No agency name set'} · {user?.country || 'Country not set'}</p>
              <div className="flex items-center" style={{ gap: 8, marginTop: 6 }}>
                <Tag status={VERIFICATION_TAG[verStatus]} label={VERIFICATION_LABEL[verStatus]} />
                <Tag status={ACCOUNT_STATUS_TAG[user?.status] || 'pending'} label={ACCOUNT_STATUS_LABEL[user?.status] || user?.status} />
              </div>
            </div>
          </div>
          <div style={{ minWidth: 160 }}>
            <div className="student-progress-row" style={{ marginBottom: 6 }}>
              <span className="text-xs">Profile</span>
              <strong className="text-xs">{completeness}%</strong>
            </div>
            <progress className="student-progress-bar" max="100" value={completeness} aria-label="Profile completeness" />
          </div>
        </div>
      </div>

      {/* 2. Main Summary Cards */}
      <div className="grid grid-cols-3 md:grid-cols-4" style={{ gap: 14, marginBottom: 20 }}>
        <SummaryCard title="Active Job Posts" count={summary?.activeJobPosts ?? '—'} onClick={() => onNavigate?.('jobs')} />
        <SummaryCard title="Total Applicants" count={summary?.totalApplicants ?? '—'} onClick={() => onNavigate?.('candidates')} />
        <SummaryCard title="Shortlisted Candidates" count={summary?.shortlistedCandidates ?? '—'} onClick={() => onNavigate?.('candidates')} />
        <SummaryCard title="Scheduled Interviews" count={summary?.scheduledInterviews ?? '—'} onClick={() => onNavigate?.('interviews')} />
        <SummaryCard title="Successful Hires" count={summary?.successfulHires ?? '—'} onClick={() => onNavigate?.('commission')} />
        <SummaryCard title="Total Commission" count={fmtMoney('earned')} onClick={() => onNavigate?.('commission')} />
        <SummaryCard title="Pending Commission" count={fmtMoney('pending')} onClick={() => onNavigate?.('commission')} />
        <SummaryCard title="Wallet Balance" count={fmtMoney('paid')} onClick={() => onNavigate?.('wallet')} />
      </div>

      {/* 3. Active Jobs */}
      <div className="dash-section-title"><h2>Active Jobs</h2></div>
      {(jobs?.filter((j) => j.status === 'active').length ?? 0) === 0 ? (
        <div className="student-empty-state" style={{ border: '1px solid var(--sand-line)', borderRadius: 18, marginBottom: 20 }}>
          <FaBriefcase aria-hidden="true" />
          <p>No active job posts</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 10, marginBottom: 20 }}>
          {jobs?.filter((j) => j.status === 'active').slice(0, 5).map((j) => (
            <div key={j._id} className="hover-card card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }} onClick={() => onNavigate?.('jobs')}>
              <span style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--sand)', color: 'var(--forest)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><FaBriefcase aria-hidden="true" size={14} /></span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <strong className="text-sm">{j.title}</strong>
                <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 2 }}>{j.company} · {[j.city, j.country].filter(Boolean).join(', ')}</p>
              </div>
              <span className="text-xs" style={{ color: 'var(--ink-soft)', flexShrink: 0 }}>{j.applicantCount ?? 0} applicants</span>
            </div>
          ))}
          <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.75rem', justifySelf: 'start' }} onClick={() => onNavigate?.('jobs')}>View All</button>
        </div>
      )}

      {/* 4. New / Recommended Candidates */}
      <div className="dash-section-title"><h2>New / Recommended Candidates</h2></div>
      <div className="card" style={{ padding: (newCandidates?.length ?? 0) === 0 ? 0 : 12, marginBottom: 20 }}>
        {(newCandidates?.length ?? 0) === 0 && (
          <div className="student-empty-state">
            <FaUsers aria-hidden="true" />
            <p>No new candidates yet</p>
          </div>
        )}
        {(newCandidates?.length ?? 0) > 0 && (
          <div className="dash-list" style={{ gap: 0 }}>
            {newCandidates?.slice(0, 5).map((c, idx) => (
              <div key={c._id} className="dash-list-item" style={{ borderBottom: idx < Math.min(newCandidates.length, 5) - 1 ? '1px solid var(--sand-line)' : 'none' }}>
                <span className="dash-list-icon c-forest" aria-hidden><FaUser size={14} /></span>
                <div className="dash-list-body"><div className="title">{c.applicant?.fullName}</div><div className="desc">{c.job.title}</div></div>
                <span className="dash-list-time">{new Date(c.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
        <div className="flex flex-wrap" style={{ gap: 8, padding: (newCandidates?.length ?? 0) === 0 ? 0 : '12px 12px 0' }}>
          <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.75rem' }} onClick={() => onNavigate?.('candidates')}>View Applications</button>
          <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.75rem' }} onClick={() => onNavigate?.('recommended')}>Search Candidates</button>
        </div>
      </div>

      {/* 5. Upcoming Interviews */}
      <div className="dash-section-title"><h2>Upcoming Interviews</h2></div>
      {(interviews?.filter((i) => i.status === 'scheduled').length ?? 0) === 0 ? (
        <div className="student-empty-state" style={{ border: '1px solid var(--sand-line)', borderRadius: 18, marginBottom: 20 }}>
          <FaCalendarCheck aria-hidden="true" />
          <p>No interviews scheduled</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, marginBottom: 20 }}>
          <div className="dash-list" style={{ gap: 0 }}>
            {interviews?.filter((i) => i.status === 'scheduled').slice(0, 5).map((i, idx, arr) => (
              <div key={i._id} className="dash-list-item" style={{ borderBottom: idx < arr.length - 1 ? '1px solid var(--sand-line)' : 'none' }}>
                <span className="dash-list-icon c-gold" aria-hidden><FaCalendarCheck size={14} /></span>
                <div className="dash-list-body"><div className="title">{i.candidate?.fullName}</div><div className="desc">{i.job?.title} · {new Date(i.scheduledDate).toLocaleString()}</div></div>
              </div>
            ))}
          </div>
          <div style={{ padding: 12 }}>
            <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.75rem' }} onClick={() => onNavigate?.('interviews')}>View All</button>
          </div>
        </div>
      )}

      {/* 7. Recent Hires */}
      <div className="dash-section-title"><h2>Recent Hires</h2></div>
      {(commissions?.commissions?.length ?? 0) === 0 ? (
        <div className="student-empty-state" style={{ border: '1px solid var(--sand-line)', borderRadius: 18, marginBottom: 20 }}>
          <FaAward aria-hidden="true" />
          <p>No hires yet</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 10, marginBottom: 20 }}>
          {commissions?.commissions?.slice(0, 5).map((c) => {
            const st = COMMISSION_STATUS[c.status];
            return (
              <div key={c._id} className="card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--forest)', color: '#fff', display: 'grid', placeItems: 'center', flexShrink: 0, fontWeight: 700, fontSize: 13 }}>{(c.candidate?.fullName || '?')[0]}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <strong className="text-sm">{c.candidate?.fullName}</strong>
                  <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 2 }}>{c.job?.title} · {c.job?.company} · Hired {new Date(c.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center" style={{ gap: 8, flexShrink: 0 }}>
                  <span className="text-sm" style={{ fontWeight: 700 }}>{c.currency} {c.amount}</span>
                  <Tag status={st.tag} label={st.label} />
                </div>
              </div>
            );
          })}
          <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.75rem', justifySelf: 'start' }} onClick={() => onNavigate?.('commission')}>View All</button>
        </div>
      )}

      {/* Commission / Wallet */}
      <div className="dash-section-title"><h2>Commission / Wallet</h2></div>
      <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 14, marginBottom: 20 }}>
        <div className="card" style={{ padding: 20 }}>
          <div className="flex items-center" style={{ gap: 10, marginBottom: 10 }}>
            <span style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--sand)', color: 'var(--emerald)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><FaSackDollar aria-hidden="true" size={14} /></span>
            <strong className="text-sm">Commission</strong>
          </div>
          <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>Earned: <strong style={{ color: 'var(--ink)' }}>{fmtMoney('earned')}</strong> · Pending: <strong style={{ color: 'var(--gold)' }}>{fmtMoney('pending')}</strong></p>
          <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.75rem', marginTop: 14 }} onClick={() => onNavigate?.('commission')}>View Commissions</button>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div className="flex items-center" style={{ gap: 10, marginBottom: 10 }}>
            <span style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--sand)', color: 'var(--forest)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><FaWallet aria-hidden="true" size={14} /></span>
            <strong className="text-sm">Wallet</strong>
          </div>
          <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>Available: <strong style={{ color: 'var(--ink)' }}>{fmtMoney('available')}</strong> · Withdrawn: <strong style={{ color: 'var(--ink)' }}>{fmtMoney('paid')}</strong></p>
          <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.75rem', marginTop: 14 }} onClick={() => onNavigate?.('wallet')}>Open Wallet</button>
        </div>
      </div>

      {/* Messages */}
      <div className="dash-section-title"><h2>Messages</h2></div>
      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <div className="flex items-center justify-between" style={{ marginBottom: (conversations?.length ?? 0) === 0 ? 0 : 12 }}>
          <strong className="text-sm">Unread messages</strong>
          <strong style={{ fontSize: 22, fontFamily: 'Fraunces, serif' }}>{conversations?.reduce((sum, c) => sum + c.unread, 0) ?? 0}</strong>
        </div>
        {(conversations?.length ?? 0) === 0 && <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 10 }}>No conversations yet.</p>}
        {conversations?.slice(0, 3).map((c, idx) => (
          <p key={c.user._id} className="text-xs" style={{ color: c.unread > 0 ? 'var(--ink)' : 'var(--ink-soft)', fontWeight: c.unread > 0 ? 600 : 400, marginTop: idx === 0 ? 0 : 8, paddingTop: idx === 0 ? 0 : 8, borderTop: idx === 0 ? 'none' : '1px solid var(--sand-line)' }}>{c.user.fullName}{c.unread > 0 ? ` (${c.unread})` : ''} — {c.lastMessage}</p>
        ))}
        <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.75rem', marginTop: 14 }} onClick={() => onNavigate?.('agentMessages')}>View Messages</button>
      </div>

      {/* Notifications */}
      <div className="dash-section-title"><h2>Notifications</h2></div>
      {(notifications?.length ?? 0) === 0 ? (
        <div className="student-empty-state" style={{ border: '1px solid var(--sand-line)', borderRadius: 18, marginBottom: 20 }}>
          <FaBell aria-hidden="true" />
          <p>No notifications yet</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, marginBottom: 20 }}>
          <div className="dash-list" style={{ gap: 0 }}>
            {notifications?.map((n, idx) => (
              <div key={n._id} className={`dash-list-item${!n.read ? ' unread' : ''}`} style={{ borderBottom: idx < notifications.length - 1 ? '1px solid var(--sand-line)' : 'none' }}>
                <span className="dash-list-icon c-gold" aria-hidden><FaBell size={14} /></span>
                <div className="dash-list-body"><div className="title" style={{ fontWeight: n.read ? 400 : 600 }}>{n.title}</div></div>
                <span className="dash-list-time">{new Date(n.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
          <div style={{ padding: 12 }}>
            <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.75rem' }} onClick={() => onNavigate?.('agentNotifications')}>View All</button>
          </div>
        </div>
      )}

      {/* 12. Recent Activity */}
      <RecentActivity items={(recentActivity || []).map((a) => ({ ...a, desc: '', status: 'approved' }))} />

      {/* 13. Quick Actions */}
      <QuickActions
        actions={[
          { label: 'Post New Job', key: 'post' },
          { label: 'View Active Jobs', key: 'jobs' },
          { label: 'Manage Candidates', key: 'candidates' },
          { label: 'Search Candidates', key: 'recommended' },
          { label: 'Schedule Interview', key: 'interviews' },
          { label: 'View Commissions', key: 'commission' },
          { label: 'Open Wallet', key: 'wallet' },
          { label: 'View Messages', key: 'agentMessages' }
        ]}
        onNavigate={onNavigate}
      />
    </>
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
  if (tab === 'worldmap') return <AdminWorldMapPanel onFlash={onFlash} />;
  if (tab === 'staff') return <AdminStaffPanel onFlash={onFlash} />;
  if (tab === 'cms') return <AdminCmsPanel onFlash={onFlash} />;
  if (tab === 'backups') return <AdminBackupsPanel onFlash={onFlash} />;
  if (tab === 'aiInsights') return <ComingSoon label="AI Insights & Predictions" note="Real platform-wide predictions (growth forecasts, fraud pattern detection, revenue trends) need a paid AI provider — never faked with made-up numbers. Skipped for now until an AI API key is connected." />;
  return <ComingSoon label={tab} />;
}

// Super Admin — World Map (spec Part 16A.3). Real per-country user + institution counts, plotted
// as bubbles over a plain lat/long graticule. Positions come from approximate geographic
// centroids (see backend utils/countryCentroids.js), not traced coastlines — an honest
// proportional-distribution view rather than a claim of cartographic precision.
function AdminWorldMapPanel({ onFlash }) {
  const [data, setData] = useState(null);
  useEffect(() => { apiRequest('/admin/world-map').then(setData).catch((err) => onFlash(err.message)); }, [onFlash]);

  if (!data) return <p role="status" className="admin-notice">Loading...</p>;

  const maxCount = Math.max(...data.points.map((p) => p.userCount + p.institutionCount), 1);
  const project = (lat, lng) => ({ x: ((lng + 180) / 360) * 100, y: ((90 - lat) / 180) * 100 });

  return (
    <div>
      <h3 className="font-semibold mb-2">Global World Map</h3>
      <p className="text-xs" style={{ color: 'var(--ink-soft)', marginBottom: 16 }}>Bubble size = combined users + institutions in that country. Real counts, approximate positions.</p>

      <div className="card" style={{ padding: 0, position: 'relative', aspectRatio: '2 / 1', overflow: 'hidden', background: 'linear-gradient(180deg, var(--sand) 0%, var(--paper) 100%)' }}>
        {/* Graticule background — lat/long reference lines, not a traced coastline. */}
        <svg viewBox="0 0 100 50" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} aria-hidden="true">
          {[10, 20, 30, 40, 50, 60, 70, 80, 90].map((x) => <line key={`v${x}`} x1={x} y1="0" x2={x} y2="50" stroke="var(--sand-line)" strokeWidth="0.15" />)}
          {[5, 10, 15, 20, 25, 30, 35, 40, 45].map((y) => <line key={`h${y}`} x1="0" y1={y} x2="100" y2={y} stroke="var(--sand-line)" strokeWidth="0.15" />)}
          <line x1="0" y1="25" x2="100" y2="25" stroke="var(--sand-line)" strokeWidth="0.4" />
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
                background: 'color-mix(in srgb, var(--forest) 55%, transparent)',
                border: '1.5px solid var(--forest)', display: 'grid', placeItems: 'center', cursor: 'default'
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
              <div className="flex flex-wrap" style={{ gap: 14 }}>
                {STAFF_DEPARTMENTS.map((d) => (
                  <label key={d.value} className="flex items-center text-xs" style={{ gap: 6 }}>
                    <input type="checkbox" checked={s.departments.includes(d.value)} onChange={(e) => toggleStaffDept(s, d.value, e.target.checked)} /> {d.label}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Super Admin — CMS (spec Part 16F.8/16F.9 "Website Content Management System" + Blog).
function AdminCmsPanel({ onFlash }) {
  const [sub, setSub] = useState('pages');
  return (
    <div>
      <h3 className="font-semibold mb-2">Content Management</h3>
      <nav className="cz-tabbar" style={{ marginBottom: 20 }}>
        {[{ key: 'pages', label: 'Pages' }, { key: 'blog', label: 'Blog' }].map((t) => (
          <button key={t.key} type="button" aria-pressed={sub === t.key} className={`cz-tab${sub === t.key ? ' active' : ''}`} onClick={() => setSub(t.key)}>{t.label}</button>
        ))}
      </nav>
      {sub === 'pages' && <AdminCmsCollection onFlash={onFlash} kind="pages" />}
      {sub === 'blog' && <AdminCmsCollection onFlash={onFlash} kind="blog" />}
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
    } catch (err) { onFlash(err.message); } finally { setSavingMaintenance(false); }
  }

  return (
    <div>
      <h3 className="font-semibold mb-2">Backups & Maintenance</h3>

      <div className="card" style={{ padding: 20, marginBottom: 24 }}>
        <div className="flex items-center justify-between flex-wrap" style={{ gap: 14 }}>
          <div>
            <strong className="text-sm">{maintenance ? 'Maintenance Mode: ON' : 'Maintenance Mode: OFF'}</strong>
            <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 4, lineHeight: 1.6, maxWidth: 480 }}>
              {maintenance ? 'Every request except login and Super Admin access is blocked platform-wide (503).' : 'Turn this on to lock the platform to everyone except Super Admin — for emergencies or scheduled upgrades.'}
            </p>
          </div>
          <label className="flex items-center" style={{ gap: 10, flexShrink: 0, cursor: savingMaintenance ? 'wait' : 'pointer' }}>
            <input type="checkbox" checked={!!maintenance} disabled={maintenance === null || savingMaintenance} onChange={(e) => toggleMaintenance(e.target.checked)} />
          </label>
        </div>
      </div>

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

function AdminFinancePanel({ onFlash }) {
  const [data, setData] = useState(null);
  const [feeRateInput, setFeeRateInput] = useState('');
  const [featuredFeeInput, setFeaturedFeeInput] = useState('');
  const [featuredFee, setFeaturedFee] = useState(null);

  function load() {
    apiRequest('/admin/finance').then((d) => { setData(d); setFeeRateInput(String(d.platformRevenue.institutionFeeCommission.rate)); }).catch((err) => onFlash(err.message));
    apiRequest('/jobs/featured-fee').then((d) => { setFeaturedFee(d); setFeaturedFeeInput(String(d.fee)); }).catch(() => {});
  }
  useEffect(load, [onFlash]);

  async function saveFeeRate(e) {
    e.preventDefault();
    try {
      await apiRequest('/admin/institution-fee-commission-rate', { method: 'PATCH', body: { rate: Number(feeRateInput) } });
      onFlash('Institution fee commission rate updated.', 'success');
      load();
    } catch (err) { onFlash(err.message); }
  }
  async function saveFeaturedFee(e) {
    e.preventDefault();
    try {
      await apiRequest('/jobs/featured-fee', { method: 'PATCH', body: { fee: Number(featuredFeeInput) } });
      onFlash('Featured job fee updated.', 'success');
      load();
    } catch (err) { onFlash(err.message); }
  }

  if (!data) return <p role="status" className="admin-notice">Loading...</p>;

  const feeRow = (key, label) => <p className="text-sm">{label}: <strong>{data.fees[key]?.total || 0}</strong> ({data.fees[key]?.count || 0} records)</p>;
  const orderRow = (key, label) => <p className="text-sm">{label}: <strong>{data.marketplaceOrders[key]?.total || 0}</strong> ({data.marketplaceOrders[key]?.count || 0} orders)</p>;
  const payrollRow = (key, label) => <p className="text-sm">{label}: <strong>{data.payroll[key]?.total || 0}</strong> ({data.payroll[key]?.count || 0} payslips)</p>;
  const rev = data.platformRevenue;

  return (
    <div>
      <h3 className="font-semibold mb-2">Financial Management</h3>

      <div className="card" style={{ padding: 20, marginBottom: 16, border: '1px solid var(--gold)' }}>
        <h4 className="font-semibold mb-1">Platform Revenue (real, computed)</h4>
        <p className="text-xs" style={{ color: 'var(--ink-soft)', marginBottom: 12 }}>{rev.note}</p>
        <p className="text-2xl font-semibold" style={{ marginBottom: 10 }}>${rev.total}</p>
        <p className="text-sm">Institution fee commission: <strong>${rev.institutionFeeCommission.amount}</strong> ({rev.institutionFeeCommission.rate}% of ${rev.institutionFeeCommission.basedOn} collected)</p>
        <p className="text-sm">Marketplace commission: <strong>${rev.marketplaceCommission.amount}</strong> ({rev.marketplaceCommission.rate}% of ${rev.marketplaceCommission.basedOn} in delivered orders)</p>
        <p className="text-sm">Featured job listings: <strong>${rev.featuredJobRevenue.amount}</strong> ({rev.featuredJobRevenue.count} purchased)</p>

        <div className="flex gap-6 flex-wrap" style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--sand-line)' }}>
          <form onSubmit={saveFeeRate} className="flex items-end gap-2">
            <label className="text-xs" style={{ display: 'block' }}>Institution fee commission %
              <input className="form-input" type="number" min="0" max="100" step="0.5" value={feeRateInput} onChange={(e) => setFeeRateInput(e.target.value)} style={{ width: 90, marginTop: 4 }} />
            </label>
            <button type="submit" className="btn btn-primary" style={{ padding: '7px 14px', fontSize: '0.8rem' }}>Save</button>
          </form>
          <form onSubmit={saveFeaturedFee} className="flex items-end gap-2">
            <label className="text-xs" style={{ display: 'block' }}>Featured job fee (USD / {featuredFee?.days || 30} days)
              <input className="form-input" type="number" min="0" step="1" value={featuredFeeInput} onChange={(e) => setFeaturedFeeInput(e.target.value)} style={{ width: 90, marginTop: 4 }} />
            </label>
            <button type="submit" className="btn btn-primary" style={{ padding: '7px 14px', fontSize: '0.8rem' }}>Save</button>
          </form>
        </div>
      </div>

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
          c.subject, c.submittedBy?.fullName,
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

// No cloud storage (S3/Cloudinary) is connected anywhere in this app yet, so a photo can't be
// uploaded to external storage. Instead: resize it in the browser (a phone photo can be several
// MB — far past the 2mb JSON body limit) and store it as a base64 data URI directly on the User
// document, the same way profilePhoto/coverImage were already stored (just never had a real
// upload form). Small enough after resize to comfortably fit the request body.
function resizeImageToDataUrl(file, maxDimension = 320, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read that file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('That file is not a readable image.'));
      img.onload = () => {
        const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function ProfilePanel({ user, onFlash, onChanged }) {
  const { logout } = useAuth();
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

  async function resend() {
    try { await resendVerification(); setSent(true); onFlash('Verification code sent. Check the backend console (SMTP is not configured yet).', 'success'); } catch (err) { onFlash(err.message); }
  }
  async function verify(e) {
    e.preventDefault();
    try { await verifyEmail(code); onFlash('Email verified!', 'success'); setCode(''); onChanged?.(); } catch (err) { onFlash(err.message); }
  }

  function startEdit() {
    setForm({ fullName: user.fullName || '', phone: user.phone || '', profilePhoto: user.profilePhoto || '' });
    setEditing(true);
  }

  async function handlePhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return onFlash('Please choose an image file.');
    try {
      const dataUrl = await resizeImageToDataUrl(file);
      setForm((f) => ({ ...f, profilePhoto: dataUrl }));
    } catch (err) { onFlash(err.message); }
  }

  async function saveProfile(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await apiRequest('/users/me', { method: 'PATCH', body: form });
      onFlash('Profile updated.', 'success');
      setEditing(false);
      onChanged?.();
    } catch (err) { onFlash(err.message); } finally { setSaving(false); }
  }

  async function deleteAccount(e) {
    e.preventDefault();
    if (!deletePassword) return onFlash('Enter your password to confirm.');
    setDeleting(true);
    try {
      await apiRequest('/users/me', { method: 'DELETE', body: { currentPassword: deletePassword } });
      await logout();
    } catch (err) { onFlash(err.message); setDeleting(false); }
  }

  if (!user) return null;
  return (
    <div className="card" style={{ padding: 22, marginBottom: 20 }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
        <h3 className="font-semibold">Personal Information</h3>
        {!editing && <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.78rem' }} onClick={startEdit}>Edit Profile</button>}
      </div>

      {!editing ? (
        <div className="flex items-center" style={{ gap: 16 }}>
          {user.profilePhoto
            ? <img src={user.profilePhoto} alt="" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
            : <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--forest)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.3rem', flexShrink: 0 }}>{(user.fullName || '?')[0]}</div>}
          <div className="account-profile-details">
            <p><strong>Name:</strong> {user.fullName}</p>
            <p><strong>Email:</strong> {user.email} {user.emailVerified ? <Tag status="approved" /> : <Tag status="pending" />}</p>
            <p><strong>Phone:</strong> {user.phone || '—'}</p>
            <p><strong>Roles:</strong> {user.roles.join(', ')}</p>
            <p><strong>Status:</strong> {user.status}</p>
          </div>
        </div>
      ) : (
        <form onSubmit={saveProfile} style={{ display: 'grid', gap: 14, maxWidth: 420 }}>
          <div className="flex items-center" style={{ gap: 16 }}>
            {form.profilePhoto
              ? <img src={form.profilePhoto} alt="" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
              : <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--forest)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.3rem', flexShrink: 0 }}>{(form.fullName || '?')[0]}</div>}
            <label className="btn" style={{ padding: '7px 14px', fontSize: '0.78rem', cursor: 'pointer' }}>
              Choose Photo
              <input type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
            </label>
            {form.profilePhoto && (
              <button type="button" className="btn" title="Remove selected photo" style={{ padding: '7px 10px', fontSize: '0.78rem', color: '#b42318', borderColor: '#e5b4b4' }} onClick={() => setForm((f) => ({ ...f, profilePhoto: '' }))}>
                ✕
              </button>
            )}
          </div>
          <label className="text-xs" style={{ color: 'var(--ink-soft)', fontWeight: 600 }}>Full Name
            <input className="form-input" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} style={{ marginTop: 6 }} required />
          </label>
          <label className="text-xs" style={{ color: 'var(--ink-soft)', fontWeight: 600 }}>Phone
            <input className="form-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={{ marginTop: 6 }} />
          </label>
          <div className="flex" style={{ gap: 10 }}>
            <button type="submit" className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '0.8rem' }} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
            <button type="button" className="btn" style={{ padding: '8px 18px', fontSize: '0.8rem' }} onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </form>
      )}

      {!user.emailVerified && (
        <div style={{ marginTop: 18, padding: 20, borderRadius: 16, background: 'var(--sand)' }}>
          <div className="flex items-start" style={{ gap: 12 }}>
            <span style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--paper-raised)', color: 'var(--forest)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <FaShieldHalved aria-hidden="true" size={16} />
            </span>
            <div>
              <strong className="text-sm">Verify your email</strong>
              <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 4 }}>The code is printed in the backend terminal — SMTP isn't configured yet, so it isn't emailed for real.</p>
            </div>
          </div>

          <button type="button" className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '0.8rem', marginTop: 16 }} onClick={resend}>
            {sent ? 'Resend code' : 'Send verification code'}
          </button>

          <form onSubmit={verify} className="flex items-end flex-wrap" style={{ gap: 12, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--sand-line)' }}>
            <input className="form-input" placeholder="6-digit code" value={code} onChange={(e) => setCode(e.target.value)} style={{ maxWidth: 180, minWidth: 0, background: 'var(--paper-raised)' }} />
            <button type="submit" className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '0.8rem', flexShrink: 0 }}>Verify</button>
          </form>
        </div>
      )}

      <div style={{ marginTop: 18, padding: 20, borderRadius: 16, background: 'var(--paper-raised)', border: '1px solid #e5b4b4' }}>
        <strong className="text-sm" style={{ color: '#b42318' }}>Delete Account</strong>
        <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 4 }}>
          This permanently deactivates your CareerZ account and signs you out everywhere. This cannot be undone from the app.
        </p>

        {!confirmingDelete ? (
          <button type="button" className="btn" style={{ padding: '8px 18px', fontSize: '0.8rem', marginTop: 12, color: '#b42318', borderColor: '#e5b4b4' }} onClick={() => setConfirmingDelete(true)}>
            Delete My Account
          </button>
        ) : (
          <form onSubmit={deleteAccount} style={{ display: 'grid', gap: 10, marginTop: 12, maxWidth: 320 }}>
            <label className="text-xs" style={{ color: 'var(--ink-soft)', fontWeight: 600 }}>Confirm your password
              <input type="password" className="form-input" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} style={{ marginTop: 6 }} required autoFocus />
            </label>
            <div className="flex" style={{ gap: 10 }}>
              <button type="submit" className="btn" style={{ padding: '8px 18px', fontSize: '0.8rem', background: '#b42318', color: '#fff', borderColor: '#b42318' }} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
              <button type="button" className="btn" style={{ padding: '8px 18px', fontSize: '0.8rem' }} onClick={() => { setConfirmingDelete(false); setDeletePassword(''); }} disabled={deleting}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
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
      <form onSubmit={submit} className="flex items-end flex-wrap" style={{ gap: 12, marginBottom: 24 }}>
        <div style={{ flex: '1 1 220px', minWidth: 0 }}>
          <CustomSelect
            value={role} onChange={setRole} ariaLabel="Role to request" minWidth="100%"
            options={roleOptions.map((r) => ({ value: r, label: r.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) }))}
          />
        </div>
        <button type="submit" className="btn btn-primary" style={{ flexShrink: 0 }}>Submit Request</button>
      </form>
      <h3 className="font-semibold mb-2">My Requests</h3>
      <Table loading={loading} error={loadError} onRetry={load} headers={['Role', 'Status', 'Requested']} rows={requests.map((r) => [r.requestedRole, <Tag status={r.status} />, new Date(r.createdAt).toLocaleDateString()])} empty="No requests yet." />
    </div>
  );
}

function ComplaintTargetPicker({ target, onPick, onClear }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); return; }
    const t = setTimeout(() => {
      apiRequest(`/users/search?q=${encodeURIComponent(query.trim())}`).then((r) => { setResults(r); setOpen(true); }).catch(() => {});
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  if (target) {
    return (
      <div className="form-input" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <span>Against: <strong>{target.fullName}</strong> ({target.email})</span>
        <button type="button" className="btn" style={{ padding: '3px 10px', fontSize: '0.75rem' }} onClick={onClear}>Remove</button>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      <input
        className="form-input" placeholder="Search person by name or email (optional — who is this against?)"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      {open && results.length > 0 && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 5, maxHeight: 220, overflowY: 'auto', background: 'var(--paper, #fff)', border: '1px solid var(--sand-line, #ddd)', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', marginTop: 4 }}>
          {results.map((u) => (
            <button
              type="button" key={u._id}
              style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', border: 'none', background: 'transparent', cursor: 'pointer' }}
              onMouseDown={() => { onPick(u); setQuery(''); setResults([]); setOpen(false); }}
            >
              <div>{u.fullName}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--ink-soft)' }}>{u.email} · {(u.roles || []).join(', ')}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SupportComplaintPanel({ onFlash }) {
  const [complaints, setComplaints] = useState(null);
  const [form, setForm] = useState({ subject: '', category: 'other', description: '' });
  const [target, setTarget] = useState(null);

  function load() { apiRequest('/complaints/mine').then(setComplaints).catch((err) => onFlash(err.message)); }
  useEffect(load, []);

  async function submit(e) {
    e.preventDefault();
    try {
      const body = { ...form, targetType: target ? 'user' : 'none', targetId: target?._id || null };
      await apiRequest('/complaints', { method: 'POST', body });
      onFlash('Complaint submitted. Our team will review it.', 'success');
      setForm({ subject: '', category: 'other', description: '' });
      setTarget(null);
      load();
    } catch (err) { onFlash(err.message); }
  }

  return (
    <div className="admin-section admin-account-card" style={{ marginTop: 20 }}>
      <div className="admin-section-heading"><div><h2>Report a Problem</h2><p>File a complaint for the platform team to review.</p></div><FaShieldHalved aria-hidden="true" /></div>
      <form onSubmit={submit} style={{ display: 'grid', gap: 12, marginBottom: 24 }}>
        <input className="form-input" placeholder="Subject" required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
        <CustomSelect
          value={form.category} onChange={(v) => setForm({ ...form, category: v })} ariaLabel="Complaint category" minWidth="100%"
          options={['harassment', 'fraud', 'technical', 'billing', 'content', 'other'].map((c) => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) }))}
        />
        <ComplaintTargetPicker target={target} onPick={setTarget} onClear={() => setTarget(null)} />
        <textarea className="form-input" placeholder="Describe the issue" rows={3} required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <button type="submit" className="btn btn-primary" style={{ justifySelf: 'start', padding: '7px 18px' }}>Submit Complaint</button>
      </form>
      <Table
        loading={complaints === null}
        headers={['Subject', 'Against', 'Category', 'Status', 'Filed']}
        rows={(complaints || []).map((c) => [c.subject, c.target ? `${c.target.fullName} (${c.target.email})` : '—', c.category, <Tag status={c.status === 'resolved' ? 'approved' : c.status === 'dismissed' ? 'rejected' : 'pending'} />, new Date(c.createdAt).toLocaleDateString()])}
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
  { value: 'disabled', label: 'Disabled' }
];

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
          u.fullName, u.email, u.roles.join(', '), <Tag status={u.status === 'active' ? 'approved' : 'rejected'} label={u.status} />,
          u.roles.includes('super_admin') ? '—' : (
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
          <button type="button" className="btn" disabled={page <= 1} style={{ padding: '6px 14px', fontSize: '0.8rem' }} onClick={() => setPage((p) => Math.max(1, p - 1))}>← Prev</button>
          <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>Page {page} of {totalPages}</span>
          <button type="button" className="btn" disabled={page >= totalPages} style={{ padding: '6px 14px', fontSize: '0.8rem' }} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next →</button>
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

function InstitutionPanel({ onFlash, onChanged }) {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ name: '', type: 'school', country: '', city: '' });
  const [editForm, setEditForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [docUrl, setDocUrl] = useState('');
  const [submittingDocs, setSubmittingDocs] = useState(false);
  async function load() { try { setList(await apiRequest('/institutions/mine/list')); } catch (err) { onFlash(err.message); } }
  useEffect(() => { load(); }, []);

  async function submitDocuments(e) {
    e.preventDefault();
    if (!docUrl.trim()) return onFlash('Add at least one document link first.');
    setSubmittingDocs(true);
    try {
      await apiRequest(`/institutions/${mine._id}/verification-documents`, { method: 'POST', body: { documents: [docUrl.trim()] } });
      onFlash('Documents submitted — Super Admin has been notified for review.', 'success');
      setDocUrl('');
      load();
    } catch (err) { onFlash(err.message); } finally { setSubmittingDocs(false); }
  }

  const mine = list[0];
  useEffect(() => {
    if (mine && !editForm) {
      setEditForm({
        city: mine.city || '', address: mine.address || '', description: mine.description || '',
        contactEmail: mine.contactEmail || '', contactPhone: mine.contactPhone || '', website: mine.website || '',
        admissionRequirements: mine.admissionRequirements || '', admissionDeadline: mine.admissionDeadline ? mine.admissionDeadline.slice(0, 10) : ''
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mine]);

  async function submit(e) {
    e.preventDefault();
    try {
      await apiRequest('/institutions', { method: 'POST', body: { ...form, country: form.country.toUpperCase() } });
      onFlash('Institution registered.', 'success');
      setForm({ name: '', type: 'school', country: '', city: '' });
      load(); onChanged?.();
    } catch (err) { onFlash(err.message); }
  }

  async function saveDetails(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await apiRequest(`/institutions/${mine._id}`, { method: 'PATCH', body: { ...editForm, admissionDeadline: editForm.admissionDeadline || null } });
      onFlash('Institution details updated.', 'success');
      load();
    } catch (err) { onFlash(err.message); } finally { setSaving(false); }
  }

  return (
    <div>
      {!mine && (
        <form onSubmit={submit} className="space-y-3 mb-6 max-w-md">
          <input className="form-input" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <select className="form-select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            {['school', 'college', 'university', 'academy', 'madrasa', 'tuition_center'].map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <input className="form-input" placeholder="Country code (e.g. PK)" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
          <input className="form-input" placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <button type="submit" className="btn btn-primary">Register</button>
        </form>
      )}
      <Table headers={['Name', 'Type', 'Verification']} rows={list.map((i) => [i.name, i.type, <Tag status={i.verificationStatus} />])} empty="No institutions yet." />

      {mine && editForm && (
        <form onSubmit={saveDetails} className="space-y-3 mt-6 max-w-md">
          <h3 className="font-semibold mb-1">Institution Details</h3>
          <input className="form-input" placeholder="City" value={editForm.city} onChange={(e) => setEditForm({ ...editForm, city: e.target.value })} />
          <input className="form-input" placeholder="Address" value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} />
          <textarea className="form-input" placeholder="Description" rows={3} value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
          <input className="form-input" placeholder="Contact email" value={editForm.contactEmail} onChange={(e) => setEditForm({ ...editForm, contactEmail: e.target.value })} />
          <input className="form-input" placeholder="Contact phone" value={editForm.contactPhone} onChange={(e) => setEditForm({ ...editForm, contactPhone: e.target.value })} />
          <input className="form-input" placeholder="Website" value={editForm.website} onChange={(e) => setEditForm({ ...editForm, website: e.target.value })} />
          <textarea className="form-input" placeholder="Admission requirements" rows={3} value={editForm.admissionRequirements} onChange={(e) => setEditForm({ ...editForm, admissionRequirements: e.target.value })} />
          <label className="block text-xs" style={{ color: 'var(--ink-soft)' }}>Admission deadline
            <input type="date" className="form-input" value={editForm.admissionDeadline} onChange={(e) => setEditForm({ ...editForm, admissionDeadline: e.target.value })} />
          </label>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Details'}</button>
        </form>
      )}
    </div>
  );
}

function StudentPanel({ onFlash }) {
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [openCourseId, setOpenCourseId] = useState(null);

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
      <Table
        loading={loading} error={loadError} onRetry={load}
        headers={['Course', 'Status', 'Progress', 'Action']}
        rows={enrollments.map((e) => [
          e.course?.title, e.status, `${e.progressPercent}%`,
          <button className="btn" style={{ padding: '4px 12px', fontSize: '0.78rem' }} onClick={() => setOpenCourseId(e.course?._id)}>View Resources</button>
        ])}
        empty="No enrollments yet."
      />
      {openCourseId && <CourseResourcesPanel courseId={openCourseId} onFlash={onFlash} onClose={() => setOpenCourseId(null)} />}
    </div>
  );
}

// PDF: "Course Resources — Central Download Area" — every lesson's notes, video link (external
// provider, never hosted by us) and downloadable materials live in one place per course.
function CourseResourcesPanel({ courseId, onFlash, onClose }) {
  const [data, setData] = useState(null);
  const [completedIds, setCompletedIds] = useState([]);

  function load() {
    apiRequest(`/courses/${courseId}`, { auth: false }).then(setData).catch((err) => onFlash(err.message));
    apiRequest('/students/me/enrollments').then((list) => {
      const mine = list.find((e) => e.course?._id === courseId);
      setCompletedIds((mine?.completedLessons || []).map(String));
    }).catch(() => {});
  }
  useEffect(load, [courseId]);

  async function toggleComplete(lessonId) {
    try {
      await apiRequest(`/courses/lessons/${lessonId}/complete`, { method: 'PATCH' });
      onFlash('Progress updated.', 'success');
      load();
    } catch (err) { onFlash(err.message); }
  }

  const totalLessons = data?.lessons.length || 0;
  const progressPercent = totalLessons > 0 ? Math.round((completedIds.length / totalLessons) * 100) : 0;

  return (
    <div className="card reveal in mt-4" style={{ padding: 20 }}>
      {!data && <p role="status" className="admin-notice">Loading...</p>}
      {data && (
        <>
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-semibold">{data.course.title}</h4>
            <button type="button" className="btn" style={{ padding: '4px 12px', fontSize: '0.78rem' }} onClick={onClose}>Close</button>
          </div>
          <p className="text-xs mb-1" style={{ color: 'var(--ink-soft)' }}>
            {data.course.teacher?.fullName ? `Teacher: ${data.course.teacher.fullName}` : ''}
            {data.course.institution?.name ? ` · Institution: ${data.course.institution.name}` : ''}
          </p>
          {totalLessons > 0 && <p className="text-xs mb-4" style={{ color: 'var(--ink-soft)' }}>Progress: {completedIds.length}/{totalLessons} lessons ({progressPercent}%)</p>}
          {data.lessons.length === 0 && <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>No lessons published for this course yet.</p>}
          {data.lessons.map((l) => {
            const isDone = completedIds.includes(l._id);
            return (
              <div key={l._id} className="border border-[var(--sand-line)] rounded-xl p-3 mb-3">
                <div className="flex items-center justify-between">
                  <strong className="text-sm">{l.title}</strong>
                  <button type="button" className={isDone ? 'btn' : 'btn btn-primary'} style={{ padding: '3px 10px', fontSize: '0.72rem' }} onClick={() => toggleComplete(l._id)}>{isDone ? '✓ Completed' : 'Mark Complete'}</button>
                </div>
                {l.content && <p className="text-sm mt-1" style={{ whiteSpace: 'pre-wrap' }}>{l.content}</p>}
                {l.videoUrl && <a href={l.videoUrl} target="_blank" rel="noreferrer" className="text-xs mt-2" style={{ display: 'inline-block', color: 'var(--emerald)' }}>▶ Watch video</a>}
                {(l.resources || []).length > 0 && (
                  <div className="mt-2 flex gap-3 flex-wrap">
                    {l.resources.map((r, i) => (
                      <a key={i} href={r.url} target="_blank" rel="noreferrer" className="text-xs" style={{ color: 'var(--emerald)' }}>📄 {r.name || 'Download'}</a>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

function TeacherPanel({ onFlash }) {
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({ title: '', subject: '', institution: '', classSection: '' });
  const [openCourseId, setOpenCourseId] = useState(null);
  const [myInstitutions, setMyInstitutions] = useState([]);
  const [sectionsForInstitution, setSectionsForInstitution] = useState([]);
  async function load() { try { setCourses(await apiRequest('/courses/mine/list')); } catch (err) { onFlash(err.message); } }
  useEffect(() => { load(); }, []);
  useEffect(() => { apiRequest('/institutions/mine/list').then(setMyInstitutions).catch(() => {}); }, []);
  useEffect(() => {
    if (!form.institution) { setSectionsForInstitution([]); return; }
    apiRequest(`/institutions/${form.institution}/class-sections`).then(setSectionsForInstitution).catch(() => setSectionsForInstitution([]));
  }, [form.institution]);

  async function create(e) {
    e.preventDefault();
    try {
      await apiRequest('/courses', { method: 'POST', body: { title: form.title, subject: form.subject, institution: form.institution || undefined, classSection: form.classSection || undefined } });
      onFlash('Course created (unpublished).', 'success');
      setForm({ title: '', subject: '', institution: '', classSection: '' });
      load();
    } catch (err) { onFlash(err.message); }
  }
  async function publish(id) {
    try { await apiRequest(`/courses/${id}`, { method: 'PATCH', body: { published: true } }); onFlash('Course published.', 'success'); load(); } catch (err) { onFlash(err.message); }
  }

  const fieldLabel = { fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--ink-soft)', display: 'block', marginBottom: 6 };

  return (
    <div>
      <h3 className="font-semibold" style={{ marginBottom: 14 }}>Create a New Course</h3>
      <form onSubmit={create} className="card" style={{ padding: 20, marginBottom: 28 }}>
        <div className="flex flex-wrap items-end" style={{ gap: 14 }}>
          <label style={{ flex: '1 1 200px', minWidth: 0 }}>
            <span style={fieldLabel}>Course title</span>
            <input className="form-input" placeholder="e.g. Grade 9 Physics" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </label>
          <label style={{ flex: '1 1 160px', minWidth: 0 }}>
            <span style={fieldLabel}>Subject</span>
            <input className="form-input" placeholder="e.g. Physics" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
          </label>
          <label style={{ flex: '1 1 200px', minWidth: 0 }}>
            <span style={fieldLabel}>Institution</span>
            <select className="form-select" value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value, classSection: '' })}>
              <option value="">Independent (no institution)</option>
              {myInstitutions.map((i) => <option key={i._id} value={i._id}>{i.name}</option>)}
            </select>
          </label>
          {form.institution && (
            <label style={{ flex: '1 1 180px', minWidth: 0 }}>
              <span style={fieldLabel}>Class section</span>
              <select className="form-select" value={form.classSection} onChange={(e) => setForm({ ...form, classSection: e.target.value })}>
                <option value="">No class section</option>
                {sectionsForInstitution.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </label>
          )}
          <button type="submit" className="btn btn-primary" style={{ flexShrink: 0, padding: '11px 20px', height: 46 }}>Create Course</button>
        </div>
      </form>
      <h3 className="font-semibold" style={{ marginBottom: 14 }}>My Courses</h3>
      <Table
        headers={['Title', 'Published', 'Action']}
        rows={courses.map((c) => [
          c.title, c.published ? <Tag status="approved" /> : <Tag status="pending" />,
          <div className="flex" style={{ gap: 8 }}>
            {!c.published && <button className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.78rem' }} onClick={() => publish(c._id)}>Publish</button>}
            <button className="btn" style={{ padding: '6px 14px', fontSize: '0.78rem' }} onClick={() => setOpenCourseId(c._id)}>Manage Lessons</button>
          </div>
        ])}
        empty="No courses yet."
      />
      {openCourseId && <TeacherLessonsPanel courseId={openCourseId} onFlash={onFlash} onClose={() => setOpenCourseId(null)} />}
    </div>
  );
}

// PDF: "Course Resources — Central Download Area" (teacher side) — add notes, an external
// video link (we never host/stream video ourselves), and downloadable materials per lesson.
function TeacherLessonsPanel({ courseId, onFlash, onClose }) {
  const [data, setData] = useState(null);
  const [form, setForm] = useState({ title: '', content: '', videoUrl: '', resourceName: '', resourceUrl: '' });

  function load() {
    apiRequest(`/courses/${courseId}`).then(setData).catch((err) => onFlash(err.message));
  }
  useEffect(load, [courseId]);

  async function addLesson(e) {
    e.preventDefault();
    try {
      const resources = form.resourceUrl ? [{ name: form.resourceName || 'Download', url: form.resourceUrl }] : [];
      await apiRequest(`/courses/${courseId}/lessons`, { method: 'POST', body: { title: form.title, content: form.content, videoUrl: form.videoUrl || null, resources } });
      onFlash('Lesson added.', 'success');
      setForm({ title: '', content: '', videoUrl: '', resourceName: '', resourceUrl: '' });
      load();
    } catch (err) { onFlash(err.message); }
  }

  return (
    <div className="card reveal in" style={{ padding: 20, marginTop: 16 }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 18 }}>
        <h4 className="font-semibold">{data?.course?.title || 'Lessons'}</h4>
        {onClose && <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.78rem' }} onClick={onClose}>Close</button>}
      </div>
      <form onSubmit={addLesson} style={{ display: 'grid', gap: 12, marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid var(--sand-line)' }}>
        <input className="form-input" placeholder="Lesson title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <textarea className="form-input" placeholder="Notes / content" rows={3} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
        <input className="form-input" placeholder="Video link (YouTube, Drive, etc. — optional)" value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} />
        <div className="flex flex-wrap" style={{ gap: 12 }}>
          <input className="form-input" placeholder="Resource name (optional)" value={form.resourceName} onChange={(e) => setForm({ ...form, resourceName: e.target.value })} style={{ flex: '1 1 200px', minWidth: 0 }} />
          <input className="form-input" placeholder="Resource link (optional)" value={form.resourceUrl} onChange={(e) => setForm({ ...form, resourceUrl: e.target.value })} style={{ flex: '1 1 200px', minWidth: 0 }} />
        </div>
        <button type="submit" className="btn btn-primary" style={{ justifySelf: 'start', padding: '8px 20px' }}>Add Lesson</button>
      </form>
      {(data?.lessons || []).length > 0 && (
        <div style={{ display: 'grid', gap: 12 }}>
          {data.lessons.map((l, i) => (
            <div key={l._id} className="hover-card card" style={{ padding: 18, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <span style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--sand)', color: 'var(--forest)', display: 'grid', placeItems: 'center', flexShrink: 0, fontWeight: 700, fontSize: 13 }}>{i + 1}</span>
              <div style={{ minWidth: 0, flex: 1 }}>
                <strong className="text-sm">{l.title}</strong>
                {l.content && <p className="text-sm" style={{ whiteSpace: 'pre-wrap', marginTop: 6, color: 'var(--ink-soft)' }}>{l.content}</p>}
                {(l.videoUrl || (l.resources || []).length > 0) && (
                  <div className="flex flex-wrap items-center" style={{ gap: 8, marginTop: 12 }}>
                    {l.videoUrl && (
                      <a href={l.videoUrl} target="_blank" rel="noreferrer" className="text-xs" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 999, background: 'var(--sand)', border: '1px solid var(--sand-line)', color: 'var(--forest)', fontWeight: 600 }}>▶ Video link</a>
                    )}
                    {(l.resources || []).map((r, ri) => (
                      <a key={ri} href={r.url} target="_blank" rel="noreferrer" className="text-xs" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 999, background: 'var(--sand)', border: '1px solid var(--sand-line)', color: 'var(--forest)', fontWeight: 600 }}>📄 {r.name || 'Download'}</a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {data && data.lessons.length === 0 && (
        <div className="student-empty-state">
          <FaFileLines aria-hidden="true" />
          <p>No lessons added yet</p>
        </div>
      )}
    </div>
  );
}

// A dedicated sidebar page for "Learning Material Upload" — the document lists it separately
// from "Resource Library" (browse/read vs upload), so it gets its own course-select + the
// same real upload form "Manage Lessons" already uses (no separate content system, same data).
function TeacherMaterialUploadPanel({ onFlash }) {
  const { courses, courseId, setCourseId } = useTeacherCourses(onFlash);
  return (
    <div>
      <h3 className="font-semibold mb-2">Learning Material Upload</h3>
      <p className="text-xs mb-3" style={{ color: 'var(--ink-soft)' }}>Add lesson notes, video links and downloadable resources to any of your courses.</p>
      <CourseSelect courses={courses} value={courseId} onChange={setCourseId} />
      {courseId && <TeacherLessonsPanel courseId={courseId} onFlash={onFlash} />}
    </div>
  );
}

// "Student Communication" — a dedicated per-student contact list, separate from the generic
// "Chat System" (shared Messages tab): shows every student across the teacher's courses with
// their latest message thread, reusing /messages/conversations for the real unread/last-message data.
function TeacherStudentCommunicationPanel({ onFlash, onNavigate }) {
  const { courses } = useTeacherCourses(onFlash);
  const [students, setStudents] = useState(null);
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    if (!courses || courses.length === 0) { setStudents([]); return; }
    Promise.all(courses.map((c) => apiRequest(`/courses/${c._id}/students`).then((list) => list.map((e) => ({ ...e.student, courseTitle: c.title }))).catch(() => [])))
      .then((lists) => {
        const flat = lists.flat();
        const unique = Array.from(new Map(flat.map((s) => [s._id, s])).values());
        setStudents(unique);
      });
    apiRequest('/messages/conversations').then(setConversations).catch(() => {});
  }, [courses]);

  if (students === null) return <p role="status" className="admin-notice">Loading...</p>;

  return (
    <div>
      <h3 className="font-semibold" style={{ marginBottom: 16 }}>Student Communication</h3>
      {students.length === 0 && (
        <div className="student-empty-state" style={{ border: '1px solid var(--sand-line)', borderRadius: 18 }}>
          <FaUsers aria-hidden="true" />
          <p>No students enrolled in your courses yet</p>
        </div>
      )}
      <div style={{ display: 'grid', gap: 12 }}>
        {students.map((s) => {
          const convo = conversations.find((c) => c.user._id === s._id);
          return (
            <div key={s._id} className="hover-card card" style={{ padding: 18 }}>
              <div className="flex items-center justify-between flex-wrap" style={{ gap: 14 }}>
                <div className="flex items-center" style={{ gap: 12 }}>
                  <span style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--gold)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>{s.fullName[0]}</span>
                  <div>
                    <strong className="text-sm">{s.fullName}</strong>
                    <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 2 }}>{s.courseTitle}</p>
                  </div>
                </div>
                <button type="button" className="btn btn-primary" style={{ padding: '7px 16px', fontSize: '0.78rem', flexShrink: 0 }} onClick={() => onNavigate?.('messages')}>{convo ? 'View / Reply' : 'Message'}</button>
              </div>
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--sand-line)' }}>
                {convo ? (
                  <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>"{convo.lastMessage}" — {new Date(convo.lastAt).toLocaleString()}{convo.unread > 0 ? ` · ${convo.unread} unread` : ''}</p>
                ) : (
                  <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>No messages yet.</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ParentPanel({ onFlash }) {
  const [children, setChildren] = useState([]);
  const [email, setEmail] = useState('');
  const [relationship, setRelationship] = useState('guardian');
  async function load() { try { setChildren(await apiRequest('/parents/children')); } catch (err) { onFlash(err.message); } }
  useEffect(() => { load(); }, []);

  async function link(e) {
    e.preventDefault();
    try { await apiRequest('/parents/link-requests', { method: 'POST', body: { studentEmail: email, relationship } }); onFlash('Link request sent. The student must approve it.', 'success'); setEmail(''); } catch (err) { onFlash(err.message); }
  }

  return (
    <div>
      <h3 className="font-semibold" style={{ marginBottom: 4 }}>Link a Child</h3>
      <p className="text-xs" style={{ color: 'var(--ink-soft)', marginBottom: 16 }}>Enter your child's account email — they'll need to approve the request from their own account before you can see their data.</p>
      <form onSubmit={link} className="card" style={{ padding: 20, marginBottom: 28 }}>
        <div className="flex flex-wrap items-end" style={{ gap: 14 }}>
          <label style={{ flex: '2 1 240px', minWidth: 0 }}>
            <span className="text-xs" style={{ display: 'block', color: 'var(--ink-soft)', fontWeight: 600, marginBottom: 6 }}>Student's email</span>
            <input className="form-input" type="email" placeholder="e.g. child@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label style={{ flex: '1 1 160px', minWidth: 0 }}>
            <span className="text-xs" style={{ display: 'block', color: 'var(--ink-soft)', fontWeight: 600, marginBottom: 6 }}>Relationship</span>
            <select className="form-select" value={relationship} onChange={(e) => setRelationship(e.target.value)} style={{ textTransform: 'capitalize' }}>
              {['father', 'mother', 'guardian', 'sponsor'].map((r) => <option key={r} value={r} style={{ textTransform: 'capitalize' }}>{r}</option>)}
            </select>
          </label>
          <button type="submit" className="btn btn-primary" style={{ flexShrink: 0, padding: '11px 20px', height: 46 }}>Send Link Request</button>
        </div>
      </form>
      <h3 className="font-semibold mb-2">My Children</h3>
      <Table
        headers={['Name', 'Email', 'Relationship', 'Access']}
        rows={children.map((c) => [
          c.student.fullName, c.student.email,
          <span style={{ textTransform: 'capitalize' }}>{c.relationship}</span>,
          c.relationship === 'sponsor'
            ? <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>View progress &amp; pay fees only</span>
            : <span className="text-xs" style={{ color: 'var(--forest)' }}>Full guardian access</span>
        ])}
        empty="No approved children yet."
      />
      <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 10 }}>
        Father / Mother / Guardian links get full access, including Health Record and signing permission slips. A Sponsor link can view academic progress and pay fees, but cannot edit medical information or sign trip/event/medical consent on the child's behalf.
      </p>
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
    <div className="grid g2" style={{ gap: 20, alignItems: 'start' }}>
      <div>
        <h3 className="font-semibold" style={{ marginBottom: 18 }}>Conversations</h3>
        {conversations === null && <p role="status" className="admin-notice">Loading...</p>}
        {conversations && conversations.length === 0 && (
          <div className="student-empty-state" style={{ border: '1px solid var(--sand-line)', borderRadius: 18 }}>
            <FaCommentDots aria-hidden="true" />
            <p>No conversations yet</p>
            <span>Start one on the right using a User ID.</span>
          </div>
        )}
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
      <div className="card" style={{ padding: 20 }}>
        <h3 className="font-semibold" style={{ marginBottom: 14 }}>{activeUser ? activeUser.fullName : 'New Message'}</h3>
        {!activeUser && (
          <label style={{ display: 'block', marginBottom: 14 }}>
            <span className="text-xs" style={{ display: 'block', color: 'var(--ink-soft)', fontWeight: 600, marginBottom: 6 }}>Recipient's User ID</span>
            <input className="form-input" placeholder="Paste a User ID to start a new conversation" value={newRecipientId} onChange={(e) => setNewRecipientId(e.target.value)} />
          </label>
        )}
        {activeUser && (
          <div className="card reveal in" style={{ padding: '10px 14px', marginBottom: 14, maxHeight: 320, overflowY: 'auto' }}>
            {thread === null && <p role="status" className="admin-notice">Loading...</p>}
            {thread && thread.length === 0 && (
              <div className="student-empty-state" style={{ minHeight: 100, padding: '16px 0' }}>
                <p>No messages yet</p>
                <span>Say hello to start the conversation.</span>
              </div>
            )}
            {(thread || []).map((m, idx) => (
              <div key={m._id} style={{ padding: '10px 4px', borderBottom: idx < thread.length - 1 ? '1px solid var(--sand-line)' : 'none' }}>
                <div style={{ fontSize: 13 }}>{m.text}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 4 }}>{new Date(m.createdAt).toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}
        <form onSubmit={send} className="flex items-end" style={{ gap: 12 }}>
          <input className="form-input" placeholder="Type a message..." value={text} onChange={(e) => setText(e.target.value)} required style={{ flex: '1 1 auto', minWidth: 0 }} />
          <button type="submit" className="btn btn-primary" style={{ flexShrink: 0 }}>Send</button>
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

  const unreadCount = (notifications || []).filter((n) => !n.read).length;

  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
        <h3 className="font-semibold">Notifications{unreadCount > 0 ? ` (${unreadCount} unread)` : ''}</h3>
        {unreadCount > 0 && <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.8rem' }} onClick={markAllRead}>Mark all read</button>}
      </div>
      {notifications === null && <p role="status" className="admin-notice">Loading...</p>}
      {notifications && notifications.length === 0 && (
        <div className="student-empty-state" style={{ border: '1px solid var(--sand-line)', borderRadius: 18 }}>
          <FaBell aria-hidden="true" />
          <p>No notifications yet</p>
          <span>Updates and reminders that matter to you will show up here.</span>
        </div>
      )}
      {notifications && notifications.length > 0 && (
        <div className="dash-list" style={{ border: '1px solid var(--sand-line)', borderRadius: 18, background: 'var(--paper-raised)', overflow: 'hidden', gap: 0 }}>
          {notifications.map((n, idx) => (
            <div key={n._id} className={`dash-list-item${!n.read ? ' unread' : ''}`} style={{ cursor: n.read ? 'default' : 'pointer', borderBottom: idx < notifications.length - 1 ? '1px solid var(--sand-line)' : 'none' }} onClick={() => !n.read && markRead(n._id)}>
              <span className="dash-list-icon c-forest" aria-hidden><FaBell size={14} /></span>
              <div className="dash-list-body"><div className="title">{n.title}</div><div className="desc">{n.body}</div></div>
              <span className="dash-list-time">{new Date(n.createdAt).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Aggregates whichever real, role-appropriate schedule data the current account
// has access to (weekly timetable, fee due dates, assignment due dates). Tries
// each source independently so it degrades gracefully for roles with none of them,
// rather than hard-coding a role check here.
const CAL_EVENT_COLOR = { class: 'var(--forest)', assignment: 'var(--gold)', exam: 'var(--rose)', fee: 'var(--emerald)', goal: 'var(--emerald)' };
const CAL_EVENT_LABEL = { class: 'Class', assignment: 'Assignment', exam: 'Exam', fee: 'Fee due', goal: 'Goal due' };

function dateKey(d) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }

function CalendarPanel({ onFlash }) {
  const [timetable, setTimetable] = useState(null);
  const [fees, setFees] = useState(null);
  const [pendingAssignments, setPendingAssignments] = useState(null);
  const [pendingExams, setPendingExams] = useState(null);
  const [goals, setGoals] = useState([]);
  const [viewDate, setViewDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  useEffect(() => {
    apiRequest('/students/me/timetable').then(setTimetable).catch(() => {
      apiRequest('/teachers/me/timetable').then(setTimetable).catch(() => setTimetable([]));
    });
    apiRequest('/students/me/fees').then(setFees).catch(() => setFees([]));
    // Real pending (not-yet-submitted) assignments with real due dates — same source
    // the dashboard home page's Assignment Overview uses, not "already submitted" ones.
    apiRequest('/students/me/dashboard').then((dash) => setPendingAssignments(dash.pendingAssignments)).catch(() => setPendingAssignments([]));
    // Real exam dates — the dashboard's own pendingExams has no scheduledDate, so this
    // walks enrollments -> per-course /exams the same way the Assignments page already does.
    apiRequest('/students/me/enrollments').then(async (enrollments) => {
      const active = enrollments.filter((e) => e.course);
      const lists = await Promise.all(active.map((e) =>
        apiRequest(`/courses/${e.course._id}/exams`).then((list) => list.map((ex) => ({ ...ex, courseTitle: e.course.title }))).catch(() => [])
      ));
      setPendingExams(lists.flat().filter((ex) => ex.scheduledDate));
    }).catch(() => setPendingExams([]));
    // Goal target dates — only students have this endpoint; other roles silently get none.
    apiRequest('/students/me/goals').then((list) => setGoals(list.filter((g) => g.status === 'active' && g.targetDate))).catch(() => setGoals([]));
  }, []);

  const loading = timetable === null || fees === null || pendingAssignments === null || pendingExams === null;

  // Every event, bucketed by calendar date-key, for the currently viewed month.
  const eventsByDate = {};
  function addEvent(date, type, title, detail) {
    if (!date) return;
    const key = dateKey(date);
    if (!eventsByDate[key]) eventsByDate[key] = [];
    eventsByDate[key].push({ type, title, detail });
  }

  if (!loading) {
    const monthStart = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
    const monthEnd = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0);

    // Recurring weekly classes -> every real calendar occurrence inside the visible month.
    (timetable || []).forEach((t) => {
      const targetDow = DOW_INDEX[t.dayOfWeek];
      if (targetDow === undefined) return;
      for (let d = new Date(monthStart); d <= monthEnd; d.setDate(d.getDate() + 1)) {
        if (d.getDay() === targetDow) addEvent(new Date(d), 'class', t.subject, `${t.startTime}–${t.endTime}${t.room ? ` · ${t.room}` : ''}`);
      }
    });
    (pendingAssignments || []).forEach((a) => { if (a.dueDate) addEvent(new Date(a.dueDate), 'assignment', a.title, 'Due date'); });
    (pendingExams || []).forEach((e) => { if (e.scheduledDate) addEvent(new Date(e.scheduledDate), 'exam', e.title, e.courseTitle || ''); });
    (fees || []).filter((f) => f.status !== 'paid' && f.dueDate).forEach((f) => addEvent(new Date(f.dueDate), 'fee', f.title, `${f.currency} ${f.amount}`));
    (goals || []).forEach((g) => addEvent(new Date(g.targetDate), 'goal', g.title, `${g.progressPercent}% complete`));
  }

  const firstWeekday = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const cells = [...Array(firstWeekday).fill(null), ...Array(daysInMonth).fill(0).map((_, i) => i + 1)];
  const today = new Date();
  const selectedEvents = eventsByDate[dateKey(selectedDate)] || [];

  return (
    <div>
      <h3 className="font-semibold mb-3">Calendar</h3>
      {loading && <p role="status" className="admin-notice">Loading...</p>}

      {!loading && (
        <>
          <div className="flex items-center justify-between" style={{ marginBottom: 14, padding: '10px 16px', background: 'var(--paper-raised)', border: '1px solid var(--sand-line)', borderRadius: 14 }}>
            <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.8rem' }} onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}>‹ Prev</button>
            <strong style={{ fontFamily: 'Fraunces, serif', fontSize: 16 }}>{viewDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</strong>
            <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.8rem' }} onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}>Next ›</button>
          </div>

          <div className="flex flex-wrap items-center" style={{ gap: 16, marginBottom: 14 }}>
            {Object.entries(CAL_EVENT_LABEL).map(([type, label]) => (
              <span key={type} className="flex items-center text-xs" style={{ gap: 6, color: 'var(--ink-soft)' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: CAL_EVENT_COLOR[type], display: 'inline-block' }} />
                {label}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 mb-4" style={{ textAlign: 'center' }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => <div key={d} className="text-xs font-semibold" style={{ color: 'var(--ink-soft)', padding: '4px 0' }}>{d}</div>)}
            {cells.map((day, i) => {
              if (!day) return <div key={i} />;
              const cellDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
              const key = dateKey(cellDate);
              const isToday = dateKey(today) === key;
              const isSelected = dateKey(selectedDate) === key;
              const dayEvents = eventsByDate[key] || [];
              return (
                <button
                  type="button" key={i} onClick={() => setSelectedDate(cellDate)}
                  className="card" style={{
                    padding: '6px 2px', cursor: 'pointer', minHeight: 46,
                    border: isSelected ? '2px solid var(--forest)' : isToday ? '1px solid var(--forest)' : '1px solid var(--sand-line)',
                    background: isSelected ? 'var(--sand)' : 'transparent'
                  }}
                >
                  <div className="text-xs">{day}</div>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    {[...new Set(dayEvents.map((e) => e.type))].slice(0, 4).map((type) => (
                      <span key={type} style={{ width: 5, height: 5, borderRadius: '50%', background: CAL_EVENT_COLOR[type], display: 'inline-block' }} />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="card" style={{ padding: 20, marginBottom: 16 }}>
            <strong className="text-sm" style={{ fontFamily: 'Fraunces, serif', fontSize: 15 }}>{selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</strong>
            {selectedEvents.length === 0 && <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 10 }}>Nothing scheduled on this date.</p>}
            {selectedEvents.map((e, i) => (
              <div key={i} className="flex items-center" style={{ gap: 8, marginTop: 10 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: CAL_EVENT_COLOR[e.type], display: 'inline-block', flexShrink: 0 }} />
                <p className="text-xs">{CAL_EVENT_LABEL[e.type]}: <strong>{e.title}</strong> {e.detail ? `— ${e.detail}` : ''}</p>
              </div>
            ))}
          </div>

          <p className="text-xs" style={{ color: 'var(--ink-soft)', marginBottom: 20, fontStyle: 'italic' }}>Personal events aren't supported yet — this calendar only shows real classes, assignments, exams and fee deadlines pulled from your account.</p>

          {(timetable && timetable.length > 0) && (
            <div className="mb-6">
              <h4 className="font-semibold mb-2">Upcoming Classes</h4>
              <Table
                headers={['Next Date', 'Day', 'Time', 'Subject', 'Room']}
                rows={timetable.map((t) => {
                  const nextDate = nextDateForDow(t.dayOfWeek, t.startTime);
                  return [nextDate ? nextDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '—', DOW_LABEL[t.dayOfWeek], `${t.startTime}–${t.endTime}`, t.subject, t.room || '—'];
                })}
                empty="No classes scheduled."
              />
            </div>
          )}

          <div className="mb-6">
            <h4 className="font-semibold mb-2">Assignments</h4>
            <Table
              headers={['Assignment', 'Due']}
              rows={(pendingAssignments || []).map((a) => [a.title, a.dueDate ? new Date(a.dueDate).toLocaleDateString() : '—'])}
              empty="No pending assignments."
            />
          </div>

          <div className="mb-6">
            <h4 className="font-semibold mb-2">Exams</h4>
            <Table
              headers={['Exam', 'Course', 'Scheduled']}
              rows={(pendingExams || []).map((e) => [e.title, e.courseTitle || '—', new Date(e.scheduledDate).toLocaleString()])}
              empty="No upcoming exams."
            />
          </div>

          <div className="mb-6">
            <h4 className="font-semibold mb-2">Fee Due Dates (Deadlines)</h4>
            <Table
              headers={['Title', 'Amount', 'Due']}
              rows={(fees || []).filter((f) => f.status !== 'paid' && f.dueDate).map((f) => [f.title, `${f.currency} ${f.amount}`, new Date(f.dueDate).toLocaleDateString()])}
              empty="No upcoming fees."
            />
          </div>
        </>
      )}
    </div>
  );
}

function SettingsPanel({ user, onFlash, onChanged }) {
  const [form, setForm] = useState({ fullName: user?.fullName || '', phone: user?.phone || '', country: user?.country || '', language: user?.language || 'en', profilePhoto: user?.profilePhoto || '', companyName: user?.companyName || '', donorType: user?.donorType || '' });
  const [twoFactor, setTwoFactor] = useState(!!user?.twoFactorEnabled);
  const [savingTwoFactor, setSavingTwoFactor] = useState(false);
  const isDonor = user?.roles?.includes('donor');
  const isSeller = user?.roles?.includes('marketplace_seller');
  const showCompanyName = user?.roles?.includes('employer') || user?.roles?.includes('education_agent') || isSeller || (isDonor && form.donorType === 'organization');
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  async function saveProfile(e) {
    e.preventDefault();
    try {
      await apiRequest('/users/me', { method: 'PATCH', body: form });
      onFlash('Settings saved.', 'success');
      onChanged?.();
    } catch (err) { onFlash(err.message); }
  }

  async function toggleTwoFactor(next) {
    setSavingTwoFactor(true);
    try {
      await apiRequest('/users/me', { method: 'PATCH', body: { twoFactorEnabled: next } });
      setTwoFactor(next);
      onFlash(next ? 'Two-factor authentication enabled — you\'ll get an email code at every login.' : 'Two-factor authentication disabled.', 'success');
      onChanged?.();
    } catch (err) { onFlash(err.message); } finally { setSavingTwoFactor(false); }
  }

  async function changePassword(e) {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) { onFlash('New passwords do not match.'); return; }
    try {
      await apiRequest('/users/me/password', { method: 'PATCH', body: { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword } });
      onFlash('Password updated.', 'success');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { onFlash(err.message); }
  }

  return (
    <div>
      <h3 className="font-semibold mb-3">Account Settings</h3>
      <form onSubmit={saveProfile} className="card" style={{ padding: 22, display: 'grid', gap: 14, maxWidth: 480, marginBottom: 24 }}>
        <div className="flex items-center" style={{ gap: 14 }}>
          {form.profilePhoto
            ? <img src={form.profilePhoto} alt="" style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} onError={(e) => { e.target.style.display = 'none'; }} />
            : <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--forest)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 20, flexShrink: 0 }}>{(form.fullName || '?')[0]}</div>}
          <input className="form-input" placeholder="Profile photo URL (paste an image link)" value={form.profilePhoto} onChange={(e) => setForm({ ...form, profilePhoto: e.target.value })} style={{ flex: '1 1 auto', minWidth: 0 }} />
        </div>
        <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: -4 }}>No file storage is wired up yet — upload your photo somewhere (Google Drive, Imgur, etc.), share it publicly, and paste the direct image link here.</p>
        <input className="form-input" placeholder="Full name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
        {isDonor && (
          <select className="form-select" value={form.donorType} onChange={(e) => setForm({ ...form, donorType: e.target.value })}>
            <option value="">Select donor type</option>
            <option value="individual">Individual</option>
            <option value="organization">Organization</option>
          </select>
        )}
        {showCompanyName && <input className="form-input" placeholder={isDonor ? 'Organization name' : isSeller ? 'Store name' : 'Company / Agency name'} value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />}
        {isSeller && <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: -4 }}>The profile photo above also doubles as your store logo.</p>}
        <input className="form-input" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <input className="form-input" placeholder="Country code (e.g. PK)" value={form.country || ''} onChange={(e) => setForm({ ...form, country: e.target.value })} />
        <select className="form-select" value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })}>
          <option value="en">English</option>
          <option value="ur">Urdu</option>
          <option value="ar">Arabic</option>
        </select>
        <button type="submit" className="btn btn-primary" style={{ padding: '7px 18px', justifySelf: 'start' }}>Save Settings</button>
      </form>

      <h3 className="font-semibold mb-3">Change Password</h3>
      <form onSubmit={changePassword} className="card" style={{ padding: 22, display: 'grid', gap: 14, maxWidth: 480, marginBottom: 24 }}>
        <input className="form-input" type="password" placeholder="Current password" value={pwForm.currentPassword} onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })} required />
        <input className="form-input" type="password" placeholder="New password" value={pwForm.newPassword} onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })} required minLength={8} />
        <input className="form-input" type="password" placeholder="Confirm new password" value={pwForm.confirmPassword} onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })} required minLength={8} />
        <button type="submit" className="btn btn-primary" style={{ padding: '7px 18px', justifySelf: 'start' }}>Update Password</button>
      </form>

      <h3 className="font-semibold mb-3">Two-Factor Authentication</h3>
      <div className="card" style={{ padding: 22, maxWidth: 480 }}>
        <div className="flex items-center justify-between flex-wrap" style={{ gap: 14 }}>
          <div style={{ minWidth: 0 }}>
            <p className="text-sm" style={{ fontWeight: 600 }}>{twoFactor ? 'Enabled' : 'Disabled'}</p>
            <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 4, lineHeight: 1.6 }}>{twoFactor ? 'A login code is emailed to you every time you sign in — password alone is not enough.' : 'Add an extra step at login: a one-time code emailed to you after your password.'}</p>
          </div>
          <label className="flex items-center" style={{ gap: 10, flexShrink: 0, cursor: savingTwoFactor ? 'wait' : 'pointer' }}>
            <input type="checkbox" checked={twoFactor} disabled={savingTwoFactor} onChange={(e) => toggleTwoFactor(e.target.checked)} />
          </label>
        </div>
      </div>
    </div>
  );
}

const FAQ_ITEMS = [
  { q: 'How do I switch between my roles (e.g. Student and Teacher)?', a: 'If you hold more than one role, a row of tabs appears above your dashboard — click any tab to switch workspaces instantly.' },
  { q: 'I requested a new role — why can\'t I post yet?', a: 'The workspace unlocks immediately, but posting a job, scholarship, listing or course requires Super Admin verification first. You\'ll see a banner while it\'s pending.' },
  { q: 'How do I link my child\'s account as a parent?', a: 'Go to My Children and send a link request by their email — they need to approve it from their own account before you see their data.' },
  { q: 'How do I verify a certificate I received?', a: 'Every certificate has a QR code and a public verification link — anyone can scan or open it without logging in.' },
  { q: 'Who can see my messages?', a: 'Only you and the person you\'re messaging. Institution admins can only review a conversation if a complaint is filed about it.' }
];

function HelpCenterPanel({ onFlash }) {
  return (
    <div>
      <h3 className="font-semibold" style={{ marginBottom: 4 }}>Frequently Asked Questions</h3>
      <p className="text-xs" style={{ color: 'var(--ink-soft)', marginBottom: 16 }}>Quick answers to the questions we hear most.</p>
      <div style={{ display: 'grid', gap: 12, marginBottom: 28 }}>
        {FAQ_ITEMS.map((item) => (
          <div key={item.q} className="card" style={{ padding: 18, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <span style={{ display: 'grid', placeItems: 'center', width: 32, height: 32, borderRadius: 10, background: 'var(--sand)', color: 'var(--emerald)', flexShrink: 0 }}>
              <FaCircleQuestion aria-hidden="true" size={15} />
            </span>
            <div>
              <strong className="text-sm">{item.q}</strong>
              <p className="text-sm" style={{ color: 'var(--ink-soft)', marginTop: 6 }}>{item.a}</p>
            </div>
          </div>
        ))}
      </div>
      <SupportComplaintPanel onFlash={onFlash} />
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
