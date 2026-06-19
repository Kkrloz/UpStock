import { LayoutGrid, Package, Truck, ChartColumnIncreasing, Bell, Settings, LogOut, Users, X } from 'lucide-react';
import { useLocation } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import MenuButton from '../ui/MenuButton.jsx';
import TextoBar from '../ui/TextoBar.jsx';

function BarraLateral({ onClose }) {
  const location = useLocation();
  const currentPath = location.pathname;
  const { isAdmin } = useAuth();
  const { resolvedTheme } = useTheme();
  const logoSrc = resolvedTheme === 'dark' ? '/UpStock-branco.svg' : '/UpStock.svg';

  const handleNav = () => {
    if (onClose) onClose();
  };

  return (
    <section className="flex flex-col h-full gap-4 justify-start items-start shrink-0 border-r border-(--border-color) overflow-y-auto">
      {/* Cabeçalho com logo + fechar no mobile */}
      <div className="flex items-center justify-between gap-2 px-4 py-4 border-b border-(--border-color) w-full">
        <div className="flex items-center gap-2">
          <img src={logoSrc} alt="UpStock" className="w-8 h-8 sm:w-10 sm:h-10" />
          <h1 className="text-xl sm:text-2xl font-bold text-(--logo-text-color)">UpStock</h1>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-(--text-secondary-color) hover:text-(--text-primary-color) hover:bg-(--bg-card-hover-color) transition-colors md:hidden cursor-pointer"
          aria-label="Fechar menu"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex flex-col gap-2 w-full px-4">
        <TextoBar>Principal</TextoBar>
        <div className="flex flex-col gap-1">
          <MenuButton icon={LayoutGrid} label="Visão geral" to="/" active={currentPath === '/'} onClick={handleNav} />
          <MenuButton icon={Package} label="Produtos" to="/produtos" active={currentPath === '/produtos'} onClick={handleNav} />
          <MenuButton icon={Truck} label="Movimentações" to="/movimentacoes" active={currentPath === '/movimentacoes'} onClick={handleNav} />
          <MenuButton icon={ChartColumnIncreasing} label="Relatórios" to="/relatorios" active={currentPath === '/relatorios'} onClick={handleNav} />
          <MenuButton icon={Bell} label="Notificações" to="/notificacoes" active={currentPath === '/notificacoes'} onClick={handleNav} />
        </div>
      </div>
      <div className="flex flex-col gap-2 w-full px-4 pb-4">
        <TextoBar>Sistema</TextoBar>
        <div className="flex flex-col gap-1">
          {isAdmin && (
            <MenuButton icon={Users} label="Usuários" to="/usuarios" active={currentPath === '/usuarios'} onClick={handleNav} />
          )}
          <MenuButton icon={Settings} label="Configurações" to="/configuracoes" active={currentPath === '/configuracoes'} onClick={handleNav} />
          <MenuButton icon={LogOut} label="Sair" to="/sair" active={currentPath === '/sair'} onClick={handleNav} />
        </div>
      </div>
    </section>
  );
}

export default BarraLateral;
