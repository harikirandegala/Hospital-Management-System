import { Medicine } from '../models/index.js';
import { Op } from 'sequelize';

// GET /api/medicines
export const getMedicines = async (req, res, next) => {
  try {
    const { search, low_stock, category, page = 1, limit = 30 } = req.query;
    const where = {};

    if (search) {
      where[Op.or] = [
        { name:         { [Op.iLike]: `%${search}%` } },
        { generic_name: { [Op.iLike]: `%${search}%` } }
      ];
    }
    if (category)  where.category = category;
    if (low_stock === 'true') {
      where[Op.and] = [
        { stock_qty: { [Op.lte]: Op.col('reorder_level') } }
      ];
    }

    const { count, rows } = await Medicine.findAndCountAll({
      where,
      order: [['name', 'ASC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    res.json({ total: count, page: parseInt(page), limit: parseInt(limit), data: rows });
  } catch (err) { next(err); }
};

// GET /api/medicines/:id
export const getMedicineById = async (req, res, next) => {
  try {
    const med = await Medicine.findByPk(req.params.id);
    if (!med) return res.status(404).json({ error: 'Medicine not found.' });
    res.json(med);
  } catch (err) { next(err); }
};

// POST /api/medicines
export const createMedicine = async (req, res, next) => {
  try {
    if (!['admin','pharmacist'].includes(req.user.role))
      return res.status(403).json({ error: 'Only admin/pharmacist can add medicines.' });

    const med = await Medicine.create(req.body);
    res.status(201).json(med);
  } catch (err) { next(err); }
};

// PUT /api/medicines/:id
export const updateMedicine = async (req, res, next) => {
  try {
    const med = await Medicine.findByPk(req.params.id);
    if (!med) return res.status(404).json({ error: 'Medicine not found.' });

    const fields = ['name','generic_name','category','dosage_form','strength',
                    'manufacturer','stock_qty','reorder_level','unit_price','expiry_date'];
    fields.forEach((f) => { if (req.body[f] !== undefined) med[f] = req.body[f]; });

    await med.save();
    res.json(med);
  } catch (err) { next(err); }
};

// DELETE /api/medicines/:id  – admin only
export const deleteMedicine = async (req, res, next) => {
  try {
    const med = await Medicine.findByPk(req.params.id);
    if (!med) return res.status(404).json({ error: 'Medicine not found.' });
    await med.destroy();
    res.json({ message: 'Medicine removed.' });
  } catch (err) { next(err); }
};
