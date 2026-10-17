import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, LogOut, X, LayoutDashboard, User, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import AccountAvatar from './AccountAvatar';

const DASHBOARD_MAP = {
  user: '/user/dashboard',
  caterer: '/caterer/dashboard',
  employee: '/employee/dashboard',
};

const ROLE_COLORS = {
  user: 'bg-blue-100 text-blue-700',
  caterer: 'bg-amber-100 text-amber-700',
  employee: 'bg-emerald-100 text-emerald-700',
};

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const inputRef = useRef(null);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    if (searchOpen) setTimeout(() => inputRef.current?.focus(), 50);
  }, [searchOpen]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') { setSearchOpen(false); setQuery(''); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    setSearchOpen(false);
    setQuery('');
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const handleLogout = () => { setProfileOpen(false); logout(); navigate('/'); };

  const dashboardPath = user ? (DASHBOARD_MAP[user.role] || '/') : '/';
  const roleColor = user ? (ROLE_COLORS[user.role] || 'bg-gray-100 text-gray-700') : '';

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 280, damping: 26 }}
      className="flex items-center justify-between px-6 py-4 bg-white shadow-sm sticky top-0 z-50"
    >
      {/* Logo */}
      <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="text-sky-500" aria-hidden>🍽️</span>
          <span className="font-bold text-xl text-gray-800">CaterNet</span>
        </Link>
      </motion.div>

      {/* Search or Nav */}
      <AnimatePresence mode="wait">
        {searchOpen ? (
          <motion.form
            key="search"
            initial={{ opacity: 0, scaleX: 0.85 }}
            animate={{ opacity: 1, scaleX: 1 }}
            exit={{ opacity: 0, scaleX: 0.85 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            onSubmit={handleSearchSubmit}
            className="flex flex-1 items-center mx-6 bg-gray-50 border border-blue-400 rounded-xl px-4 py-2 gap-3 shadow-sm origin-left"
          >
            <Search size={18} className="text-blue-500 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search caterer name, cuisine, district…"
              className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-400 text-sm"
            />
            <AnimatePresence>
              {query && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  type="button"
                  onClick={() => setQuery('')}
                  className="text-gray-400 hover:text-gray-600 transition shrink-0"
                  aria-label="Clear search"
                >
                  <X size={16} />
                </motion.button>
              )}
            </AnimatePresence>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition"
            >
              Search
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              type="button"
              onClick={() => { setSearchOpen(false); setQuery(''); }}
              className="shrink-0 text-gray-400 hover:text-gray-600 transition"
              aria-label="Close search"
            >
              <X size={20} />
            </motion.button>
          </motion.form>
        ) : (
          <motion.div
            key="nav"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="flex items-center gap-4"
          >
            <Link to="/" className="text-gray-700 hover:text-blue-600 transition text-sm font-medium">
              Home
            </Link>

            {/* Search button */}
            <motion.button
              type="button"
              onClick={() => setSearchOpen(true)}
              whileHover={{ scale: 1.03, borderColor: '#3b82f6' }}
              whileTap={{ scale: 0.96 }}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 bg-white text-gray-500 hover:border-blue-500 hover:text-blue-600 hover:shadow-sm transition text-sm font-medium"
            >
              Search Service
              <Search size={16} className="shrink-0" />
            </motion.button>

            {isAuthenticated && user ? (
              <>
                {/* Dashboard link */}
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                  <Link
                    to={dashboardPath}
                    className="flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-blue-600 transition"
                  >
                    <LayoutDashboard size={16} />
                    Dashboard
                  </Link>
                </motion.div>

                <div ref={profileMenuRef} className="relative">
                  <button type="button" onClick={() => setProfileOpen((open) => !open)} className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-100 transition" aria-expanded={profileOpen}>
                    <AccountAvatar name={user.name || user.email} />
                    <span className="hidden sm:block text-sm font-medium text-gray-800 max-w-28 truncate">{user.name || user.email}</span>
                    <ChevronDown size={16} className={`text-gray-500 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="absolute right-0 mt-2 w-44 rounded-xl border border-gray-100 bg-white p-1.5 shadow-lg">
                        <Link to={user.role === 'user' ? '/user/profile' : `/${user.role}/profile`} onClick={() => setProfileOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"><User size={16} /> My Profile</Link>
                        <button type="button" onClick={handleLogout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"><LogOut size={16} /> Logout</button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/login"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-lg transition text-sm shadow-sm"
                >
                  Login
                </Link>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
