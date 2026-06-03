module.exports = (sequelize, DataTypes) => {
  return sequelize.define('AppointmentService', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    appointment_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    service_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    }
  }, {
    tableName: 'appointment_services',
    timestamps: false
  });
};
