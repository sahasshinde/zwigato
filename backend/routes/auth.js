const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Partner = require('../models/Partner');
const { protect } = require('../middleware/auth');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// ─── USER AUTH ────────────────────────────────────────────

// POST /api/auth/user/register
router.post('/user/register', async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    if (!name || !username || !email || !password)
      return res.status(400).json({ message: 'All fields are required.' });

    const emailExists = await User.findOne({ email }) || await Partner.findOne({ email });
    if (emailExists)
      return res.status(400).json({ message: 'Email already registered.' });

    const usernameExists = await User.findOne({ username });
    if (usernameExists)
      return res.status(400).json({ message: 'Username already taken.' });

    const user = await User.create({ name, username, email, password });

    res.status(201).json({
      message: 'Account created successfully!',
      token: generateToken(user._id, 'user'),
      user: { id: user._id, name: user.name, username: user.username, email: user.email, role: 'user' }
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: messages[0] });
    }
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

// POST /api/auth/user/login
router.post('/user/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required.' });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: 'Invalid email or password.' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(401).json({ message: 'Invalid email or password.' });

    res.json({
      message: 'Login successful!',
      token: generateToken(user._id, 'user'),
      user: { id: user._id, name: user.name, username: user.username, email: user.email, bio: user.bio, following: user.following, role: 'user' }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

// ─── PARTNER AUTH ─────────────────────────────────────────

// POST /api/auth/partner/register
router.post('/partner/register', async (req, res) => {
  try {
    const { restaurantName, handle, email, password, cuisine, bio, location } = req.body;

    if (!restaurantName || !handle || !email || !password || !cuisine)
      return res.status(400).json({ message: 'All required fields must be filled.' });

    const emailExists = await User.findOne({ email }) || await Partner.findOne({ email });
    if (emailExists)
      return res.status(400).json({ message: 'Email already registered.' });

    const handleExists = await Partner.findOne({ handle });
    if (handleExists)
      return res.status(400).json({ message: 'Handle already taken.' });

    const partner = await Partner.create({ restaurantName, handle, email, password, cuisine, bio: bio || '', location: location || '' });

    res.status(201).json({
      message: 'Partner account created!',
      token: generateToken(partner._id, 'partner'),
      user: { id: partner._id, restaurantName: partner.restaurantName, handle: partner.handle, email: partner.email, cuisine: partner.cuisine, bio: partner.bio, role: 'partner' }
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: messages[0] });
    }
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

// POST /api/auth/partner/login
router.post('/partner/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required.' });

    const partner = await Partner.findOne({ email });
    if (!partner)
      return res.status(401).json({ message: 'Invalid email or password.' });

    const isMatch = await partner.comparePassword(password);
    if (!isMatch)
      return res.status(401).json({ message: 'Invalid email or password.' });

    res.json({
      message: 'Login successful!',
      token: generateToken(partner._id, 'partner'),
      user: { id: partner._id, restaurantName: partner.restaurantName, handle: partner.handle, email: partner.email, cuisine: partner.cuisine, bio: partner.bio, followers: partner.followers, role: 'partner' }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

// GET /api/auth/me - Get current logged in user/partner
router.get('/me', protect, (req, res) => {
  res.json({ user: req.user, role: req.userType });
});

module.exports = router;
