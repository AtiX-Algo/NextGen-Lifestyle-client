// seedProducts.js
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/product');

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ MONGO_URI is not defined in .env');
  process.exit(1);
}

// Sample products data
const products = [
  {
    name: 'Travel Backpack',
    brand: 'UrbanGear',
    category: 'bag',
    description: 'Durable everyday backpack with laptop compartment and water-resistant build.',
    images: ['/images/bag.png'],
    price: 49.99,
    variants: [
      {
        size: 'One Size',
        color: 'Black',
        stock: 20,
        reserved: 0
      },
      {
        size: 'One Size',
        color: 'Grey',
        stock: 12,
        reserved: 0
      }
    ],
    ratingAverage: 4.5,
    ratingCount: 0
  },
  {
    name: 'Smart Fit Band',
    brand: 'FitPulse',
    category: 'fit',
    description: 'Fitness tracker with heart-rate monitor, sleep tracking and step counter.',
    images: ['/images/fit.png'],
    price: 29.99,
    variants: [
      {
        size: 'One Size',
        color: 'Black',
        stock: 30,
        reserved: 0
      },
      {
        size: 'One Size',
        color: 'Red',
        stock: 18,
        reserved: 0
      }
    ],
    ratingAverage: 4.3,
    ratingCount: 0
  },
  {
    name: 'Formal Leather Shoes',
    brand: 'EliteWalk',
    category: 'formal',
    description: 'Premium brown leather formal shoes perfect for office and parties.',
    images: ['/images/formal.png'],
    price: 69.99,
    variants: [
      {
        size: '40',
        color: 'Brown',
        stock: 14,
        reserved: 0
      },
      {
        size: '41',
        color: 'Brown',
        stock: 10,
        reserved: 0
      }
    ],
    ratingAverage: 4.4,
    ratingCount: 0
  },
  {
    name: 'Noise Cancelling Headphones',
    brand: 'SoundMax',
    category: 'headphone',
    description: 'Over-ear headphones with deep bass and premium noise cancellation.',
    images: ['/images/headphone.jpg'],
    price: 89.99,
    variants: [
      {
        size: 'One Size',
        color: 'Black',
        stock: 22,
        reserved: 0
      }
    ],
    ratingAverage: 4.6,
    ratingCount: 0
  },
  {
    name: 'Trail Hike Boots',
    brand: 'HikePro',
    category: 'hikeboot',
    description: 'High-ankle hiking boots with rugged sole and waterproof layer.',
    images: ['/images/hikeboot.png'],
    price: 79.99,
    variants: [
      {
        size: '42',
        color: 'Brown',
        stock: 8,
        reserved: 0
      },
      {
        size: '43',
        color: 'Brown',
        stock: 5,
        reserved: 0
      }
    ],
    ratingAverage: 4.7,
    ratingCount: 0
  },
  {
    name: 'Winter Hoodie',
    brand: 'WarmCo',
    category: 'hoodie',
    description: 'Soft fleece hoodie perfect for cold weather.',
    images: ['/images/hoodie.png'],
    price: 34.99,
    variants: [
      {
        size: 'M',
        color: 'Black',
        stock: 10,
        reserved: 0
      },
      {
        size: 'L',
        color: 'Black',
        stock: 7,
        reserved: 0
      }
    ],
    ratingAverage: 4.5,
    ratingCount: 0
  },
  {
    name: 'Winter Jacket',
    brand: 'FrostShield',
    category: 'jacket',
    description: 'Windproof and water-resistant jacket for extreme cold.',
    images: ['/images/jacket.jpg'],
    price: 119.99,
    variants: [
      {
        size: 'M',
        color: 'Navy',
        stock: 5,
        reserved: 0
      },
      {
        size: 'L',
        color: 'Navy',
        stock: 3,
        reserved: 0
      }
    ],
    ratingAverage: 4.6,
    ratingCount: 0
  },
  {
    name: 'Mechanical Keyboard',
    brand: 'KeyMaster',
    category: 'keyboard',
    description: 'RGB mechanical keyboard with blue tactile switches.',
    images: ['/images/keyboard.jpg'],
    price: 49.99,
    variants: [
      {
        size: 'Full Size',
        color: 'Black',
        stock: 20,
        reserved: 0
      }
    ],
    ratingAverage: 4.2,
    ratingCount: 0
  },
  {
    name: '27-inch Full HD Monitor',
    brand: 'ViewPro',
    category: 'monitor',
    description: 'Full HD IPS panel monitor with thin bezels.',
    images: ['/images/monitor.jpg'],
    price: 169.99,
    variants: [
      {
        size: '27',
        color: 'Black',
        stock: 6,
        reserved: 0
      }
    ],
    ratingAverage: 4.3,
    ratingCount: 0
  },
  {
    name: 'Sport Shoes',
    brand: 'RunFlex',
    category: 'shoe',
    description: 'Breathable, lightweight, and comfortable running shoes.',
    images: ['/images/shoe.jpg'],
    price: 59.99,
    variants: [
      {
        size: '40',
        color: 'White',
        stock: 9,
        reserved: 0
      },
      {
        size: '41',
        color: 'White',
        stock: 6,
        reserved: 0
      }
    ],
    ratingAverage: 4.4,
    ratingCount: 0
  },
  {
    name: 'Aviator Sunglasses',
    brand: 'SunRay',
    category: 'sunglass',
    description: 'Metal frame aviator sunglasses with UV400 protection.',
    images: ['/images/sunglass.jpg'],
    price: 19.99,
    variants: [
      {
        size: 'One',
        color: 'Gold',
        stock: 25,
        reserved: 0
      }
    ],
    ratingAverage: 4.1,
    ratingCount: 0
  },
  {
    name: "Men's Suit",
    brand: 'GentleWear',
    category: 'suit',
    description: 'Two-piece formal suit tailored for a modern fit.',
    images: ['/images/suit.jpg'],
    price: 139.99,
    variants: [
      {
        size: '40',
        color: 'Navy',
        stock: 5,
        reserved: 0
      }
    ],
    ratingAverage: 4.5,
    ratingCount: 0
  },
  {
    name: 'Leather Wallet',
    brand: 'PrimeCraft',
    category: 'walet',
    description: 'Genuine leather wallet with 8 card slots and coin pocket.',
    images: ['/images/walet.jpg'],
    price: 14.99,
    variants: [
      {
        size: 'One',
        color: 'Brown',
        stock: 30,
        reserved: 0
      }
    ],
    ratingAverage: 4.0,
    ratingCount: 0
  },
  {
    name: 'Elegant Ear Ring',
    brand: 'JewelCraft',
    category: 'earring',
    description: 'Gold plated elegant ear ring suitable for parties and daily wear.',
    images: ['/images/ear-ring.webp'],
    price: 9.99,
    variants: [
      {
        size: 'One Size',
        color: 'Gold',
        stock: 40,
        reserved: 0
      }
    ],
    ratingAverage: 4.3,
    ratingCount: 0
  },
  {
    name: 'Cute Hair Clip Set',
    brand: 'StyleMe',
    category: 'hairclip',
    description: 'Pack of 3 premium hair clips with strong grip and polished finish.',
    images: ['/images/hair-clip.jpeg'],
    price: 5.99,
    variants: [
      {
        size: 'One Size',
        color: 'Multi',
        stock: 50,
        reserved: 0
      }
    ],
    ratingAverage: 4.4,
    ratingCount: 0
  },
  {
    name: 'Gentle Face Washer',
    brand: 'FreshGlow',
    category: 'facewasher',
    description: 'Skin-friendly facial cleanser for daily use. Removes oil and dirt effectively.',
    images: ['/images/face-washer.jpeg'],
    price: 7.49,
    variants: [
      {
        size: '100ml',
        color: 'Standard',
        stock: 35,
        reserved: 0
      }
    ],
    ratingAverage: 4.2,
    ratingCount: 0
  },
  {
    name: "Women's Summer Dress",
    brand: 'FashionBeat',
    category: 'dress',
    description: 'Soft and breathable summer dress, perfect for casual outings.',
    images: ['/images/dress.jpeg'],
    price: 29.99,
    variants: [
      {
        size: 'S',
        color: 'Pink',
        stock: 12,
        reserved: 0
      },
      {
        size: 'M',
        color: 'Pink',
        stock: 10,
        reserved: 0
      }
    ],
    ratingAverage: 4.5,
    ratingCount: 0
  },
  {
    name: 'Makeup Essentials Kit',
    brand: 'GlowUp',
    category: 'makeup',
    description: 'All-in-one makeup kit including foundation, lipstick, blush and more.',
    images: ['/images/makeup.jpeg'],
    price: 24.99,
    variants: [
      {
        size: 'Standard',
        color: 'Multi',
        stock: 28,
        reserved: 0
      }
    ],
    ratingAverage: 4.6,
    ratingCount: 0
  },
  {
    name: 'Classic T-Shirt',
    brand: 'CottonSoft',
    category: 'tshirt',
    description: 'Soft cotton t-shirt perfect for regular wear.',
    images: ['/images/tshirt.jpg'],
    price: 12.99,
    variants: [
      {
        size: 'S',
        color: 'White',
        stock: 22,
        reserved: 0
      },
      {
        size: 'M',
        color: 'White',
        stock: 18,
        reserved: 0
      }
    ],
    ratingAverage: 4.2,
    ratingCount: 0
  },
  {
    name: 'Metal Wrist Watch',
    brand: 'TimeZone',
    category: 'watch',
    description: 'Elegant metal strap watch with water resistance.',
    images: ['/images/watch.jpg'],
    price: 89.99,
    variants: [
      {
        size: 'One Size',
        color: 'Silver',
        stock: 15,
        reserved: 0
      }
    ],
    ratingAverage: 4.4,
    ratingCount: 0
  }
];

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('✅ Cleared existing products');

    // Insert new products
    const createdProducts = await Product.insertMany(products);
    console.log(`✅ Seeded ${createdProducts.length} products`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

run();
