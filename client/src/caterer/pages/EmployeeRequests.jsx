import { useEffect, useMemo, useState } from 'react';
import {
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Crown,
  UserCheck,
  UserX,
  UserMinus,
  UserPlus2,
  ShieldAlert,
  ArrowUpCircle,
  Users,
  ChevronDown,
  ChevronUp,
  Minus,
  Plus,
  Phone,
} from 'lucide-react';
import { apiFetch, toAbsoluteUrl } from '../../lib/api';
import { useCatererProfile } from '../../context/CatererProfileContext';

const STATUS_META = {
  Pending: { label: 'Pending', badge: 'bg-amber-100 text-amber-700', icon: Clock },
  Accepted: { label: 'Accepted', badge: 'bg-green-100 text-green-700', icon: Crown },
  Declined: { label: 'Declined', badge: 'bg-gray-100 text-gray-500', icon: XCircle },
  Waitlisted: { label: 'Backup offer sent', badge: 'bg-blue-100 text-blue-700', icon: Clock },
  WaitlistAccepted: { label: 'Confirmed backup', badge: 'bg-teal-100 text-teal-700', icon: UserCheck },
  WaitlistDeclined: { label: 'Declined backup', badge: 'bg-gray-100 text-gray-500', icon: UserX },
  'No-Show': { label: 'No-show', badge: 'bg-red-100 text-red-700', icon: ShieldAlert },
};

const APPLICATION_STATUSES = ['Pending', 'Accepted', 'Declined', 'No-Show'];
const WAITLIST_STATUSES = ['Waitlisted', 'WaitlistAccepted', 'WaitlistDeclined'];

const TABS = [
  { key: 'applications', label: 'Applications' },
  { key: 'waitlist', label: 'Waitlist' },
];

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || { label: status, badge: 'bg-gray-100 text-gray-600', icon: Clock };
  const Icon = meta.icon;
  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${meta.badge}`}>
      <Icon size={12} />
      {meta.label}
    </span>
  );
}

function Avatar({ info, size = 40 }) {
  const dim = `${size}px`;
  if (info.profileImageUrl) {
    return (
      <img
        src={toAbsoluteUrl(info.profileImageUrl)}
        alt={info.fullName}
        style={{ width: dim, height: dim }}
        className="shrink-0 rounded-full border border-gray-200 object-cover"
      />
    );
  }
  return (
    <div
      style={{ width: dim, height: dim }}
      className="flex shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-semibold text-orange-600"
    >
      {(info.fullName || '?').charAt(0).toUpperCase()}
    </div>
  );
}

/** A single applicant row inside a job's card — adapts its action buttons to the current status. */
function ApplicantRow({ req, busy, jobFull, onAccept, onDecline, onWaitlist, onNoShow, onPromote }) {
  const info = req.applicantInfo || {};
  const canPromote = req.status === 'WaitlistAccepted' && req.canPromote;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar info={info} />
        <div className="min-w-0">
          <p className="truncate font-medium text-gray-800">{info.fullName || 'Applicant'}</p>
          <p className="truncate text-xs text-gray-500">
            {info.role || 'Role not specified'}
            {info.district ? ` · ${info.district}` : ''}
            {info.experience ? ` · ${info.experience}` : ''}
          </p>
          {info.phone && (
            <a
              href={`tel:${info.phone}`}
              onClick={(e) => e.stopPropagation()}
              className="mt-0.5 inline-flex items-center gap-1 text-xs text-gray-600 hover:text-orange-600"
            >
              <Phone size={11} /> {info.phone}
            </a>
          )}
          {req.status === 'Waitlisted' && typeof req.waitlistPosition === 'number' && (
            <p className="mt-0.5 text-xs text-blue-600">Backup #{req.waitlistPosition} in line · awaiting their response</p>
          )}
          {req.status === 'WaitlistAccepted' && (
            <p className="mt-0.5 text-xs text-teal-600">Ready to step in if needed</p>
          )}
          {req.status === 'WaitlistDeclined' && (
            <p className="mt-0.5 text-xs text-gray-400">Not available to be a backup for this job</p>
          )}
          {req.status === 'No-Show' && (
            <p className="mt-0.5 text-xs text-red-500">Didn't show up for the event</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <StatusBadge status={req.status} />

        {req.status === 'Pending' && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={busy || jobFull}
              onClick={() => onAccept(req)}
              title={jobFull ? 'All positions for this job are already filled' : 'Accept this applicant'}
              className="flex items-center gap-1 rounded-lg bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700 transition hover:bg-green-100 disabled:opacity-50"
            >
              <CheckCircle size={15} /> Accept
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => onDecline(req)}
              className="flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:opacity-50"
            >
              <XCircle size={15} /> Decline
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => onWaitlist(req)}
              title="Offer this applicant a backup spot on the waitlist"
              className="flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 transition hover:bg-blue-100 disabled:opacity-50"
            >
              <UserPlus2 size={15} /> Waitlist
            </button>
          </div>
        )}

        {req.status === 'Accepted' && (
          <button
            type="button"
            disabled={busy}
            onClick={() => onNoShow(req)}
            title="Mark this worker as a no-show or cancellation so you can call in a backup"
            className="flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:opacity-50"
          >
            <UserMinus size={15} /> Mark no-show
          </button>
        )}

        {canPromote && (
          <button
            type="button"
            disabled={busy}
            onClick={() => onPromote(req)}
            title="Promote this confirmed backup to the active worker for this job"
            className="flex items-center gap-1 rounded-lg bg-orange-500 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-orange-600 disabled:opacity-50"
          >
            <ArrowUpCircle size={15} /> Promote to primary
          </button>
        )}
      </div>
    </div>
  );
}

/** Inline +/- control for how many workers a job needs. */
function RequiredWorkersStepper({ value, min, max = 50, busy, onChange }) {
  return (
    <div className="flex flex-col items-center gap-1" onClick={(e) => e.stopPropagation()}>
      <span className="text-[11px] font-medium text-gray-400">Required workers</span>
      <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-1 py-1">
        <button
          type="button"
          disabled={busy || value <= min}
          onClick={() => onChange(value - 1)}
          title={value <= min ? "Can't go below the number already accepted" : 'Decrease'}
          className="flex h-6 w-6 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <Minus size={14} />
        </button>
        <span className="w-6 text-center text-sm font-semibold text-gray-800">{value}</span>
        <button
          type="button"
          disabled={busy || value >= max}
          onClick={() => onChange(value + 1)}
          title="Increase"
          className="flex h-6 w-6 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

/**
 * One job post with the applicant rows relevant to the active tab.
 * `allRequests` (every applicant for this job, regardless of tab) is kept
 * around so promote-eligibility can be worked out correctly even though
 * only `rows` gets rendered.
 */
function JobGroupCard({ job, rows, allRequests, tab, busyId, onAccept, onDecline, onWaitlist, onNoShow, onPromote, onChangePositions }) {
  const [expanded, setExpanded] = useState(true);

  const positionsNeeded = job.positionsNeeded || 1;
  const acceptedCount = allRequests.filter((r) => r.status === 'Accepted').length;
  const openSlots = positionsNeeded - acceptedCount;
  const jobFull = openSlots <= 0;
  const confirmedBackupCount = allRequests.filter((r) => r.status === 'WaitlistAccepted').length;
  // Urgent only once a seat has opened back up after being filled (a no-show
  // with nobody currently covering it) — not simply "hasn't been fully
  // staffed yet" while applications are still being reviewed.
  const needsReplacement = openSlots > 0 && allRequests.some((r) => r.status === 'No-Show');

  const rowsWithPromoteFlag = rows.map((r) => ({ ...r, canPromote: r.status === 'WaitlistAccepted' && openSlots > 0 }));

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      <div
        role="button"
        tabIndex={0}
        onClick={() => setExpanded((v) => !v)}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setExpanded((v) => !v)}
        className="flex w-full cursor-pointer flex-wrap items-center justify-between gap-3 px-4 py-3.5 text-left select-none"
      >
        <div>
          <h3 className="font-semibold text-gray-800">{job.title}</h3>
          <p className="text-xs text-gray-500">
            {job.location ? `${job.location} · ` : ''}
            {job.jobType}
            {job.startDate ? ` · From ${new Date(job.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <RequiredWorkersStepper
            value={positionsNeeded}
            min={Math.max(1, acceptedCount)}
            busy={busyId === `job:${job._id}`}
            onChange={(next) => onChangePositions(job, next)}
          />
          {needsReplacement && (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
              <ShieldAlert size={13} /> Needs a replacement
            </span>
          )}
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
              jobFull ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
            }`}
          >
            <Crown size={13} /> Filled {acceptedCount}/{positionsNeeded}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
            <Users size={13} /> {rows.length} {tab === 'waitlist' ? 'on waitlist' : 'applicant'}{rows.length !== 1 ? 's' : ''}
          </span>
          {tab === 'applications' && confirmedBackupCount > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-teal-100 px-2.5 py-1 text-xs font-medium text-teal-700">
              <UserCheck size={13} /> {confirmedBackupCount} backup{confirmedBackupCount !== 1 ? 's' : ''} ready
            </span>
          )}
          {expanded ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
        </div>
      </div>

      {expanded && (
        <div className="divide-y divide-gray-100 border-t border-gray-100 px-4">
          {rowsWithPromoteFlag.map((r) => (
            <ApplicantRow
              key={r._id}
              req={r}
              busy={busyId === r._id}
              jobFull={jobFull}
              onAccept={onAccept}
              onDecline={onDecline}
              onWaitlist={onWaitlist}
              onNoShow={onNoShow}
              onPromote={onPromote}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function EmployeeRequests() {
  const { profile } = useCatererProfile();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('applications');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [busyId, setBusyId] = useState(null);

  const load = () => {
    if (!profile?._id) return;
    setLoading(true);
    apiFetch(`/api/job-requests/caterer/${profile._id}`)
      .then((data) => setRequests(Array.isArray(data) ? data : []))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, [profile?._id]);

  // Switching tabs resets the status filter so a Waitlist-only value doesn't
  // silently hide everything on the Applications tab (and vice versa).
  useEffect(() => {
    setStatusFilter('All Statuses');
  }, [tab]);

  const patchLocal = (reqId, patch) => {
    setRequests((prev) => prev.map((r) => (r._id === reqId ? { ...r, ...patch } : r)));
  };

  const handleAccept = async (req) => {
    setBusyId(req._id);
    try {
      await apiFetch(`/api/job-requests/${req._id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'Accepted' }),
      });
      // Accepting cascades server-side: every other pending applicant for
      // this job becomes a waitlist offer. Re-fetch so the bench shows up.
      await load();
    } catch (err) {
      alert(err.message || 'Failed to accept applicant.');
    } finally {
      setBusyId(null);
    }
  };

  const handleDecline = async (req) => {
    setBusyId(req._id);
    try {
      const updated = await apiFetch(`/api/job-requests/${req._id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'Declined' }),
      });
      patchLocal(req._id, { status: updated.status });
    } catch (err) {
      alert(err.message || 'Failed to decline applicant.');
    } finally {
      setBusyId(null);
    }
  };

  const handleWaitlist = async (req) => {
    setBusyId(req._id);
    try {
      const updated = await apiFetch(`/api/job-requests/${req._id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'Waitlisted' }),
      });
      patchLocal(req._id, {
        status: updated.status,
        waitlistPosition: updated.waitlistPosition,
        waitlistOfferedAt: updated.waitlistOfferedAt,
      });
    } catch (err) {
      alert(err.message || 'Failed to move applicant to the waitlist.');
    } finally {
      setBusyId(null);
    }
  };

  const handleNoShow = async (req) => {
    if (!window.confirm(`Mark ${req.applicantInfo?.fullName || 'this worker'} as a no-show? You can then promote a confirmed backup.`)) return;
    setBusyId(req._id);
    try {
      const updated = await apiFetch(`/api/job-requests/${req._id}/no-show`, { method: 'PUT' });
      patchLocal(req._id, { status: updated.status });
    } catch (err) {
      alert(err.message || 'Failed to mark as no-show.');
    } finally {
      setBusyId(null);
    }
  };

  const handlePromote = async (req) => {
    if (!window.confirm(`Promote ${req.applicantInfo?.fullName || 'this backup'} to the active worker for this job?`)) return;
    setBusyId(req._id);
    try {
      const updated = await apiFetch(`/api/job-requests/${req._id}/promote`, { method: 'PUT' });
      patchLocal(req._id, { status: updated.status, promotedFromWaitlist: updated.promotedFromWaitlist });
    } catch (err) {
      alert(err.message || 'Failed to promote backup.');
    } finally {
      setBusyId(null);
    }
  };

  // Updates how many workers a job needs, right from its card. Every embedded
  // `job` snapshot in `requests` is patched in place so the "Filled X/Y"
  // badge and Accept-button availability react immediately.
  const handleChangePositions = async (job, nextValue) => {
    const safeValue = Math.max(1, nextValue);
    const busyKey = `job:${job._id}`;
    const previous = job.positionsNeeded || 1;

    setBusyId(busyKey);
    setRequests((prev) =>
      prev.map((r) => (r.job?._id === job._id ? { ...r, job: { ...r.job, positionsNeeded: safeValue } } : r))
    );

    try {
      await apiFetch(`/api/jobs/${job._id}`, {
        method: 'PUT',
        body: JSON.stringify({ positionsNeeded: safeValue }),
      });
    } catch (err) {
      // Roll back the optimistic update if the server rejected it.
      setRequests((prev) =>
        prev.map((r) => (r.job?._id === job._id ? { ...r, job: { ...r.job, positionsNeeded: previous } } : r))
      );
      alert(err.message || 'Failed to update the number of workers needed.');
    } finally {
      setBusyId(null);
    }
  };

  const searched = useMemo(
    () =>
      requests.filter((r) => {
        const info = r.applicantInfo || {};
        const name = info.fullName || '';
        const jobTitle = r.job?.title || '';
        const matchSearch =
          !search ||
          name.toLowerCase().includes(search.toLowerCase()) ||
          jobTitle.toLowerCase().includes(search.toLowerCase());
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const isPastAccepted = r.status === 'Accepted' && r.job?.startDate && new Date(r.job.startDate) < today;
        return matchSearch && !isPastAccepted;
      }),
    [requests, search]
  );

  const tabStatuses = tab === 'waitlist' ? WAITLIST_STATUSES : APPLICATION_STATUSES;

  const applicationsCount = useMemo(
    () => searched.filter((r) => APPLICATION_STATUSES.includes(r.status)).length,
    [searched]
  );
  const waitlistCount = useMemo(
    () => searched.filter((r) => WAITLIST_STATUSES.includes(r.status)).length,
    [searched]
  );

  const groups = useMemo(() => {
    const byJob = new Map();
    searched.forEach((r) => {
      const jobId = r.job?._id || r.job || 'unknown';
      if (!byJob.has(jobId)) byJob.set(jobId, { job: r.job || { title: 'Unknown job' }, allRequests: [] });
      byJob.get(jobId).allRequests.push(r);
    });

    const result = [...byJob.values()].map(({ job, allRequests }) => {
      const rows = allRequests.filter(
        (r) => tabStatuses.includes(r.status) && (statusFilter === 'All Statuses' || r.status === statusFilter)
      );
      return { job, allRequests, rows };
    });

    // Jobs that need attention (a no-show with no replacement yet) float to the top.
    return result
      .filter(({ rows }) => rows.length > 0)
      .sort((a, b) => {
        const aUrgent = a.allRequests.some((r) => r.status === 'No-Show') && !a.allRequests.some((r) => r.status === 'Accepted');
        const bUrgent = b.allRequests.some((r) => r.status === 'No-Show') && !b.allRequests.some((r) => r.status === 'Accepted');
        return aUrgent === bUrgent ? 0 : aUrgent ? -1 : 1;
      });
  }, [searched, tabStatuses, statusFilter]);

  const visibleCount = groups.reduce((sum, g) => sum + g.rows.length, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Employee Requests</h1>
        <p className="text-gray-500">
          Accept, decline, or put an applicant on the waitlist as a backup. If a job needs more than one worker, you
          can accept multiple applicants — the rest only move to the <strong>Waitlist</strong> tab once every
          position is filled. If someone cancels or doesn't show up, promote a confirmed backup from there.
        </p>
      </div>

      <div className="flex gap-1 border-b border-gray-200">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`-mb-px flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition ${
              tab === t.key ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
            <span
              className={`inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-semibold ${
                tab === t.key ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {t.key === 'waitlist' ? waitlistCount : applicationsCount}
            </span>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search applicants or job title..."
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2.5"
        >
          <option>All Statuses</option>
          {tab === 'applications' ? (
            <>
              <option value="Pending">Pending</option>
              <option value="Accepted">Accepted</option>
              <option value="No-Show">No-show</option>
              <option value="Declined">Declined</option>
            </>
          ) : (
            <>
              <option value="Waitlisted">Backup offer sent</option>
              <option value="WaitlistAccepted">Confirmed backup</option>
              <option value="WaitlistDeclined">Declined backup</option>
            </>
          )}
        </select>
      </div>

      {loading ? (
        <div className="py-10 text-center text-gray-500">Loading requests…</div>
      ) : groups.length === 0 ? (
        <div className="rounded-xl border border-gray-100 bg-white p-10 text-center shadow-sm">
          <p className="text-gray-500">
            {tab === 'waitlist' ? 'No one is on the waitlist yet.' : 'No employee requests found.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map(({ job, rows, allRequests }) => (
            <JobGroupCard
              key={job._id || job.title}
              job={job}
              rows={rows}
              allRequests={allRequests}
              tab={tab}
              busyId={busyId}
              onAccept={handleAccept}
              onDecline={handleDecline}
              onWaitlist={handleWaitlist}
              onNoShow={handleNoShow}
              onPromote={handlePromote}
              onChangePositions={handleChangePositions}
            />
          ))}
        </div>
      )}

      {!loading && (
        <p className="text-sm text-gray-500">
          Showing {visibleCount}{' '}
          {tab === 'waitlist'
            ? `waitlist entr${visibleCount === 1 ? 'y' : 'ies'}`
            : `request${visibleCount === 1 ? '' : 's'}`}
          .
        </p>
      )}
    </div>
  );
}
