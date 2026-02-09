// backend/src/routes/customerRoutes.js
const express = require('express');
const customerController = require('../controllers/customerController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// All routes require admin access
router.use(protect, restrictTo('ADMIN'));

router.get('/', customerController.getAllCustomers);
router.get('/stats', customerController.getCustomerStats);
router.get('/:id', customerController.getCustomerById);
router.get('/:id/orders', customerController.getCustomerOrders);
router.patch('/:id', customerController.updateCustomer);
router.delete('/:id', customerController.deleteCustomer);

module.exports = router;