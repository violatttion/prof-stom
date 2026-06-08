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

      if (req.user.role === 'patient' && !patient_id) {
        const patient = await Patient.findOne({ where: { user_id: req.user.id } });
        if (patient) patient_id = patient.id;
      }

      if (!patient_id) {
        return res.status(400).json({ error: 'Не удалось определить пациента' });
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

  // Функция отправки email при подтверждении записи
  async sendConfirmationEmail(appointment) {
    try {
      const patient = await Patient.findByPk(appointment.patient_id, {
        include: [{ model: User }]
      });

      if (!patient || !patient.User?.email) {
        console.log('Email пациента не найден');
        return;
      }

      const doctor = await Doctor.findByPk(appointment.doctor_id, {
        include: [{ model: User }]
      });

      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      const mailOptions = {
        from: `"Проф Стом" <${process.env.EMAIL_USER}>`,
        to: patient.User.email,
        subject: 'Ваша запись подтверждена',
        html: `
          <h2>Здравствуйте, ${patient.User.full_name}!</h2>
          <p>Ваша запись в клинику <strong>Проф Стом</strong> была подтверждена.</p>
          
          <h3>Детали записи:</h3>
          <ul>
            <li><strong>Дата:</strong> ${appointment.appointment_date}</li>
            <li><strong>Время:</strong> ${appointment.appointment_time}</li>
            <li><strong>Врач:</strong> ${doctor?.User?.full_name || '—'}</li>
            <li><strong>Статус:</strong> Подтверждена</li>
          </ul>

          <p>Ждём вас в назначенное время!</p>
          <p>С уважением,<br>Команда Проф Стом</p>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log(`Письмо отправлено пациенту: ${patient.User.email}`);
    } catch (error) {
      console.error('Ошибка отправки email:', error);
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

      const previousStatus = appointment.status;
      appointment.status = status;
      if (cancellation_reason) appointment.cancellation_reason = cancellation_reason;
      await appointment.save();

      // Отправляем email, если статус изменился на confirmed
      if (status === 'confirmed' && previousStatus !== 'confirmed') {
        await sendConfirmationEmail(appointment);
      }

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

  // === НОВЫЙ МЕТОД: Перенос записи (Drag & Drop) ===
  async rescheduleAppointment(req, res) {
    try {
      const { id } = req.params;
      const { newDate, newTime } = req.body;

      const appointment = await Appointment.findByPk(id);
      if (!appointment) {
        return res.status(404).json({ error: 'Запись не найдена' });
      }

      // Проверка занятости слота
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
      console.error('Ошибка переноса записи:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new AppointmentController();