/**
 * Auth Controller
 * Handles user registration, login, and profile fetch.
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// ── Helper: sign a JWT valid for 7 days ────────────────────────────────────
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// ── Helper: safe user object to send to client (no password) ───────────────
const sanitizeUser = (user) => ({
  id: user._id,
  phone: user.phone,
  email: user.email,
  walletBalance: user.walletBalance,
  referralCode: user.referralCode,
  referralBonus: user.referralBonus,
  referralCount: user.referralCount,
  isAdmin: user.isAdmin,
  createdAt: user.createdAt,
});

// ── POST /api/auth/register ─────────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { phone, email, password, referralCode } = req.body;

    if (!phone || !email || !password) {
      return res.status(400).json({ message: 'Phone, email, and password are required.' });
    }

    // Block duplicate accounts
    const existing = await User.findOne({ $or: [{ email: email.toLowerCase() }, { phone }] });
    if (existing) {
      return res.status(400).json({ message: 'Email or phone number is already registered.' });
    }

    const user = new User({ phone, email, password });

    // ── Handle referral ──────────────────────────────────────────────────
    if (referralCode) {
      const referrer = await User.findOne({ referralCode: referralCode.toUpperCase() });
      if (referrer) {
        user.referredBy = referralCode.toUpperCase();

        const BONUS = Number(process.env.REFERRAL_BONUS) || 100;
        referrer.walletBalance += BONUS;
        referrer.referralBonus += BONUS;
        referrer.referralCount += 1;
        await referrer.save();

        // Record the bonus transaction for the referrer
        await Transaction.create({
          user: referrer._id,
          type: 'referral_bonus',
          amount: BONUS,
          status: 'success',
          description: `Referral bonus — ${email} signed up with your code`,
        });
      }
    }

    await user.save();
    const token = signToken(user._id);

    res.status(201).json({
      message: 'Account created successfully! Welcome to DataFlare.',
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Registration failed. Please try again.' });
  }
};

// ── POST /api/auth/login ────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email/phone and password are required.' });
    }

    // Allow login with either email or phone number
    const user = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { phone: email }],
    });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Account suspended. Contact support.' });
    }

    const token = signToken(user._id);

    res.json({
      message: 'Welcome back!',
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed. Please try again.' });
  }
};

// ── GET /api/auth/profile ───────────────────────────────────────────────────
exports.getProfile = async (req, res) => {
  // req.user is already fetched and attached by auth middleware
  res.json({ user: sanitizeUser(req.user) });
};
