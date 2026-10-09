import BrandLogo from './BrandLogo';
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

  return (
    <header className="nav public-header">
      <div className="container nav-inner">
        <BrandLogo dark={theme === 'dark'} />
        <nav id="public-navigation" className={`public-navigation${open ? ' is-open' : ''}`} aria-label="Main navigation">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/about">About Us</NavLink>
          <details><summary>Explore</summary><div className="public-menu">{PUBLIC_PAGES.filter(p => ['institutions','courses','jobs','scholarships','marketplace','agent-program','donor-program','become-a-seller'].includes(p.slug)).map(p => <Link key={p.slug} to={'/'+p.slug}>{p.title}</Link>)}</div></details>
          <NavLink to="/blog">Blog</NavLink>
          <NavLink to="/contact">Contact</NavLink>
          <details><summary>More pages</summary><div className="public-menu public-menu-wide">{PUBLIC_PAGES.filter(p => !['about','blog','contact','institutions','courses','jobs','scholarships','marketplace','agent-program','donor-program','become-a-seller'].includes(p.slug)).map(p => <Link key={p.slug} to={'/'+p.slug}>{p.title}</Link>)}</div></details>
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
