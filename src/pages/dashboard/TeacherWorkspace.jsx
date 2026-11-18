// Teacher workspace, moved out of Dashboard.jsx unchanged (master 17G.3: readable, maintainable code).
import { useEffect, useRef, useState } from 'react';
import { apiRequest, session } from '../../api/client';
import { isPlatformUploadAvailable, uploadToPlatformStorage } from '../../utils/platformUpload';
import { FaArrowLeft, FaArrowRight, FaArrowRotateLeft, FaArrowUpRightFromSquare, FaAward, FaBell, FaBookOpen, FaChalkboardUser, FaChartLine, FaCheck, FaCircle, FaCircleCheck, FaClipboardCheck, FaClipboardList, FaCrosshairs, FaExpand, FaEye, FaFaceSmile, FaFileLines, FaHand, FaHourglassHalf, FaLocationDot, FaMicrophone, FaPaperPlane, FaPowerOff, FaQrcode, FaRobot, FaUsers, FaXmark } from 'react-icons/fa6';
import { TeacherBatches } from '../../components/academy/Academy';
import OfflineStudy from '../../components/dashboard/OfflineStudy';
import PlacementOffice from '../../components/dashboard/PlacementOffice';
import MedicalHealth from '../../components/dashboard/MedicalHealth';
import { ExamSecurityOptions, IntegrityBadge, QuestionBankPanel, QuestionBankPicker } from '../../components/dashboard/QuestionBank';
import ResourceLibrary from '../../components/dashboard/ResourceLibrary';
import { FamilyTeacherNotes } from '../../components/dashboard/FamilyCenter';
import { WalletCard } from '../../components/dashboard/DashboardWidgets';
import InstitutionCommunity from '../../components/dashboard/InstitutionCommunity';
import InstitutionInventory from '../../components/dashboard/InstitutionInventory';
import useUrlTab from '../../hooks/useUrlTab';
import { useRealtime } from '../../context/RealtimeContext';
import { showConfirm, showPrompt } from '../../utils/appDialog';
import SavedForm from '../../components/shared/SavedForm';
import { MODE_LABEL, TEACHER_CATEGORIES } from '../../utils/teacherProfile';
import TeacherStandingCard from '../../components/teacher/TeacherStandingCard';
import { MyTeacherReviews } from '../../components/institution/PeoplePanels';
import StudentGuardians from '../../components/dashboard/StudentGuardians';
import CareerZLiveClassroom from '../../components/CareerZLiveClassroom';
import PtmHistory from '../../components/dashboard/PtmHistory';
import TeacherSchedulePtm from '../../components/dashboard/TeacherSchedulePtm';
import LearningCenter from '../../components/dashboard/LearningCenter';
import LessonMetadata from '../../components/dashboard/LessonMetadata';
import SubtitleManager from '../../components/dashboard/SubtitleManager';
import CourseForum from '../../components/dashboard/CourseForum';
import { AiFeatureCard, AiSettingsPanel, COMPLETION_STATUS_LABEL, ComingSoon, CustomSelect, PTM_STATUS_TAG, ProfilePanel, PtmMeetingDetails, RolesPanel, SalaryPayoutProfilePanel, ScholarshipsPanel, SlideDeckViewer, StudentJobsPanel, SummaryCard, SummaryRow, SupportComplaintPanel, Table, Tag, TimetableView, fixText, formatTime12h, resizeImageToDataUrl, shortWhen } from '../Dashboard';

// Parses the AI's delimited slide format (see ai.controller.js's teacher_slides prompt) into
// real slide objects — deliberately not JSON, since that isn't uniformly reliable across all 4
// BYOK providers, while this plain-text delimiter format parses the same regardless of provider.
function parseSlides(raw) {
  return raw.split('---SLIDE---').map((part) => part.trim()).filter(Boolean).map((part) => {
    const lines = part.split('\n').map((l) => l.trim()).filter(Boolean);
    const titleLine = lines.find((l) => /^title:/i.test(l));
    const title = titleLine ? titleLine.replace(/^title:\s*/i, '') : 'Untitled Slide';
    const bullets = lines.filter((l) => l.startsWith('-')).map((l) => l.replace(/^-\s*/, ''));
    const field = (name) => lines.find((line) => new RegExp(`^${name}:`, 'i').test(line))?.replace(new RegExp(`^${name}:\\s*`, 'i'), '') || '';
    const safeColor = (value, fallback) => /^#[0-9a-f]{6}$/i.test(value) ? value : fallback;
    return {
      title,
      bullets,
      background: safeColor(field('BACKGROUND'), '#fff8e7'),
      accent: safeColor(field('ACCENT'), '#d97706'),
      text: safeColor(field('TEXT'), '#1f2937'),
      imagePrompt: field('IMAGE_PROMPT'),
      image: null,
      imageStatus: field('IMAGE_PROMPT') ? 'pending' : 'none',
      imageError: ''
    };
  }).filter((s) => s.title !== 'Untitled Slide' || s.bullets.length > 0);
}

function ShareSlideDeckToClass({ slides, defaultTitle, defaultCourseId }) {
  const [open, setOpen] = useState(false);
  const [courses, setCourses] = useState(null);
  const [courseId, setCourseId] = useState('');
  const [title, setTitle] = useState(defaultTitle || 'AI Slide Deck');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');

  function openReview() {
    setOpen(true); setTitle(defaultTitle || 'AI Slide Deck'); setStatus('');
    if (courses) return;
    apiRequest('/courses/mine/list').then((list) => { setCourses(list); if (list[0]) setCourseId(list.some((c) => c._id === defaultCourseId) ? defaultCourseId : list[0]._id); }).catch(() => setCourses([]));
  }

  async function share() {
    if (!courseId || !title.trim()) return;
    setBusy(true); setStatus('');
    try {
      const hasEmbeddedImages = slides.some((slide) => slide.image?.startsWith('data:'));
      if (hasEmbeddedImages && !(await isPlatformUploadAvailable())) throw new Error('Permanent media storage is required to share generated slide images. Configure platform Cloudinary first.');
      const persistedSlides = [];
      for (const slide of slides) {
        let imageUrl = slide.imageUrl || slide.image || '';
        if (imageUrl.startsWith('data:')) {
          const blob = await (await fetch(imageUrl)).blob();
          imageUrl = await uploadToPlatformStorage(blob, 'slide-decks');
        }
        persistedSlides.push({ title: slide.title, bullets: slide.bullets, background: slide.background, accent: slide.accent, text: slide.text, imageUrl });
      }
      const result = await apiRequest(`/courses/${courseId}/ai-resource`, { method: 'POST', body: { title: title.trim(), deck: { slides: persistedSlides } } });
      setStatus(`Saved to Class Resources — ${result.notifiedCount} student${result.notifiedCount === 1 ? '' : 's'} notified${result.feeBlockedCount ? `; ${result.feeBlockedCount} fee-blocked` : ''}.`);
    } catch (err) { setStatus(err.message); } finally { setBusy(false); }
  }

  if (!open) return <button type="button" className="btn btn-primary" style={{ marginTop: 10 }} onClick={openReview}><FaPaperPlane /> Save &amp; Share with Students</button>;
  return (
    <div className="card" style={{ padding: 14, marginTop: 10 }}>
      <strong className="text-sm">Save deck to Class Resources</strong>
      <input className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Deck title" style={{ marginTop: 8 }} />
      {courses === null && <p className="text-xs mt-2">Loading classes…</p>}
      {courses?.length === 0 && <p className="text-xs mt-2">Create a course before sharing.</p>}
      {courses?.length > 0 && <select className="form-select" value={courseId} onChange={(e) => setCourseId(e.target.value)} style={{ marginTop: 8 }}>{courses.map((course) => <option key={course._id} value={course._id}>{course.title}</option>)}</select>}
      <div className="flex gap-2" style={{ marginTop: 8 }}><button type="button" className="btn btn-primary" onClick={share} disabled={busy || !courseId}>{busy ? 'Uploading & sharing…' : 'Publish to Course'}</button><button type="button" className="btn" onClick={() => setOpen(false)} disabled={busy}>Cancel</button></div>
      {status && <p className="text-xs" style={{ marginTop: 8, color: status.startsWith('Saved') ? 'var(--emerald)' : 'var(--rose)' }}>{status}</p>}
    </div>
  );
}

// Real AI Slides Generator (spec 15B.6 "خودکار پریزنٹیشن سلائیڈز") — the one sub-feature of "AI
// Creative Teacher" buildable with the existing text-AI system (no image/video/3D AI provider
// needed). Produces an actual presentable, fullscreen-able slide deck, not just a text blob.
function SlideDeckGenerator({ aiEnabled, imageEnabled, institutionId, courseId, lockedReason }) {
  const [topic, setTopic] = useState('');
  const [slides, setSlides] = useState(null);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const viewerRef = useRef(null);

  async function generate(e) {
    e.preventDefault();
    setLoading(true); setError(''); setSlides(null);
    try {
      const { result } = await apiRequest('/ai/generate', { method: 'POST', body: { feature: 'teacher_slides', prompt: topic, institutionId: institutionId || undefined, courseId: courseId || undefined } });
      const parsed = parseSlides(result);
      if (parsed.length === 0) throw new Error("Couldn't parse slides from the response — try again.");
      setSlides(parsed);
      setCurrent(0);
      setTopic('');
      if (imageEnabled) {
        let nextImageIndex = 0;
        async function imageWorker() {
          while (nextImageIndex < parsed.length) {
            const index = nextImageIndex;
            nextImageIndex += 1;
            const slide = parsed[index];
            if (!slide.imagePrompt) continue;
            setSlides((currentSlides) => currentSlides.map((item, i) => i === index ? { ...item, imageStatus: 'loading' } : item));
            try {
              const { imageDataUrl } = await apiRequest('/ai/image', {
                method: 'POST',
                body: { institutionId: institutionId || undefined, prompt: `${slide.imagePrompt}. Presentation illustration, clean composition, no words, no letters, no watermark.` }
              });
              setSlides((currentSlides) => currentSlides.map((item, i) => i === index ? { ...item, image: imageDataUrl, imageStatus: 'ready', imageError: '' } : item));
            } catch (imageError) {
              setSlides((currentSlides) => currentSlides.map((item, i) => i === index ? { ...item, imageStatus: 'error', imageError: imageError.message || 'Illustration failed.' } : item));
            }
          }
        }
        await Promise.all(Array.from({ length: Math.min(3, parsed.length) }, () => imageWorker()));
      }
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  }

  useEffect(() => {
    if (!slides) return;
    function onKey(e) {
      if (e.key === 'ArrowRight') setCurrent((c) => Math.min(slides.length - 1, c + 1));
      if (e.key === 'ArrowLeft') setCurrent((c) => Math.max(0, c - 1));
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [slides]);

  return (
    <div className="card" style={{ padding: 18 }}>
      <strong className="text-sm">AI Slides Generator</strong>
      <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 6 }}>Give a topic — get a real slide deck you can present fullscreen in class (use arrow keys to navigate).</p>
      {!aiEnabled || lockedReason ? (
        <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 12 }}>{lockedReason || 'Connect an AI provider above first.'}</p>
      ) : (
        <form onSubmit={generate} style={{ marginTop: 12 }}>
          <input className="form-input" placeholder="e.g. The Water Cycle, Grade 5" value={topic} onChange={(e) => setTopic(e.target.value)} required />
          <button type="submit" className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.78rem', marginTop: 8 }} disabled={loading}>{loading ? (imageEnabled ? 'Generating slides & images...' : 'Generating slides...') : 'Generate Slides'}</button>
          {!imageEnabled && <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 6 }}>Connect an Image AI provider to automatically illustrate every slide.</p>}
          {error && <p className="text-xs" style={{ color: 'var(--rose)', marginTop: 8 }}>{error}</p>}
        </form>
      )}

      {slides && (
        <div style={{ marginTop: 16 }}>
          <div ref={viewerRef} style={{ position: 'relative', overflow: 'hidden', background: slides[current].background, color: slides[current].text, borderRadius: 14, padding: '42px 48px', minHeight: 420, display: 'grid', gridTemplateColumns: slides[current].imageStatus !== 'none' ? 'minmax(0, 1.15fr) minmax(260px, 0.85fr)' : '1fr', gap: 32, alignItems: 'center', borderTop: `10px solid ${slides[current].accent}` }}>
            <div>
              <h2 style={{ fontSize: 32, marginBottom: 20, fontFamily: 'Fraunces, serif', color: slides[current].text }}>{slides[current].title}</h2>
              <ul style={{ fontSize: 17, lineHeight: 1.55, paddingLeft: 24, margin: 0 }}>
                {slides[current].bullets.map((b, i) => <li key={i} style={{ marginBottom: 9 }}>{b}</li>)}
              </ul>
            </div>
            {slides[current].image && <img src={slides[current].image} alt={`Illustration for ${slides[current].title}`} style={{ width: '100%', maxHeight: 280, objectFit: 'cover', borderRadius: 16, boxShadow: '0 14px 32px rgba(0,0,0,.18)' }} />}
            {!slides[current].image && ['pending', 'loading'].includes(slides[current].imageStatus) && (
              <div style={{ minHeight: 250, borderRadius: 16, border: `2px dashed ${slides[current].accent}`, display: 'grid', placeItems: 'center', padding: 24, textAlign: 'center', opacity: 0.78 }}>
                <span>{slides[current].imageStatus === 'loading' ? 'Generating this slide illustration…' : 'Illustration queued…'}</span>
              </div>
            )}
            {slides[current].imageStatus === 'error' && (
              <div style={{ minHeight: 180, borderRadius: 16, border: '2px dashed #b45309', display: 'grid', placeItems: 'center', padding: 20, textAlign: 'center' }}>
                <span>Illustration failed: {slides[current].imageError}</span>
              </div>
            )}
            <span style={{ position: 'absolute', bottom: 16, right: 24, fontSize: 12, opacity: 0.6 }}>{current + 1} / {slides.length}</span>
          </div>
          <div className="flex items-center gap-2" style={{ marginTop: 10 }}>
            <button type="button" className="btn flex items-center" style={{ padding: '6px 14px', fontSize: '0.78rem', gap: 5 }} onClick={() => setCurrent((c) => Math.max(0, c - 1))} disabled={current === 0}><FaArrowLeft aria-hidden="true" /> Previous</button>
            <button type="button" className="btn flex items-center" style={{ padding: '6px 14px', fontSize: '0.78rem', gap: 5 }} onClick={() => setCurrent((c) => Math.min(slides.length - 1, c + 1))} disabled={current === slides.length - 1}>Next <FaArrowRight aria-hidden="true" /></button>
            <button type="button" className="btn btn-primary flex items-center" style={{ padding: '6px 14px', fontSize: '0.78rem', gap: 5 }} onClick={() => viewerRef.current?.requestFullscreen?.()}><FaExpand aria-hidden="true" /> Present Fullscreen</button>
          </div>
          <ShareSlideDeckToClass slides={slides} defaultTitle={topic || 'AI Slide Deck'} defaultCourseId={courseId} />
        </div>
      )}
    </div>
  );
}

// AI Creative Teacher — Graphics/Images (spec 15B.6). Real DALL-E/Stability call, shows the
// actual generated image (returned as a data URI, nothing faked or placeholder).
// AI Create Media → class: saves the file to CareerZ storage first (provider links expire within
// hours), then publishes it as a lesson in the class chosen at the top of AI Teacher.
const MEDIA_STORAGE_TYPE = { image: 'image', audio: 'video', video: 'video', model: 'raw' };

function ShareMediaToClass({ courseId, type, source, defaultTitle }) {
  const [open, setOpen] = useState(false), [title, setTitle] = useState(''), [note, setNote] = useState(''), [busy, setBusy] = useState(false), [status, setStatus] = useState('');
  useEffect(() => { setOpen(false); setStatus(''); }, [source]);
  if (!source) return null;
  if (!courseId) return <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 10 }}>Select class and subject at the top to share this with students.</p>;
  async function publish() {
    if (!title.trim()) return;
    setBusy(true);
    try {
      setStatus('Saving to CareerZ storage…');
      const url = await uploadToPlatformStorage(source, 'ai-media', MEDIA_STORAGE_TYPE[type]);
      setStatus('Publishing…');
      const { notifiedCount, feeBlockedCount } = await apiRequest(`/courses/${courseId}/ai-resource`, { method: 'POST', body: { title: title.trim(), content: note.trim(), media: { type, url, name: title.trim() } } });
      setStatus(`Published to class — ${notifiedCount} student${notifiedCount === 1 ? '' : 's'} notified${feeBlockedCount > 0 ? ` (${feeBlockedCount} skipped — pending fee)` : ''}.`);
      setOpen(false);
    } catch (err) { setStatus(err.message); } finally { setBusy(false); }
  }
  return <div style={{ marginTop: 10 }}>
    {!open ? <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: 6 }} onClick={() => { setTitle(defaultTitle || ''); setNote(''); setStatus(''); setOpen(true); }}><FaPaperPlane aria-hidden="true" /> Review &amp; Share with Students</button>
      : <div style={{ padding: 12, background: 'var(--sand)', borderRadius: 10, display: 'grid', gap: 8 }}>
        <p className="text-xs" style={{ color: 'var(--ink-soft)', margin: 0 }}>Publishes to the class selected at the top. Students get a notification.</p>
        <input className="form-input" aria-label="Lesson title" placeholder="Lesson title" value={title} maxLength={200} onChange={(e) => setTitle(e.target.value)} />
        <textarea className="form-input" rows={2} aria-label="Note for students" placeholder="Optional note for students, e.g. what to look for" value={note} onChange={(e) => setNote(e.target.value)} />
        <div className="flex gap-2"><button type="button" className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.78rem' }} disabled={busy || !title.trim()} onClick={publish}>{busy ? 'Publishing…' : 'Publish'}</button><button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.78rem' }} disabled={busy} onClick={() => setOpen(false)}>Cancel</button></div>
      </div>}
    {status && <p className="text-xs" role="status" style={{ marginTop: 8 }}>{status}</p>}
  </div>;
}

function ImageGenerator({ aiEnabled, onFlash, courseId, lockedReason }) {
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  async function generate(e) {
    e.preventDefault();
    setLoading(true); setImage(null);
    try {
      const { imageDataUrl } = await apiRequest('/ai/image', { method: 'POST', body: { prompt } });
      setImage(imageDataUrl);
    } catch (err) { onFlash(err.message); } finally { setLoading(false); }
  }

  return (
    <div className="card" style={{ padding: 18 }}>
      <strong className="text-sm">AI Graphics / Image Generator</strong>
      <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 6 }}>Describe a diagram, chart or illustration for class.</p>
      {!aiEnabled || lockedReason ? (
        <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 12 }}>{lockedReason || 'Connect an Image AI provider above first.'}</p>
      ) : (
        <form onSubmit={generate} style={{ marginTop: 12 }}>
          <input className="form-input" placeholder="e.g. Diagram of the human heart with labeled chambers" value={prompt} onChange={(e) => setPrompt(e.target.value)} required />
          <button type="submit" className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.78rem', marginTop: 8 }} disabled={loading}>{loading ? 'Generating (can take ~20s)...' : 'Generate Image'}</button>
          {image && <img src={image} alt="AI generated classroom visual" style={{ marginTop: 12, borderRadius: 10, maxWidth: '100%' }} />}
        </form>
      )}
      {!lockedReason && <ShareMediaToClass courseId={courseId} type="image" source={image} defaultTitle={prompt.slice(0, 80)} />}
    </div>
  );
}

// AI Creative Teacher — 3D Models (spec 15B.6, Meshy AI). Async job: create then poll. Renders
// the real returned GLB model with Three.js — not just a download link.
function ThreeDModelGenerator({ aiEnabled, onFlash, courseId, lockedReason }) {
  const [prompt, setPrompt] = useState('');
  const [taskId, setTaskId] = useState(null);
  const [status, setStatus] = useState(null);
  const [modelUrl, setModelUrl] = useState(null);
  const viewerRef = useRef(null);

  async function start(e) {
    e.preventDefault();
    setStatus('PENDING'); setModelUrl(null);
    try {
      const { taskId: id } = await apiRequest('/ai/3d-model', { method: 'POST', body: { prompt } });
      setTaskId(id);
      setPrompt('');
    } catch (err) { onFlash(err.message); setStatus(null); }
  }

  useEffect(() => {
    if (!taskId || !status || ['SUCCEEDED', 'FAILED'].includes(status)) return;
    const timer = setTimeout(async () => {
      try {
        const s = await apiRequest(`/ai/3d-model/${taskId}`);
        setStatus(s.status);
        if (s.status === 'SUCCEEDED') setModelUrl(s.modelUrl);
        if (s.status === 'FAILED') onFlash('3D model generation failed.');
      } catch (err) { onFlash(err.message); setStatus('FAILED'); }
    }, 4000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId, status]);

  useEffect(() => {
    if (!modelUrl || !viewerRef.current) return;
    let renderer, frameId;
    (async () => {
      const THREE = await import('three');
      const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
      const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');
      const mount = viewerRef.current;
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xf3f0ea);
      const camera = new THREE.PerspectiveCamera(45, mount.clientWidth / 320, 0.1, 1000);
      camera.position.set(2, 2, 2);
      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(mount.clientWidth, 320);
      mount.innerHTML = '';
      mount.appendChild(renderer.domElement);
      const controls = new OrbitControls(camera, renderer.domElement);
      scene.add(new THREE.AmbientLight(0xffffff, 0.8));
      const light = new THREE.DirectionalLight(0xffffff, 0.8); light.position.set(3, 5, 2); scene.add(light);
      new GLTFLoader().load(modelUrl, (gltf) => scene.add(gltf.scene));
      function animate() { frameId = requestAnimationFrame(animate); controls.update(); renderer.render(scene, camera); }
      animate();
    })();
    return () => { cancelAnimationFrame(frameId); renderer?.dispose(); };
  }, [modelUrl]);

  return (
    <div className="card" style={{ padding: 18 }}>
      <strong className="text-sm">AI 3D Model Generator</strong>
      <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 6 }}>Describe an object for a 3D science/geography lesson — takes 1-3 minutes.</p>
      {!aiEnabled || lockedReason ? (
        <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 12 }}>{lockedReason || 'Connect a 3D AI provider above first.'}</p>
      ) : (
        <form onSubmit={start} style={{ marginTop: 12 }}>
          <input className="form-input" placeholder="e.g. A human heart, anatomically accurate" value={prompt} onChange={(e) => setPrompt(e.target.value)} required />
          <button type="submit" className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.78rem', marginTop: 8 }} disabled={status && !['SUCCEEDED', 'FAILED'].includes(status)}>
            {status && !['SUCCEEDED', 'FAILED'].includes(status) ? `Generating (${status})...` : 'Generate 3D Model'}
          </button>
          {modelUrl && <div ref={viewerRef} style={{ marginTop: 12, borderRadius: 10, overflow: 'hidden', border: '1px solid var(--sand-line)' }} />}
        </form>
      )}
      {!lockedReason && <ShareMediaToClass courseId={courseId} type="model" source={modelUrl} defaultTitle={`3D model: ${prompt}`.slice(0, 80)} />}
    </div>
  );
}

// AI Creative Teacher — Voice narration (ElevenLabs) and Avatar Video (HeyGen). Two separate,
// self-contained pipelines — HeyGen synthesizes its own voice internally, it doesn't need a
// separate ElevenLabs call chained in.
// AI Creative Teacher — Animation (spec 15B.6, Runway ML). Async job: create then poll. Runway's
// output URLs expire in 24-48h, so the video is offered as a real download, not just a link.
function AnimationGenerator({ aiEnabled, onFlash, courseId, lockedReason }) {
  const [promptText, setPromptText] = useState('');
  const [promptImage, setPromptImage] = useState('');
  const [taskId, setTaskId] = useState(null);
  const [status, setStatus] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);

  async function start(e) {
    e.preventDefault();
    setStatus('PENDING'); setVideoUrl(null);
    try {
      const { taskId: id } = await apiRequest('/ai/animation', { method: 'POST', body: { promptText, promptImage: promptImage || undefined } });
      setTaskId(id);
      setPromptText('');
      setPromptImage('');
    } catch (err) { onFlash(err.message); setStatus(null); }
  }

  useEffect(() => {
    if (!taskId || !status || ['SUCCEEDED', 'FAILED'].includes(status)) return;
    const timer = setTimeout(async () => {
      try {
        const s = await apiRequest(`/ai/animation/${taskId}`);
        setStatus(s.status);
        if (s.status === 'SUCCEEDED') setVideoUrl(s.videoUrl);
        if (s.status === 'FAILED') onFlash('Animation generation failed.');
      } catch (err) { onFlash(err.message); setStatus('FAILED'); }
    }, 5000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId, status]);

  return (
    <div className="card" style={{ padding: 18 }}>
      <strong className="text-sm">AI Animation Generator</strong>
      <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 6 }}>Describe a moving animation (e.g. a chemical reaction, a physics principle). Takes 1-2 minutes. Download the result — the link expires in 24-48h.</p>
      {!aiEnabled || lockedReason ? (
        <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 12 }}>{lockedReason || 'Connect an Animation AI provider above first.'}</p>
      ) : (
        <form onSubmit={start} style={{ marginTop: 12 }}>
          <input className="form-input" placeholder="e.g. A water molecule forming from hydrogen and oxygen atoms" value={promptText} onChange={(e) => setPromptText(e.target.value)} required />
          <input className="form-input" placeholder="Optional: public image URL to animate from" value={promptImage} onChange={(e) => setPromptImage(e.target.value)} style={{ marginTop: 8 }} />
          <button type="submit" className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.78rem', marginTop: 8 }} disabled={status && !['SUCCEEDED', 'FAILED'].includes(status)}>
            {status && !['SUCCEEDED', 'FAILED'].includes(status) ? `Generating (${status})...` : 'Generate Animation'}
          </button>
          {videoUrl && (
            <div style={{ marginTop: 12 }}>
              <video controls src={videoUrl} style={{ width: '100%', borderRadius: 10 }} />
              <a href={videoUrl} download className="btn" style={{ padding: '5px 12px', fontSize: '0.75rem', marginTop: 8, display: 'inline-block' }}>Download before it expires</a>
            </div>
          )}
        </form>
      )}
      {!lockedReason && <ShareMediaToClass courseId={courseId} type="video" source={videoUrl} defaultTitle={`Animation: ${promptText}`.slice(0, 80)} />}
    </div>
  );
}

function VoiceAndAvatarGenerator({ aiEnabled, onFlash, courseId, lockedReason }) {
  const [narrationText, setNarrationText] = useState('');
  const [audio, setAudio] = useState(null);
  const [narrating, setNarrating] = useState(false);

  const [script, setScript] = useState('');
  const [videoId, setVideoId] = useState(null);
  const [videoStatus, setVideoStatus] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);

  async function generateNarration(e) {
    e.preventDefault();
    setNarrating(true); setAudio(null);
    try {
      const { audioDataUrl } = await apiRequest('/ai/voice', { method: 'POST', body: { text: narrationText } });
      setAudio(audioDataUrl);
      setNarrationText('');
    } catch (err) { onFlash(err.message); } finally { setNarrating(false); }
  }

  async function startAvatarVideo(e) {
    e.preventDefault();
    setVideoStatus('processing'); setVideoUrl(null);
    try {
      const { videoId: id } = await apiRequest('/ai/avatar-video', { method: 'POST', body: { script } });
      setVideoId(id);
      setScript('');
    } catch (err) { onFlash(err.message); setVideoStatus(null); }
  }

  useEffect(() => {
    if (!videoId || !videoStatus || ['completed', 'failed'].includes(videoStatus)) return;
    const timer = setTimeout(async () => {
      try {
        const s = await apiRequest(`/ai/avatar-video/${videoId}`);
        setVideoStatus(s.status);
        if (s.status === 'completed') setVideoUrl(s.videoUrl);
      } catch (err) { onFlash(err.message); setVideoStatus('failed'); }
    }, 5000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId, videoStatus]);

  return (
    <>
      <div className="card" style={{ padding: 18 }}>
        <strong className="text-sm">AI Voice Narration</strong>
        <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 6 }}>Type narration text — get real speech audio to play over slides.</p>
        {!aiEnabled?.voice?.configured || lockedReason ? (
          <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 12 }}>{lockedReason || 'Connect a Voice AI provider above first.'}</p>
        ) : (
          <form onSubmit={generateNarration} style={{ marginTop: 12 }}>
            <textarea className="form-input" rows={2} placeholder="Text to narrate..." value={narrationText} onChange={(e) => setNarrationText(e.target.value)} required />
            <button type="submit" className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.78rem', marginTop: 8 }} disabled={narrating}>{narrating ? 'Generating...' : 'Generate Narration'}</button>
            {audio && <audio controls src={audio} style={{ display: 'block', marginTop: 12, width: '100%' }} />}
          </form>
        )}
        {!lockedReason && <ShareMediaToClass courseId={courseId} type="audio" source={audio} defaultTitle={`Narration: ${narrationText}`.slice(0, 80)} />}
      </div>

      <div className="card" style={{ padding: 18 }}>
        <strong className="text-sm">AI Avatar Video</strong>
        <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 6 }}>Type a script — get a full talking-avatar educational video (takes a few minutes).</p>
        {!aiEnabled?.avatar?.configured || lockedReason ? (
          <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 12 }}>{lockedReason || 'Connect an Avatar Video AI provider above first.'}</p>
        ) : (
          <form onSubmit={startAvatarVideo} style={{ marginTop: 12 }}>
            <textarea className="form-input" rows={2} placeholder="What should the avatar say?" value={script} onChange={(e) => setScript(e.target.value)} required />
            <button type="submit" className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.78rem', marginTop: 8 }} disabled={videoStatus && !['completed', 'failed'].includes(videoStatus)}>
              {videoStatus && !['completed', 'failed'].includes(videoStatus) ? `Generating (${videoStatus})...` : 'Generate Avatar Video'}
            </button>
            {videoUrl && <video controls src={videoUrl} style={{ display: 'block', marginTop: 12, width: '100%', borderRadius: 10 }} />}
          </form>
        )}
        {!lockedReason && <ShareMediaToClass courseId={courseId} type="video" source={videoUrl} defaultTitle={`Avatar video: ${script}`.slice(0, 80)} />}
      </div>
    </>
  );
}

export function TeacherWorkspace({ tab, user, onFlash, onChanged, onNavigate, onMessageUser }) {
  if (tab === 'academyBatches') return <TeacherBatches onFlash={onFlash} />;
  // Teachers are job seekers too: teaching and other jobs, alerts, CV and their applications.
  if (tab === 'jobs') return <StudentJobsPanel onFlash={onFlash} user={user} />;
  if (tab === 'scholarships') return <div className="teacher-support teacher-funding-view"><ScholarshipsPanel onFlash={onFlash} user={user} /></div>;
  if (tab === 'learningCenter') return <TeacherPanel onFlash={onFlash} />;
  if (tab === 'offlineStudy') return <div className="teacher-support teacher-offline-view"><OfflineStudy onFlash={onFlash} /></div>;
  if (tab === 'placement') return <PlacementOffice onFlash={onFlash} />;
  if (tab === 'health') return <div className="teacher-support teacher-health-view"><MedicalHealth mode="teacher" onFlash={onFlash} /></div>;
  if (tab === 'profile') return <><ProfilePanel user={user} onFlash={onFlash} onChanged={onChanged} /><SalaryPayoutProfilePanel onFlash={onFlash} /><RolesPanel onFlash={onFlash} onChanged={onChanged} /><SupportComplaintPanel onFlash={onFlash} /></>;
  if (tab === 'teacherProfile') return <TeacherProfileDetailsPanel user={user} onFlash={onFlash} onChanged={onChanged} />;
  if (tab === 'employmentOffers') return <TeacherEmploymentPanel onFlash={onFlash} />;
  if (tab === 'courses') return <TeacherPanel onFlash={onFlash} />;
  if (tab === 'summary') return <TeacherSummary onNavigate={onNavigate} user={user} />;
  if (tab === 'students') return <TeacherStudentsPanel onFlash={onFlash} />;
  if (tab === 'attendance') return <TeacherAttendancePanel onFlash={onFlash} />;
  if (tab === 'myAttendance') return <TeacherSelfAttendancePanel onFlash={onFlash} />;
  if (tab === 'homework') return <TeacherHomeworkPanel onFlash={onFlash} />;
  if (tab === 'results') return <TeacherResultsPanel onFlash={onFlash} />;
  if (tab === 'timetable') return <TimetableView onFlash={onFlash} url="/teachers/me/timetable" />;
  if (tab === 'materialUpload') return <TeacherMaterialUploadPanel onFlash={onFlash} />;
  if (tab === 'liveClasses') return <TeacherLiveClassesPanel user={user} onFlash={onFlash} />;
  if (tab === 'studentCommunication') return <TeacherStudentCommunicationPanel onFlash={onFlash} onNavigate={onNavigate} onMessageUser={onMessageUser} />;
  if (tab === 'examination') return <TeacherExaminationPanel onFlash={onFlash} />;
  if (tab === 'questionBank') return <QuestionBankPanel onFlash={onFlash} />;
  if (tab === 'earnings') return <TeacherEarningsPanel onFlash={onFlash} />;
  if (tab === 'performance') return <TeacherPerformancePanel onFlash={onFlash} />;
  if (tab === 'resourceLibrary') return <ResourceLibrary onFlash={onFlash} canShare />;
  // The three AI teacher tools live under one menu item; the old keys still open their section.
  if (tab === 'aiAssistant') return <TeacherAiHub onFlash={onFlash} />;
  if (tab === 'aiCreative') return <TeacherAiHub onFlash={onFlash} initial="media" />;
  if (tab === 'advancedControl') return <TeacherAiHub onFlash={onFlash} initial="live" />;
  if (tab === 'engagement') return <TeacherEngagementPanel onFlash={onFlash} />;
  if (tab === 'ptm') return <><TeacherPtmPanel onFlash={onFlash} /><FamilyTeacherNotes onFlash={onFlash} /></>;
  if (tab === 'wallet') return <WalletCard onFlash={onFlash} />;
  if (tab === 'instEvents') return <div className="teacher-support teacher-events-view"><InstitutionCommunity kind="events" onFlash={onFlash} /></div>;
  if (tab === 'instHelpdesk') return <InstitutionCommunity kind="tickets" onFlash={onFlash} />;
  if (tab === 'inventory') return <InstitutionInventory onFlash={onFlash} />;
  const labels = {};
  return <ComingSoon label={labels[tab] || tab} />;
}

function AiScope({ scope, onScope, onStatus, onFlash }) {
  const [options, setOptions] = useState([]);
  useEffect(() => { let alive = true; apiRequest('/institution-ops/community/institutions').then(async list => {
    const connected = await Promise.all(list.map(async i => { try { const status = await apiRequest('/ai/institutions/' + i._id + '/config'); return { ...i, status }; } catch { return null; } }));
    if (alive) setOptions(connected.filter(Boolean));
  }).catch(() => {}); return () => { alive = false; }; }, []);
  useEffect(() => { let alive = true; onStatus(null); apiRequest(scope ? '/ai/institutions/' + scope + '/config' : '/ai/config').then(status => { if (alive) onStatus(status); }).catch(e => { if (alive) onFlash(e.message); }); return () => { alive = false; }; }, [scope]);
  return <label>AI billing source<select className="form-select" value={scope} onChange={e => onScope(e.target.value)}><option value="">My personal API key</option>{options.map(i => <option key={i._id} value={i._id}>{i.name} — institution API key</option>)}</select></label>;
}

// One "AI Teacher" page: writing and planning tools, media creation, and live class control.
function TeacherAiHub({ onFlash, initial = 'write' }) {
  const sections = [['write', 'Write & Plan', 'Notes, quizzes, lesson plans, assignments, papers, rubrics and slides for your class'], ['media', 'Create Media', 'Images, 3D models, narration, avatar video and animation'], ['live', 'Live Class Control', 'Run your live class: slides, polls and student inputs']];
  const [section, setSection] = useUrlTab('teacherAiHub', initial);
  const [courses, setCourses] = useState(null), [courseId, setCourseId] = useState('');
  useEffect(() => { apiRequest('/courses/mine/list').then((list) => { setCourses(list); if (list.length === 1) setCourseId(list[0]._id); }).catch(() => setCourses([])); }, []);
  const current = sections.find(([key]) => key === section);
  return <div className="teacher-ai-workspace">
    <header className="tai-heading"><span className="tai-heading-icon"><FaRobot aria-hidden="true" /></span><div><h2>AI Teaching Studio</h2><p>Prepare lessons, create teaching media and bring your class to life.</p></div></header>
    <nav className="cz-tabbar" aria-label="AI Teacher sections" style={{ marginBottom: 8, flexWrap: 'wrap' }}>
      {sections.map(([key, label]) => <button key={key} type="button" aria-pressed={section === key} className={`cz-tab${section === key ? ' active' : ''}`} onClick={() => setSection(key)}>{label}</button>)}
    </nav>
    <p className="text-xs" style={{ color: 'var(--ink-soft)', marginBottom: 16 }}>{current[2]}</p>
    {section !== 'live' && <TeacherAiClassPicker courses={courses} courseId={courseId} onChange={setCourseId} />}
    {section === 'write' && <TeacherAiAssistantPanel onFlash={onFlash} courseId={courseId} />}
    {section === 'media' && <TeacherCreativeAiPanel onFlash={onFlash} courseId={courseId} />}
    {section === 'live' && <AdvancedClassControlPanel onFlash={onFlash} />}
  </div>;
}

// Two required choices before any AI tool unlocks: the class (section) and then the subject the
// teacher teaches in it. Each subject is one of the teacher's own courses.
function TeacherAiClassPicker({ courses, courseId, onChange }) {
  const classOf = (c) => c.classSection?._id || (c.institution?._id ? 'inst:' + c.institution._id : 'own');
  const className = (c) => c.classSection?.name ? c.classSection.name + (c.institution?.name ? ' (' + c.institution.name + ')' : '') : c.institution?.name ? c.institution.name + ' (no section)' : 'My own courses';
  const classes = [...new Map((courses || []).map((c) => [classOf(c), className(c)])).entries()];
  const selected = courses?.find((c) => c._id === courseId);
  const [classKey, setClassKey] = useState(selected ? classOf(selected) : '');
  useEffect(() => { if (selected) setClassKey(classOf(selected)); else if (classes.length === 1) setClassKey(classes[0][0]); }, [courses, courseId]);
  const subjects = (courses || []).filter((c) => classOf(c) === classKey);
  function pickClass(key) { setClassKey(key); const list = (courses || []).filter((c) => classOf(c) === key); onChange(list.length === 1 ? list[0]._id : ''); }
  return <div className="card teacher-ai-class" style={{ padding: 18, margin: '12px 0 16px', display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
    <label>Class<select className="form-select" value={classKey} onChange={(e) => pickClass(e.target.value)} disabled={!courses?.length}>
      <option value="" disabled>{courses === null ? 'Loading your classes…' : courses.length ? 'Select a class…' : 'No classes assigned yet'}</option>
      {classes.map(([key, name]) => <option key={key} value={key}>{name}</option>)}
    </select></label>
    <label>Subject<select className="form-select" value={courseId} onChange={(e) => onChange(e.target.value)} disabled={!classKey}>
      <option value="" disabled>{classKey ? 'Select a subject…' : 'Select a class first'}</option>
      {subjects.map((c) => <option key={c._id} value={c._id}>{c.subject || c.title}{c.subject && c.subject !== c.title ? ' — ' + c.title : ''}</option>)}
    </select></label>
    <p className="text-xs" role="status" style={{ gridColumn: '1 / -1', margin: 0 }}>{selected
      ? <>Preparing for <strong>{selected.subject || selected.title}</strong> · {className(selected)}{selected.level ? <> · Level: {selected.level}</> : null}{selected.academicTerm ? <> · Term: {selected.academicTerm}</> : null}. The AI writes for this class, and <em>Review &amp; Share</em> publishes it to these students.</>
      : courses?.length === 0 ? 'You have no classes yet. Your institution assigns classes to you, or create your own course first.'
      : 'Select the class and subject you are preparing for. The AI tools unlock once both are selected.'}</p>
  </div>;
}

function TeacherAiAssistantPanel({ onFlash, courseId }) {
  const [status, setStatus] = useState(null), [scope, setScope] = useState('');

  const tools = [
    ['teacher_notes', 'Notes Generator'], ['teacher_quiz', 'Quiz Generator'], ['teacher_lesson_plan', 'Lesson Plan'],
    ['teacher_assignment', 'Smart Assignment'], ['teacher_paper', 'Question Paper'], ['teacher_rubric', 'Assessment Rubric']
  ];
  return <section className="tai-write"><AiScope scope={scope} onScope={setScope} onStatus={setStatus} onFlash={onFlash} />
    {!scope && <AiSettingsPanel onFlash={onFlash} onChanged={() => apiRequest('/ai/config').then(setStatus)} />}
    {scope && <p>Uses the selected institution key with its AI access permission. Contact the owner to connect a provider.</p>}
    <div className="tai-tool-grid" style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))' }}>{tools.map(([feature,title], index) => <AiFeatureCard key={scope + courseId + feature} feature={feature} title={title} description={["Create clear class notes, tailored to your topic and learning level.","Build a quiz to check understanding and identify learning gaps.","Structure your lesson with objectives, activities and timings.","Draft meaningful practice with clear instructions for your students.","Prepare an exam paper aligned with your teaching goals.","Set clear assessment criteria and consistent marking standards."][index]} placeholder="Introduction to Computing, first semester, English" aiEnabled={!!status?.text.configured} institutionId={scope} courseId={courseId} lockedReason={courseId ? '' : 'Select class and subject at the top first'} shareable />)}</div>
    <SlideDeckGenerator key={scope} institutionId={scope} courseId={courseId} lockedReason={courseId ? '' : 'Select class and subject at the top first.'} aiEnabled={!!status?.text.configured} imageEnabled={!!status?.image.configured} /><TeacherPerformanceInsights institutionId={scope} enabled={!!status?.text.configured} />
    <p>Review and publish approved content to your course so enrolled students can access it.</p>
  </section>;
}

function TeacherPerformanceInsights({ institutionId, enabled }) {
 const [data,setData]=useState(null),[busy,setBusy]=useState(false),[error,setError]=useState('');
 useEffect(()=>{setData(null);setError('');},[institutionId]);
 async function generate(){setBusy(true);setError('');try{setData(await apiRequest('/ai/teaching-insights',{method:'POST',body:{institutionId:institutionId||undefined}}));}catch(e){setError(e.message);}finally{setBusy(false);}}
 return <section className="card tai-performance"><h3>My Class Performance Analysis</h3><p>Uses graded results from your assigned courses only.</p><button className="btn" disabled={busy||!enabled} onClick={generate}>{busy?'Analyzing?':'Analyze my classes'}</button>{error&&<p role="alert">{error}</p>}{data&&<><p style={{whiteSpace:'pre-wrap'}}>{data.insights}</p><details><summary>Data used</summary><pre style={{whiteSpace:'pre-wrap'}}>{data.dataSummary}</pre></details></>}</section>;
}

// Real BYOK AI Creative Teacher (spec 15B.6-15B.7) — its own dedicated pipeline, separate from
// the text-only AI Teacher Assistant: graphics, 3D models, narration, avatar video, and the full
// AI Video Lesson Creator (script -> narration -> slides -> real MP4).
function TeacherCreativeAiPanel({ onFlash, courseId }) {
  const [status, setStatus] = useState(null);
  function refresh() { apiRequest('/ai/config').then(setStatus).catch(() => {}); }
  useEffect(refresh, []);

  const textEnabled = status?.text.configured || false;
  const lock = courseId ? '' : 'Select class and subject at the top first.';

  return (
    <div className="tai-media">
      <h3 className="font-semibold mb-3">Create Media</h3>
      <AiSettingsPanel onFlash={onFlash} onChanged={refresh} />

      <h4 className="font-semibold mb-2 mt-2" style={{ fontSize: '0.9rem' }}>Graphics, 3D, Narration &amp; Avatar</h4>
      <p className="text-xs mb-3" style={{ color: 'var(--ink-soft)' }}>Each connects to a different specialized AI provider above — connect only what you'll actually use.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 tai-media-grid" style={{ gap: 14 }}>
        <ImageGenerator aiEnabled={status?.image.configured} onFlash={onFlash} courseId={courseId} lockedReason={lock} />
        <ThreeDModelGenerator aiEnabled={status?.threed.configured} onFlash={onFlash} courseId={courseId} lockedReason={lock} />
        <AnimationGenerator aiEnabled={status?.animation.configured} onFlash={onFlash} courseId={courseId} lockedReason={lock} />
        <VoiceAndAvatarGenerator aiEnabled={status} onFlash={onFlash} courseId={courseId} lockedReason={lock} />
      </div>

      <h4 className="font-semibold mb-2 mt-6" style={{ fontSize: '0.9rem' }}>AI Video Lesson Creator</h4>
      <p className="text-xs mb-3" style={{ color: 'var(--ink-soft)' }}>Text → AI script → voice narration → slide scenes → real MP4, rendered free in your browser (ffmpeg.wasm), saved to a lesson. Needs Text + Voice AI connected above, and a free video storage account connected below.</p>
      <AiVideoLessonCreator aiEnabled={textEnabled && status?.voice.configured} onFlash={onFlash} courseId={courseId} lockedReason={lock} />
    </div>
  );
}

const VOICE_COMMANDS = [
  { cmd: 'next', patterns: ['next slide', 'next', 'agla', 'agli slide', 'aagay', 'aage'] },
  { cmd: 'previous', patterns: ['previous slide', 'previous', 'go back', 'back', 'pichla', 'pichli slide', 'peechay'] },
  { cmd: 'start', patterns: ['start presentation', 'start class', 'start', 'shuru karo', 'shuru'] },
  { cmd: 'stop', patterns: ['stop presentation', 'stop class', 'stop', 'pause', 'rok do', 'band karo'] }
];

function matchVoiceCommand(transcript) {
  const t = transcript.toLowerCase().trim();
  for (const { cmd, patterns } of VOICE_COMMANDS) {
    if (patterns.some((p) => t.includes(p))) return cmd;
  }
  return null;
}

// Optional, teacher-only hands-free presentation control (spec: voice/gesture/eye-tracking).
// All three run entirely client-side (Web Speech API, MediaPipe HandLandmarker, WebGazer.js) —
// nothing about a teacher's camera/mic feed is ever sent to the CareerZ backend. Manual
// Previous/Next/Fullscreen buttons and arrow-key navigation stay available at all times regardless
// of which controls are on, and "Emergency Disable All" immediately kills every stream/listener.
//
// Honesty note, deliberately visible in the UI, not just this comment: voice control is reliable
// (native browser speech recognition). Gesture control is reasonably reliable in good lighting.
// Eye tracking is the least precise of the three — webcam gaze tracking is a genuinely hard
// problem — so it only drives two large dwell zones (look left / look right), never a cursor, and
// always sits alongside manual controls rather than replacing them.
// Teacher-facing live-class status board — participants, raised hands, question/chat, End Class.
// Session state (participants/raisedHands) comes straight from the server (src/realtime/socket.js
// tracks it per session), kept in sync here purely by listening to class:participant/class:hand —
// see the effect in AdvancedClassControlPanel that updates the `session` prop this renders.
function LiveClassControlBoard({ session, messages, chatText, onChatText, onSendChat, onEnd, energy, poll, pollForm, onPollForm, onStartPoll, onClosePoll, onNudge }) {
  const students = (session.participants || []).filter((p) => !p.teacher);
  const totalVotes = poll ? poll.options.reduce((s, o) => s + o.votes, 0) : 0;
  return (
    <div className="card" style={{ padding: 14, background: 'var(--sand)' }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
        <span className="flex items-center" style={{ gap: 6, fontWeight: 700, color: 'var(--rose)' }}><FaCircle aria-hidden="true" style={{ fontSize: 8 }} /> LIVE — {session.courseTitle}</span>
        <button type="button" className="btn" style={{ padding: '4px 12px', fontSize: '0.72rem', background: 'var(--rose)', color: '#fff', border: 'none' }} onClick={onEnd}>End Class</button>
      </div>
      {session.meetingLink && <a href={session.meetingLink} target="_blank" rel="noreferrer" className="text-xs" style={{ display: 'inline-block', marginBottom: 8, color: 'var(--emerald)' }}>Open Video/Audio Call ↗</a>}
      <p className="text-xs" style={{ color: 'var(--ink-soft)', marginBottom: 8 }}>{students.length} student{students.length === 1 ? '' : 's'} joined{students.length > 0 ? `: ${students.map((s) => s.name).join(', ')}` : ''}</p>
      {(session.raisedHands || []).length > 0 && (
        <p className="text-xs" style={{ marginBottom: 8, color: 'var(--gold)', fontWeight: 700 }}>✋ Raised hands: {session.raisedHands.map((h) => h.name).join(', ')}</p>
      )}

      {/* Class Energy Meter — spec #17: AI-derived attention reading, teacher-only roster view. */}
      {energy && energy.total > 0 && (
        <div style={{ marginBottom: 10, padding: 10, borderRadius: 10, background: 'var(--paper-raised)' }}>
          <div className="flex items-center justify-between text-xs" style={{ fontWeight: 700 }}>
            <span>Class Energy</span>
            <span>{energy.average}% attentive on average · {energy.attentiveCount}/{energy.total} focused</span>
          </div>
          <div style={{ height: 6, borderRadius: 999, background: 'var(--sand-line)', marginTop: 6, overflow: 'hidden' }}>
            <div style={{ width: `${energy.average}%`, height: '100%', background: energy.average >= 60 ? 'var(--emerald)' : energy.average >= 30 ? 'var(--gold)' : 'var(--rose)' }} />
          </div>
          {energy.roster?.length > 0 && (
            <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {energy.roster.map((r) => (
                <span key={r.userId} className="text-xs flex items-center" style={{ gap: 5, padding: '2px 4px 2px 8px', borderRadius: 999, background: r.attentive ? 'var(--emerald)' : 'var(--rose)', color: '#fff' }}>
                  {r.name}
                  {!r.attentive && onNudge && (
                    <button type="button" onClick={() => onNudge(r.userId)} title="Send a gentle nudge" style={{ background: 'rgba(255,255,255,.25)', border: 'none', color: '#fff', borderRadius: 999, padding: '1px 7px', fontSize: 10, cursor: 'pointer' }}>Nudge</button>
                  )}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Live in-class poll */}
      <div style={{ marginBottom: 10, padding: 10, borderRadius: 10, background: 'var(--paper-raised)' }}>
        {poll ? (
          <div>
            <p className="text-xs" style={{ fontWeight: 700, marginBottom: 6 }}>{poll.question} {poll.status === 'closed' && '(closed)'}</p>
            {poll.options.map((o) => (
              <div key={o.index} className="text-xs" style={{ marginBottom: 3 }}>{o.text}: {o.votes} ({totalVotes > 0 ? Math.round((o.votes / totalVotes) * 100) : 0}%)</div>
            ))}
            {poll.status === 'open' && <button type="button" className="btn" style={{ padding: '4px 10px', fontSize: '0.7rem', marginTop: 6 }} onClick={onClosePoll}>Close Poll</button>}
          </div>
        ) : (
          <form onSubmit={onStartPoll} className="flex flex-wrap items-center" style={{ gap: 6 }}>
            <input className="form-input" placeholder="Quick poll question" style={{ flex: '1 1 160px' }} value={pollForm.question} onChange={(e) => onPollForm({ ...pollForm, question: e.target.value })} />
            {pollForm.options.map((o, i) => (
              <input key={i} className="form-input" placeholder={`Option ${i + 1}`} style={{ width: 100 }} value={o} onChange={(e) => onPollForm({ ...pollForm, options: pollForm.options.map((x, idx) => (idx === i ? e.target.value : x)) })} />
            ))}
            <button type="button" className="btn" style={{ padding: '4px 8px', fontSize: '0.7rem' }} onClick={() => onPollForm({ ...pollForm, options: [...pollForm.options, ''] })}>+</button>
            <button type="submit" className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '0.7rem' }}>Launch Poll</button>
          </form>
        )}
      </div>

      <div style={{ maxHeight: 160, overflowY: 'auto', marginBottom: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {messages.length === 0 && <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>No questions yet.</p>}
        {messages.map((m) => (
          <p key={m.id} className="text-xs"><strong>{m.name}{m.teacher ? ' (you)' : ''}:</strong> {m.text}</p>
        ))}
      </div>
      <form onSubmit={onSendChat} className="flex gap-2">
        <input className="form-input" placeholder="Reply to the class…" value={chatText} onChange={(e) => onChatText(e.target.value)} style={{ flex: 1 }} />
        <button type="submit" className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.78rem' }}>Send</button>
      </form>
    </div>
  );
}

function AdvancedClassControlPanel({ onFlash }) {
  const { socket } = useRealtime();
  const [topic, setTopic] = useState('');
  const [slides, setSlides] = useState(null);
  const [current, setCurrent] = useState(0);
  const [generating, setGenerating] = useState(false);
  const viewerRef = useRef(null);
  const slidesRef = useRef(null);
  useEffect(() => { slidesRef.current = slides; }, [slides]);

  // ---- Live Class (Socket.IO broadcast to joined students) ----
  const [myCourses, setMyCourses] = useState([]);
  const [liveCourseId, setLiveCourseId] = useState('');
  const [savedDecks, setSavedDecks] = useState([]);
  const [liveSession, setLiveSession] = useState(null); // null while not live
  const [liveMessages, setLiveMessages] = useState([]);
  const [liveChatText, setLiveChatText] = useState('');
  const [liveBusy, setLiveBusy] = useState(false);
  const [classEnergy, setClassEnergy] = useState(null);
  const [classPoll, setClassPoll] = useState(null);
  const [pollForm, setPollForm] = useState({ question: '', options: ['', ''] });
  const socketRef = useRef(null);
  useEffect(() => { socketRef.current = socket; }, [socket]);
  const liveSessionIdRef = useRef(null);
  useEffect(() => { liveSessionIdRef.current = liveSession?.id || null; }, [liveSession?.id]);

  useEffect(() => { apiRequest('/courses/mine/list').then(setMyCourses).catch(() => {}); }, []);
  useEffect(() => {
    if (!liveCourseId) { setSavedDecks([]); return; }
    apiRequest(`/courses/${liveCourseId}`).then((data) => {
      setSavedDecks((data.lessons || []).filter((l) => l.kind === 'slide_deck' && l.published && l.deck?.slides?.length > 0));
    }).catch(() => setSavedDecks([]));
  }, [liveCourseId]);

  function loadSavedDeck(lesson) {
    setSlides(lesson.deck.slides.map((s) => ({ ...s, image: s.imageUrl, imageStatus: s.imageUrl ? 'ready' : 'none' })));
    setCurrent(0);
  }

  async function startLiveClass() {
    if (!socketRef.current) return onFlash('Not connected — check your connection and try again.');
    if (!liveCourseId) return onFlash('Choose which class this is for first.');
    if (!slidesRef.current?.length) return onFlash('Generate or load a deck first.');
    setLiveBusy(true);
    socketRef.current.timeout(8000).emit('class:start', {
      courseId: liveCourseId,
      slides: slidesRef.current.map((s) => ({
        title: s.title, bullets: s.bullets, background: s.background, accent: s.accent, text: s.text,
        // Only a real, permanently-hosted https image survives the trip — an in-progress AI
        // generation is a data: URL, which the server deliberately drops (see socket.js).
        imageUrl: typeof (s.imageUrl || s.image) === 'string' && (s.imageUrl || s.image).startsWith('https://') ? (s.imageUrl || s.image) : ''
      }))
    }, (err, ack) => {
      setLiveBusy(false);
      if (err || !ack?.ok) return onFlash(ack?.message || 'Could not start the live class.');
      setLiveSession(ack.session);
      setCurrent(ack.session.currentSlide || 0);
      onFlash(ack.session.liveClassSessionId ? 'Live class started and linked to your scheduled class — joins count as attendance, and engagement is saved on it.' : 'Live class started — students in this course can now join. (No scheduled class right now, so attendance is not recorded.)', 'success');
    });
  }

  function endLiveClass() {
    if (!socketRef.current || !liveSessionIdRef.current) return;
    socketRef.current.emit('class:end', { sessionId: liveSessionIdRef.current }, () => {});
    setLiveSession(null); setLiveMessages([]);
  }

  function sendLiveChat(e) {
    e.preventDefault();
    if (!liveChatText.trim() || !socketRef.current || !liveSessionIdRef.current) return;
    socketRef.current.emit('class:message', { sessionId: liveSessionIdRef.current, text: liveChatText.trim() }, (ack) => {
      if (!ack?.ok) onFlash(ack?.message || 'Message failed to send.');
    });
    setLiveChatText('');
  }

  useEffect(() => {
    if (!socket || !liveSession) return;
    function onSlide({ sessionId, currentSlide }) { if (sessionId === liveSession.id) setCurrent(currentSlide); }
    function onParticipant({ userId, name, joined }) {
      setLiveSession((s) => {
        if (!s) return s;
        const participants = (s.participants || []).filter((p) => p.userId !== userId);
        if (joined) participants.push({ userId, name });
        return { ...s, participants };
      });
    }
    function onHand({ userId, name, raised }) {
      setLiveSession((s) => {
        if (!s) return s;
        const raisedHands = (s.raisedHands || []).filter((h) => h.userId !== userId);
        if (raised) raisedHands.push({ userId, name });
        return { ...s, raisedHands };
      });
    }
    function onMessage(msg) { setLiveMessages((m) => [...m, msg].slice(-200)); }
    function onEnded() { setLiveSession(null); setLiveMessages([]); setClassEnergy(null); setClassPoll(null); onFlash('Live class ended.'); }
    function onEnergyDetail(detail) { if (detail.sessionId === liveSession.id) setClassEnergy(detail); }
    function onPoll(poll) { setClassPoll(poll); }
    socket.on('class:slide', onSlide);
    socket.on('class:participant', onParticipant);
    socket.on('class:hand', onHand);
    socket.on('class:message', onMessage);
    socket.on('class:ended', onEnded);
    socket.on('class:energy:detail', onEnergyDetail);
    socket.on('class:poll', onPoll);
    return () => {
      socket.off('class:slide', onSlide); socket.off('class:participant', onParticipant);
      socket.off('class:hand', onHand); socket.off('class:message', onMessage); socket.off('class:ended', onEnded);
      socket.off('class:energy:detail', onEnergyDetail); socket.off('class:poll', onPoll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, liveSession?.id]);

  function broadcastSlide(index) {
    if (socketRef.current && liveSessionIdRef.current) socketRef.current.emit('class:control', { sessionId: liveSessionIdRef.current, currentSlide: index });
  }

  function startClassPoll(e) {
    e.preventDefault();
    const options = pollForm.options.map((o) => o.trim()).filter(Boolean);
    if (!pollForm.question.trim() || options.length < 2 || !socketRef.current || !liveSessionIdRef.current) return;
    socketRef.current.emit('class:poll:start', { sessionId: liveSessionIdRef.current, question: pollForm.question.trim(), options }, (ack) => {
      if (!ack?.ok) return onFlash(ack?.message || 'Could not start the poll.');
      setPollForm({ question: '', options: ['', ''] });
    });
  }
  function closeClassPoll() {
    if (socketRef.current && liveSessionIdRef.current) socketRef.current.emit('class:poll:close', { sessionId: liveSessionIdRef.current }, () => {});
  }

  function nudgeStudent(studentId) {
    if (!socketRef.current || !liveSessionIdRef.current) return;
    socketRef.current.emit('class:energy:nudge', { sessionId: liveSessionIdRef.current, studentId }, (ack) => {
      if (ack?.ok) onFlash('Nudge sent.', 'success'); else onFlash(ack?.message || 'Could not send nudge.');
    });
  }

  const goNext = useRef(() => setCurrent((c) => { const next = Math.min((slidesRef.current?.length || 1) - 1, c + 1); broadcastSlide(next); return next; })).current;
  const goPrev = useRef(() => setCurrent((c) => { const next = Math.max(0, c - 1); broadcastSlide(next); return next; })).current;
  const startPresenting = useRef(() => viewerRef.current?.requestFullscreen?.()).current;
  const stopPresenting = useRef(() => { if (document.fullscreenElement) document.exitFullscreen?.(); }).current;

  async function generateDeck(e) {
    e.preventDefault();
    setGenerating(true);
    try {
      const { result } = await apiRequest('/ai/generate', { method: 'POST', body: { feature: 'teacher_slides', prompt: topic } });
      const parsed = parseSlides(result);
      if (parsed.length === 0) throw new Error("Couldn't parse slides from the response — try again.");
      setSlides(parsed);
      setCurrent(0);
      setTopic('');
    } catch (err) { onFlash(err.message); } finally { setGenerating(false); }
  }

  // No-AI fallback — a plain, editable starter deck built from the topic alone. Useful whenever
  // AI generation is unavailable (no BYOK key, platform key's quota/billing lapsed, etc.) so a
  // teacher can still start a live class without waiting on that.
  function createSimpleDeck(e) {
    e.preventDefault();
    if (!topic.trim()) return onFlash('Type a topic first.');
    setSlides([
      { title: topic.trim(), bullets: ['Add your first talking point here', 'Add another point'], background: '#fff8e7', accent: '#d97706', text: '#1f2937', imageUrl: '' },
      { title: 'Slide 2', bullets: ['Edit this slide before going live'], background: '#fff8e7', accent: '#d97706', text: '#1f2937', imageUrl: '' }
    ]);
    setCurrent(0);
    setTopic('');
    onFlash('Simple deck created — edit the slides below before starting the class.', 'success');
  }

  // Manual keyboard navigation is always live, independent of every toggle below.
  useEffect(() => {
    function onKey(e) {
      if (!slidesRef.current) return;
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goNext, goPrev]);

  // ---- Voice control ----
  const [voiceOn, setVoiceOn] = useState(false);
  const [voiceLang, setVoiceLang] = useState('en-US');
  const [voiceSensitivity, setVoiceSensitivity] = useState(0.2);
  const [voiceStatus, setVoiceStatus] = useState('idle');
  const [lastVoiceCommand, setLastVoiceCommand] = useState('');
  const voiceOnRef = useRef(false);
  useEffect(() => { voiceOnRef.current = voiceOn; }, [voiceOn]);
  const voiceSensitivityRef = useRef(0.5);
  useEffect(() => { voiceSensitivityRef.current = voiceSensitivity; }, [voiceSensitivity]);

  useEffect(() => {
    if (!voiceOn) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setVoiceStatus('unsupported');
      setVoiceOn(false);
      onFlash('Voice control needs a Chrome or Edge browser — not supported here.');
      return;
    }
    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = voiceLang;
    recognition.onresult = (event) => {
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript;
      const confidence = result[0].confidence || 0;
      const cmd = matchVoiceCommand(transcript);
      // Chrome's confidence score is unreliable for short commands (often 0 even for a correct
      // match), so it only ever SUPPRESSES EXECUTION at high sensitivity settings — it never hides
      // what was heard. Without this, a silent confidence gate made it look like nothing was
      // heard at all, which was the actual bug (not that recognition itself wasn't working).
      const tooLowConfidence = confidence > 0 && confidence < voiceSensitivityRef.current * 0.6;
      if (!cmd) {
        setLastVoiceCommand(`heard: "${transcript.trim()}" → no command matched`);
      } else if (tooLowConfidence) {
        setLastVoiceCommand(`heard: "${transcript.trim()}" → ${cmd} (skipped, low confidence — lower Sensitivity)`);
      } else {
        setLastVoiceCommand(`heard: "${transcript.trim()}" → ${cmd}`);
        if (cmd === 'next') goNext();
        if (cmd === 'previous') goPrev();
        if (cmd === 'start') startPresenting();
        if (cmd === 'stop') stopPresenting();
      }
    };
    recognition.onerror = (e) => {
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') { setVoiceStatus('denied'); setVoiceOn(false); return; }
      // 'no-speech' fires constantly and harmlessly during normal pauses (recognition.onend
      // restarts it right after) — everything else is worth surfacing instead of failing silently.
      if (e.error !== 'no-speech' && e.error !== 'aborted') setLastVoiceCommand(`mic error: ${e.error}`);
    };
    recognition.onend = () => { if (voiceOnRef.current) { try { recognition.start(); } catch { /* already starting */ } } };
    try { recognition.start(); } catch { /* already started */ }
    setVoiceStatus('listening');
    return () => { recognition.onend = null; recognition.onresult = null; recognition.stop(); setVoiceStatus('idle'); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceOn, voiceLang]);

  // ---- Gesture control ----
  const [gestureOn, setGestureOn] = useState(false);
  const [gestureSensitivity, setGestureSensitivity] = useState(0.5);
  const [gestureStatus, setGestureStatus] = useState('idle');
  const [lastGesture, setLastGesture] = useState('');
  const [handDetected, setHandDetected] = useState(false);
  const [currentPose, setCurrentPose] = useState('none');
  const gestureVideoRef = useRef(null);
  const gestureSensitivityRef = useRef(0.5);
  useEffect(() => { gestureSensitivityRef.current = gestureSensitivity; }, [gestureSensitivity]);

  useEffect(() => {
    if (!gestureOn) return;
    let stream = null;
    let raf = null;
    let cancelled = false;
    // Four static held poses, each mapped to one action — no motion/direction tracking at all.
    // Swipe (reading a direction from hand movement over time) turned out to be inherently noisy:
    // a little incidental drift while holding the pose could register as either direction. A held
    // pose has no direction to get wrong — it either matches one of these four shapes or it
    // doesn't, so this is far more reliable than anything swipe-based.
    let lastPose = 'none';
    let lastPoseStart = 0;
    let poseCooldownUntil = 0;
    const POSE_ACTIONS = {
      one_finger: { label: 'Next', run: () => goNext() },
      two_fingers: { label: 'Previous', run: () => goPrev() },
      open_palm: { label: 'Start presenting', run: () => startPresenting() },
      fist: { label: 'Stop presenting', run: () => stopPresenting() }
    };

    (async () => {
      try {
        setGestureStatus('starting');
        const { loadHandLandmarker, classifyHandPose } = await import('../../utils/gestureApi');
        const landmarker = await loadHandLandmarker();
        if (cancelled) return;
        stream = await navigator.mediaDevices.getUserMedia({ video: {} });
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        gestureVideoRef.current.srcObject = stream;
        await gestureVideoRef.current.play();
        setGestureStatus('running');

        let lastUiUpdate = 0;
        function loop() {
          if (cancelled) return;
          const video = gestureVideoRef.current;
          const now = performance.now();
          if (video && video.readyState >= 2) {
            // If a single frame throws (a real, observed failure mode with the GPU delegate on
            // some machines), letting it escape kills the requestAnimationFrame chain entirely —
            // the loop just stops forever with no visible error, leaving "No hand detected" stuck
            // on screen even with a hand plainly in frame. Never let one bad frame end the loop.
            let result = null;
            try { result = landmarker.detectForVideo(video, now); } catch { /* skip this frame */ }
            const landmarks = result?.landmarks?.[0];

            // Live diagnostic (throttled to ~4/sec — no need to re-render every frame) so it's
            // visible in the UI whether a hand is even being found at all, separate from whether
            // a gesture crossed the trigger threshold — these were indistinguishable before.
            if (now - lastUiUpdate > 250) {
              lastUiUpdate = now;
              setHandDetected(Boolean(landmarks));
              setCurrentPose(landmarks ? classifyHandPose(landmarks) : 'none');
            }

            if (landmarks) {
              const pose = classifyHandPose(landmarks);
              const config = POSE_ACTIONS[pose];

              if (config && now > poseCooldownUntil) {
                if (lastPose !== pose) {
                  lastPose = pose; lastPoseStart = now;
                } else if (now - lastPoseStart > (700 - gestureSensitivityRef.current * 400)) {
                  setLastGesture(`${pose.replace('_', ' ')} held → ${config.label}`);
                  config.run();
                  poseCooldownUntil = now + 900;
                  lastPose = 'none';
                }
              } else if (!config) {
                lastPose = 'none';
              }
            }
          }
          raf = requestAnimationFrame(loop);
        }
        loop();
      } catch (err) {
        setGestureStatus(err.name === 'NotAllowedError' ? 'denied' : 'error');
        setGestureOn(false);
        onFlash(err.message || 'Could not start gesture control.');
      }
    })();

    return () => {
      cancelled = true;
      if (raf) cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
      setGestureStatus('idle');
      setHandDetected(false);
      setCurrentPose('none');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gestureOn]);

  // ---- Eye-gaze control ----
  const [eyeOn, setEyeOn] = useState(false);
  const [eyeSensitivity, setEyeSensitivity] = useState(0.5);
  const [eyeStatus, setEyeStatus] = useState('idle');
  const [lastEyeAction, setLastEyeAction] = useState('');
  const [calibrating, setCalibrating] = useState(false);
  const [calibrationClicks, setCalibrationClicks] = useState({});
  const eyeSensitivityRef = useRef(0.5);
  useEffect(() => { eyeSensitivityRef.current = eyeSensitivity; }, [eyeSensitivity]);
  const eyeZoneRef = useRef('center');
  const eyeDwellStartRef = useRef(0);

  useEffect(() => {
    if (!eyeOn) return;
    let active = true;
    (async () => {
      try {
        setEyeStatus('starting');
        const { startGazeTracking } = await import('../../utils/eyeGazeApi');
        await startGazeTracking((gaze) => {
          if (!active) return;
          const w = window.innerWidth;
          const now = performance.now();
          let zone = 'center';
          if (gaze.x < w * 0.22) zone = 'left';
          else if (gaze.x > w * 0.78) zone = 'right';

          if (zone === eyeZoneRef.current && zone !== 'center') {
            const dwellNeeded = 2000 - eyeSensitivityRef.current * 1400;
            if (now - eyeDwellStartRef.current > dwellNeeded) {
              if (zone === 'left') { setLastEyeAction('Looked left → Previous'); goPrev(); }
              else { setLastEyeAction('Looked right → Next'); goNext(); }
              eyeZoneRef.current = 'center';
              eyeDwellStartRef.current = now;
            }
          } else if (zone !== eyeZoneRef.current) {
            eyeZoneRef.current = zone;
            eyeDwellStartRef.current = now;
          }
        });
        if (active) setEyeStatus('running');
      } catch (err) {
        setEyeStatus(err.name === 'NotAllowedError' ? 'denied' : 'error');
        setEyeOn(false);
        onFlash(err.message || 'Could not start eye tracking.');
      }
    })();
    return () => {
      active = false;
      import('../../utils/eyeGazeApi').then(({ stopGazeTracking }) => stopGazeTracking().catch(() => {})).catch(() => {});
      setEyeStatus('idle');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eyeOn]);

  async function recordCalibrationDot(key, xPercent, yPercent) {
    const { recordCalibrationClick } = await import('../../utils/eyeGazeApi');
    const x = (xPercent / 100) * window.innerWidth;
    const y = (yPercent / 100) * window.innerHeight;
    await recordCalibrationClick(x, y);
    setCalibrationClicks((prev) => {
      const next = { ...prev, [key]: (prev[key] || 0) + 1 };
      return next;
    });
  }

  function emergencyDisableAll() {
    setVoiceOn(false);
    setGestureOn(false);
    setEyeOn(false);
    setCalibrating(false);
    if (document.fullscreenElement) document.exitFullscreen?.();
    onFlash('All live class inputs disabled.', 'success');
  }

  const anyControlOn = voiceOn || gestureOn || eyeOn;
  const calibrationDots = [
    [10, 10], [50, 10], [90, 10],
    [10, 50], [50, 50], [90, 50],
    [10, 90], [50, 90], [90, 90]
  ];
  const calibrationDone = calibrationDots.every(([x, y]) => (calibrationClicks[`${x},${y}`] || 0) >= 4);

  return (
    <div className="tai-live">
      <h3 className="font-semibold mb-1">Live Class Control</h3>
      <p className="text-xs mb-4" style={{ color: 'var(--ink-soft)' }}>
        Optional, hands-free presentation control — voice, hand gestures, and eye-gaze. Entirely browser-side; your camera/microphone are never sent to CareerZ. Manual buttons and arrow keys always work, on or off.
      </p>

      {!slides ? (
        <div className="card" style={{ padding: 18 }}>
          <strong className="text-sm">Step 1 — Create or select a deck</strong>
          <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 6 }}>Generate a new slide deck, or load one you already saved to a class's Resources.</p>
          <form onSubmit={generateDeck} style={{ marginTop: 12 }}>
            <input className="form-input" placeholder="e.g. The Water Cycle, Grade 5" value={topic} onChange={(e) => setTopic(e.target.value)} required />
            <div className="flex items-center flex-wrap" style={{ gap: 8, marginTop: 8 }}>
              <button type="submit" className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.78rem' }} disabled={generating}>{generating ? 'Generating...' : 'Generate with AI'}</button>
              <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.78rem' }} onClick={createSimpleDeck}>Skip AI — Create Simple Deck</button>
            </div>
          </form>
          <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--sand-line)' }}>
            <label className="text-xs" style={{ color: 'var(--ink-soft)', display: 'block', marginBottom: 6 }}>Or load a saved deck from a class</label>
            <select className="form-select" value={liveCourseId} onChange={(e) => setLiveCourseId(e.target.value)} style={{ marginBottom: 8 }}>
              <option value="">Select a class…</option>
              {myCourses.map((c) => <option key={c._id} value={c._id}>{c.title}</option>)}
            </select>
            {liveCourseId && savedDecks.length === 0 && <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>No saved decks in this class yet — generate one above, then "Save & Share with Students" to reuse it here later.</p>}
            {savedDecks.map((deck) => (
              <button key={deck._id} type="button" className="btn" style={{ display: 'block', width: '100%', textAlign: 'left', marginTop: 6, padding: '8px 12px', fontSize: '0.78rem' }} onClick={() => loadSavedDeck(deck)}>{deck.title} ({deck.deck.slides.length} slides)</button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="card" style={{ padding: 18, marginBottom: 14 }}>
            <div ref={viewerRef} style={{ position: 'relative', overflow: 'hidden', background: slides[current].background, color: slides[current].text, borderRadius: 14, padding: '36px 42px', minHeight: 320, borderTop: `10px solid ${slides[current].accent}` }}>
              <h2 style={{ fontSize: 28, marginBottom: 16, fontFamily: 'Fraunces, serif', color: slides[current].text }}>{slides[current].title}</h2>
              <ul style={{ fontSize: 16, lineHeight: 1.55, paddingLeft: 22, margin: 0 }}>
                {slides[current].bullets.map((b, i) => <li key={i} style={{ marginBottom: 8 }}>{b}</li>)}
              </ul>
              <span style={{ position: 'absolute', bottom: 14, right: 20, fontSize: 12, opacity: 0.6 }}>{current + 1} / {slides.length}</span>
            </div>
            <div className="flex items-center gap-2" style={{ marginTop: 10, flexWrap: 'wrap' }}>
              <button type="button" className="btn flex items-center" style={{ padding: '6px 14px', fontSize: '0.78rem', gap: 5 }} onClick={goPrev} disabled={current === 0}><FaArrowLeft aria-hidden="true" /> Previous</button>
              <button type="button" className="btn flex items-center" style={{ padding: '6px 14px', fontSize: '0.78rem', gap: 5 }} onClick={goNext} disabled={current === slides.length - 1}>Next <FaArrowRight aria-hidden="true" /></button>
              <button type="button" className="btn btn-primary flex items-center" style={{ padding: '6px 14px', fontSize: '0.78rem', gap: 5 }} onClick={startPresenting}><FaExpand aria-hidden="true" /> Start Class (Fullscreen)</button>
              <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.78rem' }} onClick={() => { setSlides(null); emergencyDisableAll(); }}>New Deck</button>
              {anyControlOn && (
                <button type="button" className="btn flex items-center" style={{ padding: '6px 14px', fontSize: '0.78rem', gap: 5, marginLeft: 'auto', background: 'var(--rose)', color: '#fff', border: 'none' }} onClick={emergencyDisableAll}>
                  <FaPowerOff aria-hidden="true" /> Emergency Disable All
                </button>
              )}
            </div>
            <ShareSlideDeckToClass slides={slides} defaultTitle={topic || 'Class Slide Deck'} />

            <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--sand-line)' }}>
              {!liveSession ? (
                <>
                  <strong className="text-sm">Go Live</strong>
                  <p className="text-xs" style={{ color: 'var(--ink-soft)', margin: '4px 0 8px' }}>Broadcast this deck live — every action below (manual, voice, gesture, eye) will move the slide on every joined student's screen in real time.</p>
                  <select className="form-select" value={liveCourseId} onChange={(e) => setLiveCourseId(e.target.value)} style={{ marginBottom: 8, maxWidth: 320 }}>
                    <option value="">Select which class…</option>
                    {myCourses.map((c) => <option key={c._id} value={c._id}>{c.title}</option>)}
                  </select>
                  <button type="button" className="btn btn-primary flex items-center" style={{ padding: '6px 14px', fontSize: '0.78rem', gap: 5 }} onClick={startLiveClass} disabled={liveBusy || !liveCourseId}>
                    <FaChalkboardUser aria-hidden="true" /> {liveBusy ? 'Starting…' : 'Start Live Class'}
                  </button>
                </>
              ) : (
                <LiveClassControlBoard
                  session={liveSession} messages={liveMessages} chatText={liveChatText} onChatText={setLiveChatText} onSendChat={sendLiveChat} onEnd={endLiveClass}
                  energy={classEnergy} poll={classPoll} pollForm={pollForm} onPollForm={setPollForm} onStartPoll={startClassPoll} onClosePoll={closeClassPoll}
                  onNudge={nudgeStudent}
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 14 }}>
            {/* Voice */}
            <div className="card" style={{ padding: 16 }}>
              <div className="flex items-center justify-between">
                <strong className="text-sm flex items-center" style={{ gap: 6 }}><FaMicrophone aria-hidden="true" /> Voice Control</strong>
                <button type="button" className={voiceOn ? 'btn btn-primary' : 'btn'} style={{ padding: '4px 12px', fontSize: '0.72rem' }} onClick={() => setVoiceOn((v) => !v)}>{voiceOn ? 'On' : 'Off'}</button>
              </div>
              <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 6 }}>Say "next", "previous", "start", "stop" — English or Urdu.</p>
              <select className="form-input" style={{ marginTop: 8, fontSize: '0.78rem' }} value={voiceLang} onChange={(e) => setVoiceLang(e.target.value)} disabled={voiceOn}>
                <option value="en-US">English</option>
                <option value="ur-PK">Urdu</option>
              </select>
              <label className="text-xs" style={{ color: 'var(--ink-soft)', display: 'block', marginTop: 8 }}>Sensitivity</label>
              <input type="range" min="0" max="1" step="0.05" value={voiceSensitivity} onChange={(e) => setVoiceSensitivity(Number(e.target.value))} style={{ width: '100%' }} />
              <p className="text-xs" style={{ marginTop: 8 }}>Status: {voiceStatus}{voiceStatus === 'unsupported' && ' (Chrome/Edge only)'}</p>
              {lastVoiceCommand && <p className="text-xs" style={{ color: 'var(--emerald)', marginTop: 4 }}>{lastVoiceCommand}</p>}
            </div>

            {/* Gesture */}
            <div className="card" style={{ padding: 16 }}>
              <div className="flex items-center justify-between">
                <strong className="text-sm flex items-center" style={{ gap: 6 }}><FaHand aria-hidden="true" /> Gesture Control</strong>
                <button type="button" className={gestureOn ? 'btn btn-primary' : 'btn'} style={{ padding: '4px 12px', fontSize: '0.72rem' }} onClick={() => setGestureOn((v) => !v)}>{gestureOn ? 'On' : 'Off'}</button>
              </div>
              <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 6 }}>Hold a pose briefly to confirm it: ☝️ 1 finger = Next, ✌️ 2 fingers = Previous, 🖐️ open palm = Start, ✊ fist = Stop.</p>
              {gestureOn && <video ref={gestureVideoRef} muted playsInline style={{ width: '100%', maxWidth: 140, borderRadius: 8, marginTop: 8, transform: 'scaleX(-1)' }} />}
              {!gestureOn && <video ref={gestureVideoRef} muted playsInline style={{ display: 'none' }} />}
              <label className="text-xs" style={{ color: 'var(--ink-soft)', display: 'block', marginTop: 8 }}>Sensitivity (how long to hold)</label>
              <input type="range" min="0" max="1" step="0.05" value={gestureSensitivity} onChange={(e) => setGestureSensitivity(Number(e.target.value))} style={{ width: '100%' }} />
              <p className="text-xs" style={{ marginTop: 8 }}>Status: {gestureStatus}</p>
              {gestureOn && gestureStatus === 'running' && (
                <p className="text-xs" style={{ marginTop: 4, color: handDetected ? 'var(--emerald)' : 'var(--rose)' }}>
                  {handDetected ? `Hand detected — pose: ${currentPose}` : 'No hand detected — hold your hand clearly in front of the camera, well lit'}
                </p>
              )}
              {lastGesture && <p className="text-xs" style={{ color: 'var(--emerald)', marginTop: 4 }}>{lastGesture}</p>}
            </div>

            {/* Eye tracking */}
            <div className="card" style={{ padding: 16 }}>
              <div className="flex items-center justify-between">
                <strong className="text-sm flex items-center" style={{ gap: 6 }}><FaEye aria-hidden="true" /> Eye Tracking</strong>
                <button type="button" className={eyeOn ? 'btn btn-primary' : 'btn'} style={{ padding: '4px 12px', fontSize: '0.72rem' }} onClick={() => setEyeOn((v) => !v)}>{eyeOn ? 'On' : 'Off'}</button>
              </div>
              <p className="text-xs" style={{ color: 'var(--rose)', marginTop: 6 }}>Experimental — webcam gaze tracking is far less precise than a real eye-tracker. Look toward the left or right edge of the screen and hold to navigate. Always keep manual controls as backup.</p>
              <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.78rem', marginTop: 8, display: 'flex', alignItems: 'center', gap: 5 }} onClick={() => setCalibrating(true)} disabled={!eyeOn}>
                <FaCrosshairs aria-hidden="true" /> Calibrate
              </button>
              {!eyeOn && <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 4 }}>Turn Eye Tracking on first to calibrate.</p>}
              <label className="text-xs" style={{ color: 'var(--ink-soft)', display: 'block', marginTop: 8 }}>Sensitivity (dwell time)</label>
              <input type="range" min="0" max="1" step="0.05" value={eyeSensitivity} onChange={(e) => setEyeSensitivity(Number(e.target.value))} style={{ width: '100%' }} />
              <p className="text-xs" style={{ marginTop: 8 }}>Status: {eyeStatus}{calibrationDone ? ' · calibrated' : ''}</p>
              {lastEyeAction && <p className="text-xs" style={{ color: 'var(--emerald)', marginTop: 4 }}>{lastEyeAction}</p>}
            </div>
          </div>
        </>
      )}

      {calibrating && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,26,23,0.92)', zIndex: 3000 }}>
          <p style={{ position: 'absolute', top: 20, left: 0, right: 0, textAlign: 'center', color: '#fff', fontSize: 14 }}>
            Look at each dot and click it 4-5 times. {calibrationDone ? 'Calibration looks complete — you can close this.' : ''}
          </p>
          {calibrationDots.map(([x, y]) => {
            const key = `${x},${y}`;
            const clicks = calibrationClicks[key] || 0;
            return (
              <button
                key={key}
                type="button"
                onClick={() => recordCalibrationDot(key, x, y)}
                aria-label="Calibration point"
                style={{
                  position: 'absolute', left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)',
                  width: 26, height: 26, borderRadius: '50%', border: 'none', cursor: 'pointer',
                  background: clicks >= 4 ? 'var(--emerald)' : '#fff', opacity: clicks >= 4 ? 0.6 : 1
                }}
              />
            );
          })}
          <button type="button" className="btn" style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)' }} onClick={() => setCalibrating(false)}>Done</button>
        </div>
      )}
    </div>
  );
}

const CLOUD_STORAGE_CDN = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm';

// Free/open-source AI Video Lesson pipeline (no locked-in paid video-generation provider):
// AI script (BYOK text) -> AI narration (BYOK voice, ElevenLabs or free-tier Google TTS) ->
// Canvas-rendered slide "scenes" -> ffmpeg.wasm (open-source, runs entirely in this browser tab)
// combines image+audio per scene and concatenates them into one real MP4 -> uploaded straight to
// the teacher's own Cloudinary account (BYOK, free tier) -> saved as a real Lesson.videoUrl.
function AiVideoLessonCreator({ aiEnabled, onFlash, courseId: fixedCourseId, lockedReason }) {
  const own = useTeacherCourses(onFlash);
  const { courses, setCourseId } = own;
  const courseId = fixedCourseId || own.courseId;
  const [topic, setTopic] = useState('');
  const [lessonTitle, setLessonTitle] = useState('');
  const [scenes, setScenes] = useState(null);
  const [stage, setStage] = useState('idle'); // idle | script | narration | rendering | uploading | done
  const [progress, setProgress] = useState('');
  const [videoUrl, setVideoUrl] = useState(null);
  const [storageStatus, setStorageStatus] = useState(null);
  const [cloudForm, setCloudForm] = useState({ cloudName: '', apiKey: '', apiSecret: '' });
  const ffmpegRef = useRef(null);

  useEffect(() => { apiRequest('/media/cloudinary/config').then(setStorageStatus).catch(() => setStorageStatus({ configured: false })); }, []);

  async function connectStorage(e) {
    e.preventDefault();
    try {
      await apiRequest('/media/cloudinary/config', { method: 'PUT', body: cloudForm });
      onFlash('Video storage connected.', 'success');
      setStorageStatus({ configured: true, cloudName: cloudForm.cloudName });
      setCloudForm({ cloudName: '', apiKey: '', apiSecret: '' });
    } catch (err) { onFlash(err.message); }
  }

  async function getFfmpeg() {
    if (ffmpegRef.current) return ffmpegRef.current;
    const { FFmpeg } = await import('@ffmpeg/ffmpeg');
    const { toBlobURL } = await import('@ffmpeg/util');
    const ffmpeg = new FFmpeg();
    await ffmpeg.load({
      coreURL: await toBlobURL(`${CLOUD_STORAGE_CDN}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${CLOUD_STORAGE_CDN}/ffmpeg-core.wasm`, 'application/wasm')
    });
    ffmpegRef.current = ffmpeg;
    return ffmpeg;
  }

  // Renders one scene (title + on-screen bullets) to a real PNG, same visual language as the
  // Slides Generator — free, no image-generation API call needed for the default path.
  function renderSlideImage(title, bullets, narration) {
    const canvas = document.createElement('canvas');
    canvas.width = 1280; canvas.height = 720;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#1a2332'; ctx.fillRect(0, 0, 1280, 720);
    ctx.fillStyle = '#fff'; ctx.font = '700 52px Georgia, serif';
    wrapText(ctx, title, 80, 140, 1120, 62);
    ctx.font = '32px Georgia, serif';
    let y = 280;
    bullets.forEach((b) => {
      ctx.fillText('•', 80, y);
      wrapText(ctx, b, 120, y, 1060, 44);
      y += 44 * Math.max(1, Math.ceil(b.length / 70)) + 22;
    });
    // Burn the spoken narration into the frame as captions. This keeps captions available in
    // the saved MP4 on every player, without depending on a provider-specific subtitle format.
    if (narration) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.72)';
      ctx.fillRect(40, 570, 1200, 120);
      ctx.fillStyle = '#fff';
      ctx.font = '26px Arial, sans-serif';
      ctx.textAlign = 'center';
      wrapText(ctx, narration, 640, 615, 1100, 34);
      ctx.textAlign = 'left';
    }
    return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  }

  function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = ''; let cy = y;
    words.forEach((w) => {
      const test = line + w + ' ';
      if (ctx.measureText(test).width > maxWidth && line) {
        ctx.fillText(line, x, cy); line = w + ' '; cy += lineHeight;
      } else line = test;
    });
    ctx.fillText(line, x, cy);
  }

  async function run() {
    if (!courseId) return onFlash('Select a course first.');
    if (!storageStatus?.configured) return onFlash('Connect video storage (Cloudinary) first — see below.');
    try {
      // 1. Script
      setStage('script'); setProgress('Writing lesson script...');
      const { result } = await apiRequest('/ai/generate', { method: 'POST', body: { feature: 'video_lesson_script', prompt: topic } });
      const parsedScenes = parseVideoScenes(result);
      if (parsedScenes.length === 0) throw new Error("Couldn't parse a script from the AI response — try a different topic.");
      setScenes(parsedScenes);

      // 2. Narration per scene
      setStage('narration');
      const withAudio = [];
      for (let i = 0; i < parsedScenes.length; i++) {
        setProgress(`Generating narration ${i + 1}/${parsedScenes.length}...`);
        const { audioDataUrl } = await apiRequest('/ai/voice', { method: 'POST', body: { text: parsedScenes[i].narration } });
        withAudio.push({ ...parsedScenes[i], audioDataUrl });
      }

      // 3. Render scenes + assemble with ffmpeg.wasm
      setStage('rendering'); setProgress('Loading video renderer...');
      const ffmpeg = await getFfmpeg();
      const { fetchFile } = await import('@ffmpeg/util');
      const clipNames = [];
      for (let i = 0; i < withAudio.length; i++) {
        setProgress(`Rendering scene ${i + 1}/${withAudio.length}...`);
        const imgBlob = await renderSlideImage(withAudio[i].title, withAudio[i].bullets, withAudio[i].narration);
        await ffmpeg.writeFile(`img${i}.png`, await fetchFile(imgBlob));
        await ffmpeg.writeFile(`aud${i}.mp3`, await fetchFile(withAudio[i].audioDataUrl));
        await ffmpeg.exec([
          '-loop', '1', '-i', `img${i}.png`, '-i', `aud${i}.mp3`,
          '-c:v', 'libx264', '-tune', 'stillimage', '-c:a', 'aac', '-b:a', '160k',
          '-pix_fmt', 'yuv420p', '-shortest', `clip${i}.mp4`
        ]);
        clipNames.push(`clip${i}.mp4`);
      }
      setProgress('Combining scenes into final video...');
      const listContent = clipNames.map((n) => `file '${n}'`).join('\n');
      await ffmpeg.writeFile('list.txt', new TextEncoder().encode(listContent));
      await ffmpeg.exec(['-f', 'concat', '-safe', '0', '-i', 'list.txt', '-c', 'copy', 'output.mp4']);
      const data = await ffmpeg.readFile('output.mp4');
      const videoBlob = new Blob([data.buffer], { type: 'video/mp4' });

      // 4. Upload to Cloudinary (signed, direct from browser)
      setStage('uploading'); setProgress('Uploading video...');
      const sig = await apiRequest('/media/cloudinary/signature', { method: 'POST' });
      const form = new FormData();
      form.append('file', videoBlob, 'lesson.mp4');
      form.append('api_key', sig.apiKey);
      form.append('timestamp', sig.timestamp);
      form.append('signature', sig.signature);
      form.append('folder', sig.folder);
      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/video/upload`, { method: 'POST', body: form });
      const uploadJson = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadJson.error?.message || 'Video upload failed.');

      // 5. Save as a real Lesson
      setProgress('Saving lesson...');
      await apiRequest(`/courses/${courseId}/lessons`, {
        method: 'POST',
        body: { title: lessonTitle || topic, content: withAudio.map((s) => `${s.title}\n${s.narration}`).join('\n\n'), videoUrl: uploadJson.secure_url }
      });

      setVideoUrl(uploadJson.secure_url);
      setStage('done');
      setLessonTitle('');
      setTopic('');
      onFlash('Video lesson created and saved!', 'success');
    } catch (err) {
      onFlash(err.message);
      setStage('idle');
    }
  }

  if (!storageStatus) return null;

  return (
    <div className="card tai-video-creator" style={{ padding: 18 }}>
      {!storageStatus.configured && (
        <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid var(--sand-line)' }}>
          <strong className="text-sm">Connect video storage</strong>
          <p className="text-xs mt-1 mb-2" style={{ color: 'var(--ink-soft)' }}>Connect your Cloudinary account to save video lessons. Find these details in your Cloudinary dashboard.</p>
          <form onSubmit={connectStorage} className="tai-storage-form">
            <label><span>Cloud name</span><input className="form-input" placeholder="Cloud name" value={cloudForm.cloudName} onChange={(e) => setCloudForm({ ...cloudForm, cloudName: e.target.value })} required /></label>
            <label><span>API key</span><input className="form-input" placeholder="API key" value={cloudForm.apiKey} onChange={(e) => setCloudForm({ ...cloudForm, apiKey: e.target.value })} required /></label>
            <label><span>API secret</span><input className="form-input" type="password" placeholder="API secret" value={cloudForm.apiSecret} onChange={(e) => setCloudForm({ ...cloudForm, apiSecret: e.target.value })} required /></label>
            <button type="submit" className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.78rem' }}>Connect</button>
          </form>
        </div>
      )}

      {!aiEnabled || lockedReason ? (
        <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>{lockedReason || 'Connect a Text AI provider and a Voice AI provider above first.'}</p>
      ) : (
        <>
          {!fixedCourseId && <CourseSelect courses={courses} value={courseId} onChange={setCourseId} />}
          <input className="form-input mb-2" placeholder="Lesson title (optional — defaults to topic)" value={lessonTitle} onChange={(e) => setLessonTitle(e.target.value)} />
          <input className="form-input mb-2" placeholder="Lesson topic, e.g. The Water Cycle" value={topic} onChange={(e) => setTopic(e.target.value)} />
          <button type="button" className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.78rem' }} onClick={run} disabled={stage !== 'idle' && stage !== 'done' || !topic.trim()}>
            {stage === 'idle' || stage === 'done' ? 'Generate Video Lesson' : progress || 'Working...'}
          </button>

          {scenes && stage !== 'idle' && (
            <p className="text-xs mt-2" style={{ color: 'var(--ink-soft)' }}>{scenes.length} scenes planned.</p>
          )}

          {videoUrl && stage === 'done' && (
            <div className="mt-3">
              <video src={videoUrl} controls style={{ width: '100%', maxWidth: 480, borderRadius: 12 }} />
              <p className="text-xs mt-1" style={{ color: 'var(--emerald)' }}>Saved to the course — students can watch it from My Courses.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Parses the AI's ---SCENE--- delimited output into {title, narration, bullets[]}.
function parseVideoScenes(text) {
  return text.split('---SCENE---').map((block) => block.trim()).filter(Boolean).map((block) => {
    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
    const titleLine = lines.find((l) => l.startsWith('TITLE:'));
    const narrationLine = lines.find((l) => l.startsWith('NARRATION:'));
    const bullets = lines.filter((l) => l.startsWith('-')).map((l) => l.replace(/^-\s*/, ''));
    return {
      title: titleLine ? titleLine.replace('TITLE:', '').trim() : 'Untitled Scene',
      narration: narrationLine ? narrationLine.replace('NARRATION:', '').trim() : '',
      bullets
    };
  }).filter((s) => s.narration);
}

// subjects, experienceYears, bio, qualifications were already accepted by PATCH /teachers/me
// and already rendered in the institution's Teacher Management table — but had no form
// anywhere to actually set them, so that table always showed "—" / "0 yrs".
// Real hiring lifecycle (spec: Teacher<->Institution "offer/acceptance, employment contract,
// resignation, transfer, service history") — pending offers to accept/decline, and a full
// service history including past institutions the teacher can resign from.
function TeacherEmploymentPanel({ onFlash }) {
  const [employments, setEmployments] = useState(null);
  const [busyId, setBusyId] = useState(null);

  function load() { apiRequest('/teacher-employments/mine').then(setEmployments).catch((err) => onFlash(err.message)); }
  useEffect(load, []);

  async function openContract(id) {
    try {
      const result = await apiRequest(`/teacher-employments/${id}/contract-link`);
      window.open(result.url, '_blank', 'noopener,noreferrer');
    } catch (err) { onFlash(err.message); }
  }

  async function respond(id, decision) {
    setBusyId(id);
    try {
      await apiRequest(`/teacher-employments/${id}/respond`, { method: 'PATCH', body: { decision } });
      onFlash(`Offer ${decision}.`, 'success');
      load();
    } catch (err) { onFlash(err.message); } finally { setBusyId(null); }
  }

  async function resignFrom(id) {
    const reason = await showPrompt('You can add a reason for your resignation, or continue without one.', { title: 'Resign from institution', placeholder: 'Reason (optional)', confirmLabel: 'Submit resignation', danger: true });
    if (reason === null) return;
    setBusyId(id);
    try {
      await apiRequest(`/teacher-employments/${id}/resign`, { method: 'POST', body: { reason } });
      onFlash('Resignation recorded.', 'success');
      load();
    } catch (err) { onFlash(err.message); } finally { setBusyId(null); }
  }

  async function requestLeave(id) {
    const from = await showPrompt('Enter leave start date (YYYY-MM-DD).', { title: 'Request leave', required: true });
    if (!from) return;
    const to = await showPrompt('Enter leave end date (YYYY-MM-DD).', { title: 'Request leave', required: true });
    if (!to) return;
    const reason = await showPrompt('Reason for leave.', { title: 'Request leave', required: true });
    if (reason === null) return;
    try { await apiRequest(`/teacher-employments/${id}/manage`, { method: 'PATCH', body: { action: 'request_leave', from, to, reason } }); onFlash('Leave request sent.', 'success'); load(); } catch (err) { onFlash(err.message); }
  }

  const STATUS_TAG = { offered: 'pending', active: 'approved', declined: 'rejected', resigned: 'pending', terminated: 'rejected' };
  const pending = (employments || []).filter((e) => e.status === 'offered');
  const history = (employments || []).filter((e) => e.status !== 'offered');

  return (
    <div className="admin-section" style={{ marginTop: 20 }}>
      <div className="admin-section-heading"><div><h2>Employment</h2><p>Job offers from institutions, and your full service history.</p></div></div>

      {pending.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <strong className="text-sm">Pending Offers</strong>
          {pending.map((e) => (
            <div key={e._id} className="flex items-center justify-between flex-wrap" style={{ gap: 8, padding: '10px 0', borderBottom: '1px solid var(--sand-line)' }}>
              <div>
                <strong className="text-sm">{e.institution?.name}</strong>
                <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>{e.role}{e.designation ? ` — ${e.designation}` : ''}{e.contractTerms ? ` · ${e.contractTerms}` : ''}</p>
                <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 4 }}>
                  Salary: <strong>{e.salaryCurrency || 'PKR'} {Number(e.monthlySalary || 0).toLocaleString()}</strong>
                  {Number(e.taxPercent || 0) > 0 ? ` · Tax ${e.taxPercent}%` : ''}
                </p>
                {e.contractDocumentUrl && <button type="button" className="btn" onClick={() => openContract(e._id)} style={{ display: 'inline-flex', padding: '4px 10px', fontSize: '0.75rem', marginTop: 6 }}>View Contract</button>}
              </div>
              <div className="flex gap-2">
                <button type="button" className="btn btn-primary" style={{ padding: '5px 12px', fontSize: '0.78rem' }} disabled={busyId === e._id} onClick={() => respond(e._id, 'accepted')}>Accept</button>
                <button type="button" className="btn" style={{ padding: '5px 12px', fontSize: '0.78rem' }} disabled={busyId === e._id} onClick={() => respond(e._id, 'declined')}>Decline</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Table
        loading={employments === null}
        headers={['Institution', 'Role', 'Status', 'Started', 'Ended', 'Action']}
        rows={history.map((e) => [
          <strong>{e.institution?.name}</strong>, <span style={{ textTransform: 'capitalize' }}>{String(e.role || '').replace(/_/g, ' ')}</span>, <Tag status={STATUS_TAG[e.status] || 'pending'} label={e.status} />,
          e.startedAt ? <span style={{ whiteSpace: 'nowrap' }}>{new Date(e.startedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span> : '—',
          e.endedAt ? <span>{new Date(e.endedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}{e.endReason ? <small style={{ display: 'block', color: 'var(--ink-soft)' }}>{e.endReason}</small> : null}</span> : '—',
          e.status === 'active'
            ? <div className="flex gap-1"><button type="button" className="btn" style={{ padding: '4px 12px', fontSize: '0.78rem' }} onClick={() => requestLeave(e._id)}>Request Leave</button><button type="button" className="btn staff-remove" style={{ padding: '4px 12px', fontSize: '0.78rem' }} disabled={busyId === e._id} onClick={() => resignFrom(e._id)}>Resign</button></div>
            : '—'
        ])}
        empty="No employment history yet."
      />
    </div>
  );
}

function TeacherProfileDetailsPanel({ user, onFlash, onChanged }) {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  async function handlePhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return onFlash('Please choose an image file.');
    setUploadingPhoto(true);
    try {
      const dataUrl = await resizeImageToDataUrl(file, 320, 0.72, 'profiles');
      await apiRequest('/users/me', { method: 'PATCH', body: { profilePhoto: dataUrl } });
      onFlash('Profile photo updated.', 'success');
      onChanged?.();
    } catch (err) { onFlash(err.message); } finally { setUploadingPhoto(false); }
  }

  function load() {
    apiRequest('/teachers/me').then((p) => {
      setForm({
        subjects: (p.subjects || []).join(', '),
        experienceYears: p.experienceYears || 0,
        bio: p.bio || '',
        independent: !!p.independent,
        visibleToInstitutions: p.visibleToInstitutions !== false,
        categories: p.categories || [], teachingModes: p.teachingModes || [], teachingStyle: p.teachingStyle || '',
        coverPhotoUrl: p.coverPhotoUrl || '', introVideoUrl: p.introVideoUrl || '', publicPortfolio: !!p.publicPortfolio,
        qualifications: p.qualifications && p.qualifications.length > 0 ? p.qualifications : [{ title: '', institutionName: '', year: '' }]
      });
    }).catch((err) => onFlash(err.message));
  }
  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  function updateQualification(i, patch) {
    setForm((f) => ({ ...f, qualifications: f.qualifications.map((q, idx) => (idx === i ? { ...q, ...patch } : q)) }));
  }
  function addQualification() {
    setForm((f) => ({ ...f, qualifications: [...f.qualifications, { title: '', institutionName: '', year: '' }] }));
  }
  function removeQualification(i) {
    setForm((f) => ({ ...f, qualifications: f.qualifications.filter((_, idx) => idx !== i) }));
  }

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await apiRequest('/teachers/me', {
        method: 'PATCH',
        body: {
          subjects: form.subjects.split(',').map((s) => s.trim()).filter(Boolean),
          experienceYears: Number(form.experienceYears) || 0,
          bio: form.bio,
          independent: form.independent,
          visibleToInstitutions: form.visibleToInstitutions,
          categories: form.categories, teachingModes: form.teachingModes, teachingStyle: form.teachingStyle,
          coverPhotoUrl: form.coverPhotoUrl.trim(), introVideoUrl: form.introVideoUrl.trim(), publicPortfolio: form.publicPortfolio,
          qualifications: form.qualifications.filter((q) => q.title.trim())
        }
      });
      onFlash('Teaching profile updated.', 'success');
      onChanged?.();
      load();
      return true;
    } catch (err) { onFlash(err.message); } finally { setSaving(false); }
  }

  if (!form) return <p role="status" className="admin-notice">Loading...</p>;

  return (
    <div className="admin-section admin-account-card teacher-profile-card" style={{ marginTop: 20 }}>
      <div className="admin-section-heading"><div><h2>Teaching Profile</h2><p>Subjects, experience and qualifications shown to institutions considering you as a class teacher.</p></div><FaChalkboardUser aria-hidden="true" /></div>

      <SavedForm value={form} onRestore={setForm} onSubmit={submit} className="teacher-profile-form" style={{ display: 'grid', gap: 16 }}>
      {/* Identity header — a teacher's photo + subjects is exactly what institutions and students
          see of them everywhere else (Find Teachers directory, course "Teacher:" byline), so this
          page — where they actually set that photo and those subjects — should show it too,
          instead of being a bare form with no sense of who's editing it. */}
      <div className="flex items-center" style={{ gap: 16, marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid var(--sand-line)' }}>
        {user?.profilePhoto
          ? <img src={user.profilePhoto} alt="" style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
          : <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--forest)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.6rem', flexShrink: 0 }}>{(user?.fullName || '?')[0]}</div>}
        <div>
          <strong className="text-sm" style={{ display: 'block', fontSize: '1rem' }}>{user?.fullName}</strong>
          {form.subjects && <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 2 }}>{form.subjects}</p>}
          <label className="btn" style={{ padding: '5px 12px', fontSize: '0.72rem', cursor: 'pointer', marginTop: 8, display: 'inline-block' }}>
            {uploadingPhoto ? 'Uploading...' : user?.profilePhoto ? 'Change Photo' : 'Add Photo'}
            <input type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} disabled={uploadingPhoto} />
          </label>
        </div>
      </div>
      {!user?.profilePhoto && (
        <p className="text-xs" style={{ color: 'var(--rose)', marginBottom: 16, fontWeight: 600 }}>
          A profile photo is required — students and institutions see your name without a face until you add one, and you won't appear in the "Find Teachers" directory without it.
        </p>
      )}


        <div className="flex flex-wrap" style={{ gap: 14 }}>
          <label className="text-xs" style={{ color: 'var(--ink-soft)', fontWeight: 600, flex: '2 1 260px', minWidth: 0 }}>Subjects (comma separated)
            <input className="form-input" placeholder="e.g. Math, Physics" value={form.subjects} onChange={(e) => setForm({ ...form, subjects: e.target.value })} style={{ marginTop: 6 }} />
          </label>
          <label className="text-xs" style={{ color: 'var(--ink-soft)', fontWeight: 600, flex: '1 1 140px', minWidth: 0 }}>Years of Experience
            <input type="number" min="0" className="form-input" value={form.experienceYears} onChange={(e) => setForm({ ...form, experienceYears: e.target.value })} style={{ marginTop: 6 }} />
          </label>
        </div>
        <label className="text-xs" style={{ display: 'block', color: 'var(--ink-soft)', fontWeight: 600 }}>Bio
          <textarea className="form-input" rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} style={{ marginTop: 6 }} />
        </label>
        <label className="flex items-center text-xs" style={{ color: 'var(--ink-soft)', gap: 8 }}>
          <input type="checkbox" checked={form.independent} onChange={(e) => setForm({ ...form, independent: e.target.checked })} /> I teach independently (without an institution)
        </label>
        <label className="flex items-center text-xs" style={{ color: 'var(--ink-soft)', gap: 8 }}>
          <input type="checkbox" checked={form.visibleToInstitutions} disabled={!user?.profilePhoto} onChange={(e) => setForm({ ...form, visibleToInstitutions: e.target.checked })} /> Show my profile in the institution "Find Teachers" directory (lets institutions discover and offer you a job){!user?.profilePhoto && ' — add a photo above first'}
        </label>

        <fieldset className="teacher-categories">
          <legend className="text-xs" style={{ fontWeight: 600, color: 'var(--ink-soft)' }}>I am a… (choose all that apply)</legend>
          {TEACHER_CATEGORIES.map(([key, label]) => <label key={key} className="flex items-center text-xs" style={{ gap: 6 }}>
            <input type="checkbox" checked={form.categories.includes(key)} onChange={(e) => setForm({ ...form, categories: e.target.checked ? [...form.categories, key] : form.categories.filter((c) => c !== key) })} /> {label}
          </label>)}
        </fieldset>
        <fieldset className="teacher-categories">
          <legend className="text-xs" style={{ fontWeight: 600, color: 'var(--ink-soft)' }}>I teach</legend>
          {Object.entries(MODE_LABEL).map(([key, label]) => <label key={key} className="flex items-center text-xs" style={{ gap: 6 }}>
            <input type="checkbox" checked={form.teachingModes.includes(key)} onChange={(e) => setForm({ ...form, teachingModes: e.target.checked ? [...form.teachingModes, key] : form.teachingModes.filter((m) => m !== key) })} /> {label}
          </label>)}
        </fieldset>
        <label className="text-xs" style={{ display: 'block', color: 'var(--ink-soft)', fontWeight: 600 }}>Teaching style
          <textarea className="form-input" rows={3} maxLength={1500} placeholder="How you teach: e.g. concept first, then practice; weekly tests; Urdu and English" value={form.teachingStyle} onChange={(e) => setForm({ ...form, teachingStyle: e.target.value })} style={{ marginTop: 6 }} />
        </label>
        <div className="flex flex-wrap" style={{ gap: 12 }}>
          <label className="text-xs" style={{ color: 'var(--ink-soft)', fontWeight: 600, flex: '1 1 260px', minWidth: 0 }}>Cover photo
            <div className="flex" style={{ gap: 8, marginTop: 6 }}>
              <input className="form-input" placeholder="https://… (or upload)" value={form.coverPhotoUrl} onChange={(e) => setForm({ ...form, coverPhotoUrl: e.target.value })} />
              <label className="btn" style={{ padding: '6px 12px', fontSize: '0.72rem', cursor: 'pointer', flexShrink: 0 }}>Upload
                <input type="file" accept="image/*" hidden onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; try { const url = await uploadToPlatformStorage(file, 'teacher-covers'); setForm((f) => ({ ...f, coverPhotoUrl: url })); onFlash('Cover uploaded — save to keep it.', 'success'); } catch (err) { onFlash(err.message); } }} />
              </label>
            </div>
          </label>
          <label className="text-xs" style={{ color: 'var(--ink-soft)', fontWeight: 600, flex: '1 1 260px', minWidth: 0 }}>Intro video link (YouTube, Vimeo or .mp4)
            <input className="form-input" placeholder="https://youtu.be/…" value={form.introVideoUrl} onChange={(e) => setForm({ ...form, introVideoUrl: e.target.value })} style={{ marginTop: 6 }} />
          </label>
        </div>
        <label className="flex items-center text-xs" style={{ color: 'var(--ink-soft)', gap: 8 }}>
          <input type="checkbox" checked={form.publicPortfolio} onChange={(e) => setForm({ ...form, publicPortfolio: e.target.checked })} /> Publish my public teacher portfolio (anyone with the link can see my profile, verified record, courses and reviews)
          {form.publicPortfolio && user?._id && <a href={`/teacher/${user._id}`} target="_blank" rel="noreferrer" style={{ color: 'var(--emerald)' }}>Open my portfolio</a>}
        </label>

        <div style={{ paddingTop: 4, borderTop: '1px solid var(--sand-line)' }}>
          <h4 className="font-semibold text-sm" style={{ margin: '16px 0 12px' }}>Qualifications</h4>
          <div style={{ display: 'grid', gap: 10 }}>
            {form.qualifications.length > 0 && <div className="tp-qual-head" aria-hidden="true"><span>Degree / certificate</span><span>Institution</span><span>Year</span><span /></div>}
            {form.qualifications.map((q, i) => (
              <div key={i} className="tp-qual-row">
                <input className="form-input" placeholder="Title (e.g. M.Sc Mathematics)" value={q.title} onChange={(e) => updateQualification(i, { title: e.target.value })} style={{ flex: '2 1 200px', minWidth: 0, background: 'var(--paper-raised)' }} />
                <input className="form-input" placeholder="Institution" value={q.institutionName} onChange={(e) => updateQualification(i, { institutionName: e.target.value })} style={{ flex: '2 1 180px', minWidth: 0, background: 'var(--paper-raised)' }} />
                <input className="form-input" type="number" placeholder="Year" value={q.year} onChange={(e) => updateQualification(i, { year: e.target.value })} style={{ flex: '1 1 90px', minWidth: 0, background: 'var(--paper-raised)' }} />
                <button type="button" className="btn staff-remove" style={{ padding: '6px 12px', fontSize: '0.72rem', flexShrink: 0 }} onClick={() => removeQualification(i)}>Remove</button>
              </div>
            ))}
          </div>
          <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.75rem', marginTop: 12 }} onClick={addQualification}>+ Add Qualification</button>
        </div>

        <button type="submit" className="btn btn-primary" style={{ padding: '8px 20px', justifySelf: 'start' }} disabled={saving}>{saving ? 'Saving...' : 'Save Teaching Profile'}</button>
      </SavedForm>
      <TeacherStandingCard onFlash={onFlash} />
      <MyTeacherReviews onFlash={onFlash} />
    </div>
  );
}

function TeacherEarningsPanel({ onFlash }) {
  const [payslips, setPayslips] = useState(null);
  const [payoutStatus, setPayoutStatus] = useState(null);
  const [connecting, setConnecting] = useState(false);
  useEffect(() => { apiRequest('/teachers/me/payout-status').then(setPayoutStatus).catch(() => setPayoutStatus(false)); }, []);
  async function connectBank() {
    setConnecting(true);
    try {
      const result = await apiRequest('/teachers/me/payout-onboarding', { method: 'POST' });
      if (!result.url) throw new Error('Bank setup link could not be created.');
      window.location.assign(result.url);
    } catch (err) { onFlash(err.message); setConnecting(false); }
  }
  useEffect(() => { apiRequest('/teachers/me/payslips').then(setPayslips).catch((err) => onFlash(err.message)); }, [onFlash]);
  async function reviewManualSalary(payslip, decision) {
    let rejectionReason = '';
    if (decision === 'reject') {
      rejectionReason = await showPrompt('Why did you reject this payment report?', { title: 'Reject salary payment', required: true });
      if (!rejectionReason) return;
    } else {
      const confirmed = await showConfirm('Confirm only after this salary has actually reached you.', { confirmLabel: 'Money received' });
      if (!confirmed) return;
    }
    try {
      await apiRequest(`/teachers/me/payslips/${payslip._id}/verify-payment`, { method: 'PATCH', body: { decision, rejectionReason } });
      onFlash(decision === 'verify' ? 'Salary receipt confirmed.' : 'Payment report rejected.', 'success');
      setPayslips(await apiRequest('/teachers/me/payslips'));
    } catch (err) { onFlash(err.message); }
  }

  return (
    <div>
      <h3 className="font-semibold mb-2">Salary & Earnings</h3>

      <div className="card" style={{ padding: 14, marginBottom: 16 }}>
        {payoutStatus === null && <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>Checking bank connection...</p>}
        {payoutStatus === false && <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>Real bank transfer isn't available on this platform yet.</p>}
        {payoutStatus && (
          payoutStatus.payoutsEnabled ? (
            <p className="text-xs" style={{ color: 'var(--emerald)', fontWeight: 700 }}>✓ Bank account connected — institutions can send you real transfers via Stripe.</p>
          ) : (
            <>
              <p className="text-xs" style={{ marginBottom: 8 }}>{payoutStatus.connected ? 'Finish connecting your bank account to receive real Stripe transfers.' : 'Connect a bank account so institutions can pay your salary via a real bank transfer instead of just an internal ledger.'}</p>
              <button type="button" className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.78rem' }} disabled={connecting} onClick={connectBank}>{connecting ? 'Redirecting...' : payoutStatus.connected ? 'Finish Bank Setup' : 'Connect Bank Account (Stripe)'}</button>
            </>
          )
        )}
      </div>

      <Table
        loading={payslips === null}
        headers={['Institution', 'Period', 'Basic', 'Bonuses', 'Deductions', 'Net', 'Status', 'Verification']}
        rows={(payslips || []).map((p) => [
          p.institution?.name || '—', `${p.month}/${p.year}`, `${p.currency} ${p.basicSalary}`,
          `${p.currency} ${p.bonuses}`, `${p.currency} ${p.deductions}`, `${p.currency} ${p.netAmount}`,
          <Tag status={p.status === 'paid' ? 'approved' : 'pending'} label={p.status === 'paid' && p.paymentMethod === 'stripe_transfer' ? 'paid (real transfer)' : p.status} />,
          p.status === 'processing' ? <div style={{ display: 'grid', gap: 6 }}><span className="text-xs">{p.paymentMethod} · Ref {p.paymentReference}</span>{p.paymentProofUrl && <a className="btn" href={p.paymentProofUrl} target="_blank" rel="noreferrer">View proof</a>}<div className="flex gap-2"><button className="btn btn-primary" onClick={() => reviewManualSalary(p, 'verify')}>Confirm received</button><button className="btn" onClick={() => reviewManualSalary(p, 'reject')}>Reject</button></div></div> : '—'
        ])}
        empty="No payslips issued to you yet."
      />
    </div>
  );
}

function TeacherEngagementPanel({ onFlash }) {
  const [institution, setInstitution] = useState(null);
  const [section, setSection] = useUrlTab('teacherEngagementPanel', 'questions');
  const [questions, setQuestions] = useState(null);
  const [polls, setPolls] = useState(null);
  const { courses: myCourses } = useTeacherCourses(onFlash);
  const [pollForm, setPollForm] = useState({ course: '', question: '', options: ['', ''] });
  const [submissions, setSubmissions] = useState(null);
  const [expandedSubmission, setExpandedSubmission] = useState(null);
  const [answerDrafts, setAnswerDrafts] = useState({});
  const [liveHistory, setLiveHistory] = useState(null);

  useEffect(() => {
    apiRequest('/teachers/me').then((p) => setInstitution(p.institutions?.[0] || null)).catch((err) => onFlash(err.message));
  }, [onFlash]);

  useEffect(() => {
    if (section === 'liveHistory' && liveHistory === null) {
      apiRequest('/teachers/me/engagement-history').then(setLiveHistory).catch((err) => onFlash(err.message));
    }
  }, [section, liveHistory, onFlash]);

  function loadQuestions(instId) {
    apiRequest(`/anonymous-questions/institution?institutionId=${instId}`).then(setQuestions).catch((err) => onFlash(err.message));
  }
  function loadPolls() {
    apiRequest('/polls/mine').then(setPolls).catch((err) => onFlash(err.message));
  }
  function loadSubmissions(instId) {
    apiRequest(`/magazine/institution?institutionId=${instId}`).then(setSubmissions).catch((err) => onFlash(err.message));
  }
  useEffect(() => {
    if (!institution) return;
    if (section === 'questions') loadQuestions(institution._id);
    if (section === 'polls') loadPolls();
    if (section === 'magazine') loadSubmissions(institution._id);
  }, [institution, section]);

  async function submitAnswer(id) {
    const answer = (answerDrafts[id] || '').trim();
    if (!answer) return onFlash('Write an answer first.');
    try {
      await apiRequest(`/anonymous-questions/${id}/answer`, { method: 'PATCH', body: { answer } });
      onFlash('Answer submitted.', 'success');
      setAnswerDrafts((d) => ({ ...d, [id]: '' }));
      loadQuestions(institution._id);
    } catch (err) { onFlash(err.message); }
  }

  function updateOption(i, value) {
    setPollForm((f) => ({ ...f, options: f.options.map((o, idx) => (idx === i ? value : o)) }));
  }
  async function createPoll(e) {
    e.preventDefault();
    if (!pollForm.course) return onFlash('Pick which class this poll is for.');
    const options = pollForm.options.map((o) => o.trim()).filter(Boolean);
    if (options.length < 2) return onFlash('Add at least 2 options.');
    try {
      await apiRequest('/polls', { method: 'POST', body: { course: pollForm.course, question: pollForm.question, options } });
      onFlash('Poll created.', 'success');
      setPollForm((f) => ({ ...f, question: '', options: ['', ''] }));
      loadPolls();
    } catch (err) { onFlash(err.message); }
  }
  async function closePoll(id) {
    try {
      await apiRequest(`/polls/${id}/close`, { method: 'PATCH' });
      onFlash('Poll closed.', 'success');
      loadPolls();
    } catch (err) { onFlash(err.message); }
  }
  async function reviewSubmission(id, status) {
    let editorNotes;
    if (status === 'changes_requested') {
      editorNotes = await showPrompt('Tell the student exactly what needs to change before you can accept this.', { title: 'Request changes', placeholder: 'e.g. Add a stronger conclusion, fix formatting…', confirmLabel: 'Send request', required: true });
      if (editorNotes === null) return;
    }
    try {
      await apiRequest(`/magazine/${id}/review`, { method: 'PATCH', body: { status, editorNotes } });
      onFlash(`Submission ${status.replace('_', ' ')}.`, 'success');
      loadSubmissions(institution._id);
    } catch (err) { onFlash(err.message); }
  }
  async function editSubmission(submission) {
    const title = await showPrompt('Edit magazine title.', { title: 'Edit submission', initialValue: submission.title, required: true });
    if (title === null) return;
    const content = await showPrompt('Edit magazine content.', { title: 'Edit submission content', initialValue: submission.content, required: true });
    if (content === null) return;
    try { await apiRequest(`/magazine/${submission._id}/edit`, { method: 'PATCH', body: { title, content, type: submission.type } }); onFlash('Magazine content updated.', 'success'); loadSubmissions(institution._id); }
    catch (err) { onFlash(err.message); }
  }

  const totalVotes = (polls || []).reduce((sum, poll) => sum + (poll.options || []).reduce((n, option) => n + Number(option.votes || 0), 0), 0);
  const answeredQuestions = (questions || []).filter((question) => question.status === 'answered').length;
  const engagementEvents = totalVotes + (questions || []).length;
  const energyPercent = Math.min(100, Math.round((Math.min(totalVotes, 20) / 20 * 60) + (Math.min(answeredQuestions, 10) / 10 * 40)));

  if (!institution) return <p className="admin-notice">You're not linked to an institution yet.</p>;

  return (
    <div>
      <h3 className="font-semibold mb-2">Class Engagement</h3>
      <div className="engage-tabs" role="tablist">
        <button type="button" role="tab" aria-selected={section === 'questions'} className={`engage-tab${section === 'questions' ? ' active' : ''}`} onClick={() => setSection('questions')}>Anonymous Questions</button>
        <button type="button" role="tab" aria-selected={section === 'polls'} className={`engage-tab${section === 'polls' ? ' active' : ''}`} onClick={() => setSection('polls')}>Quick Polls</button>
        <button type="button" role="tab" aria-selected={section === 'magazine'} className={`engage-tab${section === 'magazine' ? ' active' : ''}`} onClick={() => setSection('magazine')}>Magazine Submissions</button>
        <button type="button" role="tab" aria-selected={section === 'groups'} className={`engage-tab${section === 'groups' ? ' active' : ''}`} onClick={() => setSection('groups')}>Study Groups</button>
        <button type="button" role="tab" aria-selected={section === 'verify'} className={`engage-tab${section === 'verify' ? ' active' : ''}`} onClick={() => setSection('verify')}>Verify Goals & Achievements</button>
        <button type="button" role="tab" aria-selected={section === 'energy'} className={`engage-tab${section === 'energy' ? ' active' : ''}`} onClick={() => { setSection('energy'); loadQuestions(institution._id); loadPolls(); }}>Class Energy Meter</button>
        <button type="button" role="tab" aria-selected={section === 'liveHistory'} className={`engage-tab${section === 'liveHistory' ? ' active' : ''}`} onClick={() => setSection('liveHistory')}>Live Class History</button>
      </div>

      {section === 'questions' && (
        <div className="engage-list">
          {questions === null && <p className="admin-notice">Loading...</p>}
          {questions?.length === 0 && <p className="admin-notice">No questions yet.</p>}
          {(questions || []).map((q) => (
            <div key={q._id} className="border border-[var(--sand-line)] rounded-xl p-3">
              <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>{q.course?.title || 'General'} · {new Date(q.createdAt).toLocaleDateString()}</p>
              <p className="font-medium" style={{ margin: '4px 0' }}>{q.question}</p>
              {q.status === 'answered' ? (
                <p className="text-sm" style={{ color: 'var(--forest)' }}>Your answer: {q.answer}</p>
              ) : (
                <div className="flex gap-2 mt-2">
                  <input className="form-input" placeholder="Write an answer..." value={answerDrafts[q._id] || ''} onChange={(e) => setAnswerDrafts((d) => ({ ...d, [q._id]: e.target.value }))} />
                  <button className="btn btn-primary" style={{ flexShrink: 0 }} onClick={() => submitAnswer(q._id)}>Answer</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {section === 'polls' && (
        <div>
          <form onSubmit={createPoll} className="nl-form">
            <div className="nl-form-head"><h4>Create a quick poll</h4><p>Students of the chosen class can vote. Close it when you have enough answers.</p></div>
            <label className="institution-field"><span>Class</span><select className="form-select" value={pollForm.course} onChange={(e) => setPollForm({ ...pollForm, course: e.target.value })} required>
              <option value="">Select which class…</option>
              {myCourses.map((c) => <option key={c._id} value={c._id}>{c.title}</option>)}
            </select></label>
            <label className="institution-field"><span>Poll question</span><input className="form-input" placeholder="e.g. Was today's class clear?" value={pollForm.question} onChange={(e) => setPollForm({ ...pollForm, question: e.target.value })} required /></label>
            <div className="institution-field"><span>Answer options</span><div className="poll-options">{pollForm.options.map((o, i) => (
              <label key={i} className="poll-option"><span aria-hidden="true">{i + 1}</span><input className="form-input" aria-label={`Option ${i + 1}`} placeholder={`Option ${i + 1}`} value={o} onChange={(e) => updateOption(i, e.target.value)} /></label>
            ))}</div></div>
            <div className="nl-actions">
              <button type="button" className="btn" onClick={() => setPollForm((f) => ({ ...f, options: [...f.options, ''] }))}>+ Add option</button>
              <button type="submit" className="btn btn-primary">Create Poll</button>
            </div>
          </form>
          <Table
            loading={polls === null}
            headers={['Class', 'Question', 'Votes / %', 'Status', 'Action']}
            rows={(polls || []).map((p) => [
              p.course?.title || 'Institution-wide',
              p.question,
              <div className="poll-results">{p.options.map((o, i) => <div key={i}><span className="poll-results-label"><span>{o.text}</span><strong>{o.votes} · {o.percent}%</strong></span><span className="hostel-bar"><span style={{ width: `${Math.min(100, Number(o.percent) || 0)}%` }} /></span></div>)}</div>,
              <Tag status={p.status === 'closed' ? 'rejected' : 'approved'} label={p.status} />,
              p.status === 'open' ? <button className="btn" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => closePoll(p._id)}>Close</button> : '—'
            ])}
            empty="You haven't created any polls yet."
          />
        </div>
      )}

      {section === 'magazine' && (
        <div>
          {submissions === null && <p className="admin-notice">Loading...</p>}
          {submissions?.length === 0 && <p className="admin-notice">No submissions yet.</p>}
          <div style={{ display: 'grid', gap: 10 }}>
            {(submissions || []).map((s) => {
              const STATUS_TAG = { published: 'approved', rejected: 'rejected', selected: 'approved', changes_requested: 'pending', submitted: 'pending' };
              const open = expandedSubmission === s._id;
              return (
                <div key={s._id} className="border border-[var(--sand-line)] rounded-xl p-3">
                  <div className="flex items-center justify-between flex-wrap" style={{ gap: 8 }}>
                    <div>
                      <strong className="text-sm">{s.title}</strong>
                      <p className="text-xs" style={{ color: 'var(--ink-soft)', margin: '2px 0 0' }}>{s.student?.fullName || '—'} · {s.type}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tag status={STATUS_TAG[s.status]} label={s.status.replace('_', ' ')} />
                      <button type="button" className="btn" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={() => setExpandedSubmission(open ? null : s._id)}>{open ? 'Hide' : 'View'}</button>
                    </div>
                  </div>
                  {open && (
                    <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--sand-line)' }}>
                      {s.imageUrl && <img src={s.imageUrl} alt="" style={{ maxWidth: '100%', maxHeight: 240, borderRadius: 10, marginBottom: 10 }} />}
                      <p className="text-sm" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{s.content}</p>
                      {s.editorNotes && <p className="text-xs" style={{ color: 'var(--gold)', marginTop: 8 }}>Notes: {s.editorNotes}</p>}
                      {s.status !== 'published' && <button type="button" className="btn" style={{ marginTop: 10 }} onClick={() => editSubmission(s)}>Edit Content</button>}
                    </div>
                  )}
                  {s.status === 'submitted' && (
                    <div className="flex gap-1 flex-wrap" style={{ marginTop: 10 }}>
                      <button className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => reviewSubmission(s._id, 'selected')}>Select</button>
                      <button className="btn" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => reviewSubmission(s._id, 'changes_requested')}>Request Changes</button>
                      <button className="btn" style={{ padding: '4px 10px', fontSize: '0.75rem', background: 'var(--sand-line)' }} onClick={() => reviewSubmission(s._id, 'rejected')}>Reject</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {section === 'groups' && <TeacherStudyGroupsSection onFlash={onFlash} myCourses={myCourses} />}
      {section === 'verify' && <TeacherVerificationSection onFlash={onFlash} />}
      {section === 'energy' && <div className="card" style={{ padding: 22 }}><h4 className="font-semibold">Class Energy Meter</h4><p className="text-sm" style={{ color: 'var(--ink-soft)' }}>Participation-based score from real poll votes and answered anonymous questions.</p><div style={{ height: 14, borderRadius: 10, background: 'var(--sand)', overflow: 'hidden', margin: '18px 0 8px' }}><div style={{ width: `${energyPercent}%`, height: '100%', background: 'var(--forest)' }} /></div><strong>{energyPercent}%</strong><p className="text-xs mt-2">{engagementEvents} engagement events · {totalVotes} poll votes · {answeredQuestions} questions answered</p></div>}

      {section === 'liveHistory' && (
        <div>
          <p className="text-xs" style={{ color: 'var(--ink-soft)', marginBottom: 12 }}>Real Class Energy Meter + live-poll results from your own past live classes (AI Teacher → Live Class Control), saved when each class ends.</p>
          {liveHistory === null && <p className="admin-notice">Loading...</p>}
          {liveHistory?.length === 0 && <p className="admin-notice">No live classes with participants yet.</p>}
          <div style={{ display: 'grid', gap: 10 }}>
            {(liveHistory || []).map((r) => (
              <div key={r._id} className="card" style={{ padding: 14 }}>
                <div className="flex items-center justify-between flex-wrap" style={{ gap: 8 }}>
                  <strong className="text-sm">{r.course?.title || 'Class'}</strong>
                  <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>{new Date(r.startedAt).toLocaleString()} → {new Date(r.endedAt).toLocaleTimeString()}</span>
                </div>
                <p className="text-xs" style={{ marginTop: 6 }}>{r.participantCount} student{r.participantCount === 1 ? '' : 's'}{r.averageEnergy != null ? ` · ${r.averageEnergy}% avg attention · ${r.attentiveCount}/${(r.roster || []).length} focused` : ' · Energy Meter not used'}</p>
                {r.poll?.question && (
                  <div className="text-xs" style={{ marginTop: 8, padding: 8, background: 'var(--sand)', borderRadius: 8 }}>
                    <strong>{r.poll.question}</strong>
                    {r.poll.options.map((o, i) => <div key={i}>{o.text}: {o.votes}</div>)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Institution/teacher review queue for a student's self-reported goal completion or manually
// added achievement — nothing here is fabricated; the reviewer sees the evidence link and either
// confirms it or sends it back with notes.
function TeacherVerificationSection({ onFlash }) {
  const [goals, setGoals] = useState(null);
  const [achievements, setAchievements] = useState(null);

  function load() {
    apiRequest('/students/goals/review-queue').then(setGoals).catch((err) => onFlash(err.message));
    apiRequest('/students/achievements/review-queue').then(setAchievements).catch((err) => onFlash(err.message));
  }
  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function reviewGoal(id, approve) {
    const notes = approve ? '' : (await showPrompt('What still needs to happen before this can be verified?', { title: 'Send back', required: true })) || '';
    if (!approve && notes === null) return;
    try { await apiRequest(`/students/goals/${id}/review`, { method: 'PATCH', body: { approve, notes } }); load(); } catch (err) { onFlash(err.message); }
  }
  async function reviewAchievement(id, approve) {
    const notes = approve ? '' : (await showPrompt('What evidence is missing or unclear?', { title: 'Send back', required: true })) || '';
    if (!approve && notes === null) return;
    try { await apiRequest(`/students/achievements/${id}/review`, { method: 'PATCH', body: { approve, notes } }); load(); } catch (err) { onFlash(err.message); }
  }

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <div>
        <strong className="text-xs" style={{ textTransform: 'uppercase', letterSpacing: '.04em', color: 'var(--ink-soft)' }}>Goals awaiting verification</strong>
        {goals?.length === 0 && <p className="admin-notice" style={{ marginTop: 8 }}>Nothing pending.</p>}
        <div style={{ display: 'grid', gap: 8, marginTop: 10 }}>
          {(goals || []).map((g) => (
            <div key={g._id} className="card" style={{ padding: 14 }}>
              <div className="flex items-center justify-between flex-wrap" style={{ gap: 8 }}>
                <div>
                  <strong className="text-sm">{g.title}</strong>
                  <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 2 }}>{g.student?.fullName} · {g.category}</p>
                  {g.evidenceUrl && <a href={g.evidenceUrl} target="_blank" rel="noreferrer" className="text-xs">View evidence</a>}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button type="button" className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={() => reviewGoal(g._id, true)}>Verify</button>
                  <button type="button" className="btn" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={() => reviewGoal(g._id, false)}>Send Back</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <strong className="text-xs" style={{ textTransform: 'uppercase', letterSpacing: '.04em', color: 'var(--ink-soft)' }}>Achievements awaiting verification</strong>
        {achievements?.length === 0 && <p className="admin-notice" style={{ marginTop: 8 }}>Nothing pending.</p>}
        <div style={{ display: 'grid', gap: 8, marginTop: 10 }}>
          {(achievements || []).map((a) => (
            <div key={a._id} className="card" style={{ padding: 14 }}>
              <div className="flex items-center justify-between flex-wrap" style={{ gap: 8 }}>
                <div>
                  <strong className="text-sm">{a.title}</strong>
                  <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 2 }}>{a.student?.fullName} · {a.type}</p>
                  {a.description && <p className="text-xs" style={{ marginTop: 2 }}>{a.description}</p>}
                  {a.evidenceUrl && <a href={a.evidenceUrl} target="_blank" rel="noreferrer" className="text-xs">View evidence</a>}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button type="button" className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={() => reviewAchievement(a._id, true)}>Verify</button>
                  <button type="button" className="btn" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={() => reviewAchievement(a._id, false)}>Send Back</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TeacherStudyGroupsSection({ onFlash, myCourses }) {
  const [courseId, setCourseId] = useState(myCourses[0]?._id || '');
  const [groups, setGroups] = useState(null);
  const [roster, setRoster] = useState([]);
  const [enabled, setEnabled] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [manualForm, setManualForm] = useState({ name: '', memberIds: [] });
  const [aiSize, setAiSize] = useState(4);
  const [detail, setDetail] = useState(null);
  const selectedCourse = myCourses.find((course) => course._id === courseId);

  useEffect(() => { if (!courseId && myCourses[0]) setCourseId(myCourses[0]._id); }, [myCourses]); // eslint-disable-line react-hooks/exhaustive-deps

  function load() {
    if (!courseId) return;
    apiRequest(`/study-groups/teacher/courses/${courseId}`).then(setGroups).catch((err) => onFlash(err.message));
    apiRequest(`/study-groups/teacher/courses/${courseId}/roster`).then(setRoster).catch(() => {});
    const c = myCourses.find((x) => x._id === courseId);
    if (c) setEnabled(c.studyGroupsEnabled !== false);
  }
  useEffect(load, [courseId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function toggleEnabled() {
    try {
      const res = await apiRequest(`/study-groups/teacher/courses/${courseId}/toggle-enabled`, { method: 'PATCH', body: { enabled: !enabled } });
      setEnabled(res.studyGroupsEnabled);
      onFlash(res.studyGroupsEnabled ? 'Study Groups enabled for this class.' : 'Study Groups disabled for this class.', 'success');
    } catch (err) { onFlash(err.message); }
  }
  async function aiGenerate() {
    try {
      const res = await apiRequest('/study-groups/teacher/ai-generate', { method: 'POST', body: { courseId, groupSize: aiSize } });
      onFlash(res.message || 'Groups generated.', 'success');
      load();
    } catch (err) { onFlash(err.message); }
  }
  async function createManual(e) {
    e.preventDefault();
    if (!manualForm.name.trim()) return;
    try {
      await apiRequest('/study-groups/teacher', { method: 'POST', body: { name: manualForm.name, courseId, memberIds: manualForm.memberIds } });
      onFlash('Group created.', 'success');
      setManualForm({ name: '', memberIds: [] });
      setShowCreate(false);
      load();
    } catch (err) { onFlash(err.message); }
  }
  function toggleMember(id) {
    setManualForm((f) => ({ ...f, memberIds: f.memberIds.includes(id) ? f.memberIds.filter((x) => x !== id) : [...f.memberIds, id] }));
  }

  if (detail) return <TeacherStudyGroupDetail groupId={detail} onFlash={onFlash} onBack={() => { setDetail(null); load(); }} />;

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <section className="card" style={{ padding: 20 }}>
        <div className="flex items-start justify-between flex-wrap" style={{ gap: 16 }}>
          <div>
            <strong style={{ fontSize: '1.05rem' }}>Class study groups</strong>
            <p className="text-sm" style={{ color: 'var(--ink-soft)', marginTop: 5 }}>Select a class, create its teams, then open a group to assign the project and review its work.</p>
          </div>
          <span className="badge" style={{ background: enabled ? '#d9f7e8' : '#f3e5dc', color: enabled ? '#086c50' : '#9a412f' }}>{enabled ? 'Study groups enabled' : 'Study groups disabled'}</span>
        </div>
        <label className="text-xs" style={{ display: 'block', fontWeight: 700, marginTop: 18, marginBottom: 6 }}>Course / class</label>
        <select className="form-input" style={{ maxWidth: 520 }} value={courseId} onChange={(e) => setCourseId(e.target.value)} disabled={!myCourses.length}>
          {!myCourses.length && <option value="">No assigned course</option>}
          {myCourses.map((c) => <option key={c._id} value={c._id}>{c.title}</option>)}
        </select>
        <div className="flex items-center justify-between flex-wrap" style={{ gap: 12, marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--sand-line)' }}>
          <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>{enabled ? `Students in ${selectedCourse?.title || 'this class'} can access their assigned group.` : 'Students cannot use study groups for this class until you enable them.'}</p>
          <button type="button" className="btn" onClick={toggleEnabled} disabled={!courseId}>{enabled ? 'Disable for this class' : 'Enable for this class'}</button>
        </div>
      </section>

      <section className="card" style={{ padding: 20, opacity: enabled ? 1 : 0.65 }}>
        <strong style={{ fontSize: '1.05rem' }}>Create groups</strong>
        <p className="text-sm" style={{ color: 'var(--ink-soft)', marginTop: 5 }}>Create one team yourself, or let CareerZ distribute the full class into balanced teams.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12, marginTop: 16 }}>
          <div style={{ border: '1px solid var(--sand-line)', borderRadius: 16, padding: 16 }}>
            <strong className="text-sm">Manual group</strong>
            <p className="text-xs" style={{ color: 'var(--ink-soft)', margin: '5px 0 14px' }}>Choose a group name and select its members yourself.</p>
            <button type="button" className="btn" onClick={() => setShowCreate((s) => !s)} disabled={!enabled || !courseId}>{showCreate ? 'Close manual setup' : 'Create manually'}</button>
          </div>
          <div style={{ border: '1px solid var(--sand-line)', borderRadius: 16, padding: 16 }}>
            <strong className="text-sm">Balanced class groups</strong>
            <p className="text-xs" style={{ color: 'var(--ink-soft)', margin: '5px 0 10px' }}>Create teams from the class roster using student performance balance.</p>
            <label className="text-xs" style={{ display: 'block', fontWeight: 700, marginBottom: 5 }}>Students per group</label>
            <div className="flex items-center flex-wrap" style={{ gap: 8 }}>
              <input type="number" min={2} max={10} className="form-input" style={{ width: 88 }} value={aiSize} onChange={(e) => setAiSize(Number(e.target.value))} />
              <button type="button" className="btn btn-primary" onClick={aiGenerate} disabled={!enabled || !courseId || roster.length < 2}>Create balanced groups</button>
            </div>
          </div>
        </div>
      </section>

      {showCreate && (
        <form onSubmit={createManual} className="card" style={{ padding: 20, display: 'grid', gap: 12 }}>
          <div><strong>New manual group</strong><p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 3 }}>Select at least the students who will begin this group. You can manage members later.</p></div>
          <input className="form-input" style={{ maxWidth: 520 }} placeholder="Group name, e.g. Computing Team A" value={manualForm.name} onChange={(e) => setManualForm({ ...manualForm, name: e.target.value })} />
          <div style={{ maxHeight: 220, overflowY: 'auto', display: 'grid', gap: 6 }}>
            {roster.map((r) => (
              <label key={r.user._id} className="flex items-center text-sm" style={{ gap: 8 }}>
                <input type="checkbox" checked={manualForm.memberIds.includes(r.user._id)} onChange={() => toggleMember(r.user._id)} />
                {r.user.fullName} <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>(score: {r.overallScore || 0}%)</span>
              </label>
            ))}
          </div>
          {!roster.length && <p className="admin-notice">No enrolled students are available in this class.</p>}
          <button type="submit" className="btn btn-primary" style={{ justifySelf: 'start' }} disabled={!manualForm.name.trim() || !manualForm.memberIds.length}>Create group</button>
        </form>
      )}

      <section>
        <div className="flex items-end justify-between flex-wrap" style={{ gap: 8, marginBottom: 10 }}>
          <div><strong style={{ fontSize: '1.05rem' }}>Created groups</strong><p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 3 }}>Open a group to set its project, view contributions and publish marks.</p></div>
          {groups && <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>{groups.length} group{groups.length === 1 ? '' : 's'}</span>}
        </div>
        {groups === null && <p className="admin-notice">Loading groups...</p>}
        {groups?.length === 0 && <p className="admin-notice">No groups yet. Use one of the creation options above.</p>}
        <div style={{ display: 'grid', gap: 10 }}>
        {(groups || []).map((g) => (
          <div key={g._id} className="card hover-card flex items-center justify-between flex-wrap" style={{ padding: 14, gap: 10, cursor: 'pointer' }} onClick={() => setDetail(g._id)}>
            <div>
              <strong className="text-sm">{g.name}{g.aiGenerated && <span className="badge" style={{ marginLeft: 6, fontSize: 10 }}>AI Balanced</span>}</strong>
              <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 2 }}>{g.memberCount}/{g.maxMembers} members · owner: {g.owner?.fullName || '—'}{g.groupMarks != null ? ` · graded: ${g.groupMarks}/100` : ''}</p>
            </div>
            <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.75rem' }} onClick={(e) => { e.stopPropagation(); setDetail(g._id); }}>Open</button>
          </div>
        ))}
        </div>
      </section>
    </div>
  );
}

// Teacher view of a single group: oversight/moderation + project/task assignment + grading —
// reuses the same endpoints as the student StudyGroupDetail, just with teacher-only actions shown.
function TeacherStudyGroupDetail({ groupId, onFlash, onBack }) {
  const [group, setGroup] = useState(null);
  const [projectForm, setProjectForm] = useState({ title: '', instructions: '', deadline: '' });
  const [editingProject, setEditingProject] = useState(false);
  const [marksForm, setMarksForm] = useState({ groupMarks: '', individual: {} });

  function load() {
    apiRequest(`/study-groups/${groupId}`).then((g) => {
      setGroup(g);
      setProjectForm({ title: g.project?.title || '', instructions: g.project?.instructions || '', deadline: g.project?.deadline ? g.project.deadline.slice(0, 10) : '' });
      setMarksForm({ groupMarks: g.groupMarks ?? '', individual: Object.fromEntries((g.individualMarks || []).map((m) => [m.user._id || m.user, m.marks])) });
    }).catch((err) => onFlash(err.message));
  }
  useEffect(load, [groupId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function saveProject(e) {
    e.preventDefault();
    try {
      await apiRequest(`/study-groups/${groupId}/project`, { method: 'PATCH', body: projectForm });
      onFlash('Project saved.', 'success');
      setEditingProject(false);
      setProjectForm({ title: '', instructions: '', deadline: '' });
      load();
    } catch (err) { onFlash(err.message); }
  }
  async function reviewGroupSubmission(action) {
    let feedback = '';
    if (action === 'request_changes') {
      feedback = await showPrompt('Explain exactly what the group needs to correct.', { title: 'Request changes', required: true });
      if (feedback === null) return;
    }
    try {
      const result = await apiRequest(`/study-groups/${groupId}/submission/review`, { method: 'PATCH', body: { action, feedback } });
      onFlash(result?.message || (action === 'approve' ? 'Submission approved.' : 'Changes requested.'), 'success');
      load();
    } catch (err) { onFlash(err.message); }
  }
  async function removeMember(uid) {
    if (!confirm('Remove this member?')) return;
    try { await apiRequest(`/study-groups/${groupId}/members/${uid}/remove`, { method: 'PATCH' }); load(); } catch (err) { onFlash(err.message); }
  }
  async function saveMarks() {
    try {
      await apiRequest(`/study-groups/${groupId}/marks`, {
        method: 'PATCH',
        body: { groupMarks: marksForm.groupMarks === '' ? undefined : Number(marksForm.groupMarks), individualMarks: Object.entries(marksForm.individual).map(([userId, marks]) => ({ userId, marks: Number(marks) })) }
      });
      onFlash('Marks published. This result is now final.', 'success');
      load();
    } catch (err) { onFlash(err.message); }
  }

  if (!group) return <p className="admin-notice">Loading...</p>;
  const marksPublished = Boolean(group.gradingPublishedAt || group.groupMarks != null || group.individualMarks?.length);

  return (
    <div>
      <button type="button" className="btn flex items-center" style={{ padding: '6px 14px', fontSize: '0.75rem', marginBottom: 16, gap: 5 }} onClick={onBack}><FaArrowLeft aria-hidden="true" /> Back to Study Groups</button>
      <h4 className="font-semibold" style={{ marginBottom: 4 }}>{group.name}</h4>
      <p className="text-xs" style={{ color: 'var(--ink-soft)', marginBottom: 16 }}>{group.members.length}/{group.maxMembers} members</p>

      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <strong className="text-xs">Members</strong>
        <div style={{ display: 'grid', gap: 6, marginTop: 8 }}>
          {group.members.map((m) => (
            <div key={m.user._id} className="flex items-center justify-between text-sm">
              <span>{m.user.fullName}{(group.owner?._id || group.owner) === m.user._id && <span className="badge" style={{ marginLeft: 6, fontSize: 10 }}>Owner</span>}</span>
              <button type="button" className="btn" style={{ padding: '3px 10px', fontSize: '0.7rem' }} onClick={() => removeMember(m.user._id)}>Remove</button>
            </div>
          ))}
        </div>
      </div>

      {!editingProject ? <div className="card" style={{ padding: 18, marginBottom: 16 }}>
        <div className="flex items-start justify-between flex-wrap" style={{ gap: 12 }}><div><strong className="text-sm">Project</strong>{group.project?.title ? <><p className="text-sm" style={{ fontWeight: 700, marginTop: 9 }}>{group.project.title}</p><p className="text-sm" style={{ marginTop: 5, whiteSpace: 'pre-wrap' }}>{group.project.instructions}</p>{group.project.deadline && <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 7 }}>Deadline: {new Date(group.project.deadline).toLocaleDateString()}</p>}</> : <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 6 }}>No project has been assigned to this group.</p>}</div><button type="button" className="btn" onClick={() => { setProjectForm({ title: group.project?.title || '', instructions: group.project?.instructions || '', deadline: group.project?.deadline ? group.project.deadline.slice(0, 10) : '' }); setEditingProject(true); }}>{group.project?.title ? 'Edit project' : 'Set project'}</button></div>
      </div> : <form onSubmit={saveProject} className="card" style={{ padding: 16, marginBottom: 16, display: 'grid', gap: 10 }}>
        <strong className="text-xs">{group.project?.title ? 'Edit project' : 'Set project'}</strong>
        <input className="form-input" placeholder="Project title" value={projectForm.title} onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })} required />
        <textarea className="form-input" rows={3} placeholder="Instructions" value={projectForm.instructions} onChange={(e) => setProjectForm({ ...projectForm, instructions: e.target.value })} required />
        <input type="date" className="form-input" style={{ width: 180 }} value={projectForm.deadline} onChange={(e) => setProjectForm({ ...projectForm, deadline: e.target.value })} required />
        <div className="flex flex-wrap" style={{ gap: 8 }}><button type="submit" className="btn btn-primary">Save Project</button><button type="button" className="btn" onClick={() => { setEditingProject(false); setProjectForm({ title: '', instructions: '', deadline: '' }); }}>Cancel</button></div>
      </form>}

      {group.resources?.length > 0 && (
        <div className="card" style={{ padding: 16, marginBottom: 16 }}>
          <strong className="text-xs">Shared Resources</strong>
          <div style={{ display: 'grid', gap: 6, marginTop: 8 }}>
            {group.resources.map((r) => <a key={r._id} href={r.url} target="_blank" rel="noreferrer" className="text-sm">{r.name}</a>)}
          </div>
        </div>
      )}

      {group.submission?.submittedAt && (
        <div className="card" style={{ padding: 18, marginBottom: 16, borderColor: group.submission.status === 'approved' ? 'var(--emerald)' : group.submission.status === 'changes_requested' ? '#c85a45' : 'var(--gold)' }}>
          <div className="flex items-center justify-between flex-wrap" style={{ gap: 10 }}><strong className="text-sm">Final group submission</strong><Tag status={group.submission.status === 'approved' ? 'approved' : 'pending'} label={group.submission.status === 'approved' ? 'Approved' : group.submission.status === 'changes_requested' ? 'Changes requested' : 'Awaiting review'} /></div>
          <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 5 }}>Submitted {new Date(group.submission.submittedAt).toLocaleString()} by {group.submission.submittedBy?.fullName || group.owner?.fullName || 'group owner'}</p>
          <div style={{ marginTop: 12, padding: 12, borderRadius: 12, background: 'var(--sand)' }}><p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{group.submission.text || 'No written response attached.'}</p></div>
          {group.resources?.length > 0 && <div style={{ marginTop: 12 }}><strong className="text-xs">Submitted supporting files</strong><div className="flex flex-wrap" style={{ gap: 7, marginTop: 6 }}>{group.resources.map((r) => <a key={r._id} href={r.url} target="_blank" rel="noreferrer" className="btn" style={{ padding: '6px 10px', fontSize: 12 }}>Open {r.name}</a>)}</div></div>}
          {group.submission.teacherFeedback && <div className="admin-notice" style={{ marginTop: 12 }}><strong>Teacher feedback</strong><p className="text-sm" style={{ marginTop: 4 }}>{group.submission.teacherFeedback}</p></div>}
          {group.submission.status !== 'approved' && group.submission.status !== 'changes_requested' && <div className="flex flex-wrap" style={{ gap: 8, marginTop: 14 }}><button type="button" className="btn btn-primary" onClick={() => reviewGroupSubmission('approve')}>Approve submission</button><button type="button" className="btn" onClick={() => reviewGroupSubmission('request_changes')}>Request changes</button></div>}
        </div>
      )}

      {group.contributions?.length > 0 && (
        <div className="card" style={{ padding: 16, marginBottom: 16 }}>
          <strong className="text-xs">Individual Contribution Notes</strong>
          <div style={{ display: 'grid', gap: 8, marginTop: 8 }}>
            {group.contributions.map((c) => {
              const member = group.members.find((m) => (m.user._id || m.user) === (c.user._id || c.user));
              return <p key={c.user._id || c.user} className="text-sm"><strong>{member?.user?.fullName || 'Member'}:</strong> {c.note}</p>;
            })}
          </div>
        </div>
      )}

      {marksPublished ? <div className="card" style={{ padding: 18, borderColor: 'var(--emerald)', background: 'rgba(16,185,129,.06)' }}>
        <div className="flex items-center justify-between flex-wrap" style={{ gap: 10 }}><div><strong className="text-sm">Marks published</strong><p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 3 }}>This result is final and can no longer be edited.</p></div><Tag status="approved" label="Final" /></div>
        <p className="text-sm" style={{ marginTop: 14 }}>Group marks: <strong>{group.groupMarks}/100</strong></p>
        <div style={{ display: 'grid', gap: 7, marginTop: 10 }}>{group.members.map((member) => { const result = (group.individualMarks || []).find((mark) => String(mark.user?._id || mark.user) === String(member.user._id)); return <div key={member.user._id} className="flex items-center justify-between text-sm"><span>{member.user.fullName}</span><strong>{result?.marks ?? '—'}/100</strong></div>; })}</div>
        {group.gradingPublishedAt && <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 12 }}>Published {new Date(group.gradingPublishedAt).toLocaleString()}{group.gradingPublishedBy?.fullName ? ` by ${group.gradingPublishedBy.fullName}` : ''}</p>}
      </div> : <div className="card" style={{ padding: 16 }}>
        <strong className="text-xs">Grading</strong>
        {group.submission?.status !== 'approved' && <p className="admin-notice" style={{ marginTop: 10 }}>Approve the final group submission before publishing marks.</p>}
        <label className="text-xs" style={{ display: 'block', marginTop: 10 }}>Group marks (/100)
          <input type="number" min={0} max={100} disabled={group.submission?.status !== 'approved'} className="form-input" style={{ width: 100, marginTop: 4 }} value={marksForm.groupMarks} onChange={(e) => setMarksForm({ ...marksForm, groupMarks: e.target.value })} />
        </label>
        <div style={{ display: 'grid', gap: 8, marginTop: 10 }}>
          {group.members.map((m) => (
            <label key={m.user._id} className="flex items-center justify-between text-sm">
              {m.user.fullName}
              <input type="number" min={0} max={100} disabled={group.submission?.status !== 'approved'} className="form-input" style={{ width: 90 }} value={marksForm.individual[m.user._id] ?? ''} onChange={(e) => setMarksForm({ ...marksForm, individual: { ...marksForm.individual, [m.user._id]: e.target.value } })} />
            </label>
          ))}
        </div>
        <button type="button" className="btn btn-primary" disabled={group.submission?.status !== 'approved'} style={{ marginTop: 12 }} onClick={saveMarks}>Publish Marks</button>
      </div>}
    </div>
  );
}

function TeacherExaminationPanel({ onFlash }) {
  const { courses, courseId, setCourseId } = useTeacherCourses(onFlash);
  const [exams, setExams] = useState([]);
  const [form, setForm] = useState({ title: '', type: 'quiz', academicSession: '', term: '', scheduledDate: '', closesAt: '', durationMinutes: 30, passingPercent: 50, venue: '', instructions: '', questions: [], bankQuestionIds: [], shuffleQuestions: false, shuffleOptions: false, questionsPerAttempt: 0, flagThreshold: 3 });
  const [openExam, setOpenExam] = useState(null);
  const [submissions, setSubmissions] = useState([]);

  function loadExams() {
    if (!courseId) return;
    apiRequest(`/courses/${courseId}/exams`).then(setExams).catch((err) => onFlash(err.message));
  }
  useEffect(loadExams, [courseId]); // eslint-disable-line react-hooks/exhaustive-deps
  const selectedCourse = courses.find((course) => course._id === courseId);
  useEffect(() => {
    if (selectedCourse?.classSection?.academicYear) setForm((current) => ({ ...current, academicSession: current.academicSession || selectedCourse.classSection.academicYear }));
  }, [selectedCourse?._id, selectedCourse?.classSection?.academicYear]);

  function addQuestion(type) {
    setForm((f) => ({ ...f, questions: [...f.questions, type === 'mcq' ? { text: '', type: 'mcq', options: ['', ''], correctOption: 0, marks: 1 } : { text: '', type, options: [], marks: type === 'long' ? 10 : 1 }] }));
  }
  function updateQuestion(i, patch) {
    setForm((f) => ({ ...f, questions: f.questions.map((q, idx) => (idx === i ? { ...q, ...patch } : q)) }));
  }
  function removeQuestion(i) {
    setForm((f) => ({ ...f, questions: f.questions.filter((_, idx) => idx !== i) }));
  }

  async function createExam(e) {
    e.preventDefault();
    if (form.questions.length === 0 && form.bankQuestionIds.length === 0) return onFlash('Add at least one question or pick one from the question bank.');
    try {
      await apiRequest(`/courses/${courseId}/exams`, { method: 'POST', body: { ...form, scheduledDate: form.scheduledDate || null, closesAt: form.closesAt || null } });
      onFlash('Exam created (unpublished).', 'success');
      setForm({ title: '', type: 'quiz', academicSession: selectedCourse?.classSection?.academicYear || '', term: '', scheduledDate: '', closesAt: '', durationMinutes: 30, passingPercent: 50, venue: '', instructions: '', questions: [], bankQuestionIds: [], shuffleQuestions: false, shuffleOptions: false, questionsPerAttempt: 0, flagThreshold: 3 });
      loadExams();
    } catch (err) { onFlash(err.message); }
  }

  async function publish(examId) {
    // Publishing tells every enrolled student, so it is confirmed first (audit N-29).
    if (!(await showConfirm('Publish this exam? Enrolled students are notified and can start it from its opening time.', { title: 'Publish exam', confirmLabel: 'Publish' }))) return;
    try { await apiRequest(`/courses/exams/${examId}/publish`, { method: 'PATCH' }); onFlash('Exam published.', 'success'); loadExams(); } catch (err) { onFlash(err.message); }
  }

  // Edit the timing and details of an exam (published or not), or delete one nobody has submitted.
  const [editExam, setEditExam] = useState(null);
  const localInput = (v) => { if (!v) return ''; const d = new Date(v); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16); };
  function startEdit(ex) { setEditExam({ _id: ex._id, title: ex.title || '', scheduledDate: localInput(ex.scheduledDate), closesAt: localInput(ex.closesAt), durationMinutes: ex.durationMinutes ?? 0, venue: ex.venue || '', instructions: ex.instructions || '' }); }
  async function saveEdit(e) {
    e.preventDefault();
    try {
      const { _id, ...body } = editExam;
      await apiRequest(`/courses/exams/${_id}`, { method: 'PATCH', body: { ...body, durationMinutes: Number(body.durationMinutes) || 0, scheduledDate: body.scheduledDate || null, closesAt: body.closesAt || null } });
      onFlash('Exam updated.', 'success'); setEditExam(null); loadExams();
    } catch (err) { onFlash(err.message); }
  }
  async function removeExam(ex) {
    if (!(await showConfirm(`Delete "${ex.title}"? This cannot be undone. An exam students have already submitted cannot be deleted; set a closing time instead.`, { title: 'Delete exam', confirmLabel: 'Delete', danger: true }))) return;
    try { await apiRequest(`/courses/exams/${ex._id}`, { method: 'DELETE' }); onFlash('Exam deleted.', 'success'); if (openExam === ex._id) setOpenExam(null); loadExams(); } catch (err) { onFlash(err.message); }
  }

  function openSubmissions(examId) {
    setOpenExam(examId);
    apiRequest(`/courses/exams/${examId}/submissions`).then(setSubmissions).catch((err) => onFlash(err.message));
  }

  async function gradeShortAnswers(submissionId, marksByIndex, grade) {
    try {
      await apiRequest(`/courses/exam-submissions/${submissionId}/grade`, { method: 'PATCH', body: { manualMarks: Object.entries(marksByIndex).map(([questionIndex, marks]) => ({ questionIndex: Number(questionIndex), marks: Number(marks) })), grade } });
      onFlash('Exam graded.', 'success');
      openSubmissions(openExam);
    } catch (err) { onFlash(err.message); }
  }

  return (
    <div>
      <CourseSelect courses={courses} value={courseId} onChange={setCourseId} />
      {courseId && (
        <>
          <h3 className="font-semibold" style={{ marginBottom: 14 }}>Create an Exam</h3>
          <form onSubmit={createExam} className="card" style={{ padding: 20, marginBottom: 28, display: 'grid', gap: 16 }}>
            <div className="admin-notice exam-context" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12 }}>
              <span><small>Institution</small><br /><strong>{selectedCourse?.institution?.name || 'Independent course'}</strong></span>
              <span><small>Class / Section</small><br /><strong>{selectedCourse?.classSection?.name || 'Not assigned'}</strong></span>
              <span><small>Subject</small><br /><strong>{selectedCourse?.subject || 'Not configured'}</strong></span>
              <span><small>Conducting teacher</small><br /><strong>{selectedCourse?.teacher?.fullName || 'You'}</strong></span>
            </div>
            {selectedCourse?.institution && (!selectedCourse?.classSection || !selectedCourse?.subject) && <div className="u-alert warning"><span className="u-alert-ic">!</span><div className="u-alert-body"><strong>Academic setup incomplete</strong><p>Ask the institution to assign this course to a class/section and subject before publishing an exam.</p></div></div>}
            <div className="exam-form-grid">
              <label className="institution-field exam-span-2"><span>Exam title</span><input className="form-input" placeholder="e.g. Loops quiz" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></label>
              <label className="institution-field"><span>Type</span><select className="form-select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} style={{ textTransform: 'capitalize' }}>
                {['quiz', 'midterm', 'final', 'test'].map((t) => <option key={t} value={t} style={{ textTransform: 'capitalize' }}>{t}</option>)}
              </select></label>
              <label className="institution-field"><span>Duration (minutes)</span><input className="form-input" type="number" min="0" placeholder="e.g. 30" value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })} /></label>
              <label className="institution-field exam-span-2"><span>Scheduled date / time</span><input type="datetime-local" className="form-input" value={form.scheduledDate} onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })} /></label>
              <label className="institution-field exam-span-2"><span>Closes at</span><input type="datetime-local" className="form-input" value={form.closesAt} onChange={(e) => setForm({ ...form, closesAt: e.target.value })} /></label>
              <label className="institution-field"><span>Academic session</span><input className="form-input" placeholder="e.g. 2026-2027" value={form.academicSession} onChange={(e) => setForm({ ...form, academicSession: e.target.value })} required={Boolean(selectedCourse?.institution)} /></label>
              <label className="institution-field"><span>Term / Semester</span><input className="form-input" placeholder="e.g. Semester 1" value={form.term} onChange={(e) => setForm({ ...form, term: e.target.value })} required={Boolean(selectedCourse?.institution)} /></label>
              <label className="institution-field"><span>Passing %</span><input className="form-input" type="number" min="0" max="100" placeholder="e.g. 50" value={form.passingPercent} onChange={(e) => setForm({ ...form, passingPercent: Number(e.target.value) })} /></label>
              <label className="institution-field"><span>Venue</span><input className="form-input" placeholder="Room number or online link" value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} /></label>
              <label className="institution-field exam-span-4"><span>Preparation instructions</span><input className="form-input" placeholder="What students should bring or revise" value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} /></label>
            </div>

            {form.questions.length > 0 && (
              <div style={{ display: 'grid', gap: 10, paddingTop: 4, borderTop: '1px solid var(--sand-line)' }}>
                {form.questions.map((q, i) => (
                  <div key={i} style={{ padding: 14, borderRadius: 14, background: 'var(--sand)' }}>
                    <div className="flex items-start" style={{ gap: 10 }}>
                      <input className="form-input" placeholder={`Question ${i + 1} (${q.type})`} value={q.text} onChange={(e) => updateQuestion(i, { text: e.target.value })} required style={{ flex: '1 1 auto', minWidth: 0, background: 'var(--paper-raised)' }} />
                      <input className="form-input" type="number" placeholder="Marks" value={q.marks} onChange={(e) => updateQuestion(i, { marks: Number(e.target.value) })} style={{ width: 90, flexShrink: 0, background: 'var(--paper-raised)' }} />
                      <button type="button" className="btn" style={{ padding: '6px 12px', fontSize: '0.75rem', flexShrink: 0, background: 'var(--paper-raised)' }} onClick={() => removeQuestion(i)}>Remove</button>
                    </div>
                    {q.type === 'mcq' && (
                      <div style={{ display: 'grid', gap: 8, marginTop: 10 }}>
                        {q.options.map((opt, oi) => (
                          <div key={oi} className="flex items-center" style={{ gap: 10 }}>
                            <input type="radio" name={`correct-${i}`} checked={q.correctOption === oi} onChange={() => updateQuestion(i, { correctOption: oi })} />
                            <input className="form-input" placeholder={`Option ${oi + 1}`} value={opt} onChange={(e) => updateQuestion(i, { options: q.options.map((o, x) => (x === oi ? e.target.value : o)) })} style={{ background: 'var(--paper-raised)' }} />
                          </div>
                        ))}
                        <button type="button" className="btn" style={{ padding: '5px 12px', fontSize: '0.72rem', justifySelf: 'start', background: 'var(--paper-raised)' }} onClick={() => updateQuestion(i, { options: [...q.options, ''] })}>+ Option</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <QuestionBankPicker institutionId={selectedCourse?.institution?._id || selectedCourse?.institution || ''} selectedIds={form.bankQuestionIds} onChange={(ids) => setForm((f) => ({ ...f, bankQuestionIds: ids }))} onFlash={onFlash} />
            <ExamSecurityOptions value={form} onChange={(patch) => setForm((f) => ({ ...f, ...patch }))} questionCount={form.questions.length + form.bankQuestionIds.length} />
            <div className="admin-notice"><strong>Paper summary:</strong> {form.questions.length} question(s) · {form.questions.reduce((sum, question) => sum + (Number(question.marks) || 0), 0)} total marks · Pass at {form.passingPercent}%</div>

            <div className="flex flex-wrap items-center" style={{ gap: 10 }}>
              <button type="button" className="btn" onClick={() => addQuestion('mcq')}>+ MCQ Question</button>
              <button type="button" className="btn" onClick={() => addQuestion('short')}>+ Short Answer Question</button>
              <button type="button" className="btn" onClick={() => addQuestion('long')}>+ Long Answer Question</button>
              <button type="submit" className="btn btn-primary" style={{ marginLeft: 'auto' }}>Create Exam</button>
            </div>
          </form>

          <h3 className="font-semibold" style={{ marginBottom: 14 }}>My Exams</h3>
          {editExam && (
            <form onSubmit={saveEdit} className="card" style={{ padding: 16, marginBottom: 14, display: 'grid', gap: 12 }}>
              <strong>Edit exam</strong>
              <div className="exam-form-grid">
                <label className="institution-field exam-span-2"><span>Exam title</span><input className="form-input" value={editExam.title} onChange={(e) => setEditExam({ ...editExam, title: e.target.value })} required /></label>
                <label className="institution-field"><span>Duration (minutes)</span><input className="form-input" type="number" min="0" value={editExam.durationMinutes} onChange={(e) => setEditExam({ ...editExam, durationMinutes: e.target.value })} /></label>
                <label className="institution-field"><span>Venue</span><input className="form-input" value={editExam.venue} onChange={(e) => setEditExam({ ...editExam, venue: e.target.value })} /></label>
                <label className="institution-field exam-span-2"><span>Opens at</span><input type="datetime-local" className="form-input" value={editExam.scheduledDate} onChange={(e) => setEditExam({ ...editExam, scheduledDate: e.target.value })} /></label>
                <label className="institution-field exam-span-2"><span>Closes at</span><input type="datetime-local" className="form-input" value={editExam.closesAt} onChange={(e) => setEditExam({ ...editExam, closesAt: e.target.value })} /></label>
                <label className="institution-field exam-span-4"><span>Instructions</span><input className="form-input" value={editExam.instructions} onChange={(e) => setEditExam({ ...editExam, instructions: e.target.value })} /></label>
              </div>
              <div className="flex" style={{ gap: 8 }}><button type="submit" className="btn btn-primary">Save changes</button><button type="button" className="btn" onClick={() => setEditExam(null)}>Cancel</button></div>
            </form>
          )}
          <Table
            headers={['Title', 'Subject / Class', 'Session / Term', 'Type', 'Scheduled', 'Closes', 'Paper', 'Status', 'Action']}
            rows={exams.map((ex) => [
              <strong>{fixText(ex.title)}</strong>, <span className="exam-cell"><strong>{ex.subject || selectedCourse?.subject || '—'}</strong><small>{ex.classSection?.name || selectedCourse?.classSection?.name || 'No section'}</small></span>, <span className="exam-cell"><span>{ex.academicSession || '—'}</span><small>{ex.term || '—'}</small></span>, <span className="exam-type">{ex.type}</span>, ex.scheduledDate ? <span style={{ whiteSpace: 'nowrap' }}>{shortWhen(ex.scheduledDate)}</span> : '—', ex.closesAt ? <span style={{ whiteSpace: 'nowrap' }}>{shortWhen(ex.closesAt)}</span> : '—', <span className="exam-cell"><span style={{ whiteSpace: 'nowrap' }}>{ex.questionCount ?? ex.questions.length} questions</span><small>{ex.totalMarks ?? 'varies'} marks</small></span>, ex.published ? <Tag status="approved" /> : <Tag status="pending" />,
              <div className="flex" style={{ gap: 8 }}>
                {!ex.published && <button className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.78rem' }} onClick={() => publish(ex._id)}>Publish</button>}
                <button className="btn" style={{ padding: '6px 14px', fontSize: '0.78rem' }} onClick={() => openSubmissions(ex._id)}>Submissions</button>
                <button className="btn" style={{ padding: '6px 14px', fontSize: '0.78rem' }} onClick={() => startEdit(ex)}>Edit</button>
                <button className="btn" style={{ padding: '6px 14px', fontSize: '0.78rem' }} onClick={() => removeExam(ex)}>Delete</button>
              </div>
            ])}
            empty="No exams created yet."
          />

          {openExam && <ExamSubmissionsView exam={exams.find((e) => e._id === openExam)} submissions={submissions} onGrade={gradeShortAnswers} />}
        </>
      )}
    </div>
  );
}

function ExamSubmissionsView({ exam, submissions, onGrade }) {
  const [drafts, setDrafts] = useState({});
  const [gradeDrafts, setGradeDrafts] = useState({});

  return (
    <div style={{ marginTop: 32 }}>
      <h3 className="font-semibold" style={{ marginBottom: 14 }}>Submissions{exam ? ` — ${exam.title}` : ''}</h3>
      {submissions.length === 0 && (
        <div className="student-empty-state" style={{ border: '1px solid var(--sand-line)', borderRadius: 18 }}>
          <FaFileLines aria-hidden="true" />
          <p>No submissions yet</p>
        </div>
      )}
      {submissions.map((s) => {
        const reviewAnswers = [...s.answers].sort((a, b) => a.questionIndex - b.questionIndex);
        const totalMarks = reviewAnswers.reduce((sum, answer) => sum + (Number(exam?.questions?.[answer.questionIndex]?.marks) || 0), 0);
        // MCQs arrive already checked; their mark is the starting value and the teacher can still change it.
        const isMcq = (answer) => exam?.questions?.[answer.questionIndex]?.type === 'mcq';
        const draftOf = (answer) => drafts[`${s._id}-${answer.questionIndex}`] ?? (isMcq(answer) ? answer.marksAwarded : undefined);
        const obtainedMarks = s.status === 'graded' ? Number(s.score) || 0 : reviewAnswers.reduce((sum, answer) => sum + (Number(draftOf(answer)) || 0), 0);
        const percentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0;
        const needsFinalGrade = s.status !== 'graded' || !s.finalGrade;
        const allMarksEntered = s.status === 'graded' || reviewAnswers.every((answer) => draftOf(answer) !== undefined && draftOf(answer) !== '');
        return (
          <div key={s._id} className="card" style={{ padding: 18, marginBottom: 14 }}>
            <div className="flex items-center justify-between">
              <strong>{s.student?.fullName}</strong><StudentGuardians studentId={s.student?._id}/>
              <span className="text-sm">{s.status === 'graded' ? `Final score: ${s.score}/${totalMarks || '—'}` : 'Teacher review pending'} · <Tag status={s.status === 'graded' ? 'approved' : 'pending'} label={s.status === 'graded' ? 'graded' : 'pending'} /></span>
            </div>
            <p className="text-sm" style={{ color: 'var(--ink-soft)', marginTop: 8 }}>MCQs are checked automatically against the answer key. Enter marks for the short and long answers; you can still change an MCQ mark.</p>
            <p style={{ marginTop: 6 }}><IntegrityBadge submission={s} /></p>
            <div className="admin-notice" style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginTop: 14 }}>
              <span><small>Obtained marks</small><br /><strong>{obtainedMarks}/{totalMarks}</strong></span>
              <span><small>Percentage</small><br /><strong>{percentage.toFixed(2)}%</strong></span>
              <span><small>Final grade</small><br /><strong>{s.finalGrade || 'Not selected yet'}</strong></span>
            </div>
            {s.status === 'graded' && !s.finalGrade && <div className="u-alert warning" style={{ marginTop: 12 }}><span className="u-alert-ic">!</span><div className="u-alert-body"><strong>Final grade is missing</strong><p>This result came from the previous grading flow. Select the final grade below to complete and update the result.</p></div></div>}
            {reviewAnswers.map((a) => {
              const question = exam?.questions?.[a.questionIndex];
              if (!question) return null;
              const selectedOption = question.type === 'mcq' && Number.isInteger(a.selectedOption) ? question.options?.[a.selectedOption] : null;
              const correctOption = question.type === 'mcq' ? question.options?.[question.correctOption] : null;
              return (
              <div key={a.questionIndex} className="mt-2 text-sm" style={{ padding: 14, border: '1px solid var(--sand-line)', borderRadius: 14 }}>
                <p><strong>Q{a.questionIndex + 1} · {question.type === 'mcq' ? 'MCQ' : question.type === 'long' ? 'Long answer' : 'Short answer'}:</strong> {question.text}</p>
                {question.type === 'mcq' ? <div style={{ marginTop: 8 }}><p><strong>Student selected:</strong> {selectedOption || 'No option selected'}</p><p style={{ color: 'var(--ink-soft)' }}><strong>Answer key:</strong> {correctOption || 'Not configured'}</p></div> : <p className="text-[var(--ink-soft)]" style={{ marginTop: 8 }}>{a.textAnswer || '(no answer)'}</p>}
                <label className="text-xs" style={{ display: 'block', marginTop: 10, fontWeight: 700 }}>Marks awarded (maximum {question.marks}){question.type === 'mcq' ? ' · checked automatically' : ''}</label>
                <input
                  className="form-input" type="number" min="0" max={question.marks} placeholder={`0–${question.marks}`} style={{ maxWidth: 160, marginTop: 5 }}
                  value={s.status === 'graded' ? a.marksAwarded : (draftOf(a) ?? '')}
                  onChange={(e) => setDrafts({ ...drafts, [`${s._id}-${a.questionIndex}`]: e.target.value })}
                  disabled={s.status === 'graded'}
                />
              </div>
            );})}
            {reviewAnswers.length > 0 && needsFinalGrade && (
              <div className="flex flex-wrap items-end mt-2" style={{ gap: 12 }}>
                <label className="text-xs" style={{ fontWeight: 700 }}>Teacher-selected final grade
                  <select className="form-select" value={gradeDrafts[s._id] || ''} onChange={(e) => setGradeDrafts({ ...gradeDrafts, [s._id]: e.target.value })} style={{ marginTop: 5, minWidth: 180 }}>
                    <option value="">Select grade</option>
                    {['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'D', 'Pass', 'Fail'].map((grade) => <option key={grade} value={grade}>{grade}</option>)}
                  </select>
                </label>
                <button
                  type="button" className="btn btn-primary" style={{ padding: '10px 16px', fontSize: '0.78rem' }} disabled={!allMarksEntered || !gradeDrafts[s._id]}
                  onClick={() => onGrade(s._id, Object.fromEntries(reviewAnswers.map((a) => [a.questionIndex, drafts[`${s._id}-${a.questionIndex}`] ?? a.marksAwarded])), gradeDrafts[s._id])}
                >
                  Complete Review &amp; Publish Result
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function useTeacherCourses(onFlash) {
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState('');
  useEffect(() => {
    apiRequest('/courses/mine/list')
      .then((list) => { setCourses(list); if (list[0]) setCourseId(list[0]._id); })
      .catch((err) => onFlash(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return { courses, courseId, setCourseId };
}

function CourseSelect({ courses, value, onChange }) {
  if (courses.length === 0) {
    return (
      <div className="student-empty-state" style={{ border: '1px solid var(--sand-line)', borderRadius: 18, minHeight: 160 }}>
        <FaBookOpen aria-hidden="true" />
        <p>Create a course first</p>
        <span>Go to My Courses — students, attendance, homework and results are all recorded against a course.</span>
      </div>
    );
  }
  return (
    <label style={{ display: 'inline-block', marginBottom: 18 }}>
      <span className="text-xs" style={{ display: 'block', color: 'var(--ink-soft)', fontWeight: 600, marginBottom: 6 }}>Course</span>
      <CustomSelect value={value} onChange={onChange} ariaLabel="Select course" options={courses.map((c) => ({ value: c._id, label: c.title }))} />
    </label>
  );
}

const COMPLETION_STATUS_TAG = { in_progress: 'pending', pending_approval: 'pending', completed: 'approved' };

function TeacherStudentsPanel({ onFlash }) {
  const { courses, courseId, setCourseId } = useTeacherCourses(onFlash);
  const [enrollments, setEnrollments] = useState([]);
  const [profileView, setProfileView] = useState(null);
  const [timeline, setTimeline] = useState(null);
  function load() {
    if (!courseId) return;
    apiRequest(`/courses/${courseId}/students`).then(setEnrollments).catch((err) => onFlash(err.message));
  }
  useEffect(load, [courseId, onFlash]);

  function openProfile(e) {
    setProfileView(e);
    setTimeline(null);
    apiRequest(`/teachers/students/${e.student._id}/timeline`).then(setTimeline).catch(() => setTimeline(false));
  }

  async function approve(studentId) {
    try {
      await apiRequest(`/courses/${courseId}/students/${studentId}/approve-completion`, { method: 'PATCH' });
      onFlash('Completion approved.', 'success');
      load();
    } catch (err) { onFlash(err.message); }
  }

  return (
    <div>
      <CourseSelect courses={courses} value={courseId} onChange={setCourseId} />
      {courseId && (
        <Table
          headers={['Name', 'Email', 'Lesson Progress', 'Overall Score', 'Completion', 'Action']}
          rows={enrollments.map((e) => [
            <div>{e.student?.fullName}<StudentGuardians studentId={e.student?._id}/></div>, e.student?.email, `${e.progressPercent}%`, `${e.overallScore || 0}%`,
            <Tag status={COMPLETION_STATUS_TAG[e.completionStatus] || 'pending'} label={COMPLETION_STATUS_LABEL[e.completionStatus] || e.completionStatus} />,
            <div className="flex gap-2"><button type="button" className="btn" style={{ padding: '4px 12px', fontSize: '0.72rem' }} onClick={() => openProfile(e)}>Academic Profile</button>{e.completionStatus === 'pending_approval' && <button type="button" className="btn btn-primary" style={{ padding: '4px 12px', fontSize: '0.72rem' }} onClick={() => approve(e.student?._id)}>Approve</button>}</div>
          ])}
          empty="No students enrolled in this course yet."
        />
      )}
      {profileView && (
        <div className="card" style={{ padding: 18, marginTop: 16 }}>
          <div className="flex justify-between items-center"><h4 className="font-semibold">{profileView.student?.fullName} — Academic Profile</h4><button type="button" className="btn" onClick={() => setProfileView(null)}>Close</button></div>
          <StudentGuardians studentId={profileView.student?._id}/><div className="grid grid-cols-2 gap-3 mt-3"><p>Email: <strong>{profileView.student?.email}</strong></p><p>Course: <strong>{courses.find((course) => course._id === courseId)?.title}</strong></p><p>Lesson progress: <strong>{profileView.progressPercent}%</strong></p><p>Overall score: <strong>{profileView.overallScore || 0}%</strong></p><p>Completion: <strong>{COMPLETION_STATUS_LABEL[profileView.completionStatus] || profileView.completionStatus}</strong></p><p>Enrolled: <strong>{profileView.createdAt ? new Date(profileView.createdAt).toLocaleDateString() : '—'}</strong></p></div>

          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--sand-line)' }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--ink-soft)', marginBottom: 10 }}>Consolidated Timeline (all classes you teach this student)</p>
            {timeline === null && <p className="admin-notice">Loading...</p>}
            {timeline === false && <p className="admin-notice">Couldn't load the consolidated timeline.</p>}
            {timeline && (
              <>
                <div className="flex flex-wrap gap-3" style={{ marginBottom: 12 }}>
                  <span className="text-xs">Attendance: <strong>{timeline.attendance.percent != null ? `${timeline.attendance.percent}%` : 'No records'}</strong></span>
                  <span className="text-xs">Classes: <strong>{timeline.courses.map((c) => c.course?.title).join(', ')}</strong></span>
                </div>
                {timeline.timeline.length === 0 ? <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>No results/assignments/certificates recorded yet.</p> : (
                  <div style={{ display: 'grid', gap: 6 }}>
                    {timeline.timeline.map((t, i) => (
                      <div key={i} className="flex items-center justify-between text-xs" style={{ padding: '6px 0', borderBottom: '1px solid var(--sand-line)' }}>
                        <span><strong>{t.type}:</strong> {t.title}{t.desc ? ` (${t.desc})` : ''}</span>
                        <span style={{ color: 'var(--ink-soft)' }}>{new Date(t.date).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
      <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 8 }}>Lesson Progress = material gone through. Overall Score = lessons + assignments + tests + attendance combined, per this course's Completion Rules (Manage Lessons).</p>
      <IndependentTutoringPanel onFlash={onFlash} courses={courses} />
    </div>
  );
}

// Real, consent-gated Independent Teacher Enrollment (spec) — a teacher can never force-add a
// student; every relationship here started as an invitation the student (or their guardian, if a
// minor) actually accepted. Only shown to independent teachers (Profile -> Teacher Profile ->
// "Teaches independently").
function IndependentTutoringPanel({ onFlash, courses }) {
  const [links, setLinks] = useState(null);
  const [form, setForm] = useState({ studentEmail: '', courseId: '', subject: '', feeAmount: '', feeCurrency: 'PKR' });

  function load() { apiRequest('/teacher-students/mine').then(setLinks).catch(() => setLinks([])); }
  useEffect(load, []);

  async function invite(e) {
    e.preventDefault();
    try {
      await apiRequest('/teacher-students/invite', { method: 'POST', body: { studentEmail: form.studentEmail.trim(), courseId: form.courseId, subject: form.subject, feeAmount: form.feeAmount ? Number(form.feeAmount) : undefined, feeCurrency: form.feeCurrency } });
      onFlash('Invitation sent — the student (or their guardian, if a minor) must accept it.', 'success');
      setForm({ studentEmail: '', courseId: '', subject: '', feeAmount: '', feeCurrency: form.feeCurrency });
      load();
    } catch (err) { onFlash(err.message); }
  }
  async function setStatus(id, status) {
    try { await apiRequest(`/teacher-students/${id}/status`, { method: 'PATCH', body: { status } }); onFlash(`Relationship ${status}.`, 'success'); load(); } catch (err) { onFlash(err.message); }
  }

  const independentCourses = (courses || []).filter((c) => !c.institution);
  const STATUS_TAG = { invited: 'pending', consent_pending: 'pending', active: 'approved', paused: 'pending', completed: 'approved', removed: 'rejected' };

  return (
    <div className="admin-section" style={{ marginTop: 20 }}>
      <div className="admin-section-heading"><div><h2>Independent Tutoring</h2><p>Invite a specific student to a course you teach independently — nothing happens until they (or their guardian, if a minor) accept.</p></div></div>
      <form onSubmit={invite} className="tutor-invite-form">
        <label className="institution-field"><span>Student's email</span><input className="form-input" type="email" placeholder="student@example.com" required value={form.studentEmail} onChange={(e) => setForm({ ...form, studentEmail: e.target.value })} /></label>
        <label className="institution-field"><span>Course</span><select className="form-select" required value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })}>
          <option value="">Select independent course</option>
          {independentCourses.map((c) => <option key={c._id} value={c._id}>{c.title}</option>)}
        </select></label>
        <label className="institution-field"><span>Subject (optional)</span><input className="form-input" placeholder="e.g. Physics" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></label>
        <div className="institution-field"><span>Fee (optional)</span><div className="tutor-fee"><input className="form-input" type="number" placeholder="0" aria-label="Fee amount" value={form.feeAmount} onChange={(e) => setForm({ ...form, feeAmount: e.target.value })} /><select className="form-select" aria-label="Fee currency" value={form.feeCurrency} onChange={(e) => setForm({ ...form, feeCurrency: e.target.value })}>{['PKR', 'USD', 'GBP', 'EUR', 'AED', 'SAR'].map((cur) => <option key={cur}>{cur}</option>)}</select></div></div>
        <button type="submit" className="btn btn-primary">Send Invitation</button>
      </form>
      {independentCourses.length === 0 && <p className="text-xs" style={{ color: 'var(--ink-soft)', marginBottom: 12 }}>Create a course with no institution attached (My Courses) first — institution and independent-teacher records stay separate.</p>}
      <Table
        loading={links === null}
        headers={['Student', 'Course', 'Status', 'Fee', 'Action']}
        rows={(links || []).map((l) => [
          <div>{l.student?.fullName || l.student?.email}<StudentGuardians studentId={l.student?._id}/></div>, l.course?.title,
          <Tag status={STATUS_TAG[l.status] || 'pending'} label={l.status} />,
          !l.feeAmount ? <span className="text-xs">No fee</span> : l.feePaidAt
            ? <span className="text-xs"><strong style={{ color: 'var(--emerald)' }}>✓ {l.feeCurrency} {l.feeAmount} paid</strong><br />by {l.feePaidBy?.fullName || 'student'}{l.feePaidByRole ? ` (${l.feePaidByRole})` : ''} · {new Date(l.feePaidAt).toLocaleDateString()}</span>
            : <span className="text-xs" style={{ color: 'var(--gold)' }}>{l.feeCurrency} {l.feeAmount} unpaid</span>,
          l.status === 'active' ? <button className="btn" style={{ padding: '4px 12px', fontSize: '0.75rem' }} onClick={() => setStatus(l._id, 'paused')}>Pause</button>
            : l.status === 'paused' ? <div className="flex gap-2"><button className="btn" style={{ padding: '4px 12px', fontSize: '0.75rem' }} onClick={() => setStatus(l._id, 'active')}>Resume</button><button className="btn" style={{ padding: '4px 12px', fontSize: '0.75rem' }} onClick={() => setStatus(l._id, 'completed')}>Complete</button></div>
            : '—'
        ])}
        empty="No independent students yet."
      />
    </div>
  );
}

// Real self-check-in (spec 9.9/15D.9) — one per calendar day, "late" computed against this
// teacher's own first scheduled class today. Not biometric/GPS (no device access from a web
// app) — an honest, DB-backed timestamp instead.
function TeacherSelfAttendancePanel({ onFlash }) {
  const [history, setHistory] = useState(null);
  const [checkingIn, setCheckingIn] = useState(false);

  function load() {
    apiRequest('/teachers/me/self-attendance').then(setHistory).catch((err) => onFlash(err.message));
  }
  useEffect(load, []);

  const todayKey = new Date().toISOString().slice(0, 10);
  const checkedInToday = (history || []).some((h) => new Date(h.date).toISOString().slice(0, 10) === todayKey);

  async function checkIn() {
    setCheckingIn(true);
    try {
      const record = await apiRequest('/teachers/me/self-attendance/check-in', { method: 'POST' });
      onFlash(record.status === 'late' ? 'Checked in — marked late.' : 'Checked in.', record.status === 'late' ? 'error' : 'success');
      load();
    } catch (err) { onFlash(err.message); } finally { setCheckingIn(false); }
  }

  if (history === null) return <p role="status" className="admin-notice">Loading...</p>;

  return (
    <div>
      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        {checkedInToday ? (
          <p className="text-sm flex items-center" style={{ color: 'var(--emerald)', gap: 5 }}><FaCheck aria-hidden="true" /> You've checked in today.</p>
        ) : (
          <button type="button" className="btn btn-primary" onClick={checkIn} disabled={checkingIn}>
            {checkingIn ? 'Checking in...' : 'Check In for Today'}
          </button>
        )}
      </div>
      <h3 className="font-semibold" style={{ marginBottom: 14 }}>My Attendance History</h3>
      <Table
        headers={['Date', 'Checked In At', 'Status']}
        rows={history.map((h) => [
          new Date(h.date).toLocaleDateString(),
          new Date(h.checkInAt).toLocaleTimeString(),
          <Tag status={h.status === 'present' ? 'approved' : 'pending'} label={h.status === 'present' ? 'Present' : 'Late'} />
        ])}
        empty="No check-ins yet."
      />
    </div>
  );
}

// Real camera-based QR attendance (spec 15B.9/9.9) — scans a student's existing Digital Student
// ID QR code (student.controller.js's idCardCode) and marks them present via a real backend call.
// Session-based QR attendance (spec: "session/time-based QR mechanism" — prevents an old QR
// being reused). The teacher generates ONE short-lived QR for the whole class, shown on screen;
// each student scans it with their own device to check themselves in. The QR encodes only a
// random one-time token — never a student's permanent Digital ID — and expires in a few minutes.
// The attendance section under a running live class: who is in the class right now, plus the same
// QR and face check-in the Student Attendance page uses. Ending the class saves the attendance.
function LiveClassAttendance({ session, onFlash }) {
  const courseId = session.course?._id || session.course;
  const [students, setStudents] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [marks, setMarks] = useState({});
  const [mode, setMode] = useState('');
  async function mark(studentId, status) {
    const next = { ...marks, [studentId]: status };
    if (!status) delete next[studentId];
    setMarks(next);
    try {
      await apiRequest(`/live-classes/${session._id}/physical-attendance`, { method: 'PATCH', body: { records: Object.entries(next).map(([student, value]) => ({ student, status: value })) } });
      onFlash('Attendance saved for this class.', 'success');
    } catch (err) { setMarks(marks); onFlash(err.message); }
  }
  const now = new Date();
  const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  useEffect(() => {
    apiRequest(`/live-classes/${session._id}/roster`).then((r) => { setStudents(r.students || []); setMarks(Object.fromEntries((r.records || []).map((x) => [String(x.student), x.status]))); }).catch((err) => { setStudents([]); onFlash(err.message); });
    const refresh = () => apiRequest('/live-classes/teacher/mine').then((list) => setParticipants(list.find((s) => s._id === session._id)?.participants || [])).catch(() => {});
    refresh();
    const timer = setInterval(refresh, 10000);
    return () => clearInterval(timer);
  }, [session._id, onFlash]);
  const stateOf = (studentId) => {
    const p = participants.find((x) => String(x.student?._id || x.student) === String(studentId));
    if (!p) return { label: 'Not joined', status: 'pending' };
    if (p.leftAt) return { label: 'Left the class', status: 'pending' };
    return { label: p.attendanceStatus === 'late' ? 'In class (late)' : 'In class', status: 'approved' };
  };
  return (
    <div className="card live-attendance">
      <h3 className="font-semibold mb-2">Attendance</h3>
      <p className="text-xs mb-3" style={{ color: 'var(--ink-soft)' }}>Saved automatically when you end this class: students who joined are Present (Late if they joined more than 15 minutes after the start), and the rest are Absent. A student who checks in with QR or face also counts as Present.</p>
      {students === null ? <p role="status" className="text-xs">Loading...</p> : students.length === 0 ? <p className="admin-notice">No students are enrolled in this course.</p> : (
        <div style={{ display: 'grid', gap: 8, marginBottom: 14 }}>
          {students.filter(Boolean).map((s) => { const st = stateOf(s._id); return <div key={s._id} className="flex items-center justify-between flex-wrap" style={{ gap: 8, padding: '8px 12px', borderRadius: 10, background: 'var(--sand)' }}><span className="text-sm">{s.fullName}</span><span className="flex items-center flex-wrap" style={{ gap: 8 }}><Tag status={st.status} label={st.label} />{mode === 'manual' && <select className="form-select" aria-label={`Attendance for ${s.fullName}`} style={{ width: 'auto', padding: '4px 30px 4px 10px', height: 34 }} value={marks[s._id] || ''} onChange={(e) => mark(s._id, e.target.value)}><option value="">Automatic</option><option value="present">Present</option><option value="late">Late</option><option value="absent">Absent</option><option value="excused">Excused</option></select>}</span></div>; })}
        </div>
      )}
      <div className="flex gap-2 mb-3 flex-wrap">
        <button type="button" className={mode === 'manual' ? 'btn btn-primary' : 'btn'} style={{ padding: '6px 16px', fontSize: '0.8rem' }} onClick={() => setMode(mode === 'manual' ? '' : 'manual')}>Manual</button>
        <button type="button" className={mode === 'qr' ? 'btn btn-primary' : 'btn'} style={{ padding: '6px 16px', fontSize: '0.8rem' }} onClick={() => setMode(mode === 'qr' ? '' : 'qr')}><FaQrcode aria-hidden="true" /> QR Session</button>
        <button type="button" className={mode === 'face' ? 'btn btn-primary' : 'btn'} style={{ padding: '6px 16px', fontSize: '0.8rem' }} onClick={() => setMode(mode === 'face' ? '' : 'face')}><FaFaceSmile aria-hidden="true" /> Face Scan</button>
        <button type="button" className={mode === 'gps' ? 'btn btn-primary' : 'btn'} style={{ padding: '6px 16px', fontSize: '0.8rem' }} onClick={() => setMode(mode === 'gps' ? '' : 'gps')}><FaLocationDot aria-hidden="true" /> GPS</button>
      </div>
      {mode === 'qr' && <TeacherQrAttendancePanel courseId={courseId} date={date} onFlash={onFlash} />}
      {mode === 'face' && <TeacherFaceAttendancePanel courseId={courseId} date={date} onFlash={onFlash} />}
      {mode === 'gps' && <TeacherGpsAttendancePanel courseId={courseId} onFlash={onFlash} />}
    </div>
  );
}

function TeacherQrAttendancePanel({ courseId, date, onFlash }) {
  const [session, setSession] = useState(null);
  const [minutesValid, setMinutesValid] = useState(10);
  const [live, setLive] = useState(null);

  async function startSession() {
    try {
      const res = await apiRequest('/teachers/me/attendance/qr-session', { method: 'POST', body: { course: courseId, date, minutesValid: Number(minutesValid) } });
      setSession(res);
      onFlash('QR session started — display this on screen for students to scan.', 'success');
    } catch (err) { onFlash(err.message); }
  }

  useEffect(() => {
    if (!session?.sessionId) return;
    const poll = setInterval(() => {
      apiRequest(`/teachers/me/attendance/qr-session/${session.sessionId}`).then(setLive).catch(() => {});
    }, 3000);
    return () => clearInterval(poll);
  }, [session]);

  const expired = session && new Date(session.expiresAt) < new Date();

  return (
    <div className="card" style={{ padding: 20, marginBottom: 28 }}>
      {!session ? (
        <div className="flex items-end gap-3 flex-wrap">
          <label className="text-xs" style={{ color: 'var(--ink-soft)', fontWeight: 600 }}>Valid for (minutes)
            <input type="number" min="1" max="60" className="form-input" value={minutesValid} onChange={(e) => setMinutesValid(e.target.value)} style={{ marginTop: 6, maxWidth: 100 }} />
          </label>
          <button type="button" className="btn btn-primary" onClick={startSession}>Start QR Session</button>
        </div>
      ) : (
        <div style={{ textAlign: 'center' }}>
          {expired ? (
            <p className="admin-notice">This session has expired.</p>
          ) : (
            <img src={session.qrDataUrl} alt="Attendance session QR code" style={{ width: 260, height: 260, margin: '0 auto', borderRadius: 12, border: '1px solid var(--sand-line)' }} />
          )}
          <p className="text-xs mt-2" style={{ color: 'var(--ink-soft)' }}>Expires {new Date(session.expiresAt).toLocaleTimeString()} — students scan this with their own device camera.</p>
          {!expired && <div className="admin-notice mt-2"><strong>Same device / online class:</strong> share code <strong style={{ fontSize: '1.1rem', letterSpacing: 2 }}>{session.sessionCode}</strong><button type="button" className="btn ml-2" style={{ padding: '3px 9px', fontSize: '0.7rem' }} onClick={() => navigator.clipboard?.writeText(session.sessionCode)}>Copy Code</button></div>}
          <button type="button" className="btn mt-3" onClick={() => { setSession(null); setLive(null); }}>{expired ? 'New Session' : 'End / Start New'}</button>
          <h4 className="font-semibold mt-5 mb-2" style={{ fontSize: '0.85rem' }}>Checked in ({live?.checkedIn?.length || 0})</h4>
          {!live || live.checkedIn.length === 0 ? (
            <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>No students checked in yet.</p>
          ) : (
            <ul className="text-sm space-y-1" style={{ textAlign: 'left' }}>
              {live.checkedIn.map((name, i) => <li key={i} className="flex items-center" style={{ gap: 5 }}><FaCheck aria-hidden="true" /> {name}</li>)}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

// GPS attendance is optional (needs the student's browser location permission) and configured
// once per course — the teacher's own current location becomes the "allowed" center point.
function TeacherGpsAttendancePanel({ courseId, onFlash }) {
  const [config, setConfig] = useState(null);
  const [radius, setRadius] = useState(150);
  const [locating, setLocating] = useState(false);

  function enable() {
    if (!navigator.geolocation) return onFlash('Geolocation is not supported on this device/browser.');
    setLocating(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const res = await apiRequest(`/teachers/me/courses/${courseId}/attendance-location`, {
          method: 'PATCH',
          body: { enabled: true, lat: pos.coords.latitude, lng: pos.coords.longitude, radiusMeters: Number(radius) }
        });
        setConfig(res);
        onFlash('GPS attendance enabled — students must be within range to check in.', 'success');
      } catch (err) { onFlash(err.message); } finally { setLocating(false); }
    }, () => { onFlash("Couldn't get your location — check your browser's location permission."); setLocating(false); });
  }

  async function disable() {
    try {
      const res = await apiRequest(`/teachers/me/courses/${courseId}/attendance-location`, { method: 'PATCH', body: { enabled: false } });
      setConfig(res);
      onFlash('GPS attendance disabled.', 'success');
    } catch (err) { onFlash(err.message); }
  }

  return (
    <div className="card" style={{ padding: 20, marginBottom: 28 }}>
      <p className="text-xs mb-3" style={{ color: 'var(--ink-soft)' }}>Optional — sets your current location as the allowed check-in area. Students must grant location permission and be within range to mark themselves present.</p>
      {config?.enabled ? (
        <div>
          <p className="text-sm flex items-center" style={{ gap: 5 }}><FaCircleCheck aria-hidden="true" style={{ color: 'var(--emerald)' }} /> Enabled — radius {config.radiusMeters}m from where you enabled this.</p>
          <button type="button" className="btn mt-2" onClick={disable}>Disable GPS Attendance</button>
        </div>
      ) : (
        <div className="flex items-end gap-3 flex-wrap">
          <label className="text-xs" style={{ color: 'var(--ink-soft)', fontWeight: 600 }}>Radius (meters)
            <input type="number" min="10" className="form-input" value={radius} onChange={(e) => setRadius(e.target.value)} style={{ marginTop: 6, maxWidth: 120 }} />
          </label>
          <button type="button" className="btn btn-primary" onClick={enable} disabled={locating}>{locating ? 'Getting location...' : 'Enable at My Current Location'}</button>
        </div>
      )}
    </div>
  );
}

// Real client-side face-recognition attendance (spec 15B.9/9.9) — matches live camera frames
// against descriptors students enrolled themselves (StudentDigitalIdPanel). All matching runs in
// this browser tab; the server only ever receives the final "this studentId matched" result.
function TeacherFaceAttendancePanel({ courseId, date, onFlash }) {
  const videoRef = useRef(null);
  const [enrolled, setEnrolled] = useState(null);
  const [ready, setReady] = useState(false);
  const [scans, setScans] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [verifying, setVerifying] = useState(false);
  const cancelledRef = useRef(false);
  const faceApiRef = useRef(null);
  const [remoteRequests, setRemoteRequests] = useState([]);
  const [remoteBusyId, setRemoteBusyId] = useState(null);

  useEffect(() => {
    apiRequest(`/courses/${courseId}/face-descriptors`).then(setEnrolled).catch((err) => onFlash(err.message));
  }, [courseId, onFlash]);

  function loadRemoteRequests() {
    apiRequest(`/teachers/me/attendance/face-requests?course=${courseId}&date=${date}`).then(setRemoteRequests).catch(() => setRemoteRequests([]));
  }
  useEffect(loadRemoteRequests, [courseId, date]); // eslint-disable-line react-hooks/exhaustive-deps

  async function reviewRemoteRequest(id, decision) {
    setRemoteBusyId(id);
    try {
      await apiRequest(`/teachers/me/attendance/face-requests/${id}`, { method: 'PATCH', body: { decision } });
      onFlash(`Request ${decision}.`, 'success');
      loadRemoteRequests();
    } catch (err) { onFlash(err.message); } finally { setRemoteBusyId(null); }
  }

  async function markPresent(studentId, fullName) {
    const result = await apiRequest('/teachers/me/attendance/face-scan', { method: 'POST', body: { studentId, course: courseId, date } });
    setScans((prev) => [{ ...result, at: new Date() }, ...prev]);
    return result;
  }

  useEffect(() => {
    if (!enrolled || enrolled.length === 0) return;
    cancelledRef.current = false;
    let stream = null;

    async function start() {
      const { loadFaceModels, faceapi } = await import('../../utils/faceApi');
      await loadFaceModels();
      faceApiRef.current = faceapi;
      if (cancelledRef.current) return;

      stream = await navigator.mediaDevices.getUserMedia({ video: {} });
      if (cancelledRef.current) { stream.getTracks().forEach((t) => t.stop()); return; }
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setReady(true);
    }

    start().catch((err) => onFlash(err.message));
    return () => {
      cancelledRef.current = true;
      stream?.getTracks().forEach((t) => t.stop());
      setReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enrolled]);

  async function verifySelectedStudent() {
    const student = enrolled.find((entry) => String(entry.studentId) === String(selectedId));
    if (!student) return onFlash('Select a student first.');
    if (!ready || !faceApiRef.current) return onFlash('Camera and face models are still loading.');
    setVerifying(true);
    try {
      const faceapi = faceApiRef.current;
      const detection = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();
      if (!detection) throw new Error('No face detected. Ask the selected student to face the camera in good lighting.');
      const distance = faceapi.euclideanDistance(detection.descriptor, new Float32Array(student.descriptor));
      if (distance > 0.55) throw new Error(`Live face does not match ${student.fullName}. Try again with better lighting.`);
      await markPresent(student.studentId, student.fullName);
      onFlash(`${student.fullName} verified from live camera and marked present.`, 'success');
    } catch (err) { onFlash(err.message); } finally { setVerifying(false); }
  }

  if (enrolled === null) return <p role="status" className="admin-notice">Loading...</p>;
  if (enrolled.length === 0) {
    return <p className="admin-notice">No students in this course have enrolled their face yet — they can do this from their Digital Student ID page.</p>;
  }

  return (
    <div className="card" style={{ padding: 20, marginBottom: 28 }}>
      <p className="text-xs mb-3" style={{ color: 'var(--ink-soft)' }}>Select the student's saved photo, place that student in front of the live camera, then verify. Attendance is marked only after the live face matches the selected student's enrolled face.</p>
      <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 18 }}>
        <div>
          <h4 className="font-semibold mb-2" style={{ fontSize: '0.85rem' }}>1. Select student</h4>
          <div className="flex flex-wrap" style={{ gap: 10 }}>
            {enrolled.map((student) => {
              const selected = String(selectedId) === String(student.studentId);
              return <button key={student.studentId} type="button" onClick={() => setSelectedId(student.studentId)} style={{ width: 112, padding: 8, borderRadius: 12, border: selected ? '2px solid var(--emerald)' : '1px solid var(--sand-line)', background: selected ? 'var(--sand)' : '#fff', textAlign: 'center' }}>
                {student.profilePhoto ? <img src={student.profilePhoto} alt={student.fullName} style={{ width: 72, height: 72, borderRadius: 10, objectFit: 'cover', margin: '0 auto 6px' }} /> : <div style={{ width: 72, height: 72, borderRadius: 10, margin: '0 auto 6px', background: 'var(--sand)', display: 'grid', placeItems: 'center', fontSize: 24, fontWeight: 700 }}>{student.fullName?.[0]}</div>}
                <span className="text-xs" style={{ fontWeight: 700 }}>{student.fullName}</span><StudentGuardians studentId={student.studentId}/>
              </button>;
            })}
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-2" style={{ fontSize: '0.85rem' }}>2. Verify live face</h4>
          <div style={{ position: 'relative', maxWidth: 420 }}>
            <video ref={videoRef} playsInline muted style={{ width: '100%', borderRadius: 14, background: '#000' }} />
            {!ready && <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 6 }}>Loading face models and starting camera...</p>}
          </div>
          <button type="button" className="btn btn-primary mt-2" disabled={!selectedId || !ready || verifying} onClick={verifySelectedStudent}>{verifying ? 'Verifying...' : 'Verify Selected Student & Mark Present'}</button>
        </div>
      </div>
      <p className="text-xs" style={{ color: 'var(--ink-soft)', margin: '8px 0' }}>{enrolled.length} student{enrolled.length > 1 ? 's' : ''} enrolled for face attendance in this course.</p>
      <h4 className="font-semibold mt-2 mb-2" style={{ fontSize: '0.85rem' }}>Scanned this session</h4>
      {scans.length === 0 ? (
        <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>No students matched yet.</p>
      ) : (
        <ul className="text-sm space-y-1">
          {scans.map((s, i) => (
            <li key={i} className="flex items-center" style={{ gap: 5 }}>{s.alreadyMarked ? <FaArrowRotateLeft aria-hidden="true" /> : <FaCheck aria-hidden="true" />} {s.studentName} — {s.at.toLocaleTimeString()}{s.alreadyMarked ? ' (already marked)' : ''}</li>
          ))}
        </ul>
      )}

      <h4 className="font-semibold mt-4 mb-2" style={{ fontSize: '0.85rem' }}>Remote check-in requests</h4>
      <p className="text-xs mb-2" style={{ color: 'var(--ink-soft)' }}>Students not physically here verified their own live face against their enrolled face — review before it counts as attendance.</p>
      {remoteRequests.length === 0 ? (
        <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>No pending remote requests for this date.</p>
      ) : (
        <div style={{ display: 'grid', gap: 8 }}>
          {remoteRequests.map((r) => (
            <div key={r._id} className="flex items-center justify-between flex-wrap" style={{ gap: 8, padding: '8px 12px', borderRadius: 10, background: 'var(--sand)' }}>
              <span className="text-sm">
                <strong>{r.student?.fullName}</strong><StudentGuardians studentId={r.student?._id}/>{' '}
                <span style={{ color: r.distance <= 0.55 ? 'var(--emerald)' : 'var(--rose)', fontWeight: 600 }}>
                  {r.distance <= 0.55 ? 'Strong match' : 'Weak match'} (distance {r.distance.toFixed(2)})
                </span>
              </span>
              <div className="flex gap-2">
                <button type="button" className="btn btn-primary" style={{ padding: '4px 12px', fontSize: '0.78rem' }} disabled={remoteBusyId === r._id} onClick={() => reviewRemoteRequest(r._id, 'approved')}>Approve</button>
                <button type="button" className="btn" style={{ padding: '4px 12px', fontSize: '0.78rem' }} disabled={remoteBusyId === r._id} onClick={() => reviewRemoteRequest(r._id, 'rejected')}>Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TeacherAttendancePanel({ onFlash }) {
  const { courses, courseId, setCourseId } = useTeacherCourses(onFlash);
  const [enrollments, setEnrollments] = useState([]);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [statuses, setStatuses] = useState({});
  const [reasons, setReasons] = useState({});
  const [history, setHistory] = useState([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [mode, setMode] = useState('manual');

  useEffect(() => {
    if (!courseId) return;
    apiRequest(`/courses/${courseId}/students`).then((list) => {
      setEnrollments(list);
      setStatuses(Object.fromEntries(list.map((e) => [e.student._id, 'present'])));
      setReasons({});
    }).catch((err) => onFlash(err.message));
  }, [courseId, onFlash]);

  function loadHistory() {
    apiRequest('/teachers/me/attendance').then(rows=>{setHistory(rows);setHistoryLoaded(true);}).catch((err) => onFlash(err.message));
  }
  useEffect(loadHistory, []);

  const savedSheet=history.find(h=>String(h.course?._id||h.course)===String(courseId)&&new Date(h.date).toISOString().slice(0,10)===date);
  useEffect(()=>{const records=savedSheet?.records||[];setStatuses(Object.fromEntries(enrollments.map(en=>[en.student._id,records.find(r=>String(r.student?._id||r.student)===String(en.student._id))?.status||'present'])));setReasons(Object.fromEntries(records.map(r=>[String(r.student?._id||r.student),r.reason||''])));},[history,courseId,date,enrollments]);
  async function submit(e) {
    e.preventDefault();
    const records = enrollments.map((en) => ({
      student: en.student._id,
      status: statuses[en.student._id] || 'present',
      reason: reasons[en.student._id] || ''
    }));
    try {
      await apiRequest('/teachers/me/attendance', { method: 'POST', body: { course: courseId, date, records } });
      onFlash('Attendance recorded.', 'success');
      loadHistory(); return true;
    } catch (err) { onFlash(err.message); }
  }

  return (
    <div>
      <CourseSelect courses={courses} value={courseId} onChange={setCourseId} />
      {courseId && (
        <div className="flex gap-2 mb-4">
          <button type="button" className={mode === 'manual' ? 'btn btn-primary' : 'btn'} style={{ padding: '6px 16px', fontSize: '0.8rem' }} onClick={() => setMode('manual')}>Manual</button>
          <button type="button" className={mode === 'qr' ? 'btn btn-primary' : 'btn'} style={{ padding: '6px 16px', fontSize: '0.8rem' }} onClick={() => setMode('qr')}><FaQrcode aria-hidden="true" /> QR Session</button>
          <button type="button" className={mode === 'face' ? 'btn btn-primary' : 'btn'} style={{ padding: '6px 16px', fontSize: '0.8rem' }} onClick={() => setMode('face')}><FaFaceSmile aria-hidden="true" /> Face Scan</button>
          <button type="button" className={mode === 'gps' ? 'btn btn-primary' : 'btn'} style={{ padding: '6px 16px', fontSize: '0.8rem' }} onClick={() => setMode('gps')}><FaLocationDot aria-hidden="true" /> GPS</button>
        </div>
      )}
      {courseId && (mode === 'qr' || mode === 'face') && (
        <label className="text-xs" style={{ color: 'var(--ink-soft)', fontWeight: 600, display: 'block', marginBottom: 10 }}>Date
          <input type="date" className="form-input" value={date} onChange={(e) => setDate(e.target.value)} style={{ marginTop: 6, maxWidth: 200 }} />
        </label>
      )}
      {courseId && mode === 'qr' && <TeacherQrAttendancePanel courseId={courseId} date={date} onFlash={onFlash} />}
      {courseId && mode === 'face' && <TeacherFaceAttendancePanel courseId={courseId} date={date} onFlash={onFlash} />}
      {courseId && mode === 'gps' && <TeacherGpsAttendancePanel courseId={courseId} onFlash={onFlash} />}
      {courseId && mode === 'manual' && historyLoaded && enrollments.length > 0 && (
        <SavedForm key={courseId+date+Boolean(savedSheet)} saved={Boolean(savedSheet)} value={{date,statuses,reasons}} onRestore={v=>{setDate(v.date);setStatuses(v.statuses);setReasons(v.reasons);}} onSubmit={submit} className="card" style={{ padding: 20, marginBottom: 28 }}>
          <div className="flex items-end flex-wrap" style={{ gap: 14, marginBottom: 18 }}>
            <label className="text-xs" style={{ color: 'var(--ink-soft)', fontWeight: 600 }}>Date
              <input type="date" className="form-input" value={date} onChange={(e) => setDate(e.target.value)} style={{ marginTop: 6 }} />
            </label>
            <button type="submit" className="btn btn-primary" style={{ padding: '11px 20px', height: 46 }}>Save Attendance</button>
          </div>
          <div className="account-table-wrap overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left border-b border-[var(--sand-line)]"><th className="py-2 pr-4">Student</th><th className="py-2 pr-4">Status</th><th className="py-2 pr-4">Reason (if absent/late)</th></tr></thead>
              <tbody>
                {enrollments.map((en) => {
                  const status = statuses[en.student._id] || 'present';
                  return (
                    <tr key={en.student._id} className="border-b border-[var(--sand-line)] last:border-0">
                      <td className="py-2 pr-4">{en.student.fullName}<StudentGuardians studentId={en.student._id}/></td>
                      <td className="py-2 pr-4">
                        <select className="form-select" value={status} onChange={(e) => setStatuses({ ...statuses, [en.student._id]: e.target.value })}>
                          {['present', 'absent', 'late', 'excused', 'half_day'].map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="py-2 pr-4">
                        {status !== 'present' && (
                          <input className="form-input" placeholder="Reason (optional)" value={reasons[en.student._id] || ''} onChange={(e) => setReasons({ ...reasons, [en.student._id]: e.target.value })} />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </SavedForm>
      )}
      <h3 className="font-semibold" style={{ marginBottom: 14 }}>Attendance History</h3>
      <Table headers={['Date', 'Marked']} rows={history.map((h) => [new Date(h.date).toLocaleDateString(), `${h.records.length} students`])} empty="No attendance recorded yet." />
    </div>
  );
}

// Plagiarism check (spec 9.10): which written answers in this assignment share long runs of wording.
function SimilarityCheck({ assignmentId, onFlash }) {
  const [result, setResult] = useState(null), [busy, setBusy] = useState(false);
  useEffect(() => { setResult(null); }, [assignmentId]);
  async function run() { setBusy(true); try { setResult(await apiRequest(`/courses/assignments/${assignmentId}/similarity`)); } catch (err) { onFlash(err.message); } finally { setBusy(false); } }
  return <div className="similarity-check">
    <button type="button" className="btn" disabled={busy} onClick={run}>{busy ? 'Checking…' : 'Check for copying'}</button>
    {result && <div className="admin-notice" style={{ marginTop: 8 }}>
      <p className="text-xs">{result.scope} Checked {result.checked} answer{result.checked === 1 ? '' : 's'}{result.skippedShort ? `; ${result.skippedShort} too short to compare` : ''}.</p>
      {result.pairs.length === 0 ? <p><strong>No matching answers found.</strong></p>
        : <ul style={{ margin: '6px 0 0', paddingLeft: 18 }}>{result.pairs.map((p, i) => <li key={i}><strong>{p.a.student}</strong> and <strong>{p.b.student}</strong>: {p.similarityPercent}% the same wording <Tag status={p.level === 'high' ? 'rejected' : 'pending'} label={p.level} /></li>)}</ul>}
      {result.pairs.length > 0 && <p className="text-xs" style={{ marginTop: 6 }}>A match is a reason to look closer, not proof of copying. Read both answers before deciding.</p>}
    </div>}
  </div>;
}

function TeacherHomeworkPanel({ onFlash }) {
  const { courses, courseId, setCourseId } = useTeacherCourses(onFlash);
  const [assignments, setAssignments] = useState([]);
  const [form, setForm] = useState({ title: '', type: 'assignment', description: '', dueDate: '', maxMarks: 100, submissionMode: 'either', allowLate: false, rubricText: '' });
  const [attachment, setAttachment] = useState(null);
  const [openAssignment, setOpenAssignment] = useState(null);
  const [submissions, setSubmissions] = useState(null);

  function loadAssignments() {
    if (!courseId) return;
    apiRequest(`/courses/${courseId}/assignments`).then(setAssignments).catch((err) => onFlash(err.message));
  }
  useEffect(loadAssignments, [courseId]);

  async function create(e) {
    e.preventDefault();
    try {
      const attachments = [];
      if (attachment) {
        if (!(await isPlatformUploadAvailable())) throw new Error('File storage is not configured.');
        attachments.push({ name: attachment.name, url: await uploadToPlatformStorage(attachment, 'assignment-materials') });
      }
      const rubric = form.rubricText.split('\n').map((line) => { const [criterion, marks] = line.split('|'); return { criterion: criterion?.trim(), maxMarks: Number(marks) }; }).filter((row) => row.criterion && row.maxMarks > 0);
      await apiRequest(`/courses/${courseId}/assignments`, { method: 'POST', body: { ...form, rubricText: undefined, rubric, attachments, maxMarks: Number(form.maxMarks) || 100 } });
      onFlash('Assignment created.', 'success');
      setForm({ title: '', type: 'assignment', description: '', dueDate: '', maxMarks: 100, submissionMode: 'either', allowLate: false, rubricText: '' }); setAttachment(null);
      loadAssignments();
    } catch (err) { onFlash(err.message); }
  }

  function openSubmissions(assignmentId) {
    setOpenAssignment(assignmentId);
    setSubmissions(null);
    apiRequest(`/courses/assignments/${assignmentId}/submissions`).then((rows) => {
      setSubmissions(rows);
      setAssignments((current) => current.map((assignment) => assignment._id === assignmentId ? { ...assignment, submissionCount: rows.length, gradedCount: rows.filter((row) => row.status === 'graded').length } : assignment));
    }).catch((err) => { onFlash(err.message); setSubmissions([]); });
  }

  async function grade(submissionId, marksObtained, feedback) {
    try {
      await apiRequest(`/courses/submissions/${submissionId}/grade`, { method: 'PATCH', body: { marksObtained: Number(marksObtained), feedback } });
      onFlash('Submission graded.', 'success');
      openSubmissions(openAssignment);
    } catch (err) { onFlash(err.message); }
  }

  async function requestResubmit(submissionId) {
    const feedback = await showPrompt('Tell the student exactly what must be corrected before submitting again.', { title: 'Request resubmission', placeholder: 'Revision instructions', confirmLabel: 'Send request', required: true });
    if (feedback === null) return;
    try { await apiRequest(`/courses/submissions/${submissionId}/resubmit`, { method: 'PATCH', body: { feedback } }); onFlash('Resubmission requested.', 'success'); openSubmissions(openAssignment); }
    catch (err) { onFlash(err.message); }
  }

  async function deleteAssignment(assignment) {
    if (!await showConfirm(`Delete “${assignment.title}” and all of its submissions? This action cannot be undone.`, { title: 'Delete assignment', confirmLabel: 'Delete assignment', danger: true })) return;
    try {
      await apiRequest(`/courses/assignments/${assignment._id}`, { method: 'DELETE' });
      if (openAssignment === assignment._id) { setOpenAssignment(null); setSubmissions(null); }
      onFlash('Assignment deleted.', 'success');
      loadAssignments();
    } catch (err) { onFlash(err.message); }
  }

  return (
    <div>
      <CourseSelect courses={courses} value={courseId} onChange={setCourseId} />
      {courseId && (
        <>
          <form onSubmit={create} className="assign-form">
            <div className="nl-form-head"><h4>New assignment</h4><p>Students of this course see it in their Assignments & Tests.</p></div>
            <div className="assign-grid">
              <label className="institution-field assign-wide"><span>Title</span><input className="form-input" placeholder="e.g. Loops practice" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></label>
              <label className="institution-field"><span>Type</span><select className="form-select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>{['homework', 'assignment', 'project', 'worksheet', 'practical'].map((type) => <option key={type} value={type}>{type[0].toUpperCase() + type.slice(1)}</option>)}</select></label>
              <label className="institution-field" htmlFor="assignment-submission-mode"><span>Student submission method</span>
                <select id="assignment-submission-mode" className="form-select" value={form.submissionMode} onChange={(e) => setForm({ ...form, submissionMode: e.target.value })}>
                  <option value="either">Student chooses: write online or upload file</option>
                  <option value="text">Online written answer only</option>
                  <option value="file">Handwritten scan / file upload only</option>
                  <option value="both">Online answer and file both required</option>
                </select></label>
              <label className="institution-field assign-wide"><span>Description</span><input className="form-input" placeholder="What students should do" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
              <label className="institution-field"><span>Due date</span><input className="form-input" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} /></label>
              {!['homework', 'worksheet'].includes(form.type) && <label className="institution-field"><span>Total marks</span><input className="form-input" type="number" placeholder="Total marks" value={form.maxMarks} onChange={(e) => setForm({ ...form, maxMarks: e.target.value })} /></label>}
              <div className="institution-field assign-wide">{!['homework', 'worksheet'].includes(form.type) && <span>Rubric (one per line: Criterion | marks)</span>}
                {!['homework', 'worksheet'].includes(form.type) ? <textarea className="form-input" rows={3} placeholder={'Rubric (one per line): Criterion | marks'} value={form.rubricText} onChange={(e) => setForm({ ...form, rubricText: e.target.value })} /> : <p className="admin-notice text-xs">Homework and worksheets are completion-based. Review the work and give feedback; marks are used for assignments, projects, practicals and examinations.</p>}
              </div>
              <div className="institution-field assign-wide"><span>Attachment (optional)</span>
                <label className="bld-photo"><span aria-hidden="true">+</span><span>{attachment ? attachment.name : 'Attach a file for students'}</span><input type="file" onChange={(e) => setAttachment(e.target.files?.[0] || null)} /></label>
              </div>
            </div>
            <label className="job-form-check"><input type="checkbox" checked={form.allowLate} onChange={(e) => setForm({ ...form, allowLate: e.target.checked })} /> Allow submissions after deadline</label>
            <div className="nl-form-foot"><button type="submit" className="btn btn-primary">Create Assignment</button></div>
          </form>
          <Table
            headers={['Title', 'Due', 'Assessment', 'Received', 'Reviewed / Graded', 'Action']}
            rows={assignments.map((a) => { const usesMarks = !['homework', 'worksheet'].includes(a.type); return [a.title, a.dueDate ? new Date(a.dueDate).toLocaleDateString() : '—', usesMarks ? `${a.maxMarks} marks` : 'Completion + feedback', <Tag status={a.submissionCount > 0 ? 'approved' : 'pending'} label={`${a.submissionCount || 0} submitted`} />, <Tag status={a.gradedCount > 0 ? 'approved' : 'pending'} label={`${a.gradedCount || 0}/${a.submissionCount || 0} ${usesMarks ? 'graded' : 'reviewed'}`} />, <div className="flex gap-2 flex-wrap"><button className="btn btn-primary" style={{ padding: '5px 12px', fontSize: '0.78rem' }} onClick={() => openSubmissions(a._id)}>Review submissions</button><button type="button" className="btn" style={{ padding: '5px 12px', fontSize: '0.78rem', color: 'var(--rose)' }} onClick={() => deleteAssignment(a)}>Delete</button></div>]; })}
            empty="No assignments yet."
          />
          {openAssignment && (
            <div className="u-modal-overlay open" onMouseDown={(event) => { if (event.target === event.currentTarget) { setOpenAssignment(null); setSubmissions(null); } }}>
              <section className="u-modal u-modal-lg" role="dialog" aria-modal="true" aria-labelledby="submission-review-title">
                <div className="u-modal-head"><div><h3 id="submission-review-title">Review submissions</h3><p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 3 }}>{assignments.find((item) => item._id === openAssignment)?.title} · {submissions?.length ?? '…'} received</p></div><button type="button" className="u-modal-close" aria-label="Close submissions" onClick={() => { setOpenAssignment(null); setSubmissions(null); }}><FaXmark aria-hidden="true" /></button></div>
                <div className="u-modal-body" style={{ display: 'grid', gap: 14 }}>
                  {submissions?.length > 1 && <SimilarityCheck assignmentId={openAssignment} onFlash={onFlash} />}
                  {submissions === null && <p role="status" className="admin-notice">Loading student submissions…</p>}
                  {submissions?.length === 0 && <div className="admin-notice"><strong>No submissions received yet.</strong><p className="text-xs mt-2">The student may have submitted a different duplicate assignment. Keep one assignment and ask them to submit against this exact item.</p></div>}
                  {(submissions || []).map((s) => <article key={s._id} className="card" style={{ padding: 18 }}>
                    <div className="flex items-start justify-between flex-wrap" style={{ gap: 10 }}><div><h4>{s.student?.fullName || 'Student'}</h4><StudentGuardians studentId={s.student?._id}/><p className="text-xs" style={{ color: 'var(--ink-soft)' }}>{s.student?.email || ''} · Submitted {s.submittedAt ? new Date(s.submittedAt).toLocaleString() : 'recently'}</p></div><div className="flex gap-2"><Tag status={s.status === 'graded' ? 'approved' : s.status === 'resubmit_requested' ? 'rejected' : 'pending'} label={s.status.replace('_', ' ')} />{s.late ? <Tag status="rejected" label="Late" /> : <Tag status="approved" label="On time" />}</div></div>
                    <div style={{ marginTop: 14, padding: 14, borderRadius: 10, background: 'var(--sand)' }}><strong className="text-sm">Student work</strong>{s.text ? <p className="text-sm mt-2" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{s.text}</p> : <p className="text-xs mt-2" style={{ color: 'var(--ink-soft)' }}>Submitted as uploaded file.</p>}{(s.attachments || []).map((item, index) => <a key={index} href={item.url} target="_blank" rel="noreferrer" className="btn mt-2" style={{ display: 'inline-flex', marginRight: 8 }}>Open {item.name || 'attachment'} <FaArrowUpRightFromSquare aria-hidden="true" /></a>)}</div>
                    {s.status === 'graded' ? <div className="admin-notice" style={{ marginTop: 12 }}><strong>{['homework', 'worksheet'].includes(assignments.find((item) => item._id === openAssignment)?.type) ? 'Homework reviewed' : `Graded: ${s.marksObtained}/${assignments.find((item) => item._id === openAssignment)?.maxMarks}`}</strong>{s.feedback && <p className="text-xs mt-1">Feedback: {s.feedback}</p>}</div> : <div className="flex gap-2 flex-wrap items-center mt-3"><GradeForm usesMarks={!['homework', 'worksheet'].includes(assignments.find((item) => item._id === openAssignment)?.type)} maxMarks={assignments.find((item) => item._id === openAssignment)?.maxMarks} onSubmit={(marks, fb) => grade(s._id, marks, fb)} /><button type="button" className="btn" onClick={() => requestResubmit(s._id)}>Request revision</button></div>}
                  </article>)}
                </div>
                <div className="u-modal-foot"><button type="button" className="btn" onClick={() => { setOpenAssignment(null); setSubmissions(null); }}>Close</button></div>
              </section>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function GradeForm({ onSubmit, maxMarks, usesMarks = true }) {
  const [marks, setMarks] = useState('');
  const [feedback, setFeedback] = useState('');
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(marks, feedback); }} className="flex gap-2 items-center">
      {usesMarks && <input className="form-input" style={{ width: 90 }} type="number" min="0" max={maxMarks} required placeholder={`Marks / ${maxMarks || 100}`} value={marks} onChange={(e) => setMarks(e.target.value)} />}
      <input className="form-input" style={{ width: 120 }} placeholder="Feedback" value={feedback} onChange={(e) => setFeedback(e.target.value)} />
      <button type="submit" className="btn btn-primary" style={{ padding: '5px 12px', fontSize: '0.78rem' }}>{usesMarks ? 'Save grade' : 'Mark reviewed'}</button>
    </form>
  );
}

function TeacherResultsPanel({ onFlash }) {
  const { courses, courseId, setCourseId } = useTeacherCourses(onFlash);
  const [enrollments, setEnrollments] = useState([]);
  const [results, setResults] = useState([]);
  const [form, setForm] = useState({ student: '', term: '', subject: '', marksObtained: '', totalMarks: 100, grade: '' });

  function loadResults(selectedCourseId = courseId) {
    if (!selectedCourseId) return;
    apiRequest(`/courses/${selectedCourseId}/results`).then(setResults).catch((err) => onFlash(err.message));
  }

  useEffect(() => {
    if (!courseId) return;
    apiRequest(`/courses/${courseId}/students`).then((list) => {
      setEnrollments(list);
      setForm((f) => ({ ...f, student: list[0]?.student?._id || '' }));
    }).catch((err) => onFlash(err.message));
    loadResults(courseId);
  }, [courseId, onFlash]);

  async function submit(e) {
    e.preventDefault();
    try {
      await apiRequest(`/courses/${courseId}/results`, {
        method: 'POST',
        body: { ...form, marksObtained: Number(form.marksObtained), totalMarks: Number(form.totalMarks) || 100 }
      });
      onFlash('Result recorded.', 'success');
      setForm((f) => ({ ...f, term: '', subject: '', marksObtained: '', grade: '' }));
      loadResults();
    } catch (err) { onFlash(err.message); }
  }

  return (
    <div>
      <CourseSelect courses={courses} value={courseId} onChange={setCourseId} />
      {courseId && <>
        <div className="admin-notice" style={{ marginBottom: 18 }}><strong>Online exam results appear automatically</strong><p className="text-xs mt-1">Grade an exam once in Examinations. The same final marks, percentage and teacher-selected grade are saved here automatically. Use the form below only for an offline or paper-based assessment.</p></div>
        <h3 className="font-semibold mb-2">Result Register</h3>
        <Table
          headers={['Student', 'Assessment', 'Term', 'Marks', 'Percentage', 'Grade', 'Source']}
          rows={results.map((result) => {
            const percentage = Number(result.totalMarks) > 0 ? (Number(result.marksObtained) / Number(result.totalMarks)) * 100 : 0;
            return [<span><strong>{result.student?.fullName || 'Student'}</strong><StudentGuardians studentId={result.student?._id}/><br /><small>{result.student?.email || ''}</small></span>, result.exam?.title || result.subject || 'Offline result', result.term || '—', `${result.marksObtained}/${result.totalMarks}`, `${percentage.toFixed(2)}%`, result.grade || '—', result.exam ? <Tag status="approved" label="Online exam" /> : <Tag status="pending" label="Offline / paper" />];
          })}
          empty="No graded results recorded for this course yet."
        />
        {enrollments.length > 0 && <>
        <h3 className="font-semibold" style={{ marginTop: 26, marginBottom: 10 }}>Offline / Paper Result Entry</h3>
        <form onSubmit={submit} className="offline-result-form">
          <div className="nl-form-head"><h4>Record a paper result</h4><p>For tests taken on paper. The student sees it in their results.</p></div>
          <div className="offline-result-grid">
            <div className="institution-field or-span-2"><span>Student</span>
              <CustomSelect
                value={form.student} onChange={(v) => setForm({ ...form, student: v })} ariaLabel="Select student"
                options={enrollments.map((en) => ({ value: en.student._id, label: en.student.fullName }))}
                minWidth="100%"
              />
            </div>
            <label className="institution-field"><span>Term</span><input className="form-input" placeholder="e.g. Mid Term" value={form.term} onChange={(e) => setForm({ ...form, term: e.target.value })} /></label>
            <label className="institution-field"><span>Subject</span><input className="form-input" placeholder="e.g. Physics" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></label>
            <label className="institution-field"><span>Marks obtained</span><input className="form-input" type="number" placeholder="e.g. 78" value={form.marksObtained} onChange={(e) => setForm({ ...form, marksObtained: e.target.value })} required /></label>
            <label className="institution-field"><span>Total marks</span><input className="form-input" type="number" placeholder="e.g. 100" value={form.totalMarks} onChange={(e) => setForm({ ...form, totalMarks: e.target.value })} /></label>
            <label className="institution-field"><span>Grade (optional)</span><input className="form-input" placeholder="e.g. A" value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} /></label>
            <div className="institution-field"><span>Percentage</span><div className="or-percent">{Number(form.totalMarks) > 0 && form.marksObtained !== '' ? `${Math.round((Number(form.marksObtained) / Number(form.totalMarks)) * 100)}%` : '—'}</div></div>
          </div>
          <div className="nl-form-foot"><button type="submit" className="btn btn-primary">Record Result</button></div>
        </form>
        </>}
      </>}
    </div>
  );
}

// Teacher Dashboard Home — Welcome → Today's Classes → Today's Attendance → Pending
// Assignments → Upcoming Exams → Salary Summary (self only) → Notifications. Every number
// here comes from /teachers/me/dashboard, itself built entirely from data teachers/institutions
// enter through real forms (timetable, attendance, assignments, exams, payslips) — nothing seeded.
function TeacherSummary({ onNavigate, user }) {
  const [dash, setDash] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest('/teachers/me/dashboard').then(setDash).catch((err) => setError(err.message));
  }, []);

  if (error) return <div role="alert" className="admin-notice error">{error}</div>;
  if (!dash) return <p role="status" className="admin-notice">Loading your dashboard...</p>;

  return (
    <>
      <div className="teacher-summary">
      {/* Welcome / Profile Overview */}
      <div className="flex items-center" style={{ gap: 14, marginTop: -12, marginBottom: 24 }}>
        {user?.profilePhoto
          ? <img src={user.profilePhoto} alt="" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
          : <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--gold)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, flexShrink: 0 }}>{(user?.fullName || '?')[0]}</div>}
        <strong className="text-sm">{user?.fullName}</strong>
      </div>

      {/* 1. Today's Classes */}
      <div className="dash-section-title"><h2>Today's Classes</h2></div>
      <div className="hover-card card" style={{ padding: 16, cursor: 'pointer' }} onClick={() => onNavigate?.('timetable')}>
        <Table
          headers={['Time', 'Subject', 'Class/Section']}
          rows={dash.todayClasses.map((c) => [`${formatTime12h(c.startTime)}–${formatTime12h(c.endTime)}`, c.subject, c.classSection || '—'])}
          empty="No classes scheduled for you today."
        />
      </div>

      {/* 2. Today's Student Attendance */}
      <div className="dash-section-title" style={{ marginTop: 28 }}><h2>Today's Student Attendance</h2></div>
      <div className="teacher-tiles teacher-tiles-3">
        <SummaryCard title="Total Marked" count={dash.todayAttendance.total} icon={FaUsers} onClick={() => onNavigate?.('attendance')} />
        <SummaryCard title="Present" count={dash.todayAttendance.present} icon={FaCircleCheck} onClick={() => onNavigate?.('attendance')} />
        <SummaryCard title="Absent" count={dash.todayAttendance.absent} icon={FaXmark} onClick={() => onNavigate?.('attendance')} />
      </div>

      {/* 3. Pending Assignments */}
      <div className="dash-section-title" style={{ marginTop: 28 }}><h2>Assignments</h2></div>
      <div className="teacher-tiles teacher-tiles-2">
        <SummaryCard title="Submissions Received" count={dash.assignmentsOverview.submitted} icon={FaClipboardCheck} onClick={() => onNavigate?.('homework')} />
        <SummaryCard title="Still Pending" count={dash.assignmentsOverview.pending} icon={FaHourglassHalf} onClick={() => onNavigate?.('homework')} />
      </div>

      {/* 4. Upcoming Exams — split into the document's exact 3 categories (quizzes / tests /
          major examinations), not one mixed table. "Major examinations" = midterm + final. */}
      <div className="dash-section-title" style={{ marginTop: 28 }}><h2>Upcoming Exams</h2></div>
      {(() => {
        const quizzes = dash.upcomingExams.filter((e) => e.type === 'quiz');
        const tests = dash.upcomingExams.filter((e) => e.type === 'test');
        const majors = dash.upcomingExams.filter((e) => e.type === 'midterm' || e.type === 'final');
        const rowsFor = (list) => list.map((e) => [e.title, e.courseTitle, e.scheduledDate ? shortWhen(e.scheduledDate) : '—']);
        const groups = [
          { label: 'Upcoming Quizzes', icon: FaClipboardList, color: 'var(--gold)', list: quizzes, empty: 'No upcoming quizzes.' },
          { label: 'Tests', icon: FaFileLines, color: 'var(--emerald)', list: tests, empty: 'No upcoming tests.' },
          { label: 'Major Examinations', icon: FaAward, color: 'var(--rose)', list: majors, empty: 'No upcoming midterms or finals.' }
        ];
        return (
          <div style={{ display: 'grid', gap: 14 }}>
            {groups.map((g) => (
              <div key={g.label} className="card" style={{ padding: 18 }}>
                <div className="flex items-center" style={{ gap: 12, marginBottom: 14 }}>
                  <span style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--sand)', color: g.color, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    <g.icon aria-hidden="true" size={15} />
                  </span>
                  <strong className="text-sm">{g.label}</strong>
                  <span className="text-xs" style={{ color: 'var(--ink-soft)', marginLeft: 'auto' }}>{g.list.length} scheduled</span>
                </div>
                <Table headers={['Title', 'Course', 'Scheduled']} rows={rowsFor(g.list)} empty={g.empty} />
              </div>
            ))}
            <button type="button" className="btn" style={{ padding: '7px 18px', fontSize: '0.78rem', justifySelf: 'start' }} onClick={() => onNavigate?.('examination')}>View Examinations</button>
          </div>
        );
      })()}

      {/* 5. Salary Summary — self only */}
      <div className="dash-section-title" style={{ marginTop: 28 }}><h2>Salary Summary</h2></div>
      <div className="hover-card card" style={{ padding: 20, cursor: 'pointer' }} onClick={() => onNavigate?.('earnings')}>
        <div className="grid grid-cols-3" style={{ gap: 14 }}>
          <div>
            <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>This month</p>
            <strong style={{ fontSize: 22, fontFamily: 'Fraunces, serif', display: 'block', marginTop: 4 }}>{dash.salary.currency} {Number(dash.salary.monthly || 0).toLocaleString()}</strong>
          </div>
          <div>
            <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>Received</p>
            <strong style={{ fontSize: 22, fontFamily: 'Fraunces, serif', display: 'block', marginTop: 4, color: 'var(--emerald)' }}>{dash.salary.currency} {Number(dash.salary.received || 0).toLocaleString()}</strong>
          </div>
          <div>
            <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>Pending</p>
            <strong style={{ fontSize: 22, fontFamily: 'Fraunces, serif', display: 'block', marginTop: 4, color: dash.salary.pending > 0 ? 'var(--gold)' : undefined }}>{dash.salary.currency} {Number(dash.salary.pending || 0).toLocaleString()}</strong>
          </div>
        </div>
      </div>

      {/* 6. Notifications */}
      <div className="dash-section-title" style={{ marginTop: 28 }}><h2>Notifications</h2></div>
      {dash.notifications.length === 0 ? (
        <div className="student-empty-state" style={{ border: '1px solid var(--sand-line)', borderRadius: 18 }}>
          <FaBell aria-hidden="true" />
          <p>No notifications yet</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="dash-list" style={{ gap: 0 }}>
            {dash.notifications.map((n, idx) => (
              <div key={n._id} className={`dash-list-item${!n.read ? ' unread' : ''}`} style={{ borderBottom: idx < dash.notifications.length - 1 ? '1px solid var(--sand-line)' : 'none' }}>
                <span className="dash-list-icon c-gold" aria-hidden><FaBell size={14} /></span>
                <div className="dash-list-body"><div className="title" style={{ fontWeight: n.read ? 400 : 600 }}>{n.title}</div></div>
                <span className="dash-list-time">{new Date(n.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
          <div style={{ padding: 12 }}>
            <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.75rem' }} onClick={() => onNavigate?.('notifications')}>View All</button>
          </div>
        </div>
      )}
      </div>
    </>
  );
}

function TeacherLiveClassesPanel({ user, onFlash }) {
  const [sessions, setSessions] = useState(null);
  const [courses, setCourses] = useState([]);
  const [active, setActive] = useState(null);
  const [busyId, setBusyId] = useState('');
  const [scheduleBusy, setScheduleBusy] = useState(false);
  const [form, setForm] = useState({ course: '', title: '', scheduledStart: '', scheduledEnd: '', provider: 'careerz_jitsi', externalMeetingUrl: '' });
  function load() { apiRequest('/live-classes/teacher/mine').then(setSessions).catch((err) => { setSessions([]); onFlash(err.message); }); }
  useEffect(() => { load(); apiRequest('/courses/mine/list').then(setCourses).catch((err) => onFlash(err.message)); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function schedule(e) {
    e.preventDefault();
    const course = courses.find((item) => item._id === form.course);
    if (!course) return onFlash('Select a course.');
    if (course.institution?._id && !course.classSection) return onFlash('Ask the institution to assign this course to a class section first.');
    setScheduleBusy(true);
    try {
      await apiRequest('/live-classes', { method: 'POST', body: { ...form, ...(course.institution?._id ? { institution: course.institution._id } : {}) } });
      onFlash('Live class scheduled. Enrolled students have been notified.', 'success');
      setForm({ course: '', title: '', scheduledStart: '', scheduledEnd: '', provider: 'careerz_jitsi', externalMeetingUrl: '' });
      load();
    } catch (err) { onFlash(err.message); } finally { setScheduleBusy(false); }
  }

  async function start(session) {
    setBusyId(session._id);
    try {
      const started = await apiRequest(`/live-classes/${session._id}/start`, { method: 'PATCH' });
      if (started.provider === 'external') window.open(started.externalMeetingUrl, '_blank', 'noopener,noreferrer');
      else setActive(started);
      onFlash('Live class started. Enrolled students have been notified.', 'success'); load();
    } catch (err) { onFlash(err.message); } finally { setBusyId(''); }
  }
  async function end(session) {
    if (!await showConfirm('End this live class and record attendance for all enrolled students?', { title: 'End live class', confirmLabel: 'End class', danger: true })) return;
    setBusyId(session._id);
    try { await apiRequest(`/live-classes/${session._id}/end`, { method: 'PATCH' }); setActive(null); onFlash('Class ended and attendance recorded.', 'success'); load(); }
    catch (err) { onFlash(err.message); } finally { setBusyId(''); }
  }
  if (active) return <div><div className="flex items-center justify-between mb-3"><div><h3 className="font-semibold">Class is live</h3><p className="text-xs" style={{ color: 'var(--ink-soft)' }}>Students can now join from My Classes.</p></div><button type="button" className="btn" style={{ color: 'var(--rose)' }} onClick={() => end(active)}>End Class & Record Attendance</button></div><CareerZLiveClassroom session={active} user={user} role="teacher" onLeave={() => setActive(null)} onError={(err) => onFlash(err.message)} /><LiveClassAttendance session={active} onFlash={onFlash} /></div>;
  return (
    <div>
      <h3 className="font-semibold mb-2">Live Classes</h3>
      <p className="text-xs mb-3" style={{ color: 'var(--ink-soft)' }}>Schedule and run live classes for courses assigned to you. The institution controls course, section and teacher assignments; enrolled students are notified automatically.</p>
      <form onSubmit={schedule} className="live-form">
        <div className="nl-form-head"><h4>Schedule a live class</h4><p>Enrolled students get a notification and can join from My Classes when you start.</p></div>
        <div className="live-grid">
        <label className="institution-field live-wide"><span>Course</span><select className="form-select" required value={form.course} onChange={(e) => { const course = courses.find((item) => item._id === e.target.value); setForm({ ...form, course: e.target.value, title: course ? `${course.title} Live Class` : '' }); }}>
          <option value="">Select your assigned course</option>
          {courses.map((course) => <option key={course._id} value={course._id}>{course.subject || course.title} — {course.institution ? `${course.classSection?.name || 'Class section not assigned'} — ${course.institution.name}` : 'My own course'}</option>)}
        </select></label>
        <label className="institution-field live-wide"><span>Class title</span><input className="form-input" required placeholder="Live class title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
        <label className="institution-field"><span>Starts at</span><input className="form-input" type="datetime-local" required value={form.scheduledStart} onChange={(e) => setForm({ ...form, scheduledStart: e.target.value })} /></label><label className="institution-field"><span>Ends at</span><input className="form-input" type="datetime-local" required value={form.scheduledEnd} onChange={(e) => setForm({ ...form, scheduledEnd: e.target.value })} /></label>
        <label className="institution-field live-wide"><span>Classroom provider</span><select className="form-select" value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })}><option value="careerz_jitsi">CareerZ Live Classroom</option><option value="external">External Zoom / Meet / Teams</option></select></label>
        {form.provider === 'external' && <label className="institution-field live-wide"><span>Meeting link</span><input className="form-input" type="url" required placeholder="https://... meeting link" value={form.externalMeetingUrl} onChange={(e) => setForm({ ...form, externalMeetingUrl: e.target.value })} /></label>}
        </div>
        <div className="nl-form-foot"><button type="submit" className="btn btn-primary" disabled={scheduleBusy}>{scheduleBusy ? 'Scheduling…' : 'Schedule Live Class'}</button></div>
      </form>
      <Table loading={sessions === null} headers={['Title', 'Course / Class', 'When', 'Status', 'Action']} rows={(sessions || []).map((session) => [
        <strong>{session.title}</strong>, <span className="exam-cell"><strong>{session.course?.subject || session.course?.title}</strong><small>{session.classSection?.name || 'No class set'}</small></span>,
        <span className="exam-cell"><strong style={{ whiteSpace: 'nowrap' }}>{new Date(session.scheduledStart).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</strong><small style={{ whiteSpace: 'nowrap' }}>{new Date(session.scheduledStart).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })} – {new Date(session.scheduledEnd).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}</small></span>,
        <span><Tag status={session.status === 'live' ? 'approved' : session.status === 'ended' ? 'completed' : session.status === 'cancelled' ? 'rejected' : 'pending'} label={session.status === 'live' ? 'Live now' : session.status} />{session.startedByClassControl && <small style={{ display: 'block' }}>via Live Class Control</small>}{session.engagement?.participantCount > 0 && <small style={{ display: 'block' }}>Engagement {session.engagement.averageEnergy ?? '—'}% · {session.engagement.attentiveCount}/{session.engagement.participantCount} attentive</small>}</span>,
        session.status === 'scheduled' ? <button type="button" className="btn btn-primary" disabled={busyId === session._id} onClick={() => start(session)}>{busyId === session._id ? 'Starting…' : 'Start Class'}</button>
          : session.status === 'live' ? <div className="flex gap-2"><button type="button" className="btn btn-primary" onClick={() => session.provider === 'external' ? window.open(session.externalMeetingUrl, '_blank', 'noopener,noreferrer') : setActive(session)}>Open Classroom</button><button type="button" className="btn" style={{ color: 'var(--rose)' }} onClick={() => end(session)}>End</button></div> : '—'
      ])} empty="No live class has been scheduled for you yet." />
    </div>
  );
}

function TeacherPerformancePanel({ onFlash }) {
  const [rows, setRows] = useState(null);

  useEffect(() => {
    apiRequest('/courses/mine/list').then(async (list) => {
      const withStats = await Promise.all(list.map(async (c) => {
        try {
          const enrollments = await apiRequest(`/courses/${c._id}/students`);
          const avg = enrollments.length > 0 ? Math.round(enrollments.reduce((s, e) => s + (e.overallScore || 0), 0) / enrollments.length) : 0;
          const completed = enrollments.filter((e) => e.status === 'completed').length;
          return { id: c._id, title: c.title, students: enrollments.length, avgProgress: avg, completed };
        } catch { return { id: c._id, title: c.title, students: 0, avgProgress: 0, completed: 0 }; }
      }));
      setRows(withStats);
    }).catch((err) => onFlash(err.message));
  }, [onFlash]);

  if (rows === null) return <p role="status" className="admin-notice">Loading...</p>;

  const totalStudents = rows.reduce((s, r) => s + r.students, 0);
  const overallAvg = rows.length > 0 ? Math.round(rows.reduce((s, r) => s + r.avgProgress, 0) / rows.length) : 0;

  return (
    <div>
      <h3 className="font-semibold mb-2">Performance Overview</h3>
      <SummaryRow items={[
        { label: 'Courses', value: rows.length, icon: FaBookOpen, detail: 'Created by you' },
        { label: 'Total Students', value: totalStudents, icon: FaUsers, detail: 'Across all courses' },
        { label: 'Avg. Completion Score', value: `${overallAvg}%`, icon: FaChartLine, detail: 'Lessons + assignments + tests + attendance' }
      ]} />
      <Table
        headers={['Course', 'Students', 'Avg. Completion Score', 'Completed']}
        rows={rows.map((r) => [r.title, r.students, `${r.avgProgress}%`, r.completed])}
        empty="No courses yet."
      />
    </div>
  );
}

function TeacherPtmPanel({ onFlash }) {
  const [meetings, setMeetings] = useState(null);
  const [respondFormFor, setRespondFormFor] = useState(null);
  const [respondForm, setRespondForm] = useState({ confirmedDate: '', location: '' });
  const [expanded, setExpanded] = useState(null);

  function load() { apiRequest('/ptm/mine').then(setMeetings).catch((err) => onFlash(err.message)); }
  useEffect(() => {
    load();
    const timer = window.setInterval(load, 10000);
    window.addEventListener('focus', load);
    return () => { window.clearInterval(timer); window.removeEventListener('focus', load); };
  }, []);

  function startRespond(m) {
    setRespondFormFor(m._id);
    setRespondForm({ confirmedDate: m.requestedDate ? new Date(new Date(m.requestedDate).getTime() - new Date(m.requestedDate).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '', location: '' });
  }

  async function respond(m, decision) {
    try {
      await apiRequest(`/ptm/${m._id}/respond`, { method: 'PATCH', body: { decision, ...respondForm, confirmedDate:respondForm.confirmedDate?new Date(respondForm.confirmedDate).toISOString():undefined } });
      onFlash(`Meeting ${decision}.`, 'success');
      setRespondFormFor(null);
      load();
    } catch (err) { onFlash(err.message); }
  }
  async function cancelMeeting(id) {
    try {
      await apiRequest(`/ptm/${id}/cancel`, { method: 'PATCH' });
      onFlash('Meeting cancelled.', 'success');
      load();
    } catch (err) { onFlash(err.message); }
  }

  return (
    <div>
      <h3 className="font-semibold mb-2">Parent-Teacher Meeting Requests</h3>
      {meetings === null && <p role="status" className="admin-notice">Loading...</p>}
      {meetings?.length === 0 && <p className="admin-notice">No meeting requests yet.</p>}
      <div className="space-y-3">
        {(meetings || []).map((m) => (
          <div key={m._id} className="ptm-card">
            <div className="flex items-center justify-between flex-wrap" style={{ gap: 10 }}>
              <div>
                <strong className="text-sm">{m.student?.fullName || '—'}'s parent ({m.parent?.fullName || '—'})</strong>
                <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 2 }}>
                  {m.subject || 'General'} · Requested for {new Date(m.requestedDate).toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })} · {m.mode === 'video' ? 'Video call' : 'In person'}
                </p>
                {m.notes && <p className="ptm-note">“{m.notes}”</p>}
              </div>
              <Tag status={PTM_STATUS_TAG[m.status] || 'pending'} label={m.status} />
            </div>

            {m.status === 'pending' && respondFormFor !== m._id && (
              <button className="btn btn-primary" style={{ padding: '5px 14px', fontSize: '0.78rem', marginTop: 10 }} onClick={() => startRespond(m)}>Respond</button>
            )}
            {respondFormFor === m._id && (
              <div className="flex items-end flex-wrap" style={{ gap: 10, marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--sand-line)' }}>
                <label className="text-xs" style={{ color: 'var(--ink-soft)', fontWeight: 600 }}>Confirmed date/time
                  <input type="datetime-local" className="form-input" value={respondForm.confirmedDate} onChange={(e) => setRespondForm({ ...respondForm, confirmedDate: e.target.value })} style={{ marginTop: 6 }} />
                </label>
                {m.mode === 'video'
                  ? <p className="text-xs">The existing video meeting setup is assigned automatically on confirmation.</p>
                  : <input className="form-input" placeholder="Location" value={respondForm.location} onChange={(e) => setRespondForm({ ...respondForm, location: e.target.value })} style={{ flex: '1 1 200px', minWidth: 0 }} />}
                <button type="button" className="btn btn-primary" style={{ padding: '7px 14px', fontSize: '0.78rem' }} onClick={() => respond(m, 'confirmed')}>Confirm</button>
                <button type="button" className="btn" style={{ padding: '7px 14px', fontSize: '0.78rem', background: 'var(--sand-line)' }} onClick={() => respond(m, 'declined')}>Decline</button>
                <button type="button" className="btn" style={{ padding: '7px 14px', fontSize: '0.78rem' }} onClick={() => setRespondFormFor(null)}>Close</button>
              </div>
            )}
            {m.status === 'confirmed' && (
              <div className="flex items-center justify-between flex-wrap" style={{ marginTop: 10, gap: 10 }}>
                <p className="text-xs">{new Date(m.confirmedDate).toLocaleString()} · {m.mode === 'video' ? 'Video meeting ready' : (m.location || 'No location set')}</p>
                <div className="flex gap-2">
                  <button className="btn staff-remove" style={{ padding: '5px 12px', fontSize: '0.75rem' }} onClick={() => cancelMeeting(m._id)}>Cancel</button>
                  <button className="btn" style={{ padding: '5px 12px', fontSize: '0.75rem' }} onClick={() => setExpanded(expanded === m._id ? null : m._id)}>{expanded === m._id ? 'Hide' : 'Details'}</button>
                </div>
              </div>
            )}
            {m.status === 'completed' && (
              <button className="btn" style={{ padding: '4px 10px', fontSize: '0.75rem', marginTop: 8 }} onClick={() => setExpanded(expanded === m._id ? null : m._id)}>{expanded === m._id ? 'Hide' : 'Minutes & Action Items'}</button>
            )}
            <PtmHistory meeting={m} />
            {expanded === m._id && <PtmMeetingDetails meeting={m} myRole="teacher" onFlash={onFlash} onChanged={load} />}
          </div>
        ))}
      </div>
      <TeacherSchedulePtm onFlash={onFlash} onCreated={load} />
    </div>
  );
}

function TeacherPanel({ onFlash }) {
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({ title: '', subject: '' });
  const [openCourseId, setOpenCourseId] = useState(null);
  async function load() { try { setCourses(await apiRequest('/courses/mine/list')); } catch (err) { onFlash(err.message); } }
  useEffect(() => { load(); }, []);

  async function create(e) {
    e.preventDefault();
    try {
      await apiRequest('/courses', { method: 'POST', body: { title: form.title, subject: form.subject } });
      onFlash('Course created (unpublished).', 'success');
      setForm({ title: '', subject: '' });
      load();
    } catch (err) { onFlash(err.message); }
  }
  async function publish(id) {
    try { await apiRequest(`/courses/${id}`, { method: 'PATCH', body: { published: true } }); onFlash('Course published.', 'success'); load(); } catch (err) { onFlash(err.message); }
  }

  const fieldLabel = { fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--ink-soft)', display: 'block', marginBottom: 6 };

  return (
    <div>
      <h3 className="font-semibold" style={{ marginBottom: 14 }}>Create a New Course</h3>
      <p className="text-xs" style={{ color: 'var(--ink-soft)', marginBottom: 14 }}>This creates your own independent course. Courses at your institute are created and assigned by the institute, and appear in your list automatically.</p>
      <form onSubmit={create} className="card course-create-form" style={{ padding: 20, marginBottom: 28 }}>
        <div className="flex flex-wrap items-end" style={{ gap: 14 }}>
          <label style={{ flex: '1 1 200px', minWidth: 0 }}>
            <span style={fieldLabel}>Course title</span>
            <input className="form-input" placeholder="e.g. Grade 9 Physics" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </label>
          <label style={{ flex: '1 1 160px', minWidth: 0 }}>
            <span style={fieldLabel}>Subject</span>
            <input className="form-input" placeholder="e.g. Physics" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
          </label>
          <button type="submit" className="btn btn-primary" style={{ flexShrink: 0 }}>Create Course</button>
        </div>
      </form>
      <h3 className="font-semibold" style={{ marginBottom: 14 }}>My Courses</h3>
      <div className="course-list-table"><Table
        headers={['Title', 'Published', 'Action']}
        rows={courses.map((c) => [
          <strong>{c.title}</strong>, c.published ? <Tag status="approved" /> : <Tag status="pending" />,
          <div className="flex" style={{ gap: 8 }}>
            {!c.published && <button className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.78rem' }} onClick={() => publish(c._id)}>Publish</button>}
            <button className="btn" style={{ padding: '6px 14px', fontSize: '0.78rem' }} onClick={() => setOpenCourseId(c._id)}>Manage Lessons</button>
          </div>
        ])}
        empty="No courses yet."
      /></div>
      {openCourseId && <TeacherLessonsPanel courseId={openCourseId} onFlash={onFlash} onClose={() => setOpenCourseId(null)} />}
    </div>
  );
}

// Switches certificates on or off for one course. A student who already finished gets theirs
// as soon as it is switched on.
function CertificateToggle({ course, onFlash, onSaved }) {
  const [on, setOn] = useState(Boolean(course.certificateEnabled));
  const [busy, setBusy] = useState(false);
  async function change(value) {
    setBusy(true);
    try {
      await apiRequest(`/courses/${course._id}`, { method: 'PATCH', body: { certificateEnabled: value } });
      setOn(value);
      onFlash(value ? 'Certificates switched on for this course.' : 'Certificates switched off for this course.', 'success');
      onSaved?.();
    } catch (err) { onFlash(err.message); } finally { setBusy(false); }
  }
  return (
    <div className="completion-row">
      <div><strong>Certificate</strong><p>{on ? 'Students who complete this course receive a certificate with a public verification link.' : 'No certificate is issued for this course yet.'}</p></div>
      <label className="flex items-center" style={{ gap: 8, fontSize: 13, fontWeight: 600 }}><input type="checkbox" checked={on} disabled={busy} onChange={(e) => change(e.target.checked)} /> Issue certificates</label>
    </div>
  );
}

function CompletionRulesEditor({ course, onFlash, onSaved }) {
  const [open, setOpen] = useState(false);
  const [weights, setWeights] = useState(course.completionRules?.weights || { lessons: 40, assignments: 20, tests: 25, attendance: 15 });
  const [minAttendancePercent, setMinAttendancePercent] = useState(course.completionRules?.minAttendancePercent || 0);
  const [requireTeacherApproval, setRequireTeacherApproval] = useState(course.completionRules?.requireTeacherApproval || false);
  const [saving, setSaving] = useState(false);

  const sum = Object.values(weights).reduce((s, v) => s + (Number(v) || 0), 0);

  async function save() {
    if (Math.abs(sum - 100) > 1) return onFlash('Weights must add up to 100.');
    setSaving(true);
    try {
      await apiRequest(`/courses/${course._id}`, { method: 'PATCH', body: { completionRules: { weights, minAttendancePercent, requireTeacherApproval } } });
      onFlash('Completion rules saved.', 'success');
      setOpen(false);
      onSaved?.();
    } catch (err) { onFlash(err.message); } finally { setSaving(false); }
  }

  const labels = { lessons: 'Lessons', assignments: 'Assignments', tests: 'Tests/Exams', attendance: 'Attendance' };

  if (!open) {
    return (
      <div className="completion-row">
        <div><strong>Completion rules</strong><p>Decide what "course completed" means for this course — lessons alone, or lessons + assignments + tests + attendance.</p></div>
        <button type="button" className="btn" onClick={() => {setWeights(course.completionRules?.weights||{lessons:40,assignments:20,tests:25,attendance:15});setMinAttendancePercent(course.completionRules?.minAttendancePercent||0);setRequireTeacherApproval(course.completionRules?.requireTeacherApproval||false);setOpen(true);}}>Edit completion rules</button>
      </div>
    );
  }

  return (
    <div className="card lc-card completion-editor">
      <strong className="text-sm">Course Completion Rules</strong>
      <p className="text-xs" style={{ color: 'var(--ink-soft)', margin: '6px 0 12px' }}>How much each category counts toward a student's overall course completion score. Weights must add up to 100 — a category with nothing in it (e.g. no assignments yet) is skipped and its weight redistributed automatically.</p>
      <div className="grid grid-cols-2" style={{ gap: 10 }}>
        {Object.keys(labels).map((key) => (
          <label key={key} className="text-xs">
            {labels[key]} (%)
            <input type="number" min="0" max="100" className="form-input" value={weights[key]} onChange={(e) => setWeights({ ...weights, [key]: Number(e.target.value) })} style={{ marginTop: 4 }} />
          </label>
        ))}
      </div>
      <p className="text-xs" style={{ marginTop: 8, color: Math.abs(sum - 100) > 1 ? 'var(--rose)' : 'var(--emerald)' }}>Total: {sum}% {Math.abs(sum - 100) > 1 ? '(must equal 100)' : '✓'}</p>

      <label className="text-xs" style={{ display: 'block', marginTop: 12 }}>
        Minimum attendance required (%, 0 = no minimum)
        <input type="number" min="0" max="100" className="form-input" value={minAttendancePercent} onChange={(e) => setMinAttendancePercent(Number(e.target.value))} style={{ marginTop: 4, maxWidth: 140 }} />
      </label>

      <label className="text-xs flex items-center" style={{ marginTop: 12, gap: 8 }}>
        <input type="checkbox" checked={requireTeacherApproval} onChange={(e) => setRequireTeacherApproval(e.target.checked)} />
        Require my approval before a student is marked "completed" (even after they meet every requirement)
      </label>

      <div className="flex gap-2" style={{ marginTop: 14 }}>
        <button type="button" className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.78rem' }} onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save Rules'}</button>
        <button type="button" className="btn" style={{ padding: '6px 14px', fontSize: '0.78rem' }} onClick={() => setOpen(false)}>Close</button>
      </div>
    </div>
  );
}

function TeacherSlideDeckManager({ lesson, onFlash, onChanged }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(lesson.title);
  const [slides, setSlides] = useState(lesson.deck?.slides || []);
  const [busy, setBusy] = useState(false);

  function updateSlide(index, changes) {
    setSlides((current) => current.map((slide, i) => i === index ? { ...slide, ...changes } : slide));
  }
  async function save() {
    setBusy(true);
    try {
      await apiRequest(`/courses/lessons/${lesson._id}`, { method: 'PATCH', body: { title: title.trim(), deck: { slides } } });
      onFlash('Slide deck updated.', 'success'); setEditing(false); onChanged();
    } catch (err) { onFlash(err.message); } finally { setBusy(false); }
  }
  async function togglePublished() {
    setBusy(true);
    try {
      await apiRequest(`/courses/lessons/${lesson._id}`, { method: 'PATCH', body: { published: !lesson.published } });
      onFlash(lesson.published ? 'Deck unpublished from students.' : 'Deck published to students.', 'success'); onChanged();
    } catch (err) { onFlash(err.message); } finally { setBusy(false); }
  }
  async function remove() {
    if (!await showConfirm(`Delete “${lesson.title}” permanently? This action cannot be undone.`, { title: 'Delete slide deck', confirmLabel: 'Delete deck', danger: true })) return;
    setBusy(true);
    try { await apiRequest(`/courses/lessons/${lesson._id}`, { method: 'DELETE' }); onFlash('Slide deck deleted.', 'success'); onChanged(); }
    catch (err) { onFlash(err.message); setBusy(false); }
  }

  return (
    <div style={{ marginTop: 10 }}>
      <div className="flex gap-2 flex-wrap">
        <button type="button" className="btn" onClick={() => { setTitle(lesson.title); setSlides(structuredClone(lesson.deck?.slides || [])); setEditing((value) => !value); }} disabled={busy}>{editing ? 'Cancel' : 'Edit Deck'}</button>
        <button type="button" className="btn" onClick={togglePublished} disabled={busy}>{lesson.published ? 'Unpublish' : 'Publish'}</button>
        <button type="button" className="btn" onClick={remove} disabled={busy} style={{ color: 'var(--rose)' }}>Delete</button>
        <span className="text-xs" style={{ alignSelf: 'center', color: lesson.published ? 'var(--emerald)' : 'var(--ink-soft)' }}>{lesson.published ? 'Visible to students' : 'Hidden from students'}</span>
      </div>
      {editing && (
        <div className="card" style={{ padding: 14, marginTop: 10 }}>
          <label className="text-xs">Deck title<input className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} style={{ marginTop: 4 }} /></label>
          <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
            {slides.map((slide, index) => (
              <div key={index} style={{ padding: 12, border: '1px solid var(--sand-line)', borderRadius: 10 }}>
                <strong className="text-xs">Slide {index + 1}</strong>
                <input className="form-input" value={slide.title || ''} onChange={(e) => updateSlide(index, { title: e.target.value })} placeholder="Slide title" style={{ marginTop: 6 }} />
                <textarea className="form-input" rows={5} value={(slide.bullets || []).join('\n')} onChange={(e) => updateSlide(index, { bullets: e.target.value.split('\n').filter((line) => line.trim()) })} placeholder="One bullet per line" style={{ marginTop: 6 }} />
                <div className="flex gap-2 flex-wrap" style={{ marginTop: 6 }}>
                  {[['background', 'Background'], ['accent', 'Accent'], ['text', 'Text']].map(([key, label]) => <label key={key} className="text-xs">{label}<input type="color" value={slide[key] || (key === 'background' ? '#fff8e7' : key === 'accent' ? '#d97706' : '#1f2937')} onChange={(e) => updateSlide(index, { [key]: e.target.value })} style={{ display: 'block', width: 52, height: 34 }} /></label>)}
                </div>
              </div>
            ))}
          </div>
          <button type="button" className="btn btn-primary" onClick={save} disabled={busy || !title.trim()} style={{ marginTop: 12 }}>{busy ? 'Saving…' : 'Save Changes'}</button>
        </div>
      )}
    </div>
  );
}

function TeacherLessonsPanel({ courseId, onFlash, onClose }) {
  const [data, setData] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [deletingLessonId, setDeletingLessonId] = useState(null);

  function load() {
    apiRequest(`/courses/${courseId}`).then(result => { setData(result); setRefreshKey(n => n + 1); }).catch((err) => onFlash(err.message));
  }
  useEffect(load, [courseId]);

  async function removeLesson(lesson) {
    const confirmed = await showConfirm(
      `Delete “${lesson.title}” permanently? Students will no longer be able to access it, and its completion record will be removed.`,
      { title: 'Delete lesson', confirmLabel: 'Delete lesson', danger: true }
    );
    if (!confirmed) return false;

    setDeletingLessonId(lesson._id);
    try {
      await apiRequest(`/courses/lessons/${lesson._id}`, { method: 'DELETE' });
      onFlash('Lesson deleted successfully.', 'success');
      load();
    } catch (err) {
      throw err;
    } finally {
      setDeletingLessonId(null);
    }
  }

  return <div className="card reveal in material-panel">
    <div className="material-panel-head"><div><span className="material-eyebrow">Course</span><h4>{data?.course?.title || 'Lessons'}</h4></div>{onClose && <button type="button" className="btn" onClick={onClose}>Close</button>}</div>
    {data?.course && <><CompletionRulesEditor course={data.course} onFlash={onFlash} onSaved={load} /><CertificateToggle course={data.course} onFlash={onFlash} onSaved={load} /></>}
    <LearningCenter key={courseId} selectedCourseId={courseId} refreshKey={refreshKey} workspace="teacher" embedded onFlash={onFlash} onUpdated={load} onDeleteLesson={removeLesson} renderLessonExtras={l => <><LessonMetadata lessonId={l._id} canEdit={true} canReview={true} onFlash={onFlash} /><SubtitleManager lesson={l} onFlash={onFlash} onChanged={load} /><CourseForum courseId={courseId} lesson={l} onFlash={onFlash} compact />{l.kind === 'slide_deck' && l.deck?.slides?.length > 0 ? <><SlideDeckViewer title={l.title} slides={l.deck.slides} /><TeacherSlideDeckManager lesson={l} onFlash={onFlash} onChanged={load} /></> : null}</>} />
    <CourseForum courseId={courseId} onFlash={onFlash} />
  </div>;
}

// A dedicated sidebar page for "Learning Material Upload" — the document lists it separately
// from "Resource Library" (browse/read vs upload), so it gets its own course-select + the
// same real upload form "Manage Lessons" already uses (no separate content system, same data).
function TeacherMaterialUploadPanel({ onFlash }) {
  const { courses, courseId, setCourseId } = useTeacherCourses(onFlash);
  return (
    <div>
      <h3 className="font-semibold mb-2">Learning Material Upload</h3>
      <p className="text-xs mb-3" style={{ color: 'var(--ink-soft)' }}>Add lesson notes, video links and downloadable resources to any of your courses.</p>
      <CourseSelect courses={courses} value={courseId} onChange={setCourseId} />
      {courseId && <TeacherLessonsPanel courseId={courseId} onFlash={onFlash} />}
    </div>
  );
}

// "Student Communication" — a dedicated per-student contact list, separate from the generic
// "Chat System" (shared Messages tab): shows every student across the teacher's courses with
// their latest message thread, reusing /messages/conversations for the real unread/last-message data.
function TeacherStudentCommunicationPanel({ onFlash, onNavigate, onMessageUser }) {
  const { courses } = useTeacherCourses(onFlash);
  const [students, setStudents] = useState(null);
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    if (!courses || courses.length === 0) { setStudents([]); return; }
    Promise.all(courses.map((c) => apiRequest(`/courses/${c._id}/students`).then((list) => list.map((e) => ({ ...e.student, courseTitle: c.title }))).catch(() => [])))
      .then((lists) => {
        const flat = lists.flat();
        const unique = Array.from(new Map(flat.map((s) => [s._id, s])).values());
        setStudents(unique);
      });
    apiRequest('/messages/conversations').then(setConversations).catch(() => {});
  }, [courses]);

  if (students === null) return <p role="status" className="admin-notice">Loading...</p>;

  return (
    <div>
      <h3 className="font-semibold" style={{ marginBottom: 16 }}>Student Communication</h3>
      {students.length === 0 && (
        <div className="student-empty-state" style={{ border: '1px solid var(--sand-line)', borderRadius: 18 }}>
          <FaUsers aria-hidden="true" />
          <p>No students enrolled in your courses yet</p>
        </div>
      )}
      <div style={{ display: 'grid', gap: 12 }}>
        {students.map((s) => {
          const convo = conversations.find((c) => c.user._id === s._id);
          return (
            <div key={s._id} className="hover-card card" style={{ padding: 18 }}>
              <div className="flex items-center justify-between flex-wrap" style={{ gap: 14 }}>
                <div className="flex items-center" style={{ gap: 12 }}>
                  <span style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--gold)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>{s.fullName[0]}</span>
                  <div>
                    <strong className="text-sm">{s.fullName}</strong>
                    <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 2 }}>{s.courseTitle}</p>
                  </div>
                </div>
                <button type="button" className="btn btn-primary" style={{ padding: '7px 16px', fontSize: '0.78rem', flexShrink: 0 }} onClick={() => (onMessageUser ? onMessageUser(s) : onNavigate?.('messages'))}>{convo ? 'View / Reply' : 'Message'}</button>
              </div>
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--sand-line)' }}>
                {convo ? (
                  <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>"{convo.lastMessage}" — {new Date(convo.lastAt).toLocaleString()}{convo.unread > 0 ? ` · ${convo.unread} unread` : ''}</p>
                ) : (
                  <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>No messages yet.</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
