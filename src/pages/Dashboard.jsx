import { useAuth } from '../AuthContext.jsx';
import AdminDashboard from './AdminDashboard.jsx';
import OwnerDashboard from './OwnerDashboard.jsx';
import UserStores from './UserStores.jsx';

// The dashboard is chosen from the logged-in user's role, never from the URL.
const DASHBOARDS = { ADMIN: AdminDashboard, USER: UserStores, OWNER: OwnerDashboard };

export default function Dashboard() {
  const { user } = useAuth();
  const Component = DASHBOARDS[user.role];
  if (!Component) return <p className="error">Your account role is not supported.</p>;
  return <Component />;
}
