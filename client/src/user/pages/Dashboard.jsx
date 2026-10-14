import { Link } from 'react-router-dom';
import { CalendarCheck, Search, Star, User } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/AuthContext';
import { staggerContainer, staggerItem, revealUp } from '../../lib/animations';

const quickActions = [
  {
    to: '/search',
    icon: Search,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    title: 'Find Services',
    desc: 'Browse catering options',
  },
  {
    to: '/my-bookings',
    icon: CalendarCheck,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    title: 'My Bookings',
    desc: 'View booking history',
  },
  {
    to: '/',
    icon: Star,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-500',
    title: 'Top Rated',
    desc: 'Explore best caterers',
  },
];

export default function UserDashboard() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-10">
        {/* Welcome banner */}
        <motion.div
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 26 }}
          className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl px-8 py-8 text-white shadow-lg mb-8"
        >
          <p className="text-blue-100 text-sm font-medium mb-1">Welcome back</p>
          <h1 className="text-3xl font-bold mb-1">{user?.name || 'Customer'} 👋</h1>
          <p className="text-blue-200 text-sm">{user?.email}</p>
        </motion.div>

        {/* Quick actions */}
        <motion.h2 {...revealUp} className="text-lg font-bold text-gray-800 mb-4">
          Quick Actions
        </motion.h2>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {quickActions.map((action) => (
            <motion.div
              key={action.to + action.title}
              variants={staggerItem}
              whileHover={{ y: -4, boxShadow: '0 8px 24px rgba(0,0,0,0.10)' }}
              transition={{ type: 'spring', stiffness: 360, damping: 22 }}
            >
              <Link
                to={action.to}
                className="flex items-center gap-4 bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:border-blue-200 transition"
              >
                <div className={`w-11 h-11 ${action.iconBg} rounded-xl flex items-center justify-center`}>
                  <action.icon size={22} className={action.iconColor} />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{action.title}</p>
                  <p className="text-xs text-gray-500">{action.desc}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Account info */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, type: 'spring', stiffness: 240, damping: 24 }}
          className="mt-8 bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <User size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">Account Details</p>
              <p className="text-xs text-gray-500">Your registered information</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            {[
              { label: 'Name', value: user?.name || '—' },
              { label: 'Email', value: user?.email || '—' },
            ].map((row, i) => (
              <motion.div
                key={row.label}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 + i * 0.08 }}
              >
                <p className="text-gray-500 text-xs mb-0.5">{row.label}</p>
                <p className="font-medium text-gray-800">{row.value}</p>
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.62 }}
            >
              <p className="text-gray-500 text-xs mb-0.5">Role</p>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold capitalize">
                {user?.role || '—'}
              </span>
            </motion.div>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
