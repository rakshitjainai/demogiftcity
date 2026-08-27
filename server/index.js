import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import dns from 'dns';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure DNS servers first
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
  console.log('🌐 Node.js DNS servers configured: 8.8.8.8, 1.1.1.1');
} catch (dnsErr) {
  console.warn('⚠️ Unable to set custom DNS servers:', dnsErr.message);
}

dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

import authRoutes from './routes/authRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import regulatoryMasterRoutes from './routes/regulatoryMasterRoutes.js';
import examReadyRoutes from './routes/examReadyRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import blogRoutes from './routes/blogRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/regmate';

// Allowed origins for CORS
const allowedOrigins = [
  'https://demogiftcity.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:4173',
  'http://localhost:3000',
  process.env.CLIENT_URL
].filter(Boolean);

// Middlewares
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true
  })
);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', progressRoutes);
app.use('/api/regulatory-master', regulatoryMasterRoutes);
app.use('/api/exam-ready', examReadyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/blogs', blogRoutes);

// Job Interface backend support (both legacy PHP paths and Express paths)
app.use('/Regmate-backend/api', jobRoutes);
app.use('/api/job', jobRoutes);

// Health check endpoint (lightweight for deployment / health monitors)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Global API Error Handler: Ensure all uncaught errors return JSON and never HTML
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    ok: false,
    error: err.name || 'SERVER_ERROR',
    message: err.message || 'An unexpected server error occurred.'
  });
});

// Start Express Server reliably first
app.listen(PORT, () => {
  console.log(`🚀 RegMate Server running on http://localhost:${PORT}`);
});

// MongoDB Connection Logic with comprehensive error handling
console.log('⏳ Connecting to MongoDB...');
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected successfully to MongoDB Database');
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
    console.warn('⚠️ Application is running in fallback mode (Database operations will be unavailable until reconnected).');
  });

// Handle Mongoose connection event listeners
mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose Runtime Error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ Mongoose disconnected from MongoDB database.');
});
