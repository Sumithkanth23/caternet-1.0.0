import { useEffect, useMemo, useState } from 'react';
import {
  CalendarCheck,
  IndianRupee,
  Loader2,
  MapPin,
  PartyPopper,
  ServerCrash,
  Users,
  UtensilsCrossed,
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { apiFetch, toAbsoluteUrl } from '../../lib/api';

const PERIOD_OPTIONS = ['All Time', 'This Month', 'Last Month', 'This Year'];

function formatEventDate(date) {
  if (!date) return 'Date not available';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// Groups bookings by the month they were completed in. Falls back to the
// event date (and finally "Earlier") so a booking never silently disappears
// just because one date field is missing.
function getMonthGroupKey(booking) {
  const rawDate = booking.completedAt || booking.eventDate;
  const parsed = rawDate ? new Date(rawDate) : null;
  if (!parsed || Number.isNaN(parsed.getTime())) return 'Earlier';
  return parsed.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function isWithinPeriod(booking, period) {
  if (period === 'All Time') return true;

  const rawDate = booking.completedAt || booking.eventDate;
  const date = rawDate ? new Date(rawDate) : null;
  if (!date || Number.isNaN(date.getTime())) return false;

  const now = new Date();
  if (period === 'This Month') {
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }
  if (period === 'Last Month') {
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return date.getMonth() === lastMonth.getMonth() && date.getFullYear() === lastMonth.getFullYear();
  }
  if (period === 'This Year') {
    return date.getFullYear() === now.getFullYear();
  }
  return true;
}

function matchesSearch(booking, search) {
  if (!search.trim()) return true;
  const catererName = booking.caterer?.serviceName || '';
  return catererName.toLowerCase().includes(search.trim().toLowerCase());
}

function LoadingState() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((key) => (
        <div key={key} className="h-28 animate-pulse rounded-xl bg-gray-200" />
      ))}
    </div>
  );
}

function ErrorState({ onRetry }) {
  return (
    <div className="flex flex-col items-center gap-3 py-20 text-center">
      <ServerCrash size={44} className="text-red-400" />
      <p className="text-lg font-medium text-gray-700">Couldn't load your history</p>
      <p className="text-sm text-gray-400">Please check your connection and try again.</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-1 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
      >
        Retry
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-2 py-20 text-center">
      <span className="text-5xl">📜</span>
      <h2 className="font-semibold text-gray-800">No history yet</h2>
      <p className="max-w-sm text-sm text-gray-500">
        Completed bookings show up here once your event date has passed and the caterer has confirmed it.
      </p>
    </div>
  );
}

function CatererAvatar({ booking }) {
  const logoUrl = booking.caterer?.logoUrl;
  if (logoUrl) {
    return (
      <img
        src={toAbsoluteUrl(logoUrl)}
        alt=""
        className="h-11 w-11 shrink-0 rounded-full object-cover"
      />
    );
  }
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-100 text-lg">
      🍽️
    </div>
  );
}

function BookingHistoryCard({ booking }) {
  return (
    <article className="rounded-xl bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex gap-3">
        <CatererAvatar booking={booking} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h3 className="font-semibold text-gray-800">
              {booking.caterer?.serviceName || 'Caterer'}
            </h3>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
              ✅ Completed
            </span>
          </div>

          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
            <span className="inline-flex items-center gap-1.5">
              <PartyPopper size={14} className="text-gray-400" />
              {booking.eventType || 'Event'}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarCheck size={14} className="text-gray-400" />
              {formatEventDate(booking.eventDate)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Users size={14} className="text-gray-400" />
              {booking.guestCount || 0} guests
            </span>
            <span className="inline-flex items-center gap-1.5">
              <UtensilsCrossed size={14} className="text-gray-400" />
              {booking.menu?.packageName || 'Menu'}
            </span>
          </div>

          <div className="mt-1.5 flex items-center gap-1.5 text-sm text-gray-500">
            <MapPin size={14} className="text-gray-400" />
            {booking.venueAddress || booking.venueName || 'Venue not specified'}
          </div>

          <div className="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700">
            <IndianRupee size={14} className="text-gray-400" />
            {(booking.totalAmount || 0).toLocaleString('en-IN')}
          </div>
        </div>
      </div>
    </article>
  );
}

export default function UserHistory() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [period, setPeriod] = useState('All Time');
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let isActive = true;
    setLoading(true);
    setError(false);

    apiFetch('/api/bookings/user/history')
      .then((data) => {
        if (isActive) setBookings(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (isActive) setError(true);
      })
      .finally(() => {
        if (isActive) setLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [reloadToken]);

  const groupedByMonth = useMemo(() => {
    const filtered = bookings
      .filter((booking) => matchesSearch(booking, search))
      .filter((booking) => isWithinPeriod(booking, period));

    return filtered.reduce((groups, booking) => {
      const key = getMonthGroupKey(booking);
      (groups[key] ||= []).push(booking);
      return groups;
    }, {});
  }, [bookings, search, period]);

  const monthEntries = Object.entries(groupedByMonth);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">History</h1>
          <p className="mt-1 text-gray-500">Your completed catering events.</p>
        </div>

        <div className="my-6 flex flex-col gap-3 sm:flex-row">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search caterer name..."
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
          />
          <select
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
          >
            {PERIOD_OPTIONS.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </div>

        {loading && <LoadingState />}

        {!loading && error && <ErrorState onRetry={() => setReloadToken((token) => token + 1)} />}

        {!loading && !error && monthEntries.length === 0 && <EmptyState />}

        {!loading && !error && monthEntries.length > 0 && (
          <div className="space-y-7 border-l-2 border-orange-200 pl-5">
            {monthEntries.map(([month, monthBookings]) => (
              <section key={month}>
                <h2 className="sticky top-0 bg-gray-50 py-2 text-xs font-bold uppercase tracking-wide text-gray-500">
                  {month}
                </h2>
                <div className="space-y-3">
                  {monthBookings.map((booking) => (
                    <BookingHistoryCard key={booking._id} booking={booking} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
