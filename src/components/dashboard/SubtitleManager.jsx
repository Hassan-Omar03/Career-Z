import { useEffect, useState } from 'react';
import { FaClosedCaptioning } from 'react-icons/fa6';
import { apiRequest } from '../../api/client';

const LANGUAGES = [['en', 'English'], ['ur', 'Urdu'], ['ar', 'Arabic'], ['hi', 'Hindi'], ['pa', 'Punjabi'], ['ps', 'Pashto'], ['sd', 'Sindhi'], ['fa', 'Persian'], ['tr', 'Turkish'], ['fr', 'French'], ['es', 'Spanish'], ['zh', 'Chinese']];

// Teacher tool per lesson: transcribe the lesson's video/audio into subtitles, then translate them.
export default function SubtitleManager({ lesson, onFlash, onChanged }) {
  const media = [lesson.videoUrl, ...(lesson.videoSources || []).map((s) => s.url), ...(lesson.resources || []).map((r) => r.url)].filter((u) => /^https?:\/\//i.test(u || ''));
  const [tracks, setTracks] = useState(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState('');
  const [source, setSource] = useState(media[0] || '');
  const [spoken, setSpoken] = useState('en');
  const [target, setTarget] = useState('ur');

  function load() { apiRequest(`/media-accessibility/lessons/${lesson._id}/tracks`).then(setTracks).catch(() => setTracks([])); }
  useEffect(() => { if (open) load(); }, [open, lesson._id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function run(label, fn) {
    setBusy(label);
    try { const r = await fn(); onFlash?.(r?.label ? `${label}: ${r.label}` : label, 'success'); load(); onChanged?.(); } catch (err) { onFlash?.(err.message); } finally { setBusy(''); }
  }

  if (!media.length) return null;
  if (!open) return <button type="button" className="btn" style={{ marginTop: 8, padding: '4px 12px', fontSize: '0.78rem' }} onClick={() => setOpen(true)}><FaClosedCaptioning aria-hidden="true" /> Subtitles</button>;
  const transcripts = (tracks || []).filter((t) => t.source === 'ai_transcript');
  return (
    <div className="card" style={{ padding: 12, marginTop: 8, display: 'grid', gap: 8 }}>
      <div className="flex" style={{ justifyContent: 'space-between' }}><strong><FaClosedCaptioning aria-hidden="true" /> Subtitles & translation</strong><button type="button" className="btn" style={{ padding: '2px 10px' }} onClick={() => setOpen(false)}>Close</button></div>
      <div className="flex gap-2 flex-wrap items-center text-xs">
        {media.length > 1 && <select className="form-select" value={source} onChange={(e) => setSource(e.target.value)} style={{ maxWidth: 260 }}>{media.map((u) => <option key={u} value={u}>{u.split('/').pop()}</option>)}</select>}
        <label>Spoken language <select className="form-select" value={spoken} onChange={(e) => setSpoken(e.target.value)}>{LANGUAGES.map(([c, n]) => <option key={c} value={c}>{n}</option>)}</select></label>
        <button type="button" className="btn btn-primary" disabled={Boolean(busy)} onClick={() => run('Subtitles generated', () => apiRequest(`/media-accessibility/lessons/${lesson._id}/transcribe`, { method: 'POST', body: { mediaUrl: source, language: spoken } }))}>{busy === 'Subtitles generated' ? 'Transcribing… (can take a few minutes)' : 'Generate subtitles (AI)'}</button>
      </div>
      {transcripts.length > 0 && (
        <div className="flex gap-2 flex-wrap items-center text-xs">
          <label>Translate to <select className="form-select" value={target} onChange={(e) => setTarget(e.target.value)}>{LANGUAGES.map(([c, n]) => <option key={c} value={c}>{n}</option>)}</select></label>
          <button type="button" className="btn" disabled={Boolean(busy)} onClick={() => run('Subtitles translated', () => apiRequest(`/media-accessibility/tracks/${transcripts[transcripts.length - 1]._id}/translate`, { method: 'POST', body: { language: target } }))}>{busy === 'Subtitles translated' ? 'Translating…' : 'Translate subtitles'}</button>
        </div>
      )}
      {tracks === null ? <p className="text-xs">Loading…</p> : tracks.length === 0 ? <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>No generated subtitles yet. Needs an OpenAI key in AI Settings.</p> : (
        <ul className="text-xs" style={{ display: 'grid', gap: 4 }}>
          {tracks.map((t) => (
            <li key={t._id} className="flex gap-2 items-center">
              <span>{t.label}</span><a href={t.url} target="_blank" rel="noreferrer">.vtt</a>
              <button type="button" className="btn" style={{ padding: '1px 8px' }} disabled={Boolean(busy)} onClick={() => run('Subtitle track removed', () => apiRequest(`/media-accessibility/tracks/${t._id}`, { method: 'DELETE' }))}>Remove</button>
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>Students see these tracks in the lesson video's CC menu.</p>
    </div>
  );
}
