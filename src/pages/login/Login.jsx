import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError(t('login.errorRequired'));
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || t('login.errorInvalid'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo-row">
          <img src="/UpStock-branco.svg" alt="UpStock" className="login-logo-img" />
          <span className="login-logo-text">UpStock</span>
        </div>

        <div className="login-titles">
          <h1 className="login-title">{t('login.title')}</h1>
          <p className="login-subtitle">{t('login.subtitle')}</p>
        </div>

        {error && (
          <div className="login-error">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-field">
            <label htmlFor="login-email" className="login-label">{t('login.emailLabel')}</label>
            <input id="login-email" type="email" placeholder={t('login.emailPlaceholder')} value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} className="login-input" autoComplete="email" required />
          </div>

          <div className="login-field">
            <label htmlFor="login-password" className="login-label">{t('login.passwordLabel')}</label>
            <div className="login-input-wrapper">
              <input id="login-password" type={showPassword ? 'text' : 'password'} placeholder={t('login.passwordPlaceholder')} value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} className="login-input" autoComplete="current-password" required />
              <button type="button" tabIndex="-1" onClick={() => setShowPassword(!showPassword)} className="login-eye-btn">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button id="login-submit-btn" type="submit" disabled={isLoading} className="login-submit-btn">
            {isLoading ? <div className="login-spinner" /> : t('login.submit')}
          </button>
        </form>

        <div className="login-register-link">
          <span className="text-(--text-tercery-color)">{t('login.footerText')}</span>
        </div>
      </div>
    </div>
  );
}

export default Login;
