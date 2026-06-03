import { User } from '../models/index.js';
import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';

export const getUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const where = {};
    if (role)   where.role = role;
    if (search) where.name = { [Op.iLike]: `%${search}%` };

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password_hash','refresh_token'] },
      order: [['name', 'ASC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    res.json({ total: count, page: parseInt(page), limit: parseInt(limit), data: rows });
  } catch (err) { next(err); }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password_hash','refresh_token'] }
    });
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json(user);
  } catch (err) { next(err); }
};

export const updateUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    // Non-admins can only edit own profile
    if (req.user.role !== 'admin' && req.user.id !== user.id)
      return res.status(403).json({ error: 'Forbidden.' });

    const allowed = ['name','phone','avatar_url'];
    if (req.user.role === 'admin') allowed.push('role','is_active');
    allowed.forEach((f) => { if (req.body[f] !== undefined) user[f] = req.body[f]; });

    if (req.body.password) {
      user.password_hash = await bcrypt.hash(req.body.password, 12);
    }

    await user.save();
    const { password_hash, refresh_token, ...safe } = user.toJSON();
    res.json(safe);
  } catch (err) { next(err); }
};

export const deactivateUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    await user.update({ is_active: false });
    res.json({ message: 'User deactivated.' });
  } catch (err) { next(err); }
};
