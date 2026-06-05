import { LabOrder, Doctor, Patient, User } from '../models/index.js';
import { Op } from 'sequelize';
import { getIO } from '../config/socket.js';

// GET /api/lab-orders
export const getLabOrders = async (req, res, next) => {
  try {
    const { status, patient_id, priority, page = 1, limit = 20 } = req.query;
    const where = {};
    if (status)     where.status     = status;
    if (patient_id) where.patient_id = patient_id;
    if (priority)   where.priority   = priority;

    if (req.user.role === 'patient') {
      const own = await Patient.findOne({ where: { user_id: req.user.id } });
      if (own) where.patient_id = own.id;
    }

    const { count, rows } = await LabOrder.findAndCountAll({
      where,
      include: [
        { model: Patient, include: [{ model: User, as: 'user', attributes: ['name'] }] },
        { model: Doctor,  include: [{ model: User, as: 'user', attributes: ['name'] }] }
      ],
      order: [['ordered_at', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    res.json({ total: count, page: parseInt(page), limit: parseInt(limit), data: rows });
  } catch (err) { next(err); }
};

// POST /api/lab-orders  – doctor orders a test
export const createLabOrder = async (req, res, next) => {
  try {
    if (!['doctor','admin'].includes(req.user.role))
      return res.status(403).json({ error: 'Only doctors can order lab tests.' });

    let doctor_id = req.body.doctor_id;
    if (!doctor_id && req.user.role === 'doctor') {
      const doc = await Doctor.findOne({ where: { user_id: req.user.id } });
      doctor_id = doc?.id;
    }

    const order = await LabOrder.create({
      patient_id:        req.body.patient_id,
      doctor_id,
      medical_record_id: req.body.medical_record_id || null,
      test_name:         req.body.test_name,
      test_type:         req.body.test_type,
      priority:          req.body.priority || 'routine',
      status:            'ordered'
    });

    res.status(201).json(order);
  } catch (err) { next(err); }
};

// PUT /api/lab-orders/:id  – lab_tech enters result
export const updateLabOrder = async (req, res, next) => {
  try {
    const order = await LabOrder.findByPk(req.params.id, {
      include: [{ model: Patient, include: [{ model: User, as: 'user' }] }]
    });
    if (!order) return res.status(404).json({ error: 'Lab order not found.' });

    const updatable = ['status','result','result_file_url'];
    updatable.forEach((f) => { if (req.body[f] !== undefined) order[f] = req.body[f]; });

    if (req.body.status === 'completed') {
      order.processed_by = req.user.id;
      order.processed_at = new Date();

      // Notify the patient
      const patientUserId = order.patient?.user?.id;
      if (patientUserId) {
        io.to(`user_${patientUserId}`).emit('lab_result_ready', {
          message: `Your ${order.test_name} result is ready.`,
          lab_order_id: order.id
        });
      }
    }

    await order.save();
    res.json(order);
  } catch (err) { next(err); }
};
