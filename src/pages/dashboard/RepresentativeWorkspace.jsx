// Representative workspace, moved out of Dashboard.jsx unchanged (master 17G.3: readable, maintainable code).
import { FaBell, FaCalendarCheck, FaChalkboardUser, FaClipboardList, FaCommentDots, FaFileLines, FaLock, FaShieldHalved, FaUser } from 'react-icons/fa6';
import { useEffect, useState } from 'react';
import { apiRequest } from '../../api/client';
import { QuickActions, RecentActivity } from '../../components/dashboard/DashboardWidgets';
import { ComingSoon, CustomSelect, ProfilePanel, RolesPanel, SummaryCard, SupportComplaintPanel, Table, Tag } from '../Dashboard';

export function RepresentativeWorkspace({ tab, user, onFlash, onChanged, onNavigate, repInfo }) {
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
                        return { value: s, label: locked ? <span className="flex items-center" style={{ gap: 5 }}>{REP_APP_STATUS_LABEL[s]} <FaLock aria-hidden="true" size={10} /></span> : REP_APP_STATUS_LABEL[s], disabled: locked };
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
                  {f.brochureUrl && <a className="btn" style={{ padding: '7px 16px', fontSize: '0.78rem' }} href={f.brochureUrl} target="_blank" rel="noreferrer"><FaFileLines aria-hidden="true" /> Brochure</a>}
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
