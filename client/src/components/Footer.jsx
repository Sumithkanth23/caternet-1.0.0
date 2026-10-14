import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Branding & Social */}
        <div>
          <Link to="/" className="flex items-center gap-2 mb-3">
            <span className="text-sky-500" aria-hidden>🍽️</span>
            <span className="font-bold text-lg text-gray-800">CaterNet</span>
          </Link>
          <p className="text-gray-500 text-sm mb-4">
            Premium catering service with a wide selection of cuisines across Tamil Nadu.
          </p>
          <div className="flex gap-3">
            <a href="#" className="text-gray-500 hover:text-blue-600 transition" aria-label="Facebook">
              <Facebook size={20} />
            </a>
            <a href="#" className="text-gray-500 hover:text-blue-600 transition" aria-label="Instagram">
              <Instagram size={20} />
            </a>
            <a href="#" className="text-gray-500 hover:text-blue-600 transition" aria-label="Twitter">
              <Twitter size={20} />
            </a>
            <a href="mailto:info@caternet.com" className="text-gray-500 hover:text-blue-600 transition" aria-label="Email">
              <Mail size={20} />
            </a>
          </div>
        </div>
        {/* Quick Links */}
        <div>
          <h3 className="font-bold text-gray-800 mb-4">QUICK LINKS</h3>
          <ul className="space-y-2 text-gray-500 text-sm">
            <li><Link to="/" className="hover:text-blue-600 transition">Home</Link></li>
            <li><Link to="/" className="hover:text-blue-600 transition">Browse Services</Link></li>
            <li><Link to="/my-bookings" className="hover:text-blue-600 transition">My Bookings</Link></li>
            <li><a href="#" className="hover:text-blue-600 transition">About Us</a></li>
          </ul>
        </div>
        {/* Contact */}
        <div>
          <h3 className="font-bold text-gray-800 mb-4">CONTACT</h3>
          <ul className="space-y-2 text-gray-500 text-sm">
            <li>1234 Luxury Drive</li>
            <li>Chennai, Tamil Nadu 600001</li>
            <li>+91 94556481699</li>
            <li>info@caternet.com</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
