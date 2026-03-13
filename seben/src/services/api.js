// frontend/src/services/api.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    // Default headers
    const headers = {
      ...options.headers,
    };

    // Add auth token if it exists
    const token = localStorage.getItem('token');
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    // CRITICAL FIX: Handle FormData vs JSON
    let body = options.body;

    // If it's NOT FormData, we default to JSON
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
      if (body && typeof body === 'object') {
        body = JSON.stringify(body);
      }
    } else {
      // If it IS FormData, DELETE Content-Type. 
      // The browser will automatically set it to "multipart/form-data; boundary=..."
      delete headers['Content-Type'];
    }

    const config = {
      ...options,
      headers,
      body,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // GET request
  get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  // POST request
  post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: data,
      ...options
    });
  }

  // PATCH request
  patch(endpoint, data) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: data,
    });
  }

  // DELETE request
  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

export default new ApiService();