const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    couponCode: { type: String, trim: true, uppercase: true },
    image: { type: String, required: false },
    link: { type: String, default: '#' },
    theme: { type: String, enum: ['blue', 'yellow'], default: 'blue' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const Offer = mongoose.model('Offer', offerSchema);
module.exports = Offer;
