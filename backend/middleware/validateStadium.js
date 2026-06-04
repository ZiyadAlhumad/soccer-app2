const validateStadium = (req, res, next) => {
  const { name, description, location } = req.body;
  const errors = [];

  if (!name || !name.trim()) errors.push('name is required');
  if (!description || !description.trim()) errors.push('description is required');
  if (!location || !location.trim()) errors.push('location is required');

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', messages: errors });
  }

  next();
};

module.exports = validateStadium;
