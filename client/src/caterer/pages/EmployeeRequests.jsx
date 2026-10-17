import { useEffect, useState } from 'react';
import { Search, CheckCircle, XCircle, Clock } from 'lucide-react';
import { apiFetch, toAbsoluteUrl } from '../../lib/api';
import { useCatererProfile } from '../../context/CatererProfileContext';

const STATUS_STYLES = {
  Pending: 'bg-amber-100 text-amber-700',
  Accepted: 'bg-green-100 text-green-700',
  Declined: 'bg-red-100 text-red-700',
};

export default function EmployeeRequests() {
  const { profile } = useCatererProfile();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    if (!profile?._id) return;
    setLoading(true);
    apiFetch(`/api/job-requests/caterer/${profile._id}`)
      .then((data) => setRequests(Array.isArray(data) ? data : []))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  }, [profile?._id]);

  const handleStatusChange = async (reqId, newStatus) => {
    setUpdatingId(reqId);
    try {
      const updated = await apiFetch(`/api/job-requests/${reqId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      setRequests((prev) =>
        prev.map((r) => (r._id === reqId ? { ...r, status: updated.status } : r))
      );
    } catch (err) {
      alert(err.message || 'Failed to update status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = requests.filter((r) => {
    const info = r.applicantInfo || {};
    const name = info.fullName || '';
    const jobTitle = r.job?.title || '';
    const matchSearch =
      !search ||
      name.toLowerCase().includes(search.toLowerCase()) ||
      jobTitle.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === 'All Statuses' || r.status === statusFilter;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const isPastAccepted = r.status === 'Accepted' && r.job?.startDate && new Date(r.job.startDate) < today;
    return matchSearch && matchStatus && !isPastAccepted;
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Employee Requests</h1>
      <p className="text-gray-500">
        View and manage job applications from employees. Accept or decline applications.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search applicants or job title..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white"
        >
          <option>All Statuses</option>
          <option>Pending</option>
          <option>Accepted</option>
          <option>Declined</option>
        </select>
      </div>

      {loading ? (
        <div className="text-gray-500 text-center py-10">Loading requests…</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center">
          <p className="text-gray-500">No employee requests found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Name</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Job Title</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Role</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Experience</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">District</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-right px-4 py-3 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((req) => {
                  const info = req.applicantInfo || {};
                  return (
                  <tr key={req._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {info.profileImageUrl ? (
                          <img
                            src={toAbsoluteUrl(info.profileImageUrl)}
                            alt={info.fullName}
                            className="w-10 h-10 rounded-full object-cover shrink-0 border border-gray-200"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-semibold text-sm shrink-0">
                            {(info.fullName || '?').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <span className="font-medium text-gray-800 block">
                            {info.fullName || '—'}
                          </span>
                          {req.note && (
                            <span className="text-xs text-gray-400 italic line-clamp-1">{req.note}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{req.job?.title || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{info.role || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{info.experience || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{info.district || '—'}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[req.status] || 'bg-gray-100 text-gray-600'}`}
                      >
                        {req.status === 'Pending' && <Clock size={11} />}
                        {req.status === 'Accepted' && <CheckCircle size={11} />}
                        {req.status === 'Declined' && <XCircle size={11} />}
                        {req.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {req.status === 'Pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            disabled={updatingId === req._id}
                            onClick={() => handleStatusChange(req._id, 'Accepted')}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg disabled:opacity-50 transition"
                          >
                            <CheckCircle size={15} /> Accept
                          </button>
                          <button
                            type="button"
                            disabled={updatingId === req._id}
                            onClick={() => handleStatusChange(req._id, 'Declined')}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg disabled:opacity-50 transition"
                          >
                            <XCircle size={15} /> Decline
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Decision made</span>
                      )}
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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
