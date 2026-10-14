import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  X,
  SlidersHorizontal,
  Star,
  MapPin,
  ChevronDown,
  Loader2,
  ServerCrash,
  SearchX,
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ServiceCard from '../../components/ServiceCard';
import { apiFetch, toAbsoluteUrl } from '../../lib/api';

const TAMIL_NADU_DISTRICTS = [
  'All Districts',
  'Chennai',
  'Coimbatore',
  'Madurai',
  'Tiruchirappalli',
  'Salem',
  'Tirunelveli',
  'Tiruppur',
  'Erode',
  'Vellore',
  'Kanchipuram',
  'Thanjavur',
  'Dindigul',
  'Karur',
  'Cuddalore',
  'Nagapattinam',
  'Others',
];

const SORT_OPTIONS = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'newest', label: 'Newest First' },
];

// ----- Skeleton card while loading -----
function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
      <div className="w-full h-48 bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-gray-200 rounded w-3/5" />
        <div className="flex gap-2">
          <div className="h-5 w-20 bg-amber-100 rounded-full" />
          <div className="h-5 w-20 bg-amber-100 rounded-full" />
        </div>
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-100 rounded" />
        <div className="h-9 bg-orange-100 rounded-lg" />
      </div>
    </div>
  );
}

// ----- Does a caterer match the free-text query? -----
function matchesQuery(caterer, q) {
  if (!q) return true;
  const lq = q.toLowerCase();
  const fields = [
    caterer.serviceName,
    caterer.district,
    caterer.description,
    ...(caterer.cuisineTypes || []),
  ];
  return fields.some((f) => f && f.toLowerCase().includes(lq));
}

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();

  // derive state from URL params
  const urlQuery = searchParams.get('q') || '';
  const urlDistrict = searchParams.get('district') || '';
  const urlSort = searchParams.get('sort') || 'popular';

  // local input state (controlled input before submit)
  const [inputValue, setInputValue] = useState(urlQuery);
  const [caterers, setCaterers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const inputRef = useRef(null);

  // Keep local input in sync when URL query changes (e.g. browser back)
  useEffect(() => {
    setInputValue(urlQuery);
  }, [urlQuery]);

  // ----- Fetch caterers from API -----
  const fetchCaterers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: '50' });
      if (urlDistrict) params.set('district', urlDistrict);
      if (urlSort === 'popular') params.set('sortBy', 'popular');
      const data = await apiFetch(`/api/caterer/public?${params.toString()}`);
      setCaterers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load results');
    } finally {
      setLoading(false);
    }
  }, [urlDistrict, urlSort]);

  useEffect(() => {
    fetchCaterers();
  }, [fetchCaterers]);

  // ----- Client-side filter by free-text query -----
  const results = caterers.filter((c) => matchesQuery(c, urlQuery));

  // ----- Handlers -----
  const pushParams = (overrides) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(overrides).forEach(([k, v]) => {
      if (v) next.set(k, v);
      else next.delete(k);
    });
    setSearchParams(next);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    pushParams({ q: inputValue.trim() });
  };

  const handleDistrictChange = (e) => pushParams({ district: e.target.value === 'All Districts' ? '' : e.target.value });
  const handleSortChange = (e) => pushParams({ sort: e.target.value });
  const clearQuery = () => {
    setInputValue('');
    pushParams({ q: '' });
    inputRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      {/* ---- Search header bar ---- */}
      <div className="bg-white border-b border-gray-200 sticky top-[73px] z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center gap-3">
          {/* Search input */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex flex-1 items-center bg-gray-50 border border-gray-300 focus-within:border-blue-500 rounded-xl px-4 py-2.5 gap-3 transition"
          >
            <Search size={18} className="text-gray-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Search caterer name, cuisine, district…"
              className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-400 text-sm"
            />
            {inputValue && (
              <button type="button" onClick={clearQuery} className="text-gray-400 hover:text-gray-600 transition shrink-0" aria-label="Clear">
                <X size={16} />
              </button>
            )}
            <button
              type="submit"
              className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition"
            >
              Search
            </button>
          </form>

          {/* Filter toggle */}
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className={`flex items-center gap-1.5 text-sm font-medium px-4 py-2.5 rounded-xl border transition ${
              showFilters ? 'bg-blue-50 border-blue-400 text-blue-700' : 'bg-white border-gray-300 text-gray-600 hover:border-blue-400'
            }`}
          >
            <SlidersHorizontal size={16} />
            Filters
          </button>
        </div>

        {/* Inline filter row */}
        {showFilters && (
          <div className="max-w-6xl mx-auto px-6 pb-4 flex flex-wrap gap-4">
            {/* District */}
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-white gap-2">
              <MapPin size={16} className="text-gray-500 shrink-0" />
              <select
                value={urlDistrict || 'All Districts'}
                onChange={handleDistrictChange}
                className="outline-none text-sm text-gray-700 bg-transparent cursor-pointer"
              >
                {TAMIL_NADU_DISTRICTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <ChevronDown size={14} className="text-gray-400 shrink-0" />
            </div>

            {/* Sort */}
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-white gap-2">
              <Star size={16} className="text-amber-400 shrink-0" />
              <select
                value={urlSort}
                onChange={handleSortChange}
                className="outline-none text-sm text-gray-700 bg-transparent cursor-pointer"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <ChevronDown size={14} className="text-gray-400 shrink-0" />
            </div>
          </div>
        )}
      </div>

      {/* ---- Results area ---- */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-10">
        {/* Result count / state headline */}
        <div className="mb-6">
          {!loading && !error && (
            <p className="text-gray-600 text-sm">
              {urlQuery ? (
                <>
                  Showing <span className="font-semibold text-gray-800">{results.length}</span> result
                  {results.length !== 1 ? 's' : ''} for{' '}
                  <span className="font-semibold text-blue-600">"{urlQuery}"</span>
                  {urlDistrict && (
                    <> in <span className="font-semibold text-gray-800">{urlDistrict}</span></>
                  )}
                </>
              ) : (
                <>
                  <span className="font-semibold text-gray-800">{results.length}</span> catering service
                  {results.length !== 1 ? 's' : ''} found
                  {urlDistrict && (
                    <> in <span className="font-semibold text-gray-800">{urlDistrict}</span></>
                  )}
                </>
              )}
            </p>
          )}
        </div>

        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
            <ServerCrash size={48} className="text-red-400" />
            <p className="text-gray-600 text-lg font-medium">Failed to load results</p>
            <p className="text-gray-400 text-sm">{error}</p>
            <button
              onClick={fetchCaterers}
              className="mt-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && results.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
            <SearchX size={48} className="text-gray-300" />
            <p className="text-gray-600 text-lg font-medium">No services found</p>
            <p className="text-gray-400 text-sm">
              Try a different keyword, district, or remove filters.
            </p>
            <button
              onClick={() => {
                setInputValue('');
                setSearchParams({});
              }}
              className="mt-2 px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Cards grid */}
        {!loading && !error && results.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {results.map((caterer) => (
              <ServiceCard
                key={caterer._id}
                id={caterer._id}
                name={caterer.serviceName}
                image={toAbsoluteUrl(caterer.logoUrl) || 'https://placehold.co/400x192/fef3c7/92400e?text=Caterer'}
                cuisines={caterer.cuisineTypes || []}
                rating={caterer.rating ? caterer.rating.toFixed(1) : null}
                reviewCount={caterer.reviewCount || 0}
                description={caterer.description || ''}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
