import { Router } from 'express';
import { param, body } from 'express-validator';
import { getInvoices, getInvoiceById, createInvoice, updateInvoice } from '../controllers/invoice.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();
router.use(authenticate);

router.get('/', getInvoices);
router.get('/:id', [param('id').isUUID()], validate, getInvoiceById);
router.post('/', [body('patient_id').isUUID()], validate, createInvoice);
router.put('/:id', [param('id').isUUID()], validate, updateInvoice);

export default router;
