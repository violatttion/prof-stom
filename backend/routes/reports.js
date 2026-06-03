const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', (req, res) => {
  res.json({ message: 'Отчёты будут доступны в следующей версии' });
});

module.exports = router;
