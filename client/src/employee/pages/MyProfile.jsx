import { useState, useEffect } from 'react';
import { UtensilsCrossed, Briefcase, MapPin, Calendar, Phone, Pencil, Save, UserRound } from 'lucide-react';
import { useEmployeeProfile } from '../../context/EmployeeProfileContext';
import { toAbsoluteUrl } from '../../lib/api';
import {
  TAMIL_NADU_DISTRICTS,
  EMPLOYEE_ROLES,
  SKILL_OPTIONS,
  EXPERIENCE_OPTIONS,
  AVAILABILITY_DAYS,
} from '../../data/employeeData';

const emptyProfile = {
  fullName: '',
  role: '',
  skills: [],
  experience: '',
  district: '',
  availabilityDays: [],
  phone: '',
  summary: '',
  profileImageUrl: '',
};

export default function EmployeeMyProfile() {
  const { profile, setProfile } = useEmployeeProfile();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(profile || emptyProfile);

  useEffect(() => {
    setForm(profile || emptyProfile);
  }, [profile]);

  const toggleSkill = (s) => {
    setForm((f) => ({
      ...f,
      skills: f.skills.includes(s) ? f.skills.filter((x) => x !== s) : [...f.skills, s],
    }));
  };
  const toggleAvailability = (d) => {
    setForm((f) => ({
      ...f,
      availabilityDays: f.availabilityDays.includes(d)
        ? f.availabilityDays.filter((x) => x !== d)
        : [...f.availabilityDays, d],
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
        <p className="text-gray-500">No profile yet. Complete your profile from the create profile step.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4 min-w-0">
            {form.profileImageUrl ? <img src={toAbsoluteUrl(form.profileImageUrl)} alt={form.fullName || 'Profile'} className="w-16 h-16 rounded-2xl object-cover border border-blue-100" /> : <div className="grid w-16 h-16 shrink-0 place-items-center rounded-2xl bg-blue-100 text-blue-700"><UserRound size={28} /></div>}
            <div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Employee account</p><h1 className="text-2xl font-bold text-gray-800 truncate">{form.fullName || 'My Profile'}</h1><p className="mt-1 flex items-center gap-1 text-sm text-gray-500"><MapPin size={15} /> {form.district || 'Add your district'}</p></div>
          </div>
        {!editing ? (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 font-medium"
          >
            <Pencil size={18} />
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 font-medium"
            >
              <Save size={17} />
              Save
            </button>
          </div>
        )}
        </div>
        <p className="mt-5 border-t border-gray-100 pt-4 text-sm text-gray-500">Keep your work preferences current so caterers can find the right fit for their events.</p>
      </section>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 space-y-6">
        <div className="flex items-center gap-4 border-b border-gray-100 pb-5">
          {form.profileImageUrl ? (
            <img
              src={toAbsoluteUrl(form.profileImageUrl)}
              alt={form.fullName || 'Profile'}
              className="w-20 h-20 rounded-full object-cover border border-gray-200"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-2xl font-bold">
              {(form.fullName || 'E').charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h2 className="text-xl font-bold text-gray-800">{form.fullName || '—'}</h2>
            {form.role && (
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded bg-gray-100 text-gray-700 text-sm">
                {form.role}
              </span>
            )}
          </div>
        </div>

        <div>
          <h3 className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <UtensilsCrossed size={16} />
            Skills
          </h3>
          {editing ? (
            <div className="flex flex-wrap gap-2">
              {SKILL_OPTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSkill(s)}
                  className={`px-3 py-1.5 rounded-lg text-sm ${
                    form.skills.includes(s) ? 'bg-orange-500 text-white' : 'bg-orange-50 text-orange-800'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {(form.skills || []).map((s) => (
                <span key={s} className="px-3 py-1.5 rounded-lg text-sm bg-orange-50 text-orange-800">
                  {s}
                </span>
              ))}
              {(form.skills || []).length === 0 && <span className="text-gray-500">—</span>}
            </div>
          )}
        </div>

        <div>
          <h3 className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
            <Briefcase size={16} />
            Experience
          </h3>
          {editing ? (
            <select
              value={form.experience}
              onChange={(e) => setForm((f) => ({ ...f, experience: e.target.value }))}
              className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg bg-white"
            >
              <option value="">Select</option>
              {EXPERIENCE_OPTIONS.map((x) => (
                <option key={x} value={x}>{x}</option>
              ))}
            </select>
          ) : (
            <p className="text-gray-800">{form.experience || '—'}</p>
          )}
        </div>

        <div>
          <h3 className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
            <MapPin size={16} />
            District
          </h3>
          {editing ? (
            <select
              value={form.district}
              onChange={(e) => setForm((f) => ({ ...f, district: e.target.value }))}
              className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg bg-white"
            >
              {TAMIL_NADU_DISTRICTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          ) : (
            <p className="text-gray-800">{form.district || '—'}</p>
          )}
        </div>

        <div>
          <h3 className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Calendar size={16} />
            Availability Dates
          </h3>
          {editing ? (
            <div className="flex flex-wrap gap-2">
              {AVAILABILITY_DAYS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleAvailability(d)}
                  className={`px-3 py-1.5 rounded-lg text-sm ${
                    form.availabilityDays.includes(d) ? 'bg-green-500 text-white' : 'bg-green-50 text-green-800'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {(form.availabilityDays || []).map((d) => (
                <span key={d} className="px-3 py-1.5 rounded-lg text-sm bg-green-50 text-green-800">
                  {d}
                </span>
              ))}
              {(form.availabilityDays || []).length === 0 && <span className="text-gray-500">—</span>}
            </div>
          )}
        </div>

        <div>
          <h3 className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
            <Phone size={16} />
            Phone
          </h3>
          {editing ? (
            <div className="flex">
              <span className="inline-flex items-center px-4 py-2 border border-r-0 border-gray-300 rounded-l-lg bg-gray-50 text-gray-600 text-sm">
                +91
              </span>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-r-lg max-w-xs"
              />
            </div>
          ) : (
            <p className="text-gray-800">+91 {form.phone || '—'}</p>
          )}
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-1">Summary</h3>
          {editing ? (
            <textarea
              value={form.summary}
              onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none"
            />
          ) : (
            <p className="text-gray-800 whitespace-pre-wrap">{form.summary || '—'}</p>
          )}
        </div>
      </div>
    </div>
  );
}
