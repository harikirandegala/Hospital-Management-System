// ──────────────────────────────────────────────────────────
//  Stub route files — implement controllers similarly to
//  appointment.controller.js for each module.
// ──────────────────────────────────────────────────────────

// ─── user.routes.js ───────────────────────────────────────
import { Router } from 'express';
import { authenticate, adminOnly } from '../middleware/auth.js';

export const userRouter = Router();
userRouter.use(authenticate);
userRouter.get('/',      adminOnly, (req, res) => res.json({ message: 'List all users [TODO]' }));
userRouter.get('/:id',             (req, res) => res.json({ message: 'Get user by id [TODO]' }));
userRouter.put('/:id',             (req, res) => res.json({ message: 'Update user [TODO]' }));
userRouter.delete('/:id', adminOnly,(req, res) => res.json({ message: 'Deactivate user [TODO]' }));

// ─── patient.routes.js ────────────────────────────────────
export const patientRouter = Router();
patientRouter.use(authenticate);
patientRouter.get('/',     (req, res) => res.json({ message: 'List patients [TODO]' }));
patientRouter.get('/:id',  (req, res) => res.json({ message: 'Get patient [TODO]' }));
patientRouter.post('/',    (req, res) => res.json({ message: 'Register patient [TODO]' }));
patientRouter.put('/:id',  (req, res) => res.json({ message: 'Update patient [TODO]' }));

// ─── doctor.routes.js ─────────────────────────────────────
export const doctorRouter = Router();
doctorRouter.use(authenticate);
doctorRouter.get('/',     (req, res) => res.json({ message: 'List doctors [TODO]' }));
doctorRouter.get('/:id',  (req, res) => res.json({ message: 'Get doctor [TODO]' }));
doctorRouter.post('/',    adminOnly, (req, res) => res.json({ message: 'Create doctor profile [TODO]' }));
doctorRouter.put('/:id',  (req, res) => res.json({ message: 'Update doctor [TODO]' }));

// ─── medicalRecord.routes.js ──────────────────────────────
export const medicalRecordRouter = Router();
medicalRecordRouter.use(authenticate);
medicalRecordRouter.get('/patient/:patientId',  (req, res) => res.json({ message: 'Get records [TODO]' }));
medicalRecordRouter.post('/patient/:patientId', (req, res) => res.json({ message: 'Create record [TODO]' }));
medicalRecordRouter.put('/:id',                 (req, res) => res.json({ message: 'Update record [TODO]' }));

// ─── prescription.routes.js ───────────────────────────────
export const prescriptionRouter = Router();
prescriptionRouter.use(authenticate);
prescriptionRouter.get('/patient/:patientId',  (req, res) => res.json({ message: 'Get prescriptions [TODO]' }));
prescriptionRouter.post('/patient/:patientId', (req, res) => res.json({ message: 'Create prescription [TODO]' }));
prescriptionRouter.put('/:id',                 (req, res) => res.json({ message: 'Dispense/cancel Rx [TODO]' }));

// ─── labOrder.routes.js ───────────────────────────────────
export const labOrderRouter = Router();
labOrderRouter.use(authenticate);
labOrderRouter.get('/',     (req, res) => res.json({ message: 'List lab orders [TODO]' }));
labOrderRouter.post('/',    (req, res) => res.json({ message: 'Create lab order [TODO]' }));
labOrderRouter.put('/:id',  (req, res) => res.json({ message: 'Update result [TODO]' }));

// ─── medicine.routes.js ───────────────────────────────────
export const medicineRouter = Router();
medicineRouter.use(authenticate);
medicineRouter.get('/',     (req, res) => res.json({ message: 'List medicines [TODO]' }));
medicineRouter.post('/',    (req, res) => res.json({ message: 'Add medicine [TODO]' }));
medicineRouter.put('/:id',  (req, res) => res.json({ message: 'Update stock [TODO]' }));
medicineRouter.delete('/:id', adminOnly, (req, res) => res.json({ message: 'Remove medicine [TODO]' }));

// ─── invoice.routes.js ────────────────────────────────────
export const invoiceRouter = Router();
invoiceRouter.use(authenticate);
invoiceRouter.get('/',     (req, res) => res.json({ message: 'List invoices [TODO]' }));
invoiceRouter.get('/:id',  (req, res) => res.json({ message: 'Get invoice [TODO]' }));
invoiceRouter.post('/',    (req, res) => res.json({ message: 'Create invoice [TODO]' }));
invoiceRouter.put('/:id',  (req, res) => res.json({ message: 'Update invoice/payment [TODO]' }));

// ─── department.routes.js ─────────────────────────────────
export const departmentRouter = Router();
departmentRouter.use(authenticate);
departmentRouter.get('/',    (req, res) => res.json({ message: 'List departments [TODO]' }));
departmentRouter.post('/',   adminOnly, (req, res) => res.json({ message: 'Create department [TODO]' }));
departmentRouter.put('/:id', adminOnly, (req, res) => res.json({ message: 'Update department [TODO]' }));
