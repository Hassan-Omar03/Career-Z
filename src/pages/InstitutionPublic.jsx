import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiRequest } from '../api/client';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Public institution page: /i/:subdomain (and /i/:subdomain/:page). Uses the institution's own
// branding colours, banner, tagline and published pages.
export default function InstitutionPublic() {
  const { subdomain, page } = useParams();
  const [info, setInfo] = useState(null);
  const [content, setContent] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest(`/institutions/by-subdomain/${subdomain}`, { auth: false }).then(setInfo).catch((err) => setError(err.message));
  }, [subdomain]);
  useEffect(() => {
    setContent(null);
    if (info && page) apiRequest(`/institutions/${info.institution._id}/pages/${page}`, { auth: false }).then(setContent).catch((err) => setError(err.message));
  }, [info, page]);

  if (error) return <div style={{ padding: 40 }}><h2>Not found</h2><p>{error}</p><Link to="/">CareerZ home</Link></div>;
  if (!info) return <div style={{ padding: 40 }}>Loading…</div>;
  const primary = info.branding?.primaryColor || '#123c2f';
  const accent = info.branding?.accentColor || '#d4a017';
  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper, #faf7f0)' }}>
      <header style={{ color: '#fff', padding: '40px 24px', background: info.branding?.bannerUrl ? `linear-gradient(rgba(0,0,0,.45), rgba(0,0,0,.45)), url(${info.branding.bannerUrl}) center/cover` : `linear-gradient(135deg, ${primary}, ${accent})` }}>
        <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', gap: 16, alignItems: 'center' }}>
          {info.institution.logo && <img src={info.institution.logo} alt="" style={{ width: 64, height: 64, borderRadius: 12, background: '#fff', objectFit: 'contain' }} />}
          <div>
            <h1 style={{ fontSize: '2rem', margin: 0 }}>{info.institution.name}</h1>
            {info.branding?.tagline && <p style={{ margin: '4px 0 0' }}>{info.branding.tagline}</p>}
          </div>
        </div>
      </header>
      <nav style={{ maxWidth: 960, margin: '0 auto', padding: '12px 24px', display: 'flex', gap: 16, flexWrap: 'wrap', borderBottom: `3px solid ${accent}` }}>
        <Link to={`/i/${subdomain}`} style={{ color: primary, fontWeight: 700 }}>Home</Link>
        {info.pages.map((p) => <Link key={p.slug} to={`/i/${subdomain}/${p.slug}`} style={{ color: primary }}>{p.title}</Link>)}
        <Link to="/signup" style={{ marginLeft: 'auto', color: primary, fontWeight: 700 }}>Apply / Sign up</Link>
      </nav>
      <main style={{ maxWidth: 960, margin: '0 auto', padding: 24 }}>
        {page ? (content ? <article><h2>{content.title}</h2><div style={{ whiteSpace: 'pre-wrap', marginTop: 12 }}>{content.body}</div></article> : <p>Loading…</p>) : (
          <section>
            <h2>Welcome</h2>
            <p style={{ marginTop: 8 }}>Open {info.workingDays.map((d) => DAYS[d]).join(', ')} · {info.schoolHours?.start}–{info.schoolHours?.end} ({info.timezone})</p>
          </section>
        )}
      </main>
    </div>
  );
}
