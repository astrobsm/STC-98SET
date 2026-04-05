require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { isDemoMode, mountDemoRoutes } = require('./demo');

const { errorHandler } = require('./middlewares/error.middleware');

const app = express();

// Security
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || true,
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Parsing & logging
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(compression());
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'STOBA 98 API', demo: isDemoMode(), timestamp: new Date().toISOString() });
});

if (isDemoMode()) {
  // Demo mode: mount mock routes (no Supabase needed)
  mountDemoRoutes(app);
} else {
  // Production: mount real Supabase-powered routes
  const authRoutes = require('./routes/auth.routes');
  const userRoutes = require('./routes/user.routes');
  const paymentRoutes = require('./routes/payment.routes');
  const eventRoutes = require('./routes/event.routes');
  const notificationRoutes = require('./routes/notification.routes');
  const constitutionRoutes = require('./routes/constitution.routes');
  const excoRoutes = require('./routes/exco.routes');

  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/events', eventRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/constitution', constitutionRoutes);
  app.use('/api/exco', excoRoutes);
}

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use(errorHandler);

module.exports = app;
