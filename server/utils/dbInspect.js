import mongoose from 'mongoose';
import '../loadEnv.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

const inspect = async () => {
  let connStr = process.env.MONGO_URI;
  
  if (!connStr) {
    console.warn('MongoDB Cloud Connection URI is missing! (MONGO_URI not set in .env)');
    console.log('Attempting connection to Fallback Local Database (127.0.0.1)...');
    try {
      const localConnStr = 'mongodb://127.0.0.1:27017/online-shopping';
      await mongoose.connect(localConnStr, { serverSelectionTimeoutMS: 2000 });
      console.log('Connected to Fallback Database: Local Mongoose Server');
    } catch (localErr) {
      console.error(`Local database connection failed: ${localErr.message}`);
      process.exit(1);
    }
  } else {
    console.log('Connecting to database...');
    try {
      // Attempt standard connection
      await mongoose.connect(connStr, { serverSelectionTimeoutMS: 3000 });
      console.log('Connected to Primary Database: Atlas Cloud Cluster');
    } catch (error) {
      console.warn(`Cloud Database connection failed: ${error.message}`);
      console.log('Attempting connection to Fallback Local Database (127.0.0.1)...');
      try {
        const localConnStr = 'mongodb://127.0.0.1:27017/online-shopping';
        await mongoose.connect(localConnStr, { serverSelectionTimeoutMS: 2000 });
        console.log('Connected to Fallback Database: Local Mongoose Server');
      } catch (localErr) {
        console.error(`Both Cloud and Local database connections failed: ${localErr.message}`);
        process.exit(1);
      }
    }
  }

  try {
    const usersCount = await User.countDocuments({});
    const productsCount = await Product.countDocuments({});
    const ordersCount = await Order.countDocuments({});

    console.log('\n=============================================');
    console.log('📊 DATABASE COLLECTIONS & STATISTICS');
    console.log('=============================================');
    console.log(`• Users Account Logs  : ${usersCount} registered users`);
    console.log(`• Products Catalog    : ${productsCount} active products`);
    console.log(`• Orders Placed Records: ${ordersCount} order transactions`);
    console.log('=============================================\n');

    console.log('📋 SCHEMA BLUEPRINTS:');
    console.log('---------------------------------------------');
    console.log('👤 User Model Fields:\n ', Object.keys(User.schema.paths).join(', '));
    console.log('\n🛍️ Product Model Fields:\n ', Object.keys(Product.schema.paths).join(', '));
    console.log('\n📦 Order Model Fields:\n ', Object.keys(Order.schema.paths).join(', '));
    console.log('---------------------------------------------\n');

    process.exit(0);
  } catch (err) {
    console.error('Inspection logic crashed:', err.message);
    process.exit(1);
  }
};

inspect();
