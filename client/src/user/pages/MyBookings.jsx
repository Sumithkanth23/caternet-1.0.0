import { useEffect, useState, useMemo } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import BookingCard from '../components/BookingCard';
import { useAuth } from '../../context/AuthContext';
import { apiFetch, toAbsoluteUrl } from '../../lib/api';

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatBookingDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Returns true if:
 *  1. booking status is "Accepted"
 *  2. event date is strictly in the past (before today's midnight)
 */
function isEventPast(eventDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(eventDate) < today;
}

export default function MyBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  // Map of bookingId -> review object (null if none)
  const [reviewMap, setReviewMap] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch bookings + all reviews by this user in parallel
  useEffect(() => {
    if (!user?.id && !user?.email) {
      setLoading(false);
      return;
    }
    let mounted = true;
    setLoading(true);

    const userId = user.id || user._id;

    Promise.all([
      apiFetch(`/api/bookings/user/${user.email}`).catch(() => []),
      userId
        ? apiFetch(`/api/reviews/user/${userId}`).catch(() => [])
        : Promise.resolve([]),
    ]).then(([bookingData, reviewData]) => {
      if (!mounted) return;
      const bArr = Array.isArray(bookingData) ? bookingData : [];
      const rArr = Array.isArray(reviewData) ? reviewData : [];

      // Build a lookup: bookingId (string) -> review object
      const map = {};
      rArr.forEach((r) => {
        const key = typeof r.booking === 'object' ? r.booking._id || r.booking : r.booking;
        map[String(key)] = r;
      });

      setBookings(bArr);
      setReviewMap(map);
    }).finally(() => {
      if (!mounted) return;
      setLoading(false);
    });

    return () => { mounted = false; };
  }, [user?.email, user?.id, user?._id]);

  const handleReview = (newReview) => {
    const key = typeof newReview.booking === 'object'
      ? newReview.booking._id || newReview.booking
      : newReview.booking;
    setReviewMap((prev) => ({ ...prev, [String(key)]: newReview }));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-2">My Bookings</h1>
        <p className="text-gray-500 text-center mb-8">
          Track your catering service booking requests.
        </p>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <p className="text-gray-600 mb-4">You haven't made any bookings yet.</p>
            <a
              href="/"
              className="inline-block px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
            >
              Browse Services
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => {
              const bookingId = String(booking._id);
              const existingReview = reviewMap[bookingId] || null;
              const accepted = booking.status === 'Accepted';
              const pastEvent = isEventPast(booking.eventDate);
              // Show "Leave Review" only: accepted + past event + no review submitted yet
              const canReview = accepted && pastEvent && !existingReview;

              return (
                <BookingCard
                  key={bookingId}
                  booking={{
                    id: bookingId,
                    catererName: booking.caterer?.serviceName || 'Unknown Caterer',
                    image:
                      toAbsoluteUrl(booking.caterer?.logoUrl) ||
                      toAbsoluteUrl(booking.menu?.menuImageUrl) ||
                      '',
                    eventDate: formatDate(booking.eventDate),
                    district: booking.caterer?.district || 'N/A',
                    menu: booking.menu?.packageName || 'N/A',
                    guests: booking.guestCount || 0,
                    status: booking.status?.toLowerCase() || 'pending',
                    bookedOn: formatBookingDate(booking.createdAt),
                    declineReason: booking.declineReason || null,
                  }}
                  review={existingReview}
                  canReview={canReview}
                  onReview={handleReview}
                />
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
