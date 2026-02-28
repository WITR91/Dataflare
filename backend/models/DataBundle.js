/**
 * DataBundle Model
 * Admin creates and manages these — prices, network, API codes.
 * The apiCode is sent to the VTU provider to identify the plan.
 */

const mongoose = require('mongoose');

const dataBundleSchema = new mongoose.Schema(
  {
    network: {
      type: String,
      enum: ['MTN', 'Airtel', 'Glo', '9mobile'],
      required: true,
    },
    name: {
      type: String,
      required: true, // e.g. "1GB", "5GB Mega"
    },
    size: {
      type: String,
      required: true, // e.g. "1024MB" — displayed to user
    },
    validity: {
      type: String,
      required: true, // e.g. "30 days", "7 days"
    },
    // This is what the admin sets — their selling price in Naira
    price: {
      type: Number,
      required: true,
    },
    // The code your VTU provider uses to identify this bundle
    // Easy to update per-provider without touching the rest of the code
    apiCode: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DataBundle', dataBundleSchema);
