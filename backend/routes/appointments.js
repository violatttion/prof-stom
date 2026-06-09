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

// Временно закомментировано, пока не починим контроллер
// router.put('/:id/reschedule', authenticateToken, authorizeRoles('admin', 'doctor'), appointmentController.rescheduleAppointment);

// Удаление приёма (только врач)
router.delete('/:id', authenticateToken, authorizeRoles('doctor'), appointmentController.deleteAppointment);

module.exports = router;