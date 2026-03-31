const express = require('express');
const router = express.Router();
const Partner = require('../models/Partner');
const Post = require('../models/Post');
const { protect, partnerOnly } = require('../middleware/auth');

// Haversine formula - returns distance in km between two coordinates
const getDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// GET /api/partners - Get all partners
router.get('/', async (req, res) => {
  try {
    const partners = await Partner.find()
      .select('-password -email')
      .sort({ createdAt: -1 });
    res.json({ partners });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching partners.' });
  }
});

// GET /api/partners/nearby?lat=xx&lng=xx - Get partners within 5km
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) return res.status(400).json({ message: 'lat and lng are required.' });

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);

    const partners = await Partner.find({
      latitude: { $ne: null },
      longitude: { $ne: null }
    }).select('-password -email');

    const nearby = partners
      .map(p => ({
        ...p.toObject(),
        distance: getDistanceKm(userLat, userLng, p.latitude, p.longitude)
      }))
      .filter(p => p.distance <= 5)
      .sort((a, b) => a.distance - b.distance);

    res.json({ partners: nearby });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching nearby partners.' });
  }
});

// GET /api/partners/profile - Own partner profile
router.get('/profile', protect, partnerOnly, async (req, res) => {
  try {
    const partner = await Partner.findById(req.user._id).select('-password');
    const posts = await Post.find({ partner: req.user._id }).sort({ createdAt: -1 });
    res.json({ partner, posts });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching profile.' });
  }
});

// PUT /api/partners/profile - Update partner profile
router.put('/profile', protect, partnerOnly, async (req, res) => {
  try {
    const { restaurantName, bio, shopNo, buildingName, area, location, latitude, longitude } = req.body;
    const partner = await Partner.findByIdAndUpdate(
      req.user._id,
      { restaurantName, bio, shopNo, buildingName, area, location, latitude, longitude },
      { new: true, runValidators: true }
    ).select('-password');
    res.json({ message: 'Profile updated!', partner });
  } catch (err) {
    res.status(500).json({ message: 'Error updating profile.' });
  }
});

// GET /api/partners/:handle - Get partner by handle (public)
router.get('/:handle', async (req, res) => {
  try {
    const partner = await Partner.findOne({ handle: req.params.handle }).select('-password -email');
    if (!partner) return res.status(404).json({ message: 'Partner not found.' });
    const posts = await Post.find({ partner: partner._id }).sort({ createdAt: -1 });
    res.json({ partner, posts, followersCount: partner.followers.length });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching partner.' });
  }
});

module.exports = router;