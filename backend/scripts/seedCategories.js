// backend/seeders/seedCategories.js

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('../models/Category'); // Adjust path if necessary

dotenv.config();

const sampleCategories = [
    {
        name: 'Jewelry',
        slug: 'jewelry',
        image: 'https://res.cloudinary.com/dg9elubn7/image/upload/v1760527001/jewel_pz4ylj.jpg', 
        description: 'Exquisite handcrafted jewelry from the Himalayas.'
    },
    {
        name: 'Khukuri Brooch',
        slug: 'khukuri-brooch',
        image: 'https://res.cloudinary.com/dg9elubn7/image/upload/v1760526951/khukuri_tpjfuo.jpg',
        description: 'Symbolic and masterfully crafted Khukuri brooches.'
    },
    {
        name: 'Metal Statues',
        slug: 'metal-statues',
        image: 'https://res.cloudinary.com/dg9elubn7/image/upload/v1760527024/metal_sqfui1.jpg',
        description: 'Divine metal statues forged by master artisans.'
    },
    {
        name: 'Sound & Spirituality',
        slug: 'sound-and-spirituality',
        image: 'https://res.cloudinary.com/dg9elubn7/image/upload/v1760527033/sound_f3szsn.jpg',
        description: 'Authentic items for meditation, healing, and spiritual practice.'
    },
    {
        name: 'Thangka & Wall Decor',
        slug: 'thangka-and-wall-decor',
        image: 'https://res.cloudinary.com/dg9elubn7/image/upload/v1760527031/thanka_bsxz80.jpg',
        description: 'Intricate, hand-painted Thangkas and traditional wall art.'
    },
    {
        name: 'Buddhist Ritual Objects',
        slug: 'buddhist-ritual-object',
        image: 'https://res.cloudinary.com/dg9elubn7/image/upload/v1760527026/rituals_epzavf.jpg',
        description: 'Sacred objects used in Buddhist ceremonies and practices.'
    },
    {
        name: 'Wool and Weave',
        slug: 'wool-and-weave',
        image: 'https://res.cloudinary.com/dg9elubn7/image/upload/v1760527039/wool_z6dxfj.jpg',
        description: 'Hand-woven textiles made from Himalayan wool.'
    },
    {
        name: 'Pashmina Scarves',
        slug: 'pashmina-scarf',
        image: 'https://res.cloudinary.com/dg9elubn7/image/upload/v1760527027/pashnima_vi9sjv.jpg',
        description: 'Luxurious and authentic Pashmina scarves from the Himalayas.'
    },
    {
        name: 'Clothes & Accessories',
        slug: 'clothing-and-accessories',
        image: 'https://res.cloudinary.com/dg9elubn7/image/upload/v1760527056/cloth_bcvlio.jpg',
        description: 'Traditional and contemporary apparel and accessories.'
    },
    {
        name: 'Gifts & Souvenirs',
        slug: 'gifts-and-souvenirs',
        image: 'https://res.cloudinary.com/dg9elubn7/image/upload/v1760527016/gifts12_uyh8yf.jpg',
        description: 'Unique gifts and souvenirs that capture the spirit of Nepal.'
    },
    {
        name: 'Hemp Products',
        slug: 'hemp-products',
        image: 'https://res.cloudinary.com/dg9elubn7/image/upload/v1760527005/hemp_vycixz.jpg',
        description: 'Sustainable and durable products made from Himalayan hemp.'
    },
    {
        name: 'Wooden Crafts',
        slug: 'wooden-crafts',
        image: 'https://res.cloudinary.com/dg9elubn7/image/upload/v1760527007/hats_ra8fxj.png',
        description: 'Intricately carved wooden artifacts and decor.'
    }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    await Category.deleteMany({});
    console.log('✅ Cleared existing categories');

    await Category.insertMany(sampleCategories);
    console.log(`✅ Added ${sampleCategories.length} sample categories`);

    console.log('\n🎉 Category data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();