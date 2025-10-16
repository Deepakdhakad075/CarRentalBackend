
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
//hwwww
dotenv.config();
const connectDB = require('./config/database');
connectDB();

const app = express();

// ✅ Fully open CORS setup
app.use(
  cors({
    origin: [
      'https://zoomridecarss.onrender.com', // ✅ deployed frontend
      'http://localhost:3000',              // ✅ local development
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Disposition'],
    credentials: true, // optional — allows cookies/auth headers if needed
  })
);

// Allow preflight requests
app.options(/.*/, cors());



// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/cars', require('./routes/cars'));
app.use('/api/users', require('./routes/users'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/admin', require('./routes/admin'));

app.get('/', (req, res) => {
  res.json({
    message: '🚗 Car Rental API is running...',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use(require('./middleware/errorHandler'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

process.on('unhandledRejection', (err) => {
  console.log(`❌ Error: ${err.message}`);
  process.exit(1);
});
