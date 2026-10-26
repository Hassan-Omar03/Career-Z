import { useEffect, useState } from 'react';
import { apiRequest } from '../../api/client';

// Cover letters the person writes and keeps (up to 20) and reuses on the apply form. Works fully
// without AI: write it yourself or start from your CV. With a connected AI key, the AI can draft
// one from the job and your CV; you still review and save it.

const EMPTY = { title: '', company: '', role: '', body: '' };

// A plain starting letter from the person's own CV (no AI, nothing invented).
export function letterFromCv(resume, { role, company, name }) {
  const exp = (resume?.experience || [])[0];
  const edu = (resume?.education || [])[0];
  const skills = (resume?.skills || []).slice(0, 5);
  const lines = [
    `Dear Hiring Manager${company ? ` at ${company}` : ''},`,
    '',
    `I am writing to apply for the ${role || 'advertised'} position${company ? ` at ${company}` : ''}.${resume?.headline ? ` I am a ${resume.headline.toLowerCase()}` : ''}${resume?.location ? ` based in ${resume.location}` : ''}${resume?.headline || resume?.location ? '.' : ''}`,
    resume?.summary ? `\n${resume.summary}` : '',
    exp ? `\nMost recently, I worked as ${exp.title}${exp.company ? ` at ${exp.company}` : ''}${exp.duration ? ` (${exp.duration})` : ''}.${exp.description ? ` ${exp.description}` : ''}` : '',
    edu ? `\nI hold a ${edu.degree}${edu.institution ? ` from ${edu.institution}` : ''}${edu.year ? ` (${edu.year})` : ''}.` : '',
    skills.length ? `\nMy key skills include ${skills.join(', ')}.` : '',
    `\nI would welcome the opportunity to discuss how I can contribute to your team. Thank you for your time and consideration.`,
    '',
    'Sincerely,',
    name || ''
  ];
  return lines.filter((l) => l !== '').join('\n').replace(/\n{3,}/g, '\n\n');
}

export default function CoverLettersPanel({ onFlash, user }) {
  const [list, setList] = useState(null), [edit, setEdit] = useState(null), [busy, setBusy] = useState(false), [aiReady, setAiReady] = useState(false);
  const load = () => apiRequest('/resumes/cover-letters').then(setList).catch((e) => { setList([]); onFlash?.(e.message); });
  useEffect(() => { load(); apiRequest('/ai/config').then((s) => setAiReady(Boolean(s?.text?.configured))).catch(() => {}); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function fromCv() {
    try { const resume = await apiRequest('/resumes/me'); setEdit((f) => ({ ...f, body: letterFromCv(resume, { role: f.role, company: f.company, name: user?.fullName }) })); }
    catch (e) { onFlash?.(e.message); }
  }
  async function withAi() {
    setBusy(true);
    try {
      const resume = await apiRequest('/resumes/me');
      const prompt = `Write a cover letter for the role "${edit.role || 'the advertised role'}"${edit.company ? ` at ${edit.company}` : ''}. Applicant: ${user?.fullName || ''}. Use ONLY these facts from my CV, do not invent any: ${JSON.stringify({ headline: resume.headline, summary: resume.summary, experience: resume.experience, education: resume.education, skills: resume.skills }).slice(0, 3000)}. Plain text, about 200 words, no placeholders in brackets.`;
      const { result } = await apiRequest('/ai/generate', { method: 'POST', body: { feature: 'cover_letter', prompt } });
      setEdit((f) => ({ ...f, body: String(result || '').trim() }));
      onFlash?.('AI draft added. Review it, then save.', 'success');
    } catch (e) { onFlash?.(e.message); } finally { setBusy(false); }
  }
  async function save(e) {
    e.preventDefault();
    setBusy(true);
    try {
      if (edit._id) await apiRequest(`/resumes/cover-letters/${edit._id}`, { method: 'PATCH', body: edit });
      else await apiRequest('/resumes/cover-letters', { method: 'POST', body: edit });
      onFlash?.('Cover letter saved.', 'success'); setEdit(null); load();
    } catch (err) { onFlash?.(err.message); } finally { setBusy(false); }
  }
  async function remove(l) {
    if (!window.confirm(`Delete “${l.title}”?`)) return;
    try { await apiRequest(`/resumes/cover-letters/${l._id}`, { method: 'DELETE' }); load(); } catch (e) { onFlash?.(e.message); }
  }
  async function pdf(l) {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    doc.setFont('helvetica', 'bold'); doc.setFontSize(15); doc.text(user?.fullName || '', 20, 22);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5); doc.setTextColor(100); doc.text([user?.email, user?.phone].filter(Boolean).join('  |  '), 20, 28);
    doc.text(new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }), 190, 28, { align: 'right' });
    doc.setDrawColor(200); doc.line(20, 32, 190, 32);
    doc.setTextColor(30); doc.setFont('times', 'normal'); doc.setFontSize(11.5);
    let y = 44;
    for (const line of doc.splitTextToSize(l.body, 170)) { if (y > 280) { doc.addPage(); y = 20; } doc.text(line, 20, y); y += 6; }
    doc.save(`Cover letter - ${l.title}.pdf`.replace(/[^\w .-]+/g, ''));
  }

  if (edit) return (
    <form onSubmit={save} className="card" style={{ padding: 20, display: 'grid', gap: 10, maxWidth: 820 }}>
      <strong>{edit._id ? 'Edit cover letter' : 'New cover letter'}</strong>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <input className="form-input" style={{ flex: '1 1 200px', minWidth: 0 }} required maxLength={120} placeholder="Name, e.g. Teaching jobs" value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} />
        <input className="form-input" style={{ flex: '1 1 200px', minWidth: 0 }} maxLength={160} placeholder="Job title (optional)" value={edit.role} onChange={(e) => setEdit({ ...edit, role: e.target.value })} />
        <input className="form-input" style={{ flex: '1 1 200px', minWidth: 0 }} maxLength={160} placeholder="Company (optional)" value={edit.company} onChange={(e) => setEdit({ ...edit, company: e.target.value })} />
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button type="button" className="btn" onClick={fromCv}>Start from my CV</button>
        <button type="button" className="btn" disabled={!aiReady || busy} onClick={withAi} title={aiReady ? '' : 'Connect your AI provider in Career Tools first'}>{busy ? 'Writing…' : aiReady ? 'Write with AI' : 'Write with AI (connect an AI key first)'}</button>
      </div>
      <textarea className="form-input" rows={14} required maxLength={8000} placeholder="Write your cover letter" value={edit.body} onChange={(e) => setEdit({ ...edit, body: e.target.value })} />
      <div style={{ display: 'flex', gap: 8 }}><button type="submit" className="btn btn-primary" disabled={busy}>Save</button><button type="button" className="btn" onClick={() => setEdit(null)}>Cancel</button></div>
    </form>
  );
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div className="card" style={{ padding: 20 }}>
        <strong className="text-sm">Cover letters</strong>
        <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 6 }}>Write cover letters once and pick one when you apply. Start from your CV, write your own, or let your AI provider draft one if you connected it. No AI key is needed.</p>
        <button type="button" className="btn btn-primary" style={{ marginTop: 10 }} onClick={() => setEdit({ ...EMPTY })}>+ New cover letter</button>
      </div>
      {!list ? <p role="status" className="admin-notice">Loading...</p> : list.length === 0 ? <p className="admin-notice">No cover letters yet.</p> : list.map((l) => (
        <div key={l._id} className="card" style={{ padding: 16, display: 'grid', gap: 6 }}>
          <strong className="text-sm">{l.title}</strong>
          {(l.role || l.company) && <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>{[l.role, l.company].filter(Boolean).join(' · ')}</span>}
          <p className="text-xs" style={{ whiteSpace: 'pre-wrap', margin: 0, maxHeight: 90, overflow: 'hidden' }}>{l.body}</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button type="button" className="btn" onClick={() => setEdit({ ...l })}>Edit</button>
            <button type="button" className="btn" onClick={() => pdf(l).catch((e) => onFlash?.(e.message))}>Download PDF</button>
            <button type="button" className="btn" onClick={() => remove(l)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}

// On the apply form: fill the cover letter box from a saved letter.
export function SavedLetterPicker({ onPick }) {
  const [list, setList] = useState([]);
  useEffect(() => { apiRequest('/resumes/cover-letters').then(setList).catch(() => {}); }, []);
  if (!list.length) return null;
  return (
    <select className="form-select" aria-label="Use a saved cover letter" defaultValue="" onChange={(e) => { const l = list.find((x) => x._id === e.target.value); if (l) onPick(l.body); }}>
      <option value="">Use a saved cover letter…</option>
      {list.map((l) => <option key={l._id} value={l._id}>{l.title}</option>)}
    </select>
  );
}
