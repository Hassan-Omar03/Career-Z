import { useEffect, useRef, useState } from 'react';
import {
  FaWallet, FaCommentDots, FaArrowRight, FaCalendarCheck, FaStore, FaClipboardList, FaBookOpen, FaAward, FaBriefcase,
  FaCircle, FaHand, FaCircleCheck, FaFileLines, FaGraduationCap
} from 'react-icons/fa6';
import { apiRequest } from '../../api/client';
import { startJazzCashCheckout, getJazzCashConfig, startSafepayCheckout, getSafepayConfig } from '../../utils/jazzcashCheckout';
import { ManualPayButton, MyManualPayments, ReceivingAccount, IncomingManualPayments } from '../payments/ManualPay';

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

// Wallet — a real balance backed by JazzCash or crypto top-ups (see /payments/jazzcash/wallet/topup) and a
// real internal ledger (Withdraw/Transfer). Available/Pending only ever change via a confirmed
// server-side transaction — never optimistically bumped on the client.
export function WalletCard({ onFlash }) {
  const [currency, setCurrency] = useState('PKR');
  const [wallet, setWallet] = useState(null);
  const [modal, setModal] = useState(null); // 'topup' | 'withdraw' | 'transfer' | null
  const [amount, setAmount] = useState('');
  const [payoutMethod, setPayoutMethod] = useState('bank_transfer');
  const [accountTitle, setAccountTitle] = useState('');
  const [payoutDetails, setPayoutDetails] = useState(''); // account number, IBAN or wallet mobile number
  const [payoutBank, setPayoutBank] = useState('');
  const [payout, setPayout] = useState(null); // { account, banks, wallets }
  const [editAccount, setEditAccount] = useState(false);
  const [withdrawReceipt, setWithdrawReceipt] = useState(null);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientPreview, setRecipientPreview] = useState(null); // {fullName,email} | 'not_found' | null while typing
  const [busy, setBusy] = useState(false);
  const [nowConfig, setNowConfig] = useState(null);
  const [jazzConfig, setJazzConfig] = useState(null);
  const [safepayConfig, setSafepayConfig] = useState(null);
  const [payCurrency, setPayCurrency] = useState('usdttrc20');
  const [cryptoPayment, setCryptoPayment] = useState(null);
  const pollRef = useRef(null);

  function load() {
    apiRequest(`/wallet/me${currency ? `?currency=${currency}` : ''}`).then((w) => { setWallet(w); if (!currency) setCurrency(w.currency); }).catch(() => setWallet({ available: 0, pending: 0, transactions: [] }));
  }
  useEffect(load, [currency]);
  useEffect(() => {
    window.addEventListener('careerz:payment-confirmed', load);
    return () => window.removeEventListener('careerz:payment-confirmed', load);
  }, [currency]);
  useEffect(() => { getJazzCashConfig().then(setJazzConfig); getSafepayConfig().then(setSafepayConfig); }, []);
  useEffect(() => { apiRequest('/wallet/payout-account').then(setPayout).catch(() => setPayout({ account: null, banks: [], wallets: [] })); }, []);
  useEffect(() => { apiRequest('/payments/nowpayments/config').then(setNowConfig).catch(() => setNowConfig({ configured: false, currencies: {} })); }, []);

  // Shown in a converted currency: move to the one the money is held in before paying it out.
  const converted = Boolean(wallet?.balances?.some((b) => b.currency !== currency));
  function switchToHeldCurrency() {
    if (!(wallet?.available > 0) && wallet?.primaryCurrency && wallet.primaryCurrency !== currency) setCurrency(wallet.primaryCurrency);
  }

  function closeModal() { setModal(null); setAmount(''); setAccountTitle(''); setPayoutDetails(''); setPayoutBank(''); setEditAccount(false); setRecipientEmail(''); setRecipientPreview(null); setCryptoPayment(null); }

  async function topUpJazzCash() {
    if (!jazzConfig?.enabled) return onFlash?.('JazzCash payments are not set up yet.', 'error');
    if (!amount || Number(amount) <= 0) return onFlash?.('Enter a valid amount.');
    setBusy(true);
    try { await startJazzCashCheckout('/payments/jazzcash/wallet/topup', { amount: Number(amount), currency }); } catch (err) { onFlash?.(err.message); setBusy(false); }
  }

  async function topUpSafepay() {
    if (!amount || Number(amount) <= 0) return onFlash?.('Enter a valid amount.');
    setBusy(true);
    try { await startSafepayCheckout('/payments/jazzcash/wallet/topup', { amount: Number(amount), currency }); } catch (err) { onFlash?.(err.message); setBusy(false); }
  }

  async function topUpCrypto() {
    if (!nowConfig?.configured) return onFlash?.('Crypto payments are not set up yet.', 'error');
    if (!amount || Number(amount) <= 0) return onFlash?.('Enter a valid amount.');
    setBusy(true);
    try {
      const payment = await apiRequest('/payments/nowpayments/wallet/topup', { method: 'POST', body: { amount: Number(amount), currency, payCurrency } });
      setCryptoPayment(payment);
      clearInterval(pollRef.current);
      pollRef.current = setInterval(async () => {
        try {
          const res = await apiRequest(`/payments/nowpayments/wallet/topup/${payment.paymentId}/sync`);
          if (res.status === 'completed') {
            clearInterval(pollRef.current);
            onFlash?.('Crypto top-up received — wallet credited.', 'success');
            closeModal();
            load();
          }
        } catch { /* keep polling — not confirmed on-chain yet */ }
      }, 15000);
    } catch (err) { onFlash?.(err.message); } finally { setBusy(false); }
  }
  useEffect(() => () => clearInterval(pollRef.current), []);

  // Withdrawals go to the saved bank account or mobile wallet; a new one is checked and saved.
  const useSaved = payout?.account && !editAccount;
  async function withdraw() {
    if (!amount || Number(amount) <= 0) return onFlash?.('Enter a valid amount.');
    if (!useSaved) {
      if (!payoutBank) return onFlash?.(payoutMethod === 'mobile_wallet' ? 'Choose the mobile wallet.' : 'Choose the bank.');
      if (!accountTitle.trim()) return onFlash?.("Enter the account holder's name.");
      if (!payoutDetails.trim()) return onFlash?.(payoutMethod === 'mobile_wallet' ? 'Enter the wallet mobile number.' : 'Enter the IBAN or account number.');
    }
    setBusy(true);
    try {
      const account = useSaved ? {} : { method: payoutMethod, bankName: payoutBank, accountTitle: accountTitle.trim(), accountNumber: payoutDetails.trim() };
      const result = await apiRequest('/wallet/withdraw', { method: 'POST', body: { amount: Number(amount), currency, ...account } });
      if (!useSaved) apiRequest('/wallet/payout-account').then(setPayout).catch(() => {});
      setWithdrawReceipt(result.reference);
      onFlash?.(`Withdrawal requested. CareerZ will send it to your account. Receipt ${result.reference}.`, 'success');
      closeModal();
      load();
    } catch (err) { onFlash?.(err.message); } finally { setBusy(false); }
  }

  // Looks the recipient up as the email is typed — shown to the sender BEFORE they can hit Send,
  // so a typo never silently sends money to a stranger. The actual send still re-resolves and
  // verifies the recipient server-side regardless of this preview.
  useEffect(() => {
    const email = recipientEmail.trim();
    if (modal !== 'transfer' || email.length < 3) { setRecipientPreview(null); return; }
    const t = setTimeout(async () => {
      try {
        const matches = await apiRequest(`/users/search?q=${encodeURIComponent(email)}`);
        const exact = matches.find((u) => u.email.toLowerCase() === email.toLowerCase());
        setRecipientPreview(exact || 'not_found');
      } catch { setRecipientPreview(null); }
    }, 400);
    return () => clearTimeout(t);
  }, [recipientEmail, modal]);

  async function transfer() {
    if (!amount || Number(amount) <= 0) return onFlash?.('Enter a valid amount.');
    if (!recipientEmail.trim()) return onFlash?.("Enter the recipient's email.");
    if (recipientPreview === 'not_found') return onFlash?.('No CareerZ account found with that email.');
    setBusy(true);
    try {
      const result = await apiRequest('/wallet/transfer', { method: 'POST', body: { amount: Number(amount), currency, recipientEmail: recipientEmail.trim() } });
      onFlash?.(`Sent to ${result.recipient?.fullName || recipientEmail} — receipt ${result.reference}.`, 'success');
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
            {[...new Set(['PKR', 'USD', 'EUR', 'GBP', 'SAR', 'AED', 'INR', ...(wallet?.balances || []).map((b) => b.currency)])].map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="grid g2" style={{ gap: 12, padding: '12px 0' }}>
          <div><div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>Available Balance</div><strong style={{ fontSize: 20 }}>{converted ? '≈ ' : ''}{currency} {(wallet?.converted?.available ?? wallet?.available ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></div>
          <div><div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>Pending Balance</div><strong style={{ fontSize: 20 }}>{converted ? '≈ ' : ''}{currency} {(wallet?.converted?.pending ?? wallet?.pending ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></div>
          {(wallet?.balances || []).length > 0 && (converted || wallet.balances.length > 1) && <div className="text-xs" style={{ gridColumn: '1 / -1', color: 'var(--ink-soft)' }}>Your money is held as {wallet.balances.map((b) => `${b.currency} ${b.available.toLocaleString(undefined, { maximumFractionDigits: 2 })}`).join(' · ')}{converted && <>, shown here in {currency} at daily exchange rates (<a href="https://www.exchangerate-api.com" target="_blank" rel="noreferrer">Rates by Exchange Rate API</a>)</>}.{(wallet.converted?.unconverted || []).length > 0 && ` No rate yet for ${wallet.converted.unconverted.map((u) => u.currency).join(', ')}, so it is not included.`} Withdrawals and transfers are made in the currency the money is held in.</div>}
        </div>

        {!modal ? (
          <div className="flex gap-2 flex-wrap" style={{ padding: '4px 0 12px' }}>
            <button type="button" className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.8rem' }} onClick={() => setModal('topup')}>Add Funds</button>
            <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.8rem' }} onClick={() => { switchToHeldCurrency(); setModal('withdraw'); }}>Withdraw</button>
            <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.8rem' }} onClick={() => { switchToHeldCurrency(); setModal('transfer'); }}>Transfer</button>
            {withdrawReceipt && <span className="text-xs" style={{ alignSelf: 'center', color: 'var(--ink-soft)' }}>Last withdrawal receipt: {withdrawReceipt}</span>}
          </div>
        ) : (
          <div style={{ padding: '8px 0 12px', display: 'grid', gap: 8, maxWidth: 320 }}>
            {modal === 'topup' && cryptoPayment ? (
              <div style={{ display: 'grid', gap: 6 }}>
                <p style={{ fontSize: 13 }}>Send exactly <strong>{cryptoPayment.payAmount} {cryptoPayment.payCurrency?.toUpperCase()}</strong> to:</p>
                <code style={{ fontSize: 12, wordBreak: 'break-all', padding: 8, background: 'var(--sand)', color: 'var(--ink)', borderRadius: 8, userSelect: 'all' }}>{cryptoPayment.payAddress}</code>
                <p style={{ fontSize: 12, color: 'var(--ink-soft)' }}>Your wallet credits automatically once the network confirms — this page checks every 15s. You can close this and come back; the top-up isn't lost.</p>
              </div>
            ) : (
              <>
                <input className="form-input" type="number" min="0" placeholder={`Amount (${currency})`} value={amount} onChange={(e) => setAmount(e.target.value)} />
                {modal === 'topup' && nowConfig?.configured && (
                  <select className="form-select" value={payCurrency} onChange={(e) => setPayCurrency(e.target.value)}>
                    {Object.entries(nowConfig.currencies || {}).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                )}
              </>
            )}
            {modal === 'withdraw' && (useSaved ? (
              <div style={{ fontSize: 13, padding: 10, background: 'var(--sand)', borderRadius: 8 }}>
                <div style={{ color: 'var(--ink-soft)', fontSize: 12 }}>Money will be sent to</div>
                <strong>{payout.account.accountTitle}</strong>
                <div>{payout.account.bankName} {payout.account.method === 'mobile_wallet' ? 'wallet' : 'account'} {payout.account.accountNumber}</div>
                <button type="button" className="btn" style={{ padding: '3px 10px', fontSize: '0.72rem', marginTop: 6 }} onClick={() => setEditAccount(true)}>Change account</button>
              </div>
            ) : (
              <>
                <select className="form-select" aria-label="Receive the money in" value={payoutMethod} onChange={(e) => { setPayoutMethod(e.target.value); setPayoutBank(''); }}>
                  <option value="bank_transfer">Bank account</option>
                  <option value="mobile_wallet">Mobile wallet</option>
                </select>
                <select className="form-select" aria-label={payoutMethod === 'mobile_wallet' ? 'Mobile wallet' : 'Bank'} value={payoutBank} onChange={(e) => setPayoutBank(e.target.value)}>
                  <option value="">{payoutMethod === 'mobile_wallet' ? 'Choose the wallet' : 'Choose the bank'}</option>
                  {((payoutMethod === 'mobile_wallet' ? payout?.wallets : payout?.banks) || []).map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
                <input className="form-input" placeholder="Account holder's name (as on the account)" value={accountTitle} onChange={(e) => setAccountTitle(e.target.value)} />
                <input className="form-input" placeholder={payoutMethod === 'mobile_wallet' ? 'Wallet mobile number (03XXXXXXXXX)' : 'IBAN (PK...) or account number'} value={payoutDetails} onChange={(e) => setPayoutDetails(e.target.value)} />
                <span style={{ fontSize: 11, color: 'var(--ink-soft)' }}>Saved for your next withdrawal.</span>
              </>
            ))}
            {modal === 'transfer' && (
              <>
                <input className="form-input" type="email" placeholder="Recipient's email" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} />
                {recipientPreview === 'not_found' && (
                  <span style={{ fontSize: 12, color: 'var(--rose, #e11d48)' }}>No CareerZ account found with that email.</span>
                )}
                {recipientPreview && recipientPreview !== 'not_found' && (
                  <span style={{ fontSize: 12, color: 'var(--emerald, #059669)' }}>Sending to: <strong>{recipientPreview.fullName}</strong> ({recipientPreview.email})</span>
                )}
              </>
            )}
            <div className="flex gap-2">
              {!(modal === 'topup' && (cryptoPayment || !jazzConfig?.enabled)) && (
                <button type="button" className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.8rem' }} disabled={busy || (modal === 'transfer' && recipientPreview === 'not_found')}
                  onClick={modal === 'topup' ? topUpJazzCash : modal === 'withdraw' ? withdraw : transfer}>
                  {busy ? 'Working...' : modal === 'topup' ? 'Pay with JazzCash' : modal === 'withdraw' ? 'Request Withdrawal' : 'Send'}
                </button>
              )}
              {modal === 'topup' && !cryptoPayment && Number(amount) > 0 && (
                <ManualPayButton kind="wallet_topup" query={{ amount: Number(amount), currency }} onFlash={onFlash} onDone={() => { closeModal(); load(); }} />
              )}
              {modal === 'topup' && !cryptoPayment && safepayConfig?.enabled && (
                <button type="button" className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.8rem' }} disabled={busy} onClick={topUpSafepay}>
                  {busy ? 'Working...' : 'Pay with Safepay'}
                </button>
              )}
              {modal === 'topup' && !cryptoPayment && nowConfig?.configured && (
                <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.8rem' }} disabled={busy} onClick={topUpCrypto}>
                  {busy ? 'Working...' : 'Pay with Crypto'}
                </button>
              )}
              <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.8rem' }} onClick={closeModal} disabled={busy}>{cryptoPayment ? 'Close' : 'Cancel'}</button>
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
                <div className="dash-list-body">
                  <div className="title">{TX_LABEL[t.type] || t.type}{t.status === 'pending' ? ' (pending)' : ''}</div>
                  {t.note && <div style={{ fontSize: 11, color: 'var(--ink-soft)' }}>{t.note}</div>}
                  {t.reference && <div style={{ fontSize: 11, color: 'var(--ink-soft)' }}>Receipt: {t.reference}</div>}
                </div>
                <span className="dash-list-time">{t.currency} {t.type === 'transfer_out' || t.type === 'withdrawal' ? '-' : '+'}{t.amount} · {new Date(t.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
        <MyManualPayments onFlash={onFlash} />
        <IncomingManualPayments onFlash={onFlash} />
        <ReceivingAccount onFlash={onFlash} />
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
