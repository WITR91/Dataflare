const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getBundles, purchaseData } = require('../controllers/dataController');

router.get('/bundles',   auth, getBundles);
router.post('/purchase', auth, purchaseData);

module.exports = router;
