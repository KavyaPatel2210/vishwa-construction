const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();
connectDB();

const app = express();

const allowedOrigins = [
  'http://localhost:5173', 
  'http://localhost:3000', 
  'https://vishwa-construction.vercel.app'
];
if (process.env.CLIENT_URL) allowedOrigins.push(process.env.CLIENT_URL);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || (origin && origin.endsWith('.vercel.app'))) {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Body parsers — 10mb to support base64 images
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/invoices', require('./routes/invoices'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', message: 'Vishwa Construction API is running' }));

// Serve React build in production (Uncomment if hosting frontend and backend together)
/*
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
  });
}
*/

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Vishwa Construction API running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV}`);
});
