import { Router } from 'express';
import { param, body } from 'express-validator';
import { getLabOrders, createLabOrder, updateLabOrder } from '../controllers/labOrder.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();
router.use(authenticate);

router.get('/', getLabOrders);
router.post('/', [body('patient_id').isUUID(), body('test_name').notEmpty()], validate, createLabOrder);
router.put('/:id', [param('id').isUUID()], validate, updateLabOrder);

export default router;
