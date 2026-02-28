/**
 * MongoDB connection using Mongoose.
 * Called once at startup from server.js.
 */

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1); // Kill the process — app can't run without DB
  }
};

module.exports = connectDB;
