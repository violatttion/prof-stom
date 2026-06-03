const { TeethFormula, Appointment } = require('../models');

class TeethFormulaController {
  async getByAppointment(req, res) {
    try {
      const { appointmentId } = req.params;
      const teeth = await TeethFormula.findAll({
        where: { appointment_id: appointmentId }
      });
      res.json(teeth);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateTooth(req, res) {
    try {
      const { appointmentId } = req.params;
      const { tooth_number, status, comment } = req.body;

      const [tooth, created] = await TeethFormula.findOrCreate({
        where: { appointment_id: appointmentId, tooth_number },
        defaults: { status, comment }
      });

      if (!created) {
        tooth.status = status;
        tooth.comment = comment;
        await tooth.save();
      }

      // Notify WebSocket
      const io = req.app.get('io');
      if (io) {
        io.to(`appointment_${appointmentId}`).emit('teeth_formula_updated', tooth);
      }

      res.json(tooth);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new TeethFormulaController();
