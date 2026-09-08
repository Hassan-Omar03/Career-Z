import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../../hooks/useTheme';
import LanguageSelector from '../LanguageSelector';
import { FaShieldHalved, FaRightFromBracket, FaBars, FaMagnifyingGlass, FaPlus, FaWallet, FaSun, FaMoon, FaCommentDots, FaBell, FaChevronDown } from 'react-icons/fa6';

function useDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    function onDoc(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);
  return { open, setOpen, ref };
}

export default function DashboardHeader({ user, onSidebarToggle, onLogout }) {
  const { theme, toggleTheme } = useTheme();
  const quickActions = useDropdown();
  const profileMenu = useDropdown();
  const [search, setSearch] = useState('');

  const initial = (user?.fullName || '?').trim().charAt(0).toUpperCase();

  if (user?.roles?.some((role) => ['admin', 'super_admin'].includes(role))) {
    return (
      <header className="dash-header admin-header">
        <a href="/" className="logo" aria-label="CareerZ home"><span className="dot" /><span className="logo-text">Career<span className="pk">Z.pk</span></span></a>
        <span className="admin-header-label"><FaShieldHalved aria-hidden="true" /> Administration</span>
        <div className="dash-header-right">
          <button className="icon-btn" aria-label="Toggle dark mode" onClick={toggleTheme}>{theme === 'dark' ? <FaMoon /> : <FaSun />}</button>
          <a className="dash-profile-btn" href="#admin-profile"><span className="dash-avatar">{initial}</span><span className="name">{user.fullName}</span></a>
          <button className="admin-logout" onClick={onLogout}><FaRightFromBracket aria-hidden="true" /><span>Logout</span></button>
        </div>
      </header>
    );
  }

  return (
    <header className="dash-header">
      <div className="dash-header-left">
        <button className="icon-btn dash-sidebar-toggle" aria-label="Toggle sidebar" onClick={onSidebarToggle}><FaBars size={17} /></button>
        <a href="/" className="logo dash-header-brand" aria-label="CareerZ.pk Home">
          <span className="dot"></span><span className="logo-text">Career<span className="pk">Z.pk</span></span>
        </a>
        <div className="dash-search-wrap">
          <label className="dash-search">
            <FaMagnifyingGlass size={17} />
            <input
              type="text" placeholder="Search institutions, courses, jobs…" autoComplete="off"
              value={search} onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          {search && (
            <div className="dash-search-results" style={{ display: 'block' }}>
              <div className="u-empty">
                <div className="u-empty-ic"><FaMagnifyingGlass aria-hidden="true" /></div>
                <h4>No results yet</h4>
                <p>Live search will connect once the search API is wired.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="dash-header-right">
        <div style={{ position: 'relative' }} ref={quickActions.ref}>
          <button className="icon-btn" aria-haspopup="true" aria-expanded={quickActions.open} aria-label="Quick actions" onClick={() => quickActions.setOpen((o) => !o)}>
            <FaPlus size={19} />
          </button>
          {quickActions.open && (
            <div className="dash-user-menu" style={{ display: 'block' }} role="menu">
              <div className="dash-role-note">Example shortcuts — final list is role-specific</div>
              <a href="#" role="menuitem">New Application</a>
              <a href="#" role="menuitem">New Message</a>
              <a href="#" role="menuitem">New Support Ticket</a>
            </div>
          )}
        </div>

        <div className="dash-wallet-chip">
          <FaWallet size={17} />
          <span className="w-text">
            <span className="w-label">Balance</span>
            <span className="w-amount">—</span>
          </span>
        </div>

        <LanguageSelector />

        <button className="icon-btn" aria-label="Toggle dark mode" onClick={toggleTheme}>
          {theme === 'dark' ? <FaMoon size={18} /> : <FaSun size={18} />}
        </button>

        <div className="dash-icon-btn-wrap">
          <button className="icon-btn" aria-label="Messages">
            <FaCommentDots size={17} />
          </button>
          <span className="dash-badge-dot"></span>
        </div>

        <div className="dash-icon-btn-wrap">
          <button className="icon-btn" aria-label="Notifications">
            <FaBell size={17} />
          </button>
          <span className="dash-badge-dot"></span>
        </div>

        <div style={{ position: 'relative' }} ref={profileMenu.ref}>
          <button className="dash-profile-btn" aria-haspopup="true" aria-expanded={profileMenu.open} onClick={() => profileMenu.setOpen((o) => !o)}>
            <span className="dash-avatar">{initial}</span>
            <span className="name">{user?.fullName || 'Guest'}</span>
            <FaChevronDown size={16} />
          </button>
          {profileMenu.open && (
            <div className="dash-user-menu" style={{ display: 'block' }} role="menu">
              <div className="dash-role-note">Signed in as <strong>{(user?.roles || []).join(', ')}</strong></div>
              <a href="#" role="menuitem">My Profile</a>
              <a href="#" role="menuitem">Settings</a>
              <a href="#" role="menuitem">Help Center</a>
              <hr />
              <button type="button" role="menuitem" onClick={onLogout}>Logout</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
