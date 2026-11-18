import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AuthNavbar from '../components/AuthNavbar';
import SiteFooter from '../components/SiteFooter';
import PageSeo from '../components/PageSeo';
import { apiRequest } from '../api/client';
import '../styles/blog.css';

// Public Events page (audit N-30): seminars, workshops, competitions and other events that verified
// institutes chose to share. Uses the same layout as the other public pages.
const TYPE_LABEL = { sports_day: 'Sports day', annual_function: 'Annual function', seminar: 'Seminar', workshop: 'Workshop', competition: 'Competition', parent_meeting: 'Parent meeting', convocation: 'Convocation', other: 'Event' };
const when = (d) => new Date(d).toLocaleString(undefined, { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: '2-digit' });

export default function PublicEvents() {
  const [events, setEvents] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { apiRequest('/public/events', { auth: false }).then(setEvents).catch((e) => { setError(e.message); setEvents([]); }); }, []);
  return (
    <>
      <PageSeo title="Education events: seminars, workshops and competitions" description="Upcoming seminars, workshops, competitions and other events from verified schools, colleges and universities on CareerZ." path="/events" />
      <AuthNavbar />
      <main className="public-page">
        <header className="public-page-hero">
          <nav className="public-breadcrumb" aria-label="Breadcrumb"><Link to="/">Home</Link><span>/</span><span>Events</span></nav>
          <h1>Events</h1>
          <p>Upcoming seminars, workshops, competitions and open days from verified institutes.</p>
        </header>
        <div className="public-page-layout">
          <article className="public-content-card">
            {events === null && <p role="status">Loading…</p>}
            {error && <p role="alert">{error}</p>}
            {events && !events.length && !error && <p>No public events are listed right now. Institutes add them from their dashboard under Events and Activities.</p>}
            {events && events.map((e) => (
              <section key={e._id} style={{ borderBottom: '1px solid var(--sand-line)', padding: '14px 0' }}>
                <h2 style={{ margin: '0 0 4px' }}>{e.title}</h2>
                <p className="text-sm" style={{ margin: 0 }}><strong>{TYPE_LABEL[e.type] || 'Event'}</strong> · {when(e.startDate)}{e.endDate ? ' to ' + when(e.endDate) : ''}</p>
                <p className="text-sm" style={{ margin: '2px 0 0' }}>{[e.venue, e.institution && [e.institution.city, e.institution.country].filter(Boolean).join(', ')].filter(Boolean).join(' · ')}{e.institution && <> · {e.institution.slug ? <Link to={'/i/' + e.institution.slug}>{e.institution.name}</Link> : e.institution.name}</>}</p>
                {e.description && <p style={{ margin: '8px 0 0' }}>{e.description}</p>}
              </section>
            ))}
          </article>
          <aside className="public-related"><h2>Explore CareerZ</h2>{[['Institutions', 'institutions'], ['Courses', 'courses'], ['Jobs', 'jobs'], ['Scholarships', 'scholarships']].map(([label, link]) => <Link key={link} to={'/' + link}>{label}</Link>)}<p>Learn, connect and find opportunities with your education community.</p><Link to="/signup">Create your account</Link></aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
