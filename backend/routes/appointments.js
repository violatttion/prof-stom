const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.get('/', authenticateToken, appointmentController.getAll);
router.post('/', authenticateToken, appointmentController.create);
router.get('/my', authenticateToken, appointmentController.getMyAppointments);
router.patch('/:id/status', authenticateToken, appointmentController.updateStatus);
router.delete('/:id', authenticateToken, authorizeRoles('doctor'), appointmentController.deleteAppointment);

// Возвращаем роуты переноса
router.put('/:id/reschedule', authenticateToken, authorizeRoles('admin', 'doctor'), appointmentController.rescheduleAppointment);
router.post('/:id/request-reschedule', authenticateToken, authorizeRoles('patient'), appointmentController.requestReschedule);
router.patch('/:id/handle-reschedule', authenticateToken, authorizeRoles('admin'), appointmentController.handleRescheduleRequest);

module.exports = router;