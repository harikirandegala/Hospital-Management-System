import logger from '../config/logger.js';

export const errorHandler = (err, req, res, next) => {
  logger.error(`${err.message} — ${req.method} ${req.url}`, { stack: err.stack });

  // Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    return res.status(422).json({
      error: 'Validation failed',
      details: err.errors.map((e) => ({ field: e.path, message: e.message }))
    });
  }

  // Unique constraint (e.g. double-booking, duplicate email)
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({ error: 'Resource already exists or slot already taken.' });
  }

  const status  = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' && status === 500
    ? 'Internal server error.'
    : err.message;

  return res.status(status).json({ error: message });
};

export const notFound = (req, res) =>
  res.status(404).json({ error: `Route ${req.method} ${req.url} not found.` });
