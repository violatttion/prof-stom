module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Notification', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    appointment_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    recipient: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('email', 'sms', 'push'),
      defaultValue: 'email'
    },
    body: {
      type: DataTypes.TEXT
    },
    status: {
      type: DataTypes.ENUM('sent', 'failed', 'pending'),
      defaultValue: 'pending'
    },
    error_message: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'notifications',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });
};
