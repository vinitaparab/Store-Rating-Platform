const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_RE = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

export function validateName(value) {
  const v = value.trim();
  return v.length < 20 || v.length > 60 ? 'Name must be 20-60 characters.' : '';
}

export function validateEmail(value) {
  return EMAIL_RE.test(value.trim()) ? '' : 'Enter a valid email address.';
}

export function validateAddress(value) {
  const v = value.trim();
  if (v.length === 0) return 'Address is required.';
  return v.length > 400 ? 'Address must be at most 400 characters.' : '';
}

export function validatePassword(value) {
  return PASSWORD_RE.test(value)
    ? ''
    : 'Password must be 8-16 characters with one uppercase letter and one special character.';
}

export function firstError(errors) {
  return Object.values(errors).find(Boolean) || '';
}
