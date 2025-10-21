const Settings = require('../models/Settings');
const Offer = require('../models/Offer');
const Coupon = require('../models/Coupon');
const User = require('../models/User');

exports.getSettings = async (req, res) => {
  try {
    const settings = await Settings.getSingleton();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getActiveOffers = async (req, res) => {
  try {
    const offers = await Offer.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(3);

    res.json(offers);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getOffersWithImages = async (req, res) => {
  try {
    const offers = await Offer.find({
      isActive: true,
      image: { $ne: null, $exists: true },
    }).sort({ createdAt: -1 });

    res.json(offers);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getOffersWithoutImages = async (req, res) => {
  try {
    const offers = await Offer.find({
      isActive: true,
      $or: [{ image: null }, { image: { $exists: false } }],
    }).sort({ createdAt: -1 });

    res.json(offers);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getActiveTextOffers = async (req, res) => {
  try {
    const offers = await Offer.find({ isActive: true, image: null }).sort({
      createdAt: -1,
    });

    res.json(offers);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
exports.applyCoupon = async (req, res) => {
  const { couponCode, cartTotal } = req.body;

  try {
    const coupon = await Coupon.findOne({
      code: couponCode.toUpperCase(),
      isActive: true,
    });

    if (!coupon) {
      return res.status(404).json({ message: 'Invalid coupon code.' });
    }

    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return res
        .status(400)
        .json({ message: 'This coupon has expired and is no longer valid.' });
    }

    if (cartTotal < coupon.minimumPurchaseAmount) {
      return res.status(400).json({
        message: `This coupon requires a minimum purchase of Rs. ${coupon.minimumPurchaseAmount.toLocaleString()}.`,
      });
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (cartTotal * coupon.discountValue) / 100;

      if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
        discount = coupon.maxDiscountAmount;
      }
    } else {
      discount = coupon.discountValue;
    }

    res.json({
      success: true,
      message: `Coupon "${coupon.code}" applied!`,
      discountAmount: discount,
      coupon: coupon,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
