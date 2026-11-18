// Parent workspace, moved out of Dashboard.jsx unchanged (master 17G.3: readable, maintainable code).
import { FamilyPrivate } from '../../components/dashboard/FamilyPrivate';
import { FamilyAcademic, FamilyConnections, FamilyPayments } from '../../components/dashboard/FamilyCenter';
import { ParentAcademies } from '../../components/academy/Academy';
import FamilyCafeteria from '../../components/dashboard/FamilyCafeteria';
import FamilyClassrooms from '../../components/dashboard/FamilyClassrooms';
import MedicalHealth from '../../components/dashboard/MedicalHealth';
import InstitutionCommunity from '../../components/dashboard/InstitutionCommunity';
import { useEffect, useState } from 'react';
import { apiRequest } from '../../api/client';
import { FaBell, FaClipboardCheck, FaStar, FaUsers, FaWallet } from 'react-icons/fa6';
import { useAuth } from '../../context/AuthContext';
import CampusTourViewer from '../../components/CampusTourViewer';
import PtmHistory from '../../components/dashboard/PtmHistory';
import ParentUpdates from '../../components/dashboard/ParentUpdates';
import { QuickActions } from '../../components/dashboard/DashboardWidgets';
import { AI_PURPOSES, AiSettingsPanel, ComingSoon, CustomSelect, DOW_LABEL, GuardianTutoringApprovalPanel, LiveTransportMap, PTM_STATUS_TAG, PayFeeButton, ProfilePanel, PtmMeetingDetails, RolesPanel, SupportComplaintPanel, Table, Tag, TeacherReputationWidget, formatTime12h } from '../Dashboard';

export function ParentWorkspace({ tab, user, onFlash, onChanged, onNavigate,onMessageUser }) {
  if (tab === 'profile') return <><ProfilePanel user={user} onFlash={onFlash} onChanged={onChanged} /><FamilyPrivate onFlash={onFlash} /><RolesPanel onFlash={onFlash} onChanged={onChanged} /><SupportComplaintPanel onFlash={onFlash} /></>;
  if (tab === 'children') return <><FamilyConnections onFlash={onFlash} /><GuardianTutoringApprovalPanel onFlash={onFlash} /></>;
  if (tab === 'childAcademies') return <ParentAcademies onFlash={onFlash} />;
  if(tab==='cafeteria')return <FamilyCafeteria onFlash={onFlash}/>;
  if (tab === 'summary') return <ParentSummary onNavigate={onNavigate} />;
  if (tab === 'attendance') return <FamilyAcademic kind="attendance" onFlash={onFlash} />;
  if (tab === 'classroomObservation') return <FamilyClassrooms onFlash={onFlash} />;
  if (tab === 'progress') return <FamilyAcademic kind="results" onFlash={onFlash} />;
  if (tab === 'fees') return <ParentChildDataPanel onFlash={onFlash} kind="fees" />;
  if (tab === 'timetable') return <FamilyAcademic kind="timetable" onFlash={onFlash} />;
  if (tab === 'homework') return <ParentChildDataPanel onFlash={onFlash} kind="homework" />;
  if (tab === 'examSchedule') return <ParentChildDataPanel onFlash={onFlash} kind="exams" />;
  if (tab === 'portfolio') return <FamilyAcademic kind="portfolio" onFlash={onFlash} />;
  if (tab === 'performance') return <FamilyAcademic kind="performance" onFlash={onFlash} />;
  if (tab === 'institutionInfo') return <ParentInstitutionInfoPanel onFlash={onFlash} />;
  if (tab === 'teacherMessages') return <ParentTeacherMessagesPanel onFlash={onFlash} onNavigate={onNavigate} onMessageUser={onMessageUser}/>;
  if (tab === 'wallet') return <FamilyPayments onFlash={onFlash} />;
  if (tab === 'health') return <MedicalHealth mode="parent" onFlash={onFlash} />;
  if (tab === 'permissions') return <><FamilyAcademic kind="permissions" onFlash={onFlash} /></>;
  if (tab === 'ptm') return <ParentPtmPanel onFlash={onFlash} />;
  if (tab === 'aiAssistant') return <ParentAiAssistantPanel onFlash={onFlash} />;
  if (tab === 'transport') return <ParentTransportPanel onFlash={onFlash} />;
  if (tab === 'instEvents') return <InstitutionCommunity kind="events" onFlash={onFlash} />;
  if (tab === 'instHelpdesk') return <InstitutionCommunity kind="tickets" onFlash={onFlash} />;
  return <ComingSoon label={tab} />;
}

// Real, journey-scoped live transport (spec: Parent Safety) — location only ever shown while a
// journey is actually in progress for a vehicle the parent's own linked child is assigned to.
function ParentTransportPanel({ onFlash }) {
  const [vehicles, setVehicles] = useState(null);
  function load() { apiRequest('/transport/my-children').then(setVehicles).catch((err) => onFlash(err.message)); }
  useEffect(() => { load(); const timer = setInterval(load, 10000); return () => clearInterval(timer); }, []);

  if (vehicles === null) return <p role="status" className="admin-notice">Loading...</p>;
  if (vehicles.length === 0) return <p className="admin-notice">No transport vehicle assigned to your linked children yet.</p>;

  return (
    <div className="space-y-3">
      {vehicles.map((v) => (
        <div key={v.vehicle._id} className="card" style={{ padding: 16 }}>
          <div className="flex items-center justify-between flex-wrap" style={{ gap: 8 }}>
            <strong className="text-sm">{v.vehicle.vehicleNumber} — {v.vehicle.routeName || v.vehicle.type}</strong>
            {v.activeJourney ? <span style={{ color: 'var(--rose)', fontWeight: 700 }}>● Live</span> : <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>Not on the road</span>}
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>Children on this vehicle: {v.children.join(', ')}</p>
          {v.activeJourney?.lastPing?.lat != null && (
            <LiveTransportMap ping={v.activeJourney.lastPing} vehicle={v.vehicle} title={`${v.vehicle.vehicleNumber} live location`} />
          )}
        </div>
      ))}
    </div>
  );
}

// Master spec Part 11.10 "AI Parent Assistant" — BYOK (parent's own connected AI provider), asks
// a question about one linked child, backend summarizes that child's real attendance/results/
// fees/exam data and answers from it (never invents numbers). Same "summarize, don't decide"
// pattern as the Institution/Teacher AI assistants.
function ParentAiAssistantPanel({ onFlash }) {
  const [children, setChildren] = useState([]);
  const [studentId, setStudentId] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [dataSummary, setDataSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [dataConsent,setConsent]=useState(false),[sources,setSources]=useState([]),[institutionId,setInstitution]=useState('');
  useEffect(()=>{let active=true;setInstitution('');setConsent(false);setSources([]);if(studentId)apiRequest(`/parents/children/${studentId}/ai-sources`).then(rows=>{if(active)setSources(rows);}).catch(e=>onFlash(e.message));return()=>{active=false;};},[studentId]);

  useEffect(() => {
    apiRequest('/parents/children').then((list) => {
      setChildren(list);
      if (list[0]) setStudentId(list[0].student._id);
    }).catch((err) => onFlash(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function ask(e) {
    e.preventDefault();
    if (!question.trim()) return onFlash('Enter a question first.');
    setLoading(true); setAnswer(''); setDataSummary('');
    try {
      const res = await apiRequest(`/parents/children/${studentId}/ai-assistant`, { method: 'POST', body: { question: question.trim(),dataConsent,institutionId:institutionId||undefined } });
      setAnswer(res.answer);
      setDataSummary(res.dataSummary);
      setQuestion('');setConsent(false);
    } catch (err) { onFlash(err.message); } finally { setLoading(false); }
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
      <AiSettingsPanel onFlash={onFlash} purposes={[AI_PURPOSES[0]]} />
      <div className="admin-section">
        <div className="admin-section-heading"><div><h2>AI Parent Assistant</h2><p>Uses your own connected AI provider (above) to answer questions about your child's real attendance, results, fees and upcoming exams. It only summarizes what's already recorded — it never decides anything for you.</p></div></div>
        <label>AI provider account<select className="form-select" disabled={loading} value={institutionId} onChange={e=>{setInstitution(e.target.value);setConsent(false);}}><option value="">My own connected provider</option>{sources.map(i=><option key={i._id} value={i._id}>{i.name} — institution-funded</option>)}</select></label><label style={{display:'block',margin:'14px 0'}}><input type="checkbox" checked={dataConsent} disabled={loading} onChange={e=>setConsent(e.target.checked)}/> I agree to send this child’s attendance/results, fee-status summary, exam schedule and my question to the selected external AI provider for this request.</label><form onSubmit={ask} className="flex gap-3 items-end flex-wrap">
          {children.length > 1 && (
            <label style={{ display: 'inline-block' }}>
              <span className="text-xs" style={{ display: 'block', color: 'var(--ink-soft)', fontWeight: 600, marginBottom: 6 }}>Child</span>
              <select className="form-select" value={studentId} onChange={(e) => setStudentId(e.target.value)} style={{ minWidth: 200 }} aria-label="Select child">
                {children.map((c) => <option key={c.student._id} value={c.student._id}>{c.student.fullName}</option>)}
              </select>
            </label>
          )}
          <input className="form-input" placeholder="e.g. How is their attendance this month?" value={question} onChange={(e) => setQuestion(e.target.value)} style={{ minWidth: 280, flex: 1 }} required />
          <button type="submit" className="btn btn-primary" disabled={loading||!dataConsent}>{loading ? 'Thinking...' : 'Ask'}</button>
        </form>
      </div>
      {answer && (
        <div className="admin-section" style={{ marginTop: 16 }}>
          <div className="admin-section-heading"><div><h2>Answer</h2></div></div>
          <p style={{ whiteSpace: 'pre-line', fontSize: 14, lineHeight: 1.6 }}>{answer}</p>
          <details style={{ marginTop: 12 }}>
            <summary style={{ fontSize: 12, color: 'var(--ink-soft)', cursor: 'pointer' }}>Raw data used</summary>
            <pre style={{ fontSize: 12, whiteSpace: 'pre-wrap' }}>{dataSummary}</pre>
          </details>
        </div>
      )}
      <p style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 12 }}>Requires an AI provider connected above (BYOK — your own API key, e.g. OpenAI/Claude/Gemini).</p>
    </div>
  );
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
            <PayFeeButton fee={f} onFlash={onFlash} onPaid={reload} />
          ])}
          empty="No fee records yet."
        />
      )}
      {rows && kind === 'timetable' && (
        <Table
          headers={['Day', 'Time', 'Subject', 'Teacher', 'Room']}
          rows={rows.map((t) => [DOW_LABEL[t.dayOfWeek], `${formatTime12h(t.startTime)}–${formatTime12h(t.endTime)}`, t.subject, t.teacher?.fullName || '—', t.room || '—'])}
          empty="No timetable set up yet."
        />
      )}
      {rows && kind === 'homework' && (
        <Table
          headers={['Assignment', 'Due', 'Status', 'Marks']}
          rows={rows.map((s) => [s.assignment?.title, s.assignment?.dueDate ? new Date(s.assignment.dueDate).toLocaleDateString() : '—', <Tag status={s.status === 'graded' ? 'approved' : s.status==='overdue'?'rejected':'pending'} label={s.status} />, <div>{s.marksObtained ?? 'Pending'} / {s.assignment?.maxMarks}<p>{s.feedback}</p></div>])}
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

// Parent -> Institution satisfaction rating (spec: Institution<->Parent "parent satisfaction/
// engagement") — backend only accepts it from a parent whose linked child is actually enrolled
// at this institution.
function InstitutionFeedbackWidget({ institutionId, onFlash }) {
  const [summary, setSummary] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);

  function load() { apiRequest(`/institutions/${institutionId}/feedback/summary`).then((d) => { setSummary(d); if (d.myRating) { setRating(d.myRating); setComment(d.myComment || ''); } }).catch(() => {}); }
  useEffect(load, [institutionId]);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await apiRequest(`/parents/institutions/${institutionId}/feedback`, { method: 'POST', body: { rating, comment } });
      onFlash?.('Feedback submitted.', 'success');
      load();
    } catch (err) { onFlash?.(err.message); } finally { setBusy(false); }
  }

  if (!institutionId) return null;
  return (
    <div className="card" style={{ padding: 16, marginBottom: 20 }}>
      <strong className="text-sm">How is your experience with this institution?</strong>
      {summary && summary.count > 0
        ? <p className="text-xs flex items-center" style={{ color: 'var(--ink-soft)', margin: '4px 0', gap: 4 }}>Average: <FaStar aria-hidden="true" style={{ color: 'var(--gold)' }} /> {summary.average} ({summary.count} parent rating{summary.count === 1 ? '' : 's'})</p>
        : <p className="text-xs" style={{ color: 'var(--ink-soft)', margin: '4px 0' }}>No ratings yet — be the first.</p>}
      <form onSubmit={submit} className="rating-form">
        <label className="institution-field"><span>Your rating</span><select className="form-select" value={rating} onChange={(e) => setRating(Number(e.target.value))}>
          {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{'★'.repeat(n)} ({n})</option>)}
        </select></label>
        <label className="institution-field"><span>Comment (optional)</span><input className="form-input" placeholder="What went well, or what could be better?" value={comment} onChange={(e) => setComment(e.target.value)} /></label>
        <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Saving...' : summary?.myRating ? 'Update rating' : 'Submit rating'}</button>
      </form>
    </div>
  );
}

// Private engagement score, own view (spec 11.15) — never punitive, and the parent can dispute
// any specific input that feeds it.
function ParentOwnReputationPanel({ institutionId, onFlash }) {
  const { user } = useAuth();
  const [rep, setRep] = useState(null);
  const [disputeFor, setDisputeFor] = useState(null);
  const [reason, setReason] = useState('');

  function load() { apiRequest(`/parent-reputation/${institutionId}/${user._id}`).then(setRep).catch(() => {}); }
  useEffect(load, [institutionId]);

  async function submitDispute(category) {
    if (!reason.trim()) return onFlash('Explain what was incorrect first.');
    try {
      await apiRequest('/parent-reputation/disputes', { method: 'POST', body: { institutionId, category, referenceId: institutionId, reason: reason.trim() } });
      onFlash('Dispute submitted for the institution to review.', 'success');
      setDisputeFor(null); setReason('');
    } catch (err) { onFlash(err.message); }
  }

  if (!rep) return null;
  return (
    <div className="card" style={{ padding: 16, marginBottom: 20 }}>
      <strong className="text-sm">Your Engagement (private — only you and this institution see this)</strong>
      <p className="text-xs" style={{ color: 'var(--ink-soft)', margin: '6px 0' }}>{rep.overall !== null ? `${rep.label} (${rep.overall}/100)` : rep.label} — never affects admission, account access, or is shown publicly.</p>
      <div className="engagement-rows">
        {rep.components.filter((c) => c.score !== null).map((c) => (
          <div key={c.key} className="engagement-row">
            <div><strong>{({ ptmAttendance: 'Parent-teacher meeting attendance', notificationAcknowledgement: 'Reading school notices', feeResolution: 'Fees cleared on time', consentResponsiveness: 'Answering permission requests' })[c.key] || c.key.replace(/([A-Z])/g, ' $1').replace(/^./, (x) => x.toUpperCase())}</strong><small>{Math.round(c.score)}% · {c.count} record{c.count === 1 ? '' : 's'}</small><span className={`hostel-bar engagement-bar${c.score < 50 ? ' low' : c.score < 75 ? ' mid' : ''}`}><span style={{ width: `${Math.min(100, c.score)}%` }} /></span></div>
            <button type="button" className="btn" onClick={() => setDisputeFor(disputeFor === c.key ? null : c.key)}>{disputeFor === c.key ? 'Cancel' : 'Dispute'}</button>
          </div>
        ))}
      </div>
      {disputeFor && (
        <div className="flex gap-2 items-end flex-wrap" style={{ marginTop: 8 }}>
          <input className="form-input" placeholder="What was incorrect?" value={reason} onChange={(e) => setReason(e.target.value)} style={{ minWidth: 200, flex: 1 }} />
          <button type="button" className="btn btn-primary" style={{ padding: '5px 12px', fontSize: '0.78rem' }} onClick={() => submitDispute(disputeFor === 'ptmAttendance' ? 'ptm' : disputeFor === 'consentResponsiveness' ? 'consent' : disputeFor === 'notificationAcknowledgement' ? 'notifications' : 'fees')}>Submit</button>
        </div>
      )}
    </div>
  );
}

function ParentInstitutionInfoPanel({ onFlash }) {
  const [children, setChildren] = useState(null);
  const [schoolId,setSchoolId]=useState('');
  const schools=[...new Map((children||[]).flatMap(c=>c.institutions||[]).map(i=>[i._id,i])).values()];
  const [institution, setInstitution] = useState(undefined);
  const [newsletters, setNewsletters] = useState(null);
  const [magazine, setMagazine] = useState(null);
  const [campusBuildings, setCampusBuildings] = useState(null);

  useEffect(() => {
    apiRequest('/parents/me/dashboard').then((d) => setChildren(d.children)).catch((err) => onFlash(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const instId = schoolId || schools[0]?._id || children?.[0]?.institutionId;
    if (!instId) { setInstitution(null); return; }
    let active=true;setInstitution(undefined);setNewsletters(null);setMagazine(null);setCampusBuildings(null);apiRequest(`/institutions/${instId}`).then(i=>{if(active)setInstitution(i);}).catch(() => {if(active)setInstitution(null);});return()=>{active=false;};
  }, [children,schoolId]);

  useEffect(() => {
    if (!institution?._id) return;
    let active=true;apiRequest(`/newsletters/published?institution=${institution._id}`).then(r=>{if(active)setNewsletters(r);}).catch(() => {if(active)setNewsletters([]);});
    apiRequest(`/magazine/published?institution=${institution._id}`).then(r=>{if(active)setMagazine(r);}).catch(() => {if(active)setMagazine([]);});
    apiRequest(`/institutions/${institution._id}/campus-buildings`).then(r=>{if(active)setCampusBuildings(r);}).catch(() => {if(active)setCampusBuildings([]);});return()=>{active=false;};
  }, [institution]);

  if (children === null) return <p role="status" className="admin-notice">Loading...</p>;
  if (children.length === 0) return <p className="admin-notice">No linked children yet — link one from the "My Children" tab first.</p>;
  if (institution === undefined) return <p role="status" className="admin-notice">Loading...</p>;
  if (!institution) return <p className="admin-notice">Your linked child isn't connected to an institution yet.</p>;

  return (
    <div>
      <label style={{display:'block',marginBottom:16}}>Child institution<select className="form-select" value={schoolId||schools[0]?._id||institution._id} onChange={e=>setSchoolId(e.target.value)}>{schools.map(i=><option key={i._id} value={i._id}>{i.name}</option>)}</select></label>
      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        {institution.logo&&<img src={institution.logo} alt={institution.name+' logo'} style={{width:120,height:72,objectFit:'contain',marginBottom:12}}/>}<h3 className="font-semibold mb-2">{institution.name}</h3><p>{institution.address}</p>{institution.phone&&<p>Phone: <a href={'tel:'+institution.phone}>{institution.phone}</a></p>}{institution.email&&<p>Email: <a href={'mailto:'+institution.email}>{institution.email}</a></p>}
        <p className="family-chips" style={{ alignItems: 'center' }}>{institution.type && <span className="lib-chip">{institution.type}</span>}<span className="family-sub" style={{ margin: 0 }}>{[institution.city, institution.country].filter(Boolean).map((s) => String(s).replace(/\b\w+/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase())).join(', ') || '—'}</span></p>
        {institution.description && <p className="text-sm mt-2">{institution.description}</p>}
        {institution.website && <p className="text-sm mt-2"><a href={institution.website} target="_blank" rel="noreferrer">{institution.website}</a></p>}
      </div>

      <InstitutionFeedbackWidget institutionId={institution._id} onFlash={onFlash} />
      <ParentOwnReputationPanel institutionId={institution._id} onFlash={onFlash} />

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
          <div key={m._id} className="ptm-card">
            <p className="font-medium">{m.title}</p>
            <p className="text-xs" style={{ color: 'var(--ink-soft)', margin: '4px 0' }}>By {m.student?.fullName || 'A student'} · {m.type}</p>
            <p className="text-sm">{m.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ParentTeacherMessagesPanel({onFlash,onNavigate,onMessageUser}){
 const [children,setChildren]=useState(null),[rating,setRating]=useState('');
 useEffect(()=>{apiRequest('/parents/children').then(async rows=>setChildren(await Promise.all(rows.map(async r=>({...r,teachers:await apiRequest('/parents/children/'+r.student._id+'/teachers')}))))).catch(e=>onFlash(e.message));},[]);
 if(children===null)return <p role="status">Loading teachers…</p>;
 return <section><h2>Child teachers & feedback</h2>{children.map(c=><article key={c._id} className="card" style={{padding:20,marginTop:16}}><h3>{c.student.fullName}</h3>{c.teachers.map(r=><div key={r.teacher._id} style={{padding:'12px 0',borderBottom:'1px solid var(--sand-line)'}}><strong>{r.teacher.fullName}</strong><p>{r.subjects.join(', ')}</p><button className="btn btn-primary" onClick={()=>onMessageUser?onMessageUser(r.teacher):onNavigate?.('messages')}>Message teacher</button> <button className="btn" onClick={()=>setRating(r.teacher._id)}>Rate teacher</button></div>)}{!c.teachers.length&&<p>No current teacher assigned.</p>}</article>)}{!children.length&&<p>Link a child to see their teachers.</p>}{rating&&<TeacherReputationWidget teacherId={rating} onFlash={onFlash}/>}</section>;
}

function ParentPtmPanel({ onFlash }) {
  const [children, setChildren] = useState(null);
  const [childId, setChildId] = useState('');
  const [teachers, setTeachers] = useState(null);
  const [form, setForm] = useState({ teacherId: '', courseId: '', timetableId: '', contextKey: '', requestedDate: '', mode: 'video', notes: '' });
  const [meetings, setMeetings] = useState(null);
  const [recurring, setRecurring] = useState(null);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    apiRequest('/parents/me/dashboard').then((d) => {
      setChildren(d.children);
      if (d.children.length > 0) setChildId(d.children[0].id);
    }).catch((err) => onFlash(err.message));
  }, [onFlash]);

  useEffect(() => {
    if (!childId) return;
    setForm({teacherId:'',courseId:'',timetableId:'',contextKey:'',requestedDate:'',mode:'video',notes:''});
    apiRequest(`/parents/children/${childId}/teachers`).then(setTeachers).catch((err) => onFlash(err.message));
    apiRequest(`/ptm/recurring/for-child/${childId}`).then(setRecurring).catch(() => setRecurring([]));
  }, [childId, onFlash]);

  function loadMeetings() { apiRequest('/ptm/mine').then(setMeetings).catch((err) => onFlash(err.message)); }
  useEffect(() => {
    loadMeetings();
    const timer=window.setInterval(loadMeetings,10000);
    window.addEventListener('focus',loadMeetings);
    return()=>{window.clearInterval(timer);window.removeEventListener('focus',loadMeetings);};
  }, []);

  async function submitRequest(e) {
    e.preventDefault();
    if (!form.teacherId || !form.requestedDate) return onFlash('Pick a teacher and a date/time.');
    try {
      await apiRequest('/ptm', { method: 'POST', body: { studentId: childId, ...form, requestedDate:new Date(form.requestedDate).toISOString() } });
      onFlash('Meeting request sent. Waiting for the teacher to confirm.', 'success');
      setForm({ teacherId: '', courseId: '', timetableId: '', contextKey: '', requestedDate: '', mode: 'video', notes: '' });
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
  async function bookRecurring(scheduleId, occurrenceDate) {
    try {
      await apiRequest(`/ptm/recurring/${scheduleId}/book`, { method: 'POST', body: { studentId: childId, occurrenceDate } });
      onFlash('Booked — confirmed immediately.', 'success');
      loadMeetings();
      apiRequest(`/ptm/recurring/for-child/${childId}`).then(setRecurring).catch(() => {});
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

      {recurring && recurring.length > 0 && (
        <div className="space-y-2 mb-6 border border-[var(--sand-line)] rounded-xl p-3">
          <strong className="text-sm">Recurring Slots — Book Directly</strong>
          {recurring.map((s) => (
            <div key={s._id} className="flex items-center justify-between flex-wrap" style={{ gap: 8, padding: '6px 0' }}>
              <span className="text-xs">{s.title} · {children.find(c=>c.id===childId)?.name} · {s.className||'Class not assigned'} · {s.subject||'Subject not recorded'} · {s.teacher?.fullName} · {s.institution?.name||'Independent teaching'} — {s.frequency}</span>
              <div className="flex gap-2 flex-wrap">
                {s.upcoming.slice(0, 2).map((d) => (
                  <button key={d} type="button" className="btn" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={() => bookRecurring(s._id, d)}>{new Date(d).toLocaleDateString()}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={submitRequest} className="nl-form ptm-request-form">
        <div className="nl-form-head"><h4>Request a meeting</h4><p>Pick the teacher and a time. The teacher confirms it or suggests another.</p></div>
        {teachers === null && <p className="admin-notice">Loading teachers...</p>}
        {teachers?.length === 0 && <p className="admin-notice">No teachers found yet — this child's class timetable isn't set up.</p>}
        {teachers?.length > 0 && (<div className="institution-field"><span>Teacher</span>
          <CustomSelect
            value={form.contextKey} onChange={(v) => { const t=teachers.find(t=>[t.teacher._id,t.courseId,t.timetableId].join(':')===v); if(t)setForm({...form,contextKey:v,teacherId:t.teacher._id,courseId:t.courseId,timetableId:t.timetableId}); }} ariaLabel="Teacher" minWidth="100%"
            options={teachers.map(t=>({value:[t.teacher._id,t.courseId,t.timetableId].join(':'),label:[t.teacher.fullName,t.subject,t.className||'Class not assigned',t.schoolName||'Independent teaching'].join(' · ')}))}
          /></div>
        )}
        <div className="assign-grid">
        <label className="institution-field"><span>Preferred date and time</span><input className="form-input" type="datetime-local" value={form.requestedDate} onChange={(e) => setForm({ ...form, requestedDate: e.target.value })} required /></label>
        <div className="institution-field"><span>Meeting type</span><CustomSelect
          value={form.mode} onChange={(v) => setForm({ ...form, mode: v })} ariaLabel="Meeting mode" minWidth="100%"
          options={[{ value: 'video', label: 'Video Call' }, { value: 'physical', label: 'In Person' }]}
        /></div>
        </div>
        <label className="institution-field"><span>What would you like to discuss? (optional)</span><textarea className="form-input" placeholder="e.g. Math progress and homework" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></label>
        <div className="nl-form-foot"><button type="submit" className="btn btn-primary" disabled={teachers?.length === 0}>Send Request</button></div>
      </form>

      <div className="space-y-3">
        {(meetings || []).map((m) => (
          <div key={m._id} className="ptm-card">
            <div className="flex items-center justify-between flex-wrap" style={{ gap: 8 }}>
              <div>
                <strong className="text-sm">{m.teacher?.fullName || '—'}</strong>
                <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>{m.subject || '—'} · {new Date(m.confirmedDate || m.requestedDate).toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })} · {m.mode === 'video' ? 'Video call' : 'In person'}</p>
                {m.status === 'confirmed' && m.mode === 'physical' && <p className="text-xs mt-1">{m.location || 'Location pending'}</p>}
              </div>
              <Tag status={PTM_STATUS_TAG[m.status] || 'pending'} label={m.status} />
            </div>
            <div className="flex gap-2 flex-wrap" style={{ marginTop: 8 }}>
              {['pending', 'confirmed'].includes(m.status) && <button className="btn staff-remove" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => cancelMeeting(m._id)}>Cancel</button>}
              {['confirmed', 'completed'].includes(m.status) && <button className="btn" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => setExpanded(expanded === m._id ? null : m._id)}>{expanded === m._id ? 'Hide' : 'Details'}</button>}
            </div>
            <PtmHistory meeting={m} />
            {expanded === m._id && <PtmMeetingDetails meeting={m} myRole="parent" onFlash={onFlash} onChanged={loadMeetings} />}
          </div>
        ))}
        {(meetings || []).length === 0 && <p className="admin-notice">No meeting requests yet.</p>}
      </div>
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
  const verificationNotice=dash.pendingVerification?.length>0&&<div role="status" className="card" style={{padding:20,marginBottom:20}}><h2>School verification needed</h2><p>{dash.pendingVerification.map(c=>c.name).join(', ')}: private school records are locked until guardian documents are approved by the school.</p><button className="btn btn-primary" onClick={()=>onNavigate?.('children')}>Open My Children to submit documents</button></div>;
  if (dash.children.length === 0 && dash.pendingVerification?.length) return verificationNotice;
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
      {verificationNotice}
      <ParentUpdates />
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
