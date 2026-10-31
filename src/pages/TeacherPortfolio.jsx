import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaArrowLeft, FaStar, FaGraduationCap, FaClock, FaUsers, FaBookOpen } from 'react-icons/fa6';
import { apiRequest } from '../api/client';
import PageSeo from '../components/PageSeo';
import ShareBar from '../components/ShareBar';
import { categoryLabel, MODE_LABEL, videoEmbed, BADGE_COLOR } from '../utils/teacherProfile';

// Public teacher portfolio (/teacher/:teacherId): only exists when the teacher switched it on.
// Every figure in "Verified record" comes from CareerZ's own records.
export default function TeacherPortfolio() {
  const { teacherId } = useParams();
  const [state, setState] = useState({ loading: true, data: null, error: '' });
  useEffect(() => {
    let alive = true;
    apiRequest(`/teachers/${teacherId}/public`, { auth: false })
      .then((data) => { if (alive) setState({ loading: false, data, error: '' }); })
      .catch((e) => { if (alive) setState({ loading: false, data: null, error: e.message || 'This portfolio is not available.' }); });
    return () => { alive = false; };
  }, [teacherId]);

  if (state.loading) return <main className="tp-page"><p role="status">Loading portfolio…</p></main>;
  if (state.error) return <main className="tp-page"><div className="tp-card"><h1>Portfolio not available</h1><p>{state.error}</p><Link to="/" className="btn">Go to CareerZ</Link></div></main>;

  const { teacher, profile, standing, reviews, courses } = state.data;
  const video = videoEmbed(profile.introVideoUrl);
  const place = [teacher.city, teacher.country].filter(Boolean).join(', ');
  return (
    <main className="tp-page">
      <PageSeo title={`${teacher.fullName} – ${profile.categories.map(categoryLabel)[0] || 'Teacher'}${teacher.city ? ` in ${teacher.city}` : ''}`} description={`${teacher.fullName}, ${profile.categories.map(categoryLabel).join(', ') || 'teacher'}${place ? ` in ${place}` : ''}. Verified teacher portfolio on CareerZ with experience, courses and reviews.`} path={`/teacher/${teacherId}`} type="profile" image={teacher.profilePhoto} keywords={[teacher.fullName, ...profile.categories.map(categoryLabel), teacher.city && `tutor in ${teacher.city}`, 'online tutor Pakistan']} />
      <Link to="/" className="tp-back"><FaArrowLeft aria-hidden="true" /> CareerZ</Link>
      <ShareBar title={teacher.fullName} />
      <header className="tp-hero" style={profile.coverPhotoUrl ? { backgroundImage: `linear-gradient(180deg, rgba(0,0,0,.05), rgba(0,0,0,.55)), url(${profile.coverPhotoUrl})` } : undefined}>
        <div className="tp-identity">
          {teacher.profilePhoto ? <img src={teacher.profilePhoto} alt="" className="tp-avatar" /> : <span className="tp-avatar tp-initial" aria-hidden="true">{teacher.fullName?.[0]}</span>}
          <div>
            <h1>{teacher.fullName}</h1>
            <p>{[...profile.categories.map(categoryLabel), place].filter(Boolean).join(' · ')}</p>
          </div>
          {standing.badge && <span className="teacher-badge" style={{ background: BADGE_COLOR[standing.badge.key] }}>{standing.badge.label}</span>}
        </div>
      </header>

      <section className="tp-grid">
        <div className="tp-main">
          {profile.bio && <section className="tp-card"><h2>About</h2><p>{profile.bio}</p></section>}
          {video && <section className="tp-card"><h2>Introduction</h2>
            {video.kind === 'iframe'
              ? <div className="tp-video"><iframe src={video.src} title={`${teacher.fullName} introduction video`} allow="encrypted-media; picture-in-picture" allowFullScreen loading="lazy" /></div>
              : <video className="tp-video-el" src={video.src} controls preload="metadata" />}
          </section>}
          {profile.teachingStyle && <section className="tp-card"><h2>How I teach</h2><p>{profile.teachingStyle}</p></section>}
          {courses.length > 0 && <section className="tp-card"><h2><FaBookOpen aria-hidden="true" /> Courses</h2>
            <ul className="tp-courses">{courses.map((c) => <li key={c._id}><strong>{c.title}</strong><span>{[c.subject, c.level, c.institution?.name || 'Independent', c.isFree ? 'Free' : c.price ? `${c.currency || ''} ${c.price}` : ''].filter(Boolean).join(' · ')}</span></li>)}</ul>
          </section>}
          <section className="tp-card"><h2><FaStar aria-hidden="true" /> Reviews</h2>
            {standing.reviews.count ? <p className="tp-rating"><strong>{standing.reviews.average}</strong> / 5 from {standing.reviews.count} verified rating{standing.reviews.count === 1 ? '' : 's'}</p> : <p>No verified ratings yet.</p>}
            {reviews.map((r, i) => <blockquote key={i} className="tp-review"><p>“{r.comment}”</p><footer>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)} · a {r.fromRole} · {new Date(r.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</footer></blockquote>)}
          </section>
        </div>

        <aside className="tp-side">
          <section className="tp-card"><h2>Verified record</h2>
            <ul className="tp-stats">
              <li><FaClock aria-hidden="true" /><strong>{standing.verifiedHours}</strong> teaching hours on CareerZ</li>
              <li><FaUsers aria-hidden="true" /><strong>{standing.studentsTaught}</strong> students taught</li>
              <li><FaBookOpen aria-hidden="true" /><strong>{standing.liveClasses}</strong> live classes held</li>
            </ul>
          </section>
          <section className="tp-card"><h2>Teaching</h2>
            {profile.subjects.length > 0 && <p><strong>Subjects:</strong> {profile.subjects.join(', ')}</p>}
            {profile.teachingModes.length > 0 && <p><strong>Mode:</strong> {profile.teachingModes.map((m) => MODE_LABEL[m] || m).join(', ')}</p>}
            {profile.experienceYears > 0 && <p><strong>Experience:</strong> {profile.experienceYears} years</p>}
            {profile.independent && <p>Takes private students</p>}
          </section>
          {profile.qualifications.length > 0 && <section className="tp-card"><h2><FaGraduationCap aria-hidden="true" /> Qualifications</h2>
            <ul className="tp-list">{profile.qualifications.map((q, i) => <li key={i}>{q.title}{q.institutionName ? `, ${q.institutionName}` : ''}{q.year ? ` (${q.year})` : ''}</li>)}</ul>
          </section>}
          {profile.institutions.length > 0 && <section className="tp-card"><h2>Teaches at</h2><ul className="tp-list">{profile.institutions.map((i, n) => <li key={n}>{i.name}{i.city ? `, ${i.city}` : ''}</li>)}</ul></section>}
          <Link to="/login" className="btn btn-primary tp-cta">Log in to message or request tuition</Link>
        </aside>
      </section>
    </main>
  );
}
