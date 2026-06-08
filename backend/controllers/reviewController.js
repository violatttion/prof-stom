const { Review, Patient, Doctor, User, Appointment } = require('../models');

class ReviewController {
  // Пациент оставляет отзыв
  async createReview(req, res) {
    try {
      const { appointment_id, rating, comment } = req.body;

      const appointment = await Appointment.findByPk(appointment_id);
      if (!appointment) return res.status(404).json({ error: 'Приём не найден' });

      if (appointment.status !== 'confirmed') {
        return res.status(400).json({ error: 'Отзыв можно оставить только после подтверждённого приёма' });
      }

      // Проверяем, что отзыв оставляет именно пациент этого приёма
      const patient = await Patient.findOne({ where: { user_id: req.user.id } });
      if (!patient || patient.id !== appointment.patient_id) {
        return res.status(403).json({ error: 'Нет прав на отзыв' });
      }

      // Проверяем, не оставлен ли уже отзыв
      const existing = await Review.findOne({ where: { appointment_id } });
      if (existing) {
        return res.status(400).json({ error: 'Отзыв на этот приём уже оставлен' });
      }

      const review = await Review.create({
        patient_id: appointment.patient_id,
        doctor_id: appointment.doctor_id,
        appointment_id,
        rating,
        comment
      });

      res.status(201).json(review);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Получить все отзывы врача
  async getDoctorReviews(req, res) {
    try {
      const { doctorId } = req.params;

      const reviews = await Review.findAll({
        where: { doctor_id: doctorId },
        include: [
          { model: Patient, include: [{ model: User, attributes: ['full_name'] }] }
        ],
        order: [['created_at', 'DESC']]
      });

      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new ReviewController();