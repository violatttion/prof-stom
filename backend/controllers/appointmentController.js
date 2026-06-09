const { Appointment, Patient, Doctor, Service, User } = require('../models');
const { Op } = require('sequelize');
const nodemailer = require('nodemailer');

class AppointmentController {
  async getAll(req, res) {
    try {
      const { startDate, endDate, doctorId, status, patientId } = req.query;
      const where = {};

      if (startDate && endDate) {
        where.appointment_date = { [Op.between]: [startDate, endDate] };
      }
      if (doctorId) where.doctor_id = doctorId;
      if (status) where.status = status;
      if (patientId) where.patient_id = patientId;

      if (req.user.role === 'doctor') {
        const doctor = await Doctor.findOne({ where: { user_id: req.user.id } });
        if (doctor) where.doctor_id = doctor.id;
      }
      if (req.user.role === 'patient') {
        const patient = await Patient.findOne({ where: { user_id: req.user.id } });
        if (patient) where.patient_id = patient.id;
      }

      const appointments = await Appointment.findAll({
        where,
        include: [
          { model: Patient, include: [{ model: User, attributes: ['full_name'] }] },
          { model: Doctor, include: [{ model: User, attributes: ['full_name'] }] },
          { model: Service }
        ],
        order: [['appointment_date', 'ASC'], ['appointment_time', 'ASC']]
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

      const existing = await Appointment.findOne({
        where: {
          doctor_id,
          appointment_date,
          appointment_time,
          status: { [Op.notIn]: ['cancelled', 'completed'] }
        }
      });

      if (existing) {
        return res.status(409).json({ error: 'Выбранное время уже занято' });
      }

      const appointment = await Appointment.create({
        patient_id,
        doctor_id,
        appointment_date,
        appointment_time,
        status: req.user.role === 'patient' ? 'pending' : 'confirmed',
        source: req.user.role,
        notes: notes || '',
        created_by: req.user.id
      });

      if (service_ids && service_ids.length > 0) {
        const services = await Service.findAll({ where: { id: service_ids } });
        await appointment.setServices(services);
      }

      const io = req.app.get('io');
      if (io) {
        io.to(`user_${patient_id}`).emit('appointment_created', appointment);
        io.to(`doctor_${doctor_id}`).emit('appointment_created', appointment);
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
      const { status, cancellation_reason } = req.body;

      const appointment = await Appointment.findByPk(id);
      if (!appointment) return res.status(404).json({ error: 'Запись не найдена' });

      appointment.status = status;
      if (cancellation_reason) appointment.cancellation_reason = cancellation_reason;
      await appointment.save();

      res.json(appointment);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async rescheduleAppointment(req, res) {
    try {
      const { id } = req.params;
      const { newDate, newTime } = req.body;

      const appointment = await Appointment.findByPk(id);
      if (!appointment) return res.status(404).json({ error: 'Запись не найдена' });

      const conflicting = await Appointment.findOne({
        where: {
          doctor_id: appointment.doctor_id,
          appointment_date: newDate,
          appointment_time: newTime,
          status: { [Op.notIn]: ['cancelled', 'completed'] },
          id: { [Op.ne]: id }
        }
      });

      if (conflicting) {
        return res.status(409).json({ error: 'Выбранное время уже занято' });
      }

      appointment.appointment_date = newDate;
      appointment.appointment_time = newTime;
      await appointment.save();

      const io = req.app.get('io');
      if (io) {
        io.to(`user_${appointment.patient_id}`).emit('appointment_rescheduled', appointment);
        io.to(`doctor_${appointment.doctor_id}`).emit('appointment_rescheduled', appointment);
      }

      res.json({ message: 'Запись успешно перенесена', appointment });
    } catch (error) {
      console.error('reschedule error:', error);
      res.status(500).json({ error: 'Ошибка при переносе записи' });
    }
  }

  async requestReschedule(req, res) {
    try {
      const { id } = req.params;
      const { new_date, new_time } = req.body;

      const appointment = await Appointment.findByPk(id);
      if (!appointment) return res.status(404).json({ error: 'Запись не найдена' });

      const patient = await Patient.findOne({ where: { user_id: req.user.id } });
      if (!patient || patient.id !== appointment.patient_id) {
        return res.status(403).json({ error: 'Нет прав на перенос этой записи' });
      }

      if (appointment.status === 'cancelled') {
        return res.status(400).json({ error: 'Нельзя перенести отменённую запись' });
      }

      appointment.reschedule_date = new_date;
      appointment.reschedule_time = new_time;
      appointment.status = 'reschedule_requested';

      await appointment.save();

      res.json({ message: 'Запрос на перенос отправлен администратору' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async handleRescheduleRequest(req, res) {
    try {
      const { id } = req.params;
      const { action } = req.body;

      const appointment = await Appointment.findByPk(id);
      if (!appointment) return res.status(404).json({ error: 'Запись не найдена' });

      if (appointment.status !== 'reschedule_requested') {
        return res.status(400).json({ error: 'Это не запрос на перенос' });
      }

      if (action === 'approve') {
        appointment.appointment_date = appointment.reschedule_date;
        appointment.appointment_time = appointment.reschedule_time;
        appointment.status = 'pending';
        appointment.reschedule_date = null;
        appointment.reschedule_time = null;
      } else if (action === 'reject') {
        appointment.status = 'pending';
        appointment.reschedule_date = null;
        appointment.reschedule_time = null;
      }

      await appointment.save();
      res.json({ message: `Запрос на перенос ${action === 'approve' ? 'одобрен' : 'отклонён'}` });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async deleteAppointment(req, res) {
    try {
      const { id } = req.params;
      const appointment = await Appointment.findByPk(id);
      if (!appointment) return res.status(404).json({ error: 'Приём не найден' });

      await appointment.destroy();
      res.json({ message: 'Приём удалён' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new AppointmentController();