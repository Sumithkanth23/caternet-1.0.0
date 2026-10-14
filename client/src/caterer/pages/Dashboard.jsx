import { useEffect, useState, useRef } from 'react';
import {
  UtensilsCrossed,
  Calendar,
  MessageCircle,
  CheckCircle,
  UserPlus,
  Archive,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { useCatererProfile } from '../../context/CatererProfileContext';
import { apiFetch } from '../../lib/api';
import { staggerContainer, staggerItem, revealUp, pendingPulse } from '../../lib/animations';

// ── Config ─────────────────────────────────────────────────────────────────

const STAT_CARDS = [
  { key: 'totalMenus',       label: 'Total Menus',       icon: UtensilsCrossed, color: 'orange' },
  { key: 'totalBookings',    label: 'Total Bookings',     icon: Calendar,        color: 'orange' },
  { key: 'pendingRequests',  label: 'Pending Requests',   icon: MessageCircle,   color: 'orange' },
  { key: 'confirmedEvents',  label: 'Confirmed Events',   icon: CheckCircle,     color: 'green'  },
  { key: 'employeeRequests', label: 'Employee Requests',  icon: UserPlus,        color: 'blue'   },
];

const COLOR_MAP = {
  orange: 'bg-orange-100 text-orange-600',
  green:  'bg-green-100  text-green-600',
  blue:   'bg-blue-100   text-blue-600',
};

const STATUS_BADGE = {
  Accepted: 'bg-green-100 text-green-700',
  Pending:  'bg-amber-100 text-amber-700',
  Declined: 'bg-red-100   text-red-700',
};

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(amount) {
  return `₹${Number(amount || 0).toLocaleString('en-IN')}`;
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatReadableEventDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
}

function getEventPriorityTone(dateStr) {
  const eventDate = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  eventDate.setHours(0, 0, 0, 0);
  const diffDays = Math.round((eventDate - today) / (1000 * 60 * 60 * 24));
  if (diffDays === 1) return { row: 'border-red-200 bg-red-50/40 hover:bg-red-50', badge: 'bg-red-100 text-red-700', label: 'Tomorrow' };
  if (diffDays >= 0 && diffDays <= 7) return { row: 'border-amber-200 bg-amber-50/40 hover:bg-amber-50', badge: 'bg-amber-100 text-amber-700', label: 'This Week' };
  return { row: 'border-green-200 bg-green-50/40 hover:bg-green-50', badge: 'bg-green-100 text-green-700', label: 'Later' };
}

// ── Shimmer Skeleton ─────────────────────────────────────────────────────────

function ShimmerCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4 overflow-hidden relative">
      <div className="w-12 h-12 rounded-lg bg-gray-200 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-6 w-10 bg-gray-200 rounded" />
        <div className="h-3 w-24 bg-gray-200 rounded" />
      </div>
      {/* shimmer sweep */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
        animate={{ x: ['-100%', '200%'] }}
        transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
        style={{ width: '60%' }}
      />
    </div>
  );
}

// ── Animated Number ──────────────────────────────────────────────────────────

function AnimatedNumber({ value }) {
  const motionVal = useMotionValue(0);
  const rounded = useTransform(motionVal, (v) => Math.round(v));
  const [display, setDisplay] = useState(0);
  const prevValue = useRef(0);

  useEffect(() => {
    const controls = animate(motionVal, value, {
      duration: 0.9,
      ease: 'easeOut',
    });
    const unsubscribe = rounded.on('change', (v) => setDisplay(v));
    prevValue.current = value;
    return () => { controls.stop(); unsubscribe(); };
  }, [value]);

  return <span>{display}</span>;
}

// ── Main Component ──────────────────────────────────────────────────────────

export default function Dashboard() {
  const { profile } = useCatererProfile();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [updatingEventId, setUpdatingEventId] = useState(null);

  useEffect(() => {
    if (!profile?._id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    apiFetch(`/api/caterer/dashboard/${profile._id}`)
      .then((res) => { if (cancelled) return; setData(res); })
      .catch((err) => { if (!cancelled) setError(err?.message || 'Failed to load dashboard data.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [profile?._id]);

  const stats          = data?.dashboardStats ?? {};
  const recentBookings = data?.recentBookings  ?? [];
  const summary        = data?.bookingSummary  ?? {};
  const upcomingEvents = data?.upcomingEvents  ?? [];

  const updateChecklistEvent = async (eventId, payload) => {
    setUpdatingEventId(eventId);
    try {
      const updated = await apiFetch(`/api/bookings/${eventId}/checklist`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setData((prev) => {
        if (!prev) return prev;
        const nextEvents = (prev.upcomingEvents || [])
          .map((event) => event.id !== eventId ? event : { ...event, checklistCompleted: updated.checklistCompleted, checklistArchived: updated.checklistArchived })
          .filter((event) => !event.checklistArchived);
        return { ...prev, upcomingEvents: nextEvents };
      });
    } catch (err) {
      alert(err?.message || 'Failed to update checklist event.');
    } finally {
      setUpdatingEventId(null);
    }
  };

  if (!profile?._id) {
    return (
      <div className="flex items-center justify-center h-60 text-gray-400 text-sm">
        Profile not found. Please complete your profile setup.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div {...revealUp}>
        <h1 className="text-2xl font-bold text-gray-800">Caterer Dashboard</h1>
        <p className="text-gray-500 mt-1">Monitor overall performance of your catering services.</p>
      </motion.div>

      {/* Stat Cards */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
      >
        {loading
          ? STAT_CARDS.map(({ key }) => (
              <motion.div key={key} variants={staggerItem}>
                <ShimmerCard />
              </motion.div>
            ))
          : STAT_CARDS.map(({ key, label, icon: Icon, color }) => (
              <motion.div
                key={key}
                variants={staggerItem}
                whileHover={{ y: -4, boxShadow: '0 8px 24px rgba(0,0,0,0.10)' }}
                transition={{ type: 'spring', stiffness: 360, damping: 22 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4"
              >
                <motion.div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${COLOR_MAP[color]}`}
                  whileHover={{ rotate: [0, -8, 8, 0], transition: { duration: 0.4 } }}
                >
                  <Icon size={24} />
                </motion.div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">
                    <AnimatedNumber value={stats[key] ?? 0} />
                  </p>
                  <p className="text-sm text-gray-500">{label}</p>
                </div>
              </motion.div>
            ))}
      </motion.div>

      {/* Error Banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg p-4"
          >
            <AlertCircle size={18} className="flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recent Bookings + Summary */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Recent Bookings */}
        <motion.div variants={staggerItem} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Recent Bookings</h2>
            <Link to="/caterer/workforce/booking-requests" className="text-sm text-orange-500 hover:text-orange-600 font-medium transition-colors">
              View All
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="animate-spin text-orange-400" size={28} />
            </div>
          ) : recentBookings.length === 0 ? (
            <p className="text-gray-400 text-center text-sm py-6">No recent bookings.</p>
          ) : (
            <motion.ul
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="space-y-3"
            >
              <AnimatePresence>
                {recentBookings.map((b) => (
                  <motion.li
                    key={b.id}
                    variants={staggerItem}
                    exit={{ opacity: 0, x: 40, transition: { duration: 0.22 } }}
                    className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-semibold text-sm uppercase flex-shrink-0">
                        {(b.clientName || 'C').charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-800 truncate">{b.clientName}</p>
                        <p className="text-xs text-gray-500">{b.guests} Guests · {formatDate(b.eventDate)}</p>
                      </div>
                    </div>
                    <motion.span
                      className={`ml-3 flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_BADGE[b.status] ?? 'bg-gray-100 text-gray-600'}`}
                      animate={b.status === 'Pending' ? pendingPulse.animate : {}}
                    >
                      {b.status}
                    </motion.span>
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>
          )}
        </motion.div>

        <div className="space-y-6">
          {/* Booking Summary */}
          <motion.div variants={staggerItem} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Booking Summary</h2>
            {loading ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="animate-spin text-orange-400" size={28} />
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {[
                  { label: 'Total Revenue This Month', value: formatCurrency(summary.totalRevenueThisMonth), color: 'text-gray-800' },
                  { label: 'Payouts Pending',           value: formatCurrency(summary.payoutsPending),        color: 'text-orange-600' },
                  { label: 'Revenue Last Month',        value: formatCurrency(summary.revenueLastMonth),      color: 'text-gray-800' },
                  { label: 'Average Guests / Event',    value: `${summary.averageGuestsPerEvent ?? 0} Guests`, color: 'text-gray-800' },
                ].map((row, i) => (
                  <motion.li
                    key={row.label}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07, type: 'spring', stiffness: 260, damping: 22 }}
                    className="flex justify-between items-center py-3"
                  >
                    <span className="text-sm text-gray-600">{row.label}</span>
                    <span className={`font-semibold ${row.color}`}>{row.value}</span>
                  </motion.li>
                ))}
              </ul>
            )}
          </motion.div>

          {/* Upcoming Events Checklist */}
          <motion.div variants={staggerItem} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Upcoming Events Checklist</h2>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                {upcomingEvents.length}
              </span>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="animate-spin text-orange-400" size={28} />
              </div>
            ) : upcomingEvents.length === 0 ? (
              <p className="text-sm text-gray-500 py-6 text-center">No upcoming events.</p>
            ) : (
              <motion.ul
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="space-y-3"
              >
                <AnimatePresence>
                  {upcomingEvents.map((event) => {
                    const tone = getEventPriorityTone(event.eventDate);
                    const isBusy = updatingEventId === event.id;
                    return (
                      <motion.li
                        key={event.id}
                        variants={staggerItem}
                        exit={{ opacity: 0, x: 40, height: 0, marginBottom: 0, transition: { duration: 0.25 } }}
                        className={`border rounded-lg p-3 transition-colors ${tone.row} ${event.checklistCompleted ? 'opacity-70' : ''}`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={Boolean(event.checklistCompleted)}
                            disabled={isBusy}
                            onChange={(e) => updateChecklistEvent(event.id, { completed: e.target.checked })}
                            className="mt-1 h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500 disabled:opacity-50"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className={`font-medium text-gray-800 ${event.checklistCompleted ? 'line-through text-gray-500' : ''}`}>
                                  {event.customerName}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {event.eventType} · {formatReadableEventDate(event.eventDate)}
                                </p>
                              </div>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${tone.badge}`}>
                                {tone.label}
                              </span>
                            </div>
                            <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-gray-600">
                              <span>Guests: {event.guestCount ?? 0}</span>
                              <span>District: {event.district || '—'}</span>
                              <span>Phone: {event.customerPhone || '—'}</span>
                            </div>
                          </div>
                          {event.checklistCompleted && (
                            <motion.button
                              type="button"
                              disabled={isBusy}
                              onClick={() => updateChecklistEvent(event.id, { archived: true })}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.93 }}
                              className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                            >
                              <Archive size={14} />
                              Archive
                            </motion.button>
                          )}
                        </div>
                      </motion.li>
                    );
                  })}
                </AnimatePresence>
              </motion.ul>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
