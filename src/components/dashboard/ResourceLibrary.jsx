import { useEffect, useState } from 'react';
import { FaFileLines, FaListUl, FaPlay, FaBookOpen, FaMagnifyingGlass } from 'react-icons/fa6';
import { apiRequest } from '../../api/client';
import { showConfirm } from '../../utils/appDialog';
import './resource-library.css';

function PlaylistView({ id, onFlash, onBack, onChanged }) {
  const [p, setP] = useState(null);
  function load() { apiRequest(`/library/playlists/${id}`).then(setP).catch((err) => onFlash?.(err.message)); }
  useEffect(load, [id]); // eslint-disable-line react-hooks/exhaustive-deps
  async function move(index, delta) {
    const items = [...p.items];
    const target = index + delta;
    if (target < 0 || target >= items.length) return;
    [items[index], items[target]] = [items[target], items[index]];
    try { await apiRequest(`/library/playlists/${id}`, { method: 'PATCH', body: { items: items.map((i) => ({ lesson: i.lesson?._id || i.lesson, note: i.note })) } }); load(); } catch (err) { onFlash?.(err.message); }
  }
  async function removeItem(index) {
    try { await apiRequest(`/library/playlists/${id}`, { method: 'PATCH', body: { items: p.items.filter((_, i) => i !== index).map((i) => ({ lesson: i.lesson?._id || i.lesson, note: i.note })) } }); load(); onChanged?.(); } catch (err) { onFlash?.(err.message); }
  }
  async function remove() {
    if (!(await showConfirm('Delete this playlist? The lessons themselves will remain in your library.', { title: 'Delete playlist', confirmLabel: 'Delete playlist', danger: true }))) return;
    try { await apiRequest(`/library/playlists/${id}`, { method: 'DELETE' }); onFlash?.('Playlist deleted.', 'success'); onChanged?.(); onBack(); } catch (err) { onFlash?.(err.message); }
  }
  if (!p) return <p className="text-xs">Loading playlist...</p>;
  const mine = p.owner?._id && String(p.owner._id) === String(p.owner._id) && p.mine !== false;
  return (
    <div className="rl-playlist-detail" style={{ display: 'grid', gap: 8 }}>
      <button type="button" className="btn" style={{ justifySelf: 'start' }} onClick={onBack}>← Back</button>
      <h4 className="font-semibold">{p.title}</h4>
      <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>{p.description} · by {p.owner?.fullName} · {p.visibility}</p>
      {p.items.length === 0 && <p className="text-xs">No lessons yet. Add some from the library.</p>}
      {p.items.map((item, i) => (
        <div key={i} className="card" style={{ padding: 10, display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <span><strong>{i + 1}. {item.lesson?.title || 'Removed lesson'}</strong> <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>{item.lesson?.course?.title}{item.note ? ` · ${item.note}` : ''}</span></span>
          <span className="flex gap-2">
            {item.lesson?.videoUrl && <a className="btn" href={item.lesson.videoUrl} target="_blank" rel="noreferrer"><FaPlay aria-hidden="true" /> Watch</a>}
            {mine && <><button type="button" className="btn" onClick={() => move(i, -1)} disabled={i === 0}>↑</button><button type="button" className="btn" onClick={() => move(i, 1)} disabled={i === p.items.length - 1}>↓</button><button type="button" className="btn" onClick={() => removeItem(i)}>Remove</button></>}
          </span>
        </div>
      ))}
      {mine && <button type="button" className="btn" style={{ justifySelf: 'start' }} onClick={remove}>Delete playlist</button>}
    </div>
  );
}

// Resource Library: every lesson you can open, filtered by subject / grade / semester / teacher,
// plus playlists (private, or shared with a course / institution by its teacher).
export default function ResourceLibrary({ onFlash, canShare = false }) {
  const [filters, setFilters] = useState({ q: '', subject: '', grade: '', semester: '', teacher: '' });
  const [data, setData] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [openPlaylist, setOpenPlaylist] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', visibility: 'private', course: '' });

  const key = JSON.stringify(filters);
  useEffect(() => {
    const t = setTimeout(() => {
      const params = new URLSearchParams(Object.entries(filters).filter(([, v]) => v));
      apiRequest(`/library/resources/search?${params}`).then(setData).catch((err) => onFlash?.(err.message));
    }, 250);
    return () => clearTimeout(t);
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  function loadPlaylists() { apiRequest('/library/playlists').then(setPlaylists).catch((err) => onFlash?.(err.message)); }
  useEffect(loadPlaylists, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function createPlaylist(e) {
    e.preventDefault();
    try {
      await apiRequest('/library/playlists', { method: 'POST', body: { ...form, items: [] } });
      onFlash?.('Playlist created. Add lessons with "+ Playlist".', 'success');
      setForm({ title: '', description: '', visibility: 'private', course: '' });
      loadPlaylists();
    } catch (err) { onFlash?.(err.message); }
  }
  async function addToPlaylist(playlistId, lesson) {
    const playlist = await apiRequest(`/library/playlists/${playlistId}`).catch((err) => { onFlash?.(err.message); return null; });
    if (!playlist) return;
    if (playlist.items.some((i) => String(i.lesson?._id || i.lesson) === String(lesson._id))) return onFlash?.('Already in that playlist.');
    try {
      await apiRequest(`/library/playlists/${playlistId}`, { method: 'PATCH', body: { items: [...playlist.items.map((i) => ({ lesson: i.lesson?._id || i.lesson, note: i.note })), { lesson: lesson._id }] } });
      onFlash?.(`Added to "${playlist.title}".`, 'success');
      loadPlaylists();
    } catch (err) { onFlash?.(err.message); }
  }

  const mine = playlists.filter((p) => p.mine);
  const courses = data ? [...new Map(data.lessons.map((l) => [l.course._id, l.course])).values()] : [];
  return (
    <div className="institution-ui resource-library" style={{ display: 'grid', gap: 16 }}>
      <header className="rl-heading"><span aria-hidden="true"><FaBookOpen /></span><div><h2>Resource Library</h2><p>{canShare ? 'Find lesson materials and organize them into playlists for your teaching.' : 'Find lesson materials and organize revision playlists for your studies.'}</p></div></header>
      <section className="card rl-playlists" style={{ padding: 14 }}>
        <div className="rl-section-heading"><div><h3><FaListUl aria-hidden="true" /> Your playlists</h3><p>{canShare ? 'Keep related lessons together. Choose a course when you want to share with students.' : 'Keep related lessons together and build playlists for your revision.'}</p></div><span className="rl-count">{playlists.length} playlist{playlists.length === 1 ? '' : 's'}</span></div>
        {openPlaylist ? <PlaylistView id={openPlaylist} onFlash={onFlash} onBack={() => setOpenPlaylist(null)} onChanged={loadPlaylists} /> : (
          <>
            <div className="flex gap-2 flex-wrap rl-playlist-list" style={{ marginTop: 8 }}>
              {playlists.length === 0 && <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>No playlists yet.</span>}
              {playlists.map((p) => <button type="button" key={p._id} className="btn" onClick={() => setOpenPlaylist(p._id)}>{p.title} <span className="text-xs">({p.itemCount}{p.mine ? '' : ` · ${p.owner?.fullName}`})</span></button>)}
            </div>
            <form onSubmit={createPlaylist} className={`rl-create-playlist${canShare ? '' : ' rl-create-private'}`} style={{ marginTop: 10 }}>
              <label>Playlist title<input className="form-input" placeholder="For example: Physics revision" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required style={{ flex: '2 1 180px' }} /></label>
              <label><span>Description <small>(optional)</small></span><input className="form-input" placeholder="A short description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ flex: '2 1 180px' }} /></label>
              {canShare && (
                <label>Who can view it?<select className="form-select" value={form.visibility === 'course' ? form.course : ''} onChange={(e) => setForm({ ...form, visibility: e.target.value ? 'course' : 'private', course: e.target.value })} style={{ flex: '1 1 160px' }}>
                  <option value="">Private (only me)</option>
                  {courses.map((c) => <option key={c._id} value={c._id}>Share with {c.title} students</option>)}
                </select></label>
              )}
              <button type="submit" className="btn btn-primary">Create playlist</button>
            </form>
          </>
        )}
      </section>

      <section className="rl-resources" style={{ display: 'grid', gap: 8 }}>
        <div className="rl-section-heading"><div><h3>Browse lesson resources</h3><p>Search by title or narrow the library by subject, class, semester and teacher.</p></div>{data && <span className="rl-count">{data.lessons.length} lesson{data.lessons.length === 1 ? '' : 's'}</span>}</div>
        <div className="rl-filters">
          <label className="rl-search">Search lessons<span><FaMagnifyingGlass aria-hidden="true" /><input className="form-input" placeholder="Search your library…" value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} style={{ flex: '2 1 200px' }} /></span></label>
          {[['subject', 'subjects', 'All subjects'], ['grade', 'grades', 'All grades / classes'], ['semester', 'semesters', 'All semesters']].map(([field, facet, label]) => (
            <label key={field}>{({subject:'Subject',grade:'Class / grade',semester:'Semester'})[field]}<select className="form-select" value={filters[field]} onChange={(e) => setFilters({ ...filters, [field]: e.target.value })} style={{ flex: '1 1 140px' }}>
              <option value="">{label}</option>{(data?.facets?.[facet] || []).map((v) => <option key={v} value={v}>{v}</option>)}
            </select></label>
          ))}
          <label>Teacher<select className="form-select" value={filters.teacher} onChange={(e) => setFilters({ ...filters, teacher: e.target.value })} style={{ flex: '1 1 140px' }}>
            <option value="">All teachers</option>{(data?.facets?.teachers || []).map((t) => <option key={t._id} value={t._id}>{t.fullName}</option>)}
          </select></label>
        </div>
        {!data && <p role="status" className="admin-notice">Loading...</p>}
        {data?.lessons.length === 0 && <div className="student-empty-state"><FaFileLines aria-hidden="true" /><p>No lessons match these filters.</p></div>}
        {data?.lessons.map((l) => (
          <div key={l._id} className="card rl-resource-card" style={{ padding: 12, display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
            <div>
              <strong className="rl-resource-title"><FaFileLines aria-hidden="true" />{l.title}</strong>
              <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 2 }}>{l.course.title}{l.course.subject ? ` · ${l.course.subject}` : ''}{l.course.grade ? ` · ${l.course.grade}` : ''}{l.course.academicTerm ? ` · ${l.course.academicTerm}` : ''}{l.teacher ? ` · ${l.teacher.fullName}` : ''}{l.aiAssisted ? ' · AI-assisted' : ''}</p>
              <p className="text-xs rl-resource-links" style={{ marginTop: 4 }}>
                {l.videoUrl && <a href={l.videoUrl} target="_blank" rel="noreferrer" style={{ marginRight: 10 }}>Video</a>}
                {l.resources.map((r, i) => <a key={i} href={r.url} target="_blank" rel="noreferrer" style={{ marginRight: 10 }}>{r.name || 'Resource'}</a>)}
              </p>
            </div>
            {mine.length > 0 && (
              <select className="form-select" value="" onChange={(e) => e.target.value && addToPlaylist(e.target.value, l)} style={{ maxWidth: 190, alignSelf: 'center' }}>
                <option value="">+ Playlist</option>{mine.map((p) => <option key={p._id} value={p._id}>{p.title}</option>)}
              </select>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}
