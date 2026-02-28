const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const {
  getStats,
  getAllUsers,
  adjustWallet,
  toggleUserStatus,
  getAllTransactions,
  getAllBundles,
  createBundle,
  updateBundle,
  deleteBundle,
} = require('../controllers/adminController');

// Every admin route requires a valid JWT + isAdmin flag
router.use(auth, adminAuth);

router.get('/stats', getStats);

router.get('/users', getAllUsers);
router.patch('/users/:userId/wallet', adjustWallet);
router.patch('/users/:userId/status', toggleUserStatus);

router.get('/transactions', getAllTransactions);

router.get('/bundles',        getAllBundles);
router.post('/bundles',       createBundle);
router.put('/bundles/:id',    updateBundle);
router.delete('/bundles/:id', deleteBundle);

module.exports = router;
