import { Invoice, Patient, Appointment, User } from '../models/index.js';
import { Op } from 'sequelize';
import { format } from 'date-fns';

// Auto-generate invoice number
function genInvoiceNo() {
  const ts = Date.now().toString().slice(-8);
  return `INV-${format(new Date(), 'yyyyMM')}-${ts}`;
}

// GET /api/invoices
export const getInvoices = async (req, res, next) => {
  try {
    const { status, patient_id, page = 1, limit = 20 } = req.query;
    const where = {};
    if (status)     where.status     = status;
    if (patient_id) where.patient_id = patient_id;

    if (req.user.role === 'patient') {
      const own = await Patient.findOne({ where: { user_id: req.user.id } });
      if (own) where.patient_id = own.id;
    }

    const { count, rows } = await Invoice.findAndCountAll({
      where,
      include: [{ model: Patient, include: [{ model: User, as: 'user', attributes: ['name','email'] }] }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    res.json({ total: count, page: parseInt(page), limit: parseInt(limit), data: rows });
  } catch (err) { next(err); }
};

// GET /api/invoices/:id
export const getInvoiceById = async (req, res, next) => {
  try {
    const inv = await Invoice.findByPk(req.params.id, {
      include: [
        { model: Patient,     include: [{ model: User, as: 'user' }] },
        { model: Appointment }
      ]
    });
    if (!inv) return res.status(404).json({ error: 'Invoice not found.' });
    res.json(inv);
  } catch (err) { next(err); }
};

// POST /api/invoices
export const createInvoice = async (req, res, next) => {
  try {
    if (!['admin','receptionist','nurse'].includes(req.user.role))
      return res.status(403).json({ error: 'Insufficient permissions to create invoice.' });

    const { patient_id, appointment_id, items = [], discount = 0,
            tax = 0, due_date, insurance_claimed, insurance_amount, notes } = req.body;

    const subtotal = items.reduce((sum, i) => sum + (i.quantity * i.unit_price), 0);
    const total    = subtotal + Number(tax) - Number(discount);

    const inv = await Invoice.create({
      invoice_number: genInvoiceNo(),
      patient_id, appointment_id,
      items, subtotal, tax, discount, total,
      due_date, notes,
      insurance_claimed: insurance_claimed || false,
      insurance_amount:  insurance_amount  || 0,
      status: 'issued'
    });

    res.status(201).json(inv);
  } catch (err) { next(err); }
};

// PUT /api/invoices/:id  – update status or record payment
export const updateInvoice = async (req, res, next) => {
  try {
    const inv = await Invoice.findByPk(req.params.id);
    if (!inv) return res.status(404).json({ error: 'Invoice not found.' });

    if (['cancelled','paid'].includes(inv.status) && req.body.status !== 'cancelled')
      return res.status(400).json({ error: 'Cannot modify a finalised invoice.' });

    const allowed = ['status','notes','due_date','insurance_claimed','insurance_amount','discount','tax'];
    allowed.forEach((f) => { if (req.body[f] !== undefined) inv[f] = req.body[f]; });

    // Recalculate total if financials changed
    if (req.body.discount !== undefined || req.body.tax !== undefined) {
      inv.total = Number(inv.subtotal) + Number(inv.tax) - Number(inv.discount);
    }

    await inv.save();
    res.json(inv);
  } catch (err) { next(err); }
};
