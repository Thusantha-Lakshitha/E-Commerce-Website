import mongoose from 'mongoose';
import '../loadEnv.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

const usersData = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin',
  },
  {
    name: 'Jane Customer',
    email: 'customer@example.com',
    password: 'customer123',
    role: 'user',
  },
];

const productsData = [
  {
    name: 'Premium Wireless Headphones',
    description: 'Immersive sound quality with active noise cancellation, 40 hours of battery life, and comfortable over-ear design.',
    price: 199.99,
    category: 'Electronics',
    stock: 15,
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80'],
    rating: 4.8,
    numReviews: 2,
    reviews: [] // populated after we get user IDs
  },
  {
    name: 'Minimalist Leather Backpack',
    description: 'Handcrafted from full-grain leather, featuring a padded laptop compartment and water-resistant lining.',
    price: 79.99,
    category: 'Fashion',
    stock: 8,
    images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80'],
    rating: 4.5,
    numReviews: 0,
    reviews: []
  },
  {
    name: 'Vintage Mechanical Keyboard',
    description: 'Tactile typing experience with clicky blue switches, hot-swappable keys, and retro-themed color keycaps.',
    price: 129.99,
    category: 'Electronics',
    stock: 12,
    images: ['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80'],
    rating: 4.7,
    numReviews: 0,
    reviews: []
  },
  {
    name: 'Organic Cotton Hoodie',
    description: 'Super soft hoodie made from 100% certified organic cotton. Features custom embroidery details.',
    price: 49.99,
    category: 'Fashion',
    stock: 20,
    images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&auto=format&fit=crop&q=80'],
    rating: 4.2,
    numReviews: 0,
    reviews: []
  },
  {
    name: 'Smart Fitness Watch',
    description: 'Tracks heart rate, sleep cycles, steps, and features built-in GPS with a vibrant AMOLED touch display.',
    price: 149.99,
    category: 'Electronics',
    stock: 4, // triggers low stock warning!
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'],
    rating: 4.6,
    numReviews: 0,
    reviews: []
  },
  {
    name: 'Scented Ceramic Candle Set',
    description: 'Soy wax candles infused with lavender, sandalwood, and vanilla essential oils. Housed in reusable ceramic pots.',
    price: 34.99,
    category: 'Home Decor',
    stock: 25,
    images: ['https://images.unsplash.com/photo-1603006905003-be475563bc59?w=600&auto=format&fit=crop&q=80'],
    rating: 4.9,
    numReviews: 0,
    reviews: []
  },
  {
    name: 'Minimalist Ceramic Vase',
    description: 'Elegant beige ceramic vase with a matte finish, perfect for dried flowers or as a standalone tabletop decor accent.',
    price: 24.99,
    category: 'Home Decor',
    stock: 14,
    images: ['https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=600&auto=format&fit=crop&q=80'],
    rating: 4.3,
    numReviews: 0,
    reviews: []
  },
  {
    name: 'The Art of Coding (Hardcover)',
    description: 'A comprehensive visual exploration of code design patterns, software architectures, and program design philosophies.',
    price: 29.99,
    category: 'Books',
    stock: 40,
    images: ['https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&auto=format&fit=crop&q=80'],
    rating: 4.8,
    numReviews: 0,
    reviews: []
  },
];

const seedData = async () => {
  let connStr = process.env.MONGO_URI;
  
  if (!connStr) {
    console.warn('MongoDB Cloud Connection URI is missing! (MONGO_URI not set in .env)');
    console.log('Attempting connection to Fallback Local Database (127.0.0.1)...');
    try {
      const localConnStr = 'mongodb://127.0.0.1:27017/online-shopping';
      await mongoose.connect(localConnStr, { serverSelectionTimeoutMS: 2000 });
      console.log('Connected to Database: Local Mongoose Server');
    } catch (localErr) {
      console.error(`Local database connection failed: ${localErr.message}`);
      process.exit(1);
    }
  } else {
    console.log('Connecting to database...');
    try {
      await mongoose.connect(connStr, { serverSelectionTimeoutMS: 4000 });
      console.log('Connected to Database: Atlas Cloud Cluster');
    } catch (error) {
      console.warn(`Cloud Database connection failed: ${error.message}`);
      console.log('Attempting connection to Fallback Local Database (127.0.0.1)...');
      try {
        const localConnStr = 'mongodb://127.0.0.1:27017/online-shopping';
        await mongoose.connect(localConnStr, { serverSelectionTimeoutMS: 2000 });
        console.log('Connected to Database: Local Mongoose Server');
      } catch (localErr) {
        console.error(`Both Cloud and Local database connections failed: ${localErr.message}`);
        process.exit(1);
      }
    }
  }

  try {
    // 1. Wipe collections
    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    console.log('Cleared existing database logs/records successfully.');

    // 2. Insert Users (triggers bcrypt hashing in schema middleware hooks)
    const createdUsers = [];
    for (const u of usersData) {
      const newUser = await User.create(u);
      createdUsers.push(newUser);
    }
    console.log(`Created ${createdUsers.length} seed users (Admin & Customer).`);

    const adminUser = createdUsers[0];
    const customerUser = createdUsers[1];

    // Add some mock reviews to the first product
    productsData[0].reviews = [
      {
        name: customerUser.name,
        rating: 5,
        comment: 'Absolutely love these! Noise cancellation works wonders for coding.',
        user: customerUser._id,
      },
      {
        name: adminUser.name,
        rating: 4,
        comment: 'Good sound quality, battery life is exactly as advertised.',
        user: adminUser._id,
      },
    ];

    // 3. Insert Products
    const createdProducts = await Product.insertMany(productsData);
    console.log(`Created ${createdProducts.length} seed products.`);

    console.log('\n=============================================');
    console.log('🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('=============================================');
    console.log('Use these logins for testing:');
    console.log('👤 Admin Account  : admin@example.com (pass: admin123)');
    console.log('👤 Customer Account: customer@example.com (pass: customer123)');
    console.log('=============================================\n');

    process.exit(0);
  } catch (err) {
    console.error('Seeding crashed:', err.message);
    process.exit(1);
  }
};

seedData();
