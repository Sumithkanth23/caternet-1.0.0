import { useEffect, useState } from 'react';
import { Search, CheckCircle, XCircle } from 'lucide-react';
import { useCatererProfile } from '../../context/CatererProfileContext';
import { apiFetch, toAbsoluteUrl } from '../../lib/api';

export default function BookingRequests() {
  const { profile } = useCatererProfile();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    if (!profile?._id) {
      setLoading(false);
      return;
    }
    let mounted = true;
    setLoading(true);
    apiFetch(`/api/bookings/caterer/${profile._id}`)
      .then((data) => {
        if (!mounted) return;
        setBookings(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!mounted) return;
        setBookings([]);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [profile?._id]);

  const handleStatusUpdate = async (bookingId, status, declineReason = '') => {
    setUpdating(bookingId);
    try {
      const updated = await apiFetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, declineReason }),
      });
      setBookings((prev) => prev.map((b) => (b._id === bookingId ? updated : b)));
    } catch (err) {
      alert(err?.message || 'Failed to update booking status');
    } finally {
      setUpdating(null);
    }
  };

  const handleDecline = (bookingId) => {
    const reason = prompt('Please provide a reason for declining this booking:');
    if (reason !== null) {
      handleStatusUpdate(bookingId, 'Declined', reason);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      !search ||
      b.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
      b.menu?.packageName?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All Statuses' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Booking Requests</h1>
        <div className="text-gray-600">Loading bookings...</div>
      </div>
    );
  }

  if (!profile?._id) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Booking Requests</h1>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
          Please create your service profile first.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Booking Requests</h1>
        <p className="text-gray-500">View customer booking requests. Accept or decline to confirm events.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search bookings..."
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

      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <p className="text-gray-600">
            {search || statusFilter !== 'All Statuses'
              ? 'No bookings found matching your filters.'
              : 'No booking requests yet.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Client</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Event Date</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Guests</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Menu</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-right px-4 py-3 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredBookings.map((b) => (
                  <tr key={b._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-800">{b.customerName || b.user?.name || 'Guest'}</p>
                        <p className="text-sm text-gray-500">{b.customerPhone || b.user?.email || ''}</p>
                        {b.user?.email && <p className="text-xs text-gray-400">{b.user.email}</p>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {b.eventDate ? new Date(b.eventDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{b.guestCount || 'N/A'}</td>
                    <td className="px-4 py-3 text-gray-600">{b.menu?.packageName || 'N/A'}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                          b.status === 'Accepted'
                            ? 'bg-green-100 text-green-700'
                            : b.status === 'Declined'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {b.status || 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {b.status === 'Pending' && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleStatusUpdate(b._id, 'Accepted')}
                            disabled={updating === b._id}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg disabled:opacity-50 transition"
                            aria-label="Accept"
                          >
                            <CheckCircle size={20} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDecline(b._id)}
                            disabled={updating === b._id}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 transition"
                            aria-label="Decline"
                          >
                            <XCircle size={20} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
