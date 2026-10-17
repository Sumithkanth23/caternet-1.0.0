import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Plus, Upload, Trash2, X } from 'lucide-react';
import { MENU_TYPES, CUISINE_TYPES, GUEST_SLABS, EVENT_TYPES, AVAILABLE_DAYS } from '../../data/catererData';
import { useCatererProfile } from '../../context/CatererProfileContext';
import { apiFetch, toAbsoluteUrl } from '../../lib/api';
import { getImageUploadError } from '../../shared/utils/imageUpload';

const CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Side Dish', 'Dessert', 'Beverage'];

export default function AddMenu() {
  const { id: menuId } = useParams();
  const navigate = useNavigate();
  const { profile } = useCatererProfile();
  const menuImageRef = useRef(null);
  const suggestionAbortRef = useRef({});
  const isEditMode = !!menuId;

  const [form, setForm] = useState({
    packageName: '',
    menuType: 'Veg',
    cuisineTypes: [],
    items: [{ name: 'Idly', imageUrl: '', maxGuests: '100-300', category: 'Breakfast', price: '', active: true }],
    eventTypes: [],
    availableFrom: '',
    availableTo: '',
    availableDays: 'All Days',
    recommendedGuests: '100-300',
    description: '',
    taxIncluded: false,
  });

  const [menuImageFile, setMenuImageFile] = useState(null);
  const [menuImagePreview, setMenuImagePreview] = useState('');
  const [foodFiles, setFoodFiles] = useState({}); // { [itemIndex]: File }
  const [foodPreviews, setFoodPreviews] = useState({}); // { [itemIndex]: objectUrl }
  const [suggestions, setSuggestions] = useState({}); // { [itemIndex]: [{name,imageUrl,category,cuisine}] }
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // Load menu data if editing
  useEffect(() => {
    if (!isEditMode || !menuId) return;
    let mounted = true;
    setLoading(true);
    apiFetch(`/api/menu/${menuId}`)
      .then((data) => {
        if (!mounted) return;
        if (data) {
          setForm({
            packageName: data.packageName || '',
            menuType: data.menuType || 'Veg',
            cuisineTypes: data.cuisineTypes || [],
            items: (data.items || []).map((it) => ({
              name: it.name || '',
              imageUrl: it.imageUrl || '',
              maxGuests: it.guestSlab || '100-300',
              category: it.mealCategory || 'Breakfast',
              price: it.pricePerHead ? String(it.pricePerHead) : '',
              active: true,
            })),
            eventTypes: data.eventTypes || [],
            availableFrom: data.availabilityDates?.[0] ? new Date(data.availabilityDates[0]).toISOString().split('T')[0] : '',
            availableTo: data.availabilityDates?.[1] ? new Date(data.availabilityDates[1]).toISOString().split('T')[0] : '',
            availableDays: Array.isArray(data.availableDays) && data.availableDays.length > 0 ? data.availableDays[0] : 'All Days',
            recommendedGuests: data.recommendedGuests ? `${data.recommendedGuests}-${data.recommendedGuests + 200}` : '100-300',
            description: data.description || '',
            taxIncluded: data.taxIncluded || false,
          });
          if (data.menuImageUrl) {
            setMenuImagePreview(toAbsoluteUrl(data.menuImageUrl));
          }
          // Set food previews from existing images
          const previews = {};
          (data.items || []).forEach((it, idx) => {
            if (it.imageUrl) {
              previews[idx] = toAbsoluteUrl(it.imageUrl);
            }
          });
          setFoodPreviews(previews);
        }
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err?.message || 'Failed to load menu');
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [isEditMode, menuId]);

  useEffect(() => {
    return () => {
      if (menuImagePreview && !menuImagePreview.startsWith('blob:')) {
        // Don't revoke URLs that are from server
        return;
      }
      if (menuImagePreview) URL.revokeObjectURL(menuImagePreview);
      Object.values(foodPreviews).forEach((u) => {
        if (u && u.startsWith('blob:')) URL.revokeObjectURL(u);
      });
      Object.values(suggestionAbortRef.current).forEach((c) => c?.abort?.());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleCuisine = (c) => {
    setForm((f) => ({
      ...f,
      cuisineTypes: f.cuisineTypes.includes(c) ? f.cuisineTypes.filter((x) => x !== c) : [...f.cuisineTypes, c],
    }));
  };

  const toggleEvent = (e) => {
    setForm((f) => ({
      ...f,
      eventTypes: f.eventTypes.includes(e) ? f.eventTypes.filter((x) => x !== e) : [...f.eventTypes, e],
    }));
  };

  const addItem = () => {
    setForm((f) => ({ ...f, items: [...f.items, { name: '', imageUrl: '', maxGuests: '100-300', category: 'Breakfast', price: '', active: true }] }));
  };

  const updateItem = (index, field, value) => {
    setForm((f) => ({
      ...f,
      items: f.items.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    }));
  };

  const removeItem = (index) => {
    setForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== index) }));

    setFoodFiles((prev) => {
      const next = {};
      Object.entries(prev).forEach(([k, v]) => {
        const oldIndex = Number(k);
        if (Number.isNaN(oldIndex) || oldIndex === index) return;
        const newIndex = oldIndex > index ? oldIndex - 1 : oldIndex;
        next[newIndex] = v;
      });
      return next;
    });

    setFoodPreviews((prev) => {
      const next = {};
      Object.entries(prev).forEach(([k, v]) => {
        const oldIndex = Number(k);
        if (Number.isNaN(oldIndex) || oldIndex === index) {
          if (oldIndex === index && v) URL.revokeObjectURL(v);
          return;
        }
        const newIndex = oldIndex > index ? oldIndex - 1 : oldIndex;
        next[newIndex] = v;
      });
      return next;
    });

    setSuggestions((prev) => {
      const next = {};
      Object.entries(prev).forEach(([k, v]) => {
        const oldIndex = Number(k);
        if (Number.isNaN(oldIndex) || oldIndex === index) return;
        const newIndex = oldIndex > index ? oldIndex - 1 : oldIndex;
        next[newIndex] = v;
      });
      return next;
    });
  };

  const clearCustomFoodImage = (index) => {
    setFoodFiles((prev) => {
      if (!(index in prev)) return prev;
      const next = { ...prev };
      delete next[index];
      return next;
    });

    setFoodPreviews((prev) => {
      if (!(index in prev)) return prev;
      const next = { ...prev };
      if (next[index] && next[index].startsWith('blob:')) {
        URL.revokeObjectURL(next[index]);
      }
      delete next[index];
      return next;
    });
  };

  const canPublish = useMemo(() => {
    const hasProfile = !!profile?._id;
    const hasPackageName = !!form.packageName.trim();
    const hasMenuType = !!form.menuType;
    console.log('canPublish check:', { hasProfile, hasPackageName, hasMenuType, profileId: profile?._id });
    return hasProfile && hasPackageName && hasMenuType;
  }, [profile?._id, form.packageName, form.menuType]);

  const fetchSuggestions = async (index, q) => {
    const query = (q || '').trim();
    if (!query) {
      setSuggestions((s) => ({ ...s, [index]: [] }));
      return;
    }

    if (suggestionAbortRef.current[index]) {
      suggestionAbortRef.current[index].abort();
    }
    const controller = new AbortController();
    suggestionAbortRef.current[index] = controller;

    try {
      const items = await apiFetch(`/api/menu/food-suggestions?q=${encodeURIComponent(query)}`, {
        signal: controller.signal,
      });
      setSuggestions((s) => ({ ...s, [index]: Array.isArray(items) ? items : [] }));
    } catch (err) {
      if (err?.name === 'AbortError') return;
      setSuggestions((s) => ({ ...s, [index]: [] }));
    }
  };

  const handlePublish = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log('Publish button clicked');
    console.log('Profile:', profile);
    console.log('Form:', form);
    
    setError('');
    setSuccess('');

    if (!profile?._id) {
      const errorMsg = 'Please create your service profile first. Go to Create Profile page.';
      console.error('No profile ID:', errorMsg);
      setError(errorMsg);
      return;
    }
    if (!form.packageName.trim()) {
      const errorMsg = 'Package Name is required.';
      console.error('No package name:', errorMsg);
      setError(errorMsg);
      return;
    }
    if (!form.menuType) {
      const errorMsg = 'Menu Type is required.';
      console.error('No menu type:', errorMsg);
      setError(errorMsg);
      return;
    }

    // Validate at least one food item
    const validItems = form.items.filter((it) => it.name && it.name.trim());
    if (validItems.length === 0) {
      const errorMsg = 'Please add at least one food item with a name.';
      console.error('No valid items:', errorMsg);
      setError(errorMsg);
      return;
    }

    console.log('Starting publish...');
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('catererId', profile._id);
      fd.append('packageName', form.packageName.trim());
      fd.append('menuType', form.menuType);
      fd.append('cuisineTypes', JSON.stringify(form.cuisineTypes || []));
      fd.append('eventTypes', JSON.stringify(form.eventTypes || []));
      fd.append('availableDays', form.availableDays);
      fd.append(
        'availabilityDates',
        JSON.stringify([form.availableFrom, form.availableTo].filter(Boolean))
      );
      const recommended = Number.parseInt(String(form.recommendedGuests).split('-')[0], 10);
      if (!Number.isNaN(recommended)) fd.append('recommendedGuests', String(recommended));
      fd.append('description', (form.description || '').trim());
      fd.append('taxIncluded', String(!!form.taxIncluded));
      
      // Add menu image if uploaded
      if (menuImageFile) {
        fd.append('menuImage', menuImageFile);
      }

      // Prepare food items with images
      const orderedFoodFiles = [];
      const itemsPayload = form.items
        .filter((it) => it.name && it.name.trim() && it.active !== false)
        .map((it, idx) => {
          const itemIndex = idx;
          const file = foodFiles[itemIndex];
          let customImageIndex = undefined;
          if (file) {
            customImageIndex = orderedFoodFiles.length;
            orderedFoodFiles.push(file);
          }
          return {
            name: it.name.trim(),
            imageUrl: it.imageUrl || undefined,
            guestSlab: it.maxGuests || '100-300',
            mealCategory: it.category || 'Breakfast',
            pricePerHead: it.price ? Number(it.price) : undefined,
            customImageIndex,
          };
        });

      fd.append('items', JSON.stringify(itemsPayload));
      orderedFoodFiles.forEach((file) => fd.append('foodImages', file));

      console.log('Sending request to API...');
      console.log('FormData entries:', Array.from(fd.entries()).map(([k, v]) => [k, v instanceof File ? `File: ${v.name}` : v]));
      
      if (isEditMode) {
        console.log('Updating menu:', menuId);
        const updated = await apiFetch(`/api/menu/${menuId}`, { method: 'PUT', body: fd });
        console.log('Menu updated:', updated);
        setSuccess('Menu updated successfully! Redirecting to manage menus...');
        setTimeout(() => navigate('/caterer/menus/manage'), 2000);
      } else {
        console.log('Creating new menu...');
        const created = await apiFetch('/api/menu', { method: 'POST', body: fd });
        console.log('Menu created:', created);
        setSuccess(`Menu "${form.packageName}" published successfully! It will appear in user view and manage menu.`);
        
        // Reset form after successful publish
        setTimeout(() => {
          setForm({
            packageName: '',
            menuType: 'Veg',
            cuisineTypes: [],
            items: [{ name: '', imageUrl: '', maxGuests: '100-300', category: 'Breakfast', price: '', active: true }],
            eventTypes: [],
            availableFrom: '',
            availableTo: '',
            availableDays: 'All Days',
            recommendedGuests: '100-300',
            description: '',
            taxIncluded: false,
          });
          if (menuImagePreview && menuImagePreview.startsWith('blob:')) URL.revokeObjectURL(menuImagePreview);
          setMenuImageFile(null);
          setMenuImagePreview('');
          Object.values(foodPreviews).forEach((u) => {
            if (u && u.startsWith('blob:')) URL.revokeObjectURL(u);
          });
          setFoodFiles({});
          setFoodPreviews({});
          setSuggestions({});
          setSuccess('');
        }, 4000);
      }
    } catch (err) {
      console.error('Publish error details:', err);
      console.error('Error message:', err?.message);
      console.error('Error stack:', err?.stack);
      const errorMessage = err?.message || `Failed to ${isEditMode ? 'update' : 'publish'} menu. Please check your connection and try again.`;
      setError(errorMessage);
      alert(`Error: ${errorMessage}\n\nCheck browser console for details.`);
    } finally {
      setSaving(false);
      console.log('Publish process completed');
    }
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <h1 className="text-2xl font-bold text-gray-800">{isEditMode ? 'Edit Menu' : 'Add Menu'}</h1>
        <div className="text-gray-600">Loading menu...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">{isEditMode ? 'Edit Menu' : 'Add Menu'}</h1>
      
      {!profile?._id && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
          <div className="flex items-start">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-yellow-800">Profile Required</h3>
              <p className="mt-1 text-sm text-yellow-700">
                You need to create your service profile before adding menus.{' '}
                <Link
                  to="/caterer/create-profile"
                  className="font-medium underline hover:text-yellow-900"
                >
                  Create Profile Now
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
        <h2 className="text-lg font-semibold text-gray-800">Add New Menu Package</h2>

        {!profile?._id && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800 font-medium mb-2">⚠️ Profile Required</p>
            <p className="text-sm text-red-700 mb-3">
              You must create your service profile before publishing menus. The Publish Menu button will be enabled after you create your profile.
            </p>
            <Link
              to="/caterer/create-profile"
              className="inline-block px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium transition"
            >
              Go to Create Profile →
            </Link>
          </div>
        )}

        {error && (
          <p className="text-sm text-red-700 bg-red-50 px-3 py-2 rounded-lg" role="alert">
            {error}
          </p>
        )}
        {success && (
          <p className="text-sm text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg" role="status">
            {success}
          </p>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Menu / Package Name *</label>
          <input
            type="text"
            value={form.packageName}
            onChange={(e) => setForm((f) => ({ ...f, packageName: e.target.value }))}
            placeholder="E.g. Silver Menu, Wedding Delight"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Menu Type</label>
          <div className="flex gap-4">
            {MENU_TYPES.map((t) => (
              <label key={t} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="menuType"
                  checked={form.menuType === t}
                  onChange={() => setForm((f) => ({ ...f, menuType: t }))}
                  className="text-orange-500"
                />
                <span className="text-gray-700">{t}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Cuisine Type</label>
          <div className="flex flex-wrap gap-2">
            {CUISINE_TYPES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => toggleCuisine(c)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  form.cuisineTypes.includes(c) ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Upload Image</label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => menuImageRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <Upload size={18} />
              Upload Image
            </button>
            <input
              ref={menuImageRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const imageError = getImageUploadError(file);
                if (imageError) { setError(imageError); e.target.value = ''; return; }
                setError('');
                if (menuImagePreview) URL.revokeObjectURL(menuImagePreview);
                setMenuImageFile(file);
                setMenuImagePreview(URL.createObjectURL(file));
              }}
            />
            {menuImagePreview && (
              <img
                src={menuImagePreview}
                alt="Menu preview"
                className="w-16 h-16 rounded-lg object-cover border border-gray-200"
              />
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Guest Slab Pricing</label>
          {form.items.map((item, i) => (
            <div key={i} className="flex flex-wrap items-center gap-3 py-3 border-b border-gray-100 last:border-0">
              <div className="w-12 h-12 rounded-lg bg-gray-200 shrink-0 overflow-hidden border border-gray-200">
                {(foodPreviews[i] || item.imageUrl) ? (
                  <img
                    src={foodPreviews[i] || toAbsoluteUrl(item.imageUrl)}
                    alt={item.name || 'Food'}
                    className="w-full h-full object-cover"
                  />
                ) : null}
              </div>
              <input
                type="text"
                value={item.name}
                onChange={(e) => {
                  const v = e.target.value;
                  updateItem(i, 'name', v);
                  fetchSuggestions(i, v);
                }}
                placeholder="Item name"
                className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <div className="relative">
                {(suggestions[i]?.length || 0) > 0 && (
                  <div className="absolute z-10 mt-1 w-72 max-w-[80vw] bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                    {suggestions[i].map((s) => (
                      <button
                        key={s.name}
                        type="button"
                        onClick={() => {
                          clearCustomFoodImage(i);
                          updateItem(i, 'name', s.name);
                          updateItem(i, 'category', s.category || item.category);
                          updateItem(i, 'imageUrl', s.imageUrl || '');
                          setSuggestions((prev) => ({ ...prev, [i]: [] }));
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 text-left"
                      >
                        <img
                          src={toAbsoluteUrl(s.imageUrl)}
                          alt={s.name}
                          className="w-8 h-8 rounded object-cover border border-gray-200"
                        />
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-800 truncate">{s.name}</div>
                          <div className="text-xs text-gray-500 truncate">{s.category || 'Food'}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  const input = document.getElementById(`food-image-${i}`);
                  input?.click?.();
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white hover:bg-gray-50"
              >
                Food image
              </button>
              <input
                id={`food-image-${i}`}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setFoodFiles((prev) => ({ ...prev, [i]: file }));
                  setFoodPreviews((prev) => {
                    const next = { ...prev };
                    if (next[i]) URL.revokeObjectURL(next[i]);
                    next[i] = URL.createObjectURL(file);
                    return next;
                  });
                }}
              />
              <select
                value={item.maxGuests}
                onChange={(e) => updateItem(i, 'maxGuests', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
              >
                {GUEST_SLABS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
              <select
                value={item.category}
                onChange={(e) => updateItem(i, 'category', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <input
                type="text"
                value={item.price}
                onChange={(e) => updateItem(i, 'price', e.target.value)}
                placeholder="Price (₹)"
                className="w-28 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <button
                type="button"
                onClick={() => removeItem(i)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                aria-label="Remove item"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addItem}
            className="mt-2 flex items-center gap-2 text-orange-500 hover:text-orange-600 font-medium text-sm"
          >
            <Plus size={18} />
            Add item
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Suitable For Event Type</label>
            <div className="space-y-2">
              {EVENT_TYPES.map((e) => (
                <label key={e} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.eventTypes.includes(e)}
                    onChange={() => toggleEvent(e)}
                    className="rounded text-orange-500"
                  />
                  <span className="text-gray-700">{e}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={form.availableFrom}
                  onChange={(e) => setForm((f) => ({ ...f, availableFrom: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <input
                  type="date"
                  value={form.availableTo}
                  onChange={(e) => setForm((f) => ({ ...f, availableTo: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Available Days</label>
              <div className="flex gap-4">
                {AVAILABLE_DAYS.map((d) => (
                  <label key={d} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="availableDays"
                      checked={form.availableDays === d}
                      onChange={() => setForm((f) => ({ ...f, availableDays: d }))}
                      className="text-orange-500"
                    />
                    <span className="text-gray-700 text-sm">{d}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Recommended Guests</label>
              <select
                value={form.recommendedGuests}
                onChange={(e) => setForm((f) => ({ ...f, recommendedGuests: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white"
              >
                {GUEST_SLABS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Brief description of the menu"
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg resize-none"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-gray-200">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.taxIncluded}
              onChange={(e) => setForm((f) => ({ ...f, taxIncluded: e.target.checked }))}
              className="rounded text-orange-500"
            />
            <span className="text-sm text-gray-700">Tax Included?</span>
          </label>
          <button type="button" className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm">
            Save Draft
          </button>
          <button
            type="button"
            onClick={handlePreview}
            disabled={!form.packageName.trim()}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-60 disabled:cursor-not-allowed text-sm"
          >
            Preview Menu
          </button>
          <button
            type="button"
            disabled={!canPublish || saving}
            onClick={(e) => {
              console.log('Button clicked!');
              console.log('canPublish:', canPublish);
              console.log('saving:', saving);
              console.log('profile._id:', profile?._id);
              e.preventDefault();
              e.stopPropagation();
              handlePublish(e);
            }}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-sm font-medium transition"
            title={!canPublish ? `Cannot publish: ${!profile?._id ? 'No profile' : !form.packageName.trim() ? 'No package name' : 'Missing menu type'}` : ''}
          >
            {saving ? (isEditMode ? 'Updating...' : 'Publishing...') : (isEditMode ? 'Update Menu' : 'Publish Menu')}
          </button>
          {!canPublish && (
            <div className="text-xs text-red-600 mt-1">
              {!profile?._id && '⚠️ Create profile first'}
              {profile?._id && !form.packageName.trim() && '⚠️ Enter package name'}
              {profile?._id && form.packageName.trim() && !form.menuType && '⚠️ Select menu type'}
            </div>
          )}
          <button
            type="button"
            onClick={() => navigate('/caterer/menus/manage')}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">Menu Preview</h2>
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <img
                  src={menuImagePreview || 'https://placehold.co/800x320/fef3c7/92400e?text=Menu+Image'}
                  alt={form.packageName}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{form.packageName || 'Package Name'}</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {form.cuisineTypes.map((c) => (
                  <span key={c} className="px-3 py-1 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium">
                    {c}
                  </span>
                ))}
              </div>
              <p className="text-gray-600 mb-6">{form.description || 'No description provided.'}</p>
              <div className="space-y-4">
                {Object.entries(
                  form.items.reduce((acc, item) => {
                    const cat = item.category || 'Other';
                    if (!acc[cat]) acc[cat] = [];
                    acc[cat].push(item);
                    return acc;
                  }, {})
                ).map(([category, items]) => (
                  <div key={category}>
                    <h4 className="font-bold text-gray-800 text-lg mb-3">{category}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-16 h-16 rounded-lg bg-gray-200 shrink-0 overflow-hidden">
                            {(foodPreviews[form.items.indexOf(item)] || item.imageUrl) ? (
                              <img
                                src={foodPreviews[form.items.indexOf(item)] || toAbsoluteUrl(item.imageUrl)}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : null}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-semibold text-gray-800">{item.name || 'Item Name'}</h5>
                            <p className="text-sm text-gray-500">
                              {item.price ? `₹${item.price} / head` : item.maxGuests}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
