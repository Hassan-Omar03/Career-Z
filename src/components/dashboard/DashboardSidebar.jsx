import { useAuth } from '../../context/AuthContext';
import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import {
  FaUser, FaUserShield, FaGauge, FaClipboardList, FaBookOpen, FaBuilding, FaBriefcase,
  FaAward, FaStore, FaEnvelope, FaBell, FaGear, FaCircleQuestion, FaRightFromBracket, FaXmark, FaChevronRight
} from 'react-icons/fa6';

const SECONDARY_ITEMS = [
  { icon: FaBookOpen, label: 'My Courses' },
  { icon: FaBuilding, label: 'My Institutions' },
  { icon: FaBriefcase, label: 'My Jobs' },
  { icon: FaAward, label: 'My Scholarships' },
  { icon: FaStore, label: 'Marketplace' }
];

const APPLICATION_LINKS = ['Institution Applications', 'Scholarship Applications', 'Job Applications'];

export default function DashboardSidebar({ open, onClose, onLogout }) {
  const { user } = useAuth();
  const [appsOpen, setAppsOpen] = useState(true);

  return (
    <aside className={`dash-sidebar${open ? ' dash-sidebar-open' : ''}`} aria-label="Dashboard navigation">
      <div className="dash-sidebar-brand">
        <a href="/" className="logo">
          <span className="dot"></span>
          <span className="logo-text">Career<span className="pk">Z.pk</span></span>
        </a>
        <button className="icon-btn dash-sidebar-close-btn" aria-label="Close menu" onClick={onClose}><FaXmark size={18} /></button>
      </div>

      <nav className="dash-sidebar-nav" aria-label="Primary">
        <NavLink to="/dashboard" className="dash-nav-link active">
          <FaGauge size={18} aria-hidden />
          <span>Dashboard</span>
        </NavLink>

        <a href="#account-profile" className="dash-nav-link" onClick={onClose}><FaUser size={17} aria-hidden /><span>Profile</span></a>
        <a href="#account-roles" className="dash-nav-link" onClick={onClose}><FaUserShield size={17} aria-hidden /><span>My Roles</span></a>
        {['student', 'teacher', 'parent'].filter(role => user?.roles?.includes(role)).map(role => <a key={role} href={`#account-${role}`} className="dash-nav-link" onClick={onClose}><FaBookOpen size={17} aria-hidden /><span style={{ textTransform: 'capitalize' }}>{role} workspace</span></a>)}
        <div className="dash-sidebar-divider" />
        <div className="dash-nav-group" data-open={appsOpen}>
          <button type="button" className="dash-nav-group-toggle" aria-expanded={appsOpen} onClick={() => setAppsOpen((o) => !o)}>
            <FaClipboardList size={18} aria-hidden />
            <span>My Applications</span>
            <span className="dash-nav-badge">3</span>
            <FaChevronRight className="chev" size={12} />
          </button>
          {appsOpen && (
            <div className="dash-nav-submenu">
              <div>
                {APPLICATION_LINKS.map((l) => <a key={l} href="#" className="dash-nav-link">{l}</a>)}
              </div>
            </div>
          )}
        </div>

        {SECONDARY_ITEMS.map((item) => (
          <a key={item.label} href="#" className="dash-nav-link">
            <item.icon size={17} aria-hidden />
            <span>{item.label}</span>
          </a>
        ))}

        <div className="dash-sidebar-divider"></div>

        <a href="#" className="dash-nav-link">
          <FaEnvelope size={17} aria-hidden /><span>Messages</span><span className="dash-nav-badge">5</span>
        </a>
        <a href="#" className="dash-nav-link">
          <FaBell size={17} aria-hidden /><span>Notifications</span><span className="dash-nav-badge">9</span>
        </a>
        <a href="#" className="dash-nav-link">
          <FaGear size={17} aria-hidden /><span>Settings</span>
        </a>
        <a href="#" className="dash-nav-link">
          <FaCircleQuestion size={17} aria-hidden /><span>Help Center</span>
        </a>
      </nav>

      <div className="dash-sidebar-foot">
        <div className="dash-sidebar-divider" style={{ marginTop: 0 }}></div>
        <button type="button" className="dash-nav-link" style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }} onClick={onLogout}>
          <FaRightFromBracket size={17} aria-hidden /><span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
