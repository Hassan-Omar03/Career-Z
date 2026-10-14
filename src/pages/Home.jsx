import AuthNavbar from '../components/AuthNavbar';
import SiteFooter from '../components/SiteFooter';
import PageSeo from '../components/PageSeo';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import LiveTicker from '../components/LiveTicker';
import AiConsole from '../components/AiConsole';
import { apiRequest } from '../api/client';
import { JobCard, ScholarshipCard, InstituteCard, ProductCard, DonorCard, CardSkeleton } from '../components/discover/DiscoverCards';
import '../styles/discover.css';

// Live sections below the hero come from the database (GET /api/public/home): only published,
// approved listings from verified publishers. Nothing in them is sample data.
const SECTIONS = [
  ['jobs', 'Latest jobs', 'Jobs and internships from verified employers and education agents.', JobCard, 'job', 'View All Jobs'],
  ['scholarships', 'Latest scholarships', 'Open scholarships funded by verified donors.', ScholarshipCard, 'item', 'View All Scholarships'],
  ['institutes', 'Verified institutes', 'Schools, colleges and universities verified by CareerZ.', InstituteCard, 'item', 'View All Institutes'],
  ['marketplace', 'Marketplace', 'Books, equipment and services from verified sellers.', ProductCard, 'item', 'View All Marketplace Listings'],
  ['donors', 'Donors', 'Donors and organizations who chose to share a public profile.', DonorCard, 'item', 'View All Donors']
];
const STATS = [
  ['activeJobs', 'Active jobs', '/jobs'], ['activeScholarships', 'Open scholarships', '/scholarships'], ['approvedInstitutes', 'Verified institutes', '/institutes'],
  ['activeMarketplaceListings', 'Marketplace listings', '/marketplace'], ['publicDonors', 'Public donors', '/donors'], ['registeredUsers', 'Registered members', '/signup']
];
const EMPTY = {
  jobs: 'No open jobs yet. Verified employers and agents can post from their dashboard.',
  scholarships: 'No open scholarships yet. Verified donors can publish them from their dashboard.',
  institutes: 'No verified institutes yet.',
  marketplace: 'No listings yet. Verified sellers can list items from their dashboard.',
  donors: 'No public donor profiles yet. Donors can publish one from their dashboard.'
};
// Ticker lines from the newest real listings.
function tickerItems(data) {
  if (!data) return [];
  return [
    ...data.jobs.slice(0, 4).map((j) => `New job: ${j.title} at ${j.company}`),
    ...data.scholarships.slice(0, 3).map((s) => `Scholarship open: ${s.title}`),
    ...data.institutes.slice(0, 3).map((i) => `Verified institute: ${i.name}`),
    ...data.marketplace.slice(0, 2).map((p) => `Marketplace: ${p.title}`)
  ];
}

const ROLE_CHIPS = ['Students', 'Parents', 'Teachers', 'Institutions', 'Employers', 'Agents', 'Donors'];

export default function Home() {
  const [scrollPct, setScrollPct] = useState(0);
  const [data, setData] = useState(null), [loadError, setLoadError] = useState('');
  const load = () => { setLoadError(''); apiRequest('/public/home', { auth: false }).then(setData).catch((e) => setLoadError(e.message || 'Could not load the latest listings.')); };
  useEffect(load, []);

  useEffect(() => {
    function onScroll() {
      const h = document.documentElement;
      const pct = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
      setScrollPct(pct || 0);
    }
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="home-page">
      <div id="scroll-progress" style={{ width: `${scrollPct}%` }}></div>

      <PageSeo title="Global AI-Powered Education Ecosystem" description="Connect education, learning and career opportunities with CareerZ." /><LiveTicker items={tickerItems(data)} />

      <AuthNavbar />    <section className="hero">
        <div className="container hero-grid">
          <div className="reveal in">
            <div className="eyebrow">The Global AI Education Ecosystem</div>
            <h1>The Complete <em>AI-Powered</em> Education Ecosystem</h1>
            <p className="lead">CareerZ.pk connects students, parents, teachers, institutions, employers, agents and donors — guided by AI, from admission to career. Built for students, institutions and educators worldwide.</p>
            <div className="hero-actions">
              <Link to="/signup" className="btn btn-primary">Explore CareerZ</Link>
              <Link to="/signup" className="btn btn-outline">Register Your Institution</Link>
            </div>
            <div className="hero-roles">
              {ROLE_CHIPS.map((r) => <span key={r} className="role-chip">{r}</span>)}
            </div>
          </div>

          <AiConsole />
        </div>
      </section>

      <section className="container home-stats" aria-label="Platform statistics">
        {STATS.map(([key, text, to]) => <Link key={key} to={to} className="home-stat"><strong>{data ? Number(data.stats[key] || 0).toLocaleString() : '…'}</strong><span>{text}</span></Link>)}
      </section>
      {loadError && <p className="container discover-error" role="alert">{loadError} <button type="button" className="btn" onClick={load}>Retry</button></p>}
      {SECTIONS.map(([key, title, intro, Card, prop, more]) => (
        <section key={key} className="container home-section">
          <div className="home-section-head"><div><h2>{title}</h2><p>{intro}</p></div><Link to={`/${key}`} className="btn">{more}</Link></div>
          <div className="discover-grid">
            {!data && !loadError && Array.from({ length: 3 }, (_, i) => <CardSkeleton key={i} />)}
            {data?.[key]?.map((item) => <Card key={item._id} {...{ [prop]: item }} />)}
          </div>
          {data && !data[key]?.length && <p className="discover-empty-line">{EMPTY[key]}</p>}
        </section>
      ))}

      <section className="section-pad"><div className="container"><h2>Education to opportunity</h2><div className="public-page-links">{[['Institutes','institutes','Connect with your institution and campus community.'],['Courses','courses','Learn online, on campus and with downloaded resources.'],['Jobs','jobs','Explore career opportunities and placement support.'],['Scholarships','scholarships','Find support for your education.'],['Marketplace','marketplace','Explore education products and services.']].map(([title,slug,desc])=><Link key={slug} className="discovery-card" to={'/'+slug}><h3>{title}</h3><p>{desc}</p></Link>)}</div></div></section>
      <section className="section-pad"><div className="container"><h2>One platform for your education community</h2><div className="public-page-links">{[['Students and parents','Follow enrolled courses, class schedules, assignments and learning progress.'],['Teachers','Organize lessons, lead live classes, manage discussions and review assessments.'],['Institutions','Manage memberships, staff permissions, timetables and attendance.'],['Employers, agents and donors','Connect education with placement opportunities and learning support.']].map(([title,description])=><article className="discovery-card" key={title}><h3>{title}</h3><p>{description}</p></article>)}</div></div></section>
      <section className="section-pad"><div className="container"><h2>Get started in three steps</h2><ol><li>Create and verify your CareerZ account.</li><li>Complete your profile and join the relevant institution or workspace.</li><li>Explore your approved courses, resources and opportunities.</li></ol><Link className="btn btn-primary" to="/signup">Create your account</Link> <Link className="btn btn-outline" to="/help">Visit Help Center</Link></div></section>
      <SiteFooter />
    </div>
  );
}
