const User = require('../models/User');
const jwt = require('jsonwebtoken');


// create JWT token for a user
const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// @description   Register a new user
// @route   POST /api/auth/register
// @access  Public

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body; // gets user details from request body

    const existingUser = await User.findOne({ email });

    if (existingUser) {  // stop registration if email is already in use
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password, role, phone }); // create and save new user

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      data: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Registration failed', error: error.message });
  }
};

// @description   Login user
// @route   POST /api/auth/login
// @access  Public

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || user.password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    res.status(200).json({
      success: true,
      token: generateToken(user._id),
      data: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};
