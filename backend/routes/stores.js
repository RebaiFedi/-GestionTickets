const express = require('express');
const router = express.Router();
const Store = require('../models/Store');
const auth = require('../middleware/auth');

// Get all stores
router.get('/', auth, async (req, res) => {
  try {
    // Ne récupérer que les magasins qui ont un utilisateur valide
    const stores = await Store.find()
      .populate('user', 'username')
      .exec();

    // Filtrer pour ne garder que les magasins avec un utilisateur valide
    const activeStores = stores.filter(store => store.user);
    
    res.json(activeStores);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Add other store-related routes here (create, update, delete)

module.exports = router;
