import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const timeout = setTimeout(() => {
      if (!cancelled) {
        console.warn('Auth session loading timed out');
        setLoading(false);
      }
    }, 10000);

    async function loadSession() {
      try {
        const currentUser = await authService.getCurrentUser();
        if (!cancelled) setUser(currentUser);
      } catch (error) {
        if (!cancelled) console.error('Erro ao carregar sessão:', error);
      } finally {
        if (!cancelled) { clearTimeout(timeout); setLoading(false); }
      }
    }
    loadSession();
    return () => { cancelled = true; clearTimeout(timeout); };
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const loggedUser = await authService.login(email, password);
      setUser(loggedUser);
      return loggedUser;
    } catch (error) { setLoading(false); throw error; }
    finally { setLoading(false); }
  };

  const logout = async () => {
    setLoading(true);
    try { await authService.logout(); setUser(null); }
    catch (error) { console.error('Erro ao sair:', error); }
    finally { setLoading(false); }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const newUser = await authService.register({ name, email, password });
      setUser(newUser);
      return newUser;
    } catch (error) { setLoading(false); throw error; }
    finally { setLoading(false); }
  };

  const createUser = async (userData) => authService.createUser(userData);
  const updateUser = async (userId, userData) => {
    if (!user) throw new Error('Não autenticado.');
    return authService.updateUser(userId, userData);
  };
  const deleteUser = async (userId) => {
    if (!user) throw new Error('Não autenticado.');
    return authService.deleteUser(userId);
  };
  const listUsers = async () => authService.listUsers();
  const isAdmin = user?.role === 'admin';

  const value = { user, loading, isAdmin, login, register, logout, createUser, updateUser, deleteUser, listUsers };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  return context;
}
