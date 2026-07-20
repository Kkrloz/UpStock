import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import {
  Package, ArrowRight, ArrowUpDown, BarChart3, Bell, Users, Settings,
  ChevronRight, LogIn, LayoutDashboard, Menu, X,
} from 'lucide-react';

const features = [
  { icon: Package, title: 'Produtos', desc: 'Cadastro, busca e controle de quantidade.', color: 'var(--blue-color3)' },
  { icon: ArrowUpDown, title: 'Movimentações', desc: 'Entradas e saídas com histórico completo.', color: 'var(--green-color4)' },
  { icon: BarChart3, title: 'Relatórios', desc: 'Dados do estoque organizados pra consulta.', color: 'var(--yellow-color2)' },
  { icon: Bell, title: 'Notificações', desc: 'Alerta quando o estoque de um produto está baixo.', color: 'var(--red-color4)' },
  { icon: Users, title: 'Usuários', desc: 'Admin, operador e visualizador — cada um com seu acesso.', color: 'var(--blue-color3)' },
  { icon: Settings, title: 'Configurações', desc: 'Tema escuro/claro, perfil e preferências.', color: 'var(--green-color4)' },
];

function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  return (
    <div className="landing">
      <nav className={`landing-nav ${scrolled ? 'landing-nav-scrolled' : ''}`}>
        <div className="landing-nav-inner">
          <div className="landing-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img src="/UpStock.svg" alt="UpStock" className="landing-logo-img" />
            <span className="landing-logo-text">UpStock</span>
          </div>

          <div className={`landing-nav-links ${menuOpen ? 'landing-nav-links-open' : ''}`}>
            <button onClick={() => scrollTo('features')} className="landing-nav-link">Funcionalidades</button>
            <button onClick={() => scrollTo('forwhom')} className="landing-nav-link">Pra quem é</button>
            {user ? (
              <button onClick={() => navigate('/dashboard')} className="landing-btn-primary landing-btn-sm">
                <LayoutDashboard size={16} />
                Dashboard
              </button>
            ) : (
              <button onClick={() => navigate('/login')} className="landing-btn-primary landing-btn-sm">
                <LogIn size={16} />
                Entrar
              </button>
            )}
          </div>

          <button className="landing-menu-btn" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      <section className="landing-hero">
        <div className="landing-hero-bg" />
        <div className="landing-hero-content">
          <h1 className="landing-hero-title">
            O controle do seu estoque<br />
            <span className="landing-hero-title-accent">num lugar só.</span>
          </h1>
          <p className="landing-hero-subtitle">
            Produtos, movimentações, relatórios — o essencial pro dia a dia
            do seu almoxarifado.
          </p>
          <div className="landing-hero-actions">
            {user ? (
              <button onClick={() => navigate('/dashboard')} className="landing-btn-primary landing-btn-lg">
                <LayoutDashboard size={18} />
                Ir pro Dashboard
                <ChevronRight size={16} />
              </button>
            ) : (
              <>
                <button onClick={() => navigate('/login')} className="landing-btn-primary landing-btn-lg">
                  Usar o UpStock
                  <ArrowRight size={16} />
                </button>
                <button onClick={() => scrollTo('features')} className="landing-btn-ghost landing-btn-lg">
                  Ver como funciona
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      <section id="features" className="landing-section">
        <div className="landing-section-inner">
          <div className="landing-section-header">
            <span className="landing-section-tag">O que tem no sistema</span>
            <h2 className="landing-section-title">Seis módulos direto ao ponto</h2>
            <p className="landing-section-desc">
              Cada tela resolve um problema real de quem gerencia estoque todo dia.
            </p>
          </div>
          <div className="landing-features-grid">
            {features.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <div key={i} className="landing-feat-card">
                  <div className="landing-feat-icon" style={{ background: `${feat.color}18`, color: feat.color }}>
                    <Icon size={22} />
                  </div>
                  <h3 className="landing-feat-title">{feat.title}</h3>
                  <p className="landing-feat-desc">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="forwhom" className="landing-section landing-section-alt">
        <div className="landing-section-inner">
          <div className="landing-section-header">
            <span className="landing-section-tag">Pra quem é</span>
            <h2 className="landing-section-title">Feito pra quem vive o estoque</h2>
            <p className="landing-section-desc">
              Não importa o tamanho — se tem produto saindo e entrando, o UpStock organiza.
            </p>
          </div>
          <div className="landing-benefits-grid">
            <div className="landing-benefit-card">
              <Users size={32} style={{ color: 'var(--blue-color3)' }} />
              <h3 className="landing-benefit-title">Donos de negócio</h3>
              <p className="landing-benefit-desc">
                Visão clara do que tem no estoque sem precisar planilha.
              </p>
            </div>
            <div className="landing-benefit-card">
              <Package size={32} style={{ color: 'var(--green-color4)' }} />
              <h3 className="landing-benefit-title">Almoxarifes</h3>
              <p className="landing-benefit-desc">
                Registro rápido de entrada e saída direto do celular ou desktop.
              </p>
            </div>
            <div className="landing-benefit-card">
              <BarChart3 size={32} style={{ color: 'var(--yellow-color2)' }} />
              <h3 className="landing-benefit-title">Administradores</h3>
              <p className="landing-benefit-desc">
                Controle de usuários, permissões e relatórios completos.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="cta" className="landing-section">
        <div className="landing-section-inner">
          <div className="landing-cta-card">
            <h2 className="landing-cta-title">Vamos nessa.</h2>
            <p className="landing-cta-desc">
              Cria sua conta e começa a usar o UpStock agora.
            </p>
            <button onClick={() => navigate('/login')} className="landing-btn-primary landing-btn-lg">
              {user ? 'Acessar o Sistema' : 'Criar Conta'}
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-footer-brand">
            <img src="/UpStock.svg" alt="UpStock" className="landing-footer-logo" />
            <span className="landing-footer-name">UpStock</span>
          </div>
          <p className="landing-footer-copy">© {new Date().getFullYear()} UpStock. Todos os direitos reservados.</p>
          <p className="landing-footer-dev">Desenvolvido por <strong>CL System&apos;s</strong></p>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
