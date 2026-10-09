import { useEffect, useRef, useState } from 'react';
import { loadDraft, saveDraft, queueVideoProgress, syncProgress } from '../../utils/offlineLearning';

export function ReadingTools({ text, children }) {
  const [size, setSize] = useState(16), [contrast, setContrast] = useState(false);
  useEffect(() => () => window.speechSynthesis?.cancel(), []);
  return <div style={{ fontSize: size, ...(contrast ? { color: '#fff', background: '#111', padding: 12 } : {}) }}>
    <div className="flex flex-wrap gap-2"><label>Text size<input type="range" min="14" max="28" value={size} onChange={e => setSize(Number(e.target.value))} /></label><button className="btn" onClick={() => setContrast(!contrast)}>High contrast {contrast ? 'off' : 'on'}</button>{'speechSynthesis' in window && <><button className="btn" onClick={() => { window.speechSynthesis.cancel(); window.speechSynthesis.speak(new SpeechSynthesisUtterance(text || 'No notes available.')); }}>Read notes aloud</button><button className="btn" onClick={() => window.speechSynthesis.cancel()}>Stop reading</button></>}</div>
    {children}
  </div>;
}

export function LessonVideo({ lesson, canTrack = false, files }) {
  const player = useRef(null), lastSaved = useRef(0), [blobs, setBlobs] = useState({}), [quality, setQuality] = useState(''), [unavailable, setUnavailable] = useState(false);
  useEffect(() => { const links = {}; for (const [url, blob] of Object.entries(files || {})) links[url] = URL.createObjectURL(blob); setBlobs(links); return () => Object.values(links).forEach(URL.revokeObjectURL); }, [files]);
  const sources = [...(lesson.videoUrl ? [{ label: 'Original', url: lesson.videoUrl }] : []), ...(lesson.videoSources || [])].filter(source => !files || files[source.url]);
  const selected = sources.find(source => source.url === quality) || sources[0];
  if (!selected) return lesson.videoUrl ? <p>Video requires internet or a permitted offline download.</p> : null;
  async function resume() { try { const saved = await loadDraft(`video:${lesson._id}`); if (saved?.revision === lesson.revision && player.current && saved.seconds < player.current.duration) player.current.currentTime = saved.seconds; } catch { /* Storage unavailable: video remains usable. */ } }
  async function remember() {
    const video = player.current; if (!canTrack || !video || !Number.isFinite(video.duration) || Date.now() - lastSaved.current < 10000) return;
    lastSaved.current = Date.now();
    try { const progress = { seconds: video.currentTime, duration: video.duration, revision: lesson.revision }; await saveDraft(`video:${lesson._id}`, progress); await queueVideoProgress(lesson, progress); if (navigator.onLine) await syncProgress(); } catch { /* Pending updates remain on the device and retry when online. */ }
  }
  return <section><label>Video quality<select className="form-select" value={selected.url} onChange={e => { setQuality(e.target.value); setUnavailable(false); }}>{sources.map(source => <option key={source.url} value={source.url}>{source.label}</option>)}</select></label>
    <video ref={player} controls preload="metadata" src={blobs[selected.url] || selected.url} onLoadedMetadata={resume} onTimeUpdate={remember} onPause={() => { lastSaved.current = 0; remember(); }} onError={() => setUnavailable(true)} style={{ width: '100%', maxHeight: 480 }} crossOrigin="anonymous">
      {(lesson.captions || []).filter(track => !files || files[track.url]).map((track, n) => <track key={track.url} kind="subtitles" src={blobs[track.url] || track.url} srcLang={track.language || 'en'} label={track.label || track.language} default={n === 0} />)}
    </video>{unavailable && <p>This provider cannot play inside the lesson. <a href={selected.url} target="_blank" rel="noreferrer">Open the original video</a>.</p>}
    {(lesson.videoChapters || []).map(chapter => <button className="btn" key={chapter.title + chapter.seconds} onClick={() => { if (player.current) player.current.currentTime = chapter.seconds; }}>{chapter.title} · {Math.floor(chapter.seconds / 60)}:{String(chapter.seconds % 60).padStart(2, '0')}</button>)}
  </section>;
}

export function AssignmentDraft({ assignment }) {
  const [text, setText] = useState(''), [loaded, setLoaded] = useState(false), [error, setError] = useState('');
  useEffect(() => { let alive = true; setLoaded(false); loadDraft(`assignment:${assignment._id}`).then(value => { if (alive) { setText(value); setLoaded(true); } }).catch(e => setError(e.message)); return () => { alive = false; }; }, [assignment._id]);
  useEffect(() => { if (!loaded) return; const timer = setTimeout(() => saveDraft(`assignment:${assignment._id}`, text).catch(e => setError(e.message)), 300); return () => clearTimeout(timer); }, [text, loaded, assignment._id]);
  return <details><summary>{assignment.title} — assignment draft</summary><p>{assignment.description}</p>{assignment.dueDate && <p>Due: {new Date(assignment.dueDate).toLocaleString()}</p>}<textarea className="form-input" aria-label={`Draft for ${assignment.title}`} rows={6} value={text} onChange={e => setText(e.target.value)} onBlur={() => saveDraft(`assignment:${assignment._id}`, text).catch(e => setError(e.message))} />{error && <p role="alert">{error}</p>}<p>Draft saved on this device. Open Assignments & Tests online to submit; the server checks deadlines and required files.</p><button className="btn" onClick={() => navigator.clipboard.writeText(text).catch(e => setError(e.message))}>Copy draft for submission</button></details>;
}
