import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCatererProfile } from '../context/CatererProfileContext';

/**
 * Redirects: unauthenticated -> /login; non-caterer -> home;
 * caterer without profile -> create-profile; caterer with profile on create-profile -> dashboard
 */
export default function CatererGuard({ children }) {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { hasProfile, loading } = useCatererProfile();
  const isCreateProfile = location.pathname === '/caterer/create-profile';

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (user?.role !== 'caterer') {
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
    return <Navigate to="/caterer/create-profile" replace />;
  }

  if (hasProfile && isCreateProfile) {
    return <Navigate to="/caterer/dashboard" replace />;
  }

  return children;
}
