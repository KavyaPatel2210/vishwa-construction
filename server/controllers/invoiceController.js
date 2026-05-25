const Invoice = require('../models/Invoice');
const Customer = require('../models/Customer');
const amountToWords = require('../utils/amountToWords');

// @desc    Get all invoices
// @route   GET /api/invoices
const getInvoices = async (req, res, next) => {
  try {
    const { search, customerId, startDate, endDate, status } = req.query;
    let query = { userId: req.user._id };

    if (customerId) query.customerId = customerId;
    if (status) query.status = status;

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    if (search) {
      const searchNum = parseInt(search);
      query.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        ...(isNaN(searchNum) ? [] : [{ billNumber: searchNum }])
      ];
    }

    const invoices = await Invoice.find(query)
      .sort({ createdAt: -1 })
      .populate('customerId', 'name');

    res.json({ success: true, data: invoices, count: invoices.length });
  } catch (error) {
    next(error);
  }
};

// @desc    Create invoice
// @route   POST /api/invoices
const createInvoice = async (req, res, next) => {
  try {
    const {
      customerId, date, dueDate, items, status, notes,
      categoryOfService, gstEnabled, gstPercent
    } = req.body;

    const customer = await Customer.findOne({ _id: customerId, userId: req.user._id });
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const billNumber = customer.nextBillNumber;

    // Calculate totals
    const totalAmount = items.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
    const gstAmt = gstEnabled ? (totalAmount * (gstPercent || 0)) / 100 : 0;
    const grandTotal = totalAmount + gstAmt;
    const amountWords = amountToWords(grandTotal);

    const invoice = await Invoice.create({
      userId: req.user._id,
      customerId,
      customerName: customer.name,
      customerAddress: customer.address,
      customerPan: customer.pan,
      customerMobile: customer.mobile,
      billNumber,
      date: date || new Date(),
      dueDate: dueDate || null,
      items,
      totalAmount,
      amountInWords: amountWords,
      status: status || 'Pending',
      notes: notes || '',
      categoryOfService: categoryOfService || 'Civil Construction Work',
      gstEnabled: gstEnabled || false,
      gstPercent: gstPercent || 0,
      gstAmount: gstAmt,
      grandTotal
    });

    // Increment customer's next bill number
    await Customer.findByIdAndUpdate(customerId, { $inc: { nextBillNumber: 1 } });

    res.status(201).json({ success: true, data: invoice });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single invoice
// @route   GET /api/invoices/:id
const getInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, userId: req.user._id });

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    res.json({ success: true, data: invoice });
  } catch (error) {
    next(error);
  }
};

// @desc    Update invoice
// @route   PUT /api/invoices/:id
const updateInvoice = async (req, res, next) => {
  try {
    const existing = await Invoice.findOne({ _id: req.params.id, userId: req.user._id });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    // If existing invoice is Paid, only status updates (e.g. toggling to Pending) are allowed
    if (existing.status === 'Paid') {
      const keys = Object.keys(req.body);
      const isOnlyStatusUpdate = keys.length === 1 && keys[0] === 'status';
      if (!isOnlyStatusUpdate && keys.length > 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Paid invoices cannot be edited. Mark it as Pending first.' 
        });
      }
    }

    const updateData = { ...req.body };

    if (updateData.items) {
      const totalAmount = updateData.items.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
      const gstAmt = updateData.gstEnabled ? (totalAmount * (updateData.gstPercent || 0)) / 100 : 0;
      const grandTotal = totalAmount + gstAmt;
      updateData.totalAmount = totalAmount;
      updateData.gstAmount = gstAmt;
      updateData.grandTotal = grandTotal;
      updateData.amountInWords = amountToWords(grandTotal);
    }

    const invoice = await Invoice.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updateData,
      { new: true }
    );

    res.json({ success: true, data: invoice });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete invoice
// @route   DELETE /api/invoices/:id
const deleteInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findOneAndDelete({ _id: req.params.id, userId: req.user._id });

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    res.json({ success: true, message: 'Invoice deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Duplicate invoice
// @route   POST /api/invoices/:id/duplicate
const duplicateInvoice = async (req, res, next) => {
  try {
    const original = await Invoice.findOne({ _id: req.params.id, userId: req.user._id });

    if (!original) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    const customer = await Customer.findById(original.customerId);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const billNumber = customer.nextBillNumber;

    const newInvoice = await Invoice.create({
      userId: req.user._id,
      customerId: original.customerId,
      customerName: original.customerName,
      customerAddress: original.customerAddress,
      customerPan: original.customerPan,
      customerMobile: original.customerMobile,
      billNumber,
      date: new Date(),
      dueDate: null,
      items: original.items,
      totalAmount: original.totalAmount,
      amountInWords: original.amountInWords,
      status: 'Pending',
      notes: original.notes,
      categoryOfService: original.categoryOfService,
      gstEnabled: original.gstEnabled,
      gstPercent: original.gstPercent,
      gstAmount: original.gstAmount,
      grandTotal: original.grandTotal
    });

    await Customer.findByIdAndUpdate(original.customerId, { $inc: { nextBillNumber: 1 } });

    res.status(201).json({ success: true, data: newInvoice });
  } catch (error) {
    next(error);
  }
};

module.exports = { getInvoices, createInvoice, getInvoice, updateInvoice, deleteInvoice, duplicateInvoice };
