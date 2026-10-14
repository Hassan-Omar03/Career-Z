import { useEffect, useState } from 'react';
import { apiRequest } from '../../api/client';
import { BADGE_COLOR } from '../../utils/teacherProfile';

// The teacher's verified record (hours, students, ratings), their badge and exactly what the next
// badge still needs. All numbers come from CareerZ records, never from the teacher's own entries.
export default function TeacherStandingCard({ onFlash }) {
  const [s, setS] = useState(null);
  useEffect(() => { apiRequest('/teachers/me/standing').then(setS).catch((e) => onFlash?.(e.message)); }, []);
  if (!s) return null;
  return (
    <div className="admin-section admin-account-card teacher-standing" style={{ marginTop: 20 }}>
      <div className="admin-section-heading">
        <div><h2>Verified Record &amp; Badge</h2><p>Counted only from classes, students and ratings recorded on CareerZ.</p></div>
        {s.badge ? <span className="teacher-badge" style={{ background: BADGE_COLOR[s.badge.key] }}>{s.badge.label}</span> : <span className="teacher-badge muted">No badge yet</span>}
      </div>
      <div className="teacher-standing-stats">
        <div><strong>{s.verifiedHours}</strong><span>verified teaching hours</span></div>
        <div><strong>{s.liveClasses}</strong><span>live classes held</span></div>
        <div><strong>{s.classesWithAttendance}</strong><span>classes with attendance</span></div>
        <div><strong>{s.studentsTaught}</strong><span>students taught</span></div>
        <div><strong>{s.reviews.average ?? '—'}</strong><span>{s.reviews.count} verified rating{s.reviews.count === 1 ? '' : 's'}</span></div>
      </div>
      {s.next && <div className="teacher-standing-next">
        <strong>Next: {s.next.label}</strong>
        <ul>{s.next.needs.map((n) => <li key={n}>{n}</li>)}</ul>
      </div>}
      <details>
        <summary>How badges are earned</summary>
        <table className="teacher-badge-rules"><thead><tr><th>Badge</th><th>Hours</th><th>Ratings</th><th>Average</th><th>Students</th></tr></thead>
          <tbody>{s.rules.map((r) => <tr key={r.key}><td>{r.label}</td><td>{r.hours}</td><td>{r.reviews}</td><td>{r.rating}+</td><td>{r.students}{r.experienceYears ? ` · ${r.experienceYears}+ yrs experience` : ''}</td></tr>)}</tbody>
        </table>
        <p className="text-xs">Hours count live classes held on CareerZ (up to 6 hours per session). Your account must be verified by CareerZ.</p>
      </details>
    </div>
  );
}
