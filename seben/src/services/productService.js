// frontend/src/services/productService.js
import api from './api';

class ProductService {
  async getAllProducts(filters = {}) {
    const response = await api.get('/products', filters);
    return response.data;
  }

  async getProductById(id) {
    const response = await api.get(`/products/${id}`);
    return response.data.product;
  }

  async getProductBySlug(slug) {
    const response = await api.get(`/products/slug/${slug}`);
    return response.data.product;
  }

  async getFeaturedProducts(limit = 8) {
    const response = await api.get('/products/featured', { limit });
    return response.data.products;
  }

  async getNewArrivals(limit = 8) {
    const response = await api.get('/products/new-arrivals', { limit });
    return response.data.products;
  }

  async getRelatedProducts(productId, limit = 4) {
    const response = await api.get(`/products/${productId}/related`, { limit });
    return response.data.products;
  }

  // Admin methods
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
}

export default new ProductService();