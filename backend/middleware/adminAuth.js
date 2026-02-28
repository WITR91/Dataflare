/**
 * Admin Middleware
 * Must be used AFTER the auth middleware.
 * Blocks non-admin users from accessing admin routes.
 */

const adminAuth = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }
  next();
};

module.exports = adminAuth;
