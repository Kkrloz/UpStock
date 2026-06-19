import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Preencha e-mail e senha para continuar.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Credenciais inválidas. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        {/* Logo */}
        <div className="login-logo-row">
          <img src="/UpStock-branco.svg" alt="UpStock" className="login-logo-img" />
          <span className="login-logo-text">UpStock</span>
        </div>

        <div className="login-titles">
          <h1 className="login-title">Entrar na sua conta</h1>
          <p className="login-subtitle">Sistema de gestão de estoque</p>
        </div>

        {/* Erro */}
        {error && (
          <div className="login-error">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-field">
            <label htmlFor="login-email" className="login-label">E-mail</label>
            <input
              id="login-email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="login-input"
              autoComplete="email"
              required
            />
          </div>

          <div className="login-field">
            <label htmlFor="login-password" className="login-label">Senha</label>
            <div className="login-input-wrapper">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="login-input"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                tabIndex="-1"
                onClick={() => setShowPassword(!showPassword)}
                className="login-eye-btn"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            disabled={isLoading}
            className="login-submit-btn"
          >
            {isLoading ? (
              <div className="login-spinner" />
            ) : (
              'Entrar'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
