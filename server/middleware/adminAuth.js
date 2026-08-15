import { protect } from './auth.js';

export const requireAdmin = [
  protect,
  (req, res, next) => {
    const adminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase();
    const isEnvAdmin = adminEmail && req.user && req.user.email.toLowerCase() === adminEmail;
    
    if (req.user && (req.user.role === 'admin' || isEnvAdmin)) {
      return next();
    }
    return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
];
