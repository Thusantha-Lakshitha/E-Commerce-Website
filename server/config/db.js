import mongoose from 'mongoose';

const connectDB = async () => {
  const connString = process.env.MONGO_URI;
  try {
    console.log('Connecting to cloud MongoDB Atlas...');
    const conn = await mongoose.connect(connString, { serverSelectionTimeoutMS: 4000 });
    console.log(`MongoDB Connected (Cloud): ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`MongoDB Cloud connection failed: ${error.message}`);
    console.log('Falling back to local MongoDB connection...');
    try {
      const connLocal = await mongoose.connect('mongodb://127.0.0.1:27017/online-shopping', { serverSelectionTimeoutMS: 3000 });
      console.log(`MongoDB Connected (Local Fallback): ${connLocal.connection.host}`);
      return connLocal;
    } catch (localErr) {
      console.error(`Both Cloud and Local database connections failed: ${localErr.message}`);
      throw localErr;
    }
  }
};

export default connectDB;
