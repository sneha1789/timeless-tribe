const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const addressSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      enum: ['Home', 'Work', 'Other'],
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    street: {
      type: String,
      required: true,
      trim: true,
    },
    area: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      default: 'Kathmandu',
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: function () {
        return !this.mobile;
      },
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    mobile: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    password: {
      type: String,
    },
    profilePicture: {
      type: String,
      default: '',
    },
    googleId: {},
    role: {},
    isEmailVerified: { type: Boolean, default: false },
    isMobileVerified: { type: Boolean, default: false },
    emailVerificationToken: String,
    mobileVerificationToken: String,
    emailVerificationExpires: Date,
    mobileVerificationExpires: Date,
    loginOtp: { type: String, default: null },
    loginOtpExpires: { type: Date, default: null },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    resetPasswordAttempts: { type: Number, default: 0 },
    resetPasswordLockoutExpires: Date,

    dob: {
      type: Date,
    },

    emailLastChangedAt: {
      type: Date,
    },
    mobileLastChangedAt: {
      type: Date,
    },

    pendingEmail: {
      type: String,
      lowercase: true,
      trim: true,
    },
    pendingMobile: {
      type: String,
      trim: true,
    },
    changeVerificationToken: {
      type: String,
    },
    changeVerificationExpires: {
      type: Date,
    },

    cart: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        variantName: { type: String, required: true },
        size: { type: String, required: true },
        quantity: { type: Number, default: 1 },
      },
    ],

    addresses: [addressSchema],

    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
  },
  {
    timestamps: true,
  },
);

userSchema.pre('save', async function (next) {
  if (
    !this.isModified('password') ||
    this.password.startsWith('google-oauth-')
  ) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  if (this.googleId && this.password.startsWith('google-oauth-')) {
    return false;
  }
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
