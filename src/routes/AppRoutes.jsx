import { Routes, Route } from 'react-router';
import Layout from '../components/layout/Layout.jsx';
import ProtectedRoute from '../components/layout/ProtectedRoute.jsx';
import PublicRoute from '../components/layout/PublicRoute.jsx';
import AdminRoute from '../components/layout/AdminRoute.jsx';

import Landing from '../pages/landing/Landing.jsx';
import Dashboard from '../pages/dashboard/Dashboard.jsx';
import Produtos from '../pages/produtos/Produtos.jsx';
import Movimentacoes from '../pages/movimentacoes/Movimentacoes.jsx';
import Relatorios from '../pages/relatorios/Relatorios.jsx';
import Notificacoes from '../pages/notificacoes/Notificacoes.jsx';
import Configuracoes from '../pages/configuracoes/Configuracoes.jsx';
import Login from '../pages/login/Login.jsx';
import Usuarios from '../pages/usuarios/Usuarios.jsx';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/produtos" element={<Produtos />} />
          <Route path="/movimentacoes" element={<Movimentacoes />} />
          <Route path="/relatorios" element={<Relatorios />} />
          <Route path="/notificacoes" element={<Notificacoes />} />
          <Route path="/configuracoes" element={<Configuracoes />} />

          <Route element={<AdminRoute />}>
            <Route path="/usuarios" element={<Usuarios />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}

export default AppRoutes;
