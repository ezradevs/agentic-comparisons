import { NavLink, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Bars3Icon, ChartBarIcon, UsersIcon, CalendarDaysIcon, MegaphoneIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

const navigation = [
  { name: 'Dashboard', to: '/', icon: ChartBarIcon },
  { name: 'Members', to: '/members', icon: UsersIcon },
  { name: 'Events', to: '/events', icon: CalendarDaysIcon },
  { name: 'Announcements', to: '/announcements', icon: MegaphoneIcon }
];

const AdminLayout = () => {
  const { user, logout } = useAuthStore((state) => ({ user: state.user, logout: state.logout }));
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <aside
        className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 z-30 w-64 transform border-r border-slate-800 bg-slate-900 transition-transform duration-200 ease-in-out md:static md:translate-x-0`}
      >
        <div className="flex items-center gap-2 border-b border-slate-800 px-6 py-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600 text-xl font-black">♞</div>
          <div>
            <div className="text-lg font-semibold">Chess Club Admin</div>
            <div className="text-xs text-slate-400">Control Center</div>
          </div>
        </div>
        <nav className="space-y-1 px-4 py-6">
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                    : 'text-slate-300 hover:bg-slate-800'
                }`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-800 bg-slate-900/95 px-6 py-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-lg border border-slate-700 p-2 text-slate-300 hover:border-primary-500 hover:text-primary-300 md:hidden"
              onClick={() => setSidebarOpen((prev) => !prev)}
            >
              <Bars3Icon className="h-5 w-5" />
            </button>
            <div className="text-sm font-medium text-slate-300">
              Welcome back, <span className="text-white">{user?.full_name ?? 'Admin'}</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="hidden flex-col text-right md:flex">
              <span className="font-semibold text-white">{user?.full_name}</span>
              <span className="text-xs uppercase tracking-wide text-slate-400">{user?.role}</span>
            </div>
            <button
              type="button"
              onClick={logout}
              className="rounded-lg border border-transparent bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-700 hover:bg-slate-900"
            >
              Sign out
            </button>
          </div>
        </header>
        <main className="flex-1 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
          <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
