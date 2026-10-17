import { useState } from 'react';
import { Calendar, Plus, X, CheckCircle } from 'lucide-react';
import { TAMIL_NADU_DISTRICTS, JOB_TYPES, PAYMENT_FREQUENCY } from '../../data/catererData';
import { useCatererProfile } from '../../context/CatererProfileContext';
import { apiFetch } from '../../lib/api';

export default function PostJob() {
  const { profile } = useCatererProfile();
  const [form, setForm] = useState({
    jobTitle: '',
    jobDescription: '',
    location: 'Chennai',
    jobType: 'Full Time',
    startingDate: '',
    endingDate: '',
    salaryFrequency: 'Per Month',
    salaryAmount: '',
    minExperience: '1',
    skills: [],
    workHoursFrom: '', workHoursTo: '', supervisorName: '',
  });
  const [skillInput, setSkillInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !form.skills.includes(s)) {
      setForm((f) => ({ ...f, skills: [...f.skills, s] }));
      setSkillInput('');
    }
  };

  const removeSkill = (skill) => {
    setForm((f) => ({ ...f, skills: f.skills.filter((x) => x !== skill) }));
  };

  const handleSubmit = async () => {
    setError('');
    if (!form.jobTitle.trim()) { setError('Job title is required.'); return; }
    if (!form.jobDescription.trim()) { setError('Job description is required.'); return; }
    if (!form.startingDate) { setError('Starting date is required.'); return; }
    if (!form.workHoursFrom || !form.workHoursTo || form.workHoursTo <= form.workHoursFrom) { setError('Work end time must be after work start time.'); return; }
    if (!form.supervisorName.trim()) { setError('Supervisor name is required.'); return; }
    if (!profile?._id) { setError('Caterer profile not found. Please create your profile first.'); return; }

    setSubmitting(true);
    try {
      await apiFetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          catererId: profile._id,
          title: form.jobTitle,
          description: form.jobDescription,
          location: form.location,
          jobType: form.jobType,
          startDate: form.startingDate,
          endDate: form.endingDate || undefined,
          salaryAmount: form.salaryAmount ? Number(form.salaryAmount) : undefined,
          salaryPeriod: form.salaryFrequency,
          minExperience: form.minExperience,
          skills: form.skills,
          workHoursFrom: form.workHoursFrom, workHoursTo: form.workHoursTo, supervisorName: form.supervisorName.trim(),
        }),
      });
      setSuccess(true);
      setForm({
        jobTitle: '', jobDescription: '', location: 'Chennai', jobType: 'Full Time',
        startingDate: '', endingDate: '', salaryFrequency: 'Per Month',
        salaryAmount: '', minExperience: '1', skills: [], workHoursFrom: '', workHoursTo: '', supervisorName: '',
      });
    } catch (err) {
      setError(err?.message || 'Failed to post job. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">Post Job Opening</h1>

      {success && (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl text-green-800">
          <CheckCircle size={20} className="shrink-0" />
          <span>Job posted successfully! Employees can now see it in Job Openings.</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
        <h2 className="text-lg font-semibold text-gray-800">Job Details</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
          <input
            type="text"
            value={form.jobTitle}
            onChange={(e) => setForm((f) => ({ ...f, jobTitle: e.target.value }))}
            placeholder="e.g. Cook, Server, Delivery Driver"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Work Start Time *</label><input type="time" value={form.workHoursFrom} onChange={(e) => setForm((f) => ({ ...f, workHoursFrom: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg" required /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Work End Time *</label><input type="time" value={form.workHoursTo} onChange={(e) => setForm((f) => ({ ...f, workHoursTo: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg" required /></div>
        </div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Supervisor Name *</label><input type="text" value={form.supervisorName} onChange={(e) => setForm((f) => ({ ...f, supervisorName: e.target.value }))} placeholder="Enter supervisor's full name" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg" required /></div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Job Description *</label>
          <textarea
            value={form.jobDescription}
            onChange={(e) => setForm((f) => ({ ...f, jobDescription: e.target.value }))}
            placeholder="Provide a detailed job description including responsibilities and requirements..."
            rows={4}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
            <select
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white"
            >
              {TAMIL_NADU_DISTRICTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Type *</label>
            <select
              value={form.jobType}
              onChange={(e) => setForm((f) => ({ ...f, jobType: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white"
            >
              {JOB_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Starting Date *</label>
            <div className="relative">
              <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                value={form.startingDate}
                onChange={(e) => setForm((f) => ({ ...f, startingDate: e.target.value }))}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ending Date (Optional)</label>
            <div className="relative">
              <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                value={form.endingDate}
                onChange={(e) => setForm((f) => ({ ...f, endingDate: e.target.value }))}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Salary Offered *</label>
          <div className="flex gap-2">
            <select
              value={form.salaryFrequency}
              onChange={(e) => setForm((f) => ({ ...f, salaryFrequency: e.target.value }))}
              className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white"
            >
              {PAYMENT_FREQUENCY.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <span className="inline-flex items-center px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-600">
              ₹
            </span>
            <input
              type="text"
              value={form.salaryAmount}
              onChange={(e) => setForm((f) => ({ ...f, salaryAmount: e.target.value }))}
              placeholder="20,000"
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>
        </div>

        <h2 className="text-lg font-semibold text-gray-800 pt-4 border-t border-gray-200">Requirements</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Experience</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              value={form.minExperience}
              onChange={(e) => setForm((f) => ({ ...f, minExperience: e.target.value }))}
              className="w-20 px-3 py-2.5 border border-gray-300 rounded-lg"
            />
            <span className="text-gray-600">Years Experience Required</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Required Skills *</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {form.skills.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-orange-100 text-orange-800 text-sm font-medium"
              >
                {s}
                <button type="button" onClick={() => removeSkill(s)} className="hover:text-orange-600" aria-label={`Remove ${s}`}>
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              placeholder="Add a skill..."
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
            />
            <button
              type="button"
              onClick={addSkill}
              className="px-4 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium"
            >
              <Plus size={20} />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">Example: Cook, Server, Customer Service...</p>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => setForm({ jobTitle: '', jobDescription: '', location: 'Chennai', jobType: 'Full Time', startingDate: '', endingDate: '', salaryFrequency: 'Per Month', salaryAmount: '', minExperience: '1', skills: [], workHoursFrom: '', workHoursTo: '', supervisorName: '' })}
            disabled={submitting}
            className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {submitting ? 'Posting...' : 'Post Job'}
          </button>
        </div>
      </div>
    </div>
  );
}
