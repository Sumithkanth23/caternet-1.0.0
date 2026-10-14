import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserPlus, CheckCircle } from 'lucide-react';
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
  initial: { opacity: 0, y: -44, scale: 0.95 },
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
  animate: { transition: { staggerChildren: 0.07, delayChildren: 0.18 } },
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    setServerError('');
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Full name is required.';
    if (!form.email.trim()) newErrors.email = 'Email address is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      newErrors.email = 'Please enter a valid email address.';
    if (!form.password) newErrors.password = 'Password is required.';
    else if (form.password.length < 6) newErrors.password = 'Password must be at least 6 characters.';
    if (!form.confirmPassword) newErrors.confirmPassword = 'Please confirm your password.';
    else if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match.';
    if (!form.role) newErrors.role = 'Please select a role.';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      setShakeKey((k) => k + 1);
      return;
    }

    setLoading(true);
    try {
      const data = await apiFetch('/api/user/register', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          role: form.role,
        }),
      });
      login(data);
      navigate(DASHBOARD_MAP[data.user.role] || '/');
    } catch (err) {
      setServerError(err?.message || 'Registration failed. Please try again.');
      setShakeKey((k) => k + 1);
    } finally {
      setLoading(false);
    }
  };

  const passwordsMatch = form.password && form.confirmPassword && form.password === form.confirmPassword;

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
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
        <motion.div
          variants={cardVariant}
          initial="initial"
          animate="animate"
          className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
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
              </span>{' '}Register
            </motion.h2>
            <p className="text-gray-500 text-sm mt-1">Create your CaterNet account</p>
          </div>

          <motion.div
            key={shakeKey}
            variants={shakeVariants}
            animate={serverError || Object.keys(errors).length > 0 ? 'shake' : ''}
            className="px-7 py-5"
          >
            <motion.form
              onSubmit={handleSubmit}
              noValidate
              variants={fieldStagger}
              initial="initial"
              animate="animate"
              className="space-y-4"
            >
              {/* Server error */}
              <AnimatePresence>
                {serverError && (
                  <motion.div
                    key="server-error"
                    initial={{ opacity: 0, y: -8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2.5 rounded-lg"
                    role="alert"
                  >
                    <span>⚠ {serverError}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Role */}
              <motion.div variants={fieldVariant}>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  Register as <span className="text-red-500">*</span>
                </label>
                <select
                  id="role"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  required
                  className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-800 bg-white text-sm transition appearance-none cursor-pointer ${
                    errors.role ? 'border-red-400 bg-red-50' : 'border-gray-300'
                  }`}
                >
                  <option value="" disabled>Select role…</option>
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
                <AnimatePresence>
                  {errors.role && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="text-xs text-red-600 mt-1"
                    >{errors.role}</motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Full Name */}
              <motion.div variants={fieldVariant}>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full name <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  autoComplete="name"
                  required
                  className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-800 text-sm transition ${
                    errors.name ? 'border-red-400 bg-red-50' : 'border-gray-300'
                  }`}
                />
                <AnimatePresence>
                  {errors.name && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="text-xs text-red-600 mt-1"
                    >{errors.name}</motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Email */}
              <motion.div variants={fieldVariant}>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-800 text-sm transition ${
                    errors.email ? 'border-red-400 bg-red-50' : 'border-gray-300'
                  }`}
                />
                <AnimatePresence>
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="text-xs text-red-600 mt-1"
                    >{errors.email}</motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Password */}
              <motion.div variants={fieldVariant}>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={handleChange}
                    placeholder="At least 6 characters"
                    autoComplete="new-password"
                    required
                    className={`w-full px-3 py-2.5 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-800 text-sm transition ${
                      errors.password ? 'border-red-400 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  <motion.button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    whileTap={{ scale: 0.85 }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </motion.button>
                </div>
                <AnimatePresence>
                  {errors.password && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="text-xs text-red-600 mt-1"
                    >{errors.password}</motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Confirm Password */}
              <motion.div variants={fieldVariant}>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    required
                    className={`w-full px-3 py-2.5 pr-14 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-800 text-sm transition ${
                      errors.confirmPassword ? 'border-red-400 bg-red-50' : passwordsMatch ? 'border-green-400' : 'border-gray-300'
                    }`}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                    <AnimatePresence>
                      {passwordsMatch && (
                        <motion.span
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                        >
                          <CheckCircle size={14} className="text-green-500" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                    <motion.button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      whileTap={{ scale: 0.85 }}
                      className="text-gray-400 hover:text-gray-600 transition"
                    >
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </motion.button>
                  </div>
                </div>
                <AnimatePresence>
                  {errors.confirmPassword && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="text-xs text-red-600 mt-1"
                    >{errors.confirmPassword}</motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Login link */}
              <motion.p variants={fieldVariant} className="text-sm text-gray-500">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition">
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
                    Creating account…
                  </>
                ) : (
                  <>
                    <UserPlus size={16} />
                    Create Account
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
