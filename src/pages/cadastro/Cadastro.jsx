import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, Lock, Mail, User, AlertCircle, CheckCircle2 } from 'lucide-react';

function Cadastro() {
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Validação simples de força de senha
  const isPasswordStrong = password.length >= 6;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name || !email || !password || !confirmPassword) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (!isPasswordStrong) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas digitadas não coincidem.');
      return;
    }

    setIsLoading(true);

    try {
      await register(name, email, password);
      setSuccess('Conta criada com sucesso! Redirecionando...');
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (err) {
      setError(err.message || 'Erro ao realizar cadastro. Tente novamente.');
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError('');
    setGoogleLoading(true);

    try {
      await loginWithGoogle();
      setSuccess('Autenticado com o Google! Redirecionando...');
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (err) {
      setError('Erro ao autenticar com o Google. Tente novamente.');
      setGoogleLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-(--bg-color) overflow-hidden px-4 py-8 font-sans">
      {/* Elementos Decorativos de Fundo (Glow Effect) */}
      <div className="absolute top-[-20%] right-[-10%] w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] lg:w-[500px] lg:h-[500px] rounded-full bg-blue-500/10 blur-[80px] sm:blur-[100px] lg:blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] lg:w-[500px] lg:h-[500px] rounded-full bg-emerald-500/5 blur-[80px] sm:blur-[100px] lg:blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-(--bg-card-color)/90 backdrop-blur-md border border-(--border-color) rounded-2xl p-8 shadow-2xl z-10 transition-all duration-300">
        {/* Cabeçalho do Card */}
        <div className="flex flex-col items-center gap-3 mb-6 text-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20">
            <img src="/UpStock-branco.svg" alt="UpStock Logo" className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-(--text-primary-color) tracking-tight">Criar uma conta</h1>
            <p className="text-sm text-(--text-secondary-color) mt-1">Cadastre-se no UpStock para começar</p>
          </div>
        </div>

        {/* Mensagem de Erro */}
        {error && (
          <div className="flex items-start gap-2.5 p-3.5 mb-5 bg-rose-500/10 border border-rose-500/20 text-(--red-color4) text-sm rounded-xl">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Mensagem de Sucesso */}
        {success && (
          <div className="flex items-start gap-2.5 p-3.5 mb-5 bg-emerald-500/10 border border-emerald-500/20 text-(--green-color4) text-sm rounded-xl">
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {/* Formulário de Cadastro */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-(--text-secondary-color) uppercase tracking-wider">Nome Completo</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-(--text-secondary-color) w-5 h-5" />
              <input
                type="text"
                placeholder="Seu nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading || googleLoading}
                className="w-full pl-11 pr-4 py-2.5 bg-(--input-bg) border border-(--border-color) rounded-xl text-(--text-primary-color) placeholder-(--text-secondary-color) focus:outline-none focus:border-(--input-border-focus) focus:ring-1 focus:ring-(--input-border-focus) text-sm transition-all duration-200"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-(--text-secondary-color) uppercase tracking-wider">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-(--text-secondary-color) w-5 h-5" />
              <input
                type="email"
                placeholder="seu.email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading || googleLoading}
                className="w-full pl-11 pr-4 py-2.5 bg-(--input-bg) border border-(--border-color) rounded-xl text-(--text-primary-color) placeholder-(--text-secondary-color) focus:outline-none focus:border-(--input-border-focus) focus:ring-1 focus:ring-(--input-border-focus) text-sm transition-all duration-200"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-(--text-secondary-color) uppercase tracking-wider">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-(--text-secondary-color) w-5 h-5" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Mínimo de 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading || googleLoading}
                className="w-full pl-11 pr-11 py-2.5 bg-(--input-bg) border border-(--border-color) rounded-xl text-(--text-primary-color) placeholder-(--text-secondary-color) focus:outline-none focus:border-(--input-border-focus) focus:ring-1 focus:ring-(--input-border-focus) text-sm transition-all duration-200"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-(--text-secondary-color) hover:text-(--text-primary-color) transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-(--text-secondary-color) uppercase tracking-wider">Confirmar Senha</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-(--text-secondary-color) w-5 h-5" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Repita a senha criada"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading || googleLoading}
                className="w-full pl-11 pr-11 py-2.5 bg-(--input-bg) border border-(--border-color) rounded-xl text-(--text-primary-color) placeholder-(--text-secondary-color) focus:outline-none focus:border-(--input-border-focus) focus:ring-1 focus:ring-(--input-border-focus) text-sm transition-all duration-200"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex="-1"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-(--text-secondary-color) hover:text-(--text-primary-color) transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || googleLoading}
            className="w-full flex items-center justify-center gap-2 mt-2 bg-(--blue-color3) hover:bg-(--blue-color2) active:scale-[0.98] text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 text-sm shadow-md disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              'Criar Minha Conta'
            )}
          </button>
        </form>

        {/* Divisor */}
        <div className="flex items-center gap-4 my-5">
          <div className="h-px flex-1 bg-(--border-color)" />
          <span className="text-xs text-(--text-secondary-color) font-medium uppercase tracking-wider">ou registre-se com</span>
          <div className="h-px flex-1 bg-(--border-color)" />
        </div>

        {/* Botão Registro Google */}
        <button
          type="button"
          onClick={handleGoogleSignup}
          disabled={isLoading || googleLoading}
          className="w-full flex items-center justify-center gap-3 bg-(--bg-subtle) hover:bg-(--input-bg) border border-(--border-color) hover:border-(--border-color) active:scale-[0.98] text-(--text-primary-color) font-bold py-3 px-4 rounded-xl transition-all duration-200 text-sm shadow-sm disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
        >
            {googleLoading ? (
            <div className="w-5 h-5 border-2 border-(--spinner-track) border-t-(--spinner-top) rounded-full animate-spin" />
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.465 0-6.285-2.82-6.285-6.285 0-3.466 2.82-6.286 6.285-6.286 1.547 0 2.946.56 4.032 1.484l3.05-3.05C18.99 1.956 15.82 1 12.24 1 6.046 1 12.24s5.046 11.24 11.24 11.24c5.897 0 10.87-4.14 10.87-11.24 0-.668-.08-1.32-.218-1.955H12.24z"
                />
              </svg>
              Google
            </>
          )}
        </button>

        {/* Link para Login */}
        <div className="mt-6 text-center text-sm text-(--text-secondary-color)">
          Já possui uma conta?{' '}
          <Link to="/login" className="text-(--blue-color3) hover:text-(--blue-color2) font-bold transition-colors">
            Fazer login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Cadastro;
