import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, HelpCircle, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useEmployeeProfile } from '../../context/EmployeeProfileContext';
import { toAbsoluteUrl } from '../../lib/api';

function Breadcrumb() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(Boolean);
  if (pathnames[0] !== 'employee' || pathnames.length < 2) return null;
  const segments = pathnames.slice(1).map((s) => s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()));
  return (
    <nav className="flex items-center gap-2 text-sm text-gray-500">
      <Link to="/employee/dashboard" className="hover:text-orange-500 transition">Home</Link>
      {segments.map((seg, i) => (
        <span key={seg}>
          <span className="mx-1">/</span>
          <span className={i === segments.length - 1 ? 'text-gray-800 font-medium' : ''}>{seg}</span>
        </span>
      ))}
    </nav>
  );
}

export default function EmployeeHeader() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { profile } = useEmployeeProfile();
  const displayName = profile?.fullName || user?.email?.split('@')[0] || 'Employee';
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const avatarUrl = profile?.profileImageUrl ? toAbsoluteUrl(profile.profileImageUrl) : null;

  return (
    <>
      <header className="h-14 px-6 flex items-center justify-between bg-white border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-6">
          <Link to="/employee/dashboard" className="flex items-center gap-2 text-gray-800 font-bold text-lg">
            <span className="text-orange-500" aria-hidden>🍽️</span>
            CaterNet
          </Link>
          <Breadcrumb />
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 text-sm"
            aria-label="Help"
          >
            <HelpCircle size={18} />
            Help
          </button>
          <span className="text-sm text-gray-600">Welcome, {displayName}</span>
          <button
            type="button"
            onClick={() => avatarUrl && setLightboxOpen(true)}
            className="focus:outline-none"
            title={avatarUrl ? 'Click to view photo' : undefined}
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-8 h-8 rounded-full object-cover border-2 border-orange-300 hover:border-orange-500 transition"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-medium text-sm">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition text-sm"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </header>

      {lightboxOpen && avatarUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={() => setLightboxOpen(false)}
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute -top-3 -right-3 bg-white rounded-full p-1 shadow-lg hover:bg-gray-100 transition z-10"
            >
              <X size={18} />
            </button>
            <img
              src={avatarUrl}
              alt={displayName}
              className="max-h-[80vh] max-w-[80vw] rounded-xl shadow-2xl object-contain"
            />
            <p className="text-center text-white mt-3 text-sm">{displayName}</p>
          </div>
        </div>
      )}
    </>
  );
}
