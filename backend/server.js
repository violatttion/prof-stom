const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const { sequelize } = require('./models');

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make io available in routes
app.set('io', io);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/patients', require('./routes/patients'));
app.use('/api/doctors', require('./routes/doctors'));
app.use('/api/services', require('./routes/services'));
app.use('/api/teeth-formula', require('./routes/teethFormula'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/notifications', require('./routes/notifications'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'ПРОФ СТОМ Backend is running' });
});

// WebSocket connection handling
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    socket.userRole = decoded.role;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.userId} (${socket.userRole})`);
  socket.join(`user_${socket.userId}`);

  socket.on('join_appointment', (appointmentId) => {
    socket.join(`appointment_${appointmentId}`);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.userId}`);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!', message: err.message });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Sync models (in development - use migrations in production)
    await sequelize.sync({ alter: true });
    console.log('Database models synchronized.');

    httpServer.listen(PORT, () => {
      console.log(`🚀 ПРОФ СТОМ Backend running on port ${PORT}`);
      console.log(`📡 WebSocket server ready`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
}

startServer();
