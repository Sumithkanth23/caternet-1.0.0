import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, Plus } from 'lucide-react';
import { useCatererProfile } from '../../context/CatererProfileContext';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../lib/api';
import {
  TAMIL_NADU_DISTRICTS,
  CUISINE_TYPES,
  YEARS_IN_BUSINESS_OPTIONS,
} from '../../data/catererData';

export default function CreateProfile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setProfile } = useCatererProfile();
  const fileRef = useRef(null);
  const [form, setForm] = useState({
    serviceName: '',
    district: '',
    cuisineTypes: [],
    contactPhone: '',
    address: '',
    ownerName: '',
    yearsInBusiness: '',
    description: '',
    logoUrl: '',
  });
  const [logoFile, setLogoFile] = useState(null);
  const [cuisineInput, setCuisineInput] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    return () => {
      if (form.logoUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(form.logoUrl);
      }
    };
  }, [form.logoUrl]);

  const toggleCuisine = (cuisine) => {
    setForm((prev) => ({
      ...prev,
      cuisineTypes: prev.cuisineTypes.includes(cuisine)
        ? prev.cuisineTypes.filter((c) => c !== cuisine)
        : [...prev.cuisineTypes, cuisine],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.serviceName.trim()) {
      setError('Service Name is required.');
      return;
    }
    if (!form.district) {
      setError('District is required.');
      return;
    }
    if (!form.contactPhone.trim()) {
      setError('Contact Phone is required.');
      return;
    }

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('userId', user?.id || user?.email || 'demo-caterer');
      fd.append('serviceName', form.serviceName);
      fd.append('district', form.district);
      fd.append('cuisineTypes', JSON.stringify(form.cuisineTypes || []));
      fd.append('contactPhone', form.contactPhone);
      if (form.address) fd.append('address', form.address);
      if (form.ownerName) fd.append('ownerName', form.ownerName);
      if (form.yearsInBusiness) fd.append('yearsInBusiness', form.yearsInBusiness);
      if (form.description) fd.append('description', form.description);
      if (logoFile) fd.append('serviceLogo', logoFile);

      const profile = await apiFetch('/api/caterer/profile', { method: 'POST', body: fd });
      if (logoFile && !profile?.logoUrl) {
        setError('Logo upload failed. Please try with a PNG/JPG image under 5MB.');
        return;
      }
      setProfile(profile);
      navigate('/caterer/dashboard');
    } catch (err) {
      setError(err?.message || 'Failed to create profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-gray-800 font-bold text-lg">
          <span className="text-orange-500" aria-hidden>🍽️</span>
          CaterNet
        </Link>
        <button type="button" className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 text-sm">
          Help
        </button>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/" className="flex items-center gap-1 hover:text-orange-500 transition">
            <Home size={16} />
            Home
          </Link>
          <span>/</span>
          <span className="text-gray-800 font-medium">Create Service Profile</span>
        </nav>

        <h1 className="text-2xl font-bold text-gray-800 mb-1">Create Your Service Profile</h1>
        <p className="text-gray-500 mb-6">Please fill out the details to set up your catering service profile.</p>
        <p className="text-sm text-gray-500 mb-6">Step 1 of 1 – Service Details</p>

        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-48 shrink-0">
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload Logo</label>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full aspect-square max-w-[180px] border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition cursor-pointer"
            >
              {form.logoUrl ? (
                <img
                  src={form.logoUrl}
                  alt="Service logo preview"
                  className="w-full h-full rounded-xl object-cover"
                />
              ) : (
                <>
                  <Plus size={40} className="text-blue-500 mb-2" />
                  <span className="text-sm text-gray-600">Upload Logo</span>
                  <span className="text-xs text-gray-400 mt-1">PNG or JPG format only</span>
                </>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (form.logoUrl?.startsWith('blob:')) {
                    URL.revokeObjectURL(form.logoUrl);
                  }
                  setLogoFile(file);
                  setForm((f) => ({ ...f, logoUrl: URL.createObjectURL(file) }));
                }}
              />
            </button>
          </div>

          <div className="flex-1 space-y-4">
            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg" role="alert">
                {error}
              </p>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Name *</label>
              <input
                type="text"
                value={form.serviceName}
                onChange={(e) => setForm((f) => ({ ...f, serviceName: e.target.value }))}
                placeholder="Enter catering service name"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">District *</label>
              <select
                value={form.district}
                onChange={(e) => setForm((f) => ({ ...f, district: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white"
              >
                <option value="">Select district</option>
                {TAMIL_NADU_DISTRICTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cuisine Types</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {CUISINE_TYPES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleCuisine(c)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                      form.cuisineTypes.includes(c)
                        ? 'bg-orange-500 text-white'
                        : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <select
                value={cuisineInput}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v && !form.cuisineTypes.includes(v)) {
                    setForm((f) => ({ ...f, cuisineTypes: [...f.cuisineTypes, v] }));
                    setCuisineInput('');
                  }
                }}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white"
              >
                <option value="">Select cuisine types</option>
                {CUISINE_TYPES.filter((c) => !form.cuisineTypes.includes(c)).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone *</label>
              <div className="flex">
                <span className="inline-flex items-center px-4 py-2.5 border border-r-0 border-gray-300 rounded-l-lg bg-gray-50 text-gray-600 text-sm">
                  +91
                </span>
                <input
                  type="tel"
                  value={form.contactPhone}
                  onChange={(e) => setForm((f) => ({ ...f, contactPhone: e.target.value }))}
                  placeholder="90000 00000"
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                placeholder="Enter full address including city and pincode"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name (Optional)</label>
              <input
                type="text"
                value={form.ownerName}
                onChange={(e) => setForm((f) => ({ ...f, ownerName: e.target.value }))}
                placeholder="Enter owner full name"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Number of Years in Business (Optional)</label>
              <select
                value={form.yearsInBusiness}
                onChange={(e) => setForm((f) => ({ ...f, yearsInBusiness: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white"
              >
                <option value="">Select years</option>
                {YEARS_IN_BUSINESS_OPTIONS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Describe your catering service including your specialities, experience, and services offered."
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition"
            >
              {saving ? 'Creating...' : 'Create Service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
