import { createContext, useContext, useState } from 'react';

const AUTH_KEY = 'caternet_auth';

const AuthContext = createContext(null);

// Runs synchronously during initial render — no useEffect needed
function parseStoredAuth() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return { user: null, token: null };
    const parsed = JSON.parse(raw);
    if (!parsed?.token || !parsed?.user) return { user: null, token: null };
    // Normalize role to lowercase
    return {
      token: parsed.token,
      user: {
        ...parsed.user,
        role: String(parsed.user.role || '').toLowerCase().trim(),
      },
    };
  } catch {
    localStorage.removeItem(AUTH_KEY);
    return { user: null, token: null };
  }
}

export function AuthProvider({ children }) {
  // useState lazy initializer runs synchronously on first render.
  // This means auth is populated from localStorage BEFORE any guard/route
  // renders, so there is no flash-to-login on page refresh.
  const [auth, setAuth] = useState(parseStoredAuth);

  const login = (data) => {
    const normalized = {
      token: data.token,
      user: {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: String(data.user.role || '').toLowerCase().trim(),
      },
    };
    setAuth(normalized);
    localStorage.setItem(AUTH_KEY, JSON.stringify(normalized));
  };

  const logout = () => {
    setAuth({ user: null, token: null });
    localStorage.removeItem(AUTH_KEY);
  };

  const user = auth.user;
  const token = auth.token;
  const isAuthenticated = !!user && !!token;
  const canBook = ['user', 'customer'].includes(user?.role);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated, canBook }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
