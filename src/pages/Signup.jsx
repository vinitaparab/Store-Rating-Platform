import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { firstError, validateAddress, validateEmail, validateName, validatePassword } from '../utils/validation.js';

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', address: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const message = firstError({
      name: validateName(form.name),
      email: validateEmail(form.email),
      address: validateAddress(form.address),
      password: validatePassword(form.password),
    });
    if (message) {
      setError(message);
      return;
    }
    setError('');
    setLoading(true);
    try {
      await api('/auth/signup', { method: 'POST', body: form });
      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card narrow">
      <h2>Sign Up</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <label>Name (20-60 characters)
          <input name="name" value={form.name} onChange={handleChange} />
        </label>
        <label>Email
          <input type="email" name="email" value={form.email} onChange={handleChange} />
        </label>
        <label>Address (max 400 characters)
          <textarea name="address" rows="3" value={form.address} onChange={handleChange} />
        </label>
        <label>Password (8-16 chars, 1 uppercase, 1 special)
          <input type="password" name="password" value={form.password} onChange={handleChange} />
        </label>
        <button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Sign Up'}</button>
      </form>
      <p>Already registered? <Link to="/login">Login</Link></p>
    </div>
  );
}
