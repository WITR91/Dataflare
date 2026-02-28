/**
 * User Model
 * Stores account info, wallet balance, and referral data.
 * Password is hashed automatically before saving.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
    walletBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Each user gets a unique code to share with friends
    referralCode: {
      type: String,
      unique: true,
    },
    // Stores the referral code of whoever invited this user
    referredBy: {
      type: String,
      default: null,
    },
    // Running total of bonuses earned from referrals
    referralBonus: {
      type: Number,
      default: 0,
    },
    referralCount: {
      type: Number,
      default: 0,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// ── Auto-generate referral code before first save ───────────────────────────
userSchema.pre('save', function (next) {
  if (!this.referralCode) {
    // e.g. "DF3X9K" — short and shareable
    this.referralCode = 'DF' + Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  next();
});

// ── Hash password before saving (only when it changes) ──────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ── Instance method: compare plain password against hash ────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
