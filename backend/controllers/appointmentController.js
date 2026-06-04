const { Appointment, Patient, Doctor, Service, User } = require('../models');
const { Op } = require('sequelize');

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
          { model: Patient, include: [{ model: User, attributes: ['full_name', 'phone'] }] },
          { model: Doctor, include: [{ model: User, attributes: ['full_name'] }] },
          { model: Service }
        ],
        order: [['appointment_date', 'ASC'], ['appointment_time', 'ASC']]
      });

      res.json(appointments);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async create(req, res) {
    try {
      let { patient_id, doctor_id, appointment_date, appointment_time, service_ids = [], notes } = req.body;

      // Если пациент записывается сам — берём его patient_id автоматически
      if (req.user.role === 'patient' && !patient_id) {
        const patient = await Patient.findOne({ where: { user_id: req.user.id } });
        if (patient) patient_id = patient.id;
      }

      if (!patient_id) {
        return res.status(400).json({ error: 'Не удалось определить пациента' });
      }

      // Проверка конфликтов
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
        notes,
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
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  }

  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, cancellation_reason } = req.body;

      const appointment = await Appointment.findByPk(id);
      if (!appointment) {
        return res.status(404).json({ error: 'Запись не найдена' });
      }

      appointment.status = status;
      if (cancellation_reason) appointment.cancellation_reason = cancellation_reason;
      await appointment.save();

      const io = req.app.get('io');
      if (io) {
        io.to(`appointment_${id}`).emit('appointment_updated', appointment);
      }

      res.json(appointment);
    } catch (error) {
      res.status(500).json({ error: error.message });
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
          { model: Patient, include: [User] },
          { model: Doctor, include: [User] },
          Service
        ],
        order: [['appointment_date', 'DESC'], ['appointment_time', 'DESC']]
      });

      res.json(appointments);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new AppointmentController();