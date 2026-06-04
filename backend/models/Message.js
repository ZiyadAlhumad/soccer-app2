const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  stadium: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stadium'
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
