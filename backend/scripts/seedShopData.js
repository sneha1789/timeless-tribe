const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load All Necessary Models
const Settings = require('../models/Settings');
const Offer = require('../models/Offer');
const Coupon = require('../models/Coupon');

dotenv.config();

const settingsData = [

  
  {
    key: 'siteSettings',
    freeShippingThreshold: 2000,
    deliveryFee: 150,
  },
];


const offersData = [
  {
    title: '10% cashback on handi treasures',
    description: 'Max cashback: NPR 1200',
    couponCode: 'CRAFT10',
    image: 'https://res.cloudinary.com/dg9elubn7/image/upload/v1760527014/Handicraft1_phz5vt.png',
    link: '/category/handicrafts', 
    theme: 'blue',
    isActive: true
  },

  {
    title: 'Say yes to craft season',
    description: 'Refresh your space in the cultural way',
    couponCode: null, 
    image: 'https://res.cloudinary.com/dg9elubn7/image/upload/v1760527031/thanka_bsxz80.jpg',
    link: '/category/thangka-and-wall-decor', 
    theme: 'yellow',
    isActive: true
  },
  {
    title: 'When in doubt gift heritage',
    description: 'Perfect for festivals, weddings & rituals',
    couponCode: null, 
    image: 'https://res.cloudinary.com/dg9elubn7/image/upload/v1760527060/Gifts_cknjhc.png',
    link: '/category/gifts-and-souvenirs', 
    theme: 'blue',
    isActive: true
  },
  {
    title: 'Welcome Offer',
    description:
      'Get 15% off on your first order, up to Rs. 500! Use code: NAMASTE15',
      image: null,
    link: null, 
    isActive: true,
  },
  {
    title: 'Dashain Special',
    description:
      'Celebrate the festival with a flat Rs. 400 off on orders above Rs. 2,500. Use code: DASHAIN400',
      image: null,
    link: null, 
    isActive: true,
  },
  {
    title: 'eSewa Payment Offer',
    description:
      'Enjoy an instant 10% discount up to Rs. 300 when you pay with eSewa. Use code: ESEWA10',
      image: null,
    link: null, 
    isActive: true,
  },
  {
    title: 'Pashmina Perfection',
    description:
      'Stay warm with 20% off up to Rs. 1,000 on all our genuine Pashmina scarves. Use code: PASHMINA20',
      image: null,
    link: null, 
    isActive: true,
  },
  {
    title: 'Free Valley Delivery',
    description:
      'Enjoy free shipping inside Kathmandu Valley for all orders over Rs. 2,000.',
      image: null,
    link: null, 
    isActive: true,
  },
  
];


const couponsData = [
  {
    code: 'CRAFT10',
    discountType: 'percentage',
    discountValue: 10,
    minimumPurchaseAmount: 6000,
    maxDiscountAmount: 1200, 
    isActive: true,
  },
  {
    code: 'NAMASTE15',
    discountType: 'percentage',
    discountValue: 15,
    minimumPurchaseAmount: 1000,
    maxDiscountAmount: 500, 
    isActive: true,
  },
  {
    code: 'DASHAIN400',
    discountType: 'fixed',
    discountValue: 400,
    minimumPurchaseAmount: 2500,
    isActive: true,
  },
  {
    code: 'ESEWA10',
    discountType: 'percentage',
    discountValue: 10,
    minimumPurchaseAmount: 1000,
    maxDiscountAmount: 300,
    isActive: true,
  },
  {
    code: 'PASHMINA20',
    discountType: 'percentage',
    discountValue: 20,
    minimumPurchaseAmount: 0,
    maxDiscountAmount: 1000,
    isActive: true,
  },
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    await Settings.deleteMany({});
    await Offer.deleteMany({});
    await Coupon.deleteMany({});
    console.log('✅ Cleared existing settings, offers, and coupons');

    await Settings.insertMany(settingsData);
    await Offer.insertMany(offersData);
    await Coupon.insertMany(couponsData);
    console.log(
      `✅ Added ${settingsData.length} settings, ${offersData.length} offers, and ${couponsData.length} coupons.`,
    );

    console.log('\n🎉 Shop data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();