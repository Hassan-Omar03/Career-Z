import {
  FaClipboardList, FaBookOpen, FaAward, FaBriefcase,
  FaCircle, FaHand, FaCircleCheck, FaFileLines, FaGraduationCap
} from 'react-icons/fa6';

export function WelcomeBanner({ name }) {
  return (
    <div className="dash-welcome reveal in">
      <div className="dash-welcome-text">
        <h1>Welcome back, {name} <FaHand aria-hidden="true" className="welcome-icon" /></h1>
        <p>Here's what's happening across your CareerZ account today.</p>
      </div>
    </div>
  );
}

const STAT_ICONS = { applications: FaClipboardList, courses: FaBookOpen, approved: FaAward, total: FaBriefcase };

// `stats` comes straight from GET /dashboard/summary — real counts, never hardcoded.
export function OverviewStats({ stats }) {
  return (
    <>
      <div className="dash-section-title"><h2>Overview</h2></div>
      <div className="grid g4">
        {(stats || []).map((s) => {
          const Icon = STAT_ICONS[s.key] || FaClipboardList;
          return (
            <div key={s.key} className="card dash-stat-card reveal in">
              <div className="top-row">
                <div className="dash-stat-icon" aria-hidden><Icon size={18} /></div>
              </div>
              <div className="num">{s.num}</div>
              <div className="label">{s.label}</div>
            </div>
          );
        })}
      </div>
    </>
  );
}

export function WalletCard() {
  return (
    <>
      <div className="dash-section-title"><h2>Wallet</h2></div>
      <div className="card u-wallet-card reveal in">
        <div className="u-wallet-head">
          <h4>Wallet</h4>
          <select className="form-select u-wallet-currency-select" aria-label="Preferred currency" defaultValue="USD">
            {['USD', 'EUR', 'GBP', 'SAR', 'AED', 'PKR', 'INR'].map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <p style={{ fontSize: 13, color: 'var(--ink-soft)', padding: '8px 0' }}>
          Wallet balances, funding and transaction history are on the roadmap — there's no payment backend wired up yet, so no balance is shown here.
        </p>
      </div>
    </>
  );
}

const STATUS_ITEMS = [
  { key: 'pending', label: 'Pending Verification', count: '2 items' },
  { key: 'approved', label: 'Approved', count: '6 items' },
  { key: 'rejected', label: 'Rejected', count: '0 items' },
  { key: 'draft', label: 'Draft', count: '1 item' },
  { key: 'suspended', label: 'Suspended', count: '0 items' }
];

export function StatusGrid() {
  return (
    <>
      <div className="dash-section-title"><h2>Account &amp; Listing Status</h2><a href="#">View all</a></div>
      <div className="dash-status-grid">
        {STATUS_ITEMS.map((s) => (
          <div key={s.key} className={`card dash-status-card status-${s.key} reveal in`}>
            <span className="dash-status-dot"></span>
            <div><div className="label">{s.label}</div><div className="count">{s.count}</div></div>
          </div>
        ))}
      </div>
    </>
  );
}

const QUICK_ACTIONS = ['Apply for Institution', 'Become Teacher', 'Become Employer', 'Become Agent', 'Become Donor', 'Become Trainer', 'Create Marketplace Store'];

export function QuickActions() {
  return (
    <>
      <div className="dash-section-title"><h2>Quick Actions</h2></div>
      <div className="dash-quick-actions">
        {QUICK_ACTIONS.map((a) => (
          <a key={a} href="#" className="dash-quick-btn reveal in"><span className="txt">{a}</span></a>
        ))}
      </div>
    </>
  );
}

// `percent`/`checks` come from GET /dashboard/summary (profile.percent, profile.checks).
export function ProfileCompletion({ percent = 0, checks = [] }) {
  const r = 42;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="card reveal in" style={{ padding: 24 }}>
      <h3 style={{ fontSize: 16, marginBottom: 18 }}>Profile Completion</h3>
      <div className="dash-progress-ring-wrap">
        <svg className="dash-progress-ring" width="96" height="96" viewBox="0 0 96 96">
          <circle cx="48" cy="48" r={r} fill="none" stroke="var(--sand-line)" strokeWidth="9" />
          <circle
            cx="48" cy="48" r={r} fill="none" stroke="var(--emerald)" strokeWidth="9" strokeLinecap="round"
            transform="rotate(-90 48 48)" strokeDasharray={circumference} strokeDashoffset={offset}
          />
          <text x="48" y="53" textAnchor="middle" fontFamily="Fraunces, serif" fontSize="18" fontWeight="700" fill="var(--ink)">{percent}%</text>
        </svg>
        <ul className="dash-progress-list">
          {checks.map((i) => (
            <li key={i.label} className={i.ok ? 'ok' : 'pending'}><span className="profile-status-icon">{i.ok ? <FaCircleCheck aria-label="Completed" /> : <FaCircle aria-label="Incomplete" />}</span> {i.label}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function MiniCalendar() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const label = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="card reveal in" style={{ padding: 24 }}>
      <div className="dash-calendar-head">
        <strong>{label}</strong>
      </div>
      <div className="dash-calendar-grid">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i} className="cal-dow" style={{ fontSize: 11, opacity: 0.6, textAlign: 'center', padding: '4px 0' }}>{d}</div>
        ))}
        {cells.map((d, i) => (
          <div
            key={i}
            style={{
              textAlign: 'center', padding: '6px 0', fontSize: 13, borderRadius: 8,
              background: d === today.getDate() ? 'var(--emerald)' : 'transparent',
              color: d === today.getDate() ? '#fff' : 'inherit',
              fontWeight: d === today.getDate() ? 700 : 400
            }}
          >
            {d || ''}
          </div>
        ))}
      </div>
    </div>
  );
}

// `items` come from GET /dashboard/summary (recommended: your active enrollments).
export function RecommendedGrid({ items }) {
  if (!items || items.length === 0) {
    return (
      <>
        <div className="dash-section-title"><h2>Recommended For You</h2></div>
        <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>Enroll in a course to see it here.</p>
      </>
    );
  }
  return (
    <>
      <div className="dash-section-title"><h2>Recommended For You</h2></div>
      <div className="grid g3">
        {items.map((r) => (
          <div key={r.title} className="card dash-mini-card reveal in">
            <div className="mini-top">
              <span className="dash-mini-icon" aria-hidden><FaBookOpen size={18} /></span>
              <div><h4>{r.title}</h4><div className="meta">{r.meta}</div></div>
            </div>
            <div className="bottom-row">
              <span className="tag">{r.tag}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

const ACTIVITY_ICON = { approved: FaCircleCheck, pending: FaFileLines, under_review: FaFileLines, rejected: FaFileLines, active: FaGraduationCap, completed: FaGraduationCap, dropped: FaFileLines };

// `items` come from GET /dashboard/summary (recentActivity: real role-request + enrollment events).
export function RecentActivity({ items }) {
  return (
    <>
      <div className="dash-section-title"><h2>Recent Activity</h2></div>
      <div className="card reveal in" style={{ padding: '8px 12px' }}>
        <div className="dash-list">
          {(!items || items.length === 0) && <p style={{ fontSize: 13, color: 'var(--ink-soft)', padding: '12px 4px' }}>No activity yet.</p>}
          {(items || []).map((a) => {
            const Icon = ACTIVITY_ICON[a.status] || FaFileLines;
            return (
              <div key={a.id} className="dash-list-item">
                <span className="dash-list-icon c-forest" aria-hidden><Icon size={16} /></span>
                <div className="dash-list-body"><div className="title">{a.title}</div><div className="desc">{a.desc}</div></div>
                <span className="dash-list-time">{new Date(a.time).toLocaleDateString()}</span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
