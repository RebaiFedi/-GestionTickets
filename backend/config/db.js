const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000
    });

    console.log('MongoDB Connected...');
  } catch (err) {
    console.error('Erreur de connexion MongoDB:', err.message);
    setTimeout(connectDB, 5000);
  }
};

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB déconnecté. Tentative de reconnexion...');
  setTimeout(connectDB, 5000);
});

module.exports = connectDB;
