import { Router } from 'express';
import { param } from 'express-validator';
import { getUsers, getUserById, updateUser, deactivateUser } from '../controllers/user.controller.js';
import { authenticate, adminOnly } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();
router.use(authenticate);

router.get('/',    adminOnly, getUsers);
router.get('/:id', [param('id').isUUID()], validate, getUserById);
router.put('/:id', [param('id').isUUID()], validate, updateUser);
router.delete('/:id', adminOnly, [param('id').isUUID()], validate, deactivateUser);

export default router;
