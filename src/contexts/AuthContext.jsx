import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Carrega a sessão ativa ao montar a aplicação
  useEffect(() => {
    async function loadSession() {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Erro ao carregar sessão:', error);
      } finally {
        setLoading(false);
      }
    }
    loadSession();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const loggedUser = await authService.login(email, password);
      setUser(loggedUser);
      return loggedUser;
    } catch (error) {
      setLoading(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Erro ao sair:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cria um novo usuário. Exclusivo para administradores.
   */
  const createUser = async (userData) => {
    return authService.createUser(userData);
  };

  /**
   * Remove um usuário. Exclusivo para administradores.
   */
  const deleteUser = async (userId) => {
    if (!user) throw new Error('Não autenticado.');
    return authService.deleteUser(userId);
  };

  /**
   * Lista todos os usuários cadastrados. Exclusivo para administradores.
   */
  const listUsers = async () => {
    return authService.listUsers();
  };

  /** true se o usuário logado for administrador */
  const isAdmin = user?.role === 'admin';

  const value = {
    user,
    loading,
    isAdmin,
    login,
    logout,
    createUser,
    deleteUser,
    listUsers,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
}
