import api from './api';

const CURRENT_USER_KEY = 'upstock_current_user';
const TOKEN_KEY = 'upstock_token';
const REFRESH_KEY = 'upstock_refresh_token';

function normalizeUser(user) {
  return {
    ...user,
    role: user.role ? user.role.toLowerCase() : 'user',
    createdAt: user.createdAt
      ? new Date(user.createdAt).toLocaleDateString('pt-BR')
      : undefined,
  };
}

function storeTokens(data) {
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(REFRESH_KEY, data.refreshToken);
}

function clearTokens() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(CURRENT_USER_KEY);
}

export const authService = {
  async login(email, password) {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, refreshToken } = response.data;

      if (!token || !refreshToken) throw new Error('Resposta inválida do servidor');

      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(REFRESH_KEY, refreshToken);

      const meResponse = await api.get('/users/me');
      const user = normalizeUser(meResponse.data);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      return user;
    } catch (error) {
      clearTokens();
      throw error;
    }
  },

  async logout() {
    clearTokens();
  },

  async getCurrentUser() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;

    try {
      const response = await api.get('/users/me');
      const user = normalizeUser(response.data);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      return user;
    } catch {
      clearTokens();
      return null;
    }
  },

  async listUsers(params = {}) {
    const response = await api.get('/users', { params });
    return { users: (response.data.content || []).map(normalizeUser), totalPages: response.data.totalPages || 0 };
  },

  async createUser({ name, email, password, cargo, role = 'user', storeName }) {
    const response = await api.post('/users', {
      name, email, password, cargo, storeName,
      role: role.toUpperCase(),
    });
    return normalizeUser(response.data);
  },

  async deleteUser(userId) {
    await api.delete(`/users/${userId}`);
  },

  async updateUser(userId, data) {
    const response = await api.put(`/users/${userId}`, data);
    return normalizeUser(response.data);
  },

  async register({ name, email, password }) {
    try {
      const response = await api.post('/auth/register', { name, email, password });
      const { token, refreshToken } = response.data;

      if (!token || !refreshToken) throw new Error('Resposta inválida do servidor');

      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(REFRESH_KEY, refreshToken);

      const meResponse = await api.get('/users/me');
      const user = normalizeUser(meResponse.data);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      return user;
    } catch (error) {
      clearTokens();
      throw error;
    }
  },
};
