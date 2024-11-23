const express = require('express');
const router = express.Router();
const CegidUser = require('../models/CegidUser');
const auth = require('../middleware/auth');
const District = require('../models/District');
const Store = require('../models/Store');
const { sendEmail } = require('../emailService');

// Créer un nouvel utilisateur CEGID
router.post('/', auth, async (req, res) => {
  try {
    const { fullName, userGroup } = req.body;

    const newCegidUser = new CegidUser({
      fullName,
      userGroup,
      store: req.user.store,
      status: 'pending'
    });

    const savedCegidUser = await newCegidUser.save();
    res.json(savedCegidUser);

    // Envoyer l'email de manière asynchrone
    setImmediate(async () => {
      try {
        const store = await Store.findById(req.user.store);
        const districts = await District.find({ stores: store._id }).populate('user');

        for (const district of districts) {
          if (district.user && district.user.email) {
            const emailSubject = `Nouvelle demande d'utilisateur CEGID à valider`;
            const userDetails = {
              type: 'cegidUser',  // Important pour le template
              fullName: savedCegidUser.fullName,
              userGroup: savedCegidUser.userGroup,
              userLogin: savedCegidUser.userLogin,
              store: store.name
            };

            try {
              await sendEmail(district.user.email, emailSubject, userDetails);
              console.log('Email utilisateur CEGID envoyé au district:', district.user.email);
            } catch (emailError) {
              console.error('Erreur lors de l\'envoi de l\'email:', emailError);
            }
          }
        }
      } catch (error) {
        console.error('Erreur lors de l\'envoi des emails:', error);
      }
    });

  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur CEGID:', error);
    res.status(500).json({ 
      msg: 'Erreur lors de la création de l\'utilisateur CEGID',
      error: error.message 
    });
  }
});

// Ajouter une route pour que l'admin puisse définir le userLogin
router.put('/:id/set-login', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Non autorisé' });
    }

    const { userLogin } = req.body;
    const cegidUser = await CegidUser.findById(req.params.id);

    if (!cegidUser) {
      return res.status(404).json({ msg: 'Utilisateur non trouvé' });
    }

    cegidUser.userLogin = userLogin;
    cegidUser.status = 'validated_and_processed';
    await cegidUser.save();

    res.json(cegidUser);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ msg: 'Erreur serveur' });
  }
});

// Obtenir tous les utilisateurs CEGID d'un magasin
router.get('/', auth, async (req, res) => {
  try {
    const cegidUsers = await CegidUser.find({ store: req.user.store })
      .sort({ createdAt: -1 });
    res.json(cegidUsers);
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs CEGID:', error);
    res.status(500).json({ msg: 'Erreur serveur' });
  }
});

// Remplacer la route delete par une route pour annuler
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const cegidUser = await CegidUser.findById(req.params.id);
    if (!cegidUser) {
      return res.status(404).json({ msg: 'Utilisateur non trouvé' });
    }

    // Vérifier que l'utilisateur appartient bien au magasin
    if (cegidUser.store.toString() !== req.user.store.toString()) {
      return res.status(403).json({ msg: 'Non autorisé' });
    }

    cegidUser.status = 'cancelled';
    await cegidUser.save();
    res.json(cegidUser);
  } catch (error) {
    console.error('Erreur lors de l\'annulation de l\'utilisateur CEGID:', error);
    res.status(500).json({ msg: 'Erreur serveur' });
  }
});

// Obtenir tous les utilisateurs CEGID pour un district
router.get('/district', auth, async (req, res) => {
  try {
    if (req.user.role !== 'district') {
      return res.status(403).json({ msg: 'Non autorisé' });
    }

    const district = await District.findOne({ user: req.user.id });
    if (!district) {
      return res.status(404).json({ msg: 'District non trouvé' });
    }

    const stores = await Store.find({ districts: district._id });
    const storeIds = stores.map(store => store._id);

    const cegidUsers = await CegidUser.find({ store: { $in: storeIds } })
      .populate('store', 'name')
      .sort({ createdAt: -1 });

    res.json(cegidUsers);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ msg: 'Erreur serveur' });
  }
});

// Valider un utilisateur CEGID
router.put('/:id/validate', auth, async (req, res) => {
  try {
    if (req.user.role !== 'district') {
      return res.status(403).json({ msg: 'Non autorisé' });
    }

    const cegidUser = await CegidUser.findById(req.params.id);
    if (!cegidUser) {
      return res.status(404).json({ msg: 'Utilisateur non trouvé' });
    }

    cegidUser.status = 'completed';
    await cegidUser.save();
    res.json(cegidUser);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ msg: 'Erreur serveur' });
  }
});

// Marquer un utilisateur CEGID comme traité
router.put('/:id/process', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Non autorisé' });
    }

    const cegidUser = await CegidUser.findById(req.params.id);
    if (!cegidUser) {
      return res.status(404).json({ msg: 'Utilisateur non trouvé' });
    }

    if (cegidUser.status !== 'completed') {
      return res.status(400).json({ msg: 'L\'utilisateur doit être validé avant d\'être traité' });
    }

    cegidUser.status = 'validated_and_processed';
    await cegidUser.save();
    res.json(cegidUser);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ msg: 'Erreur serveur' });
  }
});

// Rejeter un utilisateur CEGID
router.put('/:id/reject', auth, async (req, res) => {
  try {
    if (req.user.role !== 'district') {
      return res.status(403).json({ msg: 'Non autorisé' });
    }

    const cegidUser = await CegidUser.findById(req.params.id);
    if (!cegidUser) {
      return res.status(404).json({ msg: 'Utilisateur non trouvé' });
    }

    cegidUser.status = 'rejected';
    await cegidUser.save();
    res.json(cegidUser);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ msg: 'Erreur serveur' });
  }
});

// Obtenir les utilisateurs CEGID validés
router.get('/validated', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Non autorisé' });
    }

    const cegidUsers = await CegidUser.find({ status: 'completed' })
      .populate('store', 'name')
      .sort({ createdAt: -1 });

    res.json(cegidUsers);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ msg: 'Erreur serveur' });
  }
});

module.exports = router;
