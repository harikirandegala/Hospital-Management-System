import { Router } from 'express';
import { param } from 'express-validator';
import { getPrescriptionsByPatient, getPrescriptionById, createPrescription, updatePrescription } from '../controllers/prescription.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();
router.use(authenticate);

router.get('/patient/:patientId', [param('patientId').isUUID()], validate, getPrescriptionsByPatient);
router.get('/:id',               [param('id').isUUID()], validate, getPrescriptionById);
router.post('/patient/:patientId', [param('patientId').isUUID()], validate, createPrescription);
router.put('/:id',               [param('id').isUUID()], validate, updatePrescription);

export default router;
