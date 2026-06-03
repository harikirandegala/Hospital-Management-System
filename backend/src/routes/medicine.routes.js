import { Router } from 'express';
import { param, body } from 'express-validator';
import { getMedicines, getMedicineById, createMedicine, updateMedicine, deleteMedicine } from '../controllers/medicine.controller.js';
import { authenticate, adminOnly } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();
router.use(authenticate);

router.get('/', getMedicines);
router.get('/:id', getMedicineById);
router.post('/', [body('name').notEmpty()], validate, createMedicine);
router.put('/:id', updateMedicine);
router.delete('/:id', adminOnly, deleteMedicine);

export default router;
