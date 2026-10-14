import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import BookingForm from './BookingForm';
import { useState } from 'react';

export default function BookNowButton({ menu, caterer, className = '' }) {
  const { user, canBook } = useAuth();
  const navigate = useNavigate();
  const [bookingOpen, setBookingOpen] = useState(false);

  if (!user) {
    return (
      <button
        type="button"
        onClick={() => navigate('/login?redirect=/service/' + (caterer?._id || ''))}
        className={`inline-flex items-center justify-center w-full md:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${className}`}
      >
        Book Now
      </button>
    );
  }

  if (!canBook) {
    return (
      <div className={`${className}`}>
        <button
          type="button"
          disabled
          className="inline-flex items-center justify-center w-full md:w-auto px-6 py-3 bg-gray-300 text-gray-500 font-semibold rounded-lg cursor-not-allowed"
        >
          Book Now
        </button>
        <p className="mt-2 text-sm text-gray-500">
          Booking is for customers only.
        </p>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setBookingOpen(true)}
        className={`inline-flex items-center justify-center w-full md:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${className}`}
      >
        Book Now
      </button>
      <BookingForm
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
        menu={menu}
        caterer={caterer}
      />
    </>
  );
}
