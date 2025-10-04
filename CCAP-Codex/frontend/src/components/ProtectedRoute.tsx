import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

const ProtectedRoute = () => {
  const location = useLocation();
  const { token, isHydrated, hydrate } = useAuthStore((state) => ({
    token: state.token,
    isHydrated: state.isHydrated,
    hydrate: state.hydrate
  }));

  useEffect(() => {
    if (!isHydrated) {
      hydrate();
    }
  }, [hydrate, isHydrated]);

  if (!isHydrated) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900 text-slate-200">
        <div className="animate-pulse text-lg font-medium">Loading secure area...</div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
