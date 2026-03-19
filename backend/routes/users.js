const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Partner = require('../models/Partner');
const { protect, userOnly } = require('../middleware/auth');

// GET /api/users/profile
router.get('/profile', protect, userOnly, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('following', 'restaurantName handle cuisine isVerified followers');
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching profile.' });
  }
});

// PUT /api/users/profile
router.put('/profile', protect, userOnly, async (req, res) => {
  try {
    const { name, bio } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, bio },
      { new: true, runValidators: true }
    ).select('-password');
    res.json({ message: 'Profile updated!', user });
  } catch (err) {
    res.status(500).json({ message: 'Error updating profile.' });
  }
});

// PUT /api/users/follow/:partnerId
router.put('/follow/:partnerId', protect, userOnly, async (req, res) => {
  try {
    const partner = await Partner.findById(req.params.partnerId);
    if (!partner) return res.status(404).json({ message: 'Partner not found.' });

    const user = await User.findById(req.user._id);
    const isFollowing = user.following.includes(req.params.partnerId);

    if (isFollowing) {
      user.following = user.following.filter(id => id.toString() !== req.params.partnerId);
      partner.followers = partner.followers.filter(id => id.toString() !== req.user._id.toString());
    } else {
      user.following.push(req.params.partnerId);
      partner.followers.push(req.user._id);
    }

    await user.save();
    await partner.save();

    res.json({
      following: !isFollowing,
      followersCount: partner.followers.length,
      message: isFollowing ? 'Unfollowed!' : 'Following!'
    });
  } catch (err) {
    res.status(500).json({ message: 'Error following/unfollowing.' });
  }
});

// DELETE /api/users/delete - Delete user account
router.delete('/delete', protect, userOnly, async (req, res) => {
  try {
    // Remove user from all partners' followers list
    await Partner.updateMany(
      { followers: req.user._id },
      { $pull: { followers: req.user._id } }
    );

    // Delete the user
    await User.findByIdAndDelete(req.user._id);

    res.json({ message: 'Account deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting account.' });
  }
});

module.exports = router;