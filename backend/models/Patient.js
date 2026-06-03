module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Patient', {
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
    date_of_birth: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true
    },
    medical_history: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    allergies: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'patients',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
};
