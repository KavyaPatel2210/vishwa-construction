const Customer = require('../models/Customer');
const Invoice = require('../models/Invoice');

// @desc    Get all customers
// @route   GET /api/customers
const getCustomers = async (req, res, next) => {
  try {
    const { search } = req.query;
    let query = { userId: req.user._id };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
        { pan: { $regex: search, $options: 'i' } }
      ];
    }

    const customers = await Customer.find(query).sort({ createdAt: -1 }).lean();

    const customersWithEarnings = await Promise.all(customers.map(async (customer) => {
      const invoices = await Invoice.find({ customerId: customer._id, userId: req.user._id });
      
      const totalEarnings = invoices
        .filter(inv => inv.status === 'Paid')
        .reduce((sum, inv) => sum + (inv.grandTotal || inv.totalAmount || 0), 0);
        
      const totalBilled = invoices
        .reduce((sum, inv) => sum + (inv.grandTotal || inv.totalAmount || 0), 0);

      const totalPending = totalBilled - totalEarnings;
        
      return {
        ...customer,
        totalEarnings,
        totalBilled,
        totalPending
      };
    }));

    res.json({ success: true, data: customersWithEarnings, count: customersWithEarnings.length });
  } catch (error) {
    next(error);
  }
};

// @desc    Create customer
// @route   POST /api/customers
const createCustomer = async (req, res, next) => {
  try {
    const { name, address, pan, mobile, notes } = req.body;

    const customer = await Customer.create({
      userId: req.user._id,
      name, address, pan, mobile, notes
    });

    res.status(201).json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single customer
// @route   GET /api/customers/:id
const getCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findOne({ _id: req.params.id, userId: req.user._id }).lean();

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const invoices = await Invoice.find({ customerId: customer._id, userId: req.user._id });
    
    const totalEarnings = invoices
      .filter(inv => inv.status === 'Paid')
      .reduce((sum, inv) => sum + (inv.grandTotal || inv.totalAmount || 0), 0);
      
    const totalBilled = invoices
      .reduce((sum, inv) => sum + (inv.grandTotal || inv.totalAmount || 0), 0);

    const totalPending = totalBilled - totalEarnings;

    res.json({ 
      success: true, 
      data: { 
        ...customer, 
        totalEarnings, 
        totalBilled,
        totalPending
      } 
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update customer
// @route   PUT /api/customers/:id
const updateCustomer = async (req, res, next) => {
  try {
    const { name, address, pan, mobile, notes } = req.body;

    const customer = await Customer.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { name, address, pan, mobile, notes },
      { new: true, runValidators: true }
    );

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    res.json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete customer and their invoices
// @route   DELETE /api/customers/:id
const deleteCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findOneAndDelete({ _id: req.params.id, userId: req.user._id });

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    // Delete all invoices for this customer
    await Invoice.deleteMany({ customerId: req.params.id, userId: req.user._id });

    res.json({ success: true, message: 'Customer and all their invoices deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get next bill number for a customer
// @route   GET /api/customers/:id/next-bill-number
const getNextBillNumber = async (req, res, next) => {
  try {
    const customer = await Customer.findOne({ _id: req.params.id, userId: req.user._id });

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    res.json({ success: true, nextBillNumber: customer.nextBillNumber });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCustomers, createCustomer, getCustomer, updateCustomer, deleteCustomer, getNextBillNumber };
