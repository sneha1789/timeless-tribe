const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Product',
    },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    variantName: { type: String, required: true },
    size: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number, required: true },
    quantity: { type: Number, required: true },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    orderItems: [orderItemSchema],
    shippingAddress: {
      fullName: { type: String, required: true },
      street: { type: String, required: true },
      area: { type: String, required: true },
      city: { type: String, required: true },
      phone: { type: String, required: true },
    },
    itemsPrice: { type: Number, required: true },
    discountOnMRP: { type: Number, required: true, default: 0 },
    couponCode: { type: String },
    couponDiscount: { type: Number, required: true, default: 0 },
    shippingPrice: { type: Number, required: true, default: 0 },
    totalPrice: { type: Number, required: true },
    paymentMethod: {
  type: String,
  required: false, // Make it not required
  enum: ['eSewa', 'COD', 'Khalti', 'pending'],
  default: 'pending'
},
    paymentStatus: {
      type: String,
      required: true,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
     cancelledAt: {
      type: Date,
    },
    cancellationReason: {
      type: String,
    },
    paymentGatewayId: { type: String },
    paidAt: { type: Date },
    orderStatus: {
      type: String,
      required: true,
      enum: [
        'pending_payment',
        'processing',
        'shipped',
        'delivered',
        'cancelled',
      ],
      default: 'pending_payment',
    },
    
    deliveredAt: { type: Date },
  },
  {
    timestamps: true,
  },
);

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
