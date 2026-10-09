import AuthNavbar from '../components/AuthNavbar';
import SiteFooter from '../components/SiteFooter';
import PageSeo from '../components/PageSeo';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import LiveTicker from '../components/LiveTicker';
import AiConsole from '../components/AiConsole';

const ROLE_CHIPS = ['Students', 'Parents', 'Teachers', 'Institutions', 'Employers', 'Agents', 'Donors'];

export default function Home() {
  const [scrollPct, setScrollPct] = useState(0);

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

      <PageSeo title="Global AI-Powered Education Ecosystem" description="Connect education, learning and career opportunities with CareerZ." /><LiveTicker />

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

      <section className="section-pad"><div className="container"><h2>Education to opportunity</h2><div className="public-page-links">{[['Institutions','institutions','Connect with your institution and campus community.'],['Courses','courses','Learn online, on campus and with downloaded resources.'],['Jobs','jobs','Explore career opportunities and placement support.'],['Scholarships','scholarships','Find support for your education.'],['Marketplace','marketplace','Explore education products and services.']].map(([title,slug,desc])=><Link key={slug} className="discovery-card" to={'/'+slug}><h3>{title}</h3><p>{desc}</p></Link>)}</div></div></section>
      <section className="section-pad"><div className="container"><h2>One platform for your education community</h2><div className="public-page-links">{[['Students and parents','Follow enrolled courses, class schedules, assignments and learning progress.'],['Teachers','Organize lessons, lead live classes, manage discussions and review assessments.'],['Institutions','Manage memberships, staff permissions, timetables and attendance.'],['Employers, agents and donors','Connect education with placement opportunities and learning support.']].map(([title,description])=><article className="discovery-card" key={title}><h3>{title}</h3><p>{description}</p></article>)}</div></div></section>
      <section className="section-pad"><div className="container"><h2>Get started in three steps</h2><ol><li>Create and verify your CareerZ account.</li><li>Complete your profile and join the relevant institution or workspace.</li><li>Explore your approved courses, resources and opportunities.</li></ol><Link className="btn btn-primary" to="/signup">Create your account</Link> <Link className="btn btn-outline" to="/help">Visit Help Center</Link></div></section>
      <SiteFooter />
    </div>
  );
}
