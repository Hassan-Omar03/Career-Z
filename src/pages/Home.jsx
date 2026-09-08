import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaSun, FaMoon, FaBars } from 'react-icons/fa6';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../context/AuthContext';
import LiveTicker from '../components/LiveTicker';
import LanguageSelector from '../components/LanguageSelector';
import AiConsole from '../components/AiConsole';

const ROLE_CHIPS = ['Students', 'Parents', 'Teachers', 'Institutions', 'Employers', 'Agents', 'Donors'];

const I18N = {
  en: {
    heroH1: <>The Complete <em>AI-Powered</em> Education Ecosystem</>,
    heroLead: "CareerZ.pk connects students, parents, teachers, institutions, employers, agents and donors — guided by AI, from admission to career. Built for students, institutions and educators worldwide."
  },
  ur: {
    heroH1: <>مکمل <em>AI-پاورڈ</em> تعلیمی ایکو سسٹم</>,
    heroLead: 'CareerZ.pk طلباء، والدین، اساتذہ، اداروں، آجرین، ایجنٹس اور ڈونرز کو ایک ساتھ جوڑتا ہے — داخلے سے کیریئر تک، AI کی رہنمائی میں۔'
  }
};

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [lang, setLang] = useState('en');
  const [scrollPct, setScrollPct] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      const h = document.documentElement;
      const pct = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
      setScrollPct(pct || 0);
    }
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const copy = I18N[lang] || I18N.en;

  return (
    <>
      <div id="scroll-progress" style={{ width: `${scrollPct}%` }}></div>

      <LiveTicker />

      <header className="nav">
        <div className="container nav-inner">
          <div className="logo">
            <span className="dot"></span>
            <span className="logo-text">Career<span className="pk">Z.pk</span></span>
          </div>
          <nav className={`nav-links${mobileOpen ? ' mobile-open' : ''}`}>
            <a href="#courses">Courses</a>
            <a href="#institutions">Institutions</a>
            <a href="#jobs">Jobs</a>
            <a href="#scholarships">Scholarships</a>
            <a href="#marketplace">Marketplace</a>
          </nav>
          <div className="nav-actions">
            <LanguageSelector onChange={setLang} />
            <button className="icon-btn" aria-label="Toggle dark mode" onClick={toggleTheme}>
              {theme === 'dark' ? <FaMoon size={16} /> : <FaSun size={16} />}
            </button>
            {user ? (
              <Link to="/dashboard" className="btn btn-primary" style={{ padding: '10px 20px', fontSize: '13.5px' }}>
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline" style={{ padding: '10px 20px', fontSize: '13.5px' }}>
                  Sign In
                </Link>
                <Link to="/signup" className="btn btn-primary" style={{ padding: '10px 20px', fontSize: '13.5px' }}>
                  Sign Up
                </Link>
              </>
            )}
            <button className="mobile-toggle" aria-label="Menu" onClick={() => setMobileOpen((o) => !o)}><FaBars size={18} /></button>
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="container hero-grid">
          <div className="reveal in">
            <div className="eyebrow">The Global AI Education Ecosystem</div>
            <h1>{copy.heroH1}</h1>
            <p className="lead">{copy.heroLead}</p>
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

      <section className="section-pad" style={{ textAlign: 'center' }}>
        <div className="container">
          <div className="eyebrow">More sections coming</div>
          <p style={{ color: 'var(--ink-soft)', maxWidth: 560, margin: '8px auto 0' }}>
            Featured institutions, courses, jobs, scholarships and the marketplace preview are next on the build list.
          </p>
        </div>
      </section>
    </>
  );
}
