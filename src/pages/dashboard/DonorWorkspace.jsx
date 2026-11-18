// Donor workspace, moved out of Dashboard.jsx unchanged (master 17G.3: readable, maintainable code).
import DonorPublicProfilePanel from '../../components/dashboard/DonorPublicProfilePanel';
import { DonorForecastCard, DonorImpactCard } from '../../components/donors/DonorMaster';
import { QuickActions, WalletCard } from '../../components/dashboard/DashboardWidgets';
import { FaBell, FaCalendarCheck, FaChartLine, FaFileLines, FaGraduationCap, FaHandshake, FaRegStar, FaShieldHalved, FaStar, FaUser, FaWallet, FaXmark } from 'react-icons/fa6';
import { FundingDocumentLinks } from '../../components/donors/FundingRequests';
import { useEffect, useState } from 'react';
import { apiRequest } from '../../api/client';
import { uploadToPlatformStorage } from '../../utils/platformUpload';
import { ManualPayButton } from '../../components/payments/ManualPay';
import SavedStatus from '../../components/shared/SavedStatus';
import { openPrivateFile } from '../../components/recruitment/files';
import { ComingSoon, CustomSelect, MyScholarshipsPanel, NotificationsPanel, PostScholarshipPanel, ProfilePanel, RECEIVED_KINDS, RolesPanel, SummaryCard, SupportComplaintPanel, Table, Tag } from '../Dashboard';

export function DonorWorkspace({ tab, user, onFlash, onChanged, onNavigate }) {
  if (tab === 'profile') return <><ProfilePanel user={user} onFlash={onFlash} onChanged={onChanged} /><DonorPublicProfilePanel onFlash={onFlash} userId={user?._id} /><RolesPanel onFlash={onFlash} onChanged={onChanged} /><SupportComplaintPanel onFlash={onFlash} /></>;
  if (tab === 'summary') return <><DonorDashboardPanel user={user} onFlash={onFlash} onNavigate={onNavigate} /><DonorForecastCard onFlash={onFlash} /></>;
  if (tab === 'post') return <PostScholarshipPanel onFlash={onFlash} onDone={() => onNavigate?.('scholarships')} />;
  if (tab === 'scholarships') return <MyScholarshipsPanel onFlash={onFlash} onNavigate={onNavigate} />;
  if (tab === 'recommendedFunding') return <RecommendedFundingRequestsPanel onFlash={onFlash} />;
  if (tab === 'opportunities') return <DonationOpportunitiesPanel onFlash={onFlash} />;
  if (tab === 'activeSponsorships') return <ActiveSponsorshipsPanel onFlash={onFlash} />;
  if (tab === 'donationHistory') return <DonationHistoryPanel onFlash={onFlash} />;
  if (tab === 'impactOverview') return <ImpactOverviewPanel onFlash={onFlash} />;
  if (tab === 'impactReports') return <><DonorImpactCard onFlash={onFlash} /><ImpactReportsPanel onFlash={onFlash} onNavigate={onNavigate} /></>;
  if (tab === 'fundingApplications') return <FundingRequestApplicationsPanel onFlash={onFlash} />;
  if (tab === 'wallet') return <><DonorWalletPanel onFlash={onFlash} /><WalletCard onFlash={onFlash} /></>;
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
          <button type="button" className="u-modal-close" onClick={onClose}><FaXmark aria-hidden="true" /></button>
        </div>
        <div className="u-modal-body">
          <p className="text-xs" style={{ marginBottom: 8 }}><strong>Request type:</strong> {request.requestType}</p>
          <p className="text-xs" style={{ marginBottom: 8 }}><strong>Country:</strong> {request.country || 'Not set'}</p>
          <p className="text-xs" style={{ marginBottom: 8 }}><strong>Purpose:</strong> {request.purpose || 'Not provided'}</p>
          <p className="text-xs" style={{ marginBottom: 8 }}><strong>Required:</strong> {request.currency} {request.requiredAmount} · <strong>Collected:</strong> {request.currency} {request.collectedAmount} · <strong>Remaining:</strong> {request.currency} {Math.max(request.requiredAmount - request.collectedAmount, 0)}</p>
          <p className="text-xs" style={{ marginBottom: 8 }}><strong>Deadline:</strong> {request.applicationDeadline ? new Date(request.applicationDeadline).toLocaleDateString() : 'Not set'}</p>
          <p className="text-xs" style={{ marginBottom: 8 }}>
            <strong>Documents:</strong>{' '}
            <FundingDocumentLinks request={request} />
          </p>
          <p className="text-xs"><strong>Verification:</strong> <Tag status={VERIFICATION_TAG[request.verificationStatus]} label={VERIFICATION_LABEL[request.verificationStatus]} /></p>
        </div>
        <div className="u-modal-foot">
          {onSave && <button type="button" className="btn" onClick={() => onSave(request._id)}>{isSaved ? <span className="flex items-center" style={{ gap: 5 }}><FaStar aria-hidden="true" /> Saved</span> : <span className="flex items-center" style={{ gap: 5 }}><FaRegStar aria-hidden="true" /> Save Request</span>}</button>}
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
  const [donateReference, setDonateReference] = useState('');
  const [donateProvider, setDonateProvider] = useState('');
  const [donateProof, setDonateProof] = useState(null);

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
    if (!donateReference.trim()) return onFlash('Enter the payment reference.');
    if (donatePaymentMethod !== 'cash' && !donateProof) return onFlash('Upload payment proof.');
    try {
      const proofUrl = donateProof ? await uploadToPlatformStorage(donateProof, 'donation-payment-proofs') : '';
      await apiRequest(`/funding-requests/${donateFor.request._id}/donate`, { method: 'POST', body: { amount: Number(donateAmount), type: donateFor.type, paymentMethod: donatePaymentMethod, reference: donateReference.trim(), provider: donateProvider.trim(), proofUrl } });
      onFlash('Payment submitted. It will count after the receiver verifies receipt.', 'success');
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
            <button type="button" className="btn" style={{ padding: '6px 12px', fontSize: '0.72rem' }} onClick={() => toggleSave(r._id)}>{savedIds.includes(r._id) ? <span className="flex items-center" style={{ gap: 5 }}><FaStar aria-hidden="true" /> Saved</span> : <span className="flex items-center" style={{ gap: 5 }}><FaRegStar aria-hidden="true" /> Save</span>}</button>
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
              <button type="button" className="u-modal-close" onClick={() => setDonateFor(null)}><FaXmark aria-hidden="true" /></button>
            </div>
            <div className="u-modal-body">
              <p className="text-xs mb-2" style={{ color: 'var(--ink-soft)' }}>{donateFor.request.title} — {donateFor.request.currency} {Math.max(donateFor.request.requiredAmount - donateFor.request.collectedAmount, 0)} remaining</p>
              <input className="form-input" type="number" placeholder={`Amount (${donateFor.request.currency})`} value={donateAmount} onChange={(e) => setDonateAmount(e.target.value)} />
              <p className="text-xs mt-2" style={{ color: 'var(--ink-soft)' }}>Enter the amount, then send it by bank transfer: a small CareerZ service fee to CareerZ and the donation straight to the receiver. CareerZ checks both receipts before it counts.</p>
            </div>
            <div className="u-modal-foot">
              {Number(donateAmount) > 0 && <ManualPayButton kind="donation" id={donateFor.request._id} query={{ amount: Number(donateAmount) }} label={`Pay ${donateFor.type === 'sponsorship' ? 'sponsorship' : 'donation'} by bank transfer`} onFlash={onFlash} onDone={() => { setDonateFor(null); load(); }} />}
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
  const [donateReference, setDonateReference] = useState('');
  const [donateProvider, setDonateProvider] = useState('');
  const [donateProof, setDonateProof] = useState(null);
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
    if (!donateReference.trim()) return onFlash('Enter the payment reference.');
    if (donatePaymentMethod !== 'cash' && !donateProof) return onFlash('Upload payment proof.');
    try {
      const proofUrl = donateProof ? await uploadToPlatformStorage(donateProof, 'donation-payment-proofs') : '';
      await apiRequest(`/funding-requests/${donateFor.request._id}/donate`, { method: 'POST', body: { amount: Number(donateAmount), type: donateFor.type, paymentMethod: donatePaymentMethod, reference: donateReference.trim(), provider: donateProvider.trim(), proofUrl } });
      onFlash('Payment submitted. It will count after the receiver verifies receipt.', 'success');
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
            <button type="button" className="btn" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={() => toggleSave(r._id)}>{savedIds.includes(r._id) ? <span className="flex items-center" style={{ gap: 5 }}><FaStar aria-hidden="true" /> Saved</span> : <span className="flex items-center" style={{ gap: 5 }}><FaRegStar aria-hidden="true" /> Save</span>}</button>
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
              <button type="button" className="u-modal-close" onClick={() => setDonateFor(null)}><FaXmark aria-hidden="true" /></button>
            </div>
            <div className="u-modal-body">
              <p className="text-xs mb-2" style={{ color: 'var(--ink-soft)' }}>{donateFor.request.title} — {donateFor.request.currency} {Math.max(donateFor.request.requiredAmount - donateFor.request.collectedAmount, 0)} remaining</p>
              <input className="form-input" type="number" placeholder={`Amount (${donateFor.request.currency})`} value={donateAmount} onChange={(e) => setDonateAmount(e.target.value)} />
              <p className="text-xs mt-2" style={{ color: 'var(--ink-soft)' }}>Enter the amount, then send it by bank transfer: a small CareerZ service fee to CareerZ and the donation straight to the receiver. CareerZ checks both receipts before it counts.</p>
            </div>
            <div className="u-modal-foot">
              {Number(donateAmount) > 0 && <ManualPayButton kind="donation" id={donateFor.request._id} query={{ amount: Number(donateAmount) }} label={`Pay ${donateFor.type === 'sponsorship' ? 'sponsorship' : 'donation'} by bank transfer`} onFlash={onFlash} onDone={() => { setDonateFor(null); load(); }} />}
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
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentProvider, setPaymentProvider] = useState('');
  const [paymentProof, setPaymentProof] = useState(null);

  function load() {
    apiRequest('/scholarships/mine/sponsorships').then(setSponsorships).catch((err) => onFlash(err.message));
  }
  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function changeStatus(id, status) {
    try {
      await apiRequest(`/scholarships/sponsorships/${id}/status`, { method: 'PATCH', body: { status } });
      onFlash('Sponsorship status updated.', 'success');
      load(); return true;
    } catch (err) { onFlash(err.message); }
  }

  function startPayment(s) {
    setPaymentFor(s._id);
    setPaidAmount(String(s.remainingAmount ?? (s.amount - s.paidAmount)));
    setNextPaymentDate(s.nextPaymentDate ? s.nextPaymentDate.slice(0, 10) : '');
  }

  async function submitPayment(s) {
    const amt = Number(paidAmount);
    if (!(amt > 0)) return onFlash('Enter a valid payment amount.');
    if (!paymentReference.trim()) return onFlash('Enter the payment reference.');
    if (paymentMethod !== 'cash' && !paymentProof) return onFlash('Upload payment proof.');
    try {
      const proofUrl = paymentProof ? await uploadToPlatformStorage(paymentProof, 'sponsorship-payment-proofs') : '';
      await apiRequest(`/scholarships/sponsorships/${s._id}/payment`, {
        method: 'PATCH',
        body: { amount: amt, paymentMethod, reference: paymentReference.trim(), provider: paymentProvider.trim(), proofUrl, nextPaymentDate: nextPaymentDate || null }
      });
      onFlash('Payment submitted for student verification.', 'success');
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
                  <SavedStatus value={s.status} onSave={value=>changeStatus(s._id,value)} label="Sponsorship status" options={Object.entries(SPONSORSHIP_STATUS).map(([value,meta])=>({value,label:meta.label}))}/>
                </div>
                <button type="button" className="btn" style={{ padding: '8px 14px', fontSize: '0.75rem' }} onClick={() => (paymentFor === s._id ? setPaymentFor(null) : startPayment(s))}>Pay student</button>
              </div>
            </div>
            {paymentFor === s._id && (
              <div className="flex items-end flex-wrap" style={{ gap: 14, borderTop: '1px solid var(--sand-line)', paddingTop: 16, marginTop: 16 }}>
                <label className="text-xs" style={{ color: 'var(--ink-soft)', fontWeight: 600 }}>Payment amount ({s.currency})
                  <input type="number" min="0" className="form-input" value={paidAmount} onChange={(e) => setPaidAmount(e.target.value)} style={{ marginTop: 6 }} />
                </label>
                {/* Paid by bank transfer: CareerZ scholarship fee first, then the student; CareerZ checks the receipts. */}
                {Number(paidAmount) > 0 && <ManualPayButton kind="sponsorship_payment" id={s._id} query={{ amount: Number(paidAmount) }} label="Pay student by bank transfer" onFlash={onFlash} onDone={() => { setPaymentFor(null); load(); }} />}
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
          <button type="button" className="u-modal-close" onClick={onClose}><FaXmark aria-hidden="true" /></button>
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

const TRANSFER_STATUS = { commission_submitted: 'CareerZ checking its fee', commission_verified: 'Send money to the receiver', submitted: 'CareerZ is checking', approved: 'Received', rejected: 'Rejected' };

function DonationHistoryPanel({ onFlash }) {
  const [donations, setDonations] = useState(null);
  const [receiptFor, setReceiptFor] = useState(null);
  const [transfers, setTransfers] = useState([]);

  function load() {
    apiRequest('/funding-requests/mine/donations').then(setDonations).catch((err) => onFlash(err.message));
    // Bank-transfer donations still being checked (an approved one shows below as a recorded donation).
    apiRequest('/manual-payments/mine').then((list) => setTransfers(list.filter((m) => RECEIVED_KINDS.includes(m.kind) && !m.donation))).catch(() => setTransfers([]));
  }
  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function changeStatus(id, status) {
    try {
      await apiRequest(`/funding-requests/donations/${id}/status`, { method: 'PATCH', body: { status } });
      onFlash('Donation status updated.', 'success');
      load(); return true;
    } catch (err) { onFlash(err.message); }
  }

  if (donations === null) return <p role="status" className="admin-notice">Loading...</p>;

  return (
    <div>
      <h3 className="font-semibold" style={{ marginBottom: 4 }}>Donation History</h3>
      <p className="text-xs" style={{ color: 'var(--ink-soft)', marginBottom: 16 }}>Your real donation and sponsorship contributions. No live payment gateway — status reflects what you confirm actually happened.</p>
      <Table
        headers={['Date', 'Recipient', 'Purpose', 'Amount', 'Payment Method', 'Transaction ID', 'Status', 'Actions']}
        rows={[...transfers.map((m) => [
          new Date(m.createdAt).toLocaleDateString(),
          m.recipientSnapshot?.name || '—',
          String(m.title || '').replace(/^(Donation|Scholarship):\s*/, ''),
          `${m.currency} ${Number(m.price || 0).toLocaleString()}`,
          'Bank transfer',
          m.sellerLeg?.transactionId || '—',
          <Tag status={m.status === 'approved' ? 'approved' : m.status === 'rejected' ? 'rejected' : 'pending'} label={TRANSFER_STATUS[m.status] || m.status} />,
          m.sellerLeg ? <button type="button" className="btn" style={{ padding: '6px 12px', fontSize: '0.72rem' }} onClick={() => openPrivateFile(`/manual-payments/${m._id}/proof/seller`).catch((err) => onFlash(err.message))}>View Receipt</button> : '—'
        ]), ...donations.map((d) => [
          new Date(d.createdAt).toLocaleDateString(),
          d.fundingRequest?.requestedBy?.fullName || d.fundingRequest?.institution?.name || '—',
          d.fundingRequest?.title || '—',
          `${d.currency} ${d.amount}`,
          PAYMENT_METHOD_LABEL[d.paymentMethod] || d.paymentMethod,
          d.transactionId,
          <div style={{ minWidth: 140 }}>
            <SavedStatus value={d.status} onSave={value=>changeStatus(d._id,value)} label="Donation status" options={Object.entries(DONATION_STATUS).map(([value,meta])=>({value,label:meta.label}))}/>
          </div>,
          <button type="button" className="btn" style={{ padding: '6px 12px', fontSize: '0.72rem' }} onClick={() => setReceiptFor(d)}>View Receipt</button>
        ])]}
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
  const [given, setGiven] = useState([]);

  useEffect(() => {
    apiRequest('/scholarships/mine/sponsorships').then(setSponsorships).catch((err) => onFlash(err.message));
    apiRequest('/scholarships/mine/impact').then((d) => setGiven(d.given || [])).catch(() => {});
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

  function donationReportText(g) {
    const r = g.request;
    return [`Donation impact report`, `Date: ${new Date(g.at).toLocaleDateString()}`, `Request: ${g.title}`, `Receiver: ${g.receiver || '—'}`, `Your donation: ${g.currency} ${Number(g.amount || 0).toLocaleString()} (${g.status})`,
      r ? `Request progress: ${r.currency} ${Number(r.collected).toLocaleString()} of ${r.currency} ${Number(r.required).toLocaleString()} collected (${r.required > 0 ? Math.round((r.collected / r.required) * 100) : 0}%) · status ${r.status}` : ''].filter(Boolean).join('\n');
  }

  function downloadAll() {
    const text = [...live.map((s) => buildReportText(s, lastMessageByStudent[s.student?._id])), ...given.map(donationReportText)].join('\n\n' + '='.repeat(50) + '\n\n');
    downloadTextFile('impact-report-full.txt', text);
    logDonorActivity('impact_report', 'Generated full impact report');
  }

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap" style={{ gap: 12, marginBottom: 4 }}>
        <h3 className="font-semibold">Impact Reports</h3>
        {(live.length > 0 || given.length > 0) && <button type="button" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.8rem' }} onClick={downloadAll}>Download Full Report</button>}
      </div>
      <p className="text-xs" style={{ color: 'var(--ink-soft)', marginBottom: 18 }}>Computed from your real sponsorship, donation and message data.</p>
      {given.length > 0 && (
        <div style={{ display: 'grid', gap: 14, marginBottom: 18 }}>
          {given.map((g, i) => {
            const r = g.request;
            const pct = r?.required > 0 ? Math.min(100, Math.round((r.collected / r.required) * 100)) : 0;
            const rowLabel = { fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--ink-soft)' };
            return (
              <div key={i} className="card" style={{ padding: 20 }}>
                <div className="flex items-center justify-between flex-wrap" style={{ gap: 12, marginBottom: 16 }}>
                  <div>
                    <strong className="text-sm">{g.receiver || 'Receiver'}</strong>
                    <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 2 }}>Donation · {g.title}</p>
                  </div>
                  <Tag status={g.status === 'received' ? 'approved' : 'pending'} label={g.status} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, paddingBottom: 16, borderBottom: '1px solid var(--sand-line)' }}>
                  <div><p style={rowLabel}>Your donation</p><p className="text-xs" style={{ marginTop: 6 }}>{g.currency} {Number(g.amount || 0).toLocaleString()} · {new Date(g.at).toLocaleDateString()}</p></div>
                  {r && <div><p style={rowLabel}>Request progress</p><p className="text-xs" style={{ marginTop: 6 }}>{pct}% funded ({r.currency} {Number(r.collected).toLocaleString()} of {r.currency} {Number(r.required).toLocaleString()})</p></div>}
                  {r && <div><p style={rowLabel}>Request status</p><p className="text-xs" style={{ marginTop: 6 }}>{r.status}</p></div>}
                </div>
                <button type="button" className="btn" style={{ marginTop: 12, padding: '6px 14px', fontSize: '0.75rem' }} onClick={() => { downloadTextFile(`donation-report-${i + 1}.txt`, donationReportText(g)); logDonorActivity('impact_report', `Generated donation report — ${g.title}`); }}>Download Report</button>
              </div>
            );
          })}
        </div>
      )}
      {live.length === 0 && given.length === 0 && (
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
      load(); return true;
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
            <SavedStatus value={r.applicationStatus} onSave={value=>changeStatus(r._id,value)} label="Application status" options={Object.entries(FUNDING_APP_STATUS).map(([value,meta])=>({value,label:meta.label}))}/>
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
  const [addFundsReference, setAddFundsReference] = useState('');
  const [addFundsProvider, setAddFundsProvider] = useState('');
  const [addFundsProof, setAddFundsProof] = useState(null);
  const [newCurrency, setNewCurrency] = useState('PKR');

  function load() {
    apiRequest('/scholarships/mine/deposits').then(setDeposits).catch((err) => onFlash(err.message));
    loadDonationsWithTransfers().then(setDonations).catch((err) => onFlash(err.message));
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
    if (!addFundsReference.trim()) return onFlash('Enter the payment reference.');
    if (addFundsMethod !== 'cash' && !addFundsProof) return onFlash('Upload payment proof.');
    try {
      const proofUrl = addFundsProof ? await uploadToPlatformStorage(addFundsProof, 'donor-deposit-proofs') : '';
      await apiRequest('/scholarships/donor/deposit', { method: 'POST', body: { amount: amt, currency: addFundsFor || newCurrency, paymentMethod: addFundsMethod, reference: addFundsReference.trim(), provider: addFundsProvider.trim(), proofUrl } });
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
              <button type="button" className="u-modal-close" onClick={() => setAddFundsFor(null)}><FaXmark aria-hidden="true" /></button>
            </div>
            <div className="u-modal-body">
              {addFundsFor === '' && (
                <input className="form-input mb-2" placeholder="Currency (e.g. USD, EUR, PKR)" value={newCurrency} onChange={(e) => setNewCurrency(e.target.value.toUpperCase())} />
              )}
              <input className="form-input mb-2" type="number" min="0" placeholder={`Amount (${addFundsFor || newCurrency})`} value={addFundsAmount} onChange={(e) => setAddFundsAmount(e.target.value)} />
              <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 8 }}>Send the amount to the CareerZ account shown next and upload the receipt. CareerZ checks it and then adds it to your wallet.</p>
            </div>
            <div className="u-modal-foot">
              {Number(addFundsAmount) > 0 && <ManualPayButton kind="wallet_topup" query={{ amount: Number(addFundsAmount), currency: addFundsFor || newCurrency }} onFlash={onFlash} onDone={() => { setAddFundsFor(null); load(); }} />}
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
      <p className="text-xs mb-3 flex items-center" style={{ color: 'var(--ink-soft)', gap: 4 }}>Everything you've saved (<FaStar aria-hidden="true" style={{ color: 'var(--gold)' }} />) from Recommended Funding Requests and Donation Opportunities.</p>
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
function loadDonationsWithTransfers() {
  return Promise.all([
    apiRequest('/funding-requests/mine/donations'),
    apiRequest('/manual-payments/mine').catch(() => [])
  ]).then(([donations, transfers]) => [
    ...transfers.filter((m) => RECEIVED_KINDS.includes(m.kind) && !m.donation && ['commission_submitted', 'commission_verified', 'submitted'].includes(m.status)).map((m) => ({
      _id: m._id, createdAt: m.createdAt, amount: m.price, currency: m.currency, status: 'pending', type: m.kind === 'sponsorship_payment' ? 'sponsorship' : 'donation',
      paymentMethod: 'bank_transfer', transactionId: m.number, fundingRequest: { _id: m.fundingRequest, title: transferTitle(m) }
    })),
    ...donations
  ]);
}

function usePendingDonationTransfers() {
  const [transfers, setTransfers] = useState([]);
  useEffect(() => { apiRequest('/manual-payments/mine').then((list) => setTransfers(list.filter((m) => RECEIVED_KINDS.includes(m.kind) && !m.donation && m.status !== 'approved'))).catch(() => {}); }, []);
  return transfers;
}

const transferTitle = (m) => String(m.title || '').replace(/^(Donation|Scholarship):\s*/, '');

function DonorRecentActivityPanel({ onFlash }) {
  const transfers = usePendingDonationTransfers();
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
    ...transfers.map((m) => ({ date: m.createdAt, label: `Donation by bank transfer: ${m.currency} ${Number(m.price || 0).toLocaleString()} (${TRANSFER_STATUS[m.status] || m.status})` })),
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
        items={[...transfers.map((m) => ({ date: m.createdAt, label: `${m.currency} ${Number(m.price || 0).toLocaleString()} to ${transferTitle(m)} (${TRANSFER_STATUS[m.status] || m.status})` })), ...donations.map((d) => ({ date: d.createdAt, label: `${d.currency} ${d.amount} to ${d.fundingRequest?.title || 'a funding request'}` }))].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8)}
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
                <a href={d} target="_blank" rel="noreferrer" className="text-xs" style={{ overflowWrap: 'anywhere' }}><FaFileLines aria-hidden="true" /> {d}</a>
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
  const transfers = usePendingDonationTransfers();
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
    ...transfers.map((m) => ({ type: m.kind === 'sponsorship_payment' ? 'Sponsorship Payment (bank transfer)' : 'Donation (bank transfer)', date: m.createdAt, amount: m.price, currency: m.currency, statusLabel: TRANSFER_STATUS[m.status] || m.status, tag: m.status === 'rejected' ? 'rejected' : 'pending', ref: m.number })),
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
    loadDonationsWithTransfers().then(setDonations).catch(() => setDonations([]));
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
