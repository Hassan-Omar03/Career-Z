import { useEffect, useState } from 'react';
import {
  FaWallet, FaCommentDots, FaArrowRight, FaCalendarCheck, FaStore, FaClipboardList, FaBookOpen, FaAward, FaBriefcase,
  FaCircle, FaHand, FaCircleCheck, FaFileLines, FaGraduationCap
} from 'react-icons/fa6';
import { apiRequest } from '../../api/client';
import { loadPaddle, setActiveCheckoutHandler } from '../../utils/paddleLoader';

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

// Wallet — a real balance backed by Paddle top-ups (see /payments/paddle/wallet/topup) and a
// real internal ledger (Withdraw/Transfer). Available/Pending only ever change via a confirmed
// server-side transaction — never optimistically bumped on the client.
export function WalletCard({ onFlash }) {
  const [currency, setCurrency] = useState('USD');
  const [wallet, setWallet] = useState(null);
  const [modal, setModal] = useState(null); // 'topup' | 'withdraw' | 'transfer' | null
  const [amount, setAmount] = useState('');
  const [payoutMethod, setPayoutMethod] = useState('bank_transfer');
  const [payoutDetails, setPayoutDetails] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [paddleConfig, setPaddleConfig] = useState(null);

  function load() {
    apiRequest(`/wallet/me?currency=${currency}`).then(setWallet).catch(() => setWallet({ available: 0, pending: 0, transactions: [] }));
  }
  useEffect(load, [currency]);
  useEffect(() => { apiRequest('/payments/paddle/config').then(setPaddleConfig).catch(() => setPaddleConfig({ enabled: false })); }, []);

  function closeModal() { setModal(null); setAmount(''); setPayoutDetails(''); setRecipientEmail(''); }

  async function topUp() {
    if (!paddleConfig?.enabled) return onFlash?.('Card payments are not set up yet — ask Admin to connect Paddle.', 'error');
    if (!amount || Number(amount) <= 0) return onFlash?.('Enter a valid amount.');
    setBusy(true);
    try {
      const { transactionId } = await apiRequest('/payments/paddle/wallet/topup', { method: 'POST', body: { amount: Number(amount), currency } });
      const Paddle = await loadPaddle(paddleConfig.clientToken, paddleConfig.environment);
      setActiveCheckoutHandler(async () => {
        try {
          await apiRequest(`/payments/paddle/wallet/topup/${transactionId}/sync`);
          load();
        } catch { /* not confirmed yet — user can retry or it'll arrive via webhook */ }
      });
      Paddle.Checkout.open({ transactionId, settings: { displayMode: 'overlay' } });
      closeModal();
    } catch (err) { onFlash?.(err.message); } finally { setBusy(false); }
  }

  async function withdraw() {
    if (!amount || Number(amount) <= 0) return onFlash?.('Enter a valid amount.');
    if (!payoutDetails.trim()) return onFlash?.('Enter your payout details (e.g. account number).');
    setBusy(true);
    try {
      await apiRequest('/wallet/withdraw', { method: 'POST', body: { amount: Number(amount), currency, payoutMethod, payoutDetails: payoutDetails.trim() } });
      onFlash?.('Withdrawal requested — pending Admin review.', 'success');
      closeModal();
      load();
    } catch (err) { onFlash?.(err.message); } finally { setBusy(false); }
  }

  async function transfer() {
    if (!amount || Number(amount) <= 0) return onFlash?.('Enter a valid amount.');
    if (!recipientEmail.trim()) return onFlash?.("Enter the recipient's email.");
    setBusy(true);
    try {
      await apiRequest('/wallet/transfer', { method: 'POST', body: { amount: Number(amount), currency, recipientEmail: recipientEmail.trim() } });
      onFlash?.('Transfer complete.', 'success');
      closeModal();
      load();
    } catch (err) { onFlash?.(err.message); } finally { setBusy(false); }
  }

  const TX_LABEL = { topup: 'Wallet Top-up', withdrawal: 'Withdrawal', transfer_in: 'Received', transfer_out: 'Sent' };

  return (
    <>
      <div className="dash-section-title"><h2>Wallet</h2></div>
      <div className="card u-wallet-card reveal in">
        <div className="u-wallet-head">
          <h4>Wallet</h4>
          <select className="form-select u-wallet-currency-select" aria-label="Preferred currency" value={currency} onChange={(e) => setCurrency(e.target.value)}>
            {['USD', 'EUR', 'GBP', 'SAR', 'AED', 'PKR', 'INR'].map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="grid g2" style={{ gap: 12, padding: '12px 0' }}>
          <div><div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>Available Balance</div><strong style={{ fontSize: 20 }}>{currency} {(wallet?.available ?? 0).toFixed(2)}</strong></div>
          <div><div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>Pending Balance</div><strong style={{ fontSize: 20 }}>{currency} {(wallet?.pending ?? 0).toFixed(2)}</strong></div>
        </div>

        {!modal ? (
          <div className="flex gap-2 flex-wrap" style={{ padding: '4px 0 12px' }}>
            <button type="button" className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.8rem' }} onClick={() => setModal('topup')}>Add Funds</button>
            <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.8rem' }} onClick={() => setModal('withdraw')}>Withdraw</button>
            <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.8rem' }} onClick={() => setModal('transfer')}>Transfer</button>
          </div>
        ) : (
          <div style={{ padding: '8px 0 12px', display: 'grid', gap: 8, maxWidth: 320 }}>
            <input className="form-input" type="number" min="0" placeholder={`Amount (${currency})`} value={amount} onChange={(e) => setAmount(e.target.value)} />
            {modal === 'withdraw' && (
              <>
                <select className="form-select" value={payoutMethod} onChange={(e) => setPayoutMethod(e.target.value)}>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="mobile_wallet">Mobile Wallet</option>
                  <option value="other">Other</option>
                </select>
                <input className="form-input" placeholder="Account number / details" value={payoutDetails} onChange={(e) => setPayoutDetails(e.target.value)} />
              </>
            )}
            {modal === 'transfer' && (
              <input className="form-input" type="email" placeholder="Recipient's email" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} />
            )}
            <div className="flex gap-2">
              <button type="button" className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.8rem' }} disabled={busy}
                onClick={modal === 'topup' ? topUp : modal === 'withdraw' ? withdraw : transfer}>
                {busy ? 'Working...' : modal === 'topup' ? 'Continue to Payment' : modal === 'withdraw' ? 'Request Withdrawal' : 'Send'}
              </button>
              <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.8rem' }} onClick={closeModal} disabled={busy}>Cancel</button>
            </div>
          </div>
        )}

        <h5 style={{ fontSize: 13, fontWeight: 600, margin: '8px 0' }}>Transaction History</h5>
        {wallet === null && <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>Loading...</p>}
        {wallet && (!wallet.transactions || wallet.transactions.length === 0) && <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>No transactions yet.</p>}
        {wallet && wallet.transactions && wallet.transactions.length > 0 && (
          <div className="dash-list">
            {wallet.transactions.map((t) => (
              <div key={t._id} className="dash-list-item">
                <div className="dash-list-body"><div className="title">{TX_LABEL[t.type] || t.type}{t.status === 'pending' ? ' (pending)' : ''}</div></div>
                <span className="dash-list-time">{t.currency} {t.type === 'transfer_out' || t.type === 'withdrawal' ? '-' : '+'}{t.amount} · {new Date(t.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
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

// `actions` is a list of {label, key} — key is the sidebar tab to jump to. Only relevant
// actions for the current workspace are shown; clicking one actually navigates there.
export function QuickActions({ actions = [], onNavigate }) {
  const icons = { scholarships: FaAward, jobs: FaBriefcase, wallet: FaWallet, messages: FaCommentDots, classes: FaCalendarCheck, assignments: FaClipboardList, courses: FaBookOpen, marketplace: FaStore };
  if (actions.length === 0) return null;
  return (
    <>
      <div className="dash-section-title"><h2>Quick Actions</h2></div>
      <div className="dash-quick-actions">
        {actions.map((a) => (
          <button key={a.label} type="button" className="dash-quick-btn reveal in" style={{ border: 'none', cursor: 'pointer' }} onClick={() => onNavigate?.(a.key)}>
            <span className="overview-action-icon">{(() => { const Icon = icons[a.key] || FaClipboardList; return <Icon aria-hidden="true" />; })()}</span><span className="txt">{a.label}</span><FaArrowRight className="overview-action-arrow" aria-hidden="true" />
          </button>
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
export function RecentActivity({ items, embedded = false }) {
  return (
    <>
      {!embedded && <div className="dash-section-title"><h2>Recent Activity</h2></div>}
      <div className={embedded ? "overview-activity-feed" : "card reveal in"} style={embedded ? undefined : { padding: '8px 12px' }}>
        <div className="dash-list">
          {(!items || items.length === 0) && <div className="overview-quiet-state"><FaClipboardList aria-hidden="true" /><strong>Your journey starts here</strong><p>Course enrollments and account updates will appear here.</p></div>}
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
