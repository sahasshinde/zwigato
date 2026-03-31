const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const partnerSchema = new mongoose.Schema({
  restaurantName: {
    type: String,
    required: [true, 'Restaurant name is required'],
    trim: true,
    minlength: [2, 'Restaurant name must be at least 2 characters']
  },
  handle: {
    type: String,
    required: [true, 'Handle is required'],
    unique: true,
    trim: true,
    lowercase: true,
    minlength: [3, 'Handle must be at least 3 characters'],
    match: [/^[a-zA-Z0-9_.]+$/, 'Handle can only contain letters, numbers, underscores, and dots']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    validate: {
      validator: (v) => validator.isEmail(v),
      message: 'Please enter a valid email address'
    }
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  bio: { type: String, default: '', maxlength: 500 },
  cuisine: {
    type: String,
    required: [true, 'Cuisine type is required'],
    enum: ['Indian', 'Italian', 'Chinese', 'Japanese', 'Mexican', 'Continental', 'Fast Food', 'Desserts', 'Beverages', 'Other']
  },
  shopNo: { type: String, default: '' },
  buildingName: { type: String, default: '' },
  area: { type: String, default: '' },
  location: { type: String, default: '' },
  latitude: { type: Number, default: null },
  longitude: { type: Number, default: null },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isVerified: { type: Boolean, default: false },
  role: { type: String, default: 'partner' }
}, { timestamps: true });

partnerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

partnerSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Partner', partnerSchema);