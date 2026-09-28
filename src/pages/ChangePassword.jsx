import { useState } from 'react';
import { api } from '../api.js';
import { validatePassword } from '../utils/validation.js';

export default function ChangePassword() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    const message = validatePassword(form.newPassword);
    if (message) {
      setError(message);
      return;
    }
    setError('');
    try {
      const data = await api('/auth/password', { method: 'PUT', body: form });
      setSuccess(data.message);
      setForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="card narrow">
      <h2>Change Password</h2>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
      <form onSubmit={handleSubmit}>
        <label>Current Password
          <input type="password" name="currentPassword" value={form.currentPassword} onChange={handleChange} required />
        </label>
        <label>New Password (8-16 chars, 1 uppercase, 1 special)
          <input type="password" name="newPassword" value={form.newPassword} onChange={handleChange} required />
        </label>
        <button type="submit">Update Password</button>
      </form>
    </div>
  );
}
