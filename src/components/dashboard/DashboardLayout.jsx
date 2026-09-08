import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';
import { useAuth } from '../../context/AuthContext';

export default function DashboardLayout({ children, trail = ['Dashboard'] }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.roles?.some((role) => ['admin', 'super_admin'].includes(role));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div className={`dash-body${isAdmin ? ' admin-layout' : ' member-layout'}`}>
      {!isAdmin && sidebarOpen && <div className="dash-overlay show" onClick={() => setSidebarOpen(false)}></div>}

      <div className="dash-shell" data-sidebar-collapsed={collapsed ? 'true' : 'false'}>
        {!isAdmin && <DashboardSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onLogout={handleLogout}
        />}

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
