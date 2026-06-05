import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { initSocket } from './config/socket.js';
import { config } from 'dotenv';
import rateLimit from 'express-rate-limit';

import { sequelize } from './config/database.js';
import logger from './config/logger.js';

// ─── Route imports ────────────────────────────────────────
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import patientRoutes from './routes/patient.routes.js';
import doctorRoutes from './routes/doctor.routes.js';
import appointmentRoutes from './routes/appointment.routes.js';
import medicalRecordRoutes from './routes/medicalRecord.routes.js';
import prescriptionRoutes from './routes/prescription.routes.js';
import labOrderRoutes from './routes/labOrder.routes.js';
import medicineRoutes from './routes/medicine.routes.js';
import invoiceRoutes from './routes/invoice.routes.js';
import departmentRoutes from './routes/department.routes.js';

// ─── Middleware imports ───────────────────────────────────
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';

config();

const app = express();
app.set('trust proxy', 1);
const httpServer = createServer(app);

// ─── Socket.IO (real-time notifications) ─────────────────
initSocket(httpServer);

// ─── Rate limiting ────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
  message: { error: 'Too many requests. Please try again later.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many login attempts. Please try again later.' }
});

// ─── Core middleware ──────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/api', limiter);

// ─── Health check ─────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime() });
});

// ─── API routes ───────────────────────────────────────────
app.use('/api/auth',          authLimiter, authRoutes);
app.use('/api/users',         userRoutes);
app.use('/api/patients',      patientRoutes);
app.use('/api/doctors',       doctorRoutes);
app.use('/api/appointments',  appointmentRoutes);
app.use('/api/records',       medicalRecordRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/lab-orders',    labOrderRoutes);
app.use('/api/medicines',     medicineRoutes);
app.use('/api/invoices',      invoiceRoutes);
app.use('/api/departments',   departmentRoutes);

// ─── Error handling ───────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── DB sync & server start ───────────────────────────────
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    logger.info(`DATABASE_URL configured: ${!!process.env.DATABASE_URL}`);
    logger.info(`NODE_ENV: ${process.env.NODE_ENV}`);

    await sequelize.authenticate();
    logger.info('✅ Database connected');

    await sequelize.sync();
    logger.info('✅ Models synchronized');

    httpServer.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    logger.error(`Failed to start server: ${err.message}`, { stack: err.stack });
    process.exit(1);
  }
}

startServer();
