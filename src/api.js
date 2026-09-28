import { clearSession } from './session.js';

export async function api(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`/api${path}`, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  let data = null;
  try {
    data = await response.json();
  } catch (err) {
    data = null;
  }

  if (!response.ok) {
    if (response.status === 401 && token) {
      clearSession();
      sessionStorage.setItem('authNotice', 'Your session has expired. Please log in again.');
      window.location.href = '/auth/login';
    }
    throw new Error((data && data.message) || 'Something went wrong.');
  }
  return data;
}

export function toQuery(obj) {
  const params = new URLSearchParams();
  Object.entries(obj).forEach(([key, value]) => {
    if (value) params.append(key, value);
  });
  return params.toString();
}

export function nextSort(current, key) {
  if (current.by === key) return { by: key, order: current.order === 'asc' ? 'desc' : 'asc' };
  return { by: key, order: 'asc' };
}
