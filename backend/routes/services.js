const express = require('express');
const router = express.Router();
const { Service } = require('../models');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// Получить все услуги
router.get('/', async (req, res) => {
  try {
    const services = await Service.findAll({
      order: [['category', 'ASC'], ['name', 'ASC']]
    });
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Добавить новую услугу
router.post('/', async (req, res) => {
  try {
    const { name, category, price } = req.body;

    if (!name || !price) {
      return res.status(400).json({ error: 'Название и стоимость обязательны' });
    }

    const service = await Service.create({
      name,
      category: category || 'Общая',
      price: Number(price)
    });

    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Удалить услугу
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Service.destroy({
      where: { id: req.params.id }
    });

    if (!deleted) {
      return res.status(404).json({ error: 'Услуга не найдена' });
    }

    res.json({ message: 'Услуга успешно удалена' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;