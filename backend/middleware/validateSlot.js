const validateSlot = (req, res, next) => {
  const { date, startTime, endTime } = req.body;
  const errors = [];

  if (!date) errors.push('date is required');
  if (!startTime || !startTime.trim()) errors.push('startTime is required');
  if (!endTime || !endTime.trim()) errors.push('endTime is required');

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', messages: errors });
  }

  next();
};

module.exports = validateSlot;
