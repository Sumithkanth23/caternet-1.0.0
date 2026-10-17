import { useState } from 'react';
import {
  Calendar,
  MapPin,
  UtensilsCrossed,
  Users,
  CheckCircle,
  XCircle,
  Star,
  MessageSquarePlus,
} from 'lucide-react';
import ReviewModal from './ReviewModal';
import BookingTimeline from '../../components/BookingTimeline';

function StatusBadge({ status }) {
  if (status === 'pending') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 text-sm font-medium">
        <span className="w-2 h-2 rounded-full bg-amber-500" />
        Pending
      </span>
    );
  }
  if (status === 'accepted') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-600 text-white text-sm font-medium">
        <CheckCircle size={16} />
        Accepted
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-600 text-white text-sm font-medium">
      <XCircle size={16} />
      Declined
    </span>
  );
}

function StarDisplay({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={14}
          className={s <= rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-300'}
        />
      ))}
    </div>
  );
}

/**
 * Props:
 *  booking       – booking data object
 *  review        – existing review object or null
 *  canReview     – boolean: event is past + status accepted + no review yet
 *  onReview      – callback(newReview) after a review is submitted
 */
export default function BookingCard({ booking, review: initialReview, canReview, onReview }) {
  const [showModal, setShowModal] = useState(false);
  const [review, setReview] = useState(initialReview || null);

  const imgSrc = booking.image || 'https://placehold.co/96x96/fef3c7/92400e?text=Food';

  const handleSubmitted = (newReview) => {
    setReview(newReview);
    if (onReview) onReview(newReview);
  };

  const reviewable = canReview && !review;

  return (
    <>
      <div className="bg-white rounded-xl shadow-md p-6 flex flex-col sm:flex-row gap-4">
        <img
          src={imgSrc}
          alt={booking.catererName}
          className="w-full sm:w-24 h-40 sm:h-24 object-cover rounded-lg shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
            <h3 className="font-bold text-lg text-gray-800">{booking.catererName}</h3>
            <StatusBadge status={booking.status} />
          </div>

          <ul className="space-y-1.5 text-gray-600 text-sm">
            <li className="flex items-center gap-2">
              <Calendar size={16} className="text-gray-400 shrink-0" />
              Event Date: {booking.eventDate}
            </li>
            <li className="flex items-center gap-2">
              <MapPin size={16} className="text-gray-400 shrink-0" />
              District: {booking.district}
            </li>
            <li className="flex items-center gap-2">
              <UtensilsCrossed size={16} className="text-gray-400 shrink-0" />
              Menu: {booking.menu}
            </li>
            <li className="flex items-center gap-2">
              <Users size={16} className="text-gray-400 shrink-0" />
              Guests: {booking.guests}
            </li>
            {booking.status === 'declined' && booking.declineReason && (
              <li className="text-gray-500 italic">Reason: {booking.declineReason}</li>
            )}
          </ul>

          <p className="text-gray-400 text-xs mt-3 mb-3">Booked on: {booking.bookedOn}</p>
          <BookingTimeline status={booking.status} createdAt={booking.createdAt} eventDate={booking.eventDateRaw} />

          {/* --- Review area --- */}
          {review ? (
            <div className="mt-2 border-t border-gray-100 pt-3">
              <div className="flex items-center gap-2 mb-1">
                <StarDisplay rating={review.rating} />
                <span className="text-xs font-medium text-amber-700">{review.rating}/5</span>
              </div>
              {review.reviewText && (
                <p className="text-gray-600 text-sm italic">"{review.reviewText}"</p>
              )}
              <p className="text-gray-400 text-xs mt-1">
                Your review submitted on{' '}
                {new Date(review.reviewDate || review.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </div>
          ) : reviewable ? (
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-orange-50 hover:bg-orange-100 border border-orange-300 text-orange-700 text-sm font-medium rounded-lg transition"
            >
              <MessageSquarePlus size={16} />
              Leave a Review
            </button>
          ) : null}
        </div>
      </div>

      {showModal && (
        <ReviewModal
          bookingId={booking.id}
          catererName={booking.catererName}
          onClose={() => setShowModal(false)}
          onSubmitted={handleSubmitted}
        />
      )}
    </>
  );
}

