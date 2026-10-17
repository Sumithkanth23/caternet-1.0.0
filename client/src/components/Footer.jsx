import { Link } from 'react-router-dom';
import { Mail, MapPin, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div>
          <Link to="/" className="flex items-center gap-2 mb-3">
            <span className="text-sky-500" aria-hidden>🍽️</span>
            <span className="font-bold text-lg text-gray-800">CaterNet</span>
          </Link>
          <p className="text-gray-500 text-sm mb-4">
            Discover catering services and manage event bookings across Tamil Nadu.
          </p>
          <div className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700">
            <ShieldCheck size={16} />
            Verified service profiles
          </div>
        </div>
        <div>
          <h3 className="font-bold text-gray-800 mb-4">QUICK LINKS</h3>
          <ul className="space-y-2 text-gray-500 text-sm">
            <li><Link to="/" className="hover:text-blue-600 transition">Home</Link></li>
            <li><Link to="/search" className="hover:text-blue-600 transition">Browse Services</Link></li>
            <li><Link to="/my-bookings" className="hover:text-blue-600 transition">My Bookings</Link></li>
            <li><Link to="/register" className="hover:text-blue-600 transition">Join CaterNet</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-gray-800 mb-4">SERVICE AREA</h3>
          <ul className="space-y-3 text-gray-500 text-sm">
            <li className="flex items-center gap-2"><MapPin size={17} className="text-blue-600" /> Tamil Nadu, India</li>
            <li className="flex items-center gap-2"><Mail size={17} className="text-blue-600" /> Contact your caterer through booking requests</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
