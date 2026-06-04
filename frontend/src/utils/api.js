export const BASE_URL = 'http://localhost:3000';

const request = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  const isFormData = options.body instanceof FormData;

  const res = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `HTTP ${res.status}`);
  }

  return res.json();
};

export default request;
