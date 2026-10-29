import { useEffect, useState } from 'react';
import { apiRequest, session as authSession } from '../../api/client';
import CareerZLiveClassroom from '../CareerZLiveClassroom';

// "Join Interview": online job interviews open in CareerZ's own video room (the same built-in
// WebRTC system as live classes and parent–teacher meetings). No outside meeting service.
// Opening /dashboard?interview=<id> (the emailed link) joins straight away.
export default function InterviewJoin({ interview, label = 'Join Interview', style }) {
  const [active, setActive] = useState(null), [error, setError] = useState(''), [busy, setBusy] = useState(false);
  const id = interview?._id;
  async function join() {
    if (busy || !id) return;
    setBusy(true); setError('');
    try {
      const data = await apiRequest(`/jobs/interviews/${id}/video`);
      setActive({ session: { ...data.meeting, _id: `interview:${id}`, privateRoom: true, rtcConfigPath: `/jobs/interviews/${id}/video`, course: { title: interview.job?.company || 'Job interview' } }, role: data.host ? 'teacher' : 'student' });
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  useEffect(() => { if (id && new URLSearchParams(window.location.search).get('interview') === String(id)) join(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!interview || interview.mode !== 'online' || interview.status !== 'scheduled') return null;
  if (interview.provider && interview.provider !== 'careerz' && interview.externalUrl) {
    const name = { google_meet: 'Google Meet', zoom: 'Zoom', teams: 'Teams', custom: 'meeting' }[interview.provider] || 'meeting';
    return <a className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.78rem', flexShrink: 0, ...style }} href={interview.externalUrl} target="_blank" rel="noopener noreferrer">{label} on {name}</a>;
  }
  return (
    <>
      <button type="button" className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.78rem', flexShrink: 0, ...style }} disabled={busy} onClick={join}>{busy ? 'Connecting…' : label}</button>
      {error && <small role="alert" style={{ color: 'var(--rose)', display: 'block', maxWidth: 320 }}>{error}</small>}
      {active && (
        <div role="dialog" aria-modal="true" aria-label="Interview" style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'var(--paper, #faf8f2)', overflowY: 'auto', padding: 16 }}>
          <CareerZLiveClassroom session={active.session} user={authSession.getUser()} role={active.role} onLeave={() => setActive(null)} onError={(err) => { setActive(null); setError(err.message); }} />
        </div>
      )}
    </>
  );
}
