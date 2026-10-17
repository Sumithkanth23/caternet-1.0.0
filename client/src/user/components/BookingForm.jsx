import { useState } from 'react';
import { X, Calendar, Users, User, Phone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../lib/api';

export default function BookingForm({ isOpen, onClose, menu, caterer }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    eventDate: '',
    guestCount: '',
    eventType: 'Other', startTime: '', endTime: '', venueName: '', venueAddress: '', mapLocation: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!form.customerName.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!form.customerPhone.trim()) {
      setError('Please enter your phone number.');
      return;
    }
    if (!form.eventDate) {
      setError('Please select an event date.');
      return;
    }
    if (!form.guestCount || Number(form.guestCount) < 1) {
      setError('Please enter a valid guest count.');
      return;
    }
    if (!form.startTime || !form.endTime || form.endTime <= form.startTime) { setError('End time must be after the event start time.'); return; }
    if (!form.venueName.trim() || !form.venueAddress.trim()) { setError('Venue name and address are required.'); return; }

    setSubmitting(true);
    try {
      await apiFetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: user?.email,
          catererId: caterer?._id,
          menuId: menu?._id,
          customerName: form.customerName.trim(),
          customerPhone: form.customerPhone.trim(),
          eventDate: form.eventDate,
          guestCount: Number(form.guestCount),
          eventType: form.eventType, startTime: form.startTime, endTime: form.endTime,
          venueName: form.venueName.trim(), venueAddress: form.venueAddress.trim(), mapLocation: form.mapLocation.trim(),
          totalAmount: 0, // Can calculate later based on menu pricing
        }),
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setForm({ customerName: '', customerPhone: '', eventDate: '', guestCount: '', eventType: 'Other', startTime: '', endTime: '', venueName: '', venueAddress: '', mapLocation: '' });
        setSuccess(false);
      }, 2000);
    } catch (err) {
      setError(err?.message || 'Failed to create booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Book Catering Service</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 text-sm">
              Booking request submitted successfully! The caterer will review your request.
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Caterer / Service
            </label>
            <div className="px-4 py-2.5 bg-gray-50 rounded-lg border border-gray-200">
              <p className="font-medium text-gray-800">{caterer?.serviceName || menu?.packageName || 'N/A'}</p>
              <p className="text-sm text-gray-500">{menu?.packageName}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Event Type *</label>
            <select value={form.eventType} onChange={(e) => setForm((f) => ({ ...f, eventType: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-orange-500 outline-none">
              {['Wedding', 'Birthday', 'Engagement', 'Corporate', 'Temple Function', 'Other'].map((type) => <option key={type}>{type}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-2">Event Start Time *</label><input type="time" value={form.startTime} onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))} required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-2">Event End Time *</label><input type="time" value={form.endTime} onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))} required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-2">Venue Name *</label><input type="text" value={form.venueName} onChange={(e) => setForm((f) => ({ ...f, venueName: e.target.value }))} placeholder="e.g., Sri Murugan Kalyana Mandapam" required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-2">Venue Address *</label><input type="text" value={form.venueAddress} onChange={(e) => setForm((f) => ({ ...f, venueAddress: e.target.value }))} placeholder="Enter full venue address" required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-2">Map Location <span className="text-gray-400">(optional)</span></label><input type="url" value={form.mapLocation} onChange={(e) => setForm((f) => ({ ...f, mapLocation: e.target.value }))} placeholder="Paste Google Maps link" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" /></div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <User size={16} />
              Your Name *
            </label>
            <input
              type="text"
              value={form.customerName}
              onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))}
              placeholder="Enter your full name"
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Phone size={16} />
              Phone Number *
            </label>
            <input
              type="tel"
              value={form.customerPhone}
              onChange={(e) => setForm((f) => ({ ...f, customerPhone: e.target.value }))}
              placeholder="Enter your phone number"
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Calendar size={16} />
              Service Date *
            </label>
            <input
              type="date"
              value={form.eventDate}
              onChange={(e) => setForm((f) => ({ ...f, eventDate: e.target.value }))}
              min={today}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Users size={16} />
              Number of Guests *
            </label>
            <input
              type="number"
              value={form.guestCount}
              onChange={(e) => setForm((f) => ({ ...f, guestCount: e.target.value }))}
              min="1"
              placeholder="e.g., 200"
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-60 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || success}
              className="flex-1 px-4 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {submitting ? 'Submitting...' : success ? 'Submitted!' : 'Submit Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
