import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEmployeeProfile } from '../context/EmployeeProfileContext';

/**
 * Redirects: unauthenticated -> /login; non-employee -> home;
 * employee without profile -> create-profile; employee with profile on create-profile -> dashboard
 */
export default function EmployeeGuard({ children }) {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { hasProfile, loading } = useEmployeeProfile();
  const isCreateProfile = location.pathname === '/employee/create-profile';

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (user?.role !== 'employee') {
    return <Navigate to="/" replace />;
  }

  // Wait for profile API check to complete before deciding
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!hasProfile && !isCreateProfile) {
    return <Navigate to="/employee/create-profile" replace />;
  }

  if (hasProfile && isCreateProfile) {
    return <Navigate to="/employee/dashboard" replace />;
  }

  return children;
}
