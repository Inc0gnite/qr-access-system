// Componente para proteger rutas según autenticación y rol
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

interface ProtectedRouteProps {
  allowedRoles?: ('admin' | 'guardia')[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.rol)) {
    return <Navigate to={user.rol === 'admin' ? '/dashboard' : '/scanner'} replace />;
  }

  return <Outlet />;
}
