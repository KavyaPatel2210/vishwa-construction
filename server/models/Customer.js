const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true
  },
  address: {
    type: String,
    default: '',
    trim: true
  },
  pan: {
    type: String,
    uppercase: true,
    trim: true,
    default: ''
  },
  mobile: {
    type: String,
    trim: true,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  },
  nextBillNumber: {
    type: Number,
    default: 1
  }
}, { timestamps: true });

module.exports = mongoose.model('Customer', CustomerSchema);
