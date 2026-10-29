import { useEffect, useRef, useState } from 'react';
import { apiRequest } from '../../api/client';

const DIFFICULTIES = ['easy', 'medium', 'hard'];
const blankQuestion = { text: '', type: 'mcq', options: ['', ''], correctOption: 0, marks: 1, subject: '', topic: '', difficulty: 'medium', institution: '' };

function useTeachingInstitutions() {
  const [list, setList] = useState([]);
  useEffect(() => {
    Promise.all([
      apiRequest('/teachers/me').then((p) => (p?.institutions || []).filter((i) => i?._id)).catch(() => []),
      apiRequest('/institutions/mine/list').catch(() => [])
    ]).then(([taught, owned]) => {
      const map = new Map();
      [...owned, ...taught].forEach((i) => { if (i?._id) map.set(i._id, i); });
      setList([...map.values()]);
    });
  }, []);
  return list;
}

function QuestionFilters({ filters, setFilters }) {
  return (
    <div className="qb-filters">
      <label className="institution-field"><span>Search</span><input className="form-input" placeholder="Search question text" value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} /></label>
      <label className="institution-field"><span>Subject</span><input className="form-input" placeholder="Any subject" value={filters.subject} onChange={(e) => setFilters({ ...filters, subject: e.target.value })} /></label>
      <label className="institution-field"><span>Topic</span><input className="form-input" placeholder="Any topic" value={filters.topic} onChange={(e) => setFilters({ ...filters, topic: e.target.value })} /></label>
      <label className="institution-field"><span>Difficulty</span><select className="form-select" value={filters.difficulty} onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })} style={{ textTransform: 'capitalize' }}>
        <option value="">Any difficulty</option>{DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
      </select></label>
      <label className="institution-field"><span>Type</span><select className="form-select" value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
        <option value="">Any type</option><option value="mcq">MCQ</option><option value="short">Short</option><option value="long">Long</option>
      </select></label>
    </div>
  );
}

function useBankSearch(onFlash, extra = {}) {
  const [filters, setFilters] = useState({ q: '', subject: '', topic: '', difficulty: '', type: '' });
  const [items, setItems] = useState([]);
  const key = JSON.stringify({ ...filters, ...extra });
  function load() {
    const params = new URLSearchParams(Object.entries({ ...filters, ...extra }).filter(([, v]) => v));
    apiRequest(`/question-bank?${params}`).then(setItems).catch((err) => onFlash?.(err.message));
  }
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  return { filters, setFilters, items, reload: load };
}

// Teacher → "Question Bank": reusable questions, shared with the institution's teachers.
export function QuestionBankPanel({ onFlash }) {
  const institutions = useTeachingInstitutions();
  const { filters, setFilters, items, reload } = useBankSearch(onFlash);
  const [form, setForm] = useState(blankQuestion);

  async function save(e) {
    e.preventDefault();
    try {
      await apiRequest('/question-bank', { method: 'POST', body: { ...form, institution: form.institution || null, options: form.type === 'mcq' ? form.options : [] } });
      onFlash('Question saved to the bank.', 'success');
      setForm({ ...blankQuestion, subject: form.subject, topic: form.topic, institution: form.institution });
      reload();
    } catch (err) { onFlash(err.message); }
  }
  async function archive(id) {
    try { await apiRequest(`/question-bank/${id}`, { method: 'DELETE' }); onFlash('Question removed from the bank.', 'success'); reload(); } catch (err) { onFlash(err.message); }
  }

  return (
    <div>
      <h3 className="font-semibold mb-2">Question Bank</h3>
      <p className="text-xs mb-3" style={{ color: 'var(--ink-soft)' }}>Save questions once and reuse them in any exam or quiz. Institution questions are shared with every teacher of that institution.</p>
      <form onSubmit={save} className="qb-form">
        <div className="nl-form-head"><h4>Add a question</h4><p>Pick the bank, write the question, then mark the correct option for MCQs.</p></div>
        <div className="qb-meta">
          <label className="institution-field"><span>Save to</span><select className="form-select" value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })}>
            <option value="">My private bank</option>
            {institutions.map((i) => <option key={i._id} value={i._id}>{i.name} (shared)</option>)}
          </select></label>
          <label className="institution-field"><span>Type</span><select className="form-select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option value="mcq">MCQ</option><option value="short">Short answer</option><option value="long">Long answer</option>
          </select></label>
          <label className="institution-field"><span>Subject</span><input className="form-input" placeholder="e.g. Physics" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></label>
          <label className="institution-field"><span>Topic</span><input className="form-input" placeholder="e.g. Motion" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} /></label>
          <label className="institution-field"><span>Difficulty</span><select className="form-select" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} style={{ textTransform: 'capitalize' }}>{DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}</select></label>
          <label className="institution-field"><span>Marks</span><input className="form-input" type="number" min="0.5" step="0.5" placeholder="Marks" value={form.marks} onChange={(e) => setForm({ ...form, marks: Number(e.target.value) })} /></label>
        </div>
        <label className="institution-field"><span>Question</span><textarea className="form-input" rows={3} placeholder="Write the question" value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} required /></label>
        {form.type === 'mcq' && (
          <div className="institution-field"><span>Options <small>(select the correct one)</small></span><div className="qb-options">
            {form.options.map((opt, i) => (
              <label key={i} className={`qb-option${form.correctOption === i ? ' correct' : ''}`}>
                <input type="radio" name="bank-correct" checked={form.correctOption === i} onChange={() => setForm({ ...form, correctOption: i })} aria-label={`Option ${i + 1} is correct`} />
                <span className="qb-option-letter" aria-hidden="true">{String.fromCharCode(65 + i)}</span>
                <input className="form-input" placeholder={`Option ${i + 1}`} value={opt} onChange={(e) => setForm({ ...form, options: form.options.map((o, x) => (x === i ? e.target.value : o)) })} />
                {form.correctOption === i && <span className="qb-correct-tag">Correct</span>}
              </label>
            ))}
            <button type="button" className="btn" style={{ justifySelf: 'start' }} onClick={() => setForm({ ...form, options: [...form.options, ''] })}>+ Add option</button>
          </div></div>
        )}
        <div className="nl-form-foot"><button type="submit" className="btn btn-primary">Save to bank</button></div>
      </form>
      <h4 className="qb-list-title">Saved questions</h4>
      <QuestionFilters filters={filters} setFilters={setFilters} />
      <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
        {items.length === 0 && <p className="po-empty">No questions match.</p>}
        {items.map((q) => (
          <div key={q._id} className="card qb-item">
            <div className="flex" style={{ justifyContent: 'space-between', gap: 10 }}>
              <div>
                <strong>{q.text}</strong>
                <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 6 }}><span className="exam-type">{q.type}</span> <span className={`qb-diff ${q.difficulty}`}>{q.difficulty}</span> · {q.marks} marks{q.subject ? ` · ${q.subject}` : ''}{q.topic ? ` / ${q.topic}` : ''} · {q.institution ? 'Shared' : 'Private'} · used {q.timesUsed}× · by {q.createdBy?.fullName || '—'}</p>
                {q.type === 'mcq' && <p className="text-xs" style={{ marginTop: 4 }}>{q.options.map((o, i) => (i === q.correctOption ? `✓ ${o}` : o)).join(' · ')}</p>}
              </div>
              <button type="button" className="btn staff-remove" style={{ padding: '4px 10px', fontSize: '0.75rem', alignSelf: 'start' }} onClick={() => archive(q._id)}>Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Inside "Create an Exam": tick bank questions to copy into this paper.
export function QuestionBankPicker({ institutionId, selectedIds, onChange, onFlash }) {
  const [open, setOpen] = useState(false);
  const { filters, setFilters, items } = useBankSearch(onFlash, open ? (institutionId ? { institution: institutionId } : {}) : { q: '__closed__' });
  const toggle = (id) => onChange(selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id]);
  return (
    <div className="card" style={{ padding: 14, background: 'var(--sand)' }}>
      <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <strong>From question bank: {selectedIds.length} selected</strong>
        <button type="button" className="btn" onClick={() => setOpen(!open)}>{open ? 'Close bank' : 'Add from question bank'}</button>
      </div>
      {open && (
        <div style={{ display: 'grid', gap: 8, marginTop: 10 }}>
          <QuestionFilters filters={filters} setFilters={setFilters} />
          <div style={{ maxHeight: 320, overflowY: 'auto', display: 'grid', gap: 6 }}>
            {items.length === 0 && <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>No bank questions match. Add some under Question Bank.</p>}
            {items.map((q) => (
              <label key={q._id} className="text-xs" style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: 8, borderRadius: 8, background: 'var(--paper-raised)' }}>
                <input type="checkbox" checked={selectedIds.includes(q._id)} onChange={() => toggle(q._id)} />
                <span><strong>{q.text}</strong><br />{q.type.toUpperCase()} · {q.marks} marks · {q.difficulty}{q.topic ? ` · ${q.topic}` : ''}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Anti-cheating settings on the exam form.
export function ExamSecurityOptions({ value, onChange, questionCount }) {
  return (
    <div className="card exam-security" style={{ display: 'grid', gap: 10 }}>
      <strong>Exam security</strong>
      <label className="text-xs flex items-center gap-2"><input type="checkbox" checked={value.shuffleQuestions} onChange={(e) => onChange({ shuffleQuestions: e.target.checked })} /> Shuffle question order for every student</label>
      <label className="text-xs flex items-center gap-2"><input type="checkbox" checked={value.shuffleOptions} onChange={(e) => onChange({ shuffleOptions: e.target.checked })} /> Shuffle MCQ options for every student</label>
      <div className="exam-security-grid">
        <label className="institution-field"><span>Questions per student (0 = all {questionCount})</span><input className="form-input" type="number" min="0" max={questionCount} value={value.questionsPerAttempt} onChange={(e) => onChange({ questionsPerAttempt: Number(e.target.value) })} /></label>
        <label className="institution-field"><span>Flag after this many tab switches</span><input className="form-input" type="number" min="1" value={value.flagThreshold} onChange={(e) => onChange({ flagThreshold: Number(e.target.value) })} /></label>
      </div>
      <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>Tab switches, copy/paste, leaving fullscreen and changing device are logged on every attempt. Pasting or switching device flags the attempt immediately.</p>
    </div>
  );
}

// While a student sits an exam: reports integrity events to the server and warns the student.
export function ExamIntegrityMonitor({ attemptId }) {
  const [warnings, setWarnings] = useState(0);
  const last = useRef({});
  useEffect(() => {
    if (!attemptId) return undefined;
    function report(type) {
      const now = Date.now();
      if (now - (last.current[type] || 0) < 1500) return; // de-duplicate bursts (blur+hidden fire together)
      last.current[type] = now;
      setWarnings((w) => w + 1);
      apiRequest(`/courses/exam-attempts/${attemptId}/events`, { method: 'POST', body: { type } }).catch(() => {});
    }
    const onVisibility = () => { if (document.visibilityState === 'hidden') report('tab_hidden'); };
    const onBlur = () => report('window_blur');
    const onCopy = () => report('copy');
    const onPaste = () => report('paste');
    const onCut = () => report('cut');
    const onContext = () => report('context_menu');
    const onFullscreen = () => { if (!document.fullscreenElement) report('fullscreen_exit'); };
    const onKey = (e) => { if (e.key === 'PrintScreen') report('print_screen'); };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', onBlur);
    document.addEventListener('copy', onCopy);
    document.addEventListener('paste', onPaste);
    document.addEventListener('cut', onCut);
    document.addEventListener('contextmenu', onContext);
    document.addEventListener('fullscreenchange', onFullscreen);
    window.addEventListener('keyup', onKey);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('copy', onCopy);
      document.removeEventListener('paste', onPaste);
      document.removeEventListener('cut', onCut);
      document.removeEventListener('contextmenu', onContext);
      document.removeEventListener('fullscreenchange', onFullscreen);
      window.removeEventListener('keyup', onKey);
    };
  }, [attemptId]);

  return (
    <div className="u-alert warning" style={{ marginBottom: 12 }}>
      <span className="u-alert-ic">!</span>
      <div className="u-alert-body">
        <strong>Exam integrity is monitored.</strong> Stay on this tab. Switching tabs/windows, copying or pasting is recorded and shown to your teacher.
        {warnings > 0 && <> <strong>{warnings} event(s) recorded.</strong></>}
        {document.fullscreenEnabled && !document.fullscreenElement && <> <button type="button" className="btn" style={{ padding: '2px 10px', fontSize: '0.72rem', marginLeft: 6 }} onClick={() => document.documentElement.requestFullscreen().catch(() => {})}>Go fullscreen</button></>}
      </div>
    </div>
  );
}

// Teacher's submission list: integrity summary for one attempt.
export function IntegrityBadge({ submission }) {
  const events = submission.securityEvents || [];
  if (!events.length) return <span className="text-xs" style={{ color: 'var(--emerald)' }}>No integrity events</span>;
  const counts = events.reduce((acc, e) => ({ ...acc, [e.type]: (acc[e.type] || 0) + 1 }), {});
  return (
    <span className="text-xs" title={events.map((e) => `${new Date(e.at).toLocaleTimeString()} ${e.type}${e.detail ? ` (${e.detail})` : ''}`).join('\n')}
      style={{ color: submission.flagged ? 'var(--rose, #e11d48)' : 'var(--ink-soft)', fontWeight: submission.flagged ? 700 : 400 }}>
      {submission.flagged ? '⚠ Flagged: ' : ''}{Object.entries(counts).map(([t, n]) => `${t.replace(/_/g, ' ')} ×${n}`).join(', ')}
    </span>
  );
}
