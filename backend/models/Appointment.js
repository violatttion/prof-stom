module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Appointment', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    patient_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'patients', key: 'id' }
    },
    doctor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'doctors', key: 'id' }
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
      type: DataTypes.ENUM('pending', 'confirmed', 'completed', 'cancelled', 'no_show'),
      defaultValue: 'pending'
    },
    source: {
      type: DataTypes.ENUM('admin', 'patient', 'doctor'),
      defaultValue: 'admin'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    cancellation_reason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    reminder_sent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    tableName: 'appointments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
};
