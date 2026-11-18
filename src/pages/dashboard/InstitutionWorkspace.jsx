// Institution workspace, moved out of Dashboard.jsx unchanged (master 17G.3: readable, maintainable code).
import { useEffect, useRef, useState } from 'react';
import { apiRequest, session } from '../../api/client';
import { showConfirm, showPrompt } from '../../utils/appDialog';
import { uploadToPlatformStorage } from '../../utils/platformUpload';
import OfflineStudy from '../../components/dashboard/OfflineStudy';
import FamilyCafeteria from '../../components/dashboard/FamilyCafeteria';
import { AcademyBatchesPanel } from '../../components/academy/Academy';
import { MyFundingRequests } from '../../components/donors/FundingRequests';
import { ClassPromotionPanel, TeacherReviewsPanel } from '../../components/institution/PeoplePanels';
import { InstitutionFamilyActions } from '../../components/dashboard/FamilyCenter';
import { FamilyPolicy } from '../../components/dashboard/FamilyPolicy';
import InstitutionInventory from '../../components/dashboard/InstitutionInventory';
import MedicalHealth from '../../components/dashboard/MedicalHealth';
import InstitutionCommunity from '../../components/dashboard/InstitutionCommunity';
import PlacementOffice from '../../components/dashboard/PlacementOffice';
import { WalletCard } from '../../components/dashboard/DashboardWidgets';
import { FaAward, FaCalendarCheck, FaCalendarDays, FaChalkboardUser, FaChartLine, FaCheck, FaClipboardCheck, FaClipboardList, FaFileLines, FaHeadset, FaMoneyBillWave, FaRobot, FaSackDollar, FaSchool, FaStar, FaUserGear, FaUserGraduate, FaUserShield, FaUsers, FaWallet } from 'react-icons/fa6';
import { PDF_COLORS, addPdfFooter, createBrandedPdf, drawPdfSummary, drawPdfTable } from '../../utils/brandedPdf';
import InstitutionSettingsPanel from '../../components/dashboard/InstitutionSettingsPanel';
import InvitePeople from '../../components/institution/InvitePeople';
import StudentGuardians from '../../components/dashboard/StudentGuardians';
import SavedForm from '../../components/shared/SavedForm';
import GuardianProof from '../../components/dashboard/GuardianProof';
import GradingPolicyEditor from '../../components/dashboard/GradingPolicyEditor';
import useUrlTab from '../../hooks/useUrlTab';
import CampusTourViewer from '../../components/CampusTourViewer';
import QrScanner from '../../components/QrScanner';
import InstitutionAssistantActions from '../../components/institution/InstitutionAssistantActions';
import { AiReport, OpsRecordTables } from '../../components/dashboard/OpsInsightsReport';
import { startPreferredCheckout } from '../../utils/jazzcashCheckout';
import { AdFreeCard } from '../../components/ads/Ads';
import { ManualPayButton } from '../../components/payments/ManualPay';
import { StaffPermissionsEditor } from '../../components/dashboard/NotificationSettings';
import { TEACHER_CATEGORIES } from '../../utils/teacherProfile';
import CampusReports from '../../components/institution/CampusReports';
import AcademicStructure from '../../components/institution/AcademicStructure';
import LearningCenter from '../../components/dashboard/LearningCenter';
import LessonMetadata from '../../components/dashboard/LessonMetadata';
import AutoTimetable from '../../components/institution/AutoTimetable';
import InstitutionAgentsPanel from '../../components/recruitment/InstitutionAgentsPanel';
import InstitutionProfileExtras from '../../components/institution/InstitutionProfileExtras';
import { AI_PURPOSES, AiSettingsPanel, ComingSoon, CustomSelect, DOW_LABEL, EmployerJobsPanel, EmployerPostJobPanel, InstitutionStudentSelect, LiveTransportMap, PersonPicker, ProfilePanel, ReceivedDonationsPanel, RolesPanel, SalaryPayoutProfilePanel, SummaryRow, SupportComplaintPanel, Table, Tag, TeacherReputationWidget, downloadFeePdf, fixText, formatTime12h, resizeImageToDataUrl, shortWhen, useMyInstitution } from '../Dashboard';

function SalaryPaymentButton({ payslip, onSubmit }) {
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState('');
  const [reference, setReference] = useState('');
  const [provider, setProvider] = useState('');
  const [proof, setProof] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [payout, setPayout] = useState(null);
  useEffect(() => {
    if (open && payslip.institution && payslip.staff?._id) apiRequest(`/institutions/${payslip.institution}/staff/${payslip.staff._id}/payout-profile`).then((profile) => { setPayout(profile); setMethod(profile.preferredMethod || ''); }).catch(() => setPayout({ configured: false }));
  }, [open, payslip.institution, payslip.staff?._id]);
  const manual = Boolean(method) && !['platform_wallet', 'stripe_transfer'].includes(method);
  async function submit(e) {
    e.preventDefault();
    if (method === 'platform_wallet') {
      const confirmed = await showConfirm(
        `Send ${payslip.currency} ${payslip.netAmount} to:\n\n${payslip.staff?.fullName || 'Unknown'}\n${payslip.staff?.email || ''}\n\nThis moves balance directly out of your institution wallet right now. Double-check the name/email above before confirming.`,
        { title: 'Confirm recipient', confirmLabel: 'Confirm & send' }
      );
      if (!confirmed) return;
    }
    setSubmitting(true);
    try {
      let proofUrl = '';
      if (proof) proofUrl = await uploadToPlatformStorage(proof, 'salary-payment-proofs');
      await onSubmit(payslip._id, { paymentMethod: method, reference: reference.trim(), provider: provider.trim(), proofUrl });
      setOpen(false);
    } finally { setSubmitting(false); }
  }
  if (!open) return <button type="button" className="btn btn-primary" onClick={() => setOpen(true)}>Pay Salary</button>;
  return <form onSubmit={submit} style={{ display: 'grid', gap: 6, minWidth: 250 }}>
    <CustomSelect value={method} onChange={setMethod} ariaLabel="Salary payment method" minWidth="100%" options={[
      { value: '', label: 'Select payout method' },
      { value: 'platform_wallet', label: 'CareerZ Internal Wallet' }, { value: 'stripe_transfer', label: 'Stripe Connect bank payout' },
      payout?.bank?.destination && { value: 'bank_transfer', label: `${payout.bank.bankName || 'Bank'} · ${payout.bank.destination}` },
      payout?.mobileWallet?.destination && { value: 'mobile_wallet', label: `${payout.mobileWallet.provider || 'Mobile wallet'} · ${payout.mobileWallet.destination}` },
      payout?.crypto?.destination && { value: 'crypto', label: `${payout.crypto.asset || 'Crypto'} ${payout.crypto.network || ''} · ${payout.crypto.destination}` },
      { value: 'cash', label: 'Cash (manual)' }
    ].filter(Boolean)} />
    {payout && !payout.configured && !['platform_wallet', 'cash'].includes(method) && <span className="text-xs" style={{ color: 'var(--gold)' }}>Employee has not saved a payout account. Ask them to complete My Profile → Salary Payout Details.</span>}
    {method === 'platform_wallet' && (
      <div className="text-xs" style={{ color: 'var(--ink-soft)', padding: 8, background: 'var(--sand)', borderRadius: 8 }}>
        <div>Moves balance directly from the institution's CareerZ wallet into the employee's CareerZ wallet — no gateway involved.</div>
        <div style={{ marginTop: 6 }}><strong>Recipient:</strong> {payslip.staff?.fullName || 'Unknown'} ({payslip.staff?.email || 'no email on file'})</div>
        <div style={{ marginTop: 4 }}>You'll be asked to confirm this exact recipient before anything is sent, and a unique receipt id is generated on both wallets' transaction history.</div>
      </div>
    )}
    {['bank_transfer', 'mobile_wallet', 'crypto'].includes(method) && <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>JazzCash and card payments collect money into the institution; they cannot send salary to an employee directly.</span>}
    {manual && <><input className="form-input" value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Transaction / cash receipt reference" required />
      <input className="form-input" value={provider} onChange={(e) => setProvider(e.target.value)} placeholder="Bank / wallet / payment details" />
      <label className="text-xs">Proof {method === 'cash' ? '(optional)' : '(required)'}<input className="form-input" type="file" accept="image/*,.pdf" required={method !== 'cash'} onChange={(e) => setProof(e.target.files?.[0] || null)} /></label></>}
    <div className="flex gap-2"><button className="btn btn-primary" disabled={submitting || !method}>{submitting ? 'Submitting...' : manual ? 'Submit to employee' : 'Pay now'}</button><button type="button" className="btn" onClick={() => setOpen(false)}>Cancel</button></div>
  </form>;
}

// Generic CSV export — `rows` is an array of flat objects; every report table below reuses this.
function downloadCsv(filename, rows) {
  if (!rows || rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const escape = (v) => { const s = v == null ? '' : String(v); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  const csv = [headers.join(','), ...rows.map((r) => headers.map((h) => escape(r[h])).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function InstitutionLiveClassesPanel({ onFlash }) {
  const [institutions, setInstitutions] = useState([]);
  const [institutionId, setInstitutionId] = useState('');
  const [sessions, setSessions] = useState(null);
  useEffect(() => { apiRequest('/institutions/mine/list').then((rows) => { setInstitutions(rows); setInstitutionId(rows[0]?._id || ''); }).catch((err) => onFlash(err.message)); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  function load(id = institutionId) {
    if (!id) return;
    apiRequest(`/live-classes/institution/${id}`)
      .then(setSessions)
      .catch((err) => { setSessions([]); onFlash(err.message); });
  }
  useEffect(() => { if (institutionId) load(institutionId); }, [institutionId]); // eslint-disable-line react-hooks/exhaustive-deps
  return <div className="institution-ui institution-live-ui">
    <h3 className="font-semibold mb-2">Live Class Monitoring</h3>
    <p className="text-xs mb-3" style={{ color: 'var(--ink-soft)' }}>Teachers schedule and run their own assigned classes. Institution management monitors the course, teacher, provider, timing and current status here.</p>
    {institutions.length > 1 && <select className="form-select mb-3" value={institutionId} onChange={(e) => setInstitutionId(e.target.value)}>{institutions.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</select>}
    <Table loading={sessions === null} headers={['Class', 'Course', 'Teacher', 'Schedule', 'Provider', 'Status']} rows={(sessions || []).map((session) => [session.title, session.course?.title, session.teacher?.fullName, new Date(session.scheduledStart).toLocaleString(), session.provider === 'careerz_jitsi' ? 'CareerZ Classroom' : 'External', <Tag status={session.status === 'live' ? 'approved' : session.status === 'ended' ? 'completed' : 'pending'} label={session.status} />])} empty="No live classes scheduled yet." />
  </div>;
}

export function InstitutionWorkspace({ tab, user, onFlash, onChanged, isWarden = false }) {
  if (tab === 'learningCenter') return <InstitutionClassesPanel onFlash={onFlash} />;
  if (tab === 'offlineStudy') return <OfflineStudy onFlash={onFlash} />;
  if (tab === 'profile') return <><ProfilePanel user={user} onFlash={onFlash} onChanged={onChanged} />{isWarden && <SalaryPayoutProfilePanel onFlash={onFlash} />}<RolesPanel onFlash={onFlash} onChanged={onChanged} /><SupportComplaintPanel onFlash={onFlash} /></>;
  if (tab === 'institution') return <InstitutionPanel onFlash={onFlash} onChanged={onChanged} />;
  if(tab==='cafeteria')return <FamilyCafeteria institution onFlash={onFlash}/>;
  if (tab === 'summary') return <InstitutionSummary />;
  if (tab === 'staff') return <InstitutionStaffPanel onFlash={onFlash} />;
  if (tab === 'invites') return <InstitutionInvitesTab onFlash={onFlash} />;
  if (tab === 'classes') return <InstitutionClassesPanel onFlash={onFlash} />;
  if (tab === 'batches') return <AcademyBatchesPanel onFlash={onFlash} />;
  if (tab === 'liveClasses') return <InstitutionLiveClassesPanel onFlash={onFlash} />;
  if (tab === 'fees') return <InstitutionFeesPanel onFlash={onFlash} />;
  if (tab === 'receivedDonations') return <><MyFundingRequests onFlash={onFlash} owner /><ReceivedDonationsPanel onFlash={onFlash} /></>;
  if (tab === 'communication') return <InstitutionBroadcastPanel onFlash={onFlash} />;
  if (tab === 'campusLife') return <InstitutionCampusLifePanel onFlash={onFlash} />;
  if (tab === 'certificates') return <InstitutionCertificatesPanel onFlash={onFlash} />;
  if (tab === 'teachers') return <><InstitutionTeachersPanel onFlash={onFlash} /><TeacherReviewsPanel onFlash={onFlash} /></>;
  if (tab === 'students') return <><InstitutionStudentsPanel onFlash={onFlash} /><ClassPromotionPanel onFlash={onFlash} /></>;
  if (tab === 'parents') return <><InstitutionParentsPanel onFlash={onFlash} /><InstitutionFamilyActions onFlash={onFlash} /><FamilyPolicy onFlash={onFlash}/></>;
  if (tab === 'attendance') return <InstitutionAttendancePanel onFlash={onFlash} />;
  if (tab === 'payroll') return <InstitutionPayrollPanel onFlash={onFlash} />;
  if (tab === 'reports') return <InstitutionReportsPanel onFlash={onFlash} />;
  if (tab === 'examination') return <InstitutionExaminationPanel onFlash={onFlash} />;
  if (tab === 'instSettings') return <InstitutionSettingsTab onFlash={onFlash} />;
  if (tab === 'campusTour') return <InstitutionCampusTourPanel onFlash={onFlash} />;
  if (tab === 'admissions') return <InstitutionAdmissionsPanel onFlash={onFlash} />;
  if (tab === 'library') return <InstitutionLibraryPanel onFlash={onFlash} />;
  if (tab === 'hostel') return <InstitutionHostelPanel onFlash={onFlash} />;
  if (tab === 'wardenDashboard') return <WardenDashboardPanel onFlash={onFlash} />;
  if (tab === 'transport') return <InstitutionTransportPanel onFlash={onFlash} />;
  if (tab === 'driverDashboard') return <DriverDashboardPanel onFlash={onFlash} />;
  if (tab === 'inventory') return <InstitutionInventory manage onFlash={onFlash} />;
  if (tab === 'health') return <MedicalHealth mode="institution" onFlash={onFlash} />;
  if (tab === 'events') return <InstitutionCommunity kind="events" manage onFlash={onFlash} />;
  if (tab === 'helpdesk') return <InstitutionCommunity kind="tickets" manage onFlash={onFlash} />;
  if (tab === 'aiAssistant') return <InstitutionAiAssistantPanel onFlash={onFlash} />;
  if (tab === 'subscription') return <InstitutionSubscriptionPanel onFlash={onFlash} />;
  if (tab === 'jobsHiring') return <InstitutionJobsPanel onFlash={onFlash} />;
  if (tab === 'placement') return <PlacementOffice onFlash={onFlash} />;
  if (tab === 'wallet') return <WalletCard onFlash={onFlash} />;
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
    <div className="institution-ui institution-operations-ui institution-exams-ui">
      <h3 className="font-semibold mb-2">Examination Management</h3>
      <p className="admin-notice">Institution-wide exam register. Teachers create papers only for their assigned course; subject, class/section and teacher are linked automatically. Configure missing class sections in Classes &amp; Timetable before publishing papers.</p>
      <SummaryRow items={[
        { label: 'Total Exams', value: (exams || []).length, icon: FaAward, detail: `${(exams || []).filter((exam) => exam.published).length} published` },
        { label: 'Scheduled', value: (exams || []).filter((exam) => exam.scheduledDate && new Date(exam.scheduledDate) > new Date()).length, icon: FaCalendarCheck, detail: 'Upcoming papers' },
        { label: 'Attempts', value: (exams || []).reduce((sum, exam) => sum + (exam.attemptedCount || 0), 0), icon: FaFileLines, detail: 'Student submissions' },
        { label: 'Graded', value: (exams || []).reduce((sum, exam) => sum + (exam.gradedCount || 0), 0), icon: FaChartLine, detail: 'Finalized attempts' }
      ]} />
      <Table
        headers={['Exam', 'Subject / Class', 'Session / Term', 'Teacher', 'Schedule', 'Paper', 'Attempts', 'Status']}
        rows={(exams || []).map((e) => [<span className="exam-cell"><strong>{fixText(e.title)}</strong><span className="exam-type">{e.type}</span></span>, <span className="exam-cell"><strong>{e.subject || e.course?.subject || 'Subject missing'}</strong><small>{e.classSection?.name || 'Class/section missing'}</small></span>, <span className="exam-cell"><span>{e.academicSession || e.classSection?.academicYear || 'Session missing'}</span><small>{e.term || 'Term missing'}</small></span>, <span className="exam-cell"><span>{e.teacher?.fullName || '—'}</span><small>{e.teacher?.email || ''}</small></span>, <span className="exam-cell">{e.scheduledDate ? <><span style={{ whiteSpace: 'nowrap' }}>{shortWhen(e.scheduledDate)}</span>{e.closesAt && <small style={{ whiteSpace: 'nowrap' }}>Closes {shortWhen(e.closesAt)}</small>}</> : <small>Not scheduled</small>}</span>, `${e.totalMarks} marks · ${e.durationMinutes || 0} min · Pass ${e.passingPercent}%`, `${e.gradedCount || 0}/${e.attemptedCount || 0} graded`, <Tag status={e.published ? 'approved' : 'pending'} label={e.published ? 'Published' : 'Draft'} />])}
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
    <div className="institution-ui institution-remaining-ui institution-reports-ui">
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
  const [staff, setStaff] = useState([]);
  const now = new Date();
  const [form, setForm] = useState({ staffId: '', month: now.getMonth() + 1, year: now.getFullYear(), basicSalary: '', bonuses: 0, overtimeAmount: 0, allowances: 0, commissionAmount: 0, deductions: 0, taxAmount: 0, currency: 'PKR' });

  function load() {
    if (institution) apiRequest(`/institutions/${institution._id}/payroll`).then(setPayslips).catch((err) => onFlash(err.message));
  }
  useEffect(() => {
    load();
    if (institution) Promise.all([
      apiRequest(`/institutions/${institution._id}/teachers`),
      apiRequest(`/institutions/${institution._id}/teacher-employments`)
    ]).then(([profiles, employments]) => {
      const activeByTeacher = new Map((employments || []).filter((employment) => employment.status === 'active').map((employment) => [String(employment.teacher?._id), employment]));
      const people = (profiles || []).filter((profile) => profile.user).map((profile) => ({
        ...profile,
        employment: activeByTeacher.get(String(profile.user._id)) || null
      }));
      // Payroll covers every active employee, including wardens/drivers/administrative staff
      // who correctly have no TeacherProfile.
      (employments || []).filter((employment) => employment.status === 'active' && employment.teacher).forEach((employment) => {
        if (!people.some((person) => String(person.user?._id) === String(employment.teacher._id))) {
          people.push({ user: employment.teacher, employment });
        }
      });
      setStaff(people);
    }).catch((err) => onFlash(err.message));
  }, [institution]);

  function selectTeacher(staffId) {
    const selected = staff.find((profile) => profile.user?._id === staffId);
    const employment = selected?.employment;
    const basicSalary = Number(employment?.monthlySalary || 0);
    const taxPercent = Number(employment?.taxPercent || 0);
    setForm((current) => ({
      ...current,
      staffId,
      basicSalary: employment ? basicSalary : '',
      currency: employment?.salaryCurrency || 'PKR',
      taxAmount: employment ? Math.round((basicSalary * taxPercent / 100) * 100) / 100 : 0,
      commissionAmount: 0
    }));
  }

  async function generate(e) {
    e.preventDefault();
    try {
      await apiRequest(`/institutions/${institution._id}/payroll`, {
        method: 'POST',
        body: {
          staff: form.staffId.trim(), month: Number(form.month), year: Number(form.year),
          basicSalary: Number(form.basicSalary), bonuses: Number(form.bonuses), overtimeAmount: Number(form.overtimeAmount), allowances: Number(form.allowances), commissionAmount: Number(form.commissionAmount), deductions: Number(form.deductions), taxAmount: Number(form.taxAmount), currency: form.currency
        }
      });
      onFlash('Payslip generated.', 'success');
      setForm({ ...form, staffId: '', basicSalary: '', bonuses: 0, overtimeAmount: 0, allowances: 0, commissionAmount: 0, deductions: 0, taxAmount: 0 });
      load();
    } catch (err) { onFlash(err.message); }
  }
  async function downloadPayslip(p) {
    const { jsPDF } = await import('jspdf');
    const pdf = await createBrandedPdf(jsPDF, { title: 'Official Salary Slip', subtitle: institution.name });
    let y = drawPdfSummary(pdf, [{ label: 'Employee', value: p.staff?.fullName || '—' }, { label: 'Pay period', value: `${p.month}/${p.year}` }, { label: 'Status', value: String(p.status).toUpperCase() }, { label: 'Net salary', value: `${p.currency} ${p.netAmount}` }]);
    y = drawPdfTable(pdf, { headers: ['Earnings', 'Amount'], rows: [['Basic salary', `${p.currency} ${p.basicSalary}`], ['Bonus', `${p.currency} ${p.bonuses || 0}`], ['Overtime', `${p.currency} ${p.overtimeAmount || 0}`], ['Allowances', `${p.currency} ${p.allowances || 0}`], ['Commission', `${p.currency} ${p.commissionAmount || 0}`]], startY: y + 3, widths: [120, 62] });
    drawPdfTable(pdf, { headers: ['Deductions / payment', 'Value'], rows: [['Deductions', `${p.currency} ${p.deductions || 0}`], ['Tax', `${p.currency} ${p.taxAmount || 0}`], ['Payment method', p.paymentMethod || 'Pending'], ['Receipt reference', p.transactionId || 'Pending']], startY: y + 7, widths: [82, 100] });
    addPdfFooter(pdf);
    pdf.save(`salary-slip-${p.staff?.fullName || 'staff'}-${p.month}-${p.year}.pdf`);
  }

  async function markPaid(id, payment) {
    try {
      const result = await apiRequest(`/institutions/payroll/${id}/pay`, { method: 'PATCH', body: payment });
      onFlash(result.status === 'processing' ? 'Payment proof sent to teacher for confirmation.' : 'Salary paid.', 'success');
      load();
    } catch (err) { onFlash(err.message); }
  }
  async function generateMonthly() {
    try {
      const result = await apiRequest(`/institutions/${institution._id}/payroll/generate-monthly`, { method: 'POST', body: { month: Number(form.month), year: Number(form.year) } });
      onFlash(`Monthly payroll generated: ${result.created}; skipped: ${result.skipped}.`, 'success');
      load();
    } catch (err) { onFlash(err.message); }
  }
  async function downloadTaxReport() {
    try {
      const report = await apiRequest(`/institutions/${institution._id}/payroll-tax-report?year=${Number(form.year)}`);
      const { jsPDF } = await import('jspdf'); const pdf = await createBrandedPdf(jsPDF, { title: `Payroll & Tax Report ${report.year}`, subtitle: institution.name, orientation: 'landscape' });
      const y = drawPdfSummary(pdf, [{ label: 'Gross payroll', value: report.totals.gross }, { label: 'Tax withheld', value: report.totals.tax }, { label: 'Other deductions', value: report.totals.deductions }, { label: 'Net payroll', value: report.totals.net }]);
      drawPdfTable(pdf, { headers: ['Period', 'Employee', 'Currency', 'Gross', 'Tax', 'Deductions', 'Net'], rows: report.rows.map((p) => [`${p.month}/${p.year}`, p.staff?.fullName || 'Staff', p.currency, p.basicSalary, p.taxAmount || 0, p.deductions || 0, p.netAmount]), startY: y + 3 });
      addPdfFooter(pdf); pdf.save(`payroll-tax-report-${report.year}.pdf`);
    } catch (err) { onFlash(err.message); }
  }
  const PAYSLIP_METHODS = [
    { value: 'platform_wallet', label: 'CareerZ Wallet (instant ledger transfer)' },
    { value: 'stripe_transfer', label: 'Real Bank Transfer (Stripe)' },
    { value: 'bank_transfer', label: 'Bank Transfer (manual)' },
    { value: 'mobile_wallet', label: 'Mobile Wallet' },
    { value: 'cash', label: 'Cash' },
    { value: 'other', label: 'Other' }
  ];

  if (institution === undefined) return <p role="status" className="admin-notice">Loading...</p>;
  if (!institution) return <p className="admin-notice">Register an institution first (My Institution tab).</p>;

  const selectedTeacher = staff.find((profile) => profile.user?._id === form.staffId);
  const selectedEmployment = selectedTeacher?.employment;

  return (
    <div className="institution-ui institution-payroll-ui">
      <h3 className="font-semibold mb-2">Payroll</h3>
      <form onSubmit={generate} className="payroll-form">
        <fieldset className="payroll-group"><legend>Staff and period</legend><div className="payroll-grid payroll-grid-who">
          <label className="institution-field"><span>Staff member</span><select className="form-select" required value={form.staffId} onChange={(e) => selectTeacher(e.target.value)}>
            <option value="">Select teacher…</option>
            {staff.map((profile) => <option key={profile.user._id} value={profile.user._id}>{profile.user.fullName} · {profile.user.email} · {profile.qualifications?.[0]?.title || 'Qualification not added'}</option>)}
          </select></label>
          <label className="institution-field"><span>Month</span><input className="form-input" type="number" min="1" max="12" value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })} /></label>
          <label className="institution-field"><span>Year</span><input className="form-input" type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} /></label>
          <label className="institution-field"><span>Currency</span><select className="form-select" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>{['PKR', 'USD', 'GBP', 'SAR', 'AED'].map((currency) => <option key={currency}>{currency}</option>)}</select></label>
        </div></fieldset>
        <fieldset className="payroll-group"><legend>Earnings</legend><div className="payroll-grid">
          <label className="institution-field"><span>Basic salary</span><input className="form-input" type="number" min="0" required placeholder="e.g. 45000" value={form.basicSalary} onChange={(e) => setForm({ ...form, basicSalary: e.target.value })} /></label>
          <label className="institution-field"><span>Bonuses</span><input className="form-input" type="number" min="0" value={form.bonuses} onChange={(e) => setForm({ ...form, bonuses: e.target.value })} /></label>
          <label className="institution-field"><span>Overtime</span><input className="form-input" type="number" min="0" value={form.overtimeAmount} onChange={(e) => setForm({ ...form, overtimeAmount: e.target.value })} /></label>
          <label className="institution-field"><span>Allowances</span><input className="form-input" type="number" min="0" value={form.allowances} onChange={(e) => setForm({ ...form, allowances: e.target.value })} /></label>
          <label className="institution-field"><span>Commission</span><input className="form-input" type="number" min="0" value={form.commissionAmount} onChange={(e) => setForm({ ...form, commissionAmount: e.target.value })} /></label>
        </div></fieldset>
        <fieldset className="payroll-group"><legend>Deductions</legend><div className="payroll-grid">
          <label className="institution-field"><span>Deductions</span><input className="form-input" type="number" min="0" value={form.deductions} onChange={(e) => setForm({ ...form, deductions: e.target.value })} /></label>
          <label className="institution-field"><span>Tax</span><input className="form-input" type="number" min="0" value={form.taxAmount} onChange={(e) => setForm({ ...form, taxAmount: e.target.value })} /></label>
        </div></fieldset>
        <div className="payroll-actions">
          <button type="submit" className="btn btn-primary">Generate Payslip</button>
          <button type="button" className="btn" onClick={generateMonthly}>Generate Monthly Payroll</button>
          <button type="button" className="btn" onClick={downloadTaxReport}>Download Tax Report</button>
        </div>
      </form>
      {selectedTeacher && (
        <div className="card" style={{ padding: 14, marginBottom: 16 }}>
          <strong>{selectedTeacher.user.fullName}</strong>
          <span className="text-xs" style={{ color: 'var(--ink-soft)', marginLeft: 8 }}>{selectedTeacher.user.email}</span>
          <div className="text-xs" style={{ marginTop: 6 }}>
            <strong>Qualification:</strong> {selectedTeacher.qualifications?.[0]?.title || 'Not added'}
            {selectedTeacher.qualifications?.[0]?.institutionName ? ` — ${selectedTeacher.qualifications[0].institutionName}` : ''}
            {' · '}<strong>Subjects:</strong> {(selectedTeacher.subjects || []).join(', ') || 'Not added'}
            {' · '}<strong>Experience:</strong> {selectedTeacher.experienceYears || 0} years
          </div>
          <div className="text-xs" style={{ marginTop: 4 }}>
            <strong>Employment:</strong> {selectedEmployment ? `${selectedEmployment.designation || selectedEmployment.role} · ${selectedEmployment.department || 'Department not assigned'}` : 'No active salary contract'}
            {selectedEmployment ? ` · Contract salary ${selectedEmployment.salaryCurrency || 'PKR'} ${Number(selectedEmployment.monthlySalary || 0).toLocaleString()} · Tax ${selectedEmployment.taxPercent || 0}%` : ''}
          </div>
        </div>
      )}
      <Table
        loading={payslips === null}
        headers={['Staff', 'Period', 'Salary breakdown', 'Net Amount', 'Status', 'Action']}
        rows={(payslips || []).map((p) => [
          <strong>{p.staff?.fullName}</strong>, <span style={{ whiteSpace: 'nowrap' }}>{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][p.month - 1] || p.month} {p.year}</span>,
          <span className="payslip-parts">{[['Basic', p.basicSalary, '+'], ['Bonus', p.bonuses, '+'], ['Overtime', p.overtimeAmount, '+'], ['Allowance', p.allowances, '+'], ['Commission', p.commissionAmount, '+'], ['Deduction', p.deductions, '−'], ['Tax', p.taxAmount, '−']].filter(([, v], i) => i === 0 || Number(v) > 0).map(([label, v, sign]) => <span key={label} className={sign === '−' ? 'minus' : ''}>{sign === '−' ? '− ' : ''}{label} {Number(v || 0).toLocaleString()}</span>)}</span>,
          <strong style={{ whiteSpace: 'nowrap' }}>{p.currency} {Number(p.netAmount || 0).toLocaleString()}</strong>,
          <Tag status={p.status === 'paid' ? 'approved' : 'pending'} />,
          <div className="payslip-actions">{p.status === 'pending' || p.status === 'rejected' ? <SalaryPaymentButton payslip={p} onSubmit={markPaid} /> : p.status === 'processing' ? <span className="text-xs" style={{ color: 'var(--gold)' }}>Awaiting teacher confirmation</span> : (p.transactionId ? <span className="payslip-receipt" title={p.transactionId}>Receipt {p.transactionId}</span> : null)}<button type="button" className="btn" onClick={() => downloadPayslip(p)}>PDF</button></div>
        ])}
        empty="No payslips generated yet."
      />
    </div>
  );
}

function InstitutionSettingsTab({ onFlash }) {
  const institution = useMyInstitution(onFlash);
  if (institution === undefined) return <p role="status" className="admin-notice">Loading...</p>;
  return <InstitutionSettingsPanel institution={institution} onFlash={onFlash} />;
}

// Invite teachers, staff and students by email.
function InstitutionInvitesTab({ onFlash }) {
  const institution = useMyInstitution(onFlash);
  if (institution === undefined) return <p role="status" className="admin-notice">Loading...</p>;
  if (!institution) return <p className="admin-notice">Register an institution first (My Institution tab).</p>;
  if (institution.verificationStatus !== 'approved') return <p className="admin-notice">Invitations open once CareerZ verifies your institute.</p>;
  return <div className="institution-ui"><InvitePeople institution={institution} onFlash={onFlash} /></div>;
}

function InstitutionTeachersPanel({ onFlash }) {
  const institution = useMyInstitution(onFlash);
  const [teachers, setTeachers] = useState(null);
  const [ratingFor, setRatingFor] = useState(null);

  useEffect(() => {
    if (institution) apiRequest(`/institutions/${institution._id}/teachers`).then(setTeachers).catch((err) => onFlash(err.message));
  }, [institution, onFlash]);

  if (institution === undefined || (institution && teachers === null)) return <p role="status" className="admin-notice">Loading...</p>;
  if (!institution) return <p className="admin-notice">Register an institution first (My Institution tab).</p>;

  return (
    <div className="institution-ui institution-directory-ui">
      <h3 className="font-semibold mb-2">Teacher Management</h3>
      <Table
        headers={['Name', 'Email', 'Subjects', 'Experience', 'Status', 'Action']}
        rows={(teachers || []).map((t) => [
          t.user?.fullName, t.user?.email, (t.subjects || []).join(', ') || '—', `${t.experienceYears || 0} yrs`,
          <Tag status={t.status === 'active' ? 'approved' : 'rejected'} />,
          t.user?._id && <button type="button" className="btn" style={{ padding: '4px 12px', fontSize: '0.78rem' }} onClick={() => setRatingFor(ratingFor === t.user._id ? null : t.user._id)}>{ratingFor === t.user._id ? 'Close' : 'Rate'}</button>
        ])}
        empty="No teachers linked to this institution yet."
      />
      {ratingFor && <TeacherReputationWidget teacherId={ratingFor} onFlash={onFlash} />}
    </div>
  );
}

const MEMBERSHIP_ACTION = { join: 'Wants to join', withdraw: 'Wants to leave', transfer: 'Wants to transfer' };

function InstitutionStudentsPanel({ onFlash }) {
  const institution = useMyInstitution(onFlash);
  const [students, setStudents] = useState(null);
  const [sections, setSections] = useState([]);
  const [membershipRequests, setMembershipRequests] = useState([]);
  const [edits, setEdits] = useState({});

  function load() {
    if (institution) {
      apiRequest(`/institutions/${institution._id}/students`).then(setStudents).catch((err) => onFlash(err.message));
      apiRequest(`/institutions/${institution._id}/class-sections`).then(setSections).catch(() => {});
      apiRequest(`/institutions/${institution._id}/membership-requests`).then(setMembershipRequests).catch(() => setMembershipRequests([]));
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
      await apiRequest(`/institutions/students/${profileId}/status`, { method: 'PATCH', body: { status: e.status ?? undefined, classSection: e.classSection ?? undefined, rollNumber: e.rollNumber ?? undefined } });
      onFlash('Class / roll number updated.', 'success');
      load(); return true;
    } catch (err) { onFlash(err.message); }
  }

  async function reviewMembership(id, decision) {
    try { await apiRequest(`/institutions/${institution._id}/membership-requests/${id}`, { method: 'PATCH', body: { decision } }); onFlash(`Request ${decision}d.`, 'success'); load(); }
    catch (err) { onFlash(err.message); }
  }

  if (institution === undefined || (institution && students === null)) return <p role="status" className="admin-notice">Loading...</p>;
  if (!institution) return <p className="admin-notice">Register an institution first (My Institution tab).</p>;

  return (
    <div className="institution-ui institution-directory-ui">
      <h3 className="font-semibold mb-2">Student Management</h3>
      {membershipRequests.length > 0 && <div className="card" style={{ padding: 16, marginBottom: 18 }}><h4 className="font-semibold mb-2">Membership Requests</h4>{membershipRequests.map((request) => <div key={request._id} className="flex items-center justify-between flex-wrap" style={{ gap: 10, padding: '9px 0', borderBottom: '1px solid var(--sand-line)' }}><span className="membership-request-text"><strong>{request.student?.fullName}</strong><span className={`membership-chip ${request.requestedAction || ''}`}>{MEMBERSHIP_ACTION[request.requestedAction] || request.requestedAction || request.status}</span>{request.targetInstitution?.name && <span className="membership-meta">→ {request.targetInstitution.name}</span>}{request.reason && <span className="membership-meta">{request.reason}</span>}</span><span className="membership-actions"><button type="button" className="btn btn-primary" onClick={() => reviewMembership(request._id, 'approve')}>Approve</button><button type="button" className="btn" onClick={() => reviewMembership(request._id, 'reject')}>Reject</button></span></div>)}</div>}
      <Table
        headers={['Name', 'Email', 'Student ID', 'Roll No.', 'Class', 'Status', 'Action']}
        rows={(students || []).map((s) => {
          const edit = edits[s._id] || { status: s.status, classSection: s.classSection?._id || '', rollNumber: s.rollNumber || '' };
          return [
            <div>{s.user?.fullName}<StudentGuardians studentId={s.user?._id}/>{s.parentEmail&&<p className="text-xs">Student-provided guardian: {s.parentName||s.parentRelationship} · {s.parentEmail}</p>}</div>, s.user?.email, s.studentId || '—', s.rollNumber || '—', s.classSection?.name || '—',
            <Tag status={s.status === 'active' ? 'approved' : s.status === 'suspended' ? 'rejected' : 'pending'} />,
            <SavedForm key={s._id} showValues={false} value={edit} onRestore={value=>setEdits(prev=>({...prev,[s._id]:value}))} onSubmit={()=>assignClass(s._id)} className="flex gap-2 items-center flex-wrap">
              <select className="form-input" value={edit.status} onChange={(e) => setEdits(prev=>({...prev,[s._id]:{...edit,status:e.target.value}}))} style={{ padding: '4px 8px', fontSize: '0.78rem' }}>
                {['active', 'suspended', 'graduated', 'transferred'].map((st) => <option key={st} value={st}>{st}</option>)}
              </select>
              <select className="form-input" value={edit.classSection} onChange={(e) => setEdits({ ...edits, [s._id]: { ...edit, classSection: e.target.value } })} style={{ padding: '4px 8px', fontSize: '0.78rem' }}>
                <option value="">No class</option>
                {sections.map((sec) => <option key={sec._id} value={sec._id}>{sec.name}</option>)}
              </select>
              <input className="form-input" placeholder="Roll No." value={edit.rollNumber} onChange={(e) => setEdits({ ...edits, [s._id]: { ...edit, rollNumber: e.target.value } })} style={{ padding: '4px 8px', fontSize: '0.78rem', width: 90 }} />
              <button type="submit" className="btn" style={{ padding: '4px 10px', fontSize: '0.72rem' }}>Save</button>
            </SavedForm>
          ];
        })}
        empty="No students linked to this institution yet."
      />
    </div>
  );
}

// Institution's Parent Management (spec: Institution<->Parent "parent directory relationship",
// "guardian verification", "parent messaging panel", "parent satisfaction/feedback"). The
// directory is real — every row comes from an approved ParentChildLink to one of this
// institution's actual students, never invented.
const REP_LABEL_TAG = { 'Highly engaged': 'approved', 'Engaged': 'pending', 'Needs contact': 'rejected' };

// Private, read-only reputation view (spec 11.15) — never shown to anyone but the institution
// and the parent themselves; the caller here is always institution staff/owner.
function ParentReputationInline({ institutionId, parentId }) {
  const [rep, setRep] = useState(null);
  useEffect(() => { apiRequest(`/parent-reputation/${institutionId}/${parentId}`).then(setRep).catch(() => {}); }, [institutionId, parentId]);
  if (!rep) return null;
  return (
    <div style={{ marginTop: 8, padding: 10, background: 'var(--sand)', borderRadius: 10 }}>
      <div className="flex items-center gap-2">
        <strong className="text-xs">Engagement:</strong>
        {rep.overall !== null ? <Tag status={REP_LABEL_TAG[rep.label] || 'pending'} label={`${rep.label} (${rep.overall})`} /> : <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>{rep.label}</span>}
      </div>
      <div className="flex flex-wrap gap-3 mt-1">
        {rep.components.filter((c) => c.score !== null).map((c) => (
          <span key={c.key} className="text-xs" style={{ color: 'var(--ink-soft)' }}>{c.key}: {Math.round(c.score)}%</span>
        ))}
      </div>
    </div>
  );
}

function InstitutionParentsPanel({ onFlash }) {
  const institution = useMyInstitution(onFlash);
  const [parents, setParents] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [messageDrafts, setMessageDrafts] = useState({});
  const [repFor, setRepFor] = useState(null);
  const [disputes, setDisputes] = useState(null);

  function load(id) {
    apiRequest(`/institutions/${id}/parents`).then(setParents).catch((err) => onFlash(err.message));
    apiRequest(`/institutions/${id}/feedback`).then(setFeedback).catch(() => {});
    apiRequest(`/parent-reputation/disputes/${id}`).then(setDisputes).catch(() => {});
  }
  useEffect(() => {
    if (!institution) return undefined;
    load(institution._id);
    const timer = setInterval(() => load(institution._id), 10000);
    return () => clearInterval(timer);
  }, [institution]);

  async function resolveDispute(id, decision) {
    try { await apiRequest(`/parent-reputation/disputes/${id}/resolve`, { method: 'PATCH', body: { decision } }); onFlash(`Dispute ${decision}.`, 'success'); load(institution._id); }
    catch (err) { onFlash(err.message); }
  }

  async function toggleVerify(linkId, verified) {
    try {
      await apiRequest(`/institutions/${institution._id}/parents/${linkId}/verify`, { method: 'PATCH', body: { verified } });
      onFlash(verified ? 'Guardian link verified.' : 'Verification removed.', 'success');
      load(institution._id);
    } catch (err) { onFlash(err.message); }
  }

  async function sendMessage(parentId) {
    const text = (messageDrafts[parentId] || '').trim();
    if (!text) return onFlash('Write a message first.');
    try {
      await apiRequest('/messages', { method: 'POST', body: { to: parentId, text } });
      onFlash('Message sent.', 'success');
      setMessageDrafts((prev) => ({ ...prev, [parentId]: '' }));
    } catch (err) { onFlash(err.message); }
  }

  if (institution === undefined || (institution && parents === null)) return <p role="status" className="admin-notice">Loading...</p>;
  if (!institution) return <p className="admin-notice">Register an institution first (My Institution tab).</p>;

  return (
    <div className="institution-ui institution-parents-ui">
      <h3 className="font-semibold mb-2">Parent Management</h3>
      {feedback && (
        <div className="card" style={{ padding: 14, marginBottom: 16 }}>
          <strong className="text-sm">Parent Satisfaction</strong>
          <p className="text-xs flex items-center" style={{ color: 'var(--ink-soft)', margin: '4px 0', gap: 4 }}>
            {feedback.count > 0 ? <>Average: <FaStar aria-hidden="true" style={{ color: 'var(--gold)' }} /> {feedback.average} ({feedback.count} rating{feedback.count === 1 ? '' : 's'})</> : 'No parent ratings yet.'}
          </p>
        </div>
      )}
      {(parents || []).length === 0 && <p className="admin-notice">No parents linked to your students yet.</p>}
      <div className="space-y-3">
        {(parents || []).map((p) => (
          <div key={p.parent._id} className="card" style={{ padding: 16 }}>
            <div className="flex items-center justify-between flex-wrap" style={{ gap: 8 }}>
              <div>
                <strong className="text-sm">{p.parent.fullName}</strong>
                <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>{p.parent.email}{p.parent.phone ? ` · ${p.parent.phone}` : ''}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2" style={{ marginTop: 8 }}>
              {p.children.map((c) => (
                <span key={c.linkId} className="parent-child-row">
                  <span className="parent-child-name"><strong>{c.name}</strong> <span>{c.relationship}</span></span><GuardianProof review linkId={c.linkId} institutionId={institution._id} onFlash={onFlash} onDone={()=>load(institution._id)}/>
                  <button type="button" className={`btn parent-verify${c.institutionVerified ? ' on' : ''}`} onClick={() => toggleVerify(c.linkId, !c.institutionVerified)}>
                    {c.institutionVerified ? <span className="flex items-center" style={{ gap: 5, justifyContent: 'center' }}><FaCheck aria-hidden="true" /> Verified</span> : 'Verify'}
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2 items-end flex-wrap" style={{ marginTop: 10 }}>
              <input className="form-input" placeholder="Send a message..." value={messageDrafts[p.parent._id] || ''} onChange={(e) => setMessageDrafts((prev) => ({ ...prev, [p.parent._id]: e.target.value }))} style={{ minWidth: 220, flex: 1 }} />
              <button type="button" className="btn" style={{ padding: '5px 12px', fontSize: '0.78rem' }} onClick={() => sendMessage(p.parent._id)}>Send</button>
              <button type="button" className="btn" style={{ padding: '5px 12px', fontSize: '0.78rem' }} onClick={() => setRepFor(repFor === p.parent._id ? null : p.parent._id)}>{repFor === p.parent._id ? 'Hide' : 'Engagement'}</button>
            </div>
            {repFor === p.parent._id && <ParentReputationInline institutionId={institution._id} parentId={p.parent._id} />}
          </div>
        ))}
      </div>

      {disputes && disputes.length > 0 && (
        <div className="admin-section" style={{ marginTop: 16 }}>
          <div className="admin-section-heading"><div><h2>Reputation Disputes</h2></div></div>
          {disputes.filter((d) => d.status === 'pending').map((d) => (
            <div key={d._id} className="flex items-center justify-between flex-wrap" style={{ gap: 8, padding: '10px 0', borderBottom: '1px solid var(--sand-line)' }}>
              <div>
                <strong className="text-sm">{d.parent?.fullName}</strong> — <span className="text-xs" style={{ textTransform: 'capitalize' }}>{d.category}</span>
                <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>{d.reason}</p>
              </div>
              <div className="flex gap-2">
                <button type="button" className="btn btn-primary" style={{ padding: '5px 12px', fontSize: '0.78rem' }} onClick={() => resolveDispute(d._id, 'upheld')}>Uphold</button>
                <button type="button" className="btn" style={{ padding: '5px 12px', fontSize: '0.78rem' }} onClick={() => resolveDispute(d._id, 'rejected')}>Reject</button>
              </div>
            </div>
          ))}
          {disputes.filter((d) => d.status === 'pending').length === 0 && <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>No pending disputes.</p>}
        </div>
      )}

      <PtmEscalationsPanel institutionId={institution._id} onFlash={onFlash} />
    </div>
  );
}

// Spec: "Automatic escalation — parent baar baar PTM miss kare to institution ko automatically
// flag ho" — this is the institution's review queue for those real, reactively-created flags.
function PtmEscalationsPanel({ institutionId, onFlash }) {
  const [escalations, setEscalations] = useState(null);
  function load() { apiRequest(`/ptm/escalations/${institutionId}`).then(setEscalations).catch(() => setEscalations([])); }
  useEffect(load, [institutionId]);

  async function acknowledge(id) {
    try { await apiRequest(`/ptm/escalations/${id}/acknowledge`, { method: 'PATCH' }); onFlash('Acknowledged.', 'success'); load(); } catch (err) { onFlash(err.message); }
  }

  const open = (escalations || []).filter((e) => e.status === 'open');
  if (open.length === 0) return null;

  return (
    <div className="admin-section" style={{ marginTop: 16 }}>
      <div className="admin-section-heading"><div><h2>PTM Engagement Flags</h2><p>A parent has repeatedly missed or cancelled Parent-Teacher Meetings.</p></div></div>
      {open.map((e) => (
        <div key={e._id} className="flex items-center justify-between flex-wrap" style={{ gap: 8, padding: '10px 0', borderBottom: '1px solid var(--sand-line)' }}>
          <div>
            <strong className="text-sm">{e.parent?.fullName}</strong>
            <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>{e.reason}</p>
          </div>
          <button type="button" className="btn" style={{ padding: '5px 12px', fontSize: '0.78rem' }} onClick={() => acknowledge(e._id)}>Acknowledge</button>
        </div>
      ))}
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
    <div className="institution-ui institution-attendance-ui">
      <section className="institution-record-card"><h3 className="font-semibold mb-2">Student Attendance</h3>
      <div className="institution-attendance-stats">
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

      </section><section className="institution-record-card"><h3 className="font-semibold mb-2" style={{ marginTop: 32 }}>Staff Attendance</h3>
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
      </section>
    </div>
  );
}

function InstitutionCertificatesPanel({ onFlash }) {
  const [institution, setInstitution] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [eligible, setEligible] = useState([]);
  const [advanced, setAdvanced] = useState({ programs: [], achievements: [] });
  const [students, setStudents] = useState([]);
  const [selection, setSelection] = useState('');
  const [advancedSelection, setAdvancedSelection] = useState('');

  function load() {
    apiRequest('/institutions/mine/list').then((list) => {
      const inst = list[0] || null;
      setInstitution(inst);
      if (inst) {
        apiRequest(`/institutions/${inst._id}/certificates`).then(setCertificates).catch((err) => onFlash(err.message));
        apiRequest(`/institutions/${inst._id}/certificates/eligible`).then(setEligible).catch((err) => onFlash(err.message));
        apiRequest(`/institutions/${inst._id}/certificates/advanced-eligible`).then(setAdvanced).catch((err) => onFlash(err.message));
        apiRequest(`/institutions/${inst._id}/students`).then(setStudents).catch((err) => onFlash(err.message));
      }
    }).catch((err) => onFlash(err.message));
  }

  async function issueAdvanced(e) {
    e.preventDefault();
    const candidates = [...advanced.programs, ...advanced.achievements];
    const row = candidates.find((item) => `${item.type}:${item.student?._id}:${item.program?._id || item.achievement?._id}` === advancedSelection);
    if (!row) return onFlash('Select an eligible credential first.');
    try {
      await apiRequest(`/institutions/${institution._id}/certificates`, { method: 'POST', body: { type: row.type, student: row.student._id, program: row.program?._id, achievement: row.achievement?._id } });
      onFlash(`${row.type} credential issued.`, 'success'); setAdvancedSelection(''); load();
    } catch (err) { onFlash(err.message); }
  }

  async function generateTranscript(studentId) {
    try { await apiRequest(`/institutions/${institution._id}/transcripts`, { method: 'POST', body: { student: studentId } }); onFlash('Official transcript generated from graded results.', 'success'); }
    catch (err) { onFlash(err.message); }
  }
  useEffect(load, []);

  async function issue(e) {
    e.preventDefault();
    try {
      const row = eligible.find((item) => `${item.student?._id}:${item.course?._id}` === selection);
      if (!row) return onFlash('Select an eligible completed course first.');
      await apiRequest(`/institutions/${institution._id}/certificates`, { method: 'POST', body: { student: row.student._id, course: row.course._id } });
      onFlash('Certificate issued.', 'success');
      setSelection('');
      load();
    } catch (err) { onFlash(err.message); }
  }

  async function revoke(certificate) {
    const reason = await showPrompt('Enter the reason. The public QR verification will immediately show this credential as revoked.', { title: 'Revoke credential', required: true, danger: true, confirmLabel: 'Revoke' });
    if (!reason) return;
    try { await apiRequest(`/institutions/${institution._id}/certificates/${certificate._id}/revoke`, { method: 'PATCH', body: { reason } }); onFlash('Credential revoked.', 'success'); load(); } catch (err) { onFlash(err.message); }
  }

  if (!institution) return <p className="admin-notice">Register an institution first (My Institution tab).</p>;

  return (
    <div className="institution-ui institution-operations-ui institution-credentials-ui">
      <GradingPolicyEditor institutionId={institution._id} onFlash={onFlash} />
      <div className="admin-notice" style={{ marginBottom: 16 }}><strong>Certificates follow academic completion</strong><p className="text-xs mt-1">A verified course certificate is generated only after course completion, a passed and teacher-graded exam, cleared due fees and institution verification. Manual User IDs and arbitrary titles are not accepted.</p></div>
      <form onSubmit={issue} className="institution-form-grid institution-operations-form">
        <label className="text-xs" style={{ fontWeight: 700 }}>Eligible completion
          <select className="form-select" value={selection} onChange={(e) => setSelection(e.target.value)} style={{ minWidth: 360, marginTop: 5 }} required>
            <option value="">Select eligible student and course</option>
            {eligible.filter((item) => item.eligible && !item.certificate).map((item) => <option key={`${item.student._id}:${item.course._id}`} value={`${item.student._id}:${item.course._id}`}>{item.student.fullName} — {item.course.title} — {item.percentage}% — {item.grade}</option>)}
          </select>
        </label>
        <button type="submit" className="btn btn-primary" disabled={!selection}>Issue Verified Certificate</button>
      </form>
      {eligible.length === 0 && <p className="admin-notice">No completed certificate-enabled course is waiting for issuance.</p>}
      <h3 className="font-semibold mt-6 mb-2">Diploma, Training, Degree & Achievement</h3>
      <p className="admin-notice">Only students whose complete program courses and fees are cleared appear as eligible. Degree additionally requires graduated status; achievements must already be institution-verified.</p>
      <form onSubmit={issueAdvanced} className="institution-form-grid institution-operations-form">
        <select className="form-select" value={advancedSelection} onChange={(e) => setAdvancedSelection(e.target.value)} style={{ minWidth: 440 }} required><option value="">Select verified credential candidate</option>{[...advanced.programs, ...advanced.achievements].filter((item) => item.eligible).map((item) => { const id = item.program?._id || item.achievement?._id; return <option key={`${item.type}:${item.student._id}:${id}`} value={`${item.type}:${item.student._id}:${id}`}>{item.student.fullName} — {item.type.toUpperCase()} — {item.program?.name || item.achievement?.title}</option>; })}</select>
        <button type="submit" className="btn btn-primary">Issue Credential</button>
      </form>
      <h3 className="font-semibold mt-6 mb-2">Academic Transcripts</h3>
      <p className="admin-notice">Transcript is calculated from real graded results. Subject marks are combined by course and term; credits, semester GPA and cumulative CGPA are calculated automatically.</p>
      <div className="flex gap-2 flex-wrap mb-4">{students.map((profile) => <button key={profile.user?._id} type="button" className="btn" onClick={() => generateTranscript(profile.user?._id)}>Generate {profile.user?.fullName}'s Transcript</button>)}</div>
      <Table
        headers={['Student', 'Type / Course', 'Title', 'Grade / Percentage', 'Status', 'Issued', 'Action']}
        rows={certificates.map((c) => { const [kind, rest] = fixText(c.title).split(/\s+[—–-]\s+/); return [<strong>{c.student?.fullName}</strong>, <span className="exam-cell"><span>{c.course?.title || '—'}</span><span className="exam-type">{c.type || 'certificate'}</span></span>, <span className="exam-cell">{rest ? <><small>{kind}</small><span>{rest}</span></> : <span>{kind}</span>}</span>, c.type === 'course' ? <span className="cert-grade"><strong>{c.finalGrade || '—'}</strong><span>{c.percentage ?? '—'}%</span></span> : <small>Verified completion</small>, <span><Tag status={c.status === 'active' ? 'approved' : 'rejected'} label={c.status} />{c.revokeReason ? <small style={{ display: 'block' }}>{c.revokeReason}</small> : null}</span>, <span style={{ whiteSpace: 'nowrap' }}>{new Date(c.issueDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>, c.status === 'active' ? <button type="button" className="btn staff-remove" onClick={() => revoke(c)}>Revoke</button> : '—']; })}
        empty="No certificates issued yet."
      />
    </div>
  );
}

function InstitutionFeesPanel({ onFlash }) {
  const [institution, setInstitution] = useState(null);
  const [fees, setFees] = useState([]);
  const [section, setSection] = useUrlTab('institutionFeesPanel', 'overview');
  const [filters, setFilters] = useState({ student: '', status: '', feeType: '', academicYear: '', term: '', from: '', to: '' });
  const [allFees, setAllFees] = useState([]);

  function load() {
    apiRequest('/institutions/mine/list').then((list) => {
      const inst = list[0] || null;
      setInstitution(inst);
      if (inst) apiRequest(`/institutions/${inst._id}/fees`).then((rows) => { setFees(rows); setAllFees(rows); }).catch((err) => onFlash(err.message));
    }).catch((err) => onFlash(err.message));
  }
  useEffect(load, []);

  // Student options for the filter dropdown, derived from real fee records already loaded —
  // shows real names/emails, never asks staff to paste a User ID.
  const studentOptions = [...new Map(allFees.filter((f) => f.student).map((f) => [f.student._id, f.student])).values()];

  async function applyFilters() {
    if (!institution) return;
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    try { setFees(await apiRequest(`/institution-fees/${institution._id}/invoices?${params.toString()}`)); }
    catch (err) { onFlash(err.message); }
  }
  function clearFilters() {
    setFilters({ student: '', status: '', feeType: '', academicYear: '', term: '', from: '', to: '' });
    setFees(allFees);
  }

  const [payVia, setPayVia] = useState({});

  async function markPaid(feeId) {
    const method = payVia[feeId] || 'Cash';
    const reference = await showPrompt('Enter the institution cash receipt/reference number:', { title: 'Record received payment', required: true });
    if (!reference) return;
    const confirmed = await showConfirm(`Confirm that the institution has actually received this payment via ${method}?`, { confirmLabel: 'Confirm received' });
    if (!confirmed) return;
    try {
      await apiRequest(`/institutions/fees/${feeId}/pay`, { method: 'PATCH', body: { paidVia: method, reference: reference.trim() } });
      onFlash('Received payment recorded and fee marked paid.', 'success');
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

  async function grantDiscount(feeId) {
    const kind = await showPrompt('Type: percentage, fixed, sibling, merit_scholarship, need_based_scholarship, staff_child, custom', { title: 'Discount / Concession Type', required: true, defaultValue: 'custom' });
    if (!kind) return;
    const validKinds = ['percentage', 'fixed', 'sibling', 'merit_scholarship', 'need_based_scholarship', 'staff_child', 'custom'];
    if (!validKinds.includes(kind.trim())) return onFlash('Choose a valid discount type.');
    const percentStr = await showPrompt('Discount percentage (leave blank for fixed amount):', { title: 'Discount Value', placeholder: 'e.g. 20' });
    if (percentStr === null) return;
    let body;
    if (percentStr.trim()) {
      body = { kind: kind.trim(), percent: Number(percentStr) };
    } else {
      const amountStr = await showPrompt('Fixed discount amount:', { title: 'Grant Discount', required: true });
      if (!amountStr) return;
      body = { kind: kind.trim(), amount: Number(amountStr) };
    }
    const reason = await showPrompt('Reason for this discount (shown to the student):', { title: 'Grant Discount' });
    const expiry = await showPrompt('Optional expiry date (YYYY-MM-DD), or leave blank:', { title: 'Discount Expiry' });
    try {
      await apiRequest(`/institution-fees/fees/${feeId}/discount`, { method: 'PATCH', body: { ...body, reason: reason || '', expiresAt: expiry || null } });
      onFlash('Discount applied.', 'success');
      load();
    } catch (err) { onFlash(err.message); }
  }

  async function waive(feeId) {
    const reason = await showPrompt('Reason for waiving this fee:', { title: 'Waive Fee' });
    const confirmed = await showConfirm('Waive this fee completely? This cannot be undone.', { danger: true, confirmLabel: 'Waive' });
    if (!confirmed) return;
    try {
      await apiRequest(`/institution-fees/fees/${feeId}/waive`, { method: 'PATCH', body: { reason: reason || '' } });
      onFlash('Fee waived.', 'success');
      load();
    } catch (err) { onFlash(err.message); }
  }

  async function cancelInvoice(feeId) {
    const reason = await showPrompt('Why was this invoice generated by mistake?', { title: 'Cancel Invoice', required: true });
    if (!reason?.trim()) return;
    const confirmed = await showConfirm('Cancel this unpaid invoice? It will remain in the audit history with zero outstanding balance.', { danger: true, confirmLabel: 'Cancel invoice' });
    if (!confirmed) return;
    try {
      await apiRequest(`/institution-fees/fees/${feeId}/cancel`, { method: 'PATCH', body: { reason: reason.trim() } });
      onFlash('Invoice cancelled and retained in audit history.', 'success');
      load();
    } catch (err) { onFlash(err.message); }
  }

  async function paymentArrangement(feeId) {
    const revisedDueDate = await showPrompt('Revised due date (YYYY-MM-DD):', { title: 'Payment Arrangement', required: true });
    if (!revisedDueDate) return;
    const reason = await showPrompt('Arrangement reason/terms:', { title: 'Payment Arrangement', required: true });
    if (!reason) return;
    const scheduleText = await showPrompt('Optional agreed installments as amount@YYYY-MM-DD, comma separated:', { title: 'Agreed Installments', placeholder: '10000@2026-10-15,10000@2026-11-15' });
    const installments = (scheduleText || '').split(',').filter(Boolean).map((entry) => { const [amount, dueDate] = entry.trim().split('@'); return { amount: Number(amount), dueDate }; }).filter((entry) => entry.amount > 0 && entry.dueDate);
    try {
      await apiRequest(`/institution-fees/fees/${feeId}/payment-arrangement`, { method: 'PATCH', body: { revisedDueDate, reason, installments } });
      onFlash('Payment arrangement approved.', 'success'); load();
    } catch (err) { onFlash(err.message); }
  }

  if (!institution) return <p className="admin-notice">Register an institution first (My Institution tab).</p>;

  const SECTIONS = [
    { key: 'overview', label: 'Overview' },
    { key: 'plans', label: 'Fee Plans' },
    { key: 'generate', label: 'Generate Fees' },
    { key: 'invoices', label: 'Invoices' },
    { key: 'verification', label: 'Awaiting Verification' },
    { key: 'defaulters', label: 'Defaulters' },
    { key: 'discounts', label: 'Discounts/Concessions' },
    { key: 'refunds', label: 'Refunds' },
    { key: 'reports', label: 'Reports' }
  ];

  return (
    <div className="institution-ui institution-fees-ui">
      <nav className="cz-tabbar" style={{ marginBottom: 18 }}>
        {SECTIONS.map((s) => <button key={s.key} type="button" aria-pressed={section === s.key} className={`cz-tab${section === s.key ? ' active' : ''}`} onClick={() => setSection(s.key)}>{s.label}</button>)}
      </nav>

      {section === 'overview' && <FeeOverviewSection institutionId={institution._id} onFlash={onFlash} />}
      {section === 'plans' && <FeePlansSection institutionId={institution._id} onFlash={onFlash} />}
      {section === 'generate' && <FeeGenerateSection institutionId={institution._id} onFlash={onFlash} />}
      {section === 'verification' && <FeeVerificationSection institutionId={institution._id} onFlash={onFlash} />}
      {section === 'defaulters' && <FeeDefaultersSection institutionId={institution._id} onFlash={onFlash} />}
      {section === 'discounts' && <FeeReportsSection institutionId={institution._id} onFlash={onFlash} initialType="discounts" locked />}
      {section === 'refunds' && <FeeReportsSection institutionId={institution._id} onFlash={onFlash} initialType="refunds" locked />}
      {section === 'reports' && <FeeReportsSection institutionId={institution._id} onFlash={onFlash} />}

      {section === 'invoices' && (
      <div>
      <div className="admin-notice">Fees are generated automatically from the accepted student's program rules (Admission Management), or via the Generate Fees tab for recurring billing cycles. This screen is for payment verification, reminders, discounts, receipts, escrow and refunds.</div>

      <div className="card" style={{ padding: 14, marginBottom: 14, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <label className="text-xs">Student
          <select className="form-select" style={{ marginTop: 4, minWidth: 160 }} value={filters.student} onChange={(e) => setFilters({ ...filters, student: e.target.value })}>
            <option value="">All students</option>
            {studentOptions.map((s) => <option key={s._id} value={s._id}>{s.fullName}</option>)}
          </select>
        </label>
        <label className="text-xs">Status
          <select className="form-select" style={{ marginTop: 4 }} value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
            <option value="">All</option>
            {['scheduled', 'pending', 'processing', 'partially_paid', 'paid', 'overdue', 'waived', 'cancelled', 'refunded'].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <label className="text-xs">Fee Type
          <select className="form-select" style={{ marginTop: 4 }} value={filters.feeType} onChange={(e) => setFilters({ ...filters, feeType: e.target.value })}>
            <option value="">All</option>
            {['tuition', 'admission', 'exam', 'hostel', 'transport', 'library', 'activity', 'other'].map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
        <label className="text-xs">Academic Year<input className="form-input" style={{ marginTop: 4, width: 100 }} placeholder="2026" value={filters.academicYear} onChange={(e) => setFilters({ ...filters, academicYear: e.target.value })} /></label>
        <label className="text-xs">Term/Semester<input className="form-input" style={{ marginTop: 4, width: 120 }} placeholder="Term1" value={filters.term} onChange={(e) => setFilters({ ...filters, term: e.target.value })} /></label>
        <label className="text-xs">Due From<input type="date" className="form-input" style={{ marginTop: 4 }} value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} /></label>
        <label className="text-xs">Due To<input type="date" className="form-input" style={{ marginTop: 4 }} value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} /></label>
        <button type="button" className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.75rem' }} onClick={applyFilters}>Apply Filters</button>
        <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.75rem' }} onClick={clearFilters}>Clear</button>
      </div>

      <Table
        headers={['Student', 'Student Details', 'Title', 'Amount', 'Outstanding', 'Receipt', 'Due', 'Status', 'Escrow', 'Refund', 'Action', 'PDF']}
        rows={fees.map((f) => [
          <span><strong>{f.student?.fullName}</strong><br/><small>{f.student?.email}</small></span>,
          <span className="text-xs">ID: {f.studentIdentity?.studentId || '—'}<br/>Roll: {f.studentIdentity?.rollNumber || '—'}<br/>Program: {f.studentIdentity?.program || '—'}<br/>Class: {f.studentIdentity?.classSection || '—'}</span>,
          f.installment?.totalInstallments ? `${f.title} (${f.installment.number}/${f.installment.totalInstallments})` : f.title, `${f.currency} ${f.amount}`,
          `${f.currency} ${f.outstandingAmount ?? f.amount}`,
          f.receiptNumber || '—',
          f.dueDate ? new Date(f.dueDate).toLocaleDateString() : '—',
          <Tag status={f.status === 'paid' ? 'approved' : f.status === 'refunded' || f.status === 'overdue' ? 'rejected' : 'pending'} label={f.status} />,
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
          !['paid', 'refunded', 'waived', 'cancelled'].includes(f.status) ? (
            <div className="flex gap-2 items-center flex-wrap">
              <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>Paid through CareerZ (bank transfer + receipts)</span>
              <button className="btn" style={{ padding: '5px 12px', fontSize: '0.78rem' }} onClick={() => remind(f._id)}>Remind</button>
              <button className="btn" style={{ padding: '5px 12px', fontSize: '0.78rem' }} onClick={() => grantDiscount(f._id)}>Discount</button>
              <button className="btn" style={{ padding: '5px 12px', fontSize: '0.78rem' }} onClick={() => waive(f._id)}>Waive</button>
              {['pending', 'partially_paid', 'overdue'].includes(f.status) && <button className="btn" style={{ padding: '5px 12px', fontSize: '0.78rem' }} onClick={() => paymentArrangement(f._id)}>Arrangement</button>}
              {['scheduled', 'pending', 'overdue'].includes(f.status) && (
                <button className="btn" style={{ padding: '5px 12px', fontSize: '0.78rem' }} onClick={() => cancelInvoice(f._id)}>Cancel Invoice</button>
              )}
            </div>
          ) : f.status === 'paid' && f.escrowStatus === 'held' ? (
            <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>Held · CareerZ releases after checking</span>
          ) : f.status === 'paid' ? <span>{f.paidVia || '—'}{f.paidByInfo && <><br /><span className="text-xs">by {f.paidByInfo.name} ({f.paidByInfo.role})</span></>}</span> : '—',
          <button type="button" className="btn" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={() => downloadFeePdf(f)}>{['paid', 'refunded'].includes(f.status) ? 'Receipt' : 'Invoice'}</button>
        ])}
        empty="No fee records yet."
      />
      </div>
      )}
    </div>
  );
}

const BILLING_FREQUENCIES = ['monthly', 'term', 'semester', 'quarterly', 'biannual', 'annual', 'one_time', 'custom'];

const RESTRICTION_POLICIES = ['none', 'warning', 'block_materials', 'block_assignments', 'block_exams', 'block_live_classes', 'block_certificates', 'block_all'];

// Fee Plans (spec item 1/9) — configure each program's billing schedule. Not hard-coded to any
// institution type: a school picks 'monthly', a university 'semester', a college 'annual', an
// academy whatever custom cadence it wants — the institution always chooses.
function FeePlansSection({ institutionId, onFlash }) {
  const [programs, setPrograms] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  function load() { apiRequest(`/institutions/${institutionId}/programs`).then(setPrograms).catch((err) => onFlash(err.message)); }
  useEffect(load, [institutionId]); // eslint-disable-line react-hooks/exhaustive-deps

  function edit(program) {
    setEditing(program._id);
    setForm({
      billingFrequency: program.billingFrequency || 'monthly', billingIntervalCount: program.billingIntervalCount || 1,
      academicYearStart: program.academicYearStart ? program.academicYearStart.slice(0, 10) : '', academicYearEnd: program.academicYearEnd ? program.academicYearEnd.slice(0, 10) : '',
      firstDueDate: program.firstDueDate ? program.firstDueDate.slice(0, 10) : '', invoiceGenerationDay: program.invoiceGenerationDay || 1,
      dueDay: program.dueDay || 10, gracePeriodDays: program.gracePeriodDays || 0, numberOfTerms: program.numberOfTerms || 1,
      installmentsPerBillingCycle: program.installmentsPerBillingCycle || 1, autoGenerateInvoices: program.autoGenerateInvoices !== false,
      autoSendReminders: program.autoSendReminders !== false, lateFeeEnabled: program.lateFeeEnabled || false,
      lateFeeType: program.lateFeeType || 'fixed', lateFeeValue: program.lateFeeValue || 0, maximumLateFee: program.maximumLateFee ?? '',
      minimumPartialPayment: program.minimumPartialPayment || 0,
      accessRestrictionPolicy: program.accessRestrictionPolicy || 'block_all',
      reminderDays: (program.reminderRules?.daysBeforeDue || [3]).join(','),
      reminderOnDue: program.reminderRules?.onDueDate !== false,
      reminderAfterGrace: program.reminderRules?.afterGracePeriod !== false
    });
  }

  async function save(programId) {
    setSaving(true);
    try {
      const body = { ...form, maximumLateFee: form.maximumLateFee === '' ? null : Number(form.maximumLateFee), reminderRules: { daysBeforeDue: form.reminderDays.split(',').map(Number).filter((n) => Number.isInteger(n) && n >= 0), onDueDate: form.reminderOnDue, afterGracePeriod: form.reminderAfterGrace } };
      delete body.reminderDays; delete body.reminderOnDue; delete body.reminderAfterGrace;
      await apiRequest(`/institution-fees/${institutionId}/programs/${programId}/billing`, { method: 'PATCH', body });
      onFlash('Billing configuration saved.', 'success');
      setEditing(null); setForm(null);
      load();
    } catch (err) { onFlash(err.message); } finally { setSaving(false); }
  }

  if (programs === null) return <p className="admin-notice">Loading...</p>;
  if (programs.length === 0) return <p className="admin-notice">No programs yet — create one in Admission Management first.</p>;

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {programs.map((p) => (
        <div key={p._id} className="card" style={{ padding: 16 }}>
          <div className="flex items-center justify-between flex-wrap" style={{ gap: 8 }}>
            <div>
              <strong className="text-sm">{p.name}</strong>
              <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>{p.department} · {p.currency} {p.totalTuitionFee} · billing: {p.billingFrequency || 'monthly'}</p>
            </div>
            {editing !== p._id && <button type="button" className="btn" style={{ padding: '5px 12px', fontSize: '0.75rem' }} onClick={() => edit(p)}>Configure Billing</button>}
          </div>
          {editing === p._id && form && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--sand-line)', display: 'grid', gap: 10 }}>
              <div className="flex flex-wrap" style={{ gap: 10 }}>
                <label className="text-xs">Billing Frequency
                  <select className="form-select" value={form.billingFrequency} onChange={(e) => setForm({ ...form, billingFrequency: e.target.value })} style={{ marginTop: 4 }}>
                    {BILLING_FREQUENCIES.map((f) => <option key={f} value={f}>{f.replace('_', ' ')}</option>)}
                  </select>
                </label>
                {form.billingFrequency === 'custom' && (
                  <label className="text-xs">Every N Months<input type="number" min={1} className="form-input" style={{ width: 90, marginTop: 4 }} value={form.billingIntervalCount} onChange={(e) => setForm({ ...form, billingIntervalCount: Number(e.target.value) })} /></label>
                )}
                {['term', 'semester'].includes(form.billingFrequency) && (
                  <label className="text-xs">Number of Terms<input type="number" min={1} className="form-input" style={{ width: 90, marginTop: 4 }} value={form.numberOfTerms} onChange={(e) => setForm({ ...form, numberOfTerms: Number(e.target.value) })} /></label>
                )}
                <label className="text-xs">Instalments per Cycle<input type="number" min={1} className="form-input" style={{ width: 90, marginTop: 4 }} value={form.installmentsPerBillingCycle} onChange={(e) => setForm({ ...form, installmentsPerBillingCycle: Number(e.target.value) })} /></label>
              </div>
              <div className="flex flex-wrap" style={{ gap: 10 }}>
                <label className="text-xs">Academic Year Start<input type="date" className="form-input" style={{ marginTop: 4 }} value={form.academicYearStart} onChange={(e) => setForm({ ...form, academicYearStart: e.target.value })} /></label>
                <label className="text-xs">Academic Year End<input type="date" className="form-input" style={{ marginTop: 4 }} value={form.academicYearEnd} onChange={(e) => setForm({ ...form, academicYearEnd: e.target.value })} /></label>
                <label className="text-xs">First Due Date<input type="date" className="form-input" style={{ marginTop: 4 }} value={form.firstDueDate} onChange={(e) => setForm({ ...form, firstDueDate: e.target.value })} /></label>
              </div>
              <div className="flex flex-wrap" style={{ gap: 10 }}>
                <label className="text-xs">Invoice Generation Day<input type="number" min={1} max={28} className="form-input" style={{ width: 80, marginTop: 4 }} value={form.invoiceGenerationDay} onChange={(e) => setForm({ ...form, invoiceGenerationDay: Number(e.target.value) })} /></label>
                <label className="text-xs">Due Day<input type="number" min={1} max={28} className="form-input" style={{ width: 80, marginTop: 4 }} value={form.dueDay} onChange={(e) => setForm({ ...form, dueDay: Number(e.target.value) })} /></label>
                <label className="text-xs">Grace Period (days)<input type="number" min={0} className="form-input" style={{ width: 80, marginTop: 4 }} value={form.gracePeriodDays} onChange={(e) => setForm({ ...form, gracePeriodDays: Number(e.target.value) })} /></label>
              </div>
              <div className="flex flex-wrap items-center" style={{ gap: 14 }}>
                <label className="text-xs flex items-center" style={{ gap: 6 }}><input type="checkbox" checked={form.autoGenerateInvoices} onChange={(e) => setForm({ ...form, autoGenerateInvoices: e.target.checked })} /> Auto-generate invoices</label>
                <label className="text-xs flex items-center" style={{ gap: 6 }}><input type="checkbox" checked={form.autoSendReminders} onChange={(e) => setForm({ ...form, autoSendReminders: e.target.checked })} /> Auto-send reminders</label>
                <label className="text-xs flex items-center" style={{ gap: 6 }}><input type="checkbox" checked={form.lateFeeEnabled} onChange={(e) => setForm({ ...form, lateFeeEnabled: e.target.checked })} /> Late fee enabled</label>
              </div>
              {form.lateFeeEnabled && (
                <div className="flex flex-wrap" style={{ gap: 10 }}>
                  <select className="form-select" value={form.lateFeeType} onChange={(e) => setForm({ ...form, lateFeeType: e.target.value })}>
                    <option value="fixed">Fixed amount</option>
                    <option value="percentage">Percentage of outstanding</option>
                  </select>
                  <label className="text-xs">Value<input type="number" min={0} className="form-input" style={{ width: 90, marginTop: 4 }} value={form.lateFeeValue} onChange={(e) => setForm({ ...form, lateFeeValue: Number(e.target.value) })} /></label>
                  <label className="text-xs">Maximum Late Fee (optional)<input type="number" min={0} className="form-input" style={{ width: 110, marginTop: 4 }} value={form.maximumLateFee} onChange={(e) => setForm({ ...form, maximumLateFee: e.target.value })} /></label>
                </div>
              )}
              <label className="text-xs">Minimum Partial Payment (0 = no minimum)<input type="number" min={0} className="form-input" style={{ width: 130, marginTop: 4, display: 'block' }} value={form.minimumPartialPayment} onChange={(e) => setForm({ ...form, minimumPartialPayment: Number(e.target.value) })} /></label>
              <div className="flex flex-wrap items-center" style={{ gap: 12 }}>
                <label className="text-xs">Reminder days before due (comma separated)<input className="form-input" style={{ width: 180, marginTop: 4 }} value={form.reminderDays} onChange={(e) => setForm({ ...form, reminderDays: e.target.value })} placeholder="7,3,1" /></label>
                <label className="text-xs flex items-center" style={{ gap: 6 }}><input type="checkbox" checked={form.reminderOnDue} onChange={(e) => setForm({ ...form, reminderOnDue: e.target.checked })} /> On due date</label>
                <label className="text-xs flex items-center" style={{ gap: 6 }}><input type="checkbox" checked={form.reminderAfterGrace} onChange={(e) => setForm({ ...form, reminderAfterGrace: e.target.checked })} /> After grace period</label>
              </div>
              <label className="text-xs">Access Restriction Policy (once overdue)
                <select className="form-select" value={form.accessRestrictionPolicy} onChange={(e) => setForm({ ...form, accessRestrictionPolicy: e.target.value })} style={{ marginTop: 4, display: 'block' }}>
                  {RESTRICTION_POLICIES.map((p) => <option key={p} value={p}>{p.replace('_', ' ')}</option>)}
                </select>
              </label>
              <div className="flex gap-2">
                <button type="button" className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.78rem' }} disabled={saving} onClick={() => save(p._id)}>{saving ? 'Saving...' : 'Save Billing Configuration'}</button>
                <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.78rem' }} onClick={() => { setEditing(null); setForm(null); }}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Lightweight, dependency-free SVG bar chart — no charting library in this project, so a small
// hand-rolled one avoids adding a new dependency just for 3 bar charts.
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const chartLabel = (v) => { const m = /^(\d{4})-(\d{2})$/.exec(String(v || '')); return m ? `${MONTH_NAMES[Number(m[2]) - 1]} ${m[1]}` : String(v ?? ''); };

function SimpleBarChart({ data, labelKey, valueKey, color = 'var(--forest)', height = 160, format = (v) => Number(v || 0).toLocaleString() }) {
  if (!data || data.length === 0) return <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>No data yet.</p>;
  const max = Math.max(1, ...data.map((d) => Number(d[valueKey]) || 0));
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height, overflowX: 'auto', padding: '4px 0' }}>
      {data.map((d, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 64 }}>
          <span className="text-xs" style={{ marginBottom: 4, fontWeight: 700, whiteSpace: 'nowrap' }}>{format(d[valueKey])}</span>
          <div style={{ width: 26, height: Math.max(4, ((Number(d[valueKey]) || 0) / max) * (height - 40)), background: color, borderRadius: '4px 4px 0 0' }} />
          <span className="text-xs" style={{ marginTop: 4, color: 'var(--ink-soft)', textAlign: 'center', maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={chartLabel(d[labelKey])}>{chartLabel(d[labelKey])}</span>
        </div>
      ))}
    </div>
  );
}

// Fee dashboard charts (spec: monthly income graph, class-wise outstanding fee graph, monthly
// fee collection comparison graph) — shown both inside Fee Management -> Overview and on the
// institution's main dashboard.
function FeeCollectionCharts({ institutionId, onFlash }) {
  const [collection, setCollection] = useState(null);
  const [classWise, setClassWise] = useState(null);
  useEffect(() => {
    apiRequest(`/institution-fees/${institutionId}/reports/collection?groupBy=month`).then(setCollection).catch((err) => onFlash?.(err.message));
    apiRequest(`/institution-fees/${institutionId}/reports/class-wise`).then(setClassWise).catch((err) => onFlash?.(err.message));
  }, [institutionId]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="grid institution-fee-charts" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginTop: 16 }}>
      <div className="card fee-chart-card">
        <strong className="text-sm">Monthly Income</strong><span className="fee-chart-note">Fees collected each month (PKR)</span>
        <SimpleBarChart data={collection} labelKey="period" valueKey="collected" />
      </div>
      <div className="card fee-chart-card">
        <strong className="text-sm">Month-to-Month Collection Comparison</strong><span className="fee-chart-note">Number of fee payments received each month</span>
        <SimpleBarChart data={collection} labelKey="period" valueKey="count" color="var(--gold)" format={(v) => `${Number(v || 0)} paid`} />
      </div>
      <div className="card fee-chart-card">
        <strong className="text-sm">Class-wise Outstanding Fees</strong><span className="fee-chart-note">Fees still unpaid in each class (PKR)</span>
        <SimpleBarChart data={classWise} labelKey="className" valueKey="outstanding" color="var(--rose, #c0392b)" />
      </div>
    </div>
  );
}

function FeeOverviewSection({ institutionId, onFlash }) {
  const [data, setData] = useState(null);
  useEffect(() => { apiRequest(`/institution-fees/${institutionId}/reports/overview`).then(setData).catch((err) => onFlash(err.message)); }, [institutionId]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!data) return <p className="admin-notice">Loading...</p>;
  const pkr = (v) => `PKR ${Number(v || 0).toLocaleString()}`;
  const cards = [
    ['Expected Collection', pkr(data.expectedCollection), 'neutral'], ['Collected', pkr(data.collected), 'good'], ['Outstanding', pkr(data.outstanding), 'warn'],
    ['Overdue Invoices', data.overdueCount, data.overdueCount > 0 ? 'bad' : 'neutral'], ['Awaiting Verification', data.processingCount, data.processingCount > 0 ? 'warn' : 'neutral'], ['Refunded', pkr(data.refunded), 'neutral'],
    ['Collection Rate', `${data.collectionRate}%`, data.collectionRate >= 80 ? 'good' : 'warn'], ['Defaulters', data.defaulterCount, data.defaulterCount > 0 ? 'bad' : 'neutral']
  ];
  return (
    <div>
      <div className="grid institution-fee-metrics" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
        {cards.map(([label, value, tone]) => (
          <div key={label} className={`card fee-metric ${tone}`}>
            <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>{label}</p>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <FeeCollectionCharts institutionId={institutionId} onFlash={onFlash} />
    </div>
  );
}

function FeeGenerateSection({ institutionId, onFlash }) {
  const [schedules, setSchedules] = useState(null);
  const [previews, setPreviews] = useState({});

  function load() { apiRequest(`/institution-fees/${institutionId}/schedules`).then(setSchedules).catch((err) => onFlash(err.message)); }
  useEffect(load, [institutionId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function preview(scheduleId, which) {
    try {
      const res = await apiRequest(`/institution-fees/${institutionId}/schedules/${scheduleId}/preview?which=${which}`);
      setPreviews((p) => ({ ...p, [scheduleId]: { which, ...res } }));
    } catch (err) { onFlash(err.message); }
  }

  async function generate(scheduleId, which) {
    try {
      const res = await apiRequest(`/institution-fees/${institutionId}/schedules/${scheduleId}/generate`, { method: 'POST', body: { which } });
      onFlash(res.message || 'Generated.', 'success');
      setPreviews((p) => { const n = { ...p }; delete n[scheduleId]; return n; });
      load();
    } catch (err) { onFlash(err.message); }
  }

  async function generateAll(which) {
    try {
      const res = await apiRequest(`/institution-fees/${institutionId}/generate-all`, { method: 'POST', body: { which } });
      onFlash(`${res.invoicesCreated} invoice(s) created for ${res.studentsBilled} student(s).`, 'success');
      load();
    } catch (err) { onFlash(err.message); }
  }

  if (schedules === null) return <p className="admin-notice">Loading...</p>;

  return (
    <div>
      <div className="flex gap-2 mb-4 flex-wrap">
        <button type="button" className="btn btn-primary" onClick={() => generateAll('current')}>Generate Current Billing Cycle — All Eligible Students</button>
        <button type="button" className="btn" onClick={() => generateAll('next')}>Generate Next Billing Cycle — All Eligible Students</button>
      </div>
      {schedules.length === 0 && <p className="admin-notice">No fee schedules yet — accepting an admission application creates one automatically.</p>}
      <div style={{ display: 'grid', gap: 10 }}>
        {schedules.map((s) => {
          const p = previews[s._id];
          return (
            <div key={s._id} className="card" style={{ padding: 14 }}>
              <div className="flex items-center justify-between flex-wrap" style={{ gap: 8 }}>
                <div>
                  <strong className="text-sm">{s.student?.fullName}</strong>
                  <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>{s.programName} · {s.billingFrequency} · {s.currency} {s.totalProgramFee} total</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button type="button" className="btn" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={() => preview(s._id, 'current')}>Preview Current</button>
                  <button type="button" className="btn" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={() => preview(s._id, 'next')}>Preview Next</button>
                  <button type="button" className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={() => generate(s._id, 'current')}>Generate Current</button>
                  <button type="button" className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={() => generate(s._id, 'next')}>Generate Next</button>
                </div>
              </div>
              {p && (
                <div className="text-xs" style={{ marginTop: 8, padding: 8, background: 'var(--sand)', borderRadius: 8 }}>
                  {p.period ? (
                    <>Period: <strong>{p.label}</strong> · Amount: <strong>{p.currency} {p.amount}</strong> · Due: <strong>{new Date(p.dueDate).toLocaleDateString()}</strong> · Instalments: {p.installments}{p.alreadyGenerated ? ' · Already generated' : ''}</>
                  ) : 'No further billing period for this plan.'}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// The institute sees reported payments here; CareerZ finance verifies them (Financial Management).
function FeeVerificationSection({ institutionId, onFlash }) {
  const [fees, setFees] = useState(null);
  function load() { apiRequest(`/institution-fees/${institutionId}/payments-awaiting-verification`).then(setFees).catch((err) => onFlash(err.message)); }
  useEffect(load, [institutionId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (fees === null) return <p className="admin-notice">Loading...</p>;
  if (fees.length === 0) return <p className="admin-notice">No payments awaiting verification.</p>;
  return (
    <div style={{ display: 'grid', gap: 10 }}>
      {fees.map((f) => {
        const pending = [...(f.paymentHistory || [])].reverse().find((p) => (p.verificationStatus || (!p.verifiedAt ? 'pending' : 'verified')) === 'pending');
        return (
          <div key={f._id} className="card" style={{ padding: 14 }}>
            <div className="flex items-center justify-between flex-wrap" style={{ gap: 8 }}>
              <div>
                <strong className="text-sm">{f.student?.fullName}</strong>
                <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>{f.title} · Reported {f.currency} {pending?.amount} via {pending?.method}{pending?.paidByInfo ? ` by ${pending.paidByInfo.name} (${pending.paidByInfo.role})` : ''}</p>
                <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>
                  Ref: {pending?.reference || pending?.transactionId || '—'} · Paid on: {pending?.paidOn ? new Date(pending.paidOn).toLocaleDateString() : '—'}
                  {pending?.bankName ? ` · Bank/provider: ${pending.bankName}` : ''}
                </p>
                {pending?.notes && <p className="text-xs">Note: {pending.notes}</p>}
                {pending?.proofUrl && <a className="btn" style={{ display: 'inline-block', padding: '4px 10px', fontSize: '0.72rem', marginTop: 6 }} href={pending.proofUrl} target="_blank" rel="noreferrer">View payment proof</a>}
              </div>
              <span className="text-xs" style={{ color: 'var(--gold)' }}>Waiting for CareerZ to verify the proof</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function FeeDefaultersSection({ institutionId, onFlash }) {
  const [fees, setFees] = useState(null);
  useEffect(() => { apiRequest(`/institution-fees/${institutionId}/defaulters`).then(setFees).catch((err) => onFlash(err.message)); }, [institutionId]); // eslint-disable-line react-hooks/exhaustive-deps
  if (fees === null) return <p className="admin-notice">Loading...</p>;
  if (fees.length === 0) return <p className="admin-notice">No overdue fees — no defaulters.</p>;
  return (
    <Table
      headers={['Student', 'Fee', 'Outstanding', 'Due Date', 'Late Fee']}
      rows={fees.map((f) => [f.student?.fullName, f.title, `${f.currency} ${f.outstandingAmount ?? f.amount}`, new Date(f.dueDate).toLocaleDateString(), f.lateFeeAmount ? `${f.currency} ${f.lateFeeAmount}` : '—'])}
      empty="No defaulters."
    />
  );
}

const REPORT_TYPES = [
  { key: 'ledger', label: 'Student Ledger' },
  { key: 'aging', label: 'Outstanding Aging' },
  { key: 'class-wise', label: 'Class-wise Collection' },
  { key: 'program-wise', label: 'Program-wise' },
  { key: 'fee-type', label: 'Fee-Type' },
  { key: 'payment-method', label: 'Payment Method' },
  { key: 'discounts', label: 'Discounts/Concessions' },
  { key: 'refunds', label: 'Refunds' },
  { key: 'collection?groupBy=day', label: 'Collection (Daily)' },
  { key: 'collection?groupBy=month', label: 'Collection (Monthly)' },
  { key: 'collection?groupBy=year', label: 'Collection (Annual)' }
];

function reportRowsForPdf(reportType, data) {
  if (reportType === 'aging') return ['1-30', '31-60', '61-90', '90+'].flatMap((bucket) => (data[bucket] || []).map((row) => ({ bucket, student: row.student?.fullName, amount: `${row.currency} ${row.amount}`, daysOverdue: row.daysOverdue })));
  if (reportType === 'discounts') return data.map((r) => ({ student: r.student?.fullName, kind: r.kind, reason: r.reason, amount: `${r.currency} ${r.amount}`, approvedBy: r.approvedBy }));
  if (reportType === 'refunds') return data.map((r) => ({ student: r.student?.fullName, title: r.title, status: r.refund?.status, amount: `${r.currency} ${r.refund?.amount}` }));
  return data.map((r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, typeof v === 'object' && v !== null ? JSON.stringify(v) : v])));
}

async function downloadReportPdf(reportType, label, rows) {
  const { jsPDF } = await import('jspdf');
  const pdf = await createBrandedPdf(jsPDF, { title: label, subtitle: `Generated ${new Date().toLocaleDateString()}`, orientation: 'landscape' });
  if (rows.length === 0) { pdf.setTextColor(...PDF_COLORS.muted); pdf.text('No data available for this report.', 14, 72); addPdfFooter(pdf); pdf.save(`${reportType}-report.pdf`); return; }
  const headers = Object.keys(rows[0]);
  drawPdfTable(pdf, { headers: headers.map((h) => h.replaceAll('_', ' ').toUpperCase()), rows: rows.map((row) => headers.map((h) => row[h])) });
  addPdfFooter(pdf);
  pdf.save(`${reportType}-report.pdf`);
}

function FeeReportsSection({ institutionId, onFlash, initialType, locked }) {
  const [reportType, setReportType] = useState(initialType || 'aging');
  const [data, setData] = useState(null);

  useEffect(() => {
    setData(null);
    if (reportType === 'ledger') { setData([]); return; }
    apiRequest(`/institution-fees/${institutionId}/reports/${reportType}`).then(setData).catch((err) => onFlash(err.message));
  }, [institutionId, reportType]); // eslint-disable-line react-hooks/exhaustive-deps

  function exportCsv() {
    if (reportType === 'aging') {
      const flat = ['1-30', '31-60', '61-90', '90+'].flatMap((bucket) => (data[bucket] || []).map((row) => ({ bucket, student: row.student?.fullName, amount: row.amount, currency: row.currency, daysOverdue: row.daysOverdue })));
      downloadCsv('aging-report.csv', flat);
    } else if (reportType === 'discounts' || reportType === 'refunds') {
      downloadCsv(`${reportType}-report.csv`, data.map((r) => ({ student: r.student?.fullName, ...('kind' in r ? { kind: r.kind, reason: r.reason, amount: r.amount, approvedBy: r.approvedBy } : { status: r.refund?.status, amount: r.refund?.amount, reason: r.refund?.reason }) })));
    } else {
      downloadCsv(`${reportType}-report.csv`, data);
    }
  }

  const reportLabel = REPORT_TYPES.find((r) => r.key === reportType)?.label || reportType;

  async function loadLedger() {
    const studentId = await showPrompt('Student ID for ledger:', { title: 'Student Ledger', required: true });
    if (!studentId) return;
    try { setData(await apiRequest(`/institution-fees/${institutionId}/reports/ledger?studentId=${encodeURIComponent(studentId)}`)); } catch (err) { onFlash(err.message); }
  }

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap" style={{ gap: 10, marginBottom: 14 }}>
        {!locked ? (
          <div className="flex gap-2 flex-wrap">
            {REPORT_TYPES.map((r) => <button key={r.key} type="button" className={`btn ${reportType === r.key ? 'btn-primary' : ''}`} style={{ padding: '5px 12px', fontSize: '0.75rem' }} onClick={() => setReportType(r.key)}>{r.label}</button>)}
          </div>
        ) : <h4 className="font-semibold" style={{ margin: 0 }}>{reportLabel}</h4>}
        <span className="flex gap-2">
          {reportType === 'ledger' && <button type="button" className="btn btn-primary" onClick={loadLedger}>Load Student Ledger</button>}
          <button type="button" className="btn" style={{ padding: '5px 12px', fontSize: '0.75rem' }} disabled={!data} onClick={exportCsv}>Export CSV</button>
          <button type="button" className="btn" style={{ padding: '5px 12px', fontSize: '0.75rem' }} disabled={!data} onClick={() => downloadReportPdf(reportType, reportLabel, reportRowsForPdf(reportType, data))}>Export PDF</button>
        </span>
      </div>

      {data === null && <p className="admin-notice">Loading...</p>}

      {data && reportType === 'aging' && (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          {['1-30', '31-60', '61-90', '90+'].map((bucket) => (
            <div key={bucket} className="card" style={{ padding: 14 }}>
              <strong className="text-sm">{bucket} days ({data[bucket].length})</strong>
              <div style={{ marginTop: 8, display: 'grid', gap: 4 }}>
                {data[bucket].map((row, i) => <p key={i} className="text-xs">{row.student?.fullName} — {row.currency} {row.amount} ({row.daysOverdue}d)</p>)}
                {data[bucket].length === 0 && <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>None</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {data && (['class-wise', 'program-wise', 'fee-type', 'payment-method', 'ledger'].includes(reportType) || reportType.startsWith('collection')) && (
        <Table
          headers={Object.keys(data[0] || { info: 'No data' })}
          rows={data.map((row) => Object.values(row).map((v) => (typeof v === 'number' ? v : String(v))))}
          empty="No data for this report yet."
        />
      )}

      {data && reportType === 'discounts' && (
        <Table headers={['Student', 'Fee', 'Kind', 'Reason', 'Amount', 'Approved By', 'Date']}
          rows={data.map((r) => [r.student?.fullName, r.feeTitle, r.kind, r.reason, `${r.currency} ${r.amount}`, r.approvedBy, r.approvedAt ? new Date(r.approvedAt).toLocaleDateString() : '—'])}
          empty="No discounts granted yet." />
      )}

      {data && reportType === 'refunds' && (
        <Table headers={['Student', 'Fee', 'Refund Status', 'Amount', 'Reason']}
          rows={data.map((r) => [r.student?.fullName, r.title, r.refund?.status, `${r.currency} ${r.refund?.amount}`, r.refund?.reason])}
          empty="No refunds yet." />
      )}
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
    <div className="institution-ui institution-remaining-ui institution-communication-ui">
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
        <label className="institution-field"><span>Title</span><input className="form-input" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></label>
        <label className="institution-field"><span>Message</span><textarea className="form-input" placeholder="Message" rows={4} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} /></label>
        <div className="flex gap-4 items-center" style={{ fontSize: 13 }}>
          <span style={{ color: 'var(--ink-soft)' }}>In-app + browser push always.</span>
          <label className="flex items-center gap-1"><input type="checkbox" checked={!form.channels.includes('no-email')} onChange={() => toggleChannel('no-email')} /> Email</label>
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
            <label className="institution-field"><span>Twilio Account SID</span><input className="form-input" placeholder="Twilio Account SID" value={twilioForm.accountSid} onChange={(e) => setTwilioForm({ ...twilioForm, accountSid: e.target.value })} required /></label>
            <label className="institution-field"><span>Twilio Auth Token</span><input className="form-input" type="password" placeholder="Twilio Auth Token" value={twilioForm.authToken} onChange={(e) => setTwilioForm({ ...twilioForm, authToken: e.target.value })} required /></label>
            <label className="institution-field"><span>SMS From Number (e.g. +15551234567)</span><input className="form-input" placeholder="SMS From Number (e.g. +15551234567)" value={twilioForm.smsFromNumber} onChange={(e) => setTwilioForm({ ...twilioForm, smsFromNumber: e.target.value })} /></label>
            <label className="institution-field"><span>WhatsApp From Number (e.g. whatsapp:+14155238886)</span><input className="form-input" placeholder="WhatsApp From Number (e.g. whatsapp:+14155238886)" value={twilioForm.whatsappFromNumber} onChange={(e) => setTwilioForm({ ...twilioForm, whatsappFromNumber: e.target.value })} /></label>
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
      const dataUrl = await resizeImageToDataUrl(file, 800, 0.78, 'campus');
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
    <div className="institution-ui institution-remaining-ui institution-tour-ui">
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

      <form onSubmit={submit} className="bld-form">
        <div className="nl-form-head"><h4>{editingId ? 'Edit Building' : 'Add a Building'}</h4><p>Name it, place it on the grid and set its size. It appears on the 3D campus map right away.</p></div>
        <div className="bld-grid bld-grid-main">
          <label className="bld-field"><span>Building name</span><input className="form-input" placeholder="e.g. Main Library" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
          <div className="bld-field"><span>Type</span><CustomSelect value={form.type} onChange={(v) => setForm({ ...form, type: v })} ariaLabel="Building type" minWidth="100%" options={BUILDING_TYPES.map((t) => ({ value: t, label: t[0].toUpperCase() + t.slice(1) }))} /></div>
          <label className="bld-field"><span>Colour on map</span><span className="bld-color"><input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} /><code>{form.color}</code></span></label>
        </div>
        <div className="bld-group"><h5>Position and size</h5>
          <div className="bld-grid bld-grid-size">
            <label className="bld-field"><span>Position X <small>left / right</small></span><input type="number" className="form-input" value={form.positionX} onChange={(e) => setForm({ ...form, positionX: Number(e.target.value) })} /></label>
            <label className="bld-field"><span>Position Z <small>front / back</small></span><input type="number" className="form-input" value={form.positionZ} onChange={(e) => setForm({ ...form, positionZ: Number(e.target.value) })} /></label>
            <label className="bld-field"><span>Width</span><input type="number" min="1" className="form-input" value={form.width} onChange={(e) => setForm({ ...form, width: Number(e.target.value) })} /></label>
            <label className="bld-field"><span>Depth</span><input type="number" min="1" className="form-input" value={form.depth} onChange={(e) => setForm({ ...form, depth: Number(e.target.value) })} /></label>
            <label className="bld-field"><span>Floors</span><input type="number" min="1" className="form-input" value={form.floors} onChange={(e) => setForm({ ...form, floors: Number(e.target.value) })} /></label>
          </div>
        </div>
        <label className="bld-field"><span>Description</span><textarea className="form-input" placeholder="What's inside this building" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
        <div className="bld-field"><span>Photo (optional)</span>
          <label className="bld-photo">{form.photo ? <img src={form.photo} alt="" /> : <span aria-hidden="true">+</span>}<span>{form.photo ? 'Change photo' : 'Upload a photo of the building'}</span><input type="file" accept="image/*" onChange={onPhoto} /></label>
        </div>
        <div className="nl-form-foot" style={{ gap: 10 }}>
          {editingId && <button type="button" className="btn" onClick={() => { setEditingId(null); setForm(EMPTY_BUILDING_FORM); }}>Cancel</button>}
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add Building'}</button>
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

function InstitutionAdmissionsPanel({ onFlash }) {
  const institution = useMyInstitution(onFlash);
  const [apps, setApps] = useState(null);
  const [form, setForm] = useState({ applicantName: '', applicantEmail: '', program: '' });
  const [testFormFor, setTestFormFor] = useState(null);
  const [testForm, setTestForm] = useState({ date: '', subject: '' });
  const [interviewFormFor, setInterviewFormFor] = useState(null);
  const [interviewForm, setInterviewForm] = useState({ date: '', mode: 'video' });
  const [scoreFormFor, setScoreFormFor] = useState(null);
  const [scoreForm, setScoreForm] = useState({ score: '', maxScore: '' });
  const [onlineTests, setOnlineTests] = useState([]);
  const [testBuilder, setTestBuilder] = useState({ title: '', program: '', subject: '', instructions: '', durationMinutes: 30, passingPercent: 50, questions: [{ text: '', options: ['', '', '', ''], correctOption: 0, marks: 1 }] });
  const [assignFor, setAssignFor] = useState(null);
  const [assignment, setAssignment] = useState({ testId: '', scheduledAt: '' });
  const [sections, setSections] = useState([]);
  const [programs, setPrograms] = useState([]);
  const emptyAdditionalFees = () => Object.fromEntries(['exam', 'hostel', 'transport', 'library', 'activity'].map((type) => [type, { enabled: false, amount: '' }]));
  const [programForm, setProgramForm] = useState({ name: '', department: '', classSection: '', durationTerms: 8, admissionFee: '', totalTuitionFee: '', installments: 8, currency: 'PKR', additionalFees: emptyAdditionalFees() });

  function load(instId) {
    apiRequest(`/institution-applications/institution/${instId}`).then(setApps).catch((err) => onFlash(err.message));
    apiRequest(`/institution-applications/tests/institution/${instId}`).then(setOnlineTests).catch((err) => onFlash(err.message));
    apiRequest(`/institutions/${instId}/class-sections`).then((list) => { setSections(list); setProgramForm((form) => ({ ...form, classSection: form.classSection || list[0]?._id || '' })); }).catch(() => {});
    apiRequest(`/institutions/${instId}/programs`).then(setPrograms).catch(() => {});
  }

  async function createProgram(e) {
    e.preventDefault();
    try {
      await apiRequest(`/institutions/${institution._id}/programs`, { method: 'POST', body: { ...programForm, durationTerms: Number(programForm.durationTerms), admissionFee: Number(programForm.admissionFee) || 0, totalTuitionFee: Number(programForm.totalTuitionFee), installments: Number(programForm.installments) } });
      onFlash('Program, section and complete fee plan saved.', 'success');
      setProgramForm({ name: '', department: '', classSection: sections[0]?._id || '', durationTerms: 8, admissionFee: '', totalTuitionFee: '', installments: 8, currency: 'PKR', additionalFees: emptyAdditionalFees() }); load(institution._id);
    } catch (err) { onFlash(err.message); }
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
      setTestFormFor(null);
      setTestForm({ date: '', subject: '' });
      load(institution._id);
    } catch (err) { onFlash(err.message); }
  }

  async function recordTestScore(id, score, maxScore) {
    try {
      await apiRequest(`/institution-applications/${id}/test`, { method: 'PATCH', body: { score: Number(score), maxScore: Number(maxScore) } });
      onFlash('Test score recorded.', 'success');
      setScoreFormFor(null);
      setScoreForm({ score: '', maxScore: '' });
      load(institution._id);
    } catch (err) { onFlash(err.message); }
  }

  async function scheduleInterview(id, scheduledAt, mode) {
    try {
      await apiRequest(`/institution-applications/${id}/interview`, { method: 'PATCH', body: { scheduledAt, mode } });
      onFlash('Interview scheduled.', 'success');
      setInterviewFormFor(null);
      setInterviewForm({ date: '', mode: 'video' });
      load(institution._id);
    } catch (err) { onFlash(err.message); }
  }

  async function completeInterview(id) {
    try {
      await apiRequest(`/institution-applications/${id}/interview`, { method: 'PATCH', body: { completed: true } });
      onFlash('Interview marked completed.', 'success'); load(institution._id);
    } catch (err) { onFlash(err.message); }
  }

  function updateQuestion(index, patch) {
    setTestBuilder((current) => ({ ...current, questions: current.questions.map((q, i) => i === index ? { ...q, ...patch } : q) }));
  }

  async function createOnlineTest(e) {
    e.preventDefault();
    try {
      await apiRequest('/institution-applications/tests', { method: 'POST', body: { institution: institution._id, ...testBuilder, durationMinutes: Number(testBuilder.durationMinutes), passingPercent: Number(testBuilder.passingPercent), published: true, questions: testBuilder.questions.map((q) => ({ ...q, correctOption: Number(q.correctOption), marks: Number(q.marks) })) } });
      onFlash('Online admission test created and published.', 'success');
      setTestBuilder({ title: '', program: '', subject: '', instructions: '', durationMinutes: 30, passingPercent: 50, questions: [{ text: '', options: ['', '', '', ''], correctOption: 0, marks: 1 }] });
      load(institution._id);
    } catch (err) { onFlash(err.message); }
  }

  async function assignOnlineTest(applicationId) {
    try {
      await apiRequest(`/institution-applications/${applicationId}/test/assign`, { method: 'POST', body: { testId: assignment.testId, scheduledAt: new Date(assignment.scheduledAt).toISOString() } });
      onFlash('Online test assigned to applicant.', 'success');
      setAssignFor(null); setAssignment({ testId: '', scheduledAt: '' }); load(institution._id);
    } catch (err) { onFlash(err.message); }
  }

  if (institution === undefined) return <p role="status" className="admin-notice">Loading...</p>;
  if (!institution) return <p className="admin-notice">Register an institution first (My Institution tab).</p>;

  return (
    <div className="institution-ui institution-admissions-ui">
      <div className="admin-section">
        <div className="admin-section-heading"><div><h2>Programs, Departments & Degree Fees</h2><p>Institution defines the complete degree fee, installments and class section. Accepted students are assigned to this section and its courses.</p></div></div>
        <form onSubmit={createProgram} className="institution-form-grid">
          <label className="institution-field"><span>Program name</span><input className="form-input" placeholder="Program (e.g. BS Computer Science)" required value={programForm.name} onChange={(e) => setProgramForm({ ...programForm, name: e.target.value })} /></label>
          <label className="institution-field"><span>Department</span><input className="form-input" placeholder="Department" required value={programForm.department} onChange={(e) => setProgramForm({ ...programForm, department: e.target.value })} /></label>
          <label className="institution-field"><span>Class / section</span><select className="form-select" required value={programForm.classSection} onChange={(e) => setProgramForm({ ...programForm, classSection: e.target.value })}><option value="">Select class/section</option>{sections.map((s) => <option key={s._id} value={s._id}>{s.name} ({s.academicYear || 'year not set'})</option>)}</select></label>
          <label className="institution-field"><span>Number of terms</span><input className="form-input" type="number" min="1" placeholder="Terms" value={programForm.durationTerms} onChange={(e) => setProgramForm({ ...programForm, durationTerms: e.target.value })} style={{ maxWidth: 90 }} /></label>
          <label className="institution-field"><span>Admission fee</span><input className="form-input" type="number" min="0" placeholder="Admission fee" value={programForm.admissionFee} onChange={(e) => setProgramForm({ ...programForm, admissionFee: e.target.value })} /></label>
          <label className="institution-field"><span>Total degree tuition</span><input className="form-input" type="number" min="1" placeholder="Total degree tuition" required value={programForm.totalTuitionFee} onChange={(e) => setProgramForm({ ...programForm, totalTuitionFee: e.target.value })} /></label>
          <label className="institution-field"><span>Installments</span><input className="form-input" type="number" min="1" placeholder="Installments" value={programForm.installments} onChange={(e) => setProgramForm({ ...programForm, installments: e.target.value })} style={{ maxWidth: 110 }} /></label>
          <label className="institution-field"><span>Currency</span><input className="form-input" placeholder="Currency" value={programForm.currency} onChange={(e) => setProgramForm({ ...programForm, currency: e.target.value.toUpperCase() })} style={{ maxWidth: 90 }} /></label>
        <div className="institution-fee-options">
          {['exam', 'hostel', 'transport', 'library', 'activity'].map((type) => {
            const item = programForm.additionalFees[type];
            return <div key={type} className="institution-fee-option">
              <label className="flex gap-2 items-center text-sm"><input type="checkbox" checked={item.enabled} onChange={(e) => setProgramForm({ ...programForm, additionalFees: { ...programForm.additionalFees, [type]: { ...item, enabled: e.target.checked } } })} /> Charge {type.charAt(0).toUpperCase() + type.slice(1)} fee?</label>
              {item.enabled && <input className="form-input mt-2" type="number" min="0" placeholder={`${type} fee amount`} required value={item.amount} onChange={(e) => setProgramForm({ ...programForm, additionalFees: { ...programForm.additionalFees, [type]: { ...item, amount: e.target.value } } })} />}
              {type === 'hostel' && item.enabled && <>
                <input className="form-input mt-2" type="number" min="0" placeholder="Refundable security deposit" value={item.securityDeposit || ''} onChange={(e) => setProgramForm({ ...programForm, additionalFees: { ...programForm.additionalFees, hostel: { ...item, securityDeposit: e.target.value } } })} />
                <label className="flex gap-2 items-center text-xs mt-2"><input type="checkbox" checked={Boolean(item.messAvailable)} onChange={(e) => setProgramForm({ ...programForm, additionalFees: { ...programForm.additionalFees, hostel: { ...item, messAvailable: e.target.checked } } })} />Mess available</label>
                {item.messAvailable && <input className="form-input mt-2" type="number" min="0" placeholder="Monthly mess fee" value={item.messMonthlyAmount || ''} onChange={(e) => setProgramForm({ ...programForm, additionalFees: { ...programForm.additionalFees, hostel: { ...item, messMonthlyAmount: e.target.value } } })} />}
              </>}
            </div>;
          })}
        </div>
          <button type="submit" className="btn btn-primary">Save Program & Fee Rules</button>
        </form>
        <Table headers={['Program', 'Department', 'Section', 'Admission Fee', 'Complete Tuition', 'Additional Fees', 'Plan']} rows={programs.map((p) => [p.name, p.department, p.classSection?.name || '—', `${p.currency} ${p.admissionFee}`, `${p.currency} ${p.totalTuitionFee}`, Object.entries(p.additionalFees || {}).filter(([, value]) => value?.enabled).map(([type, value]) => `${type}: ${p.currency} ${value.amount}`).join(', ') || 'None', `${p.installments} installments / ${p.durationTerms} terms`])} empty="No program fee plan yet. Create this before accepting admissions." />
      </div>
      <div className="admin-section">
        <div className="admin-section-heading"><div><h2>Online Admission Test Builder</h2><p>Create one reusable test and assign it to applicants. MCQs are graded automatically.</p></div></div>
        <form onSubmit={createOnlineTest} className="institution-test-builder">
          <div className="institution-form-grid">
            <label className="institution-field"><span>Test title</span><input className="form-input" placeholder="Test title" value={testBuilder.title} onChange={(e) => setTestBuilder({ ...testBuilder, title: e.target.value })} required /></label>
            <label className="institution-field"><span>Program / grade</span><input className="form-input" placeholder="Program / Grade" value={testBuilder.program} onChange={(e) => setTestBuilder({ ...testBuilder, program: e.target.value })} /></label>
            <label className="institution-field"><span>Subject</span><input className="form-input" placeholder="Subject" value={testBuilder.subject} onChange={(e) => setTestBuilder({ ...testBuilder, subject: e.target.value })} /></label>
            <label className="institution-field"><span>Duration (minutes)</span><input className="form-input" type="number" min="1" max="240" aria-label="Duration minutes" value={testBuilder.durationMinutes} onChange={(e) => setTestBuilder({ ...testBuilder, durationMinutes: e.target.value })} style={{ maxWidth: 130 }} /></label>
            <label className="institution-field"><span>Passing score (%)</span><input className="form-input" type="number" min="0" max="100" aria-label="Passing percentage" value={testBuilder.passingPercent} onChange={(e) => setTestBuilder({ ...testBuilder, passingPercent: e.target.value })} style={{ maxWidth: 130 }} /></label>
          </div>
          <label className="institution-field"><span>Instructions</span><textarea className="form-input" rows={2} placeholder="Instructions" value={testBuilder.instructions} onChange={(e) => setTestBuilder({ ...testBuilder, instructions: e.target.value })} /></label>
          {testBuilder.questions.map((q, qi) => (
            <div key={qi} className="card institution-question-card">
              <div className="flex gap-2 items-center"><strong className="text-xs">Question {qi + 1}</strong>{testBuilder.questions.length > 1 && <button type="button" className="btn" onClick={() => setTestBuilder({ ...testBuilder, questions: testBuilder.questions.filter((_, i) => i !== qi) })}>Remove</button>}</div>
              <input className="form-input mt-2" placeholder="Question text" value={q.text} onChange={(e) => updateQuestion(qi, { text: e.target.value })} required />
              <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 8, marginTop: 8 }}>
                {q.options.map((option, oi) => <input key={oi} className="form-input" placeholder={`Option ${oi + 1}`} value={option} onChange={(e) => updateQuestion(qi, { options: q.options.map((v, i) => i === oi ? e.target.value : v) })} required />)}
              </div>
              <div className="flex gap-2 items-center mt-2"><span className="text-xs">Correct answer:</span><CustomSelect value={String(q.correctOption)} onChange={(v) => updateQuestion(qi, { correctOption: Number(v) })} ariaLabel="Correct answer" options={q.options.map((_, i) => ({ value: String(i), label: `Option ${i + 1}` }))} /><input className="form-input" type="number" min="1" aria-label="Question marks" value={q.marks} onChange={(e) => updateQuestion(qi, { marks: e.target.value })} style={{ maxWidth: 90 }} /></div>
            </div>
          ))}
          <div className="institution-form-actions"><button type="button" className="btn" onClick={() => setTestBuilder({ ...testBuilder, questions: [...testBuilder.questions, { text: '', options: ['', '', '', ''], correctOption: 0, marks: 1 }] })}>+ Add Question</button><button type="submit" className="btn btn-primary">Publish Test</button></div>
        </form>
      </div>
      <div className="admin-section">
        <div className="admin-section-heading"><div><h2>Offline Admission Entry</h2><p>Register a walk-in applicant who doesn't have an account yet.</p></div></div>
        <form onSubmit={addOffline} className="institution-form-grid institution-offline-grid">
          <label className="institution-field"><span>Applicant name</span><input className="form-input" placeholder="Applicant name" value={form.applicantName} onChange={(e) => setForm({ ...form, applicantName: e.target.value })} required /></label>
          <label className="institution-field"><span>Applicant email</span><input className="form-input" type="email" placeholder="Applicant email" value={form.applicantEmail} onChange={(e) => setForm({ ...form, applicantEmail: e.target.value })} required /></label>
          <label className="institution-field"><span>Program / grade</span><input className="form-input" placeholder="Program / Grade applying for" value={form.program} onChange={(e) => setForm({ ...form, program: e.target.value })} required /></label>
          <button type="submit" className="btn btn-primary">Add Entry</button>
        </form>
      </div>

      <Table
        headers={['Applicant', 'Program', 'Requested Services', 'Source', 'Test', 'Interview', 'Status', 'Actions']}
        rows={(apps || []).map((a) => [
          a.applicant?.fullName, a.program, [a.requestedServices?.hostel && 'Hostel', a.requestedServices?.transport && 'Transport'].filter(Boolean).join(', ') || 'None', a.source === 'front_desk' ? 'Offline' : 'Online',
          a.admissionTest?.scheduledAt ? (
            <div>
              <div>{new Date(a.admissionTest.scheduledAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}{a.admissionTest.subject ? ` · ${a.admissionTest.subject}` : ''}</div>
              {a.admissionTest.test && <div className="text-xs" style={{ fontWeight: 600 }}>Online · {a.admissionTest.status?.replace('_', ' ')}</div>}
              {a.admissionTest.score != null ? (
                <div style={{ fontWeight: 600 }}>Score: {a.admissionTest.score}/{a.admissionTest.maxScore}</div>
              ) : scoreFormFor === a._id ? (
                <div className="flex gap-1 items-center" style={{ marginTop: 4 }}>
                  <input className="form-input" type="number" placeholder="Score" style={{ padding: '4px 6px', fontSize: '0.72rem', width: 60 }} value={scoreForm.score} onChange={(e) => setScoreForm({ ...scoreForm, score: e.target.value })} />
                  <span>/</span>
                  <input className="form-input" type="number" placeholder="Max" style={{ padding: '4px 6px', fontSize: '0.72rem', width: 60 }} value={scoreForm.maxScore} onChange={(e) => setScoreForm({ ...scoreForm, maxScore: e.target.value })} />
                  <button className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '0.7rem' }} disabled={!scoreForm.score || !scoreForm.maxScore} onClick={() => recordTestScore(a._id, scoreForm.score, scoreForm.maxScore)}>Save</button>
                  <button className="btn" style={{ padding: '4px 8px', fontSize: '0.7rem' }} onClick={() => setScoreFormFor(null)}>Cancel</button>
                </div>
              ) : <button className="btn" style={{ padding: '2px 8px', fontSize: '0.7rem', marginTop: 4 }} onClick={() => setScoreFormFor(a._id)}>Enter Score</button>}
            </div>
          ) : a.admissionTest?.test ? 'Online test assigned' : (
            assignFor === a._id ? (
              <div style={{ display: 'grid', gap: 6, minWidth: 190 }}>
                <CustomSelect value={assignment.testId} onChange={(v) => setAssignment({ ...assignment, testId: v })} ariaLabel="Admission test" options={onlineTests.filter((t) => t.published).map((t) => ({ value: t._id, label: t.title }))} placeholder="Select online test" />
                <input type="datetime-local" className="form-input" value={assignment.scheduledAt} onChange={(e) => setAssignment({ ...assignment, scheduledAt: e.target.value })} />
                <div className="flex gap-1"><button type="button" className="btn btn-primary" disabled={!assignment.testId || !assignment.scheduledAt} onClick={() => assignOnlineTest(a._id)}>Assign</button><button type="button" className="btn" onClick={() => setAssignFor(null)}>Cancel</button></div>
              </div>
            ) : onlineTests.some((t) => t.published) ? <button type="button" className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '0.72rem' }} onClick={() => setAssignFor(a._id)}>Assign Online Test</button> : (
            testFormFor === a._id ? (
              <div style={{ display: 'grid', gap: 6, minWidth: 160 }}>
                <input type="datetime-local" className="form-input" style={{ padding: '4px 8px', fontSize: '0.72rem' }} value={testForm.date} onChange={(e) => setTestForm({ ...testForm, date: e.target.value })} />
                <input className="form-input" placeholder="Subject" style={{ padding: '4px 8px', fontSize: '0.72rem' }} value={testForm.subject} onChange={(e) => setTestForm({ ...testForm, subject: e.target.value })} />
                <div className="flex gap-1">
                  <button className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '0.72rem' }} disabled={!testForm.date} onClick={() => scheduleTest(a._id, new Date(testForm.date).toISOString(), testForm.subject)}>Save</button>
                  <button className="btn" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={() => setTestFormFor(null)}>Cancel</button>
                </div>
              </div>
            ) : <button className="btn" style={{ padding: '4px 8px', fontSize: '0.72rem' }} onClick={() => setTestFormFor(a._id)}>Schedule Manual Test</button>
            )
          ),
          a.interview?.scheduledAt ? <div>{new Date(a.interview.scheduledAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })} ({a.interview.mode === 'in_person' ? 'Physical' : 'Video'}){a.interview.completed ? <div className="text-xs" style={{ color: 'var(--emerald)', fontWeight: 700 }}>Completed</div> : <button type="button" className="btn mt-1" style={{ padding: '2px 8px', fontSize: '0.7rem' }} onClick={() => completeInterview(a._id)}>Mark Complete</button>}</div> : (
            interviewFormFor === a._id ? (
              <div style={{ display: 'grid', gap: 6, minWidth: 160 }}>
                <input type="datetime-local" className="form-input" style={{ padding: '4px 8px', fontSize: '0.72rem' }} value={interviewForm.date} onChange={(e) => setInterviewForm({ ...interviewForm, date: e.target.value })} />
                <select className="form-select" style={{ padding: '4px 8px', fontSize: '0.72rem' }} value={interviewForm.mode} onChange={(e) => setInterviewForm({ ...interviewForm, mode: e.target.value })}>
                  <option value="video">Video</option>
                  <option value="in_person">Physical</option>
                </select>
                <div className="flex gap-1">
                  <button className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '0.72rem' }} disabled={!interviewForm.date} onClick={() => scheduleInterview(a._id, new Date(interviewForm.date).toISOString(), interviewForm.mode)}>Save</button>
                  <button className="btn" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={() => setInterviewFormFor(null)}>Cancel</button>
                </div>
              </div>
            ) : <button className="btn" style={{ padding: '4px 8px', fontSize: '0.72rem' }} disabled={Boolean(a.admissionTest?.test && a.admissionTest.status !== 'passed')} title={a.admissionTest?.test && a.admissionTest.status !== 'passed' ? 'Applicant must pass the online test first' : ''} onClick={() => setInterviewFormFor(a._id)}>Schedule Interview</button>
          ),
          <Tag status={a.status === 'accepted' ? 'approved' : a.status === 'rejected' ? 'rejected' : 'pending'} label={a.status.replace('_', ' ')} />,
          ['accepted', 'rejected'].includes(a.status) ? '—' : (
            <div className="flex gap-1 flex-wrap">
              <button className="btn" style={{ padding: '4px 8px', fontSize: '0.72rem' }} onClick={() => setStatus(a._id, 'under_review')}>Review</button>
              <button className="btn" style={{ padding: '4px 8px', fontSize: '0.72rem' }} onClick={() => setStatus(a._id, 'waitlisted')}>Waitlist</button>
              <button className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '0.72rem' }} disabled={Boolean(a.admissionTest?.test && (a.admissionTest.status !== 'passed' || !a.interview?.completed))} title={a.admissionTest?.test && (a.admissionTest.status !== 'passed' || !a.interview?.completed) ? 'Pass the online test and complete the interview first' : ''} onClick={() => accept(a._id)}>Accept</button>
              <button className="btn" style={{ padding: '4px 8px', fontSize: '0.72rem', color: 'var(--rose)' }} onClick={() => setStatus(a._id, 'rejected')}>Reject</button>
            </div>
          )
        ])}
        empty="No admission applications yet."
      />
    </div>
  );
}

function InstitutionLibraryPanel({ onFlash }) {
  const institution = useMyInstitution(onFlash);
  const [books, setBooks] = useState(null);
  const [loans, setLoans] = useState(null);
  const [tab, setTab] = useUrlTab('institutionLibraryPanel', 'books');
  const [form, setForm] = useState({ title: '', author: '', isbn: '', category: 'book', copies: 1, fileUrl: '', finePerDay: 0 });
  const [borrowForm, setBorrowForm] = useState({});
  const [libraryBorrowers, setLibraryBorrowers] = useState([]);
  const [qrScannerOpen, setQrScannerOpen] = useState(false);
  const [qrLookup, setQrLookup] = useState('');
  const [scannedBook, setScannedBook] = useState(null);

  function load(instId) {
    apiRequest(`/institution-ops/${instId}/books`).then(setBooks).catch((err) => onFlash(err.message));
    apiRequest(`/institution-ops/${instId}/loans`).then(setLoans).catch((err) => onFlash(err.message));
    apiRequest(`/institution-ops/${instId}/library-borrowers`).then(setLibraryBorrowers).catch((err) => onFlash(err.message));
  }
  useEffect(() => { if (institution) load(institution._id); }, [institution]);

  async function addBook(e) {
    e.preventDefault();
    try {
      await apiRequest(`/institution-ops/${institution._id}/books`, { method: 'POST', body: { ...form, copies: Number(form.copies) } });
      onFlash('Book added.', 'success');
      setForm({ title: '', author: '', isbn: '', category: 'book', copies: 1, fileUrl: '', finePerDay: 0 });
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
      await apiRequest(`/institution-ops/books/${bookId}/borrow`, { method: 'POST', body: { borrower: f.borrower, dueDate: f.dueDate, finePerDay: Number(f.finePerDay || 0) } });
      onFlash('Book issued.', 'success');
      load(institution._id);
    } catch (err) { onFlash(err.message); }
  }

  async function returnLoan(loanId) {
    try { await apiRequest(`/institution-ops/loans/${loanId}/return`, { method: 'PATCH' }); onFlash('Book returned.', 'success'); load(institution._id); } catch (err) { onFlash(err.message); }
  }

  async function waiveFine(loanId) {
    const reason = await showPrompt('Reason for waiving this library fine:', 'Fine waived by institution');
    if (reason === null) return;
    try { await apiRequest(`/institution-ops/loans/${loanId}/waive-fine`, { method: 'PATCH', body: { reason } }); onFlash('Library fine waived.', 'success'); load(institution._id); } catch (err) { onFlash(err.message); }
  }

  async function lookupQr(rawValue) {
    const code = String(rawValue || '').trim().replace(/^careerz-library:/i, '');
    if (!code) return onFlash('Scan a book QR or enter its code.');
    try {
      const found = await apiRequest(`/institution-ops/${institution._id}/books/qr/${encodeURIComponent(code)}`);
      setScannedBook(found);
      setQrLookup(found.qrCode);
      setQrScannerOpen(false);
      onFlash(`${found.title} found. You can issue it below.`, 'success');
    } catch (err) { onFlash(err.message); }
  }

  if (institution === undefined) return <p role="status" className="admin-notice">Loading...</p>;
  if (!institution) return <p className="admin-notice">Register an institution first (My Institution tab).</p>;

  return (
    <div className="institution-ui institution-operations-ui institution-library-ui">
      <div className="flex gap-2 mb-3">
        <button className={`btn ${tab === 'books' ? 'btn-primary' : ''}`} onClick={() => setTab('books')}>Books</button>
        <button className={`btn ${tab === 'loans' ? 'btn-primary' : ''}`} onClick={() => setTab('loans')}>Borrowed / Loans</button>
      </div>
      {tab === 'books' ? (
        <>
          <section className="admin-card mb-3" style={{ padding: 16 }}>
            <div className="flex gap-2 items-center flex-wrap">
              <strong>Scan library QR</strong>
              <input className="form-input" placeholder="Scan or enter QR code" value={qrLookup} onChange={(e) => setQrLookup(e.target.value)} style={{ maxWidth: 300 }} />
              <button type="button" className="btn" onClick={() => lookupQr(qrLookup)}>Find resource</button>
              <button type="button" className="btn btn-primary" onClick={() => setQrScannerOpen((value) => !value)}>{qrScannerOpen ? 'Close camera' : 'Scan with camera'}</button>
            </div>
            {qrScannerOpen && <div style={{ marginTop: 12 }}><QrScanner onScan={lookupQr} hint="Point the camera at the QR sticker on the library resource." /></div>}
            {scannedBook && <div className="admin-notice" style={{ marginTop: 12 }}><strong>{scannedBook.title}</strong> · {scannedBook.category.replaceAll('_', ' ')} · {scannedBook.availableCopies}/{scannedBook.copies} available. Complete borrower, due date and fine in its highlighted catalog row, then press Issue.</div>}
          </section>
          <form onSubmit={addBook} className="institution-form-grid institution-operations-form">
            <label className="institution-field"><span>Resource title</span><input className="form-input" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></label>
            <label className="institution-field"><span>Author</span><input className="form-input" placeholder="Author" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} /></label>
            <label className="institution-field"><span>ISBN / catalog code</span><input className="form-input" placeholder="ISBN / catalog code" value={form.isbn} onChange={(e) => setForm({ ...form, isbn: e.target.value })} /></label>
            <label className="institution-field"><span>Category</span><select className="form-select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {['book', 'ebook', 'journal', 'research_paper', 'video', 'audio_lecture', 'slides', 'notes'].map((c) => <option key={c} value={c}>{c.replaceAll('_', ' ')}</option>)}
            </select></label>
            <label className="institution-field"><span>Number of copies</span><input className="form-input" type="number" min="0" placeholder="Copies" value={form.copies} onChange={(e) => setForm({ ...form, copies: e.target.value })} style={{ maxWidth: 100 }} /></label>
            <label className="institution-field"><span>Digital file URL (optional)</span><input className="form-input" type="url" placeholder="Digital file URL (optional)" value={form.fileUrl} onChange={(e) => setForm({ ...form, fileUrl: e.target.value })} /></label>
            <button type="submit" className="btn btn-primary">Add Book</button>
          </form>
          <Table
            headers={['Book', 'QR sticker', 'Borrow', '']}
            rows={(books || []).map((b) => [
              <div className="lib-book"><strong style={String(scannedBook?._id) === String(b._id) ? { color: 'var(--green)' } : undefined}>{b.title}</strong><small>{b.author || 'Author not added'}</small><span className="lib-book-tags"><span className="lib-chip">{b.category.replaceAll('_', ' ')}</span><span className={`lib-avail${b.availableCopies > 0 ? '' : ' none'}`}><strong>{b.availableCopies}</strong> of {b.copies} available</span></span></div>, <div className="lib-qr"><LibraryResourceQr code={b.qrCode} title={b.title} /></div>,
              <div className="lib-borrow">
                <label><span>Borrower</span><select className="form-select" value={borrowForm[b._id]?.borrower || ''} onChange={(e) => setBorrowForm({ ...borrowForm, [b._id]: { ...borrowForm[b._id], borrower: e.target.value } })}><option value="">Select borrower</option>{libraryBorrowers.map((student) => <option key={student.user._id} value={student.user._id}>{student.user.fullName} ({student.rollNumber || student.user.email})</option>)}</select></label>
                <label><span>Due date</span><input className="form-input" type="date" onChange={(e) => setBorrowForm({ ...borrowForm, [b._id]: { ...borrowForm[b._id], dueDate: e.target.value } })} /></label>
                <label><span>Fine per day</span><input className="form-input" type="number" min="0" placeholder="0" onChange={(e) => setBorrowForm({ ...borrowForm, [b._id]: { ...borrowForm[b._id], finePerDay: e.target.value } })} /></label>
                <button type="button" className="btn btn-primary" onClick={() => borrow(b._id)}>Issue book</button>
              </div>,
              <button type="button" className="btn staff-remove" onClick={() => removeBook(b._id)}>Remove</button>
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
            <div className="flex gap-1 flex-wrap">{l.status !== 'returned' && <button className="btn" style={{ padding: '4px 8px', fontSize: '0.72rem' }} onClick={() => returnLoan(l._id)}>Mark Returned</button>}{l.fineAmount > 0 && !l.fineWaived && <button className="btn" style={{ padding: '4px 8px', fontSize: '0.72rem' }} onClick={() => waiveFine(l._id)}>Waive fine</button>}</div>
          ])}
          empty="No loans yet."
        />
      )}
    </div>
  );
}

function LibraryResourceQr({ code, title }) {
  const [image, setImage] = useState('');
  useEffect(() => {
    let live = true;
    import('qrcode').then(({ default: QRCode }) => QRCode.toDataURL(`careerz-library:${code}`, { errorCorrectionLevel: 'M', margin: 1, width: 160 })).then((url) => { if (live) setImage(url); }).catch(() => {});
    return () => { live = false; };
  }, [code]);
  if (!image) return <span>{code}</span>;
  return <div style={{ display: 'grid', gap: 4, justifyItems: 'center' }}><img src={image} alt={`QR for ${title}`} width="96" height="96" /><small style={{ maxWidth: 110, overflowWrap: 'anywhere' }}>{code}</small><a href={image} download={`${title.replace(/[^a-z0-9]+/gi, '-')}-library-qr.png`} className="btn" style={{ padding: '3px 7px', fontSize: '.7rem' }}>Download sticker</a></div>;
}

function InstitutionHostelPanel({ onFlash }) {
  const institution = useMyInstitution(onFlash);
  const [rooms, setRooms] = useState(null);
  const [requests, setRequests] = useState(null);
  const [eligibleStudents, setEligibleStudents] = useState([]);
  const [tab, setTab] = useUrlTab('institutionHostelPanel', 'rooms');
  const [form, setForm] = useState({ building: '', roomNumber: '', floor: '', capacity: 2 });
  const [roomWarden, setRoomWarden] = useState(null);
  const [allocForm, setAllocForm] = useState({});

  function load(instId) {
    apiRequest(`/institution-ops/${instId}/hostel-rooms`).then(setRooms).catch((err) => onFlash(err.message));
    apiRequest(`/institution-ops/${instId}/hostel-requests`).then(setRequests).catch((err) => onFlash(err.message));
    apiRequest(`/institution-ops/${instId}/hostel-eligible-students`).then(setEligibleStudents).catch((err) => onFlash(err.message));
  }
  useEffect(() => { if (institution) load(institution._id); }, [institution]);

  async function addRoom(e) {
    e.preventDefault();
    try {
      await apiRequest(`/institution-ops/${institution._id}/hostel-rooms`, { method: 'POST', body: { ...form, capacity: Number(form.capacity), monthlyFee: 0, warden: roomWarden?._id || null } });
      onFlash('Room added.', 'success');
      setForm({ building: '', roomNumber: '', floor: '', capacity: 2 });
      setRoomWarden(null);
      load(institution._id);
    } catch (err) { onFlash(err.message); }
  }

  async function allocate(roomId) {
    const student = allocForm[roomId];
    if (!student) return onFlash('Select a student first.');
    try {
      await apiRequest(`/institution-ops/hostel-rooms/${roomId}/allocate`, { method: 'POST', body: { student } });
      onFlash('Student allocated.', 'success');
      load(institution._id);
    } catch (err) { onFlash(err.message); }
  }

  async function transfer(roomId) {
    const student = allocForm[roomId];
    if (!student) return onFlash('Select a student first.');
    try {
      await apiRequest(`/institution-ops/hostel-rooms/${roomId}/transfer`, { method: 'POST', body: { student } });
      onFlash('Student transferred.', 'success');
      load(institution._id);
    } catch (err) { onFlash(err.message); }
  }

  async function checkOut(roomId, userId) {
    const confirmed = await showConfirm('Check this student out of the hostel room?', { confirmLabel: 'Check out' });
    if (!confirmed) return;
    try {
      await apiRequest(`/institution-ops/hostel-rooms/${roomId}/occupants/${userId}`, { method: 'DELETE' });
      onFlash('Student checked out.', 'success');
      load(institution._id);
    } catch (err) { onFlash(err.message); }
  }

  async function decide(id, decision) {
    try { await apiRequest(`/institution-ops/hostel-requests/${id}`, { method: 'PATCH', body: { decision } }); onFlash(`Request ${decision}.`, 'success'); load(institution._id); } catch (err) { onFlash(err.message); }
  }

  if (institution === undefined) return <p role="status" className="admin-notice">Loading...</p>;
  if (!institution) return <p className="admin-notice">Register an institution first (My Institution tab).</p>;

  return (
    <div className="institution-ui institution-operations-ui institution-hostel-ui">
      <div className="flex gap-2 mb-3">
        <button className={`btn ${tab === 'rooms' ? 'btn-primary' : ''}`} onClick={() => setTab('rooms')}>Rooms</button>
        <button className={`btn ${tab === 'requests' ? 'btn-primary' : ''}`} onClick={() => setTab('requests')}>Visitor / Leave Requests</button>
        <button className={`btn ${tab === 'attendance' ? 'btn-primary' : ''}`} onClick={() => setTab('attendance')}>Attendance</button>
      </div>
      {tab === 'rooms' ? (
        <>
          <div className="admin-section" style={{ marginBottom: 16 }}>
            <div className="admin-section-heading"><div><h2>Hostel applicants</h2><p>Only students who selected hostel during admission appear here. Their hostel fee is already part of the admission fee-plan voucher.</p></div></div>
            <Table headers={['Student', 'Department / Program', 'Class', 'Roll No.', 'Hostel Fee', 'Room']} rows={eligibleStudents.map((student) => [student.user?.fullName, `${student.department || '—'} / ${student.program}`, student.classSection?.name || '—', student.rollNumber || '—', `${student.currency} ${student.hostelFee}`, student.allocatedRoom || 'Awaiting allocation'])} empty="No accepted student requested hostel during admission." />
          </div>
          <form onSubmit={addRoom} className="institution-form-grid institution-operations-form">
            <label className="institution-field"><span>Building</span><input className="form-input" placeholder="Building" value={form.building} onChange={(e) => setForm({ ...form, building: e.target.value })} /></label>
            <label className="institution-field"><span>Room number</span><input className="form-input" placeholder="Room number" value={form.roomNumber} onChange={(e) => setForm({ ...form, roomNumber: e.target.value })} required /></label>
            <label className="institution-field"><span>Floor</span><input className="form-input" placeholder="Floor" value={form.floor} onChange={(e) => setForm({ ...form, floor: e.target.value })} /></label>
            <label className="institution-field"><span>Capacity</span><input className="form-input" type="number" min="1" placeholder="Capacity" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} style={{ maxWidth: 100 }} required /></label>
            <label className="text-xs">Warden<PersonPicker selected={roomWarden} onPick={setRoomWarden} onClear={() => setRoomWarden(null)} placeholder="Search warden by name/email" /></label>
            <button type="submit" className="btn btn-primary">Add Room</button>
          </form>
          <Table
            headers={['Room', 'Warden', 'Beds', 'Occupants', 'Allocate / Transfer']}
            rows={(rooms || []).map((r) => [
              <div className="lib-book"><strong>{r.roomNumber}</strong><small>{r.building || 'Building not set'}</small></div>, r.warden?.fullName || <small style={{ color: 'var(--ink-soft)' }}>No warden</small>,
              <div className="hostel-beds"><span><strong>{(r.occupants || []).length}</strong> of {r.capacity} filled</span><span className="hostel-bar"><span style={{ width: `${Math.min(100, ((r.occupants || []).length / Math.max(1, r.capacity)) * 100)}%` }} /></span><span><Tag status={r.status === 'full' ? 'pending' : 'approved'} label={r.status} /></span></div>,
              (r.occupants || []).length
                ? <div className="hostel-occupants">{(r.occupants || []).map((o) => (
                    <span key={o._id} className="hostel-occupant">
                      {o.fullName}
                      <button type="button" onClick={() => checkOut(r._id, o._id)} title={`Check out ${o.fullName}`}>Check out</button>
                    </span>
                  ))}</div>
                : <small style={{ color: 'var(--ink-soft)' }}>Empty</small>,
              <div className="hostel-alloc">
                <select className="form-select" aria-label="Hostel applicant" value={allocForm[r._id] || ''} onChange={(e) => setAllocForm({ ...allocForm, [r._id]: e.target.value })}>
                  <option value="">Select hostel applicant</option>
                  {eligibleStudents.map((student) => <option key={student.user?._id} value={student.user?._id}>{student.user?.fullName} — {student.department || student.program} — {student.rollNumber || 'No roll'}{student.allocatedRoom ? ` — Room ${student.allocatedRoom}` : ''}</option>)}
                </select>
                {r.status !== 'full' && <button type="button" className="btn btn-primary" onClick={() => allocate(r._id)}>Allocate</button>}
                <button type="button" className="btn" onClick={() => transfer(r._id)} title="Move a student who already has a different room here">Transfer In</button>
              </div>
            ])}
            empty="No hostel rooms added yet."
          />
        </>
      ) : tab === 'requests' ? (
        <Table
          headers={['Student', 'Room', 'Type', 'Details', 'Status', 'Reviewed by']}
          rows={(requests || []).map((r) => [
            r.student?.fullName, r.room?.roomNumber, r.type,
            r.type === 'visitor' ? `${r.visitorName} (${r.visitorRelation})` : `${new Date(r.fromDate).toLocaleDateString()} – ${new Date(r.toDate).toLocaleDateString()}: ${r.reason}`,
            <Tag status={r.status === 'approved' ? 'approved' : r.status === 'rejected' ? 'rejected' : 'pending'} label={r.status} />,
            r.reviewedBy?.fullName || (r.status === 'pending' ? 'Awaiting assigned warden' : 'Warden')
          ])}
          empty="No visitor/leave requests yet."
        />
      ) : (
        <HostelAttendanceSection rooms={rooms || []} onFlash={onFlash} readOnly />
      )}
    </div>
  );
}

// Bulk-mark every occupant's attendance for one room + date in one submit (spec gap: "Hostel
// attendance missing").
function HostelAttendanceSection({ rooms, onFlash, readOnly = false }) {
  const [roomId, setRoomId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [statuses, setStatuses] = useState({});
  const [records, setRecords] = useState(null);
  const room = rooms.find((r) => r._id === roomId);

  useEffect(() => {
    if (!roomId) { setRecords(null); return; }
    setRecords(null);
    apiRequest(`/institution-ops/hostel-rooms/${roomId}/attendance?date=${date}`).then((saved) => {
      setRecords(saved);
      setStatuses(Object.fromEntries(saved.map((record) => [record.student?._id || record.student, record.status])));
    }).catch((err) => onFlash(err.message));
  }, [roomId, date, onFlash]);

  async function submit() {
    if (!room || (room.occupants || []).length === 0) return onFlash('This room has no occupants.');
    const entries = room.occupants.map((o) => ({ student: o._id, status: statuses[o._id] || 'present' }));
    try {
      await apiRequest(`/institution-ops/hostel-rooms/${roomId}/attendance`, { method: 'POST', body: { date, entries } });
      onFlash('Attendance recorded.', 'success');
      setRecords(await apiRequest(`/institution-ops/hostel-rooms/${roomId}/attendance?date=${date}`)); return true;
    } catch (err) { onFlash(err.message); }
  }

  return (
    <div>
      <div className="flex gap-3 items-end mb-3 flex-wrap">
        <label className="text-xs">Room
          <select className="form-select" style={{ marginTop: 4 }} value={roomId} onChange={(e) => setRoomId(e.target.value)}>
            <option value="">Select room</option>
            {rooms.map((r) => <option key={r._id} value={r._id}>{r.roomNumber}</option>)}
          </select>
        </label>
        <label className="text-xs">Date<input type="date" className="form-input" style={{ marginTop: 4 }} value={date} onChange={(e) => setDate(e.target.value)} /></label>

      </div>
      {room && records!==null && (room.occupants || []).length > 0 && (
<SavedForm key={roomId+date+Boolean(records?.length)} saved={Boolean(records?.length)} canEdit={!readOnly} value={statuses} onRestore={setStatuses} onSubmit={submit}><Table
          headers={['Student', 'Status', 'Saved record']}
          rows={room.occupants.map((o) => {
            const existing = (records || []).find((rec) => (rec.student?._id || rec.student) === o._id);
            return [
              o.fullName,
              <select disabled={readOnly} className="form-select" style={{ padding: '4px 6px', fontSize: '0.72rem' }} value={statuses[o._id] || existing?.status || 'present'} onChange={(e) => setStatuses((s) => ({ ...s, [o._id]: e.target.value }))}>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="on_leave">On Leave</option>
              </select>,
              existing
                ? <div><Tag status={existing.status === 'present' ? 'approved' : existing.status === 'absent' ? 'rejected' : 'pending'} label={existing.status.replace('_', ' ')} /><div className="text-xs" style={{ marginTop: 4, color: 'var(--ink-soft)' }}>{existing.date} · by {existing.markedBy?.fullName || 'Institution staff'} · {new Date(existing.updatedAt).toLocaleString()}</div></div>
                : <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>Not recorded for {date}</span>
            ];
          })}
          empty="No occupants in this room."
        /><button type="submit" className="btn btn-primary">Save Attendance</button></SavedForm>
      )}
      {room && records?.length > 0 && <p className="admin-notice" style={{ marginTop: 12 }}>Saved attendance loaded for <strong>{date}</strong>. {readOnly ? 'Institution monitoring is read-only; the assigned warden records daily attendance.' : 'Use Edit to update this saved record. Saving updates it without creating a duplicate.'}</p>}
      {room && readOnly && records?.length === 0 && <p className="admin-notice" style={{ marginTop: 12 }}>No attendance has been recorded by the assigned warden for <strong>{date}</strong>.</p>}
    </div>
  );
}

// Warden Dashboard — every room where the logged-in user is the designated warden, across every
// institution, plus that room's pending requests (spec gap: "Warden Dashboard nahi").
function WardenDashboardPanel({ onFlash }) {
  const [data, setData] = useState(null);
  function load() { apiRequest('/institution-ops/hostel/warden-dashboard').then(setData).catch((err) => onFlash(err.message)); }
  useEffect(load, [onFlash]);

  async function decide(id, decision) {
    try { await apiRequest(`/institution-ops/hostel-requests/${id}`, { method: 'PATCH', body: { decision } }); onFlash(`Request ${decision}.`, 'success'); load(); } catch (err) { onFlash(err.message); }
  }

  if (data === null) return <p className="admin-notice">Loading...</p>;
  if ((data.rooms || []).length === 0) return <p className="admin-notice">You are not the designated warden of any hostel room.</p>;

  return (
    <div>
      <h4 className="font-semibold mb-2" style={{ fontSize: '0.9rem' }}>Your Rooms</h4>
      <Table
        headers={['Institution', 'Room', 'Building', 'Occupants']}
        rows={data.rooms.map((r) => [r.institution?.name, r.roomNumber, r.building || '—', (r.occupants || []).map((o) => o.fullName).join(', ') || '—'])}
        empty="No rooms assigned."
      />
      <h4 className="font-semibold mt-6 mb-2" style={{ fontSize: '0.9rem' }}>Pending Requests</h4>
      <Table
        headers={['Student', 'Room', 'Type', 'Details', 'Action']}
        rows={(data.pendingRequests || []).map((r) => [
          r.student?.fullName, r.room?.roomNumber, r.type,
          r.type === 'visitor' ? `${r.visitorName} (${r.visitorRelation})` : `${new Date(r.fromDate).toLocaleDateString()} – ${new Date(r.toDate).toLocaleDateString()}: ${r.reason}`,
          <div className="flex gap-1">
            <button className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '0.72rem' }} onClick={() => decide(r._id, 'approved')}>Approve</button>
            <button className="btn" style={{ padding: '4px 8px', fontSize: '0.72rem' }} onClick={() => decide(r._id, 'rejected')}>Reject</button>
          </div>
        ])}
        empty="No pending requests."
      />
      <h4 className="font-semibold mt-6 mb-2" style={{ fontSize: '0.9rem' }}>Daily Attendance</h4>
      <HostelAttendanceSection rooms={data.rooms || []} onFlash={onFlash} />
      <WardenSalaryPanel onFlash={onFlash} />
    </div>
  );
}

function WardenSalaryPanel({ onFlash }) {
  const [payslips, setPayslips] = useState(null);
  function load() {
    setPayslips(null);
    apiRequest('/teachers/me/payslips')
      .then(setPayslips)
      .catch((err) => {
        setPayslips([]);
        onFlash(err.message);
      });
  }
  useEffect(load, [onFlash]);
  async function decide(payslip, decision) {
    let rejectionReason = '';
    if (decision === 'reject') {
      rejectionReason = await showPrompt('Why was this salary payment not received?', { title: 'Reject Salary Payment', required: true });
      if (!rejectionReason?.trim()) return;
    }
    try {
      await apiRequest(`/teachers/me/payslips/${payslip._id}/verify-payment`, { method: 'PATCH', body: { decision, rejectionReason } });
      onFlash(decision === 'verify' ? 'Salary receipt confirmed.' : 'Salary payment rejected.', 'success');
      load();
    } catch (err) { onFlash(err.message); }
  }
  return <div style={{ marginTop: 28 }}>
    <h4 className="font-semibold mb-2" style={{ fontSize: '0.9rem' }}>My Salary & Payslips</h4>
    <Table loading={payslips === null} headers={['Institution', 'Period', 'Net Salary', 'Status', 'Payment', 'Action']} rows={(payslips || []).map((p) => [
      p.institution?.name || '—', `${p.month}/${p.year}`, `${p.currency} ${Number(p.netAmount || 0).toLocaleString()}`,
      <Tag status={p.status === 'paid' ? 'approved' : p.status === 'rejected' ? 'rejected' : 'pending'} label={p.status} />,
      p.paymentMethod ? `${p.paymentMethod.replaceAll('_', ' ')}${p.paymentReference ? ` · ${p.paymentReference}` : ''}` : 'Not paid yet',
      p.status === 'processing' ? <div className="flex gap-1"><button className="btn btn-primary" onClick={() => decide(p, 'verify')}>Confirm received</button><button className="btn" onClick={() => decide(p, 'reject')}>Not received</button></div> : p.status === 'pending' ? 'Awaiting institution payment' : p.status === 'paid' ? `Paid ${p.paidAt ? new Date(p.paidAt).toLocaleDateString() : ''}` : '—'
    ])} empty="No salary payslip has been generated for you yet. The institution must generate payroll first." />
  </div>;
}

function InstitutionTransportPanel({ onFlash }) {
  const institution = useMyInstitution(onFlash);
  const [vehicles, setVehicles] = useState(null);
  const [form, setForm] = useState({ vehicleNumber: '', type: 'bus', capacity: '', driverName: '', driverPhone: '', routeName: '', monthlyFee: '' });
  const [vehicleDriver, setVehicleDriver] = useState(null);
  const [assignForm, setAssignForm] = useState({});
  const [managing, setManaging] = useState(null); // vehicleId currently expanded

  function load(instId) {
    apiRequest(`/institution-ops/${instId}/vehicles`).then(setVehicles).catch((err) => onFlash(err.message));
  }
  useEffect(() => {
    if (!institution) return undefined;
    load(institution._id);
    const timer = setInterval(() => load(institution._id), 10000);
    return () => clearInterval(timer);
  }, [institution]);

  async function addVehicle(e) {
    e.preventDefault();
    try {
      await apiRequest(`/institution-ops/${institution._id}/vehicles`, { method: 'POST', body: { ...form, capacity: Number(form.capacity) || 0, monthlyFee: Number(form.monthlyFee) || 0, driverUser: vehicleDriver?._id || null } });
      onFlash('Vehicle added.', 'success');
      setForm({ vehicleNumber: '', type: 'bus', capacity: '', driverName: '', driverPhone: '', routeName: '', monthlyFee: '' });
      setVehicleDriver(null);
      load(institution._id);
    } catch (err) { onFlash(err.message); }
  }

  async function removeVehicle(id) {
    try { await apiRequest(`/institution-ops/vehicles/${id}`, { method: 'DELETE' }); onFlash('Vehicle removed.', 'success'); load(institution._id); } catch (err) { onFlash(err.message); }
  }

  async function assign(vehicleId) {
    const student = assignForm[vehicleId];
    if (!student) return onFlash('Select a student first.');
    try {
      await apiRequest(`/institution-ops/vehicles/${vehicleId}/assign`, { method: 'POST', body: { student } });
      onFlash('Student assigned.', 'success');
      load(institution._id);
    } catch (err) { onFlash(err.message); }
  }

  async function unassign(vehicleId, userId) {
    const confirmed = await showConfirm('Remove this student from the vehicle?', { confirmLabel: 'Remove' });
    if (!confirmed) return;
    try {
      await apiRequest(`/institution-ops/vehicles/${vehicleId}/students/${userId}`, { method: 'DELETE' });
      onFlash('Student removed.', 'success');
      load(institution._id);
    } catch (err) { onFlash(err.message); }
  }

  async function generateTransportFees(vehicle) {
    const reason = await showPrompt('Monthly transport charge note/reason shown to students:', { title: `Generate ${vehicle.vehicleNumber} Transport Fees`, placeholder: 'Regular monthly transport service', confirmLabel: 'Generate', required: true });
    if (!reason?.trim()) return;
    try {
      const result = await apiRequest(`/institution-ops/vehicles/${vehicle._id}/generate-monthly-fees`, { method: 'POST', body: { reason } });
      onFlash(`Transport fees generated: ${result.generated}; already generated: ${result.skipped}.`, 'success');
    } catch (err) { onFlash(err.message); }
  }

  async function changeTransportFee(vehicle) {
    const amount = await showPrompt('Enter the new monthly transport fee:', { title: `Update ${vehicle.vehicleNumber} Fee`, defaultValue: String(vehicle.monthlyFee || 0), required: true });
    if (amount === null || !Number.isFinite(Number(amount)) || Number(amount) < 0) return onFlash('Enter a valid fee amount.');
    let feeChangeReason = '';
    if (Number(amount) > Number(vehicle.monthlyFee || 0)) {
      feeChangeReason = await showPrompt('Why is the transport fee increasing? This reason will be shown to affected students.', { title: 'Fee Increase Reason', required: true });
      if (!feeChangeReason?.trim()) return;
    }
    try {
      await apiRequest(`/institution-ops/vehicles/${vehicle._id}`, { method: 'PATCH', body: { monthlyFee: Number(amount), feeChangeReason } });
      onFlash('Monthly transport fee updated.', 'success');
      load(institution._id);
    } catch (err) { onFlash(err.message); }
  }

  if (institution === undefined) return <p role="status" className="admin-notice">Loading...</p>;
  if (!institution) return <p className="admin-notice">Register an institution first (My Institution tab).</p>;

  return (
    <div className="institution-ui institution-operations-ui institution-transport-ui">
      <form onSubmit={addVehicle} className="institution-form-grid institution-operations-form">
        <label className="institution-field"><span>Vehicle number</span><input className="form-input" placeholder="Vehicle number" value={form.vehicleNumber} onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value })} required /></label>
        <label className="institution-field"><span>Vehicle type</span><select className="form-select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
          {['bus', 'van', 'car'].map((t) => <option key={t} value={t}>{t}</option>)}
        </select></label>
        <label className="institution-field"><span>Capacity</span><input className="form-input" type="number" placeholder="Capacity" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} style={{ maxWidth: 100 }} /></label>
        <label className="institution-field"><span>Driver name</span><input className="form-input" placeholder="Driver name" value={form.driverName} onChange={(e) => setForm({ ...form, driverName: e.target.value })} /></label>
        <label className="institution-field"><span>Driver phone</span><input className="form-input" placeholder="Driver phone" value={form.driverPhone} onChange={(e) => setForm({ ...form, driverPhone: e.target.value })} /></label>
        <label className="institution-field"><span>Route name</span><input className="form-input" placeholder="Route name" value={form.routeName} onChange={(e) => setForm({ ...form, routeName: e.target.value })} /></label>
        <label className="institution-field"><span>Monthly fee</span><input className="form-input" type="number" placeholder="Monthly fee" value={form.monthlyFee} onChange={(e) => setForm({ ...form, monthlyFee: e.target.value })} style={{ maxWidth: 120 }} /></label>
        <label className="text-xs">Driver account (optional)<PersonPicker selected={vehicleDriver} onPick={setVehicleDriver} onClear={() => setVehicleDriver(null)} placeholder="Search driver by name/email" /></label>
        <button type="submit" className="btn btn-primary">Add Vehicle</button>
      </form>
      {(vehicles || []).length === 0 ? <p className="admin-notice">No vehicles added yet.</p> : <div className="vehicle-list">
        {(vehicles || []).map((v) => (
          <article key={v._id} className="vehicle-card">
            <div className="vehicle-card-top">
              <div className="lib-book"><strong>{v.vehicleNumber}</strong><span className="lib-book-tags"><span className="lib-chip">{v.type}</span></span></div>
              <div className="lib-book"><span>{v.routeName || 'Route not set'}</span><small>{v.driverName ? <>Driver: {v.driverName}{v.driverPhone ? <> · <span style={{ whiteSpace: 'nowrap' }}>{v.driverPhone}</span></> : null}</> : 'No driver'}</small></div>
              <div className="vehicle-card-actions">
                <button type="button" className="btn btn-primary" onClick={() => generateTransportFees(v)}>Generate Monthly Fee</button>
                <button type="button" className="btn" onClick={() => changeTransportFee(v)}>Change Fee</button>
                <button type="button" className="btn" onClick={() => setManaging(managing === v._id ? null : v._id)}>{managing === v._id ? 'Close' : 'Manage'}</button>
                <button type="button" className="btn staff-remove" onClick={() => removeVehicle(v._id)}>Remove</button>
              </div>
            </div>
            <div className="vehicle-card-bottom">
              <div className="vehicle-card-section"><h5>Students ({(v.assignedStudents || []).length})</h5>
                {(v.assignedStudents || []).length
                  ? <div className="hostel-occupants">{(v.assignedStudents || []).map((s) => (
                      <span key={s._id} className="hostel-occupant vehicle-student">
                        {s.fullName}
                        <button type="button" onClick={() => unassign(v._id, s._id)} title={`Remove ${s.fullName}`}>Remove</button>
                      </span>
                    ))}</div>
                  : <small style={{ color: 'var(--ink-soft)' }}>No students yet</small>}
              </div>
              <div className="vehicle-card-section"><h5>Assign a student</h5>
                <div className="vehicle-assign">
                  <InstitutionStudentSelect institutionId={institution._id} value={assignForm[v._id]} onChange={(val) => setAssignForm({ ...assignForm, [v._id]: val })} />
                  <button type="button" className="btn btn-primary" onClick={() => assign(v._id)}>Assign</button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>}

      {managing && vehicles?.find((v) => v._id === managing) && (
        <VehicleManageSection vehicle={vehicles.find((v) => v._id === managing)} onFlash={onFlash} onSaved={() => load(institution._id)} />
      )}

      <h4 className="font-semibold mt-6 mb-2" style={{ fontSize: '0.9rem' }}>Live Vehicle Monitor</h4>
      <p className="text-xs mb-3" style={{ color: 'var(--ink-soft)' }}>Read-only monitoring. The assigned driver starts and ends the journey and their device shares GPS automatically.</p>
      <div className="space-y-3">
        {(vehicles || []).map((v) => {
          const journey = v.activeJourney;
          return (
            <div key={v._id} className={`card vehicle-monitor${journey ? ' live' : ''}`}>
              <div className="flex items-center justify-between flex-wrap" style={{ gap: 8 }}>
                <div className="lib-book"><strong>{v.vehicleNumber}</strong><span>{v.routeName || 'Route not configured'}</span><small>Driver: {v.driverName || 'Not assigned'}</small></div>
                {journey ? <span className="vehicle-state live"><span aria-hidden="true" />Live now</span> : <span className="vehicle-state"><span aria-hidden="true" />Not on the road</span>}
              </div>
              {journey && <LiveTransportMap ping={journey.lastPing} vehicle={v} title={`${v.vehicleNumber} institution monitor`} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Staff generates a scannable QR the assigned students can self-scan to confirm boarding/exiting
// (spec gap: "QR generate/scan ... backend mein hai, UI mein nahi"), plus a manual staff-confirm
// fallback for students without a working camera.
function BoardingQrSection({ journeyId, vehicle, onFlash }) {
  const [qr, setQr] = useState(null);
  const [boardStudent, setBoardStudent] = useState('');

  async function generateQr() {
    try {
      const res = await apiRequest(`/transport/journeys/${journeyId}/qr`, { method: 'GET' });
      const QRCode = (await import('qrcode')).default;
      const image = await QRCode.toDataURL(JSON.stringify({ token: res.token }), { errorCorrectionLevel: 'M', margin: 1, width: 220 });
      setQr({ image, expiresAt: res.expiresAt, token: res.token });
    } catch (err) { onFlash(err.message); }
  }

  async function confirmBoard(event) {
    if (!boardStudent) return onFlash('Select a student first.');
    try {
      await apiRequest(`/transport/journeys/${journeyId}/board`, { method: 'POST', body: { studentId: boardStudent, event } });
      onFlash(`Recorded: ${event}.`, 'success');
    } catch (err) { onFlash(err.message); }
  }

  return (
    <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--sand-line)' }}>
      <h4 className="font-semibold" style={{ fontSize: '1rem' }}>Student Boarding Attendance</h4>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14, marginTop: 10 }}>
        <section style={{ padding: 14, border: '1px solid var(--sand-line)', borderRadius: 14 }}>
          <strong className="text-sm">1. Student scans QR</strong>
          <p className="text-xs" style={{ color: 'var(--ink-soft)', margin: '4px 0 10px' }}>Show this code. The student opens My Transport, chooses Boarding or Leaving, and scans it.</p>
          <button type="button" className="btn btn-primary" style={{ padding: '7px 14px', fontSize: '0.8rem' }} onClick={generateQr}>{qr ? 'Generate New QR' : 'Show Boarding QR'}</button>
          {qr && <div style={{ marginTop: 10 }}>
            <img src={qr.image} alt="Boarding QR" width={190} height={190} />
            <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>Valid until {new Date(qr.expiresAt).toLocaleTimeString()}.</p>
            <div style={{ marginTop: 8, padding: 10, border: '1px dashed var(--sand-line)', borderRadius: 10 }}>
              <strong className="text-xs">Same-device testing code</strong>
              <div className="flex gap-2 items-center flex-wrap" style={{ marginTop: 5 }}><code style={{ wordBreak: 'break-all', flex: 1 }}>{qr.token}</code><button type="button" className="btn" onClick={() => navigator.clipboard.writeText(qr.token).then(() => onFlash('Boarding code copied.', 'success'))}>Copy Code</button></div>
            </div>
          </div>}
        </section>
        <section style={{ padding: 14, border: '1px solid var(--sand-line)', borderRadius: 14 }}>
          <strong className="text-sm">2. Driver manual fallback</strong>
          <p className="text-xs" style={{ color: 'var(--ink-soft)', margin: '4px 0 10px' }}>Use only when the student's phone or camera cannot scan the QR.</p>
        <select className="form-select" style={{ padding: '4px 6px', fontSize: '0.72rem' }} value={boardStudent} onChange={(e) => setBoardStudent(e.target.value)}>
          <option value="">Select student</option>
          {(vehicle.assignedStudents || []).map((s) => <option key={s._id} value={s._id}>{s.fullName}</option>)}
        </select>
          <div className="flex gap-2" style={{ marginTop: 10 }}><button type="button" className="btn" onClick={() => confirmBoard('boarded')}>Mark Boarded</button><button type="button" className="btn" onClick={() => confirmBoard('exited')}>Mark Exited</button></div>
        </section>
      </div>
    </div>
  );
}

// Manage routes/stops, driver account, insurance/fitness dates, fuel logs and maintenance history
// for one vehicle — everything the Transport table's row-level fields don't fit (spec gaps:
// "Routes ka separate management nahi", "Fuel management missing", "maintenance/fitness/insurance
// records nahi").
function VehicleManageSection({ vehicle, onFlash, onSaved }) {
  const [stops, setStops] = useState((vehicle.stopPoints || []).map((s) => ({ name: s.name || '', time: s.time || '' })));
  const [insuranceExpiry, setInsuranceExpiry] = useState(vehicle.insuranceExpiry ? vehicle.insuranceExpiry.slice(0, 10) : '');
  const [fitnessExpiry, setFitnessExpiry] = useState(vehicle.fitnessExpiry ? vehicle.fitnessExpiry.slice(0, 10) : '');
  const [fuelLogs, setFuelLogs] = useState(null);
  const [maintLogs, setMaintLogs] = useState(null);
  const [fuelForm, setFuelForm] = useState({ liters: '', costPerLiter: '', odometerReading: '' });
  const [maintForm, setMaintForm] = useState({ type: 'service', description: '', cost: '', nextDueDate: '' });

  function loadLogs() {
    apiRequest(`/institution-ops/vehicles/${vehicle._id}/fuel-logs`).then(setFuelLogs).catch(() => {});
    apiRequest(`/institution-ops/vehicles/${vehicle._id}/maintenance-logs`).then(setMaintLogs).catch(() => {});
  }
  useEffect(loadLogs, [vehicle._id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function saveStopsAndDates() {
    try {
      await apiRequest(`/institution-ops/vehicles/${vehicle._id}`, { method: 'PATCH', body: { stopPoints: stops.filter((s) => s.name.trim()), insuranceExpiry: insuranceExpiry || null, fitnessExpiry: fitnessExpiry || null } });
      onFlash('Route/vehicle details saved.', 'success');
      onSaved();
      return true;
    } catch (err) { onFlash(err.message); }
  }

  async function addFuelLog() {
    if (!fuelForm.liters || !fuelForm.costPerLiter) return onFlash('Enter liters and cost per liter.');
    try {
      await apiRequest(`/institution-ops/vehicles/${vehicle._id}/fuel-logs`, { method: 'POST', body: { liters: Number(fuelForm.liters), costPerLiter: Number(fuelForm.costPerLiter), odometerReading: fuelForm.odometerReading ? Number(fuelForm.odometerReading) : null } });
      setFuelForm({ liters: '', costPerLiter: '', odometerReading: '' });
      onFlash('Fuel log recorded.', 'success');
      loadLogs();
    } catch (err) { onFlash(err.message); }
  }

  async function addMaintLog() {
    try {
      await apiRequest(`/institution-ops/vehicles/${vehicle._id}/maintenance-logs`, { method: 'POST', body: { ...maintForm, cost: Number(maintForm.cost) || 0, nextDueDate: maintForm.nextDueDate || null } });
      setMaintForm({ type: 'service', description: '', cost: '', nextDueDate: '' });
      onFlash('Maintenance record added.', 'success');
      loadLogs();
      onSaved();
    } catch (err) { onFlash(err.message); }
  }

  return (
    <div className="card" style={{ padding: 16, marginBottom: 16 }}>
      <strong className="text-sm">Manage {vehicle.vehicleNumber}</strong>

<SavedForm key={vehicle._id} value={{stops,insuranceExpiry,fitnessExpiry}} onRestore={v=>{setStops(v.stops);setInsuranceExpiry(v.insuranceExpiry);setFitnessExpiry(v.fitnessExpiry);}} onSubmit={saveStopsAndDates}>      <h5 className="font-semibold mt-4 mb-2" style={{ fontSize: '0.82rem' }}>Route Stops</h5>
      {stops.map((s, i) => (
        <div key={i} className="flex gap-2 mb-2 items-end">
          <input className="form-input" placeholder="Stop name" value={s.name} onChange={(e) => setStops(stops.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} />
          <input className="form-input" placeholder="Time (e.g. 7:30 AM)" value={s.time} onChange={(e) => setStops(stops.map((x, j) => j === i ? { ...x, time: e.target.value } : x))} />
          <button type="button" className="btn" style={{ padding: '4px 8px', fontSize: '0.72rem' }} onClick={() => setStops(stops.filter((_, j) => j !== i))}>Remove</button>
        </div>
      ))}
      <button type="button" className="btn" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={() => setStops([...stops, { name: '', time: '' }])}>Add Stop</button>

      <h5 className="font-semibold mt-4 mb-2" style={{ fontSize: '0.82rem' }}>Insurance / Fitness</h5>
      <div className="flex gap-3 flex-wrap">
        <label className="text-xs">Insurance Expiry<input type="date" className="form-input" style={{ marginTop: 4 }} value={insuranceExpiry} onChange={(e) => setInsuranceExpiry(e.target.value)} /></label>
        <label className="text-xs">Fitness Expiry<input type="date" className="form-input" style={{ marginTop: 4 }} value={fitnessExpiry} onChange={(e) => setFitnessExpiry(e.target.value)} /></label>
      </div>
      <button type="submit" className="btn btn-primary mt-3">Save Route / Dates</button>

</SavedForm>      <h5 className="font-semibold mt-6 mb-2" style={{ fontSize: '0.82rem' }}>Fuel Log</h5>
      <div className="flex gap-2 items-end flex-wrap mb-2">
        <input className="form-input" type="number" placeholder="Liters" style={{ width: 100 }} value={fuelForm.liters} onChange={(e) => setFuelForm({ ...fuelForm, liters: e.target.value })} />
        <input className="form-input" type="number" placeholder="Cost/Liter" style={{ width: 100 }} value={fuelForm.costPerLiter} onChange={(e) => setFuelForm({ ...fuelForm, costPerLiter: e.target.value })} />
        <input className="form-input" type="number" placeholder="Odometer" style={{ width: 110 }} value={fuelForm.odometerReading} onChange={(e) => setFuelForm({ ...fuelForm, odometerReading: e.target.value })} />
        <button type="button" className="btn" style={{ padding: '5px 12px', fontSize: '0.75rem' }} onClick={addFuelLog}>Add Fuel Log</button>
      </div>
      <Table headers={['Date', 'Liters', 'Cost/L', 'Total', 'Odometer']} rows={(fuelLogs || []).map((f) => [new Date(f.date).toLocaleDateString(), f.liters, f.costPerLiter, f.totalCost, f.odometerReading ?? '—'])} empty="No fuel logs yet." />

      <h5 className="font-semibold mt-6 mb-2" style={{ fontSize: '0.82rem' }}>Maintenance History</h5>
      <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>Last service: {vehicle.lastServiceDate ? new Date(vehicle.lastServiceDate).toLocaleDateString() : '—'} · Next due: {vehicle.nextServiceDue ? new Date(vehicle.nextServiceDue).toLocaleDateString() : '—'}</p>
      <div className="flex gap-2 items-end flex-wrap mb-2" style={{ marginTop: 8 }}>
        <select className="form-select" value={maintForm.type} onChange={(e) => setMaintForm({ ...maintForm, type: e.target.value })}>
          {['service', 'repair', 'inspection', 'insurance_renewal', 'fitness_renewal', 'other'].map((t) => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
        </select>
        <input className="form-input" placeholder="Description" value={maintForm.description} onChange={(e) => setMaintForm({ ...maintForm, description: e.target.value })} />
        <input className="form-input" type="number" placeholder="Cost" style={{ width: 100 }} value={maintForm.cost} onChange={(e) => setMaintForm({ ...maintForm, cost: e.target.value })} />
        <label className="text-xs">Next due<input type="date" className="form-input" style={{ marginTop: 4 }} value={maintForm.nextDueDate} onChange={(e) => setMaintForm({ ...maintForm, nextDueDate: e.target.value })} /></label>
        <button type="button" className="btn" style={{ padding: '5px 12px', fontSize: '0.75rem' }} onClick={addMaintLog}>Add Record</button>
      </div>
      <Table headers={['Date', 'Type', 'Description', 'Cost', 'Next Due']} rows={(maintLogs || []).map((m) => [new Date(m.date).toLocaleDateString(), m.type, m.description || '—', m.cost, m.nextDueDate ? new Date(m.nextDueDate).toLocaleDateString() : '—'])} empty="No maintenance records yet." />
    </div>
  );
}

// Driver Dashboard — every vehicle this logged-in user is the assigned driverUser for; they can
// start/end journeys, send location pings and trigger SOS without any institution staff role
// (spec gap: "dedicated Driver Dashboard/App nahi").
function DriverDashboardPanel({ onFlash }) {
  const [vehicles, setVehicles] = useState(null);
  const [journeys, setJourneys] = useState({});
  const [gpsState, setGpsState] = useState({});
  const gpsWatches = useRef({});
  const lastSent = useRef({});

  function load() {
    apiRequest('/institution-ops/transport/my-vehicles').then((rows) => {
      setVehicles(rows);
      setJourneys(Object.fromEntries(rows.map((v) => [v._id, v.activeJourney || null])));
    }).catch((err) => onFlash(err.message));
  }
  useEffect(() => {
    load();
    return () => Object.values(gpsWatches.current).forEach((id) => navigator.geolocation?.clearWatch(id));
  }, [onFlash]);

  function stopGps(vehicleId) {
    if (gpsWatches.current[vehicleId] != null) navigator.geolocation.clearWatch(gpsWatches.current[vehicleId]);
    delete gpsWatches.current[vehicleId];
  }

  function shareDeviceGps(vehicleId, journey) {
    if (!navigator.geolocation) return onFlash('This device/browser does not support GPS location.');
    stopGps(vehicleId);
    setGpsState((prev) => ({ ...prev, [vehicleId]: { status: 'requesting' } }));
    gpsWatches.current[vehicleId] = navigator.geolocation.watchPosition(async (position) => {
      const ping = { lat: position.coords.latitude, lng: position.coords.longitude, heading: position.coords.heading, speed: position.coords.speed, at: new Date().toISOString() };
      setGpsState((prev) => ({ ...prev, [vehicleId]: { status: 'sharing', ping, accuracy: position.coords.accuracy } }));
      setJourneys((prev) => ({ ...prev, [vehicleId]: { ...(prev[vehicleId] || journey), lastPing: ping } }));
      if (Date.now() - (lastSent.current[vehicleId] || 0) < 5000) return;
      lastSent.current[vehicleId] = Date.now();
      try {
        await apiRequest(`/transport/journeys/${journey._id}/ping`, { method: 'POST', body: { lat: ping.lat, lng: ping.lng } });
      } catch (err) { setGpsState((prev) => ({ ...prev, [vehicleId]: { ...prev[vehicleId], status: 'error', error: err.message } })); }
    }, (error) => {
      const message = error.code === 1 ? 'Location permission denied. Allow location access in the browser and try again.' : `GPS unavailable: ${error.message}`;
      setGpsState((prev) => ({ ...prev, [vehicleId]: { status: 'error', error: message } }));
      onFlash(message);
    }, { enableHighAccuracy: true, maximumAge: 3000, timeout: 15000 });
  }

  async function startJourney(vehicleId) {
    try {
      const journey = await apiRequest(`/transport/vehicles/${vehicleId}/journeys/start`, { method: 'POST' });
      setJourneys((prev) => ({ ...prev, [vehicleId]: journey }));
      shareDeviceGps(vehicleId, journey);
      onFlash('Journey started — parents notified.', 'success');
    } catch (err) { onFlash(err.message); }
  }
  async function endJourney(vehicleId) {
    const journey = journeys[vehicleId];
    if (!journey) return;
    try {
      await apiRequest(`/transport/journeys/${journey._id}/end`, { method: 'PATCH' });
      stopGps(vehicleId);
      setJourneys((prev) => ({ ...prev, [vehicleId]: null }));
      onFlash('Journey ended.', 'success');
    } catch (err) { onFlash(err.message); }
  }
  async function sendSos(vehicleId) {
    const journey = journeys[vehicleId];
    if (!journey) return onFlash('Start a journey first.');
    const message = await showPrompt('Describe the emergency.', { title: 'Send emergency alert', required: true, danger: true, confirmLabel: 'Send SOS' });
    if (message === null) return;
    try {
      await apiRequest(`/transport/journeys/${journey._id}/sos`, { method: 'POST', body: { message } });
      onFlash('Emergency alert sent.', 'success');
    } catch (err) { onFlash(err.message); }
  }

  if (vehicles === null) return <p className="admin-notice">Loading...</p>;
  if (vehicles.length === 0) return <p className="admin-notice">You are not the assigned driver of any vehicle.</p>;

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {vehicles.map((v) => {
        const journey = journeys[v._id];
        return (
          <div key={v._id} className="card" style={{ padding: 16 }}>
            <div className="flex items-center justify-between flex-wrap" style={{ gap: 8 }}>
              <div>
                <strong className="text-sm">{v.vehicleNumber} — {v.routeName || 'No route'} {journey && <span style={{ color: 'var(--rose)' }}>● Live</span>}</strong>
                <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>{v.institution?.name} · {(v.assignedStudents || []).length} students</p>
                {(v.stopPoints || []).length > 0 && <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>Route: {(v.stopPoints || []).map((s) => s.name).join(' → ')}</p>}
              </div>
              {journey && <span style={{ color: 'var(--rose)', fontWeight: 800 }}>● Navigation active</span>}
            </div>
            {!journey && (
              <div style={{ marginTop: 14, padding: 18, border: '1px solid var(--sand-line)', borderRadius: 14, textAlign: 'center' }}>
                <p className="text-sm" style={{ marginBottom: 10 }}>Start the journey to enable GPS navigation and live institution tracking.</p>
                <button type="button" className="btn btn-primary" style={{ padding: '12px 24px', fontWeight: 800 }} onClick={() => startJourney(v._id)}>▶ Start Journey & Navigation</button>
              </div>
            )}
            {journey && (
              <div style={{ marginTop: 10 }}>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs" style={{ color: gpsState[v._id]?.status === 'sharing' ? 'var(--green)' : 'var(--ink-soft)', fontWeight: 700 }}>
                    {gpsState[v._id]?.status === 'sharing' ? `GPS sharing automatically · accuracy ±${Math.round(gpsState[v._id].accuracy || 0)}m` : gpsState[v._id]?.status === 'requesting' ? 'Waiting for GPS permission…' : gpsState[v._id]?.error || 'GPS sharing is paused'}
                  </span>
                  {gpsState[v._id]?.status !== 'sharing' && <button type="button" className="btn btn-primary" style={{ padding: '5px 12px', fontSize: '0.78rem' }} onClick={() => shareDeviceGps(v._id, journey)}>Enable Live GPS</button>}
                </div>
                <div style={{ position: 'relative' }}>
                  <LiveTransportMap ping={gpsState[v._id]?.ping || journey.lastPing} vehicle={v} navigation title={`${v.vehicleNumber} driver navigation`} />
                  <div className="flex gap-2" style={{ position: 'absolute', zIndex: 1200, right: 18, bottom: 66 }}>
                    <button type="button" style={{ border: 0, borderRadius: 999, padding: '12px 18px', background: '#ffffff', color: '#10231f', boxShadow: '0 3px 12px #0005', fontWeight: 800, cursor: 'pointer' }} onClick={() => endJourney(v._id)}>■ End Journey</button>
                    <button type="button" style={{ border: 0, borderRadius: 999, padding: '12px 18px', background: '#ffffff', color: '#c94f43', boxShadow: '0 3px 12px #0005', fontWeight: 800, cursor: 'pointer' }} onClick={() => sendSos(v._id)}>SOS</button>
                  </div>
                </div>
                <BoardingQrSection journeyId={journey._id} vehicle={v} onFlash={onFlash} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function InstitutionAiAssistantPanel({ onFlash }) {
  const [institutions,setInstitutions]=useState([]),[id,setId]=useState(''),[status,setStatus]=useState(null);
  const [insights,setInsights]=useState(''),[dataSummary,setDataSummary]=useState(''),[details,setDetails]=useState(null),[reports,setReports]=useState([]),[meta,setMeta]=useState(null),[loading,setLoading]=useState(false),[error,setError]=useState('');
  useEffect(()=>{apiRequest('/institution-ops/community/institutions').then(list=>{const manageable=list.filter(i=>i.canManage);setInstitutions(manageable);setId(manageable[0]?._id||'');}).catch(e=>setError(e.message));},[]);
  useEffect(()=>{let alive=true;setStatus(null);setInsights('');setDataSummary('');setDetails(null);setMeta(null);setReports([]);if(id){apiRequest('/ai/institutions/'+id+'/config').then(s=>{if(alive)setStatus(s);}).catch(e=>{if(alive)setError(e.message);});apiRequest('/institutions/'+id+'/ai-insights/reports').then(list=>{if(alive)setReports(list);}).catch(()=>{});}return()=>{alive=false;};},[id]);
  const loadReports=()=>apiRequest('/institutions/'+id+'/ai-insights/reports').then(setReports).catch(()=>{});
  function show(r){setInsights(r.insights);setDataSummary(r.dataSummary||'');setDetails(r.details||null);setMeta({reportId:r.reportId,createdAt:r.createdAt,generatedBy:r.generatedBy,provider:r.provider,model:r.model});}
  async function openReport(reportId){setError('');try{show(await apiRequest('/institutions/'+id+'/ai-insights/reports/'+reportId));}catch(e){setError(e.message);onFlash(e.message);}}
  async function deleteReport(r){if(!(await showConfirm('Delete the report from '+new Date(r.createdAt).toLocaleString()+'? This cannot be undone.',{confirmLabel:'Delete report'})))return;try{await apiRequest('/institutions/'+id+'/ai-insights/reports/'+r._id,{method:'DELETE'});if(meta?.reportId===r._id){setInsights('');setDetails(null);setDataSummary('');setMeta(null);}loadReports();onFlash('Report deleted.');}catch(e){onFlash(e.message);}}
  async function generate(){setLoading(true);setError('');try{const r=await apiRequest('/institutions/'+id+'/ai-insights',{method:'POST'});show({...r,generatedBy:'You',provider:status?.text?.provider,model:status?.text?.model});loadReports();onFlash('Report generated and saved.');}catch(e){setError(e.message);onFlash(e.message);}finally{setLoading(false);}}
  return <section className="institution-ui institution-remaining-ui institution-ai-ui"><header className="ops-page-heading"><span aria-hidden="true"><FaRobot /></span><div><h2>AI Operations Assistant</h2><p>Turn institution records into useful insights and reviewed actions.</p></div></header><label>Institution<select className="form-select" disabled={loading} value={id} onChange={e=>{setError('');setId(e.target.value);}}>{institutions.map(i=><option key={i._id} value={i._id}>{i.name}</option>)}</select></label>
    {error&&<p role="alert">{error}</p>}{id&&<AiSettingsPanel key={id} institutionId={id} purposes={[AI_PURPOSES[0]]} onFlash={onFlash} onChanged={()=>apiRequest('/ai/institutions/'+id+'/config').then(setStatus)} />}
    <div className="ops-insights-intro"><span className="ops-eyebrow">Understand your institution</span><h3>Insights from your records</h3><p>Builds a detailed report from your real records: who paid or owes which fee, each student's attendance and results by class, staff check-ins, payroll and open tickets, with names, departments and roles. Decisions remain yours; missing data is identified, never guessed.</p>
    <button className="btn btn-primary" disabled={loading||!id||!status?.text.configured} onClick={generate}>{loading?'Analyzing…':'Generate Insights'}</button></div>
    {id&&!status?.text.configured&&<p>Connect the institution text provider above first.</p>}
    {id&&<InstitutionAssistantActions key={'act-'+id} institutionId={id} enabled={!!status?.text.configured} onFlash={onFlash} />}
    {reports.length>0&&<div className="ops-saved-reports"><h3>Saved reports ({reports.length})</h3><ul>{reports.map(r=><li key={r._id} className={meta?.reportId===r._id?'active':''}><span><strong>{new Date(r.createdAt).toLocaleString()}</strong> · by {r.generatedBy}{r.provider?' · '+r.provider+(r.model?' / '+r.model:''):''}</span><span><button type="button" className="btn" onClick={()=>openReport(r._id)} disabled={meta?.reportId===r._id}>{meta?.reportId===r._id?'Viewing':'View'}</button><button type="button" className="btn" onClick={()=>deleteReport(r)}>Delete</button></span></li>)}</ul></div>}
    {insights&&<><h3>AI report</h3>{meta&&<p className="text-xs">Generated {new Date(meta.createdAt).toLocaleString()} by {meta.generatedBy}{meta.provider?' using '+meta.provider+(meta.model?' / '+meta.model:''):''}. Saved — the records below are as they were at that time.</p>}<AiReport text={insights} />{details&&<OpsRecordTables details={details} />}<details><summary>Raw data sent to the AI</summary><pre style={{whiteSpace:'pre-wrap'}}>{dataSummary}</pre></details><button className="btn" onClick={()=>{const blob=new Blob([insights+'\n\n'+dataSummary],{type:'text/plain'});const url=URL.createObjectURL(blob);const anchor=document.createElement('a');anchor.href=url;anchor.download='institution-ai-report.md';anchor.click();URL.revokeObjectURL(url);}}>Download report</button></>}
  </section>;
}

// Master spec Part 17E "Subscription System" — Free/Basic/Professional/Enterprise. A paid plan
// is a real JazzCash-paid 30-day period (see subscription.controller.js); nothing here is a fake
// "trust me" toggle. Only the institution owner can change plans — staff can view.
function InstitutionSubscriptionPanel({ onFlash }) {
  const institution = useMyInstitution(onFlash);
  const [data, setData] = useState(null);
  const [busyPlan, setBusyPlan] = useState(null);

  function load(id) {
    apiRequest(`/subscriptions/institutions/${id}`).then(setData).catch((err) => onFlash(err.message));
  }
  useEffect(() => { if (institution) load(institution._id); }, [institution]);

  // Redirects to JazzCash; the owner comes back to the dashboard with the result and the plan
  // is active as soon as JazzCash confirms the payment.
  async function upgrade(planKey) {
    setBusyPlan(planKey);
    try { await startPreferredCheckout(`/subscriptions/institutions/${institution._id}/checkout`, { plan: planKey }); } catch (err) { onFlash?.(err.message); setBusyPlan(null); }
  }

  if (institution === undefined) return <p role="status" className="admin-notice">Loading...</p>;
  if (!institution) return <p className="admin-notice">Register an institution first (My Institution tab).</p>;
  if (!data) return <p role="status" className="admin-notice">Loading subscription...</p>;

  const plans = data.allPlans;
  const planOrder = ['free', 'basic', 'professional', 'enterprise'];

  return (
    <div className="institution-ui institution-remaining-ui institution-subscription-ui">
      <div className="admin-section">
        <div className="admin-section-heading">
          <div>
            <h2>Subscription Plan</h2>
            <p>Current plan: <strong style={{ textTransform: 'capitalize' }}>{data.activePlan}</strong>
              {data.subscription?.currentPeriodEnd && data.activePlan !== 'free'
                ? ` — renews/expires ${new Date(data.subscription.currentPeriodEnd).toLocaleDateString()}`
                : ''}
            </p>
          </div>
          <FaStar aria-hidden="true" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="card" style={{ padding: 14 }}>
            <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>Students</p>
            <p style={{ fontWeight: 700 }}>{data.usage.students} (unlimited on every plan)</p>
          </div>
          <div className="card" style={{ padding: 14 }}>
            <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>Staff seats</p>
            <p style={{ fontWeight: 700 }}>{data.usage.staff} / {data.planDetails.maxStaff ?? 'Unlimited'}</p>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16 }}><AdFreeCard institution={institution} onFlash={onFlash} /></div>

      <div className="admin-section" style={{ marginTop: 16 }}>
        <div className="admin-section-heading"><div><h2>Optional plans</h2><p>CareerZ core access remains free. Paid packages are optional 30-day upgrades paid with JazzCash. Renew by paying again; an expired plan never disables an institution.</p></div></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {planOrder.map((key) => {
            const plan = plans[key];
            const isCurrent = data.activePlan === key;
            return (
              <div key={key} className="card" style={{ padding: 16, border: isCurrent ? '2px solid var(--forest-deep)' : undefined }}>
                <h4 style={{ margin: 0 }}>{plan.label}</h4>
                <p style={{ fontSize: 22, fontWeight: 700, margin: '6px 0' }}>{plan.monthlyPriceUSD > 0 ? `$${plan.monthlyPriceUSD}` : 'Free'}{plan.monthlyPriceUSD > 0 ? <span style={{ fontSize: 12, fontWeight: 400 }}>/30 days</span> : null}</p>
                <ul style={{ fontSize: 12, color: 'var(--ink-soft)', paddingLeft: 16, margin: '8px 0' }}>
                  <li>Unlimited students</li>
                  <li>{plan.maxStaff ?? 'Unlimited'} staff seats</li>
                  <li>{plan.aiInstitutionKey ? 'Institution AI key' : 'No institution AI key'}</li>
                </ul>
                {isCurrent
                  ? <span className="tag approved">Current plan</span>
                  : key === 'free'
                    ? null
                    : <ManualPayButton kind="subscription" id={institution._id} query={{ plan: key }} label="Upgrade (bank transfer)" onFlash={onFlash} onDone={() => load(institution._id)} />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function InstitutionCampusLifePanel({ onFlash }) {
  const [institution, setInstitution] = useState(null);
  const [section, setSection] = useUrlTab('institutionCampusLifePanel', 'newsletter');
  const [newsletters, setNewsletters] = useState(null);
  const [nlForm, setNlForm] = useState({ title: '', content: '' });
  const [submissions, setSubmissions] = useState(null);
  const [expandedSubmission, setExpandedSubmission] = useState(null);
  const [polls, setPolls] = useState(null);
  const [pollForm, setPollForm] = useState({ question: '', options: ['', ''] });

  useEffect(() => {
    apiRequest('/institutions/mine/list').then((list) => setInstitution(list[0] || null)).catch((err) => onFlash(err.message));
  }, [onFlash]);

  function loadNewsletters(instId) {
    apiRequest(`/newsletters/mine?institution=${instId}`).then(setNewsletters).catch((err) => onFlash(err.message));
  }
  function loadSubmissions(instId) {
    apiRequest(`/magazine/institution?institutionId=${instId}`).then(setSubmissions).catch((err) => onFlash(err.message));
  }
  function loadPolls() {
    apiRequest('/polls/mine').then(setPolls).catch((err) => onFlash(err.message));
  }
  useEffect(() => {
    if (!institution) return;
    if (section === 'newsletter') loadNewsletters(institution._id);
    if (section === 'magazine') loadSubmissions(institution._id);
    if (section === 'polls') loadPolls();
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
    let editorNotes;
    if (status === 'changes_requested') {
      editorNotes = await showPrompt('Tell the student exactly what needs to change before you can accept this.', { title: 'Request changes', placeholder: 'e.g. Add a stronger conclusion, fix formatting…', confirmLabel: 'Send request', required: true });
      if (editorNotes === null) return;
    }
    try {
      await apiRequest(`/magazine/${id}/review`, { method: 'PATCH', body: { status, editorNotes } });
      onFlash(`Submission ${status.replace('_', ' ')}.`, 'success');
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
  function updatePollOption(i, value) {
    setPollForm((f) => ({ ...f, options: f.options.map((o, idx) => (idx === i ? value : o)) }));
  }
  async function createInstitutionPoll(e) {
    e.preventDefault();
    const options = pollForm.options.map((o) => o.trim()).filter(Boolean);
    if (options.length < 2) return onFlash('Add at least 2 options.');
    try {
      await apiRequest('/polls', { method: 'POST', body: { institution: institution._id, question: pollForm.question, options } });
      onFlash('Institution-wide poll created.', 'success');
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

  if (!institution) return <p className="admin-notice">Register an institution first (My Institution tab).</p>;

  return (
    <div className="institution-ui institution-remaining-ui institution-publishing-ui">
      <h3 className="font-semibold mb-2">Newsletter & Magazine</h3>
      <div className="flex gap-2 mb-4 flex-wrap">
        <button type="button" className={`btn ${section === 'newsletter' ? 'btn-primary' : ''}`} onClick={() => setSection('newsletter')}>Newsletter</button>
        <button type="button" className={`btn ${section === 'polls' ? 'btn-primary' : ''}`} onClick={() => setSection('polls')}>Institution Polls</button>
        <button type="button" className={`btn ${section === 'magazine' ? 'btn-primary' : ''}`} onClick={() => setSection('magazine')}>Student Magazine</button>
      </div>

      {section === 'newsletter' && (
        <div>
          <form onSubmit={createNewsletter} className="nl-form">
            <div className="nl-form-head"><h4>Write a newsletter</h4><p>Saved as a draft first. Publish it from the list below when it is ready.</p></div>
            <label className="institution-field"><span>Title</span><input className="form-input" placeholder="Title" value={nlForm.title} onChange={(e) => setNlForm({ ...nlForm, title: e.target.value })} required /></label>
            <label className="institution-field"><span>Content</span><textarea className="form-input" placeholder="Content" rows={5} value={nlForm.content} onChange={(e) => setNlForm({ ...nlForm, content: e.target.value })} required /></label>
            <div className="nl-form-foot"><button type="submit" className="btn btn-primary">Save Draft</button></div>
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

      {section === 'polls' && (
        <div>
          <form onSubmit={createInstitutionPoll} className="nl-form">
            <p className="nl-note">Reaches every student across the whole institution (not just one class).</p>
            <label className="institution-field"><span>Poll question</span><input className="form-input" placeholder="Poll question" value={pollForm.question} onChange={(e) => setPollForm({ ...pollForm, question: e.target.value })} required /></label>
            <div className="institution-field"><span>Answer options</span><div className="poll-options">{pollForm.options.map((o, i) => (
              <label key={i} className="poll-option"><span aria-hidden="true">{i + 1}</span><input className="form-input" aria-label={`Option ${i + 1}`} placeholder={`Option ${i + 1}`} value={o} onChange={(e) => updatePollOption(i, e.target.value)} /></label>
            ))}</div></div>
            <div className="nl-actions">
              <button type="button" className="btn" onClick={() => setPollForm((f) => ({ ...f, options: [...f.options, ''] }))}>+ Add option</button>
              <button type="submit" className="btn btn-primary">Create Institution-Wide Poll</button>
            </div>
          </form>
          <Table
            loading={polls === null}
            headers={['Class', 'Question', 'Votes / %', 'Status', 'Action']}
            rows={(polls || []).map((p) => [
              p.course?.title || 'Institution-wide',
              p.question,
              <div className="poll-results">{p.options.map((o, i) => <div key={i}><span className="poll-results-label"><span>{o.text}</span><strong>{o.votes} · {o.percent}%</strong></span><span className="hostel-bar"><span style={{ width: `${Math.min(100, Number(o.percent) || 0)}%` }} /></span></div>)}</div>,
              <Tag status={p.status === 'closed' ? 'rejected' : 'approved'} label={p.status} />,
              p.status === 'open' ? <button className="btn" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => closePoll(p._id)}>Close</button> : '—'
            ])}
            empty="You haven't created any polls yet."
          />
        </div>
      )}

      {section === 'magazine' && (
        <div>
          {submissions === null && <p className="admin-notice">Loading...</p>}
          {submissions?.length === 0 && <p className="admin-notice">No submissions yet.</p>}
          <div style={{ display: 'grid', gap: 10 }}>
            {(submissions || []).map((s) => {
              const STATUS_TAG = { published: 'approved', rejected: 'rejected', selected: 'approved', changes_requested: 'pending', submitted: 'pending' };
              const open = expandedSubmission === s._id;
              return (
                <div key={s._id} className="border border-[var(--sand-line)] rounded-xl p-3">
                  <div className="flex items-center justify-between flex-wrap" style={{ gap: 8 }}>
                    <div>
                      <strong className="text-sm">{s.title}</strong>
                      <p className="text-xs" style={{ color: 'var(--ink-soft)', margin: '2px 0 0' }}>{s.student?.fullName || '—'} · {s.type}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tag status={STATUS_TAG[s.status]} label={s.status.replace('_', ' ')} />
                      <button type="button" className="btn" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={() => setExpandedSubmission(open ? null : s._id)}>{open ? 'Hide' : 'View'}</button>
                    </div>
                  </div>
                  {open && (
                    <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--sand-line)' }}>
                      {s.imageUrl && <img src={s.imageUrl} alt="" style={{ maxWidth: '100%', maxHeight: 240, borderRadius: 10, marginBottom: 10 }} />}
                      <p className="text-sm" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{s.content}</p>
                      {s.editorNotes && <p className="text-xs" style={{ color: 'var(--gold)', marginTop: 8 }}>Notes: {s.editorNotes}</p>}
                    </div>
                  )}
                  <div className="flex gap-1 flex-wrap" style={{ marginTop: 10 }}>
                    {s.status === 'submitted' && (
                      <>
                        <button className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => reviewSubmission(s._id, 'selected')}>Select</button>
                        <button className="btn" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => reviewSubmission(s._id, 'changes_requested')}>Request Changes</button>
                        <button className="btn" style={{ padding: '4px 10px', fontSize: '0.75rem', background: 'var(--sand-line)' }} onClick={() => reviewSubmission(s._id, 'rejected')}>Reject</button>
                      </>
                    )}
                    {s.status === 'selected' && <button className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => publishSubmission(s._id)}>Publish</button>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function InstitutionStaffPanel({ onFlash }) {
  const [institution, setInstitution] = useState(null);
  // Role catalogue with each role's starting permissions (backend utils/staffRoles.js).
  const [roleCatalog, setRoleCatalog] = useState({ roles: [], permissions: [] });
  const [people, setPeople] = useState({ staff: [], suspended: [] });
  // Find a staff member quickly in a long list: by name, email, title or department, and by role.
  const [staffQuery, setStaffQuery] = useState(''), [staffRoleFilter, setStaffRoleFilter] = useState('');
  const [staffLog, setStaffLog] = useState([]);
  const loadRoles = (id) => apiRequest(`/institutions/staff-roles${id ? `?institution=${id}` : ''}`).then(setRoleCatalog).catch(() => {});
  useEffect(() => { loadRoles(institution?._id); if (institution?._id) { apiRequest(`/institutions/${institution._id}/staff-people`).then(setPeople).catch(() => setPeople({ staff: [], suspended: [] })); apiRequest(`/institutions/${institution._id}/staff-history`).then(setStaffLog).catch(() => setStaffLog([])); } }, [institution]); // eslint-disable-line react-hooks/exhaustive-deps
  const personOf = (id) => [...people.staff, ...people.suspended].find((p) => String(p.user) === String(id));
  const roleLabel = (key) => roleCatalog.roles.find((r) => r.key === key)?.label || key;
  const permissionLabel = (key) => roleCatalog.permissions.find((x) => x.key === key)?.label || key;
  async function changeRole(staff, role) {
    try {
      await apiRequest(`/institutions/${institution._id}/staff/${staff.user}`, { method: 'PATCH', body: { role } });
      onFlash(`Role changed to ${roleLabel(role)}; permissions set for that role.`, 'success');
      load();
    } catch (err) { onFlash(err.message); }
  }
  const [form, setForm] = useState({ userId: '', role: 'teacher', department: '', designation: '', canApprove: false, canUseAi: false, canManageAi: false });
  const [selectedStaffUser, setSelectedStaffUser] = useState(null);

  function load() {
    apiRequest('/institutions/mine/list').then((list) => setInstitution(list[0] || null)).catch((err) => onFlash(err.message));
  }
  useEffect(load, []);

  async function addStaffMember(e) {
    e.preventDefault();
    if (!form.userId) return onFlash('Choose the staff member: search their name or email and pick them from the list.');
    try {
      // The role's starting permissions plus any AI access ticked here.
      const preset = roleCatalog.roles.find((r) => r.key === form.role)?.permissions || [];
      const permissions = [...new Set([
        ...preset,
        ...(form.canApprove ? ['application:approve'] : []),
        ...(form.canUseAi || form.canManageAi ? ['ai:use'] : []),
        ...(form.canManageAi ? ['ai:manage'] : [])
      ])];
      await apiRequest(`/institutions/${institution._id}/staff`, { method: 'POST', body: { userId: form.userId.trim(), role: form.role, department: form.department, designation: form.designation, permissions } });
      onFlash('Staff member added.', 'success');
      setForm({ userId: '', role: 'teacher', department: '', designation: '', canApprove: false, canUseAi: false, canManageAi: false });
      setSelectedStaffUser(null);
      load();
    } catch (err) { onFlash(err.message); }
  }
  async function removeStaffMember(userId) {
    if (!(await showConfirm(`Remove ${personOf(userId)?.fullName || 'this staff member'} from your staff? Their access ends now.`))) return;
    try {
      await apiRequest(`/institutions/${institution._id}/staff/${userId}`, { method: 'DELETE' });
      onFlash('Staff member removed.', 'success');
      load();
    } catch (err) { onFlash(err.message); }
  }
  // Suspend: access stops but role and permissions are kept for when they come back (master 5.6).
  async function suspendStaffMember(userId) {
    const reason = await showPrompt(`Why is ${personOf(userId)?.fullName || 'this staff member'} suspended? They will see this.`, { title: 'Suspend staff member' });
    if (reason === null || reason === undefined) return;
    try { await apiRequest(`/institutions/${institution._id}/staff/${userId}/suspend`, { method: 'POST', body: { reason } }); onFlash('Staff member suspended.', 'success'); load(); } catch (err) { onFlash(err.message); }
  }
  async function reinstateStaffMember(userId) {
    try { await apiRequest(`/institutions/${institution._id}/staff/${userId}/reinstate`, { method: 'POST' }); onFlash('Staff member reinstated.', 'success'); load(); } catch (err) { onFlash(err.message); }
  }
  async function updateAiPermission(staff, field) {
    const canUseAi = field === 'use' ? !staff.permissions?.includes('ai:use') : staff.permissions?.includes('ai:use') || false;
    const canManageAi = field === 'manage' ? !staff.permissions?.includes('ai:manage') : staff.permissions?.includes('ai:manage') || false;
    try {
      await apiRequest(`/institutions/${institution._id}/staff/${staff.user}/ai-permissions`, {
        method: 'PATCH', body: { canUseAi, canManageAi }
      });
      load();
    } catch (error) { onFlash(error.message); }
  }

  if (!institution) return <p className="admin-notice">Register an institution first (My Institution tab).</p>;

  const staffWords = staffQuery.trim().toLowerCase().split(/s+/).filter(Boolean);
  const shownStaff = (institution.staff || []).filter((s) => {
    if (staffRoleFilter && s.role !== staffRoleFilter) return false;
    const hay = [personOf(s.user)?.fullName, personOf(s.user)?.email, s.designation, s.department, roleLabel(s.role)].join(' ').toLowerCase();
    return staffWords.every((w) => hay.includes(w));
  });

  return (
    <div className="institution-ui institution-staff-ui">
      <div className="institution-card-heading"><h2>Staff management</h2><p>Manage your team, roles and access permissions.</p></div>
      <form onSubmit={addStaffMember} className="institution-form-grid institution-staff-form">
        <div className="institution-field"><span>Staff member</span><PersonPicker
          selected={selectedStaffUser}
          placeholder="Search staff member by name or email"
          onPick={(u) => { setSelectedStaffUser(u); setForm({ ...form, userId: u._id }); }}
          onClear={() => { setSelectedStaffUser(null); setForm({ ...form, userId: '' }); }}
        /></div>
        <label className="institution-field"><span>Role</span><select className="form-select" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
          {(roleCatalog.roles.length ? roleCatalog.roles : [{ key: 'teacher', label: 'Teacher' }, { key: 'staff', label: 'Other staff' }]).map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
        </select></label>
        {(roleCatalog.roles.find((r) => r.key === form.role)?.permissions || []).length > 0 && <p className="text-xs" style={{ gridColumn: '1 / -1', color: 'var(--ink-soft)', margin: 0 }}>This role can: {roleCatalog.roles.find((r) => r.key === form.role).permissions.map(permissionLabel).join('; ')}. You can change this after adding.</p>}
        <label className="institution-field"><span>Designation</span><input className="form-input" placeholder="Designation (e.g. Senior Admissions Officer)" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} style={{ maxWidth: 220 }} /></label>
        <label className="institution-field"><span>Department</span><input className="form-input" placeholder="Department (optional)" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} style={{ maxWidth: 160 }} /></label>
        {form.role === 'representative' && (
          <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={form.canApprove} onChange={(e) => setForm({ ...form, canApprove: e.target.checked })} /> Can finalize (accept/reject) applications</label>
        )}
        <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={form.canUseAi} onChange={(e) => setForm({ ...form, canUseAi: e.target.checked })} /> Can use institution AI</label>
        <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={form.canManageAi} onChange={(e) => setForm({ ...form, canManageAi: e.target.checked, canUseAi: e.target.checked || form.canUseAi })} /> Can manage institution AI keys</label>
        <button type="submit" className="btn btn-primary">Add Staff</button>
      </form>
      <p style={{ fontSize: 12, color: 'var(--ink-soft)', marginBottom: 16 }}>Search the staff member by name or email above and pick them from the list. They need a CareerZ account; if they don't have one, send them an invitation instead. Representatives can review inquiries/applications, but can only accept/reject applications if you grant that permission here.</p>
      {(() => { const n = (institution.staff || []).length; return n > 0 && (
        <div className="institution-form-grid institution-staff-form" role="search" style={{ marginBottom: 12 }}>
          <label className="institution-field"><span>Search staff</span><input className="form-input" type="search" placeholder="Name, email, designation or department" value={staffQuery} onChange={(e) => setStaffQuery(e.target.value)} /></label>
          <label className="institution-field"><span>Role</span><select className="form-select" value={staffRoleFilter} onChange={(e) => setStaffRoleFilter(e.target.value)}><option value="">All roles</option>{[...new Set((institution.staff || []).map((s) => s.role))].sort((a, b) => roleLabel(a).localeCompare(roleLabel(b))).map((k) => <option key={k} value={k}>{roleLabel(k)}</option>)}</select></label>
          <p className="text-xs" style={{ alignSelf: 'end', color: 'var(--ink-soft)', margin: 0 }}>Showing {shownStaff.length} of {n} staff{(staffQuery || staffRoleFilter) && <> · <button type="button" className="btn" style={{ padding: '2px 10px' }} onClick={() => { setStaffQuery(''); setStaffRoleFilter(''); }}>Clear</button></>}</p>
        </div>
      ); })()}
      <Table
        headers={['Name', 'Role', 'Designation', 'Department', 'AI permissions', 'Permissions', 'Added', 'Action']}
        rows={shownStaff.map((s) => [
          <div key="n">{personOf(s.user)?.fullName || '—'}{personOf(s.user)?.email && <small style={{ display: 'block', color: 'var(--ink-soft)' }}>{personOf(s.user).email}</small>}</div>,
          s.role === 'teacher' ? roleLabel(s.role) : <select className="form-select" aria-label="Role" value={s.role} onChange={(e) => changeRole(s, e.target.value)} style={{ minWidth: 150 }}>{!roleCatalog.roles.some((r) => r.key === s.role) && <option value={s.role}>{s.role}</option>}{roleCatalog.roles.filter((r) => r.key !== 'teacher').map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}</select>,
          s.designation || '—', s.department || '—',
          <span className="staff-ai-toggles">
            {[['use', 'AI use'], ['manage', 'AI keys']].map(([k, label]) => { const on = s.permissions?.includes(`ai:${k}`); return <button key={k} type="button" className={`staff-toggle${on ? ' on' : ''}`} aria-pressed={on} onClick={() => updateAiPermission(s, k)}><span className="staff-toggle-dot" aria-hidden="true" />{label}<strong>{on ? 'On' : 'Off'}</strong></button>; })}
          </span>, <StaffPermissionsEditor key={`${s.user}-${(s.permissions || []).join()}`} institutionId={institution._id} staff={s} onFlash={onFlash} onSaved={load} />, new Date(s.addedAt).toLocaleDateString(), <span key="a" className="flex gap-2">{s.role !== 'teacher' && <button type="button" className="btn" onClick={() => suspendStaffMember(s.user)}>Suspend</button>}<button type="button" className="btn staff-remove" onClick={() => removeStaffMember(s.user)}>Remove</button></span>])}
        empty={(institution.staff || []).length ? 'No staff match this search.' : 'No staff added yet.'}
      />
      {people.suspended.length > 0 && <>
        <h4 className="font-semibold mb-2 mt-6">Suspended staff</h4>
        <Table headers={['Name', 'Role', 'Suspended', 'Reason', 'Action']} rows={people.suspended.map((s) => [<div key="n">{s.fullName}<small style={{ display: 'block', color: 'var(--ink-soft)' }}>{s.email}</small></div>, roleLabel(s.role), new Date(s.suspendedAt).toLocaleDateString(), s.reason || '—', <button key="r" type="button" className="btn btn-primary" onClick={() => reinstateStaffMember(s.user)}>Reinstate</button>])} empty="" />
      </>}
      {staffLog.length > 0 && <>
        <h4 className="font-semibold mb-2 mt-6">Recent staff changes</h4>
        <Table headers={['When', 'Staff member', 'Change', 'By']} rows={staffLog.map((l) => [new Date(l.at).toLocaleString(), <div key="n">{l.user.fullName}{l.user.email && <small style={{ display: 'block', color: 'var(--ink-soft)' }}>{l.user.email}</small>}</div>, STAFF_CHANGE_TEXT[l.action]?.(l) || l.action, l.by || '—'])} empty="" />
      </>}
      <CustomStaffRoles institutionId={institution._id} catalog={roleCatalog} onFlash={onFlash} onChanged={() => { loadRoles(institution._id); load(); }} />

      <InstitutionHiringPanel institutionId={institution._id} onFlash={onFlash} />
    </div>
  );
}

// The owner's own staff roles (client scope 6). Each has a name and a set of permissions; giving a
// person the role gives them those permissions, which can still be changed per person.
// How each staff change reads in "Recent staff changes".
const STAFF_CHANGE_TEXT = {
  added: (l) => `Added as ${l.toRole}`,
  role_changed: (l) => `Role changed: ${l.fromRole} → ${l.toRole}`,
  permissions_changed: (l) => `Permissions changed (${l.toRole})${l.note ? ` · ${l.note}` : ''}`,
  suspended: (l) => `Suspended (${l.fromRole})${l.note ? ` · ${l.note}` : ''}`,
  reinstated: (l) => `Reinstated as ${l.toRole}`,
  removed: (l) => `Removed (was ${l.fromRole})`
};

function CustomStaffRoles({ institutionId, catalog, onFlash, onChanged }) {
  const blank = { label: '', permissions: [] };
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const grantable = catalog.permissions.filter((p) => !p.key.startsWith('ai:'));
  const custom = catalog.roles.filter((r) => r.custom);
  const toggle = (list, key) => (list.includes(key) ? list.filter((k) => k !== key) : [...list, key]);
  async function save(e) {
    e.preventDefault();
    try {
      const r = editing
        ? await apiRequest(`/institutions/${institutionId}/staff-roles/${editing}`, { method: 'PATCH', body: form })
        : await apiRequest(`/institutions/${institutionId}/staff-roles`, { method: 'POST', body: form });
      onFlash(editing ? `Role updated${r?.updatedStaff ? `; ${r.updatedStaff} staff member(s) got the new permissions` : ''}.` : 'Role created. You can now give it to staff.', 'success');
      setForm(blank); setEditing(null); onChanged();
    } catch (err) { onFlash(err.message); }
  }
  async function remove(role) {
    if (!(await showConfirm(`Delete the role "${role.label}"?`))) return;
    try { await apiRequest(`/institutions/${institutionId}/staff-roles/${role.key}`, { method: 'DELETE' }); onFlash('Role deleted.', 'success'); onChanged(); } catch (err) { onFlash(err.message); }
  }
  return (
    <section className="mt-6">
      <h4 className="font-semibold mb-2">Your own roles</h4>
      <p className="text-xs mb-3" style={{ color: 'var(--ink-soft)' }}>Make a role your institution needs and choose what it can do. Changing a role's permissions updates everyone who has it, except people whose permissions you changed by hand.</p>
      <form onSubmit={save} className="institution-form-grid institution-staff-form">
        <label className="institution-field"><span>Role name</span><input className="form-input" maxLength={60} required value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="e.g. Sports Coordinator" /></label>
        <div className="institution-field" style={{ gridColumn: '1 / -1' }}><span>This role can</span>
          <div className="flex gap-3 flex-wrap">{grantable.map((p) => <label key={p.key} className="flex items-center gap-2 text-xs"><input type="checkbox" checked={form.permissions.includes(p.key)} onChange={() => setForm({ ...form, permissions: toggle(form.permissions, p.key) })} /> {p.label}</label>)}</div>
        </div>
        <span className="flex gap-2"><button type="submit" className="btn btn-primary">{editing ? 'Save Role' : 'Create Role'}</button>{editing && <button type="button" className="btn" onClick={() => { setEditing(null); setForm(blank); }}>Cancel</button>}</span>
      </form>
      <Table headers={['Role', 'Can', 'Action']} rows={custom.map((r) => [r.label, r.permissions.map((k) => catalog.permissions.find((p) => p.key === k)?.label || k).join('; ') || 'Nothing extra', <span key="a" className="flex gap-2"><button type="button" className="btn" onClick={() => { setEditing(r.key); setForm({ label: r.label, permissions: r.permissions }); }}>Edit</button><button type="button" className="btn staff-remove" onClick={() => remove(r)}>Delete</button></span>])} empty="No roles of your own yet." />
    </section>
  );
}

// Real, consent-based hiring (spec: Teacher<->Institution "hiring offer/acceptance, employment
// contract, resignation/termination, service history") — separate from the quick "Add Staff"
// above, which stays as an unchanged fast path. The teacher must actually accept an offer here
// before anything changes on either side.
function InstitutionHiringPanel({ institutionId, onFlash }) {
  const [employments, setEmployments] = useState(null);
  const [form, setForm] = useState({ teacherUserId: '', role: 'teacher', designation: '', department: '', contractTerms: '', contractDocumentUrl: '', salaryType: 'monthly', commissionPercent: 0, monthlySalary: 0, salaryCurrency: 'PKR', taxPercent: 0 });
  const [busyId, setBusyId] = useState(null);
  const [directory, setDirectory] = useState(null);
  const [directoryQuery, setDirectoryQuery] = useState(''), [directoryCategory, setDirectoryCategory] = useState('');
  const [uploadingContract, setUploadingContract] = useState(false);
  const offerFormRef = useRef(null);

  // Real signed upload to CareerZ's own Cloudinary storage (same flow as Study Group resources)
  // instead of asking the institution to paste a URL to a file hosted somewhere else.
  async function uploadContractFile(file) {
    if (!file) return;
    setUploadingContract(true);
    try {
      // PDFs/docs must be uploaded as Cloudinary `raw` resources. The previous `auto`
      // endpoint classified PDFs as images, whose public delivery is disabled on many
      // Cloudinary accounts and produced a 401 "deny or ACL failure" when opened.
      const contractDocumentUrl = await uploadToPlatformStorage(file, 'contracts');
      setForm((f) => ({ ...f, contractDocumentUrl }));
      onFlash('Contract document uploaded.', 'success');
    } catch (err) { onFlash(err.message); } finally { setUploadingContract(false); }
  }

  function load() {
    apiRequest(`/institutions/${institutionId}/teacher-employments`).then(setEmployments).catch((err) => onFlash(err.message));
  }
  useEffect(load, [institutionId]);

  function loadDirectory() {
    setDirectory(null);
    const params = new URLSearchParams();
    if (directoryQuery.trim()) params.set('q', directoryQuery.trim());
    if (directoryCategory) params.set('category', directoryCategory);
    apiRequest(`/institutions/${institutionId}/teacher-directory${params.toString() ? `?${params}` : ''}`)
      .then(setDirectory).catch((err) => onFlash(err.message));
  }
  useEffect(loadDirectory, [institutionId]); // eslint-disable-line react-hooks/exhaustive-deps

  function pickFromDirectory(teacher) {
    setForm((f) => ({ ...f, teacherUserId: teacher.userId }));
    offerFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  async function sendOffer(e) {
    e.preventDefault();
    try {
      await apiRequest(`/institutions/${institutionId}/teacher-offers`, { method: 'POST', body: { ...form, teacherUserId: form.teacherUserId.trim() } });
      onFlash('Offer sent.', 'success');
      setForm({ teacherUserId: '', role: 'teacher', designation: '', department: '', contractTerms: '', contractDocumentUrl: '', salaryType: 'monthly', commissionPercent: 0, monthlySalary: 0, salaryCurrency: 'PKR', taxPercent: 0 });
      load();
    } catch (err) { onFlash(err.message); }
  }

  async function endEmployment(id) {
    const reason = await showPrompt('Add a reason for ending this teacher employment, or continue without one.', { title: 'End teacher employment', placeholder: 'Reason (optional)', confirmLabel: 'End employment', danger: true });
    if (reason === null) return;
    setBusyId(id);
    try {
      await apiRequest(`/teacher-employments/${id}/terminate`, { method: 'PATCH', body: { reason } });
      onFlash('Employment ended.', 'success');
      load();
    } catch (err) { onFlash(err.message); } finally { setBusyId(null); }
  }

  async function changeEmployment(id, action) {
    const label = action === 'promote' ? 'new designation' : 'new department';
    const value = await showPrompt(`Enter ${label}.`, { title: action === 'promote' ? 'Promote teacher' : 'Transfer teacher', required: true });
    if (!value) return;
    try { await apiRequest(`/teacher-employments/${id}/manage`, { method: 'PATCH', body: { action, [action === 'promote' ? 'designation' : 'department']: value } }); onFlash('Employment updated.', 'success'); load(); } catch (err) { onFlash(err.message); }
  }

  async function reviewLeave(id, leaveId, decision) {
    try { await apiRequest(`/teacher-employments/${id}/manage`, { method: 'PATCH', body: { action: 'review_leave', leaveId, decision } }); onFlash(`Leave ${decision}.`, 'success'); load(); } catch (err) { onFlash(err.message); }
  }

  const STATUS_TAG = { offered: 'pending', active: 'approved', accepted: 'approved', declined: 'rejected', resigned: 'pending', terminated: 'rejected' };

  return (
    <div className="admin-section institution-hiring-ui" style={{ marginTop: 20 }}>
      <div className="admin-section-heading"><div><h2>Find Teachers</h2><p>Browse teachers who've made themselves discoverable, then send an offer — no need to already know their User ID.</p></div></div>
      <form onSubmit={(e) => { e.preventDefault(); loadDirectory(); }} className="institution-directory-search">
        <input className="form-input" placeholder="Search by subject or keyword" value={directoryQuery} onChange={(e) => setDirectoryQuery(e.target.value)} style={{ minWidth: 220, flex: 1 }} />
        <select className="form-select" aria-label="Teacher type" value={directoryCategory} onChange={(e) => setDirectoryCategory(e.target.value)} style={{ maxWidth: 220 }}><option value="">All teacher types</option>{TEACHER_CATEGORIES.map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select>
        <button type="submit" className="btn">Search</button>
      </form>
      <div className="grid" style={{ gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', marginBottom: 24 }}>
        {directory === null && <p role="status" className="admin-notice">Loading...</p>}
        {directory && directory.length === 0 && <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>No discoverable teachers found. Teachers control this from their own Teaching Profile ("Show my profile in the institution directory").</p>}
        {(directory || []).map((t) => (
          <div key={t.userId} className="card" style={{ padding: 16 }}>
            <div className="flex items-center" style={{ gap: 10, marginBottom: 8 }}>
              {t.profilePhoto
                ? <img src={t.profilePhoto} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                : <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--forest)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>{(t.fullName || '?')[0]}</div>}
              <div>
                <strong className="text-sm">{t.fullName}</strong>
                <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>{t.experienceYears || 0} yrs experience</p>
              </div>
            </div>
            {t.subjects?.length > 0 && <p className="text-xs" style={{ marginBottom: 6 }}><strong>Subjects:</strong> {t.subjects.join(', ')}</p>}
            {t.qualifications?.length > 0 && <p className="text-xs" style={{ marginBottom: 6, color: 'var(--ink-soft)' }}>{t.qualifications.map((q) => q.title).filter(Boolean).join(', ')}</p>}
            {t.categories?.length > 0 && <p className="text-xs" style={{ marginBottom: 6 }}>{t.categories.map((k) => TEACHER_CATEGORIES.find(([key]) => key === k)?.[1] || k).join(' · ')}</p>}
            {t.portfolioUrl && <a className="text-xs" href={t.portfolioUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--emerald)', display: 'inline-block', marginBottom: 6 }}>View public portfolio</a>}
            {t.bio && <p className="text-xs" style={{ marginBottom: 10, color: 'var(--ink-soft)' }}>{t.bio}</p>}
            <button type="button" className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.78rem' }} onClick={() => pickFromDirectory(t)}>Send Offer</button>
          </div>
        ))}
      </div>

      <div className="admin-section-heading"><div><h2>Hiring — Job Offers</h2><p>A formal offer the teacher must accept before they're added as staff (contract terms are a plain-text record, not a legal document).</p></div></div>
      <form ref={offerFormRef} onSubmit={sendOffer} className="institution-form-grid institution-offer-form">
        <label className="institution-field"><span>Teacher account</span><input className="form-input" placeholder="Teacher's User ID" required value={form.teacherUserId} onChange={(e) => setForm({ ...form, teacherUserId: e.target.value })} /></label>
        <label className="institution-field"><span>Role</span><select className="form-select" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
          {['teacher', 'warden', 'accountant', 'librarian', 'principal', 'coordinator', 'representative', 'staff'].map((r) => <option key={r} value={r}>{r}</option>)}
        </select></label>
        <label className="institution-field"><span>Designation</span><input className="form-input" placeholder="Designation" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} style={{ maxWidth: 180 }} /></label>
        <label className="institution-field"><span>Department</span><input className="form-input" placeholder="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} style={{ maxWidth: 150 }} /></label>
        <label className="institution-field"><span>Contract terms</span><input className="form-input" placeholder="Contract terms (salary, hours...)" value={form.contractTerms} onChange={(e) => setForm({ ...form, contractTerms: e.target.value })} style={{ minWidth: 220, flex: 1 }} /></label>
        <label className="text-xs flex items-center" style={{ gap: 8, minWidth: 220 }}>
          {form.contractDocumentUrl ? <a href={form.contractDocumentUrl} target="_blank" rel="noreferrer">Contract uploaded — view</a> : 'Signed contract document'}
          <input type="file" accept=".pdf,.doc,.docx,image/*" disabled={uploadingContract} onChange={(e) => uploadContractFile(e.target.files?.[0])} style={{ fontSize: 11 }} />
        </label>
        <label className="institution-field"><span>Salary type</span><select className="form-select" value={form.salaryType} onChange={(e) => setForm({ ...form, salaryType: e.target.value })}><option value="monthly">Monthly salary</option><option value="commission">Commission</option><option value="hybrid">Monthly + commission</option></select></label>
        {form.salaryType !== 'commission' && <label className="institution-field"><span>Monthly salary</span><input className="form-input" type="number" min="0" placeholder="Monthly salary" value={form.monthlySalary} onChange={(e) => setForm({ ...form, monthlySalary: e.target.value })} style={{ maxWidth: 150 }} /></label>}
        <label className="institution-field"><span>Currency</span><select className="form-select" value={form.salaryCurrency} onChange={(e) => setForm({ ...form, salaryCurrency: e.target.value })} style={{ maxWidth: 100 }}>{['PKR', 'USD', 'GBP', 'SAR', 'AED'].map((currency) => <option key={currency}>{currency}</option>)}</select></label>
        <label className="institution-field"><span>Tax (%)</span><input className="form-input" type="number" min="0" max="100" placeholder="Tax %" value={form.taxPercent} onChange={(e) => setForm({ ...form, taxPercent: e.target.value })} style={{ maxWidth: 100 }} /></label>
        {form.salaryType !== 'monthly' && <label className="institution-field"><span>Commission (%)</span><input className="form-input" type="number" min="0" max="100" placeholder="Commission %" value={form.commissionPercent} onChange={(e) => setForm({ ...form, commissionPercent: e.target.value })} style={{ maxWidth: 140 }} /></label>}
        <button type="submit" className="btn btn-primary">Send Offer</button>
      </form>
      <Table
        loading={employments === null}
        headers={['Teacher', 'Qualification / Subjects', 'Employment', 'Salary', 'Status', 'Offered', 'Action']}
        rows={(employments || []).map((e) => [
          <div><strong>{e.teacher?.fullName || 'Unknown teacher'}</strong><div className="text-xs" style={{ color: 'var(--ink-soft)' }}>{e.teacher?.email || ''}</div></div>,
          <div><strong>{e.teacherProfile?.qualifications?.[0]?.title || 'Qualification not added'}</strong><div className="text-xs" style={{ color: 'var(--ink-soft)' }}>{(e.teacherProfile?.subjects || []).join(', ') || 'Subjects not added'}{e.teacherProfile?.experienceYears != null ? ` · ${e.teacherProfile.experienceYears} yrs` : ''}</div></div>,
          <div><strong>{e.designation || e.role}</strong><div className="text-xs" style={{ color: 'var(--ink-soft)' }}>{e.department || 'Department not assigned'}</div></div>,
          <div><strong style={{ whiteSpace: 'nowrap' }}>{e.salaryCurrency || 'PKR'} {Number(e.monthlySalary || 0).toLocaleString()}</strong><div className="text-xs" style={{ color: 'var(--ink-soft)' }}>{e.salaryType || 'monthly'}{Number(e.taxPercent || 0) > 0 ? ` · Tax ${e.taxPercent}%` : ''}{Number(e.commissionPercent || 0) > 0 ? ` · Commission ${e.commissionPercent}%` : ''}</div></div>,
          <Tag status={STATUS_TAG[e.status] || 'pending'} label={e.status} />,
          new Date(e.offeredAt).toLocaleDateString(),
          e.status === 'active'
            ? <div className="staff-actions"><button type="button" className="btn" onClick={() => changeEmployment(e._id, 'promote')}>Promote</button><button type="button" className="btn" onClick={() => changeEmployment(e._id, 'transfer')}>Transfer</button>{(e.leaveRequests || []).filter((leave) => leave.status === 'pending').map((leave) => <span key={leave._id} className="staff-actions-leave"><button type="button" className="btn btn-primary" onClick={() => reviewLeave(e._id, leave._id, 'approved')}>Approve leave</button><button type="button" className="btn" onClick={() => reviewLeave(e._id, leave._id, 'rejected')}>Reject</button></span>)}<button type="button" className="btn staff-remove" disabled={busyId === e._id} onClick={() => endEmployment(e._id)}>End</button></div>
            : '—'
        ])}
        empty="No offers sent yet."
      />
    </div>
  );
}

// The institute sees a teacher's degree and subjects while choosing who teaches a course.
const teacherOptionLabel = (t) => [t.user.fullName, t.qualifications?.[0]?.title].filter(Boolean).join(' — ');

function TeacherDetailBox({ teacher }) {
  if (!teacher) return null;
  const degrees = (teacher.qualifications || []).filter((q) => q.title);
  return (
    <div className="admin-notice" style={{ marginTop: 14 }}>
      <strong>{teacher.user.fullName}</strong>{teacher.user.email ? <span> · {teacher.user.email}</span> : null}
      <p className="text-xs" style={{ marginTop: 6 }}><strong>Degree:</strong> {degrees.length ? degrees.map((q) => [q.title, q.institutionName, q.year].filter(Boolean).join(', ')).join(' | ') : 'Not added by the teacher yet'}</p>
      <p className="text-xs" style={{ marginTop: 4 }}><strong>Subjects:</strong> {teacher.subjects?.length ? teacher.subjects.join(', ') : 'Not added yet'} · <strong>Experience:</strong> {teacher.experienceYears || 0} years</p>
    </div>
  );
}

// The institute picks a course, sees its teacher, and chooses which students are in it.
function InstitutionCourseStudents({ institution, courses, teachers, onFlash }) {
  const [courseId, setCourseId] = useState('');
  const [students, setStudents] = useState(null);
  const [selected, setSelected] = useState([]);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState('');
  const course = courses.find((c) => c._id === courseId);
  const assigned = courses.filter((c) => c.teacher);
  const sectionId = course?.classSection?._id || course?.classSection;
  useEffect(() => {
    if (!courseId) { setSelected([]); return; }
    setSelected(null);
    apiRequest(`/institutions/${institution._id}/courses/${courseId}/students`).then((ids) => setSelected(ids.map(String))).catch((err) => { setSelected([]); onFlash(err.message); });
    if (students === null) apiRequest(`/institutions/${institution._id}/students`).then((list) => setStudents(list.filter((s) => s.user))).catch((err) => { setStudents([]); onFlash(err.message); });
  }, [courseId]); // eslint-disable-line react-hooks/exhaustive-deps
  const shown = (students || []).filter((s) => s.user.fullName.toLowerCase().includes(search.trim().toLowerCase()));
  const toggle = (id) => setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  async function save() {
    setBusy(true);
    try {
      const r = await apiRequest(`/institutions/${institution._id}/courses/${courseId}/students`, { method: 'PUT', body: { students: selected } });
      onFlash(`Saved: ${r.total} students in this course (${r.added} added, ${r.removed} removed).`, 'success');
    } catch (err) { onFlash(err.message); } finally { setBusy(false); }
  }
  return (
    <div className="card" style={{ padding: 20, marginTop: 20 }}>
      <h4 className="font-semibold" style={{ marginBottom: 6 }}>Allot students to a course</h4>
      <p className="text-xs" style={{ color: 'var(--ink-soft)', marginBottom: 14 }}>Only courses with an assigned teacher appear here. Students placed in the course's class are added automatically; you can add or remove anyone here.</p>
      <label style={{ display: 'block', maxWidth: 460 }}><span className="text-xs" style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Course</span>
        <select className="form-select" value={courseId} onChange={(e) => setCourseId(e.target.value)}><option value="">Select course</option>{assigned.map((c) => <option key={c._id} value={c._id}>{c.title} — {c.teacher?.fullName}{c.classSection?.name ? ` (${c.classSection.name})` : ''}</option>)}</select>
      </label>
      {course && <TeacherDetailBox teacher={teachers.find((t) => t.user._id === (course.teacher?._id || course.teacher))} />}
      {course && (students === null || selected === null ? <p role="status" className="text-xs" style={{ marginTop: 14 }}>Loading...</p> : students.length === 0 ? <p className="admin-notice" style={{ marginTop: 14 }}>This institute has no students yet.</p> : (
        <div style={{ marginTop: 14 }}>
          <div className="flex items-center justify-between flex-wrap" style={{ gap: 10, marginBottom: 10 }}>
            <input className="form-input" style={{ maxWidth: 280 }} placeholder="Search student by name" value={search} onChange={(e) => setSearch(e.target.value)} />
            <span className="text-xs" style={{ fontWeight: 600 }}>{selected.length} selected</span>
          </div>
          <div style={{ display: 'grid', gap: 6, maxHeight: 320, overflowY: 'auto', marginBottom: 14 }}>
            {shown.map((s) => (
              <label key={s._id} className="flex items-center justify-between flex-wrap" style={{ gap: 8, padding: '8px 12px', borderRadius: 10, background: 'var(--sand)', cursor: 'pointer' }}>
                <span className="flex items-center text-sm" style={{ gap: 10 }}><input type="checkbox" checked={selected.includes(String(s.user._id))} onChange={() => toggle(String(s.user._id))} />{s.user.fullName}</span>
                <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>{s.classSection?.name || 'No class'}{(s.classSection?._id && s.classSection._id === sectionId) ? ' · this class' : ''}</span>
              </label>
            ))}
          </div>
          <button type="button" className="btn btn-primary" disabled={busy} onClick={save}>{busy ? 'Saving...' : 'Save Students'}</button>
        </div>
      ))}
    </div>
  );
}

function InstitutionClassesPanel({ onFlash }) {
  const [institution, setInstitution] = useState(null);
  const [campuses, setCampuses] = useState([]);
  const [sections, setSections] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [courseEdits, setCourseEdits] = useState({});
  const [campusForm, setCampusForm] = useState({ name: '', address: '' });
  const [sectionForm, setSectionForm] = useState({ name: '', academicYear: '', classTeacher: '' });
  const [sectionTeacherEdits, setSectionTeacherEdits] = useState({});
  const [timetableSection, setTimetableSection] = useState('');
  const [timetable, setTimetable] = useState([]);
  const [entryForm, setEntryForm] = useState({ teacher: '', course: '', dayOfWeek: 'mon', startTime: '', endTime: '', room: '', meetingLink: '' });
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
        apiRequest(`/institutions/${inst._id}/courses`).then(setCourses).catch((err) => onFlash(err.message));
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
      load(); return true;
    } catch (err) { onFlash(err.message); }
  }

  async function setSectionCampus(sectionId, campus) {
    try {
      await apiRequest(`/institutions/${institution._id}/class-sections/${sectionId}`, { method: 'PATCH', body: { campus: campus || null } });
      onFlash('Section campus updated.', 'success');
      load();
    } catch (err) { onFlash(err.message); }
  }

  function loadTimetable(sectionId) {
    if (!institution || !sectionId) return;
    apiRequest(`/institutions/${institution._id}/class-sections/${sectionId}/timetable`).then(setTimetable).catch((err) => onFlash(err.message));
  }
  useEffect(() => { loadTimetable(timetableSection); }, [timetableSection, institution]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!courses.length || !sections.length) return;
    const selectedHasCourses = courses.some((course) => (course.classSection?._id || course.classSection) === timetableSection);
    if (!selectedHasCourses) {
      const firstLinkedSection = sections.find((section) => courses.some((course) => (course.classSection?._id || course.classSection) === section._id));
      if (firstLinkedSection) setTimetableSection(firstLinkedSection._id);
    }
  }, [courses, sections, timetableSection]);

  const [courseForm, setCourseForm] = useState({ title: '', subject: '', classSection: '', teacher: '', creditHours: 3, academicTerm: '', certificateEnabled: false });
  async function createCourse(e) {
    e.preventDefault();
    try {
      await apiRequest(`/institutions/${institution._id}/courses`, { method: 'POST', body: courseForm });
      onFlash('Course created and assigned to the teacher.', 'success');
      setCourseForm({ title: '', subject: '', classSection: '', teacher: '', creditHours: 3, academicTerm: '', certificateEnabled: false });
      load();
    } catch (err) { onFlash(err.message); }
  }

  async function saveCourseAssignment(course) {
    const edit = courseEdits[course._id] || { subject: course.subject || '', classSection: course.classSection?._id || '', teacher: course.teacher?._id || '', creditHours: course.creditHours || 3, academicTerm: course.academicTerm || '' };
    try {
      await apiRequest(`/institutions/${institution._id}/courses/${course._id}/academic-assignment`, { method: 'PATCH', body: edit });
      onFlash('Course linked to subject, section and teacher.', 'success');
      load(); return true;
    } catch (err) { onFlash(err.message); }
  }

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
          body: entryForm
        });
        onFlash('Class changed — teacher notified.', 'success');
        setEditingEntryId(null);
      } else {
        await apiRequest(`/institutions/${institution._id}/class-sections/${timetableSection}/timetable`, {
          method: 'POST',
          body: entryForm
        });
        onFlash('Timetable entry added.', 'success');
      }
      setEntryForm({ teacher: '', course: '', dayOfWeek: 'mon', startTime: '', endTime: '', room: '', meetingLink: '' });
      loadTimetable(timetableSection);
    } catch (err) { onFlash(err.message); }
  }
  function startEditEntry(t) {
    setEditingEntryId(t._id);
    setEntryForm({ teacher: t.teacher?._id || '', course: t.course?._id || '', dayOfWeek: t.dayOfWeek, startTime: t.startTime, endTime: t.endTime, room: t.room || '', meetingLink: t.meetingLink || '' });
  }
  function cancelEditEntry() {
    setEditingEntryId(null);
    setEntryForm({ teacher: '', course: '', dayOfWeek: 'mon', startTime: '', endTime: '', room: '', meetingLink: '' });
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
    <div className="institution-ui institution-classes-ui">
      <section className="institution-class-section"><h3 className="font-semibold mb-2">Campuses</h3>
      <form onSubmit={createCampus} className="institution-form-grid institution-class-form">
        <label className="institution-field"><span>Campus name</span><input className="form-input" placeholder="Campus name" value={campusForm.name} onChange={(e) => setCampusForm({ ...campusForm, name: e.target.value })} required /></label>
        <label className="institution-field"><span>Address</span><input className="form-input" placeholder="Address" value={campusForm.address} onChange={(e) => setCampusForm({ ...campusForm, address: e.target.value })} /></label>
        <button type="submit" className="btn btn-primary">Add Campus</button>
      </form>
      <Table headers={['Name', 'Address']} rows={campuses.map((c) => [c.name, c.address || '—'])} empty="No campuses yet." />
      {campuses.length > 0 && <CampusReports institutionId={institution._id} onFlash={onFlash} />}

      </section><AcademicStructure institutionId={institution._id} sections={sections} teachers={teachers} onFlash={onFlash} Table={Table} /><section className="institution-class-section"><h3 className="font-semibold mb-2 mt-6">Class Sections</h3>
      <form onSubmit={createSection} className="institution-form-grid institution-class-form">
        <label className="institution-field"><span>Section name</span><input className="form-input" placeholder="Name (e.g. Grade 10 - A)" value={sectionForm.name} onChange={(e) => setSectionForm({ ...sectionForm, name: e.target.value })} required /></label>
        <label className="institution-field"><span>Academic year</span><input className="form-input" placeholder="Academic year" value={sectionForm.academicYear} onChange={(e) => setSectionForm({ ...sectionForm, academicYear: e.target.value })} /></label>
        <label className="institution-field"><span>Class teacher (optional)</span><select className="form-select" value={sectionForm.classTeacher} onChange={(e) => setSectionForm({ ...sectionForm, classTeacher: e.target.value })} aria-label="Class teacher">
          <option value="">Class teacher (optional)</option>
          {teachers.map((t) => <option key={t.user._id} value={t.user._id}>{t.user.fullName}</option>)}
        </select></label>
        <button type="submit" className="btn btn-primary">Add Section</button>
      </form>
      {teachers.length === 0 && <p className="text-xs mb-3" style={{ color: 'var(--ink-soft)' }}>No teachers linked yet — add one as staff (Staff & HR tab, role "teacher") before you can pick a class teacher.</p>}
      <Table
        headers={['Name', 'Academic Year', 'Campus', 'Class Teacher', 'Action']}
        rows={sections.map((s) => [
          s.name, s.academicYear || '—',
          <select key={`campus-${s._id}`} className="form-select" aria-label={`Campus of ${s.name}`} style={{ padding: '4px 8px', fontSize: '0.78rem' }} value={s.campus?._id || s.campus || ''} disabled={!campuses.length} onChange={(e) => setSectionCampus(s._id, e.target.value)}>
            <option value="">{campuses.length ? '— no campus —' : 'Add a campus first'}</option>
            {campuses.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>,
          s.classTeacher?.fullName || 'Not assigned',
          <SavedForm key={s._id} showValues={false} value={sectionTeacherEdits[s._id] ?? (s.classTeacher?._id || '')} onRestore={value=>setSectionTeacherEdits(prev=>({...prev,[s._id]:value}))} onSubmit={()=>assignClassTeacher(s._id)} className="flex gap-2 items-center">
            <select className="form-select" style={{ padding: '4px 8px', fontSize: '0.78rem' }} value={sectionTeacherEdits[s._id] ?? (s.classTeacher?._id || '')} onChange={(e) => setSectionTeacherEdits({ ...sectionTeacherEdits, [s._id]: e.target.value })}>
              <option value="">— none —</option>
              {teachers.map((t) => <option key={t.user._id} value={t.user._id}>{t.user.fullName}</option>)}
            </select>
            <button type="submit" className="btn" style={{ padding: '4px 10px', fontSize: '0.72rem' }}>Save</button>
          </SavedForm>
        ])}
        empty="No class sections yet."
      />

      </section><section className="institution-class-section"><h3 className="font-semibold mb-2 mt-6">Course Academic Assignments</h3>
      <p className="admin-notice">Link every course to its real subject, class/section and teacher. Timetable and examinations use this assignment automatically.</p>
      <form onSubmit={createCourse} className="card course-create-form" style={{ padding: 20, margin: '16px 0' }}>
        <h4 className="font-semibold" style={{ marginBottom: 14 }}>Add a course and assign a teacher</h4>
        <div className="flex flex-wrap items-end" style={{ gap: 14 }}>
          <label style={{ flex: '1 1 200px', minWidth: 0 }}><span className="text-xs" style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Course title</span><input className="form-input" required maxLength={150} placeholder="e.g. Grade 9 Physics" value={courseForm.title} onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} /></label>
          <label style={{ flex: '1 1 160px', minWidth: 0 }}><span className="text-xs" style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Subject</span><input className="form-input" required maxLength={150} placeholder="e.g. Physics" value={courseForm.subject} onChange={(e) => setCourseForm({ ...courseForm, subject: e.target.value })} /></label>
          <label style={{ flex: '1 1 180px', minWidth: 0 }}><span className="text-xs" style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Class / Section</span><select className="form-select" required value={courseForm.classSection} onChange={(e) => setCourseForm({ ...courseForm, classSection: e.target.value })}><option value="">Select class</option>{sections.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}</select></label>
          <label style={{ flex: '1 1 180px', minWidth: 0 }}><span className="text-xs" style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Teacher</span><select className="form-select" required value={courseForm.teacher} onChange={(e) => setCourseForm({ ...courseForm, teacher: e.target.value })}><option value="">Select teacher</option>{teachers.map((t) => <option key={t.user._id} value={t.user._id}>{teacherOptionLabel(t)}</option>)}</select></label>
          <label style={{ flex: '0 1 100px', minWidth: 0 }}><span className="text-xs" style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Credits</span><input className="form-input" type="number" min="0" max="30" value={courseForm.creditHours} onChange={(e) => setCourseForm({ ...courseForm, creditHours: e.target.value })} /></label>
          <label style={{ flex: '1 1 150px', minWidth: 0 }}><span className="text-xs" style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Semester / Term</span><input className="form-input" placeholder="e.g. Semester 1" value={courseForm.academicTerm} onChange={(e) => setCourseForm({ ...courseForm, academicTerm: e.target.value })} /></label>
          <label className="flex items-center" style={{ gap: 8, fontSize: 13, fontWeight: 600, flex: '1 1 100%' }}><input type="checkbox" checked={courseForm.certificateEnabled} onChange={(e) => setCourseForm({ ...courseForm, certificateEnabled: e.target.checked })} /> Issue a certificate to students who complete this course</label>
          <button type="submit" className="btn btn-primary" style={{ flexShrink: 0 }}>Add Course</button>
        </div>
        <TeacherDetailBox teacher={teachers.find((t) => t.user._id === courseForm.teacher)} />
      </form>
      <Table
        headers={['Course', 'Subject', 'Class / Section', 'Teacher', 'Credits', 'Semester / Term', 'Action']}
        rows={courses.map((course) => {
          const edit = courseEdits[course._id] || { subject: course.subject || '', classSection: course.classSection?._id || '', teacher: course.teacher?._id || '', creditHours: course.creditHours || 3, academicTerm: course.academicTerm || '' };
          return [course.title, course.subject || '—', course.classSection?.name || '—', course.teacher?.fullName || '—', course.creditHours || 3, course.academicTerm || '—', <SavedForm key={course._id} showValues={false} value={edit} onRestore={value=>setCourseEdits(prev=>({...prev,[course._id]:value}))} onSubmit={()=>saveCourseAssignment(course)} style={{display:'grid',gap:10,minWidth:220}}><label>Subject<input className="form-input" value={edit.subject} onChange={e=>setCourseEdits(prev=>({...prev,[course._id]:{...edit,subject:e.target.value}}))}/></label><label>Class / Section<select className="form-select" value={edit.classSection} onChange={e=>setCourseEdits(prev=>({...prev,[course._id]:{...edit,classSection:e.target.value}}))}><option value="">Select class</option>{sections.map(row=><option key={row._id} value={row._id}>{row.name}</option>)}</select></label><label>Teacher<select className="form-select" value={edit.teacher} onChange={e=>setCourseEdits(prev=>({...prev,[course._id]:{...edit,teacher:e.target.value}}))}><option value="">Select teacher</option>{teachers.map(row=><option key={row.user._id} value={row.user._id}>{teacherOptionLabel(row)}</option>)}</select></label><label>Credits<input className="form-input" type="number" min="0.5" max="12" step="0.5" value={edit.creditHours} onChange={e=>setCourseEdits(prev=>({...prev,[course._id]:{...edit,creditHours:e.target.value}}))}/></label><label>Semester / Term<input className="form-input" value={edit.academicTerm} onChange={e=>setCourseEdits(prev=>({...prev,[course._id]:{...edit,academicTerm:e.target.value}}))}/></label><button type="submit" className="btn btn-primary">Save assignment</button></SavedForm>];
        })}
        empty="No institution courses yet. Add one above."
      />
      {institution && <InstitutionCourseStudents institution={institution} courses={courses} teachers={teachers} onFlash={onFlash} />}
      </section><div className="institution-study-settings" style={{ marginTop: 16 }}><h3 className="institution-study-title">Course study settings and approvals</h3><LearningCenter workspace="institution" embedded onFlash={onFlash} renderLessonExtras={l => <LessonMetadata lessonId={l._id} canReview onFlash={onFlash} />} /></div>

      {sections.length > 0 && <AutoTimetable institution={institution} sections={sections} courses={courses} onFlash={onFlash} onSaved={() => loadTimetable(timetableSection)} />}
      {sections.length > 0 && (
        <>
          <section className="institution-class-section institution-timetable"><h3 className="font-semibold mb-2 mt-6">Timetable</h3>
          <select className="form-select" value={timetableSection} onChange={(e) => { setTimetableSection(e.target.value); setEntryForm({ teacher: '', course: '', dayOfWeek: 'mon', startTime: '', endTime: '', room: '', meetingLink: '' }); }} style={{ maxWidth: 360, marginBottom: 16 }} aria-label="Select class section">
            {sections.map((s) => <option key={s._id} value={s._id}>{s.name} ({courses.filter((course) => (course.classSection?._id || course.classSection) === s._id).length} course{courses.filter((course) => (course.classSection?._id || course.classSection) === s._id).length === 1 ? '' : 's'})</option>)}
          </select>
          {courses.filter((course) => (course.classSection?._id || course.classSection) === timetableSection).length === 0 && <div className="u-alert warning mb-3"><span className="u-alert-ic">!</span><div className="u-alert-body"><strong>No course assigned to this section</strong><p>Use Course Academic Assignments above to link a course, subject and teacher to this class section. A timetable slot cannot be created until then.</p></div></div>}
          <form onSubmit={createEntry} className="institution-form-grid institution-class-form">
            <label className="institution-field"><span>Course / subject</span><select className="form-select" value={entryForm.course} onChange={(e) => {
              const selected = courses.find((course) => course._id === e.target.value);
              setEntryForm({ ...entryForm, course: e.target.value, teacher: selected?.teacher?._id || selected?.teacher || '' });
            }} required style={{ maxWidth: 250 }} aria-label="Course">
              <option value="">Select course / subject for this section</option>
              {courses.filter((course) => (course.classSection?._id || course.classSection) === timetableSection).map((course) => <option key={course._id} value={course._id}>{course.subject || course.title} — {course.title}</option>)}
            </select></label>
            <label className="institution-field"><span>Day</span><select className="form-select" value={entryForm.dayOfWeek} onChange={(e) => setEntryForm({ ...entryForm, dayOfWeek: e.target.value })}>
              {Object.entries(DOW_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select></label>
            <label className="institution-field"><span>Start time</span><input className="form-input" type="time" value={entryForm.startTime} onChange={(e) => setEntryForm({ ...entryForm, startTime: e.target.value })} required /></label>
            <label className="institution-field"><span>End time</span><input className="form-input" type="time" value={entryForm.endTime} onChange={(e) => setEntryForm({ ...entryForm, endTime: e.target.value })} required /></label>
            <label className="institution-field"><span>Room (optional)</span><input className="form-input" placeholder="Room (optional, for physical classes)" value={entryForm.room} onChange={(e) => setEntryForm({ ...entryForm, room: e.target.value })} style={{ maxWidth: 180 }} /></label>
            <label className="institution-field"><span>Teacher</span><select className="form-select" value={entryForm.teacher} onChange={(e) => setEntryForm({ ...entryForm, teacher: e.target.value })} style={{ maxWidth: 180 }} aria-label="Teacher">
              <option value="">Select teacher</option>
              {teachers.map((t) => <option key={t.user._id} value={t.user._id}>{t.user.fullName}</option>)}
            </select></label>
            <label className="institution-field"><span>Meeting link (optional)</span><input className="form-input" placeholder="Meeting link (optional, for online classes)" value={entryForm.meetingLink} onChange={(e) => setEntryForm({ ...entryForm, meetingLink: e.target.value })} style={{ maxWidth: 240 }} /></label>
            <button type="submit" className="btn btn-primary">{editingEntryId ? 'Save Changes' : 'Add Slot'}</button>
            {editingEntryId && <button type="button" className="btn" onClick={cancelEditEntry}>Cancel</button>}
          </form>
          <p className="text-xs mb-3" style={{ color: 'var(--ink-soft)' }}>Paste your own Zoom/Google Meet/Teams link for online classes — CareerZ doesn't host video calls itself, but "Join Class" will open whatever link you set here.</p>
          <Table
            headers={['Day', 'Time', 'Course / Subject', 'Teacher', 'Class / Section', 'Room', 'Online', 'Action']}
            rows={timetable.map((t) => [
              DOW_LABEL[t.dayOfWeek], <span style={{ whiteSpace: 'nowrap' }}>{formatTime12h(t.startTime)}–{formatTime12h(t.endTime)}</span>, t.course?.title || t.subject, t.teacher?.fullName || '—', t.classSection?.name || '—', t.room || '—',
              t.meetingLink ? <Tag status="approved" /> : '—',
              <div className="flex gap-2">
                <button type="button" className="btn tt-edit" onClick={() => startEditEntry(t)}>Edit</button>
                <button type="button" className="btn staff-remove" onClick={() => removeEntry(t._id)}>Remove</button>
              </div>
            ])}
            empty="No timetable entries for this section yet."
          />
          </section>
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
    <div>
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
      {primary && <FeeCollectionCharts institutionId={primary._id} onFlash={() => {}} />}
    </div>
  );
}

// Institute "Jobs & Hiring" (Master 4.24, 5.5): a verified institute posts its own vacancies,
// teaching and non-teaching, and manages applicants. Reuses the employer posting and jobs panels.
function InstitutionJobsPanel({ onFlash }) {
  const [institutions, setInstitutions] = useState(null), [id, setId] = useState('');
  const [sub, setSub] = useUrlTab('sub', 'jobs', ['jobs', 'post', 'agents']), [reloadKey, setReloadKey] = useState(0);
  useEffect(() => { apiRequest('/institutions/mine/list').then((rows) => { setInstitutions(rows); setId(rows[0]?._id || ''); }).catch((e) => { setInstitutions([]); onFlash(e.message); }); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  if (!institutions) return <p role="status" className="admin-notice">Loading...</p>;
  const institution = institutions.find((i) => i._id === id);
  if (!institution) return <p className="admin-notice">Register your institute first (My Institution tab).</p>;
  const verified = institution.verificationStatus === 'approved';
  return (
    <div className="institution-ui institution-hiring-page">
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>Jobs & Hiring</h2>
        {institutions.length > 1 && <select className="form-select" value={id} onChange={(e) => setId(e.target.value)} aria-label="Institute" style={{ maxWidth: 280 }}>{institutions.map((i) => <option key={i._id} value={i._id}>{i.name}</option>)}</select>}
      </div>
      <p className="text-sm" style={{ color: 'var(--ink-soft)', maxWidth: 720 }}>Publish vacancies, review applicants and manage hiring in one place. Recruit directly or work with an agent when you choose.</p>
      {!verified && <div className="u-alert warning mb-3"><span className="u-alert-ic">!</span><div className="u-alert-body"><strong>Verification needed</strong><p>Your institute can post jobs once Super Admin verifies it.</p></div></div>}
      <nav className="cz-tabbar" style={{ marginBottom: 16 }}>
        {[['jobs', 'Our Jobs & Applicants'], ['post', 'Post a Job'], ['agents', 'Agents (optional)']].map(([key, label]) => <button key={key} type="button" aria-pressed={sub === key} className={`cz-tab${sub === key ? ' active' : ''}`} onClick={() => setSub(key)} disabled={key !== 'jobs' && !verified}>{label}</button>)}
      </nav>
      {sub === 'post' && verified && <EmployerPostJobPanel key={institution._id} onFlash={onFlash} institution={institution} onPosted={() => { setReloadKey((k) => k + 1); setSub('jobs'); }} />}
      {sub === 'jobs' && <EmployerJobsPanel onFlash={onFlash} institution={institution} reloadKey={reloadKey} />}
      {sub === 'agents' && verified && <InstitutionAgentsPanel key={institution._id} institution={institution} onFlash={onFlash} />}
    </div>
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
      return true;
    } catch (err) { onFlash(err.message); } finally { setSaving(false); }
  }

  return (
    <div className="institution-ui institution-profile-ui">
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
        <SavedForm key={mine._id} value={editForm} onRestore={setEditForm} onSubmit={saveDetails} className="institution-details-card">
          <div className="institution-card-heading"><h3>Institution details</h3><p>Contact information and admission details for your institution.</p></div>
          <label className="institution-field"><span>City</span><input className="form-input" placeholder="City" value={editForm.city} onChange={(e) => setEditForm({ ...editForm, city: e.target.value })} /></label>
          <label className="institution-field"><span>Address</span><input className="form-input" placeholder="Address" value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} /></label>
          <label className="institution-field"><span>Description</span><textarea className="form-input" placeholder="Description" rows={3} value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} /></label>
          <label className="institution-field"><span>Contact email</span><input className="form-input" placeholder="Contact email" value={editForm.contactEmail} onChange={(e) => setEditForm({ ...editForm, contactEmail: e.target.value })} /></label>
          <label className="institution-field"><span>Contact phone</span><input className="form-input" placeholder="Contact phone" value={editForm.contactPhone} onChange={(e) => setEditForm({ ...editForm, contactPhone: e.target.value })} /></label>
          <label className="institution-field"><span>Website</span><input className="form-input" placeholder="Website" value={editForm.website} onChange={(e) => setEditForm({ ...editForm, website: e.target.value })} /></label>
          <label className="institution-field"><span>Admission requirements</span><textarea className="form-input" placeholder="Admission requirements" rows={3} value={editForm.admissionRequirements} onChange={(e) => setEditForm({ ...editForm, admissionRequirements: e.target.value })} /></label>
          <label className="block text-xs" style={{ color: 'var(--ink-soft)' }}>Admission deadline
            <input type="date" className="form-input" value={editForm.admissionDeadline} onChange={(e) => setEditForm({ ...editForm, admissionDeadline: e.target.value })} />
          </label>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Details'}</button>
        </SavedForm>
      )}
      {mine && <InstitutionProfileExtras institution={mine} onFlash={onFlash} onSaved={load} />}
    </div>
  );
}
