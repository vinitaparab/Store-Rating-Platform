import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';

const ROLE_LABEL = { ADMIN: 'System Administrator', USER: 'Normal User', OWNER: 'Store Owner' };

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <strong>Store Rating Platform</strong>
      <div className="nav-right">
        <span>{user.name} ({ROLE_LABEL[user.role]})</span>
        <Link to="/password">Change Password</Link>
        <button type="button" onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}
