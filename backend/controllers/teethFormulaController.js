const { TeethFormula, Appointment, Patient, Doctor } = require('../models');

class TeethFormulaController {
  // Получить зубную формулу по ID приёма
  async getByAppointment(req, res) {
    try {
      const { appointmentId } = req.params;

      const appointment = await Appointment.findByPk(appointmentId);
      if (!appointment) {
        return res.status(404).json({ error: 'Приём не найден' });
      }

      // Проверка прав (врач или пациент этого приёма)
      if (req.user.role === 'doctor') {
        const doctor = await Doctor.findOne({ where: { user_id: req.user.id } });
        if (!doctor || doctor.id !== appointment.doctor_id) {
          return res.status(403).json({ error: 'Нет доступа к этой зубной формуле' });
        }
      } else if (req.user.role === 'patient') {
        const patient = await Patient.findOne({ where: { user_id: req.user.id } });
        if (!patient || patient.id !== appointment.patient_id) {
          return res.status(403).json({ error: 'Нет доступа к этой зубной формуле' });
        }
      }

      const teeth = await TeethFormula.findAll({
        where: { appointment_id: appointmentId },
        order: [['tooth_number', 'ASC']]
      });

      res.json(teeth);
    } catch (error) {
      console.error('Ошибка получения зубной формулы:', error);
      res.status(500).json({ error: 'Не удалось загрузить зубную формулу' });
    }
  }

  // Обновить/создать статус одного зуба
  async updateTooth(req, res) {
    try {
      const { appointmentId } = req.params;
      const { tooth_number, status, comment } = req.body;

      if (!tooth_number || !status) {
        return res.status(400).json({ error: 'Номер зуба и статус обязательны' });
      }

      const appointment = await Appointment.findByPk(appointmentId);
      if (!appointment) {
        return res.status(404).json({ error: 'Приём не найден' });
      }

      // Только врач может редактировать зубную формулу
      if (req.user.role === 'doctor') {
        const doctor = await Doctor.findOne({ where: { user_id: req.user.id } });
        if (!doctor || doctor.id !== appointment.doctor_id) {
          return res.status(403).json({ error: 'Только лечащий врач может редактировать зубную формулу' });
        }
      } else {
        return res.status(403).json({ error: 'Нет прав на редактирование зубной формулы' });
      }

      const [tooth, created] = await TeethFormula.findOrCreate({
        where: { appointment_id: appointmentId, tooth_number },
        defaults: { status, comment: comment || '' }
      });

      if (!created) {
        tooth.status = status;
        tooth.comment = comment || tooth.comment;
        await tooth.save();
      }

      // Уведомление через WebSocket (реал-тайм обновление)
      const io = req.app.get('io');
      if (io) {
        io.to(`appointment_${appointmentId}`).emit('teeth_formula_updated', tooth);
      }

      res.json(tooth);
    } catch (error) {
      console.error('Ошибка обновления зуба:', error);
      res.status(500).json({ error: 'Ошибка при сохранении данных зуба' });
    }
  }
}

module.exports = new TeethFormulaController();