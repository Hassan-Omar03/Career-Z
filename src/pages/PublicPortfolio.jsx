import { FaCircleXmark, FaBriefcase, FaGraduationCap, FaAward, FaLink } from 'react-icons/fa6';
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiRequest, ApiError } from '../api/client';

export default function PublicPortfolio() {
  const { userId } = useParams();
  const [state, setState] = useState({ loading: true, resume: null, error: '' });

  useEffect(() => {
    let cancelled = false;
    apiRequest(`/resumes/public/${userId}`, { auth: false })
      .then((resume) => {
        if (!cancelled) setState({ loading: false, resume, error: '' });
      })
      .catch((err) => {
        if (cancelled) return;
        const message = err instanceof ApiError ? err.message : 'This portfolio is not available.';
        setState({ loading: false, resume: null, error: message });
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (state.loading) {
    return (
      <div style={styles.page}>
        <p style={styles.muted}>Loading portfolio…</p>
      </div>
    );
  }

  if (state.error) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.invalidIcon}><FaCircleXmark aria-hidden="true" /></div>
          <h2 style={styles.invalidTitle}>Portfolio Not Available</h2>
          <p style={styles.muted}>{state.error}</p>
          <Link to="/" style={styles.homeLink}>← Back to CareerZ</Link>
        </div>
      </div>
    );
  }

  const r = state.resume;
  return (
    <div style={styles.page}>
      <div style={styles.wrap}>
        <div style={styles.header}>
          {r.user?.profilePhoto
            ? <img src={r.user.profilePhoto} alt="" style={styles.photo} />
            : <div style={styles.photoFallback}>{(r.user?.fullName || '?')[0]}</div>}
          <div>
            <h1 style={styles.name}>{r.user?.fullName}</h1>
            {r.headline && <p style={styles.headline}>{r.headline}</p>}
            <p style={styles.meta}>{[r.location, r.user?.country].filter(Boolean).join(' · ')}</p>
          </div>
        </div>

        {r.summary && <p style={styles.summary}>{r.summary}</p>}

        {r.skills?.length > 0 && (
          <div style={styles.chipRow}>
            {r.skills.map((s) => <span key={s} style={styles.chip}>{s}</span>)}
          </div>
        )}

        {r.education?.length > 0 && (
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}><FaGraduationCap aria-hidden="true" /> Education</h2>
            {r.education.map((ed, i) => (
              <div key={i} style={styles.item}>
                <strong style={styles.itemTitle}>{ed.degree}</strong>
                <p style={styles.itemDesc}>{ed.institution}{ed.year ? ` · ${ed.year}` : ''}</p>
              </div>
            ))}
          </section>
        )}

        {r.experience?.length > 0 && (
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}><FaBriefcase aria-hidden="true" /> Experience</h2>
            {r.experience.map((ex, i) => (
              <div key={i} style={styles.item}>
                <strong style={styles.itemTitle}>{ex.title}{ex.company ? ` — ${ex.company}` : ''}</strong>
                <p style={styles.itemDesc}>{ex.duration}</p>
                {ex.description && <p style={styles.itemDesc}>{ex.description}</p>}
              </div>
            ))}
          </section>
        )}

        {r.portfolio?.length > 0 && (
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}><FaLink aria-hidden="true" /> Projects</h2>
            {r.portfolio.map((p, i) => (
              <div key={i} style={styles.item}>
                <strong style={styles.itemTitle}>{p.url ? <a href={p.url} target="_blank" rel="noreferrer" style={{ color: 'inherit' }}>{p.title}</a> : p.title}</strong>
                {p.description && <p style={styles.itemDesc}>{p.description}</p>}
              </div>
            ))}
          </section>
        )}

        {r.certifications?.length > 0 && (
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}><FaAward aria-hidden="true" /> Certifications</h2>
            <p style={styles.itemDesc}>{r.certifications.join(', ')}</p>
          </section>
        )}

        <Link to="/" style={styles.homeLink}>← Powered by CareerZ</Link>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#F4F1E8', padding: '48px 20px', display: 'flex', justifyContent: 'center' },
  wrap: { width: '100%', maxWidth: 640, background: '#fff', borderRadius: 20, padding: '36px 32px', boxShadow: '0 20px 60px rgba(0,0,0,0.08)' },
  card: { width: '100%', maxWidth: 420, background: '#fff', borderRadius: 16, padding: '32px 28px', textAlign: 'center', margin: 'auto' },
  muted: { color: '#8A9490', fontSize: 14 },
  invalidIcon: { width: 56, height: 56, borderRadius: '50%', background: '#fee2e2', color: '#dc2626', fontSize: 28, display: 'grid', placeItems: 'center', margin: '0 auto 12px' },
  invalidTitle: { margin: '0 0 8px', color: '#dc2626', fontSize: 18 },
  header: { display: 'flex', alignItems: 'center', gap: 18, marginBottom: 20 },
  photo: { width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 },
  photoFallback: { width: 72, height: 72, borderRadius: '50%', background: '#1B8A63', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 26, flexShrink: 0 },
  name: { margin: 0, fontSize: 24, fontFamily: 'Georgia, serif', color: '#0F3D2E' },
  headline: { margin: '4px 0 0', fontSize: 14, color: '#1B8A63', fontWeight: 600 },
  meta: { margin: '4px 0 0', fontSize: 12.5, color: '#8A9490' },
  summary: { fontSize: 14, lineHeight: 1.7, color: '#4B5A53', marginBottom: 20 },
  chipRow: { display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  chip: { fontSize: 12, padding: '5px 12px', borderRadius: 999, background: '#F4F1E8', color: '#0F3D2E', fontWeight: 600 },
  section: { marginBottom: 22 },
  sectionTitle: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: '#8A9490', marginBottom: 12 },
  item: { paddingBottom: 12, marginBottom: 12, borderBottom: '1px solid #EAE4D3' },
  itemTitle: { fontSize: 14.5, color: '#0F3D2E', display: 'block' },
  itemDesc: { fontSize: 13, color: '#4B5A53', margin: '3px 0 0', lineHeight: 1.6 },
  homeLink: { display: 'inline-block', marginTop: 12, color: '#1B8A63', fontSize: 13, textDecoration: 'none', fontWeight: 600 }
};
