const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const { sequelize } = require('./models');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Делаем io доступным во всех контроллерах
app.set('io', io);

// ==================== ROUTES ====================
const authRoutes = require('./routes/authRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const patientRoutes = require('./routes/patientRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const teethFormulaRoutes = require('./routes/teethFormulaRoutes');
const reviewRoutes = require('./routes/reviewRoutes'); // ← Новый роут

app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/teeth-formula', teethFormulaRoutes);
app.use('/api/reviews', reviewRoutes); // ← Подключаем отзывы

// ==================== SOCKET.IO ====================
io.on('connection', (socket) => {
  console.log('Пользователь подключился:', socket.id);

  // Присоединяем пользователя к своей комнате
  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`Пользователь ${userId} присоединился к комнате`);
  });

  socket.on('disconnect', () => {
    console.log('Пользователь отключился:', socket.id);
  });
});

// ==================== DATABASE ====================
sequelize.sync({ alter: true })
  .then(() => {
    console.log('✅ База данных синхронизирована');
  })
  .catch(err => {
    console.error('❌ Ошибка синхронизации БД:', err);
  });

// ==================== START SERVER ====================
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
});