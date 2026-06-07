const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Применяем middleware аутентификации ко всем маршрутам
router.use(authenticateToken);

// Получить все записи (с фильтрами)
router.get('/', appointmentController.getAll);

// Создать новую запись
router.post('/', appointmentController.create);

// Получить свои записи (для врача или пациента)
router.get('/my', appointmentController.getMyAppointments);

// Изменить статус записи (подтвердить / отменить)
router.patch('/:id/status', appointmentController.updateStatus);

// Перенести запись (drag & drop)
router.put('/:id/reschedule', appointmentController.rescheduleAppointment);

module.exports = router;