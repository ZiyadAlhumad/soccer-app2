require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const stadiumRoutes = require('./routes/stadiumRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const messageRoutes = require('./routes/messageRoutes');

const app = express();

connectDB();

// 1. CORS
app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// 2. Body parsing
app.use(express.json());

// 3. Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 4. Custom middleware
app.use(logger);

// 5. Routes
app.get('/', (req, res) => res.json({ status: 'Soccer App API running' }));
app.use('/api/auth', authRoutes);
app.use('/api/stadiums', stadiumRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/messages', messageRoutes);

// 5. 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// 6. Global error handler (MUST be last, MUST have 4 params)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server on port ${PORT}`));
