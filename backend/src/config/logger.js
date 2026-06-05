import winston from 'winston';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { combine, timestamp, printf, colorize, json } = winston.format;

const logsDir = path.join(__dirname, '../../logs');

// Create logs directory if it doesn't exist
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const consoleFormat = printf(({ level, message, timestamp }) =>
  `${timestamp} [${level}]: ${message}`
);

const transports = [
  new winston.transports.File({ filename: path.join(logsDir, 'error.log'), level: 'error' }),
  new winston.transports.File({ filename: path.join(logsDir, 'combined.log') })
];

// Add console transport for development
if (process.env.NODE_ENV !== 'production') {
  transports.push(new winston.transports.Console({
    format: combine(colorize(), timestamp({ format: 'HH:mm:ss' }), consoleFormat)
  }));
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), json()),
  transports
});

export default logger;
