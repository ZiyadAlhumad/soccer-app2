const express = require('express');
const Reservation = require('../models/Reservation');
const Slot = require('../models/Slot');
const Stadium = require('../models/Stadium');
const protect = require('../middleware/protect');

const router = express.Router();

// GET /api/reservations — protected
// Owner sees reservations for their stadiums; user sees their own
router.get('/', protect, async (req, res, next) => {
  try {
    if (req.user.role === 'owner') {
      const myStadiums = await Stadium.find({ owner: req.user.id });
      const stadiumIds = myStadiums.map(s => s._id);
      const reservations = await Reservation.find({ stadium: { $in: stadiumIds } })
        .sort({ createdAt: -1 });
      return res.status(200).json(reservations);
    }

    const reservations = await Reservation.find({ user: req.user.id })
      .populate('slot')
      .populate({ path: 'stadium', populate: { path: 'owner', select: 'name _id' } })
      .sort({ createdAt: -1 });
    res.status(200).json(reservations);
  } catch (err) {
    next(err);
  }
});

// POST /api/reservations — user only
router.post('/', protect, async (req, res, next) => {
  try {
    if (req.user.role === 'owner') {
      return res.status(403).json({ error: 'Owners cannot make reservations' });
    }

    const { slotId } = req.body;
    if (!slotId) {
      return res.status(400).json({ error: 'slotId is required' });
    }

    const slot = await Slot.findById(slotId);
    if (!slot) {
      return res.status(404).json({ error: 'Slot not found' });
    }
    if (slot.isReserved) {
      return res.status(400).json({ error: 'Slot is already reserved' });
    }

    const reservation = await Reservation.create({
      slot: slot._id,
      stadium: slot.stadium,
      user: req.user.id
    });

    await Slot.findByIdAndUpdate(slotId, { isReserved: true }, { new: true });

    res.status(201).json(reservation);
  } catch (err) {
    next(err);
  }
});

// PUT /api/reservations/:id/cancel — user only
router.put('/:id/cancel', protect, async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }
    if (reservation.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    if (reservation.status === 'cancelled') {
      return res.status(400).json({ error: 'Reservation is already cancelled' });
    }

    await Reservation.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true, runValidators: true }
    );

    await Slot.findByIdAndUpdate(reservation.slot, { isReserved: false }, { new: true });

    res.status(200).json({ message: 'Reservation cancelled successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
