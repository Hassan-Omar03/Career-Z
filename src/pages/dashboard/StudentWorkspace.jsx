// Student workspace, moved out of Dashboard.jsx unchanged (master 17G.3: readable, maintainable code).
import OfflineStudy from '../../components/dashboard/OfflineStudy';
import ResourceLibrary from '../../components/dashboard/ResourceLibrary';
import FamilyCafeteria from '../../components/dashboard/FamilyCafeteria';
import { ConnectLearningCard, StudentAcademies } from '../../components/academy/Academy';
import { MyInternshipCertificates } from '../../components/dashboard/CareerTools';
import { MyFundingRequests } from '../../components/donors/FundingRequests';
import InstitutionCommunity from '../../components/dashboard/InstitutionCommunity';
import InstitutionInventory from '../../components/dashboard/InstitutionInventory';
import MedicalHealth from '../../components/dashboard/MedicalHealth';
import { Children, useEffect, useRef, useState } from 'react';
import { apiRequest, session } from '../../api/client';
import { FamilyConnections } from '../../components/dashboard/FamilyCenter';
import { StudentFamilyMeeting } from '../../components/dashboard/FamilyPolicy';
import useUrlTab from '../../hooks/useUrlTab';
import { FaArrowLeft, FaArrowUpRightFromSquare, FaAward, FaBell, FaBookOpen, FaBriefcase, FaCalendarCheck, FaChalkboardUser, FaChartLine, FaCheck, FaCircle, FaClipboardCheck, FaClipboardList, FaCommentDots, FaFaceSmile, FaFileLines, FaGraduationCap, FaLocationDot, FaLock, FaMagnifyingGlass, FaNewspaper, FaQrcode, FaShieldHalved, FaStore, FaUsers, FaWallet, FaXmark } from 'react-icons/fa6';
import { showConfirm, showPrompt } from '../../utils/appDialog';
import { PDF_COLORS, addPdfFooter, createBrandedPdf, drawPdfSummary, drawPdfTable } from '../../utils/brandedPdf';
import { isPlatformUploadAvailable, uploadToPlatformStorage } from '../../utils/platformUpload';
import { useRealtime } from '../../context/RealtimeContext';
import SavedForm from '../../components/shared/SavedForm';
import { ManualPayButton, ReceivingAccount } from '../../components/payments/ManualPay';
import { BuyerOrdersList, SellerReportPanel } from '../../components/marketplace/Escrow';
import { MiniCalendar, ProfileCompletion, QuickActions, RecentActivity, RecommendedGrid, WalletCard } from '../../components/dashboard/DashboardWidgets';
import { startAuthentication, startRegistration } from '@simplewebauthn/browser';
import QrScanner from '../../components/QrScanner';
import { ExamIntegrityMonitor } from '../../components/dashboard/QuestionBank';
import CareerZLiveClassroom from '../../components/CareerZLiveClassroom';
import { getJazzCashConfig, getSafepayConfig, startJazzCashCheckout, startSafepayCheckout } from '../../utils/jazzcashCheckout';
import LearningCenter from '../../components/dashboard/LearningCenter';
import LessonMetadata from '../../components/dashboard/LessonMetadata';
import CourseForum from '../../components/dashboard/CourseForum';
import AdmissionChoice, { useAdmissionOptions, admissionChoiceReady } from '../../components/institution/AdmissionChoice';
import { AI_PURPOSES, AddListingPanel, AiFeatureCard, AiSettingsPanel, COMPLETION_STATUS_LABEL, ComingSoon, CustomSelect, DOW_LABEL, JOB_APP_STATUS, LiveTransportMap, MyListingsPanel, PayFeeButton, ReceivedDonationsPanel, ScholarshipsPanel, SellerOrdersPanel, SellerWalletPanel, SlideDeckViewer, StudentJobsPanel, SummaryCard, Table, Tag, TeacherReputationWidget, TimetableView, downloadFeePdf, formatTime12h, nextDateForDow, resizeImageToDataUrl } from '../Dashboard';

// Applications Overview mixes Job/Scholarship/Institution/Course rows under one status field —
// Job rows carry the real 7-state JobApplication.status, everything else a simple pending/approved/rejected.
function overviewStatusDisplay(a) {
  if (a.type === 'Job') return JOB_APP_STATUS[a.status] || { tag: 'pending', label: a.status };
  const tag = a.status === 'rejected' ? 'rejected' : a.status === 'pending' ? 'pending' : 'approved';
  const label = tag === 'rejected' ? 'Rejected' : tag === 'pending' ? 'Pending' : 'Approved';
  return { tag, label };
}

export function StudentWorkspace({ tab, user, onFlash, onChanged, onNavigate }) {
  if (tab === 'learningCenter') return <StudentPanel onFlash={onFlash} />;
  if (tab === 'offlineStudy') return <OfflineStudy onFlash={onFlash} />;
  if (tab === 'aiAssistant') return <StudentAiAssistantPanel onFlash={onFlash} />;
  if (tab === 'profile') return null; // The unified student form is rendered above the workspace.
  if (tab === 'courses') return <StudentPanel onFlash={onFlash} />;
  if (tab === 'resourceLibrary') return <ResourceLibrary onFlash={onFlash} />;
  if (tab === 'wallet') return <StudentFeesPanel onFlash={onFlash} />;
  if(tab==='cafeteria')return <FamilyCafeteria studentId={user._id} onFlash={onFlash}/>;
  if (tab === 'summary') return <><ConnectLearningCard onNavigate={onNavigate} /><StudentSummary onNavigate={onNavigate} user={user} /></>;
  if (tab === 'myAcademies') return <div className="institution-ui"><StudentAcademies onFlash={onFlash} /></div>;
  if (tab === 'assignments') return <StudentAssignmentsPanel onFlash={onFlash} />;
  if (tab === 'attendance') return <StudentAttendancePanel onFlash={onFlash} />;
  if (tab === 'classes') return <><StudentScheduledLiveClasses user={user} onFlash={onFlash} /><StudentLiveClassBanner onFlash={onFlash} /><TimetableView onFlash={onFlash} url="/students/me/timetable" /></>;
  if (tab === 'jobs') return <StudentJobsPanel onFlash={onFlash} user={user} />;
  if (tab === 'certificates') return <><StudentCertificatesPanel onFlash={onFlash} /><MyInternshipCertificates onFlash={onFlash} /></>;
  if (tab === 'digitalLocker') return <StudentDigitalLockerPanel onFlash={onFlash} />;
  if (tab === 'studentId') return <StudentDigitalIdPanel onFlash={onFlash} />;
  if (tab === 'learningAnalytics') return <StudentLearningAnalyticsPanel onFlash={onFlash} />;
  if (tab === 'goals') return <StudentGoalsAchievementsPanel onFlash={onFlash} />;
  if (tab === 'community') return <StudentCommunityPanel onFlash={onFlash} user={user} />;
  if (tab === 'scholarships') return <ScholarshipsPanel onFlash={onFlash} user={user} />;
  if (tab === 'receivedDonations') return <><MyFundingRequests onFlash={onFlash} /><ReceivedDonationsPanel onFlash={onFlash} /></>;
  if (tab === 'marketplace') return <MarketplacePanel onFlash={onFlash} user={user} />;
  if (tab === 'institutions') return <StudentInstitutionsPanel onFlash={onFlash} />;
  if (tab === 'applications') return <StudentApplicationsPanel onFlash={onFlash} />;
  if (tab === 'campusLife') return <StudentCampusLifePanel onFlash={onFlash} />;
  if (tab === 'parentConnections') return <StudentParentConnectionsPanel onFlash={onFlash} />;
  if (tab === 'hostel') return <StudentHostelPanel onFlash={onFlash} />;
  if (tab === 'transport') return <StudentTransportPanel onFlash={onFlash} />;
  if (tab === 'library') return <StudentInstitutionLibraryPanel onFlash={onFlash} />;
  if (tab === 'events') return <InstitutionCommunity kind="events" onFlash={onFlash} />;
  if (tab === 'helpdesk') return <InstitutionCommunity kind="tickets" onFlash={onFlash} />;
  if (tab === 'inventory') return <InstitutionInventory onFlash={onFlash} />;
  if (tab === 'health') return <MedicalHealth mode="student" onFlash={onFlash} />;
  return <ComingSoon label={tab} />;
}

function StudentInstitutionLibraryPanel({ onFlash }) {
  const [data, setData] = useState(null);
  useEffect(() => { apiRequest('/institution-ops/mine/library').then(setData).catch((err) => onFlash(err.message)); }, [onFlash]);
  if (!data) return <p role="status" className="admin-notice">Loading library...</p>;
  return <div><h3 className="font-semibold mb-3">Institution Library</h3>
    <Table headers={['Institution', 'Title', 'Author', 'Type', 'Available', 'Digital access']} rows={data.books.map((book) => [book.institution?.name || 'Institution', book.title, book.author || '—', book.category.replaceAll('_', ' '), `${book.availableCopies}/${book.copies}`, book.fileUrl ? <a className="btn" href={book.fileUrl} target="_blank" rel="noreferrer">Open resource</a> : 'Physical item'])} empty="No library resources available." />
    <h4 className="font-semibold mt-6 mb-2">My Loans</h4>
    <Table headers={['Book', 'Borrowed', 'Due', 'Status', 'Fine']} rows={data.loans.map((loan) => [loan.book?.title || 'Removed item', new Date(loan.borrowedAt).toLocaleDateString(), new Date(loan.dueDate).toLocaleDateString(), <Tag status={loan.status === 'returned' ? 'approved' : loan.status === 'overdue' ? 'rejected' : 'pending'} label={loan.status} />, loan.fineAmount || '—'])} empty="You have no library loans." />
  </div>;
}

// Student-side management of parent/guardian links (spec: Student<->Parent "dedicated Parent
// Connection management, unlink/revoke flow") — approve/reject incoming requests from a parent,
// see who's currently linked, and revoke any link at any time (their own consent to withdraw).
function StudentParentConnectionsPanel({onFlash}) {return <><FamilyConnections student onFlash={onFlash} /><StudentFamilyMeeting onFlash={onFlash}/></>;}

// Every field here (dateOfBirth, program, currentTerm, guardianContact, careerGoal, skills,
// languages) was already accepted by PATCH /students/me on the backend but had no form
// anywhere in the UI to actually set it — this is that form.
function StudentCampusLifePanel({ onFlash }) {
  const [section, setSection] = useUrlTab('studentCampusLifePanel', 'ask');
  const [myQuestions, setMyQuestions] = useState(null);
  const [askForm, setAskForm] = useState({ course: '', question: '' });
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [polls, setPolls] = useState(null);
  const [newsletters, setNewsletters] = useState(null);
  const [magazine, setMagazine] = useState(null);
  const [mySubmissions, setMySubmissions] = useState(null);
  const [subForm, setSubForm] = useState({ title: '', type: 'article', content: '' });
  const [resubmitDrafts, setResubmitDrafts] = useState({});

  function loadQuestions() { apiRequest('/anonymous-questions/mine').then(setMyQuestions).catch((err) => onFlash(err.message)); }
  function loadPolls() { apiRequest('/polls/available').then(setPolls).catch((err) => onFlash(err.message)); }
  function loadNewsletters() { apiRequest('/newsletters/published').then(setNewsletters).catch((err) => onFlash(err.message)); }
  function loadMagazine() { apiRequest('/magazine/published').then(setMagazine).catch((err) => onFlash(err.message)); }
  function loadMySubmissions() { apiRequest('/magazine/mine').then(setMySubmissions).catch((err) => onFlash(err.message)); }
  useEffect(() => {
    apiRequest('/students/me/enrollments').then((list) => {
      const courses = (list || []).filter((e) => e.status !== 'dropped' && e.course).map((e) => e.course);
      setEnrolledCourses(courses);
      setAskForm((f) => ({ ...f, course: f.course || courses[0]?._id || '' }));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (section === 'ask') loadQuestions();
    if (section === 'polls') loadPolls();
    if (section === 'newsletter') loadNewsletters();
    if (section === 'magazine') { loadMagazine(); loadMySubmissions(); }
  }, [section]);

  async function askQuestion(e) {
    e.preventDefault();
    if (!askForm.course) return onFlash('Pick which class this question is about.');
    try {
      await apiRequest('/anonymous-questions', { method: 'POST', body: askForm });
      onFlash('Question sent anonymously.', 'success');
      setAskForm((f) => ({ ...f, question: '' }));
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
  async function resubmitToMagazine(id) {
    const draft = resubmitDrafts[id];
    if (!draft?.title?.trim() || !draft?.content?.trim()) return onFlash('Title and content are required.');
    try {
      await apiRequest(`/magazine/${id}/resubmit`, { method: 'PATCH', body: draft });
      onFlash('Resubmitted for review.', 'success');
      setResubmitDrafts((d) => { const next = { ...d }; delete next[id]; return next; });
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
            <label className="text-xs" style={{ color: 'var(--ink-soft)', fontWeight: 600 }}>Which class is this about?
              <select className="form-select" value={askForm.course} onChange={(e) => setAskForm({ ...askForm, course: e.target.value })} style={{ marginTop: 6 }} required>
                <option value="">Select a class…</option>
                {enrolledCourses.map((c) => <option key={c._id} value={c._id}>{c.title}</option>)}
              </select>
            </label>
            <textarea className="form-input" placeholder="Your question" rows={3} value={askForm.question} onChange={(e) => setAskForm({ ...askForm, question: e.target.value })} required />
            <button type="submit" className="btn btn-primary" style={{ justifySelf: 'start', padding: '9px 20px' }} disabled={enrolledCourses.length === 0}>Ask Anonymously</button>
            {enrolledCourses.length === 0 && <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>Enroll in a class first — a question has to belong to one.</p>}
          </form>
          <h4 className="font-semibold mb-2" style={{ fontSize: '0.85rem' }}>My Questions</h4>
          <Table
            loading={myQuestions === null}
            headers={['Class', 'Question', 'Status', 'Answer']}
            rows={(myQuestions || []).map((q) => [q.course?.title || '—', q.question, <Tag status={q.status === 'answered' ? 'approved' : 'pending'} />, q.answer || '—'])}
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
              <p className="font-medium" style={{ marginBottom: 4 }}>{p.question}</p>
              <p className="text-xs" style={{ color: 'var(--ink-soft)', marginBottom: 12 }}>{p.course?.title || 'Institution-wide'}</p>
              {p.myVote !== null ? (
                <div style={{ display: 'grid', gap: 6 }}>
                  <p className="flex items-center text-sm" style={{ gap: 8, color: 'var(--forest)', fontWeight: 600, margin: 0 }}>
                    <FaClipboardCheck aria-hidden="true" size={13} /> You voted: {p.options[p.myVote]?.text}
                  </p>
                  {p.options.map((o, i) => (
                    <div key={i} style={{ fontSize: 12 }}>
                      <div className="flex items-center justify-between"><span>{o.text}</span><span style={{ color: 'var(--ink-soft)' }}>{o.votes} · {o.percent}%</span></div>
                      <div style={{ height: 6, background: 'var(--sand)', borderRadius: 999, marginTop: 3 }}><div style={{ height: '100%', width: `${o.percent}%`, background: i === p.myVote ? 'var(--forest)' : 'var(--sand-line)', borderRadius: 999 }} /></div>
                    </div>
                  ))}
                </div>
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
          <form onSubmit={submitToMagazine} className="nl-form student-form">
            <div className="nl-form-head"><h4>Submit your work</h4><p>Your teacher reviews it before it appears in the student magazine.</p></div>
            <div className="assign-grid">
            <label className="institution-field"><span>Title</span><input className="form-input" placeholder="e.g. My first poem" value={subForm.title} onChange={(e) => setSubForm({ ...subForm, title: e.target.value })} required /></label>
            <div className="institution-field"><span>Type</span><CustomSelect
              value={subForm.type} onChange={(v) => setSubForm({ ...subForm, type: v })} ariaLabel="Submission type" minWidth="100%"
              options={['article', 'poetry', 'artwork', 'story', 'other'].map((t) => ({ value: t, label: t.charAt(0).toUpperCase() + t.slice(1) }))}
            /></div>
            <label className="institution-field assign-wide"><span>Your work</span><textarea className="form-input" placeholder="Write or paste your work here" rows={6} value={subForm.content} onChange={(e) => setSubForm({ ...subForm, content: e.target.value })} required /></label>
            </div>
            <div className="nl-form-foot"><button type="submit" className="btn btn-primary">Submit</button></div>
          </form>
          <h4 className="font-semibold mb-2" style={{ fontSize: '0.85rem' }}>My Submissions</h4>
          {mySubmissions === null && <p className="admin-notice">Loading...</p>}
          {mySubmissions?.length === 0 && <p className="admin-notice">You haven't submitted anything yet.</p>}
          <div style={{ display: 'grid', gap: 10, marginBottom: 28 }}>
            {(mySubmissions || []).map((s) => {
              const STATUS_TAG = { published: 'approved', rejected: 'rejected', selected: 'approved', changes_requested: 'pending', submitted: 'pending' };
              const draft = resubmitDrafts[s._id];
              return (
                <div key={s._id} style={{ padding: 14, border: '1px solid var(--sand-line)', borderRadius: 12 }}>
                  <div className="flex items-center justify-between">
                    <strong className="text-sm">{s.title}</strong>
                    <Tag status={STATUS_TAG[s.status]} label={s.status.replace('_', ' ')} />
                  </div>
                  <p className="text-xs" style={{ color: 'var(--ink-soft)', margin: '4px 0 0' }}>{s.type}</p>
                  {s.status === 'changes_requested' && (
                    <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--sand-line)' }}>
                      <p className="text-xs" style={{ color: 'var(--gold)', fontWeight: 600, marginBottom: 8 }}>Teacher's notes: {s.editorNotes}</p>
                      {!draft ? (
                        <button type="button" className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.75rem' }} onClick={() => setResubmitDrafts((d) => ({ ...d, [s._id]: { title: s.title, type: s.type, content: s.content } }))}>Edit &amp; Resubmit</button>
                      ) : (
                        <div style={{ display: 'grid', gap: 8 }}>
                          <input className="form-input" value={draft.title} onChange={(e) => setResubmitDrafts((d) => ({ ...d, [s._id]: { ...d[s._id], title: e.target.value } }))} />
                          <textarea className="form-input" rows={4} value={draft.content} onChange={(e) => setResubmitDrafts((d) => ({ ...d, [s._id]: { ...d[s._id], content: e.target.value } }))} />
                          <div className="flex gap-2">
                            <button type="button" className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.75rem' }} onClick={() => resubmitToMagazine(s._id)}>Resubmit</button>
                            <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.75rem' }} onClick={() => setResubmitDrafts((d) => { const next = { ...d }; delete next[s._id]; return next; })}>Cancel</button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
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

const MEMBERSHIP_STATUS_TAG = { active: 'approved', graduated: 'approved', transferred: 'pending', withdrawn: 'rejected' };

function StudentInstitutionsPanel({ onFlash }) {
  const [profile, setProfile] = useState(null);
  const [memberships, setMemberships] = useState(null);
  const [options, setOptions] = useState([]);
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState('');
  const [inquiryForm, setInquiryForm] = useState({ interestedProgram: '', qualification: '', country: '', message: '' });
  const [appForm, setAppForm] = useState({ program: '', hostel: false, mess: false, transport: false });
  // Level, subject group and electives for programs that use them (Point 22).
  const [admissionChoice, setAdmissionChoice] = useState({});
  const admissionOptions = useAdmissionOptions(selected);
  const [institutionPrograms, setInstitutionPrograms] = useState([]);
  const [fairs, setFairs] = useState([]);
  const [registeredFairIds, setRegisteredFairIds] = useState([]);

  function load() {
    apiRequest('/students/me').then(setProfile).catch((err) => onFlash(err.message));
    apiRequest('/students/me/institutions').then(setMemberships).catch(() => setMemberships([]));
  }
  useEffect(load, []);

  function search() {
    apiRequest(`/institutions${q ? `?q=${encodeURIComponent(q)}` : ''}`).then(setOptions).catch((err) => onFlash(err.message));
  }
  useEffect(search, []);

  useEffect(() => {
    if (!selected) { setInstitutionPrograms([]); setAppForm({ program: '', hostel: false, mess: false, transport: false }); return; }
    apiRequest(`/institutions/${selected}/programs`, { auth: false }).then(setInstitutionPrograms).catch(() => setInstitutionPrograms([]));
    setAppForm({ program: '', hostel: false, mess: false, transport: false });
  }, [selected]);

  useEffect(() => {
    apiRequest('/virtual-fairs').then(setFairs).catch(() => {});
    apiRequest('/virtual-fairs/mine/registered').then((list) => setRegisteredFairIds(list.map((f) => f._id))).catch(() => {});
  }, []);

  async function connect() {
    if (!selected) return;
    try {
      await apiRequest('/students/me/connect-institution', { method: 'POST', body: { institutionId: selected } });
      onFlash('Connection request sent. The institution must approve it.', 'success');
      load();
    } catch (err) { onFlash(err.message); }
  }

  async function requestExit(membership, action) {
    const reason = await showPrompt(`${action === 'transfer' ? 'Transfer' : 'Withdrawal'} reason`, { title: 'Institution request', required: true });
    if (reason === null) return;
    let targetInstitutionId = '';
    if (action === 'transfer') {
      targetInstitutionId = await showPrompt('Enter destination institution ID', { title: 'Transfer destination', required: true });
      if (!targetInstitutionId) return;
    }
    try {
      await apiRequest(`/students/me/institutions/${membership._id}/request-exit`, { method: 'POST', body: { action, reason, targetInstitutionId } });
      onFlash(`${action} request sent for approval.`, 'success'); load();
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
      if (!admissionChoiceReady(admissionOptions, appForm.program, admissionChoice)) return onFlash('Choose the class or semester, the subject group and the allowed number of electives.');
      await apiRequest('/institution-applications', { method: 'POST', body: { institution: selected, program: appForm.program, ...admissionChoice, requestedServices: { hostel: appForm.hostel, mess: appForm.mess, transport: appForm.transport }, submit: true } });
      onFlash('Application submitted.', 'success');
      setAppForm({ program: '', hostel: false, mess: false, transport: false }); setAdmissionChoice({});
    } catch (err) { onFlash(err.message); }
  }

  async function registerFair(id) {
    try { await apiRequest(`/virtual-fairs/${id}/register`, { method: 'POST' }); setRegisteredFairIds((p) => [...p, id]); onFlash('Registered for the fair.', 'success'); } catch (err) { onFlash(err.message); }
  }

  if (!profile) return <p role="status" className="admin-notice">Loading...</p>;

  return (
    <div>
      <h3 className="font-semibold mb-2">My Institutions</h3>
      {memberships === null && <p role="status" className="admin-notice">Loading...</p>}
      {memberships?.length === 0 && (
        <div className="border border-[var(--sand-line)] rounded-xl p-4 mb-6" style={{ maxWidth: 420 }}>
          <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>You are not connected to an institution yet.</p>
        </div>
      )}
      {memberships && memberships.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-6" style={{ maxWidth: 860 }}>
          {memberships.map((m) => (
            <div key={m._id} className="border border-[var(--sand-line)] rounded-xl p-4">
              <div className="flex items-center justify-between flex-wrap" style={{ gap: 6 }}>
                <strong>{m.institution?.name}</strong>
                <Tag status={MEMBERSHIP_STATUS_TAG[m.status] || 'pending'} label={m.status} />
              </div>
              <p className="text-xs text-[var(--ink-soft)] mt-1">{m.institution?.type} · {m.institution?.country}{m.isPrimary ? ' · Primary' : ''}</p>
              {m.program && <p className="text-xs mt-1">Program: {m.program}</p>}
              {m.isPrimary && profile.classSection?.name && <p className="text-xs mt-1">Class / Grade: {profile.classSection.name}{profile.classSection.academicYear ? ` (${profile.classSection.academicYear})` : ''}</p>}
              {m.isPrimary && profile.rollNumber && <p className="text-xs mt-1">Roll No: {profile.rollNumber}</p>}
              <p className="text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>
                Joined {new Date(m.joinedAt).toLocaleDateString()}{m.leftAt ? ` · Left ${new Date(m.leftAt).toLocaleDateString()}` : ''}
              </p>
              {m.status === 'active' && <div className="flex gap-2 mt-2"><button type="button" className="btn" onClick={() => requestExit(m, 'withdraw')}>Request Withdrawal</button><button type="button" className="btn" onClick={() => requestExit(m, 'transfer')}>Request Transfer</button></div>}
              {m.targetInstitution?.name && <p className="text-xs mt-1">Transfer destination: {m.targetInstitution.name}</p>}
            </div>
          ))}
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
          <button type="button" className="btn btn-primary" onClick={connect} disabled={!selected} style={{ flexShrink: 0 }}>Request Connection</button>
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
        <select className="form-select" value={appForm.program} onChange={(e) => { setAppForm({ program: e.target.value, hostel: false, mess: false, transport: false }); setAdmissionChoice({}); }} required style={{ flex: '1 1 280px', minWidth: 0 }} disabled={!selected}>
          <option value="">{selected ? 'Select a published program' : 'Select an institution first'}</option>
          {institutionPrograms.map((program) => <option key={program._id} value={program.name}>{program.name} — {program.currency} {Number(program.admissionFee) + Number(program.totalTuitionFee) + Object.values(program.additionalFees || {}).filter((item) => item?.enabled).reduce((sum, item) => sum + Number(item.amount || 0), 0)}</option>)}
        </select>
        {appForm.program && <div style={{ flex: '1 1 100%' }}><AdmissionChoice options={admissionOptions} programName={appForm.program} value={admissionChoice} onChange={setAdmissionChoice} /></div>}
        {(() => { const program = institutionPrograms.find((item) => item.name === appForm.program); return program?.additionalFees?.hostel?.enabled ? <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={appForm.hostel} onChange={(e) => setAppForm({ ...appForm, hostel: e.target.checked })} />I need hostel (+{program.currency} {program.additionalFees.hostel.amount})</label> : null; })()}
        {(() => { const program = institutionPrograms.find((item) => item.name === appForm.program); return appForm.hostel && program?.additionalFees?.hostel?.messAvailable ? <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={appForm.mess} onChange={(e) => setAppForm({ ...appForm, mess: e.target.checked })} />Include mess (+{program.currency} {program.additionalFees.hostel.messMonthlyAmount}/month)</label> : null; })()}
        {(() => { const program = institutionPrograms.find((item) => item.name === appForm.program); return program?.additionalFees?.transport?.enabled ? <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={appForm.transport} onChange={(e) => setAppForm({ ...appForm, transport: e.target.checked })} />I need transport (+{program.currency} {program.additionalFees.transport.amount})</label> : null; })()}
        <button type="submit" className="btn btn-primary" disabled={!selected} style={{ flexShrink: 0 }}>Submit Application</button>
      </form>
      {appForm.program && (() => {
        const program = institutionPrograms.find((item) => item.name === appForm.program);
        if (!program) return null;
        const extras = Object.entries(program.additionalFees || {}).filter(([type, value]) => value?.enabled && Number(value.amount) > 0 && (type !== 'hostel' || appForm.hostel) && (type !== 'transport' || appForm.transport));
        const extrasTotal = extras.reduce((sum, [, value]) => sum + Number(value.amount), 0);
        return <div className="admin-notice" style={{ marginTop: -12, marginBottom: 24 }}>
          <strong>{program.name}</strong> · {program.department} · {program.durationTerms} terms · Class/section: {program.classSection?.name || 'assigned on admission'}<br />
          Admission fee: <strong>{program.currency} {program.admissionFee}</strong> · Complete tuition: <strong>{program.currency} {program.totalTuitionFee}</strong> · {program.installments} installments of approximately <strong>{program.currency} {(Number(program.totalTuitionFee) / Number(program.installments)).toFixed(2)}</strong><br />
          Additional charges: <strong>{extras.length ? extras.map(([type, value]) => `${type} ${program.currency} ${value.amount}`).join(', ') : 'None'}</strong><br />
          Total program charges: <strong>{program.currency} {Number(program.admissionFee) + Number(program.totalTuitionFee) + extrasTotal}</strong>. Your application stores this fee plan so later price changes do not silently change your agreed amount.
        </div>;
      })()}

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
                {f.brochureUrl && <a className="btn" style={{ padding: '5px 14px', fontSize: '0.75rem' }} href={f.brochureUrl} target="_blank" rel="noreferrer"><FaFileLines aria-hidden="true" /> Brochure</a>}
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
  const [memberships, setMemberships] = useState(null);
  const [admissionTestSession, setAdmissionTestSession] = useState(null);
  const [admissionAnswers, setAdmissionAnswers] = useState({});
  const [admissionResult, setAdmissionResult] = useState(null);
  const [testNow, setTestNow] = useState(Date.now());

  useEffect(() => {
    apiRequest('/jobs/mine/applications').then(setJobApps).catch((err) => onFlash(err.message));
    apiRequest('/scholarships/mine/applications').then(setScholarshipApps).catch((err) => onFlash(err.message));
    apiRequest('/students/me').then(setProfile).catch((err) => onFlash(err.message));
    apiRequest('/students/me/enrollments').then(setEnrollments).catch((err) => onFlash(err.message));
    apiRequest('/institution-applications/mine').then(setProgramApps).catch((err) => onFlash(err.message));
    apiRequest('/students/me/institutions').then(setMemberships).catch(() => setMemberships([]));
  }, [onFlash]);

  useEffect(() => {
    if (!admissionTestSession) return undefined;
    const timer = setInterval(() => setTestNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [admissionTestSession]);

  async function startAdmissionTest(applicationId) {
    try {
      const session = await apiRequest(`/institution-applications/${applicationId}/test/start`, { method: 'POST' });
      setAdmissionTestSession(session); setAdmissionAnswers({}); setAdmissionResult(null); setTestNow(Date.now());
    } catch (err) { onFlash(err.message); }
  }

  async function submitAdmissionTest() {
    try {
      const answers = Object.entries(admissionAnswers).map(([questionIndex, selectedOption]) => ({ questionIndex: Number(questionIndex), selectedOption: Number(selectedOption) }));
      const result = await apiRequest(`/institution-applications/${admissionTestSession.applicationId}/test/submit`, { method: 'POST', body: { answers } });
      setAdmissionResult(result); setAdmissionTestSession(null);
      apiRequest('/institution-applications/mine').then(setProgramApps).catch(() => {});
      onFlash(`Test submitted: ${result.score}/${result.maxScore}`, result.passed ? 'success' : undefined);
    } catch (err) { onFlash(err.message); }
  }

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
        headers={['Institution', 'Program', 'Status', 'Progress', 'Admission Test', 'Missing Documents']}
        rows={(programApps || []).map((a) => [a.institution?.name, a.program, <Tag status={a.status === 'accepted' ? 'approved' : a.status === 'rejected' ? 'rejected' : 'pending'} />, `${a.admissionProgress}%`, a.admissionTest?.test ? (
          <div>
            <div className="text-xs">{a.admissionTest.scheduledAt ? new Date(a.admissionTest.scheduledAt).toLocaleString() : 'Scheduled'} · {a.admissionTest.status?.replace('_', ' ')}</div>
            {['scheduled', 'in_progress'].includes(a.admissionTest.status) && <button type="button" className="btn btn-primary mt-1" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={() => startAdmissionTest(a._id)}>{a.admissionTest.status === 'in_progress' ? 'Resume Test' : 'Start Test'}</button>}
            {['passed', 'failed'].includes(a.admissionTest.status) && <strong className="text-xs">{a.admissionTest.score}/{a.admissionTest.maxScore} · {a.admissionTest.status}</strong>}
          </div>
        ) : a.admissionTest?.scheduledAt ? 'Manual test scheduled' : 'Not assigned', a.missingRequirements?.length ? a.missingRequirements.join(', ') : '—'])}
        empty="No program applications yet — go to My Institutions to apply."
      />
      {admissionTestSession && (() => {
        const seconds = Math.max(0, Math.floor((new Date(admissionTestSession.endsAt).getTime() - testNow) / 1000));
        return <div className="card mt-4" style={{ padding: 20 }}>
          <div className="flex items-center justify-between gap-3"><div><h3 className="font-semibold">{admissionTestSession.test.title}</h3><p className="text-xs" style={{ color: 'var(--ink-soft)' }}>{admissionTestSession.test.instructions || 'Select one answer for each question.'}</p></div><strong style={{ color: seconds < 60 ? 'var(--rose)' : 'var(--forest)' }}>{Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}</strong></div>
          <div style={{ display: 'grid', gap: 14, marginTop: 16 }}>{admissionTestSession.test.questions.map((q) => <fieldset key={q.index} className="border border-[var(--sand-line)] rounded-xl p-3"><legend className="text-sm font-semibold">{q.index + 1}. {q.text} ({q.marks} mark{q.marks === 1 ? '' : 's'})</legend>{q.options.map((option, oi) => <label key={oi} className="flex items-center gap-2 text-sm mt-2"><input type="radio" name={`admission-q-${q.index}`} checked={Number(admissionAnswers[q.index]) === oi} onChange={() => setAdmissionAnswers({ ...admissionAnswers, [q.index]: oi })} />{option}</label>)}</fieldset>)}</div>
          <button type="button" className="btn btn-primary mt-4" onClick={submitAdmissionTest}>Submit Test</button>
        </div>;
      })()}
      {admissionResult && <div className="admin-notice mt-3"><strong>{admissionResult.passed ? 'Passed' : 'Not passed'}</strong> — Score {admissionResult.score}/{admissionResult.maxScore} ({admissionResult.percent}%).</div>}

      <h3 className="font-semibold mb-2 mt-6">Institution Connection</h3>
      <p className="text-xs mb-2" style={{ color: 'var(--ink-soft)' }}>Connecting sends a request to the institution. It shows as Pending until the institution approves it, and you get a notification when they decide. This is separate from the formal Program Applications above.</p>
      <Table
        loading={profile === null}
        headers={['Institution', 'Status', 'Connected']}
        rows={(memberships || []).map((m) => [m.institution?.name || '—', <Tag status={MEMBERSHIP_STATUS_TAG[m.status] || 'pending'} label={m.status === 'pending' ? 'Pending approval' : m.status} />, m.joinedAt ? new Date(m.joinedAt).toLocaleDateString() : m.createdAt ? `Requested ${new Date(m.createdAt).toLocaleDateString()}` : '—'])}
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
  const [transcripts, setTranscripts] = useState(null);
  useEffect(() => {
    apiRequest('/students/me/certificates').then(setCertificates).catch((err) => onFlash(err.message));
    apiRequest('/students/me/transcripts').then(setTranscripts).catch((err) => onFlash(err.message));
  }, [onFlash]);

  async function downloadCertificate(certificate) {
    try {
      const { jsPDF } = await import('jspdf');
      const credentialName = certificate.type === 'degree' ? 'Degree' : certificate.type === 'diploma' ? 'Diploma' : certificate.type === 'training' ? 'Training Certificate' : certificate.type === 'achievement' ? 'Certificate of Achievement' : 'Certificate of Completion';
      const doc = await createBrandedPdf(jsPDF, { title: credentialName, subtitle: 'Digitally issued and independently verifiable', orientation: 'landscape' });
      doc.setDrawColor(...PDF_COLORS.gold); doc.setLineWidth(1.2); doc.roundedRect(12, 40, 273, 151, 3, 3);
      doc.setFont('times', 'normal'); doc.setTextColor(...PDF_COLORS.muted); doc.setFontSize(14); doc.text('This certificate is proudly presented to', 148.5, 70, { align: 'center' });
      doc.setFont('times', 'bold'); doc.setTextColor(...PDF_COLORS.forest); doc.setFontSize(29); doc.text(certificate.studentName || 'Student', 148.5, 88, { align: 'center' });
      doc.setDrawColor(...PDF_COLORS.gold); doc.line(78, 94, 219, 94);
      doc.setFontSize(19); doc.text(doc.splitTextToSize(certificate.title, 180), 148.5, 108, { align: 'center' });
      doc.setFont('helvetica', 'normal'); doc.setTextColor(...PDF_COLORS.muted); doc.setFontSize(11); doc.text(`Issued by ${certificate.institution?.name || 'Institution'} on ${new Date(certificate.issueDate).toLocaleDateString()}`, 148.5, 128, { align: 'center' });
      if (certificate.finalGrade || certificate.percentage !== null) doc.text(`Grade: ${certificate.finalGrade || '—'}   •   Percentage: ${certificate.percentage ?? '—'}%`, 148.5, 137, { align: 'center' });
      doc.addImage(certificate.qrDataUrl, 'PNG', 133.5, 143, 30, 30);
      doc.setFontSize(8); doc.text(`Verification ID: ${certificate.verifyCode}`, 148.5, 179, { align: 'center' });
      addPdfFooter(doc);
      doc.save(`${certificate.title.replace(/[^a-z0-9]+/gi, '-')}.pdf`);
    } catch (error) { onFlash(error.message); }
  }

  async function downloadTranscript(transcript) {
    const { jsPDF } = await import('jspdf');
    const doc = await createBrandedPdf(jsPDF, { title: 'Official Academic Transcript', subtitle: transcript.institution?.name || 'CareerZ verified academic record', orientation: 'landscape' });
    const y = drawPdfSummary(doc, [{ label: 'Student', value: transcript.student?.fullName || '—' }, { label: 'Roll number', value: transcript.rollNumber || '—' }, { label: 'Program', value: transcript.programName || '—' }, { label: 'CGPA / Credits', value: `${transcript.cgpa.toFixed(2)} / ${Number(transcript.gpaScaleMax || 4).toFixed(2)} · ${transcript.totalCredits} credits` }]);
    drawPdfTable(doc, { headers: ['Session', 'Semester / Term', 'Subject', 'Credits', 'Marks', 'Grade', 'Points'], rows: transcript.rows.map((row) => [row.academicSession || '—', row.term || '—', row.subject, row.creditHours, `${row.marksObtained}/${row.totalMarks} (${row.percentage}%)`, row.grade, row.gradePoints]), startY: y + 3 });
    addPdfFooter(doc); doc.save(`academic-transcript-${transcript.rollNumber || 'student'}.pdf`);
  }

  if (certificates === null || transcripts === null) return <p role="status" className="admin-notice">Loading...</p>;

  return (
    <div className="grid grid-cols-1 gap-4">
      {certificates.length === 0 && <p className="admin-notice">No certificates issued to you yet.</p>}
      {certificates.map((c) => (
        <div key={c._id} className="border border-[var(--sand-line)] rounded-xl p-4 flex items-center gap-4">
          <img src={c.qrDataUrl} alt="Verification QR code" style={{ width: 96, height: 96 }} />
          <div style={{ flex: 1 }}>
            <strong>{c.title}</strong>
            <p className="text-xs text-[var(--ink-soft)]">{c.institution?.name} · {c.course?.title || 'Credential'} · Issued {new Date(c.issueDate).toLocaleDateString()}</p>
            {(c.finalGrade || c.percentage !== null) && <p className="text-xs"><strong>Grade:</strong> {c.finalGrade || '—'} · <strong>Percentage:</strong> {c.percentage ?? '—'}%</p>}
            <a href={c.verifyUrl} target="_blank" rel="noreferrer" className="text-xs flex items-center" style={{ color: 'var(--emerald)', gap: 4, display: 'inline-flex' }}>Verification link <FaArrowUpRightFromSquare aria-hidden="true" size={10} /></a>
            <button type="button" className="btn" style={{ padding: '5px 10px', fontSize: '0.72rem', marginLeft: 10 }} onClick={() => downloadCertificate({ ...c, studentName: c.student?.fullName || 'Student' })}>Download PDF</button>
          </div>
        </div>
      ))}
      <h3 className="font-semibold mt-6">Academic Transcripts</h3>
      {transcripts.length === 0 && <p className="admin-notice">No official transcript has been issued yet.</p>}
      {transcripts.map((transcript) => <div key={transcript._id} className="card" style={{ padding: 18 }}><strong>{transcript.programName || 'Academic Transcript'}</strong><p className="text-xs" style={{ color: 'var(--ink-soft)' }}>{transcript.institution?.name} · CGPA {transcript.cgpa.toFixed(2)} / {Number(transcript.gpaScaleMax || 4).toFixed(2)} · {transcript.totalCredits} credits · Issued {new Date(transcript.issueDate).toLocaleDateString()}</p><Table headers={['Session', 'Term', 'Credits', 'GPA']} rows={transcript.semesterSummaries.map((term) => [term.academicSession || '—', term.term, term.credits, term.gpa.toFixed(2)])} empty="No semester summary." /><button type="button" className="btn btn-primary mt-3" onClick={() => downloadTranscript(transcript)}>Download Official Transcript PDF</button></div>)}
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
// institution-issued Certificates. Uploads real cloud storage once platform storage is
// configured (higher size limit); otherwise falls back to the original base64-on-document
// behavior (images resized, other files capped at 3MB raw so the base64-inflated body still
// fits the server's request-size limit) — the "paste a link" option always works either way.
const LOCKER_MAX_FILE_BYTES = 3 * 1024 * 1024;

const LOCKER_MAX_UPLOAD_BYTES = 15 * 1024 * 1024;

async function readLockerFile(file) {
  if (file.type.startsWith('image/')) return resizeImageToDataUrl(file, 1200, 0.82, 'locker');

  const available = await isPlatformUploadAvailable();
  if (available) {
    if (file.size > LOCKER_MAX_UPLOAD_BYTES) {
      throw new Error(`That file is ${(file.size / (1024 * 1024)).toFixed(1)}MB — over the 15MB upload limit. Host it somewhere and paste the link instead.`);
    }
    return uploadToPlatformStorage(file, 'locker');
  }

  if (file.size > LOCKER_MAX_FILE_BYTES) {
    throw new Error(`That file is ${(file.size / (1024 * 1024)).toFixed(1)}MB — over the 3MB direct-upload limit. Host it somewhere and paste the link instead.`);
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
                <FaCheck aria-hidden="true" /> {fileName}
                <button type="button" aria-label="Remove selected file" onClick={clearFile} style={{ border: 'none', background: 'var(--sand-line)', borderRadius: '50%', width: 18, height: 18, lineHeight: 1, cursor: 'pointer', color: 'var(--ink)' }}><FaXmark aria-hidden="true" /></button>
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
      const { computeDescriptorFromImageUrl } = await import('../../utils/faceApi');
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
            {id.verifyUrl && <p className="text-xs" style={{ marginTop: 6, overflowWrap: 'anywhere' }}><strong>Student ID number:</strong> {id.verifyUrl.split('/').pop()}</p>}
            <a href={id.verifyUrl} target="_blank" rel="noreferrer" className="text-xs flex items-center" style={{ color: 'var(--emerald)', display: 'inline-flex', marginTop: 6, gap: 4 }}>Open verification link <FaArrowUpRightFromSquare aria-hidden="true" size={10} /></a>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 20, maxWidth: 420, marginTop: 20 }}>
        <h4 className="font-semibold mb-2" style={{ fontSize: '0.9rem' }}>Face Scan Attendance</h4>
        <p className="text-xs mb-3" style={{ color: 'var(--ink-soft)' }}>
          Optional — enroll your face (computed from your profile photo, entirely in your browser) so your teacher can mark you present with a camera scan instead of a QR code. Only a set of numbers is stored, never the photo itself, and accuracy is moderate (a regular webcam, not dedicated biometric hardware).
        </p>
        <button type="button" className="btn btn-primary" onClick={enrollFace} disabled={enrolling}>
          {enrolling ? 'Enrolling...' : faceEnrolled ? <span className="flex items-center" style={{ gap: 5, justifyContent: 'center' }}><FaCheck aria-hidden="true" /> Face Enrolled</span> : 'Enroll My Face'}
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
  const [sub, setSub] = useUrlTab('studentGoalsAchievementsPanel', 'goals');
  const tabs = [
    { key: 'goals', label: 'Goals' },
    { key: 'timeline', label: 'Achievement Timeline' },
    { key: 'achievements', label: 'My Achievements' },
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
      {sub === 'achievements' && <StudentAchievementsSubPanel onFlash={onFlash} />}
      {sub === 'badges' && <StudentBadgesSubPanel onFlash={onFlash} />}
    </div>
  );
}

const VERIFIED_GOAL_CATEGORIES = new Set(['academic', 'scholarship', 'job']);

function StudentGoalsSubPanel({ onFlash }) {
  const [goals, setGoals] = useState(null);
  const [form, setForm] = useState({ title: '', category: 'academic', targetDate: '', milestoneInput: '', milestones: [] });
  const [adding, setAdding] = useState(false);
  const [evidenceDrafts, setEvidenceDrafts] = useState({});

  function load() { apiRequest('/students/me/goals').then(setGoals).catch((err) => onFlash(err.message)); }
  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  function addMilestoneField() {
    if (!form.milestoneInput.trim()) return;
    setForm((f) => ({ ...f, milestones: [...f.milestones, { title: f.milestoneInput.trim() }], milestoneInput: '' }));
  }

  async function addGoal(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setAdding(true);
    try {
      await apiRequest('/students/me/goals', { method: 'POST', body: { title: form.title, category: form.category, targetDate: form.targetDate || undefined, milestones: form.milestones } });
      onFlash('Goal added.', 'success');
      setForm({ title: '', category: 'academic', targetDate: '', milestoneInput: '', milestones: [] });
      load();
    } catch (err) { onFlash(err.message); } finally { setAdding(false); }
  }
  async function setProgress(goal, progressPercent) {
    if (progressPercent >= 100 && VERIFIED_GOAL_CATEGORIES.has(goal.category) && !goal.evidenceUrl && !evidenceDrafts[goal._id]) {
      onFlash('This goal needs evidence before it can be marked 100% — paste a link below first (score report, offer letter, award letter).');
      return;
    }
    try {
      const body = { progressPercent };
      if (evidenceDrafts[goal._id]) body.evidenceUrl = evidenceDrafts[goal._id];
      await apiRequest(`/students/me/goals/${goal._id}`, { method: 'PATCH', body });
      load();
    } catch (err) { onFlash(err.message); }
  }
  async function toggleMilestone(goal, milestoneId, done) {
    try { await apiRequest(`/students/me/goals/${goal._id}/milestones/${milestoneId}`, { method: 'PATCH', body: { done } }); load(); } catch (err) { onFlash(err.message); }
  }
  async function abandonGoal(id) {
    try { await apiRequest(`/students/me/goals/${id}`, { method: 'PATCH', body: { status: 'abandoned' } }); load(); } catch (err) { onFlash(err.message); }
  }
  async function removeGoal(id) {
    try { await apiRequest(`/students/me/goals/${id}`, { method: 'DELETE' }); onFlash('Goal removed.', 'success'); load(); } catch (err) { onFlash(err.message); }
  }

  const active = (goals || []).filter((g) => g.status === 'active');
  const pending = (goals || []).filter((g) => g.status === 'pending_verification');
  const done = (goals || []).filter((g) => g.status === 'completed' || g.status === 'abandoned');

  return (
    <div>
      <form onSubmit={addGoal} className="card student-goal-form" style={{ padding: 20, marginBottom: 24, display: 'grid', gap: 14 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--ink-soft)' }}>Set a New Goal</p>
        <label className="goal-title-field">Goal title<input className="form-input" placeholder="e.g. Score 90% in Algebra Final" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
        <div className="goal-details-fields">
          <div className="goal-category-field"><span>Category</span>
            <CustomSelect value={form.category} onChange={(v) => setForm({ ...form, category: v })} ariaLabel="Goal category" minWidth="100%" options={GOAL_CATEGORIES} />
          </div>
          <label>Target date (optional)<input className="form-input" type="date" value={form.targetDate} onChange={(e) => setForm({ ...form, targetDate: e.target.value })} style={{ flex: '1 1 180px', minWidth: 0 }} /></label>
        </div>
        {VERIFIED_GOAL_CATEGORIES.has(form.category) && <p className="goal-verification-note">This category requires evidence and teacher or institution approval before the goal counts as achieved.</p>}
        <div className="goal-milestone-field"><label>Milestone (optional)<input className="form-input" placeholder="Add a milestone/subtask (optional)" value={form.milestoneInput} onChange={(e) => setForm({ ...form, milestoneInput: e.target.value })} style={{ flex: '1 1 auto' }} /></label>
          <button type="button" className="btn" style={{ flexShrink: 0 }} onClick={addMilestoneField}>+ Add</button>
        </div>
        {form.milestones.length > 0 && <ul className="text-xs" style={{ margin: 0, paddingLeft: 18, color: 'var(--ink-soft)' }}>{form.milestones.map((m, i) => <li key={i}>{m.title}</li>)}</ul>}
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
          {pending.length > 0 && (
            <div className="card" style={{ padding: 20, marginBottom: 20, display: 'grid', gap: 12, borderColor: 'var(--gold)' }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--gold)' }}>Awaiting Verification</p>
              {pending.map((g) => (
                <div key={g._id} className="text-sm">{g.title} <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>— your teacher/institution needs to confirm the evidence you submitted.</span></div>
              ))}
            </div>
          )}
          {active.length > 0 && (
            <div className="card" style={{ padding: 20, marginBottom: 20, display: 'grid', gap: 16 }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--ink-soft)' }}>Active Goals</p>
              {active.map((g) => (
                <div key={g._id}>
                  <div className="student-progress-row">
                    <span className="text-xs">{g.title} <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.03em', textTransform: 'uppercase', color: 'var(--ink-soft)', background: 'var(--sand)', padding: '2px 8px', borderRadius: 999, marginLeft: 4 }}>{GOAL_CATEGORIES.find((c) => c.value === g.category)?.label || 'Other'}</span></span>
                    <strong className="text-xs">{g.progressPercent}%{g.targetDate ? ` · Due ${new Date(g.targetDate).toLocaleDateString()}` : ''}{g.targetDate && new Date(g.targetDate) < new Date() ? <span style={{ color: 'var(--rose, #c0392b)' }}> · Overdue</span> : ''}</strong>
                  </div>
                  <progress className="student-progress-bar" max="100" value={g.progressPercent} aria-label={`${g.title} progress`} />
                  {g.milestones?.length > 0 && (
                    <div style={{ marginTop: 8, display: 'grid', gap: 4 }}>
                      {g.milestones.map((m) => (
                        <label key={m._id} className="flex items-center text-xs" style={{ gap: 6 }}>
                          <input type="checkbox" checked={m.done} onChange={(e) => toggleMilestone(g, m._id, e.target.checked)} /> {m.title}
                        </label>
                      ))}
                    </div>
                  )}
                  {g.notes && <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 6 }}>{g.notes}</p>}
                  {VERIFIED_GOAL_CATEGORIES.has(g.category) && g.progressPercent >= 75 && !g.evidenceUrl && (
                    <input className="form-input" style={{ marginTop: 8, fontSize: 12 }} placeholder="Paste evidence link (score report, offer letter...)" value={evidenceDrafts[g._id] || ''} onChange={(e) => setEvidenceDrafts((d) => ({ ...d, [g._id]: e.target.value }))} />
                  )}
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

const ACHIEVEMENT_TYPES = [
  { value: 'award', label: 'Award' }, { value: 'medal', label: 'Medal' }, { value: 'competition', label: 'Competition' },
  { value: 'project', label: 'Project' }, { value: 'internship', label: 'Internship' }, { value: 'research', label: 'Research' },
  { value: 'volunteer', label: 'Volunteer Work' }, { value: 'other', label: 'Other' }
];

const ACHIEVEMENT_STATUS_TAG = { pending: 'pending', verified: 'approved', rejected: 'rejected' };

// Manual achievements the real Enrollment/Certificate/Result/Scholarship/Job/Goal models don't
// cover (awards, medals, competitions, projects, internships, research, volunteer work) — self-
// added with evidence, invisible on the real timeline until an institution/teacher verifies it.
function StudentAchievementsSubPanel({ onFlash }) {
  const [list, setList] = useState(null);
  const [form, setForm] = useState({ type: 'award', title: '', description: '', evidenceUrl: '', visibility: 'private' });
  const [adding, setAdding] = useState(false);

  function load() { apiRequest('/students/me/achievements').then(setList).catch((err) => onFlash(err.message)); }
  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function add(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setAdding(true);
    try {
      await apiRequest('/students/me/achievements', { method: 'POST', body: form });
      onFlash('Submitted — awaiting verification.', 'success');
      setForm({ type: 'award', title: '', description: '', evidenceUrl: '', visibility: 'private' });
      load();
    } catch (err) { onFlash(err.message); } finally { setAdding(false); }
  }
  async function remove(id) {
    try { await apiRequest(`/students/me/achievements/${id}`, { method: 'DELETE' }); load(); } catch (err) { onFlash(err.message); }
  }

  return (
    <div>
      <form onSubmit={add} className="card" style={{ padding: 20, marginBottom: 24, display: 'grid', gap: 14 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--ink-soft)' }}>Add an Achievement</p>
        <div className="flex flex-wrap" style={{ gap: 14 }}>
          <select className="form-input" style={{ flex: '1 1 160px' }} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            {ACHIEVEMENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <select className="form-input" style={{ flex: '1 1 140px' }} value={form.visibility} onChange={(e) => setForm({ ...form, visibility: e.target.value })}>
            <option value="private">Private</option>
            <option value="public">Public (visible on your profile)</option>
          </select>
        </div>
        <input className="form-input" placeholder="Title (e.g. Regional Science Fair Winner)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <textarea className="form-input" rows={2} placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <input className="form-input" placeholder="Evidence link (certificate photo, article, letter...)" value={form.evidenceUrl} onChange={(e) => setForm({ ...form, evidenceUrl: e.target.value })} />
        <button type="submit" className="btn btn-primary" disabled={adding} style={{ padding: '8px 18px', fontSize: '0.8rem', justifySelf: 'start' }}>{adding ? 'Submitting...' : 'Submit for Verification'}</button>
      </form>

      {list === null && <p role="status" className="admin-notice">Loading...</p>}
      {list?.length === 0 && <p className="admin-notice">No manual achievements added yet.</p>}
      <div style={{ display: 'grid', gap: 10 }}>
        {(list || []).map((a) => (
          <div key={a._id} className="card flex items-center justify-between flex-wrap" style={{ padding: 14, gap: 8 }}>
            <div>
              <strong className="text-sm">{a.title}</strong>
              <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 2 }}>{ACHIEVEMENT_TYPES.find((t) => t.value === a.type)?.label} · {new Date(a.date).toLocaleDateString()}</p>
              {a.verifierNotes && <p className="text-xs" style={{ color: 'var(--gold)', marginTop: 2 }}>{a.verifierNotes}</p>}
            </div>
            <div className="flex items-center" style={{ gap: 8 }}>
              <Tag status={ACHIEVEMENT_STATUS_TAG[a.verificationStatus]} label={a.verificationStatus} />
              {a.verificationStatus === 'pending' && <button type="button" className="btn" style={{ padding: '4px 10px', fontSize: '0.7rem' }} onClick={() => remove(a._id)}>Delete</button>}
            </div>
          </div>
        ))}
      </div>
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
            {b.earned && b.earnedAt && <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 6 }}>Earned {new Date(b.earnedAt).toLocaleDateString()}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

// Student sidebar — Student Community (Part 10.20): Study Groups + Discussion Rooms.
// Course-linked and institution-scoped — a student only ever sees groups for their own actively
// enrolled courses (see /study-groups?courseId= on the backend).
function StudentCommunityPanel({ onFlash, user }) {
  const [sub, setSub] = useUrlTab('studentCommunityPanel', 'browse');
  const [courses, setCourses] = useState(null);
  const [courseId, setCourseId] = useState('');
  const [groups, setGroups] = useState(null);
  const [myGroups, setMyGroups] = useState(null);
  const [activeGroup, setActiveGroup] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', subject: '', joinPolicy: 'open', maxMembers: 6 });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    apiRequest('/students/me/enrollments').then((list) => {
      const active = list.filter((e) => e.course && e.status !== 'dropped').map((e) => e.course);
      setCourses(active);
      if (active.length && !courseId) setCourseId(active[0]._id);
    }).catch((err) => onFlash(err.message));
    apiRequest('/study-groups/mine').then(setMyGroups).catch(() => setMyGroups([]));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function loadGroups() {
    if (!courseId) return;
    apiRequest(`/study-groups?courseId=${courseId}`).then(setGroups).catch((err) => onFlash(err.message));
  }
  useEffect(loadGroups, [courseId]); // eslint-disable-line react-hooks/exhaustive-deps

  function reloadAll() {
    loadGroups();
    apiRequest('/study-groups/mine').then(setMyGroups).catch(() => {});
  }

  const myGroupIds = new Set((myGroups || []).map((g) => g._id));

  async function createGroup(e) {
    e.preventDefault();
    if (!form.name.trim() || !courseId) return;
    setCreating(true);
    try {
      await apiRequest('/study-groups', { method: 'POST', body: { ...form, courseId } });
      onFlash('Study group created.', 'success');
      setForm({ name: '', description: '', subject: '', joinPolicy: 'open', maxMembers: 6 });
      setSub('browse');
      reloadAll();
    } catch (err) { onFlash(err.message); } finally { setCreating(false); }
  }
  async function joinGroup(id) {
    try {
      const res = await apiRequest(`/study-groups/${id}/join`, { method: 'POST' });
      const iAmMember = (res?.members || []).some((m) => (m.user?._id || m.user) === user?._id);
      onFlash(iAmMember ? 'Joined study group.' : 'Join request sent — waiting for the group owner to approve.', 'success');
      reloadAll();
    } catch (err) { onFlash(err.message); }
  }

  if (activeGroup) return <StudyGroupDetail groupId={activeGroup} user={user} onFlash={onFlash} onBack={() => { setActiveGroup(null); reloadAll(); }} />;

  const tabs = [{ key: 'browse', label: 'Browse Groups' }, { key: 'mine', label: 'My Groups' }, { key: 'create', label: 'Create Group' }];

  return (
    <div>
      <div className="flex items-center" style={{ gap: 12, marginBottom: 20 }}>
        <span style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--sand)', color: 'var(--forest)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><FaUsers aria-hidden="true" size={16} /></span>
        <h3 className="font-semibold" style={{ margin: 0 }}>Study Groups</h3>
      </div>

      {courses && courses.length > 1 && (
        <select className="form-input" style={{ maxWidth: 320, marginBottom: 16 }} value={courseId} onChange={(e) => setCourseId(e.target.value)}>
          {courses.map((c) => <option key={c._id} value={c._id}>{c.title}</option>)}
        </select>
      )}
      {courses && courses.length === 0 && (
        <p className="admin-notice">You need to be enrolled in a course before you can create or join its study groups.</p>
      )}

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
          <div className="flex items-center" style={{ gap: 12, flexWrap: 'wrap' }}>
            <label className="text-xs" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>Join policy
              <select className="form-input" value={form.joinPolicy} onChange={(e) => setForm({ ...form, joinPolicy: e.target.value })}>
                <option value="open">Open — anyone enrolled can join instantly</option>
                <option value="approval">Approval — you approve each join request</option>
              </select>
            </label>
            <label className="text-xs" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>Max members
              <input type="number" min={2} max={50} className="form-input" style={{ width: 90 }} value={form.maxMembers} onChange={(e) => setForm({ ...form, maxMembers: Number(e.target.value) })} />
            </label>
          </div>
          <button type="submit" className="btn btn-primary" disabled={creating || !courseId} style={{ padding: '8px 18px', fontSize: '0.8rem', justifySelf: 'start' }}>{creating ? 'Creating...' : 'Create Group'}</button>
        </form>
      )}

      {(sub === 'browse' || sub === 'mine') && (() => {
        const list = sub === 'mine' ? myGroups : groups;
        if (list === null) return <p role="status" className="admin-notice">Loading...</p>;
        if (list.length === 0) {
          return (
            <div className="student-empty-state" style={{ border: '1px solid var(--sand-line)', borderRadius: 18 }}>
              <FaUsers aria-hidden="true" />
              <p>{sub === 'mine' ? "You haven't joined any groups yet" : 'No study groups yet for this class'}</p>
              <span>{sub === 'mine' ? 'Browse groups or create your own.' : 'Be the first to create one!'}</span>
            </div>
          );
        }
        return (
          <div style={{ display: 'grid', gap: 10 }}>
            {list.map((g) => {
              const full = g.memberCount >= g.maxMembers;
              return (
                <div key={g._id} className="hover-card card flex items-center justify-between flex-wrap" style={{ padding: 16, gap: 14 }}>
                  <div className="flex items-center" style={{ gap: 14, minWidth: 0, cursor: 'pointer' }} onClick={() => setActiveGroup(g._id)}>
                    <span style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--sand)', color: 'var(--forest)', display: 'grid', placeItems: 'center', flexShrink: 0, fontWeight: 700 }}>{g.name[0]}</span>
                    <div style={{ minWidth: 0 }}>
                      <strong className="text-sm">{g.name}{g.aiGenerated && <span className="badge" style={{ marginLeft: 6, fontSize: 10 }}>AI Balanced</span>}</strong>
                      <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 2 }}>{g.subject ? `${g.subject} · ` : ''}{g.memberCount}/{g.maxMembers} members · by {g.owner?.fullName || 'a student'}</p>
                    </div>
                  </div>
                  {myGroupIds.has(g._id)
                    ? <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.75rem', flexShrink: 0 }} onClick={() => setActiveGroup(g._id)}>Open</button>
                    : <button type="button" className="btn btn-primary" disabled={full && g.joinPolicy !== 'approval'} style={{ padding: '6px 14px', fontSize: '0.75rem', flexShrink: 0 }} onClick={() => joinGroup(g._id)}>{g.joinPolicy === 'approval' ? 'Request to Join' : full ? 'Full' : 'Join'}</button>}
                </div>
              );
            })}
          </div>
        );
      })()}
    </div>
  );
}

function StudyGroupDetail({ groupId, user, onFlash, onBack }) {
  const { socket } = useRealtime();
  const [group, setGroup] = useState(null);
  const [posts, setPosts] = useState(null);
  const [text, setText] = useState('');
  const [sub, setSub] = useUrlTab('studyGroupDetail', 'chat');
  const [contributionNote, setContributionNote] = useState('');
  const [resourceForm, setResourceForm] = useState({ name: '', file: null, busy: false });
  const [taskForm, setTaskForm] = useState({ title: '', assignedTo: '', dueDate: '' });
  const [submissionText, setSubmissionText] = useState('');
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const chatEndRef = useRef(null);

  function load() {
    apiRequest(`/study-groups/${groupId}`).then((g) => { setGroup(g); setSubmissionText(g.submission?.text || ''); setContributionNote((g.contributions || []).find((c) => c.user?._id === user?._id || c.user === user?._id)?.note || ''); }).catch((err) => onFlash(err.message));
    apiRequest(`/study-groups/${groupId}/posts`).then(setPosts).catch(() => {});
  }
  useEffect(load, [groupId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!socket) return;
    socket.emit('study-group:join', { groupId }, () => {});
    function onMessage(post) { setPosts((prev) => (prev ? [...prev, post] : [post])); }
    // Pushed to the owner's personal room (not the group room) the instant someone requests to
    // join — reload so the "Join requests" card appears without needing a manual refresh.
    function onJoinRequested({ groupId: gid }) { if (gid === groupId) load(); }
    socket.on('study-group:message', onMessage);
    socket.on('study-group:join-requested', onJoinRequested);
    return () => {
      socket.off('study-group:message', onMessage);
      socket.off('study-group:join-requested', onJoinRequested);
      socket.emit('study-group:leave', { groupId }, () => {});
    };
  }, [socket, groupId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { chatEndRef.current?.scrollIntoView({ block: 'nearest' }); }, [posts]);

  const isOwner = group && (group.owner?._id === user?._id || group.owner === user?._id);
  const memberIds = new Set((group?.members || []).map((m) => m.user?._id || m.user));
  const taskStats = (group?.tasks || []).reduce((totals, task) => {
    totals.total += 1;
    // Older tasks could be marked done before owner verification existed. Treat those as
    // awaiting review until the owner explicitly verifies them.
    const progressStatus = task.status === 'done' && !task.verifiedAt ? 'awaiting_verification' : task.status;
    totals[progressStatus] += 1;
    return totals;
  }, { total: 0, pending: 0, in_progress: 0, awaiting_verification: 0, done: 0 });
  const taskProgress = taskStats.total ? Math.round((taskStats.done / taskStats.total) * 100) : 0;
  const myIndividualMark = (group?.individualMarks || []).find((mark) => String(mark.user?._id || mark.user) === String(user?._id));

  async function send(e) {
    e.preventDefault();
    if (!text.trim()) return;
    try { await apiRequest(`/study-groups/${groupId}/posts`, { method: 'POST', body: { text: text.trim() } }); setText(''); } catch (err) { onFlash(err.message); }
  }
  async function leave() {
    try { await apiRequest(`/study-groups/${groupId}/leave`, { method: 'POST' }); onFlash('Left the group.', 'success'); onBack(); } catch (err) { onFlash(err.message); }
  }
  async function decide(uid, action) {
    try { await apiRequest(`/study-groups/${groupId}/requests/${uid}`, { method: 'PATCH', body: { action } }); load(); } catch (err) { onFlash(err.message); }
  }
  async function removeMember(uid) {
    if (!confirm('Remove this member from the group?')) return;
    try { await apiRequest(`/study-groups/${groupId}/members/${uid}/remove`, { method: 'PATCH' }); onFlash('Member removed.', 'success'); load(); } catch (err) { onFlash(err.message); }
  }
  async function transfer(uid) {
    if (!confirm('Transfer group ownership to this member?')) return;
    try { await apiRequest(`/study-groups/${groupId}/transfer-ownership`, { method: 'PATCH', body: { userId: uid } }); onFlash('Ownership transferred.', 'success'); load(); } catch (err) { onFlash(err.message); }
  }
  async function saveContribution() {
    try { await apiRequest(`/study-groups/${groupId}/contribution`, { method: 'PATCH', body: { note: contributionNote } }); onFlash('Contribution note saved.', 'success'); load(); return true; } catch (err) { onFlash(err.message); }
  }
  async function addTask(e) {
    e.preventDefault();
    if (!taskForm.title.trim()) return;
    try {
      await apiRequest(`/study-groups/${groupId}/tasks`, { method: 'POST', body: { title: taskForm.title, assignedTo: taskForm.assignedTo || null, dueDate: taskForm.dueDate || null } });
      setTaskForm({ title: '', assignedTo: '', dueDate: '' });
      load();
    } catch (err) { onFlash(err.message); }
  }
  async function updateTaskStatus(taskId, status) {
    try {
      const result = await apiRequest(`/study-groups/${groupId}/tasks/${taskId}`, { method: 'PATCH', body: { status } });
      onFlash(result?.message || (status === 'done' ? 'Task verified.' : status === 'in_progress' ? 'Task started.' : 'Task updated.'), 'success');
      load();
    } catch (err) { onFlash(err.message); }
  }
  async function reviewTask(taskId, approve) {
    let reviewNote = '';
    if (!approve) {
      reviewNote = await showPrompt('Tell the member what needs to be corrected.', { title: 'Send task back', required: true });
      if (reviewNote === null) return;
    }
    try {
      const result = await apiRequest(`/study-groups/${groupId}/tasks/${taskId}`, { method: 'PATCH', body: { status: approve ? 'done' : 'in_progress', reviewNote } });
      onFlash(result?.message || (approve ? 'Task verified.' : 'Task sent back.'), 'success');
      load();
    } catch (err) { onFlash(err.message); }
  }
  async function uploadResource(e) {
    e.preventDefault();
    if (!resourceForm.file) return;
    const formElement = e.currentTarget;
    setResourceForm((f) => ({ ...f, busy: true }));
    try {
      const resourceUrl = await uploadToPlatformStorage(resourceForm.file, 'study-group-resources');
      await apiRequest(`/study-groups/${groupId}/resources`, { method: 'POST', body: { name: resourceForm.name || resourceForm.file.name, url: resourceUrl } });
      setResourceForm({ name: '', file: null, busy: false });
      formElement.reset();
      onFlash('Resource shared.', 'success');
      load();
    } catch (err) { onFlash(err.message); setResourceForm((f) => ({ ...f, busy: false })); }
  }
  async function submitAssignment() {
    try { await apiRequest(`/study-groups/${groupId}/submission`, { method: 'PATCH', body: { text: submissionText } }); setSubmissionText(''); onFlash('Assignment submitted.', 'success'); load(); } catch (err) { onFlash(err.message); }
  }

  if (!group) return <p role="status" className="admin-notice">Loading...</p>;

  const TABS = [
    { key: 'chat', label: 'Discussion' },
    { key: 'project', label: 'Project & Tasks' },
    { key: 'resources', label: 'Resources' },
    { key: 'members', label: 'Members' },
    ...(group.groupMarks != null || (group.individualMarks || []).length ? [{ key: 'marks', label: 'Marks' }] : [])
  ];

  return (
    <div>
      <button type="button" className="btn flex items-center" style={{ padding: '6px 14px', fontSize: '0.75rem', marginBottom: 16, gap: 5 }} onClick={onBack}><FaArrowLeft aria-hidden="true" /> Back to Study Groups</button>

      <div className="card" style={{ padding: 20, marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div className="flex items-center" style={{ gap: 14, minWidth: 0 }}>
          <span style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--sand)', color: 'var(--forest)', display: 'grid', placeItems: 'center', flexShrink: 0, fontWeight: 700, fontSize: 18 }}>{group.name[0]}</span>
          <div style={{ minWidth: 0 }}>
            <strong className="text-sm">{group.name}</strong>
            <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 2 }}>{group.subject ? `${group.subject} · ` : ''}{group.members.length}/{group.maxMembers} members{isOwner ? ' · you are the owner' : ''}</p>
            {group.description && <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 4 }}>{group.description}</p>}
          </div>
        </div>
        {!isOwner && <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.75rem', flexShrink: 0 }} onClick={leave}>Leave Group</button>}
      </div>

      {isOwner && group.pendingRequests?.length > 0 && (
        <div className="card" style={{ padding: 16, marginBottom: 16, borderColor: 'var(--forest)' }}>
          <strong className="text-xs">Join requests ({group.pendingRequests.length})</strong>
          <div style={{ display: 'grid', gap: 8, marginTop: 8 }}>
            {group.pendingRequests.map((p) => (
              <div key={p.user._id} className="flex items-center justify-between" style={{ fontSize: 13 }}>
                <span>{p.user.fullName}</span>
                <span style={{ display: 'flex', gap: 6 }}>
                  <button type="button" className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '0.7rem' }} onClick={() => decide(p.user._id, 'approve')}>Approve</button>
                  <button type="button" className="btn" style={{ padding: '4px 10px', fontSize: '0.7rem' }} onClick={() => decide(p.user._id, 'reject')}>Reject</button>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <nav className="cz-tabbar" style={{ marginBottom: 16 }}>
        {TABS.map((t) => <button key={t.key} type="button" aria-pressed={sub === t.key} className={`cz-tab${sub === t.key ? ' active' : ''}`} onClick={() => setSub(t.key)}>{t.label}</button>)}
      </nav>

      {sub === 'chat' && (
        <>
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
            <div ref={chatEndRef} />
          </div>
          <form onSubmit={send} className="flex items-end" style={{ gap: 12 }}>
            <input className="form-input" placeholder="Message this group..." value={text} onChange={(e) => setText(e.target.value)} required style={{ flex: '1 1 auto', minWidth: 0 }} />
            <button type="submit" className="btn btn-primary" style={{ flexShrink: 0 }}>Send</button>
          </form>
        </>
      )}

      {sub === 'project' && (
        <div style={{ display: 'grid', gap: 16 }}>
          <div className="card" style={{ padding: 16 }}>
            <div className="flex items-start justify-between flex-wrap" style={{ gap: 12 }}>
              <div>
                <p className="text-xs" style={{ color: 'var(--ink-soft)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em' }}>Teacher-assigned group project</p>
                <strong className="text-sm" style={{ display: 'block', marginTop: 5 }}>{group.project?.title || 'Waiting for the teacher to assign a project'}</strong>
              </div>
              {group.project?.title && <Tag status={group.submission?.submittedAt ? 'approved' : 'pending'} label={group.submission?.submittedAt ? 'Submitted' : 'Active'} />}
            </div>
            {group.project?.deadline && <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 4 }}>Deadline: {new Date(group.project.deadline).toLocaleDateString()}</p>}
            {group.project?.instructions && <p className="text-sm" style={{ marginTop: 8 }}>{group.project.instructions}</p>}
            {!group.project?.title && <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 8 }}>Tasks and final submission should start after the course teacher adds the project title, instructions and deadline.</p>}
          </div>

          <div className="card" style={{ padding: 16 }}>
            <div className="flex items-center justify-between flex-wrap" style={{ gap: 10 }}>
              <div><strong className="text-sm">Team tasks</strong><p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 2 }}>{taskStats.done} of {taskStats.total} verified{taskStats.awaiting_verification ? ` · ${taskStats.awaiting_verification} awaiting review` : ''}</p></div>
              <strong className="text-sm" style={{ color: taskProgress === 100 && taskStats.total ? 'var(--emerald)' : 'var(--forest)' }}>{taskProgress}%</strong>
            </div>
            <progress className="student-progress-bar" max="100" value={taskProgress} aria-label="Group task progress" style={{ marginTop: 10 }} />
            <div style={{ display: 'grid', gap: 8, marginTop: 10 }}>
              {(group.tasks || []).length === 0 && <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>No tasks yet.</p>}
              {(group.tasks || []).map((t) => {
                const assignee = group.members.find((m) => String(m.user?._id || m.user) === String(t.assignedTo));
                const assigneeId = String(t.assignedTo || '');
                const assignedToMe = String(t.assignedTo || '') === String(user?._id || '');
                const canUpdate = isOwner || assignedToMe;
                const awaitingReview = t.status === 'awaiting_verification' || (t.status === 'done' && !t.verifiedAt);
                const statusColor = t.status === 'done' && !awaitingReview ? 'var(--emerald)' : t.status === 'in_progress' || awaitingReview ? 'var(--gold)' : 'var(--ink-soft)';
                const assigneeContribution = (group.contributions || []).find((c) => String(c.user?._id || c.user) === assigneeId);
                const assigneeResources = (group.resources || []).filter((r) => String(r.uploadedBy?._id || r.uploadedBy) === assigneeId);
                const isExpanded = expandedTaskId === t._id;
                return (
                <div key={t._id} style={{ fontSize: 13, padding: 12, border: `1px solid ${t.status === 'in_progress' || awaitingReview ? 'var(--gold)' : 'var(--sand-line)'}`, borderRadius: 12, background: t.status === 'done' && !awaitingReview ? 'rgba(16,185,129,.06)' : t.status === 'in_progress' || awaitingReview ? 'rgba(217,119,6,.06)' : '#fff' }}>
                  <div className="flex items-center justify-between flex-wrap" style={{ gap: 12 }}>
                    <div style={{ minWidth: 0 }}><strong className="text-sm">{t.title}</strong><p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 3 }}>{assignee?.user?.fullName || 'Unassigned'}{assignedToMe ? ' · Assigned to you' : ''}{t.dueDate ? ` · Due ${new Date(t.dueDate).toLocaleDateString()}` : ''}</p>{t.reviewNote && <p className="text-xs" style={{ color: '#a3432f', marginTop: 5 }}><strong>Owner feedback:</strong> {t.reviewNote}</p>}</div>
                    {isOwner && (awaitingReview || t.status === 'done') ? <button type="button" className="btn" style={{ padding: '7px 12px', fontSize: 12 }} onClick={() => setExpandedTaskId(isExpanded ? null : t._id)}>{isExpanded ? 'Close work' : 'View submitted work'}</button> : canUpdate && !awaitingReview ? <select className="form-input" style={{ width: 160, padding: '7px 10px', fontSize: 12, color: statusColor, fontWeight: 700 }} value={t.status} onChange={(e) => updateTaskStatus(t._id, e.target.value)}>
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">{isOwner ? 'Verify as Done' : 'Submit for Review'}</option>
                  </select> : <Tag status={t.status === 'done' ? 'approved' : 'pending'} label={awaitingReview ? 'Awaiting owner verification' : t.status === 'in_progress' ? 'In progress' : t.status === 'done' ? 'Verified' : 'Pending'} />}
                  </div>
                  {isOwner && isExpanded && <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--sand-line)', display: 'grid', gap: 10 }}>
                    <div><strong className="text-xs">Member contribution</strong><p className="text-sm" style={{ marginTop: 4, whiteSpace: 'pre-wrap' }}>{assigneeContribution?.note || 'No contribution note was submitted.'}</p></div>
                    <div><strong className="text-xs">Files shared by {assignee?.user?.fullName || 'member'}</strong>{assigneeResources.length ? <div className="flex flex-wrap" style={{ gap: 7, marginTop: 6 }}>{assigneeResources.map((resource) => <a key={resource._id} className="btn" style={{ padding: '6px 10px', fontSize: 12 }} href={resource.url} target="_blank" rel="noreferrer">Open {resource.name}</a>)}</div> : <p className="text-sm" style={{ marginTop: 4 }}>No file was shared by this member.</p>}</div>
                    {t.submittedForReviewAt && <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>Submitted for review: {new Date(t.submittedForReviewAt).toLocaleString()}</p>}
                    {t.verifiedAt && <p className="text-xs" style={{ color: 'var(--emerald)' }}>Verified {new Date(t.verifiedAt).toLocaleString()}{t.verifiedBy?.fullName ? ` by ${t.verifiedBy.fullName}` : ''}</p>}
                    {awaitingReview && <div className="flex items-center flex-wrap" style={{ gap: 7 }}><button type="button" className="btn btn-primary" style={{ padding: '7px 12px', fontSize: 12 }} onClick={() => reviewTask(t._id, true)}>Verify task</button><button type="button" className="btn" style={{ padding: '7px 12px', fontSize: 12 }} onClick={() => reviewTask(t._id, false)}>Send back with feedback</button></div>}
                  </div>}
                </div>
              );})}
            </div>
            {isOwner && <form onSubmit={addTask} className="flex items-center flex-wrap" style={{ gap: 8, marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--sand-line)' }}>
              <strong className="text-xs" style={{ flex: '1 0 100%' }}>Owner controls — assign a new task</strong>
              <input className="form-input" placeholder="New task" style={{ flex: '1 1 160px' }} value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} />
              <select className="form-input" style={{ width: 150 }} value={taskForm.assignedTo} onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}>
                <option value="">Unassigned</option>
                {(group.members || []).map((m) => <option key={m.user._id} value={m.user._id}>{m.user.fullName}</option>)}
              </select>
              <input type="date" className="form-input" style={{ width: 140 }} value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} />
              <button type="submit" className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.75rem' }}>Assign Task</button>
            </form>}
          </div>

          <div className="card" style={{ padding: 16 }}>
            <strong className="text-sm">Final group submission</strong>
            <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 4 }}>{isOwner ? 'As group owner, review every member’s work before sending one final submission to the teacher.' : `Only the group owner (${group.owner?.fullName || 'owner'}) submits the combined final work.`}</p>
            {group.submission?.submittedAt && group.submission.status !== 'changes_requested' && <div style={{ marginTop: 10, padding: 12, borderRadius: 12, background: group.submission.status === 'approved' ? 'rgba(16,185,129,.08)' : 'rgba(217,119,6,.08)' }}><Tag status={group.submission.status === 'approved' ? 'approved' : 'pending'} label={group.submission.status === 'approved' ? 'Approved by teacher' : 'Submitted · awaiting teacher review'} /><p className="text-sm" style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>{group.submission.text}</p><p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 7 }}>Submission is locked. It can only be edited if the teacher requests changes.</p></div>}
            {group.submission?.status === 'changes_requested' && <div className="admin-notice" style={{ marginTop: 10 }}><strong>Teacher requested changes</strong><p className="text-sm" style={{ marginTop: 4 }}>{group.submission.teacherFeedback}</p></div>}
            {isOwner && (!group.submission?.submittedAt || group.submission.status === 'changes_requested') && <textarea className="form-input" rows={4} style={{ marginTop: 10 }} placeholder="Write or paste the group's final submission here..." value={submissionText} onChange={(e) => setSubmissionText(e.target.value)} />}
            {isOwner && (!group.submission?.submittedAt || group.submission.status === 'changes_requested') && <button type="button" className="btn btn-primary" disabled={!group.project?.title || !submissionText.trim()} style={{ padding: '6px 14px', fontSize: '0.75rem', marginTop: 8 }} onClick={submitAssignment}>{group.submission?.status === 'changes_requested' ? 'Submit Revised Work' : 'Submit Final Work'}</button>}
            {group.submission?.submittedAt && <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 6 }}>Last submitted {new Date(group.submission.submittedAt).toLocaleString()} by {group.submission.submittedBy?.fullName || 'a member'}.</p>}
          </div>

          {(group.gradingPublishedAt || group.groupMarks != null || myIndividualMark) && <div className="card" style={{ padding: 18, borderColor: 'var(--emerald)', background: 'rgba(16,185,129,.06)' }}>
            <div className="flex items-center justify-between flex-wrap" style={{ gap: 10 }}><div><strong className="text-sm">Final result published</strong><p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 3 }}>{group.project?.title || group.name}</p></div><Tag status="approved" label="Result available" /></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10, marginTop: 14 }}><div className="admin-notice"><span className="text-xs">Group marks</span><br /><strong>{group.groupMarks ?? '—'}/100</strong></div><div className="admin-notice"><span className="text-xs">Your individual marks</span><br /><strong>{myIndividualMark?.marks ?? '—'}/100</strong></div><div className="admin-notice"><span className="text-xs">Your percentage</span><br /><strong>{myIndividualMark ? `${Number(myIndividualMark.marks).toFixed(0)}%` : '—'}</strong></div></div>
          </div>}

          <div className="card" style={{ padding: 16 }}>
<SavedForm key={groupId} saved={Boolean((group.contributions||[]).find(c=>String(c.user?._id||c.user)===String(user?._id))?.note)} value={contributionNote} onRestore={setContributionNote} onSubmit={saveContribution}><strong className="text-sm">My contribution</strong>
            <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 4 }}>Describe the work you personally completed. The teacher uses this during individual grading.</p>
            <textarea className="form-input" rows={3} style={{ marginTop: 8 }} placeholder="Example: I researched the topic and prepared slides 1–4." value={contributionNote} onChange={(e) => setContributionNote(e.target.value)} />
            <button type="submit" className="btn" disabled={!contributionNote.trim()} style={{ padding: '6px 14px', fontSize: '0.75rem', marginTop: 8 }} >Save My Contribution</button></SavedForm>
          </div>
        </div>
      )}

      {sub === 'resources' && (
        <div style={{ display: 'grid', gap: 12 }}>
          <form onSubmit={uploadResource} className="card flex items-center flex-wrap" style={{ padding: 16, gap: 10 }}>
            <input className="form-input" placeholder="File name (optional)" style={{ flex: '1 1 160px' }} value={resourceForm.name} onChange={(e) => setResourceForm({ ...resourceForm, name: e.target.value })} />
            <input type="file" onChange={(e) => setResourceForm({ ...resourceForm, file: e.target.files?.[0] || null })} />
            <button type="submit" className="btn btn-primary" disabled={resourceForm.busy || !resourceForm.file} style={{ padding: '6px 14px', fontSize: '0.75rem' }}>{resourceForm.busy ? 'Uploading...' : 'Share'}</button>
          </form>
          {(group.resources || []).length === 0 && <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>No files shared yet.</p>}
          {(group.resources || []).map((r) => (
            <a key={r._id} href={r.url} target="_blank" rel="noreferrer" className="card hover-card flex items-center justify-between" style={{ padding: 12, textDecoration: 'none' }}>
              <span className="text-sm">{r.name}</span>
              <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>{r.uploadedBy?.fullName} · {new Date(r.uploadedAt).toLocaleDateString()}</span>
            </a>
          ))}
        </div>
      )}

      {sub === 'members' && (
        <div style={{ display: 'grid', gap: 8 }}>
          {(group.members || []).map((m) => (
            <div key={m.user._id} className="card flex items-center justify-between" style={{ padding: 12 }}>
              <span className="text-sm">{m.user.fullName}{(group.owner?._id || group.owner) === m.user._id && <span className="badge" style={{ marginLeft: 6, fontSize: 10 }}>Owner</span>}</span>
              {isOwner && (group.owner?._id || group.owner) !== m.user._id && (
                <span style={{ display: 'flex', gap: 6 }}>
                  <button type="button" className="btn" style={{ padding: '4px 10px', fontSize: '0.7rem' }} onClick={() => transfer(m.user._id)}>Make Owner</button>
                  <button type="button" className="btn" style={{ padding: '4px 10px', fontSize: '0.7rem' }} onClick={() => removeMember(m.user._id)}>Remove</button>
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {sub === 'marks' && (
        <div className="card" style={{ padding: 16 }}>
          <strong className="text-sm">My study group result</strong>
          {group.groupMarks != null && <p className="text-sm" style={{ marginTop: 10 }}>Group marks: <strong>{group.groupMarks}/100</strong></p>}
          {myIndividualMark && <><p className="text-sm" style={{ marginTop: 6 }}>Your individual marks: <strong>{myIndividualMark.marks}/100</strong></p><p className="text-sm" style={{ marginTop: 6 }}>Percentage: <strong>{Number(myIndividualMark.marks).toFixed(0)}%</strong></p></>}
          {!myIndividualMark && group.groupMarks == null && <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 8 }}>Not graded yet.</p>}
        </div>
      )}
    </div>
  );
}

function MarketplacePanel({ onFlash, user }) {
  const isSeller = (user?.roles || []).some((r) => ['marketplace_seller', 'student'].includes(r));
  const [sub, setSub] = useUrlTab('marketplacePanel', 'browse');
  const tabs = [
    { key: 'browse', label: 'Browse' },
    { key: 'orders', label: 'My Orders' },
    ...(isSeller ? [{ key: 'sell', label: 'Sell an Item' }, { key: 'listings', label: 'My Listings' }, { key: 'selling', label: 'Orders Received' }, { key: 'report', label: 'Sales Report' }, { key: 'earnings', label: 'Earnings & Payout' }] : [])
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
      {sub === 'sell' && <><p className="text-sm" style={{ color: 'var(--ink-soft)', margin: '0 0 12px' }}>Sell your books, notes, uniforms or anything useful. CareerZ checks each listing before it goes live, and buyers pay you by bank transfer into your account below.</p><AddListingPanel onFlash={onFlash} /></>}
      {sub === 'earnings' && <><ReceivingAccount onFlash={onFlash} /><SellerWalletPanel onFlash={onFlash} /></>}
      {sub === 'report' && <SellerReportPanel onFlash={onFlash} />}
      {isSeller && ['sell', 'listings', 'selling', 'report'].includes(sub) && <ReceivingAccount onFlash={onFlash} onlyIfNeeded />}
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
    <div className="marketplace-browse-workspace">
      <form onSubmit={(e) => { e.preventDefault(); load(); }} className="marketplace-search-form">
        <input className="form-input" aria-label="Search products" placeholder="Search products" value={q} onChange={(e) => setQ(e.target.value)} />
        <button type="submit" className="btn btn-primary"><FaMagnifyingGlass aria-hidden="true" /> Search</button>
      </form>
      {products === null && <p role="status" className="admin-notice">Loading...</p>}
      {products && products.length === 0 && <div className="marketplace-empty"><FaStore aria-hidden="true" /><strong>No listings found</strong><p>Try another search, or check back for new products.</p></div>}
      <div className="grid grid-cols-1 gap-3">
        {(products || []).map((p) => (
          <div key={p._id} className="border border-[var(--sand-line)] rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div><strong>{p.title}</strong><p className="text-xs text-[var(--ink-soft)]">{p.category} · by {p.seller?.fullName} · Stock: {p.stock}</p></div>
              <span className="text-xs">{p.currency} {p.price}</span>
            </div>
            {p.description && <p className="text-sm mt-2">{p.description}</p>}
            <button type="button" className="btn btn-primary mt-2" style={{ padding: '6px 16px', fontSize: '0.8rem' }} disabled={p.stock === 0} onClick={() => { window.location.href = `/marketplace/${p._id}?action=order`; }}>{p.stock === 0 ? 'Out of stock' : 'View and order'}</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function MyOrdersPanel({ onFlash }) {
  return <BuyerOrdersList onFlash={onFlash} PayButton={({ o, onDone }) => <ManualPayButton kind="marketplace_order" id={o._id} label="Pay by bank transfer" onFlash={onFlash} onDone={onDone} />} />;
}

// Real synchronized live-class room (spec: teacher's Advanced Class Control broadcasts the slide
// over Socket.IO — see src/realtime/socket.js — to every joined, actively-enrolled, fee-cleared
// student). Students never see the teacher's voice/gesture/eye controls or camera feed — only the
// resulting slide change, exactly like a real classroom projector.
function StudentLiveClassRoom({ session: initialSession, onLeave, onFlash }) {
  const { socket } = useRealtime();
  const [session, setSession] = useState(initialSession);
  const [ended, setEnded] = useState(false);
  const [current, setCurrent] = useState(initialSession.currentSlide || 0);
  const [messages, setMessages] = useState(initialSession.messages || []);
  const [chatText, setChatText] = useState('');
  const [handRaised, setHandRaised] = useState(false);
  const [connected, setConnected] = useState(true);
  const [poll, setPoll] = useState(null);
  const [myVote, setMyVote] = useState(null);
  const [energyOn, setEnergyOn] = useState(false);
  const [myEnergy, setMyEnergy] = useState(null);
  const [classEnergy, setClassEnergy] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const faceApiRef = useRef(null);
  const socketRef = useRef(null);
  useEffect(() => { socketRef.current = socket; }, [socket]);
  const sessionIdRef = useRef(session.id);

  useEffect(() => {
    if (!socket) return;
    function onSlide({ sessionId, currentSlide }) { if (sessionId === sessionIdRef.current) setCurrent(currentSlide); }
    function onMessage(msg) { setMessages((m) => [...m, msg].slice(-200)); }
    function onEnded({ sessionId }) { if (sessionId === sessionIdRef.current) setEnded(true); }
    // A dropped connection (brief network blip) auto-reconnects via socket.io's own retry logic —
    // this just re-registers as a room member once it's back, so slide sync resumes without the
    // student having to click Join again. A full page reload is a fresh mount, not this path —
    // they'll see the class in the live-sessions list again and can rejoin with one click.
    function onConnect() { setConnected(true); socketRef.current?.emit('class:join', { sessionId: sessionIdRef.current }, () => {}); }
    function onDisconnect() { setConnected(false); }
    function onPoll(p) { setPoll(p); if (p.status === 'open' && (!poll || poll.id !== p.id)) setMyVote(null); }
    function onEnergy(e) { setClassEnergy(e); }
    function onNudged({ teacherName }) { onFlash(`${teacherName || 'Your teacher'} noticed you might be distracted — try to refocus!`, 'success'); }
    socket.on('class:slide', onSlide);
    socket.on('class:message', onMessage);
    socket.on('class:ended', onEnded);
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('class:poll', onPoll);
    socket.on('class:energy', onEnergy);
    socket.on('class:energy:nudged', onNudged);
    return () => {
      socket.off('class:slide', onSlide); socket.off('class:message', onMessage);
      socket.off('class:ended', onEnded); socket.off('connect', onConnect); socket.off('disconnect', onDisconnect);
      socket.off('class:poll', onPoll); socket.off('class:energy', onEnergy); socket.off('class:energy:nudged', onNudged);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  // Class Energy Meter (spec #17) — opt-in: student's own browser runs a lightweight face-
  // presence check every few seconds and reports only a boolean + score, never any image/video,
  // to the server. Camera access is requested only when the student turns this on.
  useEffect(() => {
    if (!energyOn) {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setMyEnergy(null);
      return undefined;
    }
    let cancelled = false;
    let timer = null;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 240, height: 180 } });
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play().catch(() => {}); }
        const { loadFaceModels, faceapi } = await import('../../utils/faceApi');
        await loadFaceModels();
        faceApiRef.current = faceapi;
        const tick = async () => {
          if (cancelled || !videoRef.current || !faceApiRef.current) return;
          try {
            const detection = await faceApiRef.current.detectSingleFace(videoRef.current, new faceApiRef.current.TinyFaceDetectorOptions());
            const attentive = Boolean(detection);
            const score = attentive ? 85 : 15;
            setMyEnergy({ attentive, score });
            socketRef.current?.emit('class:energy:report', { sessionId: sessionIdRef.current, attentive, score }, () => {});
          } catch { /* one bad frame is not fatal */ }
          timer = setTimeout(tick, 6000);
        };
        tick();
      } catch {
        onFlash('Camera access is needed for the Class Energy Meter.');
        setEnergyOn(false);
      }
    })();
    return () => { cancelled = true; clearTimeout(timer); streamRef.current?.getTracks().forEach((t) => t.stop()); streamRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [energyOn]);

  function leave() {
    socketRef.current?.emit('class:leave', { sessionId: sessionIdRef.current }, () => {});
    setEnergyOn(false);
    onLeave();
  }

  function vote(optionIndex) {
    socketRef.current?.emit('class:poll:vote', { sessionId: sessionIdRef.current, optionIndex }, (ack) => { if (ack?.ok) setMyVote(optionIndex); else onFlash(ack?.message || 'Vote failed.'); });
  }

  function toggleHand() {
    const next = !handRaised;
    setHandRaised(next);
    socketRef.current?.emit('class:raise-hand', { sessionId: sessionIdRef.current, raised: next }, (ack) => { if (!ack?.ok) setHandRaised(!next); });
  }

  function sendMessage(e) {
    e.preventDefault();
    if (!chatText.trim()) return;
    socketRef.current?.emit('class:message', { sessionId: sessionIdRef.current, text: chatText.trim() }, (ack) => { if (!ack?.ok) onFlash(ack?.message || 'Message failed to send.'); });
    setChatText('');
  }

  if (ended) {
    return (
      <div className="card" style={{ padding: 20, textAlign: 'center', marginBottom: 16 }}>
        <strong>Class Ended</strong>
        <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 6 }}>The teacher ended this live class.</p>
        <button type="button" className="btn btn-primary" style={{ marginTop: 10 }} onClick={onLeave}>Back to My Classes</button>
      </div>
    );
  }

  const slide = session.slides[current];
  return (
    <div className="card" style={{ padding: 16, marginBottom: 16 }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
        <span className="text-xs flex items-center" style={{ gap: 5, color: connected ? 'var(--emerald)' : 'var(--rose)' }}><FaCircle aria-hidden="true" style={{ fontSize: 8 }} /> {connected ? 'Connected' : 'Reconnecting…'}</span>
        <button type="button" className="btn" style={{ padding: '4px 12px', fontSize: '0.72rem' }} onClick={leave}>Leave Class</button>
      </div>
      <p className="text-xs" style={{ color: 'var(--ink-soft)', marginBottom: 8 }}>{session.courseTitle} · {session.teacherName}</p>
      {slide && (
        <div style={{ position: 'relative', overflow: 'hidden', background: slide.background, color: slide.text, borderRadius: 14, padding: '28px 32px', minHeight: 260, borderTop: `8px solid ${slide.accent}` }}>
          <h3 style={{ fontSize: 22, marginBottom: 14, fontFamily: 'Fraunces, serif', color: slide.text }}>{slide.title}</h3>
          <ul style={{ fontSize: 14, lineHeight: 1.5, paddingLeft: 20, margin: 0 }}>{(slide.bullets || []).map((b, i) => <li key={i} style={{ marginBottom: 6 }}>{b}</li>)}</ul>
          {slide.imageUrl && <img src={slide.imageUrl} alt="" style={{ maxWidth: '100%', maxHeight: 140, marginTop: 10, borderRadius: 8 }} />}
          <span style={{ position: 'absolute', bottom: 10, right: 16, fontSize: 11, opacity: 0.6 }}>{current + 1} / {session.slides.length}</span>
        </div>
      )}
      {session.meetingLink && <a href={session.meetingLink} target="_blank" rel="noreferrer" className="text-xs" style={{ display: 'inline-block', marginTop: 8, color: 'var(--emerald)' }}>Open Video/Audio Call ↗</a>}
      <div className="flex items-center flex-wrap" style={{ marginTop: 10, gap: 10 }}>
        <button type="button" className={handRaised ? 'btn btn-primary' : 'btn'} style={{ padding: '6px 14px', fontSize: '0.78rem' }} onClick={toggleHand}>✋ {handRaised ? 'Lower Hand' : 'Raise Hand'}</button>
        <label className="text-xs flex items-center" style={{ gap: 5 }}>
          <input type="checkbox" checked={energyOn} onChange={(e) => setEnergyOn(e.target.checked)} /> Class Energy Meter
        </label>
        {energyOn && myEnergy && <span className="text-xs" style={{ color: myEnergy.attentive ? 'var(--emerald)' : 'var(--rose)' }}>{myEnergy.attentive ? '● Focused' : '● Distracted'}</span>}
        {classEnergy && <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>Class average: {classEnergy.average}%</span>}
      </div>
      {energyOn && <video ref={videoRef} muted playsInline style={{ width: 90, height: 68, borderRadius: 8, marginTop: 8, objectFit: 'cover', transform: 'scaleX(-1)' }} />}

      {poll && (
        <div style={{ marginTop: 10, padding: 10, borderRadius: 10, background: 'var(--sand)' }}>
          <p className="text-xs" style={{ fontWeight: 700, marginBottom: 6 }}>{poll.question}</p>
          {poll.options.map((o) => (
            <button key={o.index} type="button" disabled={poll.status !== 'open' || myVote !== null} className={myVote === o.index ? 'btn btn-primary' : 'btn'} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '5px 10px', fontSize: '0.75rem', marginBottom: 4 }} onClick={() => vote(o.index)}>
              {o.text}{(myVote !== null || poll.status === 'closed') ? ` — ${o.votes} vote${o.votes === 1 ? '' : 's'}` : ''}
            </button>
          ))}
        </div>
      )}
      <div style={{ maxHeight: 140, overflowY: 'auto', margin: '10px 0', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {messages.length === 0 && <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>No questions yet — ask below.</p>}
        {messages.map((m) => <p key={m.id} className="text-xs"><strong>{m.name}{m.teacher ? ' (teacher)' : ''}:</strong> {m.text}</p>)}
      </div>
      <form onSubmit={sendMessage} className="flex gap-2">
        <input className="form-input" placeholder="Ask a question…" value={chatText} onChange={(e) => setChatText(e.target.value)} style={{ flex: 1 }} />
        <button type="submit" className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.78rem' }}>Send</button>
      </form>
    </div>
  );
}

// Sits above the timetable in Student -> My Classes. Lists real active live sessions for courses
// this student is actively enrolled in (the server-side class:list handler already filters out
// anything the student isn't eligible for — unenrolled or fee-blocked courses never appear here).
function StudentLiveClassBanner({ onFlash }) {
  const { socket } = useRealtime();
  const [sessions, setSessions] = useState([]);
  const [joined, setJoined] = useState(null);
  const socketRef = useRef(null);
  useEffect(() => { socketRef.current = socket; }, [socket]);

  function refreshList() {
    socketRef.current?.emit('class:list', {}, (ack) => { if (ack?.ok) setSessions(ack.sessions); });
  }

  useEffect(() => {
    if (!socket) return;
    refreshList();
    function onStarted(started) { setSessions((prev) => [...prev.filter((s) => s.id !== started.id), started]); }
    function onEndedGlobal({ sessionId }) { setSessions((prev) => prev.filter((s) => s.id !== sessionId)); }
    socket.on('class:started', onStarted);
    socket.on('class:ended', onEndedGlobal);
    socket.on('connect', refreshList);
    // Belt-and-braces poll — covers the rare case a class:started push was missed (e.g. this tab
    // was reconnecting at that exact moment).
    const interval = setInterval(refreshList, 20000);
    return () => { socket.off('class:started', onStarted); socket.off('class:ended', onEndedGlobal); socket.off('connect', refreshList); clearInterval(interval); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  function join(sessionSummary) {
    socketRef.current?.timeout(8000).emit('class:join', { sessionId: sessionSummary.id }, (err, ack) => {
      if (err || !ack?.ok) return onFlash(ack?.message || 'Could not join the class.');
      setJoined(ack.session);
    });
  }

  if (joined) return <StudentLiveClassRoom session={joined} onLeave={() => { setJoined(null); refreshList(); }} onFlash={onFlash} />;
  if (sessions.length === 0) return null;

  return (
    <div className="card" style={{ padding: 16, marginBottom: 16, borderInlineStart: '4px solid var(--rose)' }}>
      <strong className="text-sm flex items-center" style={{ gap: 6, color: 'var(--rose)' }}><FaCircle aria-hidden="true" style={{ fontSize: 8 }} /> Live Class{sessions.length > 1 ? 'es' : ''} Now</strong>
      {sessions.map((s) => (
        <div key={s.id} className="flex items-center justify-between" style={{ marginTop: 10, padding: 10, background: 'var(--sand)', borderRadius: 10, flexWrap: 'wrap', gap: 8 }}>
          <div>
            <p className="text-sm" style={{ fontWeight: 600, margin: 0 }}>{s.courseTitle}</p>
            <p className="text-xs" style={{ color: 'var(--ink-soft)', margin: '2px 0 0' }}>{s.teacherName} · started {new Date(s.startedAt).toLocaleTimeString()}</p>
          </div>
          <button type="button" className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.78rem' }} onClick={() => join(s)}>Join Live Class</button>
        </div>
      ))}
    </div>
  );
}

function StudentFeesPanel({ onFlash }) {
  const [fees, setFees] = useState(null);
  function load() { apiRequest('/students/me/fees').then(setFees).catch((err) => onFlash(err.message)); }
  useEffect(load, [onFlash]);
  useEffect(() => {
    window.addEventListener('careerz:payment-confirmed', load);
    return () => window.removeEventListener('careerz:payment-confirmed', load);
  }, [onFlash]);

  async function requestFeeRefund(fee) {
    const reason = await showPrompt('Why are you requesting this refund?', { title: 'Request Fee Refund', required: true });
    if (!reason?.trim()) return;
    const confirmed = await showConfirm(`Submit a refund request for ${fee.currency} ${fee.paidAmount || fee.amount}?`, { confirmLabel: 'Request refund' });
    if (!confirmed) return;
    try {
      await apiRequest(`/institutions/fees/${fee._id}/refund/request`, { method: 'POST', body: { reason: reason.trim() } });
      onFlash('Refund request sent to the institution.', 'success');
      load();
    } catch (err) { onFlash(err.message); }
  }

  // Group by institution then billing frequency (spec: "clearly group fees as monthly, semester,
  // annual and one-time... for each institution separately").
  const grouped = {};
  (fees || []).forEach((f) => {
    const instName = f.institution?.name || 'Independent';
    const freq = f.schedule?.billingFrequency || (f.installment?.totalInstallments > 1 ? 'installment plan' : 'one_time');
    grouped[instName] = grouped[instName] || {};
    grouped[instName][freq] = grouped[instName][freq] || { count: 0, outstanding: 0, currency: f.currency };
    grouped[instName][freq].count += 1;
    grouped[instName][freq].outstanding += f.outstandingAmount ?? (f.status === 'paid' ? 0 : f.amount);
  });

  return (
    <div>
      <h3 className="font-semibold mb-2">My Fees</h3>
      {Object.keys(grouped).length > 0 && (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 18 }}>
          {Object.entries(grouped).map(([inst, freqs]) => (
            <div key={inst} className="card" style={{ padding: 14 }}>
              <strong className="text-sm">{inst}</strong>
              <div style={{ marginTop: 6, display: 'grid', gap: 3 }}>
                {Object.entries(freqs).map(([freq, v]) => (
                  <p key={freq} className="text-xs" style={{ color: 'var(--ink-soft)' }}>{freq.replace('_', ' ')}: {v.count} fee{v.count === 1 ? '' : 's'}{v.outstanding > 0 ? ` · ${v.currency} ${v.outstanding} due` : ''}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      <Table
        loading={fees === null}
        headers={['Title', 'Amount', 'Outstanding', 'Due', 'Status', 'Payment', 'Document']}
        rows={(fees || []).map((f) => [
          <span>
            {f.title}{f.installment?.totalInstallments > 1 ? <span className="text-xs" style={{ color: 'var(--ink-soft)' }}><br />Instalment {f.installment.number}/{f.installment.totalInstallments}</span> : null}
            {f.paymentHistory?.length > 0 && (
              <span className="text-xs" style={{ display: 'block', color: 'var(--ink-soft)', marginTop: 2 }}>
                {f.paymentHistory.map((p, i) => <span key={i}>{p.verifiedAt ? '✓' : '⏳'} {f.currency} {p.amount} ({p.method}{p.paidByInfo ? `, by ${p.paidByInfo.name} — ${p.paidByInfo.role}` : ''}){i < f.paymentHistory.length - 1 ? ', ' : ''}</span>)}
              </span>
            )}
          </span>,
          `${f.currency} ${f.originalAmount != null && f.originalAmount !== f.amount ? `${f.originalAmount} → ${f.amount}` : f.amount}`,
          `${f.currency} ${f.outstandingAmount ?? f.amount}`,
          f.dueDate ? new Date(f.dueDate).toLocaleDateString() : '—',
          <Tag status={f.status === 'paid' ? 'approved' : f.status === 'overdue' ? 'rejected' : 'pending'} label={f.status?.replace('_', ' ')} />,
          <PayFeeButton fee={f} onFlash={onFlash} onPaid={load} />,
          <div className="flex gap-1 flex-wrap">
            <button type="button" className="btn" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={() => downloadFeePdf(f)}>{f.status === 'paid' ? 'Receipt' : 'Invoice'} PDF</button>
            {f.status === 'paid' && f.kind !== 'tutoring' && (!f.refund?.status || ['none', 'rejected'].includes(f.refund.status)) && (
              <button type="button" className="btn" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={() => requestFeeRefund(f)}>Request Refund</button>
            )}
            {f.refund?.status && !['none', 'rejected'].includes(f.refund.status) && <Tag status={f.refund.status === 'refunded' ? 'approved' : 'pending'} label={`Refund ${f.refund.status}`} />}
          </div>
        ])}
        empty="No fee records yet."
      />
      <WalletCard onFlash={onFlash} />
    </div>
  );
}

function StudentAssignmentCenter({ onFlash }) {
  const [assignments, setAssignments] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [openId, setOpenId] = useState('');
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [submissionChoice, setSubmissionChoice] = useState('text');
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      const [enrollments, mine] = await Promise.all([apiRequest('/students/me/enrollments'), apiRequest('/students/me/submissions')]);
      const lists = await Promise.all(enrollments.filter((entry) => entry.course && entry.status !== 'dropped').map((entry) => apiRequest(`/courses/${entry.course._id}/assignments`).then((rows) => rows.map((row) => ({ ...row, courseTitle: entry.course.title }))).catch(() => [])));
      setAssignments(lists.flat()); setSubmissions(mine);
    } catch (err) { onFlash(err.message); setAssignments([]); }
  }
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function submit(assignment) {
    const mode = assignment.submissionMode || 'either';
    const needsText = mode === 'text' || mode === 'both' || (mode === 'either' && submissionChoice === 'text');
    const needsFile = mode === 'file' || mode === 'both' || (mode === 'either' && submissionChoice === 'file');
    if (needsText && !text.trim()) return onFlash('Write your answer before submitting.');
    if (needsFile && !file) return onFlash('Choose your completed assignment file before submitting.');
    setBusy(true);
    try {
      const attachments = [];
      if (file) {
        if (!(await isPlatformUploadAvailable())) throw new Error('File storage is not configured. Ask the administrator to configure Cloudinary.');
        attachments.push({ name: file.name, url: await uploadToPlatformStorage(file, 'assignment-submissions') });
      }
      await apiRequest(`/courses/assignments/${assignment._id}/submit`, { method: 'POST', body: { text: text.trim(), attachments } });
      onFlash('Assignment submitted.', 'success'); setOpenId(''); setText(''); setFile(null); await load();
    } catch (err) { onFlash(err.message); } finally { setBusy(false); }
  }

  const byAssignment = new Map(submissions.map((submission) => [String(submission.assignment?._id), submission]));
  return (
    <div>
      <h3 className="font-semibold mb-2">My Assignments</h3>
      {assignments === null && <p role="status" className="admin-notice">Loading assignments…</p>}
      {(assignments || []).length === 0 && assignments !== null && <p className="admin-notice">No assignments published yet.</p>}
      <div style={{ display: 'grid', gap: 12 }}>
        {(assignments || []).map((assignment) => {
          const submission = byAssignment.get(String(assignment._id));
          const overdue = assignment.dueDate && Date.now() > new Date(assignment.dueDate).getTime();
          return <div key={assignment._id} className="card" style={{ padding: 18 }}>
            <div className="flex items-start justify-between flex-wrap" style={{ gap: 10 }}><div><strong>{assignment.title}</strong><p className="text-xs" style={{ color: 'var(--ink-soft)' }}>{assignment.courseTitle} · {assignment.type || 'assignment'} · {['homework', 'worksheet'].includes(assignment.type) ? 'completion + feedback' : `${assignment.maxMarks} marks`}</p></div><Tag status={submission?.status === 'graded' ? 'approved' : submission?.status === 'resubmit_requested' ? 'rejected' : submission ? 'pending' : overdue ? 'rejected' : 'pending'} label={submission?.status === 'graded' && ['homework', 'worksheet'].includes(assignment.type) ? 'reviewed' : submission?.status?.replace('_', ' ') || (overdue ? 'overdue' : 'pending')} /></div>
            {assignment.description && <p className="text-sm mt-2">{assignment.description}</p>}
            <p className="text-xs mt-2" style={{ color: overdue ? 'var(--rose)' : 'var(--ink-soft)' }}>Due: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleString() : 'No deadline'}{assignment.allowLate ? ' · Late submissions allowed' : ''}</p>
            {(assignment.attachments || []).map((item, index) => <a key={index} href={item.url} target="_blank" rel="noreferrer" className="text-xs" style={{ color: 'var(--emerald)', marginRight: 10 }}>Download: {item.name}</a>)}
            {submission?.feedback && <p className="text-sm mt-2" style={{ padding: 10, background: 'var(--sand)', borderRadius: 8 }}><strong>Teacher feedback:</strong> {submission.feedback}</p>}
            {submission?.status === 'graded' && <p className="text-sm mt-2"><strong>{['homework', 'worksheet'].includes(assignment.type) ? 'Teacher review complete' : `Marks: ${submission.marksObtained}/${assignment.maxMarks}`}</strong></p>}
            {submission && submission.status !== 'resubmit_requested' && <div className="admin-notice" style={{ marginTop: 10 }}><strong>{submission.status === 'graded' ? 'Teacher has graded this submission' : 'Submitted — waiting for teacher review'}</strong><p className="text-xs mt-1">Submitted {submission.submittedAt ? new Date(submission.submittedAt).toLocaleString() : 'successfully'}{submission.late ? ' · Marked late' : ' · On time'}</p>{submission.text && <details className="mt-2"><summary style={{ cursor: 'pointer', fontWeight: 600 }}>View my submitted answer</summary><p className="text-sm mt-2" style={{ whiteSpace: 'pre-wrap' }}>{submission.text}</p></details>}{(submission.attachments || []).map((item, index) => <a key={index} href={item.url} target="_blank" rel="noreferrer" className="text-xs mt-2" style={{ color: 'var(--emerald)', display: 'inline-block', marginRight: 10 }}>Open submitted file: {item.name}</a>)}</div>}
            <p className="text-xs mt-2"><strong>How to submit:</strong> {{ text: 'Write your answer online', file: 'Upload a handwritten scan or completed file', either: 'Choose online writing or file upload', both: 'Write online and upload a supporting file' }[assignment.submissionMode || 'either']}</p>
            {(!submission || submission.status === 'resubmit_requested') && (!overdue || assignment.allowLate) && <button type="button" className="btn btn-primary mt-2" onClick={() => { setOpenId(assignment._id); setText(''); setFile(null); setSubmissionChoice((assignment.submissionMode || 'either') === 'file' ? 'file' : 'text'); }}>{submission ? 'Submit Revision' : 'Submit Assignment'}</button>}
            {openId === assignment._id && <div className="card" style={{ marginTop: 12, padding: 14, background: 'var(--sand)' }}>
              {(assignment.submissionMode || 'either') === 'either' && <div className="flex gap-2 flex-wrap" style={{ marginBottom: 12 }}>
                <button type="button" className={`btn ${submissionChoice === 'text' ? 'btn-primary' : ''}`} onClick={() => { setSubmissionChoice('text'); setFile(null); }}>Write Online</button>
                <button type="button" className={`btn ${submissionChoice === 'file' ? 'btn-primary' : ''}`} onClick={() => { setSubmissionChoice('file'); setText(''); }}>Upload Handwritten / File</button>
              </div>}
              {['text', 'both'].includes(assignment.submissionMode) || ((assignment.submissionMode || 'either') === 'either' && submissionChoice === 'text') ? <div><label className="text-sm font-semibold" htmlFor={`answer-${assignment._id}`}>Write your answer online</label><textarea id={`answer-${assignment._id}`} className="form-input mt-2" rows={7} placeholder="Type your complete assignment answer here…" value={text} onChange={(e) => setText(e.target.value)} /></div> : null}
              {['file', 'both'].includes(assignment.submissionMode) || ((assignment.submissionMode || 'either') === 'either' && submissionChoice === 'file') ? <div style={{ marginTop: 10 }}><label className="text-sm font-semibold" htmlFor={`file-${assignment._id}`}>Upload completed work</label><p className="text-xs" style={{ color: 'var(--ink-soft)' }}>For handwritten work, take clear photos or combine pages into a PDF. PDF, Word documents and images are accepted.</p><input id={`file-${assignment._id}`} type="file" accept=".pdf,.doc,.docx,image/*" className="form-input mt-2" onChange={(e) => setFile(e.target.files?.[0] || null)} />{file && <p className="text-xs mt-2">Selected: {file.name}</p>}</div> : null}
              <div className="flex gap-2 mt-3"><button type="button" className="btn btn-primary" disabled={busy} onClick={() => submit(assignment)}>{busy ? 'Uploading & submitting…' : submission ? 'Submit Revision' : 'Submit Completed Assignment'}</button><button type="button" className="btn" onClick={() => setOpenId('')} disabled={busy}>Cancel</button></div>
            </div>}
          </div>;
        })}
      </div>
    </div>
  );
}

function StudentAssignmentsPanel({ onFlash }) {
  const [submissions, setSubmissions] = useState(null);
  const [results, setResults] = useState(null);

  useEffect(() => {
    apiRequest('/students/me/submissions').then(setSubmissions).catch((err) => onFlash(err.message));
    apiRequest('/students/me/results').then(setResults).catch((err) => onFlash(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <StudentAssignmentCenter onFlash={onFlash} />
      <StudentExamsSection onFlash={onFlash} />
      <h3 className="font-semibold mb-2 mt-6">My Submissions</h3>
      <Table
        loading={submissions === null}
        headers={['Assignment / Details', 'Due', 'Status', 'Marks / Teacher feedback']}
        rows={(submissions || []).map((s) => { const completionOnly = ['homework', 'worksheet'].includes(s.assignment?.type); return [<div>{s.assignment?.title}<p>{s.assignment?.description}</p></div>, s.assignment?.dueDate ? new Date(s.assignment.dueDate).toLocaleDateString() : '—', <Tag status={s.status === 'graded' ? 'approved' : s.status === 'resubmit_requested' ? 'rejected' : 'pending'} label={s.status === 'graded' && completionOnly ? 'reviewed' : s.status?.replace('_', ' ')} />, completionOnly ? (s.status === 'graded' ? 'Completed' : '—') : s.status === 'graded' ? `${s.marksObtained} / ${s.assignment?.maxMarks ?? '—'}` : `— / ${s.assignment?.maxMarks ?? '—'}`]; })}
        empty="No assignment submissions yet."
      />
      <h3 className="font-semibold mb-2 mt-6">My Results</h3>
      <Table
        loading={results === null}
        headers={['Exam', 'Institution', 'Subject / Class', 'Session / Term', 'Teacher', 'Result']}
        rows={(results || []).map((r) => [r.exam?.title || r.term || 'Result', r.institution?.name || r.exam?.institution?.name || r.course?.institution?.name || 'Independent', <span className="text-xs"><strong>{r.subject || r.exam?.subject || r.course?.subject || '—'}</strong><br />{r.classSection?.name || r.exam?.classSection?.name || r.course?.classSection?.name || 'No section'}</span>, <span className="text-xs">{r.academicSession || r.exam?.academicSession || r.classSection?.academicYear || '—'}<br />{r.term || r.exam?.term || '—'}</span>, r.teacher?.fullName || r.exam?.teacher?.fullName || '—', <span><strong>{r.marksObtained}/{r.totalMarks}</strong><br /><Tag status={Number(r.marksObtained) / Number(r.totalMarks || 1) * 100 >= Number(r.exam?.passingPercent ?? 50) ? 'approved' : 'rejected'} label={`${r.grade || '—'} · ${Math.round(Number(r.marksObtained) / Number(r.totalMarks || 1) * 100)}%`} /></span>])}
        empty="No results recorded yet."
      />
    </div>
  );
}

// Dedicated Attendance tab — self check-in (QR/GPS/Biometric) plus full history, no longer
// buried inside Assignments & Tests.
function StudentAttendancePanel({ onFlash }) {
  const [attendance, setAttendance] = useState(null);

  function loadAttendance() {
    apiRequest('/students/me/attendance').then(setAttendance).catch((err) => onFlash(err.message));
  }
  useEffect(loadAttendance, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <h3 className="font-semibold mb-2">Mark My Attendance</h3>
      <StudentAttendanceCheckInPanel onFlash={onFlash} onMarked={loadAttendance} />
      <h3 className="font-semibold mb-2 mt-6">My Attendance History</h3>
      <Table
        loading={attendance === null}
        headers={['Course', 'Date', 'Status', 'Marked through']}
        rows={(attendance || []).map((a) => [
          a.course?.title || 'Course',
          new Date(a.date).toLocaleDateString(),
          <Tag status={a.records?.[0]?.status === 'present' ? 'approved' : a.records?.[0]?.status === 'absent' ? 'rejected' : 'pending'} label={(a.records?.[0]?.status || 'unknown').replace('_', ' ')} />,
          ({ manual: 'Teacher marked', qr: 'Teacher QR check-in', face: 'Face verified by teacher', gps: 'Location check-in', webauthn: 'Device biometric' })[a.records?.[0]?.method] || 'Teacher marked'
        ])}
        empty="No attendance recorded yet."
      />
    </div>
  );
}

// Student self-check-in — QR (scan the teacher's session QR), GPS (optional, needs location
// permission) and WebAuthn/Passkey (device biometric — fingerprint, Face ID, Windows Hello).
// No RFID/NFC, no physical fingerprint machine, no retina hardware — everything here works from
// a normal phone/tablet/laptop browser, matching CareerZ's remote-study-first attendance scope.
function StudentAttendanceCheckInPanel({ onFlash, onMarked }) {
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState('');
  const [mode, setMode] = useState('');
  const [scanBusy, setScanBusy] = useState(false);
  const [sessionCode, setSessionCode] = useState('');
  const [gpsBusy, setGpsBusy] = useState(false);
  const [bioCreds, setBioCreds] = useState(null);
  const [bioBusy, setBioBusy] = useState(false);
  const [faceReady, setFaceReady] = useState(false);
  const [faceBusy, setFaceBusy] = useState(false);
  const [faceRequestStatus, setFaceRequestStatus] = useState('');
  const faceVideoRef = useRef(null);
  const faceApiRef = useRef(null);
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    apiRequest('/students/me/enrollments').then((list) => {
      const active = list.filter((e) => e.course);
      setCourses(active.map((e) => e.course));
      if (active[0]) setCourseId(active[0].course._id);
    }).catch(() => {});
    apiRequest('/webauthn/credentials/mine').then(setBioCreds).catch(() => setBioCreds([]));
  }, []);

  async function onQrScan(text) {
    if (scanBusy) return;
    let token;
    try { token = JSON.parse(text).t; } catch { token = text.trim(); }
    setScanBusy(true);
    try {
      const res = await apiRequest('/students/me/attendance/qr-checkin', { method: 'POST', body: { token, date: today } });
      onFlash(res.alreadyMarked ? 'Already checked in for this session.' : 'Attendance marked!', res.alreadyMarked ? undefined : 'success');
      onMarked?.();
    } catch (err) { onFlash(err.message); } finally { setTimeout(() => setScanBusy(false), 2000); }
  }

  async function submitSessionCode(e) {
    e.preventDefault();
    if (sessionCode.trim()) await onQrScan(sessionCode.trim());
  }

  function checkInGps() {
    if (!courseId) return onFlash('Select a course first.');
    if (!navigator.geolocation) return onFlash('Geolocation is not supported on this device/browser.');
    setGpsBusy(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const res = await apiRequest('/students/me/attendance/gps-checkin', {
          method: 'POST',
          body: { course: courseId, date: today, lat: pos.coords.latitude, lng: pos.coords.longitude }
        });
        onFlash(res.alreadyMarked ? 'Already checked in today.' : `Attendance marked! (${res.distanceMeters}m from class location)`, res.alreadyMarked ? undefined : 'success');
        onMarked?.();
      } catch (err) { onFlash(err.message); } finally { setGpsBusy(false); }
    }, () => { onFlash("Couldn't get your location — check your browser's location permission."); setGpsBusy(false); });
  }

  useEffect(() => {
    if (mode !== 'face') return;
    let stream = null;
    let cancelled = false;
    (async () => {
      try {
        const { loadFaceModels, faceapi } = await import('../../utils/faceApi');
        await loadFaceModels();
        faceApiRef.current = faceapi;
        if (cancelled) return;
        stream = await navigator.mediaDevices.getUserMedia({ video: {} });
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        faceVideoRef.current.srcObject = stream;
        await faceVideoRef.current.play();
        setFaceReady(true);
      } catch (err) { onFlash(err.message); }
    })();
    return () => { cancelled = true; stream?.getTracks().forEach((t) => t.stop()); setFaceReady(false); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  async function requestFaceCheckIn() {
    if (!courseId) return onFlash('Select a course first.');
    if (!faceReady || !faceApiRef.current) return onFlash('Camera and face models are still loading.');
    setFaceBusy(true);
    try {
      const faceapi = faceApiRef.current;
      const detection = await faceapi.detectSingleFace(faceVideoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();
      if (!detection) throw new Error('No face detected — face the camera in good lighting and try again.');
      const { descriptor: enrolledDescriptor } = await apiRequest('/students/me/face-descriptor');
      const distance = faceapi.euclideanDistance(detection.descriptor, new Float32Array(enrolledDescriptor));
      const res = await apiRequest('/students/me/attendance/face-checkin-request', { method: 'POST', body: { course: courseId, date: today, distance } });
      setFaceRequestStatus(res.status === 'approved' ? 'Already marked present today.' : 'Request sent — waiting for your teacher to confirm.');
      onFlash(res.status === 'approved' ? 'Already marked present today.' : 'Request sent — your teacher will confirm it.', 'success');
    } catch (err) { onFlash(err.message); } finally { setFaceBusy(false); }
  }

  async function registerBiometric() {
    setBioBusy(true);
    try {
      const options = await apiRequest('/webauthn/register/options');
      const attResp = await startRegistration({ optionsJSON: options });
      await apiRequest('/webauthn/register/verify', { method: 'POST', body: attResp });
      onFlash('Biometric/passkey registered on this device.', 'success');
      apiRequest('/webauthn/credentials/mine').then(setBioCreds).catch(() => {});
    } catch (err) {
      onFlash(err.name === 'NotAllowedError' ? 'Registration cancelled or not supported on this device.' : err.message);
    } finally { setBioBusy(false); }
  }

  async function checkInBiometric() {
    if (!courseId) return onFlash('Select a course first.');
    setBioBusy(true);
    try {
      const options = await apiRequest('/webauthn/attendance/options');
      const authResp = await startAuthentication({ optionsJSON: options });
      const res = await apiRequest('/webauthn/attendance/verify', { method: 'POST', body: { course: courseId, date: today, response: authResp } });
      onFlash(res.alreadyMarked ? 'Already checked in today.' : 'Attendance marked via biometric verification!', res.alreadyMarked ? undefined : 'success');
      onMarked?.();
    } catch (err) {
      onFlash(err.name === 'NotAllowedError' ? 'Verification cancelled or not supported on this device.' : err.message);
    } finally { setBioBusy(false); }
  }

  if (courses.length === 0) return null;

  return (
    <div className="card" style={{ padding: 20, marginBottom: 20 }}>
      <label style={{ display: 'inline-block', marginBottom: 14 }}>
        <span className="text-xs" style={{ display: 'block', color: 'var(--ink-soft)', fontWeight: 600, marginBottom: 6 }}>Course</span>
        <CustomSelect value={courseId} onChange={setCourseId} ariaLabel="Select course" options={courses.map((c) => ({ value: c._id, label: c.title }))} />
      </label>
      <div className="admin-notice" style={{ marginBottom: 14 }}><strong>Face attendance:</strong> If you're physically in class, your teacher selects your saved photo and verifies your live face from their own camera. If you're remote/online, use "Face (Remote)" below instead — your own camera verifies you and sends your teacher a request to confirm.</div>
      <p className="text-xs mb-2" style={{ color: 'var(--ink-soft)', fontWeight: 700 }}>Self check-in options (use only when your teacher enables one):</p>
      <div className="flex gap-2 mb-4 flex-wrap">
        <button type="button" className={mode === 'qr' ? 'btn btn-primary' : 'btn'} style={{ padding: '6px 16px', fontSize: '0.8rem' }} onClick={() => setMode(mode === 'qr' ? '' : 'qr')}>▣ Scan Teacher QR</button>
        <button type="button" className={mode === 'gps' ? 'btn btn-primary' : 'btn'} style={{ padding: '6px 16px', fontSize: '0.8rem' }} onClick={() => setMode('gps')}><FaLocationDot aria-hidden="true" /> GPS</button>
        <button type="button" className={mode === 'face' ? 'btn btn-primary' : 'btn'} style={{ padding: '6px 16px', fontSize: '0.8rem' }} onClick={() => { setMode(mode === 'face' ? '' : 'face'); setFaceRequestStatus(''); }}><FaFaceSmile aria-hidden="true" /> Face (Remote)</button>
        <button type="button" className={mode === 'bio' ? 'btn btn-primary' : 'btn'} style={{ padding: '6px 16px', fontSize: '0.8rem' }} onClick={() => setMode('bio')}><FaLock aria-hidden="true" /> Biometric</button>
      </div>

      {mode === 'qr' && <div><p className="text-xs mb-2" style={{ color: 'var(--ink-soft)' }}>QR on another screen? Scan it. Using the same device or attending online? Enter the code shared by your teacher.</p><form onSubmit={submitSessionCode} className="flex gap-2 mb-3 flex-wrap"><input className="form-input" placeholder="Enter teacher session code" value={sessionCode} onChange={(e) => setSessionCode(e.target.value.toUpperCase())} style={{ maxWidth: 260 }} /><button type="submit" className="btn btn-primary" disabled={!sessionCode.trim() || scanBusy}>{scanBusy ? 'Checking...' : 'Join with Code'}</button></form><details><summary className="text-xs" style={{ cursor: 'pointer', fontWeight: 700 }}>Or scan QR with camera</summary><div style={{ marginTop: 10 }}><QrScanner onScan={onQrScan} hint="Point the camera at the QR code on your teacher's screen." /></div></details></div>}

      {mode === 'gps' && (
        <div>
          <p className="text-xs mb-3" style={{ color: 'var(--ink-soft)' }}>Only works if your teacher has enabled GPS attendance for this course and you're within range.</p>
          <button type="button" className="btn btn-primary" onClick={checkInGps} disabled={gpsBusy}>{gpsBusy ? 'Checking location...' : 'Check In via Location'}</button>
        </div>
      )}

      {mode === 'face' && (
        <div>
          <p className="text-xs mb-3" style={{ color: 'var(--ink-soft)' }}>Requires face enrollment first (Digital Student ID page). Your camera compares your live face against your own enrolled face — the result is sent to your teacher as a request, not marked automatically.</p>
          <div style={{ position: 'relative', maxWidth: 320, marginBottom: 10 }}>
            <video ref={faceVideoRef} playsInline muted style={{ width: '100%', borderRadius: 14, background: '#000' }} />
            {!faceReady && <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 6 }}>Loading face models and starting camera...</p>}
          </div>
          <button type="button" className="btn btn-primary" onClick={requestFaceCheckIn} disabled={!faceReady || faceBusy}>{faceBusy ? 'Verifying...' : 'Verify My Face & Send Request'}</button>
          {faceRequestStatus && <p className="text-xs mt-2" style={{ color: 'var(--forest)', fontWeight: 600 }}>{faceRequestStatus}</p>}
        </div>
      )}

      {mode === 'bio' && (
        <div>
          {bioCreds === null ? (
            <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>Loading...</p>
          ) : bioCreds.length === 0 ? (
            <>
              <p className="text-xs mb-3" style={{ color: 'var(--ink-soft)' }}>Register your device's fingerprint/Face ID/Windows Hello once (requires a secure browser context — works on localhost or HTTPS). No biometric data is ever sent to or stored by CareerZ — only a secure cryptographic key.</p>
              <button type="button" className="btn btn-primary" onClick={registerBiometric} disabled={bioBusy}>{bioBusy ? 'Registering...' : 'Register Biometric / Passkey'}</button>
            </>
          ) : (
            <>
              <p className="text-xs mb-3" style={{ color: 'var(--ink-soft)' }}>{bioCreds.length} device{bioCreds.length > 1 ? 's' : ''} registered.</p>
              <button type="button" className="btn btn-primary" onClick={checkInBiometric} disabled={bioBusy}>{bioBusy ? 'Verifying...' : 'Check In via Biometric'}</button>
              <button type="button" className="btn ml-2" onClick={registerBiometric} disabled={bioBusy}>+ Register Another Device</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function StudentExamsSection({ onFlash }) {
  const [exams, setExams] = useState(null);
  const [openExam, setOpenExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [attempts, setAttempts] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(null);
  const autoSubmittingRef = useRef(false);

  useEffect(() => {
    apiRequest('/students/me/enrollments').then(async (enrollments) => {
      const active = enrollments.filter((e) => e.course);
      const lists = await Promise.all(active.map((e) =>
        apiRequest(`/courses/${e.course._id}/exams`).then((list) => list.map((ex) => ({ ...ex, courseTitle: e.course.title }))).catch(() => [])
      ));
      setExams(lists.flat());
    }).catch((err) => onFlash(err.message));
    apiRequest('/courses/exam-attempts/mine').then((rows) => setAttempts(Object.fromEntries(rows.map((row) => [String(row.exam), row])))).catch(() => {});
  }, [onFlash]);

  useEffect(() => {
    if (!openExam?.attempt?.expiresAt) { setTimeRemaining(null); return undefined; }
    const tick = () => {
      const seconds = Math.max(0, Math.ceil((new Date(openExam.attempt.expiresAt).getTime() - Date.now()) / 1000));
      setTimeRemaining(seconds);
    };
    tick(); const timer = setInterval(tick, 1000); return () => clearInterval(timer);
  }, [openExam]);

  useEffect(() => {
    if (openExam && timeRemaining === 0 && !autoSubmittingRef.current) {
      autoSubmittingRef.current = true;
      submitExam();
    }
  }, [timeRemaining]); // eslint-disable-line react-hooks/exhaustive-deps

  async function openExamForm(exam) {
    try {
      const started = await apiRequest(`/courses/exams/${exam._id}/start`, { method: 'POST' });
      autoSubmittingRef.current = false;
      setOpenExam({ ...started.exam, courseTitle: exam.courseTitle, attempt: started.attempt });
      setAttempts((current) => ({ ...current, [exam._id]: started.attempt })); setAnswers({});
    } catch (err) { onFlash(err.message); }
  }

  async function submitExam() {
    const payload = openExam.questions.map((q, i) => (
      q.type === 'mcq' ? { questionIndex: i, selectedOption: answers[i] ?? null } : { questionIndex: i, textAnswer: answers[i] || '' }
    ));
    try {
      const saved = await apiRequest(`/courses/exams/${openExam._id}/submit`, { method: 'POST', body: { answers: payload } });
      // An all-MCQ paper is checked at once; a paper with written answers waits for the teacher.
      onFlash(saved?.status === 'graded' ? `Exam checked: ${saved.score}/${openExam.totalMarks ?? '—'} · Grade ${saved.finalGrade}` : 'Exam submitted. MCQs were checked automatically; your teacher will mark the written answers.', 'success');
      setAttempts({ ...attempts, [openExam._id]: { ...(attempts[openExam._id] || {}), status: saved?.status || 'submitted', score: saved?.score, finalGrade: saved?.finalGrade } });
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
                    <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 2 }}>{ex.institution?.name || 'Independent'} · {ex.subject || ex.courseTitle} · {ex.classSection?.name || 'No section'}</p>
                    <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 2 }}>{ex.academicSession || 'Session not set'} · {ex.term || 'Term not set'} · {ex.type[0].toUpperCase() + ex.type.slice(1)} · {ex.teacher?.fullName || 'Teacher'}{ex.durationMinutes ? ` · ${ex.durationMinutes} min` : ''}</p>
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
        headers={['Exam', 'Subject / Class', 'Session / Term', 'Teacher', 'Schedule', 'Paper', 'Action']}
        rows={(exams || []).map((ex) => [
          <span><strong>{ex.title}</strong><br /><small>{ex.type}</small></span>, <span className="text-xs">{ex.subject || ex.courseTitle}<br />{ex.classSection?.name || 'No section'}</span>, <span className="text-xs">{ex.academicSession || '—'}<br />{ex.term || '—'}</span>, ex.teacher?.fullName || '—', ex.scheduledDate ? new Date(ex.scheduledDate).toLocaleString() : 'Available now', `${ex.questionCount ?? ex.questions.length} Q · ${ex.totalMarks ?? "varies"} marks · ${ex.durationMinutes ? `${ex.durationMinutes} min` : 'Untimed'}`,
          attempts[ex._id]?.status && attempts[ex._id].status !== 'in_progress'
            ? attempts[ex._id].status === 'graded'
              ? <span><Tag status="approved" label="graded" /><br /><strong className="text-sm">{attempts[ex._id].score}/{ex.totalMarks ?? '—'}{attempts[ex._id].finalGrade ? ` · Grade ${attempts[ex._id].finalGrade}` : ''}</strong></span>
              : <span><Tag status="approved" label={attempts[ex._id].status} /><br /><small>Waiting for the teacher to mark written answers</small></span>
            : ex.closesAt && Date.now() > new Date(ex.closesAt).getTime()
              ? <Tag status="rejected" label="closed" />
            : ex.scheduledDate && Date.now() < new Date(ex.scheduledDate).getTime()
              ? <span className="text-xs">Opens {new Date(ex.scheduledDate).toLocaleString()}</span>
              : <button className="btn btn-primary" style={{ padding: '5px 12px', fontSize: '0.78rem' }} onClick={() => openExamForm(ex)}>{attempts[ex._id] ? 'Resume Exam' : 'Start Exam'}</button>
        ])}
        empty="No exams available yet."
      />

      {openExam && (
        <div className="card reveal in mt-4" style={{ padding: 20 }}>
          <h4 className="font-semibold mb-3">{openExam.title}</h4>
          <ExamIntegrityMonitor attemptId={openExam.attempt?._id} />
          {timeRemaining !== null && <p className="text-sm mb-3" style={{ color: timeRemaining < 60 ? 'var(--rose)' : 'var(--ink-soft)', fontWeight: 700 }}>Time remaining: {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, '0')}</p>}
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
      sections.push(<section key={item.key} data-section={title} className={`student-detail-section${wide ? ' student-section-wide' : ''}`}><div className="student-detail-heading"><span className="student-detail-icon"><Icon aria-hidden="true" /></span><h2>{title}</h2></div><div className="student-detail-body">{items[++index]}</div></section>);
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
        <SummaryCard icon={FaWallet} title="Wallet Balance" count={`${dash.wallet.walletCurrency || 'PKR'} ${Number(dash.wallet.availableBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} onClick={() => onNavigate?.('wallet')} />
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
              <span style={{ color: 'var(--rose)', fontWeight: 700, fontSize: 13 }}><FaCircle aria-hidden="true" style={{ color: 'var(--rose)', fontSize: 8, verticalAlign: 'middle' }} /> Class in Progress</span>
              <p className="text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>Subject: {c.subject} · Teacher: {c.teacher?.fullName || '—'}{inst?.name ? ` · Institution: ${inst.name}` : ''}</p>
              <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>Date: {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} · Time: {formatTime12h(c.startTime)}–{formatTime12h(c.endTime)} · Status: Live</p>
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
                  Date: {nextDate ? nextDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) : DOW_LABEL[c.dayOfWeek]} · Time: {formatTime12h(c.startTime)}–{formatTime12h(c.endTime)} · Status: Upcoming
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
          <div className="overview-balance-primary"><span>Available balance</span><strong><small>{dash.wallet.walletCurrency || 'PKR'}</small> {Number(dash.wallet.availableBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong><span>Ready to use in your wallet</span></div>
          <div><span>Outstanding fees</span><strong><small>{dash.wallet.pendingFees[0]?.currency || 'PKR'}</small> {Number(dash.wallet.pendingFeeTotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong><span>{dash.wallet.pendingFeeCount || 0} pending fee records</span></div>
        </div>
        <p className="text-xs font-semibold mt-3">Outstanding Fees / Challans</p>
        {dash.wallet.pendingFees.length === 0 && (
          <p className="text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>No outstanding fees — <Tag status="approved" /> Payment status: Up to date.</p>
        )}
        {dash.wallet.pendingFees.slice(0, 2).map((f) => (
          <p key={f._id} className="text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>{f.title} — {f.currency} {f.amount} · Due: {f.dueDate ? new Date(f.dueDate).toLocaleDateString() : '—'} · Payment status: <Tag status={f.status === 'overdue' ? 'rejected' : 'pending'} /> <button type="button" className="btn btn-primary" style={{ padding: '3px 10px', fontSize: '0.72rem', marginLeft: 6 }} onClick={() => onNavigate?.('wallet')}>Pay Now</button></p>
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

function StudentAiAssistantPanel({ onFlash }) {
  const [status,setStatus] = useState(null);
  useEffect(() => { apiRequest('/ai/config').then(setStatus).catch(e => onFlash(e.message)); }, []);
  const tools = [['student_study_plan','Study Planner'],['student_notes_summary','Smart Notes'],['student_study_help','Study Tutor'],['student_homework','Homework Assistant'],['student_revision','Revision'],['student_practice','Practice Questions'],['student_mock_test','Mock Test'],['career_advice','Career Suggestions'],['student_skills','Skill Suggestions']];
  return <section className="student-ai-studio"><AiSettingsPanel purposes={[AI_PURPOSES[0]]} onFlash={onFlash} onChanged={() => apiRequest('/ai/config').then(setStatus)} /><div className="student-ai-tools-heading"><h3>Your study toolkit</h3><p>Choose a tool, then add your subject, topic and learning level. These tools use your personal API key; private institution records are not shared.</p></div><div className="student-ai-tool-grid" style={{display:'grid',gap:14,gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))'}}>{tools.map(([feature,title], index) => <AiFeatureCard key={feature} feature={feature} title={title} description={["Build a study schedule around your subjects and goals.","Turn a topic into clear, organized revision notes.","Work through a concept with step-by-step explanations.","Get guidance to understand and work through your homework.","Review key ideas and focus on what needs more practice.","Practise your topic with questions at your learning level.","Prepare for an exam with a structured practice test.","Explore career paths that fit your interests and skills.","Find skills to develop for your next learning or career goal."][index]} placeholder="Subject, topic, level and what you need help with" aiEnabled={!!status?.text.configured} />)}</div></section>;
}

function StudentScheduledLiveClasses({ user, onFlash }) {
  const [sessions, setSessions] = useState(null);
  const [active, setActive] = useState(null);
  function load() { apiRequest('/live-classes/student/mine').then(setSessions).catch((err) => { setSessions([]); onFlash(err.message); }); }
  useEffect(() => {
    load();
    const refresh = window.setInterval(load, 3000);
    return () => window.clearInterval(refresh);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function join(session) {
    if (session.status !== 'live') return onFlash('The teacher has not started this class yet.');
    try {
      await apiRequest(`/live-classes/${session._id}/join`, { method: 'POST' });
      if (session.provider === 'external') { window.open(session.externalMeetingUrl, '_blank', 'noopener,noreferrer'); return; }
      setActive(session);
    }
    catch (err) { onFlash(err.message); }
  }
  async function leave() {
    const session = active;
    setActive(null);
    if (session) await apiRequest(`/live-classes/${session._id}/leave`, { method: 'POST' }).catch(() => {});
    load();
  }
  if (active) return <><CareerZLiveClassroom session={active} user={user} role="student" onLeave={leave} onError={(err) => onFlash(err.message)} /><details className="card live-attendance"><summary className="font-semibold" style={{ cursor: 'pointer' }}>Attendance</summary><p className="text-xs" style={{ color: 'var(--ink-soft)', margin: '8px 0 14px' }}>Joining this class marks your attendance automatically. If your teacher asks for a QR code, a session code or your face, do it here.</p><StudentAttendanceCheckInPanel onFlash={onFlash} /></details></>;
  const visible = sessions || [];
  return (
    <div style={{ marginBottom: 22 }}>
      <h3 className="font-semibold mb-2">CareerZ Live Classes</h3>
      <p className="text-xs mb-3" style={{ color: 'var(--ink-soft)' }}>Your enrolled classes appear here automatically. When the teacher starts, join directly inside CareerZ.</p>
      {/* Step-by-step help for joining (audit point 3). */}
      <details className="card" style={{ padding: '10px 14px', marginBottom: 12 }}>
        <summary className="text-sm" style={{ cursor: 'pointer', fontWeight: 600 }}>How to join a live class</summary>
        <ol className="text-sm" style={{ margin: '8px 0 0', paddingInlineStart: 20, display: 'grid', gap: 4, listStyle: 'decimal' }}>
          <li>Open this page a few minutes before the class time. It updates by itself; no need to refresh.</li>
          <li>When the teacher starts the class, its status changes to <strong>Live now</strong> and a <strong>Join Class</strong> button appears.</li>
          <li>Press <strong>Join Class</strong>. When the browser asks, choose <strong>Allow</strong> for the camera and microphone.</li>
          <li>If you pressed Block by mistake, click the lock icon next to the website address, allow the camera and microphone, and join again.</li>
          <li>Use Chrome, Edge or Safari, and a stable internet connection. Your attendance is recorded when you join.</li>
        </ol>
      </details>
      <Table loading={sessions === null} headers={['Class', 'Institution', 'Teacher', 'Schedule', 'Status', 'Action']} rows={visible.map((session) => [
        <div><strong>{session.title}</strong><p className="text-xs">{session.course?.title}</p></div>, session.institution?.name, session.teacher?.fullName,
        `${new Date(session.scheduledStart).toLocaleString()} – ${new Date(session.scheduledEnd).toLocaleTimeString()}`,
        <Tag status={session.status === 'live' ? 'approved' : session.status === 'ended' ? 'completed' : 'pending'} label={session.status === 'live' ? 'Live now' : session.status} />,
        session.mode === 'physical' ? 'On-campus class · teacher marks attendance' : session.status === 'live' ? <button type="button" className="btn btn-primary" onClick={() => join(session)}>Join Class</button> : session.status === 'scheduled' ? <span className="text-xs">Join opens when the teacher starts</span> : '—'
      ])} empty="No live classes scheduled for your enrolled courses." />
    </div>
  );
}

// Student's own hostel status/requests — previously a student had no screen at all to see their
// room or submit a visitor/leave request; the institution had to know their raw room id already.
function StudentHostelPanel({ onFlash }) {
  const [data, setData] = useState(null);
  const [form, setForm] = useState({ room: '', type: 'visitor', visitorName: '', visitorRelation: '', visitDate: '', fromDate: '', toDate: '', reason: '' });

  function load() { apiRequest('/institution-ops/hostel/me').then(setData).catch((err) => onFlash(err.message)); }
  useEffect(load, [onFlash]);

  async function submit(e) {
    e.preventDefault();
    if (!form.room) return onFlash('Select which room this request is about.');
    try {
      await apiRequest('/institution-ops/hostel-requests', { method: 'POST', body: form });
      onFlash('Request submitted.', 'success');
      setForm({ ...form, visitorName: '', visitorRelation: '', visitDate: '', fromDate: '', toDate: '', reason: '' });
      load();
    } catch (err) { onFlash(err.message); }
  }

  if (data === null) return <p className="admin-notice">Loading...</p>;
  if ((data.rooms || []).length === 0) return <p className="admin-notice">You are not currently allocated a hostel room at any institution.</p>;

  return (
    <div>
      <div style={{ display: 'grid', gap: 10, marginBottom: 16 }}>
        {data.rooms.map((r) => (
          <div key={r._id} className="card" style={{ padding: 14 }}>
            <strong className="text-sm">{r.institution?.name}</strong>
            <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>Room {r.roomNumber} · {r.building || '—'} · Warden: {r.warden?.fullName || '—'} · Monthly fee: {r.currency || 'PKR'} {r.monthlyFee}</p>
          </div>
        ))}
      </div>

      <form onSubmit={submit} className="card" style={{ padding: 14, display: 'grid', gap: 10, marginBottom: 16 }}>
        <strong className="text-sm">Submit a Visitor / Leave Request</strong>
        <div className="flex gap-3 flex-wrap">
          <select className="form-select" value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })}>
            <option value="">Select room</option>
            {data.rooms.map((r) => <option key={r._id} value={r._id}>{r.institution?.name} — Room {r.roomNumber}</option>)}
          </select>
          <select className="form-select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option value="visitor">Visitor</option>
            <option value="leave">Leave</option>
          </select>
        </div>
        {form.type === 'visitor' ? (
          <div className="flex gap-3 flex-wrap">
            <input className="form-input" placeholder="Visitor name" value={form.visitorName} onChange={(e) => setForm({ ...form, visitorName: e.target.value })} required />
            <input className="form-input" placeholder="Relation" value={form.visitorRelation} onChange={(e) => setForm({ ...form, visitorRelation: e.target.value })} />
            <input type="date" className="form-input" value={form.visitDate} onChange={(e) => setForm({ ...form, visitDate: e.target.value })} required />
          </div>
        ) : (
          <div className="flex gap-3 flex-wrap">
            <label className="text-xs">From<input type="date" className="form-input" style={{ marginTop: 4 }} value={form.fromDate} onChange={(e) => setForm({ ...form, fromDate: e.target.value })} required /></label>
            <label className="text-xs">To<input type="date" className="form-input" style={{ marginTop: 4 }} value={form.toDate} onChange={(e) => setForm({ ...form, toDate: e.target.value })} required /></label>
          </div>
        )}
        <input className="form-input" placeholder="Reason" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
        <button type="submit" className="btn btn-primary" style={{ justifySelf: 'start' }}>Submit Request</button>
      </form>

      <Table
        headers={['Type', 'Details', 'Status']}
        rows={(data.requests || []).map((r) => [
          r.type,
          r.type === 'visitor' ? `${r.visitorName} (${r.visitorRelation})` : `${new Date(r.fromDate).toLocaleDateString()} – ${new Date(r.toDate).toLocaleDateString()}: ${r.reason}`,
          <Tag status={r.status === 'approved' ? 'approved' : r.status === 'rejected' ? 'rejected' : 'pending'} label={r.status} />
        ])}
        empty="No requests submitted yet."
      />
    </div>
  );
}

// Student's own assigned transport — route, driver, pickup timings, and any active journey link.
function StudentTransportPanel({ onFlash }) {
  const [rows, setRows] = useState(null);
  useEffect(() => {
    const load = () => apiRequest('/transport/my-transport').then(setRows).catch((err) => onFlash(err.message));
    load(); const timer = setInterval(load, 10000); return () => clearInterval(timer);
  }, [onFlash]);

  if (rows === null) return <p className="admin-notice">Loading...</p>;
  if (rows.length === 0) return <p className="admin-notice">You are not currently assigned to any transport vehicle.</p>;

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      {rows.map(({ vehicle: v, activeJourney }) => (
        <div key={v._id} className={`card vehicle-monitor student-transport${activeJourney ? ' live' : ''}`}>
          <div className="flex items-center justify-between flex-wrap" style={{ gap: 8 }}>
            <div className="lib-book"><strong>{v.vehicleNumber}</strong><span>{v.routeName || 'No route name set'}</span></div>
            {activeJourney ? <span className="vehicle-state live"><span aria-hidden="true" />Live now</span> : <span className="vehicle-state"><span aria-hidden="true" />Not on the road</span>}
          </div>
          <dl className="recruit-amounts">
            <div><dt>Institution</dt><dd>{v.institution?.name || '—'}</dd></div>
            <div><dt>Vehicle</dt><dd style={{ textTransform: 'capitalize' }}>{v.type}</dd></div>
            <div><dt>Driver</dt><dd>{v.driverName || '—'}{v.driverPhone && <small style={{ display: 'block', fontWeight: 400 }}>{v.driverPhone}</small>}</dd></div>
            <div><dt>Monthly fee</dt><dd>{v.currency || 'PKR'} {Number(v.monthlyFee || 0).toLocaleString()}</dd></div>
          </dl>
          {(v.stopPoints || []).length > 0 && (
            <div className="transport-stops"><span className="transport-stops-label">Stops</span><ol>{v.stopPoints.map((s, i) => <li key={i}>{s.name || s}</li>)}</ol></div>
          )}
          {activeJourney && <LiveTransportMap ping={activeJourney.lastPing} vehicle={v} title={`${v.vehicleNumber} live location`} />}
          {activeJourney && <StudentBoardingScanner journey={activeJourney} onFlash={onFlash} />}
        </div>
      ))}
    </div>
  );
}

function StudentBoardingScanner({ journey, onFlash }) {
  const [open, setOpen] = useState(false);
  const [event, setEvent] = useState('boarded');
  const [busy, setBusy] = useState(false);
  const [code, setCode] = useState('');
  async function scan(raw) {
    if (busy) return;
    setBusy(true);
    try {
      let token = raw;
      try { token = JSON.parse(raw).token || raw; } catch { /* plain token is also accepted */ }
      await apiRequest('/transport/journeys/board-by-qr', { method: 'POST', body: { token, event } });
      onFlash(event === 'boarded' ? 'You are marked as boarded.' : 'You are marked as exited.', 'success');
      setOpen(false);
    } catch (err) { onFlash(err.message); } finally { setBusy(false); }
  }
  function submitCode(e) {
    e.preventDefault();
    if (!code.trim()) return onFlash('Paste the code shown on the driver screen.');
    scan(code.trim());
  }
  return <div className="card" style={{ marginTop: 12, padding: 14, border: '1px solid var(--sand-line)' }}>
    <div className="flex items-center justify-between flex-wrap" style={{ gap: 10 }}>
      <div><strong className="text-sm">Bus Boarding Attendance</strong><p className="text-xs" style={{ color: 'var(--ink-soft)' }}>Choose whether you are entering or leaving, then scan the QR shown by the driver.</p></div>
      <button type="button" className="btn btn-primary" onClick={() => setOpen((value) => !value)}>{open ? 'Close Scanner' : 'Scan Driver QR'}</button>
    </div>
    {open && <div style={{ marginTop: 12 }}>
      <div className="flex gap-2 mb-3">
        <button type="button" className={event === 'boarded' ? 'btn btn-primary' : 'btn'} onClick={() => setEvent('boarded')}>Boarding bus</button>
        <button type="button" className={event === 'exited' ? 'btn btn-primary' : 'btn'} onClick={() => setEvent('exited')}>Leaving bus</button>
      </div>
      <form onSubmit={submitCode} className="flex gap-2 mb-3 flex-wrap" style={{ padding: 12, border: '1px solid var(--sand-line)', borderRadius: 12 }}>
        <input className="form-input" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Paste driver boarding code" style={{ flex: '1 1 280px' }} />
        <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Confirming…' : event === 'boarded' ? 'Confirm Boarding' : 'Confirm Exit'}</button>
        <p className="text-xs" style={{ width: '100%', color: 'var(--ink-soft)' }}>Same laptop: copy the temporary code from the driver tab and paste it here. No camera needed.</p>
      </form>
      <p className="text-xs" style={{ fontWeight: 700, marginBottom: 6 }}>Or scan with camera:</p>
      <QrScanner active={open && !busy} onScan={scan} hint={`Scan the driver's QR to mark yourself as ${event}.`} />
    </div>}
  </div>;
}

function StudentPanel({ onFlash }) {
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [openCourseId, setOpenCourseId] = useState(null);
  const [courseQuery, setCourseQuery] = useState('');
  const [paymentConfig, setPaymentConfig] = useState({ jazzcash: false });
  const [checkoutId, setCheckoutId] = useState(null);

  async function load() {
    setLoading(true); setLoadError('');
    try {
      setCourses(await apiRequest('/courses'));
      setEnrollments(await apiRequest('/students/me/enrollments'));
    } catch (err) { setLoadError(err.message); } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);
  useEffect(() => { Promise.all([getJazzCashConfig(), getSafepayConfig()]).then(([jazzcash, safepay]) => setPaymentConfig({ jazzcash: Boolean(jazzcash.enabled), safepay: Boolean(safepay.enabled) })); }, []);

  async function checkoutJazzCash(course, gateway) {
    setCheckoutId(course._id);
    try { await (gateway === 'safepay' ? startSafepayCheckout : startJazzCashCheckout)(`/payments/jazzcash/courses/${course._id}/checkout`); } catch (error) { onFlash(error.message); setCheckoutId(null); }
  }

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
            <p className="text-xs mt-2">{c.institution ? 'Included in institution degree fee' : (c.isFree ? 'Free' : `${c.currency} ${Number(c.price).toFixed(2)}`)}</p>
            {enrollments.some((entry) => entry.course?._id === c._id) ? (
                <button type="button" className="btn btn-primary mt-2" style={{ padding: '5px 12px', fontSize: '0.78rem' }} onClick={() => setOpenCourseId(c._id)}>View Lessons & Resources</button>
              )
              : c.institution ? <span className="text-xs">Assigned after admission and fee-plan enrollment</span>
              : c.isFree ? <button className="btn btn-primary mt-2" style={{ padding: '5px 12px', fontSize: '0.78rem' }} onClick={() => enroll(c._id)}>Enroll free</button>
                : <div className="flex gap-2 mt-2 flex-wrap">
                  {paymentConfig.safepay && <button type="button" className="btn btn-primary" disabled={checkoutId === c._id} onClick={() => checkoutJazzCash(c, 'safepay')}>Pay with Safepay</button>}
                  {paymentConfig.jazzcash && <button type="button" className="btn btn-primary" disabled={checkoutId === c._id} onClick={() => checkoutJazzCash(c)}>Pay with JazzCash</button>}
                  <ManualPayButton kind="course" id={c._id} onFlash={onFlash} onDone={load} />
                </div>}
          </div>
        ))}
      </div>
      <h3 className="font-semibold mb-2">My Enrollments</h3>
      {enrollments.length > 0 && <input className="form-input" type="search" placeholder="Search your courses by name, subject or teacher…" aria-label="Search your courses" value={courseQuery} onChange={(e) => setCourseQuery(e.target.value)} style={{ maxWidth: 460, marginBottom: 10 }} />}
      <Table
        loading={loading} error={loadError} onRetry={load}
        headers={['Course', 'Completion', 'Lesson Progress', 'Overall Score', 'Action']}
        rows={enrollments.filter((e) => { const q = courseQuery.trim().toLowerCase(); return !q || [e.course?.title, e.course?.subject, e.course?.teacher?.fullName, e.course?.institution?.name].join(' ').toLowerCase().includes(q); }).map((e) => [
          e.course?.title, COMPLETION_STATUS_LABEL[e.completionStatus] || (e.status === 'active' ? 'In progress' : e.status), `${e.progressPercent}%`, `${e.overallScore || 0}%`,
          <button className="btn" style={{ padding: '4px 12px', fontSize: '0.78rem' }} onClick={() => setOpenCourseId(e.course?._id)}>View Resources</button>
        ])}
        empty={courseQuery.trim() ? `No courses match "${courseQuery.trim()}".` : "No enrollments yet."}
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
  const [enrollment, setEnrollment] = useState(null);

  function load() {
    apiRequest(`/courses/${courseId}`).then(setData).catch((err) => onFlash(err.message));
    apiRequest('/students/me/enrollments').then((list) => {
      const mine = list.find((e) => e.course?._id === courseId);
      setCompletedIds((mine?.completedLessons || []).map(String));
      setEnrollment(mine || null);
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
          {data.course.teacher?._id && <TeacherReputationWidget teacherId={data.course.teacher._id} onFlash={onFlash} />}
          {totalLessons > 0 && <p className="text-xs mb-1" style={{ color: 'var(--ink-soft)' }}>Lesson Progress: {completedIds.length}/{totalLessons} lessons ({progressPercent}%)</p>}
          {enrollment && (
            <p className="text-xs mb-4" style={{ color: 'var(--ink-soft)' }}>
              Overall Course Score: {enrollment.overallScore || 0}% — <strong>{COMPLETION_STATUS_LABEL[enrollment.completionStatus] || 'In progress'}</strong>
              {enrollment.scoreParts && <span style={{ display: 'block', marginTop: 4 }}>Made of: {[['lessons', 'Lessons done'], ['assignments', 'Assignments graded'], ['tests', 'Tests graded'], ['attendance', 'Classes attended']].filter(([k]) => enrollment.scoreParts[k]?.weight > 0).map(([k, label]) => `${label} ${enrollment.scoreParts[k].done}/${enrollment.scoreParts[k].total} (${enrollment.scoreParts[k].pct}%, counts ${enrollment.scoreParts[k].weight})`).join(' · ')}</span>}
            </p>
          )}
          <LearningCenter key={courseId} selectedCourseId={courseId} workspace="student" embedded onFlash={onFlash} onUpdated={load} renderLessonExtras={l => <><LessonMetadata lessonId={l._id} canEdit={false} canReview={false} onFlash={onFlash} /><CourseForum courseId={courseId} lesson={l} onFlash={onFlash} compact />{l.kind === "slide_deck" && l.deck?.slides?.length > 0 ? <SlideDeckViewer title={l.title} slides={l.deck.slides} /> : null}</>} />
          <CourseForum courseId={courseId} onFlash={onFlash} />
        </>
      )}
    </div>
  );
}
