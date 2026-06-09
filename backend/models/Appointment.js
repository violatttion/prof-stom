module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Appointment', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    patient_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    doctor_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    appointment_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    appointment_time: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'reschedule_requested'),
      defaultValue: 'pending'
    },
    reschedule_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    reschedule_time: {
      type: DataTypes.STRING,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'appointments',
    timestamps: true,
    underscored: true,           // ← ЭТО ГЛАВНОЕ
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
};