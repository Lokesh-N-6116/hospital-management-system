/**
 * Hospital Management System - Express Backend Server
 * Entry point orchestrating middleware, API routes, and database connectivity.
 */
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static directory for uploaded diagnostic reports
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'UP',
        service: 'Hospital Management System API',
        timestamp: new Date().toISOString()
    });
});

// Route Registrations
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/patients', require('./routes/patientRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/vitals', require('./routes/vitalsRoutes'));
app.use('/api/clinical', require('./routes/clinicalRoutes'));
app.use('/api/prescriptions', require('./routes/prescriptionRoutes'));
app.use('/api/medicines', require('./routes/medicineRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// 404 Handler for undefined API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `Endpoint ${req.method} ${req.originalUrl} not found on this server.`
    });
});

// Centralized Global Error Handler
app.use((err, req, res, next) => {
    console.error('[GlobalErrorHandler]', err.stack || err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'An unexpected internal server error occurred.'
    });
});

// Start Server
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`========================================================`);
        console.log(`  HMS Backend running at: http://localhost:${PORT}`);
        console.log(`  API Healthcheck:        http://localhost:${PORT}/api/health`);
        console.log(`========================================================`);
    });
}

module.exports = app;
