const express = require('express');
const Stadium = require('../models/Stadium');
const Slot = require('../models/Slot');
const Reservation = require('../models/Reservation');
const protect = require('../middleware/protect');
const requireOwner = require('../middleware/requireOwner');
const validateStadium = require('../middleware/validateStadium');
const validateStadiumEdit = require('../middleware/validateStadiumEdit');
const validateSlot = require('../middleware/validateSlot');
const upload = require('../middleware/upload');

const router = express.Router();

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// GET /api/stadiums — public, supports ?location=, ?date=, ?time=
router.get('/', async (req, res, next) => {
  try {
    const filter = {};

    if (req.query.location) {
      const location = req.query.location.trim();
      if (location) {
        filter.location = new RegExp(escapeRegExp(location), 'i');
      }
    }

    const { dateFrom, dateTo, time } = req.query;
    if (dateFrom || dateTo || time) {
      const slotFilter = { isReserved: false };
      if (dateFrom && dateTo) {
        slotFilter.date = {
          $gte: new Date(dateFrom),
          $lte: new Date(dateTo)
        };
      }
      if (time) {
        const times = Array.isArray(time) ? time : [time];
        slotFilter.startTime = { $in: times };
      }
      const availableStadiumIds = await Slot.distinct('stadium', slotFilter);
      filter._id = { $in: availableStadiumIds };
    }

    const stadiums = await Stadium.find(filter).sort({ createdAt: -1 });
    res.status(200).json(stadiums);
  } catch (err) {
    next(err);
  }
});

// GET /api/stadiums/:id — public
router.get('/:id', async (req, res, next) => {
  try {
    const stadium = await Stadium.findById(req.params.id).populate('owner', 'name _id');
    if (!stadium) {
      return res.status(404).json({ error: 'Stadium not found' });
    }
    res.status(200).json(stadium);
  } catch (err) {
    next(err);
  }
});

// POST /api/stadiums — owner only
router.post('/', protect, requireOwner, upload.array('photos', 5), validateStadium, async (req, res, next) => {
  try {
    const { name, description, location } = req.body;
    const photos = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];
    const amenities = Array.isArray(req.body.amenities)
      ? req.body.amenities
      : (req.body.amenities ? [req.body.amenities] : []);
    const stadium = await Stadium.create({
      name: name.trim(),
      description: description.trim(),
      location: location.trim(),
      photos,
      amenities,
      owner: req.user.id
    });
    res.status(201).json(stadium);
  } catch (err) {
    next(err);
  }
});

// PUT /api/stadiums/:id — owner only (name, description, photos; location is immutable)
router.put('/:id', protect, requireOwner, upload.array('newPhotos', 5), validateStadiumEdit, async (req, res, next) => {
  try {
    const stadium = await Stadium.findById(req.params.id);
    if (!stadium) {
      return res.status(404).json({ error: 'Stadium not found' });
    }
    if (stadium.owner.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { name, description, keepPhotos } = req.body;
    const keptPaths = Array.isArray(keepPhotos) ? keepPhotos : (keepPhotos ? [keepPhotos] : []);
    const newPaths = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];
    const amenities = Array.isArray(req.body.amenities)
      ? req.body.amenities
      : (req.body.amenities ? [req.body.amenities] : []);

    const updated = await Stadium.findByIdAndUpdate(
      req.params.id,
      { name: name.trim(), description: description.trim(), photos: [...keptPaths, ...newPaths], amenities },
      { new: true, runValidators: true }
    );
    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/stadiums/:id — owner only
router.delete('/:id', protect, requireOwner, async (req, res, next) => {
  try {
    const stadium = await Stadium.findById(req.params.id);
    if (!stadium) {
      return res.status(404).json({ error: 'Stadium not found' });
    }
    if (stadium.owner.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await Stadium.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Stadium deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// ── Slot sub-routes (same router, no mergeParams needed) ──────────────────────

// GET /api/stadiums/:id/slots — public
router.get('/:id/slots', async (req, res, next) => {
  try {
    const slots = await Slot.find({ stadium: req.params.id }).sort({ date: 1, startTime: 1 });
    res.status(200).json(slots);
  } catch (err) {
    next(err);
  }
});

// POST /api/stadiums/:id/slots — owner only
router.post('/:id/slots', protect, requireOwner, validateSlot, async (req, res, next) => {
  try {
    const stadium = await Stadium.findById(req.params.id);
    if (!stadium) {
      return res.status(404).json({ error: 'Stadium not found' });
    }
    if (stadium.owner.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { date, startTime, endTime } = req.body;
    const [y, m, d] = date.split('-').map(Number);
    const slot = await Slot.create({
      stadium: req.params.id,
      date: new Date(Date.UTC(y, m - 1, d)),
      startTime: startTime.trim(),
      endTime: endTime.trim()
    });
    res.status(201).json(slot);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/stadiums/:id/slots/:slotId — owner only
router.delete('/:id/slots/:slotId', protect, requireOwner, async (req, res, next) => {
  try {
    const stadium = await Stadium.findById(req.params.id);
    if (!stadium) {
      return res.status(404).json({ error: 'Stadium not found' });
    }
    if (stadium.owner.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const slot = await Slot.findById(req.params.slotId);
    if (!slot) {
      return res.status(404).json({ error: 'Slot not found' });
    }

    await Slot.findByIdAndDelete(req.params.slotId);
    res.status(200).json({ message: 'Slot deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// GET /api/stadiums/:id/reservations — owner only
router.get('/:id/reservations', protect, requireOwner, async (req, res, next) => {
  try {
    const stadium = await Stadium.findById(req.params.id);
    if (!stadium) return res.status(404).json({ error: 'Stadium not found' });
    if (stadium.owner.toString() !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

    const reservations = await Reservation.find({ stadium: req.params.id, status: 'active' })
      .populate('user', 'name _id')
      .sort({ createdAt: -1 });
    res.status(200).json(reservations);
  } catch (err) {
    next(err);
  }
});

// GET /api/stadiums/:id/stats — owner only
router.get('/:id/stats', protect, requireOwner, async (req, res, next) => {
  try {
    const stadium = await Stadium.findById(req.params.id);
    if (!stadium) {
      return res.status(404).json({ error: 'Stadium not found' });
    }
    if (stadium.owner.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const totalSlots = await Slot.countDocuments({ stadium: req.params.id });
    const reservedSlots = await Slot.countDocuments({ stadium: req.params.id, isReserved: true });
    const activeReservations = await Reservation.countDocuments({
      stadium: req.params.id,
      status: 'active'
    });
    const cancelledReservations = await Reservation.countDocuments({
      stadium: req.params.id,
      status: 'cancelled'
    });

    res.status(200).json({
      stadium: stadium.name,
      totalSlots,
      reservedSlots,
      availableSlots: totalSlots - reservedSlots,
      activeReservations,
      cancelledReservations
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
