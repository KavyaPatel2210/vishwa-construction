const express = require('express');
const router = express.Router();
const {
  getCustomers, createCustomer, getCustomer,
  updateCustomer, deleteCustomer, getNextBillNumber
} = require('../controllers/customerController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/').get(getCustomers).post(createCustomer);
router.route('/:id').get(getCustomer).put(updateCustomer).delete(deleteCustomer);
router.get('/:id/next-bill-number', getNextBillNumber);

module.exports = router;
