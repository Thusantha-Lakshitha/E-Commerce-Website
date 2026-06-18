import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://stores:QcsDO2UIyuHU35Dx@cluster0.eagm2k2.mongodb.net/online_store?retryWrites=true&w=majority');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`MongoDB Atlas connection failed: ${error.message}`);
    console.log('Attempting local MongoDB database fallback...');
    try {
      const connLocal = await mongoose.connect('mongodb://127.0.0.1:27017/online-shopping');
      console.log(`Local fallback database connected: ${connLocal.connection.host}`);
    } catch (localErr) {
      console.error(`Local MongoDB fallback also failed: ${localErr.message}`);
      console.log('Express server will run in offline database mode.');
    }
  }
};

export default connectDB;
