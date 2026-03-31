const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { protect, userOnly, partnerOnly } = require('../middleware/auth');

// GET /api/orders/partner - Get orders for a partner
router.get('/partner', protect, partnerOnly, async (req, res) => {
  try {
    const Order = require('../models/Order');
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
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found.' });
    res.json({ message: 'Status updated!', order });
  } catch (err) {
    res.status(500).json({ message: 'Error updating status.' });
  }
});

router.post('/', protect, userOnly, async (req, res) => {
  try {
    const { partner, post, dishName, price, address, phone, paymentMethod } = req.body;
    if (!partner || !post || !dishName || !price || !address || !phone || !paymentMethod)
      return res.status(400).json({ message: 'All fields are required.' });

    const order = await Order.create({
      user: req.user._id,
      partner, post, dishName, price, address, phone, paymentMethod
    });

    res.status(201).json({ message: 'Order placed!', order });
  } catch (err) {
    res.status(500).json({ message: 'Error placing order.' });
  }
});

router.get('/my', protect, userOnly, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('partner', 'restaurantName handle')
      .sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching orders.' });
  }
});

module.exports = router;