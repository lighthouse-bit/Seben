// src/controllers/productController.js
const asyncHandler = require('express-async-handler');
const productService = require('../services/productService');

// Get all products
exports.getAllProducts = asyncHandler(async (req, res) => {
  const { products, pagination } = await productService.getProducts(req.query);

  res.status(200).json({
    status: 'success',
    results: products.length,
    ...pagination,
    data: {
      products,
    },
  });
});

// Get single product
exports.getProduct = asyncHandler(async (req, res) => {
  const product = await productService.getProductById(req.params.id);

  if (!product) {
    return res.status(404).json({
      status: 'error',
      message: 'Product not found',
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      product,
    },
  });
});

// Get product by slug
exports.getProductBySlug = asyncHandler(async (req, res) => {
  const product = await productService.getProductBySlug(req.params.slug);

  if (!product) {
    return res.status(404).json({
      status: 'error',
      message: 'Product not found',
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      product,
    },
  });
});

// Create product (Admin)
exports.createProduct = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      product,
    },
  });
});

// Update product (Admin)
exports.updateProduct = asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(req.params.id, req.body);

  if (!product) {
    return res.status(404).json({
      status: 'error',
      message: 'Product not found',
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      product,
    },
  });
});

// Delete product (Admin)
exports.deleteProduct = asyncHandler(async (req, res) => {
  await productService.deleteProduct(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// Get featured products
exports.getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await productService.getFeaturedProducts(req.query.limit);

  res.status(200).json({
    status: 'success',
    results: products.length,
    data: {
      products,
    },
  });
});

// Get new arrivals
exports.getNewArrivals = asyncHandler(async (req, res) => {
  const products = await productService.getNewArrivals(req.query.limit);

  res.status(200).json({
    status: 'success',
    results: products.length,
    data: {
      products,
    },
  });
});

// Get related products
exports.getRelatedProducts = asyncHandler(async (req, res) => {
  const products = await productService.getRelatedProducts(
    req.params.id,
    req.query.limit
  );

  res.status(200).json({
    status: 'success',
    results: products.length,
    data: {
      products,
    },
  });
});