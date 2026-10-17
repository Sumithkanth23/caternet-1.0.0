import { useState } from 'react';
import { X, User, Phone, Briefcase, Star, FileText, Plus } from 'lucide-react';
import { apiFetch } from '../../lib/api';

export default function ApplyModal({ isOpen, onClose, job, profile, onApplied }) {
  const [form, setForm] = useState({
    fullName: profile?.fullName || '',
    phone: profile?.phone || '',
    experience: profile?.experience || '',
    skills: profile?.skills || [], skillInput: '',
    email: '', city: profile?.district || '', languages: [], previousExperience: [],
    note: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.fullName.trim()) { setError('Please enter your full name.'); return; }
    if (!form.phone.trim())    { setError('Please enter your phone number.'); return; }

    if (!form.email.trim() || !form.city.trim() || !form.languages.length || !form.skills.length) { setError('Email, city, at least one language, and one skill are required.'); return; }

    setSubmitting(true);
    try {
      await apiFetch('/api/job-requests', {
        method: 'POST',
        body: JSON.stringify({
          jobId: job._id,
          employeeId: profile._id,
          experience: form.experience.trim(),
          skills: form.skills,
          note: form.note.trim(),
          applicantEmail: form.email.trim(), applicantCity: form.city.trim(), languagesKnown: form.languages,
          previousExperience: form.previousExperience.filter((item) => item.employerName || item.role || item.duration), skillsList: form.skills,
        }),
      });
      setSuccess(true);
      onApplied(job._id);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setError('');
      }, 2000);
    } catch (err) {
      setError(err?.message || 'Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Apply for Job</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Alerts */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 text-sm">
              Application submitted! The caterer will review your request.
            </div>
          )}

          {/* Job info (read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Job Details</label>
            <div className="px-4 py-2.5 bg-gray-50 rounded-lg border border-gray-200">
              <p className="font-medium text-gray-800">{job?.title}</p>
              <p className="text-sm text-gray-500">
                {job?.caterer?.serviceName} · {job?.caterer?.district}
              </p>
            </div>
          </div>

          <div><label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label><input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="your@email.com" required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-2">City / Area *</label><input type="text" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} placeholder="e.g., Tiruppur, Coimbatore" required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-2">Languages Known *</label><div className="flex flex-wrap gap-2">{['Tamil','English','Hindi','Telugu','Malayalam','Kannada','Others'].map((language) => <button key={language} type="button" onClick={() => setForm((f) => ({ ...f, languages: f.languages.includes(language) ? f.languages.filter((item) => item !== language) : [...f.languages, language] }))} className={`px-3 py-1.5 rounded-full text-sm ${form.languages.includes(language) ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700'}`}>{language}</button>)}</div></div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <User size={16} />
              Full Name *
            </label>
            <input
              type="text"
              value={form.fullName}
              onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
              placeholder="Your full name"
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Phone size={16} />
              Phone Number *
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="e.g. +91 9876543210"
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>

          {/* Experience */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Briefcase size={16} />
              Years of Experience
            </label>
            <input
              type="text"
              value={form.experience}
              onChange={(e) => setForm((f) => ({ ...f, experience: e.target.value }))}
              placeholder="e.g. 3"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Star size={16} />
              Skills *
            </label>
            <div className="flex gap-2"><input
              type="text"
              value={form.skillInput}
              onChange={(e) => setForm((f) => ({ ...f, skillInput: e.target.value }))}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); const skill = form.skillInput.trim(); if (skill && !form.skills.includes(skill)) setForm((f) => ({ ...f, skills: [...f.skills, skill], skillInput: '' })); } }}
              placeholder="Type a skill"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
            /><button type="button" onClick={() => { const skill = form.skillInput.trim(); if (skill && !form.skills.includes(skill)) setForm((f) => ({ ...f, skills: [...f.skills, skill], skillInput: '' })); }} className="px-3 bg-orange-500 text-white rounded-lg"><Plus size={18} /></button></div>
            <div className="flex flex-wrap gap-2 mt-2">{form.skills.map((skill) => <button key={skill} type="button" onClick={() => setForm((f) => ({ ...f, skills: f.skills.filter((item) => item !== skill) }))} className="px-2 py-1 rounded bg-orange-100 text-orange-700 text-xs">{skill} ×</button>)}</div>
          </div>

          <div><div className="flex justify-between items-center mb-2"><label className="block text-sm font-medium text-gray-700">Previous Employers / Events</label><button type="button" onClick={() => setForm((f) => ({ ...f, previousExperience: [...f.previousExperience, { employerName: '', role: '', duration: '' }] }))} className="text-sm text-orange-600">Add Another</button></div>{form.previousExperience.map((entry, index) => <div key={index} className="grid grid-cols-3 gap-2 mb-2"><input value={entry.employerName} onChange={(e) => setForm((f) => ({ ...f, previousExperience: f.previousExperience.map((item, i) => i === index ? { ...item, employerName: e.target.value } : item) }))} placeholder="Employer" className="px-2 py-2 border rounded" /><input value={entry.role} onChange={(e) => setForm((f) => ({ ...f, previousExperience: f.previousExperience.map((item, i) => i === index ? { ...item, role: e.target.value } : item) }))} placeholder="Role" className="px-2 py-2 border rounded" /><input value={entry.duration} onChange={(e) => setForm((f) => ({ ...f, previousExperience: f.previousExperience.map((item, i) => i === index ? { ...item, duration: e.target.value } : item) }))} placeholder="Duration" className="px-2 py-2 border rounded" /></div>)}</div>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <FileText size={16} />
              Message to Caterer
            </label>
            <textarea
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              placeholder="Tell the caterer why you're a good fit..."
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-60 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || success}
              className="flex-1 px-4 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed transition font-medium"
            >
              {submitting ? 'Submitting…' : success ? 'Submitted!' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
