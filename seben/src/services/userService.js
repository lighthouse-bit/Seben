// frontend/src/services/userService.js
import api from './api';

class UserService {
  // Addresses
  async getAddresses() {
    const response = await api.get('/users/addresses');
    return response.data.addresses;
  }

  async addAddress(addressData) {
    const response = await api.post('/users/addresses', addressData);
    return response.data.address;
  }

  async updateAddress(id, addressData) {
    const response = await api.patch(`/users/addresses/${id}`, addressData);
    return response.data.address;
  }

  async deleteAddress(id) {
    await api.delete(`/users/addresses/${id}`);
  }

  async setDefaultAddress(id) {
    const response = await api.patch(`/users/addresses/${id}/default`);
    return response.data.address;
  }

  // Wishlist
  async getWishlist() {
    const response = await api.get('/users/wishlist');
    return response.data.wishlist;
  }

  async addToWishlist(productId) {
    const response = await api.post('/users/wishlist', { productId });
    return response.data.wishlist;
  }

  async removeFromWishlist(productId) {
    await api.delete(`/users/wishlist/${productId}`);
  }

  // Settings
  async getSettings() {
    const response = await api.get('/users/settings');
    return response.data.settings;
  }

  async updateSettings(settings) {
    const response = await api.patch('/users/settings', settings);
    return response.data.settings;
  }
}

export default new UserService();