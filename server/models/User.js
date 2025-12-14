const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'customer'],
    default: 'customer'
  },
  cart: [
    {
      sweet: { type: mongoose.Schema.Types.ObjectId, ref: 'Sweet' },
      quantity: { type: Number, default: 1 }
    }
  ]
});

module.exports = mongoose.model('User', UserSchema);
