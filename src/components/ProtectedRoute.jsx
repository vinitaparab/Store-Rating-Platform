import { Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';

export const HOME = { ADMIN: '/admin', USER: '/stores', OWNER: '/owner' };

export default function ProtectedRoute({ roles, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={HOME[user.role]} replace />;
  return children;
}
