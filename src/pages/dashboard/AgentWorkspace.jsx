// Agent workspace, moved out of Dashboard.jsx unchanged (master 17G.3: readable, maintainable code).
import { MarketTrendsCard } from '../../components/agents/AgentMaster';
import { VisaCases } from '../../components/visa/Visa';
import AgentRecruitmentPanel from '../../components/recruitment/AgentRecruitmentPanel';
import AgentScholarshipsPanel from '../../components/scholarship/AgentScholarships';
import { useEffect, useState } from 'react';
import { apiRequest } from '../../api/client';
import { ApplicantContact, CvDownload, HiringStatusControl } from '../../components/dashboard/ApplicantTools';
import { FaAward, FaBell, FaBriefcase, FaCalendarCheck, FaFileLines, FaSackDollar, FaShieldHalved, FaUser, FaUsers, FaWallet, FaXmark } from 'react-icons/fa6';
import InterviewJoin from '../../components/dashboard/InterviewJoin';
import { ReceivingAccount } from '../../components/payments/ManualPay';
import { QuickActions, RecentActivity } from '../../components/dashboard/DashboardWidgets';
import { ComingSoon, CustomSelect, EmployerJobsPanel, EmployerPostJobPanel, INTERVIEW_STATUS, NotificationsPanel, PayoutRequestForm, ProfilePanel, RolesPanel, SummaryCard, SupportComplaintPanel, Table, Tag } from '../Dashboard';

export function AgentWorkspace({ tab, user, onFlash, onChanged, onNavigate }) {
  if (tab === 'profile') return <><ProfilePanel user={user} onFlash={onFlash} onChanged={onChanged} /><RolesPanel onFlash={onFlash} onChanged={onChanged} /><SupportComplaintPanel onFlash={onFlash} /></>;
  if (tab === 'summary') return <><AgentDashboardPanel user={user} onFlash={onFlash} onNavigate={onNavigate} /><MarketTrendsCard onFlash={onFlash} /></>;
  if (tab === 'post') return <EmployerPostJobPanel onFlash={onFlash} asAgent />;
  if (tab === 'visaCases') return <div className="institution-ui agent-ui"><VisaCases onFlash={onFlash} /></div>;
  if (tab === 'jobs') return <EmployerJobsPanel onFlash={onFlash} />;
  if (tab === 'instituteRequests') return <AgentRecruitmentPanel onFlash={onFlash} renderPostJob={(r, done) => <EmployerPostJobPanel key={r._id} onFlash={onFlash} institution={r.institution} agreementId={r.activeAgreement._id} onPosted={done} />} />;
  if (tab === 'agentScholarships') return <AgentScholarshipsPanel onFlash={onFlash} />;
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
      {filtered.length === 0 ? <p className="po-empty">No candidates yet — once someone applies to your placements, they'll show up here.</p> : <div className="cand-list">
        {filtered.map((c) => (
          <article key={c._id} className="cand-card">
            <div className="cand-main">
              <div className="cand-head">
                {c.applicant?.profilePhoto ? <img src={c.applicant.profilePhoto} alt="" className="family-avatar" /> : <span className="family-avatar" aria-hidden="true">{(c.applicant?.fullName || '?')[0]}</span>}
                <div style={{ minWidth: 0 }}><strong>{c.applicant?.fullName}</strong><ApplicantContact application={c} /></div>
              </div>
              <p className="family-chips"><span className="lib-chip">{c.job.title}</span><span className="family-sub" style={{ margin: 0 }}>Applied {new Date(c.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span></p>
              <dl className="obs-card-facts cand-facts">
                <div><dt>Skills</dt><dd>{c.resumeSnapshot?.skills?.length > 0 ? c.resumeSnapshot.skills.join(', ') : 'None listed'}{c.jobSkillCount > 0 && c.resumeSnapshot?.skills?.length > 0 && <small className="cand-match">{c.matchCount}/{c.jobSkillCount} match</small>}</dd></div>
                <div><dt>Experience</dt><dd>{c.resumeSnapshot?.experienceLevel || '—'}</dd></div>
                <div><dt>Location</dt><dd>{c.resumeSnapshot?.location || '—'}</dd></div>
              </dl>
              <div><CvDownload application={c} onFlash={onFlash} /></div>
            </div>
            <div className="cand-status"><span className="cand-status-label">Hiring status</span><HiringStatusControl key={`${c._id}-${c.status}`} application={c} onFlash={onFlash} onSaved={load} /></div>
          </article>
        ))}
      </div>}
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
      {candidates.length === 0 ? <p className="po-empty">{emptyText}</p> : <div className="cand-list">
        {candidates.map((c) => (
          <article key={c._id} className="cand-card">
            <div className="cand-main">
              <div className="cand-head">
                {c.applicant?.profilePhoto ? <img src={c.applicant.profilePhoto} alt="" className="family-avatar" /> : <span className="family-avatar" aria-hidden="true">{(c.applicant?.fullName || '?')[0]}</span>}
                <div style={{ minWidth: 0 }}><strong>{c.applicant?.fullName}</strong></div>
              </div>
              <p className="family-chips"><span className="lib-chip">{c.job.title}</span><span className="family-sub" style={{ margin: 0 }}>{new Date(c.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span></p>
              <dl className="obs-card-facts cand-facts">
                <div><dt>Skills</dt><dd>{c.resumeSnapshot?.skills?.length > 0 ? c.resumeSnapshot.skills.join(', ') : 'None listed'}</dd></div>
                <div><dt>Experience</dt><dd>{c.resumeSnapshot?.experienceLevel || '—'}</dd></div>
                <div><dt>Location</dt><dd>{c.resumeSnapshot?.location || '—'}</dd></div>
              </dl>
              <div>{c.resumeSnapshot?.cvFileUrl ? <a className="btn" href={c.resumeSnapshot.cvFileUrl} target="_blank" rel="noreferrer">View CV</a> : <small className="family-sub">CV not uploaded</small>}</div>
            </div>
          </article>
        ))}
      </div>}
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
          <button type="button" className="u-modal-close" onClick={onClose}><FaXmark aria-hidden="true" /></button>
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
                  <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 4 }}>{new Date(i.scheduledDate).toLocaleString()} · {i.mode === 'physical' ? 'Physical' : 'Online'} · {i.mode === 'physical' ? (i.location || 'Location TBD') : 'CareerZ video room'}</p>
                  {i.feedback && <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 6 }}><strong>Feedback:</strong> {i.feedback}</p>}
                  <span style={{ display: 'inline-block', marginTop: 8 }}><Tag status={st.tag} label={st.label} /></span>
                </div>
              </div>
              {i.status === 'scheduled' && (
                <div className="flex flex-wrap" style={{ gap: 8, flexShrink: 0 }}>
                  {i.mode === 'online' && <InterviewJoin interview={i} />}
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
  const [contacts, setContacts] = useState([]);
  const [candidateIds, setCandidateIds] = useState(null);
  const [activeUser, setActiveUser] = useState(null);
  const [thread, setThread] = useState(null);
  const [text, setText] = useState('');

  function load() {
    apiRequest('/messages/conversations').then(setConversations).catch((err) => onFlash(err.message));
    apiRequest('/messages/contacts').then(setContacts).catch(() => setContacts([]));
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
        <p className="text-xs mb-3" style={{ color: 'var(--ink-soft)' }}>To start a new conversation, choose a candidate, employer or institute in the "New Message" box.</p>
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
          <label style={{ display: 'block', marginBottom: 14 }}>
            <span className="text-xs" style={{ display: 'block', color: 'var(--ink-soft)', fontWeight: 600, marginBottom: 6 }}>Recipient</span>
            <select className="form-select" value="" onChange={(e) => { const c = contacts.find((x) => x.user._id === e.target.value); if (c) openThread(c.user); }}>
              <option value="">{contacts.length ? 'Select candidate, employer or institute…' : 'No contacts yet — they appear when someone applies to your jobs or you work with an employer or institute'}</option>
              {contacts.map((c) => <option key={c.user._id} value={c.user._id}>{c.user.fullName} — {c.relationship}{c.context ? ` · ${c.context}` : ''}</option>)}
            </select>
          </label>
        )}
        {activeUser && (
          <>
            <button type="button" className="btn" style={{ padding: '4px 12px', fontSize: '0.75rem', marginBottom: 10 }} onClick={() => { setActiveUser(null); setThread(null); }}>← New message</button>
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
      <p className="text-xs mb-3" style={{ color: 'var(--ink-soft)' }}>Earned automatically ({data.commissions[0]?.rate ?? 0}% of the placement's minimum salary) when a candidate you placed is marked "hired". An admin reviews Pending → Approved → Available before it can be withdrawn.</p>
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

  async function withdraw(currency, { payoutMethod, payoutDetails, accountTitle }) {
    try {
      const result = await apiRequest('/commissions/withdraw', { method: 'POST', body: { currency, payoutMethod, payoutDetails, accountTitle } });
      onFlash(`Withdrawal requested — receipt ${result.transactionId}.`, 'success');
      load();
      return result;
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
      <ReceivingAccount onFlash={onFlash} />
      <h3 className="font-semibold" style={{ marginBottom: 4, marginTop: 16 }}>Wallet</h3>
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
