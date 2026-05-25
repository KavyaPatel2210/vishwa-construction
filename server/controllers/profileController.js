const User = require('../models/User');

// @desc    Get profile
// @route   GET /api/profile
const getProfile = async (req, res) => {
  res.json({ success: true, data: req.user });
};

// @desc    Update profile
// @route   PUT /api/profile
const updateProfile = async (req, res, next) => {
  try {
    const {
      companyName, contractorName, pan, mobile, email,
      address, logo, signature, darkMode, gstEnabled, gstNumber, categoryOfService
    } = req.body;

    const updateData = {
      companyName, contractorName, pan, mobile, email,
      address, darkMode, gstEnabled, gstNumber, categoryOfService
    };

    if (logo !== undefined) updateData.logo = logo;
    if (signature !== undefined) updateData.signature = signature;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update password
// @route   PUT /api/profile/password
const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide current and new password' });
    }

    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfile, updateProfile, updatePassword };
