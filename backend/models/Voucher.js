const mongoose = require('mongoose');

const VoucherSchema = new mongoose.Schema({
  voucherNumber: {
    type: String,
    required: true,
    index: false
  },
  amount: {
    type: Number,
    required: true
  },
  fullName: {
    type: String,
    required: true
  },
  cin: {
    type: String,
    required: true
  },
  voucherType: {
    type: String,
    required: true
  },
  voucherDate: {
    type: Date,
    required: true
  },
  image: {
    type: String,
    required: false
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'validated', 'not_found', 'rejected'],
    default: 'pending'
  },
  validatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  toBeValidatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Voucher', VoucherSchema);
