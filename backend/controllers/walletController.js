/**
 * Wallet Controller
 * Handles wallet funding via Paystack and balance queries.
 * Flow: initializePayment → user pays on Paystack → verifyPayment credits wallet
 * Webhooks provide real-time updates as a backup.
 */

const crypto = require('crypto');
const axios = require('axios');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

const PAYSTACK_BASE = 'https://api.paystack.co';

// ── POST /api/wallet/fund ───────────────────────────────────────────────────
// Creates a Paystack session and returns the payment URL
exports.initializePayment = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount < 100) {
      return res.status(400).json({ message: 'Minimum funding amount is ₦100.' });
    }

    // Unique reference for tracking this payment end-to-end
    const reference = `DF_${req.user._id}_${Date.now()}`;

    const response = await axios.post(
      `${PAYSTACK_BASE}/transaction/initialize`,
      {
        email: req.user.email,
        amount: amount * 100, // Paystack works in kobo (₦1 = 100 kobo)
        reference,
        callback_url: `${process.env.FRONTEND_URL}/wallet?ref=${reference}`,
        metadata: {
          userId: req.user._id.toString(),
          custom_fields: [
            { display_name: 'Platform', value: 'DataFlare' },
            { display_name: 'Purpose', value: 'Wallet Funding' },
          ],
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Save a pending record so we can match it on verification
    await Transaction.create({
      user: req.user._id,
      type: 'wallet_funding',
      amount,
      status: 'pending',
      paystackReference: reference,
      description: `Wallet funding of ₦${amount}`,
    });

    res.json({
      authorizationUrl: response.data.data.authorization_url,
      reference,
    });
  } catch (error) {
    console.error('Payment init error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Could not initialize payment. Try again.' });
  }
};

// ── GET /api/wallet/verify/:reference ──────────────────────────────────────
// Called after Paystack redirect to confirm and credit wallet
exports.verifyPayment = async (req, res) => {
  try {
    const { reference } = req.params;

    // Ask Paystack for the truth about this transaction
    const response = await axios.get(
      `${PAYSTACK_BASE}/transaction/verify/${reference}`,
      {
        headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
      }
    );

    const { status, amount } = response.data.data;

    const transaction = await Transaction.findOne({ paystackReference: reference });
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction record not found.' });
    }

    // Guard: don't double-credit if already verified
    if (transaction.status === 'success') {
      const user = await User.findById(req.user._id);
      return res.json({ message: 'Already verified.', walletBalance: user.walletBalance });
    }

    if (status === 'success') {
      const naira = amount / 100;

      transaction.status = 'success';
      await transaction.save();

      // Credit the wallet
      const user = await User.findByIdAndUpdate(
        req.user._id,
        { $inc: { walletBalance: naira } },
        { new: true }
      );

      res.json({
        message: `₦${naira.toLocaleString()} added to your wallet!`,
        walletBalance: user.walletBalance,
      });
    } else {
      transaction.status = 'failed';
      await transaction.save();
      res.status(400).json({ message: 'Payment was not successful.' });
    }
  } catch (error) {
    console.error('Verify error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Verification failed. Contact support.' });
  }
};

// ── POST /api/wallet/webhook ────────────────────────────────────────────────
// Paystack calls this automatically when a payment completes (reliable backup)
exports.paystackWebhook = async (req, res) => {
  try {
    // Verify the request is genuinely from Paystack using HMAC signature
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(req.body) // raw body buffer
      .digest('hex');

    if (hash !== req.headers['x-paystack-signature']) {
      return res.status(401).send('Signature mismatch');
    }

    const event = JSON.parse(req.body);

    if (event.event === 'charge.success') {
      const { reference, amount } = event.data;
      const transaction = await Transaction.findOne({ paystackReference: reference });

      if (transaction && transaction.status === 'pending') {
        const naira = amount / 100;
        transaction.status = 'success';
        await transaction.save();

        await User.findByIdAndUpdate(transaction.user, {
          $inc: { walletBalance: naira },
        });
      }
    }

    res.sendStatus(200); // Always respond 200 so Paystack stops retrying
  } catch (error) {
    console.error('Webhook error:', error);
    res.sendStatus(500);
  }
};

// ── GET /api/wallet/balance ─────────────────────────────────────────────────
exports.getBalance = async (req, res) => {
  const user = await User.findById(req.user._id).select('walletBalance');
  res.json({ walletBalance: user.walletBalance });
};

// ── GET /api/wallet/transactions ────────────────────────────────────────────
exports.getMyTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const transactions = await Transaction.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Transaction.countDocuments({ user: req.user._id });

    res.json({ transactions, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch transactions.' });
  }
};
