import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import type { UserRole } from '../types';
import '../App.css';

type NavItem = {
  to: string;
  label: string;
  roles: UserRole[];
};

const navLinks: NavItem[] = [
  { to: '/', label: 'Dashboard', roles: ['admin', 'staff', 'viewer'] },
  { to: '/inventory', label: 'Inventory', roles: ['admin', 'staff'] },
  { to: '/sales', label: 'Sales', roles: ['admin', 'staff', 'viewer'] },
  { to: '/customers', label: 'Customers', roles: ['admin', 'staff', 'viewer'] },
  { to: '/admin/users', label: 'Team', roles: ['admin'] },
];

export const AppLayout = () => {
  const { user, logout, hasRole } = useAuthContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <span className="logo">SmallBiz Dashboard</span>
        </div>
        <nav className="nav-links">
          {navLinks.filter((link) => hasRole(...link.roles)).map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              end={link.to === '/'}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="main">
        <header className="topbar">
          <div>
            <h1>Welcome back{user ? `, ${user.name}` : ''}</h1>
            <p className="subtitle">Monitor inventory, track sales, and make data-driven decisions.</p>
          </div>
          <div className="user-info">
            {user && (
              <>
                <span className="role">{user.role.toUpperCase()}</span>
                <button type="button" onClick={handleLogout} className="secondary-button">
                  Log out
                </button>
              </>
            )}
          </div>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
