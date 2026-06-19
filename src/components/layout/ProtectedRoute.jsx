import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';

function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-(--bg-color) text-(--text-primary-color) flex-col gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-(--blue-color3)"></div>
        <span className="text-sm font-medium text-(--text-secondary-color)">Carregando painel...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
