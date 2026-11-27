import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import { LoadingState } from '../common/States';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="nx-route-loader">
        <LoadingState label="Verifying your session…" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
