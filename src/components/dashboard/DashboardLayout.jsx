import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';
import { useAuth } from '../../context/AuthContext';

export default function DashboardLayout({ children, trail = ['Dashboard'], activeRole = 'student', navItems = [], activeKey, onSelect }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  const isAdmin = activeRole === 'admin';

  return (
    <div className={`dash-body${isAdmin ? ' admin-layout' : ' member-layout'}`}>
      {sidebarOpen && <div className="dash-overlay show" onClick={() => setSidebarOpen(false)}></div>}

      <div className="dash-shell" data-sidebar-collapsed={collapsed ? 'true' : 'false'}>
        <DashboardSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onLogout={handleLogout}
          navItems={navItems}
          activeKey={activeKey}
          onSelect={(key) => { onSelect?.(key); setSidebarOpen(false); }}
        />

        <DashboardHeader
          user={user}
          onSidebarToggle={() => {
            if (window.innerWidth < 980) setSidebarOpen((o) => !o);
            else setCollapsed((c) => !c);
          }}
          onLogout={handleLogout}
        />

        <main className="dash-main">
          <nav className="dash-breadcrumb" aria-label="Breadcrumb">
            {trail.map((t, i) => (
              <span key={t}>{i > 0 && ' / '}{t}</span>
            ))}
          </nav>
          {children}
        </main>
      </div>
    </div>
  );
}
