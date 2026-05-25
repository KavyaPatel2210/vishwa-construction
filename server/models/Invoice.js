const mongoose = require('mongoose');

const WorkItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  amount: { type: Number, required: true, default: 0 }
}, { _id: false });

const InvoiceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
    index: true
  },
  // Snapshot of customer data at invoice creation time
  customerName: { type: String, required: true },
  customerAddress: { type: String, default: '' },
  customerPan: { type: String, default: '' },
  customerMobile: { type: String, default: '' },

  billNumber: { type: Number, required: true },

  date: { type: Date, required: true, default: Date.now },
  dueDate: { type: Date, default: null },

  items: [WorkItemSchema],

  totalAmount: { type: Number, default: 0 },
  amountInWords: { type: String, default: '' },

  status: {
    type: String,
    enum: ['Pending', 'Paid'],
    default: 'Pending'
  },

  notes: { type: String, default: '' },
  categoryOfService: { type: String, default: 'Civil Construction Work' },

  gstEnabled: { type: Boolean, default: false },
  gstPercent: { type: Number, default: 0 },
  gstAmount: { type: Number, default: 0 },
  grandTotal: { type: Number, default: 0 }

}, { timestamps: true });

module.exports = mongoose.model('Invoice', InvoiceSchema);
