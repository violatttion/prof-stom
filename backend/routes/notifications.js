const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', (req, res) => {
  res.json({ message: 'Уведомления' });
});

module.exports = router;
