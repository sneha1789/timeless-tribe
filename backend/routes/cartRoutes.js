const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  updateCartItemDetails,
  cleanupCart, 
} = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getCart).post(protect, addToCart);

router.route('/:itemId/details').put(protect, updateCartItemDetails);

router
  .route('/:itemId')
  .put(protect, updateCartItem)
  .delete(protect, removeCartItem);

router.get('/cleanup', protect, cleanupCart); 

module.exports = router;
