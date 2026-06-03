const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', appointmentController.getAll);
router.post('/', appointmentController.create);
router.get('/my', appointmentController.getMyAppointments);
router.patch('/:id/status', appointmentController.updateStatus);

module.exports = router;
