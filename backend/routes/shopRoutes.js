const express = require('express');
const router = express.Router();
const { 
  getSettings, 
  getActiveOffers, 
  getOffersWithImages,
  getOffersWithoutImages,
  applyCoupon 
} = require('../controllers/shopController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/settings', getSettings);
router.get('/offers', getActiveOffers); // Keep this for backward compatibility
router.get('/offers/with-images', getOffersWithImages); // For home page
router.get('/offers/without-images', getOffersWithoutImages); // For checkout & product detail

// Protected route (only logged-in users can apply coupons)
router.post('/coupons/apply', protect, applyCoupon);

module.exports = router;