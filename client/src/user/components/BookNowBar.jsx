import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import BookingForm from './BookingForm';

export default function BookNowBar({ menu, caterer }) {
  const { user, canBook } = useAuth();
  const navigate = useNavigate();
  const [bookingOpen, setBookingOpen] = useState(false);

  if (!user) {
    return (
      <div className="sticky bottom-0 left-0 right-0 z-40 p-4 bg-white/95 backdrop-blur border-t border-gray-200 shadow-lg md:hidden">
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="flex items-center justify-center w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition"
        >
          Book Now
        </button>
      </div>
    );
  }

  if (!canBook) {
    return (
      <div className="sticky bottom-0 left-0 right-0 z-40 p-4 bg-white/95 backdrop-blur border-t border-gray-200 shadow-lg md:hidden">
        <button
          type="button"
          disabled
          className="flex items-center justify-center w-full py-3 px-6 bg-gray-300 text-gray-500 font-semibold rounded-lg cursor-not-allowed"
        >
          Book Now
        </button>
        <p className="mt-2 text-center text-xs text-gray-500">Booking is for customers only.</p>
      </div>
    );
  }

  return (
    <>
      <div className="sticky bottom-0 left-0 right-0 z-40 p-4 bg-white/95 backdrop-blur border-t border-gray-200 shadow-lg md:hidden">
        <button
          type="button"
          onClick={() => setBookingOpen(true)}
          className="flex items-center justify-center w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition"
        >
          Book Now
        </button>
      </div>
      <BookingForm
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
        menu={menu}
        caterer={caterer}
      />
    </>
  );
}
