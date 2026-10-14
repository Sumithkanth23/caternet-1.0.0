import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, LogOut, X, LayoutDashboard, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

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
  const inputRef = useRef(null);

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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    setSearchOpen(false);
    setQuery('');
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const handleLogout = () => { logout(); navigate('/'); };

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

                {/* Welcome + role badge */}
                <motion.div
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                  className="flex items-center gap-2"
                >
                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <User size={15} className="text-gray-400" />
                    <span className="font-medium text-gray-800">{user.name || user.email}</span>
                  </div>
                  <motion.span
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 20, delay: 0.1 }}
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${roleColor}`}
                  >
                    {user.role}
                  </motion.span>
                </motion.div>

                {/* Logout */}
                <motion.button
                  type="button"
                  onClick={handleLogout}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.94 }}
                  className="flex items-center gap-1.5 bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-700 font-medium py-2 px-4 rounded-lg transition text-sm border border-transparent hover:border-red-200"
                >
                  <LogOut size={16} />
                  Logout
                </motion.button>
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
