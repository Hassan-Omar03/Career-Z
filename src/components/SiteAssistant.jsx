import { useEffect, useRef, useState } from 'react';
import { FaRobot, FaXmark, FaPaperPlane } from 'react-icons/fa6';
import { apiRequest } from '../api/client';
import MarkdownText from './shared/MarkdownText';

// Homepage AI assistant for visitors. Every reply comes from the backend's AI model (which reads
// CareerZ's own guide and live public data); this widget only sends the conversation and shows
// the reply. Hidden entirely when the platform has no AI key connected.
const STORE = 'careerz_site_assistant_v1';
const MAX_KEPT = 12;

function loadThread() {
  try { const t = JSON.parse(sessionStorage.getItem(STORE) || '[]'); return Array.isArray(t) ? t.slice(-MAX_KEPT) : []; } catch { return []; }
}

export default function SiteAssistant() {
  const [enabled, setEnabled] = useState(false);
  const [open, setOpen] = useState(false);
  const [thread, setThread] = useState(loadThread);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const endRef = useRef(null);

  useEffect(() => { apiRequest('/site-assistant/status', { auth: false }).then((s) => setEnabled(!!s.enabled)).catch(() => setEnabled(false)); }, []);
  useEffect(() => { try { sessionStorage.setItem(STORE, JSON.stringify(thread.slice(-MAX_KEPT))); } catch { /* storage unavailable: thread just isn't kept */ } }, [thread]);
  useEffect(() => { endRef.current?.scrollIntoView({ block: 'end' }); }, [thread, busy, open]);

  async function send(e) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || busy) return;
    const next = [...thread, { role: 'user', content: text }].slice(-MAX_KEPT);
    setThread(next); setDraft(''); setBusy(true); setError('');
    try {
      const { reply } = await apiRequest('/site-assistant/chat', { method: 'POST', auth: false, body: { messages: next } });
      setThread((t) => [...t, { role: 'assistant', content: reply }].slice(-MAX_KEPT));
    } catch (err) {
      // A technical message only; the assistant never pretends to answer when the AI is unavailable.
      setError(err.message || 'The assistant is temporarily unavailable. Please try again.');
    } finally { setBusy(false); }
  }

  if (!enabled) return null;
  return (
    <div className={`site-assistant${open ? ' open' : ''}`} data-no-translate>
      {open && (
        <section className="site-assistant-panel" role="dialog" aria-label="CareerZ assistant">
          <header>
            <div><strong>CareerZ Assistant</strong><span>Ask about jobs, scholarships, institutes, accounts — English, اردو or Roman Urdu</span></div>
            <button type="button" className="site-assistant-icon" aria-label="Close assistant" onClick={() => setOpen(false)}><FaXmark /></button>
          </header>
          <div className="site-assistant-thread" aria-live="polite">
            {thread.length === 0 && <p className="site-assistant-hint">Ask anything about using CareerZ.</p>}
            {thread.map((m, i) => (
              <div key={i} className={`site-assistant-msg ${m.role}`} dir="auto">
                {m.role === 'assistant' ? <MarkdownText text={m.content} /> : m.content}
              </div>
            ))}
            {busy && <div className="site-assistant-msg assistant typing" aria-label="Assistant is typing"><span /><span /><span /></div>}
            {error && <p className="site-assistant-error" role="alert">{error}</p>}
            <div ref={endRef} />
          </div>
          <form onSubmit={send} className="site-assistant-form">
            <input className="form-input" dir="auto" maxLength={1500} placeholder="Type your question…" aria-label="Your question" value={draft} onChange={(e) => setDraft(e.target.value)} disabled={busy} />
            <button type="submit" className="btn btn-primary" disabled={busy || !draft.trim()} aria-label="Send"><FaPaperPlane /></button>
          </form>
          {thread.length > 0 && <button type="button" className="site-assistant-clear" onClick={() => { setThread([]); setError(''); }}>Start a new conversation</button>}
          <p className="site-assistant-note">AI answers can be wrong. Check important details on the page it links to.</p>
        </section>
      )}
      {!open && <button type="button" className="site-assistant-launch" onClick={() => setOpen(true)} aria-label="Open CareerZ assistant"><FaRobot aria-hidden="true" /> <span>Ask CareerZ</span></button>}
    </div>
  );
}
