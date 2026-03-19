const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const Post = require('../models/Post');
const { protect, partnerOnly, userOnly } = require('../middleware/auth');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cloudinary storage for videos
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'zwigato/videos',
    resource_type: 'video',
    allowed_formats: ['mp4', 'mov', 'avi', 'mkv', 'webm'],
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
});

// GET /api/posts/feed
router.get('/feed', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .populate('partner', 'restaurantName handle cuisine isVerified followers')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments();

    const formattedPosts = posts.map(post => ({
      ...post.toObject(),
      likesCount: post.likes.length,
      commentsCount: post.comments.length,
      isLiked: req.userType === 'user'
        ? post.likes.map(id => id.toString()).includes(req.user._id.toString())
        : false,
    }));

    res.json({ posts: formattedPosts, total, pages: Math.ceil(total / limit), currentPage: page });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching feed.' });
  }
});

// GET /api/posts/partner/:partnerId
router.get('/partner/:partnerId', async (req, res) => {
  try {
    const posts = await Post.find({ partner: req.params.partnerId }).sort({ createdAt: -1 });
    res.json({ posts });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching posts.' });
  }
});

// POST /api/posts - Create post with video (partner only)
router.post('/', protect, partnerOnly, upload.single('video'), async (req, res) => {
  try {
    const { dishName, description, price, tags, emoji } = req.body;

    if (!dishName || !description)
      return res.status(400).json({ message: 'Product name and description are required.' });

    const videoUrl = req.file ? req.file.path : '';
    const videoPublicId = req.file ? req.file.filename : '';

    const post = await Post.create({
      partner: req.user._id,
      dishName,
      description,
      price: price || '',
      cuisine: req.user.cuisine,
      tags: tags ? JSON.parse(tags) : [],
      emoji: emoji || '🍽️',
      videoUrl,
      videoPublicId,
    });

    const populated = await post.populate('partner', 'restaurantName handle cuisine isVerified');
    res.status(201).json({ message: 'Post created!', post: populated });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: messages[0] });
    }
    res.status(500).json({ message: 'Error creating post.' });
  }
});

// PUT /api/posts/:id/like
router.put('/:id/like', protect, userOnly, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found.' });

    const alreadyLiked = post.likes.map(id => id.toString()).includes(req.user._id.toString());
    if (alreadyLiked) {
      post.likes = post.likes.filter(id => id.toString() !== req.user._id.toString());
    } else {
      post.likes.push(req.user._id);
    }
    await post.save();
    res.json({ liked: !alreadyLiked, likesCount: post.likes.length });
  } catch (err) {
    res.status(500).json({ message: 'Error liking post.' });
  }
});

// POST /api/posts/:id/comment
router.post('/:id/comment', protect, userOnly, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.trim() === '')
      return res.status(400).json({ message: 'Comment cannot be empty.' });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found.' });

    post.comments.push({ user: req.user._id, username: req.user.username, text: text.trim() });
    await post.save();

    const newComment = post.comments[post.comments.length - 1];
    res.status(201).json({ message: 'Comment added!', comment: newComment });
  } catch (err) {
    res.status(500).json({ message: 'Error adding comment.' });
  }
});

// DELETE /api/posts/:id
router.delete('/:id', protect, partnerOnly, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found.' });

    if (post.partner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'You can only delete your own posts.' });

    // Delete from Cloudinary too
    if (post.videoPublicId) {
      await cloudinary.uploader.destroy(post.videoPublicId, { resource_type: 'video' });
    }

    await post.deleteOne();
    res.json({ message: 'Post deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting post.' });
  }
});

module.exports = router;