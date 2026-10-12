import PtmJoin from './PtmJoin';
export default function PtmHistory({ meeting }) {
  return <div style={{ marginTop: 12 }}>
    {meeting.title && <p><strong>Meeting:</strong> {meeting.title}</p>}
    <p><strong>Student:</strong> {meeting.student?.fullName} · <strong>Class / section:</strong> {meeting.className || 'Not assigned'} · <strong>Roll:</strong> {meeting.rollNumber || 'Not assigned'}<br /><strong>Parent:</strong> {meeting.parent?.fullName || 'Linked guardian'} · <strong>Teacher:</strong> {meeting.teacher?.fullName}<br /><strong>Subject:</strong> {meeting.subject || 'Not recorded'} · <strong>School:</strong> {meeting.institution?.name || 'Independent teaching'}</p>
    {meeting.status === 'confirmed' && meeting.mode === 'video' && <PtmJoin meeting={meeting} />}
    {meeting.observation && <p><strong>Linked child update:</strong> {meeting.observation.subject || meeting.subject} · {meeting.observation.type}<br />{meeting.observation.text}</p>}
    <details><summary>Meeting history</summary>
      <p>Request created · {new Date(meeting.createdAt).toLocaleString()}</p>
      {(meeting.history || []).map((event, index) => <p key={event._id || index}><strong>{event.status === 'pending' ? 'Requested' : event.noShow ? 'Completed — parent absent' : event.status}</strong> · {event.actor?.fullName || 'System'} · {new Date(event.at).toLocaleString()}{event.scheduledFor && <><br />Meeting time: {new Date(event.scheduledFor).toLocaleString()}</>}</p>)}
      {!meeting.history?.length && <p>Current saved status: {meeting.status}. Earlier status changes were not recorded for this older meeting.</p>}
    </details>
  </div>;
}
