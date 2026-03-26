import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/', label: 'Dashboard', icon: '◈', end: true },
  { to: '/projects', label: 'Projects', icon: '▣' },
  { to: '/tasks', label: 'Tasks', icon: '✦' },
  { to: '/users', label: 'Users', icon: '◎' },
  { to: '/profile', label: 'Profile', icon: '◉' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h1>TaskFlow</h1>
          <span>Project Management</span>
        </div>

        <nav style={{ flex: 1 }}>
          {navItems.map(({ to, label, icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <span className="nav-icon">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{user?.full_name}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>{user?.email}</div>
            <span className={`badge badge-${user?.role}`} style={{ marginTop: 4 }}>{user?.role}</span>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout} style={{ width: '100%' }}>
            Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
