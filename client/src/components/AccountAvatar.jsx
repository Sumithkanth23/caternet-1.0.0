/**
 * The single account marker used in each application header.
 * A dependable initial is clearer than changing between profile photos, logos,
 * and emoji from route to route.
 */
export default function AccountAvatar({ name, className = 'w-8 h-8 text-sm' }) {
  const initial = (name || 'U').trim().charAt(0).toUpperCase() || 'U';

  return (
    <span
      className={`${className} shrink-0 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold`}
      aria-hidden="true"
    >
      {initial}
    </span>
  );
}
