import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import dns from 'dns';

import authRoutes from './routes/authRoutes.js';
import progressRoutes from './routes/progressRoutes.js';

dotenv.config();

// Configure Node.js DNS resolution to use Cloudflare and Google DNS servers
// to reliably resolve MongoDB SRV (_mongodb._tcp) records and prevent ECONNREFUSED errors.
try {
  dns.setServers(['1.1.1.1', '8.8.8.8']);
  console.log('🌐 Node.js DNS servers configured: 1.1.1.1, 8.8.8.8');
} catch (dnsErr) {
  console.warn('⚠️ Unable to set custom DNS servers:', dnsErr.message);
}

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/regmate';

// Allowed origins for CORS
const allowedOrigins = [
  'https://demogiftcity.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174',
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
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', progressRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
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
