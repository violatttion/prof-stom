const express = require('express');
const router = express.Router();
const { Patient, User } = require('../models');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

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
      include: [{ model: User, attributes: ['full_name', 'email', 'phone'] }]
    });
    if (!patient) return res.status(404).json({ error: 'Пациент не найден' });
    res.json(patient);
  } catch (error) {
    res.status(500).json({ error: 'Не удалось загрузить пациента' });
  }
});

router.delete('/:id', authorizeRoles('admin'), async (req, res) => {
  try {
    const patient = await Patient.findByPk(req.params.id);
    if (!patient) return res.status(404).json({ error: 'Пациент не найден' });
    await patient.destroy();
    res.json({ message: 'Пациент удалён' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка удаления' });
  }
});

module.exports = router;