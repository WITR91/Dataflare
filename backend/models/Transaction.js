/**
 * Transaction Model
 * Records every money movement: wallet funding, data purchases,
 * referral bonuses, and admin adjustments.
 */

const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['wallet_funding', 'data_purchase', 'referral_bonus', 'admin_adjustment'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    // Data purchase fields (null for wallet funding)
    network: { type: String }, // MTN | Airtel | Glo | 9mobile
    dataBundle: { type: String }, // e.g. "1GB - 30 days"
    phoneNumber: { type: String }, // recipient phone

    status: {
      type: String,
      enum: ['pending', 'success', 'failed'],
      default: 'pending',
    },
    // Paystack payment reference (for wallet funding)
    paystackReference: { type: String },
    // Reference returned by the VTU API after successful data delivery
    vtuReference: { type: String },

    description: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', transactionSchema);
