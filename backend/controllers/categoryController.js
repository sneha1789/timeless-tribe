const Category = require('../models/Category.js');
const Product = require('../models/Product.js');

const createCategory = async (req, res) => {
  const { name, description, image } = req.body;
  const slug = name.toLowerCase().replace(/ /g, '-');

  const category = new Category({ name, slug, description, image });

  try {
    const createdCategory = await category.save();
    res.status(201).json(createdCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getCategories = async (req, res) => {
  try {
    const categoriesWithCounts = await Category.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: 'slug',
          foreignField: 'category',
          as: 'products',
        },
      },
      {
        $addFields: {
          itemCount: { $size: '$products' },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          slug: 1,
          image: 1,
          itemCount: 1,
        },
      },
    ]);

    res.json(categoriesWithCounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createCategory, getCategories };
