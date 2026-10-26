import { useEffect, useState } from 'react';
import { apiRequest } from '../../api/client';

// "Write with AI": only for people who connected their own AI key (Career Tools). They describe
// themselves; the AI drafts the CV into the builder. Nothing is saved until they save it.
export default function AiCvDraftButton({ onDraft, onFlash }) {
  const [ready, setReady] = useState(null), [open, setOpen] = useState(false), [busy, setBusy] = useState(false);
  const [role, setRole] = useState(''), [notes, setNotes] = useState('');
  useEffect(() => { apiRequest('/ai/config').then((s) => setReady(Boolean(s?.text?.configured))).catch(() => setReady(false)); }, []);
  if (ready === null) return null;
  if (!ready) return <button type="button" className="btn" disabled title="Connect your AI provider in Jobs & Applications → Career Tools first">Write with AI (connect an AI key first)</button>;
  async function run() {
    setBusy(true);
    try {
      const draft = await apiRequest('/resumes/me/ai-draft', { method: 'POST', body: { notes, targetRole: role } });
      onDraft(draft);
      onFlash?.('AI draft added. Review and edit it, then save.', 'success');
      setOpen(false);
    } catch (e) { onFlash?.(e.message); } finally { setBusy(false); }
  }
  if (!open) return <button type="button" className="btn" onClick={() => setOpen(true)}>Write with AI</button>;
  return (
    <div className="card" style={{ padding: 14, display: 'grid', gap: 8, width: '100%' }}>
      <strong className="text-sm">Write my CV with AI</strong>
      <input className="form-input" maxLength={120} placeholder="Job you want, e.g. Physics Teacher" value={role} onChange={(e) => setRole(e.target.value)} />
      <textarea className="form-input" rows={5} maxLength={4000} placeholder="Tell us about yourself: studies, where you worked or taught, what you did, skills, languages. The AI uses only what you write and your CareerZ records." value={notes} onChange={(e) => setNotes(e.target.value)} />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button type="button" className="btn btn-primary" disabled={busy || notes.trim().length < 20} onClick={run}>{busy ? 'Writing…' : 'Write my CV'}</button>
        <button type="button" className="btn" disabled={busy} onClick={() => setOpen(false)}>Cancel</button>
      </div>
      <small style={{ color: 'var(--ink-soft)' }}>Check every detail before saving; the AI can make mistakes.</small>
    </div>
  );
}

// Merges an AI draft into a CV without wiping what is already there when the AI left it empty.
export function mergeDraft(cv, draft) {
  const out = { ...cv };
  for (const [k, v] of Object.entries(draft || {})) if (Array.isArray(v) ? v.length : v) out[k] = v;
  return out;
}
