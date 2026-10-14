import { useState } from 'react';
import { MapPin, Calendar, ChevronDown, Star } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ServiceCard from '../components/ServiceCard';

/* Image imports – add your image files to src/assets/ and uncomment the line with the correct filename.
   Use the comment line as the image name reference. */
// import heroBg from '../assets/image-55e1e879-5200-4ce7-a62f-28e83ac8f722.png'; /* image-55e1e879-5200-4ce7-a62f-28e83ac8f722.png */
// import popular1 from '../assets/image-55e1e879-5200-4ce7-a62f-28e83ac8f722.png'; /* image-55e1e879-5200-4ce7-a62f-28e83ac8f722.png - Sri Mahalakshmi */
// import popular2 from '../assets/image-993a7f70-17eb-4ad2-8047-285322e5b660.png'; /* image-993a7f70-17eb-4ad2-8047-285322e5b660.png - Chettinad */
// import popular3 from '../assets/image-b893647e-4ac7-4636-8ddf-d58fd96cd25b.png'; /* image-b893647e-4ac7-4636-8ddf-d58fd96cd25b.png - Supreme */
// import district1 from '../assets/image-55e1e879-5200-4ce7-a62f-28e83ac8f722.png'; /* tambaram-classic */
// import district2 from '../assets/image-993a7f70-17eb-4ad2-8047-285322e5b660.png'; /* adyar-catering */
// import district3 from '../assets/image-b893647e-4ac7-4636-8ddf-d58fd96cd25b.png'; /* anna-nagar-elite */
// import testimonial1 from '../assets/image-c8ae832d-9e07-446e-84af-987a9ea82941.png'; /* Donald Jackman */
// import testimonial2 from '../assets/image-03f3ca68-1733-434a-8458-fe2f5d9b0e7f.png'; /* Richard Nelson */
// import testimonial3 from '../assets/image-1e4d3d11-7b41-41b5-9812-b4bf4c8c6954.png'; /* James Washington */

const HERO_IMAGE = ''; /* image-55e1e879-5200-4ce7-a62f-28e83ac8f722.png - hero background */
const POPULAR_IMAGES = ['', '', '']; /* [image-55e1e879..., image-993a7f70..., image-b893647e...] */
const DISTRICT_IMAGES = ['', '', '']; /* [tambaram-classic, adyar-catering, anna-nagar-elite] */
const TESTIMONIAL_IMAGES = ['', '', '']; /* [Donald Jackman, Richard Nelson, James Washington] */

const popularServices = [
  {
    id: 'sri-mahalakshmi',
    name: 'Sri Mahalakshmi Caterers',
    cuisines: ['South Indian', 'North Indian'],
    rating: '4.8',
    description: 'Specialists in traditional South Indian cuisine with a variety of authentic dishes.',
  },
  {
    id: 'chettinad',
    name: 'Chettinad Catering Services',
    cuisines: ['South Indian', 'North Indian'],
    rating: '4.7',
    description: "Best known for Chettinad specialities with a variety of flavourful dishes.",
  },
  {
    id: 'supreme',
    name: 'Supreme Caterers',
    cuisines: ['South Indian', 'North Indian', 'Chinese'],
    rating: '4.9',
    description: 'Offering a variety of cuisines and depths, including chicken and diverse platters.',
  },
];

const districtServices = [
  {
    id: 'tambaram-classic',
    name: 'Tambaram Classic Caterers',
    cuisines: ['South Indian', 'North Indian'],
    rating: '4.7',
    description: 'Special catering, trusted and dedicated entirely to your needs.',
  },
  {
    id: 'adyar-catering',
    name: 'Adyar Catering Services',
    cuisines: ['South Indian', 'North Indian'],
    rating: '4.8',
    description: 'Special catering, trusted and dedicated to celebration entirely.',
  },
  {
    id: 'anna-nagar-elite',
    name: 'Anna Nagar Elite Caterers',
    cuisines: ['South Indian', 'North Indian', 'Chinese'],
    rating: '4.9',
    description: 'Offering your choice of catering with incomparable dedicated service.',
  },
];

const testimonials = [
  { name: 'Donald Jackman', role: 'Content Creator', text: "I've been using CaterNet for nearly two years for events, and it has been incredibly user-friendly, making my work much easier." },
  { name: 'Richard Nelson', role: 'Event Planner', text: "I've been using CaterNet for nearly two years for events, and it has been incredibly user-friendly, making my work much easier." },
  { name: 'James Washington', role: 'Corporate Host', text: "I've been using CaterNet for nearly two years for events, and it has been incredibly user-friendly, making my work much easier." },
];

const TAMIL_NADU_DISTRICTS = [
  'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Tiruppur', 'Erode',
  'Vellore', 'Kanchipuram', 'Thanjavur', 'Dindigul', 'Karur', 'Cuddalore', 'Nagapattinam', 'Others',
];

export default function UserHomePage() {
  const [district, setDistrict] = useState('');
  const [date, setDate] = useState('');

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section
        className="relative min-h-[600px] bg-cover bg-center flex items-center justify-center px-4 py-16"
        style={{ backgroundImage: HERO_IMAGE ? `url(${HERO_IMAGE})` : 'linear-gradient(135deg, #e0f2fe 0%, #fef3c7 100%)' }}
      >
        <div className="absolute inset-0 bg-black/30" aria-hidden />
        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 pb-1 border-b-2 border-dashed border-gray-400 inline-block">
            Find the Best Catering Services Near You
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Enter your district and event date to discover top caterers in your area.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 bg-white/95 p-4 rounded-xl shadow-lg">
            <div className="flex items-center border border-gray-300 rounded-lg px-4 py-2.5 w-full md:w-auto min-w-[200px] bg-white">
              <MapPin size={20} className="text-gray-500 mr-2 shrink-0" />
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="outline-none w-full text-gray-700 bg-transparent"
              >
                <option value="">Select District</option>
                {TAMIL_NADU_DISTRICTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <ChevronDown size={20} className="text-gray-500 ml-2 shrink-0" />
            </div>
            <div className="flex items-center border border-gray-300 rounded-lg px-4 py-2.5 w-full md:w-auto min-w-[200px] bg-white">
              <Calendar size={20} className="text-gray-500 mr-2 shrink-0" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="outline-none w-full text-gray-700 bg-transparent"
              />
              <ChevronDown size={20} className="text-gray-500 ml-2 shrink-0 pointer-events-none" />
            </div>
            <button className="w-full md:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition shadow">
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Popular Catering */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-2">Popular Catering in Tamil Nadu</h2>
        <p className="text-gray-500 text-center mb-10">Choose from the most popular catering services in Tamil Nadu</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {popularServices.map((s, i) => (
            <ServiceCard
              key={s.id}
              id={s.id}
              name={s.name}
              image={POPULAR_IMAGES[i] || 'https://placehold.co/400x192/fef3c7/92400e?text=Food'}
              cuisines={s.cuisines}
              rating={s.rating}
              description={s.description}
            />
          ))}
        </div>
      </section>

      {/* Based On Your District */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-2">Based On Your District</h2>
        <p className="text-gray-500 text-center mb-10">Choose your service in district</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {districtServices.map((s, i) => (
            <ServiceCard
              key={s.id}
              id={s.id}
              name={s.name}
              image={DISTRICT_IMAGES[i] || 'https://placehold.co/400x192/d1fae5/065f46?text=Caterer'}
              cuisines={s.cuisines}
              rating={s.rating}
              description={s.description}
            />
          ))}
        </div>
      </section>

      {/* Customer Review */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">Our Customer Review</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div key={t.name} className="bg-white rounded-xl shadow-md p-6 text-center">
              <img
                src={TESTIMONIAL_IMAGES[i] || `https://i.pravatar.cc/80?u=${i}`}
                alt={t.name}
                className="w-20 h-20 rounded-full object-cover mx-auto mb-3"
              />
              <h3 className="font-bold text-gray-800">{t.name}</h3>
              <p className="text-sm text-gray-500 mb-3">{t.role}</p>
              <p className="text-gray-600 text-sm mb-4">{t.text}</p>
              <div className="flex justify-center gap-0.5">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} size={16} className="fill-amber-400 text-amber-400" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
