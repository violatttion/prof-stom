const express = require('express');
const router = express.Router();
const { Doctor, User, Review } = require('../models');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// Получить всех врачей (стабильная версия)
router.get('/', async (req, res) => {
  try {
    const doctors = await Doctor.findAll({
      include: [
        { model: User, attributes: ['full_name', 'email', 'phone'] }
      ],
      order: [['created_at', 'DESC']]
    });

    const doctorsWithRating = await Promise.all(
      doctors.map(async (doctor) => {
        const reviews = await Review.findAll({
          where: { doctor_id: doctor.id },
          attributes: ['rating']
        });

        const avg = reviews.length > 0
          ? reviews.reduce((sum, r) => sum + Number(r.rating), 0) / reviews.length
          : null;

        return {
          ...doctor.toJSON(),
          averageRating: avg ? parseFloat(avg.toFixed(1)) : null,
          reviewsCount: reviews.length
        };
      })
    );

    res.json(doctorsWithRating);
  } catch (error) {
    console.error('Ошибка получения списка врачей:', error);
    res.status(500).json({ error: 'Не удалось загрузить врачей' });
  }
});

// Получить врача по ID
router.get('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findByPk(req.params.id, {
      include: [{ model: User, attributes: ['full_name', 'email', 'phone'] }]
    });

    if (!doctor) {
      return res.status(404).json({ error: 'Врач не найден' });
    }

    const reviews = await Review.findAll({
      where: { doctor_id: doctor.id }
    });

    const avg = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + Number(r.rating), 0) / reviews.length
      : null;

    res.json({
      ...doctor.toJSON(),
      averageRating: avg ? parseFloat(avg.toFixed(1)) : null,
      reviewsCount: reviews.length,
      reviews: reviews
    });
  } catch (error) {
    console.error('Ошибка получения врача по ID:', error);
    res.status(500).json({ error: 'Не удалось загрузить данные врача' });
  }
});

module.exports = router;