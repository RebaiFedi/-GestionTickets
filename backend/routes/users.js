const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const District = require('../models/District');
const Store = require('../models/Store');
const auth = require('../middleware/auth');

// @route   POST api/users
// @desc    Register a user
// @access  Public
router.post('/', async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    // Vérifier si un utilisateur avec le même nom d'utilisateur et le même rôle existe déjà
    let user = await User.findOne({ username, role });
    if (user) {
      return res.status(400).json({ msg: 'Un utilisateur avec ce nom et ce rôle existe déjà' });
    }

    // Vérifier si l'email est fourni pour le rôle district
    if (role === 'district' && !email) {
      return res.status(400).json({ msg: 'L\'email est requis pour les utilisateurs district' });
    }

    user = new User({
      username,
      email: role === 'district' ? email : undefined,
      password,
      role
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    if (role === 'district') {
      const district = new District({
        name: username,
        user: user.id,
        email: email
      });
      await district.save();
      console.log('District créé:', district);
    } else if (role === 'store') {
      const store = new Store({
        name: username,
        user: user.id
      });
      await store.save();
      console.log('Magasin créé:', store);
    }

    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 3600 },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user.id,
            username: user.username,
            role: user.role
          }
        });
      }
    );
  } catch (err) {
    console.error('Erreur lors de la création de l\'utilisateur:', err);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/users/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  console.log('Requête de login reçue:', req.body);
  const { username, password } = req.body;

  try {
    let user = await User.findOne({ username });
    if (!user) {
      console.log('Utilisateur non trouvé');
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Mot de passe incorrect');
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 3600 },
      (err, token) => {
        if (err) throw err;
        res.json({ 
          token, 
          user: { 
            id: user.id, 
            username: user.username, 
            role: user.role 
          } 
        });
      }
    );
  } catch (err) {
    console.error('Erreur serveur:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/users/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (user.role === 'store') {
      const store = await Store.findOne({ user: user._id });
      if (store) {
        user.store = store._id;
      }
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/users
// @desc    Get all assigned users
// @access  Private (Admin only)
router.get('/', auth, async (req, res) => {
  try {
    console.log('Tentative de récupération des utilisateurs assignés');
    
    const districtUsers = await District.distinct('user');
    const storeUsers = await Store.distinct('user');
    
    // Convertir en chaînes et combiner les tableaux
    const assignedUserIds = [...new Set([...districtUsers, ...storeUsers].map(id => id.toString()))];
    
    const users = await User.find({ _id: { $in: assignedUserIds } }).select('-password');
    console.log('Utilisateurs assignés récupérés:', users);
    res.json(users);
  } catch (err) {
    console.error('Erreur lors de la récupération des utilisateurs:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/users/:id
// @desc    Delete a user
// @access  Private (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const userId = req.params.id;

    // 1. Récupérer l'utilisateur avant de le supprimer pour connaître son rôle
    const userToDelete = await User.findById(userId);
    if (!userToDelete) {
      return res.status(404).json({ msg: "Utilisateur non trouvé" });
    }

    // 2. Si c'est un utilisateur de type store
    if (userToDelete.role === 'store') {
      // Supprimer le magasin associé
      await Store.findOneAndDelete({ user: userId });
      
      // Nettoyer les références dans les districts
      await District.updateMany(
        {},
        { $pull: { stores: userId } }
      );
    }

    // 3. Si c'est un utilisateur de type district
    if (userToDelete.role === 'district') {
      // Supprimer le district
      const deletedDistrict = await District.findOneAndDelete({ user: userId });
      
      // Nettoyer les références dans les magasins
      if (deletedDistrict) {
        await Store.updateMany(
          { districts: deletedDistrict._id },
          { $pull: { districts: deletedDistrict._id } }
        );
      }
    }

    // 4. Supprimer l'utilisateur lui-même de la table User
    await User.findByIdAndDelete(userId);

    // 5. Réponse de succès
    res.json({ 
      msg: "Utilisateur et toutes ses références supprimés avec succès",
      deletedUserId: userId 
    });

  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    res.status(500).json({ msg: "Erreur lors de la suppression de l'utilisateur" });
  }
});

// @route   PUT api/users/:id
// @desc    Update a user
// @access  Private (Admin only)
router.put('/:id', auth, async (req, res) => {
  console.log("Requête PUT reçue pour l'utilisateur ID:", req.params.id);
  console.log("Données reçues:", req.body);
  console.log("User from token:", req.user);
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized' });
    }
    const { username, role, password } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    if (username) user.username = username;
    if (role) user.role = role;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }
    await user.save();
    console.log("Utilisateur mis à jour:", user);
    res.json({ msg: 'User updated', user: { _id: user._id, username: user.username, role: user.role } });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
