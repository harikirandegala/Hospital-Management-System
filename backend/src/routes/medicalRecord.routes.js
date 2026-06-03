import { Router } from 'express';
import { param } from 'express-validator';
import { getRecordsByPatient, getRecordById, createRecord, updateRecord } from '../controllers/medicalRecord.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();
router.use(authenticate);

router.get('/patient/:patientId', [param('patientId').isUUID()], validate, getRecordsByPatient);
router.get('/:id',               [param('id').isUUID()], validate, getRecordById);
router.post('/patient/:patientId', [param('patientId').isUUID()], validate, createRecord);
router.put('/:id',               [param('id').isUUID()], validate, updateRecord);

export default router;
