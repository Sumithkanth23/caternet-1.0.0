import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Search,
  Home,
  Star,
  ChevronDown,
  ChevronRight,
  Plus,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

/* Image imports – add your image files to src/assets/ and uncomment the line with the correct filename. */
// import catererBanner from '../assets/image-55e1e879-5200-4ce7-a62f-28e83ac8f722.png'; /* caterer-banner - Sri Mahalakshmi */
// import idlyImg from '../assets/idly.png'; /* idly */
// import vadaImg from '../assets/vada.png'; /* vada */
// import pongalImg from '../assets/pongal.png'; /* pongal */
// import sannpaImg from '../assets/sannpa.png'; /* sannpa */
// import plainDosaImg from '../assets/plain-dosa.png'; /* plain-dosa */
// import masalaDosaImg from '../assets/masala-dosa.png'; /* masala-dosa */
// import filterCoffeeImg from '../assets/filter-coffee.png'; /* filter-coffee */
// import masalaTeaImg from '../assets/masala-tea.png'; /* masala-tea */

const PLACEHOLDER_FOOD = 'https://placehold.co/96x96/fef3c7/92400e?text=Item';

const menuCategories = [
  { id: 'breakfast', label: 'Breakfast', active: true },
  { id: 'lunch', label: 'Lunch', active: false },
  { id: 'dinner', label: 'Dinner', active: false },
  { id: 'reception', label: 'Reception', active: false },
];

const tiffinItems = [
  { name: 'Idly', desc: 'Soft, fluffy steamed rice cakes.', image: PLACEHOLDER_FOOD },
  { name: 'Vada', desc: 'Crispy and fried lentil doughnuts.', image: PLACEHOLDER_FOOD },
  { name: 'Pongal', desc: 'Creamy rice and lentil dish seasoned with black pepper & ghee.', image: PLACEHOLDER_FOOD },
  { name: 'Sannpa', desc: 'Crispy semolina-based dosa with onions, chilli, and more.', image: PLACEHOLDER_FOOD },
];

const dosaItems = [
  { name: 'Plain Dosa', desc: 'Thin, crispy rice and lentil crepe.', image: PLACEHOLDER_FOOD },
  { name: 'Masala Dosa', desc: 'Rice and lentil crepe stuffed with spiced potato filling.', image: PLACEHOLDER_FOOD },
];

const beverageItems = [
  { name: 'Filter Coffee', desc: 'Traditional South Indian coffee brewed with filter.', image: PLACEHOLDER_FOOD },
  { name: 'Masala Tea', desc: 'Spiced tea with ginger, cardamom, and other spices.', image: PLACEHOLDER_FOOD },
];

function MenuItemCard({ name, description, image }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-100 hover:shadow-md transition">
      <img src={image} alt={name} className="w-24 h-24 object-cover rounded-lg shrink-0" />
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-800">{name}</h4>
        <p className="text-sm text-gray-500 line-clamp-2">{description}</p>
      </div>
      <button
        type="button"
        className="shrink-0 w-10 h-10 rounded-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center transition"
        aria-label={`Add ${name}`}
      >
        <Plus size={20} />
      </button>
    </div>
  );
}

export default function ServiceDetailsPage() {
  const { id } = useParams();
  const [activeCategory, setActiveCategory] = useState('breakfast');
  const catererName = id ? id.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'Sri Mahalakshmi Caterers';
  const bannerImage = ''; /* image-55e1e879-5200-4ce7-a62f-28e83ac8f722.png - caterer banner */

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/" className="flex items-center gap-1 hover:text-blue-600 transition">
            <Home size={16} />
            Home
          </Link>
          <ChevronRight size={16} />
          <span className="text-gray-800 font-medium">{catererName}</span>
        </nav>

        {/* Caterer profile */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/2">
              <img
                src={bannerImage || 'https://placehold.co/800x320/fef3c7/92400e?text=Caterer+Banner'}
                alt={`${catererName} banner`}
                className="w-full h-64 md:h-80 object-cover"
              />
            </div>
            <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-center">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">{catererName}</h1>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="px-3 py-1 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium">South Indian</span>
                <span className="px-3 py-1 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium">North Indian</span>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} size={18} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-gray-600 text-sm">4.8 (320 reviews)</span>
              </div>
              <p className="text-gray-600 mb-4">
                Traditional South Indian & North Indian catering with authentic flavours and exceptional service.
              </p>
              <Link
                to="/my-bookings"
                className="inline-flex items-center justify-center w-full md:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Book Now
              </Link>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Menu categories */}
          <aside className="lg:w-56 shrink-0">
            <h3 className="font-semibold text-gray-800 mb-3">Menu Categories</h3>
            <ul className="space-y-1">
              {menuCategories.map((cat) => (
                <li key={cat.id}>
                  <button
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-left transition ${
                      activeCategory === cat.id
                        ? 'bg-orange-500 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {cat.label}
                    <ChevronDown size={18} className={activeCategory === cat.id ? 'rotate-180' : ''} />
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          {/* Main content - Menu sections */}
          <main className="flex-1 min-w-0">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Breakfast Menu</h2>
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="px-3 py-1 rounded-lg bg-amber-100 text-amber-800 text-sm font-medium">South Indian</span>
                <span className="px-3 py-1 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium">North Indian</span>
              </div>
              <p className="text-gray-600 text-sm">
                Delicious South Indian breakfast options featuring a variety of traditional dishes.
              </p>
            </div>

            <section className="mb-8">
              <h3 className="font-bold text-gray-800 text-lg mb-4">Tiffin Variety</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tiffinItems.map((item) => (
                  <MenuItemCard
                    key={item.name}
                    name={item.name}
                    description={item.desc}
                    image={item.image}
                  />
                ))}
              </div>
            </section>

            <section className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800 text-lg">Dosa Varieties</h3>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <span className="px-2 py-1 rounded bg-gray-100 cursor-pointer font-medium">1</span>
                  <span className="px-2 py-1 rounded hover:bg-gray-100 cursor-pointer">2</span>
                  <span className="px-2 py-1 rounded hover:bg-gray-100 cursor-pointer">3</span>
                  <ChevronRight size={18} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dosaItems.map((item) => (
                  <MenuItemCard
                    key={item.name}
                    name={item.name}
                    description={item.desc}
                    image={item.image}
                  />
                ))}
              </div>
            </section>

            <section>
              <h3 className="font-bold text-gray-800 text-lg mb-4">Beverages</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {beverageItems.map((item) => (
                  <MenuItemCard
                    key={item.name}
                    name={item.name}
                    description={item.desc}
                    image={item.image}
                  />
                ))}
              </div>
            </section>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}
