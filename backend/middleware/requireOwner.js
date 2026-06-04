const requireOwner = (req, res, next) => {
  if (req.user.role !== 'owner') {
    return res.status(403).json({ error: 'Access denied: owners only' });
  }
  next();
};

module.exports = requireOwner;
