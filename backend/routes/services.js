const express = require('express');
const router = express.Router();
const { Service } = require('../models');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const services = await Service.findAll({ order: [['category', 'ASC'], ['name', 'ASC']] });
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
