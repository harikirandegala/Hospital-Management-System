import { Doctor, User, Department, Appointment } from '../models/index.js';
import { sequelize } from '../config/database.js';
import { Op } from 'sequelize';
import { startOfWeek, endOfWeek, eachDayOfInterval, format } from 'date-fns';

// GET /api/doctors
export const getDoctors = async (req, res, next) => {
  try {
    const { department_id, specialization, search, page = 1, limit = 20 } = req.query;

    const doctorWhere = {};
    if (department_id)  doctorWhere.department_id  = department_id;
    if (specialization) doctorWhere.specialization = { [Op.iLike]: `%${specialization}%` };

    const userWhere = {};
    if (search) userWhere.name = { [Op.iLike]: `%${search}%` };

    const { count, rows } = await Doctor.findAndCountAll({
      where: doctorWhere,
      include: [
        { model: User,       as: 'user',       where: userWhere, attributes: ['id','name','email','phone','avatar_url'] },
        { model: Department, as: 'department', attributes: ['id','name'] }
      ],
      order: [[{ model: User, as: 'user' }, 'name', 'ASC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    res.json({ total: count, page: parseInt(page), limit: parseInt(limit), data: rows });
  } catch (err) { next(err); }
};

// GET /api/doctors/:id
export const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await Doctor.findByPk(req.params.id, {
      include: [
        { model: User,       as: 'user',       attributes: { exclude: ['password_hash','refresh_token'] } },
        { model: Department, as: 'department' }
      ]
    });
    if (!doctor) return res.status(404).json({ error: 'Doctor not found.' });
    res.json(doctor);
  } catch (err) { next(err); }
};

// POST /api/doctors  – admin creates a doctor profile (user must already exist or created fresh)
export const createDoctor = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { user_id, department_id, specialization, qualification,
            experience_years, license_number, consultation_fee,
            available_days, slot_duration_mins } = req.body;

    // Check user exists and is doctor role
    const user = await User.findByPk(user_id);
    if (!user) { await t.rollback(); return res.status(404).json({ error: 'User not found.' }); }
    if (user.role !== 'doctor') {
      await user.update({ role: 'doctor' }, { transaction: t });
    }

    const already = await Doctor.findOne({ where: { user_id } });
    if (already) { await t.rollback(); return res.status(409).json({ error: 'Doctor profile already exists.' }); }

    const doctor = await Doctor.create({
      user_id, department_id, specialization, qualification,
      experience_years, license_number, consultation_fee,
      available_days: available_days || ['Mon','Tue','Wed','Thu','Fri'],
      slot_duration_mins: slot_duration_mins || 30
    }, { transaction: t });

    await t.commit();
    res.status(201).json(doctor);
  } catch (err) { await t.rollback(); next(err); }
};

// PUT /api/doctors/:id
export const updateDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findByPk(req.params.id);
    if (!doctor) return res.status(404).json({ error: 'Doctor not found.' });

    const allowed = ['department_id','specialization','qualification','experience_years',
                     'license_number','consultation_fee','available_days','slot_duration_mins'];
    allowed.forEach((f) => { if (req.body[f] !== undefined) doctor[f] = req.body[f]; });

    await doctor.save();
    res.json(doctor);
  } catch (err) { next(err); }
};

// GET /api/doctors/:id/schedule?week=2026-06-02
export const getDoctorSchedule = async (req, res, next) => {
  try {
    const doctor = await Doctor.findByPk(req.params.id);
    if (!doctor) return res.status(404).json({ error: 'Doctor not found.' });

    const weekStart = req.query.week ? new Date(req.query.week) : startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekEnd   = endOfWeek(weekStart, { weekStartsOn: 1 });

    const appointments = await Appointment.findAll({
      where: {
        doctor_id: doctor.id,
        start_time: { [Op.between]: [weekStart, weekEnd] },
        status: { [Op.notIn]: ['cancelled','no_show'] }
      },
      order: [['start_time', 'ASC']]
    });

    // Group by date
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd }).map((d) => ({
      date: format(d, 'yyyy-MM-dd'),
      dayName: format(d, 'EEEE'),
      isWorkday: doctor.available_days?.includes(format(d, 'EEE')),
      appointments: appointments.filter(
        (a) => format(new Date(a.start_time), 'yyyy-MM-dd') === format(d, 'yyyy-MM-dd')
      )
    }));

    res.json({ doctor_id: doctor.id, week_start: format(weekStart, 'yyyy-MM-dd'), days });
  } catch (err) { next(err); }
};
