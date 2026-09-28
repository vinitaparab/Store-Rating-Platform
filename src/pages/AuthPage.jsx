import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import PasswordInput from '../components/PasswordInput.jsx';
import { firstError, validateAddress, validateEmail, validateName, validatePassword } from '../utils/validation.js';

const EMPTY_FORM = { name: '', email: '', address: '', password: '' };

const MODES = {
  login: {
    title: 'Welcome back',
    subtitle: 'Log in to continue to Store Rating Platform',
    submit: 'Login',
    loading: 'Logging in...',
    switchText: 'New user?',
    switchLink: 'Create an account',
    switchTo: '/auth/signup',
  },
  signup: {
    title: 'Create your account',
    subtitle: 'Sign up to rate the stores you visit',
    submit: 'Sign Up',
    loading: 'Creating...',
    switchText: 'Already registered?',
    switchLink: 'Login',
    switchTo: '/auth/login',
  },
};

export default function AuthPage() {
  const { mode } = useParams();
  const { login, notice } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Reset the form whenever the user switches between login and signup.
  useEffect(() => {
    setForm(EMPTY_FORM);
    setError('');
  }, [mode]);

  const config = MODES[mode];
  if (!config) return <Navigate to="/auth/login" replace />;

  const isSignup = mode === 'signup';
  const info = (location.state && location.state.notice) || (!isSignup && notice);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSignup) {
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
    }
    setError('');
    setLoading(true);
    try {
      if (isSignup) {
        await api('/auth/signup', { method: 'POST', body: form });
        navigate('/auth/login', { state: { notice: 'Account created successfully. Please log in.' } });
      } else {
        const data = await api('/auth/login', { method: 'POST', body: { email: form.email, password: form.password } });
        login(data.token, data.user);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <h2>{config.title}</h2>
      <p className="auth-subtitle">{config.subtitle}</p>
      {info && <p className="success">{info}</p>}
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        {isSignup && (
          <label>Name (20-60 characters)
            <input name="name" value={form.name} onChange={handleChange} placeholder="Enter your full name" />
          </label>
        )}
        <label>Email
          <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required={!isSignup} />
        </label>
        {isSignup && (
          <label>Address (max 400 characters)
            <textarea name="address" rows="3" value={form.address} onChange={handleChange} placeholder="Enter your address" />
          </label>
        )}
        <label>{isSignup ? 'Password (8-16 chars, 1 uppercase, 1 special)' : 'Password'}
          <PasswordInput name="password" value={form.password} onChange={handleChange} placeholder="Enter your password" required={!isSignup} />
        </label>
        <button type="submit" className="block" disabled={loading}>{loading ? config.loading : config.submit}</button>
      </form>
      <p className="auth-switch">{config.switchText} <Link to={config.switchTo}>{config.switchLink}</Link></p>
    </div>
  );
}
