const mongoose = require('mongoose');

const TransferSchema = new mongoose.Schema({
  transferNumber: {
    type: String,
    required: true,
    unique: true
  },
  quantity: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  destination: {
    type: String,
    required: true
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled', 'validated_and_processed'],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Transfer', TransferSchema);
