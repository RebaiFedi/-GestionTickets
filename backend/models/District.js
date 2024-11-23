const mongoose = require('mongoose');

const DistrictSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  stores: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store'
  }]
}, {
  timestamps: true
});

DistrictSchema.pre('findOne', function() {
  console.log('Recherche de district avec les critères:', this._conditions);
});

module.exports = mongoose.model('District', DistrictSchema);
