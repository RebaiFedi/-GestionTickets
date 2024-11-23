const express = require('express');
const ticketRouter = express.Router();
const Ticket = require('../models/Ticket');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const Store = require('../models/Store');
const District = require('../models/District');
const Voucher = require('../models/Voucher');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const util = require('util');
const { isValid, parseISO } = require('date-fns');
const PDFDocument = require('pdfkit');
const fs = require('fs');

// Configuration de nodemailer
const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Fonction pour envoyer un email
async function sendEmail(to, subject, ticketDetails) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Nouveau ticket à valider</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 20px auto; background-color: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        .header { background-color: #FF6600; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .footer { background-color: #f8f8f8; text-align: center; padding: 10px; font-size: 0.8em; color: #666; }
        .button { display: inline-block; padding: 10px 20px; background-color: #FF6600; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .ticket-details { background-color: #f8f8f8; padding: 15px; border-radius: 5px; margin-top: 20px; }
        .ticket-details p { margin: 5px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Nouveau ticket à valider</h1>
        </div>
        <div class="content">
          <p>Bonjour,</p>
          <p>Un nouveau ticket nécessite votre validation. Voici les détails :</p>
          <div class="ticket-details">
            <p><strong>Type :</strong> ${ticketDetails.type === 'delete' ? 'Suppression' : 'Modification'}</p>
            <p><strong>Code :</strong> ${ticketDetails.code}</p>
            <p><strong>Caissier :</strong> ${ticketDetails.caissier}</p>
            ${ticketDetails.type === 'delete' 
              ? `<p><strong>Cause :</strong> ${ticketDetails.cause}</p>`
              : `<p><strong>Ancien mode de paiement :</strong> ${ticketDetails.oldPaymentMethod}</p>
                 <p><strong>Nouveau mode de paiement :</strong> ${ticketDetails.newPaymentMethod}</p>
                 ${ticketDetails.oldPaymentMethod2 && ticketDetails.newPaymentMethod2 
                   ? `<p><strong>Ancien mode de paiement 2 :</strong> ${ticketDetails.oldPaymentMethod2}</p>
                      <p><strong>Nouveau mode de paiement 2 :</strong> ${ticketDetails.newPaymentMethod2}</p>`
                   : ''}
                 <p><strong>Montant :</strong> ${ticketDetails.amount} TND</p>`
            }
          </div>
          <p>Veuillez vous connecter à la plateforme pour valider ce ticket.</p>
          <a href="${process.env.FRONTEND_URL}/login" class="button">Se connecter à la plateforme</a>
        </div>
        <div class="footer">
          <p>Cet email a été envoyé automatiquement. Merci de ne pas y répondre.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: to,
      subject: subject,
      html: htmlTemplate
    });
    console.log('Email envoyé: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    throw error;
  }
}

// Configuration de multer pour l'upload de fichiers
const fileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const fileUpload = multer({ storage: fileStorage });

// @route   POST api/tickets
// @desc    Create a new ticket
// @access  Private
ticketRouter.post('/', auth, fileUpload.single('image'), async (req, res) => {
  try {
    const { 
      code, 
      caissier, 
      type, 
      cause, 
      oldPaymentMethod, 
      newPaymentMethod, 
      oldPaymentMethod2, 
      newPaymentMethod2, 
      amount,
      dateTicket 
    } = req.body;

    const newTicket = new Ticket({
      store: req.user.store,
      code,
      caissier,
      type,
      dateTicket: new Date(dateTicket),
      cause: type === 'delete' ? cause : undefined,
      oldPaymentMethod: type === 'modify' ? oldPaymentMethod : undefined,
      newPaymentMethod: type === 'modify' ? newPaymentMethod : undefined,
      oldPaymentMethod2: type === 'modify' ? oldPaymentMethod2 : undefined,
      newPaymentMethod2: type === 'modify' ? newPaymentMethod2 : undefined,
      amount: amount ? parseFloat(amount) : undefined,
      image: req.file ? req.file.path : undefined
    });

    const ticket = await newTicket.save();
    
    // Répondre immédiatement au client
    res.json(ticket);

    // Envoyer l'email de manière asynchrone
    setImmediate(async () => {
      try {
        const store = await Store.findById(req.user.store);
        const districts = await District.find({ stores: store._id }).populate('user');

        for (const district of districts) {
          if (district.user && district.user.email) {
            const emailSubject = `Nouveau ticket à valider - ${ticket.type === 'delete' ? 'Suppression' : 'Modification'}`;
            const ticketDetails = {
              type: ticket.type,
              code: ticket.code,
              caissier: ticket.caissier,
              cause: ticket.cause,
              oldPaymentMethod: ticket.oldPaymentMethod,
              newPaymentMethod: ticket.newPaymentMethod,
              oldPaymentMethod2: ticket.oldPaymentMethod2,
              newPaymentMethod2: ticket.newPaymentMethod2,
              amount: ticket.amount
            };

            try {
              await sendEmail(district.user.email, emailSubject, ticketDetails);
              console.log('Email envoyé au district:', district.user.email);
            } catch (emailError) {
              console.error('Erreur lors de l\'envoi de l\'email:', emailError);
              // L'erreur d'envoi d'email n'affecte pas la réponse au client
            }
          }
        }
      } catch (error) {
        console.error('Erreur lors de l\'envoi des emails:', error);
      }
    });

  } catch (error) {
    console.error('Erreur lors de la création du ticket:', error);
    res.status(500).json({ msg: 'Erreur lors de la création du ticket', error: error.message });
  }
});

// @route   GET api/tickets
// @desc    Get all tickets for a store, including archived ones
// @access  Private
ticketRouter.get('/', auth, async (req, res) => {
  try {
    const tickets = await Ticket.find({ store: req.user.store }).sort({ createdAt: -1 });
    console.log('Tickets envoyés au client:', tickets); // Ajoutez ce log
    const ticketsWithFullImagePath = tickets.map(ticket => ({
      ...ticket.toObject(),
      image: ticket.image ? `${req.protocol}://${req.get('host')}/${ticket.image}` : null
    }));
    res.json(ticketsWithFullImagePath);
  } catch (err) {
    console.error('Erreur lors de la récupération des tickets:', err);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/tickets/district
// @desc    Get tickets for the current district's stores
// @access  Private (District only)
ticketRouter.get('/district', auth, async (req, res) => {
  try {
    const district = await District.findOne({ user: req.user.id });
    if (!district) {
      return res.status(404).json({ msg: 'District non trouvé' });
    }

    const stores = await Store.find({ districts: district._id });
    const storeIds = stores.map(store => store._id);

    const tickets = await Ticket.find({ store: { $in: storeIds } })
      .select('code caissier type status store cause oldPaymentMethod newPaymentMethod oldPaymentMethod2 newPaymentMethod2 amount image createdAt dateTicket')
      .populate('store', 'name')
      .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ msg: 'Erreur serveur' });
  }
});

// @route   PUT api/tickets/:id
// @desc    Update ticket status (approve or reject)
// @access  Private (District only)
ticketRouter.put('/:id', auth, async (req, res) => {
  console.log('Requête PUT reçue pour le ticket:', req.params.id);
  console.log('Données reçues:', req.body);
  console.log('Utilisateur:', req.user);

  try {
    if (req.user.role !== 'district') {
      console.log('Tentative non autorisée par un utilisateur non-district');
      return res.status(403).json({ msg: 'Not authorized' });
    }

    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      console.log('Statut invalide reçu:', status);
      return res.status(400).json({ msg: 'Invalid status' });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      console.log('Ticket non trouvé:', req.params.id);
      return res.status(404).json({ msg: 'Ticket not found' });
    }

    ticket.status = status;
    await ticket.save();

    console.log('Ticket mis à jour avec succès:', ticket);
    res.json(ticket);
  } catch (err) {
    console.error('Erreur lors de la mise à jour du ticket:', err);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
});

// @route   DELETE api/tickets/:id
// @desc    Delete a ticket
// @access  Private (Store or Admin)
ticketRouter.delete('/:id', auth, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate('store');
    if (!ticket) {
      return res.status(404).json({ msg: 'Ticket not found' });
    }

    // Vérifier si l'utilisateur est admin ou le propriétaire du magasin associé au ticket
    if (req.user.role === 'admin' || (req.user.role === 'store' && ticket.user.toString() === req.user.id)) {
      await Ticket.findByIdAndDelete(req.params.id);
      res.json({ msg: 'Ticket removed' });
    } else {
      return res.status(403).json({ msg: 'Not authorized to delete this ticket' });
    }
  } catch (err) {
    console.error('Error in delete ticket route:', err);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/tickets/all
// @desc    Get all tickets (for admin)
// @access  Private (Admin only)
ticketRouter.get('/all', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized' });
    }
    const tickets = await Ticket.find().populate('store', 'name');
    res.json(tickets);
  } catch (err) {
    console.error('Erreur lors de la rcupération de tous les tickets:', err);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/tickets/:id/classify
// @desc    Classify a ticket
// @access  Private (Admin only)
ticketRouter.put('/:id/classify', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ msg: 'Ticket not found' });
    }

    ticket.isClassified = true;
    await ticket.save();

    res.json({ msg: 'Ticket classified successfully', ticket });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/tickets/:id/archive
// @desc    Archive a ticket
// @access  Private (Admin only)
ticketRouter.put('/:id/archive', auth, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate('store', 'name');
    if (!ticket) {
      return res.status(404).json({ msg: 'Ticket not found' });
    }

    ticket.status = 'validated_and_processed';
    ticket.isArchived = true;
    
    await ticket.save();

    // Retourner directement le ticket archivé
    res.json({ 
      msg: 'Ticket archivé avec succès',
      ticket: ticket 
    });

  } catch (error) {
    console.error('Erreur lors de l\'archivage du ticket:', error);
    res.status(500).json({ msg: 'Erreur serveur' });
  }
});

// Route pour obtenir uniquement les tickets non classés
ticketRouter.get('/unclassified', auth, async (req, res) => {
  try {
    const tickets = await Ticket.find({ isClassified: false })
      .populate('store', 'name')
      .sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Route pour obtenir uniquement les tickets classés
ticketRouter.get('/classified', auth, async (req, res) => {
  try {
    const tickets = await Ticket.find({ isClassified: true })
      .populate('store', 'name')
      .sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Route pour obtenir uniquement les tickets archivés
ticketRouter.get('/archived', auth, async (req, res) => {
  try {
    console.log('Requête reçue pour récupérer les tickets archivés');
    const tickets = await Ticket.find({ isArchived: true })
      .sort({ createdAt: -1 })
      .populate('store', 'name')
      .lean();
    
    // Assurez-vous que les dates sont valides
    const validatedTickets = tickets.map(ticket => ({
      ...ticket,
      createdAt: ticket.createdAt ? new Date(ticket.createdAt).toISOString() : null
    }));
    
    console.log('Tickets archivés trouvés:', validatedTickets);
    res.json(validatedTickets);
  } catch (err) {
    console.error('Erreur lors de la récupération des tickets archivés:', err);
    res.status(500).send('Server Error');
  }
});

// Route pour obtenir uniquement les tickets validés
ticketRouter.get('/validated', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized' });
    }
    const tickets = await Ticket.find({ status: 'approved', isArchived: false })
      .populate('store', 'name')
      .sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/tickets/:id/status
// @desc    Update ticket status (cancel)
// @access  Private (Store only)
ticketRouter.put('/:id/status', auth, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate('store');
    if (!ticket) {
      return res.status(404).json({ msg: 'Ticket not found' });
    }

    console.log('User ID:', req.user.id);
    console.log('Ticket store user:', ticket.store.user);

    // Vérifier si l'utilisateur est le propriétaire du magasin associé au ticket
    if (req.user.role !== 'store' || ticket.store.user.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to update this ticket' });
    }

    // Vérifier si le ticket peut être annulé
    if (ticket.status !== 'pending') {
      return res.status(400).json({ msg: 'This ticket cannot be cancelled' });
    }

    const { status } = req.body;
    if (status !== 'cancelled') {
      return res.status(400).json({ msg: 'Invalid status' });
    }

    ticket.status = status;
    await ticket.save();

    res.json(ticket);
  } catch (err) {
    console.error('Error in update ticket status route:', err);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
});

// @route   GET api/tickets/store-stats
// @desc    Get detailed statistics for district stores
// @access  Private (District only)
ticketRouter.get('/store-stats', auth, async (req, res) => {
  try {
    const { period = '30days' } = req.query;
    
    // Calculer les dates en fonction de la période sélectionnée
    const now = new Date();
    let dateFilter = {};

    switch(period) {
      case 'today':
        dateFilter = {
          $gte: new Date(now.setHours(0, 0, 0, 0)),
          $lt: new Date(now.setHours(23, 59, 59, 999))
        };
        break;
      case '7days':
        dateFilter = {
          $gte: new Date(now.setDate(now.getDate() - 7)),
          $lt: new Date()
        };
        break;
      case '30days':
        dateFilter = {
          $gte: new Date(now.setDate(now.getDate() - 30)),
          $lt: new Date()
        };
        break;
      case 'custom':
        if (req.query.startDate && req.query.endDate) {
          dateFilter = {
            $gte: new Date(req.query.startDate),
            $lt: new Date(new Date(req.query.endDate).setHours(23, 59, 59, 999))
          };
        }
        break;
    }

    const district = await District.findOne({ user: req.user.id });
    if (!district) {
      return res.status(404).json({ msg: 'District not found' });
    }

    const stores = await Store.find({ districts: district._id });
    const storeStats = await Promise.all(stores.map(async (store) => {
      try {
        // Utiliser le filtre de date pour tous les tickets
        const tickets = await Ticket.find({
          store: store._id,
          createdAt: dateFilter
        });

        // Calculer la période précédente pour les comparaisons
        const previousPeriodStart = new Date(dateFilter.$gte);
        const periodLength = dateFilter.$lt - dateFilter.$gte;
        previousPeriodStart.setTime(previousPeriodStart.getTime() - periodLength);

        const previousPeriodTickets = await Ticket.find({
          store: store._id,
          createdAt: {
            $gte: previousPeriodStart,
            $lt: dateFilter.$gte
          }
        });

        // Calculer les statistiques
        const currentTotal = tickets.length;
        const previousTotal = previousPeriodTickets.length;
        
        const currentDeletions = tickets.filter(t => t.type === 'delete').length;
        const previousDeletions = previousPeriodTickets.filter(t => t.type === 'delete').length;
        
        const currentModifications = tickets.filter(t => t.type === 'modify').length;
        const previousModifications = previousPeriodTickets.filter(t => t.type === 'modify').length;

        // Calculer les variations
        const calculateVariation = (current, previous) => {
          if (previous === 0) return current > 0 ? 100 : 0;
          return ((current - previous) / previous) * 100;
        };

        // Traiter les statistiques par caissier
        const cashierMap = new Map();
        tickets.forEach(ticket => {
          if (!ticket.caissier) return;

          if (!cashierMap.has(ticket.caissier)) {
            cashierMap.set(ticket.caissier, {
              name: ticket.caissier,
              deletions: 0,
              modifications: 0,
              totalTickets: 0,
              totalAmount: 0,
              lastActivity: ticket.createdAt
            });
          }

          const cashierStats = cashierMap.get(ticket.caissier);
          cashierStats.totalTickets++;
          cashierStats.totalAmount += ticket.amount || 0;

          if (ticket.type === 'delete') {
            cashierStats.deletions++;
          } else if (ticket.type === 'modify') {
            cashierStats.modifications++;
          }

          if (new Date(ticket.createdAt) > new Date(cashierStats.lastActivity)) {
            cashierStats.lastActivity = ticket.createdAt;
          }
        });

        return {
          name: store.name,
          totalTickets: currentTotal,
          deletions: currentDeletions,
          modifications: currentModifications,
          variations: {
            total: calculateVariation(currentTotal, previousTotal),
            deletions: calculateVariation(currentDeletions, previousDeletions),
            modifications: calculateVariation(currentModifications, previousModifications)
          },
          cashierDetailedStats: Array.from(cashierMap.values()).map(stats => ({
            ...stats,
            storeName: store.name
          }))
        };
      } catch (error) {
        console.error(`Erreur pour le magasin ${store.name}:`, error);
        return {
          name: store.name,
          totalTickets: 0,
          deletions: 0,
          modifications: 0,
          variations: { total: 0, deletions: 0, modifications: 0 },
          cashierDetailedStats: []
        };
      }
    }));

    res.json(storeStats);
  } catch (err) {
    console.error('Erreur lors du calcul des statistiques:', err);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/tickets/vouchers/verify
// @desc    Verify a purchase voucher
// @access  Private (Store only)
ticketRouter.post('/vouchers/verify', auth, fileUpload.single('image'), async (req, res) => {
  try {
    if (req.user.role !== 'store') {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    const { voucherNumber, amount, fullName, cin, voucherType, voucherDate } = req.body;

    // Créer le nouveau bon d'achat
    const newVoucher = new Voucher({
      voucherNumber,
      amount: parseFloat(amount),
      fullName,
      cin,
      voucherType,
      voucherDate,
      image: req.file ? req.file.path : undefined,
      store: req.user.store,
      status: 'pending'
    });

    // Sauvegarder le bon d'achat
    const savedVoucher = await newVoucher.save();

    // Récupérer le bon sauvegardé avec les informations du magasin
    const populatedVoucher = await Voucher.findById(savedVoucher._id)
      .populate('store', 'name');

    res.json(populatedVoucher);

  } catch (error) {
    console.error('Erreur lors de la création du bon:', error);
    res.status(500).json({ 
      msg: 'Erreur lors de la création du bon',
      error: error.message 
    });
  }
});

// @route   GET api/vouchers
// @desc    Get all vouchers
// @access  Private (Admin only)
ticketRouter.get('/vouchers', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized' });
    }
    const vouchers = await Voucher.find().populate('store', 'name').sort({ createdAt: -1 });
    res.json(vouchers);
  } catch (err) {
    console.error('Erreur lors de la récupération des bons d\'achat:', err);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/tickets/vouchers/store
// @desc    Get vouchers for the current store
// @access  Private (Store only)
ticketRouter.get('/vouchers/store', auth, async (req, res) => {
  try {
    if (req.user.role !== 'store') {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    const vouchers = await Voucher.find({ store: req.user.store })
      .sort({ createdAt: -1 })
      .select('voucherNumber amount fullName cin voucherType voucherDate image createdAt status');
    res.json(vouchers);
  } catch (err) {
    console.error('Erreur lors de la récupération des bons d\'achat du magasin:', err);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/tickets/vouchers/:id/status
// @desc    Update voucher status
// @access  Private (Admin only)
ticketRouter.put('/vouchers/:id/status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    const { status } = req.body;
    if (!['pending', 'validated', 'not_found', 'rejected'].includes(status)) {
      return res.status(400).json({ msg: 'Invalid status' });
    }

    const voucher = await Voucher.findById(req.params.id);
    if (!voucher) {
      return res.status(404).json({ msg: 'Voucher not found' });
    }

    voucher.status = status;
    if (status === 'validated') {
      voucher.validatedBy = req.user._id;
    }
    await voucher.save();

    res.json(voucher);
  } catch (err) {
    console.error('Error in update voucher status route:', err);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/admin/global-stats
// @desc    Get global statistics for admin dashboard
// @access  Private (Admin only)
ticketRouter.get('/admin/global-stats', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    const totalTickets = await Ticket.countDocuments();
    const vouchersToVerify = await Voucher.countDocuments({ status: 'pending' });
    const storeUsers = await User.countDocuments({ role: 'store' });
    const districtUsers = await User.countDocuments({ role: 'district' });

    res.json({
      totalTickets,
      vouchersToVerify,
      storeUsers,
      districtUsers
    });
  } catch (err) {
    console.error('Error in global stats route:', err);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/tickets/all
// @desc    Get all tickets (for consulting)
// @access  Private (Consulting only)
ticketRouter.get('/all', auth, async (req, res) => {
  try {
    if (req.user.role !== 'consulting') {
      return res.status(403).json({ msg: 'Not authorized' });
    }
    const tickets = await Ticket.find().populate('store', 'name').sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/tickets/consulting
// @desc    Get all tickets for consulting (no auth required)
// @access  Public
ticketRouter.get('/consulting', async (req, res) => {
  try {
    const tickets = await Ticket.find()
      .populate({
        path: 'store',
        populate: {
          path: 'districts',
          select: 'name'
        }
      })
      .sort({ createdAt: -1 });

    // Transformer les données pour inclure le district
    const transformedTickets = tickets.map(ticket => {
      const ticketObj = ticket.toObject();
      return {
        ...ticketObj,
        store: {
          ...ticketObj.store,
          district: ticketObj.store.districts && ticketObj.store.districts.length > 0 
            ? ticketObj.store.districts[0] 
            : null
        }
      };
    });

    res.json(transformedTickets);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

ticketRouter.get('/check-code/:code', async (req, res) => {
  try {
    const ticket = await Ticket.findOne({ code: req.params.code });
    res.json({ exists: !!ticket });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la vérification du code" });
  }
});

ticketRouter.get('/vouchers/check-number/:number', async (req, res) => {
  try {
    const voucher = await Voucher.findOne({ voucherNumber: req.params.number });
    res.json({ exists: !!voucher });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la vérification du numéro de bon" });
  }
});

// @route   GET api/tickets/vouchers/:id/pdf
// @desc    Generate PDF for a verified voucher
// @access  Private (Store only)
ticketRouter.get('/vouchers/:id/pdf', auth, async (req, res) => {
  try {
    if (req.user.role !== 'store') {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    const voucher = await Voucher.findById(req.params.id)
      .populate('store')
      .populate('validatedBy');
      
    if (!voucher) {
      return res.status(404).json({ msg: 'Voucher not found' });
    }

    const doc = new PDFDocument({
      size: 'A4',
      margin: 40,
      font: 'Helvetica'
    });

    const filename = `voucher_${voucher._id}.pdf`;
    const stream = fs.createWriteStream(filename);
    doc.pipe(stream);

    // Configuration des styles pour le tableau moderne
    const styles = {
      page: {
        width: doc.page.width,
        height: doc.page.height,
        margin: 40,
        centerX: doc.page.width / 2
      },
      colors: {
        brand: {
          primary: '#FF6B00',
          secondary: '#FF8533'
        },
        text: {
          dark: '#1A1A1A',
          medium: '#4B5563',
          light: '#6B7280'
        },
        table: {
          header: '#F9FAFB',
          border: '#E5E7EB',
          row: '#FFFFFF',
          altRow: '#F9FAFB'
        }
      },
      table: {
        width: 450,
        rowHeight: 40,
        headerHeight: 45,
        fontSize: {
          header: 11,
          content: 12
        }
      }
    };

    // Bande supérieure orange
    const headerGradient = doc.linearGradient(0, 0, styles.page.width, 15);
    headerGradient.stop(0, styles.colors.brand.primary)
                 .stop(1, styles.colors.brand.secondary);
    doc.rect(0, 0, styles.page.width, 15)
       .fill(headerGradient);

    // En-tête du document
    doc.fontSize(32).font('Helvetica-Bold')
       .fillColor(styles.colors.text.dark)
       .text('BON D\'ACHAT', styles.page.margin, 50);

    doc.fontSize(13).font('Helvetica')
       .fillColor(styles.colors.text.medium)
       .text(`Référence: ${voucher.voucherNumber}`, styles.page.margin, 90);

    // Tableau moderne
    const tableX = styles.page.centerX - (styles.table.width / 2);
    const tableY = 150;
    
    // En-tête du tableau
    doc.roundedRect(tableX, tableY, styles.table.width, styles.table.headerHeight, 8)
       .fill(styles.colors.table.header);

    // Colonnes du tableau
    const colWidth = styles.table.width / 2;
    
    // En-têtes des colonnes
    doc.font('Helvetica-Bold').fontSize(styles.table.fontSize.header)
       .fillColor(styles.colors.text.medium);
    doc.text('DESCRIPTION', tableX + 20, tableY + 15);
    doc.text('DÉTAIL', tableX + colWidth + 20, tableY + 15);

    // Données du tableau
    const tableData = [
      ['Montant', `${voucher.amount.toLocaleString('fr-FR')} TND`],
      ['Client', voucher.fullName],
      ['CIN', voucher.cin],
      ['Type', voucher.voucherType]
    ];

    // Lignes du tableau
    tableData.forEach((row, index) => {
      const rowY = tableY + styles.table.headerHeight + (styles.table.rowHeight * index);
      
      // Fond de la ligne
      doc.roundedRect(tableX, rowY, styles.table.width, styles.table.rowHeight, 0)
         .fill(index % 2 === 0 ? styles.colors.table.row : styles.colors.table.altRow);
      
      // Texte de la ligne
      doc.font('Helvetica-Bold').fontSize(styles.table.fontSize.content)
         .fillColor(styles.colors.text.medium)
         .text(row[0], tableX + 20, rowY + 12);
      
      doc.font('Helvetica').fontSize(styles.table.fontSize.content)
         .fillColor(styles.colors.text.dark)
         .text(row[1], tableX + colWidth + 20, rowY + 12);
    });

    // Bordure du tableau
    doc.roundedRect(tableX, tableY, styles.table.width, 
                   styles.table.headerHeight + (styles.table.rowHeight * tableData.length), 8)
       .stroke(styles.colors.table.border);

    // Badge de validation
    if (voucher.validatedBy) {
      const badgeWidth = 250;
      const badgeHeight = 40;
      const badgeX = styles.page.centerX - (badgeWidth / 2);
      const badgeY = tableY + styles.table.headerHeight + 
                    (styles.table.rowHeight * tableData.length) + 40;

      const validationGradient = doc.linearGradient(badgeX, badgeY, badgeX + badgeWidth, badgeY);
      validationGradient.stop(0, '#ECFDF5').stop(1, '#D1FAE5');

      doc.roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 20)
         .fill(validationGradient);

      doc.fontSize(12)
         .font('Helvetica-Bold')
         .fillColor('#065F46')
         .text(`VALIDÉ par ${voucher.validatedBy.username}`,
           badgeX,
           badgeY + (badgeHeight - 12) / 2,
           {
             align: 'center',
             width: badgeWidth
           }
         );
    }

    // Pied de page
    doc.fontSize(9)
       .font('Helvetica')
       .fillColor(styles.colors.text.light)
       .text('Document généré automatiquement - Valide sans signature',
         styles.page.margin,
         styles.page.height - 60,
         {
           align: 'center',
           width: styles.page.width - (styles.page.margin * 2)
         }
       );

    // Bande inférieure orange
    const footerGradient = doc.linearGradient(0, styles.page.height - 15, styles.page.width, styles.page.height);
    footerGradient.stop(0, styles.colors.brand.secondary)
                 .stop(1, styles.colors.brand.primary);
    doc.rect(0, styles.page.height - 15, styles.page.width, 15)
       .fill(footerGradient);

    doc.end();

    stream.on('finish', () => {
      res.download(filename, (err) => {
        if (err) {
          console.error('Erreur lors du téléchargement du PDF:', err);
          res.status(500).json({ msg: 'Erreur lors de la génération du PDF' });
        }
        fs.unlinkSync(filename);
      });
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ msg: 'Erreur serveur' });
  }
});

// Route pour valider un ticket
ticketRouter.put('/:id/validate', auth, async (req, res) => {
  try {
    if (req.user.role !== 'district') {
      return res.status(403).json({ msg: 'Non autorisé' });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ msg: 'Ticket non trouvé' });
    }

    // Vérifier que le ticket est en attente
    if (ticket.status !== 'pending') {
      return res.status(400).json({ msg: 'Ce ticket ne peut plus être validé' });
    }

    // Mettre à jour le statut
    ticket.status = 'approved';
    
    // Conserver la date du ticket existante
    // Ne pas modifier ticket.dateTicket car elle existe déjà
    
    await ticket.save();

    // Envoyer une notification par email au magasin
    const store = await Store.findById(ticket.store).populate('user');
    if (store && store.user && store.user.email) {
      const emailSubject = 'Ticket validé';
      const ticketDetails = {
        type: 'validation',
        code: ticket.code,
        status: 'approved'
      };
      await sendEmail(store.user.email, emailSubject, ticketDetails);
    }

    res.json(ticket);
  } catch (error) {
    console.error('Erreur lors de la validation du ticket:', error);
    res.status(500).json({ msg: 'Erreur serveur', error: error.message });
  }
});

// Route pour rejeter un ticket
ticketRouter.put('/:id/reject', auth, async (req, res) => {
  try {
    if (req.user.role !== 'district') {
      return res.status(403).json({ msg: 'Non autorisé' });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ msg: 'Ticket non trouvé' });
    }

    // Vérifier que le ticket est en attente
    if (ticket.status !== 'pending') {
      return res.status(400).json({ msg: 'Ce ticket ne peut plus être rejeté' });
    }

    ticket.status = 'rejected';
    await ticket.save();

    // Envoyer une notification par email au magasin
    const store = await Store.findById(ticket.store).populate('user');
    if (store && store.user && store.user.email) {
      const emailSubject = 'Ticket rejeté';
      const ticketDetails = {
        type: 'rejection',
        code: ticket.code,
        status: 'rejected'
      };
      await sendEmail(store.user.email, emailSubject, ticketDetails);
    }

    res.json(ticket);
  } catch (error) {
    console.error('Erreur lors du rejet du ticket:', error);
    res.status(500).json({ msg: 'Erreur serveur' });
  }
});

// Route pour obtenir les tickets validés (admin)
ticketRouter.get('/validated', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Non autorisé' });
    }

    const tickets = await Ticket.find({ 
      status: 'approved',
      isArchived: false 
    })
    .populate('store', 'name')
    .sort({ createdAt: -1 });

    const ticketsWithFullImagePath = tickets.map(ticket => ({
      ...ticket.toObject(),
      image: ticket.image ? `${req.protocol}://${req.get('host')}/${ticket.image}` : null
    }));

    res.json(ticketsWithFullImagePath);
  } catch (error) {
    console.error('Erreur lors de la récupération des tickets validés:', error);
    res.status(500).json({ msg: 'Erreur serveur' });
  }
});

module.exports = ticketRouter;
