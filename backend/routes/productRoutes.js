const express = require('express');
const {
  getProductsByCategory,
  getCategories,
  getProductBySlug,
  getSimilarProducts,
  getAvailableFilters, 
  searchProducts,
} = require('../controllers/productController');

const router = express.Router();

router.get('/search', searchProducts);

router.get('/filters', getAvailableFilters);
router.get('/categories', getCategories);


router.get('/category/:slug', getProductsByCategory);
router.get('/:slug', getProductBySlug);
router.get('/category/:categorySlug', getSimilarProducts);


// Add this route to your productRoutes.js for testing
router.get('/debug/search-test', async (req, res) => {
  try {
    const { q } = req.query;
    
    // Test text index
    const textSearchResults = await Product.find({ $text: { $search: q } });
    
    // Test regular search
    const regexSearchResults = await Product.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } }
      ]
    });
    
    res.json({
      textSearchCount: textSearchResults.length,
      regexSearchCount: regexSearchResults.length,
      textSearchResults: textSearchResults.map(p => p.name),
      regexSearchResults: regexSearchResults.map(p => p.name)
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
module.exports = router;
