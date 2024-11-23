const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: function() { return this.role === 'district'; }
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true,
    enum: ['admin', 'district', 'store', 'consulting']
  }
});

// Créer un index composé unique sur username et role
UserSchema.index({ username: 1, role: 1 }, { unique: true });

module.exports = mongoose.model('User', UserSchema);
