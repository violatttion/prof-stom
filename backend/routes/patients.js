const express = require('express');
const router = express.Router();
const { Patient, User, Appointment, TeethFormula, Document } = require('../models');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.use(authenticateToken);

// Получить всех пациентов
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

// Получить пациента по ID
router.get('/:id', async (req, res) => {
  try {
    const patient = await Patient.findByPk(req.params.id, {
      include: [
        { model: User, attributes: ['full_name', 'email', 'phone'] },
        { model: Appointment, limit: 10, order: [['appointment_date', 'DESC']] }
      ]
    });
    if (!patient) return res.status(404).json({ error: 'Пациент не найден' });
    res.json(patient);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Удалить пациента (улучшенная версия)
router.delete('/:id', async (req, res) => {
  try {
    const patient = await Patient.findByPk(req.params.id, {
      include: [{ model: User }]
    });

    if (!patient) {
      return res.status(404).json({ error: 'Пациент не найден' });
    }

    // Удаляем связанные данные (опционально, можно расширить)
    await Appointment.destroy({ where: { patient_id: patient.id } });
    await TeethFormula.destroy({ where: { appointment_id: patient.Appointments?.map(a => a.id) || [] } });
    await Document.destroy({ where: { patient_id: patient.id } });

    // Удаляем самого пациента
    await patient.destroy();

    // Удаляем связанного пользователя
    if (patient.User) {
      await patient.User.destroy();
    }

    res.json({ message: 'Пациент и связанные данные успешно удалены' });
  } catch (error) {
    console.error('Ошибка удаления пациента:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;