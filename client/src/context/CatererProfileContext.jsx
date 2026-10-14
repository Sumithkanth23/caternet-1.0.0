import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { apiFetch } from '../lib/api';

export const CATERER_PROFILE_KEY_PREFIX = 'caternet_caterer_profile';

const CatererProfileContext = createContext(null);

export function CatererProfileProvider({ children }) {
  const { user } = useAuth();
  const [profile, setProfileState] = useState(null);
  // Start as true so CatererGuard waits for the DB check before making any
  // routing decision – this prevents stale-cache from masking a deleted profile.
  const [loading, setLoading] = useState(true);

  // Key by stable userId (MongoDB ObjectId) to prevent duplicate profiles on re-login
  const storageKey = user?.role === 'caterer' && user?.id
    ? `${CATERER_PROFILE_KEY_PREFIX}_${user.id}`
    : null;

  useEffect(() => {
    if (!storageKey || user?.role !== 'caterer') {
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
    apiFetch(`/api/caterer/profile/by-user/${user.id}`)
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
        // so CatererGuard redirects to /caterer/create-profile
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
    <CatererProfileContext.Provider value={{ profile, setProfile, hasProfile, loading }}>
      {children}
    </CatererProfileContext.Provider>
  );
}

export function useCatererProfile() {
  const ctx = useContext(CatererProfileContext);
  if (!ctx) throw new Error('useCatererProfile must be used inside CatererProfileProvider');
  return ctx;
}
