import { Op } from 'sequelize';
import { sequelize } from '../config/database.js';
import { Appointment, Doctor, Patient, User } from '../models/index.js';
import { io } from '../server.js';
import { addMinutes, startOfDay, endOfDay, parseISO, format } from 'date-fns';

// ─── Helper: generate slots for a doctor on a given date ──
function generateSlots(startHour, endHour, slotDurationMins, bookedTimes) {
  const slots = [];
  let cursor = new Date();
  cursor.setHours(startHour, 0, 0, 0);
  const end = new Date();
  end.setHours(endHour, 0, 0, 0);

  while (cursor < end) {
    const slotEnd  = addMinutes(cursor, slotDurationMins);
    const slotStr  = cursor.toISOString();
    const isBooked = bookedTimes.some(
      (b) => new Date(b) <= cursor && cursor < addMinutes(new Date(b), slotDurationMins)
    );
    slots.push({ start: slotStr, end: slotEnd.toISOString(), available: !isBooked });
    cursor = slotEnd;
  }
  return slots;
}

// GET /api/appointments/slots
export const getAvailableSlots = async (req, res, next) => {
  try {
    const { doctor_id, date } = req.query;
    const doctor = await Doctor.findByPk(doctor_id);
    if (!doctor) return res.status(404).json({ error: 'Doctor not found.' });

    const targetDate = parseISO(date);
    const booked = await Appointment.findAll({
      where: {
        doctor_id,
        start_time: { [Op.between]: [startOfDay(targetDate), endOfDay(targetDate)] },
        status: { [Op.notIn]: ['cancelled', 'no_show'] }
      },
      attributes: ['start_time']
    });

    const bookedTimes = booked.map((a) => a.start_time);
    const slots = generateSlots(9, 17, doctor.slot_duration_mins, bookedTimes);

    res.json({ doctor_id, date, slots });
  } catch (err) { next(err); }
};

// GET /api/appointments
export const getAppointments = async (req, res, next) => {
  try {
    const { role, id: userId } = req.user;
    const { doctor_id, patient_id, date, status, page = 1, limit = 20 } = req.query;

    const where = {};
    if (status)     where.status     = status;
    if (doctor_id)  where.doctor_id  = doctor_id;
    if (patient_id) where.patient_id = patient_id;
    if (date) {
      const d = parseISO(date);
      where.start_time = { [Op.between]: [startOfDay(d), endOfDay(d)] };
    }

    // Patients see only their own appointments
    if (role === 'patient') {
      const patient = await Patient.findOne({ where: { user_id: userId } });
      if (patient) where.patient_id = patient.id;
    }

    // Doctors see only their own
    if (role === 'doctor') {
      const doctor = await Doctor.findOne({ where: { user_id: userId } });
      if (doctor) where.doctor_id = doctor.id;
    }

    const { count, rows } = await Appointment.findAndCountAll({
      where,
      include: [
        { model: Patient, as: 'patient', include: [{ model: User, as: 'user', attributes: ['name','email','phone'] }] },
        { model: Doctor,  as: 'doctor',  include: [{ model: User, as: 'user', attributes: ['name'] }], attributes: ['specialization'] }
      ],
      order: [['start_time', 'ASC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    res.json({ total: count, page: parseInt(page), limit: parseInt(limit), data: rows });
  } catch (err) { next(err); }
};

// GET /api/appointments/:id
export const getAppointmentById = async (req, res, next) => {
  try {
    const appt = await Appointment.findByPk(req.params.id, {
      include: [
        { model: Patient, as: 'patient', include: [{ model: User, as: 'user' }] },
        { model: Doctor,  as: 'doctor',  include: [{ model: User, as: 'user' }] }
      ]
    });
    if (!appt) return res.status(404).json({ error: 'Appointment not found.' });
    res.json(appt);
  } catch (err) { next(err); }
};

// POST /api/appointments  – book with conflict check in transaction
export const createAppointment = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { patient_id, doctor_id, start_time, type, reason } = req.body;

    const doctor = await Doctor.findByPk(doctor_id, { transaction: t });
    if (!doctor) { await t.rollback(); return res.status(404).json({ error: 'Doctor not found.' }); }

    const start = new Date(start_time);
    const end   = addMinutes(start, doctor.slot_duration_mins);

    // Conflict check — lock rows to prevent race condition
    const conflict = await Appointment.findOne({
      where: {
        doctor_id,
        status: { [Op.notIn]: ['cancelled', 'no_show'] },
        [Op.or]: [
          { start_time: { [Op.lt]: end },   end_time: { [Op.gt]: start } }
        ]
      },
      lock: t.LOCK.UPDATE,
      transaction: t
    });

    if (conflict) {
      await t.rollback();
      return res.status(409).json({ error: 'This time slot is already booked.' });
    }

    const appt = await Appointment.create(
      { patient_id, doctor_id, start_time: start, end_time: end, type, reason, status: 'pending' },
      { transaction: t }
    );

    await t.commit();

    // Real-time notification to doctor
    io.to(`user_${doctor.user_id}`).emit('new_appointment', {
      message: 'New appointment booked.',
      appointment_id: appt.id
    });

    res.status(201).json(appt);
  } catch (err) { await t.rollback(); next(err); }
};

// PUT /api/appointments/:id
export const updateAppointment = async (req, res, next) => {
  try {
    const appt = await Appointment.findByPk(req.params.id);
    if (!appt) return res.status(404).json({ error: 'Appointment not found.' });

    if (['cancelled', 'completed'].includes(appt.status))
      return res.status(400).json({ error: 'Cannot modify a finalized appointment.' });

    const allowed = ['start_time', 'end_time', 'status', 'notes', 'type'];
    allowed.forEach((f) => { if (req.body[f] !== undefined) appt[f] = req.body[f]; });

    await appt.save();
    res.json(appt);
  } catch (err) { next(err); }
};

// DELETE /api/appointments/:id
export const cancelAppointment = async (req, res, next) => {
  try {
    const appt = await Appointment.findByPk(req.params.id);
    if (!appt) return res.status(404).json({ error: 'Appointment not found.' });

    appt.status              = 'cancelled';
    appt.cancelled_by        = req.user.id;
    appt.cancellation_reason = req.body.reason || null;
    await appt.save();

    res.json({ message: 'Appointment cancelled.', appointment: appt });
  } catch (err) { next(err); }
};
