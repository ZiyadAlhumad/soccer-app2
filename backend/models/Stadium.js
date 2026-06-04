const mongoose = require('mongoose');

const stadiumSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Stadium name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  photos: [String],
  amenities: { type: [String], default: [] },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Stadium', stadiumSchema);
