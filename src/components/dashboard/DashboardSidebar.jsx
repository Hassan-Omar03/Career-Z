import {
  FaEnvelope, FaBell, FaGear, FaCircleQuestion, FaRightFromBracket, FaXmark, FaCalendarDays
} from 'react-icons/fa6';

// The nav items themselves come from the active workspace (see Dashboard.jsx)
// so every role gets its own menu, not a shared/static one.
export default function DashboardSidebar({ open, onClose, onLogout, navItems = [], activeKey, onSelect }) {
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
        {navItems.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`dash-nav-link${activeKey === item.key ? ' active' : ''}`}
            style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
            onClick={() => onSelect?.(item.key)}
          >
            <item.icon size={17} aria-hidden />
            <span>{item.label}</span>
          </button>
        ))}

        <div className="dash-sidebar-divider"></div>

        <button type="button" className={`dash-nav-link${activeKey === 'messages' ? ' active' : ''}`} style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => onSelect?.('messages')}>
          <FaEnvelope size={17} aria-hidden /><span>Messages</span>
        </button>
        <button type="button" className={`dash-nav-link${activeKey === 'notifications' ? ' active' : ''}`} style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => onSelect?.('notifications')}>
          <FaBell size={17} aria-hidden /><span>Notifications</span>
        </button>
        <button type="button" className={`dash-nav-link${activeKey === 'calendar' ? ' active' : ''}`} style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => onSelect?.('calendar')}>
          <FaCalendarDays size={17} aria-hidden /><span>Calendar</span>
        </button>
        <button type="button" className={`dash-nav-link${activeKey === 'settings' ? ' active' : ''}`} style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => onSelect?.('settings')}>
          <FaGear size={17} aria-hidden /><span>Settings</span>
        </button>
        <button type="button" className={`dash-nav-link${activeKey === 'help' ? ' active' : ''}`} style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => onSelect?.('help')}>
          <FaCircleQuestion size={17} aria-hidden /><span>Help Center</span>
        </button>
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
