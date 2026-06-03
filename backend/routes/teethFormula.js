const express = require('express');
const router = express.Router();
const teethFormulaController = require('../controllers/teethFormulaController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/:appointmentId', teethFormulaController.getByAppointment);
router.put('/:appointmentId', teethFormulaController.updateTooth);

module.exports = router;
