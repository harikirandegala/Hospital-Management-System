import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

// ─── Verify JWT and attach user to req ────────────────────
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer '))
      return res.status(401).json({ error: 'No token provided.' });

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password_hash', 'refresh_token'] }
    });
    if (!user || !user.is_active)
      return res.status(401).json({ error: 'User not found or inactive.' });

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError')
      return res.status(401).json({ error: 'Token expired.' });
    return res.status(401).json({ error: 'Invalid token.' });
  }
};

// ─── Role-based access control ────────────────────────────
export const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role))
    return res.status(403).json({ error: 'Insufficient permissions.' });
  next();
};

// ─── Convenience role guards ──────────────────────────────
export const adminOnly        = authorize('admin');
export const doctorOrAdmin    = authorize('admin', 'doctor');
export const staffOrAdmin     = authorize('admin', 'nurse', 'receptionist');
export const clinicalStaff    = authorize('admin', 'doctor', 'nurse');
export const anyAuthenticated = authenticate;
