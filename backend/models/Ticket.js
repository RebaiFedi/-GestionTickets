const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  code: {
    type: String,
    required: true
  },
  caissier: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['delete', 'modify'],
    required: true
  },
  cause: String,
  oldPaymentMethod: String,
  newPaymentMethod: String,
  oldPaymentMethod2: String,
  newPaymentMethod2: String,
  amount: Number,
  image: {
    type: String,
    required: false
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'validated_and_processed', 'cancelled'],
    default: 'pending'
  },
  isClassified: {
    type: Boolean,
    default: false
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  dateTicket: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

// Supprimez l'index unique sur le champ 'code' s'il existe
// TicketSchema.index({ code: 1 }, { unique: false });

// Ajouter des index pour les champs fréquemment recherchés
TicketSchema.index({ store: 1, createdAt: -1 });
TicketSchema.index({ status: 1 });
TicketSchema.index({ code: 1 });

// Ajouter ces index au modèle Ticket
TicketSchema.index({ store: 1, status: 1 });
TicketSchema.index({ createdAt: -1 });
TicketSchema.index({ store: 1, createdAt: -1 });
TicketSchema.index({ status: 1, isArchived: 1 });

module.exports = mongoose.model('Ticket', TicketSchema);
