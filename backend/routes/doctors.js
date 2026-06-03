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
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
