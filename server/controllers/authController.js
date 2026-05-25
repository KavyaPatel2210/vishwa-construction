const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_key', { 
    expiresIn: process.env.JWT_EXPIRE || '30d' 
  });
};

// @desc    Register new contractor
// @route   POST /api/auth/signup
const signup = async (req, res, next) => {
  try {
    const { companyName, contractorName, pan, mobile, email, address, password, logo } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({
      companyName,
      contractorName,
      pan,
      mobile,
      email,
      address,
      password,
      logo: logo || null
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        companyName: user.companyName,
        contractorName: user.contractorName,
        pan: user.pan,
        mobile: user.mobile,
        email: user.email,
        address: user.address,
        logo: user.logo,
        signature: user.signature,
        darkMode: user.darkMode,
        gstEnabled: user.gstEnabled,
        gstNumber: user.gstNumber,
        categoryOfService: user.categoryOfService
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login contractor
// @route   POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        companyName: user.companyName,
        contractorName: user.contractorName,
        pan: user.pan,
        mobile: user.mobile,
        email: user.email,
        address: user.address,
        logo: user.logo,
        signature: user.signature,
        darkMode: user.darkMode,
        gstEnabled: user.gstEnabled,
        gstNumber: user.gstNumber,
        categoryOfService: user.categoryOfService
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

module.exports = { signup, login, getMe };
