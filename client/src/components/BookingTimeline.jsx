import { Check, Circle } from 'lucide-react';

const steps = ['Requested', 'Confirmed', 'Event day'];

export default function BookingTimeline({ status, createdAt, eventDate, compact = false }) {
  const normalized = String(status || 'Pending').toLowerCase();
  const declined = normalized === 'declined';
  const current = normalized === 'accepted' || normalized === 'completed' ? 1 : 0;
  const dateText = (value) => value ? new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : null;

  return <div className={`grid grid-cols-3 gap-1 ${compact ? 'mt-3' : 'mt-5 border-t border-gray-100 pt-4'}`} aria-label={`Booking progress: ${status}`}>
    {steps.map((step, index) => {
      const done = index <= current && !declined;
      const isDeclined = index === 0 && declined;
      return <div key={step} className="relative flex flex-col gap-1 text-xs text-gray-500">
        {index < steps.length - 1 && <span className={`absolute left-5 right-0 top-2 h-px ${done ? 'bg-blue-500' : 'bg-gray-200'}`} />}
        <span className={`relative z-10 grid h-5 w-5 place-items-center rounded-full ${isDeclined ? 'bg-red-500 text-white' : done ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>{done ? <Check size={12} /> : <Circle size={10} />}</span>
        <span className="font-medium text-gray-700">{index === 0 && declined ? 'Declined' : step}</span>
        {!compact && <span>{index === 0 ? dateText(createdAt) : index === 2 ? dateText(eventDate) : normalized === 'accepted' ? 'Confirmed' : 'Waiting'}</span>}
      </div>;
    })}
  </div>;
}
