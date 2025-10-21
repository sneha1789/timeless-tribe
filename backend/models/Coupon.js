const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    discountType: {
        type: String,
        required: true,
        enum: ['percentage', 'fixed']
    },
    discountValue: {
        type: Number,
        required: true
    },
    // --- ADD THIS NEW FIELD ---
    minimumPurchaseAmount: {
        type: Number,
        default: 0 // Default to 0, meaning no minimum purchase is required
    },

     maxDiscountAmount: {
      type: Number // Optional: The maximum discount amount for percentage coupons
  },
    isActive: {
        type: Boolean,
        default: true
    },
    expiresAt: {
        type: Date
    }
}, { timestamps: true });

const Coupon = mongoose.model('Coupon', couponSchema);
module.exports = Coupon;