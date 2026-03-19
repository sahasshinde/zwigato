const express = require('express');
const router = express.Router();
const Partner = require('../models/Partner');
const Post = require('../models/Post');
const User = require('../models/User');
const cloudinary = require('cloudinary').v2;
const { protect, partnerOnly } = require('../middleware/auth');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// GET /api/partners
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

// GET /api/partners/profile
router.get('/profile', protect, partnerOnly, async (req, res) => {
  try {
    const partner = await Partner.findById(req.user._id).select('-password');
    const posts = await Post.find({ partner: req.user._id }).sort({ createdAt: -1 });
    res.json({ partner, posts });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching profile.' });
  }
});

// PUT /api/partners/profile
router.put('/profile', protect, partnerOnly, async (req, res) => {
  try {
    const { restaurantName, bio, location } = req.body;
    const partner = await Partner.findByIdAndUpdate(
      req.user._id,
      { restaurantName, bio, location },
      { new: true, runValidators: true }
    ).select('-password');
    res.json({ message: 'Profile updated!', partner });
  } catch (err) {
    res.status(500).json({ message: 'Error updating profile.' });
  }
});

// DELETE /api/partners/delete - Delete partner account
router.delete('/delete', protect, partnerOnly, async (req, res) => {
  try {
    // Get all posts by this partner
    const posts = await Post.find({ partner: req.user._id });

    // Delete all videos from Cloudinary
    for (const post of posts) {
      if (post.videoPublicId) {
        await cloudinary.uploader.destroy(post.videoPublicId, { resource_type: 'video' });
      }
    }

    // Delete all posts
    await Post.deleteMany({ partner: req.user._id });

    // Remove partner from all users' following list
    await User.updateMany(
      { following: req.user._id },
      { $pull: { following: req.user._id } }
    );

    // Delete the partner
    await Partner.findByIdAndDelete(req.user._id);

    res.json({ message: 'Account deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting account.' });
  }
});

// GET /api/partners/:handle
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