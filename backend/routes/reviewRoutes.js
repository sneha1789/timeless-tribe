const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  addReview,
  getProductReviews,
  updateReview,
  deleteReview,
  markReviewHelpful,
  getTopReviews,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post('/:productId', protect, upload.array('images', 5), addReview);

router.get('/product/:productId', getProductReviews);

router.put('/:reviewId', protect, upload.array('images', 5), updateReview);

router.delete('/:reviewId', protect, deleteReview);

router.patch('/:reviewId/helpful', protect, markReviewHelpful);
router.get('/top', getTopReviews);

module.exports = router;
