/**
 * Admin Controller
 * Full control panel: users, transactions, bundle pricing, and stats.
 * All routes here require auth + isAdmin.
 */

const User = require('../models/User');
const Transaction = require('../models/Transaction');
const DataBundle = require('../models/DataBundle');

// ── GET /api/admin/stats ────────────────────────────────────────────────────
exports.getStats = async (req, res) => {
  try {
    const [totalUsers, totalTransactions, successfulPurchases, revenueResult] =
      await Promise.all([
        User.countDocuments(),
        Transaction.countDocuments(),
        Transaction.countDocuments({ type: 'data_purchase', status: 'success' }),
        Transaction.aggregate([
          { $match: { type: 'wallet_funding', status: 'success' } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
      ]);

    res.json({
      totalUsers,
      totalTransactions,
      successfulPurchases,
      totalRevenue: revenueResult[0]?.total || 0,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch stats.' });
  }
};

// ── GET /api/admin/users ────────────────────────────────────────────────────
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;

    const filter = {};
    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit)),
      User.countDocuments(filter),
    ]);

    res.json({ users, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users.' });
  }
};

// ── PATCH /api/admin/users/:userId/wallet ───────────────────────────────────
// Manually credit or debit a user's wallet
exports.adjustWallet = async (req, res) => {
  try {
    const { userId } = req.params;
    const { amount, type, reason } = req.body; // type: 'credit' | 'debit'

    if (!amount || !type || !['credit', 'debit'].includes(type)) {
      return res.status(400).json({ message: 'Provide amount and type (credit/debit).' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const change = type === 'credit' ? Math.abs(amount) : -Math.abs(amount);

    if (user.walletBalance + change < 0) {
      return res.status(400).json({ message: 'Debit exceeds current wallet balance.' });
    }

    user.walletBalance += change;
    await user.save();

    await Transaction.create({
      user: userId,
      type: 'admin_adjustment',
      amount: Math.abs(amount),
      status: 'success',
      description: `Admin ${type}: ${reason || 'Manual adjustment'}`,
    });

    res.json({
      message: `Wallet ${type}ed by ₦${Math.abs(amount)}`,
      newBalance: user.walletBalance,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to adjust wallet.' });
  }
};

// ── PATCH /api/admin/users/:userId/status ───────────────────────────────────
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    user.isActive = !user.isActive;
    await user.save();

    res.json({ message: `User ${user.isActive ? 'activated' : 'suspended'}.`, isActive: user.isActive });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update user status.' });
  }
};

// ── GET /api/admin/transactions ─────────────────────────────────────────────
exports.getAllTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, status } = req.query;

    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .populate('user', 'email phone')
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit)),
      Transaction.countDocuments(filter),
    ]);

    res.json({ transactions, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch transactions.' });
  }
};

// ── GET /api/admin/bundles ──────────────────────────────────────────────────
exports.getAllBundles = async (req, res) => {
  try {
    const bundles = await DataBundle.find().sort({ network: 1, price: 1 });
    res.json({ bundles });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch bundles.' });
  }
};

// ── POST /api/admin/bundles ─────────────────────────────────────────────────
exports.createBundle = async (req, res) => {
  try {
    const bundle = await DataBundle.create(req.body);
    res.status(201).json({ message: 'Bundle created!', bundle });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create bundle.' });
  }
};

// ── PUT /api/admin/bundles/:id ──────────────────────────────────────────────
exports.updateBundle = async (req, res) => {
  try {
    const bundle = await DataBundle.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!bundle) return res.status(404).json({ message: 'Bundle not found.' });
    res.json({ message: 'Bundle updated!', bundle });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update bundle.' });
  }
};

// ── DELETE /api/admin/bundles/:id ───────────────────────────────────────────
exports.deleteBundle = async (req, res) => {
  try {
    await DataBundle.findByIdAndDelete(req.params.id);
    res.json({ message: 'Bundle deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete bundle.' });
  }
};
