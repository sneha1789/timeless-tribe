const Product = require('../models/Product');

const getProductsByCategory = async (req, res) => {
  try {
    const { slug } = req.params;
    const {
      page = 1,
      limit = 20,
      minPrice,
      maxPrice,
      material,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      categories,
    } = req.query;

    const matchStage = {};

    let categorySlugs = [slug];
    if (categories && categories.length > 0) {
      categorySlugs = [
        ...new Set([...categorySlugs, ...categories.split(',')]),
      ];
    }
    matchStage.category = { $in: categorySlugs };

    if (material && material !== 'all') {
      matchStage['specifications.material'] = material;
    }

    const priceConditions = {};
    const parsedMin = parseInt(minPrice);
    const parsedMax = parseInt(maxPrice);

    if (!isNaN(parsedMin) && parsedMin >= 0) {
      priceConditions.$gte = parsedMin;
    }
    if (!isNaN(parsedMax) && parsedMax > 0) {
      priceConditions.$lte = parsedMax;
    }

    if (Object.keys(priceConditions).length > 0) {
      matchStage.variants = { $elemMatch: { price: priceConditions } };
    }

    const sortStage = {};
    if (sortBy === 'price') {
      sortStage['variants.0.price'] = sortOrder === 'asc' ? 1 : -1;
    } else {
      sortStage[sortBy] = sortOrder === 'desc' ? -1 : 1;
    }

    const pipeline = [
      { $match: matchStage },
      { $sort: sortStage },
      { $skip: (parseInt(page) - 1) * parseInt(limit) },
      { $limit: parseInt(limit) },
    ];

    const products = await Product.aggregate(pipeline);
    const total = await Product.countDocuments(matchStage);

    res.json({
      success: true,
      products,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      totalProducts: total,
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
    });
  }
};
const getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category');

    res.json({
      success: true,
      categories: categories.map((cat) => ({
        name: cat,
        slug: cat.toLowerCase().replace(/ /g, '-'),
        count: 0,
      })),
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
    });
  }
};

const getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const product = await Product.findOne({ slug });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
    });
  }
};

const getSimilarProducts = async (req, res) => {
  try {
    const { categorySlug } = req.params;
    const { exclude, limit } = req.query;

    const query = {
      category: categorySlug,
      slug: { $ne: exclude },
    };

    const products = await Product.find(query).limit(parseInt(limit) || 8);

    res.json(products);
  } catch (error) {
    console.error('Get similar products error:', error);

    res.status(500).json({ message: 'Server error' });
  }
};

const searchProducts = async (req, res) => {
  try {
    const {
      q,
      page = 1,
      limit = 20,
      minPrice,
      maxPrice,
      material,
      sortBy = 'relevance',
      sortOrder = 'desc',
    } = req.query;

    console.log('🔍 Search request received:', req.query);

    if (!q || q.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Search query is required.',
      });
    }

    const matchStage = {
      $text: { $search: q },
    };

    if (material && material !== 'all') {
      matchStage['specifications.material'] = material;
    }

    const parsedMin = parseInt(minPrice);
    const parsedMax = parseInt(maxPrice);
    if (!isNaN(parsedMin) || !isNaN(parsedMax)) {
      const priceConditions = {};
      if (!isNaN(parsedMin)) priceConditions.$gte = parsedMin;
      if (!isNaN(parsedMax)) priceConditions.$lte = parsedMax;

      matchStage.variants = { $elemMatch: { price: priceConditions } };
    }

    console.log('📋 Final match stage:', JSON.stringify(matchStage, null, 2));

    const sortStage = {};
    if (sortBy === 'relevance') {
      sortStage.score = { $meta: 'textScore' };
    } else if (sortBy === 'price') {
      sortStage['variants.0.price'] = sortOrder === 'asc' ? 1 : -1;
    } else {
      sortStage[sortBy] = sortOrder === 'desc' ? -1 : 1;
    }

    const total = await Product.countDocuments(matchStage);

    const pipeline = [
      { $match: matchStage },
      { $sort: sortStage },
      { $skip: (parseInt(page) - 1) * parseInt(limit) },
      { $limit: parseInt(limit) },
    ];

    if (sortBy === 'relevance') {
      pipeline.unshift({ $match: matchStage });
      pipeline[1] = { $sort: sortStage };
    }

    const products = await Product.aggregate(pipeline);

    console.log(
      `✅ Search completed: Found ${products.length} products out of ${total} total`,
    );

    res.json({
      success: true,
      products,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      totalProducts: total,
    });
  } catch (error) {
    console.error('❌ Search products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching for products',
    });
  }
};

const getAvailableFilters = async (req, res) => {
  try {
    const { categories } = req.query;
    if (!categories) {
      return res.status(400).json({ message: 'Category slugs are required.' });
    }

    console.log(
      `[FILTERS] 1. Received request for categories: "${categories}"`,
    );

    const categorySlugs = categories.split(',');
    const filter = { category: { $in: categorySlugs } };

    const productsWithMaterials = await Product.find(filter).select(
      'specifications.material',
    );

    console.log(
      `[FILTERS] 2. Found ${productsWithMaterials.length} products in these categories.`,
    );

    if (productsWithMaterials.length === 0) {
      return res.json({ success: true, filters: { materials: [] } });
    }

    const rawMaterialStrings = productsWithMaterials
      .map((p) => p.specifications.material)
      .filter(Boolean);

    console.log(
      '[FILTERS] 3. Raw material strings found in DB:',
      rawMaterialStrings,
    );

    const uniqueMaterials = new Set();
    rawMaterialStrings.forEach((string) => {
      const materials = string.split(',').map((material) => material.trim());
      materials.forEach((material) => {
        if (material) uniqueMaterials.add(material);
      });
    });

    const sortedMaterials = Array.from(uniqueMaterials).sort();

    console.log(
      '[FILTERS] 4. Final, clean list of unique materials to be sent to frontend:',
      sortedMaterials,
    );

    res.json({
      success: true,
      filters: {
        materials: sortedMaterials,
      },
    });
  } catch (error) {
    console.error('[FILTERS] CRITICAL ERROR:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
module.exports = {
  getProductsByCategory,
  getCategories,
  getProductBySlug,
  getSimilarProducts,
  getAvailableFilters,
  searchProducts,
};
