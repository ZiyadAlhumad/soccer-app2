const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  stadium: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stadium',
    required: true
  },
  date: {
    type: Date,
    required: [true, 'Date is required']
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required'],
    trim: true
  },
  endTime: {
    type: String,
    required: [true, 'End time is required'],
    trim: true
  },
  isReserved: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Slot', slotSchema);
