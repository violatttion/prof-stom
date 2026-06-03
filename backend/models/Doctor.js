module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Doctor', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' }
    },
    specialization: {
      type: DataTypes.STRING,
      allowNull: false
    },
    work_hours_start: {
      type: DataTypes.STRING,
      defaultValue: '09:00'
    },
    work_hours_end: {
      type: DataTypes.STRING,
      defaultValue: '18:00'
    },
    appointment_duration: {
      type: DataTypes.INTEGER,
      defaultValue: 30 // minutes
    },
    cabinet: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'doctors',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
};
