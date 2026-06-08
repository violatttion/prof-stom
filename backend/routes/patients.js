const express = require('express');
const router = express.Router();
const { Patient, User, Appointment, Doctor, Service } = require('../models');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.use(authenticateToken);

// Получить всех пациентов
router.get('/', async (req, res) => {
  try {
    const patients = await Patient.findAll({
      include: [{ model: User, attributes: ['full_name', 'email', 'phone'] }],
      order: [['created_at', 'DESC']]
    });
    res.json(patients);
  } catch (error) {
    console.error('Ошибка получения пациентов:', error);
    res.status(500).json({ error: 'Не удалось загрузить пациентов' });
  }
});

// Получить пациента по ID (упрощённая стабильная версия)
router.get('/:id', async (req, res) => {
  try {
    const patient = await Patient.findByPk(req.params.id, {
      include: [
        { model: User, attributes: ['full_name', 'email', 'phone'] },
        {
          model: Appointment,
          limit: 15,
          order: [['appointment_date', 'DESC']],
          include: [
            { model: Doctor, include: [{ model: User, attributes: ['full_name'] }] },
            { model: Service }
          ]
        }
      ]
    });

    if (!patient) {
      return res.status(404).json({ error: 'Пациент не найден' });
    }

    res.json(patient);
  } catch (error) {
    console.error('Ошибка получения пациента по ID:', error);
    res.status(500).json({ error: 'Не удалось загрузить данные пациента' });
  }
});

// Удалить пациента (только админ)
router.delete('/:id', authorizeRoles('admin'), async (req, res) => {
  try {
    const patient = await Patient.findByPk(req.params.id, {
      include: [{ model: User }]
    });

    if (!patient) {
      return res.status(404).json({ error: 'Пациент не найден' });
    }

    await Appointment.destroy({ where: { patient_id: patient.id } });
    await patient.destroy();

    if (patient.User) {
      await patient.User.destroy();
    }

    res.json({ message: 'Пациент успешно удалён' });
  } catch (error) {
    console.error('Ошибка удаления пациента:', error);
    res.status(500).json({ error: 'Ошибка при удалении пациента' });
  }
});

module.exports = router;