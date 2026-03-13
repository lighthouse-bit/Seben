// frontend/src/services/adminService.js
import api from './api';

class AdminService {
  // Dashboard
  async getDashboardStats() {
    const response = await api.get('/dashboard/stats');
    return response.data;
  }

  async getSalesData(period = '7days') {
    const response = await api.get('/dashboard/sales', { period });
    return response.data;
  }

  async getRecentOrders(limit = 5) {
    const response = await api.get('/dashboard/recent-orders', { limit });
    return response.data;
  }

  async getTopProducts(limit = 5) {
    const response = await api.get('/dashboard/top-products', { limit });
    return response.data;
  }

  // Products
  async getAllProducts(filters = {}) {
    const response = await api.get('/products', filters);
    return response;
  }

  async getProductById(id) {
    const response = await api.get(`/products/${id}`);
    return response.data.product;
  }

  async createProduct(productData) {
    const response = await api.post('/products', productData);
    return response.data.product;
  }

  async updateProduct(id, productData) {
    const response = await api.patch(`/products/${id}`, productData);
    return response.data.product;
  }

  async deleteProduct(id) {
    await api.delete(`/products/${id}`);
  }

  // Orders
  async getAllOrders(filters = {}) {
     const response = await api.get('/orders', filters);
    return response.data; 
  }

  async getOrderById(id) {
    const response = await api.get(`/orders/${id}`);
    return response.data.order;
  }

  async updateOrderStatus(id, status, additionalData = {}) {
    const response = await api.patch(`/orders/${id}/status`, {
      status,
      ...additionalData,
    });
    return response.data.order;
  }

  async addOrderNote(id, text) {
    const response = await api.post(`/orders/${id}/notes`, { text });
    return response.data.note;
  }

  // Customers
  async getAllCustomers(filters = {}) {
    const response = await api.get('/customers', filters);
    return response;
  }

  async getCustomerById(id) {
    const response = await api.get(`/customers/${id}`);
    return response.data.customer;
  }

  async getCustomerOrders(id) {
    const response = await api.get(`/customers/${id}/orders`);
    return response.data.orders;
  }

  async updateCustomer(id, data) {
    const response = await api.patch(`/customers/${id}`, data);
    return response.data.customer;
  }

  async deleteCustomer(id) {
    await api.delete(`/customers/${id}`);
  }

  async getCustomerStats() {
    const response = await api.get('/customers/stats');
    return response.data;
  }
}

export default new AdminService();