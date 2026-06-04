const validateStadiumEdit = (req, res, next) => {
  const { name, description } = req.body;
  const errors = [];

  if (!name || !name.trim()) errors.push('name is required');
  if (!description || !description.trim()) errors.push('description is required');

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', messages: errors });
  }

  next();
};

module.exports = validateStadiumEdit;
