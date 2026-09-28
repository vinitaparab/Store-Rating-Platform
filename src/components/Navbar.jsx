import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';

function getInitials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!user) setOpen(false);
  }, [user]);

  // Close the menu on outside click or Escape.
  useEffect(() => {
    if (!open) return undefined;
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    const handleKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  const goToPassword = () => {
    setOpen(false);
    navigate('/password');
  };

  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate('/auth/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="brand">
        <span className="brand-logo" aria-hidden="true">★</span>
        Store Rating Platform
      </Link>
      {user && (
        <div className="user-menu" ref={menuRef}>
          <button
            type="button"
            className="avatar"
            onClick={() => setOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={open}
            title={user.name}
          >
            {getInitials(user.name)}
          </button>
          {open && (
            <div className="dropdown" role="menu">
              <div className="dropdown-header">
                <strong>{user.name}</strong>
                <span>{user.email}</span>
              </div>
              <button type="button" role="menuitem" onClick={goToPassword}>Change Password</button>
              <button type="button" role="menuitem" className="danger" onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
