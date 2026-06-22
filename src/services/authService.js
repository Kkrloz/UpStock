import api from './api';

const CURRENT_USER_KEY = 'upstock_current_user';
const TOKEN_KEY = 'upstock_token';

function normalizeUser(user) {
  return {
    ...user,
    role: user.role ? user.role.toLowerCase() : 'user',
    createdAt: user.createdAt
      ? new Date(user.createdAt).toLocaleDateString('pt-BR')
      : undefined,
  };
}

export const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    const { token } = response.data;

    localStorage.setItem(TOKEN_KEY, token);

    try {
      const meResponse = await api.get('/users/me');
      const user = normalizeUser(meResponse.data);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      return user;
    } catch (error) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(CURRENT_USER_KEY);
      throw error;
    }
  },

  async logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
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
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(CURRENT_USER_KEY);
      return null;
    }
  },

  async listUsers() {
    const response = await api.get('/users');
    return response.data.map(normalizeUser);
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
    const response = await api.post('/auth/register', { name, email, password });
    const { token } = response.data;

    localStorage.setItem(TOKEN_KEY, token);

    try {
      const meResponse = await api.get('/users/me');
      const user = normalizeUser(meResponse.data);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      return user;
    } catch (error) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(CURRENT_USER_KEY);
      throw error;
    }
  },
};
