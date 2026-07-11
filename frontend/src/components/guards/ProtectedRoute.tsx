import { Navigate } from 'react-router-dom';
import { tokenManager } from '../../utils/token';

interface Props {
  children: React.ReactNode;
  requiredRole?: 'donator' | 'organizer' | 'admin';
}

export default function ProtectedRoute({ children, requiredRole }: Props) {
  if (!tokenManager.isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }
  if (requiredRole) {
    const role = tokenManager.getUserRole()?.toLowerCase();
    if (role !== requiredRole) {
      if (requiredRole === 'admin') return <Navigate to="/admin/login" replace />;
      const fallback = role === 'organizer' ? '/dashboard' : '/home';
      return <Navigate to={fallback} replace />;
    }
  }
  return <>{children}</>;
}
