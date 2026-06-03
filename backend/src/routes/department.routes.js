import { Router } from 'express';
import { body } from 'express-validator';
import { getDepartments, createDepartment, updateDepartment } from '../controllers/department.controller.js';
import { authenticate, adminOnly } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();
router.use(authenticate);

router.get('/', getDepartments);
router.post('/', adminOnly, [body('name').notEmpty()], validate, createDepartment);
router.put('/:id', adminOnly, updateDepartment);

export default router;
