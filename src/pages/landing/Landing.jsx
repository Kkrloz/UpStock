import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation, Trans } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import {
  Package, ArrowRight, ArrowUpDown, BarChart3, Bell, Users, Settings,
  ChevronRight, LogIn, LayoutDashboard, Menu, X,
} from 'lucide-react';

const features = [
  { icon: Package, titleKey: 'landing.featuresProductsTitle', descKey: 'landing.featuresProductsDesc', color: 'var(--blue-color3)' },
  { icon: ArrowUpDown, titleKey: 'landing.featuresMovementsTitle', descKey: 'landing.featuresMovementsDesc', color: 'var(--green-color4)' },
  { icon: BarChart3, titleKey: 'landing.featuresReportsTitle', descKey: 'landing.featuresReportsDesc', color: 'var(--yellow-color2)' },
  { icon: Bell, titleKey: 'landing.featuresNotificationsTitle', descKey: 'landing.featuresNotificationsDesc', color: 'var(--red-color4)' },
  { icon: Users, titleKey: 'landing.featuresUsersTitle', descKey: 'landing.featuresUsersDesc', color: 'var(--blue-color3)' },
  { icon: Settings, titleKey: 'landing.featuresSettingsTitle', descKey: 'landing.featuresSettingsDesc', color: 'var(--green-color4)' },
];

function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
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
            <button onClick={() => scrollTo('features')} className="landing-nav-link">{t('landing.navFeatures')}</button>
            <button onClick={() => scrollTo('forwhom')} className="landing-nav-link">{t('landing.navForWhom')}</button>
            <div className="landing-nav-lang">
              <button
                onClick={() => i18n.changeLanguage('pt')}
                className={`landing-lang-btn ${i18n.language?.startsWith('pt') ? 'landing-lang-btn-active' : ''}`}
              >
                PT
              </button>
              <span className="landing-lang-sep">|</span>
              <button
                onClick={() => i18n.changeLanguage('en')}
                className={`landing-lang-btn ${i18n.language?.startsWith('en') ? 'landing-lang-btn-active' : ''}`}
              >
                EN
              </button>
            </div>
            {user ? (
              <button onClick={() => navigate('/dashboard')} className="landing-btn-primary landing-btn-sm">
                <LayoutDashboard size={16} />
                {t('landing.navDashboard')}
              </button>
            ) : (
              <button onClick={() => navigate('/login')} className="landing-btn-primary landing-btn-sm">
                <LogIn size={16} />
                {t('landing.navLogin')}
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
            {t('landing.heroTitle')}<br />
            <span className="landing-hero-title-accent">{t('landing.heroTitleAccent')}</span>
          </h1>
          <p className="landing-hero-subtitle">
            {t('landing.heroSubtitle')}
          </p>
          <div className="landing-hero-actions">
            {user ? (
              <button onClick={() => navigate('/dashboard')} className="landing-btn-primary landing-btn-lg">
                <LayoutDashboard size={18} />
                {t('landing.heroGoToDashboard')}
                <ChevronRight size={16} />
              </button>
            ) : (
              <>
                <button onClick={() => navigate('/login')} className="landing-btn-primary landing-btn-lg">
                  {t('landing.heroLogin')}
                  <ArrowRight size={16} />
                </button>
                <button onClick={() => scrollTo('features')} className="landing-btn-ghost landing-btn-lg">
                  {t('landing.heroSeeHow')}
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      <section id="features" className="landing-section">
        <div className="landing-section-inner">
          <div className="landing-section-header">
            <span className="landing-section-tag">{t('landing.featuresTag')}</span>
            <h2 className="landing-section-title">{t('landing.featuresTitle')}</h2>
            <p className="landing-section-desc">
              {t('landing.featuresDesc')}
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
                  <h3 className="landing-feat-title">{t(feat.titleKey)}</h3>
                  <p className="landing-feat-desc">{t(feat.descKey)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="forwhom" className="landing-section landing-section-alt">
        <div className="landing-section-inner">
          <div className="landing-section-header">
            <span className="landing-section-tag">{t('landing.forWhomTag')}</span>
            <h2 className="landing-section-title">{t('landing.forWhomTitle')}</h2>
            <p className="landing-section-desc">
              {t('landing.forWhomDesc')}
            </p>
          </div>
          <div className="landing-benefits-grid">
            <div className="landing-benefit-card">
              <Users size={32} style={{ color: 'var(--blue-color3)' }} />
              <h3 className="landing-benefit-title">{t('landing.forWhomOwnersTitle')}</h3>
              <p className="landing-benefit-desc">
                {t('landing.forWhomOwnersDesc')}
              </p>
            </div>
            <div className="landing-benefit-card">
              <Package size={32} style={{ color: 'var(--green-color4)' }} />
              <h3 className="landing-benefit-title">{t('landing.forWhomStockistsTitle')}</h3>
              <p className="landing-benefit-desc">
                {t('landing.forWhomStockistsDesc')}
              </p>
            </div>
            <div className="landing-benefit-card">
              <BarChart3 size={32} style={{ color: 'var(--yellow-color2)' }} />
              <h3 className="landing-benefit-title">{t('landing.forWhomAdminsTitle')}</h3>
              <p className="landing-benefit-desc">
                {t('landing.forWhomAdminsDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="cta" className="landing-section">
        <div className="landing-section-inner">
          <div className="landing-cta-card">
            <h2 className="landing-cta-title">{t('landing.ctaTitle')}</h2>
            <p className="landing-cta-desc">
              {t('landing.ctaDesc')}
            </p>
            <a href="https://wa.me/5589994017503" target="_blank" rel="noopener noreferrer" className="landing-btn-primary landing-btn-lg" style={{ textDecoration: 'none' }}>
              {t('landing.ctaPhone')}
              <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-footer-brand">
            <img src="/UpStock.svg" alt="UpStock" className="landing-footer-logo" />
            <span className="landing-footer-name">UpStock</span>
          </div>
          <p className="landing-footer-copy">{t('landing.footerCopyright', { year: new Date().getFullYear() })}</p>
          <p className="landing-footer-dev"><Trans i18nKey="landing.footerDev" /></p>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
