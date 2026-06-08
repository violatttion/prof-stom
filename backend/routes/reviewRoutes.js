const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Пациент оставляет отзыв
router.post('/', authenticateToken, authorizeRoles('patient'), reviewController.createReview);

// Получить отзывы врача (доступно всем)
router.get('/doctor/:doctorId', reviewController.getDoctorReviews);

module.exports = router;