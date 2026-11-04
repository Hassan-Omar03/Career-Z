import { useEffect, useState } from 'react';
import BrandLogo from '../BrandLogo';
import {
  FaEnvelope, FaBell, FaGear, FaCircleQuestion, FaRightFromBracket, FaXmark, FaCalendarDays, FaChevronDown, FaReceipt, FaLaptopCode
} from 'react-icons/fa6';

// The nav items themselves come from the active workspace (see Dashboard.jsx)
// so every role gets its own menu, not a shared/static one.
function NavGroup({ title, items, activeKey, onSelect }) {
  const holdsActive = items.some((item) => item.key === activeKey);
  const [open, setOpen] = useState(holdsActive);
  useEffect(() => { if (holdsActive) setOpen(true); }, [holdsActive]);
  return (
    <div className="dash-nav-group">
      <button type="button" className="dash-nav-group-title" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <span>{title}</span><FaChevronDown size={11} aria-hidden style={{ transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>
      {open && items.map((item) => (
        <button key={item.key} type="button" className={`dash-nav-link${activeKey === item.key ? ' active' : ''}`} style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => onSelect?.(item.key)}>
          <item.icon size={17} aria-hidden />
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
}

export default function DashboardSidebar({ open, onClose, onLogout, navItems = [], navGroups = null, showFreelance = true, activeKey, onSelect }) {
  // Groups list every item once; anything not named in a group stays visible in the first one.
  const grouped = navGroups && navGroups.map((group, index) => ({
    title: group.title,
    items: navItems.filter((item) => (navGroups.find((g) => g.keys.includes(item.key)) || navGroups[0]) === navGroups[index])
  })).filter((group) => group.items.length);
  return (
    <aside className={`dash-sidebar${open ? ' dash-sidebar-open' : ''}`} aria-label="Dashboard navigation">
      <div className="dash-sidebar-brand">
        <BrandLogo />
        <button className="icon-btn dash-sidebar-close-btn" aria-label="Close menu" onClick={onClose}><FaXmark size={18} /></button>
      </div>

      <nav className="dash-sidebar-nav" aria-label="Primary">
        {grouped ? grouped.map((group) => <NavGroup key={group.title} title={group.title} items={group.items} activeKey={activeKey} onSelect={onSelect} />) : navItems.map((item) => (
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

        {!grouped && showFreelance && <button type="button" className={`dash-nav-link${activeKey === 'freelance' ? ' active' : ''}`} style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => onSelect?.('freelance')}><FaLaptopCode size={17} aria-hidden /><span>Freelancer Hub</span></button>}
        <button type="button" className={`dash-nav-link${activeKey === 'messages' ? ' active' : ''}`} style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => onSelect?.('messages')}>
          <FaEnvelope size={17} aria-hidden /><span>Messages</span>
        </button>
        <button type="button" className={`dash-nav-link${activeKey === 'notifications' ? ' active' : ''}`} style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => onSelect?.('notifications')}>
          <FaBell size={17} aria-hidden /><span>Notifications</span>
        </button>
        <button type="button" className={`dash-nav-link${activeKey === 'calendar' ? ' active' : ''}`} style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => onSelect?.('calendar')}>
          <FaCalendarDays size={17} aria-hidden /><span>Calendar</span>
        </button>
        {!grouped && <button type="button" className={`dash-nav-link${activeKey === 'receipts' ? ' active' : ''}`} style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => onSelect?.('receipts')}><FaReceipt size={17} aria-hidden /><span>My Receipts</span></button>}
        {!grouped && <button type="button" className={`dash-nav-link${activeKey === 'settings' ? ' active' : ''}`} style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => onSelect?.('settings')}>
          <FaGear size={17} aria-hidden /><span>Settings</span>
        </button>}
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
