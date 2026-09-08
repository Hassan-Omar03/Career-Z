import {
  FaClipboardList, FaBookOpen, FaAward, FaBriefcase, FaSackDollar, FaBagShopping,
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

const STATS = [
  { icon: FaClipboardList, trend: '+2', num: '7', label: 'Active Applications' },
  { icon: FaBookOpen, trend: '+1', num: '4', label: 'Enrolled Courses' },
  { icon: FaAward, trend: 'New', num: '2', label: 'Scholarships Saved' },
  { icon: FaBriefcase, trend: '-1', num: '3', label: 'Saved Jobs', down: true }
];

export function OverviewStats() {
  return (
    <>
      <div className="dash-section-title"><h2>Overview</h2></div>
      <div className="grid g4">
        {STATS.map((s) => (
          <div key={s.label} className="card dash-stat-card reveal in">
            <div className="top-row">
              <div className="dash-stat-icon" aria-hidden><s.icon size={18} /></div>
              <span className={`dash-stat-trend ${s.down ? 'down' : 'up'}`}>{s.trend}</span>
            </div>
            <div className="num">{s.num}</div>
            <div className="label">{s.label}</div>
          </div>
        ))}
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
        <div className="u-wallet-balances">
          <div className="u-wallet-balance-item">
            <span className="label">Available Balance</span>
            <span className="amount">$42,500</span>
          </div>
          <div className="u-wallet-balance-item pending">
            <span className="label">Pending Balance</span>
            <span className="amount">$3,200</span>
          </div>
        </div>
        <div className="u-wallet-actions">
          <button className="dash-quick-btn" type="button"><span className="txt">Add Funds</span></button>
          <button className="dash-quick-btn" type="button"><span className="txt">Withdraw</span></button>
          <button className="dash-quick-btn" type="button"><span className="txt">Transfer</span></button>
        </div>
        <div className="u-wallet-transactions-head"><h5>Recent Transactions</h5></div>
        <div className="dash-list">
          <div className="dash-list-item">
            <span className="dash-list-icon c-emerald"><FaSackDollar size={16} /></span>
            <div className="dash-list-body"><div className="title">Scholarship disbursement</div><div className="desc">NUST Merit Award</div></div>
            <div className="dash-list-time">2d ago</div>
          </div>
          <div className="dash-list-item">
            <span className="dash-list-icon c-gold"><FaBagShopping size={16} /></span>
            <div className="dash-list-body"><div className="title">Marketplace purchase</div><div className="desc">Past Papers Bundle</div></div>
            <div className="dash-list-time">5d ago</div>
          </div>
        </div>
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

const PROFILE_ITEMS = [
  { ok: true, label: 'Basic details added' },
  { ok: true, label: 'Email verified' },
  { ok: false, label: 'Add profile photo' },
  { ok: false, label: 'Complete academic history' }
];

export function ProfileCompletion({ percent = 70 }) {
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
          {PROFILE_ITEMS.map((i) => (
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

const RECOMMENDED = [
  { icon: FaBookOpen, title: 'Intro to Data Science', meta: 'CareerZ Academy · Self-paced', tag: 'Recommended' },
  { icon: FaBriefcase, title: 'Junior Frontend Developer', meta: 'Systems Ltd · Remote', tag: 'Saved' },
  { icon: FaAward, title: 'National Need-Based Scholarship', meta: 'Closes in 18 days', tag: 'Pending' }
];

export function RecommendedGrid() {
  return (
    <>
      <div className="dash-section-title"><h2>Recommended For You</h2><a href="#">View all</a></div>
      <div className="grid g3">
        {RECOMMENDED.map((r) => (
          <div key={r.title} className="card dash-mini-card reveal in">
            <div className="mini-top">
              <span className="dash-mini-icon" aria-hidden><r.icon size={18} /></span>
              <div><h4>{r.title}</h4><div className="meta">{r.meta}</div></div>
            </div>
            <div className="bottom-row">
              <span className="tag">{r.tag}</span>
              <a href="#" className="link-muted" style={{ fontSize: '12.5px' }}>View →</a>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

const ACTIVITY = [
  { icon: FaCircleCheck, color: 'c-emerald', title: 'Institution approved', desc: 'Your application to FAST-NU was approved.', time: '2h ago', unread: true },
  { icon: FaFileLines, color: 'c-forest', title: 'Application submitted', desc: 'Scholarship application sent for review.', time: '5h ago' },
  { icon: FaGraduationCap, color: 'c-gold', title: 'Course enrolled', desc: 'You enrolled in "Intro to Data Science".', time: '1d ago' },
  { icon: FaBriefcase, color: 'c-forest', title: 'Job application sent', desc: 'Applied to Junior Frontend Developer at Systems Ltd.', time: '2d ago' }
];

export function RecentActivity() {
  return (
    <>
      <div className="dash-section-title"><h2>Recent Activity</h2><a href="#">View all</a></div>
      <div className="card reveal in" style={{ padding: '8px 12px' }}>
        <div className="dash-list">
          {ACTIVITY.map((a) => (
            <div key={a.title} className={`dash-list-item${a.unread ? ' unread' : ''}`}>
              <span className={`dash-list-icon ${a.color}`} aria-hidden><a.icon size={16} /></span>
              <div className="dash-list-body"><div className="title">{a.title}</div><div className="desc">{a.desc}</div></div>
              <span className="dash-list-time">{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
