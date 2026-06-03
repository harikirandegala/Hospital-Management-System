import { Router } from 'express';
import { param, body } from 'express-validator';
import { getDoctors, getDoctorById, createDoctor, updateDoctor, getDoctorSchedule } from '../controllers/doctor.controller.js';
import { authenticate, adminOnly } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();
router.use(authenticate);

router.get('/', getDoctors);
router.get('/:id', [param('id').isUUID()], validate, getDoctorById);
router.get('/:id/schedule', [param('id').isUUID()], validate, getDoctorSchedule);
router.post('/', adminOnly, [body('user_id').isUUID(), body('department_id').isInt(), body('specialization').notEmpty()], validate, createDoctor);
router.put('/:id', [param('id').isUUID()], validate, updateDoctor);

export default router;
