import {
  Calendar,
  MapPin,
  UtensilsCrossed,
  Users,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

/* Image imports – add your image files to src/assets/ and uncomment the line with the correct filename. */
// import sriMahalakshmiImg from '../assets/image-55e1e879-5200-4ce7-a62f-28e83ac8f722.png'; /* image-55e1e879-5200-4ce7-a62f-28e83ac8f722.png - Sri Mahalakshmi */
// import chettinadImg from '../assets/image-993a7f70-17eb-4ad2-8047-285322e5b660.png'; /* image-993a7f70-17eb-4ad2-8047-285322e5b660.png - Chettinad */
// import supremeImg from '../assets/image-b893647e-4ac7-4636-8ddf-d58fd96cd25b.png'; /* image-b893647e-4ac7-4636-8ddf-d58fd96cd25b.png - Supreme */

const bookings = [
  {
    id: 1,
    catererName: 'Sri Mahalakshmi Caterers',
    image: '', /* image-55e1e879-5200-4ce7-a62f-28e83ac8f722.png */
    eventDate: 'March 15, 2026',
    district: 'Chennai',
    menu: 'Breakfast Package - South Indian',
    guests: 200,
    status: 'pending',
    bookedOn: 'Feb 10, 2026',
    declineReason: null,
  },
  {
    id: 2,
    catererName: 'Chettinad Catering Services',
    image: '', /* image-993a7f70-17eb-4ad2-8047-285322e5b660.png */
    eventDate: 'April 20, 2026',
    district: 'Madurai',
    menu: 'Lunch Package - North Indian',
    guests: 150,
    status: 'accepted',
    bookedOn: 'Feb 12, 2026',
    declineReason: null,
  },
  {
    id: 3,
    catererName: 'Supreme Caterers',
    image: '', /* image-b893647e-4ac7-4636-8ddf-d58fd96cd25b.png */
    eventDate: 'Feb 25, 2026',
    district: 'Coimbatore',
    menu: 'Dinner Package - Chinese',
    guests: 100,
    status: 'declined',
    bookedOn: 'Feb 08, 2026',
    declineReason: 'Date not available',
  },
];

function StatusBadge({ status, declineReason }) {
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

function BookingCard({ booking }) {
  const imgSrc = booking.image || 'https://placehold.co/96x96/fef3c7/92400e?text=Food';

  return (
    <div className="bg-white rounded-xl shadow-md p-6 flex flex-col sm:flex-row gap-4">
      <img
        src={imgSrc}
        alt={booking.catererName}
        className="w-full sm:w-24 h-40 sm:h-24 object-cover rounded-lg shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
          <h3 className="font-bold text-lg text-gray-800">{booking.catererName}</h3>
          <StatusBadge status={booking.status} declineReason={booking.declineReason} />
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
        <p className="text-gray-400 text-xs mt-3">Booked on: {booking.bookedOn}</p>
      </div>
    </div>
  );
}

export default function MyBookingsPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-2">My Bookings</h1>
        <p className="text-gray-500 text-center mb-8">Track your catering service booking requests.</p>

        <div className="space-y-6">
          {bookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
