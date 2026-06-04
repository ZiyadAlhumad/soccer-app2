const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  slot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Slot',
    required: true
  },
  stadium: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stadium',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'cancelled'],
    default: 'active'
  }
}, { timestamps: true });

module.exports = mongoose.model('Reservation', reservationSchema);
