import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

const signAccess   = (id) => jwt.sign({ id }, process.env.JWT_SECRET,          { expiresIn: process.env.JWT_EXPIRES_IN });
const signRefresh  = (id) => jwt.sign({ id }, process.env.JWT_REFRESH_SECRET,  { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN });

// POST /api/auth/register
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone } = req.body;
    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(409).json({ error: 'Email already registered.' });

    const password_hash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password_hash, role: role || 'patient', phone });

    const access  = signAccess(user.id);
    const refresh = signRefresh(user.id);
    await user.update({ refresh_token: refresh });

    res.status(201).json({ access_token: access, refresh_token: refresh,
      user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) { next(err); }
};

// POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user || !user.is_active)
      return res.status(401).json({ error: 'Invalid credentials.' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials.' });

    const access  = signAccess(user.id);
    const refresh = signRefresh(user.id);
    await user.update({ refresh_token: refresh, last_login: new Date() });

    res.json({ access_token: access, refresh_token: refresh,
      user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) { next(err); }
};

// POST /api/auth/refresh
export const refreshToken = async (req, res, next) => {
  try {
    const { refresh_token } = req.body;
    if (!refresh_token) return res.status(401).json({ error: 'Refresh token required.' });

    const decoded = jwt.verify(refresh_token, process.env.JWT_REFRESH_SECRET);
    const user    = await User.findByPk(decoded.id);
    if (!user || user.refresh_token !== refresh_token)
      return res.status(401).json({ error: 'Invalid refresh token.' });

    const access  = signAccess(user.id);
    const newRef  = signRefresh(user.id);
    await user.update({ refresh_token: newRef });

    res.json({ access_token: access, refresh_token: newRef });
  } catch (err) { next(err); }
};

// POST /api/auth/logout
export const logout = async (req, res, next) => {
  try {
    await req.user.update({ refresh_token: null });
    res.json({ message: 'Logged out successfully.' });
  } catch (err) { next(err); }
};

// GET /api/auth/me
export const getMe = async (req, res) => {
  res.json({ user: { id: req.user.id, name: req.user.name,
    email: req.user.email, role: req.user.role, phone: req.user.phone } });
};
