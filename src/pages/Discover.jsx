import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import AuthNavbar from '../components/AuthNavbar';
import SiteFooter from '../components/SiteFooter';
import PageSeo from '../components/PageSeo';
import { apiRequest } from '../api/client';
import { JobCard, ScholarshipCard, InstituteCard, ProductCard, DonorCard, CardSkeleton, place, dateText, money } from '../components/discover/DiscoverCards';
import ActionPanel, { post } from '../components/discover/ActionPanel';
import MarkdownText from '../components/shared/MarkdownText';
import '../styles/discover.css';

// Public "View All" pages (/jobs, /scholarships, /institutes, /marketplace, /donors) and their
// detail pages. Filters are sent to the server, so they search every eligible record, not just
// what is on screen. Browsing never needs an account; actions go through ActionPanel.

const JOB_TYPES = [['full_time', 'Full time'], ['part_time', 'Part time'], ['internship', 'Internship'], ['freelance', 'Freelance'], ['government', 'Government'], ['ngo', 'NGO']];
const INSTITUTE_TYPES = [['school', 'School'], ['college', 'College'], ['university', 'University'], ['academy', 'Academy'], ['madrasa', 'Madrasa'], ['tuition_center', 'Tuition centre'], ['training_institute', 'Training institute'], ['online_institute', 'Online institute']];
const PRODUCT_CATEGORIES = [['books', 'Books'], ['stationery', 'Stationery'], ['uniform', 'Uniform'], ['electronics', 'Electronics'], ['courses', 'Courses'], ['services', 'Services'], ['other', 'Other']];

export const KINDS = {
  jobs: { title: 'Jobs', intro: 'Open jobs and internships from verified employers and education agents.', Card: JobCard, prop: 'job', search: 'Job title, company or skill',
    filters: [['country', 'Country'], ['city', 'City'], ['type', 'Employment type', JOB_TYPES], ['workMode', 'Work mode', [['onsite', 'On-site'], ['remote', 'Remote'], ['hybrid', 'Hybrid']]], ['maxExperience', 'Max. experience (years)', 'number'], ['minSalary', 'Min. salary', 'number']] },
  scholarships: { title: 'Scholarships', intro: 'Open scholarships funded by verified donors.', Card: ScholarshipCard, prop: 'item', search: 'Scholarship name or field',
    filters: [['country', 'Country'], ['minAmount', 'Min. amount', 'number'], ['deadlineBefore', 'Deadline before', 'date']] },
  institutes: { title: 'Institutes', intro: 'Schools, colleges, universities and academies verified by CareerZ.', Card: InstituteCard, prop: 'item', search: 'Institute name or city',
    filters: [['country', 'Country'], ['city', 'City'], ['type', 'Type', INSTITUTE_TYPES]] },
  marketplace: { title: 'Marketplace', intro: 'Books, equipment, uniforms and services from verified sellers.', Card: ProductCard, prop: 'item', search: 'Product name',
    filters: [['category', 'Category', PRODUCT_CATEGORIES], ['minPrice', 'Min. price', 'number'], ['maxPrice', 'Max. price', 'number'], ['sort', 'Sort', [['newest', 'Newest'], ['price_asc', 'Price: low to high'], ['price_desc', 'Price: high to low']]]] },
  donors: { title: 'Donors', intro: 'Verified donors and organizations who chose to share a public profile.', Card: DonorCard, prop: 'item', search: 'Donor name or cause',
    filters: [['country', 'Country'], ['city', 'City']] }
};

function Shell({ title, description, path, children }) {
  return <><PageSeo title={title} description={description} path={path} /><AuthNavbar /><main className="discover-page">{children}</main><SiteFooter /></>;
}

export function ListingPage({ kind }) {
  const cfg = KINDS[kind];
  const [params, setParams] = useSearchParams();
  const [state, setState] = useState({ loading: true, data: null, error: '' });
  const [draft, setDraft] = useState(() => Object.fromEntries(params.entries()));
  const query = params.toString();
  useEffect(() => {
    let alive = true;
    setState((s) => ({ ...s, loading: true, error: '' }));
    apiRequest(`/public/${kind}?${query}&limit=12`, { auth: false })
      .then((data) => { if (alive) setState({ loading: false, data, error: '' }); })
      .catch((e) => { if (alive) setState({ loading: false, data: null, error: e.message || 'Could not load listings.' }); });
    return () => { alive = false; };
  }, [kind, query]);
  useEffect(() => { setDraft(Object.fromEntries(params.entries())); }, [query]);

  function apply(e) {
    e.preventDefault();
    const next = Object.fromEntries(Object.entries(draft).filter(([k, v]) => k !== 'page' && String(v || '').trim()));
    setParams(next);
  }
  const page = Number(params.get('page')) || 1;
  const goPage = (n) => { const next = Object.fromEntries(params.entries()); next.page = String(n); setParams(next); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const { Card } = cfg;
  return <Shell title={cfg.title} description={cfg.intro} path={`/${kind}`}>
    <header className="discover-hero"><nav className="public-breadcrumb" aria-label="Breadcrumb"><Link to="/">Home</Link><span>/</span><span>{cfg.title}</span></nav><h1>{cfg.title}</h1><p>{cfg.intro}</p></header>
    <form className="discover-filters" onSubmit={apply} role="search">
      <label className="df-wide">Search<input className="form-input" type="search" placeholder={cfg.search} value={draft.q || ''} onChange={(e) => setDraft({ ...draft, q: e.target.value })} /></label>
      {cfg.filters.map(([key, text, opts]) => <label key={key}>{text}
        {Array.isArray(opts)
          ? <select className="form-select" value={draft[key] || ''} onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}><option value="">Any</option>{opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
          : <input className="form-input" type={opts === 'number' ? 'number' : opts === 'date' ? 'date' : 'text'} min={opts === 'number' ? 0 : undefined} value={draft[key] || ''} onChange={(e) => setDraft({ ...draft, [key]: e.target.value })} />}
      </label>)}
      <div className="df-buttons"><button type="submit" className="btn btn-primary">Search</button>{query && <button type="button" className="btn" onClick={() => { setDraft({}); setParams({}); }}>Clear</button>}</div>
    </form>
    {state.error && <p className="discover-error" role="alert">{state.error} <button type="button" className="btn" onClick={() => setParams(Object.fromEntries(params.entries()))}>Retry</button></p>}
    {!state.error && <p className="discover-count" role="status">{state.loading ? 'Loading…' : `${state.data.total} ${state.data.total === 1 ? 'result' : 'results'}`}</p>}
    <div className="discover-grid">
      {state.loading && Array.from({ length: 6 }, (_, i) => <CardSkeleton key={i} />)}
      {!state.loading && state.data?.items.map((item) => <Card key={item._id} {...{ [cfg.prop]: item }} />)}
    </div>
    {!state.loading && !state.error && state.data?.total === 0 && <div className="discover-empty"><h2>Nothing listed {query ? 'for this search' : 'yet'}</h2><p>{query ? 'Try fewer filters or a different word.' : 'New verified listings appear here automatically as soon as they are published.'}</p></div>}
    {!state.loading && state.data?.pages > 1 && <nav className="discover-pages" aria-label="Pages">
      <button type="button" className="btn" disabled={page <= 1} onClick={() => goPage(page - 1)}>Previous</button>
      <span>Page {page} of {state.data.pages}</span>
      <button type="button" className="btn" disabled={page >= state.data.pages} onClick={() => goPage(page + 1)}>Next</button>
    </nav>}
  </Shell>;
}

// ---------------------------------------------------------------- detail pages
function useDetail(kind, id) {
  const [state, setState] = useState({ loading: true, item: null, error: '' });
  useEffect(() => {
    let alive = true;
    setState({ loading: true, item: null, error: '' });
    apiRequest(`/public/${kind}/${id}`, { auth: false }).then((item) => { if (alive) setState({ loading: false, item, error: '' }); }).catch((e) => { if (alive) setState({ loading: false, item: null, error: e.message || 'Not available.' }); });
    return () => { alive = false; };
  }, [kind, id]);
  return state;
}

function DetailShell({ kind, state, children }) {
  const cfg = KINDS[kind];
  const name = state.item?.title || state.item?.name;
  return <Shell title={name || cfg.title} description={cfg.intro} path={`/${kind}`}>
    <nav className="public-breadcrumb discover-crumb" aria-label="Breadcrumb"><Link to="/">Home</Link><span>/</span><Link to={`/${kind}`}>{cfg.title}</Link>{name && <><span>/</span><span>{name}</span></>}</nav>
    {state.loading && <div className="discover-detail"><CardSkeleton /></div>}
    {state.error && <div className="discover-empty"><h1>Not available</h1><p>{state.error}</p><Link className="btn btn-primary" to={`/${kind}`}>See all {cfg.title.toLowerCase()}</Link></div>}
    {state.item && children(state.item)}
  </Shell>;
}

const Facts = ({ rows }) => <dl className="dp-facts">{rows.filter(([, v]) => v || v === 0).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>;

export function JobDetail() {
  const { id } = useParams(); const [params] = useSearchParams();
  const state = useDetail('jobs', id);
  const [cover, setCover] = useState('');
  return <DetailShell kind="jobs" state={state}>{(job) => <article className="discover-detail">
    <header><h1>{job.title}</h1><p className="dc-sub">{job.company}{job.postedBy ? ` · posted by ${job.postedBy.kind} ${job.postedBy.name}` : ''}</p></header>
    <Facts rows={[['Location', place(job.city, job.country)], ['Employment type', job.type.replace('_', ' ')], ['Work mode', job.workMode], ['Salary', job.salaryMin || job.salaryMax ? `${job.currency} ${[job.salaryMin, job.salaryMax].filter(Boolean).join(' – ')}` : ''], ['Experience', job.experienceYears ? `${job.experienceYears}+ years` : ''], ['Education', job.education], ['Apply by', dateText(job.applicationDeadline)], ['Posted', dateText(job.postedAt)], ['Visa sponsorship', job.visaSponsorship ? 'Yes' : '']]} />
    {job.skills?.length > 0 && <p className="dc-tags">{job.skills.map((s) => <span key={s}>{s}</span>)}</p>}
    {job.description && <section><h2>About the job</h2><MarkdownText text={job.description} /></section>}
    <ActionPanel kind="jobs" item={job} autoOpen={params.get('action') === 'apply'} actionLabel="Apply for this job" eligibleRoles={['student', 'teacher']} signupType="student"
      onSubmit={() => post(`/jobs/${job._id}/apply`, { coverLetter: cover })} successText="Application sent. The employer can now see it." trackLink={{ to: '/dashboard', label: 'Track it in your dashboard → Jobs → My Applications' }}>
      <label>Cover letter (optional)<textarea className="form-input" rows={5} maxLength={4000} value={cover} onChange={(e) => setCover(e.target.value)} placeholder="Why you are a good fit" /></label>
      <p className="dp-note">Your CareerZ CV is attached automatically.</p>
    </ActionPanel>
  </article>}</DetailShell>;
}

export function ScholarshipDetail() {
  const { id } = useParams(); const [params] = useSearchParams();
  const state = useDetail('scholarships', id);
  const [statement, setStatement] = useState('');
  return <DetailShell kind="scholarships" state={state}>{(s) => <article className="discover-detail">
    <header><h1>{s.title}</h1><p className="dc-sub">By {s.provider?.profile ? <Link to={s.provider.profile}>{s.provider.name}</Link> : s.provider?.name}</p></header>
    <Facts rows={[['Amount', money(s.amount, s.currency)], ['Country', s.country], ['Seats left', s.seatsAvailable], ['Apply by', dateText(s.applicationDeadline)], ['Posted', dateText(s.postedAt)]]} />
    {s.eligibility && <section><h2>Who can apply</h2><MarkdownText text={s.eligibility} /></section>}
    {s.description && <section><h2>About this scholarship</h2><MarkdownText text={s.description} /></section>}
    <ActionPanel kind="scholarships" item={s} autoOpen={params.get('action') === 'apply'} actionLabel="Apply for this scholarship" eligibleRoles={['student']} signupType="student"
      onSubmit={() => post(`/scholarships/${s._id}/apply`, { statement })} successText="Application sent to the donor." trackLink={{ to: '/dashboard', label: 'Track it in your dashboard → Scholarships' }}>
      <label>Why should you receive this scholarship?<textarea className="form-input" rows={6} maxLength={4000} required value={statement} onChange={(e) => setStatement(e.target.value)} /></label>
    </ActionPanel>
  </article>}</DetailShell>;
}

export function InstituteDetail() {
  const { id } = useParams(); const [params] = useSearchParams();
  const state = useDetail('institutes', id);
  const [program, setProgram] = useState('');
  return <DetailShell kind="institutes" state={state}>{(i) => <article className="discover-detail">
    {i.coverImage && <img className="dp-cover" src={i.coverImage} alt="" />}
    <header className="dp-head">{i.logo && <img src={i.logo} alt="" className="dc-logo" />}<div><h1>{i.name}</h1><p className="dc-sub">{i.type.replace('_', ' ')} · {place(i.city, i.country)} · Verified institute</p></div></header>
    {i.description && <section><h2>Overview</h2><MarkdownText text={i.description} /></section>}
    {(i.website || i.website_page) && <p className="dc-actions">{i.website_page && <Link className="btn" to={i.website_page}>Institute website on CareerZ</Link>}{i.website && <a className="btn" href={i.website} target="_blank" rel="noreferrer">Official website</a>}</p>}
    {i.programs.length > 0 && <section><h2>Programs</h2><ul className="dp-list">{i.programs.map((p) => <li key={p.name}><strong>{p.name}</strong>{p.department ? ` · ${p.department}` : ''}{p.durationTerms ? ` · ${p.durationTerms} terms` : ''}{p.tuition ? ` · tuition ${money(p.tuition, p.currency)}` : ''}{p.admissionFee ? ` · admission ${money(p.admissionFee, p.currency)}` : ''}</li>)}</ul></section>}
    {i.courses.length > 0 && <section><h2>Courses</h2><ul className="dp-list">{i.courses.map((c) => <li key={c._id}>{c.title}{c.subject && c.subject !== c.title ? ` · ${c.subject}` : ''}{c.level ? ` · ${c.level}` : ''}</li>)}</ul></section>}
    {i.jobs.length > 0 && <section><h2>Open jobs at {i.name}</h2><ul className="dp-list">{i.jobs.map((j) => <li key={j._id}><Link to={`/jobs/${j._id}`}>{j.title}</Link>{j.location ? ` · ${j.location}` : ''}</li>)}</ul></section>}
    {i.programs.length > 0
      ? <ActionPanel kind="institutes" item={i} autoOpen={params.get('action') === 'admission'} actionLabel="Apply for admission" eligibleRoles={['student']} signupType="student"
          onSubmit={() => post('/institution-applications', { institution: i._id, program, submit: true })} successText="Admission application sent to the institute." trackLink={{ to: '/dashboard', label: 'Track it in your dashboard → Applications' }}>
          <label>Program<select className="form-select" required value={program} onChange={(e) => setProgram(e.target.value)}><option value="">Select a program…</option>{i.programs.map((p) => <option key={p.name} value={p.name}>{p.name}</option>)}</select></label>
        </ActionPanel>
      : <p className="dp-note">This institute has not opened admissions on CareerZ yet.</p>}
  </article>}</DetailShell>;
}

export function ProductDetail() {
  const { id } = useParams(); const [params] = useSearchParams();
  const state = useDetail('marketplace', id);
  const [order, setOrder] = useState({ quantity: 1, shippingAddress: '', note: '' });
  return <DetailShell kind="marketplace" state={state}>{(p) => <article className="discover-detail">
    {p.images?.length > 0 && <div className="dp-gallery">{p.images.map((src) => <img key={src} src={src} alt="" loading="lazy" />)}</div>}
    <header><h1>{p.title}</h1><p className="dc-sub">{p.category}{p.seller ? ` · sold by ${p.seller.name}` : ''}</p></header>
    <Facts rows={[['Price', money(p.price, p.currency)], ['In stock', p.stock], ['Seller city', p.seller?.city], ['Listed', dateText(p.postedAt)]]} />
    {p.description && <section><h2>Description</h2><MarkdownText text={p.description} /></section>}
    <ActionPanel kind="marketplace" item={p} autoOpen={params.get('action') === 'order'} actionLabel="Order this item" signupType="student"
      onSubmit={() => post(`/marketplace/products/${p._id}/orders`, order)} successText="Order placed. The seller has been notified." trackLink={{ to: '/dashboard', label: 'See it in your dashboard → Marketplace → My Orders' }}>
      <label>Quantity<input className="form-input" type="number" min={1} max={p.stock} required value={order.quantity} onChange={(e) => setOrder({ ...order, quantity: Number(e.target.value) })} /></label>
      <label>Delivery address<textarea className="form-input" rows={2} required value={order.shippingAddress} onChange={(e) => setOrder({ ...order, shippingAddress: e.target.value })} /></label>
      <label>Note to seller (optional)<input className="form-input" value={order.note} onChange={(e) => setOrder({ ...order, note: e.target.value })} /></label>
    </ActionPanel>
  </article>}</DetailShell>;
}

export function DonorDetail() {
  const { id } = useParams();
  const state = useDetail('donors', id);
  return <DetailShell kind="donors" state={state}>{(d) => <article className="discover-detail">
    <header className="dp-head">{d.logo && <img src={d.logo} alt="" className="dc-logo" />}<div><h1>{d.name}</h1><p className="dc-sub">{d.type}{place(d.city, d.country) ? ` · ${place(d.city, d.country)}` : ''} · Verified donor</p></div></header>
    {d.about && <section><h2>About</h2><MarkdownText text={d.about} /></section>}
    {d.focusAreas?.length > 0 && <p className="dc-tags">{d.focusAreas.map((f) => <span key={f}>{f}</span>)}</p>}
    <section><h2>Open scholarships</h2>{d.scholarships?.length ? <div className="discover-grid">{d.scholarships.map((s) => <ScholarshipCard key={s._id} item={s} />)}</div> : <p>No open scholarships right now.</p>}</section>
  </article>}</DetailShell>;
}
