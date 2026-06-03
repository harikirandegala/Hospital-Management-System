import { Patient, User, Appointment, MedicalRecord, Prescription, LabOrder, Invoice } from '../models/index.js';
import { sequelize } from '../config/database.js';
import bcrypt from 'bcryptjs';

// GET /api/patients
export const getPatients = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const { Op } = await import('sequelize');

    const userWhere = {};
    if (search) {
      userWhere[Op.or] = [
        { name:  { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Patient.findAndCountAll({
      include: [{ model: User, as: 'user', where: userWhere, attributes: ['id','name','email','phone','avatar_url'] }],
      order: [[{ model: User, as: 'user' }, 'name', 'ASC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    res.json({ total: count, page: parseInt(page), limit: parseInt(limit), data: rows });
  } catch (err) { next(err); }
};

// GET /api/patients/:id
export const getPatientById = async (req, res, next) => {
  try {
    const patient = await Patient.findByPk(req.params.id, {
      include: [{ model: User, as: 'user', attributes: { exclude: ['password_hash','refresh_token'] } }]
    });
    if (!patient) return res.status(404).json({ error: 'Patient not found.' });

    // Enforce patient can only view own record
    if (req.user.role === 'patient') {
      const own = await Patient.findOne({ where: { user_id: req.user.id } });
      if (!own || own.id !== patient.id)
        return res.status(403).json({ error: 'Forbidden.' });
    }

    res.json(patient);
  } catch (err) { next(err); }
};

// POST /api/patients  – register a new patient (with user account)
export const createPatient = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { name, email, phone, password, dob, gender, blood_group,
            address, emergency_contact_name, emergency_contact_phone,
            insurance_provider, insurance_policy_no, allergies } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) { await t.rollback(); return res.status(409).json({ error: 'Email already registered.' }); }

    const password_hash = await bcrypt.hash(password || 'Welcome@123', 12);
    const user = await User.create({ name, email, phone, password_hash, role: 'patient' }, { transaction: t });

    const patient = await Patient.create({
      user_id: user.id, dob, gender, blood_group, address,
      emergency_contact_name, emergency_contact_phone,
      insurance_provider, insurance_policy_no,
      allergies: allergies || []
    }, { transaction: t });

    await t.commit();
    res.status(201).json({ ...patient.toJSON(), user: { id: user.id, name, email, phone } });
  } catch (err) { await t.rollback(); next(err); }
};

// PUT /api/patients/:id
export const updatePatient = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const patient = await Patient.findByPk(req.params.id, { include: [{ model: User, as: 'user' }] });
    if (!patient) { await t.rollback(); return res.status(404).json({ error: 'Patient not found.' }); }

    const patientFields = ['dob','gender','blood_group','address','emergency_contact_name',
                           'emergency_contact_phone','insurance_provider','insurance_policy_no','allergies'];
    const userFields    = ['name','phone','avatar_url'];

    patientFields.forEach((f) => { if (req.body[f] !== undefined) patient[f] = req.body[f]; });
    userFields.forEach((f)    => { if (req.body[f] !== undefined) patient.user[f] = req.body[f]; });

    await patient.save({ transaction: t });
    await patient.user.save({ transaction: t });
    await t.commit();

    res.json(patient);
  } catch (err) { await t.rollback(); next(err); }
};

// GET /api/patients/:id/summary  – full clinical summary
export const getPatientSummary = async (req, res, next) => {
  try {
    const pid = req.params.id;
    const [records, prescriptions, labOrders, appointments, invoices] = await Promise.all([
      MedicalRecord.findAll({ where: { patient_id: pid }, order: [['visit_date','DESC']], limit: 10 }),
      Prescription.findAll({ where: { patient_id: pid }, order: [['created_at','DESC']], limit: 10 }),
      LabOrder.findAll({ where: { patient_id: pid }, order: [['ordered_at','DESC']], limit: 10 }),
      Appointment.findAll({ where: { patient_id: pid }, order: [['start_time','DESC']], limit: 5 }),
      Invoice.findAll({ where: { patient_id: pid }, order: [['created_at','DESC']], limit: 5 })
    ]);
    res.json({ records, prescriptions, labOrders, appointments, invoices });
  } catch (err) { next(err); }
};
