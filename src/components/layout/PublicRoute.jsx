import { useTranslation } from 'react-i18next';
import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';

function PublicRoute() {
  const { user, loading } = useAuth();
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-(--bg-color) text-(--text-primary-color) flex-col gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-(--blue-color3)"></div>
        <span className="text-sm font-medium text-(--text-secondary-color)">{t('common.loading')}</span>
      </div>
    );
  }

  if (user) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}

export default PublicRoute;
