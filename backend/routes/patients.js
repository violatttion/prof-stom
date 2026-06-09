const express = require('express');
const router = express.Router();
const { Patient, User, Appointment, Doctor, Service } = require('../models');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const patients = await Patient.findAll({
      include: [{ model: User, attributes: ['full_name', 'email', 'phone'] }]
    });
    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: 'Не удалось загрузить пациентов' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const patient = await Patient.findByPk(req.params.id, {
      include: [
        { model: User, attributes: ['full_name', 'email', 'phone'] },
        {
          model: Appointment,
          include: [
            { model: Doctor, include: [{ model: User, attributes: ['full_name'] }] },
            { model: Service }
          ]
        }
      ]
    });
    if (!patient) return res.status(404).json({ error: 'Пациент не найден' });
    res.json(patient);
  } catch (error) {
    console.error('Patient card error:', error);
    res.status(500).json({ error: 'Не удалось загрузить данные пациента' });
  }
});

module.exports = router;