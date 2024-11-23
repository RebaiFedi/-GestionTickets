const express = require('express');
const router = express.Router();
const Transfer = require('../models/Transfer');
const auth = require('../middleware/auth');
const District = require('../models/District');
const Store = require('../models/Store');
const { sendEmail } = require('../emailService');

// Créer un nouveau transfert
router.post('/', auth, async (req, res) => {
  try {
    const { transferNumber, quantity, date, destination } = req.body;

    const newTransfer = new Transfer({
      transferNumber,
      quantity,
      date,
      destination,
      store: req.user.store
    });

    const transfer = await newTransfer.save();
    
    // Répondre immédiatement au client
    res.json(transfer);

    // Envoyer l'email de manière asynchrone
    setImmediate(async () => {
      try {
        const store = await Store.findById(req.user.store);
        const districts = await District.find({ stores: store._id }).populate('user');

        for (const district of districts) {
          if (district.user && district.user.email) {
            const emailSubject = `Nouvelle demande de transfert à valider`;
            const transferDetails = {
              type: 'transfer',
              transferNumber: transfer.transferNumber,
              quantity: transfer.quantity,
              date: transfer.date,
              destination: transfer.destination,
              store: store.name
            };

            try {
              await sendEmail(district.user.email, emailSubject, transferDetails);
              console.log('Email de transfert envoyé au district:', district.user.email);
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
    console.error('Erreur lors de la création du transfert:', error);
    res.status(500).json({ msg: 'Erreur serveur' });
  }
});

// Obtenir tous les transferts d'un magasin
router.get('/', auth, async (req, res) => {
  try {
    const transfers = await Transfer.find({ store: req.user.store })
      .sort({ createdAt: -1 });
    res.json(transfers);
  } catch (error) {
    console.error('Erreur lors de la récupération des transferts:', error);
    res.status(500).json({ msg: 'Erreur serveur' });
  }
});

// Mettre à jour le statut d'un transfert
router.put('/:id/status', auth, async (req, res) => {
  try {
    const transfer = await Transfer.findById(req.params.id);
    if (!transfer) {
      return res.status(404).json({ msg: 'Transfert non trouvé' });
    }

    if (transfer.store.toString() !== req.user.store.toString()) {
      return res.status(403).json({ msg: 'Non autorisé' });
    }

    if (transfer.status !== 'pending') {
      return res.status(400).json({ msg: 'Ce transfert ne peut plus être modifié' });
    }

    transfer.status = req.body.status;
    await transfer.save();
    res.json(transfer);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    res.status(500).json({ msg: 'Erreur serveur' });
  }
});

// Obtenir tous les transferts pour un district
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

    const transfers = await Transfer.find({ store: { $in: storeIds } })
      .populate('store', 'name')
      .sort({ createdAt: -1 });

    res.json(transfers);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ msg: 'Erreur serveur' });
  }
});

// Valider un transfert
router.put('/:id/validate', auth, async (req, res) => {
  try {
    if (req.user.role !== 'district') {
      return res.status(403).json({ msg: 'Non autorisé' });
    }

    const transfer = await Transfer.findById(req.params.id);
    if (!transfer) {
      return res.status(404).json({ msg: 'Transfert non trouvé' });
    }

    transfer.status = 'completed';
    await transfer.save();
    res.json(transfer);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ msg: 'Erreur serveur' });
  }
});

// Rejeter un transfert
router.put('/:id/reject', auth, async (req, res) => {
  try {
    if (req.user.role !== 'district') {
      return res.status(403).json({ msg: 'Non autorisé' });
    }

    const transfer = await Transfer.findById(req.params.id);
    if (!transfer) {
      return res.status(404).json({ msg: 'Transfert non trouvé' });
    }

    transfer.status = 'cancelled';
    await transfer.save();
    res.json(transfer);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ msg: 'Erreur serveur' });
  }
});

// Ajouter cette route
router.get('/validated', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Non autorisé' });
    }

    const transfers = await Transfer.find({ status: 'completed' })
      .populate('store', 'name')
      .sort({ createdAt: -1 });

    res.json(transfers);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ msg: 'Erreur serveur' });
  }
});

// Marquer un transfert comme traité
router.put('/:id/process', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Non autorisé' });
    }

    const transfer = await Transfer.findById(req.params.id);
    if (!transfer) {
      return res.status(404).json({ msg: 'Transfert non trouvé' });
    }

    if (transfer.status !== 'completed') {
      return res.status(400).json({ msg: 'Le transfert doit être validé avant d\'être traité' });
    }

    transfer.status = 'validated_and_processed';
    await transfer.save();
    res.json(transfer);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ msg: 'Erreur serveur' });
  }
});

module.exports = router;
