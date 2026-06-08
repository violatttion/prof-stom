const express = require('express');
const router = express.Router();
const { Doctor, User, Review } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const { Op } = require('sequelize');

router.use(authenticateToken);

// Получить всех врачей (с средней оценкой)
router.get('/', async (req, res) => {
  try {
    const doctors = await Doctor.findAll({
      include: [
        { 
          model: User, 
          attributes: ['full_name', 'email', 'phone'] 
        },
        {
          model: Review,
          attributes: ['rating'],
          required: false
        }
      ],
      order: [['created_at', 'DESC']]
    });

    // Добавляем среднюю оценку для каждого врача
    const doctorsWithRating = doctors.map(doctor => {
      const reviews = doctor.Reviews || [];
      const avgRating = reviews.length > 0 
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
        : null;

      const { Reviews, ...doctorData } = doctor.toJSON();

      return {
        ...doctorData,
        averageRating: avgRating ? parseFloat(avgRating.toFixed(1)) : null,
        reviewsCount: reviews.length
      };
    });

    res.json(doctorsWithRating);
  } catch (error) {
    console.error('Ошибка получения списка врачей:', error);
    res.status(500).json({ error: 'Не удалось загрузить врачей' });
  }
});

// Получить одного врача по ID (с полной информацией и средней оценкой)
router.get('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findByPk(req.params.id, {
      include: [
        { model: User, attributes: ['full_name', 'email', 'phone'] },
        { model: Review, attributes: ['rating', 'comment', 'created_at'] }
      ]
    });

    if (!doctor) {
      return res.status(404).json({ error: 'Врач не найден' });
    }

    const reviews = doctor.Reviews || [];
    const avgRating = reviews.length > 0 
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
      : null;

    const { Reviews, ...doctorData } = doctor.toJSON();

    res.json({
      ...doctorData,
      averageRating: avgRating ? parseFloat(avgRating.toFixed(1)) : null,
      reviewsCount: reviews.length,
      reviews: reviews
    });
  } catch (error) {
    console.error('Ошибка получения врача по ID:', error);
    res.status(500).json({ error: 'Не удалось загрузить данные врача' });
  }
});

module.exports = router;