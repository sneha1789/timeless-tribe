require('dotenv').config();
const mongoose = require('mongoose');
const algoliasearch = require('algoliasearch').default || require('algoliasearch');
const Product = require('./models/Product');

async function syncToAlgolia() {
  // Check for environment variables first
  if (!process.env.MONGO_URI || !process.env.ALGOLIA_APP_ID || !process.env.ALGOLIA_ADMIN_KEY) {
    console.error('❌ Missing required environment variables (MONGO_URI, ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY).');
    process.exit(1);
  }

  try {
    // --- 1. CONNECT TO DATABASE ---
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected.');

    // --- 2. INITIALIZE ALGOLIA ---
    const client = algoliasearch(process.env.ALGOLIA_APP_ID, process.env.ALGOLIA_ADMIN_KEY);
    const index = client.initIndex('products');
    console.log('✅ Algolia index initialized.');

    // --- 3. FETCH ALL PRODUCTS ---
    console.log('Fetching all products from the database...');
    const products = await Product.find({});
    console.log(`Found ${products.length} products to sync.`);

    if (products.length === 0) {
      console.log('No products to sync. Exiting.');
      return;
    }

   const algoliaRecords = products.map(doc => ({
  objectID: doc._id.toString(),
  name: doc.name,
  slug: doc.slug,
  category: doc.category,
  material: doc.specifications?.material || '',
  keywords: doc.keywords || [],
  rating: doc.rating || 0,
  artisan: doc.artisan, 
  variants: doc.variants, 
  image: doc.variants?.[0]?.images?.[0]?.url || '',
  price: doc.variants?.[0]?.price || 0,
  createdAt: doc.createdAt,
  originalPrice: doc.variants?.[0]?.originalPrice || 0,
}));


    console.log('Clearing existing Algolia index...');
    await index.clearObjects();
    
    console.log('Uploading new records to Algolia... This may take a moment.');
    const result = await index.saveObjects(algoliaRecords);
if (result.taskIDs && result.taskIDs.length > 0) {
  await index.waitTask(result.taskIDs[0]);
}

    console.log(`🎉 Successfully synced ${algoliaRecords.length} products to Algolia!`);

  } catch (error) {
    console.error('❌ An error occurred during the sync process:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected.');
  }
}

syncToAlgolia();