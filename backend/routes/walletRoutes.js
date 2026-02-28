const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  initializePayment,
  verifyPayment,
  paystackWebhook,
  getBalance,
  getMyTransactions,
} = require('../controllers/walletController');

// Webhook is public (called by Paystack servers, not the user)
router.post('/webhook', paystackWebhook);

// All other wallet routes require login
router.get('/balance',           auth, getBalance);
router.post('/fund',             auth, initializePayment);
router.get('/verify/:reference', auth, verifyPayment);
router.get('/transactions',      auth, getMyTransactions);

module.exports = router;
