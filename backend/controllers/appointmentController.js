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

      if (req.user.role === 'patient' && !patient_id) {
        const patient = await Patient.findOne({ where: { user_id: req.user.id } });
        if (patient) patient_id = patient.id;
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

  // === ПЕРЕНОС ЗАПИСИ (админ / врач) ===
  async rescheduleAppointment(req, res) {
    try {
      const { id } = req.params;
      const { newDate, newTime } = req.body;

      if (!newDate || !newTime) {
        return res.status(400).json({ error: 'Новая дата и время обязательны' });
      }

      const appointment = await Appointment.findByPk(id);
      if (!appointment) return res.status(404).json({ error: 'Запись не найдена' });

      appointment.appointment_date = newDate;
      appointment.appointment_time = newTime;
      appointment.status = 'pending';
      appointment.reschedule_date = null;
      appointment.reschedule_time = null;

      await appointment.save();

      res.json({ message: 'Запись успешно перенесена', appointment });
    } catch (error) {
      console.error('rescheduleAppointment error:', error);
      res.status(500).json({ error: 'Ошибка при переносе записи' });
    }
  }

  // === ПАЦИЕНТ ЗАПРАШИВАЕТ ПЕРЕНОС ===
  async requestReschedule(req, res) {
    try {
      const { id } = req.params;
      const { new_date, new_time } = req.body;

      const appointment = await Appointment.findByPk(id);
      if (!appointment) return res.status(404).json({ error: 'Запись не найдена' });

      appointment.reschedule_date = new_date;
      appointment.reschedule_time = new_time;
      appointment.status = 'reschedule_requested';
      await appointment.save();

      res.json({ message: 'Запрос на перенос отправлен' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // === АДМИН ОДОБРЯЕТ ИЛИ ОТКЛОНЯЕТ ПЕРЕНОС ===
  async handleRescheduleRequest(req, res) {
    try {
      const { id } = req.params;
      const { action } = req.body; // 'approve' или 'reject'

      if (!['approve', 'reject'].includes(action)) {
        return res.status(400).json({ error: 'Неверное действие' });
      }

      const appointment = await Appointment.findByPk(id);
      if (!appointment) return res.status(404).json({ error: 'Запись не найдена' });

      if (action === 'approve') {
        if (!appointment.reschedule_date || !appointment.reschedule_time) {
          return res.status(400).json({ error: 'Нет данных для переноса' });
        }
        appointment.appointment_date = appointment.reschedule_date;
        appointment.appointment_time = appointment.reschedule_time;
        appointment.status = 'pending';
      } else {
        appointment.status = 'pending';
      }

      appointment.reschedule_date = null;
      appointment.reschedule_time = null;

      await appointment.save();

      res.json({ 
        message: action === 'approve' ? 'Перенос одобрен' : 'Перенос отклонён',
        appointment 
      });
    } catch (error) {
      console.error('handleRescheduleRequest error:', error);
      res.status(500).json({ error: 'Ошибка при обработке запроса на перенос' });
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