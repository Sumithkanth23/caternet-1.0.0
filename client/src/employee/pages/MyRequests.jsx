import { useEffect, useState } from 'react';
import { Search, Clock, CheckCircle, XCircle } from 'lucide-react';
import { apiFetch, toAbsoluteUrl } from '../../lib/api';
import { useEmployeeProfile } from '../../context/EmployeeProfileContext';

const TABS = ['All', 'Pending', 'Accepted', 'Declined'];
const STATUS_ICONS = { Pending: Clock, Accepted: CheckCircle, Declined: XCircle };
const STATUS_STYLES = {
  Pending: 'bg-amber-100 text-amber-800',
  Accepted: 'bg-green-100 text-green-800',
  Declined: 'bg-red-100 text-red-800',
};

export default function MyRequests() {
  const { profile } = useEmployeeProfile();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!profile?._id) return;
    setLoading(true);
    apiFetch(`/api/job-requests/employee/${profile._id}`)
      .then((data) => setRequests(Array.isArray(data) ? data : []))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  }, [profile?._id]);

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

  const filtered = requests.filter((r) => {
    const catererName = r.job?.caterer?.serviceName || '';
    const jobTitle = r.job?.title || '';
    const matchTab = activeTab === 'All' || r.status === activeTab;
    const matchSearch =
      !search ||
      catererName.toLowerCase().includes(search.toLowerCase()) ||
      jobTitle.toLowerCase().includes(search.toLowerCase());
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const isPastAccepted = r.status === 'Accepted' && r.job?.startDate && new Date(r.job.startDate) < today;
    return matchTab && matchSearch && !isPastAccepted;
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">My Requests</h1>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-1 border-b border-gray-200">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition ${
                activeTab === tab
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="relative w-64">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search requests..."
            className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
          />
          <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {loading ? (
        <div className="text-gray-500 text-center py-10">Loading your requests…</div>
      ) : (
        <div className="space-y-4">
          {filtered.map((r) => {
            const Icon = STATUS_ICONS[r.status];
            const caterer = r.job?.caterer;
            return (
              <div
                key={r._id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-start justify-between gap-4"
              >
                <div className="flex gap-4 min-w-0 flex-1">
                  {caterer?.logoUrl && (
                    <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-orange-50 flex items-center justify-center">
                      <img src={toAbsoluteUrl(caterer.logoUrl)} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-800">{r.job?.title || '—'}</p>
                    <p className="text-sm text-orange-600 font-medium mt-0.5">
                      {caterer?.serviceName || 'Unknown Caterer'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {caterer?.district && `📍 ${caterer.district}`}
                      {r.job?.jobType && ` · ${r.job.jobType}`}
                      {r.job?.startDate && ` · From ${formatDate(r.job.startDate)}`}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      Applied {formatDate(r.createdAt)}
                    </p>
                  </div>
                </div>
                <span
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium shrink-0 ${STATUS_STYLES[r.status] || 'bg-gray-100 text-gray-600'}`}
                >
                  {Icon && <Icon size={14} />}
                  {r.status}
                </span>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <p className="text-gray-500 text-center py-8">No requests found.</p>
          )}
        </div>
      )}

      {!loading && (
        <p className="text-sm text-gray-500">
          Showing {filtered.length} of {requests.length} request{requests.length !== 1 ? 's' : ''}.
        </p>
      )}
    </div>
  );
}
