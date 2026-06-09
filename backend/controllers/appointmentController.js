const { Appointment, Patient, Doctor, User } = require('../models');
const { Op } = require('sequelize');

class AppointmentController {
  async getAll(req, res) {
    try {
      const appointments = await Appointment.findAll({
        include: [
          { model: Patient, include: [{ model: User, attributes: ['full_name'] }] },
          { model: Doctor, include: [{ model: User, attributes: ['full_name'] }] }
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
      const { patient_id, doctor_id, appointment_date, appointment_time, notes } = req.body;

      const appointment = await Appointment.create({
        patient_id,
        doctor_id,
        appointment_date,
        appointment_time,
        status: 'pending',
        notes: notes || ''
      });

      res.status(201).json(appointment);
    } catch (error) {
      console.error('create error:', error);
      res.status(500).json({ error: 'Ошибка при создании записи' });
    }
  }

  async getMyAppointments(req, res) {
    try {
      const appointments = await Appointment.findAll({
        include: [
          { model: Patient, include: [{ model: User, attributes: ['full_name'] }] },
          { model: Doctor, include: [{ model: User, attributes: ['full_name'] }] }
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