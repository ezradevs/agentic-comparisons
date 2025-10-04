import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { useAuthContext } from './context/AuthContext';
import AppLayout from './layouts/AppLayout';
import DashboardPage from './pages/DashboardPage';
import InventoryPage from './pages/InventoryPage';
import SalesPage from './pages/SalesPage';
import CustomersPage from './pages/CustomersPage';
import TeamPage from './pages/TeamPage';
import LoginPage from './pages/LoginPage';
import type { UserRole } from './types';

const RequireAuth = () => {
  const { isAuthenticated } = useAuthContext();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

const RequireRole = ({ roles }: { roles: UserRole[] }) => {
  const { hasRole } = useAuthContext();
  if (!hasRole(...roles)) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
};

const App = () => {
  const { isAuthenticated } = useAuthContext();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route element={<RequireRole roles={['admin', 'staff']} />}>
            <Route path="inventory" element={<InventoryPage />} />
          </Route>
          <Route element={<RequireRole roles={['admin', 'staff', 'viewer']} />}>
            <Route path="sales" element={<SalesPage />} />
            <Route path="customers" element={<CustomersPage />} />
          </Route>
          <Route element={<RequireRole roles={['admin']} />}>
            <Route path="admin/users" element={<TeamPage />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
