import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, HelpCircle, User, ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useEmployeeProfile } from '../../context/EmployeeProfileContext';
import AccountAvatar from '../../components/AccountAvatar';
import NotificationMenu from '../../components/NotificationMenu';

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
  const [profileOpen, setProfileOpen] = useState(false);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
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
          <NotificationMenu path={profile?._id ? `/api/job-requests/employee/${profile._id}` : ''} linkTo="/employee/my-requests" title="Application updates" itemLabel={(request) => `${request.job?.title || 'Job application'} is awaiting a response`} />
          <div ref={profileMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen((open) => !open)}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-100 transition"
              aria-expanded={profileOpen}
              aria-haspopup="menu"
            >
              <AccountAvatar name={user?.name || displayName} />
              <span className="hidden sm:block text-sm font-medium text-gray-800 max-w-32 truncate">{displayName}</span>
              <ChevronDown size={16} className={`text-gray-500 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  role="menu"
                  className="absolute right-0 mt-2 w-44 rounded-xl border border-gray-100 bg-white p-1.5 shadow-lg"
                >
                  <Link
                    to="/employee/profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    role="menuitem"
                  >
                    <User size={16} />
                    My Profile
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                    role="menuitem"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
    </header>
  );
}
