const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    // Connecting to MongoDB using the URI stored in the environment variable
    await mongoose.connect(process.env.MONGO_URI);
    console.log('DB connected');
  } catch (err) {
    console.error('Error connecting to the database:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
