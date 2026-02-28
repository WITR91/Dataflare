/**
 * Auth Middleware
 * Verifies the JWT token sent in the Authorization header.
 * Attaches the user object to req.user for downstream route handlers.
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Token comes in: "Authorization: Bearer <token>"
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'Access denied. Please log in.' });
    }

    // Decode the token — throws if expired or tampered
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch fresh user data (catches suspended/deleted accounts)
    const user = await User.findById(decoded.id).select('-password');

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Account not found or suspended.' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired session. Please log in again.' });
  }
};

module.exports = auth;
