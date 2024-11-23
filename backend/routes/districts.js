const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const District = require('../models/District');
const Store = require('../models/Store');

// @route   GET api/districts
// @desc    Get all districts
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const districts = await District.find().populate('user', 'username');
    const safeDistricts = districts.map(district => ({
      ...district.toObject(),
      user: district.user ? { _id: district.user._id, username: district.user.username } : null
    }));
    res.json(safeDistricts);
  } catch (err) {
    console.error('Erreur lors de la récupération des districts:', err);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/districts/link
// @desc    Link stores to a district
// @access  Private (Admin only)
router.post('/link', auth, async (req, res) => {
  console.log('Requête de liaison reçue:', req.body);
  const { districtId, storeId } = req.body;

  if (!districtId || !storeId) {
    return res.status(400).json({ msg: 'District ID et Store ID sont requis' });
  }

  try {
    const district = await District.findById(districtId);
    const store = await Store.findById(storeId);

    if (!district || !store) {
      return res.status(404).json({ msg: 'District ou Store non trouvé' });
    }

    if (!district.stores.includes(storeId)) {
      district.stores.push(storeId);
      await district.save();
    }

    if (!store.districts.includes(districtId)) {
      store.districts.push(districtId);
      await store.save();
    }

    res.json({ msg: 'Liaison district-magasin réussie', district, store });
  } catch (err) {
    console.error('Erreur lors de la liaison:', err);
    res.status(500).json({ msg: 'Erreur serveur', error: err.message });
  }
});

router.post('/unlink', auth, async (req, res) => {
  const { districtId, storeId } = req.body;

  if (!districtId || !storeId) {
    return res.status(400).json({ msg: 'District ID et Store ID sont requis' });
  }

  try {
    const district = await District.findById(districtId);
    const store = await Store.findById(storeId);

    if (!district || !store) {
      return res.status(404).json({ msg: 'District ou Store non trouvé' });
    }

    district.stores = district.stores.filter(id => id.toString() !== storeId);
    await district.save();

    store.districts = store.districts.filter(id => id.toString() !== districtId);
    await store.save();

    res.json({ msg: 'Déliaison district-magasin réussie', district, store });
  } catch (err) {
    console.error('Erreur lors de la déliaison:', err);
    res.status(500).json({ msg: 'Erreur serveur', error: err.message });
  }
});

module.exports = router;
