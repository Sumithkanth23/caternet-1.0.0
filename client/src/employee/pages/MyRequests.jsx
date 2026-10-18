import { useEffect, useState } from 'react';
import { Search, Clock, CheckCircle, XCircle, UserCheck, UserX, ShieldAlert, Sparkles } from 'lucide-react';
import { apiFetch, toAbsoluteUrl } from '../../lib/api';
import { useEmployeeProfile } from '../../context/EmployeeProfileContext';

const TABS = ['All', 'Pending', 'Accepted', 'Waitlisted', 'Declined'];

const STATUS_META = {
  Pending: { label: 'Pending', icon: Clock, style: 'bg-amber-100 text-amber-800' },
  Accepted: { label: 'Accepted', icon: CheckCircle, style: 'bg-green-100 text-green-800' },
  Declined: { label: 'Declined', icon: XCircle, style: 'bg-red-100 text-red-800' },
  Waitlisted: { label: 'Backup offer', icon: Clock, style: 'bg-blue-100 text-blue-800' },
  WaitlistAccepted: { label: 'Backup confirmed', icon: UserCheck, style: 'bg-teal-100 text-teal-800' },
  WaitlistDeclined: { label: 'Backup declined', icon: UserX, style: 'bg-gray-100 text-gray-600' },
  'No-Show': { label: 'Marked no-show', icon: ShieldAlert, style: 'bg-red-100 text-red-800' },
};

// Tab filter also groups the waitlist sub-statuses under the "Waitlisted" tab
// so employees have one place to see every backup offer, regardless of
// whether they've responded to it yet.
const TAB_STATUS_MAP = {
  Waitlisted: ['Waitlisted', 'WaitlistAccepted', 'WaitlistDeclined'],
};

export default function MyRequests() {
  const { profile } = useEmployeeProfile();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = () => {
    if (!profile?._id) return;
    setLoading(true);
    apiFetch(`/api/job-requests/employee/${profile._id}`)
      .then((data) => setRequests(Array.isArray(data) ? data : []))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, [profile?._id]);

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

  const respond = async (req, response) => {
    setBusyId(req._id);
    try {
      const updated = await apiFetch(`/api/job-requests/${req._id}/waitlist-response`, {
        method: 'PUT',
        body: JSON.stringify({ response }),
      });
      setRequests((prev) => prev.map((r) => (r._id === req._id ? { ...r, status: updated.status } : r)));
    } catch (err) {
      alert(err.message || 'Failed to respond to the offer.');
    } finally {
      setBusyId(null);
    }
  };

  const filtered = requests.filter((r) => {
    const catererName = r.job?.caterer?.serviceName || '';
    const jobTitle = r.job?.title || '';
    const allowedStatuses = TAB_STATUS_MAP[activeTab];
    const matchTab = activeTab === 'All' || (allowedStatuses ? allowedStatuses.includes(r.status) : r.status === activeTab);
    const matchSearch =
      !search ||
      catererName.toLowerCase().includes(search.toLowerCase()) ||
      jobTitle.toLowerCase().includes(search.toLowerCase());
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isPastAccepted = r.status === 'Accepted' && r.job?.startDate && new Date(r.job.startDate) < today;
    return matchTab && matchSearch && !isPastAccepted;
  });

  const pendingOfferCount = requests.filter((r) => r.status === 'Waitlisted').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">My Requests</h1>
        <p className="text-gray-500 mt-1">
          Track your job applications — including backup/waitlist offers you can accept or decline.
        </p>
      </div>

      {pendingOfferCount > 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          <Clock size={16} className="shrink-0" />
          You have {pendingOfferCount} backup offer{pendingOfferCount !== 1 ? 's' : ''} waiting for your response below.
        </div>
      )}

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
            const meta = STATUS_META[r.status] || { label: r.status, icon: Clock, style: 'bg-gray-100 text-gray-600' };
            const Icon = meta.icon;
            const caterer = r.job?.caterer;
            return (
              <div
                key={r._id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-wrap items-start justify-between gap-4"
              >
                <div className="flex gap-4 min-w-0 flex-1">
                  {caterer?.logoUrl && (
                    <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-orange-50 flex items-center justify-center">
                      <img src={toAbsoluteUrl(caterer.logoUrl)} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-800">{r.job?.title || '—'}</p>
                      {r.promotedFromWaitlist && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
                          <Sparkles size={11} /> Promoted from backup
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-orange-600 font-medium mt-0.5">
                      {caterer?.serviceName || 'Unknown Caterer'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {caterer?.district && `📍 ${caterer.district}`}
                      {r.job?.jobType && ` · ${r.job.jobType}`}
                      {r.job?.startDate && ` · From ${formatDate(r.job.startDate)}`}
                    </p>

                    {r.status === 'Waitlisted' && (
                      <div className="mt-3 rounded-lg bg-blue-50 border border-blue-100 p-3">
                        <p className="text-sm text-blue-800">
                          <strong>{caterer?.serviceName || 'This caterer'}</strong> has put you on the waiting list for{' '}
                          <strong>{r.job?.title || 'this job'}</strong>. Do you accept being an on-call backup? If
                          they need you, they'll call you in.
                        </p>
                        <div className="mt-2 flex gap-2">
                          <button
                            type="button"
                            disabled={busyId === r._id}
                            onClick={() => respond(r, 'accept')}
                            className="flex items-center gap-1 rounded-lg bg-teal-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-teal-700 disabled:opacity-50"
                          >
                            <UserCheck size={14} /> Accept backup role
                          </button>
                          <button
                            type="button"
                            disabled={busyId === r._id}
                            onClick={() => respond(r, 'decline')}
                            className="flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-200 disabled:opacity-50"
                          >
                            <UserX size={14} /> No thanks
                          </button>
                        </div>
                      </div>
                    )}

                    {r.status === 'WaitlistAccepted' && (
                      <p className="mt-2 text-sm text-teal-700">
                        You're confirmed as a backup — we'll notify you if you're called in.
                      </p>
                    )}

                    <p className="text-xs text-gray-400 mt-2">Applied {formatDate(r.createdAt)}</p>
                  </div>
                </div>
                <span
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium shrink-0 ${meta.style}`}
                >
                  {Icon && <Icon size={14} />}
                  {meta.label}
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
