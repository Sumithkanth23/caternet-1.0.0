import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Home, Star, ChevronRight, MessageSquare, User } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import BookNowButton from '../components/BookNowButton';
import BookNowBar from '../components/BookNowBar';
import FoodItemCard from '../components/FoodItemCard';
import { apiFetch, toAbsoluteUrl } from '../../lib/api';

/** Render n filled/empty stars */
function StarRow({ rating, size = 16 }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={size}
          className={s <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-300'}
        />
      ))}
    </div>
  );
}

/** Single review card */
function ReviewCard({ review }) {
  const name = review.user?.name || review.user?.email?.split('@')[0] || 'Anonymous';
  const date = new Date(review.reviewDate || review.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  return (
    <div className="bg-gray-50 border border-gray-100 rounded-xl p-5">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
            <User size={18} />
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-sm">{name}</p>
            <p className="text-xs text-gray-400">{date}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <StarRow rating={review.rating} size={14} />
          <span className="text-xs font-medium text-amber-700">{review.rating}/5</span>
        </div>
      </div>
      {review.reviewText && (
        <p className="text-gray-600 text-sm leading-relaxed mt-2">"{review.reviewText}"</p>
      )}
    </div>
  );
}

export default function ServiceDetails() {
  const { id } = useParams(); // catererId
  const [caterer, setCaterer] = useState(null);
  const [allMenus, setAllMenus] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('breakfast');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([
      apiFetch(`/api/caterer/profile/${id}`),
      apiFetch(`/api/menu/caterer/${id}`),
      apiFetch(`/api/reviews/caterer/${id}`).catch(() => []),
    ])
      .then(([catererData, menus, reviewData]) => {
        if (!mounted) return;
        setCaterer(catererData || null);
        setAllMenus(Array.isArray(menus) ? menus : []);
        setReviews(Array.isArray(reviewData) ? reviewData : []);

        const firstMenu = Array.isArray(menus) && menus.length > 0 ? menus[0] : null;
        if (firstMenu) {
          const pkgName = (firstMenu.packageName || '').toLowerCase();
          if (pkgName.includes('breakfast')) setActiveTab('breakfast');
          else if (pkgName.includes('lunch')) setActiveTab('lunch');
          else if (pkgName.includes('dinner')) setActiveTab('dinner');
        }
      })
      .catch(() => {
        if (!mounted) return;
        setCaterer(null);
        setAllMenus([]);
        setReviews([]);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => { mounted = false; };
  }, [id]);

  const catererName = caterer?.serviceName || 'Service';
  const bannerImage =
    toAbsoluteUrl(caterer?.logoUrl) ||
    'https://placehold.co/800x320/fef3c7/92400e?text=Caterer';

  // Average rating from fetched reviews (fallback to stored field)
  const avgRating = useMemo(() => {
    if (reviews.length === 0) return caterer?.rating || 0;
    const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
    return Math.round((sum / reviews.length) * 10) / 10;
  }, [reviews, caterer?.rating]);

  const menusByTab = useMemo(() => {
    const groups = { breakfast: [], lunch: [], dinner: [], other: [] };
    allMenus.forEach((menu) => {
      const pkgName = (menu.packageName || '').toLowerCase();
      if (pkgName.includes('breakfast')) groups.breakfast.push(menu);
      else if (pkgName.includes('lunch')) groups.lunch.push(menu);
      else if (pkgName.includes('dinner')) groups.dinner.push(menu);
      else groups.other.push(menu);
    });
    return groups;
  }, [allMenus]);

  const activeMenus = menusByTab[activeTab] || [];
  const bookNowDefaultMenu = activeMenus[0] || allMenus[0] || null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-8">
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/" className="flex items-center gap-1 hover:text-blue-600 transition">
            <Home size={16} />
            Home
          </Link>
          <ChevronRight size={16} />
          <span className="text-gray-800 font-medium">{catererName}</span>
        </nav>

        {/* Caterer info card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/2">
              <img
                src={bannerImage}
                alt={`${catererName} banner`}
                className="w-full h-64 md:h-80 object-cover"
              />
            </div>
            <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-center">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">{catererName}</h1>
              <div className="flex flex-wrap gap-2 mb-3">
                {(bookNowDefaultMenu?.cuisineTypes || caterer?.cuisineTypes || []).slice(0, 6).map((c) => (
                  <span key={c} className="px-3 py-1 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium">
                    {c}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2 mb-3">
                <StarRow rating={avgRating} size={18} />
                <span className="text-gray-700 text-sm font-medium">
                  {avgRating > 0 ? avgRating.toFixed(1) : 'No ratings yet'}
                </span>
                {reviews.length > 0 && (
                  <span className="text-gray-400 text-sm">({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})</span>
                )}
              </div>
              <p className="text-gray-600 mb-4">
                {caterer?.description || `Welcome to ${catererName}`}
              </p>
              {bookNowDefaultMenu && <BookNowButton menu={bookNowDefaultMenu} caterer={caterer} />}
            </div>
          </div>
        </div>

        {/* Menu Tabs */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="border-b border-gray-200">
            <div className="flex">
              {[
                { key: 'breakfast', label: 'Breakfast', count: menusByTab.breakfast.length },
                { key: 'lunch', label: 'Lunch', count: menusByTab.lunch.length },
                { key: 'dinner', label: 'Dinner', count: menusByTab.dinner.length },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 px-6 py-4 text-center font-medium transition ${
                    activeTab === tab.key
                      ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                      activeTab === tab.key ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-7 h-7 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : activeMenus.length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                No {activeTab} menus available at the moment.
              </div>
            ) : (
              <div className="space-y-8">
                {activeMenus.map((menu) => (
                  <div key={menu._id} className="border-b border-gray-200 last:border-0 pb-6 last:pb-0">
                    <div className="flex items-start gap-4 mb-4">
                      {menu.menuImageUrl && (
                        <img
                          src={toAbsoluteUrl(menu.menuImageUrl)}
                          alt={menu.packageName}
                          className="w-24 h-24 rounded-lg object-cover shrink-0"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{menu.packageName}</h3>
                        <p className="text-gray-600 text-sm mb-2">{menu.description || 'No description'}</p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            menu.menuType === 'Veg' ? 'bg-green-100 text-green-700' :
                            menu.menuType === 'Non-Veg' ? 'bg-red-100 text-red-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {menu.menuType}
                          </span>
                          {(menu.cuisineTypes || []).map((c) => (
                            <span key={c} className="px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs font-medium">
                              {c}
                            </span>
                          ))}
                        </div>
                        <BookNowButton menu={menu} caterer={caterer} className="mt-2" />
                      </div>
                    </div>
                    {menu.items && menu.items.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                        {menu.items.map((item, idx) => (
                          <FoodItemCard
                            key={`${menu._id}-${idx}`}
                            name={item.name}
                            description={item.pricePerHead ? `₹${item.pricePerHead} / head` : item.guestSlab || ''}
                            image={toAbsoluteUrl(item.imageUrl) || 'https://placehold.co/96x96/fef3c7/92400e?text=Item'}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ---- Reviews Section ---- */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
            <MessageSquare size={22} className="text-orange-500" />
            <h2 className="text-xl font-bold text-gray-800">
              Customer Reviews
            </h2>
            {reviews.length > 0 && (
              <span className="ml-auto flex items-center gap-2">
                <StarRow rating={avgRating} size={16} />
                <span className="text-gray-700 font-semibold">{avgRating.toFixed(1)}</span>
                <span className="text-gray-400 text-sm">/ 5 &bull; {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</span>
              </span>
            )}
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-7 h-7 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-10">
                <Star size={40} className="mx-auto mb-3 text-gray-200" />
                <p className="text-gray-500 font-medium">No reviews yet</p>
                <p className="text-gray-400 text-sm mt-1">
                  Be the first to review after your event!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reviews.map((review) => (
                  <ReviewCard key={review._id} review={review} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {bookNowDefaultMenu && <BookNowBar menu={bookNowDefaultMenu} caterer={caterer} />}
      <Footer />
    </div>
  );
}
