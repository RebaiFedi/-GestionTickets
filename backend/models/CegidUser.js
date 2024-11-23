const mongoose = require('mongoose');

const CegidUserSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true
  },
  userGroup: {
    type: String,
    required: true
  },
  userLogin: {
    type: String,
    default: undefined
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'validated_and_processed', 'rejected', 'cancelled'],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('CegidUser', CegidUserSchema);
