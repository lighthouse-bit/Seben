// frontend/src/hooks/useProducts.js
import { useState, useEffect } from 'react';
import productService from '../services/productService';

export const useProducts = (filters = {}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    currentPage: 1,
    perPage: 12,
  });

  useEffect(() => {
    fetchProducts();
  }, [JSON.stringify(filters)]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      // The service returns response.data directly
      const response = await productService.getAllProducts(filters);
      
      setProducts(response.products || []);
      setPagination({
        total: response.total || 0,
        totalPages: response.totalPages || 0,
        currentPage: response.currentPage || 1,
        perPage: response.perPage || 12,
      });
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to fetch products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  return { products, loading, error, pagination, refetch: fetchProducts };
};

export const useProduct = (id) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      // The service returns response.data.product directly
      const data = await productService.getProductById(id);
      setProduct(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to fetch product');
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  return { product, loading, error, refetch: fetchProduct };
};

export const useFeaturedProducts = (limit = 8) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productService.getFeaturedProducts(limit);
      setProducts(data || []);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to fetch featured products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  return { products, loading, error, refetch: fetchFeaturedProducts };
};