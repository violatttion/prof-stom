module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Document', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    patient_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    file_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    file_path: {
      type: DataTypes.STRING,
      allowNull: true
    },
    uploaded_by: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    tableName: 'documents',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
};
