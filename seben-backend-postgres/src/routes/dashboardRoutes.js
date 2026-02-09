// backend/src/routes/dashboardRoutes.js
const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// All routes require admin access
router.use(protect, restrictTo('ADMIN'));

router.get('/stats', dashboardController.getDashboardStats);
router.get('/sales', dashboardController.getSalesData);
router.get('/recent-orders', dashboardController.getRecentOrders);
router.get('/top-products', dashboardController.getTopProducts);
router.get('/revenue', dashboardController.getRevenueData);

module.exports = router;