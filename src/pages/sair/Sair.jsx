import { useEffect } from 'react';
import { LogOut, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';

function Sair() {
  const { logout } = useAuth();

  // Executa o logout assim que a tela de Sessão Encerrada é carregada
  useEffect(() => {
    logout();
  }, [logout]);

  return (
    <div className="flex flex-col gap-6 items-center justify-center min-h-screen max-w-md mx-auto text-center font-sans px-4">
      {/* Elementos Decorativos de Fundo (Glow Effect) */}
      <div className="absolute top-[-20%] left-[-10%] w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] lg:w-[500px] lg:h-[500px] rounded-full bg-red-500/5 blur-[80px] sm:blur-[100px] lg:blur-[120px] pointer-events-none" />

      <div className="bg-(--bg-card-color) border border-(--border-color) rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-6 w-full">
        <div className="p-4 rounded-full bg-rose-500/10 text-(--red-color4)">
          <LogOut size={40} />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-extrabold text-(--text-primary-color)">Sessão Encerrada</h1>
          <p className="text-sm text-(--text-secondary-color)">
            Você saiu com segurança do UpStock. Volte sempre!
          </p>
        </div>
        <Link
          to="/login"
          className="flex items-center gap-2 bg-(--bg-card-hover-color) hover:bg-(--bg-card-hover-color2) border border-(--border-color) text-(--text-primary-color) font-bold py-2.5 px-6 rounded-xl transition-all duration-200 text-sm shadow-md mt-2 cursor-pointer"
        >
          <ArrowLeft size={16} />
          Voltar ao Login
        </Link>
      </div>
    </div>
  );
}

export default Sair;
