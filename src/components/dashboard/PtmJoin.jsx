import { useEffect, useState } from 'react';
import { apiRequest, session } from '../../api/client';
import CareerZLiveClassroom from '../CareerZLiveClassroom';

export default function PtmJoin({ meeting }) {
  const [active, setActive] = useState(null), [error, setError] = useState(''), [busy, setBusy] = useState(false);
  async function join() {
    if (busy) return;
    setBusy(true); setError('');
    try {
      const data = await apiRequest(`/ptm/${meeting._id}/video`);
      setActive({ ...data.meeting, _id: `ptm:${meeting._id}`, ptmId: meeting._id, title: meeting.title || 'Parent-Teacher Meeting', course: { title: meeting.subject } });
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  useEffect(() => { if (new URLSearchParams(window.location.search).get('ptm') === meeting._id) join(); }, [meeting._id]);
  return <div>
    {active ? <CareerZLiveClassroom session={active} user={session.getUser()} role={String(meeting.teacher?._id || meeting.teacher) === String(session.getUser()?._id) ? 'teacher' : 'parent'} onLeave={() => setActive(null)} onError={err => setError(err.message)} /> : <button className="btn btn-primary" type="button" disabled={busy} onClick={join}>{busy ? 'Connecting…' : 'Join Meeting'}</button>}
    {error && <p role="alert">{error}</p>}
  </div>;
}
