const jwt = require('jsonwebtoken');
const config = require('../config');
const db = require('../db');

function authenticate(req, _res, next) {
  const header = req.headers.authorization;
  if (!header) {
    return next();
  }

  const token = header.split(' ')[1];
  if (!token) {
    return next();
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret);
    const user = db.prepare('SELECT id, name, email, role FROM users WHERE id = ?').get(payload.id);
    if (user) {
      req.user = user;
    }
  } catch (err) {
    console.warn('Token verification failed', err.message);
  }
  next();
}

function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    if (roles.includes(req.user.role) || req.user.role === 'admin') {
      return next();
    }
    return res.status(403).json({ message: 'Insufficient permissions' });
  };
}

module.exports = {
  authenticate,
  requireAuth,
  requireRole,
};
