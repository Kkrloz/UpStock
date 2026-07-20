import { useTranslation } from 'react-i18next';
import { LayoutGrid, Package, Truck, ChartColumnIncreasing, Bell, Settings, LogOut, Users, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import MenuButton from '../ui/MenuButton.jsx';
import TextoBar from '../ui/TextoBar.jsx';

function BarraLateral({ onClose }) {
  const location = useLocation();
  const currentPath = location.pathname;
  const navigate = useNavigate();
  const { isAdmin, logout } = useAuth();
  const { resolvedTheme } = useTheme();
  const { t } = useTranslation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  const logoSrc = resolvedTheme === 'dark' ? '/UpStock-branco.svg' : '/UpStock.svg';

  const handleNav = () => { if (onClose) onClose(); };

  return (
    <section className="flex flex-col h-full gap-4 justify-start items-start shrink-0 border-r border-(--border-color) overflow-y-auto">
      <div className="flex items-center justify-between gap-2 px-4 py-4 border-b border-(--border-color) w-full">
        <div className="flex items-center gap-2">
          <img src={logoSrc} alt="UpStock" className="w-8 h-8 sm:w-10 sm:h-10" />
          <h1 className="text-xl sm:text-2xl font-bold text-(--logo-text-color)">UpStock</h1>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg text-(--text-secondary-color) hover:text-(--text-primary-color) hover:bg-(--bg-card-hover-color) transition-colors md:hidden cursor-pointer" aria-label={t('nav.closeMenu')}>
          <X size={20} />
        </button>
      </div>

      <div className="flex flex-col gap-2 w-full px-4">
        <TextoBar>{t('nav.main')}</TextoBar>
        <div className="flex flex-col gap-1">
          <MenuButton icon={LayoutGrid} label={t('nav.overview')} to="/" active={currentPath === '/'} onClick={handleNav} />
          <MenuButton icon={Package} label={t('nav.products')} to="/produtos" active={currentPath === '/produtos'} onClick={handleNav} />
          <MenuButton icon={Truck} label={t('nav.movements')} to="/movimentacoes" active={currentPath === '/movimentacoes'} onClick={handleNav} />
          <MenuButton icon={ChartColumnIncreasing} label={t('nav.reports')} to="/relatorios" active={currentPath === '/relatorios'} onClick={handleNav} />
          <MenuButton icon={Bell} label={t('nav.notifications')} to="/notificacoes" active={currentPath === '/notificacoes'} onClick={handleNav} />
        </div>
      </div>
      <div className="flex flex-col gap-2 w-full px-4 pb-4">
        <TextoBar>{t('nav.system')}</TextoBar>
        <div className="flex flex-col gap-1">
          {isAdmin && (
            <MenuButton icon={Users} label={t('nav.users')} to="/usuarios" active={currentPath === '/usuarios'} onClick={handleNav} />
          )}
          <MenuButton icon={Settings} label={t('nav.settings')} to="/configuracoes" active={currentPath === '/configuracoes'} onClick={handleNav} />
          <button type="button" onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-(--text-secondary-color) hover:text-(--red-color4) hover:bg-(--danger-bg) transition-all cursor-pointer">
            <LogOut size={16} />
            <span>{t('nav.logout')}</span>
          </button>
        </div>
      </div>
    </section>
  );
}

export default BarraLateral;
