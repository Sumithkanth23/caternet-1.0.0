import { useEffect, useMemo, useState } from 'react';
import { Clock, IndianRupee, MapPin, ServerCrash } from 'lucide-react';
import { apiFetch } from '../../lib/api';

// Groups entries by the month they were completed in, falling back to the
// job's start date so nothing silently drops out of the list.
function getMonthGroupKey(item) {
  const rawDate = item.completedAt || item.job?.startDate;
  const parsed = rawDate ? new Date(rawDate) : null;
  if (!parsed || Number.isNaN(parsed.getTime())) return 'Earlier';
  return parsed.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function matchesSearch(item, search) {
  if (!search.trim()) return true;
  const haystack = `${item.job?.title || ''} ${item.job?.caterer?.serviceName || ''}`;
  return haystack.toLowerCase().includes(search.trim().toLowerCase());
}

function LoadingState() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((key) => (
        <div key={key} className="h-24 animate-pulse rounded-xl bg-gray-200" />
      ))}
    </div>
  );
}

function ErrorState({ onRetry }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <ServerCrash size={40} className="text-red-400" />
      <p className="font-medium text-gray-700">Couldn't load history</p>
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
    <div className="flex flex-col items-center gap-2 py-16 text-center">
      <span className="text-5xl">📜</span>
      <h2 className="font-semibold text-gray-800">No history yet</h2>
      <p className="text-gray-500">Completed jobs will appear here automatically.</p>
    </div>
  );
}

function JobHistoryCard({ item }) {
  return (
    <article className="mb-3 rounded-xl bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="font-semibold text-gray-800">{item.job?.title || 'Job'}</h3>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
          ✅ Completed
        </span>
      </div>

      <p className="mt-1 text-sm font-medium text-orange-600">
        {item.job?.caterer?.serviceName || 'Caterer'}
      </p>

      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
        <span className="inline-flex items-center gap-1.5">
          <MapPin size={14} className="text-gray-400" />
          {item.job?.location || '—'}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock size={14} className="text-gray-400" />
          {item.job?.workHoursFrom || '—'} – {item.job?.workHoursTo || '—'}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <IndianRupee size={14} className="text-gray-400" />
          {item.job?.salaryAmount || '—'} {item.job?.salaryPeriod || ''}
        </span>
      </div>
    </article>
  );
}

export default function EmployeeHistory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let isActive = true;
    setLoading(true);
    setError(false);

    apiFetch('/api/job-requests/employee/history')
      .then((data) => {
        if (isActive) setItems(Array.isArray(data) ? data : []);
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
    const filtered = items.filter((item) => matchesSearch(item, search));
    return filtered.reduce((groups, item) => {
      const key = getMonthGroupKey(item);
      (groups[key] ||= []).push(item);
      return groups;
    }, {});
  }, [items, search]);

  const monthEntries = Object.entries(groupedByMonth);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">History</h1>
        <p className="text-gray-500">Completed work engagements.</p>
      </div>

      <input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search job or caterer..."
        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
      />

      {loading && <LoadingState />}

      {!loading && error && <ErrorState onRetry={() => setReloadToken((token) => token + 1)} />}

      {!loading && !error && monthEntries.length === 0 && <EmptyState />}

      {!loading && !error && monthEntries.length > 0 && (
        <div className="space-y-6 border-l-2 border-orange-200 pl-5">
          {monthEntries.map(([month, monthItems]) => (
            <section key={month}>
              <h2 className="sticky top-0 bg-gray-50 py-2 text-xs font-bold uppercase text-gray-500">
                {month}
              </h2>
              {monthItems.map((item) => (
                <JobHistoryCard key={item._id} item={item} />
              ))}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
