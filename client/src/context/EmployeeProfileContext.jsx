import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { apiFetch } from '../lib/api';

export const EMPLOYEE_PROFILE_KEY_PREFIX = 'caternet_employee_profile';

const EmployeeProfileContext = createContext(null);

export function EmployeeProfileProvider({ children }) {
  const { user } = useAuth();
  const [profile, setProfileState] = useState(null);
  // Start as true so EmployeeGuard waits for the DB check before making any
  // routing decision – this prevents stale-cache from masking a deleted profile.
  const [loading, setLoading] = useState(true);

  // Key by stable userId (MongoDB ObjectId) to prevent duplicates on re-login
  const storageKey = user?.role === 'employee' && user?.id
    ? `${EMPLOYEE_PROFILE_KEY_PREFIX}_${user.id}`
    : null;

  useEffect(() => {
    if (!storageKey || user?.role !== 'employee') {
      setProfileState(null);
      setLoading(false);
      return;
    }

    // Always verify against the database on every mount.
    // localStorage is used only as a warm-start hint – it is never trusted as
    // the source of truth.  If the profile was deleted from MongoDB the API
    // will return 404, the cache is cleared, and the Guard redirects the user
    // to the create-profile page automatically.
    setLoading(true);
    apiFetch(`/api/employee/profile/by-user/${user.id}`)
      .then((data) => {
        if (data && data._id) {
          setProfileState(data);
          localStorage.setItem(storageKey, JSON.stringify(data));
        } else {
          // Unexpected empty response – treat same as not-found
          setProfileState(null);
          localStorage.removeItem(storageKey);
        }
      })
      .catch(() => {
        // 404 → profile does not exist (or was deleted) → clear stale cache
        // so EmployeeGuard redirects to /employee/create-profile
        setProfileState(null);
        localStorage.removeItem(storageKey);
      })
      .finally(() => setLoading(false));
  }, [storageKey, user?.id, user?.role]);

  const setProfile = (data) => {
    if (!storageKey) return;
    setProfileState(data);
    if (data) {
      localStorage.setItem(storageKey, JSON.stringify(data));
    } else {
      localStorage.removeItem(storageKey);
    }
  };

  const hasProfile = !!profile;

  return (
    <EmployeeProfileContext.Provider value={{ profile, setProfile, hasProfile, loading }}>
      {children}
    </EmployeeProfileContext.Provider>
  );
}

export function useEmployeeProfile() {
  const ctx = useContext(EmployeeProfileContext);
  if (!ctx) throw new Error('useEmployeeProfile must be used inside EmployeeProfileProvider');
  return ctx;
}
