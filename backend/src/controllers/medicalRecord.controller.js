import { MedicalRecord, Doctor, Patient, User } from '../models/index.js';

// GET /api/records/patient/:patientId
export const getRecordsByPatient = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // Patients can only see their own records
    if (req.user.role === 'patient') {
      const ownPatient = await Patient.findOne({ where: { user_id: req.user.id } });
      if (!ownPatient || ownPatient.id !== patientId)
        return res.status(403).json({ error: 'Forbidden.' });
    }

    const { count, rows } = await MedicalRecord.findAndCountAll({
      where: { patient_id: patientId },
      include: [{ model: Doctor, include: [{ model: User, as: 'user', attributes: ['name'] }] }],
      order: [['visit_date', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    res.json({ total: count, page: parseInt(page), limit: parseInt(limit), data: rows });
  } catch (err) { next(err); }
};

// GET /api/records/:id
export const getRecordById = async (req, res, next) => {
  try {
    const record = await MedicalRecord.findByPk(req.params.id, {
      include: [
        { model: Doctor,  include: [{ model: User, as: 'user', attributes: ['name'] }] },
        { model: Patient, include: [{ model: User, as: 'user', attributes: ['name'] }] }
      ]
    });
    if (!record) return res.status(404).json({ error: 'Record not found.' });
    res.json(record);
  } catch (err) { next(err); }
};

// POST /api/records/patient/:patientId  – doctor creates a new record
export const createRecord = async (req, res, next) => {
  try {
    const { patientId } = req.params;

    // Only doctors and admin can create records
    if (!['doctor','admin','nurse'].includes(req.user.role))
      return res.status(403).json({ error: 'Only clinical staff can create records.' });

    // Resolve doctor id from user id
    let doctor_id = req.body.doctor_id;
    if (!doctor_id && req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ where: { user_id: req.user.id } });
      if (!doctor) return res.status(400).json({ error: 'No doctor profile for this user.' });
      doctor_id = doctor.id;
    }

    const record = await MedicalRecord.create({
      patient_id:      patientId,
      doctor_id,
      appointment_id:  req.body.appointment_id || null,
      visit_date:      req.body.visit_date || new Date(),
      chief_complaint: req.body.chief_complaint,
      diagnosis:       req.body.diagnosis,
      notes:           req.body.notes,
      vitals:          req.body.vitals || {},
      attachments:     req.body.attachments || []
    });

    res.status(201).json(record);
  } catch (err) { next(err); }
};

// PUT /api/records/:id
export const updateRecord = async (req, res, next) => {
  try {
    const record = await MedicalRecord.findByPk(req.params.id);
    if (!record) return res.status(404).json({ error: 'Record not found.' });

    const editable = ['chief_complaint','diagnosis','notes','vitals','attachments'];
    editable.forEach((f) => { if (req.body[f] !== undefined) record[f] = req.body[f]; });

    await record.save();
    res.json(record);
  } catch (err) { next(err); }
};
