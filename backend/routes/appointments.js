const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.get('/', authenticateToken, appointmentController.getAll);
router.post('/', authenticateToken, appointmentController.create);
router.get('/my', authenticateToken, appointmentController.getMyAppointments);
router.patch('/:id/status', authenticateToken, appointmentController.updateStatus);
router.delete('/:id', authenticateToken, authorizeRoles('doctor'), appointmentController.deleteAppointment);

module.exports = router;