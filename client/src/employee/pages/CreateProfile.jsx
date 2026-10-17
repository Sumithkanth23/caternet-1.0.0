import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, Plus } from 'lucide-react';
import { useEmployeeProfile } from '../../context/EmployeeProfileContext';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../lib/api';
import { getImageUploadError } from '../../shared/utils/imageUpload';
import {
  TAMIL_NADU_DISTRICTS,
  EMPLOYEE_ROLES,
  SKILL_OPTIONS,
  EXPERIENCE_OPTIONS,
  AVAILABILITY_DAYS,
} from '../../data/employeeData';

export default function EmployeeCreateProfile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setProfile } = useEmployeeProfile();
  const [form, setForm] = useState({
    fullName: '',
    role: '',
    skills: [],
    experience: '',
    district: '',
    availabilityDays: [],
    phone: '',
    summary: '',
  });
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const toggleSkill = (skill) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const toggleAvailability = (day) => {
    setForm((prev) => ({
      ...prev,
      availabilityDays: prev.availabilityDays.includes(day)
        ? prev.availabilityDays.filter((d) => d !== day)
        : [...prev.availabilityDays, day],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.fullName.trim()) { setError('Full name is required.'); return; }
    if (!form.role) { setError('Role is required.'); return; }
    if (!form.district) { setError('District is required.'); return; }
    if (!form.phone.trim()) { setError('Phone is required.'); return; }

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('userId', user?.id || user?.email || 'demo-employee');
      fd.append('fullName', form.fullName);
      fd.append('role', form.role);
      fd.append('skills', JSON.stringify(form.skills));
      fd.append('experience', form.experience);
      fd.append('district', form.district);
      fd.append('availabilityDays', JSON.stringify(form.availabilityDays));
      fd.append('phone', form.phone);
      if (form.summary) fd.append('summary', form.summary);
      if (profileImageFile) fd.append('profileImage', profileImageFile);

      const profile = await apiFetch('/api/employee/profile', { method: 'POST', body: fd });
      setProfile(profile);
      navigate('/employee/dashboard');
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
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/" className="flex items-center gap-1 hover:text-orange-500 transition">
            <Home size={16} />
            Home
          </Link>
          <span>/</span>
          <span className="text-gray-800 font-medium">Create Profile</span>
        </nav>

        <h1 className="text-2xl font-bold text-gray-800 mb-1">Create Your Profile</h1>
        <p className="text-gray-500 mb-6">Fill in your details so caterers can find you for job openings.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="sm:w-40 shrink-0">
              <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo</label>
              <label className="w-full aspect-square max-w-[140px] border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition cursor-pointer">
                {profileImageFile
                  ? <img src={URL.createObjectURL(profileImageFile)} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                  : (<><Plus size={32} className="text-orange-500 mb-1" /><span className="text-xs text-gray-600">Upload</span></>)
                }
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const imageError = getImageUploadError(file);
                    if (imageError) { setError(imageError); e.target.value = ''; return; }
                    setError('');
                    setProfileImageFile(file);
                  }}
                />
              </label>
            </div>

            <div className="flex-1 space-y-4">
              {error && (
                <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg" role="alert">
                  {error}
                </p>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                  placeholder="e.g. Pavan Kumar"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white"
                >
                  <option value="">Select role</option>
                  {EMPLOYEE_ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
                <div className="flex flex-wrap gap-2">
                  {SKILL_OPTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSkill(s)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                        form.skills.includes(s) ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                <select
                  value={form.experience}
                  onChange={(e) => setForm((f) => ({ ...f, experience: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white"
                >
                  <option value="">Select experience</option>
                  {EXPERIENCE_OPTIONS.map((x) => (
                    <option key={x} value={x}>{x}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">District *</label>
                <select
                  value={form.district}
                  onChange={(e) => setForm((f) => ({ ...f, district: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white"
                >
                  <option value="">Select district</option>
                  {TAMIL_NADU_DISTRICTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Availability (Days)</label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABILITY_DAYS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => toggleAvailability(d)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                        form.availabilityDays.includes(d) ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <div className="flex">
                  <span className="inline-flex items-center px-4 py-2.5 border border-r-0 border-gray-300 rounded-l-lg bg-gray-50 text-gray-600 text-sm">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    placeholder="9876543210"
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Summary</label>
                <textarea
                  value={form.summary}
                  onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
                  placeholder="Brief description of your experience and what you offer."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none resize-none"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full sm:max-w-xs py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold rounded-lg transition"
          >
            {saving ? 'Creating...' : 'Create Profile & go to Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}
