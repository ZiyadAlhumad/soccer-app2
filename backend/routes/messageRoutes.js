const express = require('express');
const Message = require('../models/Message');
const protect = require('../middleware/protect');

const router = express.Router();

// GET /api/messages — protected, returns all messages for logged-in user
router.get('/', protect, async (req, res, next) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.user.id }, { receiver: req.user.id }]
    })
      .populate('sender', 'name _id')
      .populate('receiver', 'name _id')
      .sort({ createdAt: -1 });
    res.status(200).json(messages);
  } catch (err) {
    next(err);
  }
});

// GET /api/messages/:partnerId — protected, conversation with one user
router.get('/:partnerId', protect, async (req, res, next) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: req.params.partnerId },
        { sender: req.params.partnerId, receiver: req.user.id }
      ]
    })
      .populate('sender', 'name _id')
      .populate('receiver', 'name _id')
      .sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (err) {
    next(err);
  }
});

// POST /api/messages — protected
router.post('/', protect, async (req, res, next) => {
  try {
    const { receiverId, stadiumId, content } = req.body;

    if (!receiverId) {
      return res.status(400).json({ error: 'receiverId is required' });
    }
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'content is required' });
    }

    const message = await Message.create({
      sender: req.user.id,
      receiver: receiverId,
      stadium: stadiumId || undefined,
      content: content.trim()
    });

    res.status(201).json(message);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
