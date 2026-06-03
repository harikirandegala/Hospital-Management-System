import { Prescription, Doctor, Patient, User } from '../models/index.js';

// GET /api/prescriptions/patient/:patientId
export const getPrescriptionsByPatient = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const { status, page = 1, limit = 20 } = req.query;

    const where = { patient_id: patientId };
    if (status) where.status = status;

    if (req.user.role === 'patient') {
      const own = await Patient.findOne({ where: { user_id: req.user.id } });
      if (!own || own.id !== patientId) return res.status(403).json({ error: 'Forbidden.' });
    }

    const { count, rows } = await Prescription.findAndCountAll({
      where,
      include: [{ model: Doctor, include: [{ model: User, as: 'user', attributes: ['name'] }] }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    res.json({ total: count, page: parseInt(page), limit: parseInt(limit), data: rows });
  } catch (err) { next(err); }
};

// GET /api/prescriptions/:id
export const getPrescriptionById = async (req, res, next) => {
  try {
    const rx = await Prescription.findByPk(req.params.id, {
      include: [
        { model: Doctor,  include: [{ model: User, as: 'user', attributes: ['name'] }] },
        { model: Patient, include: [{ model: User, as: 'user', attributes: ['name'] }] }
      ]
    });
    if (!rx) return res.status(404).json({ error: 'Prescription not found.' });
    res.json(rx);
  } catch (err) { next(err); }
};

// POST /api/prescriptions/patient/:patientId  – doctor issues prescription
export const createPrescription = async (req, res, next) => {
  try {
    if (!['doctor','admin'].includes(req.user.role))
      return res.status(403).json({ error: 'Only doctors can prescribe.' });

    let doctor_id = req.body.doctor_id;
    if (!doctor_id && req.user.role === 'doctor') {
      const doc = await Doctor.findOne({ where: { user_id: req.user.id } });
      if (!doc) return res.status(400).json({ error: 'No doctor profile.' });
      doctor_id = doc.id;
    }

    if (!req.body.items || !Array.isArray(req.body.items) || req.body.items.length === 0)
      return res.status(400).json({ error: 'Prescription must include at least one item.' });

    const rx = await Prescription.create({
      patient_id:        req.params.patientId,
      doctor_id,
      medical_record_id: req.body.medical_record_id || null,
      items:             req.body.items,
      notes:             req.body.notes || null,
      status:            'issued'
    });

    res.status(201).json(rx);
  } catch (err) { next(err); }
};

// PUT /api/prescriptions/:id  – pharmacist dispenses, or doctor cancels
export const updatePrescription = async (req, res, next) => {
  try {
    const rx = await Prescription.findByPk(req.params.id);
    if (!rx) return res.status(404).json({ error: 'Prescription not found.' });

    if (rx.status === 'dispensed')
      return res.status(400).json({ error: 'Already dispensed.' });

    if (req.body.status) {
      if (req.body.status === 'dispensed' && !['pharmacist','admin'].includes(req.user.role))
        return res.status(403).json({ error: 'Only pharmacist can dispense.' });
      rx.status = req.body.status;
    }
    if (req.body.notes !== undefined) rx.notes = req.body.notes;

    await rx.save();
    res.json(rx);
  } catch (err) { next(err); }
};
