const Invoice = require('../models/Invoice');
const Customer = require('../models/Customer');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const [
      totalCustomers,
      totalBills,
      revenueResult,
      monthlyRevenueResult,
      recentInvoices,
      recentCustomers,
      pendingCount,
      paidCount
    ] = await Promise.all([
      Customer.countDocuments({ userId }),
      Invoice.countDocuments({ userId }),
      Invoice.aggregate([
        { $match: { userId } },
        { $group: { _id: null, total: { $sum: '$grandTotal' } } }
      ]),
      Invoice.aggregate([
        { $match: { userId, date: { $gte: startOfMonth, $lte: endOfMonth } } },
        { $group: { _id: null, total: { $sum: '$grandTotal' } } }
      ]),
      Invoice.find({ userId }).sort({ createdAt: -1 }).limit(5),
      Customer.find({ userId }).sort({ createdAt: -1 }).limit(5),
      Invoice.countDocuments({ userId, status: 'Pending' }),
      Invoice.countDocuments({ userId, status: 'Paid' })
    ]);

    res.json({
      success: true,
      data: {
        totalCustomers,
        totalBills,
        totalRevenue: revenueResult[0]?.total || 0,
        monthlyRevenue: monthlyRevenueResult[0]?.total || 0,
        recentInvoices,
        recentCustomers,
        pendingCount,
        paidCount
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStats };
