// backend/src/routes/orderRoutes.js
const express = require('express');
const orderController = require('../controllers/orderController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// --- Debugging Check ---
if (!orderController.createOrder) console.error("❌ Error: createOrder is undefined");
if (!orderController.getMyOrders) console.error("❌ Error: getMyOrders is undefined");
// -----------------------

// Public routes
router.post('/create', orderController.createOrder);
router.get('/track/:orderId', orderController.trackOrder);

// Stripe Routes
router.post('/create-checkout-session', orderController.createCheckoutSession);
router.post('/verify-payment', orderController.verifyPaymentAndCreateOrder);

// Protected routes (Logged in users)
router.use(protect); // Middleware to check token

router.get('/my-orders', orderController.getMyOrders);
router.get('/my-orders/:id', orderController.getMyOrderById);

// Admin routes (Admin only)
router.use(restrictTo('ADMIN'));

router.get('/', orderController.getAllOrders);
router.get('/stats', orderController.getOrderStats);
router.get('/:id', orderController.getOrderById);
router.patch('/:id/status', orderController.updateOrderStatus);
router.patch('/:id', orderController.updateOrder);
router.post('/:id/notes', orderController.addOrderNote);
router.delete('/:id', orderController.deleteOrder);

module.exports = router;