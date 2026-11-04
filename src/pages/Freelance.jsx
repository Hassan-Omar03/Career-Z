import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import AuthNavbar from '../components/AuthNavbar';
import SiteFooter from '../components/SiteFooter';
import PageSeo from '../components/PageSeo';
import ShareBar from '../components/ShareBar';
import { CATEGORY_LABEL, TIER_LABEL, money, Reputation } from '../components/freelance/shared';
import { rememberIntent } from '../utils/continueIntent';

export function FreelanceList() {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState(null), [error, setError] = useState('');
  const [q, setQ] = useState(params.get('q') || '');
  useEffect(() => { setData(null); apiRequest(`/freelance/services?${params}`, { auth: false }).then(setData).catch((e) => setError(e.message)); }, [params]);
  const go = (next) => { const p = Object.fromEntries(params.entries()); delete p.page; const merged = { ...p, ...next }; Object.keys(merged).forEach((k) => { if (!merged[k]) delete merged[k]; }); setParams(merged); };
  return (
    <>
      <PageSeo title="Freelance Services in Pakistan" description="Hire verified tutors, consultants, designers, developers, writers and translators on CareerZ. Your payment is held until you approve the work." path="/freelance" keywords={['freelance services Pakistan', 'online tutor', 'hire freelancer', 'career counselling', 'admission consultancy']} />
      <AuthNavbar />
      <main className="discover-page">
        <div className="fl-hub-head">
          <div><h1>Freelance services</h1><p className="fl-muted">Hire verified people for tuition, consultancy, design, writing and more. CareerZ holds your payment until you approve the work.</p></div>
          <Link className="btn btn-outline" to="/dashboard?tab=freelance&freelanceHub=services">Offer your service</Link>
        </div>
        <form className="fl-actions fl-filters" onSubmit={(e) => { e.preventDefault(); go({ q }); }}>
          <input className="form-input fl-grow" type="search" aria-label="Search services" placeholder="Search services" value={q} onChange={(e) => setQ(e.target.value)} />
          <select className="form-select fl-medium" aria-label="Category" value={params.get('category') || ''} onChange={(e) => go({ category: e.target.value })}>
            <option value="">All categories</option>{Object.entries(CATEGORY_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <input className="form-input fl-small" type="number" min="0" aria-label="Lowest price" placeholder="Min price" defaultValue={params.get('minPrice') || ''} onBlur={(e) => go({ minPrice: e.target.value })} />
          <input className="form-input fl-small" type="number" min="0" aria-label="Highest price" placeholder="Max price" defaultValue={params.get('maxPrice') || ''} onBlur={(e) => go({ maxPrice: e.target.value })} />
          <select className="form-select fl-medium" aria-label="Sort" value={params.get('sort') || ''} onChange={(e) => go({ sort: e.target.value })}>
            <option value="">Newest first</option><option value="price_low">Lowest price</option><option value="price_high">Highest price</option>
          </select>
          <button type="submit" className="btn btn-primary">Search</button>
        </form>
        {error && <p className="discover-error" role="alert">{error}</p>}
        {!data && !error && <p>Loading…</p>}
        {data && !data.items.length && <div className="discover-empty"><p>No services found.</p></div>}
        {data && data.items.length > 0 && (
          <div className="discover-grid">{data.items.map((s) => (
            <article key={s._id} className="dc-card">
              {s.image && <Link to={`/freelance/${s._id}`}><img className="dc-job-image" src={s.image} alt="" loading="lazy" /></Link>}
              <h3><Link to={`/freelance/${s._id}`}>{s.title}</Link></h3>
              <p className="dc-sub"><Link to={`/freelancer/${s.seller?._id}`}>{s.seller?.name}</Link>{s.seller?.city ? ` · ${s.seller.city}` : ''}</p>
              <ul className="dc-facts"><li>{CATEGORY_LABEL[s.category]}</li><li>{s.fastest} days</li>{s.rating != null && <li>{s.rating} of 5 ({s.reviewCount})</li>}</ul>
              <p><strong>From {money(s.currency, s.startingAt)}</strong></p>
            </article>
          ))}</div>
        )}
        {data && data.pages > 1 && <div className="discover-pages"><button type="button" className="btn btn-ghost" disabled={data.page <= 1} onClick={() => go({ page: String(data.page - 1) })}>Previous</button><span>Page {data.page} of {data.pages}</span><button type="button" className="btn btn-ghost" disabled={data.page >= data.pages} onClick={() => go({ page: String(data.page + 1) })}>Next</button></div>}
      </main>
      <SiteFooter />
    </>
  );
}

export function FreelanceDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [s, setS] = useState(null), [error, setError] = useState(''), [busy, setBusy] = useState(false);
  useEffect(() => { apiRequest(`/freelance/services/${id}`, { auth: false }).then(setS).catch((e) => setError(e.message)); }, [id]);
  async function order(tier) {
    // After login, sign-up and approval the visitor comes back to this service.
    if (!user) { rememberIntent(`/freelance/${id}`, s?.title); navigate('/login'); return; }
    setBusy(true); setError('');
    try { const o = await apiRequest(`/freelance/services/${id}/order`, { method: 'POST', body: { tier } }); navigate(`/dashboard?tab=freelance&order=${o._id}`); } catch (e) { setError(e.message); setBusy(false); }
  }
  return (
    <>
      <PageSeo title={s ? s.title : 'Freelance service'} description={s ? `${s.title} by ${s.seller?.name}. Payment held by CareerZ until you approve the work.` : 'A freelance service on CareerZ.'} path={`/freelance/${id}`} image={s?.image} />
      <AuthNavbar />
      <main className="discover-page">
        {error && !s && <div className="discover-empty"><h1>Not available</h1><p>{error}</p><Link className="btn btn-primary" to="/freelance">See all services</Link></div>}
        {!s && !error && <p>Loading…</p>}
        {s && (
          <article className="discover-detail">
            <ShareBar title={s.title} />
            <header><h1>{s.title}</h1><p className="dc-sub"><Link style={{ color: 'inherit' }} to={`/freelancer/${s.seller?._id}`}>{s.seller?.name}</Link>{s.profile?.type ? ` · ${s.profile.type}` : ''} · {CATEGORY_LABEL[s.category]}</p></header>
            {s.image && <img className="jd-image" src={s.image} alt="" />}
            {s.description && <section><h2>About this service</h2><p className="fl-pre">{s.description}</p></section>}
            <section>
              <h2>Compare packages</h2>
              <div className="fl-scroll"><table className="fl-table fl-compare">
                <thead><tr><th aria-label="Detail" />{s.packages.map((p) => <th key={p.tier} scope="col">{TIER_LABEL[p.tier]}{p.name ? <span className="fl-muted">{p.name}</span> : null}</th>)}</tr></thead>
                <tbody>
                  <tr><th scope="row">Price</th>{s.packages.map((p) => <td key={p.tier}><strong>{money(s.currency, p.price)}</strong></td>)}</tr>
                  <tr><th scope="row">Delivery</th>{s.packages.map((p) => <td key={p.tier}>{p.deliveryDays} days</td>)}</tr>
                  <tr><th scope="row">Revisions</th>{s.packages.map((p) => <td key={p.tier}>{p.revisions}</td>)}</tr>
                  <tr><th scope="row">Included</th>{s.packages.map((p) => <td key={p.tier}>{p.includes || '—'}</td>)}</tr>
                  <tr><th scope="row" aria-label="Order" />{s.packages.map((p) => <td key={p.tier}>{String(user?._id) === String(s.seller?._id) ? <span className="fl-muted">Your service</span> : <button type="button" className="btn btn-primary" disabled={busy} onClick={() => order(p.tier)}>Order</button>}</td>)}</tr>
                </tbody>
              </table></div>
              {error && <p className="vf-error" role="alert">{error}</p>}
              <p className="fl-muted">CareerZ adds its service fee when you pay, holds the payment, and releases it to the freelancer when you approve the work. If there is a problem, CareerZ decides.</p>
            </section>
            <section>
              <h2>About the freelancer</h2>
              {s.profile?.headline && <p><strong>{s.profile.headline}</strong></p>}
              {s.profile?.about && <p className="fl-pre">{s.profile.about}</p>}
              {s.profile?.skills?.length > 0 && <p className="dc-tags">{s.profile.skills.map((k) => <span key={k}>{k}</span>)}</p>}
              <Reputation data={s.reputation} />
              <p><Link to={`/freelancer/${s.seller?._id}`}>See the full profile and other services</Link></p>
              {s.profile?.portfolio?.length > 0 && <ul className="fl-mini">{s.profile.portfolio.map((p, i) => <li key={i}>{p.url ? <a href={p.url} target="_blank" rel="noreferrer">{p.title || p.url}</a> : p.title}</li>)}</ul>}
            </section>
            {s.reviews?.length > 0 && <section><h2>Reviews</h2><ul className="fl-log">{s.reviews.map((r, i) => <li key={i}><strong>{r.rating} of 5</strong> <span className="fl-muted">{r.by}</span>{r.text && <p>{r.text}</p>}</li>)}</ul></section>}
          </article>
        )}
      </main>
      <SiteFooter />
    </>
  );
}

export function FreelancerProfile() {
  const { id } = useParams();
  const [d, setD] = useState(null), [error, setError] = useState('');
  useEffect(() => { apiRequest(`/freelance/freelancers/${id}`, { auth: false }).then(setD).catch((e) => setError(e.message)); }, [id]);
  return (
    <>
      <PageSeo title={d ? `${d.name} – Freelancer` : 'Freelancer'} description={d?.profile?.headline || 'A freelancer on CareerZ.'} path={`/freelancer/${id}`} />
      <AuthNavbar />
      <main className="discover-page">
        {error && <div className="discover-empty"><h1>Not available</h1><p>{error}</p><Link className="btn btn-primary" to="/freelance">See all services</Link></div>}
        {!d && !error && <p>Loading…</p>}
        {d && (
          <article className="discover-detail">
            <header><h1>{d.name}</h1><p className="dc-sub">{[d.profile?.type, d.city].filter(Boolean).join(' · ')}</p></header>
            <section>
              <h2>About</h2>
              {d.profile?.headline && <p><strong>{d.profile.headline}</strong></p>}
              {d.profile?.about && <p className="fl-pre">{d.profile.about}</p>}
              {d.profile?.skills?.length > 0 && <p className="dc-tags">{d.profile.skills.map((k) => <span key={k}>{k}</span>)}</p>}
              <Reputation data={d.reputation} />
            </section>
            {d.profile?.portfolio?.length > 0 && <section><h2>Portfolio</h2><ul className="fl-mini">{d.profile.portfolio.map((p, i) => <li key={i}>{p.url ? <a href={p.url} target="_blank" rel="noreferrer">{p.title || p.url}</a> : p.title}</li>)}</ul></section>}
            <section>
              <h2>Services</h2>
              {!d.services.length ? <p>No services right now.</p> : <div className="discover-grid">{d.services.map((s) => (
                <article key={s._id} className="dc-card">
                  {s.image && <Link to={`/freelance/${s._id}`}><img className="dc-job-image" src={s.image} alt="" loading="lazy" /></Link>}
                  <h3><Link to={`/freelance/${s._id}`}>{s.title}</Link></h3>
                  <ul className="dc-facts"><li>{CATEGORY_LABEL[s.category]}</li><li>{s.fastest} days</li></ul>
                  <p><strong>From {money(s.currency, s.startingAt)}</strong></p>
                </article>
              ))}</div>}
            </section>
            {d.reviews.length > 0 && <section><h2>Reviews</h2><ul className="fl-log">{d.reviews.map((r, i) => <li key={i}><strong>{r.rating} of 5</strong> <span className="fl-muted">{r.by}</span>{r.text && <p>{r.text}</p>}</li>)}</ul></section>}
          </article>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
