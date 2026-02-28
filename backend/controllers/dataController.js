/**
 * Data Controller
 * Handles fetching available bundles and processing data purchases.
 * Purchase flow: check balance → deduct → call VTU → confirm or refund
 */

const User = require('../models/User');
const Transaction = require('../models/Transaction');
const DataBundle = require('../models/DataBundle');
const vtuService = require('../services/vtuService');

// ── GET /api/data/bundles?network=MTN ───────────────────────────────────────
exports.getBundles = async (req, res) => {
  try {
    const { network } = req.query;
    const filter = { isActive: true };
    if (network) filter.network = network;

    const bundles = await DataBundle.find(filter).sort({ network: 1, price: 1 });
    res.json({ bundles });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch bundles.' });
  }
};

// ── POST /api/data/purchase ─────────────────────────────────────────────────
exports.purchaseData = async (req, res) => {
  try {
    const { bundleId, phoneNumber } = req.body;

    if (!bundleId || !phoneNumber) {
      return res.status(400).json({ message: 'Bundle and phone number are required.' });
    }

    // Validate Nigerian phone number format
    const cleaned = phoneNumber.replace(/\s|-/g, '');
    const phoneRegex = /^(0[7-9][01]\d{8}|234[7-9][01]\d{8})$/;
    if (!phoneRegex.test(cleaned)) {
      return res.status(400).json({ message: 'Enter a valid Nigerian phone number.' });
    }

    // Load the chosen bundle
    const bundle = await DataBundle.findById(bundleId);
    if (!bundle || !bundle.isActive) {
      return res.status(404).json({ message: 'Bundle not available.' });
    }

    // Load user and check balance
    const user = await User.findById(req.user._id);
    if (user.walletBalance < bundle.price) {
      return res.status(400).json({
        message: `Insufficient balance. Need ₦${bundle.price}, you have ₦${user.walletBalance}.`,
        walletBalance: user.walletBalance,
      });
    }

    // Deduct from wallet immediately (optimistic)
    user.walletBalance -= bundle.price;
    await user.save();

    // Create a pending transaction record
    const transaction = await Transaction.create({
      user: user._id,
      type: 'data_purchase',
      amount: bundle.price,
      network: bundle.network,
      dataBundle: `${bundle.name} — ${bundle.validity}`,
      phoneNumber: cleaned,
      status: 'pending',
      description: `${bundle.network} ${bundle.name} for ${cleaned}`,
    });

    // Send to VTU provider
    const vtuResult = await vtuService.purchaseData({
      network: bundle.network,
      phone: cleaned,
      bundleCode: bundle.apiCode,
      amount: bundle.price,
      reference: transaction._id.toString(),
    });

    if (vtuResult.success) {
      transaction.status = 'success';
      transaction.vtuReference = vtuResult.reference;
      await transaction.save();

      return res.json({
        message: `${bundle.network} ${bundle.name} sent to ${cleaned}!`,
        transaction,
        walletBalance: user.walletBalance,
      });
    }

    // ── VTU failed → refund the user ──────────────────────────────────────
    user.walletBalance += bundle.price;
    await user.save();
    transaction.status = 'failed';
    await transaction.save();

    res.status(500).json({
      message: 'Data delivery failed. Your wallet has been refunded.',
      walletBalance: user.walletBalance,
    });
  } catch (error) {
    console.error('Purchase error:', error);
    res.status(500).json({ message: 'Purchase failed. Please try again.' });
  }
};
