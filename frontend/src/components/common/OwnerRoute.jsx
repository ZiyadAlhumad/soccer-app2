import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function OwnerRoute() {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'owner') return <Navigate to="/" replace />;
  return <Outlet />;
}

export default OwnerRoute;
