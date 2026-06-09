const { TeethFormula } = require('../models');

class TeethFormulaController {
  async getByAppointment(req, res) {
    try {
      const { appointmentId } = req.params;
      const teeth = await TeethFormula.findAll({
        where: { appointment_id: appointmentId },
        order: [['tooth_number', 'ASC']]
      });
      res.json(teeth);
    } catch (error) {
      console.error('teeth formula error:', error);
      res.status(500).json({ error: 'Не удалось загрузить зубную формулу' });
    }
  }

  async updateTooth(req, res) {
    try {
      const { appointmentId } = req.params;
      const { tooth_number, status, comment } = req.body;

      const [tooth, created] = await TeethFormula.findOrCreate({
        where: { appointment_id: appointmentId, tooth_number },
        defaults: { status, comment: comment || '' }
      });

      if (!created) {
        tooth.status = status;
        tooth.comment = comment || tooth.comment;
        await tooth.save();
      }

      res.json(tooth);
    } catch (error) {
      console.error('update tooth error:', error);
      res.status(500).json({ error: 'Ошибка при сохранении зуба' });
    }
  }
}

module.exports = new TeethFormulaController();