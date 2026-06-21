require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');

const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Connect to Database
connectDB();

const app = express();

// Security & Middleware
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" })); // Allow images
const allowedOrigins = ['http://localhost:5173', 'http://localhost:8080'];
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window`
  message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes' }
});
app.use('/api/', apiLimiter);

// Basic route to check if API is running
app.get('/', (req, res) => {
  res.send('API is running...');
});

const authRoutes = require('./src/routes/auth.routes');
const documentRoutes = require('./src/routes/document.routes');
const dashboardRoutes = require('./src/routes/dashboard.routes');
const chatRoutes = require('./src/routes/chat.routes');
const searchRoutes = require('./src/routes/search.routes');
const timelineRoutes = require('./src/routes/timeline.routes');
const importantRoutes = require('./src/routes/important.routes');
const notificationRoutes = require('./src/routes/notification.routes');
const settingsRoutes = require('./src/routes/settings.routes');
const cronJobs = require('./src/services/notifications/cronJobs');
const { protect } = require('./src/middlewares/auth.middleware');
const { errorHandler } = require('./src/middlewares/errorHandler');

// Mount Auth routes (Unprotected)
app.use('/api/auth', authRoutes);

// Mount App routes (Protected)
app.use('/api/documents', protect, documentRoutes);
app.use('/api/dashboard', protect, dashboardRoutes);
app.use('/api/chat', protect, chatRoutes);
app.use('/api/search', protect, searchRoutes);
app.use('/api/timeline', protect, timelineRoutes);
app.use('/api/important', protect, importantRoutes);
app.use('/api/notifications', protect, notificationRoutes);
app.use('/api/settings', protect, settingsRoutes);

// Initialize background jobs
cronJobs.initCronJobs();

// Global Error Handler for API
app.use(errorHandler);

const path = require('path');

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
