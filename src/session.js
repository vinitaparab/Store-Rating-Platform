// Idle timeout. The server token (server/src/routes/auth.js) lives 1 minute longer to cover the refresh throttle.
export const SESSION_MS = 5 * 60 * 1000;

export function getExpiry() {
  return Number(localStorage.getItem('expiresAt')) || 0;
}

// Pushes the idle deadline forward; shared across tabs through localStorage.
export function touchSession() {
  localStorage.setItem('expiresAt', String(Date.now() + SESSION_MS));
}

export function clearSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('expiresAt');
}
