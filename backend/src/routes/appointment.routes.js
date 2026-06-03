import { Router } from 'express';
import { body, param, query } from 'express-validator';
import {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  cancelAppointment,
  getAvailableSlots
} from '../controllers/appointment.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();
router.use(authenticate);

// GET /api/appointments/slots?doctor_id=&date=
router.get('/slots', [
  query('doctor_id').notEmpty(),
  query('date').isISO8601()
], validate, getAvailableSlots);

// GET /api/appointments
router.get('/', getAppointments);

// GET /api/appointments/:id
router.get('/:id', [param('id').isUUID()], validate, getAppointmentById);

// POST /api/appointments – patient or staff
router.post('/', [
  body('patient_id').isUUID(),
  body('doctor_id').isUUID(),
  body('start_time').isISO8601().withMessage('Invalid datetime format.'),
  body('type').optional().isIn(['in_person', 'telemedicine']),
  body('reason').optional().trim()
], validate, createAppointment);

// PUT /api/appointments/:id – reschedule / status update
router.put('/:id', [
  param('id').isUUID(),
  body('start_time').optional().isISO8601(),
  body('status').optional().isIn(['confirmed','completed','no_show'])
], validate, updateAppointment);

// DELETE /api/appointments/:id – cancel
router.delete('/:id', [
  param('id').isUUID(),
  body('reason').optional().trim()
], validate, cancelAppointment);

export default router;
