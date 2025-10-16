// /* eslint-disable no-console */
// const express = require('express');
// const cors = require('cors');
// const dotenv = require('dotenv');
// const path = require('path');

// // Load environment variables
// dotenv.config();

// // Connect to database
// const connectDB = require('./config/database');
// connectDB();

// const app = express();

// // ✅ CORS Configuration
// const allowedOrigins = [
//   'http://localhost:3000', // Local frontend
//   'https://zoomcarride.onrender.com', // Replace with your deployed frontend
//   'https://zoomridecarss.onrender.com', // Example Render frontend URL
// ];

// app.use(
//   cors({
//     origin: function (origin, callback) {
//       // Allow requests with no origin (like Postman or mobile apps)
//       if (!origin) return callback(null, true);

//       if (!allowedOrigins.includes(origin)) {
//         const msg = 'The CORS policy does not allow access from this origin.';
//         return callback(new Error(msg), false);
//       }
//       return callback(null, true);
//     },
//     credentials: true, // ✅ Allows cookies and auth headers
//   })
// );

// // Middleware
// app.use(express.json({ limit: '50mb' }));
// app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// // Serve static files
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // API Routes
// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/cars', require('./routes/cars'));
// app.use('/api/users', require('./routes/users'));
// app.use('/api/upload', require('./routes/upload'));
// app.use('/api/bookings', require('./routes/bookings'));
// app.use('/api/admin', require('./routes/admin'));

// // Default route
// app.get('/', (req, res) => {
//   res.json({
//     message: '🚗 Car Rental API is running...',
//     version: '1.0.0',
//     timestamp: new Date().toISOString(),
//     endpoints: {
//       auth: '/api/auth',
//       cars: '/api/cars',
//       upload: '/api/upload',
//       bookings: '/api/bookings',
//       admin: '/api/admin',
//     },
//   });
// });

// // 404 handler
// app.use((req, res) => {
//   res.status(404).json({
//     success: false,
//     message: 'Route not found',
//   });
// });

// // Error handler
// app.use(require('./middleware/errorHandler'));

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`✅ Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
// });

// // Handle unhandled promise rejections
// process.on('unhandledRejection', (err) => {
//   console.log(`❌ Error: ${err.message}`);
//   process.exit(1);
// });
/* eslint-disable no-console */
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Connect to database
const connectDB = require('./config/database');
connectDB();

const app = express();

// ✅ Open CORS for all origins
app.use(
  cors({
    origin: '*', // Allow all domains
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Disposition'], // Optional: for file downloads
  })
);

// ✅ Handle preflight requests for all routes
app.options('*', cors());
// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/cars', require('./routes/cars'));
app.use('/api/users', require('./routes/users'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/admin', require('./routes/admin'));

// Default route
app.get('/', (req, res) => {
  res.json({
    message: '🚗 Car Rental API is running...',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      cars: '/api/cars',
      upload: '/api/upload',
      bookings: '/api/bookings',
      admin: '/api/admin',
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handler
app.use(require('./middleware/errorHandler'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(`❌ Error: ${err.message}`);
  process.exit(1);
});

