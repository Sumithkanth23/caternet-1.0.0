import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch, toAbsoluteUrl } from '../../lib/api';
import { TAMIL_NADU_DISTRICTS } from '../../data/employeeData';
import { useEmployeeProfile } from '../../context/EmployeeProfileContext';
import ApplyModal from '../components/ApplyModal';
import { staggerContainer, staggerItem, revealUp } from '../../lib/animations';

function JobSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 flex gap-5 relative overflow-hidden">
      <div className="w-16 h-16 rounded-lg bg-gray-200 shrink-0" />
      <div className="flex-1 space-y-3">
        <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
        <div className="h-3 w-64 bg-gray-200 rounded animate-pulse" />
        <div className="flex gap-2">
          <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse" />
          <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse" />
        </div>
      </div>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
        animate={{ x: ['-100%', '200%'] }}
        transition={{ repeat: Infinity, duration: 1.3, ease: 'linear' }}
        style={{ width: '60%' }}
      />
    </div>
  );
}

export default function JobOpenings() {
  const { profile } = useEmployeeProfile();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [district, setDistrict] = useState('All Districts');
  const [search, setSearch] = useState('');
  const [appliedIds, setAppliedIds] = useState(new Set());
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    const params = new URLSearchParams();
    if (district !== 'All Districts') params.set('district', district);
    if (search.trim()) params.set('search', search.trim());
    apiFetch(`/api/jobs?${params.toString()}`)
      .then((data) => { if (mounted) setJobs(Array.isArray(data) ? data : []); })
      .catch(() => { if (mounted) setJobs([]); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [district, search]);

  useEffect(() => {
    if (!profile?._id) return;
    apiFetch(`/api/job-requests/employee/${profile._id}`)
      .then((data) => { if (Array.isArray(data)) setAppliedIds(new Set(data.map((r) => r.job?._id || r.job))); })
      .catch(() => {});
  }, [profile?._id]);

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

  const activeJobs = jobs.filter((job) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return job.status === 'Open' && (!job.startDate || new Date(job.startDate) >= today);
  });

  return (
    <div className="space-y-6">
      <motion.h1 {...revealUp} className="text-2xl font-bold text-gray-800">
        Job Openings
      </motion.h1>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap items-center gap-3"
      >
        <select
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-orange-500 outline-none"
        >
          <option>All Districts</option>
          {TAMIL_NADU_DISTRICTS.map((d) => <option key={d}>{d}</option>)}
        </select>
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search job openings..."
            className="w-full pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
          />
          <Search size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </motion.div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="skeletons"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid gap-4"
          >
            {[1, 2, 3].map((i) => <JobSkeleton key={i} />)}
          </motion.div>
        ) : activeJobs.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center"
          >
            <p className="text-gray-500">No job openings found.</p>
          </motion.div>
        ) : (
          <motion.div
            key="jobs"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid gap-4"
          >
            {activeJobs.map((job) => (
              <motion.div
                key={job._id}
                variants={staggerItem}
                whileHover={{ y: -3, boxShadow: '0 10px 30px rgba(0,0,0,0.09)' }}
                transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex gap-5"
              >
                {/* Caterer Logo */}
                <motion.div
                  className="w-16 h-16 rounded-lg bg-orange-100 shrink-0 overflow-hidden flex items-center justify-center"
                  whileHover={{ scale: 1.08 }}
                  transition={{ duration: 0.3 }}
                >
                  {job.caterer?.logoUrl ? (
                    <img src={toAbsoluteUrl(job.caterer.logoUrl)} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl">🍽️</span>
                  )}
                </motion.div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <h3 className="font-semibold text-gray-800 text-lg">{job.title}</h3>
                      <p className="text-sm text-orange-600 font-medium mt-0.5">
                        {job.caterer?.serviceName || 'Unknown Caterer'}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      job.jobType === 'Full Time' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                    }`}>
                      {job.jobType}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 mt-2">
                    {job.location && <span>📍 {job.location}</span>}
                    {job.startDate && (
                      <span>📅 From {formatDate(job.startDate)}{job.endDate ? ` → ${formatDate(job.endDate)}` : ''}</span>
                    )}
                    {(job.salaryAmount || job.salaryPeriod) && (
                      <span>💰 {job.salaryAmount ? `₹${job.salaryAmount.toLocaleString('en-IN')}` : ''} {job.salaryPeriod || ''}</span>
                    )}
                    {job.minExperience && (
                      <span>🎓 {job.minExperience} yr{Number(job.minExperience) !== 1 ? 's' : ''} exp</span>
                    )}
                  </div>

                  {job.description && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{job.description}</p>
                  )}

                  {job.skills && job.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {job.skills.map((s) => (
                        <motion.span
                          key={s}
                          initial={{ opacity: 0, scale: 0.85 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="px-2.5 py-1 rounded-lg bg-orange-50 text-orange-700 text-xs font-medium border border-orange-100"
                        >
                          {s}
                        </motion.span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-3">
                    <p className="text-xs text-gray-400">
                      Posted {new Date(job.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                    {appliedIds.has(job._id) ? (
                      <motion.span
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="px-4 py-1.5 rounded-lg bg-green-100 text-green-700 text-sm font-medium"
                      >
                        ✓ Applied
                      </motion.span>
                    ) : (
                      <motion.button
                        type="button"
                        onClick={() => setSelectedJob(job)}
                        disabled={!profile?._id}
                        whileHover={{ scale: 1.06 }}
                        whileTap={{ scale: 0.94 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                        className="px-4 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-medium transition"
                      >
                        Apply
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {selectedJob && profile && (
        <ApplyModal
          isOpen={!!selectedJob}
          onClose={() => setSelectedJob(null)}
          job={selectedJob}
          profile={profile}
          onApplied={(jobId) => {
            setAppliedIds((prev) => new Set([...prev, jobId]));
            setSelectedJob(null);
          }}
        />
      )}
    </div>
  );
}
