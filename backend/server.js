const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const { connectDB } = require('./src/config/db');
const errorHandler = require('./src/middleware/errorHandler');
const { apiLimiter } = require('./src/middleware/rateLimiter');
const seedSampleData = require('./src/utils/seedData');

// Route imports
const authRoutes = require('./src/routes/authRoutes');
const patientRoutes = require('./src/routes/patientRoutes');
const metricRoutes = require('./src/routes/metricRoutes');
const symptomRoutes = require('./src/routes/symptomRoutes');
const medicationRoutes = require('./src/routes/medicationRoutes');
const recordRoutes = require('./src/routes/recordRoutes');
const alertRoutes = require('./src/routes/alertRoutes');
const consentRoutes = require('./src/routes/consentRoutes');
const doctorRoutes = require('./src/routes/doctorRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const aiRoutes = require('./src/routes/aiRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Serve uploaded documents safely
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health Check API
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    platform: 'CareSync Healthcare API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: 'Connected',
  });
});

// Apply rate limiting to all /api routes
app.use('/api', apiLimiter);

// API Route Bindings
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/health-metrics', metricRoutes);
app.use('/api/symptoms', symptomRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/consent', consentRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationRoutes);

// 404 Route Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.originalUrl} not found on CareSync API server.`,
  });
});

// Centralized Error Handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start Server and Seed Sample Data if needed
const startServer = async () => {
  await connectDB();

  // Auto-seed realistic demo data so the app is instantly demonstrable in placement interview
  try {
    await seedSampleData();
  } catch (seedErr) {
    console.warn('Notice: Seeder check finished or skipped:', seedErr.message);
  }

  const server = app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 CareSync Health API Server running on port ${PORT}`);
    console.log(`🏥 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`=======================================================`);
  });

  return server;
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = { app, startServer };

