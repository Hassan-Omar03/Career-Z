import PtmJoin from './PtmJoin';
export default function PtmHistory({ meeting }) {
  return <div className="ptm-history">
    {meeting.title && <p className="ptm-title"><strong>Meeting:</strong> {meeting.title}</p>}
    <dl className="obs-card-facts ptm-facts">{[['Student', meeting.student?.fullName], ['Class / section', meeting.className || 'Not assigned'], ['Roll', meeting.rollNumber || 'Not assigned'], ['Parent', meeting.parent?.fullName || 'Linked guardian'], ['Teacher', meeting.teacher?.fullName], ['Subject', meeting.subject || 'Not recorded'], ['School', meeting.institution?.name || 'Independent teaching']].map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
    {meeting.status === 'confirmed' && meeting.mode === 'video' && <PtmJoin meeting={meeting} />}
    {meeting.observation && <div className="ptm-linked"><strong>Linked child update · {meeting.observation.subject || meeting.subject} · {meeting.observation.type}</strong><p>{meeting.observation.text}</p></div>}
    <details className="obs-history"><summary>Meeting history</summary>
      <p className="ptm-event">Request created · {new Date(meeting.createdAt).toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })}</p>
      {(meeting.history || []).map((event, index) => <p key={event._id || index} className="ptm-event"><strong>{event.status === 'pending' ? 'Requested' : event.noShow ? 'Completed — parent absent' : event.status}</strong> · {event.actor?.fullName || 'System'} · {new Date(event.at).toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })}{event.scheduledFor && <><br /><small>Meeting time: {new Date(event.scheduledFor).toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })}</small></>}</p>)}
      {!meeting.history?.length && <p>Current saved status: {meeting.status}. Earlier status changes were not recorded for this older meeting.</p>}
    </details>
  </div>;
}
