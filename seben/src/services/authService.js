// frontend/src/services/authService.js
import api from './api';

class AuthService {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    if (response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  }

  async adminLogin(email, password) {
    const response = await api.post('/auth/admin/login', { email, password });
    if (response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  }

  async register(userData) {
    const response = await api.post('/auth/register', userData);
    if (response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  }

  async logout() {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data.user;
  }

  async updateProfile(data) {
    const response = await api.patch('/auth/update-profile', data);
    const updatedUser = response.data.user;
    localStorage.setItem('user', JSON.stringify(updatedUser));
    return updatedUser;
  }

  async changePassword(currentPassword, newPassword) {
    const response = await api.patch('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    if (response.token) {
      localStorage.setItem('token', response.token);
    }
    return response;
  }

  async forgotPassword(email) {
    return api.post('/auth/forgot-password', { email });
  }

  async resetPassword(token, password) {
    return api.post('/auth/reset-password', { token, password });
  }

  getStoredUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  getToken() {
    return localStorage.getItem('token');
  }

  isAuthenticated() {
    return !!this.getToken();
  }
}

export default new AuthService();