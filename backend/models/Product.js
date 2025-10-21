const mongoose = require('mongoose');
const algoliasearch = require('algoliasearch').default || require('algoliasearch'); // Use the simple require

// --- START ALGOLIA SETUP ---
// We will only initialize the client if the API keys are present.
// This prevents crashes if you run a script that doesn't need Algolia.
let index;
if (process.env.ALGOLIA_APP_ID && process.env.ALGOLIA_ADMIN_KEY) {
  const client = algoliasearch(process.env.ALGOLIA_APP_ID, process.env.ALGOLIA_ADMIN_KEY);
  index = client.initIndex('products');
}

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, required: true, trim: true },
    comment: { type: String, required: true, trim: true },
    images: [{ type: String }],
    isVerified: { type: Boolean, default: false },
    helpful: { type: Number, default: 0 },
    notHelpful: { type: Number, default: 0 },
    voters: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        vote: { type: String, enum: ['helpful', 'notHelpful'] },
      },
    ],
  },
  { timestamps: true },
);

const sizeStockSchema = new mongoose.Schema(
  {
    size: { type: String, required: true },
    stock: { type: Number, required: true, default: 0 },
  },
  { _id: false },
);

const variantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    swatchImage: { type: String, required: true },
    images: [
      {
        url: { type: String, required: true },
      },
    ],
    price: { type: Number, required: true },
    originalPrice: { type: Number, required: true },
    stockBySize: [sizeStockSchema],
  },
  { _id: false },
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    keywords: [{ type: String }],
    artisan: {
      name: { type: String, required: true },
      location: { type: String },
      profilePictureUrl: { type: String },
    },
    story: { type: String },
    featured: { type: Boolean, default: false },
    variants: [variantSchema],
    features: [String],
    specifications: {
      dimensions: { type: String },
      weight: { type: String },
      material: { type: String },
      careInstructions: { type: String },
    },
    sizeChart: {
      headers: [String],
      rows: [[String]],
      note: { type: String },
    },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0 },
    reviews: [reviewSchema],
  },
  { timestamps: true },
);


// --- Mongoose Hooks for Automatic Syncing ---
productSchema.post('save', async function (doc) {
  if (!index) return; // Don't sync if Algolia isn't configured

  const record = {
    objectID: doc._id.toString(),
    name: doc.name,
    slug: doc.slug,
    category: doc.category,
    material: doc.specifications?.material || '',
    keywords: doc.keywords || [],
    rating: doc.rating || 0,
    image: doc.variants[0]?.images[0]?.url || '',
    price: doc.variants[0]?.price || 0,
    originalPrice: doc.variants[0]?.originalPrice || 0,
  };

  try {
    await index.saveObject(record);
    console.log(`[Algolia] Synced product: ${doc.name}`);
  } catch (error) {
    console.error(`[Algolia] Error syncing product ${doc._id}:`, error);
  }
});

productSchema.post('remove', async function (doc) {
  if (!index) return; // Don't sync if Algolia isn't configured
  try {
    await index.deleteObject(doc._id.toString());
    console.log(`[Algolia] Removed product: ${doc.name}`);
  } catch(error) {
    console.error(`[Algolia] Error removing product ${doc._id}:`, error);
  }
});
productSchema.methods.updateProductRating = function () {
  if (this.reviews && this.reviews.length > 0) {
    const totalRating = this.reviews.reduce(
      (sum, review) => sum + review.rating,
      0,
    );
    this.rating = (totalRating / this.reviews.length).toFixed(1);
    this.ratingCount = this.reviews.length;
  } else {
    this.rating = 0;
    this.ratingCount = 0;
  }
};


productSchema.pre('save', function (next) {
  if (this.isModified('stock')) {
    this.inStock = this.stock > 0;
  }

  if (this.isModified('reviews')) {
    this.updateProductRating();
  }

  next();
});
const Product = mongoose.model('Product', productSchema);
module.exports = Product;