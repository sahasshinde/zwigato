const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  partner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Partner',
    required: true
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  dishName: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1, max: 20 },
  totalAmount: { type: Number, required: true },
  address: { type: String, required: true, trim: true },
  paymentMethod: {
    type: String,
    enum: ['UPI', 'Card', 'Cash on Delivery'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['paid', 'pending'],
    default: 'pending'
  },
  orderStatus: {
    type: String,
    enum: ['placed', 'confirmed', 'preparing', 'out for delivery', 'delivered', 'cancelled'],
    default: 'placed'
  },
  emoji: { type: String, default: '🍽️' }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);