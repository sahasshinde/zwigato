const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Post = require('../models/Post');
const { protect, userOnly, partnerOnly } = require('../middleware/auth');

// POST /api/orders - Place an order (user only)
router.post('/', protect, userOnly, async (req, res) => {
  try {
    const { postId, quantity, address, paymentMethod } = req.body;

    if (!postId || !quantity || !address || !paymentMethod)
      return res.status(400).json({ message: 'All fields are required.' });

    const post = await Post.findById(postId).populate('partner');
    if (!post) return res.status(404).json({ message: 'Post not found.' });

    if (!post.price || isNaN(Number(post.price)))
      return res.status(400).json({ message: 'This item does not have a price set.' });

    const price = Number(post.price);
    const totalAmount = price * quantity;

    const order = await Order.create({
      user: req.user._id,
      partner: post.partner._id,
      post: post._id,
      dishName: post.dishName,
      price,
      quantity,
      totalAmount,
      address,
      paymentMethod,
      paymentStatus: paymentMethod === 'Cash on Delivery' ? 'pending' : 'paid',
      orderStatus: 'placed',
      emoji: post.emoji || '🍽️'
    });

    const populated = await order.populate([
      { path: 'user', select: 'name username' },
      { path: 'partner', select: 'restaurantName handle' },
    ]);

    res.status(201).json({ message: 'Order placed successfully!', order: populated });
  } catch (err) {
    res.status(500).json({ message: 'Error placing order.' });
  }
});

// GET /api/orders/my - Get all orders for logged in user
router.get('/my', protect, userOnly, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('partner', 'restaurantName handle')
      .populate('post', 'dishName emoji')
      .sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching orders.' });
  }
});

// GET /api/orders/partner - Get all orders received by partner
router.get('/partner', protect, partnerOnly, async (req, res) => {
  try {
    const orders = await Order.find({ partner: req.user._id })
      .populate('user', 'name username')
      .populate('post', 'dishName emoji')
      .sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching orders.' });
  }
});

// PUT /api/orders/:id/status - Update order status (partner only)
router.put('/:id/status', protect, partnerOnly, async (req, res) => {
  try {
    const { orderStatus } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found.' });
    if (order.partner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not your order.' });

    order.orderStatus = orderStatus;
    await order.save();
    res.json({ message: 'Order status updated!', order });
  } catch (err) {
    res.status(500).json({ message: 'Error updating order.' });
  }
});

// PUT /api/orders/:id/cancel - Cancel order (user only, only if status is 'placed')
router.put('/:id/cancel', protect, userOnly, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found.' });

    if (order.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not your order.' });

    if (order.orderStatus !== 'placed')
      return res.status(400).json({ message: 'Order cannot be cancelled anymore. It is already being processed!' });

    order.orderStatus = 'cancelled';
    await order.save();
    res.json({ message: 'Order cancelled successfully.', order });
  } catch (err) {
    res.status(500).json({ message: 'Error cancelling order.' });
  }
});

module.exports = router;