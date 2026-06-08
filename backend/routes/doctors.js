const express = require('express');
const router = express.Router();
const { Doctor, User } = require('../models');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const doctors = await Doctor.findAll({
      include: [{ model: User, attributes: ['full_name', 'email', 'phone'] }]
    });
    res.json(doctors);
  } catch (error) {
    console.error('Ошибка /doctors:', error);
    res.status(500).json({ error: 'Не удалось загрузить врачей' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findByPk(req.params.id, {
      include: [{ model: User, attributes: ['full_name', 'email', 'phone'] }]
    });
    if (!doctor) return res.status(404).json({ error: 'Врач не найден' });
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ error: 'Не удалось загрузить врача' });
  }
});

module.exports = router;