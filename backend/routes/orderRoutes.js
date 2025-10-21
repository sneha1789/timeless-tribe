const express = require('express');
const router = express.Router();
const {
  createDraftOrder,
  getMyOrders,
  getOrderById,
  initiatePayment,
  updateOrderPaymentMethod,
  verifyEsewaPaymentClient,
  handlePaymentCallback,
  cancelOrder,
} = require('../controllers/orderController.js');
const { protect } = require('../middleware/authMiddleware.js');

router.route('/create-draft-order').post(protect, createDraftOrder);

router.route('/myorders').get(protect, getMyOrders);

router.route('/verify-esewa-payment').post(protect, verifyEsewaPaymentClient);

router.route('/esewa-callback').get(handlePaymentCallback);

router
  .route('/:id')
  .get(protect, getOrderById)
  .put(protect, updateOrderPaymentMethod);

router.route('/:id/initiate-payment').post(protect, initiatePayment);

router.route('/:id/cancel').put(protect, cancelOrder);

module.exports = router;
