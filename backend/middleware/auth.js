const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Partner = require('../models/Partner');

// Protect route - verifies JWT and attaches user/partner to req
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized. Please login.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role === 'user') {
      req.user = await User.findById(decoded.id).select('-password');
      req.userType = 'user';
    } else if (decoded.role === 'partner') {
      req.user = await Partner.findById(decoded.id).select('-password');
      req.userType = 'partner';
    }

    if (!req.user) {
      return res.status(401).json({ message: 'User no longer exists.' });
    }

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token. Please login again.' });
  }
};

// Only allow users (not partners)
const userOnly = (req, res, next) => {
  if (req.userType !== 'user') {
    return res.status(403).json({ message: 'Access denied. Users only.' });
  }
  next();
};

// Only allow partners
const partnerOnly = (req, res, next) => {
  if (req.userType !== 'partner') {
    return res.status(403).json({ message: 'Access denied. Food Partners only.' });
  }
  next();
};

module.exports = { protect, userOnly, partnerOnly };
