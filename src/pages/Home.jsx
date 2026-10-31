import AuthNavbar from '../components/AuthNavbar';
import SiteFooter from '../components/SiteFooter';
import PageSeo from '../components/PageSeo';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LiveTicker from '../components/LiveTicker';
import AiConsole from '../components/AiConsole';
import { apiRequest, API_BASE } from '../api/client';
import { DonorCard, CardSkeleton, place, daysLeft, dateText } from '../components/discover/DiscoverCards';
import '../styles/discover.css';
import '../styles/moderation.css';
import { FaGooglePlay, FaApple } from 'react-icons/fa6';
import LiveActivityToasts from '../components/discover/LiveActivityToasts';
import { AdSlot } from '../components/ads/Ads';
import {
  FaBullseye, FaChartLine, FaUserTie, FaShieldHalved, FaGraduationCap, FaRobot, FaBriefcase, FaChartColumn, FaClipboardList, FaCommentDots,
  FaFilePen, FaChalkboardUser, FaBuilding, FaMoneyBillWave, FaChartPie, FaPaperPlane, FaMagnifyingGlass, FaFolderOpen, FaHandshake, FaSackDollar,
  FaMoneyBillTransfer, FaGift, FaTrophy, FaCreditCard, FaCalendarCheck, FaFileLines, FaPersonChalkboard, FaSchool, FaBook, FaPenRuler, FaShirt,
  FaLaptop, FaVideo, FaToolbox, FaBoxArchive, FaCircleCheck, FaEarthAmericas, FaLink, FaLock, FaStar, FaArrowUpRightFromSquare
} from 'react-icons/fa6';

// The homepage in the original CareerZ design (_source-html/index.html). Every card, number and
// name below the hero comes from the database: GET /api/public/home (listings) and
// GET /api/public/home/sections (numbers, courses, teachers, employers, blog, programmes). Only
// published records from active, verified accounts are returned; nothing here is sample data.
// The descriptive blocks (AI features, portals, modules, FAQ) describe what the platform does.

const COLORS = ['#0E4D3C', '#1B8A63', '#E3A23C', '#C75C4D', '#0A3A2D', '#22A876'];
const color = (i) => COLORS[i % COLORS.length];
const initials = (name) => String(name || '').split(/\s+/).filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
const label = (s) => String(s || '').replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
const amount = (n, currency) => `${currency || ''} ${Number(n).toLocaleString()}`.trim();
const ROLE_CHIPS = ['Students', 'Parents', 'Teachers', 'Institutions', 'Employers', 'Agents', 'Donors'];

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

const STATS = [
  ['approvedInstitutes', 'Verified Institutions', '/institutes'], ['students', 'Students', '/signup?type=student'], ['teachers', 'Teachers', '/signup?type=teacher'], ['courses', 'Courses', '/courses'],
  ['employers', 'Employers', '/jobs'], ['educationAgents', 'Education Agents', '/signup?type=agent'], ['cities', 'Cities', '/institutes'], ['scholarshipsAwarded', 'Scholarships Awarded', '/scholarships']
];
const AI_FEATURES = [
  [<FaBullseye />, 'AI Admission Matching', 'Matches students to institutions based on grades, budget and goals.'],
  [<FaChartLine />, 'Smart Analytics', 'Institutions get real-time dashboards on enrollment and performance.'],
  [<FaUserTie />, 'AI Career Counseling', "Personalized guidance for every student's career path."],
  [<FaShieldHalved />, 'Risk Detection', 'Flags at-risk students early so teachers can intervene sooner.']
];
const PORTALS = [
  ['Student', 'student', [[<FaGraduationCap />, 'Apply to institutions'], [<FaRobot />, 'AI Tutor & study planner'], [<FaBriefcase />, 'Browse jobs & internships']]],
  ['Parent', 'parent', [[<FaChartColumn />, 'Track child progress'], [<FaClipboardList />, 'Performance reports'], [<FaCommentDots />, 'Direct teacher messaging']]],
  ['Teacher', 'teacher', [[<FaFilePen />, 'AI lesson & quiz generator'], [<FaChalkboardUser />, 'Classroom management'], [<FaChartPie />, 'Student insights']]],
  ['Institution', 'institute', [[<FaBuilding />, 'Admissions management'], [<FaMoneyBillWave />, 'Fee & finance tools'], [<FaChartLine />, 'Academic analytics']]],
  ['Employer', 'agent', [[<FaPaperPlane />, 'Post jobs & internships'], [<FaMagnifyingGlass />, 'Search verified graduates'], [<FaFolderOpen />, 'Manage applicants']]],
  ['Agent', 'agent', [[<FaHandshake />, 'Track referrals'], [<FaSackDollar />, 'Commission dashboard'], [<FaMoneyBillTransfer />, 'Withdraw earnings']]],
  ['Donor', 'donor', [[<FaGift />, 'Sponsor students directly'], [<FaTrophy />, 'Fund scholarship pools'], [<FaChartColumn />, 'Impact tracking']]]
];
const MODULES = [
  [<FaFilePen />, 'Admissions', 'Online applications, document verification and merit lists.'],
  [<FaCreditCard />, 'Fee Management', 'Automated invoicing, online payments and reminders.'],
  [<FaCalendarCheck />, 'Attendance', 'Biometric and manual attendance tracking for staff and students.'],
  [<FaFileLines />, 'Examinations', 'Online and offline exam scheduling, grading and report cards.']
];
const SELLERS = [
  [<FaGraduationCap />, 'Student Seller', ['Sell notes & past papers', 'Sell study guides', 'Build your seller profile']],
  [<FaPersonChalkboard />, 'Teacher Seller', ['Sell your own courses', 'License lesson plans', 'Earn recurring royalties']],
  [<FaSchool />, 'Institution Seller', ['Sell prospectuses & kits', 'Offer official study material', 'Bulk licensing to students']]
];
const AI_ECO = {
  'Teacher AI': ['AI Lesson Planner', 'AI Lecture Generator', 'AI Quiz Generator', 'AI Assignment Generator', 'AI Homework Generator', 'AI MCQ Generator', 'AI Exam Paper Generator', 'AI Presentation Generator', 'AI Classroom Assistant'],
  'Student AI': ['Ask AI Questions', 'AI Tutor', 'Personalized Learning', 'AI Study Planner', 'AI Practice Tests', 'AI Exam Preparation'],
  'Parent AI': ['Child Progress Insights', 'Performance Reports', 'Improvement Suggestions'],
  'Institution AI': ['Academic Analytics', 'Performance Dashboard', 'Teacher Insights', 'Student Risk Detection', 'Smart Reports']
};
const MARKET_ICONS = { books: <FaBook />, stationery: <FaPenRuler />, uniform: <FaShirt />, electronics: <FaLaptop />, courses: <FaVideo />, services: <FaToolbox />, other: <FaBoxArchive /> };
const FAQS = [
  ['Is CareerZ.pk free for students?', 'Yes. Searching institutions, courses, jobs and scholarships, applying for admission and using the AI assistant are free for students. Some teachers and institutes sell paid courses, and the price is always shown before you pay.'],
  ['How are institutions verified?', 'Every institution submits its registration documents, which the CareerZ team reviews by hand. Only approved institutions appear on the homepage and in search.'],
  ['Where can I buy or sell educational products?', 'In the CareerZ Marketplace. Anyone can browse it; verified sellers list books, notes, equipment and services from their dashboard, and buyers order with a student or parent account.'],
  ['How does the Education Agent Program work?', 'Verified agents post jobs and refer candidates. When a referred candidate is hired, the agent earns the platform commission on that placement and can withdraw it from the agent dashboard.'],
  ['Can institutions manage admissions on CareerZ?', 'Yes. Institutions receive admission applications, review documents and run fees, attendance, exams, timetables and staff from one dashboard.']
];
const SEARCH_TABS = [
  ['institutes', 'Institutions', 'Search by name, city or program...'], ['courses', 'Courses', 'Search by course name or subject...'],
  ['jobs', 'Jobs', 'Search by job title, company or skill...'], ['scholarships', 'Scholarships', 'Search by scholarship name or field...']
];
const INSTITUTE_LEVELS = [['school', 'School'], ['college', 'College'], ['university', 'University'], ['academy', 'Academy'], ['training_institute', 'Vocational'], ['madrasa', 'Madrasa'], ['tuition_center', 'Tuition centre'], ['online_institute', 'Online institute']];
const JOB_TYPES = [['full_time', 'Full time'], ['part_time', 'Part time'], ['internship', 'Internship'], ['freelance', 'Freelance'], ['government', 'Government'], ['ngo', 'NGO']];
const DEADLINES = [['30', 'Closing within 30 days'], ['90', 'Closing within 90 days']];

// Adds the design's fade-in to elements with .reveal as they scroll into view.
function useReveal(deps) {
  useEffect(() => {
    const els = document.querySelectorAll('.home-page .reveal:not(.in)');
    if (!('IntersectionObserver' in window)) { els.forEach((el) => el.classList.add('in')); return undefined; }
    const io = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.08 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
}

// Counts up to the real number once the stats band is on screen.
function CountUp({ value }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (value === null || value === undefined) return undefined;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !('IntersectionObserver' in window)) { setShown(value); return undefined; }
    let frame;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (now) => { const p = Math.min((now - start) / 1400, 1); setShown(Math.floor((1 - (1 - p) ** 3) * value)); if (p < 1) frame = requestAnimationFrame(tick); };
      frame = requestAnimationFrame(tick);
    }, { threshold: 0.3 });
    if (ref.current) io.observe(ref.current);
    return () => { io.disconnect(); cancelAnimationFrame(frame); };
  }, [value]);
  return <span ref={ref}>{value === null || value === undefined ? '…' : shown.toLocaleString()}</span>;
}

function SectionHead({ eyebrow, title, intro, more, center, dark }) {
  return (
    <div className="section-head reveal home-design-head" style={center ? { margin: '0 auto 40px', textAlign: 'center', maxWidth: 680 } : undefined}>
      <div>
        <div className="eyebrow" style={{ ...(center ? { justifyContent: 'center' } : {}), ...(dark ? { color: 'var(--gold)' } : {}) }}>{eyebrow}</div>
        <h2 style={dark ? { color: '#fff' } : undefined}>{title}</h2>
        {intro && <p style={dark ? { color: 'rgba(255,255,255,.7)' } : undefined}>{intro}</p>}
      </div>
      {more && <Link to={more[0]} className="btn-ghost">{more[1]} →</Link>}
    </div>
  );
}
const Empty = ({ children, to, action }) => <p className="discover-empty-line">{children}{to && <> <Link to={to}>{action}</Link></>}</p>;
const Skeletons = ({ n = 4 }) => Array.from({ length: n }, (_, i) => <CardSkeleton key={i} />);

function HomeSearch({ options }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState('institutes');
  const [form, setForm] = useState({ q: '', country: '', city: '', level: '' });
  const [cities, setCities] = useState([]);
  useEffect(() => {
    setCities([]);
    if (!form.country) return undefined;
    let alive = true;
    apiRequest(`/public/cities?country=${encodeURIComponent(form.country)}`, { auth: false }).then((c) => { if (alive) setCities(c); }).catch(() => {});
    return () => { alive = false; };
  }, [form.country]);
  const levels = tab === 'institutes' ? INSTITUTE_LEVELS : tab === 'courses' ? (options?.courseLevels || []).map((l) => [l, l]) : tab === 'jobs' ? JOB_TYPES : DEADLINES;
  const levelText = tab === 'institutes' ? 'All Levels' : tab === 'courses' ? 'All Levels' : tab === 'jobs' ? 'All Job Types' : 'Any Deadline';
  function submit(e) {
    e.preventDefault();
    const p = new URLSearchParams();
    if (form.q.trim()) p.set('q', form.q.trim());
    if (form.country) p.set('country', form.country);
    if (form.city && tab !== 'scholarships') p.set('city', form.city);
    if (form.level) {
      if (tab === 'institutes' || tab === 'jobs') p.set('type', form.level);
      else if (tab === 'courses') p.set('level', form.level);
      else p.set('deadlineBefore', new Date(Date.now() + Number(form.level) * 864e5).toISOString().slice(0, 10));
    }
    navigate(`/${tab}${p.toString() ? `?${p}` : ''}`);
  }
  return (
    <section className="search-section">
      <div className="container">
        <form className="search-box reveal" onSubmit={submit} role="search" aria-label="Search CareerZ">
          <div className="search-tabs" role="tablist">
            {SEARCH_TABS.map(([key, text]) => <button key={key} type="button" role="tab" aria-selected={tab === key} className={tab === key ? 'active' : ''} onClick={() => { setTab(key); setForm((f) => ({ ...f, level: '' })); }}>{text}</button>)}
          </div>
          <div className="search-row">
            <input type="search" aria-label="Search" placeholder={SEARCH_TABS.find((t) => t[0] === tab)[2]} value={form.q} onChange={(e) => setForm({ ...form, q: e.target.value })} />
            <select aria-label="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value, city: '' })}>
              <option value="">All Countries</option>
              {(options?.countries || []).map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
            </select>
            <select aria-label="City" value={form.city} disabled={tab === 'scholarships' || !form.country} onChange={(e) => setForm({ ...form, city: e.target.value })}>
              <option value="">All Cities</option>
              {cities.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select aria-label={levelText} value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
              <option value="">{levelText}</option>
              {levels.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
            </select>
            <button type="submit" className="btn btn-primary">Search</button>
          </div>
        </form>
      </div>
    </section>
  );
}

function InstituteGrid({ items, empty, offset = 0 }) {
  if (!items) return <div className="grid g4"><Skeletons /></div>;
  if (!items.length) return empty;
  return (
    <div className="grid g4">
      {items.map((it, i) => (
        <Link key={it._id} to={`/institutes/${it._id}`} className="card inst-card reveal home-card-link">
          {it.logo ? <img className="logo-circle" src={it.logo} alt="" loading="lazy" style={{ objectFit: 'cover' }} /> : <div className="logo-circle" style={{ color: color(i + offset) }}>{initials(it.name)}</div>}
          <h4>{it.name}</h4>
          <div className="meta">{label(it.type)}{place(it.city, it.country) ? ` · ${place(it.city, it.country)}` : ''}</div>
          <div className="tag-row"><span className="tag">Verified</span>{(it.programs || []).slice(0, 1).map((p) => <span key={p} className="tag">{p}</span>)}</div>
        </Link>
      ))}
    </div>
  );
}

export default function Home() {
  const [scrollPct, setScrollPct] = useState(0);
  const [data, setData] = useState(null), [loadError, setLoadError] = useState('');
  // Hero text the Super Admin edits in Content → Website Pages (built-in text until then).
  const [hero, setHero] = useState({});
  useEffect(() => { apiRequest('/site-content/home', { auth: false }).then((v) => setHero(v || {})).catch(() => {}); }, []);
  const h = (k, d) => (hero[k] ? hero[k] : d);
  const [extra, setExtra] = useState(null);
  const [options, setOptions] = useState(null);
  const [portal, setPortal] = useState(0), [eco, setEco] = useState(0), [faq, setFaq] = useState(-1);
  const load = () => {
    setLoadError('');
    apiRequest('/public/home', { auth: false }).then(setData).catch((e) => setLoadError(e.message || 'Could not load the latest listings.'));
    apiRequest('/public/home/sections', { auth: false }).then(setExtra).catch(() => setExtra({ failed: true }));
  };
  useEffect(load, []);
  useEffect(() => { apiRequest('/public/search-options', { auth: false }).then(setOptions).catch(() => setOptions({ countries: [], courseLevels: [] })); }, []);
  useReveal([data, extra, portal, eco]);

  useEffect(() => {
    function onScroll() {
      const h = document.documentElement;
      const pct = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
      setScrollPct(pct || 0);
    }
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const stats = extra?.stats;
  const prog = extra?.programmes;
  const sections = extra && !extra.failed ? extra : null;

  return (
    <div className="home-page">
      <div id="scroll-progress" style={{ width: `${scrollPct}%` }}></div>

      <PageSeo title="Global AI-Powered Education Ecosystem" description="Connect education, learning and career opportunities with CareerZ." /><LiveTicker items={tickerItems(data)} />

      <AuthNavbar />    {hero.announcement && <div className="home-announcement" role="status">{hero.announcement}</div>}
    <section className="hero">
        <div className="container hero-grid">
          <div className="reveal in">
            <div className="eyebrow">{h('eyebrow', 'The Global AI Education Ecosystem')}</div>
            <h1>{h('titleStart', 'The Complete')} <em>{h('titleEmphasis', 'AI-Powered')}</em> {h('titleEnd', 'Education Ecosystem')}</h1>
            <p className="lead">{h('lead', 'CareerZ.pk connects students, parents, teachers, institutions, employers, agents and donors — guided by AI, from admission to career. Built for students, institutions and educators worldwide.')}</p>
            <div className="hero-actions">
              <Link to="/signup" className="btn btn-primary">{h('primaryLabel', 'Explore CareerZ')}</Link>
              <Link to="/signup?type=institute" className="btn btn-outline">{h('secondaryLabel', 'Register Your Institution')}</Link>
            </div>
            <div className="hero-roles">
              {ROLE_CHIPS.map((r) => <span key={r} className="role-chip">{r}</span>)}
            </div>
          </div>

          <AiConsole />
        </div>
      </section>

      <HomeSearch options={options} />

      {/* Platform numbers, counted live from the database */}
      <section className="section-pad home-stats-wrap" id="stats" aria-label="Platform statistics">
        <div className="container">
          <div className="stats-band home-stats-band">
            <div className="stat-grid">
              {STATS.map(([key, text, to]) => (
                <Link key={key} to={to} className="stat-item reveal home-stat-link">
                  <div className="num"><CountUp value={stats ? Number(stats[key] || 0) : null} /></div>
                  <div className="label">{text}</div>
                </Link>
              ))}
            </div>
          </div>
          {loadError && <p className="discover-error" role="alert">{loadError} <button type="button" className="btn" onClick={load}>Retry</button></p>}
        </div>
      </section>

      <section className="section-pad" id="institutions">
        <div className="container">
          <AdSlot placement="home" />
          <SectionHead eyebrow="Verified Network" title="Featured institutions across our global network" intro="Verified schools, colleges, universities and academies — all in one place." more={['/institutes', 'View All Institutes']} />
          <InstituteGrid items={data?.institutes} empty={<Empty to="/signup?type=institute" action="Register your institution">No verified institutions yet.</Empty>} />
        </div>
      </section>

      <section className="section-pad" style={{ background: 'var(--sand)' }}>
        <div className="container">
          <SectionHead eyebrow="Why CareerZ AI" title="Intelligence built into every decision" intro="From choosing a university to preparing for an exam, CareerZ AI guides every stakeholder." />
          <div className="grid g4">{AI_FEATURES.map(([ic, t, d]) => <div key={t} className="card feature-card reveal"><div className="ic">{ic}</div><h4>{t}</h4><p>{d}</p></div>)}</div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container">
          <SectionHead eyebrow="Built For Everyone" title="A dedicated portal for every role" intro="Switch roles to see what CareerZ offers you specifically." />
          <div className="portal-tabs" role="tablist">{PORTALS.map(([role], i) => <button key={role} type="button" role="tab" aria-selected={portal === i} className={portal === i ? 'active' : ''} onClick={() => setPortal(i)}>{role}</button>)}</div>
          <div className="portal-panel grid g3 active">
            {PORTALS[portal][2].map(([ic, t]) => <Link key={t} to={`/signup?type=${PORTALS[portal][1]}`} className="card feature-card reveal home-card-link"><div className="ic">{ic}</div><h4>{t}</h4></Link>)}
          </div>
        </div>
      </section>

      <section className="section-pad" style={{ background: 'var(--sand)' }}>
        <div className="container">
          <SectionHead eyebrow="For Institutions" title="Every module an institution needs" intro="Admissions, fee management, attendance, exams and analytics — unified." />
          <div className="grid g4">{MODULES.map(([ic, t, d]) => <div key={t} className="card feature-card reveal"><div className="ic">{ic}</div><h4>{t}</h4><p>{d}</p></div>)}</div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container">
          <SectionHead eyebrow="Test Prep & Coaching" title="Featured academies" intro="Verified academies, tuition centres and training institutes." more={['/institutes?type=academy', 'View All Academies']} />
          <InstituteGrid items={sections?.academies} offset={2} empty={<Empty to="/signup?type=institute" action="Register your academy">No verified academies yet.</Empty>} />
        </div>
      </section>

      <section className="section-pad" id="jobs">
        <div className="container">
          <SectionHead eyebrow="Career Opportunities" title="Jobs from verified employers" intro="Education and entry-level roles, posted directly by employers." more={['/jobs', 'View All Jobs']} />
          {!data ? <div className="grid g3"><Skeletons n={3} /></div> : data.jobs.length ? (
            <div className="grid g3">
              {data.jobs.slice(0, 6).map((j) => (
                <Link key={j._id} to={`/jobs/${j._id}`} className="card job-card reveal home-card-link">
                  <div className="top"><div><h4>{j.title}</h4><div className="org">{j.company}{place(j.city, j.country) ? ` · ${place(j.city, j.country)}` : ''}</div></div></div>
                  {(j.salaryMin || j.salaryMax) ? <div className="pay">{j.currency} {[j.salaryMin, j.salaryMax].filter(Boolean).map((n) => Number(n).toLocaleString()).join(' – ')}</div> : null}
                  <div className="tag-row"><span className="tag">{label(j.type)}</span>{j.workMode && <span className="tag">{label(j.workMode)}</span>}</div>
                </Link>
              ))}
            </div>
          ) : <Empty to="/signup?type=agent" action="Post a job">No open jobs yet.</Empty>}
        </div>
      </section>

      <section className="section-pad" style={{ background: 'var(--sand)' }}>
        <div className="container">
          <SectionHead eyebrow="Hiring Now" title="Featured employers" intro="Companies hiring graduates and professionals through CareerZ." />
          {!sections ? <div className="grid g4"><Skeletons /></div> : sections.employers.length ? (
            <div className="grid g4">
              {sections.employers.map((e, i) => (
                <Link key={e.name} to={`/jobs?q=${encodeURIComponent(e.name)}`} className="card inst-card reveal home-card-link">
                  {e.logo ? <img className="logo-circle" src={e.logo} alt="" loading="lazy" style={{ objectFit: 'cover' }} /> : <div className="logo-circle" style={{ color: color(i) }}>{initials(e.name)}</div>}
                  <h4>{e.name}</h4><div className="meta">{e.openJobs} open job{e.openJobs === 1 ? '' : 's'} on CareerZ</div>
                </Link>
              ))}
            </div>
          ) : <Empty to="/signup?type=agent" action="Hire on CareerZ">No employers are hiring right now.</Empty>}
        </div>
      </section>

      <section className="section-pad" id="scholarships">
        <div className="container">
          <SectionHead eyebrow="Funding Your Future" title="Active scholarships" intro="Need-based and merit-based scholarships from verified donors." more={['/scholarships', 'View All Scholarships']} />
          {!data ? <div className="grid g3"><Skeletons n={3} /></div> : data.scholarships.length ? (
            <div className="grid g3">
              {data.scholarships.slice(0, 6).map((s) => {
                const left = daysLeft(s.applicationDeadline);
                return (
                  <Link key={s._id} to={`/scholarships/${s._id}`} className="card feature-card reveal home-card-link">
                    <div className="ic"><FaGraduationCap /></div><h4>{s.title}</h4>
                    <p>{s.amount ? `Up to ${amount(s.amount, s.currency)}` : 'Amount set by the donor'}</p>
                    <p style={{ color: 'var(--gold)', fontWeight: 600, marginTop: 8 }}>{left === null ? 'Open — no deadline' : left <= 0 ? 'Closes today' : `Closes in ${left} day${left === 1 ? '' : 's'}`}</p>
                  </Link>
                );
              })}
            </div>
          ) : <Empty to="/signup?type=donor" action="Fund a scholarship">No open scholarships yet.</Empty>}
        </div>
      </section>

      <section className="section-pad" id="marketplace">
        <div className="container">
          <SectionHead eyebrow="From Verified Sellers" title="Educational marketplace preview" intro="Books, notes, past papers, equipment and services from verified sellers." more={['/marketplace', 'View All Listings']} />
          {!data ? <div className="grid g4"><Skeletons /></div> : data.marketplace.length ? (
            <div className="grid g4">
              {data.marketplace.slice(0, 8).map((m, i) => (
                <Link key={m._id} to={`/marketplace/${m._id}`} className="card market-card reveal home-card-link">
                  {m.image ? <img className="thumb" src={m.image} alt="" loading="lazy" style={{ width: '100%', objectFit: 'cover' }} /> : <div className="thumb" style={{ background: `${color(i)}1A` }}>{MARKET_ICONS[m.category] || <FaBoxArchive />}</div>}
                  <div className="body"><h5>{m.title}</h5><div className="price">{amount(m.price, m.currency)}</div></div>
                </Link>
              ))}
            </div>
          ) : <Empty to="/signup?type=marketplace" action="Become a seller">No listings yet.</Empty>}
          <div className="market-banner reveal">
            <div>
              <h3 style={{ color: '#fff', fontSize: 24 }}>The complete marketplace lives on CareerZ</h3>
              <p style={{ color: 'rgba(255,255,255,.75)', marginTop: 8 }}>Browse, buy and sell educational products — books, courses, equipment and more{stats ? ` · ${Number(stats.activeMarketplaceListings || 0).toLocaleString()} listings live now` : ''}.</p>
            </div>
            <Link to="/marketplace" className="btn btn-gold">Explore Marketplace <FaArrowUpRightFromSquare aria-hidden="true" style={{ marginLeft: 6, verticalAlign: '-2px' }} /></Link>
          </div>
        </div>
      </section>

      <section className="section-pad" style={{ background: 'var(--sand)' }}>
        <div className="container">
          <SectionHead eyebrow="Earn On CareerZ" title="Become a seller" intro="Turn your notes, courses or institutional material into income." />
          <div className="grid g3">
            {SELLERS.map(([ic, t, items], i) => (
              <div key={t} className="card seller-card reveal">
                <div className="ic">{ic}</div><h4>{t}</h4>
                <ul>{items.map((it) => <li key={it}>{it}</li>)}</ul>
                <Link to={i === 1 ? '/signup?type=teacher' : i === 2 ? '/signup?type=institute' : '/signup?type=marketplace'} className="btn btn-primary" style={{ width: '100%' }}>Start Selling</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container">
          <div className="cta-band glass reveal" style={{ background: 'linear-gradient(120deg,var(--forest-deep),var(--forest))', color: '#fff' }}>
            <div>
              <h3 style={{ color: '#fff' }}>Bring your institution onto CareerZ.pk</h3>
              <p style={{ color: 'rgba(255,255,255,.75)' }}>Reach verified students, manage admissions and run your institution smarter — with AI built in.</p>
            </div>
            <Link to="/signup?type=institute" className="btn btn-gold">Register Your Institution</Link>
          </div>
        </div>
      </section>

      <section className="section-pad" style={{ background: 'var(--sand)' }}>
        <div className="container">
          <div className="split-panel">
            <div className="reveal">
              <div className="eyebrow">Earn By Connecting Students</div>
              <h2>Education Agent Program</h2>
              <p style={{ color: 'var(--ink-soft)', margin: '16px 0 26px', maxWidth: 480 }}>Help students find the right institution and earn commission for every successful placement — with full transparency.</p>
              <Link to="/signup?type=agent" className="btn btn-primary">Become an Agent</Link>
            </div>
            <div className="visual reveal" style={{ background: 'var(--forest-deep)' }}>
              <div className="metric-row"><span>Commission per placement</span><strong>{prog ? `${prog.agent.commissionRate}%` : '…'}</strong></div>
              <div className="metric-row"><span>Application tracking</span><strong>Real-time</strong></div>
              <div className="metric-row"><span>Withdraw earnings</span><strong>From your dashboard</strong></div>
              <div className="metric-row"><span>Verified agents on CareerZ</span><strong>{prog ? prog.agent.activeAgents.toLocaleString() : '…'}</strong></div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container">
          <div className="split-panel">
            <div className="visual reveal" style={{ background: 'var(--gold)', order: 2 }}>
              <div className="metric-row" style={{ borderBottomColor: 'rgba(15,26,23,.12)' }}><span style={{ color: 'rgba(15,26,23,.7)' }}>Students sponsored</span><strong style={{ color: 'var(--forest-deep)' }}>{prog ? prog.donor.studentsSponsored.toLocaleString() : '…'}</strong></div>
              <div className="metric-row" style={{ borderBottomColor: 'rgba(15,26,23,.12)' }}><span style={{ color: 'rgba(15,26,23,.7)' }}>Scholarships funded</span><strong style={{ color: 'var(--forest-deep)' }}>{prog ? prog.donor.scholarshipsPublished.toLocaleString() : '…'}</strong></div>
              <div className="metric-row" style={{ borderBottom: 'none' }}><span style={{ color: 'rgba(15,26,23,.7)' }}>Cities reached</span><strong style={{ color: 'var(--forest-deep)' }}>{prog ? prog.donor.citiesReached.toLocaleString() : '…'}</strong></div>
            </div>
            <div className="reveal" style={{ order: 1 }}>
              <div className="eyebrow">Give The Gift Of Education</div>
              <h2>Donor Program</h2>
              <p style={{ color: 'var(--ink-soft)', margin: '16px 0 26px', maxWidth: 480 }}>Sponsor a student directly or fund a scholarship pool. Track the real impact of every contribution.</p>
              <Link to="/signup?type=donor" className="btn btn-primary">Become a Donor</Link> {data?.donors?.length > 0 && <Link to="/donors" className="btn btn-outline">Meet our donors</Link>}
            </div>
          </div>
          {data?.donors?.length > 0 && <div className="discover-grid" style={{ marginTop: 32 }}>{data.donors.slice(0, 3).map((d) => <DonorCard key={d._id} item={d} />)}</div>}
        </div>
      </section>

      <section className="section-pad" id="blog" style={{ background: 'var(--sand)' }}>
        <div className="container">
          <SectionHead eyebrow="CareerZ Journal" title="Latest from the education blog" />
          {!sections ? <div className="grid g4"><Skeletons /></div> : sections.blog.length ? (
            <div className="grid g4">
              {sections.blog.map((b, i) => (
                <Link key={b.slug} to={`/blog/${b.slug}`} className="card blog-card reveal home-card-link">
                  {b.image || b.coverPath ? <img className="thumb" src={b.image || API_BASE + b.coverPath} alt="" loading="lazy" style={{ width: '100%', objectFit: 'cover' }} /> : <div className="thumb" style={{ background: color(i) }}></div>}
                  <div className="body">{b.category && <span className="tag">{b.category}</span>}<h4>{b.title}</h4><div className="meta">{dateText(b.publishedAt)} · {b.readMinutes} min read</div></div>
                </Link>
              ))}
            </div>
          ) : <Empty>No blog posts published yet.</Empty>}
        </div>
      </section>

      <section className="section-pad home-eco" id="ai-ecosystem">
        <div className="container">
          <SectionHead dark center eyebrow="The Core Of CareerZ" title="AI-powered teaching & learning ecosystem" intro="A dedicated AI assistant for every role in the education journey. Preview only — full functionality lives inside each portal." />
          <div className="ai-eco-tabs" role="tablist">{Object.keys(AI_ECO).map((k, i) => <button key={k} type="button" role="tab" aria-selected={eco === i} className={eco === i ? 'active' : ''} onClick={() => setEco(i)}>{k}</button>)}</div>
          <div className="ai-eco-grid active">{AI_ECO[Object.keys(AI_ECO)[eco]].map((item) => <Link key={item} to="/signup" className="ai-chip">{item}</Link>)}</div>
        </div>
      </section>

      <section className="section-pad" style={{ background: 'var(--sand)' }}>
        <div className="container">
          <SectionHead eyebrow="The CareerZ Difference" title="Why choose CareerZ.pk" />
          <div className="grid g4">
            {[[<FaRobot />, 'AI Guidance', 'Every decision supported by intelligent recommendations.'],
              [<FaCircleCheck />, 'Verified Network', 'Every institution and employer is manually verified.'],
              [<FaEarthAmericas />, 'Global Reach', stats ? `Members and institutions in ${Number(stats.cities || 0).toLocaleString()} ${stats.cities === 1 ? 'city' : 'cities'} so far, built for the global education ecosystem.` : 'Built for the global education ecosystem.'],
              [<FaLink />, 'One Ecosystem', 'Admissions, jobs, scholarships and marketplace — unified.']].map(([ic, t, d]) => <div key={t} className="card feature-card reveal"><div className="ic">{ic}</div><h4>{t}</h4><p>{d}</p></div>)}
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container">
          <SectionHead eyebrow="Safety & Verification" title="Built on trust" />
          <div className="trust-grid">
            <div className="card trust-card reveal"><div className="ic"><FaShieldHalved /></div><h4>Verified institutions only</h4><p style={{ color: 'var(--ink-soft)', fontSize: 14.5, marginTop: 8 }}>Every institution is manually verified before going live on the platform.</p></div>
            <div className="card trust-card reveal"><div className="ic"><FaLock /></div><h4>Secure data handling</h4><p style={{ color: 'var(--ink-soft)', fontSize: 14.5, marginTop: 8 }}>Student and institution data is encrypted and never sold to third parties.</p></div>
            <div className="card trust-card reveal"><div className="ic"><FaStar /></div><h4>Transparent reviews</h4><p style={{ color: 'var(--ink-soft)', fontSize: 14.5, marginTop: 8 }}>Ratings come only from verified students and parents.</p></div>
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container" style={{ maxWidth: 760 }}>
          <SectionHead center eyebrow="Common Questions" title="Frequently asked questions" />
          <div>
            {FAQS.map(([q, a], i) => (
              <div key={q} className={`faq-item reveal${faq === i ? ' open' : ''}`}>
                <button type="button" className="faq-q" aria-expanded={faq === i} onClick={() => setFaq(faq === i ? -1 : i)}><span>{q}</span><span className="plus">+</span></button>
                <div className="faq-a" style={{ maxHeight: faq === i ? 400 : null }}><p>{a}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad"><div className="container"><h2>Education to opportunity</h2><div className="public-page-links">{[['Institutes','institutes','Connect with your institution and campus community.'],['Courses','courses','Learn online, on campus and with downloaded resources.'],['Jobs','jobs','Explore career opportunities and placement support.'],['Scholarships','scholarships','Find support for your education.'],['Marketplace','marketplace','Explore education products and services.']].map(([title,slug,desc])=><Link key={slug} className="discovery-card" to={'/'+slug}><h3>{title}</h3><p>{desc}</p></Link>)}</div></div></section>
      <section className="section-pad"><div className="container"><h2>One platform for your education community</h2><div className="public-page-links">{[['Students and parents','Follow enrolled courses, class schedules, assignments and learning progress.'],['Teachers','Organize lessons, lead live classes, manage discussions and review assessments.'],['Institutions','Manage memberships, staff permissions, timetables and attendance.'],['Employers, agents and donors','Connect education with placement opportunities and learning support.']].map(([title,description])=><article className="discovery-card" key={title}><h3>{title}</h3><p>{description}</p></article>)}</div></div></section>
      <section className="section-pad"><div className="container"><h2>Get started in three steps</h2><ol><li>Create and verify your CareerZ account.</li><li>Complete your profile and join the relevant institution or workspace.</li><li>Explore your approved courses, resources and opportunities.</li></ol><Link className="btn btn-primary" to="/signup">Create your account</Link> <Link className="btn btn-outline" to="/help">Visit Help Center</Link></div></section>

      <section className="section-pad">
        <div className="container">
          <div className="cta-band reveal" style={{ background: 'var(--gold)' }}>
            <div>
              <h3 style={{ color: 'var(--forest-deep)' }}>Ready to take the next step in your education journey?</h3>
              <p style={{ color: 'rgba(15,26,23,.7)' }}>Join {stats ? `${Number(stats.registeredUsers || 0).toLocaleString()} members — ` : ''}students, teachers and institutions already on CareerZ.pk.</p>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link to="/signup" className="btn btn-primary">Get Started Free</Link>
              <Link to="/contact" className="btn btn-outline">Talk to Us</Link>
            </div>
          </div>
        </div>
      </section>
      {/* Mobile apps: coming soon */}
      <section className="home-apps" aria-label="CareerZ mobile apps">
        <div className="container home-apps-inner">
          <div><h2>CareerZ on your phone</h2><p>The CareerZ mobile app for Android and iPhone is coming soon.</p></div>
          <div className="home-app-badges">
            <span className="home-app-badge" aria-label="Google Play, coming soon"><FaGooglePlay aria-hidden="true" /><span><small>Coming soon on</small><b>Google Play</b></span></span>
            <span className="home-app-badge" aria-label="App Store, coming soon"><FaApple aria-hidden="true" /><span><small>Coming soon on the</small><b>App Store</b></span></span>
          </div>
        </div>
      </section>
      <SiteFooter />
      <LiveActivityToasts />
    </div>
  );
}
