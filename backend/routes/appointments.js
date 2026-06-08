const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Получить все записи (с фильтрами)
router.get('/', authenticateToken, appointmentController.getAll);

// Создать новую запись
router.post('/', authenticateToken, appointmentController.create);

// Получить свои записи (пациент / врач)
router.get('/my', authenticateToken, appointmentController.getMyAppointments);

// Обновить статус записи
router.patch('/:id/status', authenticateToken, appointmentController.updateStatus);

// Перенос записи (для админа и врача)
router.put('/:id/reschedule', authenticateToken, authorizeRoles('admin', 'doctor'), appointmentController.rescheduleAppointment);

// ==================== НОВЫЕ РОУТЫ ДЛЯ ПЕРЕНОСА ПАЦИЕНТОМ ====================

// Пациент запрашивает перенос своей записи
router.post(
  '/:id/request-reschedule',
  authenticateToken,
  authorizeRoles('patient'),
  appointmentController.requestReschedule
);

// Администратор одобряет или отклоняет запрос на перенос
router.patch(
  '/:id/handle-reschedule',
  authenticateToken,
  authorizeRoles('admin'),
  appointmentController.handleRescheduleRequest
);

// Удаление приёма (только врач)
router.delete('/:id', authenticateToken, authorizeRoles('doctor'), appointmentController.deleteAppointment);

module.exports = router;