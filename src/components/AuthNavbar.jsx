import BrandLogo from './BrandLogo';
import { FaChevronDown } from 'react-icons/fa6';
import ThemeIcon from './ThemeIcon';
import LanguageSelector from './LanguageSelector';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { PUBLIC_PAGES } from '../content/publicPages';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/useTheme';

export default function AuthNavbar() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  useEffect(() => { setOpen(false); document.querySelectorAll('.public-header details[open]').forEach(el => { el.open = false; }); }, [location.pathname]);
  // Issue CZ-0002: only one menu open at a time; a click outside closes it.
  const closeOthers = (e) => { if (e.currentTarget.open) document.querySelectorAll('.public-header details[open]').forEach((el) => { if (el !== e.currentTarget) el.open = false; }); };
  useEffect(() => {
    const outside = (e) => { if (!e.target.closest?.('.public-header details')) document.querySelectorAll('.public-header details[open]').forEach((el) => { el.open = false; }); };
    const escape = (e) => { if (e.key === 'Escape') { document.querySelectorAll('.public-header details[open]').forEach(el => { el.open = false; }); setOpen(false); } };
    document.addEventListener('keydown', escape);
    document.addEventListener('mousedown', outside);
    return () => { document.removeEventListener('mousedown', outside); document.removeEventListener('keydown', escape); };
  }, []);

  return (
    <header className="nav public-header">
      <div className="container nav-inner">
        <BrandLogo dark={theme === 'dark'} />
        <nav id="public-navigation" className={`public-navigation${open ? ' is-open' : ''}`} aria-label="Main navigation">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/about">About Us</NavLink>
          <details onToggle={closeOthers}><summary>Explore <FaChevronDown className="public-menu-chevron" aria-hidden="true" /></summary><div className="public-menu">{PUBLIC_PAGES.filter(p => ['institutions','courses','jobs','scholarships','marketplace','agent-program','donor-program','become-a-seller'].includes(p.slug)).map(p => <Link key={p.slug} to={'/'+p.slug}>{p.title}</Link>)}<Link to="/freelance">Freelancer Hub</Link><Link to="/events">Events</Link></div></details>
          <NavLink to="/blog">Blog</NavLink>
          <NavLink to="/contact">Contact</NavLink>
          <details onToggle={closeOthers}><summary>More pages <FaChevronDown className="public-menu-chevron" aria-hidden="true" /></summary><div className="public-menu public-menu-wide"><Link to="/visa">Visa Center</Link>{PUBLIC_PAGES.filter(p => !['about','blog','contact','institutions','courses','jobs','scholarships','marketplace','agent-program','donor-program','become-a-seller'].includes(p.slug)).map(p => <Link key={p.slug} to={'/'+p.slug}>{p.title}</Link>)}</div></details>
        </nav>
        <div className="nav-actions">
          <LanguageSelector />
          <button className="icon-btn" aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} onClick={toggleTheme}>
            <ThemeIcon theme={theme} />
          </button>
          {user ? <Link className="btn btn-primary public-account" to="/dashboard">Dashboard</Link> : <><Link className="public-account" to="/login">Sign In</Link><Link className="btn btn-primary public-account" to="/signup">Sign Up</Link></>}
          <button className="public-menu-toggle icon-btn" aria-label="Toggle navigation" aria-controls="public-navigation" aria-expanded={open} onClick={() => setOpen(value => !value)}>☰</button>
        </div>
      </div>
    </header>
  );
}
