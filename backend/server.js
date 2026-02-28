/**
 * DataFlare — Entry Point
 * Boots Express, connects MongoDB, wires up all routes
 */

// Force Node.js to use Google DNS (fixes SRV lookup issues on some routers)
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();

// ── Connect to MongoDB ──────────────────────────────────────────────────────
connectDB();

// ── Security middleware ─────────────────────────────────────────────────────
app.use(helmet()); // Sets secure HTTP headers
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// ── Rate limiting (prevents brute-force & abuse) ────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { message: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// ── Paystack webhook needs raw body for signature verification ──────────────
// Must be registered BEFORE express.json()
app.use('/api/wallet/webhook', express.raw({ type: 'application/json' }));

// ── Body parsing ────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth',   require('./routes/authRoutes'));
app.use('/api/wallet', require('./routes/walletRoutes'));
app.use('/api/data',   require('./routes/dataRoutes'));
app.use('/api/admin',  require('./routes/adminRoutes'));

// ── Health check ────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) =>
  res.json({ status: 'DataFlare API is live 🔥', timestamp: new Date() })
);

// ── 404 handler ─────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ message: 'Route not found.' }));

// ── Global error handler ────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`DataFlare server running on port ${PORT} [${process.env.NODE_ENV}]`);
});
