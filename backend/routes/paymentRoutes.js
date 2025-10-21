const express = require('express');
const router = express.Router();
const { handlePaymentCallback } = require('../controllers/orderController.js');
router
  .route('/callback/:gateway')
  .post(handlePaymentCallback)
  .get(handlePaymentCallback);

module.exports = router;
