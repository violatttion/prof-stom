const { Appointment, Patient, Doctor, Service, User } = require('../models');

class AppointmentController {
  async getAll(req, res) {
    try {
      const appointments = await Appointment.findAll({
        include: [
          { model: Patient, include: [{ model: User, attributes: ['full_name'] }] },
          { model: Doctor, include: [{ model: User, attributes: ['full_name'] }] },
          { model: Service }
        ],
        order: [['appointment_date', 'DESC'], ['appointment_time', 'DESC']]
      });
      res.json(appointments);
    } catch (error) {
      console.error('getAll error:', error);
      res.status(500).json({ error: 'Не удалось загрузить записи' });
    }
  }

  async create(req, res) {
    try {
      let { patient_id, doctor_id, appointment_date, appointment_time, service_ids = [], notes } = req.body;

      // Получаем patient_id, если его нет в теле запроса
      if (req.user.role === 'patient' && !patient_id) {
        const patient = await Patient.findOne({ where: { user_id: req.user.id } });
        if (patient) {
          patient_id = patient.id;
        } else {
          return res.status(400).json({ error: 'Профиль пациента не найден. Обратитесь к администратору.' });
        }
      }

      if (!patient_id || !doctor_id || !appointment_date || !appointment_time) {
        return res.status(400).json({ error: 'Не все обязательные поля заполнены' });
      }

      const appointment = await Appointment.create({
        patient_id,
        doctor_id,
        appointment_date,
        appointment_time,
        status: req.user.role === 'patient' ? 'pending' : 'confirmed',
        notes: notes || ''
      });

      if (service_ids && service_ids.length > 0) {
        const services = await Service.findAll({ where: { id: service_ids } });
        await appointment.setServices(services);
      }

      res.status(201).json(appointment);
    } catch (error) {
      console.error('create error:', error);
      res.status(500).json({ error: 'Ошибка при создании записи' });
    }
  }

  async getMyAppointments(req, res) {
    try {
      let where = {};
      if (req.user.role === 'patient') {
        const patient = await Patient.findOne({ where: { user_id: req.user.id } });
        if (patient) where.patient_id = patient.id;
      } else if (req.user.role === 'doctor') {
        const doctor = await Doctor.findOne({ where: { user_id: req.user.id } });
        if (doctor) where.doctor_id = doctor.id;
      }

      const appointments = await Appointment.findAll({
        where,
        include: [
          { model: Patient, include: [{ model: User, attributes: ['full_name'] }] },
          { model: Doctor, include: [{ model: User, attributes: ['full_name'] }] },
          { model: Service }
        ],
        order: [['appointment_date', 'DESC'], ['appointment_time', 'DESC']]
      });

      res.json(appointments);
    } catch (error) {
      console.error('getMyAppointments error:', error);
      res.status(500).json({ error: 'Не удалось загрузить записи' });
    }
  }

  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const appointment = await Appointment.findByPk(id);
      if (!appointment) return res.status(404).json({ error: 'Запись не найдена' });

      appointment.status = status;
      await appointment.save();
      res.json(appointment);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async deleteAppointment(req, res) {
    try {
      const { id } = req.params;
      await Appointment.destroy({ where: { id } });
      res.json({ message: 'Приём удалён' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new AppointmentController();