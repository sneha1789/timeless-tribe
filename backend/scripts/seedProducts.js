const mongoose = require('mongoose');
const Product = require('../models/Product'); // Ensure this path is correct

// IMPORTANT: Replace this with your actual MongoDB connection string
const MONGODB_URI = 'mongodb://localhost:27017/website';
// Example for your cloud DB if you switch back:
// const MONGODB_URI = 'mongodb+srv://ecommerce-website129:snehakhatoon2205@ecommerce-website.htei7az.mongodb.net/ecommerce-db';

// --- Reusable Size Chart Objects ---
const clothingSizeChart = {
  headers: ['Size', 'Chest (in)', 'Waist (in)', 'Length (in)'],
  rows: [
    ['S', '36-38', '30-32', '27'],
    ['M', '39-41', '33-35', '28'],
    ['L', '42-44', '36-38', '29'],
    ['XL', '45-47', '39-41', '30'],
    ['XXL', '48-50', '42-44', '31'],
  ],
  note: 'Measurements are approximate. Please allow for a +/- 0.5 inch tolerance.',
};

const ringSizeChart = {
  headers: ['US Size', 'Diameter (mm)'],
  rows: [
    ['7', '17.3'],
    ['8', '18.1'],
    ['9', '18.9'],
    ['10', '19.8'],
  ],
  note: 'To find your size, measure the diameter of an existing ring.',
};

const sampleProducts = [
  // =================================================
  // == 1. JEWELRY (10 Products)
  // =================================================
  {
    name: 'Mandala Pendant',
    slug: 'mandala-pendant',
    description:
      'A beautiful pendant with an intricate mandala design, symbolizing the universe and spiritual journey. Available in classic sterling silver or elegant gold plating.',
    category: 'jewelry',
    artisan: {
      name: 'Mandala Artisans',
      location: 'Bhaktapur, Nepal',
      profilePictureUrl: 'https://i.imgur.com/mOMg2kY.jpeg',
    },
    story:
      'Each line in the mandala is hand-etched by artisans in Bhaktapur, a city renowned for its rich artistic heritage.',
    features: [
      '925 Sterling Silver base',
      'Hand-etched details',
      'Includes matching chain',
    ],
    keywords: [
  "mandala pendant",
  "spiritual jewelry",
  "boho necklace",
  "silver mandala",
  "yoga jewelry",
  "meditation pendant",
  "handcrafted jewelry",
  "Nepal jewelry",
  "chakra necklace",
  "bohemian style",
  "artisan pendant",
  "spiritual accessory"
],

    specifications: {
      dimensions: '3cm diameter',
      weight: '8g',
      material: 'Sterling Silver, Gold Plating',
      careInstructions: 'Polish with a soft cloth.',
    },
    variants: [
      {
        name: 'Sterling Silver',
        swatchImage: 'https://i.imgur.com/8i2tU6m.jpeg',
        images: [{ url: 'https://i.imgur.com/8i2tU6m.jpeg' }],
        price: 1200,
        originalPrice: 1900,
        stockBySize: [{ size: 'Free Size', stock: 25 },
                      { size : 'S', stock: 3  },
                      { size : 'M', stock : 10}
        ],
      },
      {
        name: 'Gold Plated',
        swatchImage: 'https://i.imgur.com/tQj2sE8.jpeg',
        images: [{ url: 'https://i.imgur.com/fP8wZfA.jpeg' }],
        price: 1500,
        originalPrice: 2200,
        stockBySize: [{ size: 'Free Size', stock: 15 }],
      },
    ],
    // No size chart for pendants
  },
  {
    name: 'Silver Filigree Earrings',
    slug: 'silver-filigree-earrings',
    description:
      'Intricate silver filigree work earrings, handcrafted by master artisans in Patan. A perfect blend of traditional Newari design and contemporary elegance.',
    category: 'jewelry',
    featured: true,
    artisan: {
      name: 'Silver Smiths Nepal',
      location: 'Patan, Kathmandu',
      profilePictureUrl: 'https://i.imgur.com/mOMg2kY.jpeg',
    },
    story:
      'This filigree technique has been passed down through generations of Newari silversmiths, preserving a rich cultural heritage in each delicate piece.',
    features: [
      'Handcrafted by skilled Nepali artisans',
      'Authentic traditional filigree design',
      'Made with 925 Sterling Silver',
      'Lightweight for comfortable wear',
    ],
    keywords: [
  "silver earrings",
  "filigree design",
  "handcrafted jewelry",
  "Nepal earrings",
  "bohemian style",
  "traditional silver",
  "ethnic jewelry",
  "gift for her",
  "artisan earrings",
  "vintage silver",
  "delicate filigree",
  "statement earrings"
],

    specifications: {
      dimensions: '5cm length',
      weight: '12g',
      material: '925 Sterling Silver, Pearl',
      careInstructions:
        'Clean with a soft cloth. Avoid contact with chemicals.',
    },
    variants: [
      {
        name: 'Classic Silver',
        swatchImage: 'https://i.imgur.com/L6A4KP6.jpeg',
        images: [
          { url: 'https://i.imgur.com/L6A4KP6.jpeg' },
          { url: 'https://i.imgur.com/5S25D8m.jpeg' },
        ],
        price: 1850,
        originalPrice: 2800,
        stockBySize: [{ size: 'Free Size', stock: 4 }],
      },
      {
        name: 'Silver with Pearl',
        swatchImage: 'https://i.imgur.com/xY4g7bC.jpeg',
        images: [{ url: 'https://i.imgur.com/xY4g7bC.jpeg' }],
        price: 2200,
        originalPrice: 3200,
        stockBySize: [{ size: 'Free Size', stock: 8 }],
      },
    ],
    // No size chart for earrings
  },
  {
    name: 'Himalayan Stone Necklace',
    slug: 'himalayan-stone-necklace',
    description:
      'Beautiful silver necklace with authentic Himalayan stones, believed to bring good fortune and protection.',
    category: 'jewelry',
    artisan: {
      name: 'Himalayan Jewelers',
      location: 'Kathmandu Valley',
      profilePictureUrl: 'https://i.imgur.com/p9LcN3m.jpeg',
    },
    story:
      'Each stone is carefully selected from Himalayan sources and set by hand using traditional techniques passed down through generations.',
    features: [
      'Genuine Himalayan semi-precious stones',
      'Hand-set stones in a silver bezel',
      'Adjustable chain length',
      'Cultural significance',
    ],
    keywords: [
  "himalayan stone necklace",
  "natural stone jewelry",
  "healing stones",
  "boho necklace",
  "crystal jewelry",
  "handmade necklace",
  "energy jewelry",
  "spiritual accessory",
  "gemstone necklace",
  "chakra stones",
  "artisan jewelry",
  "Nepal handcrafted"
],

    specifications: {
      dimensions: '45cm chain length',
      weight: '25g',
      material: 'Silver, Turquoise, Lapis Lazuli',
      careInstructions: 'Store separately to avoid scratches.',
    },
    variants: [
      {
        name: 'Tibetan Turquoise',
        swatchImage: 'https://i.imgur.com/K5S82gB.jpeg',
        images: [{ url: 'https://i.imgur.com/K5S82gB.jpeg' }],
        price: 3200,
        originalPrice: 4500,
        stockBySize: [{ size: 'Free Size', stock: 7 }],
      },
      {
        name: 'Lapis Lazuli',
        swatchImage: 'https://i.imgur.com/cW9s8dF.jpeg',
        images: [{ url: 'https://i.imgur.com/rX0v4jH.jpeg' }],
        price: 2900,
        originalPrice: 4200,
        stockBySize: [{ size: 'Free Size', stock: 9 }],
      },
    ],
    // No size chart for necklaces
  },
  {
    name: 'Rudraksha Mala Bracelet',
    slug: 'rudraksha-mala-bracelet',
    description:
      'Authentic 5-faced Rudraksha bead bracelet with silver accents, revered in Hindu and Buddhist traditions for spiritual benefits.',
    category: 'jewelry',
    featured: true,
    artisan: {
      name: 'Spiritual Craftsmen',
      location: 'Lumbini',
      profilePictureUrl: 'https://i.imgur.com/s5vL2qT.jpeg',
    },
    story:
      'Hand-strung by monks in Himalayan monasteries using traditional counting methods.',
    features: [
      'Genuine 5-face Rudraksha beads',
      '925 Silver accents',
      'Durable elastic cord',
      'Spiritual significance',
    ],
    keywords: [
  "rudraksha bracelet",
  "mala beads",
  "spiritual jewelry",
  "yoga bracelet",
  "meditation accessory",
  "Hindu prayer beads",
  "natural seed bracelet",
  "Nepal mala",
  "energy healing",
  "unisex bracelet",
  "handmade jewelry",
  "traditional Nepal"
],

    specifications: {
      dimensions: '8mm beads, adjustable fit',
      weight: '20g',
      material: 'Rudraksha Seeds, Silver',
      careInstructions: 'Keep dry and clean with soft brush.',
    },
    variants: [
      {
        name: 'Natural',
        swatchImage: 'https://i.imgur.com/mN7K8pB.jpeg',
        images: [{ url: 'https://i.imgur.com/mN7K8pB.jpeg' }],
        price: 950,
        originalPrice: 1500,
        stockBySize: [{ size: 'Free Size', stock: 30 }],
      },
    ],
  },
  {
    name: 'Silver Prayer Wheel Pendant',
    slug: 'silver-prayer-wheel-pendant',
    description:
      'Miniature silver prayer wheel pendant that actually spins, containing rolled mantras inside.',
    category: 'jewelry',
    featured: true,
    artisan: {
      name: 'Spiritual Silver Crafts',
      location: 'Boudhanath, Kathmandu',
      profilePictureUrl: 'https://i.imgur.com/q9T4mRn.jpeg',
    },
    story:
      'Each pendant contains hand-written mantras by Buddhist monks, following ancient traditions.',
    features: [
      'Functional spinning wheel',
      'Contains authentic mantras',
      'Silver chain included',
      'Spiritual significance',
    ],
    specifications: {
      dimensions: '3cm pendant, 50cm chain',
      weight: '28g',
      material: '925 Sterling Silver',
      careInstructions: 'Spin gently, avoid forcing the mechanism.',
    },
    keywords: [
  "prayer wheel pendant",
  "Buddhist jewelry",
  "silver pendant",
  "spiritual necklace",
  "mantra pendant",
  "Tibetan jewelry",
  "meditation charm",
  "handcrafted Nepal",
  "religious jewelry",
  "boho silver",
  "devotional accessory",
  "sacred symbol"
],

    variants: [
      {
        name: 'Standard',
        swatchImage: 'https://i.imgur.com/v3L8sP2.jpeg',
        images: [{ url: 'https://i.imgur.com/v3L8sP2.jpeg' }],
        price: 2400,
        originalPrice: 3200,
        stockBySize: [{ size: 'Free Size', stock: 5 }],
      },
    ],
  },
  {
    name: 'Lapis Lazuli Ring',
    slug: 'lapis-lazuli-ring',
    description:
      'Statement ring featuring a genuine Lapis Lazuli or Moonstone in a sterling silver setting.',
    category: 'jewelry',
    artisan: {
      name: 'Gemstone Specialists',
      location: 'Kathmandu',
      profilePictureUrl: 'https://i.imgur.com/r5T9sLm.jpeg',
    },
    story:
      'Lapis Lazuli has been prized in Himalayan regions for centuries for its deep blue color.',
    features: [
      'Genuine semi-precious stone',
      'Silver bezel setting',
      'Available in multiple sizes',
      'Statement piece',
    ],
    keywords: [
  "lapis lazuli ring",
  "gemstone ring",
  "blue stone jewelry",
  "healing crystal ring",
  "handmade silver ring",
  "bohemian jewelry",
  "unisex ring",
  "energy stone",
  "artisanal jewelry",
  "spiritual ring",
  "chakra jewelry",
  "Nepal handmade"
],

    specifications: {
      dimensions: 'Stone: 1.5cm diameter',
      weight: '15g',
      material: 'Silver with Lapis Lazuli, Moonstone',
      careInstructions: 'Avoid impacts to protect stone.',
    },
    // --- SIZE CHART ADDED ---
    sizeChart: ringSizeChart,
    variants: [
      {
        name: 'Lapis Lazuli',
        swatchImage: 'https://i.imgur.com/n4K2v8L.jpeg',
        images: [{ url: 'https://i.imgur.com/n4K2v8L.jpeg' }],
        price: 1700,
        originalPrice: 2300,
        stockBySize: [
          { size: '7', stock: 3 },
          { size: '8', stock: 3 },
          { size: '9', stock: 2 },
        ],
      },
      {
        name: 'Moonstone',
        swatchImage: 'https://i.imgur.com/4gW5f1D.jpeg',
        images: [{ url: 'https://i.imgur.com/T0b1J8O.jpeg' }],
        price: 1600,
        originalPrice: 2200,
        stockBySize: [
          { size: '7', stock: 4 },
          { size: '8', stock: 0 },
          { size: '9', stock: 5 },
        ],
      },
    ],
  },
  {
    name: 'Traditional Gold Plated Tilhari',
    slug: 'traditional-gold-plated-tilhari',
    description:
      'A classic Nepali necklace worn by married women, featuring green beads and a central gold-plated pendant. A symbol of marriage and prosperity.',
    category: 'jewelry',
    artisan: {
      name: 'Nari Jewellers',
      location: 'Kathmandu',
      profilePictureUrl: 'https://i.imgur.com/mOMg2kY.jpeg',
    },
    story:
      "The Tilhari is an essential part of a Nepali woman's traditional attire, often passed down through generations as a family heirloom.",
    features: [
      'Gold-plated central pendant',
      'High-quality glass beads',
      'Symbol of marital status',
      'Authentic design',
    ],
    keywords: [
  "tilhari necklace",
  "traditional Nepali jewelry",
  "gold plated necklace",
  "wedding jewelry",
  "cultural jewelry",
  "ethnic Nepal jewelry",
  "festival wear",
  "handcrafted ornament",
  "Hindu jewelry",
  "bridal jewelry",
  "traditional women",
  "Nepal heritage"
],

    specifications: {
      dimensions: 'Approx. 50cm length',
      weight: '40g',
      material: 'Brass, Gold Plating, Glass Beads',
      careInstructions: 'Keep dry and store in a box to prevent tangling.',
    },
    variants: [
      {
        name: 'Classic Green',
        swatchImage: 'https://i.imgur.com/2aBcDef.jpeg',
        images: [{ url: 'https://i.imgur.com/2aBcDef.jpeg' }],
        price: 2500,
        originalPrice: 3500,
        stockBySize: [{ size: 'Free Size', stock: 18 }],
      },
    ],
  },
  {
    name: 'Silver Mantra Spinning Ring',
    slug: 'silver-mantra-spinning-ring',
    description:
      'A sterling silver ring with a central spinning band engraved with the "Om Mani Padme Hum" mantra. Believed to bring peace and good karma.',
    category: 'jewelry',
    artisan: {
      name: 'Mantra Engravers',
      location: 'Boudhanath',
      profilePictureUrl: 'https://i.imgur.com/m3K4v8L.jpeg',
    },
    story:
      'Inspired by Tibetan prayer wheels, spinning the ring is said to have the same spiritual effect as reciting the mantra.',
    features: [
      'Functional spinning center band',
      'Hand-engraved mantra',
      '925 Sterling Silver',
      'Comfort fit',
    ],
    keywords: [
  "mantra ring",
  "spinning ring",
  "Buddhist jewelry",
  "silver meditation ring",
  "anxiety relief ring",
  "spiritual accessory",
  "engraved mantra",
  "Tibetan ring",
  "unisex silver",
  "fidget ring",
  "handmade jewelry",
  "mindfulness ring"
],

    specifications: {
      dimensions: 'Band width: 10mm',
      weight: '14g',
      material: 'Sterling Silver',
      careInstructions:
        'Polish occasionally. The engraving will darken naturally.',
    },
    // --- SIZE CHART ADDED ---
    sizeChart: ringSizeChart,
    variants: [
      {
        name: 'Polished Silver',
        swatchImage: 'https://i.imgur.com/3bCdEfg.jpeg',
        images: [{ url: 'https://i.imgur.com/3bCdEfg.jpeg' }],
        price: 1800,
        originalPrice: 2600,
        stockBySize: [
          { size: '8', stock: 10 },
          { size: '9', stock: 12 },
          { size: '10', stock: 8 },
        ],
      },
    ],
  },
  {
    name: 'Newari Jhumka Earrings',
    slug: 'newari-jhumka-earrings',
    description:
      'Stunning gold-plated Jhumka earrings featuring traditional Newari motifs and delicate pearl drops. Perfect for festive occasions.',
    category: 'jewelry',
    artisan: {
      name: 'Patan Gold Crafts',
      location: 'Patan',
      profilePictureUrl: 'https://i.imgur.com/mOMg2kY.jpeg',
    },
    story:
      'Jhumkas are a timeless piece of South Asian jewelry, and this design incorporates unique artistic elements from the Newar culture of the Kathmandu Valley.',
    features: [
      'Traditional bell shape (Jhumka)',
      'Intricate Newari patterns',
      'Gold-plated with pearl accents',
      'Festive and elegant',
    ],
    keywords: [
  "newari jhumka earrings",
  "traditional earrings",
  "Nepal ethnic jewelry",
  "handcrafted Nepal",
  "heritage jewelry",
  "festival wear",
  "silver jhumka",
  "artisanal design",
  "boho style",
  "women fashion jewelry",
  "cultural accessory",
  "handmade earrings"
],

    specifications: {
      dimensions: '6cm length',
      weight: '18g per pair',
      material: 'Brass, Gold Plating, Faux Pearls',
      careInstructions: 'Avoid contact with perfume and water.',
    },
    variants: [
      {
        name: 'Gold with Red Stone',
        swatchImage: 'https://i.imgur.com/4cDeFgh.jpeg',
        images: [{ url: 'https://i.imgur.com/4cDeFgh.jpeg' }],
        price: 1650,
        originalPrice: 2400,
        stockBySize: [{ size: 'Free Size', stock: 14 }],
      },
    ],
  },
  {
    name: 'Ganesh Silver Pendant',
    slug: 'ganesh-silver-pendant',
    description:
      'A finely detailed sterling silver pendant of Lord Ganesh, the remover of obstacles and god of new beginnings.',
    category: 'jewelry',
    artisan: {
      name: 'Silver Smiths Nepal',
      location: 'Patan',
      profilePictureUrl: 'https://i.imgur.com/mOMg2kY.jpeg',
    },
    story:
      'Lord Ganesh is one of the most beloved deities in Hinduism. This pendant is crafted with devotion to capture his benevolent essence.',
    features: [
      'Detailed depiction of Lord Ganesh',
      '925 Sterling Silver',
      'Oxidized finish for depth',
      'Chain not included',
    ],
    keywords: [
  "ganesh pendant",
  "silver religious jewelry",
  "Hindu god jewelry",
  "handcrafted Nepal",
  "spiritual necklace",
  "lord ganesha",
  "devotional pendant",
  "spiritual wear",
  "faith symbol",
  "traditional design",
  "protective charm",
  "artisanal silver"
],

    specifications: {
      dimensions: '2.5cm height',
      weight: '7g',
      material: '925 Sterling Silver',
      careInstructions: 'Polish with a silver cleaning cloth.',
    },
    variants: [
      {
        name: 'Oxidized Silver',
        swatchImage: 'https://i.imgur.com/5dEfGhi.jpeg',
        images: [{ url: 'https://i.imgur.com/5dEfGhi.jpeg' }],
        price: 1100,
        originalPrice: 1700,
        stockBySize: [{ size: 'Free Size', stock: 22 }],
      },
    ],
  },

  // =================================================
  // == 2. KHUKURI BROOCH (10 Products) - Size charts are not applicable here
  // =================================================
  // ... (10 products as provided before, without size charts)
  {
    name: 'Classic Gorkha Khukuri Brooch',
    slug: 'classic-gorkha-khukuri-brooch',
    description:
      'A beautifully crafted brooch in the shape of the iconic Gorkha Khukuri, a symbol of bravery and valor. Perfect for adorning coats, jackets, or traditional attire.',
    category: 'khukuri-brooch',
    artisan: {
      name: 'Gorkha Bladesmiths',
      location: 'Gorkha',
      profilePictureUrl: 'https://i.imgur.com/k9T4v8N.jpeg',
    },
    story:
      'This brooch pays homage to the legendary Gorkha soldiers and their world-renowned blade, the Khukuri.',
    features: [
      'Detailed miniature Khukuri design',
      'Polished brass finish',
      'Secure pin-back closure',
    ],
    keywords: [
  "gorkha khukuri brooch",
  "Nepali army pin",
  "heritage jewelry",
  "national pride symbol",
  "handcrafted Nepal",
  "traditional brooch",
  "military accessory",
  "collector’s item",
  "khukuri badge",
  "men’s accessory",
  "unisex pin",
  "patriotic jewelry"
],

    specifications: {
      dimensions: '7cm length',
      weight: '15g',
      material: 'Brass',
      careInstructions: 'Polish with a dry cloth to maintain shine.',
    },
    variants: [
      {
        name: 'Polished Brass',
        swatchImage: 'https://i.imgur.com/khukuri.jpg',
        images: [{ url: 'https://i.imgur.com/khukuri.jpg' }],
        price: 800,
        originalPrice: 1000,
        stockBySize: [{ size: 'Free Size', stock: 50 }],
      },
    ],
  },
  {
    name: 'Sterling Silver Khukuri Lapel Pin',
    slug: 'sterling-silver-khukuri-lapel-pin',
    description:
      'An elegant and subtle lapel pin made from 925 Sterling Silver, shaped like a traditional Khukuri. Ideal for formal wear and suits.',
    category: 'khukuri-brooch',
    artisan: {
      name: 'Silver Smiths Nepal',
      location: 'Patan',
      profilePictureUrl: 'https://i.imgur.com/mOMg2kY.jpeg',
    },
    story:
      'A modern and sophisticated take on a powerful cultural symbol, crafted with the finest materials.',
    features: [
      'Made from 925 Sterling Silver',
      'High-polish finish',
      'Subtle and elegant design',
      'Clutch-back for secure fit',
    ],
    keywords: [
  "silver khukuri lapel pin",
  "Nepal heritage badge",
  "handcrafted accessory",
  "traditional khukuri pin",
  "formal wear",
  "collector jewelry",
  "symbolic design",
  "Nepali pride",
  "Gorkha symbol",
  "silver brooch",
  "artisan handmade",
  "fashion pin"
],

    specifications: {
      dimensions: '5cm length',
      weight: '8g',
      material: '925 Sterling Silver',
      careInstructions: 'Use a silver polishing cloth to clean.',
    },
    variants: [
      {
        name: 'Sterling Silver',
        swatchImage: 'https://i.imgur.com/6fGhIjk.jpeg',
        images: [{ url: 'https://i.imgur.com/6fGhIjk.jpeg' }],
        price: 1500,
        originalPrice: 2200,
        stockBySize: [{ size: 'Free Size', stock: 35 }],
      },
    ],
  },
  {
    name: 'Antique Finish Khukuri Brooch',
    slug: 'antique-finish-khukuri-brooch',
    description:
      'A Khukuri brooch with a rustic antique finish, giving it a vintage, heirloom look. The handle features intricate traditional patterns.',
    category: 'khukuri-brooch',
    artisan: {
      name: 'Himalayan Metalcrafts',
      location: 'Bhaktapur',
      profilePictureUrl: 'https://i.imgur.com/v9T4pRn.jpeg',
    },
    story:
      'This piece is artificially aged to resemble historical artifacts, celebrating the long and storied history of the Khukuri.',
    features: [
      'Vintage antique look',
      'Detailed handle carving',
      'Made from pewter alloy',
      'Secure pin-back',
    ],

    keywords: [
  "antique khukuri brooch",
  "Nepal traditional pin",
  "Gorkha heritage accessory",
  "military symbol",
  "collector brooch",
  "handcrafted Nepal",
  "cultural jewelry",
  "bronze finish pin",
  "ethnic accessory",
  "unisex badge",
  "patriotic jewelry",
  "Nepali craftsmanship"
],

    specifications: {
      dimensions: '7.5cm length',
      weight: '18g',
      material: 'Pewter, Brass Alloy',
      careInstructions: 'Wipe gently with a soft cloth.',
    },
    variants: [
      {
        name: 'Antique Bronze',
        swatchImage: 'https://i.imgur.com/7gHiJkl.jpeg',
        images: [{ url: 'https://i.imgur.com/7gHiJkl.jpeg' }],
        price: 950,
        originalPrice: 1300,
        stockBySize: [{ size: 'Free Size', stock: 40 }],
      },
    ],
  },
  {
    name: 'Crossed Khukuri Regimental Brooch',
    slug: 'crossed-khukuri-regimental-brooch',
    description:
      'Featuring the iconic crossed Khukuris, this brooch is a symbol of the Gorkha Regiments. A powerful statement piece.',
    category: 'khukuri-brooch',
    featured: true,
    artisan: {
      name: 'Gorkha Bladesmiths',
      location: 'Gorkha',
      profilePictureUrl: 'https://i.imgur.com/k9T4v8N.jpeg',
    },
    story:
      'The crossed Khukuris are a globally recognized emblem of courage and the indomitable spirit of the Gorkha soldiers.',
    features: [
      'Iconic crossed Khukuri design',
      'Gold and silver dual-tone finish',
      'Highly detailed craftsmanship',
      'Strong and secure clasp',
    ],
    keywords: [
  "crossed khukuri brooch",
  "regimental badge",
  "military jewelry",
  "handcrafted Nepal",
  "heritage brooch",
  "Gorkha symbol",
  "national pride pin",
  "collector accessory",
  "formal wear badge",
  "traditional khukuri",
  "antique design",
  "patriotic emblem"
],

    specifications: {
      dimensions: '6cm x 5cm',
      weight: '25g',
      material: 'Brass, Nickel Plating',
      careInstructions: 'Avoid scratches and polish gently.',
    },
    variants: [
      {
        name: 'Dual Tone',
        swatchImage: 'https://i.imgur.com/8hIjKlm.jpeg',
        images: [{ url: 'https://i.imgur.com/8hIjKlm.jpeg' }],
        price: 1200,
        originalPrice: 1600,
        stockBySize: [{ size: 'Free Size', stock: 30 }],
      },
    ],
  },
  {
    name: 'Khukuri Brooch with Gemstone',
    slug: 'khukuri-brooch-with-gemstone',
    description:
      'An ornate Khukuri brooch featuring a small, embedded gemstone (Garnet or Lapis Lazuli) on the hilt for an extra touch of elegance.',
    category: 'khukuri-brooch',
    artisan: {
      name: 'Gemstone Specialists',
      location: 'Kathmandu',
      profilePictureUrl: 'https://i.imgur.com/r5T9sLm.jpeg',
    },
    story:
      'This design merges the martial symbolism of the Khukuri with the spiritual and aesthetic beauty of Himalayan gemstones.',
    features: [
      'Embedded semi-precious gemstone',
      'Silver-plated finish',
      'Unique and decorative',
      'Secure pin-back',
    ],
    keywords: [
  "khukuri brooch with gemstone",
  "handcrafted Nepal",
  "traditional pin",
  "Gorkha heritage jewelry",
  "gemstone brooch",
  "silver accessory",
  "collector item",
  "cultural symbol",
  "military badge",
  "fashion jewelry",
  "unisex brooch",
  "artisan made"
],

    specifications: {
      dimensions: '7cm length',
      weight: '16g',
      material: 'Brass, Silver Plating, Gemstone',
      careInstructions: 'Avoid harsh impacts on the stone.',
    },
    variants: [
      {
        name: 'Garnet Stone',
        swatchImage: 'https://i.imgur.com/9iJkLmn.jpeg',
        images: [{ url: 'https://i.imgur.com/9iJkLmn.jpeg' }],
        price: 1350,
        originalPrice: 1800,
        stockBySize: [{ size: 'Free Size', stock: 20 }],
      },
      {
        name: 'Lapis Stone',
        swatchImage: 'https://i.imgur.com/aJkLmno.jpeg',
        images: [{ url: 'https://i.imgur.com/aJkLmno.jpeg' }],
        price: 1350,
        originalPrice: 1800,
        stockBySize: [{ size: 'Free Size', stock: 22 }],
      },
    ],
  },
  {
    name: 'Nepali Flag & Khukuri Pin',
    slug: 'nepali-flag-khukuri-pin',
    description:
      'A patriotic lapel pin featuring the unique flag of Nepal alongside a miniature Khukuri. Made with vibrant enamel colors.',
    category: 'khukuri-brooch',
    artisan: {
      name: 'Kathmandu Souvenirs',
      location: 'Thamel',
      profilePictureUrl: 'https://i.imgur.com/p3L9rTm.jpeg',
    },
    story:
      'A celebration of Nepali national pride, combining two of its most powerful symbols in one elegant pin.',
    features: [
      'Vibrant enamel colors',
      'Features Nepali flag and Khukuri',
      'Gold-tone metal base',
      'Durable clutch-back',
    ],
    keywords: [
  "khukuri brooch with gemstone",
  "handcrafted Nepal",
  "traditional pin",
  "Gorkha heritage jewelry",
  "gemstone brooch",
  "silver accessory",
  "collector item",
  "cultural symbol",
  "military badge",
  "fashion jewelry",
  "unisex brooch",
  "artisan made"
],

    specifications: {
      dimensions: '3cm x 2.5cm',
      weight: '10g',
      material: 'Metal Alloy, Enamel',
      careInstructions: 'Wipe with a soft cloth.',
    },
    variants: [
      {
        name: 'Enamel Pin',
        swatchImage: 'https://i.imgur.com/bKlMnop.jpeg',
        images: [{ url: 'https://i.imgur.com/bKlMnop.jpeg' }],
        price: 600,
        originalPrice: 850,
        stockBySize: [{ size: 'Free Size', stock: 100 }],
      },
    ],
  },
  {
    name: 'Ceremonial Sirupate Khukuri Brooch',
    slug: 'ceremonial-sirupate-khukuri-brooch',
    description:
      'A brooch modeled after the slender "Sirupate" Khukuri, known for its elegant and swift profile. This piece is perfect for formal Nepali attire.',
    category: 'khukuri-brooch',
    artisan: {
      name: 'Gorkha Bladesmiths',
      location: 'Gorkha',
      profilePictureUrl: 'https://i.imgur.com/k9T4v8N.jpeg',
    },
    story:
      'The Sirupate is named after the "Siru" leaf, a slender, sharp leaf found in the hills of Nepal, reflecting the blade\'s shape.',
    features: [
      'Slender Sirupate blade design',
      'Polished silver-tone finish',
      'Elegant and refined',
      'Long pin for secure fastening on thick fabric',
    ],
    keywords: [
  "sirupate khukuri brooch",
  "ceremonial pin",
  "Gorkha badge",
  "traditional khukuri",
  "military symbol",
  "Nepal heritage jewelry",
  "handcrafted Nepal",
  "collector brooch",
  "national pride",
  "warrior emblem",
  "formal accessory",
  "antique style"
],

    specifications: {
      dimensions: '8cm length',
      weight: '14g',
      material: 'Zinc Alloy, Nickel Plating',
      careInstructions: 'Polish with a dry cloth.',
    },
    variants: [
      {
        name: 'Silver Tone',
        swatchImage: 'https://i.imgur.com/cMnOpqr.jpeg',
        images: [{ url: 'https://i.imgur.com/cMnOpqr.jpeg' }],
        price: 900,
        originalPrice: 1250,
        stockBySize: [{ size: 'Free Size', stock: 45 }],
      },
    ],
  },
  {
    name: 'Wooden Handle Khukuri Brooch',
    slug: 'wooden-handle-khukuri-brooch',
    description:
      'A unique Khukuri brooch featuring a miniature, real wood handle for an authentic, rustic look. The blade is made of polished pewter.',
    category: 'khukuri-brooch',
    artisan: {
      name: 'Himalayan Crafts',
      location: 'Pokhara',
      profilePictureUrl: 'https://i.imgur.com/p3L9rTm.jpeg',
    },
    story:
      'This design combines the skills of both metalworkers and woodcarvers to create a uniquely authentic miniature.',
    features: [
      'Genuine Rosewood handle',
      'Polished pewter blade',
      'Rustic and authentic aesthetic',
      'Strong pin clasp',
    ],
    keywords: [
  "wooden handle khukuri brooch",
  "handcrafted pin",
  "traditional Nepal design",
  "heritage jewelry",
  "collector brooch",
  "military accessory",
  "Nepali craftsmanship",
  "Gorkha khukuri",
  "symbolic badge",
  "national pride pin",
  "unisex accessory",
  "antique finish"
],

    specifications: {
      dimensions: '7cm length',
      weight: '17g',
      material: 'Pewter, Rosewood',
      careInstructions: 'Avoid getting the wood wet.',
    },
    variants: [
      {
        name: 'Rosewood Handle',
        swatchImage: 'https://i.imgur.com/dNoPqrs.jpeg',
        images: [{ url: 'https://i.imgur.com/dNoPqrs.jpeg' }],
        price: 1100,
        originalPrice: 1500,
        stockBySize: [{ size: 'Free Size', stock: 25 }],
      },
    ],
  },
  {
    name: 'Gold Plated Kothimora Khukuri Brooch',
    slug: 'gold-plated-kothimora-khukuri-brooch',
    description:
      'A luxurious brooch modeled after the "Kothimora" Khukuri, which features an ornate, decorative scabbard often used for presentation.',
    category: 'khukuri-brooch',
    artisan: {
      name: 'Patan Gold Crafts',
      location: 'Patan',
      profilePictureUrl: 'https://i.imgur.com/mOMg2kY.jpeg',
    },
    story:
      'Kothimora khukuris are presentation pieces, often gifted to retiring Gorkha officers, symbolizing a lifetime of honorable service.',
    features: [
      'Ornate Kothimora scabbard design',
      '24K Gold plating',
      'Highly detailed and decorative',
      'Luxurious statement piece',
    ],
    keywords: [
  "kothimora khukuri brooch",
  "gold plated pin",
  "Nepal traditional jewelry",
  "ceremonial accessory",
  "collector item",
  "heritage badge",
  "handcrafted Nepal",
  "Gorkha emblem",
  "luxury brooch",
  "symbolic jewelry",
  "vintage style",
  "warrior pin"
],

    specifications: {
      dimensions: '7.5cm length',
      weight: '22g',
      material: 'Brass, Gold Plating',
      careInstructions: 'Handle with care to protect plating.',
    },
    variants: [
      {
        name: 'Gold Plated',
        swatchImage: 'https://i.imgur.com/ePqRstu.jpeg',
        images: [{ url: 'https://i.imgur.com/ePqRstu.jpeg' }],
        price: 1800,
        originalPrice: 2500,
        stockBySize: [{ size: 'Free Size', stock: 15 }],
      },
    ],
  },
  {
    name: 'Minimalist Khukuri Tie Clip',
    slug: 'minimalist-khukuri-tie-clip',
    description:
      'A sleek and modern tie clip in the simple silhouette of a Khukuri. Perfect for adding a touch of Nepali heritage to business attire.',
    category: 'khukuri-brooch',
    artisan: {
      name: 'Modern Nepali Designs',
      location: 'Kathmandu',
      profilePictureUrl: 'https://i.imgur.com/p2L8sNq.jpeg',
    },
    story:
      'Designed for the modern professional who wishes to carry a symbol of their heritage in a subtle and stylish way.',
    features: [
      'Sleek, minimalist design',
      'Functions as a tie clip',
      'Brushed metal finish',
      'Strong alligator clasp',
    ],
    keywords: [
  "khukuri tie clip",
  "minimalist accessory",
  "men’s fashion",
  "Nepali heritage pin",
  "formal wear clip",
  "symbolic tie bar",
  "handcrafted Nepal",
  "silver clip",
  "business gift",
  "unisex design",
  "patriotic accessory",
  "artisan craftsmanship"
],

    specifications: {
      dimensions: '5.5cm length',
      weight: '12g',
      material: 'Stainless Steel',
      careInstructions: 'Wipe clean with a cloth.',
    },
    variants: [
      {
        name: 'Brushed Steel',
        swatchImage: 'https://i.imgur.com/fQrStuv.jpeg',
        images: [{ url: 'https://i.imgur.com/fQrStuv.jpeg' }],
        price: 1000,
        originalPrice: 1400,
        stockBySize: [{ size: 'Free Size', stock: 60 }],
      },
    ],
  },

  // =================================================
  // == 3. METAL STATUES (10 Products) - No size charts
  // =================================================
  // ... (10 products as provided before)
  {
    name: 'Brass Buddha Statue',
    slug: 'brass-buddha-statue',
    description:
      'Handcrafted brass statue of Buddha in a meditative pose, radiating tranquility and peace. Ideal for home decor or meditation spaces.',
    category: 'metal-statues',
    artisan: {
      name: 'Patan Metalworks',
      location: 'Patan, Kathmandu',
      profilePictureUrl: 'https://i.imgur.com/v9T4pRn.jpeg',
    },
    story:
      'Crafted using the ancient lost-wax casting method, this statue captures the serene expression and detailed iconography of Buddhist art.',
    features: [
      'Lost-wax casting technique',
      'Intricate detailing on robes and face',
      'Adds a serene ambiance',
    ],
    keywords: [
  "brass buddha statue",
  "Buddhist decor",
  "spiritual home decor",
  "handcrafted Nepal",
  "brass sculpture",
  "peaceful statue",
  "meditation decor",
  "zen home decor",
  "religious idol",
  "artisan brasswork",
  "Buddha figurine",
  "spiritual gift"
],

    specifications: {
      dimensions: '20cm (H) x 12cm (W)',
      weight: '800g',
      material: 'Brass',
      careInstructions: 'Wipe with a dry cloth.',
    },
    variants: [
      {
        name: 'Standard',
        swatchImage: 'https://i.imgur.com/k8V3sLm.jpeg',
        images: [{ url: 'https://i.imgur.com/k8V3sLm.jpeg' }],
        price: 1200,
        originalPrice: 2500,
        stockBySize: [{ size: 'Free Size', stock: 7 }],
      },
    ],
  },
  {
    name: 'Copper Ganesh Statue',
    slug: 'copper-ganesh-statue',
    description:
      'Beautiful copper statue of Lord Ganesh, the remover of obstacles, in a seated position with intricate details.',
    category: 'metal-statues',
    featured: true,
    artisan: {
      name: 'Copper Artisans',
      location: 'Bhaktapur',
      profilePictureUrl: 'https://i.imgur.com/m2T9pRm.jpeg',
    },
    story:
      'Created by fourth-generation metalworkers specializing in Hindu deity sculptures.',
    features: [
      'Hand-beaten copper',
      'Intricate crown and jewelry details',
      'Symbol of wisdom and success',
    ],
    keywords: [
  "copper ganesh statue",
  "lord ganesha idol",
  "Hindu decor",
  "spiritual sculpture",
  "handmade Nepal",
  "religious decor",
  "copper artwork",
  "home temple idol",
  "traditional Nepal art",
  "auspicious decor",
  "devotional statue",
  "spiritual gift"
],

    specifications: {
      dimensions: '18cm (H) x 15cm (W)',
      weight: '950g',
      material: 'Copper',
      careInstructions: 'Polish with copper cleaner occasionally.',
    },
    variants: [
      {
        name: 'Standard',
        swatchImage: 'https://i.imgur.com/n9V8sL2.jpeg',
        images: [{ url: 'https://i.imgur.com/n9V8sL2.jpeg' }],
        price: 1800,
        originalPrice: 2800,
        stockBySize: [{ size: 'Free Size', stock: 5 }],
      },
    ],
  },
  {
    name: 'Bronze Tara Statue',
    slug: 'bronze-tara-statue',
    description:
      'Graceful bronze statue of Green Tara, the Buddhist goddess of compassion and action.',
    category: 'metal-statues',
    featured: true,
    artisan: {
      name: 'Buddhist Statue Artisans',
      location: 'Lalitpur',
      profilePictureUrl: 'https://i.imgur.com/n7T8v9N.jpeg',
    },
    story:
      'Created following traditional iconometric measurements prescribed in Buddhist texts.',
    features: [
      'Lost-wax casting',
      'Detailed lotus throne',
      'Graceful hand gestures',
      'Symbol of compassion',
    ],
    keywords: [
  "bronze tara statue",
  "buddhist goddess",
  "green tara idol",
  "handcrafted sculpture",
  "Nepal art",
  "spiritual home decor",
  "bronze figure",
  "female deity statue",
  "buddhist icon",
  "artisan bronze",
  "religious decor",
  "sacred symbol"
],

    specifications: {
      dimensions: '22cm (H) x 14cm (W)',
      weight: '1100g',
      material: 'Bronze',
      careInstructions: 'Dust regularly, avoid harsh chemicals.',
    },
    variants: [
      {
        name: 'Standard',
        swatchImage: 'https://i.imgur.com/m8V3sLq.jpeg',
        images: [{ url: 'https://i.imgur.com/m8V3sLq.jpeg' }],
        price: 2800,
        originalPrice: 3800,
        stockBySize: [{ size: 'Free Size', stock: 4 }],
      },
    ],
  },
  {
    name: 'Standing Shiva Nataraja Statue',
    slug: 'standing-shiva-nataraja-statue',
    description:
      'A dynamic brass statue of Shiva as Nataraja, the cosmic dancer, performing his divine dance of creation and destruction.',
    category: 'metal-statues',
    artisan: {
      name: 'Patan Metalworks',
      location: 'Patan',
      profilePictureUrl: 'https://i.imgur.com/v9T4pRn.jpeg',
    },
    story:
      'The dance of Nataraja is a profound symbol in Hinduism, representing the cosmic cycles of life and death and the rhythm of the universe.',
    features: [
      'Iconic Nataraja pose',
      'Ring of fire detail',
      'Lost-wax brass casting',
      'Symbol of cosmic energy',
    ],
    keywords: [
  "shiva nataraja statue",
  "Hindu god idol",
  "dancing shiva sculpture",
  "bronze art",
  "spiritual decor",
  "traditional Nepal",
  "lord shiva decor",
  "temple statue",
  "religious artwork",
  "handcrafted idol",
  "divine energy",
  "Hindu decor"
],

    specifications: {
      dimensions: '25cm (H) x 20cm (W)',
      weight: '1.2kg',
      material: 'Brass',
      careInstructions: 'Dust regularly with a soft brush.',
    },
    variants: [
      {
        name: 'Antique Finish',
        swatchImage: 'https://i.imgur.com/gHiJkLmn.jpeg',
        images: [{ url: 'https://i.imgur.com/gHiJkLmn.jpeg' }],
        price: 3500,
        originalPrice: 4800,
        stockBySize: [{ size: 'Free Size', stock: 6 }],
      },
    ],
  },
  {
    name: 'Manjushri Bodhisattva Statue',
    slug: 'manjushri-bodhisattva-statue',
    description:
      'A striking copper statue of Manjushri, the Bodhisattva of transcendent wisdom, holding a flaming sword that cuts through ignorance.',
    category: 'metal-statues',
    artisan: {
      name: 'Buddhist Statue Artisans',
      location: 'Lalitpur',
      profilePictureUrl: 'https://i.imgur.com/n7T8v9N.jpeg',
    },
    story:
      'Manjushri is a central figure in Mahayana Buddhism, and his sword represents the power of wisdom to conquer delusion.',
    features: [
      'Depicts Manjushri with sword and scripture',
      'Gold-gilded face (fire gilding)',
      'Intricate details on clothing and lotus base',
      'Made from copper',
    ],
    keywords: [
  "manjushri statue",
  "bodhisattva idol",
  "buddhist decor",
  "spiritual sculpture",
  "handcrafted Nepal",
  "wisdom deity",
  "bronze art",
  "religious icon",
  "meditation decor",
  "traditional Nepal art",
  "spiritual gift",
  "temple idol"
],

    specifications: {
      dimensions: '20cm (H)',
      weight: '900g',
      material: 'Copper, Gold',
      careInstructions: 'Gently wipe the body, avoid rubbing the gold face.',
    },
    variants: [
      {
        name: 'Gilded Copper',
        swatchImage: 'https://i.imgur.com/hIjKlMno.jpeg',
        images: [{ url: 'https://i.imgur.com/hIjKlMno.jpeg' }],
        price: 4200,
        originalPrice: 5500,
        stockBySize: [{ size: 'Free Size', stock: 5 }],
      },
    ],
  },
  {
    name: 'Garuda Eagle Statue',
    slug: 'garuda-eagle-statue',
    description:
      'A powerful brass statue of Garuda, the mythical eagle-like sun bird and the vehicle of the Hindu god Vishnu.',
    category: 'metal-statues',
    artisan: {
      name: 'Himalayan Metalcrafts',
      location: 'Bhaktapur',
      profilePictureUrl: 'https://i.imgur.com/v9T4pRn.jpeg',
    },
    story:
      'Garuda is a protector and an enemy of the serpent race (nāga). Statues of Garuda are often placed facing the main shrine in Vishnu temples.',
    features: [
      'Powerful and dynamic pose',
      'Detailed feathers and facial features',
      'Heavy brass construction',
      'Symbol of power and protection',
    ],
    keywords: [
  "garuda statue",
  "eagle sculpture",
  "Hindu mythology decor",
  "protection deity",
  "bronze idol",
  "Nepal craftsmanship",
  "spiritual home decor",
  "handcrafted art",
  "divine protector",
  "religious figure",
  "traditional sculpture",
  "artisan decor"
],

    specifications: {
      dimensions: '15cm (H)',
      weight: '750g',
      material: 'Brass',
      careInstructions: 'Wipe with a dry, soft cloth.',
    },
    variants: [
      {
        name: 'Polished Brass',
        swatchImage: 'https://i.imgur.com/iJkLmnOp.jpeg',
        images: [{ url: 'https://i.imgur.com/iJkLmnOp.jpeg' }],
        price: 1900,
        originalPrice: 2700,
        stockBySize: [{ size: 'Free Size', stock: 10 }],
      },
    ],
  },
  {
    name: 'Set of Ashtamangala (Eight Symbols)',
    slug: 'set-of-ashtamangala-eight-symbols',
    description:
      'A complete set of the eight auspicious symbols (Ashtamangala) of Tibetan Buddhism, crafted from copper and perfect for an altar or wall display.',
    category: 'metal-statues',
    artisan: {
      name: 'Ritual Metal Crafts',
      location: 'Swayambhunath',
      profilePictureUrl: 'https://i.imgur.com/q9T4mRn.jpeg',
    },
    story:
      'The Ashtamangala are a sacred suite of symbols representing the offerings made by the gods to Shakyamuni Buddha immediately after he attained enlightenment.',
    features: [
      'Complete set of 8 symbols',
      'Hand-repoussed copper work',
      'Can be hung on a wall or placed on a surface',
      'Highly symbolic',
    ],
    keywords: [
  "ashtamangala set",
  "buddhist symbols",
  "spiritual decor",
  "eight auspicious signs",
  "religious artifact",
  "handcrafted Nepal",
  "meditation accessory",
  "temple decor",
  "bronze art",
  "sacred symbols",
  "spiritual gift set",
  "traditional buddhism"
],

    specifications: {
      dimensions: 'Each symbol approx. 8cm tall',
      weight: '1.5kg (total)',
      material: 'Copper',
      careInstructions: 'Dust gently.',
    },
    variants: [
      {
        name: 'Copper Set',
        swatchImage: 'https://i.imgur.com/jKlMnoPq.jpeg',
        images: [{ url: 'https://i.imgur.com/jKlMnoPq.jpeg' }],
        price: 5500,
        originalPrice: 7000,
        stockBySize: [{ size: 'Free Size', stock: 3 }],
      },
    ],
  },
  {
    name: 'Vajrapani Bodhisattva Statue',
    slug: 'vajrapani-bodhisattva-statue',
    description:
      "A fierce and powerful bronze statue of Vajrapani, one of the earliest bodhisattvas of Mahayana Buddhism and the embodiment of the Buddha's power.",
    category: 'metal-statues',
    artisan: {
      name: 'Buddhist Statue Artisans',
      location: 'Lalitpur',
      profilePictureUrl: 'https://i.imgur.com/n7T8v9N.jpeg',
    },
    story:
      'Vajrapani is depicted in a wrathful form to demonstrate the power and determination needed to overcome negativity.',
    features: [
      'Wrathful depiction with Vajra',
      'Oxidized bronze for a dark, powerful look',
      'Dynamic and energetic posture',
      'Symbolizes the power of enlightenment',
    ],
    keywords: [
  "vajrapani statue",
  "buddhist deity",
  "protector statue",
  "handcrafted Nepal",
  "bronze sculpture",
  "spiritual decor",
  "religious icon",
  "buddhist art",
  "temple decor",
  "divine protector",
  "artisan craftsmanship",
  "spiritual gift"
],

    specifications: {
      dimensions: '23cm (H)',
      weight: '1.3kg',
      material: 'Bronze',
      careInstructions: 'Dust with a dry cloth.',
    },
    variants: [
      {
        name: 'Oxidized Bronze',
        swatchImage: 'https://i.imgur.com/kLmNoPqr.jpeg',
        images: [{ url: 'https://i.imgur.com/kLmNoPqr.jpeg' }],
        price: 3800,
        originalPrice: 5000,
        stockBySize: [{ size: 'Free Size', stock: 4 }],
      },
    ],
  },
  {
    name: 'Lakshmi Goddess of Wealth Statue',
    slug: 'lakshmi-goddess-of-wealth-statue',
    description:
      'An elegant brass statue of Goddess Lakshmi, the Hindu goddess of wealth, fortune, and prosperity, seated on a lotus throne.',
    category: 'metal-statues',
    artisan: {
      name: 'Patan Metalworks',
      location: 'Patan',
      profilePictureUrl: 'https://i.imgur.com/v9T4pRn.jpeg',
    },
    story:
      'Worshipped during Diwali, the festival of lights, Lakshmi is believed to bestow good fortune upon her devotees.',
    features: [
      'Seated on a lotus flower',
      'Coins flowing from her hand',
      'Intricate details on sari and jewelry',
      'Brings an aura of prosperity',
    ],
    keywords: [
  "lakshmi statue",
  "goddess of wealth",
  "hindu decor",
  "devotional idol",
  "handmade brass",
  "religious home decor",
  "prosperity goddess",
  "temple sculpture",
  "traditional Nepal art",
  "spiritual gift",
  "auspicious decor",
  "wealth charm"
],

    specifications: {
      dimensions: '15cm (H)',
      weight: '650g',
      material: 'Brass',
      careInstructions: 'Polish regularly to maintain its golden shine.',
    },
    variants: [
      {
        name: 'Golden Brass',
        swatchImage: 'https://i.imgur.com/lMnoPqrs.jpeg',
        images: [{ url: 'https://i.imgur.com/lMnoPqrs.jpeg' }],
        price: 1750,
        originalPrice: 2400,
        stockBySize: [{ size: 'Free Size', stock: 12 }],
      },
    ],
  },
  {
    name: 'Miniature Stupa Chaitya',
    slug: 'miniature-stupa-chaitya',
    description:
      'A small, finely detailed brass replica of a Nepalese Buddhist Stupa (Chaitya). An ideal centerpiece for a personal altar or meditation corner.',
    category: 'metal-statues',
    artisan: {
      name: 'Spiritual Silver Crafts',
      location: 'Boudhanath',
      profilePictureUrl: 'https://i.imgur.com/q9T4mRn.jpeg',
    },
    story:
      'Stupas are sacred structures in Buddhism that symbolize the enlightened mind of the Buddha. This miniature allows one to bring that sacred architecture home.',
    features: [
      'Detailed replica of a Kathmandu-style Stupa',
      'Features the all-seeing eyes of the Buddha',
      'Solid brass construction',
      'Compact and perfect for small spaces',
    ],
    keywords: [
  "stupa chaitya",
  "miniature stupa",
  "buddhist decor",
  "spiritual artifact",
  "handcrafted Nepal",
  "religious souvenir",
  "temple replica",
  "spiritual home decor",
  "zen meditation",
  "artisan brasswork",
  "buddhist monument",
  "sacred relic"
],

    specifications: {
      dimensions: '12cm (H)',
      weight: '400g',
      material: 'Brass',
      careInstructions: 'Wipe clean with a dry cloth.',
    },
    variants: [
      {
        name: 'Antique Brass',
        swatchImage: 'https://i.imgur.com/mNoPqRst.jpeg',
        images: [{ url: 'https://i.imgur.com/mNoPqRst.jpeg' }],
        price: 1400,
        originalPrice: 2000,
        stockBySize: [{ size: 'Free Size', stock: 15 }],
      },
    ],
  },

  // =================================================
  // == 4. SOUND AND SPIRITUALITY (10 Products)
  // =================================================
  {
    name: 'Bronze Singing Bowl',
    slug: 'bronze-singing-bowl',
    description:
      'Traditional Tibetan singing bowl made from seven-metal bronze alloy, produces harmonic tones for meditation.',
    category: 'sound-and-spirituality',
    artisan: {
      name: 'Singing Bowl Masters',
      location: 'Boudhanath, Kathmandu',
      profilePictureUrl: 'https://i.imgur.com/p7T8v9N.jpeg',
    },
    story:
      'Crafted in the traditional way using secret metal alloys passed down through generations.',
    features: [
      'Seven-metal alloy',
      'Comes with wooden striker and cushion',
      'Therapeutic sound vibrations',
      'Hand-hammered finish',
    ],
    keywords: [
  "bronze singing bowl",
  "sound healing bowl",
  "meditation bowl",
  "buddhist instrument",
  "handcrafted Nepal",
  "spiritual sound therapy",
  "chakra healing bowl",
  "mindfulness tool",
  "yoga accessory",
  "vibration healing",
  "zen meditation bowl",
  "artisan handmade"
],

    specifications: {
      dimensions: '12cm diameter x 7cm height',
      weight: '600g',
      material: 'Bronze Alloy',
      careInstructions: 'Keep dry, use striker gently.',
    },
    variants: [
      {
        name: 'Standard',
        swatchImage: 'https://i.imgur.com/b3V9sLq.jpeg',
        images: [{ url: 'https://i.imgur.com/b3V9sLq.jpeg' }],
        price: 2200,
        originalPrice: 3200,
        stockBySize: [{ size: 'Free Size', stock: 8 }],
      },
    ],
  },
  {
    name: 'Tingsha Cymbals (Auspicious Symbols)',
    slug: 'tingsha-cymbals-auspicious-symbols',
    description:
      'A pair of small, high-pitched cymbals used in Tibetan Buddhist practice to mark the beginning and end of meditation. These are embossed with the Ashtamangala (Eight Auspicious Symbols).',
    category: 'sound-and-spirituality',
    featured: true,
    artisan: {
      name: 'Ritual Metal Crafts',
      location: 'Swayambhunath',
      profilePictureUrl: 'https://i.imgur.com/q9T4mRn.jpeg',
    },
    story:
      'The pure, ringing sound of Tingsha is said to clear the mind and call one to awareness.',
    features: [
      'High-pitched, long-lasting chime',
      'Embossed with Eight Auspicious Symbols',
      'Connected by a leather strap',
      'Used for meditation and space clearing',
    ],
    keywords: [
  "tingsha cymbals",
  "buddhist bells",
  "sound healing",
  "handcrafted Nepal",
  "prayer instrument",
  "meditation chime",
  "bronze cymbals",
  "ritual bells",
  "spiritual accessory",
  "buddhist decor",
  "temple sound tool",
  "chakra balance"
],

    specifications: {
      dimensions: '6.5cm diameter each',
      weight: '250g',
      material: 'Bronze Alloy',
      careInstructions: 'Wipe with a soft cloth.',
    },
    variants: [
      {
        name: 'Embossed Brass',
        swatchImage: 'https://i.imgur.com/oPqRstuV.jpeg',
        images: [{ url: 'https://i.imgur.com/oPqRstuV.jpeg' }],
        price: 1400,
        originalPrice: 1900,
        stockBySize: [{ size: 'Free Size', stock: 25 }],
      },
    ],
  },
  {
    name: 'Carved Mantra Singing Bowl',
    slug: 'carved-mantra-singing-bowl',
    description:
      'A machine-made singing bowl beautifully carved with the "Om Mani Padme Hum" mantra on the outside and a Buddha eye design inside. Produces a clear, steady tone.',
    category: 'sound-and-spirituality',
    artisan: {
      name: 'Singing Bowl Masters',
      location: 'Boudhanath',
      profilePictureUrl: 'https://i.imgur.com/p7T8v9N.jpeg',
    },
    story:
      'While not hand-hammered, these bowls offer a consistent and beautiful tone, making them perfect for beginners and for their decorative appeal.',
    features: [
      'Carved with "Om Mani Padme Hum" mantra',
      'Buddha eye design inside',
      'Clear and consistent tone',
      'Includes striker and cushion',
    ],
    keywords: [
  "mantra singing bowl",
  "carved bowl",
  "buddhist meditation",
  "sound healing tool",
  "handcrafted Nepal",
  "spiritual decor",
  "chanting bowl",
  "healing vibration",
  "mindfulness practice",
  "bronze sound bowl",
  "engraved mantra",
  "zen accessory"
],

    specifications: {
      dimensions: '15cm diameter',
      weight: '800g',
      material: 'Brass and other metals',
      careInstructions: 'Wipe with a soft, dry cloth.',
    },
    variants: [
      {
        name: 'Black & Gold',
        swatchImage: 'https://i.imgur.com/pQrStuvW.jpeg',
        images: [{ url: 'https://i.imgur.com/pQrStuvW.jpeg' }],
        price: 2800,
        originalPrice: 3600,
        stockBySize: [{ size: 'Free Size', stock: 12 }],
      },
    ],
  },
  {
    name: 'Shamanic Drum (Dhyangro)',
    slug: 'shamanic-drum-dhyangro',
    description:
      'A traditional Nepali shamanic drum, known as a Dhyangro. Double-sided and made with goat hide, it produces a deep, resonant sound used in healing rituals.',
    category: 'sound-and-spirituality',
    artisan: {
      name: 'Himalayan Shamans',
      location: 'Rural Nepal',
      profilePictureUrl: 'https://i.imgur.com/s5vL2qT.jpeg',
    },
    story:
      'The Dhyangro is considered a spiritual vehicle for the shaman (Jhakri), allowing them to travel to the spirit world.',
    features: [
      'Double-sided goat hide drum',
      'Carved wooden handle (phurba)',
      'Deep, resonant sound',
      'Authentic ritual instrument',
    ],
    keywords: [
  "shamanic drum",
  "dhyangro drum",
  "ritual instrument",
  "handmade Nepal",
  "spiritual percussion",
  "tribal instrument",
  "healing drum",
  "ceremonial music",
  "folk tradition",
  "buddhist shaman",
  "wooden drum",
  "spiritual sound tool"
],

    specifications: {
      dimensions: '30cm diameter',
      weight: '1kg',
      material: 'Wood, Goat Hide',
      careInstructions:
        'Keep in a dry place. Avoid extreme temperature changes.',
    },
    variants: [
      {
        name: 'Standard',
        swatchImage: 'https://i.imgur.com/qRstuVwx.jpeg',
        images: [{ url: 'https://i.imgur.com/qRstuVwx.jpeg' }],
        price: 4500,
        originalPrice: 6000,
        stockBySize: [{ size: 'Free Size', stock: 3 }],
      },
    ],
  },
  {
    name: 'Conch Shell Horn (Shankha)',
    slug: 'conch-shell-horn-shankha',
    description:
      'A natural conch shell, used as a trumpet in Hindu rituals. It is blown to inaugurate religious ceremonies and purify the environment.',
    category: 'sound-and-spirituality',
    artisan: {
      name: 'Ritual Implement Makers',
      location: 'Pashupatinath',
      profilePictureUrl: 'https://i.imgur.com/p3T8rTm.jpeg',
    },
    story:
      'The sound of the Shankha is believed to be the primordial sound of creation, "Om".',
    features: [
      'Natural, authentic conch shell',
      'Produces a powerful, trumpet-like sound',
      'Used in Hindu pujas',
      'Polished finish',
    ],
    keywords: [
  "conch shell",
  "shankha horn",
  "hindu ritual",
  "spiritual sound",
  "temple accessory",
  "handcrafted Nepal",
  "devotional decor",
  "religious instrument",
  "auspicious sound",
  "holy shankha",
  "ritual artifact",
  "spiritual symbol"
],

    specifications: {
      dimensions: 'Approx. 15cm length',
      weight: '400g',
      material: 'Natural Conch Shell',
      careInstructions: 'Rinse with fresh water after use if necessary.',
    },
    variants: [
      {
        name: 'Polished White',
        swatchImage: 'https://i.imgur.com/rStuvWxy.jpeg',
        images: [{ url: 'https://i.imgur.com/rStuvWxy.jpeg' }],
        price: 1600,
        originalPrice: 2200,
        stockBySize: [{ size: 'Free Size', stock: 15 }],
      },
    ],
  },
  {
    name: 'Wooden Prayer Beads (Mala)',
    slug: 'wooden-prayer-beads-mala',
    description:
      'A simple and traditional 108-bead mala made from smooth Bodhi wood, used for counting mantras during meditation.',
    category: 'sound-and-spirituality',
    artisan: {
      name: 'Spiritual Craftsmen',
      location: 'Lumbini',
      profilePictureUrl: 'https://i.imgur.com/s5vL2qT.jpeg',
    },
    story:
      'The number 108 is considered sacred in many Eastern religions. Using a mala helps keep the mind focused on the mantra recitation.',
    features: [
      '108 Bodhi wood beads',
      'Hand-knotted between beads',
      'Simple and functional for meditation',
      'Cotton tassel',
    ],
    keywords: [
  "wooden mala beads",
  "prayer necklace",
  "buddhist meditation",
  "spiritual jewelry",
  "handcrafted Nepal",
  "108 beads",
  "yoga accessory",
  "mantra chanting",
  "handmade mala",
  "religious item",
  "natural wood",
  "spiritual practice"
],

    specifications: {
      dimensions: '8mm beads, approx 45cm long',
      weight: '50g',
      material: 'Bodhi Wood, Cotton',
      careInstructions: 'Keep dry.',
    },
    variants: [
      {
        name: 'Natural Wood',
        swatchImage: 'https://i.imgur.com/tuvWxyZ.jpeg',
        images: [{ url: 'https://i.imgur.com/tuvWxyZ.jpeg' }],
        price: 750,
        originalPrice: 1000,
        stockBySize: [{ size: 'Free Size', stock: 50 }],
      },
    ],
  },
  {
    name: 'Meditation Gong with Stand',
    slug: 'meditation-gong-with-stand',
    description:
      'A small tabletop gong on a traditional wooden stand. When struck, it produces a rich, deep tone that slowly fades, ideal for signaling meditation sessions.',
    category: 'sound-and-spirituality',
    artisan: {
      name: 'Himalayan Metalcrafts',
      location: 'Bhaktapur',
      profilePictureUrl: 'https://i.imgur.com/v9T4pRn.jpeg',
    },
    story:
      'Gongs have been used for centuries in Asia for musical, ceremonial, and healing purposes. Their sound is believed to clear negative energy.',
    features: [
      'Hand-hammered brass gong',
      'Carved wooden stand',
      'Includes a mallet',
      'Deep, resonant, and long-lasting sound',
    ],
    keywords: [
  "meditation gong",
  "sound healing gong",
  "buddhist decor",
  "spiritual instrument",
  "handcrafted Nepal",
  "zen meditation",
  "sound therapy tool",
  "bronze gong",
  "temple decor",
  "relaxation tool",
  "spiritual sound",
  "yoga accessory"
],

    specifications: {
      dimensions: '20cm diameter gong, 30cm high stand',
      weight: '1.5kg',
      material: 'Brass, Wood',
      careInstructions: 'Wipe gong with a soft cloth.',
    },
    variants: [
      {
        name: 'Brass Gong',
        swatchImage: 'https://i.imgur.com/vWxyZab.jpeg',
        images: [{ url: 'https://i.imgur.com/vWxyZab.jpeg' }],
        price: 3800,
        originalPrice: 5200,
        stockBySize: [{ size: 'Free Size', stock: 8 }],
      },
    ],
  },
  {
    name: 'Tibetan Wind Chimes',
    slug: 'tibetan-wind-chimes',
    description:
      'Wind chimes featuring hollow metal rods and a wooden clapper designed to produce a gentle, melodic sound, creating a peaceful atmosphere.',
    category: 'sound-and-spirituality',
    artisan: {
      name: 'Musical Metal Crafts',
      location: 'Nagarkot',
      profilePictureUrl: 'https://i.imgur.com/b9T4pRm.jpeg',
    },
    story:
      'Inspired by the wind chimes found in Himalayan monasteries and temples, their sound is thought to bring good fortune.',
    features: [
      'Hollow aluminum rods for clear tones',
      'Wooden clapper and wind catcher',
      'Soothing and melodic sound',
      'Suitable for indoor or covered outdoor use',
    ],
    keywords: [
  "tibetan wind chimes",
  "spiritual decor",
  "handcrafted Nepal",
  "zen sound",
  "home decor chime",
  "buddhist accessory",
  "soothing wind sound",
  "positive energy decor",
  "artisan chime",
  "metal wind bell",
  "feng shui charm",
  "spiritual vibe"
],

    specifications: {
      dimensions: '50cm total length',
      weight: '300g',
      material: 'Aluminum, Wood',
      careInstructions: 'Hang in a protected area to prolong life.',
    },
    variants: [
      {
        name: 'Silver Rods',
        swatchImage: 'https://i.imgur.com/n5V8sLq.jpeg',
        images: [{ url: 'https://i.imgur.com/n5V8sLq.jpeg' }],
        price: 1400,
        originalPrice: 2000,
        stockBySize: [{ size: 'Free Size', stock: 18 }],
      },
    ],
  },
  {
    name: 'Sandalwood Incense Sticks',
    slug: 'sandalwood-incense-sticks',
    description:
      'A pack of premium, hand-rolled incense sticks made from natural sandalwood powder. Its calming aroma is perfect for meditation, yoga, or relaxation.',
    category: 'sound-and-spirituality',
    artisan: {
      name: 'Himalayan Aromas',
      location: 'Kathmandu',
      profilePictureUrl: 'https://i.imgur.com/p3L9rTm.jpeg',
    },
    story:
      'Sandalwood has been used for centuries in spiritual ceremonies for its purifying and mind-calming properties.',
    features: [
      '100% natural ingredients',
      'Hand-rolled in Nepal',
      'Rich, woody, and calming scent',
      'Approx. 30 sticks per pack',
    ],
    keywords: [
  "sandalwood incense",
  "natural fragrance",
  "meditation aroma",
  "handcrafted Nepal",
  "spiritual incense",
  "buddhist ritual",
  "temple scent",
  "aromatherapy sticks",
  "relaxation fragrance",
  "pure sandalwood",
  "yoga incense",
  "natural healing"
],

    specifications: {
      dimensions: '25cm long sticks',
      weight: '50g pack',
      material: 'Sandalwood powder, bamboo stick',
      careInstructions:
        'Burn in a well-ventilated area using an incense holder.',
    },
    variants: [
      {
        name: 'Sandalwood',
        swatchImage: 'https://i.imgur.com/xYzaBcd.jpeg',
        images: [{ url: 'https://i.imgur.com/xYzaBcd.jpeg' }],
        price: 450,
        originalPrice: 600,
        stockBySize: [{ size: 'Free Size', stock: 100 }],
      },
    ],
  },
  {
    name: 'Crystal Singing Bowl',
    slug: 'crystal-singing-bowl',
    description:
      'A singing bowl made of pure quartz crystal, tuned to a specific musical note (Chakra). It produces a powerful, pure, and vibrant sound used in sound healing.',
    category: 'sound-and-spirituality',
    artisan: {
      name: 'Crystal Vibrations',
      location: 'Pokhara',
      profilePictureUrl: 'https://i.imgur.com/r5T9sLm.jpeg',
    },
    story:
      "Crystal bowls are a modern evolution of Tibetan bowls. Their pure tone resonates strongly with the body's energy centers (chakras).",
    features: [
      'Made of 99.9% pure quartz crystal',
      'Tuned to a specific note (e.g., C for Root Chakra)',
      'Includes rubber mallet and o-ring stand',
      'Powerful tool for sound therapy',
    ],
    keywords: [
  "crystal singing bowl",
  "sound healing tool",
  "chakra alignment",
  "spiritual meditation",
  "vibration therapy",
  "handmade Nepal",
  "buddhist sound bowl",
  "healing crystal",
  "mindfulness practice",
  "energy healing",
  "zen accessory",
  "pure tone bowl"
],

    specifications: {
      dimensions: '8-inch diameter',
      weight: '1.8kg',
      material: 'Quartz Crystal',
      careInstructions:
        'Handle with care; can be fragile. Clean with a soft cloth.',
    },
    variants: [
      {
        name: 'Frosted White',
        swatchImage: 'https://i.imgur.com/yZabcDe.jpeg',
        images: [{ url: 'https://i.imgur.com/yZabcDe.jpeg' }],
        price: 7500,
        originalPrice: 9500,
        stockBySize: [{ size: 'Free Size', stock: 4 }],
      },
    ],
  },

  {
    name: 'Traditional Tibetan Thangka Painting',
    slug: 'traditional-tibetan-thangka-painting',
    description:
      'Hand-painted Tibetan thangka depicting Buddha with intricate details using natural pigments',
    category: 'thangka-and-wall-decor',
    artisan: {
      name: 'Tenzin Dorje',
      location: 'Kathmandu, Nepal',
      profilePictureUrl: '/images/artisans/tenzin-dorje.jpg',
    },
    story:
      'Tenzin comes from a long lineage of thangka painters, learning the art from his grandfather at age 12',
    featured: true,
    variants: [
      {
        name: 'Small',
        swatchImage: '/images/products/thangka-small-swatch.jpg',
        images: [
          { url: '/images/products/thangka-small-1.jpg' },
          { url: '/images/products/thangka-small-2.jpg' },
        ],
        price: 4500,
        originalPrice: 5200,
        stockBySize: [
          { size: '30x40cm', stock: 8 },
          { size: '40x60cm', stock: 5 },
          { size: '50x70cm', stock: 3 },
        ],
      },
    ],
    features: [
      'Hand-painted',
      'Natural pigments',
      'Gold leaf detailing',
      'Traditional techniques',
    ],
    keywords: [
  "tibetan thangka",
  "spiritual painting",
  "buddhist art",
  "handcrafted Nepal",
  "religious wall decor",
  "sacred canvas",
  "traditional painting",
  "divine artwork",
  "temple decor",
  "spiritual symbolism",
  "prayer art",
  "buddhist culture"
],

    specifications: {
      dimensions: 'Various sizes available',
      weight: '0.5-2kg depending on size',
      material: 'Cotton canvas, natural minerals, gold leaf',
      careInstructions: 'Keep away from direct sunlight and moisture',
    },
    sizeChart: {
      headers: ['Size', 'Dimensions', 'Frame Included'],
      rows: [
        ['Small', '30x40cm', 'No'],
        ['Medium', '40x60cm', 'Yes'],
        ['Large', '50x70cm', 'Yes'],
      ],
      note: 'Custom sizes available upon request',
    },
  },
  {
    name: 'Buddhist Singing Bowl Set',
    slug: 'buddhist-singing-bowl-set',
    description:
      'Authentic seven-metal singing bowl with mallet and cushion for meditation and healing',
    category: 'buddhist-ritual-object',
    artisan: {
      name: 'Karma Wangchuk',
      location: 'Bhutan',
      profilePictureUrl: '/images/artisans/karma-wangchuk.jpg',
    },
    story:
      'Karma learned metalworking from Tibetan refugees and creates bowls using ancient Himalayan techniques',
    featured: true,
    variants: [
      {
        name: 'Classic',
        swatchImage: '/images/products/singing-bowl-swatch.jpg',
        images: [
          { url: '/images/products/singing-bowl-1.jpg' },
          { url: '/images/products/singing-bowl-2.jpg' },
        ],
        price: 2800,
        originalPrice: 3200,
        stockBySize: [
          { size: 'Small', stock: 12 },
          { size: 'Medium', stock: 8 },
          { size: 'Large', stock: 4 },
        ],
      },
    ],
    features: [
      'Seven metals',
      'Deep resonance',
      'Hand-hammered',
      'Includes mallet and cushion',
    ],
    keywords: [
  "buddhist singing bowl set",
  "sound therapy kit",
  "meditation tool",
  "handcrafted Nepal",
  "spiritual decor",
  "healing sound set",
  "chakra alignment",
  "zen practice",
  "bronze bowls",
  "yoga accessory",
  "relaxation kit",
  "buddhist tradition"
],

    specifications: {
      dimensions: 'Various diameters 4-8 inches',
      weight: '0.3-1.2kg',
      material: 'Bronze, copper, tin, gold, silver, iron, mercury',
      careInstructions: 'Clean with dry cloth, store in dry place',
    },
    sizeChart: {
      headers: ['Size', 'Diameter', 'Weight', 'Pitch'],
      rows: [
        ['Small', '4-5 inches', '300-500g', 'High'],
        ['Medium', '6-7 inches', '600-900g', 'Medium'],
        ['Large', '8 inches', '1-1.2kg', 'Low'],
      ],
      note: 'Each bowl produces unique harmonic frequencies',
    },
  },
  {
    name: 'Himalayan Wool Rug',
    slug: 'himalayan-wool-rug',
    description:
      'Hand-woven wool rug with traditional Tibetan patterns and natural dyes',
    category: 'wool-and-weave',
    artisan: {
      name: 'Dolma Tsering',
      location: 'Mustang, Nepal',
      profilePictureUrl: '/images/artisans/dolma-tsering.jpg',
    },
    story:
      "Dolma leads a women's cooperative preserving ancient weaving techniques passed through generations",
    featured: false,
    variants: [
      {
        name: 'Traditional',
        swatchImage: '/images/products/wool-rug-swatch.jpg',
        images: [
          { url: '/images/products/wool-rug-1.jpg' },
          { url: '/images/products/wool-rug-2.jpg' },
        ],
        price: 8500,
        originalPrice: 9500,
        stockBySize: [
          { size: '3x5 ft', stock: 6 },
          { size: '4x6 ft', stock: 4 },
          { size: '6x9 ft', stock: 2 },
          { size: '8x10 ft', stock: 1 },
        ],
      },
    ],
    features: [
      '100% Himalayan wool',
      'Natural dyes',
      'Hand-woven',
      'Reversible design',
    ],
    keywords: [
  "himalayan wool rug",
  "handwoven carpet",
  "Nepal handicraft",
  "bohemian decor",
  "home interior",
  "ethnic rug",
  "artisan wool",
  "warm floor decor",
  "traditional weaving",
  "eco-friendly rug",
  "handmade design",
  "luxury carpet"
],

    specifications: {
      dimensions: 'Various sizes available',
      weight: '5-25kg depending on size',
      material: 'Pure Himalayan wool, natural plant dyes',
      careInstructions:
        'Professional cleaning recommended, avoid direct sunlight',
    },
    sizeChart: {
      headers: ['Size', 'Dimensions', 'Weave Density'],
      rows: [
        ['Small', '3x5 ft', 'Medium'],
        ['Medium', '4x6 ft', 'High'],
        ['Large', '6x9 ft', 'High'],
        ['Extra Large', '8x10 ft', 'Premium'],
      ],
      note: 'Allow 2-3 weeks for custom sizes',
    },
  },
  {
    name: 'Premium Pashmina Shawl',
    slug: 'premium-pashmina-shawl',
    description:
      'Luxurious 100% pure pashmina shawl hand-woven by skilled artisans',
    category: 'pashmina-scarf',
    artisan: {
      name: 'Rajiv Sharma',
      location: 'Kashmir, India',
      profilePictureUrl: '/images/artisans/rajiv-sharma.jpg',
    },
    story:
      "Rajiv's family has been weaving pashmina for three generations using traditional handloom techniques",
    featured: true,
    variants: [
      {
        name: 'Classic',
        swatchImage: '/images/products/pashmina-swatch.jpg',
        images: [
          { url: '/images/products/pashmina-1.jpg' },
          { url: '/images/products/pashmina-2.jpg' },
        ],
        price: 6500,
        originalPrice: 7500,
        stockBySize: [
          { size: 'S', stock: 15 },
          { size: 'M', stock: 12 },
          { size: 'L', stock: 10 },
          { size: 'XL', stock: 8 },
        ],
      },
    ],
    features: [
      '100% pure pashmina',
      'Hand-woven',
      'Lightweight and warm',
      'Embroidery options',
    ],
    keywords: [
  "pashmina shawl",
  "cashmere wrap",
  "Nepal handmade",
  "luxury scarf",
  "soft wool shawl",
  "women fashion",
  "elegant accessory",
  "winter wear",
  "artisan fabric",
  "premium quality",
  "traditional Nepal",
  "handwoven pashmina"
],

    specifications: {
      dimensions: '70x200cm standard',
      weight: '200-300g',
      material: '100% Changthangi goat pashmina',
      careInstructions: 'Dry clean only, store folded with cedar blocks',
    },
    sizeChart: {
      headers: ['Size', 'Dimensions', 'Best For'],
      rows: [
        ['S', '60x180cm', 'Petite frame'],
        ['M', '70x200cm', 'Average height'],
        ['L', '80x220cm', 'Tall frame'],
        ['XL', '90x240cm', 'Plus size/Wrap style'],
      ],
      note: 'Can be worn as scarf or shawl',
    },
  },
  {
    name: 'Traditional Tibetan Chuba',
    slug: 'traditional-tibetan-chuba',
    description:
      'Authentic Tibetan robe with intricate embroidery and traditional design',
    category: 'clothing-and-accessories',
    artisan: {
      name: 'Yangchen Lhamo',
      location: 'Lhasa, Tibet',
      profilePictureUrl: '/images/artisans/yangchen-lhamo.jpg',
    },
    story:
      'Yangchen learned embroidery from her mother and creates traditional Tibetan garments with modern comfort',
    featured: false,
    variants: [
      {
        name: 'Standard',
        swatchImage: '/images/products/chuba-swatch.jpg',
        images: [
          { url: '/images/products/chuba-1.jpg' },
          { url: '/images/products/chuba-2.jpg' },
        ],
        price: 4200,
        originalPrice: 4800,
        stockBySize: [
          { size: 'S', stock: 7 },
          { size: 'M', stock: 9 },
          { size: 'L', stock: 6 },
          { size: 'XL', stock: 4 },
        ],
      },
    ],
    features: [
      'Hand-embroidered',
      'Wool blend',
      'Traditional patterns',
      'Comfortable fit',
    ],
    keywords: [
  "tibetan chuba",
  "traditional clothing",
  "Nepal attire",
  "handmade garment",
  "winter robe",
  "ethnic fashion",
  "heritage wear",
  "woolen dress",
  "cultural outfit",
  "handcrafted clothing",
  "boho fashion",
  "Himalayan attire"
],

    specifications: {
      dimensions: 'Various sizes available',
      weight: '1.2-2kg',
      material: 'Wool blend, silk embroidery thread',
      careInstructions: 'Dry clean recommended, iron on low heat',
    },
    sizeChart: {
      headers: ['Size', 'Chest', 'Length', 'Sleeve'],
      rows: [
        ['S', '34-36 inches', '45 inches', '23 inches'],
        ['M', '38-40 inches', '47 inches', '24 inches'],
        ['L', '42-44 inches', '49 inches', '25 inches'],
        ['XL', '46-48 inches', '51 inches', '26 inches'],
      ],
      note: 'Traditional loose fit, runs true to size',
    },
  },
  {
    name: 'Handcrafted Prayer Wheel',
    slug: 'handcrafted-prayer-wheel',
    description:
      'Beautifully crafted prayer wheel with sacred mantras and smooth spinning mechanism',
    category: 'gifts-and-souvenirs',
    artisan: {
      name: 'Dorje Tamang',
      location: 'Pokhara, Nepal',
      profilePictureUrl: '/images/artisans/dorje-tamang.jpg',
    },
    story:
      'Dorje specializes in creating prayer wheels that combine traditional craftsmanship with durable modern materials',
    featured: false,
    variants: [
      {
        name: 'Standard',
        swatchImage: '/images/products/prayer-wheel-swatch.jpg',
        images: [
          { url: '/images/products/prayer-wheel-1.jpg' },
          { url: '/images/products/prayer-wheel-2.jpg' },
        ],
        price: 1800,
        originalPrice: 2200,
        stockBySize: [
          { size: 'Small', stock: 20 },
          { size: 'Medium', stock: 15 },
          { size: 'Large', stock: 8 },
        ],
      },
    ],
    features: [
      'Hand-engraved mantras',
      'Smooth spinning',
      'Durable construction',
      'Includes prayer scroll',
    ],
    keywords: [
  "prayer wheel",
  "buddhist ritual tool",
  "handcrafted Nepal",
  "spiritual decor",
  "mantra wheel",
  "religious accessory",
  "devotional item",
  "temple decor",
  "handmade brass",
  "meditation accessory",
  "rotating wheel",
  "buddhist symbol"
],

    specifications: {
      dimensions: 'Various heights 15-30cm',
      weight: '0.5-1.5kg',
      material: 'Brass, copper, wood',
      careInstructions: 'Wipe with soft cloth, oil mechanism occasionally',
    },
    sizeChart: {
      headers: ['Size', 'Height', 'Weight', 'Mantras'],
      rows: [
        ['Small', '15cm', '500g', 'Om Mani Padme Hum'],
        ['Medium', '22cm', '900g', 'Om Mani Padme Hum x3'],
        ['Large', '30cm', '1.5kg', 'Om Mani Padme Hum x5'],
      ],
      note: 'Each wheel contains authentic printed mantras',
    },
  },
  {
    name: 'Hemp Tote Bag',
    slug: 'hemp-tote-bag',
    description:
      'Eco-friendly hemp tote bag with traditional patterns, perfect for daily use',
    category: 'hemp-products',
    artisan: {
      name: 'Mingma Sherpa',
      location: 'Solukhumbu, Nepal',
      profilePictureUrl: '/images/artisans/mingma-sherpa.jpg',
    },
    story:
      'Mingma works with local hemp farmers to create sustainable products that support rural communities',
    featured: false,
    variants: [
      {
        name: 'Natural',
        swatchImage: '/images/products/hemp-tote-swatch.jpg',
        images: [
          { url: '/images/products/hemp-tote-1.jpg' },
          { url: '/images/products/hemp-tote-2.jpg' },
        ],
        price: 1200,
        originalPrice: 1500,
        stockBySize: [
          { size: 'Small', stock: 25 },
          { size: 'Medium', stock: 30 },
          { size: 'Large', stock: 20 },
        ],
      },
    ],
    features: ['100% hemp', 'Eco-friendly', 'Durable', 'Machine washable'],
    keywords: [
  "hemp tote bag",
  "eco-friendly bag",
  "Nepal handmade",
  "sustainable fashion",
  "boho style bag",
  "recycled hemp",
  "unisex accessory",
  "shopping tote",
  "artisan craftsmanship",
  "casual carry bag",
  "organic fabric",
  "eco fashion"
],

    specifications: {
      dimensions: 'Various sizes available',
      weight: '200-400g',
      material: '100% natural hemp',
      careInstructions: 'Machine wash cold, air dry',
    },
    sizeChart: {
      headers: ['Size', 'Dimensions', 'Capacity'],
      rows: [
        ['Small', '30x35cm', '10L'],
        ['Medium', '38x42cm', '15L'],
        ['Large', '45x50cm', '20L'],
      ],
      note: 'Fabric softens with each wash',
    },
  },
  {
    name: 'Carved Wooden Mask',
    slug: 'carved-wooden-mask',
    description:
      'Hand-carved wooden mask depicting traditional Himalayan deities and spirits',
    category: 'wooden-crafts',
    artisan: {
      name: 'Pemba Gurung',
      location: 'Nagarkot, Nepal',
      profilePictureUrl: '/images/artisans/pemba-gurung.jpg',
    },
    story:
      'Pemba learned wood carving from his father and creates masks used in traditional festivals and rituals',
    featured: true,
    variants: [
      {
        name: 'Traditional',
        swatchImage: '/images/products/wooden-mask-swatch.jpg',
        images: [
          { url: '/images/products/wooden-mask-1.jpg' },
          { url: '/images/products/wooden-mask-2.jpg' },
        ],
        price: 3200,
        originalPrice: 3800,
        stockBySize: [
          { size: 'Small', stock: 8 },
          { size: 'Medium', stock: 6 },
          { size: 'Large', stock: 3 },
        ],
      },
    ],
    features: [
      'Hand-carved',
      'Natural wood',
      'Traditional designs',
      'Cultural significance',
    ],
    keywords: [
  "wooden mask",
  "handcrafted Nepal",
  "tribal art",
  "cultural decor",
  "wall hanging",
  "spiritual mask",
  "artisan carving",
  "folk art Nepal",
  "traditional sculpture",
  "ethnic home decor",
  "collectible mask",
  "heritage design"
],

    specifications: {
      dimensions: 'Various sizes 20-40cm',
      weight: '0.8-2kg',
      material: 'Sal wood, natural pigments',
      careInstructions: 'Dust with soft cloth, avoid direct sunlight',
    },
    sizeChart: {
      headers: ['Size', 'Height', 'Width', 'Weight'],
      rows: [
        ['Small', '20cm', '15cm', '800g'],
        ['Medium', '30cm', '22cm', '1.2kg'],
        ['Large', '40cm', '30cm', '2kg'],
      ],
      note: 'Each mask is unique due to hand-carving process',
    },
  },
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    await Product.deleteMany({});
    console.log('✅ Cleared existing products');

    // Add a simple check to ensure all products have required fields before inserting
    for (const product of sampleProducts) {
      if (
        !product.name ||
        !product.slug ||
        !product.category ||
        !product.variants ||
        product.variants.length === 0
      ) {
        throw new Error(
          `Product is missing required fields: ${JSON.stringify(product)}`,
        );
      }
    }

    await Product.insertMany(sampleProducts);
    console.log(`✅ Added ${sampleProducts.length} sample products`);

    console.log('\n🎉 Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
