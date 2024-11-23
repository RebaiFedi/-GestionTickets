const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const ticketRoutes = require('./routes/tickets');
const transferRoutes = require('./routes/transfers');
const cegidUsersRoutes = require('./routes/cegidUsers');
const Voucher = require('./models/Voucher');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const CegidUser = require('./models/CegidUser');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const app = express();

// Init Middleware
app.use(cors());
app.use(express.json({ extended: false }));

// Connecter à la base de données MongoDB
connectDB();

// Gérer les erreurs de connexion MongoDB
mongoose.connection.on('error', (err) => {
  console.error('Erreur MongoDB:', err);
});

// Define Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/tickets', ticketRoutes);
app.use('/api/stores', require('./routes/stores'));
app.use('/api/districts', require('./routes/districts'));
app.use('/api/transfers', transferRoutes);
app.use('/api/cegid-users', cegidUsersRoutes);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Créer le dossier uploads s'il n'existe pas
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir);
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Server started on port ${PORT}`);
});

// Fonction pour supprimer l'index au démarrage
const removeVoucherNumberIndex = async () => {
  try {
    const collection = Voucher.collection;
    await collection.dropIndex('voucherNumber_1');
    console.log('Index voucherNumber supprimé avec succès');
  } catch (error) {
    console.log('Pas d\'index voucherNumber à supprimer');
  }
};

// Fonction pour créer l'utilisateur admin par défaut
async function createDefaultAdmin() {
  try {
    // Vérifier si un admin existe déjà
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (!adminExists) {
      // Créer l'admin par défaut avec les identifiants spécifiés
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('fr100394', salt);
      
      const admin = new User({
        username: 'admin',
        password: hashedPassword,
        role: 'admin'
      });

      await admin.save();
      console.log('Utilisateur admin par défaut créé avec succès');
    }
  } catch (error) {
    console.error('Erreur lors de la création de l\'admin par défaut:', error);
  }
}

// Ajouter cette fonction au démarrage
const removeCegidUserLoginIndex = async () => {
  try {
    const collection = mongoose.connection.collection('cegidusers');
    await collection.dropIndex('userLogin_1');
    console.log('Index userLogin supprimé avec succès');
  } catch (error) {
    console.log('Pas d\'index userLogin à supprimer');
  }
};

// Appeler la fonction au démarrage
removeCegidUserLoginIndex();
