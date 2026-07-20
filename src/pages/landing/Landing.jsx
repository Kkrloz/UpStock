import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import {
  Package, ArrowRight, ArrowUpDown, BarChart3, Bell, Users, Settings,
  ChevronRight, LogIn, LayoutDashboard, Menu, X,
} from 'lucide-react';

const features = [
  { icon: Package, title: 'Produtos', desc: 'Catálogo completo com busca, filtros e controle de quantidade.', color: 'var(--blue-color3)' },
  { icon: ArrowUpDown, title: 'Movimentações', desc: 'Registre entradas e saídas com detalhes de operador e data.', color: 'var(--green-color4)' },
  { icon: BarChart3, title: 'Relatórios', desc: 'Insights detalhados e exportação de dados do seu estoque.', color: 'var(--yellow-color2)' },
  { icon: Bell, title: 'Notificações', desc: 'Alertas inteligentes de estoque baixo e movimentações críticas.', color: 'var(--red-color4)' },
  { icon: Users, title: 'Usuários', desc: 'Controle de acesso por perfil — admin, operador e visualizador.', color: 'var(--blue-color3)' },
  { icon: Settings, title: 'Configurações', desc: 'Personalize temas, perfil e preferências do sistema.', color: 'var(--green-color4)' },
];

const benefits = [
  { title: 'Simplicidade', desc: 'Interface moderna e intuitiva — sua equipe opera sem curva de aprendizado.' },
  { title: 'Confiabilidade', desc: 'Dados sincronizados em tempo real com dashboard sempre atualizado.' },
  { title: 'Escalabilidade', desc: 'Do pequeno comércio à grande indústria — o UpStock cresce com você.' },
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
      {/* Navbar */}
      <nav className={`landing-nav ${scrolled ? 'landing-nav-scrolled' : ''}`}>
        <div className="landing-nav-inner">
          <div className="landing-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img src="/UpStock.svg" alt="UpStock" className="landing-logo-img" />
            <span className="landing-logo-text">UpStock</span>
          </div>

          <div className={`landing-nav-links ${menuOpen ? 'landing-nav-links-open' : ''}`}>
            <button onClick={() => scrollTo('features')} className="landing-nav-link">Funcionalidades</button>
            <button onClick={() => scrollTo('benefits')} className="landing-nav-link">Por que UpStock?</button>
            <button onClick={() => scrollTo('cta')} className="landing-nav-link">Contato</button>
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

      {/* Hero */}
      <section className="landing-hero">
        <div className="landing-hero-bg" />
        <div className="landing-hero-content">
          <div className="landing-hero-badge">Sistema de Gestão de Estoque</div>
          <h1 className="landing-hero-title">
            Gerencie seu estoque<br />
            <span className="landing-hero-title-accent">com inteligência</span>
          </h1>
          <p className="landing-hero-subtitle">
            Controle de produtos, movimentações, relatórios e muito mais
            em uma plataforma moderna e intuitiva.
          </p>
          <div className="landing-hero-actions">
            {user ? (
              <button onClick={() => navigate('/dashboard')} className="landing-btn-primary landing-btn-lg">
                <LayoutDashboard size={18} />
                Ir para o Dashboard
                <ChevronRight size={16} />
              </button>
            ) : (
              <>
                <button onClick={() => navigate('/login')} className="landing-btn-primary landing-btn-lg">
                  Começar Agora
                  <ArrowRight size={16} />
                </button>
                <button onClick={() => scrollTo('features')} className="landing-btn-ghost landing-btn-lg">
                  Saiba Mais
                </button>
              </>
            )}
          </div>

          {/* Mockup cards */}
          <div className="landing-mockup">
            <div className="landing-mockup-card landing-mockup-card-1">
              <div className="landing-mockup-dot" style={{ background: 'var(--green-color4)' }} />
              <div className="landing-mockup-dot" style={{ background: 'var(--blue-color3)' }} />
              <div className="landing-mockup-dot" style={{ background: 'var(--yellow-color2)' }} />
            </div>
            <div className="landing-mockup-card landing-mockup-card-2">
              <div className="landing-mockup-bar" style={{ width: '70%', background: 'var(--blue-color3)' }} />
              <div className="landing-mockup-bar" style={{ width: '45%', background: 'var(--green-color4)' }} />
              <div className="landing-mockup-bar" style={{ width: '55%', background: 'var(--yellow-color2)' }} />
              <div className="landing-mockup-bar" style={{ width: '30%', background: 'var(--red-color4)' }} />
            </div>
            <div className="landing-mockup-card landing-mockup-card-3">
              <div className="landing-mockup-row">
                <div className="landing-mockup-avatar" />
                <div className="landing-mockup-line" style={{ width: '60%' }} />
              </div>
              <div className="landing-mockup-row">
                <div className="landing-mockup-avatar" />
                <div className="landing-mockup-line" style={{ width: '40%' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="landing-section">
        <div className="landing-section-inner">
          <div className="landing-section-header">
            <span className="landing-section-tag">Funcionalidades</span>
            <h2 className="landing-section-title">Tudo que você precisa para gerenciar seu estoque</h2>
            <p className="landing-section-desc">
              Ferramentas completas para controle, monitoramento e otimização do seu inventário.
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

      {/* Benefits */}
      <section id="benefits" className="landing-section landing-section-alt">
        <div className="landing-section-inner">
          <div className="landing-section-header">
            <span className="landing-section-tag">Por que UpStock?</span>
            <h2 className="landing-section-title">Feito para simplificar sua operação</h2>
            <p className="landing-section-desc">
              Três pilares que fazem a diferença no dia a dia da sua gestão.
            </p>
          </div>
          <div className="landing-benefits-grid">
            {benefits.map((ben, i) => (
              <div key={i} className="landing-benefit-card">
                <div className="landing-benefit-number">0{i + 1}</div>
                <h3 className="landing-benefit-title">{ben.title}</h3>
                <p className="landing-benefit-desc">{ben.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="landing-section">
        <div className="landing-section-inner">
          <div className="landing-cta-card">
            <h2 className="landing-cta-title">Pronto para transformar sua gestão de estoque?</h2>
            <p className="landing-cta-desc">
              Comece agora e descubra como o UpStock pode ajudar seu negócio a crescer.
            </p>
            <button onClick={() => navigate('/login')} className="landing-btn-primary landing-btn-lg">
              {user ? 'Acessar o Sistema' : 'Começar Agora — é Grátis'}
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
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
