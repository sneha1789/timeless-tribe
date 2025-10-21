const express = require('express');
const router = express.Router();
const {
  createCategory,
  getCategories,
} = require('../controllers/categoryController.js');
const { protect, admin } = require('../middleware/authMiddleware.js');

router.route('/').post(protect, admin, createCategory).get(getCategories);

module.exports = router;
