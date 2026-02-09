// backend/src/routes/orderRoutes.js
const express = require('express');
const orderController = require('../controllers/orderController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/create', orderController.createOrder);
router.get('/track/:orderId', orderController.trackOrder);

// Protected routes (logged in users)
router.use(protect);
router.get('/my-orders', orderController.getMyOrders);
router.get('/my-orders/:id', orderController.getMyOrderById);

// Admin routes
router.use(restrictTo('ADMIN'));
router.get('/', orderController.getAllOrders);
router.get('/stats', orderController.getOrderStats);
router.get('/:id', orderController.getOrderById);
router.patch('/:id/status', orderController.updateOrderStatus);
router.patch('/:id', orderController.updateOrder);
router.post('/:id/notes', orderController.addOrderNote);
router.delete('/:id', orderController.deleteOrder);

module.exports = router;