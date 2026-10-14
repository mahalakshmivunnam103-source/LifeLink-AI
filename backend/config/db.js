const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/lifelink_ai';

  try {
    // Attempt Mongoose connection with a short timeout so app never hangs
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
    });
    isConnected = true;
    console.log(`[LifeLink AI] Connected to MongoDB: ${conn.connection.host}`);
    return true;
  } catch (err) {
    isConnected = false;
    console.warn(
      `[LifeLink AI] Notice: Could not connect to external MongoDB (${err.message}).`
    );
    console.log(
      `[LifeLink AI] Seamlessly activating Smart In-Memory Data Store with pre-seeded demo records for all 4 roles.`
    );
    return false;
  }
};

const getIsConnected = () => isConnected;

module.exports = { connectDB, getIsConnected };
