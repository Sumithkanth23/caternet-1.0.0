const API_BASE_URL =
  (import.meta.env && import.meta.env.VITE_API_BASE_URL) || 'http://localhost:5000';

export function toAbsoluteUrl(maybeRelativeUrl) {
  if (!maybeRelativeUrl) return '';
  const normalizedUrl = String(maybeRelativeUrl).replace(/\\/g, '/');
  if (normalizedUrl.startsWith('http://') || normalizedUrl.startsWith('https://')) return normalizedUrl;
  if (normalizedUrl.startsWith('/')) return `${API_BASE_URL}${normalizedUrl}`;
  return `${API_BASE_URL}/${normalizedUrl}`;
}

function getStoredToken() {
  try {
    const raw = localStorage.getItem('caternet_auth');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.token || null;
  } catch {
    return null;
  }
}

export async function apiFetch(path, options = {}) {
  const url = path.startsWith('http://') || path.startsWith('https://') ? path : `${API_BASE_URL}${path}`;

  const headers = { ...(options.headers || {}) };

  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
    delete headers['content-type'];
  } else if (typeof options.body === 'string' && !headers['Content-Type'] && !headers['content-type']) {
    headers['Content-Type'] = 'application/json';
  }

  // Attach JWT token if available and not already set
  if (!headers['Authorization'] && !headers['authorization']) {
    const token = getStoredToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const fetchOptions = { ...options, headers };

  const res = await fetch(url, fetchOptions);

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      message = data?.message || message;
    } catch {
      // ignore parse errors
    }
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) return res.json();
  return res.text();
}
