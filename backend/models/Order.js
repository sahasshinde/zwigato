const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  partner: { type: mongoose.Schema.Types.ObjectId, ref: 'Partner', required: true },
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  dishName: { type: String, required: true },
  price: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  paymentMethod: { type: String, enum: ['upi', 'card', 'cod'], required: true },
  status: { type: String, default: 'confirmed' },
  orderStatus: { type: String, default: 'placed', enum: ['placed', 'confirmed', 'preparing', 'out for delivery', 'delivered', 'cancelled'] },
  totalAmount: { type: Number, default: 0 },
  quantity: { type: Number, default: 1 }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);