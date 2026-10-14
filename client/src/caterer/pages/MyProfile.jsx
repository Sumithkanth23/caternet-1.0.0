import { useState, useEffect } from 'react';
import { useCatererProfile } from '../../context/CatererProfileContext';
import {
  TAMIL_NADU_DISTRICTS,
  CUISINE_TYPES,
  YEARS_IN_BUSINESS_OPTIONS,
} from '../../data/catererData';
import { toAbsoluteUrl } from '../../lib/api';

const emptyProfile = {
  serviceName: '',
  district: '',
  cuisineTypes: [],
  contactPhone: '',
  address: '',
  ownerName: '',
  yearsInBusiness: '',
  description: '',
  logoUrl: '',
};

export default function MyProfile() {
  const { profile, setProfile } = useCatererProfile();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(profile || emptyProfile);

  useEffect(() => {
    setForm(profile || emptyProfile);
  }, [profile]);

  const toggleCuisine = (c) => {
    setForm((f) => ({
      ...f,
      cuisineTypes: f.cuisineTypes.includes(c) ? f.cuisineTypes.filter((x) => x !== c) : [...f.cuisineTypes, c],
    }));
  };

  const handleSave = () => {
    setProfile(form);
    setEditing(false);
  };

  if (!profile && !editing) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
        <p className="text-gray-500">No profile yet. Create your service profile first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
        {!editing ? (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium"
          >
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button type="button" onClick={() => setEditing(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button type="button" onClick={handleSave} className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium">
              Save
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
        {form.logoUrl && (
          <div className="flex justify-start">
            <img src={toAbsoluteUrl(form.logoUrl)} alt="Logo" className="w-24 h-24 rounded-xl object-cover" />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Service Name</label>
            {editing ? (
              <input
                type="text"
                value={form.serviceName}
                onChange={(e) => setForm((f) => ({ ...f, serviceName: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
              />
            ) : (
              <p className="text-gray-800 font-medium">{form.serviceName}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">District</label>
            {editing ? (
              <select
                value={form.district}
                onChange={(e) => setForm((f) => ({ ...f, district: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white"
              >
                {TAMIL_NADU_DISTRICTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            ) : (
              <p className="text-gray-800">{form.district}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">Cuisine Types</label>
          {editing ? (
            <div className="flex flex-wrap gap-2">
              {CUISINE_TYPES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleCuisine(c)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                    form.cuisineTypes.includes(c) ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-gray-800">{form.cuisineTypes.join(', ') || '—'}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">Contact Phone</label>
          {editing ? (
            <div className="flex">
              <span className="inline-flex items-center px-4 py-2.5 border border-r-0 border-gray-300 rounded-l-lg bg-gray-50 text-gray-600 text-sm">
                +91
              </span>
              <input
                type="tel"
                value={form.contactPhone}
                onChange={(e) => setForm((f) => ({ ...f, contactPhone: e.target.value }))}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-r-lg"
              />
            </div>
          ) : (
            <p className="text-gray-800">+91 {form.contactPhone}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">Address</label>
          {editing ? (
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
            />
          ) : (
            <p className="text-gray-800">{form.address || '—'}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Owner Name</label>
            {editing ? (
              <input
                type="text"
                value={form.ownerName}
                onChange={(e) => setForm((f) => ({ ...f, ownerName: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
              />
            ) : (
              <p className="text-gray-800">{form.ownerName || '—'}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Years in Business</label>
            {editing ? (
              <select
                value={form.yearsInBusiness}
                onChange={(e) => setForm((f) => ({ ...f, yearsInBusiness: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white"
              >
                <option value="">Select</option>
                {YEARS_IN_BUSINESS_OPTIONS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            ) : (
              <p className="text-gray-800">{form.yearsInBusiness || '—'}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">Description</label>
          {editing ? (
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg resize-none"
            />
          ) : (
            <p className="text-gray-800 whitespace-pre-wrap">{form.description || '—'}</p>
          )}
        </div>
      </div>
    </div>
  );
}
