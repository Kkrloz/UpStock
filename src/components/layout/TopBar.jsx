import { useState, useRef, useEffect } from 'react';
import { LogOut, Settings, ChevronDown, Shield, UserCircle, Sun, Moon, Menu } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router';
import { useTheme } from '../../contexts/ThemeContext';
import { getInitials, getAvatarColor } from '../../utils/avatar';

function TopBar({ onMenuToggle }) {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const { resolvedTheme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try { await logout(); navigate('/login'); }
    finally { setIsLoggingOut(false); setDropdownOpen(false); }
  };

  const initials = getInitials(user?.name);
  const avatarBg = getAvatarColor(user?.name || '');

  return (
    <header className="topbar-header">
      <button onClick={onMenuToggle} className="p-2 rounded-xl text-(--text-secondary-color) hover:text-(--text-primary-color) hover:bg-(--bg-card-hover-color) transition-all cursor-pointer md:hidden shrink-0" aria-label="Abrir menu">
        <Menu size={20} />
      </button>

      <div className="flex items-center gap-1">
        <button onClick={toggleTheme} className="p-2 rounded-xl text-(--text-secondary-color) hover:text-(--text-primary-color) hover:bg-(--bg-card-hover-color) transition-all cursor-pointer" title={resolvedTheme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}>
          {resolvedTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <div className="topbar-profile-wrapper" ref={dropdownRef}>
          <button id="topbar-profile-btn" className="topbar-profile-btn" onClick={() => setDropdownOpen((prev) => !prev)} aria-expanded={dropdownOpen} aria-haspopup="true">
            <div className="topbar-avatar" style={{ backgroundColor: avatarBg }}>
              <span className="topbar-avatar-initials">{initials}</span>
            </div>
            <div className="topbar-user-info">
              <span className="topbar-user-name">{user?.name || 'Usuário'}</span>
              <span className={`topbar-role-badge ${isAdmin ? 'topbar-role-admin' : 'topbar-role-user'}`}>
                {isAdmin ? <><Shield size={10} /> Admin</> : <><UserCircle size={10} /> Usuário</>}
              </span>
            </div>
            <ChevronDown size={16} className={`topbar-chevron ${dropdownOpen ? 'topbar-chevron-open' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="topbar-dropdown" role="menu">
              <div className="topbar-dropdown-header">
                <div className="topbar-dropdown-avatar" style={{ backgroundColor: avatarBg }}>
                  <span className="topbar-avatar-initials">{initials}</span>
                </div>
                <div>
                  <p className="topbar-dropdown-name">{user?.name}</p>
                  <p className="topbar-dropdown-email">{user?.email}</p>
                  {user?.cargo && <p className="topbar-dropdown-cargo">{user.cargo}</p>}
                </div>
              </div>
              <div className="topbar-dropdown-divider" />
              <button className="topbar-dropdown-item" onClick={() => { navigate('/configuracoes'); setDropdownOpen(false); }} role="menuitem">
                <Settings size={15} /> Configurações
              </button>
              <div className="topbar-dropdown-divider" />
              <button className="topbar-dropdown-item topbar-dropdown-item-danger" onClick={handleLogout} disabled={isLoggingOut} role="menuitem">
                {isLoggingOut ? <div className="topbar-spinner" /> : <LogOut size={15} />}
                {isLoggingOut ? 'Saindo...' : 'Sair'}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default TopBar;
