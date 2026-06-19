import { Routes, Route } from 'react-router';
import Layout from '../components/layout/Layout.jsx';
import ProtectedRoute from '../components/layout/ProtectedRoute.jsx';
import PublicRoute from '../components/layout/PublicRoute.jsx';
import AdminRoute from '../components/layout/AdminRoute.jsx';

// Importação das páginas
import Teste from '../pages/teste/Teste.jsx';
import Produtos from '../pages/produtos/Produtos.jsx';
import Movimentacoes from '../pages/movimentacoes/Movimentacoes.jsx';
import Relatorios from '../pages/relatorios/Relatorios.jsx';
import Notificacoes from '../pages/notificacoes/Notificacoes.jsx';
import Configuracoes from '../pages/configuracoes/Configuracoes.jsx';
import Sair from '../pages/sair/Sair.jsx';
import Login from '../pages/login/Login.jsx';
import Usuarios from '../pages/usuarios/Usuarios.jsx';

function AppRoutes() {
  return (
    <Routes>
      {/* Rotas públicas (apenas para visitantes não logados) */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
      </Route>

      {/* Rota neutra (desloga o usuário e mostra tela de confirmação de saída) */}
      <Route path="/sair" element={<Sair />} />

      {/* Rotas protegidas (apenas para usuários autenticados) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          {/* Rotas acessíveis por todos os usuários autenticados */}
          <Route path="/" element={<Teste />} />
          <Route path="/produtos" element={<Produtos />} />
          <Route path="/movimentacoes" element={<Movimentacoes />} />
          <Route path="/relatorios" element={<Relatorios />} />
          <Route path="/notificacoes" element={<Notificacoes />} />
          <Route path="/configuracoes" element={<Configuracoes />} />

          {/* Rotas exclusivas para administradores */}
          <Route element={<AdminRoute />}>
            <Route path="/usuarios" element={<Usuarios />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}

export default AppRoutes;