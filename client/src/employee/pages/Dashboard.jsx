import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase, Clock, CheckCircle, Calendar,
  MapPin, Loader2, AlertCircle, Building2,
  IndianRupee, ChevronRight, Hourglass, Archive,
} from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEmployeeProfile } from '../../context/EmployeeProfileContext';
import { apiFetch, toAbsoluteUrl } from '../../lib/api';
import { staggerContainer, staggerItem, revealUp, pendingPulse } from '../../lib/animations';

// ── Config ────────────────────────────────────────────────────────────────────

const STAT_CARDS = [
  { key: 'jobsApplied',     label: 'Jobs Applied',      icon: Briefcase,    color: 'blue'   },
  { key: 'pendingRequests', label: 'Pending Requests',  icon: Clock,        color: 'amber'  },
  { key: 'acceptedJob',     label: 'Accepted Job',      icon: CheckCircle,  color: 'green'  },
  { key: 'upcomingWork',    label: 'Upcoming Work',     icon: Calendar,     color: 'orange' },
];

const COLOR_MAP = {
  blue:   { bg: 'bg-blue-100',   text: 'text-blue-600'   },
  amber:  { bg: 'bg-amber-100',  text: 'text-amber-600'  },
  green:  { bg: 'bg-green-100',  text: 'text-green-600'  },
  orange: { bg: 'bg-orange-100', text: 'text-orange-600' },
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const diff = Math.ceil(
    (new Date(dateStr).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24)
  );
  if (diff === 0) return { label: 'Today',     cls: 'bg-red-100 text-red-700' };
  if (diff === 1) return { label: 'Tomorrow',  cls: 'bg-orange-100 text-orange-700' };
  if (diff <= 7)  return { label: `in ${diff} days`, cls: 'bg-amber-100 text-amber-700' };
  if (diff <= 30) return { label: `in ${Math.ceil(diff / 7)} weeks`, cls: 'bg-blue-100 text-blue-700' };
  return { label: `in ${Math.ceil(diff / 30)} months`, cls: 'bg-gray-100 text-gray-600' };
}

function getEventPriorityTone(dateStr) {
  const eventDate = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  eventDate.setHours(0, 0, 0, 0);
  const diffDays = Math.round((eventDate - today) / (1000 * 60 * 60 * 24));
  if (diffDays === 1) return { row: 'border-red-200 bg-red-50/40', badge: 'bg-red-100 text-red-700', label: 'Tomorrow' };
  if (diffDays >= 0 && diffDays <= 7) return { row: 'border-amber-200 bg-amber-50/40', badge: 'bg-amber-100 text-amber-700', label: 'This Week' };
  return { row: 'border-green-200 bg-green-50/40', badge: 'bg-green-100 text-green-700', label: 'Later' };
}

// ── Shimmer Skeleton ─────────────────────────────────────────────────────────

function ShimmerCard({ color }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4 relative overflow-hidden">
      <div className={`w-12 h-12 rounded-lg ${color.bg} shrink-0`} />
      <div className="flex-1 space-y-2">
        <div className="h-6 w-10 bg-gray-200 rounded" />
        <div className="h-3 w-24 bg-gray-200 rounded" />
      </div>
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

function AnimatedNumber({ value, className }) {
  const motionVal = useMotionValue(0);
  const rounded = useTransform(motionVal, (v) => Math.round(v));
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(motionVal, value, { duration: 0.9, ease: 'easeOut' });
    const unsubscribe = rounded.on('change', (v) => setDisplay(v));
    return () => { controls.stop(); unsubscribe(); };
  }, [value]);

  return <span className={className}>{display}</span>;
}

// ── Upcoming Work Card ────────────────────────────────────────────────────────

function UpcomingWorkCard({ w }) {
  const countdown = daysUntil(w.eventDate);
  return (
    <motion.li
      variants={staggerItem}
      className="flex items-start gap-3 py-4 first:pt-0 last:pb-0 border-b last:border-b-0 border-gray-100"
    >
      <div className="w-1 self-stretch rounded-full bg-orange-400 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <p className="font-semibold text-gray-800 truncate">{w.jobTitle}</p>
          {countdown && (
            <span className={`flex-shrink-0 inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${countdown.cls}`}>
              <Hourglass size={10} />
              {countdown.label}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className="inline-flex items-center gap-1 text-xs text-gray-500">
            <Calendar size={11} />
            {formatDate(w.eventDate)}
            {w.endDate && w.endDate !== w.eventDate && <> — {formatDate(w.endDate)}</>}
          </span>
          {w.location && w.location !== '—' && (
            <span className="inline-flex items-center gap-1 text-xs text-gray-500">
              <MapPin size={11} />
              {w.location}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {w.jobType && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 border border-orange-200">
              {w.jobType}
            </span>
          )}
          {w.salaryAmount && (
            <span className="inline-flex items-center gap-0.5 text-xs text-green-700 font-medium">
              <IndianRupee size={10} />
              {new Intl.NumberFormat('en-IN').format(w.salaryAmount)}
              {w.salaryPeriod ? ' / ' + w.salaryPeriod : ''}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between mt-2 gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            {w.catererLogo ? (
              <img src={toAbsoluteUrl(w.catererLogo)} alt={w.catererName} className="w-5 h-5 rounded-full object-cover border border-gray-200 flex-shrink-0" />
            ) : (
              <Building2 size={13} className="text-gray-400 flex-shrink-0" />
            )}
            <span className="text-xs text-gray-500 truncate">{w.catererName}</span>
            {w.catererDistrict && <span className="text-xs text-gray-400 truncate">, {w.catererDistrict}</span>}
          </div>
          <Link
            to="/employee/my-requests"
            className="flex-shrink-0 inline-flex items-center gap-0.5 text-xs text-orange-500 hover:text-orange-600 font-medium transition-colors"
          >
            Details <ChevronRight size={13} />
          </Link>
        </div>
      </div>
    </motion.li>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function EmployeeDashboard() {
  const { profile } = useEmployeeProfile();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [updatingEventId, setUpdatingEventId] = useState(null);

  useEffect(() => {
    if (!profile?.user) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    apiFetch(`/api/employee/dashboard/${profile.user}`)
      .then((res) => { if (!cancelled) setData(res); })
      .catch((err) => { if (!cancelled) setError(err?.message || 'Failed to load dashboard.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [profile?.user]);

  const stats        = data?.dashboardStats  ?? {};
  const upcomingWork = data?.upcomingWork    ?? [];
  const pendingList  = data?.pendingRequests ?? [];
  const upcomingEvents = data?.upcomingEvents ?? [];

  const updateChecklistEvent = async (eventId, payload) => {
    setUpdatingEventId(eventId);
    try {
      const updated = await apiFetch(`/api/job-requests/${eventId}/checklist`, {
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div {...revealUp}>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of your jobs and requests.</p>
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

      {/* Stat Cards */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {STAT_CARDS.map(({ key, label, icon: Icon, color }) => {
          const c = COLOR_MAP[color];
          return loading ? (
            <motion.div key={key} variants={staggerItem}>
              <ShimmerCard color={c} />
            </motion.div>
          ) : (
            <motion.div
              key={key}
              variants={staggerItem}
              whileHover={{ y: -4, boxShadow: '0 8px 24px rgba(0,0,0,0.10)' }}
              transition={{ type: 'spring', stiffness: 360, damping: 22 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4"
            >
              <motion.div
                className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${c.bg} ${c.text}`}
                whileHover={{ rotate: [0, -8, 8, 0], transition: { duration: 0.4 } }}
              >
                <Icon size={24} />
              </motion.div>
              <div>
                <AnimatedNumber value={stats[key] ?? 0} className={`text-2xl font-bold ${c.text}`} />
                <p className={`text-sm mt-0.5 ${c.text}`}>{label}</p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Lower Grid */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <div className="space-y-6">
          {/* Upcoming Work */}
          <motion.div variants={staggerItem} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Upcoming Work</h2>
                <p className="text-xs text-gray-400 mt-0.5">Accepted jobs with future event dates</p>
              </div>
              <Link to="/employee/my-requests" className="text-sm text-orange-500 hover:text-orange-600 font-medium transition-colors">
                View All
              </Link>
            </div>
            {loading ? (
              <div className="flex justify-center py-10"><Loader2 className="animate-spin text-orange-400" size={28} /></div>
            ) : upcomingWork.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-10 text-gray-400"
              >
                <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                  <Calendar size={28} className="opacity-40" />
                </div>
                <p className="text-sm font-medium text-gray-500">No upcoming work scheduled.</p>
                <p className="text-xs text-gray-400 mt-1">Accepted jobs with future dates will appear here.</p>
              </motion.div>
            ) : (
              <motion.ul
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="space-y-0"
              >
                {upcomingWork.map((w) => <UpcomingWorkCard key={w.id} w={w} />)}
              </motion.ul>
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
                        exit={{ opacity: 0, x: 40, height: 0, transition: { duration: 0.25 } }}
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
                                  {event.jobTitle}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {event.eventType} · {formatDate(event.eventDate)}
                                </p>
                              </div>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${tone.badge}`}>
                                {tone.label}
                              </span>
                            </div>
                            <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-gray-600">
                              <span>Caterer: {event.catererName || '—'}</span>
                              <span>District: {event.district || '—'}</span>
                              <span>Phone: {event.catererPhone || '—'}</span>
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

        {/* Pending Requests */}
        <motion.div variants={staggerItem} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Pending Requests</h2>
              <p className="text-xs text-gray-400 mt-0.5">Awaiting caterer response</p>
            </div>
            <Link to="/employee/my-requests" className="text-sm text-orange-500 hover:text-orange-600 font-medium transition-colors">
              View All
            </Link>
          </div>
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-orange-400" size={28} /></div>
          ) : pendingList.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-10 text-gray-400"
            >
              <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                <Clock size={28} className="opacity-40" />
              </div>
              <p className="text-sm font-medium text-gray-500">No pending requests.</p>
              <p className="text-xs text-gray-400 mt-1">Your new applications will appear here.</p>
            </motion.div>
          ) : (
            <motion.ul
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="divide-y divide-gray-100"
            >
              {pendingList.map((r) => (
                <motion.li
                  key={r.id}
                  variants={staggerItem}
                  className="flex items-center justify-between py-3 gap-3"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800 truncate">{r.jobTitle}</p>
                    <div className="flex items-center gap-1.5 mt-0.5 text-xs text-gray-500 flex-wrap">
                      {r.eventDate && (
                        <>
                          <Calendar size={11} />
                          <span>{formatDate(r.eventDate)}</span>
                          <span className="text-gray-300">·</span>
                        </>
                      )}
                      {r.jobType && <span>{r.jobType}</span>}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-400">
                      <Building2 size={11} />
                      <span>{r.catererName}</span>
                    </div>
                  </div>
                  <motion.span
                    animate={pendingPulse.animate}
                    className="flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700"
                  >
                    <Clock size={10} />
                    Pending
                  </motion.span>
                </motion.li>
              ))}
            </motion.ul>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
