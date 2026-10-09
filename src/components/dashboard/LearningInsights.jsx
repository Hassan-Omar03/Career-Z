import { useEffect, useState } from 'react';
import { apiRequest } from '../../api/client';

export function CourseInsights({ id, busy, onRestore, onError }) {
  const [data, setData] = useState(null), [backups, setBackups] = useState([]);
  useEffect(() => { let alive = true; Promise.all([apiRequest(`/learning/${id}/analytics`), apiRequest(`/learning/${id}/backups`)]).then(([report, rows]) => { if (alive) { setData(report); setBackups(rows); } }).catch(onError); return () => { alive = false; }; }, [id, busy]);
  return <><details><summary>Course analytics</summary>{data && <><p>{data.enrolled} enrolled · {data.completionRate}% completed · average completion score {data.averageScore}%</p><p>Average graded assessment score: {data.averageAssessmentScore == null ? 'No graded assessments yet' : `${data.averageAssessmentScore}%`}</p>{data.lessons.map(l => <p key={l.lesson}>{l.title}: {l.completed} completed · {l.videoViewers} video viewers · graded score {l.averageAssessmentScore == null ? 'not available' : `${l.averageAssessmentScore}%`} · {l.awaitingAfterPrevious || 0} awaiting this lesson after finishing the previous one</p>)}{data.difficultLessons?.length > 0 && <p>Lowest assessment scores: {data.difficultLessons.slice(0, 3).map(l => `${l.title} (${l.averageAssessmentScore}%, ${l.gradedAttempts} graded attempts)`).join(', ')}</p>}{data.popularContent?.length > 0 && <p>Most studied: {data.popularContent.slice(0, 3).map(l => `${l.title} (${l.engagedStudents} students)`).join(', ')}</p>}{data.students.map(s => <p key={s.student?._id}>{s.student?.fullName || 'Student'}: lesson progress {s.progress}% · overall score {s.score}% · {s.status}</p>)}</>}</details>
    <details><summary>Automatic recovery snapshots</summary><p>The most recent 30 content snapshots are retained. Restoring adds a new revision and keeps newer items; staged content needs approval again.</p>{backups.map(b => <p key={b._id}>{new Date(b.createdAt).toLocaleString()} <button className="btn" disabled={busy} onClick={() => onRestore(b._id)}>Restore snapshot</button></p>)}</details></>;
}

export function VideoEditor({ lesson, onChange }) {
  function rows(field, label, columns) {
    return <fieldset><legend>{label}</legend>{(lesson[field] || []).map((row, n) => <div key={n}>{columns.map(([key, placeholder, type]) => <input key={key} className="form-input" type={type || 'text'} min={type === 'number' ? 0 : undefined} placeholder={placeholder} value={row[key] ?? ''} onChange={e => onChange({ ...lesson, [field]: lesson[field].map((item, i) => i === n ? { ...item, [key]: type === 'number' ? Number(e.target.value) : e.target.value } : item) })} />)}<button className="btn" type="button" onClick={() => onChange({ ...lesson, [field]: lesson[field].filter((_, i) => i !== n) })}>Remove</button></div>)}<button className="btn" type="button" onClick={() => onChange({ ...lesson, [field]: [...(lesson[field] || []), Object.fromEntries(columns.map(([key, , type]) => [key, type === 'number' ? 0 : '']))] })}>Add {label.toLowerCase()}</button></fieldset>;
  }
  return <details><summary>Video captions, chapters and quality</summary><label><input type="checkbox" checked={lesson.videoDownloadAllowed !== false} onChange={e => onChange({ ...lesson, videoDownloadAllowed: e.target.checked })} />Allow this video to be downloaded offline</label>{rows('videoSources', 'Quality source', [['label', 'Quality label (e.g. 720p)'], ['url', 'HTTPS video file URL', 'url']])}{rows('captions', 'Subtitle track', [['label', 'Caption label'], ['language', 'Language code (e.g. en)'], ['url', 'HTTPS WebVTT subtitle file', 'url']])}{rows('videoChapters', 'Video chapter', [['title', 'Chapter title'], ['seconds', 'Start time in seconds', 'number']])}</details>;
}

export function ReviewerSettings({ id, busy, onChange, onError }) {
  const [data, setData] = useState(null);
  useEffect(() => { let alive = true; apiRequest(`/learning/${id}/reviewers`).then(value => { if (alive) setData(value); }).catch(onError); return () => { alive = false; }; }, [id, busy]);
  return data && <details><summary>Department and principal reviewers</summary><p>Reviewers must already belong to the institution. The institution owner grants and revokes these roles.</p>{data.staff.filter(s => s.user).map(s => <div key={s.user._id}><strong>{s.user.fullName}</strong>{[['department', 'content:review:department', 'Department reviewer'], ['principal', 'content:review:principal', 'Principal reviewer']].map(([field, permission, label]) => <label key={field} style={{ display: 'block' }}><input type="checkbox" disabled={!data.canGrant || busy} checked={s.permissions.includes(permission)} onChange={e => onChange(s.user._id, { [field]: e.target.checked })} />{label}</label>)}</div>)}</details>;
}

export function TranslationDraft({ lesson, institutionId, onDraft, onError }) {
  const [language, setLanguage] = useState('Urdu'), [scope, setScope] = useState('personal'), [busy, setBusy] = useState(false);
  async function translate() {
    setBusy(true);
    try { const { result } = await apiRequest('/ai/generate', { method: 'POST', body: { feature: 'teacher_notes', institutionId: scope === 'institution' ? institutionId : undefined, prompt: `Translate these teaching notes into ${language}. Preserve meaning, equations and examples. Return only translated notes:\n${lesson.content || ''}` } }); onDraft({ ...lesson, _id: undefined, title: `${lesson.title} (${language})`, content: result }); }
    catch (error) { onError(error); }
    finally { setBusy(false); }
  }
  return <details><summary>Create a translated lesson draft</summary><label>Target language<input className="form-input" value={language} onChange={e => setLanguage(e.target.value)} /></label><label>AI service<select className="form-select" value={scope} onChange={e => setScope(e.target.value)}><option value="personal">My configured AI service</option>{institutionId && <option value="institution">Institution AI service (permission required)</option>}</select></label><button className="btn" disabled={busy || !language.trim() || !lesson.content} onClick={translate}>{busy ? 'Translating…' : 'Generate draft'}</button><p>The original lesson stays available. Review the draft before saving; the course publishing policy applies.</p></details>;
}
