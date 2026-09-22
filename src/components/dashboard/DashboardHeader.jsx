import ThemeIcon from '../ThemeIcon';
import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../../hooks/useTheme';
import LanguageSelector from '../LanguageSelector';
import VoiceNavButton from '../VoiceNavButton';
import { useRealtime } from '../../context/RealtimeContext';
import { FaShieldHalved, FaRightFromBracket, FaBars, FaMagnifyingGlass, FaPlus, FaWallet, FaCommentDots, FaBell, FaChevronDown } from 'react-icons/fa6';

function useDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    function onDoc(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    function onKey(event) { if (event.key === 'Escape') setOpen(false); }
    document.addEventListener('click', onDoc);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('click', onDoc); document.removeEventListener('keydown', onKey); };
  }, []);
  return { open, setOpen, ref };
}

export default function DashboardHeader({ user, onSidebarToggle, onLogout, onNavigate, navItems = [] }) {
  const { theme, toggleTheme } = useTheme();
  const { unreadCount, clearUnread } = useRealtime();
  const { open: quickActionsOpen, setOpen: setQuickActionsOpen, ref: quickActionsRef } = useDropdown();
  const { open: profileMenuOpen, setOpen: setProfileMenuOpen, ref: profileMenuRef } = useDropdown();
  const [search, setSearch] = useState('');

  const initial = (user?.fullName || '?').trim().charAt(0).toUpperCase();

  if (user?.roles?.some((role) => ['admin', 'super_admin'].includes(role))) {
    return (
      <header className="dash-header admin-header">
        <a href="/" className="logo" aria-label="CareerZ home"><span className="dot" /><span className="logo-text">Career<span className="pk">Z.pk</span></span></a>
        <span className="admin-header-label"><FaShieldHalved aria-hidden="true" /> Administration</span>
        <div className="dash-header-right">
          <button className="icon-btn" aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} onClick={toggleTheme}><ThemeIcon theme={theme} /></button>
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
        <div style={{ position: 'relative' }} ref={quickActionsRef}>
          <button className="icon-btn" aria-haspopup="true" aria-expanded={quickActionsOpen} aria-label="Quick actions" onClick={() => setQuickActionsOpen((o) => !o)}>
            <FaPlus size={19} />
          </button>
          {quickActionsOpen && (
            <div className="dash-user-menu" style={{ display: 'block' }} role="menu">
              <div className="dash-role-note">Example shortcuts — final list is role-specific</div>
              <button type="button" role="menuitem" onClick={() => { setQuickActionsOpen(false); onNavigate?.('applications'); }}>New Application</button>
              <button type="button" role="menuitem" onClick={() => { setQuickActionsOpen(false); onNavigate?.('messages'); }}>New Message</button>
              <button type="button" role="menuitem" onClick={() => { setQuickActionsOpen(false); onNavigate?.('help'); }}>New Support Ticket</button>
            </div>
          )}
        </div>

        <button type="button" className="dash-wallet-chip"  onClick={() => onNavigate?.('wallet')}>
          <FaWallet size={17} />
          <span className="w-text">
            <span className="w-label">Balance</span>
            <span className="w-amount">View Wallet</span>
          </span>
        </button>

        <LanguageSelector />
        <VoiceNavButton navItems={navItems} onNavigate={onNavigate} />

        <button className="icon-btn" aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} onClick={toggleTheme}>
          <ThemeIcon theme={theme} />
        </button>

        <div className="dash-icon-btn-wrap">
          <button className="icon-btn" aria-label="Messages" onClick={() => onNavigate?.('messages')}>
            <FaCommentDots size={17} />
          </button>
        </div>

        <div className="dash-icon-btn-wrap">
          <button className="icon-btn" aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'} onClick={() => { clearUnread(); onNavigate?.('notifications'); }} style={{ position: 'relative' }}>
            <FaBell size={17} />
            {unreadCount > 0 && (
              <span aria-hidden="true" style={{
                position: 'absolute', top: -2, right: -2, minWidth: 16, height: 16, padding: '0 4px',
                borderRadius: 999, background: 'var(--rose, #e11d48)', color: '#fff', fontSize: 10, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1
              }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </button>
        </div>

        <div style={{ position: 'relative' }} ref={profileMenuRef}>
          <button className="dash-profile-btn" aria-haspopup="true" aria-expanded={profileMenuOpen} onClick={() => setProfileMenuOpen((o) => !o)}>
            <span className="dash-avatar">{initial}</span>
            <span className="name">{user?.fullName || 'Guest'}</span>
            <FaChevronDown size={16} />
          </button>
          {profileMenuOpen && (
            <div className="dash-user-menu" style={{ display: 'block' }} role="menu">
              <div className="dash-role-note">Signed in as <strong>{(user?.roles || []).join(', ')}</strong></div>
              <button type="button" role="menuitem" onClick={() => { setProfileMenuOpen(false); onNavigate?.('profile'); }}>My Profile</button>
              <button type="button" role="menuitem" onClick={() => { setProfileMenuOpen(false); onNavigate?.('settings'); }}>Settings</button>
              <button type="button" role="menuitem" onClick={() => { setProfileMenuOpen(false); onNavigate?.('help'); }}>Help Center</button>
              <hr />
              <button type="button" role="menuitem" onClick={onLogout}>Logout</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
