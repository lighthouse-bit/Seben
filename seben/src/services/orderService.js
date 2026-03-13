// frontend/src/services/orderService.js
import api from './api';

class OrderService {
  async createOrder(orderData) {
    const response = await api.post('/orders/create', orderData);
    return response.data.order;
  }

  async trackOrder(orderId) {
    const response = await api.get(`/orders/track/${orderId}`);
    return response.data.order;
  }

  async getMyOrders() {
    const response = await api.get('/orders/my-orders');
    return response.data.orders;
  }

  async getMyOrderById(id) {
    const response = await api.get(`/orders/my-orders/${id}`);
    return response.data.order;
  }

  // Admin methods
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

  async createCheckoutSession(orderData) {
    // 1. Create session on backend
    const response = await api.post('/orders/create-checkout-session', orderData);
    
    // 2. Redirect to Stripe URL directly using the URL returned from backend
    if (response.url) {
      window.location.href = response.url;
    } else {
      throw new Error('No checkout URL received from server');
    }
  }

  async verifyPayment(sessionId, orderData) {
    const response = await api.post('/orders/verify-payment', {
      sessionId,
      orderData
    });
    return response.data.order;
  }
}

export default new OrderService();