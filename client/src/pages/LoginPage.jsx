import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import { shakeVariants } from '../lib/animations';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import HeroSection from '../user/sections/HeroSection';
import PopularServices from '../user/sections/PopularServices';

const ROLES = [
  { value: 'user', label: 'User (Customer)' },
  { value: 'caterer', label: 'Caterer' },
  { value: 'employee', label: 'Employee' },
];

const DASHBOARD_MAP = {
  user: '/user/dashboard',
  caterer: '/caterer/dashboard',
  employee: '/employee/dashboard',
};

const cardVariant = {
  initial: { opacity: 0, y: -40, scale: 0.96 },
  animate: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 26 },
  },
};

const fieldVariant = {
  initial: { opacity: 0, x: -16 },
  animate: { opacity: 1, x: 0 },
};

const fieldStagger = {
  animate: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
};

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: '', password: '', role: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const triggerShake = () => setShakeKey((k) => k + 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.email.trim()) { setError('Please enter your email.'); triggerShake(); return; }
    if (!form.password.trim()) { setError('Please enter your password.'); triggerShake(); return; }
    if (!form.role) { setError('Please select your role.'); triggerShake(); return; }

    setLoading(true);
    try {
      const data = await apiFetch('/api/user/login', {
        method: 'POST',
        body: JSON.stringify({
          email: form.email.trim(),
          password: form.password,
          role: form.role,
        }),
      });

      login(data);
      const redirect = searchParams.get('redirect');
      if (redirect) {
        navigate(redirect);
      } else if (data.user.role === 'user') {
        const profile = await apiFetch('/api/user/me');
        navigate(profile.phone && profile.district ? '/user/dashboard' : '/user/create-profile');
      } else {
        navigate(DASHBOARD_MAP[data.user.role] || '/');
      }
    } catch (err) {
      setError(err?.message || 'Login failed. Please check your credentials.');
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Blurred background */}
      <div className="filter blur-sm brightness-75 pointer-events-none select-none" aria-hidden="true">
        <Navbar />
        <HeroSection district="" setDistrict={() => {}} date="" setDate={() => {}} />
        <PopularServices />
        <Footer />
      </div>

      {/* Overlay */}
      <motion.div
        className="fixed inset-0 bg-black/30 z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <motion.div
          variants={cardVariant}
          initial="initial"
          animate="animate"
          className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="px-7 pt-7 pb-1 text-center">
            <motion.h2
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 24 }}
              className="text-2xl font-bold text-gray-900"
            >
              <span className="text-blue-600">
                {form.role === 'caterer' ? 'Caterer' : form.role === 'employee' ? 'Employee' : 'User'}
              </span>{' '}Login
            </motion.h2>
          </div>

          <motion.div
            key={shakeKey}
            variants={shakeVariants}
            animate={error ? 'shake' : ''}
            className="px-7 py-6"
          >
            <motion.form
              onSubmit={handleSubmit}
              noValidate
              variants={fieldStagger}
              initial="initial"
              animate="animate"
              className="space-y-4"
            >
              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, y: -8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -6, height: 0 }}
                    transition={{ duration: 0.22 }}
                    className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2.5 rounded-lg"
                    role="alert"
                  >
                    <span>⚠ {error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Role */}
              <motion.div variants={fieldVariant}>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  Login as <span className="text-red-500">*</span>
                </label>
                <select
                  id="role"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-800 bg-white text-sm transition appearance-none cursor-pointer"
                >
                  <option value="" disabled>Select role…</option>
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </motion.div>

              {/* Email */}
              <motion.div variants={fieldVariant}>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="testuser@example.com"
                  autoComplete="email"
                  required
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-800 text-sm transition"
                />
              </motion.div>

              {/* Password */}
              <motion.div variants={fieldVariant}>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••"
                    autoComplete="current-password"
                    required
                    className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-800 text-sm transition"
                  />
                  <motion.button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    whileTap={{ scale: 0.85 }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </motion.button>
                </div>
              </motion.div>

              {/* Register link */}
              <motion.p variants={fieldVariant} className="text-sm text-gray-500">
                Create an account?{' '}
                <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition">
                  Click here
                </Link>
              </motion.p>

              {/* Submit */}
              <motion.button
                variants={fieldVariant}
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm shadow"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Signing in…
                  </>
                ) : (
                  <>
                    <LogIn size={16} />
                    Login
                  </>
                )}
              </motion.button>
            </motion.form>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
