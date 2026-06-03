import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { getPatients, getPatientById, createPatient, updatePatient, getPatientSummary } from '../controllers/patient.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();
router.use(authenticate);

router.get('/', getPatients);
router.get('/:id', [param('id').isUUID()], validate, getPatientById);
router.get('/:id/summary', [param('id').isUUID()], validate, getPatientSummary);
router.post('/', [
  body('name').trim().notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('dob').optional().isISO8601(),
  body('gender').optional().isIn(['male','female','other']),
  body('blood_group').optional().isIn(['A+','A-','B+','B-','AB+','AB-','O+','O-'])
], validate, createPatient);
router.put('/:id', [param('id').isUUID()], validate, updatePatient);

export default router;
