const express = require('express');
const router = express.Router();
const { Patient, User, Appointment } = require('../models');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const patients = await Patient.findAll({
      include: [{ model: User, attributes: ['full_name', 'email', 'phone'] }]
    });
    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const patient = await Patient.findByPk(req.params.id, {
      include: [
        { model: User, attributes: ['full_name', 'email', 'phone'] },
        { model: Appointment, limit: 5, order: [['appointment_date', 'DESC']] }
      ]
    });
    if (!patient) return res.status(404).json({ error: 'Пациент не найден' });
    res.json(patient);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
